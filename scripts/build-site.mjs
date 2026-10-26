// Runs after `vite build`. Writes the static pages search engines index:
//   - a page per tool (/gas-or-electric/ ...) with its own title and description
//   - the blog: /blog/, /blog/<slug>/ from content/blog/*.md, and /blog/feed.xml
//   - sitemap.xml, robots.txt and 404.html
// Posts are files named YYYY-MM-DD-slug.md (README.md and TOPICS.md are not).
// Posts with `draft: true` are left out unless BLOG_DRAFTS=1 (for previewing).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { PAGES, SITE_URL } from "../src/pages.js";
import { APPLIANCES, APPLIANCE_GROUPS, REGIONS } from "../src/appliances.js";
import { GUIDES } from "../src/applianceGuides.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const postsDir = join(root, "content", "blog");
const showDrafts = process.env.BLOG_DRAFTS === "1";
const today = new Date().toISOString().slice(0, 10);

const AUTHOR = { name: "Jon Russell", url: "https://www.linkedin.com/in/jondoesflow" };
const IMAGE = `${SITE_URL}/og-image.png`;
const UMAMI = `<script defer src="https://umami.jondoesflow.com/script.js" data-website-id="74f37327-8238-4722-bf55-31f81c6ea0df" data-domains="cheapwatts.co.uk"></script>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const write = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };
const ukDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

// ---------- tool pages ----------
const shell = readFileSync(join(dist, "index.html"), "utf8");

function withMeta(html, page) {
  const url = `${SITE_URL}${page.path}`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(page.description)}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(page.title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(page.description)}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${esc(page.title)}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${esc(page.description)}"`);
}

const siteLd = [
  { "@context": "https://schema.org", "@type": "WebSite", name: "Cheap Watts", url: `${SITE_URL}/`, inLanguage: "en-GB" },
  {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Cheap Watts", url: `${SITE_URL}/`,
    applicationCategory: "UtilitiesApplication", operatingSystem: "Any", inLanguage: "en-GB",
    description: PAGES[0].description, image: IMAGE,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    creator: { "@type": "Person", ...AUTHOR },
  },
];

for (const page of PAGES) {
  const html = withMeta(shell, page).replace("</head>", `    ${jsonLd(page.path === "/" ? siteLd : siteLd[1])}\n  </head>`);
  write(join(dist, page.path, "index.html"), html);
}

// ---------- blog ----------
function parsePost(file) {
  const text = readFileSync(join(postsDir, file), "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^["'](.*)["']$/, "$1");
  }
  for (const key of ["title", "description", "date"]) if (!meta[key]) throw new Error(`${file}: missing ${key}`);
  const slug = meta.slug || file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const words = m[2].split(/\s+/).filter(Boolean).length;
  return {
    ...meta, slug, draft: meta.draft === "true",
    keywords: (meta.keywords ?? "").split(",").map((k) => k.trim()).filter(Boolean),
    html: marked.parse(m[2]), minutes: Math.max(1, Math.round(words / 220)), url: `${SITE_URL}/blog/${slug}/`,
  };
}

