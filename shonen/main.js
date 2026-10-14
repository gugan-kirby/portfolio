(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- night rain ---------- */
  const canvas = document.querySelector('.rain');
  if (!reduce && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w, h, drops = [];
    const make = (initial) => ({
      x: Math.random() * (w + 200) - 100,
      y: initial ? Math.random() * h : -20 - Math.random() * 200,
      l: 10 + Math.random() * 18,
      v: 9 + Math.random() * 9,
      a: 0.12 + Math.random() * 0.28,
    });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: Math.round(Math.min(140, w / 9)) }, () => make(true));
    };
    const slant = 0.22;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.2;
      drops.forEach((d, i) => {
        ctx.strokeStyle = `rgba(160, 220, 255, ${d.a})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * slant, d.y + d.l);
        ctx.stroke();
        d.x -= d.v * slant;
        d.y += d.v;
        if (d.y > h) drops[i] = make(false);
      });
      requestAnimationFrame(frame);
    };
    resize();
    window.addEventListener('resize', resize);
    frame();

    /* lightning: random flash every 7–15s */
    const flash = document.querySelector('.flash');
    const strike = () => {
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
      setTimeout(strike, 7000 + Math.random() * 8000);
    };
    setTimeout(strike, 4000);
  }

  /* ---------- name glitch ---------- */
  const glitch = document.querySelector('.glitch');
  if (!reduce && glitch) {
    const fire = () => {
      glitch.classList.add('is-glitching');
      setTimeout(() => glitch.classList.remove('is-glitching'), 750);
    };
    setTimeout(fire, 1600);
    setInterval(fire, 5200);
    glitch.addEventListener('mouseenter', fire);
  }

  /* ---------- speech bubble typing ---------- */
  const say = document.getElementById('say');
  const lines = [
    "Yo. I'm Gugan.",
    'I ship SaaS. End to end.',
    'Next.js · Django · Go · Postgres',
    'Power level: 2500+ commits ⚡',
    'The cat does code review.',
  ];
  let override = null;
  if (reduce) {
    say.textContent = lines[0];
  } else {
    let li = 0, ci = 0, deleting = false;
    const loop = () => {
      if (override) { say.textContent = override; override = null; ci = 0; deleting = false; return setTimeout(loop, 1600); }
      const line = lines[li];
      if (!deleting) {
        say.textContent = line.slice(0, ++ci);
        if (ci === line.length) { deleting = true; return setTimeout(loop, 1800); }
        return setTimeout(loop, 40 + Math.random() * 40);
      }
      say.textContent = line.slice(0, --ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(loop, 300); }
      setTimeout(loop, 20);
    };
    say.textContent = '';
    setTimeout(loop, 1500);
  }

  /* ---------- scroll reveal + counters ---------- */
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
      toast.textContent = 'Email copied ⚡';
      toast.classList.add('is-on');
      clearTimeout(tt);
      tt = setTimeout(() => toast.classList.remove('is-on'), 2200);
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  });

  /* ---------- tap the character: power-up jump ---------- */
  const dev = document.querySelector('.dev');
  const pokes = ['Oi! I\'m mid-deploy!', 'Fine… one more feature.', 'Want to build something?'];
  let pi = 0;
  dev.style.cursor = 'pointer';
  dev.addEventListener('click', () => {
    if (!reduce) {
      dev.animate([
        { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' },
        { transform: 'translateY(-28px) scale(1.04, 0.96)', filter: 'brightness(1.8) drop-shadow(0 0 20px #29e7ff)' },
        { transform: 'translateY(0) scale(0.97, 1.03)', filter: 'brightness(1.2)' },
        { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' },
      ], { duration: 650, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
    }
    override = pokes[pi++ % pokes.length];
    say.textContent = override;
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

  /* ---------- holo cards ---------- */
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

  /* ---------- electric spark trail ---------- */
  let last = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - last < 40) return;
    last = now;
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    const ang = Math.random() * 360;
    s.style.setProperty('--r', `${ang}deg`);
    s.style.setProperty('--tx', `${(Math.random() - 0.5) * 50}px`);
    s.style.setProperty('--ty', `${(Math.random() - 0.5) * 50}px`);
    s.style.transform = `rotate(${ang}deg)`;
    if (Math.random() > 0.6) { s.style.background = '#ff3b5c'; s.style.boxShadow = '0 0 8px #ff3b5c'; }
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });
})();
