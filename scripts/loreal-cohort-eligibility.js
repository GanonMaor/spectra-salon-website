/**
 * loreal-cohort-eligibility.js
 *
 * Determines which Israel-based salons qualify for a Jan→Jan cohort
 * using a strict consecutive-months rule: the user must have a run of
 * consecutive active months (services > 0) that covers at least 90%
 * of the months in the range.
 */

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function generateMonthSequence(startLabel, endLabel) {
  const [sm, sy] = startLabel.split(" ");
  const [em, ey] = endLabel.split(" ");
  let mi = MONTH_NAMES.indexOf(sm), yi = parseInt(sy, 10);
  const me = MONTH_NAMES.indexOf(em), ye = parseInt(ey, 10);
  const seq = [];
  while (yi < ye || (yi === ye && mi <= me)) {
    seq.push(`${MONTH_NAMES[mi]} ${yi}`);
    mi++;
    if (mi >= 12) { mi = 0; yi++; }
  }
  return seq;
}

/**
 * @param {Array<{uid:string, mk:string, svc:number}>} israelRows
 * @param {string} startMonth  e.g. "Jan 2023"
 * @param {string} endMonth    e.g. "Jan 2024"
 * @returns {{ eligible: string[], details: Map<string, {active:number, maxConsec:number, total:number, pass:boolean}> }}
 */
function computeEligibility(israelRows, startMonth, endMonth) {
  const seq = generateMonthSequence(startMonth, endMonth);
  const totalMonths = seq.length;
  const threshold = Math.ceil(0.9 * totalMonths);
  const seqSet = new Set(seq);

  const userSvcByMonth = new Map();
  for (const r of israelRows) {
    if (!seqSet.has(r.mk)) continue;
    if (!userSvcByMonth.has(r.uid)) userSvcByMonth.set(r.uid, new Map());
    const um = userSvcByMonth.get(r.uid);
    um.set(r.mk, (um.get(r.mk) || 0) + r.svc);
  }

  const eligible = [];
  const details = new Map();

  for (const [uid, monthMap] of userSvcByMonth) {
    let activeCount = 0;
    let maxConsec = 0;
    let curConsec = 0;

    for (const m of seq) {
      const svc = monthMap.get(m) || 0;
      if (svc > 0) {
        activeCount++;
        curConsec++;
        if (curConsec > maxConsec) maxConsec = curConsec;
      } else {
        curConsec = 0;
      }
    }

    const pass = maxConsec >= threshold;
    details.set(uid, { active: activeCount, maxConsec, total: totalMonths, pass });
    if (pass) eligible.push(uid);
  }

  eligible.sort();
  return { eligible, details, threshold, totalMonths };
}

module.exports = { computeEligibility, generateMonthSequence };
