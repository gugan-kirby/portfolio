(() => {
  const body = document.body;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- intro loader ---------- */
  const countEl = document.getElementById('count');
  const finishLoad = () => {
    body.classList.add('is-loaded');
    setTimeout(() => body.classList.remove('is-loading'), 700);
  };
  if (reduce) {
    countEl.textContent = '100';
    finishLoad();
  } else {
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      countEl.textContent = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(finishLoad, 150);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- split headings into words ---------- */
  document.querySelectorAll('.split').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--i', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  });

  /* ---------- scroll reveal ---------- */
  // stagger siblings inside grids/lists
  document.querySelectorAll('.stats, .stack-grid, .lab-grid, .certs').forEach((group) => {
    [...group.children].forEach((c, i) => c.style.setProperty('--rd', `${i * 0.08}s`));
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
      const counter = e.target.querySelector('[data-count]');
      if (counter) countUp(counter);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .split').forEach((el) => io.observe(el));

  /* ---------- counters ---------- */
  function countUp(el) {
    const target = +el.dataset.count;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + target + suf; return; }
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = pre + Math.round((1 - Math.pow(1 - t, 4)) * target) + suf;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- nav: hide on scroll down, progress bar, active link ---------- */
  const nav = document.querySelector('.nav');
  const bar = document.querySelector('.progress');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = [...document.querySelectorAll('.nav-links a')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'experience', 'stack', 'contact'].forEach((id) => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
  });

  /* ---------- IST clock ---------- */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const setTime = () => { clock.textContent = fmt.format(new Date()); };
  setTime();
  setInterval(setTime, 15000);

  /* ---------- theme toggle ---------- */
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const current = root.dataset.theme
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- copy email ---------- */
  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };
  document.querySelector('.email').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied ✓');
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  });

  if (!fine || reduce) return;

  /* ---------- project hover preview (follows cursor) ---------- */
  const preview = document.querySelector('.preview');
  const inner = preview.querySelector('.preview-inner');
  let mx = 0, my = 0, px = 0, py = 0, running = false;
  const loop = () => {
    px += (mx - px) * 0.14;
    py += (my - py) * 0.14;
    const tilt = Math.max(-8, Math.min(8, (mx - px) * 0.08));
    preview.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) scale(0.6) rotate(${tilt}deg)`;
    if (running) requestAnimationFrame(loop);
  };
  document.querySelectorAll('.project').forEach((p) => {
    p.addEventListener('mouseenter', (e) => {
      inner.className = 'preview-inner';
      inner.innerHTML = '';
      inner.style.backgroundImage = '';
      if (p.dataset.img) {
        inner.style.backgroundImage = `url("${p.dataset.img}")`;
      } else {
        inner.classList.add(`tone-${p.dataset.tone}`);
        inner.innerHTML = `<span>${p.dataset.card}</span>`;
      }
      if (!running) { px = mx = e.clientX; py = my = e.clientY; running = true; loop(); }
      preview.classList.add('is-on');
    });
    p.addEventListener('mouseleave', () => {
      preview.classList.remove('is-on');
      setTimeout(() => { if (!preview.classList.contains('is-on')) running = false; }, 400);
    });
  });
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ---------- skill tiles: fill from cursor point ---------- */
  document.querySelectorAll('.skill').forEach((el) => {
    el.addEventListener('mouseenter', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- lab cards: soft 3D tilt ---------- */
  document.querySelectorAll('.lab-card').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();
