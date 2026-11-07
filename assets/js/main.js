/* Ongles Sakura Spa — small, dependency-free interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header shadow + mobile booking button */
  const header = $("[data-header]");
  const fab = $(".fab-book");
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle("is-scrolled", y > 10);
    fab && fab.classList.toggle("is-visible", y > 520);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  const toggle = $("[data-nav-toggle]");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const set = (open) => {
      toggle.setAttribute("aria-expanded", open);
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  /* Reveal on scroll */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Gallery filters */
  $$("[data-filter]").forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    $$("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
    $$(".g-item").forEach((it) => it.classList.toggle("is-hidden", f !== "all" && it.dataset.cat !== f));
  }));

  /* Lightbox */
  const root = $("[data-lightbox-root]");
  const links = $$("[data-lightbox]");
  if (root && links.length) {
    let idx = 0, lastFocus = null;
    root.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Close">×</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-btn lb-next" aria-label="Next">›</button>';
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    const img = $("img", root), cap = $("figcaption", root);
    const visible = () => links.filter((a) => !a.closest(".is-hidden"));
    const show = (i) => {
      const list = visible();
      idx = (i + list.length) % list.length;
      const a = list[idx];
      img.src = a.href; img.alt = a.dataset.caption || ""; cap.textContent = a.dataset.caption || "";
    };
    const open = (a) => { lastFocus = a; root.hidden = false; document.body.classList.add("nav-open"); show(visible().indexOf(a)); $(".lb-close", root).focus(); };
    const close = () => { root.hidden = true; document.body.classList.remove("nav-open"); lastFocus && lastFocus.focus(); };
    links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(a); }));
    $(".lb-close", root).addEventListener("click", close);
    $(".lb-prev", root).addEventListener("click", () => show(idx - 1));
    $(".lb-next", root).addEventListener("click", () => show(idx + 1));
    root.addEventListener("click", (e) => e.target === root && close());
    document.addEventListener("keydown", (e) => {
      if (root.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let x0 = null;
    root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* A few drifting petals in the hero — subtle, paused off-screen */
  const cv = $("[data-petals]");
  if (cv && !reduced) {
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, petals = [], running = true;
    const resize = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (initial) => ({
      x: Math.random() * w, y: initial ? Math.random() * h : -20,
      r: 5 + Math.random() * 6, s: 0.25 + Math.random() * 0.45,
      a: Math.random() * Math.PI * 2, va: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2, o: 0.35 + Math.random() * 0.4,
    });
    const draw = (p) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o;
      ctx.fillStyle = "#E9B9B6";
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.6, p.r * 0.7, p.r * 0.8, 0, p.r);
      ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.8, -p.r * 0.9, -p.r * 0.6, 0, -p.r);
      ctx.fill(); ctx.restore();
    };
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      petals.forEach((p, i) => {
        p.sway += 0.012; p.y += p.s; p.x += Math.sin(p.sway) * 0.35 + 0.12; p.a += p.va;
        if (p.y > h + 20 || p.x > w + 20) petals[i] = make(false);
        draw(p);
      });
      requestAnimationFrame(tick);
    };
    resize();
    petals = Array.from({ length: w < 700 ? 7 : 14 }, () => make(true));
    window.addEventListener("resize", resize);
    new IntersectionObserver(([en]) => {
      const was = running; running = en.isIntersecting;
      if (running && !was) tick();
    }).observe(cv);
    tick();
  }

  /* Conversion tracking hooks (works once Google Analytics 4 is added) */
  $$("[data-track]").forEach((el) => el.addEventListener("click", () => {
    if (typeof window.gtag === "function") window.gtag("event", el.dataset.track, { link_url: el.href });
  }));
})();
