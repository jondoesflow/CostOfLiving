// Writes a job file for the voice clone's batch_tts.py (see the voice-clone
// skill). Run on the machine that has the clone, passing this project's
// public/vo folder as it exists on that machine:
//   npm run vo-job -- "C:\path\to\cheapwatts-movie\public\vo"
// Then, from the clonemyvoice folder:
//   .venv\Scripts\python.exe scripts\batch_tts.py --job <path to vo-job.json>
import { readFileSync, writeFileSync } from "node:fs";

const outDir = (process.argv[2] ?? "").replace(/[\\/]+$/, "");
if (!outDir) {
  console.error('Usage: npm run vo-job -- "C:\\path\\to\\cheapwatts-movie\\public\\vo"');
  process.exit(1);
}
const sep = outDir.includes("\\") ? "\\" : "/";
const { lines } = JSON.parse(readFileSync(new URL("../narration.json", import.meta.url), "utf8"));
const job = {
  // Measured narration settings from the voice-clone skill, with a fixed seed
  // so re-rendering one line keeps the same delivery.
  exaggeration: 0.45,
  cfg: 0.42,
  temperature: 0.8,
  seed: 1234,
  lines: lines.map((l) => ({ id: l.id, text: l.text, out: `${outDir}${sep}${l.id}.wav` })),
};
writeFileSync(new URL("../vo-job.json", import.meta.url), JSON.stringify(job, null, 2));
console.log(`Wrote vo-job.json with ${job.lines.length} lines, saving audio to ${outDir}`);