const posts = (existsSync(postsDir) ? readdirSync(postsDir).filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)) : [])
  .map(parsePost)
  .filter((p) => showDrafts || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

const tool = (id) => PAGES.find((p) => p.id === id) ?? PAGES[0];
const TOOL_CTA = {
  when: "Find the cheapest time to run your appliances",
  plan: "Plan your evening around the cheap hours",
  gas: "Compare gas and electric at today's prices",
  solar: "Work out when to use, sell or store your solar",
  switch: "See what you'd pay on each tariff",
};

const TOOL_BUTTON = {
  when: "Open Cheap Watts",
  plan: "Plan my evening",
  gas: "Compare gas and electric",
  solar: "Open solar and batteries",
  switch: "Compare tariffs",
};

function layout({ title, description, canonical, type = "website", ld = [], main }) {
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" type="application/rss+xml" title="Cheap Watts blog" href="${SITE_URL}/blog/feed.xml" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#1d3461" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="Cheap Watts" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Cheap Watts logo: a money bag with a pound sign next to a purple lightbulb" />
    <meta property="og:locale" content="en_GB" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${IMAGE}" />
    <script>
      (function () {
        var pref = "system";
        try { pref = JSON.parse(localStorage.getItem("whenToRun.theme")) || "system"; } catch (e) {}
        var dark = pref === "dark" || (pref === "system" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", dark);
      })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/blog.css" />
    ${ld.map(jsonLd).join("\n    ")}
    ${UMAMI}
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site">
      <div class="support">
        <div class="wrap">
          <p>This website is free to use. If you wish to make a contribution to my next project, please <a href="https://ko-fi.com/jondoesflow" target="_blank" rel="noopener noreferrer">click here<span class="sr-only"> to support me on Ko-fi (opens in a new tab)</span></a>.</p>
        </div>
      </div>
      <div class="wrap bar">
        <a class="brand" href="/">Cheap Watts</a>
        <nav aria-label="Main">
          <ul>
            <li><a href="/">Tools</a></li>
            <li><a href="/cost-to-run/" ${canonical.startsWith(`${SITE_URL}/cost-to-run/`) ? 'aria-current="page"' : ""}>Running costs</a></li>
            <li><a href="/blog/" ${canonical.startsWith(`${SITE_URL}/blog/`) ? 'aria-current="page"' : ""}>Blog</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="main" tabindex="-1" class="wrap">
${main}
    </main>
    <footer class="wrap site-footer">
      <nav aria-label="About the creator">
        <ul>
          <li><a href="https://www.jondoesflow.com/" target="_blank" rel="noopener noreferrer">JonDoesFlow<span class="sr-only"> (opens in a new tab)</span></a></li>
          <li><a href="https://www.linkedin.com/in/jondoesflow" target="_blank" rel="noopener noreferrer">Created By<span class="sr-only"> (opens in a new tab)</span></a></li>
          <li><a href="https://github.com/jondoesflow?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub Projects<span class="sr-only"> (opens in a new tab)</span></a></li>
        </ul>
      </nav>
      <p>Cheap Watts is free and not affiliated with any energy supplier. Prices change; always check your own tariff.</p>
    </footer>
  </body>
</html>
`;
}

function postCard(p) {
  return `<li class="card">
          <h2><a href="/blog/${p.slug}/">${esc(p.title)}</a></h2>
          <p class="meta"><time datetime="${p.date}">${ukDate(p.date)}</time> · ${p.minutes} min read</p>
          <p>${esc(p.description)}</p>
        </li>`;
}

for (const p of posts) {
  const t = tool(p.tool);
  const related = posts.filter((o) => o !== p).slice(0, 3);
  const ld = [
    {
      "@context": "https://schema.org", "@type": "BlogPosting",
      headline: p.title, description: p.description, image: IMAGE, inLanguage: "en-GB",
      datePublished: p.date, dateModified: p.updated || p.date,
      author: { "@type": "Person", ...AUTHOR },
      publisher: { "@type": "Organization", name: "Cheap Watts", url: `${SITE_URL}/`, logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` } },
      mainEntityOfPage: p.url, keywords: p.keywords.join(", "),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Cheap Watts", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
        { "@type": "ListItem", position: 3, name: p.title, item: p.url },
      ],
    },
  ];
  const main = `      <nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Cheap Watts</a></li><li><a href="/blog/">Blog</a></li><li aria-current="page">${esc(p.title)}</li></ol></nav>
      <article>
        <header>
          <h1>${esc(p.title)}</h1>
          <p class="meta">By <a href="${AUTHOR.url}" rel="author">${AUTHOR.name}</a> · <time datetime="${p.date}">${ukDate(p.date)}</time> · ${p.minutes} min read</p>
        </header>
        <div class="prose">
${p.html}
        </div>
        <aside class="cta" aria-label="Try the tool">
          <p class="cta-title">${esc(TOOL_CTA[p.tool] ?? TOOL_CTA.when)}</p>
          <p>Free, no sign-up, with live prices for your tariff.</p>
          <a class="button" href="${t.path}">${TOOL_BUTTON[t.id]}</a>
        </aside>
      </article>${related.length ? `
      <section aria-labelledby="more" class="related">
        <h2 id="more">More from the blog</h2>
        <ul class="cards">
        ${related.map(postCard).join("\n        ")}
        </ul>
      </section>` : ""}`;
  write(join(dist, "blog", p.slug, "index.html"), layout({
    title: `${p.title} · Cheap Watts`, description: p.description, canonical: p.url, type: "article", ld, main,
  }));
}

