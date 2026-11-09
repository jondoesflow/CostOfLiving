// Checks a blog pull request before it can merge on its own (see
// .github/workflows/blog-checks.yml). It only passes a PR that changes nothing
// but blog posts and the topic list, and whose new or changed posts follow the
// house rules in content/blog/README.md that a script can check.
//
//   node scripts/check-blog-pr.mjs [base-ref]    (default origin/main)
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";

const base = process.argv[2] || "origin/main";
const changed = execSync(`git diff --name-only ${base}...HEAD`, { encoding: "utf8" }).split("\n").filter(Boolean);
const problems = [];

const allowed = (f) => /^content\/blog\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(f) || f === "content/blog/TOPICS.md";
for (const f of changed) if (!allowed(f)) problems.push(`${f}: only blog posts and TOPICS.md can merge without Jon; anything else needs his approval`);

const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const posts = changed.filter((f) => /^content\/blog\/\d{4}-.*\.md$/.test(f) && existsSync(f));
if (changed.some((f) => /^content\/blog\/\d{4}-.*\.md$/.test(f) && !existsSync(f))) problems.push("a post is deleted: that needs Jon's approval");

// The slug the site builds a post at: front matter `slug` if set, otherwise
// the file name without its date (as in build-site.mjs).
const slugOf = (file, text) => {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const own = fm && fm[1].match(/^slug:\s*["']?([^"'\r\n]+)["']?\s*$/m);
  return own ? own[1].trim() : file.replace(/^.*\//, "").replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
};
const existingSlugs = new Map();
for (const f of readdirSync("content/blog").filter((x) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(x))) {
  const slug = slugOf(f, readFileSync(`content/blog/${f}`, "utf8"));
  existingSlugs.set(slug, [...(existingSlugs.get(slug) ?? []), f]);
}

for (const f of posts) {
  const text = readFileSync(f, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) { problems.push(`${f}: missing front matter`); continue; }
  const meta = Object.fromEntries(m[1].split(/\r?\n/).map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map((kv) => [kv[1], kv[2].trim()]));
  const fileDate = f.match(/(\d{4}-\d{2}-\d{2})/)[1];
  for (const key of ["title", "description", "date", "keywords", "tool"]) if (!meta[key]) problems.push(`${f}: missing ${key}`);
  if (meta.date && meta.date !== fileDate) problems.push(`${f}: date ${meta.date} doesn't match the file name`);
  const isNew = execSync(`git cat-file -e ${base}:${f} 2>/dev/null && echo old || echo new`, { encoding: "utf8", shell: "/bin/bash" }).trim() === "new";
  if (isNew && meta.date && meta.date < today) problems.push(`${f}: a new post can't be dated before today (${today})`);
  if (meta.draft === "true") problems.push(`${f}: still marked draft`);
  if (/[–—]/.test(text)) problems.push(`${f}: contains an em or en dash`);
  const words = m[2].split(/\s+/).filter(Boolean).length;
  if (words < 800 || words > 1500) problems.push(`${f}: ${words} words (house rule is 800 to 1,500; outside that, Jon decides)`);
  if (meta.description && (meta.description.length < 100 || meta.description.length > 180)) problems.push(`${f}: description is ${meta.description.length} characters (aim for 140 to 160)`);
  const slug = slugOf(f, text);
  if ((existingSlugs.get(slug) ?? []).length > 1) problems.push(`${f}: slug "${slug}" is already used`);
}

if (problems.length) {
  console.error(`Blog checks failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`Blog checks passed: ${posts.length} post(s), ${changed.length} file(s) changed.`);
