// DAISY templates — renders a post into poster HTML. No UI dependencies.
// API: RATIOS, renderPost(post, ratioKey) -> [{ html, name, W, H, cls }], fit(cv)
// Design (v5): header · bold pills · big headline · rounded red/ink/white cards · people with clear photos · footer.
// No dot grid, no decorative flowers, no mono, no 01/02 numbering, no shadows or gradients.
// A template returns [{ v, html, side }]: v = layout variant class, html = body, side = the people/list column.
// Portrait: side is dropped into html at <!--SIDE-->. Landscape: side becomes the right-hand column.

// [W, H, class] — laid out at W×H, exported at pixelRatio 2
const RATIOS = {
  '4:5':    [1080, 1350, 'r45'],
  '1:1':    [1080, 1080, 'r11'],
  '1.91:1': [1200, 630,  'r191'],
  '16:9':   [1200, 675,  'r169'],
  '3:2':    [1200, 800,  'r32'],
};

const T = {
  accepted: 'Paper accepted', papers: n => `${n} papers accepted`,
  advisor: 'Advisor', welcomeP: 'Welcome',
  welcome: n => n > 1 ? `Welcome to our ${n} new members` : 'Welcome to our new member',
  areas: 'Research areas', req: 'Requirements', apply: 'Apply at', deadline: 'Deadline', recruiting: "We're recruiting",
  congrats: 'Congratulations', speaker: 'Speaker', seminar: 'Seminar',
  lab: 'Data and Intelligent Systems Lab', locale: 'en-US',
};

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// ponytail: legacy *word* syntax just loses its asterisks (house rule: no styled accent word)
const rich = s => esc(String(s ?? '').replace(/\*(.+?)\*/g, '$1'));
const PRESET_MEMBERS = (window.DAISY_PRESET || {}).members || {};
const who = x => typeof x === 'string'
  ? (PRESET_MEMBERS[x] ? { id: x, ...PRESET_MEMBERS[x] } : { name: x })
  : (x || { name: '' });
const photo = p => p.photo || (p.id ? `assets/members/${p.id}.jpg` : '');
const initial = n => ((n || '?').split(/\s+/).filter(w => !w.includes('.')).pop() || '?')[0].toUpperCase();
// split evenly: 5 items / max 4 -> 3+2, not 4+1
const chunk = (a, max) => { const pages = Math.ceil(a.length / max) || 1, n = Math.ceil(a.length / pages), out = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out.length ? out : [[]]; };
const names = (arr = []) => arr.map(who).map(p => esc(p.name)).join(', ');
const join = (...xs) => xs.filter(Boolean).join(' · ');
const pills = (...xs) => `<div class="pills">${xs.filter(Boolean).map(([t, c]) => `<span class="pill ${c || ''}">${t}</span>`).join('')}</div>`;

// Daisy flower SVG — only for the UI icon and the fallback wordmark, never as decoration on posters
const daisy = (petal = 'var(--red)', center = '#fff', n = 16) => {
  let e = '';
  for (let i = 0; i < n; i++) e += `<ellipse cx="50" cy="22" rx="7" ry="20.5" transform="rotate(${(i * 360 / n).toFixed(1)} 50 50)"/>`;
  return `<svg viewBox="0 0 100 100"><g style="fill:${petal}">${e}</g><circle cx="50" cy="50" r="11" style="fill:${center}"/></svg>`;
};

