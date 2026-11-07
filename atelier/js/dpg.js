/* Gabarit DPG Academy : header, footer, progression, sommaire, menu mobile. */
(function () {
  var TOTAL = 16;
  var STORAGE_KEY = "dpg-academy-step";

  var NAV = [
    { id: "modules", href: "index.html", label: "Modules" },
    { id: "ressources", href: "ressources.html", label: "Ressources" },
    { id: "progression", href: "progression.html", label: "Progression" }
  ];

  var page = document.body.getAttribute("data-nav") || "modules";

  function readStep() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var n = parseInt(raw, 10);
      if (!n || n < 1) return 0;
      return Math.min(TOTAL, n);
    } catch (err) {
      return 0;
    }
  }

  function writeStep(step) {
    if (step < 1) return;
    try {
      var prev = readStep();
      if (step > prev) window.localStorage.setItem(STORAGE_KEY, String(step));
    } catch (err) {
      /* stockage local indisponible */
    }
  }

  function mountHeader() {
    var host = document.getElementById("dpg-header");
    if (!host) return;
    var nav = NAV.map(function (item) {
      var active = item.id === page ? " is-active" : "";
      var current = item.id === page ? ' aria-current="page"' : "";
      return '<a class="dpg-nav-link' + active + '" href="' + item.href + '"' + current + ">" + item.label + "</a>";
    }).join("");

    host.innerHTML =
      '<a class="dpg-skip" href="#contenu">Aller au contenu</a>' +
      '<a class="dpg-brand" href="index.html" aria-label="DPG Academy, accueil">' +
        '<span class="dpg-serif dpg-brand-mark">DPG</span>' +
        '<span class="dpg-brand-rule" aria-hidden="true"></span>' +
        '<span class="dpg-brand-name">Academy</span>' +
      "</a>" +
      '<button class="dpg-nav-toggle" type="button" aria-expanded="false" aria-controls="dpg-primary-nav">' +
        '<span class="dpg-nav-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>' +
        '<span class="dpg-nav-label">Menu</span>' +
      "</button>" +
      '<nav id="dpg-primary-nav" class="dpg-header-nav" aria-label="Navigation principale">' + nav + "</nav>" +
      '<div class="dpg-progress">' +
        '<span class="dpg-progress-label">Module <span data-progress-step>0 / ' + TOTAL + "</span></span>" +
        '<div class="dpg-progress-track" role="img" aria-label="Progression du parcours, étape 0 sur ' + TOTAL + '">' +
          '<div class="dpg-progress-fill" data-progress-fill></div>' +
        "</div>" +
      "</div>";

    var toggle = host.querySelector(".dpg-nav-toggle");
    var menu = host.querySelector(".dpg-header-nav");
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var label = toggle.querySelector(".dpg-nav-label");
      if (label) label.textContent = open ? "Fermer" : "Menu";
    });
  }

  function mountFooter() {
    var host = document.getElementById("dpg-footer");
    if (!host) return;
    host.className = "dpg-footer dpg-section-pad";
    host.innerHTML =
      '<div class="dpg-footer-brand">' +
        '<span class="dpg-serif">DPG</span>' +
        '<span>Academy</span>' +
      "</div>" +
      '<nav class="dpg-footer-nav" aria-label="Liens de pied de page">' +
        '<a class="dpg-nav-link" href="https://www.digitalprocessgrp.com/">Mentions légales</a>' +
        '<a class="dpg-nav-link" href="mailto:contact@digitalprocessgrp.com">Contact</a>' +
        '<a class="dpg-nav-link" href="https://www.digitalprocessgrp.com/">digitalprocessgrp.com</a>' +
      "</nav>" +
      '<p class="dpg-footer-copy">© Digital Process Group</p>';
  }

  function setProgress(step, persist) {
    var clamped = Math.max(0, Math.min(TOTAL, step));
    var pct = Math.round((clamped / TOTAL) * 100);
    var label = document.querySelector("[data-progress-step]");
    var fill = document.querySelector("[data-progress-fill]");
    var track = document.querySelector(".dpg-progress-track");
    if (label) label.textContent = clamped + " / " + TOTAL;
    if (fill) fill.style.width = pct + "%";
    if (track) {
      track.setAttribute(
        "aria-label",
        "Progression du parcours, étape " + clamped + " sur " + TOTAL
      );
    }
    if (persist) writeStep(clamped);
  }

  function buildSommaire() {
    var list = document.querySelector("[data-sommaire-list]");
    if (!list) return;
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-sommaire]"));
    list.innerHTML = "";
    sections.forEach(function (section) {
      if (!section.id) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "dpg-sommaire-link";
      a.href = "#" + section.id;
      var dot = document.createElement("span");
      dot.className = "dpg-dot";
      dot.setAttribute("aria-hidden", "true");
      a.appendChild(dot);
      a.appendChild(document.createTextNode(section.getAttribute("data-sommaire")));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function setActiveLink(id) {
    var links = document.querySelectorAll(".dpg-sommaire-link");
    Array.prototype.forEach.call(links, function (link) {
      var on = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function watchSections() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-step]"));
    if (!sections.length) {
      setProgress(readStep(), false);
      return;
    }

    function activate(section) {
      var step = parseInt(section.getAttribute("data-step"), 10);
      if (!step) return;
      setActiveLink(section.id);
      setProgress(step, true);
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          var visible = entries
            .filter(function (entry) { return entry.isIntersecting; })
            .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
          if (visible[0]) activate(visible[0].target);
        },
        { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4, 0.75] }
      );
      sections.forEach(function (section) { observer.observe(section); });
    }

    var initial = sections[0];
    if (window.location.hash) {
      var fromHash = document.getElementById(window.location.hash.slice(1));
      if (fromHash && fromHash.hasAttribute("data-step")) initial = fromHash;
    }
    activate(initial);

    document.addEventListener("click", function (event) {
      var node = event.target.nodeType === 1 ? event.target : event.target.parentElement;
      var link = node && node.closest ? node.closest(".dpg-sommaire-link") : null;
      if (!link) return;
      var id = (link.getAttribute("href") || "").slice(1);
      var section = document.getElementById(id);
      if (section) activate(section);
    });
  }

  function normalize(value) {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function answerMatches(value, expected) {
    var n = normalize(value);
    if (!n) return null;
    if (expected === "csv") {
      if (n === "59" || n === "59 tokens") return true;
      var csv = /\bcsv\b/.test(n);
      var other = /\b(json|markdown|txt|pdf)\b/.test(n);
      return csv && !other;
    }
    return n === expected;
  }

  function mountExercises() {
    var forms = document.querySelectorAll("[data-exercise]");
    Array.prototype.forEach.call(forms, function (form) {
      var expected = form.getAttribute("data-answer") || "";
      var input = form.querySelector(".dpg-input");
      var live = form.querySelector("[data-exercise-live]");
      var ok = form.querySelector(".dpg-status-ok");
      var ko = form.querySelector(".dpg-status-ko");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var result = answerMatches(input.value, expected);
        ok.classList.remove("is-current");
        ko.classList.remove("is-current");
        if (result === null) {
          input.setAttribute("aria-invalid", "true");
          if (live) live.textContent = "Indiquez une réponse avant de vérifier.";
          return;
        }
        input.setAttribute("aria-invalid", result ? "false" : "true");
        var card = result ? ok : ko;
        card.classList.add("is-current");
        if (live) live.textContent = card.innerText.replace(/\s+/g, " ").trim();
      });
    });
  }

  function mountProgressionPage() {
    var list = document.querySelector("[data-progress-list]");
    if (!list) return;
    var saved = readStep();
    var items = list.querySelectorAll("[data-step-n]");
    Array.prototype.forEach.call(items, function (item) {
      var n = parseInt(item.getAttribute("data-step-n"), 10);
      var done = n <= saved && saved > 0;
      item.classList.toggle("is-done", done);
      var meta = item.querySelector("[data-step-state]");
      if (meta) meta.textContent = done ? "Vu" : "À parcourir";
    });
    var summary = document.querySelector("[data-progress-summary]");
    if (summary) {
      summary.textContent = saved
        ? "Dernière étape atteinte : " + saved + " / " + TOTAL + "."
        : "Aucune étape enregistrée dans ce navigateur.";
    }
  }

  mountHeader();
  mountFooter();
  buildSommaire();
  watchSections();
  mountExercises();
  mountProgressionPage();

  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      var menu = document.getElementById("dpg-primary-nav");
      var toggle = document.querySelector(".dpg-nav-toggle");
      if (menu) menu.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        var label = toggle.querySelector(".dpg-nav-label");
        if (label) label.textContent = "Menu";
      }
    }
  });
})();
