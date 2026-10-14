(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- sakura petals ---------- */
  const canvas = document.querySelector('.petals');
  if (!reduce && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const colors = ['#ffb7cf', '#ff8fb1', '#ffd0df', '#ffe4ec'];
    let w, h, dpr, petals = [];
    const count = () => Math.round(Math.min(34, window.innerWidth / 40));
    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -20,
      s: 7 + Math.random() * 8,
      vy: 0.5 + Math.random() * 0.9,
      vx: -0.3 + Math.random() * 0.8,
      a: Math.random() * Math.PI * 2,
      va: -0.03 + Math.random() * 0.06,
      sway: Math.random() * Math.PI * 2,
      c: colors[(Math.random() * colors.length) | 0],
    });
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      petals = Array.from({ length: count() }, () => make(true));
    };
    const petal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.scale(1, Math.abs(Math.cos(p.a * 1.6)) * 0.6 + 0.4); // flutter
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.6, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.6, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.restore();
    };
    let wind = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      wind *= 0.96;
      petals.forEach((p, i) => {
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * 0.6 + wind;
        p.y += p.vy;
        p.a += p.va;
        if (p.y > h + 20 || p.x < -40 || p.x > w + 40) petals[i] = make(false);
        petal(p);
      });
      requestAnimationFrame(frame);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', () => { wind = Math.min(wind + 0.25, 3); }, { passive: true });
    frame();
  }

  /* ---------- speech bubble typing ---------- */
  const say = document.getElementById('say');
  const lines = [
    "Hello there! I'm Gugan ✦",
    'I build SaaS products end to end!',
    'Next.js · Django · Go · Postgres',
    'Currently shipping at Zemuria 🚀',
    'Psst… the cat reviews my PRs.',
  ];
  if (reduce) {
    say.textContent = lines[0];
  } else {
    let li = 0, ci = 0, deleting = false;
    const typeLoop = () => {
      const line = lines[li];
      if (!deleting) {
        ci++;
        say.textContent = line.slice(0, ci);
        if (ci === line.length) { deleting = true; return setTimeout(typeLoop, 1800); }
        return setTimeout(typeLoop, 45 + Math.random() * 40);
      }
      ci--;
      say.textContent = line.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(typeLoop, 300); }
      setTimeout(typeLoop, 22);
    };
    say.textContent = '';
    setTimeout(typeLoop, 1500);
  }

  /* ---------- scroll reveal ---------- */
  document.querySelectorAll('.powerups, .inventory, .cards, .stickers, .academy-grid').forEach((g) => {
    [...g.children].forEach((c, i) => c.style.setProperty('--rd', `${i * 0.08}s`));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
      const n = e.target.querySelector('[data-count]');
      if (n) countUp(n);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  function countUp(el) {
    const target = +el.dataset.count;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + target + suf; return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1400, 1);
      el.textContent = pre + Math.round((1 - Math.pow(1 - t, 3)) * target) + suf;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- nav hide + progress ---------- */
  const nav = document.querySelector('.nav');
  const bar = document.querySelector('.progress span');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-hidden', y > lastY && y > 300);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- IST clock ---------- */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const tick = () => { clock.textContent = `${fmt.format(new Date())} IST`; };
  tick(); setInterval(tick, 15000);

  /* ---------- copy email ---------- */
  const toast = document.querySelector('.toast');
  let tt;
  document.querySelector('.email').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      toast.textContent = 'Email copied! ✦';
      toast.classList.add('is-on');
      clearTimeout(tt);
      tt = setTimeout(() => toast.classList.remove('is-on'), 2200);
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  });

  if (reduce || !fine) return;

  /* ---------- hero parallax ---------- */
  const hero = document.querySelector('.hero');
  const layers = [...hero.querySelectorAll('[data-depth]')];
  hero.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    layers.forEach((l) => {
      const d = +l.dataset.depth;
      l.style.translate = `${x * d * -40}px ${y * d * -30}px`;
    });
  });

  /* ---------- holo trading cards ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(x - 0.5) * 16}deg) rotateX(${(0.5 - y) * 12}deg) translateY(-6px)`;
      card.style.setProperty('--hx', `${x * 100}%`);
      card.style.setProperty('--hy', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- sparkle cursor trail ---------- */
  const glyphs = ['✦', '✧', '★', '♡'];
  let last = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - last < 45) return;
    last = now;
    const s = document.createElement('span');
    s.className = 'trail';
    s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    s.style.setProperty('--tx', `${(Math.random() - 0.5) * 40}px`);
    s.style.setProperty('--ty', `${10 + Math.random() * 30}px`);
    if (Math.random() > 0.5) s.style.color = '#ffd84d';
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });

  /* ---------- poke the character ---------- */
  const dev = document.querySelector('.dev');
  const lines2 = ['Hey! That tickles!', 'Back to coding… 💻', 'Want to work together?'];
  let pokes = 0;
  dev.style.cursor = 'pointer';
  dev.addEventListener('click', () => {
    dev.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-30px) scale(1.04, 0.96)' },
      { transform: 'translateY(0) scale(0.97, 1.03)' },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: 600, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
    say.textContent = lines2[pokes++ % lines2.length];
  });
})();