// ---------- research glyphs: one object per field, drawn in flat tone steps ----------
// One language: filled shapes in two tones of the card colour (.h = lit/half, default = shade/full), .g = cut in the
// card's own ground colour, .b = 11-unit band, .d = 5-unit detail band, round caps. Three levels: body, parts, small marks.
// helpers live inside the IIFE: index.html has its own globals (P, h, $…) and classic scripts share one scope
const GLYPHS = (() => {
const C = (cx, cy, r, c = '') => `<circle cx="${cx}" cy="${cy}" r="${r}"${c && ` class="${c}"`}/>`;
const B = (d, c = '') => `<path d="${d}" class="b ${c}"/>`;
const D = (d, c = '') => `<path d="${d}" class="d ${c}"/>`;
const P = (d, c = '') => `<path d="${d}"${c && ` class="${c}"`}/>`;
return {
  // Bloch sphere: lit sphere, shadow crescent, equator and state vector cut in the ground
  quantum: () => C(100, 100, 80, 'h') + P('M146.9 35.2A80 80 0 1 1 35.2 146.9A80 80 0 0 0 146.9 35.2Z')
    + `<ellipse cx="100" cy="100" rx="80" ry="22" class="d g"/>` + D('M100 100L146 50', 'g') + C(146, 50, 10, 'g') + C(100, 100, 7, 'g')
    + D('M100 2V12') + D('M100 188V198'),
  // double helix: back strand half, rungs, front strand full (over/under crossings)
  bio: () => {
    const x = (y, k) => 100 + k * 50 * Math.sin(y / 28), seg = { a: [[], []], b: [[], []] };
    let rungs = '';
    for (let y = -10; y <= 210; y += 4) for (const [k, n] of [[1, 'a'], [-1, 'b']]) seg[n][k * Math.cos(y / 28) > 0 ? 0 : 1].push([x(y, k), y]);
    for (let y = 6; y <= 200; y += 16) rungs += D(`M${x(y, 1).toFixed(1)} ${y}H${x(y, -1).toFixed(1)}`, 'h') + C(100, y, 3, 'g');
    // split a strand into continuous runs so front/back pieces don't join across gaps
    const runs = pts => { const out = []; let cur = []; pts.forEach((p, i) => { if (i && p[1] - pts[i - 1][1] > 4) { out.push(cur); cur = []; } cur.push(p); }); out.push(cur); return out.filter(r => r.length > 1); };
    const path = pts => runs(pts).map(r => B('M' + r.map(([a, b]) => `${a.toFixed(1)} ${b}`).join('L'), 'w')).join('');
    return path(seg.a[1]).replace(/class="b /g, 'class="b h ') + path(seg.b[1]).replace(/class="b /g, 'class="b h ') + rungs + path(seg.a[0]) + path(seg.b[0]);
  },
  // medicine: a two-tone capsule (shade half / lit half), a scored tablet, granules
  health: () => `<g transform="rotate(-40 100 100)"><path d="M100 64H58A36 36 0 0 0 58 136H100Z"/><path d="M100 64H142A36 36 0 0 1 142 136H100Z" class="h"/></g>`
    + D('M58 84L80 66', 'g') + C(150, 156, 30) + D('M129 135L171 177', 'g') + C(60, 160, 6, 'h') + C(80, 178, 4, 'h') + C(44, 182, 4, 'h'),
  // a recording: mirrored waveform bars, loud burst full, quiet bars half, a playhead
  signal: () => [10, 18, 34, 22, 52, 84, 128, 96, 146, 70, 40, 56, 24, 30, 12].map((h, i) => B(`M${16 + i * 12} ${100 - h / 2}V${100 + h / 2}`, h > 60 ? '' : 'h')).join('')
    + D('M124 20V180', 'g') + C(124, 20, 8, 'g'),
  // shield: shade half, lit half, keyhole and rivets cut in the ground
  security: () => P('M100 12L172 38V94C172 140 142 170 100 190C58 170 28 140 28 94V38Z') + P('M100 12L28 38V94C28 140 58 170 100 190Z', 'h')
    + C(100, 88, 16, 'g') + P('M92 98L86 140H114L108 98Z', 'g')
    + [[100, 26], [56, 44], [144, 44], [42, 96], [158, 96]].map(([a, b]) => C(a, b, 4, 'g')).join(''),
  // chip: body, pins on four sides, lit die, core with bond pads, pin-1 mark
  system: () => [58, 79, 100, 121, 142].map(v => B(`M${v} 14V36`, 'h') + B(`M${v} 164V186`, 'h') + B(`M14 ${v}H36`, 'h') + B(`M164 ${v}H186`, 'h')).join('')
    + `<rect x="36" y="36" width="128" height="128" rx="16"/><rect x="62" y="62" width="76" height="76" rx="8" class="h"/><rect x="82" y="82" width="36" height="36" rx="4"/>`
    + [[90, 90], [110, 90], [90, 110], [110, 110]].map(([a, b]) => C(a, b, 3.5, 'g')).join('') + C(52, 52, 6, 'g'),
  // globe with links: shaded globe, lit hemisphere, graticule cut in the ground, arcs out to nodes
  network: () => C(86, 114, 70) + P('M86 44A70 70 0 0 0 86 184A40 70 0 0 1 86 44Z', 'h')
    + `<ellipse cx="86" cy="114" rx="34" ry="70" class="d g"/>` + D('M86 44V184M16 114H156M24 80H148M24 148H148', 'g')
    + B('M126 58Q146 24 172 26') + B('M152 100Q174 86 182 106') + C(172, 26, 13) + C(182, 106, 13) + C(168, 22, 5, 'h') + C(178, 102, 5, 'h'),
  // database: three stacked cylinders, lit tops, ground cuts between them, status lights
  data: () => [136, 88, 40].map(t => P(`M36 ${t}V${t + 34}A64 16 0 0 0 164 ${t + 34}V${t}Z`) + D(`M36 ${t + 34}A64 16 0 0 0 164 ${t + 34}`, 'g')
    + `<ellipse cx="100" cy="${t}" rx="64" ry="16" class="h"/>` + C(140, t + 24, 4, 'g') + C(126, t + 26, 4, 'g')).join(''),
  // layered neural net: links half, one path full, nodes with a lit spot
  ai: () => {
    const L = [[[36, 56], [36, 100], [36, 144]], [[100, 36], [100, 78], [100, 122], [100, 164]], [[164, 76], [164, 124]]];
    const hot = [[0, 1], [1, 2], [2, 0]];
    let links = '';
    for (let l = 0; l < 2; l++) for (const [a, b] of L[l]) for (const [c, e] of L[l + 1]) links += D(`M${a} ${b}L${c} ${e}`, 'h');
    const path = D(`M${L[0][1].join(' ')}L${L[1][2].join(' ')}L${L[2][0].join(' ')}`);
    return links + path + L.flat().map(([a, b]) => C(a, b, 15) + C(a - 4, b - 4, 6, 'h')).join('');
  },
};
})();
// Keywords per topic, matched at the start of a word (add \b for a whole word). Order = tie-break: specific fields first.
// Field petals (quantum…security) count double: a title's field beats the generic method words (graph, routing, learning).
const TOPICS = [
  ['quantum', 2, ['quantum', 'qubit', 'ghz', 'entangl', 'teleport', 'qkd', 'superposition', 'qaoa', 'vqe']],
  ['bio', 2, ['gene', 'genom', 'dna', 'rna', 'protein', 'bio', 'als\\b', 'transcript', 'omics', 'cell\\b', 'cells\\b', 'molecul', 'drug', 'mutation', 'enzyme', 'neuron']],
  ['health', 2, ['health', 'medic', 'clinic', 'patient', 'disease', 'diagnos', 'cardi', 'heart', 'ecg', 'hospital', 'mental', 'sleep', 'cancer', 'tumor', 'covid', 'alzheimer', 'parkinson', 'depression', 'fitness', 'wearable']],
  ['signal', 2, ['signal', 'eeg', 'emg', 'bci\\b', 'brain-computer', 'audio', 'speech', 'sound', 'acoustic', 'radar', 'spectrum', 'spectral', 'frequency', 'fourier', 'wavelet', 'time.?series', 'vibration']],
  ['security', 2, ['secur', 'privacy', 'private', 'intrusion', 'attack', 'malware', 'adversar', 'encrypt', 'crypt', 'blockchain', 'threat', 'phishing', 'cyber', 'authenticat', 'fraud', 'anomal', 'ddos', 'vulnerab', 'forensic', 'watermark']],
  ['system', 1, ['iot\\b', 'internet of things', 'edge\\b', 'embedded', 'fpga', 'control', 'robot', 'uav', 'drone', 'vehicle', 'autonomous', 'cloud', 'schedul', 'pipeline', 'architecture', 'hardware', 'smart home', 'smart city', 'digital twin', 'cyber-physical', 'sensor']],
  ['network', 1, ['network', 'graph', 'gnn', 'routing', 'wireless', '5g\\b', '6g\\b', 'sdn\\b', 'multicast', 'topology', 'social', 'link prediction', 'satellite', 'traffic', 'communicat', 'telecom', 'mimo', 'beamform', 'mesh', 'p2p', 'peer-to-peer']],
  ['data', 1, ['data', 'database', 'big data', 'mining', 'analytic', 'nlp\\b', 'language', 'text', 'document', 'retrieval', 'rag\\b', 'search', 'recommend', 'question answering', 'summari', 'translat', 'sentiment', 'tabular', 'sql', 'ocr\\b']],
  ['ai', 1, ['ai\\b', 'artificial intelligence', 'intelligen', 'deep learning', 'machine learning', 'learning', 'neural', 'transformer', 'llm', 'gpt', 'bert\\b', 'generative', 'gans?\\b', 'diffusion', 'vision', 'image', 'video', 'classif', 'reinforcement', 'agent', 'augment', 'attention', 'cnn', 'lstm', 'multimodal', 'foundation model']],
].map(([k, wt, ws]) => [k, wt, ws.map(w => new RegExp(`\\b${w}`))]);
// ponytail: keyword scoring (weighted distinct hits, ties by TOPICS order, nothing → ai); a per-post topic field if titles mislead
const topic = text => {
  const s = String(text || '').toLowerCase().replace(/neural networks?/g, 'neural');
  let best = 'ai', top = 0;
  for (const [k, wt, res] of TOPICS) { const n = wt * res.filter(r => r.test(s)).length; if (n > top) { best = k; top = n; } }
  return best;
};
// wrapped in a clipping layer so the deliberate crop does not count as overflow in fit()
const glyph = kind => `<span class="gw"><svg class="glyph" viewBox="0 0 200 200" aria-hidden="true">${GLYPHS[kind]()}</svg></span>`;

// ---------- people ----------
const av = p => `<div class="av"><span>${esc(initial(p.name))}</span>${photo(p) ? `<img src="${esc(photo(p))}" alt="" onerror="this.remove()">` : ''}</div>`;
const roleLine = ({ p, adv }) => esc(adv ? join(p.role, T.advisor) : p.role);
const crewList = (authors = [], advisors = []) => [...authors.map(a => ({ p: who(a) })), ...advisors.map(a => ({ p: who(a), adv: true }))];
const fig = (x, sub = roleLine) => `<figure class="person">${av(x.p)}<figcaption><b>${esc(x.p.name)}</b><span>${sub(x)}</span></figcaption></figure>`;
// dark card of people (portrait ≤2 people next to the main card; landscape right column)
const crewCard = (list, sub) => `<div class="card ink crew" data-n="${list.length}">${list.map(x => fig(x, sub)).join('')}</div>`;
// row of white person cards (portrait ≥3 people, welcome grid)
const pplRow = (list, sub, cols) => `<div class="ppl" data-n="${list.length}" style="--cols:${cols || Math.min(list.length, 4) || 1}">${list.map(x => `<div class="card white pcard">${fig(x, sub)}</div>`).join('')}</div>`;
// portrait: ≤2 people sit beside the main card, ≥3 get their own row; landscape: always the right column
const placePeople = (list, ctx, sub) => ctx.land ? { beside: '', below: '', side: crewCard(list, sub) }
  : list.length <= 2 ? { beside: crewCard(list, sub), below: '', side: '' }
  : { beside: '', below: pplRow(list, sub), side: '' };

// at least 2 columns, so 1 and 2 people get the same photo size; photos only shrink from 3 people (landscape is always 2 columns)
const chipVars = n => `--c:${Math.max(2, Math.min(n, 4))}`;

// ---------- templates ----------
const TPL = {
  paper(p, ctx) {
    const v = p.venue || {}, list = p.papers || [];
    if (list.length === 1) {
      const pp = list[0], short = v.short || pp.venue || '', crew = crewList(pp.authors, pp.advisors);
      const pl = placePeople(crew, ctx), wide = !ctx.land && crew.length > 2;
      const len = Math.max(4, wide ? `${short} ${v.year || ''}`.trim().length : Math.max(...[short, v.year].filter(Boolean).map(x => String(x).length)));
      const venue = `<div class="card red venue end${wide ? ' wide' : ''}">${glyph(topic(pp.title))}
          <h2 class="vname" style="--len:${len}">${esc(short)}${v.year ? `${wide ? ' ' : '<br>'}<span>${esc(v.year)}</span>` : ''}</h2>
          ${v.full ? `<p class="vfull">${esc(v.full)}</p>` : ''}</div>`;
      return [{ v: `paper-solo${wide ? ' wide' : ''}`, side: pl.side, html: `
        ${pills([T.accepted], v.note && [esc(v.note), 'red'])}
        <h1 class="h1">${rich(pp.title)}</h1>
        <div class="main">${venue}${pl.beside}</div>${pl.below}` }];
    }
    const vname = [v.short, v.year].filter(Boolean).join(' ');
    return chunk(list, p.split ? (ctx.land || ctx.key === '1:1' ? 2 : 3) : 4).map(ch => {
      const cards = `<div class="plist" data-n="${ch.length}">${ch.map(pp => `
        <div class="card white pitem">${glyph(topic(pp.title))}
          <p class="ptitle">${rich(pp.title)}</p>
          ${pp.venue ? `<p class="pvenue">${esc(pp.venue)}</p>` : ''}
          <div class="chips" style="${chipVars(crewList(pp.authors, pp.advisors).length)}">${crewList(pp.authors, pp.advisors).map(x =>
            `<span class="chip">${av(x.p)}<span><b>${esc(x.p.name)}</b>${x.adv ? `<i>${T.advisor}</i>` : ''}</span></span>`).join('')}</div>
        </div>`).join('')}</div>`;
      return { v: 'paper-multi', side: ctx.land ? cards : '', html: `
        ${pills([T.papers(list.length)], v.note && [esc(v.note), 'red'])}
        ${vname ? `<h1 class="h1 big">${esc(vname)}</h1>` : ''}
        ${v.full ? `<p class="sub">${esc(v.full)}</p>` : ''}
        ${ctx.land ? `<div class="card red mark end">${glyph(topic(list.map(x => x.title).join(' ')))}<p class="day">${list.length}</p><p class="lead">papers accepted</p></div>` : cards}` };
    });
  },

  welcome(p, ctx) {
    const all = p.members || [];
    const sub = ({ p: m }) => join(esc(m.role), esc(m.interest));
    return chunk(all, ctx.land ? 4 : 6).map(ch => {
      const n = ch.length, cols = ctx.land ? (n <= 2 ? n : 2) : (n <= 3 ? n : n === 4 ? 2 : 3);
      const grid = pplRow(ch.map(m => ({ p: who(m) })), sub, cols);
      return { v: 'welcome', side: ctx.land ? grid : '', html: `
        ${pills([T.welcomeP], p.term && [esc(p.term), 'red'])}
        <h1 class="h1">${rich(p.title) || esc(T.welcome(all.length))}</h1>
        ${p.subtitle ? `<p class="sub">${rich(p.subtitle)}</p>` : ''}
        ${ctx.land ? `<div class="card ink mark end">${glyph(topic(all.map(m => who(m).interest).join(' ')))}<p class="day">${all.length}</p><p class="lead">${all.length > 1 ? 'new members' : 'new member'}</p></div>` : grid}` };
    });
  },

  event(p, ctx) {
    const d = p.date ? new Date(p.date + 'T00:00') : null;
    const f = o => d ? d.toLocaleDateString(T.locale, o) : '';
    const sp = crewList(p.speakers);
    const speaker = sp.length ? `<div class="card white speaker" data-n="${sp.length}">${sp.map(x => fig(x)).join('')}</div>` : '';
    return [{ v: 'event', side: ctx.land ? speaker : '', html: `
      ${pills([esc(p.tag || T.seminar)], p.format && [esc(p.format), 'red'])}
      <h1 class="h1">${rich(p.title)}</h1>
      ${p.desc ? `<p class="sub">${rich(p.desc)}</p>` : ''}
      <div class="main when">
        <div class="card red date end">${glyph(topic(`${p.title} ${p.desc}`))}${d ? `<p class="mon">${esc(f({ month: 'short' }))}</p><p class="day">${d.getDate()}</p><p class="small">${esc(f({ weekday: 'long' }))}, ${d.getFullYear()}</p>` : ''}</div>
        <div class="card ink info">${p.time ? `<p class="lead">${esc(p.time)}</p>` : ''}${p.place ? `<p class="small">${esc(p.place)}</p>` : ''}</div>
      </div>
      ${ctx.land ? '' : speaker}` }];
  },

  recruit(p, ctx) {
    const lists = `<div class="main lists">
        ${(p.areas || []).length ? `<div class="card white"><h2 class="lead">${T.areas}</h2><div class="tags">${p.areas.map(a => `<span>${esc(a)}</span>`).join('')}</div></div>` : ''}
        ${(p.requirements || []).length ? `<div class="card white"><h2 class="lead">${T.req}</h2><ul>${p.requirements.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>` : ''}
      </div>`;
    return [{ v: 'recruit', side: ctx.land ? lists : '', html: `
      ${pills([T.recruiting], p.term && [esc(p.term), 'red'])}
      <h1 class="h1 xl">${rich(p.headline)}</h1>
      ${p.intro ? `<p class="sub">${rich(p.intro)}</p>` : ''}
      ${ctx.land ? '' : lists}
      <div class="card red cta">${glyph(topic((p.areas || []).join(' ')))}
        ${p.contact ? `<div><p class="small">${T.apply}</p><p class="big">${esc(p.contact)}</p></div>` : ''}
        ${p.deadline ? `<div class="dl"><p class="small">${T.deadline}</p><p class="lead">${esc(p.deadline)}</p></div>` : ''}
      </div>` }];
  },

  award(p, ctx) {
    const crew = crewList(p.members, p.advisors), pl = placePeople(crew, ctx);
    return [{ v: 'award', side: pl.side, html: `
      ${pills([T.congrats, 'red'])}
      <h1 class="h1 xl redtext">${rich(p.award)}</h1>
      ${p.event ? `<p class="sub strong">${rich(p.event)}</p>` : ''}
      <div class="main">${p.project ? `<div class="card ink proj end">${glyph(topic(p.project))}<p class="stmt">“${rich(p.project)}”</p></div>` : ''}${pl.beside}</div>${pl.below}` }];
  },

  // photo frame: logos + photos + footer, no text (conference, talks, lab activities)
  // each photo: { src, x, y (focal %), z (zoom) }; old posts store bare dataURL strings
  photo(p) {
    const list = (p.photos || []).map((s, i) => ({ ...(typeof s === 'string' ? { src: s } : s), i }));
    return chunk(list, 4).map(ch => ({ v: 'photo', side: '', bleed: true,
      html: `<div class="shots" data-n="${ch.length}">${ch.map(s => `<div class="shot" data-i="${s.i}" style="--px:${+(s.x ?? 50)}%;--py:${+(s.y ?? 40)}%;--pz:${+s.z || 1}"><img src="${esc(s.src)}" alt=""></div>`).join('')}</div>` }));
  },
};

// ---------- frame ----------
const logos = () => `
    <div class="logo">${window.NO_LAB_LOGO ? '' : '<img src="assets/logo/daisy.svg" alt="DAISY" onerror="this.remove()">'}<span class="wm">${daisy('var(--red)', '#fff', 12)}DAISY</span></div>
    <div class="ptit"><img src="assets/logo/ptit.png" alt="PTIT" onerror="this.remove()"></div>`;
// photo frame: photos with a thin border, then one bar with a concave top edge (logos left, lab + url right)
const bleedShell = (pg, pageLabel) => `
  <div class="bleed">${pg.html}</div>
  <footer class="bar">
    <svg class="curve" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0C30 9 70 9 100 0V10H0Z"/></svg>
    <div class="logos">${logos()}</div>
    <div class="who"><b>${T.lab}</b><span>datalab.ptit.edu.vn${pageLabel ? ` · ${pageLabel}` : ''}</span></div>
  </footer>`;
const shell = (pg, ctx, pageLabel) => pg.bleed ? bleedShell(pg, pageLabel) : `
  <header class="hd">${logos()}
  </header>
  <main class="bd">${pg.html}</main>
  ${ctx.land && pg.side ? `<aside class="pside">${pg.side}</aside>` : ''}
  <footer class="ft"><span>datalab.ptit.edu.vn</span><span>${pageLabel ? `${pageLabel} · ` : ''}${T.lab}</span></footer>`;

// Shrink --k until the body and every card fit (long titles, many people)
function fit(cv) {
  const boxes = [...cv.querySelectorAll('.bd, .pside, .card')];
  const over = () => boxes.some(b => b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1);
  for (let k = 1; k >= 0.5; k -= 0.03) {
    cv.style.setProperty('--k', k.toFixed(2));
    if (!over()) return;
  }
}

const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '');

// Drop people rows left empty in the form (no name, no photo)
const clean = v => Array.isArray(v)
  ? v.filter(x => !(x && typeof x === 'object' && 'name' in x && !String(x.name).trim() && !x.photo)).map(clean)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)])) : v;