write(join(dist, "blog", "index.html"), layout({
  title: "Cheap Watts blog: practical ways to cut your electricity bill",
  description: "Plain-English guides to cheaper electricity in the UK: when to run appliances, which tariffs suit you, and what things really cost to run.",
  canonical: `${SITE_URL}/blog/`,
  ld: [{ "@context": "https://schema.org", "@type": "Blog", name: "Cheap Watts blog", url: `${SITE_URL}/blog/`, inLanguage: "en-GB",
    author: { "@type": "Person", ...AUTHOR },
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: p.url, datePublished: p.date })) }],
  main: `      <h1>The Cheap Watts blog</h1>
      <p class="lede">Plain-English guides to paying less for electricity: when to run things, which tariffs suit which homes, and what everyday appliances really cost.</p>
      ${posts.length ? `<ul class="cards">\n        ${posts.map(postCard).join("\n        ")}\n      </ul>` : "<p>The first posts are on their way.</p>"}`,
}));

write(join(dist, "blog", "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Cheap Watts blog</title>
    <link>${SITE_URL}/blog/</link>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Practical ways to cut your electricity bill in the UK.</description>
    <language>en-gb</language>
${posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${p.url}</link>
      <guid>${p.url}</guid>
      <pubDate>${new Date(`${p.date}T09:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`).join("\n")}
  </channel>
</rss>
`);

// ---------- running cost pages: /cost-to-run/ and /cost-to-run/<appliance>/ ----------
// The typical standard (price cap) unit rate, averaged over the regions, is
// fetched at build time so the static copy has a real figure. The page then
// loads live prices for the reader's own region.
async function typicalStandardRate() {
  const list = await (await fetch("https://api.octopus.energy/v1/products/?is_variable=true&is_business=false")).json();
  const product = list.results.find((p) => /^Flexible Octopus$/.test(p.display_name) && !p.available_to);
  const detail = await (await fetch(`https://api.octopus.energy/v1/products/${product.code}/`)).json();
  const rates = REGIONS.map((r) => Object.values(detail.single_register_electricity_tariffs[`_${r.code}`])[0].standard_unit_rate_inc_vat);
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}
let stdRate = 26;
try {
  stdRate = await typicalStandardRate();
} catch (e) {
  console.warn(`Couldn't fetch the standard rate (${e.message}); using ${stdRate}p.`);
}
const pence = (p) => (p >= 100 ? `£${(p / 100).toFixed(2)}` : p < 10 ? `${p.toFixed(1)}p` : `${Math.round(p)}p`);
const yearly = (p) => (p >= 100 ? `£${Math.round(p / 100)}` : pence(p));
const hours = (m) => (m < 60 ? `${m} minutes` : m % 60 ? `${(m / 60).toFixed(1)} hours` : m === 60 ? "1 hour" : `${m / 60} hours`);
const costScript = readFileSync(join(dist, "cost.html"), "utf8").match(/<script type="module"[^>]*><\/script>/)[0];
const costPages = APPLIANCES.filter((a) => GUIDES[a.id]).map((a) => ({ ...a, ...GUIDES[a.id], url: `${SITE_URL}/cost-to-run/${a.id}/` }));

for (const a of costPages) {
  const run = a.kWh * stdRate;
  const year = run * a.perWeek * 52;
  const alt = a.alt && costPages.find((o) => o.id === a.alt.id);
  const others = costPages.filter((o) => o.group === a.group && o !== a);
  const description = `${a.name === "Electric car" ? "Charging an electric car at home" : `A ${a.name.toLowerCase()}`} costs about ${pence(run)} a run on a standard UK tariff (${a.kWh}kWh, ${a.note.toLowerCase()}). See today's price for your region, and the cheapest time to run it on your tariff.`;
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: a.question, description, inLanguage: "en-GB", image: IMAGE,
      author: { "@type": "Person", ...AUTHOR }, mainEntityOfPage: a.url, dateModified: today },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: a.question,
      acceptedAnswer: { "@type": "Answer", text: `About ${pence(run)} a run on a standard UK tariff, using ${a.kWh}kWh for ${a.note.toLowerCase()}. That's about ${yearly(year)} a year at ${a.perWeek} times a week. On a time-of-use tariff such as Agile Octopus it can cost much less at the cheapest time of day.` } }] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Cheap Watts", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Running costs", item: `${SITE_URL}/cost-to-run/` },
      { "@type": "ListItem", position: 3, name: a.name, item: a.url } ] },
  ];
  const main = `      <nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Cheap Watts</a></li><li><a href="/cost-to-run/">Running costs</a></li><li aria-current="page">${esc(a.name)}</li></ol></nav>
      <article>
        <header>
          <h1>${esc(a.question)}</h1>
          <p class="lede">About <strong>${pence(run)} a run</strong> on a standard tariff, or around <strong>${yearly(year)} a year</strong> at ${a.perWeek} times a week. Less at the right time on a time-of-use tariff.</p>
        </header>
        <section class="live" id="live-cost" data-appliance="${a.id}" data-kwh="${a.kWh}" data-mins="${a.mins}" data-perweek="${a.perWeek}" aria-labelledby="live-title">
          <h2 id="live-title">Today's cost where you live</h2>
          <label>Your region <select></select></label>
          <div data-out><p class="muted">Loading today's prices needs JavaScript. <a href="/?appliance=${a.id}">Open the tool</a> instead.</p></div>
        </section>
        <div class="prose">
          <p>${esc(a.intro)}</p>
          <h2>How we work it out</h2>
          <p>A typical ${a.name.toLowerCase()} uses about <strong>${a.kWh}kWh</strong> for ${esc(a.note.toLowerCase())}, taking around ${hours(a.mins)}. Electricity on a standard variable tariff costs about ${stdRate.toFixed(0)}p a unit across Great Britain at the moment (it varies a little by region), so one run comes to about ${pence(run)}. Your own model may use more or less: the energy label, or a plug-in energy monitor, will tell you.</p>
          <p>If you're on a tariff where the price changes through the day, such as Agile Octopus, Economy 7 or an electric car tariff, the same run can cost much less at the right time. <a href="/?appliance=${a.id}">The Cheap Watts tool</a> finds that time for you on your own tariff.</p>
          <h2>How to spend less</h2>
          <ul>${a.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          ${alt ? `<h2>A cheaper option</h2><p>${esc(a.alt.note)} <a href="/cost-to-run/${alt.id}/">See what a ${alt.name.toLowerCase()} costs to run</a>.</p>` : ""}
        </div>
        <aside class="cta" aria-label="Try the tool">
          <p class="cta-title">When's the cheapest time to run it on your tariff?</p>
          <p>Free, no sign-up, with live prices for Octopus, EDF and E.ON Next, or your own rates.</p>
          <a class="button" href="/?appliance=${a.id}">Find the cheapest time</a>
        </aside>
      </article>${others.length ? `
      <section aria-labelledby="more" class="related">
        <h2 id="more">More running costs</h2>
        <ul class="cards">
        ${others.map((o) => `<li class="card"><h2><a href="/cost-to-run/${o.id}/">${esc(o.question)}</a></h2><p>About ${pence(o.kWh * stdRate)} a run.</p></li>`).join("\n        ")}
        </ul>
      </section>` : ""}`;
  write(join(dist, "cost-to-run", a.id, "index.html"), layout({
    title: `${a.question} · Cheap Watts`, description, canonical: a.url, type: "article", ld, main,
  }).replace("  </head>", `    ${costScript}\n  </head>`));
}

