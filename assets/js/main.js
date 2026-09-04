(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dot");
  var i = 0, timer;
  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    dots.forEach(function (d, k) {
      d.classList.toggle("active", k === i);
      if (k === i) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }
  function play() {
    if (reduce || slides.length < 2) return;
    timer = setInterval(function () { show(i + 1); }, 4500);
  }
  dots.forEach(function (d, k) {
    d.addEventListener("click", function () {
      clearInterval(timer);
      show(k);
      play();
    });
  });
  play();

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.querySelectorAll("[data-en]").forEach(function (el) {
    if (!el.dataset.fr) el.dataset.fr = el.innerHTML;
  });
  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      document.documentElement.lang = lang;
      document.querySelectorAll("[data-lang]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      document.querySelectorAll("[data-en]").forEach(function (el) {
        el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.fr;
      });
    });
  });

  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var body = "Nom: " + (fd.get("name") || "") + "\nEmail: " + (fd.get("email") || "") +
        "\nOrganisation: " + (fd.get("org") || "") + "\n\n" + (fd.get("message") || "");
      window.location.href = "mailto:imanelahlou9703@outlook.com?subject=" +
        encodeURIComponent("Contact Digital Process Group") + "&body=" + encodeURIComponent(body);
    });
  }
})();
