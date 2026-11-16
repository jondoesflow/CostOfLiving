// Merges blog post pull requests without Jon (his request, 9 November 2026),
// but only once they've had time to be reviewed and every check is green.
// Run hourly by .github/workflows/blog-auto-merge.yml with GITHUB_TOKEN.
//
// A blog PR merges when all of these hold:
//   - its branch starts with blog/, it's from this repository and not a draft
//   - it has no "hold" label (add one to stop a post)
//   - it was opened at least 2 hours ago and its last commit is at least
//     1 hour old
//   - every check on its latest commit passed, including "blog-checks"
//   - Claude's own review of that latest commit passed: a comment from the
//     repository owner's account (the account Claude's sessions post as)
//     carrying <!-- claude-review:v1 sha=<commit> result=pass -->. Jon turned
//     Codex reviews off on 16 November 2026 and asked Claude to review instead
//   - no review thread is waiting on an answer: an unresolved thread whose
//     last comment is from a bot blocks it
//   - GitHub says it merges cleanly
//   - it only adds or changes blog posts and content/blog/TOPICS.md, checked
//     here from GitHub's own file list, so a PR can't get code through by
//     editing the checks it runs
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/blog-auto-merge.mjs [--dry-run]
import { fileURLToPath } from "node:url";

export const OPEN_FOR_MS = 2 * 3600e3;
export const QUIET_FOR_MS = 1 * 3600e3;
export const REQUIRED_CHECK = "blog-checks";

const ALLOWED = (name) => /^content\/blog\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(name) || name === "content/blog/TOPICS.md";

// Files a blog PR may not change on its own: anything outside the posts and
// the topic list, and any deleted or renamed file (a renamed post moves its
// URL and breaks links to it).
export function fileProblems(files) {
  return files
    .filter((f) => !ALLOWED(f.filename) || f.status === "removed" || f.status === "renamed")
    .map((f) => `${f.filename} (${f.status})`);
}

// Claude posts its review as a comment from the owner's account, ending with
// <!-- claude-review:v1 sha=<commit> result=pass|changes -->. Only that account
// is trusted, so nobody else can paste a passing marker in. The newest marker
// wins, so a later "changes" review cancels an earlier pass.
export function claudeReviewedAt(comments, owner) {
  for (const c of [...comments].reverse()) {
    if (c.author?.__typename !== "User" || (c.author.login ?? "").toLowerCase() !== owner.toLowerCase()) continue;
    const m = (c.body ?? "").match(/<!-- claude-review:v1 sha=([0-9a-f]{7,40}) result=(pass|changes) -->/);
    if (!m) continue;
    return m[2] === "pass" ? m[1] : null;
  }
  return null;
}

// A thread waits on an answer when a bot had the last word.
export function awaitsAnswer(last) {
  return last?.author?.__typename === "Bot";
}

// Why a pull request can't merge yet; an empty list means it can.
export function reasonsToWait(pr, now = Date.now(), files = null, owner = "jondoesflow") {
  const why = [];
  if (files === null) why.push("changed files not checked");
  else if (files.length === 0 || files.length >= 100) why.push(`${files.length} files changed`);
  else { const bad = fileProblems(files); if (bad.length) why.push(`changes files only Jon can approve: ${bad.join(", ")}`); }
  const commit = pr.commits.nodes[0]?.commit;
  const lastPush = Date.parse(commit?.committedDate || 0);
  if (!pr.headRefName.startsWith("blog/")) why.push("not a blog branch");
  if (pr.isCrossRepository) why.push("from a fork");
  if (pr.isDraft) why.push("draft");
  if (pr.labels.nodes.some((l) => l.name.toLowerCase() === "hold")) why.push('labelled "hold"');
  if (now - Date.parse(pr.createdAt) < OPEN_FOR_MS) why.push("opened less than 2 hours ago");
  if (now - lastPush < QUIET_FOR_MS) why.push("last commit less than an hour old");
  const rollup = commit?.statusCheckRollup;
  if (rollup?.state !== "SUCCESS") why.push(`checks are ${rollup?.state ?? "missing"}`);
  const checks = rollup?.contexts.nodes ?? [];
  if (!checks.some((c) => c.name === REQUIRED_CHECK && c.conclusion === "SUCCESS")) why.push(`"${REQUIRED_CHECK}" hasn't passed`);
  const reviewed = claudeReviewedAt(pr.comments?.nodes ?? [], owner);
  if (!reviewed || !commit?.oid?.startsWith(reviewed)) why.push("Claude's review of the latest commit hasn't passed");
  const waiting = pr.reviewThreads.nodes.filter((t) => !t.isResolved && awaitsAnswer(t.comments.nodes[0]));
  if (waiting.length) why.push(`${waiting.length} review comment(s) not answered`);
  if (pr.mergeable !== "MERGEABLE") why.push(`mergeable state is ${pr.mergeable}`);
  return why;
}

async function main() {
const token = process.env.GITHUB_TOKEN;
const [owner, repo] = (process.env.GITHUB_REPOSITORY || "jondoesflow/CostOfLiving").split("/");
const dryRun = process.argv.includes("--dry-run");
if (!token) { console.error("Set GITHUB_TOKEN"); process.exit(1); }
async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...init.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path}: ${res.status} ${JSON.stringify(body)}`);
  return body;
}

const query = `query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    pullRequests(states: OPEN, first: 50, baseRefName: "main") {
      nodes {
        number title headRefName isDraft isCrossRepository createdAt mergeable
        labels(first: 20) { nodes { name } }
        commits(last: 1) { nodes { commit { oid committedDate
          statusCheckRollup { state contexts(first: 50) { nodes {
            __typename
            ... on CheckRun { name conclusion status }
            ... on StatusContext { context state }
          } } }
        } } }
        comments(last: 50) { nodes { body author { __typename login } } }
        reviewThreads(first: 100) { nodes { isResolved comments(last: 1) { nodes { body author { __typename login } } } } }
      }
    }
  }
}`;

const data = (await gh("/graphql", { method: "POST", body: JSON.stringify({ query, variables: { owner, repo } }) })).data;
const now = Date.now();
let merged = 0;

for (const pr of data.repository.pullRequests.nodes) {
  if (!pr.headRefName.startsWith("blog/")) continue;
  const files = await gh(`/repos/${owner}/${repo}/pulls/${pr.number}/files?per_page=100`);
  const why = reasonsToWait(pr, now, files, owner);
  const commit = pr.commits.nodes[0]?.commit;
  if (why.length) { console.log(`#${pr.number} ${pr.title}: waiting (${why.join("; ")})`); continue; }
  if (dryRun) { console.log(`#${pr.number} ${pr.title}: would merge`); continue; }
  await gh(`/repos/${owner}/${repo}/pulls/${pr.number}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "merge", sha: commit.oid, commit_title: `Merge pull request #${pr.number} from ${owner}/${pr.headRefName} (auto-merged blog post)` }),
  });
  console.log(`#${pr.number} ${pr.title}: merged`);
  merged++;
}
console.log(`Done: ${merged} merged.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