write(join(dist, "cost-to-run", "index.html"), layout({
  title: "How much does it cost to run? UK appliance running costs at today's prices · Cheap Watts",
  description: "What a washing machine, tumble dryer, dishwasher, oven, air fryer, electric heater, shower or electric car costs to run in the UK, at today's electricity prices, with the cheapest time to run each one.",
  canonical: `${SITE_URL}/cost-to-run/`,
  ld: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Appliance running costs",
    itemListElement: costPages.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.question, url: a.url })) }],
  main: `      <h1>How much does it cost to run?</h1>
      <p class="lede">Typical running costs for everyday appliances at today's UK electricity prices, with how to pay less for each one. Standard tariff figures use about ${stdRate.toFixed(0)}p a unit; pick your region on each page for today's exact price.</p>
      ${APPLIANCE_GROUPS.map((g) => {
        const items = costPages.filter((a) => a.group === g.id);
        return items.length ? `<h2>${esc(g.name)}</h2>
      <ul class="cards">
        ${items.map((a) => `<li class="card"><h2><a href="/cost-to-run/${a.id}/">${esc(a.question)}</a></h2><p>About ${pence(a.kWh * stdRate)} a run, ${esc(a.note.toLowerCase())}.</p></li>`).join("\n        ")}
      </ul>` : "";
      }).join("\n      ")}`,
}));