function renderPost(post, key) {
  post = clean(post);
  const [W, H, cls] = RATIOS[key] || RATIOS['4:5'];
  const ctx = { key, land: W / H > 1.2 };
  const tpl = TPL[post.type];
  if (!tpl) return [];
  const pages = tpl(post, ctx);
  const base = post.slug || slug(post.venue?.short || post.title || post.headline || post.award || post.papers?.[0]?.title) || post.type;
  return pages.map((pg, pi) => ({
    W, H,
    cls: `cv ${pg.v} ${cls}${ctx.land ? ' land' : ''}${ctx.land && pg.side ? ' has-side' : ''}`,
    html: shell(pg, ctx, pages.length > 1 ? `${pi + 1}/${pages.length}` : ''),
    name: `${base}${pages.length > 1 ? `-${pi + 1}` : ''}_${key.replace(':', 'x')}.png`,
  }));
}

// ---------- Facebook caption: Vietnamese block, English block, hashtags ----------
// ponytail: fixed bilingual sentences filled from the form; change the lab's voice by editing them here
const nm = (arr = []) => arr.map(who).map(p => p.name).filter(Boolean).join(', ');
const plain = s => String(s ?? '').replace(/\*(.+?)\*/g, '$1').trim();
// paragraphs: each arg is a line or a list of lines; empty lines and empty paragraphs drop out
const para = (...gs) => gs.map(g => [].concat(g).filter(Boolean).join('\n')).filter(Boolean).join('\n\n');
const bullets = (head, xs = []) => xs.length ? [head, ...xs.map(x => `• ${x}`)] : [];
const day = (s, loc, wk) => s ? new Date(s + 'T00:00').toLocaleDateString(loc, loc === 'vi-VN'
  ? { ...(wk && { weekday: 'long' }), day: '2-digit', month: '2-digit', year: 'numeric' }
  : { ...(wk && { weekday: 'long' }), month: 'long', day: 'numeric', year: 'numeric' }) : '';
