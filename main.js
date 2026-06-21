/* =====================================================================
   Martin Le Lanno — Portfolio
   Shared interaction layer (vanilla JS, no dependencies)
   ===================================================================== */

(function () {
  "use strict";

  const root = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme + Language (apply ASAP, before paint where possible) ---------- */
  const savedTheme = localStorage.getItem("portfolioTheme") || "dark";
  const savedLang = localStorage.getItem("portfolioLang") || "fr";
  root.setAttribute("data-theme", savedTheme);
  root.setAttribute("lang", savedLang);

  function syncThemeIcon() {
    const icon = document.querySelector("#theme-toggle i");
    if (!icon) return;
    const isLight = root.getAttribute("data-theme") === "light";
    icon.className = isLight ? "fas fa-sun" : "fas fa-moon";
  }

  window.toggleTheme = function () {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("portfolioTheme", next);
    syncThemeIcon();
  };

  window.toggleLanguage = function () {
    const next = root.getAttribute("lang") === "fr" ? "en" : "fr";
    root.setAttribute("lang", next);
    localStorage.setItem("portfolioLang", next);
  };

  /* ---------- DOM ready ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    syncThemeIcon();
    initBurger();
    initReveal();
    initScrollProgress();
    initActiveNav();
    initCounters();
    initTilt();
    initMagnetic();
    initModal();
    initParallaxHero();
    initToTop();
    document.body.classList.add("is-loaded");
  });

  /* ---------- Mobile burger ---------- */
  function initBurger() {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-content");
    if (!burger || !nav) return;

    const close = () => {
      nav.classList.remove("nav-active");
      burger.classList.remove("toggle");
      document.body.classList.remove("nav-open");
    };

    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("nav-active");
      burger.classList.toggle("toggle", open);
      document.body.classList.toggle("nav-open", open);
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", close);
    });
  }

  /* ---------- Scroll reveal (staggered) ---------- */
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    if (prefersReduced) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
  }

  /* ---------- Scroll progress bar ---------- */
  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.transform = `scaleX(${pct / 100})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Active nav section highlight ---------- */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".nav-links a[href*='#']"));
    const map = new Map();
    links.forEach((l) => {
      const id = l.getAttribute("href").split("#")[1];
      const target = id && document.getElementById(id);
      if (target) map.set(target, l);
    });
    if (!map.size) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            const link = map.get(entry.target);
            if (link) link.classList.add("active");
          }
        });
      },
      { threshold: 0.4, rootMargin: "-20% 0px -40% 0px" }
    );
    map.forEach((_, section) => io.observe(section));
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const prefix = el.getAttribute("data-prefix") || "";
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      };
      requestAnimationFrame(step);
    };

    if (prefersReduced) {
      counters.forEach((el) => {
        el.textContent =
          (el.getAttribute("data-prefix") || "") +
          el.getAttribute("data-count") +
          (el.getAttribute("data-suffix") || "");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- 3D tilt on cards ---------- */
  function initTilt() {
    if (prefersReduced || window.matchMedia("(hover: none)").matches) return;
    const cards = document.querySelectorAll("[data-tilt]");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-6px)`;
        card.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
        card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (prefersReduced || window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Hero subtle parallax ---------- */
  function initParallaxHero() {
    if (prefersReduced) return;
    const layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length) return;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        layers.forEach((l) => {
          const speed = parseFloat(l.getAttribute("data-parallax")) || 0.2;
          l.style.transform = `translateY(${y * speed}px)`;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    const btn = document.querySelector(".to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("visible", window.scrollY > 600);
      },
      { passive: true }
    );
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Image modal (transcript / docs) ---------- */
  function initModal() {
    const modal = document.getElementById("modal-notes");
    const modalImg = document.getElementById("img-notes");
    if (!modal || !modalImg) return;
    const close = modal.querySelector(".close");

    document.querySelectorAll(".link-doc").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        modalImg.src = this.href;
        modal.classList.add("open");
      });
    });

    const hide = () => modal.classList.remove("open");
    if (close) close.addEventListener("click", hide);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hide();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });
  }
})();
