/* Ongles Sakura Spa — small, dependency-free interactions (mobile-first) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 761px)");

  /* Header border + mobile action bar (shows once the hero CTA is scrolled past) */
  const header = $("[data-header]");
  const bar = $("[data-mobile-bar]");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    header && header.classList.toggle("is-scrolled", y > 8);
    bar && bar.classList.toggle("is-visible", y > 380);
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Mobile navigation (full-screen sheet) */
  const toggle = $("[data-nav-toggle]");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const set = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      if (open) { const first = $("a", nav); first && first.focus({ preventScroll: true }); }
    };
    toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); toggle.focus(); } });
    window.matchMedia("(min-width: 961px)").addEventListener("change", (m) => m.matches && set(false));
  }

  /* Services: open grid on desktop, tidy accordion on phones */
  const services = $$("[data-service]");
  const syncServices = () => {
    services.forEach((d, i) => {
      if (desktop.matches) d.open = true;
      else d.open = i === 0;
    });
  };
  syncServices();
  desktop.addEventListener("change", syncServices);
  services.forEach((d) => $("summary", d).addEventListener("click", (e) => { if (desktop.matches) e.preventDefault(); }));

  /* Reveal on scroll */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    reveals.forEach((el, i) => { if (desktop.matches) el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Gallery filters */
  $$("[data-filter]").forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    $$("[data-filter]").forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    $$(".g-item").forEach((it) => it.classList.toggle("is-hidden", f !== "all" && it.dataset.cat !== f));
  }));

  /* Lightbox — tap to open, swipe / arrows to browse, Esc to close */
  const root = $("[data-lightbox-root]");
  const links = $$("[data-lightbox]");
  if (root && links.length) {
    let idx = 0, list = [], lastFocus = null;
    root.innerHTML =
      '<span class="lb-count" aria-live="polite"></span>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Fermer / Close">×</button>' +
      '<figure><img alt="" decoding="async"><figcaption></figcaption></figure>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Précédent / Previous">‹</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Suivant / Next">›</button>';
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    const img = $("img", root), cap = $("figcaption", root), count = $(".lb-count", root);
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const a = list[idx];
      img.src = a.href; img.alt = a.dataset.caption || ""; cap.textContent = a.dataset.caption || "";
      count.textContent = `${idx + 1} / ${list.length}`;
      const next = list[(idx + 1) % list.length];
      if (next) { const pre = new Image(); pre.src = next.href; }
    };
    const open = (a) => {
      list = links.filter((l) => l.offsetParent !== null);   // only tiles currently visible
      lastFocus = a; root.hidden = false; document.body.classList.add("nav-open");
      show(Math.max(0, list.indexOf(a))); $(".lb-close", root).focus();
    };
    const close = () => { root.hidden = true; document.body.classList.remove("nav-open"); lastFocus && lastFocus.focus({ preventScroll: true }); };
    links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(a); }));
    $(".lb-close", root).addEventListener("click", close);
    $(".lb-prev", root).addEventListener("click", () => show(idx - 1));
    $(".lb-next", root).addEventListener("click", () => show(idx + 1));
    root.addEventListener("click", (e) => { if (e.target === root || e.target.tagName === "FIGURE") close(); });
    document.addEventListener("keydown", (e) => {
      if (root.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let x0 = null, y0 = null;
    root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();          // swipe down to close
      x0 = y0 = null;
    });
  }

  /* 🌸 falling sakura petals in the hero (the original site's signature), kept light:
     few petals, pre-rendered sprites, paused when off-screen or tab hidden */
  const cv = $("[data-petals]");
  if (cv && !reduced) {
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sprite = document.createElement("canvas");
    const S = 64; sprite.width = sprite.height = S * dpr;
    const sctx = sprite.getContext("2d");
    sctx.scale(dpr, dpr); sctx.textAlign = "center"; sctx.textBaseline = "middle";
    sctx.font = `${S * 0.8}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    sctx.fillText("🌸", S / 2, S / 2 + 2);
    let w = 0, h = 0, petals = [], visible = true, raf = 0;
    const resize = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (initial) => ({
      x: Math.random() * w, y: initial ? Math.random() * h : -30,
      size: (w < 700 ? 14 : 18) + Math.random() * (w < 700 ? 8 : 14),
      vy: 0.35 + Math.random() * 0.55, a: Math.random() * Math.PI * 2, va: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2, o: 0.45 + Math.random() * 0.45,
    });
    const tick = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.sway += 0.012; p.y += p.vy; p.x += Math.sin(p.sway) * 0.4 + 0.1; p.a += p.va;
        if (p.y > h + 30 || p.x > w + 30) { petals[i] = make(false); continue; }
        ctx.save(); ctx.globalAlpha = p.o; ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.drawImage(sprite, -p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    resize();
    petals = Array.from({ length: w < 700 ? 8 : 16 }, () => make(true));
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(cv);
    document.addEventListener("visibilitychange", () => !document.hidden && start());
    start();
  }

  /* Conversion tracking hooks (active once Google Analytics 4 is configured) */
  $$("[data-track]").forEach((el) => el.addEventListener("click", () => {
    if (typeof window.gtag === "function") window.gtag("event", el.dataset.track, { link_url: el.href });
  }));
})();
