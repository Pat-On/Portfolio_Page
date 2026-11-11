// Diffs two profiling runs made by webgl-profile.mjs (and, optionally, scene-graph.mjs).
// Usage: node scripts/perf/compare.mjs <baselineDir> <candidateDir>
// Each dir holds desktop/stats.json, mobile/stats.json and optionally scene-graph.json.
import { readFile } from "node:fs/promises";

const [, , BASE, CAND] = process.argv;
if (!BASE || !CAND) {
  console.error("usage: node scripts/perf/compare.mjs <baselineDir> <candidateDir>");
  process.exit(2);
}

const load = async (p) => {
  try {
    return JSON.parse(await readFile(p, "utf8"));
  } catch {
    return null;
  }
};
const delta = (a, b) => {
  if (a == null || b == null) return `${a ?? "—"} → ${b ?? "—"}`;
  const pct = a ? ` (${b >= a ? "+" : ""}${Math.round(((b - a) / a) * 100)}%)` : "";
  return `${a} → ${b}${pct}`;
};

for (const vp of ["desktop", "mobile"]) {
  const a = await load(`${BASE}/${vp}/stats.json`);
  const b = await load(`${CAND}/${vp}/stats.json`);
  if (!a || !b) continue;
  console.log(`\n## ${vp}`);
  console.log(`ready ms        ${delta(a.readyMs, b.readyMs)}`);
  console.log(`texture uploads ${delta(a.totals.texUploads, b.totals.texUploads)}`);
  console.log(`texture MB      ${delta(a.totals.texMB, b.totals.texMB)}`);
  console.log(`texStorage2D    ${delta(a.totals.storageCalls, b.totals.storageCalls)} calls, ${delta(a.totals.storageMB, b.totals.storageMB)} MB (GPU allocations incl. mips)`);
  console.log(`programs        ${delta(a.totals.programs, b.totals.programs)}`);
  console.log(`network MB      ${delta(a.net.totalMB, b.net.totalMB)}`);
  console.log("scroll  draws/frame            tris/frame");
  for (const row of a.rows) {
    const other = b.rows.find((r) => r.stop === row.stop);
    console.log(
      `${String(Math.round(row.stop * 100)).padStart(4)}%  ${delta(row.drawsPerFrame, other?.drawsPerFrame).padEnd(24)} ${delta(row.trisPerFrame, other?.trisPerFrame)}`
    );
  }
  const errs = b.errors.filter((e) => !a.errors.includes(e));
  if (errs.length) console.log("NEW console errors/warnings:\n  " + errs.join("\n  "));
}

const ga = await load(`${BASE}/scene-graph.json`);
const gb = await load(`${CAND}/scene-graph.json`);
if (ga && gb) {
  console.log("\n## scene graph (desktop, page top)");
  console.log(`renderables     ${delta(ga.renderables, gb.renderables)}`);
  console.log(`materials       ${delta(ga.materials, gb.materials)}`);
  console.log(`texture MB est. ${delta(ga.texMBestimate, gb.texMBestimate)}`);
  console.log(`programs        ${delta(ga.programs, gb.programs)}`);
  const names = new Set([...ga.perObject, ...gb.perObject].map((o) => o.name));
  for (const n of names) {
    const x = ga.perObject.find((o) => o.name === n);
    const y = gb.perObject.find((o) => o.name === n);
    if ((x?.n ?? 0) !== (y?.n ?? 0)) console.log(`  ${n.padEnd(22)} ${delta(x?.n, y?.n)}`);
  }
}
