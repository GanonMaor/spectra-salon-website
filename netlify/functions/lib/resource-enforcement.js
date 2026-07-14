/**
 * netlify/functions/lib/resource-enforcement.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure helpers for server-side resource capacity/exclusivity enforcement
 * (Phase C).
 *
 * A resource (chair, wash station, room, …) has a capacity and an exclusivity
 * flag. An appointment segment "holds" a resource for its [start, end) window
 * when it references that resource id and its segment type is a holding type.
 * By default every segment type holds except `wait` (processing time is not a
 * physical hold) — a resource may override this via holdingSegmentTypes.
 *
 * Enforcement rejects a booking when, for any instant, the number of segments
 * concurrently holding a resource would exceed its effective capacity. This is
 * intentionally deterministic and DB-free so it can be unit tested; the API
 * layer supplies the persisted resource config and the existing segments.
 */
"use strict";

// Segment types that do NOT hold a resource by default. Processing/waiting time
// frees the chair/room for other clients.
const DEFAULT_NON_HOLDING_SEGMENT_TYPES = ["wait"];

/** Effective simultaneous capacity: exclusive resources are always 1. */
function effectiveCapacity(resource) {
  if (!resource) return Infinity;
  if (resource.isExclusive) return 1;
  const capacity = Number(resource.capacity);
  return Number.isFinite(capacity) && capacity >= 1 ? Math.floor(capacity) : 1;
}

/**
 * Whether a segment holds the given resource.
 * `resource` may be null when the resource id is unknown/unpersisted — in that
 * case the segment does not hold a persisted resource and is ignored by
 * enforcement (backwards compatible with legacy free-text resource ids).
 */
function segmentHoldsResource(segment, resource) {
  if (!segment || !segment.resourceId) return false;
  if (!resource) return false;
  if (segment.resourceId !== resource.id) return false;
  const overrides = Array.isArray(resource.holdingSegmentTypes) ? resource.holdingSegmentTypes : [];
  const segmentType = segment.segmentType || "service";
  if (overrides.length > 0) {
    return overrides.includes(segmentType);
  }
  return !DEFAULT_NON_HOLDING_SEGMENT_TYPES.includes(segmentType);
}

function toMillis(value) {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/** Half-open interval overlap: [aStart, aEnd) vs [bStart, bEnd). */
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Maximum number of intervals overlapping at any single instant.
 * Uses a sweep over start (+1) / end (-1) events; ties resolve ends before
 * starts so touching intervals ([0,10) and [10,20)) do not count as overlap.
 */
function maxConcurrency(intervals) {
  const events = [];
  for (const iv of intervals) {
    if (!Number.isFinite(iv.start) || !Number.isFinite(iv.end) || iv.end <= iv.start) continue;
    events.push({ t: iv.start, delta: 1 });
    events.push({ t: iv.end, delta: -1 });
  }
  events.sort((a, b) => (a.t - b.t) || (a.delta - b.delta));
  let current = 0;
  let peak = 0;
  for (const e of events) {
    current += e.delta;
    if (current > peak) peak = current;
  }
  return peak;
}

/**
 * Find capacity/exclusivity conflicts introduced by candidate segments.
 *
 * @param {object} params
 * @param {object} params.resource persisted resource config { id, capacity, isExclusive, holdingSegmentTypes }
 * @param {Array} params.existingSegments segments from OTHER appointments already booked
 * @param {Array} params.candidateSegments segments being created/updated
 * @returns {Array<{ resourceId, capacity, windowStart, windowEnd }>} conflicts (empty when ok)
 */
function findResourceConflicts({ resource, existingSegments = [], candidateSegments = [] }) {
  if (!resource) return [];
  const capacity = effectiveCapacity(resource);
  if (!Number.isFinite(capacity)) return [];

  const holdingCandidates = candidateSegments
    .filter((s) => segmentHoldsResource(s, resource))
    .map((s) => ({ start: toMillis(s.startTime), end: toMillis(s.endTime) }))
    .filter((iv) => Number.isFinite(iv.start) && Number.isFinite(iv.end) && iv.end > iv.start);

  if (holdingCandidates.length === 0) return [];

  const holdingExisting = existingSegments
    .filter((s) => segmentHoldsResource(s, resource))
    .map((s) => ({ start: toMillis(s.startTime), end: toMillis(s.endTime) }))
    .filter((iv) => Number.isFinite(iv.start) && Number.isFinite(iv.end) && iv.end > iv.start);

  const all = holdingExisting.concat(holdingCandidates);
  const peak = maxConcurrency(all);
  if (peak <= capacity) return [];

  // Report the overlapping window around the first candidate that collides.
  const conflicts = [];
  for (const cand of holdingCandidates) {
    const overlapping = all.filter((iv) => intervalsOverlap(cand.start, cand.end, iv.start, iv.end));
    if (overlapping.length > capacity) {
      const windowStart = Math.max(...overlapping.map((iv) => iv.start));
      const windowEnd = Math.min(...overlapping.map((iv) => iv.end));
      conflicts.push({
        resourceId: resource.id,
        capacity,
        windowStart: new Date(windowStart).toISOString(),
        windowEnd: new Date(windowEnd).toISOString(),
      });
    }
  }
  return conflicts;
}

module.exports = {
  DEFAULT_NON_HOLDING_SEGMENT_TYPES,
  effectiveCapacity,
  segmentHoldsResource,
  intervalsOverlap,
  maxConcurrency,
  findResourceConflicts,
};
