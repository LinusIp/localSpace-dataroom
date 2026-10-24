// Checks the page against the data and content files. Plain node, no packages.
// Run from the repository root: node tools/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const json = (f) => JSON.parse(read(f));

const html = read('index.html');
const md = read('content/dataroom.md');
const hw = json('data/hardware.json');
const mk = json('data/market.json');
const funds = json('data/funds.json');
const gpu = json('data/gpu_plan.json');

const fails = [];
let passes = 0;
const check = (ok, msg) => { if (ok) passes++; else fails.push(msg); };
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const nums = (s) => (s.match(/\d[\d,]*(\.\d+)?/g) ?? []).map((n) => Number(n.replace(/,/g, '')));
const blocks = (re, s = html) => [...s.matchAll(re)];

// 1a. Hardware grid A
for (const t of hw.tiers) {
  const row = html.match(new RegExp(`<tr data-tier="${t.id}">([\\s\\S]*?)</tr>`));
  check(row, `grid: no row for ${t.id}`);
  if (!row) continue;
  const price = row[1].match(/<td class="price"([^>]*)>([^<]*)<\/td>/);
  if (t.price_usd) {
    const [lo, hi] = t.price_usd;
    check(price && price[1].includes(`data-price-min="${lo}"`) && price[1].includes(`data-price-max="${hi}"`), `grid: ${t.id} price attributes differ from ${lo}-${hi}`);
    const shown = nums(price[2].replace(/(\d),(\d{3})/g, '$1$2'));
    const hiShown = shown[1] ?? shown[0];
    check(shown[0] === lo && (hiShown === hi || hiShown * 1000 === hi), `grid: ${t.id} price shows "${price[2]}", data says ${lo}-${hi}`);
  }
  const anyMeasured = Object.values(t.classes).some((x) => x.fit === 'measured');
  check(anyMeasured !== /class="stick">[^<]*<span class="tag e">estimate</.test(row[1]), `grid: ${t.id} estimate badge`);
  for (const c of hw.model_classes) {
    const cell = row[1].match(new RegExp(`<td class="cell[^"]*" data-class="${c.id}" data-wps="([^"]*)"(?: data-fit="([^"]+)")?>([\\s\\S]*?)</td>`));
    check(cell, `grid: no cell ${t.id}/${c.id}`);
    if (!cell) continue;
    const want = t.classes[c.id];
    if (want.words_per_sec == null) {
      check(cell[1] === '' && text(cell[3]).startsWith('—'), `grid: ${t.id}/${c.id} should be "—"`);
      continue;
    }
    check(Number(cell[1]) === want.words_per_sec, `grid: ${t.id}/${c.id} data ${cell[1]}, json ${want.words_per_sec}`);
    check(nums(text(cell[3]))[0] === want.words_per_sec, `grid: ${t.id}/${c.id} shows "${text(cell[3])}", json ${want.words_per_sec}`);
    const fit = want.fit === 'measured' ? 'measured' : want.fit.startsWith('slow') ? 'slow' : 'fits';
    check(cell[2] === fit, `grid: ${t.id}/${c.id} fit "${cell[2]}", json "${want.fit}"`);
    check((fit === 'measured') === /tag m">measured/.test(cell[3]), `grid: ${t.id}/${c.id} measured badge`);
    check((fit === 'slow') === /tag s">slow/.test(cell[3]), `grid: ${t.id}/${c.id} slow tag`);
  }
}

// 1b. Table B
const tableB = html.match(/<table class="data" id="table-b">([\s\S]*?)<\/table>/)[1];
for (const [, id, body] of blocks(/<tbody data-tier="([^"]+)">([\s\S]*?)<\/tbody>/g, tableB)) {
  const t = hw.tiers.find((x) => x.id === id);
  check(t, `table B: unknown machine ${id}`);
  if (!t) continue;
  for (const [, cls, tr] of blocks(/<tr data-class-name="([^"]+)">([\s\S]*?)<\/tr>/g, body)) {
    const s = t.serving.find((x) => x.model_class === cls);
    check(s, `table B: ${id} has no "${cls}" in json`);
    if (!s) continue;
    const chats = tr.match(/data-chats="(\d+)">(\d+)</);
    check(chats && +chats[1] === s.chats_at_once && +chats[2] === s.chats_at_once, `table B: ${id}/${cls} chats at once`);
    const team = tr.match(/data-team-min="(\d+)" data-team-max="(\d+)">(\d+)–(\d+)</);
    check(team && +team[1] === s.team_size[0] && +team[2] === s.team_size[1] && +team[3] === s.team_size[0] && +team[4] === s.team_size[1], `table B: ${id}/${cls} team size`);
    const ppp = tr.match(/data-ppp="(\d+)">about \$(\d+)/);
    if (ppp) check(+ppp[1] === t.price_per_person_served_usd && +ppp[2] === t.price_per_person_served_usd, `table B: ${id} price per person`);
  }
  check(/data-ppp=/.test(body) === (t.price_per_person_served_usd != null), `table B: ${id} price per person shown once`);
}

