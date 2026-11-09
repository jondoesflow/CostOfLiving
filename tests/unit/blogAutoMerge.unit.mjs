import { test } from "node:test";
import assert from "node:assert/strict";
import { reasonsToWait, fileProblems } from "../../scripts/blog-auto-merge.mjs";

const now = Date.parse("2026-11-10T12:00:00Z");
const postFiles = [{ filename: "content/blog/2026-11-19-test.md", status: "added" }, { filename: "content/blog/TOPICS.md", status: "modified" }];
const ready = () => ({
  number: 1, title: "Blog post for approval: test", headRefName: "blog/2026-11-19-test", isDraft: false, isCrossRepository: false,
  createdAt: "2026-11-10T09:00:00Z", mergeable: "MERGEABLE", labels: { nodes: [] },
  commits: { nodes: [{ commit: { oid: "abc", committedDate: "2026-11-10T10:00:00Z", statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [{ __typename: "CheckRun", name: "blog-checks", conclusion: "SUCCESS" }] } } } }] },
  reviewThreads: { nodes: [] },
});

test("a green, reviewed blog PR that has waited long enough can merge", () => {
  assert.deepEqual(reasonsToWait(ready(), now, postFiles), []);
});

test("a hold label, a draft, a fork or another branch stops it", () => {
  for (const change of [
    (p) => { p.labels.nodes.push({ name: "hold" }); },
    (p) => { p.isDraft = true; },
    (p) => { p.isCrossRepository = true; },
    (p) => { p.headRefName = "awin/offers"; },
  ]) { const p = ready(); change(p); assert.ok(reasonsToWait(p, now, postFiles).length, String(change)); }
});

test("it waits two hours after opening and an hour after the last commit", () => {
  const young = ready(); young.createdAt = "2026-11-10T11:00:00Z";
  assert.match(reasonsToWait(young, now, postFiles).join(), /2 hours/);
  const fresh = ready(); fresh.commits.nodes[0].commit.committedDate = "2026-11-10T11:30:00Z";
  assert.match(reasonsToWait(fresh, now, postFiles).join(), /an hour/);
});

test("red or missing checks, or blog-checks not passed, stop it", () => {
  const red = ready(); red.commits.nodes[0].commit.statusCheckRollup.state = "FAILURE";
  assert.ok(reasonsToWait(red, now, postFiles).length);
  const missing = ready(); missing.commits.nodes[0].commit.statusCheckRollup.contexts.nodes = [];
  assert.match(reasonsToWait(missing, now, postFiles).join(), /blog-checks/);
});

test("an unanswered bot review comment stops it; an answered one doesn't", () => {
  const p = ready();
  p.reviewThreads.nodes.push({ isResolved: false, comments: { nodes: [{ author: { __typename: "Bot", login: "chatgpt-codex-connector" } }] } });
  assert.match(reasonsToWait(p, now, postFiles).join(), /not answered/);
  p.reviewThreads.nodes[0].comments.nodes[0].author = { __typename: "User", login: "jondoesflow" };
  assert.deepEqual(reasonsToWait(p, now, postFiles), []);
});

test("a conflicted PR waits", () => {
  const p = ready(); p.mergeable = "CONFLICTING";
  assert.match(reasonsToWait(p, now, postFiles).join(), /CONFLICTING/);
});

test("a blog PR that changes code, workflows or the checker never merges on its own", () => {
  for (const f of [".github/workflows/blog-checks.yml", "scripts/check-blog-pr.mjs", "scripts/blog-auto-merge.mjs", "src/products.js", "content/blog/README.md"]) {
    const files = [...postFiles, { filename: f, status: "modified" }];
    assert.match(reasonsToWait(ready(), now, files).join(), /only Jon can approve/, f);
  }
});

test("deleting or renaming away a post needs Jon, and the file list must have been checked", () => {
  assert.deepEqual(fileProblems([{ filename: "content/blog/2026-11-01-x.md", status: "removed" }]), ["content/blog/2026-11-01-x.md (removed)"]);
  assert.equal(fileProblems([{ filename: "content/blog/2026-11-02-x.md", status: "renamed", previous_filename: "scripts/evil.mjs" }]).length, 1);
  assert.match(reasonsToWait(ready(), now).join(), /not checked/);
  assert.match(reasonsToWait(ready(), now, []).join(), /0 files/);
});