// ---------- guide pages: /<slug>/ from content/pages/*.md ----------
const pagesDir = join(root, "content", "pages");
const guides = (existsSync(pagesDir) ? readdirSync(pagesDir).filter((f) => f.endsWith(".md")) : []).map((file) => {
  const m = readFileSync(join(pagesDir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(m[1].split(/\r?\n/).map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map((kv) => [kv[1], kv[2].trim()]));
  for (const key of ["title", "description", "slug"]) if (!meta[key]) throw new Error(`${file}: missing ${key}`);
  // Code blocks can scroll sideways, so keyboard users need to be able to reach them.
  const html = marked.parse(m[2]).replace(/<pre>/g, '<pre tabindex="0">');
  return { ...meta, html, url: `${SITE_URL}/${meta.slug}/` };
});

for (const g of guides) {
  write(join(dist, g.slug, "index.html"), layout({
    title: `${g.title} · Cheap Watts`, description: g.description, canonical: g.url,
    ld: [{ "@context": "https://schema.org", "@type": "TechArticle", headline: g.title, description: g.description, inLanguage: "en-GB", author: { "@type": "Person", ...AUTHOR }, mainEntityOfPage: g.url }],
    main: `      <article>
        <header><h1>${esc(g.title)}</h1></header>
        <div class="prose">
${g.html}
        </div>
      </article>`,
  }));
}

// ---------- sitemap, robots, 404 ----------
const urls = [
  ...PAGES.map((p) => ({ loc: `${SITE_URL}${p.path}`, lastmod: today, priority: p.path === "/" ? "1.0" : "0.8" })),
  { loc: `${SITE_URL}/blog/`, lastmod: posts[0]?.date ?? today, priority: "0.7" },
  ...posts.map((p) => ({ loc: p.url, lastmod: p.updated || p.date, priority: "0.6" })),
  ...guides.map((g) => ({ loc: g.url, lastmod: today, priority: "0.5" })),
  { loc: `${SITE_URL}/cost-to-run/`, lastmod: today, priority: "0.8" },
  ...costPages.map((a) => ({ loc: a.url, lastmod: today, priority: "0.7" })),
];
write(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`);
write(join(dist, "robots.txt"), `User-agent: *
Allow: /
Disallow: /calendar.ics
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`);
write(join(dist, "404.html"), layout({
  title: "Page not found · Cheap Watts", description: "That page doesn't exist.", canonical: `${SITE_URL}/404.html`,
  main: `      <h1>That page doesn't exist</h1>
      <p class="lede">It may have moved. Try <a href="/">the Cheap Watts tools</a> or <a href="/blog/">the blog</a>.</p>`,
}).replace('<meta name="description"', '<meta name="robots" content="noindex" />\n    <meta name="description"'));

console.log(`Built ${PAGES.length} tool pages, ${costPages.length} running-cost pages, ${guides.length} guide(s), ${posts.length} blog post(s)${showDrafts ? " (including drafts)" : ""}, sitemap with ${urls.length} URLs.`);
