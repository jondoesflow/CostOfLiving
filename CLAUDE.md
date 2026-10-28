# Cheap Watts (cheapwatts.co.uk)

Free site that helps UK households cut electricity bills. Vite app plus a static
blog built from `content/blog/*.md` by `scripts/build-site.mjs` (part of
`npm run build`). Blog house rules are in `content/blog/README.md`; the topic
queue is `content/blog/TOPICS.md` (first unticked topic is taken next).

## Blog workflow (scheduled runs, about 9:30am and 11:30am UK time)

- Write posts with the `writing-as-jon-russell` skill and its `voice_check.py`.
  UK English, no em or en dashes, never invent facts, date every price.
- One post per run, on a branch `blog/YYYY-MM-DD-<slug>`, in a pull request into
  `main` titled "Blog post for approval: <title>". Never push to `main`, never
  merge an unapproved post, never deploy anything that is not on `main`.
- Jon approves by merging the pull request. The next run deploys approved posts
  that are missing from the live sitemap.

## Review feedback loop (Codex and other bots)

Do not rely on email. Review feedback arrives as comments on the pull request, and
a session that is subscribed to the PR (`subscribe_pr_activity`) receives it.

1. Subscribe to every pull request you open.
2. Codex reviews when a PR is opened. It does not necessarily review later pushes,
   so after pushing any fix, comment `@codex review` on the PR to re-run it.
3. Treat each finding as a claim to check, not an order. Reproduce it or trace a
   real path to the failure. Fix it when it is real and the fix is in proportion;
   otherwise reply on the thread with why not. Anything that changes the meaning
   of a post (claims, numbers, advice) goes to Jon first.
4. After a fix: run the voice check, `npm run build`, and `tests/blog.spec.js`,
   then push to the same branch and reply once on the thread.
5. Finished review with no findings needs no reply. Never merge or deploy.
6. Edits to an already published post go through a new pull request, not a push
   to `main`.

## Checks before opening or updating a PR

`npm ci`, `npm run build` (post must appear in `dist/blog/<slug>/index.html` and
`dist/sitemap.xml`), then `npx playwright test tests/blog.spec.js`. If the
installed Playwright wants a different Chromium build from the preinstalled one,
use a temporary config with `executablePath: "/opt/pw-browsers/chromium"` and do
not commit it.
