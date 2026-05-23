/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

"use strict";

/* ─────────────────────────────────────────
   1. NAVBAR: scroll shadow + active link
───────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const navLinks = document.querySelectorAll(".nav-link, .nav-cta");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  // Scroll: add "scrolled" class
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
    updateActiveLink();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // init

  // Hamburger toggle
  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  // Close mobile menu on link click
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", false);
    });
  });

  // Active nav link based on scroll position
  function updateActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove("active-link");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active-link");
      }
    });
  }
})();

/* ─────────────────────────────────────────
   2. REVEAL ON SCROLL (Intersection Observer)
───────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay for sibling elements
          const siblings = [
            ...entry.target.parentElement.querySelectorAll(".reveal"),
          ];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 400);

          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ─────────────────────────────────────────
   3. SKILL BARS ANIMATION
───────────────────────────────────────── */
(function initSkillBars() {
  const fills = document.querySelectorAll(".skill-fill");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.getAttribute("data-width") || "0";
          fill.style.width = width + "%";
          observer.unobserve(fill);
        }
      });
    },
    { threshold: 0.4 },
  );

  fills.forEach((fill) => observer.observe(fill));
})();

/* ─────────────────────────────────────────
   4. PROJECT FILTER
───────────────────────────────────────── */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      // Active button state
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter cards with fade effect
      cards.forEach((card) => {
        const category = card.getAttribute("data-category");
        const show = filter === "all" || category === filter;

        if (show) {
          card.classList.remove("hidden");
          // Re-trigger animation
          card.style.opacity = "0";
          card.style.transform = "translateY(16px)";
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
              card.style.transition = "opacity .4s ease, transform .4s ease";
            }, 20);
          });
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
})();

/* ─────────────────────────────────────────
   5. CONTACT FORM VALIDATION
───────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const fields = {
    name: {
      el: document.getElementById("name"),
      error: document.getElementById("nameError"),
    },
    email: {
      el: document.getElementById("email"),
      error: document.getElementById("emailError"),
    },
    subject: {
      el: document.getElementById("subject"),
      error: document.getElementById("subjectError"),
    },
    message: {
      el: document.getElementById("message"),
      error: document.getElementById("messageError"),
    },
  };

  const submitBtn = document.getElementById("submitBtn");
  const successMsg = document.getElementById("formSuccess");

  function validateField(name, el) {
    const value = el.value.trim();
    if (!value) return `${capitalise(name)} tidak boleh kosong.`;
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Masukkan alamat email yang valid.";
    }
    if (name === "message" && value.length < 20) {
      return "Pesan minimal 20 karakter.";
    }
    return "";
  }

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showError(fieldName, msg) {
    const { el, error } = fields[fieldName];
    error.textContent = msg;
    el.classList.toggle("error", !!msg);
  }

  // Inline validation on blur
  Object.entries(fields).forEach(([name, { el }]) => {
    el.addEventListener("blur", () => {
      const msg = validateField(name, el);
      showError(name, msg);
    });
    el.addEventListener("input", () => {
      if (el.classList.contains("error")) {
        const msg = validateField(name, el);
        showError(name, msg);
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all
    let hasError = false;
    Object.entries(fields).forEach(([name, { el }]) => {
      const msg = validateField(name, el);
      showError(name, msg);
      if (msg) hasError = true;
    });
    if (hasError) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-text").textContent = "Mengirim...";

    /* ──────────────────────────────────────────────────────
       INTEGRASI: Ganti blok setTimeout di bawah dengan
       fetch ke backend / Formspree / EmailJS Anda.
       Contoh Formspree:
       ──────────────────────────────────────────────────────
       const res = await fetch('https://formspree.io/f/YOUR_ID', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name: fields.name.el.value,
           email: fields.email.el.value,
           subject: fields.subject.el.value,
           message: fields.message.el.value,
         }),
       });
       ────────────────────────────────────────────────────── */

    // Simulasi kirim (2 detik) — hapus ini saat integrasi nyata
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Success
    form.reset();
    submitBtn.disabled = false;
    submitBtn.querySelector(".btn-text").textContent = "Kirim Pesan";
    successMsg.classList.add("show");

    setTimeout(() => successMsg.classList.remove("show"), 6000);
  });
})();

/* ─────────────────────────────────────────
   6. BACK TO TOP BUTTON
───────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ─────────────────────────────────────────
   7. FOOTER YEAR
───────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

/* ─────────────────────────────────────────
   8. SMOOTH ANCHOR SCROLL
   (handles offset for fixed navbar)
───────────────────────────────────────── */
(function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

/* ─────────────────────────────────────────
   9. HERO PARALLAX (subtle)
───────────────────────────────────────── */
(function initParallax() {
  const bgText = document.querySelector(".hero-bg-text");
  if (!bgText) return;

  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY;
      bgText.style.transform = `translateY(${scrollY * 0.25}px)`;
    },
    { passive: true },
  );
})();
