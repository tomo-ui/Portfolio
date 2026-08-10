/* =========================================================================
   Tomasz Konwicki — Portfolio
   Logika strony: galeria + filtry, lightbox, cennik, Instagram, formularz.
   ========================================================================= */
(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- SCROLL REVEAL (helper, używany też przez dynamiczne sekcje) ---------------- */
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
  function observeReveal(el) {
    el.classList.add("reveal");
    io.observe(el);
  }

  /* ---------------- ABOUT PHOTO FLIP CARD ---------------- */
  const aboutFlip = document.getElementById("aboutFlip");
  const aboutSection = document.getElementById("o-mnie");
  if (aboutFlip) {
    // Klik/tap — ręczne przełączenie (przydatne na telefonie, dodatkowo do auto-scrolla)
    aboutFlip.addEventListener("click", (e) => {
      e.preventDefault();
      aboutFlip.classList.toggle("about__flip--photo");
    });
  }
  if (aboutFlip && aboutSection) {
    // Auto-odwracanie: zdjęcie pokazuje się dopiero 2 sekundy po tym,
    // jak sekcja "O mnie" wjedzie w widok — a wraca do logo od razu,
    // gdy użytkownik z niej wyjedzie (przewinie dalej lub cofnie).
    let aboutFlipTimer = null;
    const aboutIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            clearTimeout(aboutFlipTimer);
            aboutFlipTimer = setTimeout(() => {
              aboutFlip.classList.add("about__flip--photo");
            }, 2000);
          } else {
            clearTimeout(aboutFlipTimer);
            aboutFlip.classList.remove("about__flip--photo");
          }
        });
      },
      { threshold: 0.4 }
    );
    aboutIO.observe(aboutSection);
  }

  /* ---------------- NAV: scroll state + mobile menu ---------------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  // Połysk "liquid glass" podążający za kursorem — ustawia --glass-x/--glass-y,
  // które czyta .nav::after (radial-gradient) w CSS. Tylko urządzenia z myszką/trackpadem.
  if (window.matchMedia("(hover: hover)").matches) {
    nav.addEventListener("mousemove", (e) => {
      const rect = nav.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      nav.style.setProperty("--glass-x", `${x}%`);
      nav.style.setProperty("--glass-y", `${y}%`);
    });
  }

  const scrollProgress = document.getElementById("scrollProgress");
  const heroLayers = [document.getElementById("heroImgA"), document.getElementById("heroImgB")];
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("nav--scrolled", y > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + "%";

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
  /*
  (function heroSlideshow() {
    const heroModelki = GALLERY.filter((item) => item.category === "modelki").map((item) => item.full);
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

    setInterval(nextSlide, 5000);
  })();
  */

  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.classList.toggle("is-open", open);
    // panel ma wyglądać jak przedłużenie paska nav — wymuś ten sam "szklany" wygląd
    nav.classList.toggle("nav--menu-open", open);
    document.body.classList.toggle("no-scroll", open);
  });

  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      nav.classList.remove("nav--menu-open");
      document.body.classList.remove("no-scroll");
    })
  );

  /* ---------------- GALLERY ---------------- */
  const galleryEl = document.getElementById("gallery");
  const filtersEl = document.getElementById("filters");
  let activeFilter = "all";
  let visibleItems = [];

  function categoryLabelFor(cat) {
    return (typeof CATEGORY_META !== "undefined" && CATEGORY_META.labels[cat]) || cat;
  }

  // Buduje zakładki filtrów na podstawie tego, jakie kategorie faktycznie
  // istnieją w GALLERY — nowa kategoria (nowy folder w images/source/)
  // automatycznie dostaje tu swój przycisk, bez zmian w HTML.
  function buildFilterTabs() {
    const present = [...new Set(GALLERY.map((item) => item.category))];
    const order = (typeof CATEGORY_META !== "undefined" && CATEGORY_META.order) || [];
    present.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    present.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter";
      btn.dataset.filter = cat;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", "false");
      btn.textContent = categoryLabelFor(cat);
      filtersEl.appendChild(btn);
    });
  }
  buildFilterTabs();

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

    galleryEl.querySelectorAll(".gallery__item").forEach(observeReveal);
  }

  // Delegacja zdarzeń — działa też dla zakładek dodanych dynamicznie przez buildFilterTabs()
  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    filtersEl.querySelectorAll(".filter").forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    activeFilter = btn.dataset.filter;
    renderGallery();
  });

  renderGallery();

  /* ---------------- LIGHTBOX (karuzela: poprzedni / aktualny / następny + swipe) ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxViewport = document.getElementById("lightboxViewport");
  const lightboxTrack = document.getElementById("lightboxTrack");
  const lightboxImgPrev = document.getElementById("lightboxImgPrev");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxImgNext = document.getElementById("lightboxImgNext");
  const lightboxCaption = document.getElementById("lightboxCaption");
  let currentIndex = 0;

  function itemAt(offset) {
    const len = visibleItems.length;
    return visibleItems[(currentIndex + offset + len) % len];
  }

  function paintSlides() {
    const prev = itemAt(-1);
    const cur = itemAt(0);
    const next = itemAt(1);
    lightboxImgPrev.src = prev.full;
    lightboxImgPrev.alt = prev.project;
    lightboxImg.src = cur.full;
    lightboxImg.alt = cur.project;
    lightboxImgNext.src = next.full;
    lightboxImgNext.alt = next.project;
    lightboxCaption.textContent = cur.categoryLabel;
  }

  function resetTrackInstant() {
    lightboxTrack.classList.add("no-transition");
    lightboxTrack.classList.remove("is-animating");
    lightboxTrack.style.transform = "translateX(-33.3334%)";
    void lightboxTrack.offsetWidth; // wymuś reflow, żeby kolejna zmiana znów się animowała
    lightboxTrack.classList.remove("no-transition");
  }

  function openLightbox(index) {
    currentIndex = index;
    paintSlides();
    resetTrackInstant();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  // offset: -1 = poprzednie, +1 = następne — animuje przesunięcie toru,
  // dopiero PO animacji podmienia obrazki i błyskawicznie (bez transition) resetuje tor do środka.
  function goTo(offset) {
    if (visibleItems.length < 2) return;
    const target = offset < 0 ? 0 : -66.6668;
    lightboxTrack.classList.add("is-animating");
    lightboxTrack.style.transform = `translateX(${target}%)`;
    const onEnd = () => {
      lightboxTrack.removeEventListener("transitionend", onEnd);
      currentIndex = (currentIndex + offset + visibleItems.length) % visibleItems.length;
      paintSlides();
      resetTrackInstant();
    };
    lightboxTrack.addEventListener("transitionend", onEnd, { once: true });
  }

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.getElementById("lightboxPrev").addEventListener("click", () => goTo(-1));
  document.getElementById("lightboxNext").addEventListener("click", () => goTo(1));
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goTo(-1);
    if (e.key === "ArrowRight") goTo(1);
  });

  // Przesuwanie palcem: podczas gestu tor jedzie 1:1 z palcem, więc widać już
  // kawałek kolejnego/poprzedniego zdjęcia — przesunięcie w lewo -> następne,
  // w prawo -> poprzednie. Po puszczeniu: albo dokończenie zmiany, albo powrót.
  let dragStartX = null;
  let dragDeltaX = 0;
  let isDragging = false;
  const SWIPE_THRESHOLD = 60;

  function dragStart(clientX) {
    isDragging = true;
    dragStartX = clientX;
    dragDeltaX = 0;
    lightboxTrack.classList.add("no-transition");
  }
  function dragMove(clientX) {
    if (!isDragging) return;
    dragDeltaX = clientX - dragStartX;
    lightboxTrack.style.transform = `translateX(calc(-33.3334% + ${dragDeltaX}px))`;
  }
  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    lightboxTrack.classList.remove("no-transition");
    if (dragDeltaX <= -SWIPE_THRESHOLD) {
      goTo(1);
    } else if (dragDeltaX >= SWIPE_THRESHOLD) {
      goTo(-1);
    } else {
      lightboxTrack.classList.add("is-animating");
      lightboxTrack.style.transform = "translateX(-33.3334%)";
    }
    dragDeltaX = 0;
  }

  lightboxViewport.addEventListener("touchstart", (e) => dragStart(e.touches[0].clientX), { passive: true });
  lightboxViewport.addEventListener("touchmove", (e) => dragMove(e.touches[0].clientX), { passive: true });
  lightboxViewport.addEventListener("touchend", dragEnd);
  lightboxViewport.addEventListener("touchcancel", dragEnd);

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
    observeReveal(div);
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
      observeReveal(card);
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

  /* ---------------- SCROLL REVEAL: statyczne sekcje (dynamiczne rejestrują się same przy tworzeniu) ---------------- */
  document
    .querySelectorAll(".section__head, .about__frame, .about__text, .contact__form, .contact__side")
    .forEach(observeReveal);
})();
