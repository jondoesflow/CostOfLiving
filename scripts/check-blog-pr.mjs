// Checks a blog pull request before it can merge on its own (see
// .github/workflows/blog-checks.yml). It only passes a PR that changes nothing
// but blog posts and the topic list, and whose new or changed posts follow the
// house rules in content/blog/README.md that a script can check.
//
//   node scripts/check-blog-pr.mjs [base-ref]    (default origin/main)
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { marked } from "marked";

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
  const real = (d) => { const x = new Date(`${d}T00:00:00Z`); return !Number.isNaN(x.getTime()) && x.toISOString().slice(0, 10) === d; };
  if (!real(fileDate)) problems.push(`${f}: ${fileDate} isn't a real date`);
  const isNew = execSync(`git cat-file -e ${base}:${f} 2>/dev/null && echo old || echo new`, { encoding: "utf8", shell: "/bin/bash" }).trim() === "new";
  if (isNew && meta.date && meta.date < today) problems.push(`${f}: a new post can't be dated before today (${today})`);
  if (meta.draft === "true") problems.push(`${f}: still marked draft`);
  if (/[–—]/.test(text)) problems.push(`${f}: contains an em or en dash`);
  const words = m[2].split(/\s+/).filter(Boolean).length;
  if (words < 800 || words > 1500) problems.push(`${f}: ${words} words (house rule is 800 to 1,500; outside that, Jon decides)`);
  if (meta.description && (meta.description.length < 100 || meta.description.length > 180)) problems.push(`${f}: description is ${meta.description.length} characters (aim for 140 to 160)`);
  // No post sets its own slug, and build-site.mjs reads front matter its own
  // way, so any slug override waits for Jon rather than being second-guessed.
  if (/^slug\s*:/m.test(m[1])) problems.push(`${f}: sets its own slug; the file name is the slug, anything else needs Jon`);
  const slug = slugOf(f, text);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) problems.push(`${f}: slug "${slug}" must be lowercase letters, numbers and hyphens only`);
  // Posts are Markdown only. Read them with the same parser the site uses
  // (marked, in build-site.mjs), so every link and any raw HTML is judged as it
  // will actually render: HTML would go straight into the page, and a link must
  // be https, http, mailto, a site path or an anchor.
  const unsafe = [];
  marked.walkTokens(marked.lexer(m[2]), (t) => {
    if (t.type === "html") unsafe.push(`raw HTML (${t.raw.trim().slice(0, 40)})`);
    if ((t.type === "link" || t.type === "image") && !/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test((t.href ?? "").trim())) unsafe.push(`a link to "${(t.href ?? "").slice(0, 40)}"`);
  });
  for (const u of unsafe) problems.push(`${f}: contains ${u}; posts must be plain Markdown with ordinary links`);
  if ((existingSlugs.get(slug) ?? []).length > 1) problems.push(`${f}: slug "${slug}" is already used`);
}

if (problems.length) {
  console.error(`Blog checks failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`Blog checks passed: ${posts.length} post(s), ${changed.length} file(s) changed.`);
