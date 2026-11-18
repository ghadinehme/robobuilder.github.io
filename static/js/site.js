/* RoboBuilder project page: hero wall, counters, ticker, benchmark + leaderboard, loop flow, design-map explorer
   (canvas, sim | real detail), reality-check story, all-in-one, filmstrip, More Works, BibTeX, theme.
   Data: assets/js/data.js (built designs, all-in-one), assets/js/map.js (design map). */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const D = window.RB_DATA || { designs: [], hero: [], allin: {} };
  const MAP = window.RB_MAP || { w: 1000, h: 1000, p: [] };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
  const io = (fn, opt) => ('IntersectionObserver' in window ? new IntersectionObserver(fn, opt) : null);

  const AGK = ['opus', 'sonnet', 'astra', 'sol'];
  const AG = {
    opus: { name: 'Opus 5.5', h: 'Claude Code', logo: 'claude', c: '--opus' },
    sonnet: { name: 'Sonnet 5.5', h: 'Claude Code', logo: 'claude', c: '--sonnet' },
    astra: { name: 'GPT-6 Astra', h: 'Codex', logo: 'openai', c: '--astra' },
    sol: { name: 'GPT-6.1 Sol', h: 'Codex', logo: 'openai', c: '--sol' }
  };
  const BK = ['ramp', 'gap', 'bridge', 'rope', 'steps', 'bumps', 'seesaw', 'gapdrop', 'wall', 'uturn'];
  const BN = { ramp: 'Ramp', gap: 'Gap', bridge: 'Bridge', rope: 'Rope', steps: 'Steps', bumps: 'Bumps', seesaw: 'Seesaw', gapdrop: 'Gap-drop', wall: 'Wall', uturn: 'U-turn' };
  const BCOL = ['#6F4C9B', '#1D6996', '#38A6A5', '#0F8554', '#73AF48', '#EDAD08', '#E17C05', '#CC503E', '#94346E', '#5b6573'];
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const byId = {}; D.designs.forEach((d) => { byId[d.id] = d; });
  const logo = (a) => `<img src="./static/images/${AG[a].logo}.svg" alt="" class="${AG[a].logo === 'openai' ? 'oai' : ''}">`;

  /* ---------------- lazy video: load + play only while visible ---------------- */
  const vio = io((ents) => ents.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  }), { rootMargin: '200px 0px' });
  const mkVid = (src, poster) => {
    const v = el('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'none'; v.dataset.src = src; if (poster) v.poster = poster; v.setAttribute('aria-hidden', 'true');
    if (vio) vio.observe(v); else v.src = src;
    return v;
  };
  // real video with its simulation inset; click swaps which one is large
  const mkTile = (id, lab, real, poster) => {
    const t = el('button', 'tile'); t.type = 'button';
    const main = mkVid(real, poster);
    const pip = el('div', 'pip'); pip.appendChild(mkVid(`./assets/vid/sim/${id}.mp4`, `./assets/img/simposter/${id}.jpg`));
    t.append(main, pip, el('div', 'lab', lab), el('div', 'tag', 'real'));
    t.addEventListener('click', () => {
      const big = t.querySelector(':scope > video'), small = pip.querySelector('video');
      t.insertBefore(small, pip); pip.appendChild(big);
      t.classList.toggle('swap');
      t.querySelector('.tag').textContent = t.classList.contains('swap') ? 'simulation' : 'real';
      [big, small].forEach((v) => v.play().catch(() => {}));
    });
    return t;
  };

  /* ---------------- hero wall ---------------- */
  const wall = $('#heroWall');
  if (wall) {
    const small = window.matchMedia('(max-width: 900px)').matches;
    // hero entries: a design id, or "<id>-loop" for the loop redesign of that design
    D.hero.filter((h) => byId[h.replace(/-loop$/, '')]).slice(0, small ? 6 : 8).forEach((id) => {
      const d = byId[id.replace(/-loop$/, '')], rd = '';
      const t = mkTile(id, `<span>${BN[d.bench]} L${d.level}</span><span>${AG[d.agent].name}</span>${rd}<span class="ok">crosses</span>`,
        `./assets/vid/hero/${id}.mp4`, `./assets/img/hero/${id}.jpg`);
      t.setAttribute('aria-label', `${BN[d.bench]} level ${d.level}, ${AG[d.agent].name}${rd ? ' (redesign after a real failure)' : ''}: real run with its simulation inset. Activate to swap.`);
      wall.appendChild(t);
    });
  }

  /* ---------------- counters ---------------- */
  const fmt = (n) => n.toLocaleString('en-US');
  if (!reduce) {
    const counters = $$('.stat b[data-count]');
    counters.forEach((b) => { b.dataset.final = b.textContent; });
    setTimeout(() => counters.forEach((b) => {
      const to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now(), dur = 1400;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = fmt(Math.round(to * e)) + suf; if (k < 1) requestAnimationFrame(step); else b.textContent = b.dataset.final; };
      requestAnimationFrame(step);
    }), 250);
  }

  /* ---------------- nav + theme ---------------- */
  const nav = $('#topnav'), hero = $('.hero');
  const onScroll = () => { const past = window.scrollY > (hero ? hero.offsetHeight * 0.5 : 300); nav.classList.toggle('show', past); document.body.classList.toggle('scrolled', past); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const so = io((ents) => ents.forEach((e) => { if (e.isIntersecting) $$('#navlinks a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  if (so) $$('main section[id]').forEach((s) => so.observe(s));
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nxt);
    try { localStorage.setItem('rb-theme', nxt); } catch (e) {}
    drawMap && drawMap();
  });

  /* ---------------- ticker ---------------- */
  const TK = [
    ['98%', 'of level-1 tasks solved by agents.', 'Search baselines: 0%.', ''],
    ['48%', 'at level 3.', 'Harder obstacles break every agent.', 'bad'],
    ['0/15', 'early simulated passes crossed the real course.', 'Simulation alone is not enough.', 'bad'],
    ['66%', 'of simulated passes hold for real,', 'once the agent learns its simulator from video.', ''],
    ['93%', 'cross after agents watch their real failures and redesign.', 'Up from 73%, at levels 1 and 2.', 'ok'],
    ['6/10', 'obstacles at most for one robot built for all ten.', 'Integration is the bottleneck.', 'bad']
  ];
  const tkS = $('#tkStage'), tkN = $('#tkNum'), tkL = $('#tkLine'), tkD = $('#tkDots');
  if (tkS) {
    let cur = 0, timer = null, visible = false;
    const dots = TK.map((t, i) => { const b = el('button', '', '<i></i>'); b.type = 'button'; b.setAttribute('aria-label', `${t[0]} ${t[1]}`); b.addEventListener('click', () => { show(i); }); tkD.appendChild(b); return b; });
    const show = (i, anim) => {
      clearTimeout(timer);
      const put = () => {
        cur = i; const t = TK[i];
        tkN.textContent = t[0]; tkN.className = 'tk-num ' + t[3]; tkL.innerHTML = `${t[1]} <span>${t[2]}</span>`;
        dots.forEach((d, k) => { d.className = k === i ? 'on' : (k < i ? 'done' : ''); });
        tkS.classList.remove('out');
        if (!reduce && visible) timer = setTimeout(() => show((cur + 1) % TK.length, true), 4500);
      };
      if (anim === false || reduce) put(); else { tkS.classList.add('out'); setTimeout(put, 320); }
    };
    show(0, false);
    const o = io((ents) => ents.forEach((e) => { visible = e.isIntersecting; if (visible) show(cur, false); else clearTimeout(timer); }), { threshold: .4 });
    if (o) o.observe(tkS);
  }

  /* ---------------- benchmark: obstacles x level ---------------- */
  // per obstacle (BK order), per agent (AGK order): 1 Cross, 2 Cross+Print, 0 no pass in simulation
  const OP = { 1: [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,0,2,1]],
    2: [[0,0,0,0],[1,1,1,1],[1,1,1,1],[1,0,1,2],[1,0,1,1],[1,0,1,0],[1,1,1,1],[1,1,1,1],[1,0,2,0],[0,0,1,1]],
    3: [[2,0,2,0],[1,0,0,0],[1,1,1,1],[0,0,0,2],[1,2,0,1],[2,0,1,1],[1,0,0,0],[0,1,1,1],[0,0,0,2],[0,0,0,0]] };
  const og = $('#obstGrid');
  if (og) {
    BK.forEach((b, i) => {
      const c = el('div', 'ob');
      c.innerHTML = `<img src="./assets/img/course/${b}.webp" alt="The real ${BN[b]} course" loading="lazy" width="720" height="405"><span class="on">${BN[b]}</span><span class="ad">${AGK.map(() => '<i></i>').join('')}</span>`;
      og.appendChild(c);
    });
    const setL = (L) => {
      $$('.ob', og).forEach((c, i) => {
        const r = OP[L][i]; $$('.ad i', c).forEach((x, k) => { x.className = r[k] === 1 ? 'y' : (r[k] === 2 ? 'p' : ''); x.title = `${AG[AGK[k]].name}: ${r[k] ? (r[k] === 2 ? 'passes with a printed part' : 'passes') : 'no pass'}`; });
        c.classList.toggle('none', !r.some(Boolean));
        c.setAttribute('aria-label', `${BN[BK[i]]}, level ${L}: ${r.filter(Boolean).length} of 4 agents pass in simulation`);
      });
    };
    $('#lvlKey').innerHTML = '<span>Dots: Opus · Sonnet · Astra · Sol</span><span><i style="background:var(--ok)"></i>passes</span><span><i style="background:var(--print)"></i>with a printed part</span>';
    setL(1);
    $$('.lvl-switch button').forEach((b) => b.addEventListener('click', () => {
      $$('.lvl-switch button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      setL(+b.dataset.l);
    }));
  }

  /* ---------------- leaderboard ---------------- */
  const SIM_COLS = [
    { k: 'Sc', g: 'Overall', l: 'score /100', up: 1, bar: 1, d: 1 },
    { k: 'L1', g: 'Cross (%)', l: 'L1', up: 1 }, { k: 'L2', g: 'Cross (%)', l: 'L2', up: 1 }, { k: 'L3', g: 'Cross (%)', l: 'L3', up: 1 },
    { k: 'P', g: '+Print', l: 'all (%)', up: 1 }, { k: 'S', g: 'Sims', l: 'median', up: 0 },
    { k: 'As', g: 'All-in-one (%)', l: 'sim', up: 1 }, { k: 'Ar', g: 'All-in-one (%)', l: 'real', up: 1 },
    { k: 'Lm', g: 'Light', l: 'mass (g)', up: 0 }, { k: 'Ls', g: 'Light', l: 'score /30', up: 1, d: 1 },
    { k: 'Ft', g: 'Fast', l: 'time (s)', up: 0, d: 2 }, { k: 'Fs', g: 'Fast', l: 'score /30', up: 1, d: 1 },
    { k: 'N', g: 'Novelty', l: 'function', up: 1, d: 1 }, { k: 'V', g: 'Diversity', l: 'Vendi', up: 1, d: 1 }
  ];
  const SIM_ROWS = [
    { a: 'opus', L1: 100, L2: 80, L3: 40, P: 80, S: 8.5, As: 50, Ar: 60, Lm: 255, Ls: 22.6, Ft: 1.22, Fs: 27.1, Sc: 73.9, N: 9.3, V: 11.7 },
    { a: 'astra', L1: 90, L2: 80, L3: 30, P: 77, S: 10.5, As: 60, Ar: 50, Lm: 324, Ls: 18.1, Ft: 3.65, Fs: 10.1, Sc: 57.6, N: 9.3, V: 10.2 },
    { a: 'sol', L1: 100, L2: 60, L3: 40, P: 77, S: 10, As: 50, Ar: 60, Lm: 320, Ls: 18.5, Ft: 3.14, Fs: 9.6, Sc: 55.1, N: 8.8, V: 9.5 },
    { a: 'sonnet', L1: 90, L2: 40, L3: 20, P: 53, S: 12, As: 30, Ar: 20, Lm: 283, Ls: 17.2, Ft: 2.19, Fs: 11.0, Sc: 44.3, N: 8.1, V: 8.2 },
    { base: 'Single LLM call (Opus 5.5)', sub: 'no simulator', L1: 20, L2: 0, L3: 0, P: 7, As: 0, Ls: 0, Fs: 0, Sc: 1.7 },
    { base: 'Full-inventory search', sub: 'random search + GA', L1: 0, L2: 0, L3: 0, P: 0, Sc: 0, N: 1.0, V: 3.4 }
  ];
  const RG = 'Simulated passes that cross for real (%)';
  const REAL_COLS = [
    { k: 'r1', g: RG, l: 'L1', up: 1 }, { k: 'r2', g: RG, l: 'L2', up: 1 }, { k: 'r3', g: RG, l: 'L3', up: 1 }, { k: 'ra', g: RG, l: 'all', up: 1 },
    { k: 'lb', g: 'Hardware loop, L1+L2 (%)', l: 'before', up: 1 }, { k: 'la', g: 'Hardware loop, L1+L2 (%)', l: 'after', up: 1 },
    { k: 'ar', g: 'All-in-one', l: 'real (%)', up: 1 }
  ];
  const pct = (a, b) => Math.round(100 * a / b);
  const REAL_ROWS = [
    { a: 'opus', r1: pct(8, 10), r2: pct(4, 8), r3: pct(3, 6), ra: pct(15, 24), lb: 67, la: 83, ar: 60 },
    { a: 'sonnet', r1: pct(7, 9), r2: pct(3, 4), r3: pct(1, 3), ra: pct(11, 16), lb: 77, la: 100, ar: 20 },
    { a: 'astra', r1: pct(8, 10), r2: pct(7, 9), r3: pct(2, 4), ra: pct(17, 23), lb: 79, la: 100, ar: 50 },
    { a: 'sol', r1: pct(7, 10), r2: pct(5, 7), r3: pct(2, 6), ra: pct(14, 23), lb: 71, la: 88, ar: 60 }
  ];
  const lb = $('#lb'), lbCap = $('#lbCap');
  let view = 'sim', sortK = 'Sc', sortUp = 1, showBase = true;
  const heat = (t) => {
    const R = [220, 80, 80], Y = [242, 199, 68], G = [80, 170, 100];
    const m = (a, b, k) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
    const c = t < .5 ? m(R, Y, t * 2) : m(Y, G, (t - .5) * 2);
    return `rgba(${c[0]},${c[1]},${c[2]},.32)`;
  };
  const drawLB = () => {
    const cols = view === 'sim' ? SIM_COLS : REAL_COLS;
    if (!cols.find((c) => c.k === sortK)) { sortK = view === 'sim' ? 'Sc' : 'la'; sortUp = 1; }
    const col = cols.find((c) => c.k === sortK);
    const agentRows = (view === 'sim' ? SIM_ROWS : REAL_ROWS).filter((r) => r.a);
    agentRows.sort((x, y) => ((y[sortK] - x[sortK]) * (col.up ? 1 : -1) * sortUp) || ((y.Sc || y.la) - (x.Sc || x.la)));
    const rows = agentRows.concat(view === 'sim' && showBase ? SIM_ROWS.filter((r) => r.base) : []);
    const rng = {};
    cols.forEach((c) => { const v = agentRows.map((r) => r[c.k]).filter((x) => x != null); rng[c.k] = [Math.min(...v), Math.max(...v)]; });
    let h = '<thead><tr class="grp"><th rowspan="2">Agent</th>';
    const groups = []; cols.forEach((c) => { const g = groups[groups.length - 1]; if (g && g.g === c.g) g.n++; else groups.push({ g: c.g, n: 1 }); });
    groups.forEach((g) => { h += `<th colspan="${g.n}" class="gstart">${g.g}</th>`; });
    h += '</tr><tr>';
    let prevG = null;
    cols.forEach((c) => {
      const s = c.k === sortK;
      h += `<th class="sortable${s ? ' sorted' : ''}${c.g !== prevG ? ' gstart' : ''}" data-k="${c.k}" tabindex="0" aria-sort="${s ? (sortUp > 0 ? 'descending' : 'ascending') : 'none'}" title="${c.up ? 'higher' : 'lower'} is better; click to sort">${c.l} ${c.up ? '&uarr;' : '&darr;'}${s ? '<span class="arr">&#9660;</span>' : ''}</th>`;
      prevG = c.g;
    });
    h += '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      const isA = !!r.a;
      h += `<tr class="${isA ? 'agentrow' : 'base'}">`;
      h += isA ? `<td class="m"><span class="rank">${i + 1}</span>${logo(r.a)}<span>${AG[r.a].name}<small>${AG[r.a].h}</small></span></td>`
        : `<td class="m"><span class="rank"></span><span>${r.base}<small>${r.sub}</small></span></td>`;
      prevG = null;
      cols.forEach((c) => {
        const v = r[c.k]; const gs = c.g !== prevG ? ' gstart' : ''; prevG = c.g;
        if (v == null) { h += `<td class="${gs}">&ndash;</td>`; return; }
        const [lo, hi] = rng[c.k]; let t = hi > lo ? (v - lo) / (hi - lo) : 1; if (!c.up) t = 1 - t;
        const best = isA && t === 1, txt = c.d ? v.toFixed(c.d) : v, bg = isA ? heat(t) : 'transparent';
        h += c.bar ? `<td class="${gs}"><span class="score"><i style="width:${Math.max(2, v * 0.7)}px"></i><span class="cell${best ? ' best' : ''}" style="background:${bg}">${txt}</span></span></td>`
          : `<td class="${gs}"><span class="cell${best ? ' best' : ''}" style="background:${bg}">${txt}</span></td>`;
      });
      h += '</tr>';
    });
    lb.innerHTML = h + '</tbody>';
    $$('th.sortable', lb).forEach((th) => {
      const f = () => { const k = th.dataset.k; if (k === sortK) sortUp = -sortUp; else { sortK = k; sortUp = 1; } drawLB(); };
      th.addEventListener('click', f); th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
    });
    lbCap.innerHTML = view === 'sim'
      ? '<b>Agents pass most tasks and invent; search over the full inventory passes nothing.</b> Light/Fast: mean over shared level-1 tasks and score against the best entrant (of 30). Novelty: distance from the search baselines\' designs in function space (search &asymp; 1). Diversity: effective number of distinct designs among 100. Opus 5.5 leads under every aggregation, but bootstrap intervals over obstacles overlap. Click a column to sort.'
      : '<b>Every agent loses designs to reality, and the hardware loop wins most of them back.</b> A design crosses for real if one of up to three filmed tries reaches the goal.';
  };
  if (lb) {
    drawLB();
    $$('.lb-tabs button').forEach((b) => b.addEventListener('click', () => {
      $$('.lb-tabs button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      view = b.dataset.v; $('#lbBase').parentElement.style.visibility = view === 'sim' ? 'visible' : 'hidden'; drawLB();
    }));
    $('#lbBase').addEventListener('change', (e) => { showBase = e.target.checked; drawLB(); });
  }

  /* ---------------- loop flow ---------------- */
  const FLOW = [
    ['Design', 'The agent writes parts, joints and a timed motor program.', './assets/img/robots/bumps-l2-opus.webp', '', '', true],
    ['Simulate', 'It iterates in a simulator it learned from real videos.', './assets/img/simposter/bumps-l2-opus.jpg', 'crosses in sim', 'sim'],
    ['Build &amp; run', 'We build every pass by hand and test it on the course with the same program.', './assets/img/poster/bumps-l2-opus.jpg', 'fails', 'bad'],
    ['Watch &amp; redesign', 'Shown the video, the agent fixes its simulator and the robot.', './assets/img/simposter/bumps-l2-opus-loop.jpg', 'redesign', 'sim'],
    ['Build again', 'The redesign is built and run again.', './assets/img/loop/bumps-l2-opus-real.jpg', 'crosses', 'ok']
  ];
  const flow = $('#flow');
  if (flow) {
    FLOW.forEach(([t, p, img, st, sc, contain], i) => {
      const f = el('div', 'fl');
      f.innerHTML = `<div class="fi"><img src="${img}" alt="" loading="lazy" class="${contain ? 'contain' : ''}">${st ? `<span class="st ${sc}">${st}</span>` : ''}</div>
        <div class="fn">0${i + 1}</div><h3>${t}</h3><p>${p}</p>${i === 2 ? '<span class="vid">video &rarr;</span>' : ''}`;
      flow.appendChild(f);
    });
    let k = 0, tm = null;
    const step = () => { $$('.fl', flow).forEach((f, i) => f.classList.toggle('on', i === k)); k = (k + 1) % FLOW.length; };
    step();
    const o = io((ents) => ents.forEach((e) => { clearInterval(tm); if (e.isIntersecting && !reduce) tm = setInterval(step, 1800); }), { threshold: .3 });
    if (o) o.observe(flow);
  }

  /* ---------------- explorer: design map + detail ---------------- */
  const cv = $('#mapCanvas');
  let drawMap = null;
  if (cv && MAP.p.length) {
    const P = MAP.p; // [x, y, bench, agent, simPassed, level, allInOne, builtId]
    const built = new Map(); P.forEach((p, i) => { if (p[7]) built.set(p[7], i); });
    const LBL = BK.map((_, bi) => { const g = {}, n = 16; let best = null, bn = 0;
      P.forEach((p) => { if (p[2] !== bi) return; const k = Math.floor(p[0] / MAP.w * n * .999) + ',' + Math.floor(p[1] / MAP.h * n * .999); g[k] = (g[k] || []); g[k].push(p); if (g[k].length > bn) { bn = g[k].length; best = k; } });
      const q = g[best]; return [bi, q.reduce((s, p) => s + p[0], 0) / q.length, q.reduce((s, p) => s + p[1], 0) / q.length - 22]; });
    const F = { bench: 'all', level: 'all', agent: 'all', built: 'all' };
    let colorBy = 'bench', sel = -1, hov = -1;
    let W = 0, H = 0, dpr = 1, base = { s: 1, ox: 0, oy: 0 }, v = { s: 1, x: 0, y: 0 };
    const match = (p) => (F.bench === 'all' || BK[p[2]] === F.bench) && (F.level === 'all' || p[5] === +F.level) &&
      (F.agent === 'all' || AGK[p[3]] === F.agent) &&
      (F.built === 'all' || (p[7] && (F.built === 'built' || (F.built === 'cross') === !!(byId[p[7]] || {}).crosses)));
    const fit = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const pad = 14, s = Math.min((W - 2 * pad) / MAP.w, (H - 2 * pad - 30) / MAP.h);
      base = { s, ox: (W - MAP.w * s) / 2, oy: (H - 30 - MAP.h * s) / 2 };
    };
    const sx = (p) => (base.ox + p[0] * base.s) * v.s + v.x, sy = (p) => (base.oy + p[1] * base.s) * v.s + v.y;
    const colOf = (p, pal) => colorBy === 'agent' ? pal.ag[p[3]] : colorBy === 'bench' ? BCOL[p[2]] : (p[4] ? pal.ok : pal.bad);
    drawMap = () => {
      if (!W) return;
      const c = cv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      const pal = { ag: AGK.map((a) => css(AG[a].c)), ok: css('--ok'), bad: css('--bad'), ink: css('--ink'), card: css('--card'), pr: css('--print') };
      const rad = Math.min(5.5, 2.5 * Math.pow(v.s, .45));
      const any = Object.values(F).some((x) => x !== 'all');
      c.globalAlpha = any ? .07 : .75;
      for (let i = 0; i < P.length; i++) { const p = P[i]; if (any && match(p)) continue; c.fillStyle = colOf(p, pal); c.beginPath(); c.arc(sx(p), sy(p), rad, 0, 6.2832); c.fill(); }
      if (any) { c.globalAlpha = .9; for (let i = 0; i < P.length; i++) { const p = P[i]; if (!match(p)) continue; c.fillStyle = colOf(p, pal); c.beginPath(); c.arc(sx(p), sy(p), rad + .4, 0, 6.2832); c.fill(); } }
      c.globalAlpha = 1; c.lineWidth = 1.6;
      built.forEach((i) => { const p = P[i]; if (any && !match(p)) return; c.fillStyle = colOf(p, pal); c.strokeStyle = pal.ink; c.beginPath(); c.arc(sx(p), sy(p), rad + 2.4, 0, 6.2832); c.fill(); c.stroke(); });
      // obstacle labels at each obstacle's densest map cell
      c.font = (W < 500 ? '600 9px' : '600 11px') + ' Inter, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      LBL.forEach(([bi, lx, ly]) => { if (F.bench !== 'all' && BK[bi] !== F.bench) return; const p = [lx, ly], x = sx(p), y = sy(p), t = BN[BK[bi]], w = c.measureText(t).width + 12;
        c.globalAlpha = .85; c.fillStyle = pal.card; c.beginPath(); c.roundRect ? c.roundRect(x - w / 2, y - 9, w, 18, 9) : c.rect(x - w / 2, y - 9, w, 18); c.fill();
        c.globalAlpha = 1; c.fillStyle = colorBy === 'bench' ? BCOL[bi] : pal.ink; c.fillText(t, x, y + .5); });
      [[hov, pal.ink, 7], [sel, pal.pr, 8]].forEach(([i, col, r]) => { if (i < 0) return; const p = P[i]; c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.arc(sx(p), sy(p), r, 0, 6.2832); c.stroke(); });
    };
    const legend = () => {
      const lg = $('#legend');
      const it = colorBy === 'agent' ? AGK.map((a) => [`var(${AG[a].c})`, AG[a].name]) : colorBy === 'bench' ? BK.map((b, i) => [BCOL[i], BN[b]]) : [['var(--ok)', 'passes in sim'], ['var(--bad)', 'fails in sim']];
      lg.innerHTML = it.map(([c, l]) => `<span><i style="background:${c}"></i>${l}</span>`).join('') + '<span><i class="ring"></i>built</span>';
    };
    // pointer: pan, pinch, hover, tap
    const pts = new Map(); let moved = 0, last = null, pinch0 = null;
    const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const nearest = (x, y, maxd) => { let b = -1, bd = maxd * maxd; const any = Object.values(F).some((f) => f !== 'all');
      for (let i = 0; i < P.length; i++) { const p = P[i]; if (any && !match(p)) continue; const dx = sx(p) - x, dy = sy(p) - y, d = dx * dx + dy * dy + (p[7] ? -30 : 0); if (d < bd) { bd = d; b = i; } } return b; };
    const zoomAt = (f, x, y) => { const ns = Math.max(1, Math.min(14, v.s * f)); const k = ns / v.s; v.x = x - (x - v.x) * k; v.y = y - (y - v.y) * k; v.s = ns; if (v.s === 1) { v.x = 0; v.y = 0; } drawMap(); };
    const tip = $('#tip');
    const showTip = (i, x, y) => {
      if (i < 0) { tip.hidden = true; return; }
      const p = P[i], d = p[7] ? byId[p[7]] : null;
      tip.innerHTML = `<div class="ti"><img src="./assets/img/map/${i}.webp" alt=""></div><b>${BN[BK[p[2]]]} L${p[5]}</b><span class="r">${AG[AGK[p[3]]].name} &middot; ${p[4] ? 'passes' : 'fails'} in sim${p[6] ? ' &middot; all-in-one' : ''}</span>` +
        (d ? `<div class="r">built: <span class="v ${d.crosses ? 'ok' : 'bad'}">${d.crosses ? 'crosses' : 'fails'}</span></div>` : '');
      tip.hidden = false;
      const tw = 170, th = 190; let tx = x + 14, ty = y + 14;
      if (tx + tw > W) tx = x - tw - 10; if (ty + th > H) ty = Math.max(4, y - th - 10);
      tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
    };
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, local(e)); moved = 0; last = local(e);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: v.s }; } });
    cv.addEventListener('pointermove', (e) => {
      const q = local(e);
      if (pts.has(e.pointerId)) {
        pts.set(e.pointerId, q);
        if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt((pinch0.s * d / pinch0.d) / v.s, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); moved += 10; return; }
        const dx = q[0] - last[0], dy = q[1] - last[1]; moved += Math.abs(dx) + Math.abs(dy); last = q;
        if (moved > 4 && v.s > 1) { v.x += dx; v.y += dy; cv.classList.add('drag'); tip.hidden = true; drawMap(); }
        return;
      }
      if (e.pointerType === 'mouse') { const i = nearest(q[0], q[1], 10); if (i !== hov) { hov = i; drawMap(); } showTip(i, q[0], q[1]); cv.classList.toggle('hov', i >= 0); }
    });
    const up = (e) => {
      const q = local(e); pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; cv.classList.remove('drag');
      if (moved < 6) { const i = nearest(q[0], q[1], e.pointerType === 'mouse' ? 10 : 18); if (i >= 0) { select(i); if (e.pointerType !== 'mouse') showTip(i, q[0], q[1]); } }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); pinch0 = null; });
    cv.addEventListener('pointerleave', () => { hov = -1; tip.hidden = true; drawMap(); });
    let armed = false; // wheel zooms only after the map was clicked (or with ctrl / cmd), so the page still scrolls
    cv.addEventListener('pointerdown', () => { armed = true; });
    cv.addEventListener('pointerleave', () => { armed = false; });
    cv.addEventListener('wheel', (e) => { if (!armed && !e.ctrlKey && !e.metaKey) return; e.preventDefault(); const q = local(e); zoomAt(Math.exp(-e.deltaY * 0.0015), q[0], q[1]); }, { passive: false });
    cv.addEventListener('dblclick', (e) => { const q = local(e); zoomAt(2, q[0], q[1]); });
    $('#zIn').addEventListener('click', () => zoomAt(1.6, W / 2, H / 2));
    $('#zOut').addEventListener('click', () => zoomAt(1 / 1.6, W / 2, H / 2));
    $('#zReset').addEventListener('click', () => { v = { s: 1, x: 0, y: 0 }; drawMap(); });
    $$('#colorBy button').forEach((b) => b.addEventListener('click', () => {
      colorBy = b.dataset.c; $$('#colorBy button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); legend(); drawMap();
    }));
    // filters
    const OPTS = { bench: [['all', 'All']].concat(BK.map((b) => [b, BN[b]])), level: [['all', 'All'], ['1', 'L1'], ['2', 'L2'], ['3', 'L3']],
      agent: [['all', 'All']].concat(AGK.map((a) => [a, AG[a].name])), built: [['all', 'All designs'], ['built', 'Built'], ['cross', 'Crosses for real'], ['fail', 'Fails for real']] };
    $$('.chips', $('#filters')).forEach((box) => {
      const f = box.dataset.f;
      OPTS[f].forEach(([val, l]) => {
        const b = el('button', val === 'all' ? 'on' : '', (f === 'agent' && val !== 'all' ? `<span class="sw" style="background:var(${AG[val].c})"></span>` : '') + l);
        b.type = 'button'; b.setAttribute('aria-pressed', val === 'all');
        b.addEventListener('click', () => { F[f] = val; $$('button', box).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); drawMap(); });
        box.appendChild(b);
      });
    });
    // detail panel
    const vSim = $('#vSim'), vReal = $('#vReal'), dImg = $('#dImg'), dSel = $('#dSelect');
    const play = (vv) => { if (!reduce) vv.play().catch(() => {}); };
    const select = (i, fromSelect) => {
      sel = i; const p = P[i], a = AGK[p[3]], d = p[7] ? byId[p[7]] : null;
      $('#dHead').innerHTML = `<span class="sw" style="background:${BCOL[p[2]]}"></span><span class="dn">${BN[BK[p[2]]]} L${p[5]} &middot; ${AG[a].name}</span>`;
      if (d) {
        dImg.hidden = true; vSim.hidden = false; $('#dRealPane').hidden = false;
        vSim.poster = `./assets/img/simposter/${d.id}.jpg`; vSim.src = `./assets/vid/sim/${d.id}.mp4`;
        vReal.poster = `./assets/img/poster/${d.id}.jpg`; vReal.src = `./assets/vid/real/${d.id}.mp4`;
        play(vSim); play(vReal);
        const vv = $('#vVerdict'); vv.textContent = d.crosses ? 'crosses' : 'fails'; vv.className = 'verdict ' + (d.crosses ? 'ok' : 'bad');
        $('#dMeta').innerHTML = `<span><span class="k">pieces</span> ${d.pieces}</span><span><span class="k">mass</span> ${d.mass} g</span>` +
          (d.printed ? '<span class="ptd">printed part</span>' : '') + (!d.crosses && d.failure ? `<span class="fail">${d.failure}</span>` : '');
        if (!fromSelect) dSel.value = d.id;
      } else {
        vSim.pause(); vReal.pause(); vSim.removeAttribute('src'); vSim.hidden = true; vSim.load();
        dImg.src = `./assets/img/map/${i}.webp`; dImg.alt = 'Render of the design'; dImg.hidden = false; $('#dRealPane').hidden = true;
        $('#dMeta').innerHTML = `<span>${p[4] ? 'Passes' : 'Fails'} in simulation${p[6] ? ' &middot; all-in-one robot' : ''}</span><span class="k">not built</span>`;
        dSel.value = '';
      }
      drawMap();
    };
    dSel.innerHTML = '<option value="">Choose a built robot&hellip;</option>' + [1, 2, 3].map((L) => `<optgroup label="Level ${L}">` +
      D.designs.filter((d) => d.level === L && built.has(d.id)).map((d) => `<option value="${d.id}">${BN[d.bench]} &middot; ${AG[d.agent].name} &middot; ${d.crosses ? 'crosses' : 'fails'}</option>`).join('') + '</optgroup>').join('');
    dSel.addEventListener('change', () => { if (dSel.value && built.has(dSel.value)) select(built.get(dSel.value), true); });
    const rs = () => { fit(); drawMap(); };
    window.addEventListener('resize', rs); legend(); rs();
    if (built.has('bumps-l3-opus')) select(built.get('bumps-l3-opus'));
    vSim.pause(); vReal.pause();
    const eo = io((ents) => ents.forEach((e) => { if (e.isIntersecting) { if (!vSim.hidden) play(vSim); if (!$('#dRealPane').hidden) play(vReal); } else { vSim.pause(); vReal.pause(); } }), { threshold: .25 });
    if (eo) eo.observe($('#detail'));
  }

  /* ---------------- reality check: bars, failure modes, loop cases ---------------- */
  const realBars = $('#realBars');
  if (realBars) {
    [['Level 1', 77, ''], ['Level 2', 68, ''], ['Level 3', 42, ''], ['All levels', 66, 'all']].forEach(([l, val, c]) => {
      realBars.appendChild(el('div', 'bar ' + c, `<span class="bl">${l}<b>${val}%</b></span><span class="bt" role="img" aria-label="${val}% cross for real"><i data-w="${val}"></i></span>`));
    });
    const fg = $('#failGrid');
    [['steps-l1-sol', 'Stalls at an edge', 47], ['bridge-l1-astra', 'Falls off', 21], ['rope-l1-sol', 'Hangs under the cord', 16], ['steps-l2-opus', 'Tips over', 16]].forEach(([id, l, s]) => {
      const d = byId[id]; if (!d) return;
      const f = el('div', 'fm');
      f.appendChild(mkTile(id, `<span>${BN[d.bench]} L${d.level}</span><span>${AG[d.agent].name}</span><span class="bad">fails</span>`, `./assets/vid/real/${id}.mp4`, `./assets/img/poster/${id}.jpg`));
      f.appendChild(el('div', 'fh', `<span>${l}</span><b>${s}%</b>`));
      fg.appendChild(f);
    });
    const grow = () => $$('[data-w]').forEach((i) => { i.style.width = i.dataset.w + '%'; });
    const o = io((ents, ob) => ents.forEach((e) => { if (e.isIntersecting) { grow(); ob.disconnect(); } }), { threshold: .3 });
    if (o && !reduce) o.observe(realBars); else grow();
  }
  // hardware-loop cases whose redesign crossed for real (texts from real_tests/judgements.json, loop_real.json and the redesign's own notes)
  const CASES = [
    { a: 'opus', b: 'bumps', l: 2, mode: 'stalls at an edge', fail: 'Star wheels stall on a bump ridge.', redesign: 'Wheg walker on printed four-arm hubs; the agent also lowered the simulated rod friction from 0.39 to 0.30.', printed: true },
    { a: 'sonnet', b: 'bridge', l: 2, mode: 'falls off', fail: 'Veers off the narrow plank a third of the way along.', redesign: 'Tandem rubber wheels with passive guides hanging beside the plank.', printed: false },
    { a: 'astra', b: 'wall', l: 2, mode: 'tips over', fail: 'Climbs the wall face, rears up and tips over.', redesign: 'Hoop-wheel walker on a printed rim with rubber feet.', printed: true },
    { a: 'sol', b: 'steps', l: 2, mode: 'stalls at an edge', fail: 'Stalls nose-up against the second riser.', redesign: 'Wide climber on four printed six-cleat cams, slow spur drive.', printed: true },
    { a: 'opus', b: 'rope', l: 2, mode: 'stalls at an edge', fail: 'Hangs below the cord across the whole span, then stops under the edge of the higher far deck.', redesign: 'Straddle-drum trolley: two flanged rubber drums ride on the cord and chain-driven deck wheels climb onto the far deck.', printed: false },
    { a: 'astra', b: 'bridge', l: 2, mode: 'stalls at an edge', fail: 'Gets its front onto the plank, then hangs up at the edge of the start deck.', redesign: 'Low well-deck carriage on central tyres between thin 40T guide discs, with a 2.5:1 chain drive.', printed: false },
    { a: 'opus', b: 'wall', l: 1, mode: 'stuck', fail: 'Its front wheels push against the wall face but never get onto it.', redesign: 'A worm-driven four-spoke wheg at the rear pushes a free four-spoke star over the wall; no tyre grip on the wall face needed.', printed: false },
    { a: 'sol', b: 'wall', l: 1, mode: 'stuck', fail: 'The front legs go over the wall, but the belly hangs on the wall top.', redesign: 'Stepper on four-toe rotors with independent 25:1 front and rear drives and a raised belly.', printed: false },
    { a: 'sol', b: 'steps', l: 1, mode: 'stalls at an edge', fail: 'Front wheels get onto the first step, then it rocks against the second riser.', redesign: 'Walker on four curved feet per rotor, front and rear driven separately, with a trailing heel against tipping.', printed: false },
    { a: 'sonnet', b: 'seesaw', l: 1, mode: 'stalls at an edge', fail: 'Its arm pushes the plank\'s raised end down, but the front wheels cannot climb its edge.', redesign: 'Four-wheel car on grippy tyres with 9:1 gears and a boom of hanging levers.', printed: false },
    { a: 'astra', b: 'bridge', l: 1, mode: 'falls off', fail: 'Drives onto the 40 mm plank and drops off it a third to half of the way across.', redesign: 'Trolley that captures the plank between four 40T guide discs, with a 24:40 reduction.', printed: false },
    { a: 'astra', b: 'rope', l: 1, mode: 'hangs under the cord', fail: 'Tips nose-down off the start deck and hangs from the cord at its edge.', redesign: 'Trolley on two narrow grooved rope rollers, gear-synchronised, with a lowered battery and chain-driven deck wheels.', printed: false },
    { a: 'sonnet', b: 'rope', l: 1, mode: 'stuck', fail: 'Stays at the start-deck edge with its front over the cord and never gets onto it.', redesign: 'Cable-car gantry: grooved drums ride the cord, with wheels under them for the decks.', printed: false }
  ];
  const lt = $('#loopTabs'), lcase = $('#loopCase');
  if (lt) {
    const showCase = (i) => {
      const c = CASES[i], n = `${c.b}-l${c.l}-${c.a}`;
      $$('button', lt).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
      lcase.innerHTML = '';
      const pane = (cls, head, st, stc, vid, poster, txt) => {
        const p = el('div', 'lc ' + cls);
        p.appendChild(el('div', 'lh', `<span>${head}</span><span class="st ${stc}">${st}</span>`));
        const box = el('div', 'vbox'); box.appendChild(mkVid(vid, poster)); p.appendChild(box);
        p.appendChild(el('p', '', txt)); return p;
      };
      lcase.append(
        pane('f', 'Real try', c.mode, 'bad', `./assets/vid/loop/${n}-fail.mp4`, `./assets/img/loop/${n}-fail.jpg`, c.fail),
        pane('s', 'Redesign, sim', 'crosses in sim', 'sim', `./assets/vid/sim/${n}-loop.mp4`, `./assets/img/simposter/${n}-loop.jpg`, c.redesign),
        pane('r', 'Redesign, real', 'crosses', 'ok', `./assets/vid/loop/${n}-real.mp4`, `./assets/img/loop/${n}-real.jpg`, `Built and tested as designed${c.printed ? ', printed part included' : ''}.`));
    };
    CASES.forEach((c, i) => {
      const b = el('button', i === 0 ? 'on' : '', `${BN[c.b]} L${c.l} &middot; ${logo(c.a)}${AG[c.a].name}`);
      b.type = 'button'; b.setAttribute('role', 'tab'); b.addEventListener('click', () => showCase(i)); lt.appendChild(b);
    });
    showCase(0);
    const db = $('#dumbbell');
    [['opus', 67, 83], ['sonnet', 77, 100], ['astra', 79, 100], ['sol', 71, 88]].forEach(([a, b0, a1]) => {
      const lo = 50, s = (x) => ((x - lo) / (106 - lo)) * 100;
      db.appendChild(el('div', 'db', `<span class="dn"><i style="background:var(${AG[a].c})"></i>${AG[a].name}</span>
        <span class="dt" role="img" aria-label="${AG[a].name}: ${b0}% before the loop, ${a1}% after"><i class="dl" style="left:${s(b0)}%;width:${s(a1) - s(b0)}%"></i>
        <i class="p b" style="left:${s(b0)}%"></i><i class="p a" style="left:${s(a1)}%"></i>
        <span class="pl" style="left:${s(b0)}%">${b0}</span><span class="pl a" style="left:${s(a1)}%">${a1}%</span></span>`));
    });
    const o = io((ents, ob) => ents.forEach((e) => { if (e.isIntersecting) { db.classList.add('in'); ob.disconnect(); } }), { threshold: .4 });
    if (o && !reduce) o.observe(db); else db.classList.add('in');
  }

  /* ---------------- all-in-one ---------------- */
  const ai = $('#allin');
  if (ai && D.allin) {
    const player = $('#allinPlayer'), pv = $('#allinVid'), pm = $('#allinMeta');
    ['opus', 'astra', 'sol', 'sonnet'].forEach((a) => {
      const row = D.allin[a] || {};
      const ns = BK.filter((b) => row[b] && row[b].sim).length, nr = BK.filter((b) => row[b] && row[b].real).length;
      const card = el('div', 'ai');
      card.innerHTML = `<div class="ai-h"><b>${AG[a].name}</b><span>${nr}<small>/10 real</small></span></div>
        <div class="ai-im"><img src="./assets/img/allin/${a}.webp" alt="${AG[a].name}'s All-in-one robot with a printed structure" loading="lazy" width="700" height="525"></div>`;
      const dots = el('div', 'dots');
      BK.forEach((b) => {
        const r = row[b] || {}, s = r.sim ? 'y' : 'n', q = r.real === true ? 'y' : (r.real === false ? 'n' : 'u');
        const d = el('button', 'd' + (r.vid ? ' v' : ''), `<span class="dd"><i class="${s}"></i><i class="${q}"></i></span>${BN[b]}`);
        d.type = 'button';
        d.setAttribute('aria-label', `${BN[b]}: ${r.sim ? 'passes' : 'fails'} in simulation, ${r.real === true ? 'crosses' : 'fails'} for real`);
        if (r.vid) d.addEventListener('click', (ev) => {
          $$('.ai .d').forEach((x) => x.classList.remove('on')); d.classList.add('on');
          player.hidden = false; pv.poster = r.vid.replace('vid/all', 'img/all').replace('.mp4', '.jpg');
          if (ev.isTrusted) { pv.src = r.vid; pv.play().catch(() => {}); } else { pv.removeAttribute('src'); pv.dataset.src = r.vid; if (vio) vio.observe(pv); }
          pm.innerHTML = `<b>${BN[b]} &middot; ${AG[a].name}</b>Simulation: <span style="color:${r.sim ? 'var(--ok)' : 'var(--bad)'}">${r.sim ? 'passes' : 'fails'}</span><br>Real course: <span style="color:${r.real ? 'var(--ok)' : 'var(--bad)'}">${r.real ? 'crosses' : 'fails'}</span>`;
        });
        else d.disabled = true;
        dots.appendChild(d);
      });
      card.appendChild(dots);
      ai.appendChild(card);
    });
    ai.insertAdjacentHTML('afterend', '<div class="allin-key"><span><span class="dd"><i style="background:var(--ok)"></i><i style="background:var(--bad)"></i></span>left: simulation, right: real course</span><span>Click a dot to play.</span></div>');
    const d0 = $$('.ai .d.v')[2]; if (d0) d0.click();
  }

  /* ---------------- filmstrip ---------------- */
  const film = $('#film');
  if (film) {
    const ids = D.designs.filter((d) => d.crosses).map((d) => d.id).filter((_, i) => i % 2 === 0).slice(0, 26);
    const imgs = ids.map((id) => `<img src="./assets/img/poster/${id}.jpg" alt="" loading="lazy" width="640" height="360">`).join('');
    film.innerHTML = imgs + imgs.replace(/alt=""/g, 'alt="" aria-hidden="true"');
  }

  /* ---------------- reveal on scroll ---------------- */
  const ro = io((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  if (ro && !reduce) $$('.section h2, .lede, .obst-row, .kit, .lb-scroll, .flow, .simfacts, .ex, .story, .loop-case, .after, .allin').forEach((x) => { x.classList.add('reveal'); ro.observe(x); });

  /* ---------------- More Works dropdown (as on the StepCAD page) ---------------- */
  const mwBtn = $('#moreWorksBtn'), mwDrop = $('#moreWorksDropdown');
  const setMW = (open) => { mwDrop.classList.toggle('show', open); mwBtn.setAttribute('aria-expanded', open); };
  mwBtn.addEventListener('click', (e) => { e.stopPropagation(); setMW(!mwDrop.classList.contains('show')); });
  $('#moreWorksClose').addEventListener('click', () => setMW(false));
  document.addEventListener('click', (e) => { if (!$('#moreWorks').contains(e.target)) setMW(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMW(false); });

  /* ---------------- BibTeX ---------------- */
  $('#copyBib').addEventListener('click', async function () {
    const l = this.querySelector('span');
    try { await navigator.clipboard.writeText($('#bibText').textContent); l.textContent = 'Copied'; }
    catch (_) { l.textContent = 'Select & copy'; }
    setTimeout(() => { l.textContent = 'Copy'; }, 1800);
  });
})();
