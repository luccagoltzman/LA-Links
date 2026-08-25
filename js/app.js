(() => {
  const cfg = window.LA_LINKS || {};
  const username = String(cfg.instagramUsername || "lacatalogo").replace(/^@/, "");
  const delay = Number(cfg.redirectDelayMs) || 5200;
  const webUrl = `https://www.instagram.com/${encodeURIComponent(username)}/`;
  const appUrl = `instagram://user?username=${encodeURIComponent(username)}`;
  const brand = cfg.brand || "LA Catálogo";

  const params = new URLSearchParams(location.search);
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadyVisited = sessionStorage.getItem("la-links-held") === "1";
  const forceNow = params.has("now");
  const forceStay = params.has("stay") || alreadyVisited;

  const els = {
    cta: document.querySelector("[data-cta]"),
    handle: document.querySelector("[data-handle]"),
    tagline: document.querySelector("[data-tagline]"),
    status: document.querySelector("[data-status]"),
    seconds: document.querySelector("[data-seconds]"),
    stay: document.querySelector("[data-stay]"),
    copyHandle: document.querySelector("[data-copy-handle]"),
    copyLink: document.querySelector("[data-copy-link]"),
    share: document.querySelector("[data-share]"),
    toast: document.querySelector("[data-toast]"),
    year: document.querySelector("[data-year]"),
    spot: document.querySelector("[data-spot]"),
  };

  let raf = 0;
  let startedAt = 0;
  let pausedAt = 0;
  let elapsed = 0;
  let leaving = false;
  let held = forceStay && !forceNow;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  els.cta.href = webUrl;
  els.handle.textContent = `@${username}`;
  if (cfg.tagline) els.tagline.textContent = cfg.tagline;
  els.year.textContent = String(new Date().getFullYear());

  if (!navigator.share) els.share.hidden = true;

  function setProgress(value) {
    document.documentElement.style.setProperty("--progress", String(value));
  }

  function setStatus(html) {
    els.status.innerHTML = html;
  }

  function toast(message) {
    els.toast.hidden = false;
    els.toast.textContent = message;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, 2200);
  }

  async function copy(text, okMessage) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMessage);
    } catch {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      toast(okMessage);
    }
  }

  function openInstagram() {
    if (leaving) return;
    leaving = true;
    document.body.classList.add("is-leaving");
    sessionStorage.setItem("la-links-held", "1");

    const goWeb = () => {
      location.href = webUrl;
    };

    if (isMobile) {
      const fallback = window.setTimeout(goWeb, 900);
      window.addEventListener("pagehide", () => window.clearTimeout(fallback), { once: true });
      location.href = appUrl;
      return;
    }

    window.setTimeout(goWeb, prefersReduced ? 0 : 280);
  }

  function hold() {
    held = true;
    sessionStorage.setItem("la-links-held", "1");
    cancelAnimationFrame(raf);
    setProgress(0);
    els.stay.hidden = true;
    setStatus("Quando quiser, é só abrir.");
  }

  function tick(now) {
    if (held || leaving) return;
    if (!startedAt) startedAt = now;
    if (pausedAt) {
      startedAt += now - pausedAt;
      pausedAt = 0;
    }

    elapsed = now - startedAt;
    const progress = Math.min(elapsed / delay, 1);
    const remaining = Math.max(0, Math.ceil((delay - elapsed) / 1000));

    setProgress(progress);
    if (els.seconds) els.seconds.textContent = String(remaining);

    if (progress >= 1) {
      openInstagram();
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function startCountdown() {
    if (held || prefersReduced || forceStay) {
      hold();
      if (prefersReduced) setStatus("Animação reduzida — toque no botão para abrir.");
      return;
    }

    setProgress(0);
    startedAt = 0;
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", () => {
    if (held || leaving) return;
    if (document.hidden) {
      pausedAt = performance.now();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(tick);
    }
  });

  els.cta.addEventListener("click", (event) => {
    event.preventDefault();
    openInstagram();
  });

  els.cta.addEventListener("pointermove", (event) => {
    const rect = els.cta.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    els.cta.style.setProperty("--mx", `${x}%`);
    els.cta.style.setProperty("--my", `${y}%`);
  });

  els.stay.addEventListener("click", hold);

  els.copyHandle.addEventListener("click", () => copy(`@${username}`, "Usuário copiado"));
  els.copyLink.addEventListener("click", () => copy(webUrl, "Link copiado"));

  els.share.addEventListener("click", async () => {
    try {
      await navigator.share({
        title: `${brand} no Instagram`,
        text: cfg.tagline || `Siga ${brand} no Instagram`,
        url: webUrl,
      });
    } catch (error) {
      if (error && error.name !== "AbortError") copy(webUrl, "Link copiado");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "INPUT") return;
      event.preventDefault();
      openInstagram();
    }
    if (event.key === "Escape") hold();
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--spot-x", `${x}%`);
      document.documentElement.style.setProperty("--spot-y", `${y}%`);
    },
    { passive: true }
  );

  if (forceNow) {
    openInstagram();
    return;
  }

  startCountdown();
})();
