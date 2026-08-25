(() => {
  const cfg = window.LA_LINKS || {};
  const brand = cfg.brand || "LA Veículos";
  const store = cfg.store || {};
  const catalog = cfg.catalog || {};
  const wa = cfg.whatsapp || {};
  const socials = Array.isArray(cfg.socials) ? cfg.socials : [];

  const els = {
    brand: document.querySelector("[data-brand]"),
    brandFoot: document.querySelector("[data-brand-foot]"),
    tagline: document.querySelector("[data-tagline]"),
    catalog: document.querySelector("[data-catalog]"),
    catalogLabel: document.querySelector("[data-catalog-label]"),
    catalogHint: document.querySelector("[data-catalog-hint]"),
    whatsapp: document.querySelector("[data-whatsapp]"),
    whatsappLabel: document.querySelector("[data-whatsapp-label]"),
    placeLine: document.querySelector("[data-place-line]"),
    placeHours: document.querySelector("[data-place-hours]"),
    maps: document.querySelector("[data-maps]"),
    copyAddress: document.querySelector("[data-copy-address]"),
    phone: document.querySelector("[data-phone]"),
    share: document.querySelector("[data-share]"),
    socialWrap: document.querySelector("[data-social-wrap]"),
    socials: document.querySelector("[data-socials]"),
    toast: document.querySelector("[data-toast]"),
    year: document.querySelector("[data-year]"),
  };

  const ICONS = {
    instagram: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 8.5h2.5V5.8H14c-2.3 0-3.8 1.6-3.8 4v1.7H8v2.7h2.2V20h2.8v-5.8h2.4l.5-2.7h-2.9V9.8c0-.8.3-1.3 1-1.3Z" fill="currentColor"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 6.2c.8 1.8 2.3 3.1 4.3 3.4v2.6c-1.5 0-2.9-.5-4.1-1.3v5.6A5.5 5.5 0 1 1 10.6 11v2.7a2.8 2.8 0 1 0 2 2.7V4h1.4v2.2Z" fill="currentColor"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 9.8v4.4L15 12l-4.5-2.2Z" fill="currentColor"/></svg>`,
  };

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatPhone(value) {
    const n = digits(value);
    const local = n.startsWith("55") ? n.slice(2) : n;
    if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
    if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    return local;
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

  function whatsappUrl(message) {
    const number = digits(wa.number);
    if (!number) return "";
    const text = encodeURIComponent(message || wa.message || `Olá! Vi o perfil da ${brand}.`);
    return `https://wa.me/${number}?text=${text}`;
  }

  function placeText() {
    const street = String(store.address || "").trim();
    const city = [store.city, store.state].filter(Boolean).join(" — ");
    if (street && city) return `${street} · ${city}`;
    return street || city || store.name || brand;
  }

  function mapsUrl() {
    if (store.mapsUrl) return store.mapsUrl;
    const query = [store.name || brand, store.address, store.city, store.state].filter(Boolean).join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function bindShine(el) {
    if (!el) return;
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  }

  els.brand.textContent = brand;
  els.brandFoot.textContent = brand;
  document.title = brand;
  if (cfg.tagline) els.tagline.textContent = cfg.tagline;
  els.year.textContent = String(new Date().getFullYear());

  if (catalog.label) els.catalogLabel.textContent = catalog.label;
  if (catalog.hint) els.catalogHint.textContent = catalog.hint;

  const catalogUrl = String(catalog.url || "").trim();
  const waFallback = whatsappUrl(`Olá! Quero ver o catálogo digital da ${brand}.`);
  els.catalog.href = catalogUrl || waFallback || "#";
  if (catalogUrl) {
    els.catalog.target = "_blank";
  } else if (waFallback) {
    els.catalog.target = "_blank";
    els.catalogHint.textContent = "Peça o estoque pelo WhatsApp";
  }

  const waHref = whatsappUrl();
  if (waHref) {
    els.whatsapp.href = waHref;
    els.whatsappLabel.textContent = formatPhone(wa.number) || "Fale com a loja agora";
  } else {
    els.whatsapp.hidden = true;
  }

  els.placeLine.textContent = placeText();
  els.maps.href = mapsUrl();
  if (store.hours) {
    els.placeHours.hidden = false;
    els.placeHours.textContent = store.hours;
  }

  const phoneDigits = digits(cfg.phone || wa.number);
  if (phoneDigits) {
    els.phone.href = `tel:+${phoneDigits}`;
  } else {
    els.phone.hidden = true;
  }

  const visibleSocials = socials.filter((item) => item && item.url && item.label);
  if (visibleSocials.length) {
    els.socialWrap.hidden = false;
    els.socials.innerHTML = visibleSocials
      .map(
        (item) => `
        <a class="social__btn" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
          ${ICONS[item.id] || ICONS.instagram}
          <span>${item.label}</span>
        </a>`
      )
      .join("");
  }

  if (!navigator.share) {
    els.share.addEventListener("click", () => copy(location.href, "Link copiado"));
  } else {
    els.share.addEventListener("click", async () => {
      try {
        await navigator.share({
          title: brand,
          text: cfg.tagline || brand,
          url: location.href,
        });
      } catch (error) {
        if (error && error.name !== "AbortError") copy(location.href, "Link copiado");
      }
    });
  }

  els.copyAddress.addEventListener("click", () => copy(placeText(), "Endereço copiado"));

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointer.matches) {
    bindShine(els.catalog);
    bindShine(els.whatsapp);
    window.addEventListener(
      "pointermove",
      (event) => {
        document.documentElement.style.setProperty("--spot-x", `${(event.clientX / window.innerWidth) * 100}%`);
        document.documentElement.style.setProperty("--spot-y", `${(event.clientY / window.innerHeight) * 100}%`);
      },
      { passive: true }
    );
  }
})();
