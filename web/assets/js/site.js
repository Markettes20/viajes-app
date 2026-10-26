/* Anillo Travel · interacción de la web (sin librerías) */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");
  var CFG = window.ANILLO || {};

  // Cabecera: fondo sólido al bajar
  var header = d.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("solid", window.scrollY > 40); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  // Menú móvil
  var drawer = d.getElementById("drawer");
  d.querySelectorAll("[data-menu]").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("data-menu") === "open";
      drawer.classList.toggle("open", open);
      d.body.classList.toggle("locked", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) { var c = drawer.querySelector("[data-menu=close]"); c && c.focus(); }
    });
  });
  d.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("open")) d.querySelector("[data-menu=close]").click();
  });

  // Aparición suave al hacer scroll
  var els = d.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 4000);
  } else { els.forEach(function (el) { el.classList.add("in"); }); }

  // Vídeo de portada: solo si no se ha pedido reducir movimiento
  var vid = d.querySelector(".hero video");
  if (vid) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { vid.removeAttribute("autoplay"); vid.pause(); }
    else {
      vid.addEventListener("error", function () { vid.remove(); }, true);
      var p = vid.play && vid.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  // Código del viaje -> app
  function normCode(v) {
    var s = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.length > 3) s = s.slice(0, 3) + "-" + s.slice(3, 8);
    return s;
  }
  d.querySelectorAll(".code-form").forEach(function (f) {
    var inp = f.querySelector("input"), err = f.querySelector(".code-err");
    inp.addEventListener("input", function () { inp.value = normCode(inp.value); if (err) err.textContent = ""; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = normCode(inp.value);
      if (!/^[A-Z0-9]{3}-[A-Z0-9]{5}$/.test(c)) { if (err) err.textContent = "El código tiene 3 letras y 5 caracteres, por ejemplo ANI-7K4P9."; inp.focus(); return; }
      location.href = CFG.app + "?codigo=" + encodeURIComponent(c);
    });
  });

  // Filtro de destinos
  var filters = d.querySelectorAll(".filter");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-filter");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      d.querySelectorAll("[data-tags]").forEach(function (c) {
        c.classList.toggle("hide", t !== "all" && c.getAttribute("data-tags").split(" ").indexOf(t) < 0);
      });
    });
  });

  // Galería ampliable
  d.querySelectorAll("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      var lb = d.createElement("div");
      lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      lb.innerHTML = '<img alt=""><button class="icon-btn" type="button" aria-label="Cerrar">✕</button>';
      lb.querySelector("img").src = b.getAttribute("data-zoom");
      lb.querySelector("img").alt = (b.querySelector("img") || {}).alt || "";
      function close() { lb.remove(); d.body.classList.remove("locked"); b.focus(); d.removeEventListener("keydown", k); }
      function k(e) { if (e.key === "Escape") close(); }
      lb.addEventListener("click", function (e) { if (e.target !== lb.querySelector("img")) close(); });
      d.addEventListener("keydown", k);
      d.body.appendChild(lb); d.body.classList.add("locked"); lb.querySelector("button").focus();
    });
  });

  // Formulario de contacto -> WhatsApp o email
  var form = d.getElementById("contact-form");
  if (form) {
    var msg = form.querySelector(".form-msg");
    function text() {
      var v = function (n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; };
      var lines = ["Hola " + (CFG.agent || "") + ", quiero información para un viaje."];
      if (v("destino")) lines.push("Destino: " + v("destino"));
      if (v("fechas")) lines.push("Fechas: " + v("fechas"));
      if (v("personas")) lines.push("Personas: " + v("personas"));
      if (v("presupuesto")) lines.push("Presupuesto: " + v("presupuesto"));
      if (v("mensaje")) lines.push("", v("mensaje"));
      lines.push("", "Nombre: " + v("nombre"));
      if (v("telefono")) lines.push("Teléfono: " + v("telefono"));
      if (v("email")) lines.push("Email: " + v("email"));
      return lines.join("\n");
    }
    function valid() {
      if (!form.elements.nombre.value.trim()) { msg.textContent = "Escribe tu nombre para que sepamos quién eres."; form.elements.nombre.focus(); return false; }
      return true;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault(); if (!valid()) return;
      msg.textContent = "Abriendo WhatsApp con tu mensaje…";
      window.open("https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(text()), "_blank", "noopener");
    });
    var mailBtn = d.getElementById("send-email");
    mailBtn && mailBtn.addEventListener("click", function () {
      if (!valid()) return;
      msg.textContent = "Abriendo tu programa de correo…";
      location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent("Consulta de viaje · " + (form.elements.destino.value || "Anillo Travel")) + "&body=" + encodeURIComponent(text());
    });
    // ?destino=maldivas rellena el destino
    try { var q = new URLSearchParams(location.search).get("destino"); if (q) form.elements.destino.value = q; } catch (e) {}
  }

  // Mapa: se carga solo al pulsar (sin cookies de Google hasta entonces)
  d.querySelectorAll("[data-map]").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = b.closest(".map"), f = d.createElement("iframe");
      f.src = b.getAttribute("data-map"); f.title = "Mapa de la oficina de Anillo Travel"; f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = ""; box.appendChild(f);
    });
  });

  // Año del pie
  d.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