// 1c. Market table and SOM table
const fmt = { tam: (v) => `$${v.toFixed(2)}B`, sam: (v) => `$${v.toFixed(1)}M`, som: (v) => `$${v.toLocaleString('en-US')}` };
for (const [, scn, body] of blocks(/<tbody data-scn="(min|mid|max)">([\s\S]*?)<\/tbody>/g)) {
  const S = mk.scenarios[scn];
  for (const [, metric, tr] of blocks(/<tr data-metric="(tam|sam|som)">([\s\S]*?)<\/tr>/g, body)) {
    const want = metric === 'tam' ? S.tam_busd : metric === 'sam' ? S.sam_musd : S.som_seats.map((n) => n * mk.price_per_seat_year);
    const cells = blocks(/data-year="(\d+)" data-v="([\d.]+)">([^<]+)</g, tr);
    check(cells.length === mk.years.length, `market: ${scn}/${metric} has ${cells.length} years`);
    cells.forEach(([, yr, v, shown]) => {
      const w = want[mk.years.indexOf(+yr)];
      check(+v === w && shown === fmt[metric](w), `market: ${scn}/${metric}/${yr} shows ${shown}, json ${w}`);
    });
    if (metric === 'som') S.som_musd.forEach((m, i) => check(Math.abs(m - want[i] / 1e6) < 0.0006, `market.json: ${scn} som_musd ${m} vs seats × 108`));
  }
}
check(mk.price_per_seat_year === 9 * 12, 'market.json: price per seat is not $9 × 12');
const som = html.match(/<table class="data" id="som-table">([\s\S]*?)<\/table>/)[1];
for (const [, yr, tr] of blocks(/<tr data-year="(\d+)">([\s\S]*?)<\/tr>/g, som)) {
  const i = mk.years.indexOf(+yr);
  for (const [, scn, seats, shown] of blocks(/data-scn="(\w+)" data-seats="(\d+)">([^<]+)</g, tr)) {
    const w = mk.scenarios[scn].som_seats[i];
    check(+seats === w && nums(shown)[0] === w, `SOM: ${yr}/${scn} seats ${shown}, json ${w}`);
  }
  for (const [, scn, rev, shown] of blocks(/data-scn="(\w+)" data-rev="(\d+)">([^<]+)</g, tr)) {
    const w = mk.scenarios[scn].som_seats[i] * mk.price_per_seat_year;
    check(+rev === w && nums(shown)[0] === w, `SOM: ${yr}/${scn} revenue ${shown}, json ${w}`);
  }
}

// 1d. Use of funds
const fundRows = blocks(/<tr data-rank="(\d+)" data-usd="(\d+)">([\s\S]*?)<\/tr>/g);
check(fundRows.length === funds.priority_order.length, `funds: ${fundRows.length} rows on the page, ${funds.priority_order.length} in json`);
for (const [, rank, usd, tr] of fundRows) {
  const f = funds.priority_order.find((x) => x.rank === +rank);
  check(f && f.usd === +usd, `funds: line ${rank} amount ${usd}`);
  if (!f) continue;
  const name = text(tr.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]);
  check(name === f.line.replace(/-/g, '–') || name === f.line, `funds: line ${rank} named "${name}", json "${f.line}"`);
  check(nums(text(tr.match(/<td class="num">([^<]+)<\/td>/)[1]))[0] === f.usd, `funds: line ${rank} shows a different amount`);
}
// 2. Sums
const fundSum = funds.priority_order.reduce((a, f) => a + f.usd, 0);
check(fundSum === 25000 && funds.total_usd === 25000, `funds: lines add up to ${fundSum}, not 25,000`);
check(/data-total="25000">\$25,000</.test(html), 'funds: total on the page is not $25,000');

