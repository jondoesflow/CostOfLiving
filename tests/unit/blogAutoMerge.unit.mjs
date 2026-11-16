import { test } from "node:test";
import assert from "node:assert/strict";
import { reasonsToWait, fileProblems, claudeReviewedAt } from "../../scripts/blog-auto-merge.mjs";

const now = Date.parse("2026-11-10T12:00:00Z");
const owner = { __typename: "User", login: "jondoesflow" };
const SHA = "abc1234def5678abc1234def5678abc1234def56";
const OLD = "0000000def5678abc1234def5678abc1234def56";
let t = 0;
const review = (sha, result = "pass", author = owner) => ({ author, createdAt: new Date(Date.parse("2026-11-10T10:30:00Z") + 60e3 * t++).toISOString(), body: `Review: all checks passed.\n<!-- claude-review:v1 sha=${sha} result=${result} -->` });
const postFiles = [{ filename: "content/blog/2026-11-19-test.md", status: "added" }, { filename: "content/blog/TOPICS.md", status: "modified" }];
const ready = () => ({
  number: 1, title: "Blog post for approval: test", headRefName: "blog/2026-11-19-test", isDraft: false, isCrossRepository: false,
  createdAt: "2026-11-10T09:00:00Z", mergeable: "MERGEABLE", labels: { nodes: [] },
  commits: { nodes: [{ commit: { oid: SHA, committedDate: "2026-11-10T10:00:00Z", statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [{ __typename: "CheckRun", name: "blog-checks", conclusion: "SUCCESS" }] } } } }] },
  reviewThreads: { nodes: [] },
  comments: { nodes: [review(SHA)] },
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
  p.reviewThreads.nodes.push({ isResolved: false, comments: { nodes: [{ body: "Fix this", author: { __typename: "Bot", login: "some-review-bot" } }] } });
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
  assert.equal(fileProblems([{ filename: "content/blog/2026-11-02-y.md", status: "renamed", previous_filename: "content/blog/2026-11-02-x.md" }]).length, 1);
  assert.match(reasonsToWait(ready(), now).join(), /not checked/);
  assert.match(reasonsToWait(ready(), now, []).join(), /0 files/);
});

test("it waits until Claude's review of the latest commit has passed", () => {
  const none = ready(); none.comments.nodes = [];
  assert.match(reasonsToWait(none, now, postFiles).join(), /Claude's review/);
  const older = ready(); older.comments.nodes = [review(OLD)];
  assert.match(reasonsToWait(older, now, postFiles).join(), /Claude's review/);
  const changes = ready(); changes.comments.nodes = [review(SHA, "changes")];
  assert.match(reasonsToWait(changes, now, postFiles).join(), /Claude's review/);
  assert.equal(claudeReviewedAt([{ author: owner, body: "no marker" }], "jondoesflow"), null);
});

test("a later review that asks for changes cancels an earlier pass", () => {
  const p = ready(); p.comments.nodes = [review(SHA), review(SHA, "changes")];
  assert.match(reasonsToWait(p, now, postFiles).join(), /Claude's review/);
});

test("a review marker posted by any other account is ignored", () => {
  const p = ready();
  p.comments.nodes = [review(SHA, "pass", { __typename: "User", login: "someone" })];
  assert.match(reasonsToWait(p, now, postFiles).join(), /Claude's review/);
  p.comments.nodes = [review(SHA, "pass", { __typename: "Bot", login: "jondoesflow" })];
  assert.match(reasonsToWait(p, now, postFiles).join(), /Claude's review/);
});

test("a short sha, a malformed newer marker or a quoted marker doesn't count", () => {
  const short = ready(); short.comments.nodes = [review(SHA.slice(0, 7))];
  assert.match(reasonsToWait(short, now, postFiles).join(), /Claude's review/);
  const malformed = ready(); malformed.comments.nodes = [review(SHA), review(SHA, "fail")];
  assert.match(reasonsToWait(malformed, now, postFiles).join(), /Claude's review/);
  const quoted = ready(); quoted.comments.nodes = [{ ...review(SHA), body: `> <!-- claude-review:v1 sha=${SHA} result=pass -->` }];
  assert.match(reasonsToWait(quoted, now, postFiles).join(), /Claude's review/);
});

test("a review posted as a GitHub review counts, and a newer one there can cancel a pass", () => {
  const asReview = ready(); asReview.comments.nodes = [];
  const r = review(SHA); asReview.reviews = { nodes: [{ author: r.author, body: r.body, submittedAt: r.createdAt }] };
  assert.deepEqual(reasonsToWait(asReview, now, postFiles), []);
  const cancelled = ready();
  const c = review(SHA, "changes"); cancelled.reviews = { nodes: [{ author: c.author, body: c.body, submittedAt: c.createdAt }] };
  assert.match(reasonsToWait(cancelled, now, postFiles).join(), /Claude's review/);
});
