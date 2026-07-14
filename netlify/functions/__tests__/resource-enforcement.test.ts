/**
 * Unit tests for the pure resource enforcement helpers (Phase C).
 * DB-free; run under the default `npm test`.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  effectiveCapacity,
  segmentHoldsResource,
  intervalsOverlap,
  maxConcurrency,
  findResourceConflicts,
} = require("../lib/resource-enforcement");

const seg = (resourceId: string, segmentType: string, start: string, end: string) => ({
  resourceId,
  segmentType,
  startTime: start,
  endTime: end,
});

describe("effectiveCapacity", () => {
  it("treats exclusive resources as capacity 1", () => {
    expect(effectiveCapacity({ isExclusive: true, capacity: 5 })).toBe(1);
  });
  it("uses capacity for non-exclusive resources, floored at 1", () => {
    expect(effectiveCapacity({ isExclusive: false, capacity: 3 })).toBe(3);
    expect(effectiveCapacity({ isExclusive: false, capacity: 0 })).toBe(1);
    expect(effectiveCapacity({ isExclusive: false, capacity: undefined })).toBe(1);
  });
});

describe("segmentHoldsResource", () => {
  const resource = { id: "res-1", isExclusive: true, capacity: 1, holdingSegmentTypes: [] };

  it("holds for normal segment types referencing the resource", () => {
    expect(segmentHoldsResource(seg("res-1", "apply", "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"), resource)).toBe(true);
    expect(segmentHoldsResource(seg("res-1", "wash", "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"), resource)).toBe(true);
  });

  it("does not hold during wait (processing) by default", () => {
    expect(segmentHoldsResource(seg("res-1", "wait", "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"), resource)).toBe(false);
  });

  it("ignores segments that reference a different or unpersisted resource", () => {
    expect(segmentHoldsResource(seg("res-2", "apply", "2026-01-01T10:00:00Z", "2026-01-01T10:30:00Z"), resource)).toBe(false);
    expect(segmentHoldsResource(seg("res-1", "apply", "a", "b"), null)).toBe(false);
    expect(segmentHoldsResource({ segmentType: "apply" }, resource)).toBe(false);
  });

  it("respects an explicit holdingSegmentTypes override", () => {
    const overridden = { id: "res-1", isExclusive: true, holdingSegmentTypes: ["wait"] };
    expect(segmentHoldsResource(seg("res-1", "wait", "a", "b"), overridden)).toBe(true);
    expect(segmentHoldsResource(seg("res-1", "apply", "a", "b"), overridden)).toBe(false);
  });
});

describe("intervalsOverlap & maxConcurrency", () => {
  it("treats touching intervals as non-overlapping", () => {
    expect(intervalsOverlap(0, 10, 10, 20)).toBe(false);
    expect(intervalsOverlap(0, 11, 10, 20)).toBe(true);
  });

  it("computes peak concurrency", () => {
    expect(maxConcurrency([
      { start: 0, end: 10 },
      { start: 5, end: 15 },
      { start: 12, end: 20 },
    ])).toBe(2);
    expect(maxConcurrency([
      { start: 0, end: 10 },
      { start: 10, end: 20 },
    ])).toBe(1);
  });
});

describe("findResourceConflicts", () => {
  const exclusive = { id: "res-1", isExclusive: true, capacity: 1, holdingSegmentTypes: [] };

  it("returns no conflict when candidate does not overlap existing", () => {
    const conflicts = findResourceConflicts({
      resource: exclusive,
      existingSegments: [seg("res-1", "apply", "2026-01-01T09:00:00Z", "2026-01-01T10:00:00Z")],
      candidateSegments: [seg("res-1", "apply", "2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z")],
    });
    expect(conflicts).toEqual([]);
  });

  it("flags an exclusive resource double-booking", () => {
    const conflicts = findResourceConflicts({
      resource: exclusive,
      existingSegments: [seg("res-1", "apply", "2026-01-01T09:30:00Z", "2026-01-01T10:30:00Z")],
      candidateSegments: [seg("res-1", "apply", "2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z")],
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].resourceId).toBe("res-1");
    expect(conflicts[0].capacity).toBe(1);
  });

  it("does not conflict during the existing appointment's wait window", () => {
    const conflicts = findResourceConflicts({
      resource: exclusive,
      // existing: apply 9:00-9:15, wait 9:15-9:50 (frees the chair), wash 9:50-10:05
      existingSegments: [
        seg("res-1", "apply", "2026-01-01T09:00:00Z", "2026-01-01T09:15:00Z"),
        seg("res-1", "wait", "2026-01-01T09:15:00Z", "2026-01-01T09:50:00Z"),
      ],
      // candidate apply during the wait window: allowed
      candidateSegments: [seg("res-1", "apply", "2026-01-01T09:20:00Z", "2026-01-01T09:45:00Z")],
    });
    expect(conflicts).toEqual([]);
  });

  it("allows concurrency up to capacity for shared resources", () => {
    const shared = { id: "res-1", isExclusive: false, capacity: 2, holdingSegmentTypes: [] };
    const within = findResourceConflicts({
      resource: shared,
      existingSegments: [seg("res-1", "apply", "2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z")],
      candidateSegments: [seg("res-1", "apply", "2026-01-01T10:30:00Z", "2026-01-01T11:30:00Z")],
    });
    expect(within).toEqual([]);

    const over = findResourceConflicts({
      resource: shared,
      existingSegments: [
        seg("res-1", "apply", "2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z"),
        seg("res-1", "apply", "2026-01-01T10:15:00Z", "2026-01-01T11:15:00Z"),
      ],
      candidateSegments: [seg("res-1", "apply", "2026-01-01T10:30:00Z", "2026-01-01T11:30:00Z")],
    });
    expect(over).toHaveLength(1);
    expect(over[0].capacity).toBe(2);
  });

  it("ignores unpersisted resources (null config)", () => {
    expect(findResourceConflicts({ resource: null, existingSegments: [], candidateSegments: [seg("x", "apply", "a", "b")] })).toEqual([]);
  });
});
