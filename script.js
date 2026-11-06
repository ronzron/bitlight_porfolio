// BitLight simulator: follows the same algorithm as the pseudocode in section 6.
(function () {
  const WEIGHT = [1, 2, 4, 8];            // weight[i] for bit i
  let value = 11;                         // start on 1011

  const bits = [...document.querySelectorAll('.bit')];
  const miniLeds = [...document.querySelectorAll('.mini-leds i')];   // left to right = S3..S0
  const rBin = document.getElementById('r-bin');
  const rDec = document.getElementById('r-dec');
  const rHex = document.getElementById('r-hex');
  const rSum = document.getElementById('r-sum');
  const alertLed = document.getElementById('alert-led');
  const brandValue = document.querySelector('.brand-value');
  const ttBody = document.querySelector('#truth-table tbody');
  const kmap = document.getElementById('kmap-grid');

  const bin4 = n => n.toString(2).padStart(4, '0');

  // ---- Truth table (16 rows) ----
  const ttRows = [];
  for (let n = 0; n < 16; n++) {
    const b = bin4(n);
    const tr = document.createElement('tr');
    tr.dataset.value = n;
    tr.tabIndex = 0;
    tr.setAttribute('aria-label', `Show ${b} on BitLight`);
    tr.innerHTML =
      [...b].map(c => `<td>${c}</td>`).join('') +
      [...b].map(c => `<td class="${c === '1' ? 'on' : ''}">${c}</td>`).join('') +
      `<td class="dec">${n}</td><td class="hex">${n.toString(16).toUpperCase()}</td>`;
    tr.addEventListener('click', () => set(n));
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(n); } });
    ttBody.appendChild(tr);
    ttRows.push(tr);
  }

  // ---- K-Map (Gray-code order 00, 01, 11, 10) ----
  const gray = ['00', '01', '11', '10'];
  const kCells = {};
  const add = (cls, html, role, row, col) => {
    const d = document.createElement('div');
    d.className = cls; d.innerHTML = html;
    if (role) d.setAttribute('role', role);
    if (row) { d.style.gridRow = row; d.style.gridColumn = col; }
    kmap.appendChild(d); return d;
  };
  add('hd corner', 'AB \\ CD', 'columnheader', 1, 1);
  gray.forEach((g, j) => add('hd', g, 'columnheader', 1, j + 2));
  gray.forEach((ab, r) => {
    add('hd', ab, 'rowheader', r + 2, 1);
    gray.forEach((cd, j) => {
      const m = parseInt(ab + cd, 2);
      const f = m >= 10 ? 1 : 0;
      const c = add(`cell ${f ? '' : 'zero'}`, `${f}<span class="m">m${m}</span>`, 'cell', r + 2, j + 2);
      c.setAttribute('aria-label', `AB ${ab}, CD ${cd}, minterm ${m}, F = ${f}`);
      kCells[m] = c;
    });
  });
  add('grp grp-red', '');
  add('grp grp-blue', '');

  // ---- Render: for i = 3 down to 0, read S[i], turn LED L[i] on or off ----
  function render() {
    let sum = [];
    for (let i = 3; i >= 0; i--) {
      const on = (value >> i) & 1;
      const el = bits.find(b => +b.dataset.bit === i);
      el.querySelector('.led').classList.toggle('on', !!on);
      el.querySelector('.switch').setAttribute('aria-pressed', on ? 'true' : 'false');
      miniLeds[3 - i].classList.toggle('on', !!on);
      if (on) sum.push(WEIGHT[i]);
    }
    const b = bin4(value);
    rBin.textContent = b;
    rDec.textContent = value;
    rHex.textContent = value.toString(16).toUpperCase();
    rSum.textContent = sum.length ? `${sum.join(' + ')} = ${value}` : 'No switches on, so the value is 0';
    brandValue.textContent = `${b} = ${value}`;

    const A = (value >> 3) & 1, B = (value >> 2) & 1, C = (value >> 1) & 1;
    alertLed.classList.toggle('on', !!(A && (B || C)));     // F = A(B + C) = AB + AC

    ttRows.forEach(r => r.classList.toggle('current', +r.dataset.value === value));
    Object.entries(kCells).forEach(([m, c]) => c.classList.toggle('current', +m === value));
  }

  function set(n) { value = n & 15; render(); }

  bits.forEach(b => {
    b.querySelector('.switch').addEventListener('click', () => set(value ^ (1 << +b.dataset.bit)));
  });
  // ---- "Show on BitLight" buttons: set the value, scroll up to the board, offer a way back ----
  const board = document.querySelector('.board');
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'back-btn';
  backBtn.hidden = true;
  document.body.appendChild(backBtn);
  let returnY = null;
  const smooth = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  document.querySelectorAll('[data-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      set(+btn.dataset.set);
      if (board.contains(btn)) return;               // "All on/off" chips are already on the board
      const section = btn.closest('section');
      const title = section && section.querySelector('h2');
      returnY = window.scrollY;
      backBtn.textContent = title ? `Back to ${title.textContent.trim()}` : 'Back to where you were';
      backBtn.hidden = false;
      board.scrollIntoView({ behavior: smooth(), block: 'center' });
      board.classList.remove('flash');
      void board.offsetWidth;                         // restart the highlight
      board.classList.add('flash');
      board.querySelector('.switch').focus({ preventScroll: true });
    });
  });
  backBtn.addEventListener('click', () => {
    if (returnY !== null) window.scrollTo({ top: returnY, behavior: smooth() });
    backBtn.hidden = true;
    returnY = null;
  });

  // ---- Highlight the section in view in the nav ----
  const links = [...document.querySelectorAll('nav a')];
  const byId = Object.fromEntries(links.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && byId[e.target.id]) {
        links.forEach(a => a.classList.remove('active'));
        byId[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

  // ---- One opening moment: count up from 0 to 11 ----
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { render(); return; }
  let n = 0;
  value = 0; render();
  const timer = setInterval(() => {
    n++; value = n; render();
    if (n >= 11) clearInterval(timer);
  }, 85);
  // stop the count if the visitor starts flipping switches
  document.querySelector('.board').addEventListener('click', () => clearInterval(timer), { once: true });
})();
