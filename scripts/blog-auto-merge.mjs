// Merges blog post pull requests without Jon (his request, 9 November 2026),
// but only once they've had time to be reviewed and every check is green.
// Run hourly by .github/workflows/blog-auto-merge.yml with GITHUB_TOKEN.
//
// A blog PR merges when all of these hold:
//   - its branch starts with blog/, it's from this repository and not a draft
//   - it has no "hold" label (add one to stop a post)
//   - it was opened at least 2 hours ago and its last commit is at least
//     1 hour old, so Codex has reviewed it and the session has answered
//   - every check on its latest commit passed, including "blog-checks"
//   - no review thread is waiting on an answer: an unresolved thread whose
//     last comment is from a bot (an unanswered Codex finding) blocks it
//   - GitHub says it merges cleanly
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/blog-auto-merge.mjs [--dry-run]
import { fileURLToPath } from "node:url";

export const OPEN_FOR_MS = 2 * 3600e3;
export const QUIET_FOR_MS = 1 * 3600e3;
export const REQUIRED_CHECK = "blog-checks";

// Why a pull request can't merge yet; an empty list means it can.
export function reasonsToWait(pr, now = Date.now()) {
  const why = [];
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
  const waiting = pr.reviewThreads.nodes.filter((t) => !t.isResolved && t.comments.nodes[0]?.author?.__typename === "Bot");
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
        reviewThreads(first: 100) { nodes { isResolved comments(last: 1) { nodes { author { __typename login } } } } }
      }
    }
  }
}`;

const data = (await gh("/graphql", { method: "POST", body: JSON.stringify({ query, variables: { owner, repo } }) })).data;
const now = Date.now();
let merged = 0;

for (const pr of data.repository.pullRequests.nodes) {
  if (!pr.headRefName.startsWith("blog/")) continue;
  const why = reasonsToWait(pr, now);
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
