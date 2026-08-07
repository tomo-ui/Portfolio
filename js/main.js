/* =========================================================================
   Tomasz Konwicki — Portfolio
   Logika strony: galeria + filtry, lightbox, cennik, Instagram, formularz.
   ========================================================================= */
(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- NAV: scroll state + mobile menu ---------------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  const scrollProgress = document.getElementById("scrollProgress");
  const heroLayers = [document.getElementById("heroImgA"), document.getElementById("heroImgB")];
  const heroSection = document.querySelector(".hero");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("nav--scrolled", y > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + "%";

    if (heroSection) {
      const heroHeight = heroSection.offsetHeight;
      if (y < heroHeight) {
        const parallax = y * 0.35;
        heroLayers.forEach((el) => {
          if (el) el.style.transform = `scale(1.06) translateY(${parallax}px)`;
        });
      }
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------------- HERO SLIDESHOW — wyłączony na życzenie (zdjęcie hero jest statyczne) ----------------
     Żeby przywrócić automatyczną zmianę zdjęć hero co 5 sekund (tylko z kategorii "modelki"),
     usuń komentarz z bloku poniżej.
  */
  
  (function heroSlideshow() {
  const SLIDESHOW_COUNT = 8; // ← ustaw ile masz zdjęć
  const heroModelki = Array.from({ length: SLIDESHOW_COUNT }, (_, i) => 
    `/images/slideshow/slideshow_${i + 1}.png`
  );

  if (heroModelki.length < 2) return;

  const startSrc = heroLayers[0].getAttribute("src");
  let startIndex = heroModelki.findIndex((src) => src === startSrc);
  if (startIndex === -1) startIndex = 0;

  let activeLayer = 0;
  const ordered = heroModelki.slice(startIndex).concat(heroModelki.slice(0, startIndex));
  let pos = 0;

  function preload(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  async function nextSlide() {
    pos = (pos + 1) % ordered.length;
    const nextSrc = ordered[pos];
    const inactiveLayer = heroLayers[1 - activeLayer];
    await preload(nextSrc);
    inactiveLayer.setAttribute("src", nextSrc);
    void inactiveLayer.offsetWidth;
    heroLayers[activeLayer].classList.remove("is-active");
    inactiveLayer.classList.add("is-active");
    activeLayer = 1 - activeLayer;
  }

  setInterval(nextSlide, 10000);
})();
  

  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.classList.toggle("is-open", open);
  });

  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------------- GALLERY ---------------- */
  const galleryEl = document.getElementById("gallery");
  const filters = document.querySelectorAll(".filter");
  let activeFilter = "all";
  let visibleItems = [];

  function frameLabel(item, indexInAll) {
    // Contact-sheet style frame number, e.g. "07A"
    const n = String(indexInAll + 1).padStart(2, "0");
    const letter = item.category.charAt(0).toUpperCase();
    return `${n}${letter}`;
  }

  function renderGallery() {
    galleryEl.innerHTML = "";
    visibleItems = GALLERY.filter(
      (item) => activeFilter === "all" || item.category === activeFilter
    );

    visibleItems.forEach((item, i) => {
      const fig = document.createElement("figure");
      fig.className = "frame gallery__item";
      fig.style.setProperty("--aspect", (item.h / item.w).toFixed(4));
      fig.style.transitionDelay = `${(i % 6) * 70}ms`;
      fig.innerHTML = `
        <button class="gallery__btn" data-index="${i}" aria-label="Powiększ: ${item.project}">
          <img src="${item.thumb}" alt="${item.project}" loading="lazy" width="${item.w}" height="${item.h}">
        </button>
        <figcaption class="frame__tag">
          <span>${item.categoryLabel}</span>
          <span>${frameLabel(item, i)}</span>
        </figcaption>
      `;
      galleryEl.appendChild(fig);
    });

    galleryEl.querySelectorAll(".gallery__btn").forEach((btn) => {
      btn.addEventListener("click", () => openLightbox(Number(btn.dataset.index)));
    });
  }

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      activeFilter = btn.dataset.filter;
      renderGallery();
    });
  });

  renderGallery();

  /* ---------------- LIGHTBOX ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function updateLightbox() {
    const item = visibleItems[currentIndex];
    lightboxImg.src = item.full;
    lightboxImg.alt = item.project;
    lightboxCaption.textContent = `${item.project} — ${item.categoryLabel}`;
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.getElementById("lightboxPrev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightbox();
  });
  document.getElementById("lightboxNext").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") document.getElementById("lightboxPrev").click();
    if (e.key === "ArrowRight") document.getElementById("lightboxNext").click();
  });

  /* ---------------- INSTAGRAM PREVIEW ---------------- */
  const igGrid = document.getElementById("igGrid");
  INSTAGRAM_PREVIEW.forEach((post) => {
    const div = document.createElement("a");
    div.className = "ig-tile";
    div.href = "https://instagram.com/tokonwicki";
    div.target = "_blank";
    div.rel = "noopener";
    div.innerHTML = `
      <img src="${post.image}" alt="${post.caption}" loading="lazy">
      <span class="ig-tile__overlay">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1"/></svg>
        <span>${post.caption}</span>
      </span>
    `;
    igGrid.appendChild(div);
  });

  /* ---------------- TESTIMONIALS (auto-rotating, fade + slide) ---------------- */
  const testimonialText = document.getElementById("testimonialText");
  const testimonialAuthor = document.getElementById("testimonialAuthor");
  const testimonialTrack = document.getElementById("testimonialTrack");
  const testimonialDots = document.getElementById("testimonialDots");
  let testimonialIndex = 0;
  let testimonialTimer = null;

  function paintTestimonial(i) {
    const t = TESTIMONIALS[i];
    testimonialText.textContent = `„${t.quote}”`;
    testimonialAuthor.textContent = t.author;
    testimonialDots.querySelectorAll("span").forEach((d, di) => d.classList.toggle("is-active", di === i));
  }

  function buildDots() {
    testimonialDots.innerHTML = "";
    TESTIMONIALS.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.addEventListener("click", () => goToTestimonial(i));
      testimonialDots.appendChild(dot);
    });
  }

  function goToTestimonial(i) {
    testimonialTrack.classList.add("is-leaving");
    window.setTimeout(() => {
      testimonialIndex = i;
      paintTestimonial(testimonialIndex);
      testimonialTrack.classList.remove("is-leaving");
      testimonialTrack.classList.add("is-entering");
      requestAnimationFrame(() => {
        testimonialTrack.classList.remove("is-entering");
      });
    }, 550);
    resetTestimonialTimer();
  }

  function nextTestimonial() {
    goToTestimonial((testimonialIndex + 1) % TESTIMONIALS.length);
  }

  function resetTestimonialTimer() {
    if (testimonialTimer) clearInterval(testimonialTimer);
    testimonialTimer = setInterval(nextTestimonial, 5500);
  }

  if (TESTIMONIALS && TESTIMONIALS.length) {
    buildDots();
    paintTestimonial(0);
    resetTestimonialTimer();
  }

  /* ---------------- PRICING ---------------- */
  const pricingGrid = document.getElementById("pricingGrid");
  const pricingTabs = document.querySelectorAll(".pricing__tab");
  const packageSelect = document.getElementById("package");
  let activeGroup = "foto";

  function packageOptionValue(pkg) {
    return `${pkg.name} (${pkg.price})`;
  }

  // Generuje listę pakietów w formularzu kontaktowym na podstawie PRICING —
  // dzięki temu zmiana cen/pakietów w js/data.js automatycznie aktualizuje formularz.
  function buildPackageOptions() {
    packageSelect.innerHTML = "";

    const groupFoto = document.createElement("optgroup");
    groupFoto.label = "Sesje zdjęciowe";
    PRICING.foto.forEach((pkg) => {
      const opt = document.createElement("option");
      opt.value = packageOptionValue(pkg);
      opt.textContent = `${pkg.name} — ${pkg.price}`;
      groupFoto.appendChild(opt);
    });
    packageSelect.appendChild(groupFoto);

    const groupGrafika = document.createElement("optgroup");
    groupGrafika.label = "Grafika i branding";
    PRICING.grafika.forEach((pkg) => {
      const opt = document.createElement("option");
      opt.value = packageOptionValue(pkg);
      opt.textContent = `${pkg.name} — ${pkg.price}`;
      groupGrafika.appendChild(opt);
    });
    packageSelect.appendChild(groupGrafika);

    ["Plan zdjęciowy / teledysk", "Jeszcze nie wiem / inne"].forEach((label) => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      packageSelect.appendChild(opt);
    });
  }

  buildPackageOptions();

  function renderPricing() {
    pricingGrid.innerHTML = "";
    PRICING[activeGroup].forEach((pkg, i) => {
      const card = document.createElement("article");
      card.className = "price-card" + (pkg.featured ? " price-card--featured" : "");
      card.style.transitionDelay = `${i * 90}ms`;
      card.innerHTML = `
        ${pkg.featured ? '<span class="price-card__badge">Polecane</span>' : ""}
        <h3 class="price-card__name">${pkg.name}</h3>
        <p class="price-card__price">${pkg.price} <span>${pkg.unit}</span></p>
        <p class="price-card__desc">${pkg.desc}</p>
        <ul class="price-card__features">
          ${pkg.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>
        <a href="#kontakt" class="btn ${pkg.featured ? "btn--primary" : "btn--ghost"} btn--full" data-package="${packageOptionValue(pkg)}">Zapytaj o termin</a>
      `;
      pricingGrid.appendChild(card);
    });

    // Klik w "Zapytaj o termin" na karcie od razu ustawia ten pakiet w formularzu kontaktowym
    pricingGrid.querySelectorAll("[data-package]").forEach((link) => {
      link.addEventListener("click", () => {
        packageSelect.value = link.dataset.package;
      });
    });
  }

  pricingTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      pricingTabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      activeGroup = tab.dataset.group;
      renderPricing();
    });
  });

  renderPricing();

  /* ---------------- CONTACT FORM ---------------- */
  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      package: form.package.value,
      message: form.message.value.trim()
    };

    if (!data.name || !data.email || !data.message) return;

    if (FORM_ENDPOINT) {
      // Wysyłka przez Formspree (lub inny endpoint) — patrz js/data.js
      submitBtn.disabled = true;
      submitBtn.textContent = "Wysyłanie…";
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          form.reset();
          formNote.textContent = "Dziękuję! Wiadomość została wysłana — odezwę się najszybciej jak to możliwe.";
          formNote.classList.add("field__note--success");
        } else {
          throw new Error("send-failed");
        }
      } catch (err) {
        formNote.textContent = `Coś poszło nie tak. Napisz proszę bezpośrednio na ${CONTACT_EMAIL}.`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Wyślij wiadomość";
      }
    } else {
      // Brak skonfigurowanego endpointu — otwórz klienta pocztowego z gotową treścią
      const subject = encodeURIComponent(`Zapytanie ze strony — ${data.package}`);
      const body = encodeURIComponent(
        `Imię i nazwisko: ${data.name}\nE-mail: ${data.email}\nZainteresowanie: ${data.package}\n\nWiadomość:\n${data.message}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    }
  });

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealTargets = document.querySelectorAll(
    ".section__head, .about__frame, .about__text, .gallery__item, .price-card, .contact__form, .contact__side, .ig-tile"
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });

  // Re-observe gallery items whenever filter changes
  const galleryObserverPatch = () => {
    document.querySelectorAll(".gallery__item").forEach((el) => {
      el.classList.add("reveal", "is-visible");
    });
  };
  filters.forEach((btn) => btn.addEventListener("click", () => setTimeout(galleryObserverPatch, 0)));
})();
