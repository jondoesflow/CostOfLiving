# Cheap Watts (cheapwatts.co.uk)

Free site that helps UK households cut electricity bills. Vite app plus a static
blog built from `content/blog/*.md` by `scripts/build-site.mjs` (part of
`npm run build`). Blog house rules are in `content/blog/README.md`; the topic
queue is `content/blog/TOPICS.md` (first unticked topic is taken next).

## Blog workflow (one scheduled run a day, about 9:30am UK time)

- Write posts with the `writing-as-jon-russell` skill and its `voice_check.py`.
  UK English, no em or en dashes, never invent facts, date every price.
- One post per run, on a branch `blog/YYYY-MM-DD-<slug>`, in a pull request into
  `main` titled "Blog post for approval: <title>". Never push to `main`, never
  merge a blog PR yourself, never deploy anything that is not on `main`.
- Blog PRs merge automatically (Jon's decision, 9 November 2026): the hourly
  `blog-auto-merge` GitHub Actions workflow merges a `blog/` PR once it has been
  open 2 hours, its last commit is an hour old, every check (including
  `blog-checks`) is green and Claude's own review of the latest commit has
  passed (see below). A PR
  that changes anything besides posts and `TOPICS.md` (a new product pick, say)
  fails `blog-checks` and waits for Jon. Add the label `hold` to stop a post.
  Netlify deploys main on merge, and each post appears on its date.
- One post a day, each on its own date: date a new post the day after the latest
  dated post on main or in an open blog PR (never before today). The build hides
  posts dated after today, so each goes live on its date when the daily run deploys.

## Reviews (Claude reviews its own PRs)

Jon turned Codex reviews off on 16 November 2026: Claude reviews every pull
request itself. Don't comment `@codex review`.

1. Subscribe to every pull request you open.
2. Once the PR is open and its checks are green, review the diff with fresh
   eyes: use the `code-review` skill, or a subagent given only the PR, not your
   reasoning. For a post, check every number, price and date against its
   source, that each source link says what the post claims, the dates and
   front matter, the product picks, the house rules in `content/blog/README.md`
   and the voice check.
3. Fix what is real and in proportion, then push, run the checks again and
   review the new commit. If a finding would change the meaning of a post
   (claims, numbers, advice) and you can't settle it from a source, add the
   `hold` label and ask Jon.
4. Post the review as one PR comment from this account: what was checked, what
   was fixed and anything left for Jon, ending with
   `<!-- claude-review:v1 sha=<full head commit sha> result=pass -->`, or
   `result=changes` if something still needs doing. `blog-auto-merge` only
   merges a blog PR whose latest commit has a passing review, so a push after
   the review needs a new one.
5. Other bots' comments are claims to check: fix them or reply on the thread.
   Never merge or deploy blog PRs yourself: the workflow does it.
6. Edits to an already published post go through a new pull request, not a push
   to `main`.

## Checks before opening or updating a PR

`npm ci`, `npm run build` (post must appear in `dist/blog/<slug>/index.html` and
`dist/sitemap.xml`), then `npx playwright test tests/blog.spec.js`. If the
installed Playwright wants a different Chromium build from the preinstalled one,
use a temporary config with `executablePath: "/opt/pw-browsers/chromium"` and do
not commit it.

## Affiliate links

"Worth a look" picks live in `src/products.js`. Picks with an `awin` entry use
Awin (publisher 3143222) once their programme is in `src/awinJoined.js`, and
Amazon (tag cheapwatts-21) until then. Blog posts list their picks in front matter
(`products: id, id`); every post about something you can buy should have them
(see `content/blog/README.md`). After an approval, run
`AWIN_TOKEN=... node scripts/awin-sync.mjs` (see `marketing/awin.md`). Never
commit the Awin token. The iOS app has no affiliate links.