const stepRows = blocks(/<tr data-step="(\w+)" data-hours="(\d+)"[^>]*>([\s\S]*?)<\/tr>/g);
for (const [, step, hours, tr] of stepRows) {
  const want = step === 'repeats' ? gpu.repeats_hours : gpu.steps.find((s) => s.step === +step)?.hours;
  check(+hours === want, `GPU: step ${step} hours ${hours}, json ${want}`);
  check(nums(text(tr.match(/<td class="num">([^<]+)<\/td>/)[1]))[0] === want, `GPU: step ${step} shows a different number`);
  if (step !== 'repeats') {
    const s = gpu.steps.find((x) => x.step === +step);
    check(text(tr.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]) === s.name, `GPU: step ${step} name`);
    check(text(tr.match(/<\/th><td>([\s\S]*?)<\/td>/)[1]) === s.detail, `GPU: step ${step} detail`);
  }
}
check(stepRows.length === gpu.steps.length + 1, 'GPU: steps on the page differ from json');
const stepSum = gpu.steps.reduce((a, s) => a + s.hours, 0);
check(stepSum === gpu.core_hours, `GPU: steps add up to ${stepSum}, core_hours ${gpu.core_hours}`);
check(stepSum + gpu.repeats_hours === gpu.total_hours, `GPU: steps + repeats = ${stepSum + gpu.repeats_hours}, total ${gpu.total_hours}`);
check(new RegExp(`data-total-hours="${gpu.total_hours}">${gpu.total_hours.toLocaleString('en-US')}<`).test(html), 'GPU: total hours on the page');
for (const g of gpu.goals) check(html.includes(`<h4>${g.name}</h4>`) && html.includes(g.target) && html.includes(g.effect), `GPU: goal "${g.name}" not on the page as written`);

// 3. Every source link in content section 15 is on the page
const hrefs = new Set(blocks(/\bhref="([^"]+)"/g).map((m) => m[1].replace(/&amp;/g, '&')));
const sec15 = md.slice(md.indexOf('## 15.'), md.indexOf('## 16.'));
const sources = [...new Set(blocks(/https?:\/\/[^\s)]+/g, sec15).map((m) => m[0]))];
check(sources.length > 30, `content: only ${sources.length} source links found in section 15`);
for (const s of sources) check(hrefs.has(s), `sources: ${s} is not on the page`);

// 4. No requests to other sites
const allowed = new Set([...sources, 'https://linusip.github.io/localLabs/', 'https://t.me/localSpace_discussion']);
for (const [, attr, url] of blocks(/\b(src|href)="([^"]+)"/g)) {
  const u = url.replace(/&amp;/g, '&');
  if (u.startsWith('mailto:') || u.startsWith('#')) continue;
  if (/^(https?:)?\/\//.test(u)) {
    check(attr === 'href' && allowed.has(u), `external ${attr}: ${u}`);
    continue;
  }
  check(fs.existsSync(path.join(root, u.split(/[?#]/)[0])), `missing local file: ${u}`);
}
const css = read('styles.css'), js = read('app.js');
check(!/url\(\s*['"]?(https?:)?\/\//.test(css) && !/@import/.test(css), 'styles.css loads something from another site');
check(!/(fetch|import)\s*\(\s*['"`](https?:)?\/\//.test(js) && !/XMLHttpRequest|sendBeacon|WebSocket|document\.cookie|localStorage/.test(js), 'app.js talks to another site or stores something');
for (const f of ['404.html']) for (const [, attr, url] of blocks(/\b(src|href)="([^"]+)"/g, read(f))) check(!/^(https?:)?\/\//.test(url), `${f}: external ${attr} ${url}`);

// 5. Images
for (const [tag] of blocks(/<img\b[^>]*>/g)) {
  const alt = tag.match(/\balt="([^"]*)"/);
  check(alt && alt[1].trim(), `image without alt text: ${tag}`);
  check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `image without width/height: ${tag}`);
}
for (const f of fs.readdirSync(path.join(root, 'assets/img'))) {
  const kb = fs.statSync(path.join(root, 'assets/img', f)).size / 1024;
  check(kb <= 200, `assets/img/${f} is ${kb.toFixed(0)} KB, over 200 KB`);
}

// Footer date matches the content file
const updated = md.match(/Last updated: ([^.\n]+)/)[1];
check(html.includes(`Last updated: <time datetime="`) && html.includes(`>${updated}</time>`), `footer date differs from content ("${updated}")`);

if (fails.length) {
  console.error(`FAILED ${fails.length} of ${fails.length + passes} checks:`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`All ${passes} checks passed.`);