const hashtag = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').replace(/[^A-Za-z0-9]/g, '');

const CAPTION = {
  paper(p) {
    const v = p.venue || {}, list = p.papers || [], venue = [v.short, v.year].filter(Boolean).join(' ');
    const at = venue ? ` tại ${venue}` : '', atEn = venue ? ` at ${venue}` : '', note = v.note ? ` (${v.note})` : '';
    const tags = v.short ? [`#${hashtag(v.short)}${hashtag(v.year)}`] : [];
    if (list.length === 1) {
      const pp = list[0], a = nm(pp.authors), ad = nm(pp.advisors), t = pp.title && `📄 "${plain(pp.title)}"`;
      return { tags,
        vi: para(`🎉 Chúc mừng! Bài báo của DAISY Lab đã được chấp nhận${at}${note}.`, [t, a && `👥 Tác giả: ${a}`, ad && `🎓 Hướng dẫn: ${ad}`, v.full && `📍 ${v.full}`]),
        en: para(`🎉 Congratulations! Our paper has been accepted${atEn}${note}.`, [t, a && `👥 Authors: ${a}`, ad && `🎓 Advisors: ${ad}`, v.full && `📍 ${v.full}`]) };
    }
    const items = list.map((pp, i) => [`${i + 1}. "${plain(pp.title)}"${pp.venue ? ` (${pp.venue})` : ''}`,
      `    👥 ${join(nm(pp.authors), nm(pp.advisors) && `🎓 ${nm(pp.advisors)}`)}`]).flat();
    return { tags,
      vi: para(`🎉 Chúc mừng! DAISY Lab có ${list.length} bài báo được chấp nhận${at}${note}.`, v.full && `📍 ${v.full}`, items),
      en: para(`🎉 Congratulations! ${list.length} DAISY Lab papers have been accepted${atEn}${note}.`, v.full && `📍 ${v.full}`, items) };
  },

  welcome(p) {
    const all = (p.members || []).map(who), n = all.length, term = p.term ? ` (${p.term})` : '';
    const list = all.map(m => `• ${join(m.name, m.role, m.interest)}`);
    return {
      vi: para(`👋 Chào mừng ${n > 1 ? `${n} thành viên mới` : 'thành viên mới'} gia nhập DAISY Lab${term}!`, list, 'Chúc các bạn có một hành trình nghiên cứu thật nhiều niềm vui và thành công!'),
      en: para(`👋 ${plain(p.title) || T.welcome(n)}${term}!`, plain(p.subtitle), list) };
  },

  event(p) {
    const sp = nm(p.speakers), many = (p.speakers || []).length > 1, head = `📢 ${[p.tag || T.seminar, plain(p.title)].filter(Boolean).join(': ')}`;
    return {
      vi: para(head, [sp && `🎤 Diễn giả: ${sp}`, p.date && `🗓 ${join(day(p.date, 'vi-VN', 1), p.time)}`, p.place && `📍 ${p.place}`, p.format && `💻 Hình thức: ${p.format}`], 'Mời các bạn quan tâm đến tham dự!'),
      en: para(head, plain(p.desc), [sp && `🎤 ${many ? 'Speakers' : 'Speaker'}: ${sp}`, p.date && `🗓 ${join(day(p.date, T.locale, 1), p.time)}`, p.place && `📍 ${p.place}`, p.format && `💻 Format: ${p.format}`], 'Everyone interested is welcome to join!') };
  },

  recruit(p) {
    const term = p.term ? ` ${p.term}` : '';
    return {
      vi: para(`🔎 DAISY Lab tuyển thành viên${term}!`, bullets('Hướng nghiên cứu:', p.areas), bullets('Yêu cầu:', p.requirements),
        [p.contact && `📝 Đăng ký: ${p.contact}`, p.deadline && `⏰ Hạn đăng ký: ${p.deadline}`]),
      en: para(`🔎 ${plain(p.headline) || T.recruiting}${p.term ? ` – ${p.term}` : ''}`, plain(p.intro), bullets(`${T.areas}:`, p.areas), bullets(`${T.req}:`, p.requirements),
        [p.contact && `📝 ${T.apply}: ${p.contact}`, p.deadline && `⏰ ${T.deadline}: ${p.deadline}`]) };
  },

  award(p) {
    const m = nm(p.members), ad = nm(p.advisors), proj = p.project && `💡 "${plain(p.project)}"`;
    return {
      vi: para(`🏆 Chúc mừng nhóm DAISY Lab đã đạt ${plain(p.award) || 'giải thưởng'}${p.event ? ` tại ${plain(p.event)}` : ''}!`, [proj, m && `👥 Thành viên: ${m}`, ad && `🎓 Hướng dẫn: ${ad}`]),
      en: para(`🏆 Congratulations to our team on winning ${plain(p.award) || 'an award'}${p.event ? ` at ${plain(p.event)}` : ''}!`, [proj, m && `👥 Team: ${m}`, ad && `🎓 Advisors: ${ad}`]) };
  },

  photo(p) {
    const where = (at, d) => `${p.what ? ` ${at} ${p.what}` : ''}${p.place ? ` – ${p.place}` : ''}${d ? `, ${d}` : ''}`;
    return {
      vi: para(`📸 Một vài khoảnh khắc của DAISY Lab${where('tại', day(p.date, 'vi-VN'))}.`),
      en: para(`📸 Some moments from DAISY Lab${where('at', day(p.date, T.locale))}.`) };
  },
};

const CAPTION_FOOT = ['---', '📍 Data and Intelligent Systems Lab (DAISY) · Học viện Công nghệ Bưu chính Viễn thông (PTIT)', '🌐 datalab.ptit.edu.vn'];

function caption(post) {
  post = clean(post);
  const c = CAPTION[post.type]?.(post);
  return c ? para(c.vi, '—', c.en, ['#DAISYLab', '#PTIT', ...(c.tags || [])].join(' '), CAPTION_FOOT) : '';
}
