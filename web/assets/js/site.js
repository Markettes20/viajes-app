/* Anillo Travel · interacción de la web
   Sin librerías salvo d3-geo (globo) y Leaflet (mapas 2D), que se cargan solo en las páginas que los usan. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");
  var CFG = window.ANILLO || {};
  var REDUCE = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  function $$(s, el) { return Array.prototype.slice.call((el || d).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
  };

  // Cabecera: fondo sólido al bajar
  var header = d.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("solid", window.scrollY > 40); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  // Barra de scroll fina superpuesta (la nativa está oculta para que fotos y vídeos lleguen al borde)
  (function () {
    var bar = d.querySelector(".sbar"); if (!bar) return;
    var th = bar.querySelector("i"), hideT, drag = null;
    function geo() {
      var vh = window.innerHeight, sh = Math.max(d.documentElement.scrollHeight, vh);
      var h = Math.max(36, vh * vh / sh), max = vh - h - 8;
      return { vh: vh, sh: sh, h: h, max: max, top: 4 + (sh > vh ? (window.scrollY / (sh - vh)) * max : 0) };
    }
    function draw(show) {
      var g = geo();
      bar.classList.toggle("hidden", g.sh <= g.vh + 2);
      th.style.height = g.h + "px"; th.style.top = g.top + "px";
      if (show) { bar.classList.add("on"); clearTimeout(hideT); hideT = setTimeout(function () { if (!drag && !bar.matches(":hover")) bar.classList.remove("on"); }, 1100); }
    }
    window.addEventListener("scroll", function () { draw(true); }, { passive: true });
    window.addEventListener("resize", function () { draw(false); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { draw(false); }).observe(d.body);
    bar.addEventListener("mouseenter", function () { bar.classList.add("on"); });
    bar.addEventListener("mouseleave", function () { if (!drag) draw(true); });
    bar.addEventListener("pointerdown", function (e) {
      var g = geo(), y = e.clientY;
      if (y < g.top || y > g.top + g.h) window.scrollTo(0, ((y - g.h / 2 - 4) / g.max) * (g.sh - g.vh)); // clic en la pista
      g = geo(); drag = { y: e.clientY, s: window.scrollY, k: (g.sh - g.vh) / g.max };
      bar.classList.add("drag"); bar.setPointerCapture(e.pointerId); e.preventDefault();
    });
    bar.addEventListener("pointermove", function (e) { if (drag) window.scrollTo(0, drag.s + (e.clientY - drag.y) * drag.k); });
    function end() { drag = null; bar.classList.remove("drag"); draw(true); }
    bar.addEventListener("pointerup", end); bar.addEventListener("pointercancel", end);
    draw(false);
  })();

  // Menú móvil
  var drawer = d.getElementById("drawer");
  $$("[data-menu]").forEach(function (b) {
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
  var els = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 4000);
  } else { els.forEach(function (el) { el.classList.add("in"); }); }

  // Vídeos de portada: secuencia 1, 2, 3… y vuelta a empezar, con el lugar abajo a la derecha
  (function () {
    var box = d.querySelector(".hero-media[data-videos]"); if (!box) return;
    var list; try { list = JSON.parse(box.getAttribute("data-videos")); } catch (e) { return; }
    var place = d.querySelector(".hero-place span"), placeBox = d.querySelector(".hero-place"), dots = $$(".hero-dots i");
    function label(i) {
      if (!place) return;
      placeBox.classList.add("fade");
      setTimeout(function () { place.textContent = list[i].t; placeBox.classList.remove("fade"); }, 350);
      dots.forEach(function (x, k) { x.classList.toggle("on", k === i); });
    }
    dots.forEach(function (x, k) { x.classList.toggle("on", k === 0); });
    if (REDUCE) return;
    var conn = navigator.connection || {};
    if (conn.saveData) return;
    var big = (window.innerWidth * (window.devicePixelRatio || 1)) > 1500;
    function mk() {
      var v = d.createElement("video");
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
      v.preload = "auto"; v.setAttribute("aria-hidden", "true");
      box.appendChild(v); return v;
    }
    var A = mk(), B = mk(), cur = A, i = 0, failed = 0;
    function srcOf(k) { return big ? list[k].l : list[k].s; }
    function load(v, k) { v.src = srcOf(k); v.poster = list[k].p; v.load(); }
    function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    load(A, 0);
    A.addEventListener("canplay", function first() { A.removeEventListener("canplay", first); A.classList.add("show"); play(A); load(B, 1 % list.length); });
    play(A);
    function next() {
      var nxt = cur === A ? B : A, k = (i + 1) % list.length;
      if (nxt.readyState < 2) { nxt.addEventListener("canplay", function w() { nxt.removeEventListener("canplay", w); next(); }); return; }
      i = k; play(nxt); nxt.classList.add("show"); cur.classList.remove("show"); label(i);
      var old = cur; cur = nxt;
      setTimeout(function () { old.pause(); load(old, (i + 1) % list.length); }, 1300);
    }
    [A, B].forEach(function (v) {
      v.addEventListener("ended", function () { if (v === cur) next(); });
      v.addEventListener("error", function () { if (++failed > 3) { A.remove(); B.remove(); } });
    });
    // Si el vídeo no se ve (pestaña oculta), se pausa
    d.addEventListener("visibilitychange", function () { if (d.hidden) cur.pause(); else play(cur); });
  })();

  // Código del viaje -> app
  function normCode(v) {
    var s = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.length > 3) s = s.slice(0, 3) + "-" + s.slice(3, 8);
    return s;
  }
  $$(".code-form").forEach(function (f) {
    var inp = f.querySelector("input"), err = f.querySelector(".code-err");
    inp.addEventListener("input", function () { inp.value = normCode(inp.value); if (err) err.textContent = ""; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = normCode(inp.value);
      if (!/^[A-Z0-9]{3}-[A-Z0-9]{5}$/.test(c)) { if (err) err.textContent = "El código tiene el formato AAA-XXXXX: 3 letras, un guion y 5 caracteres."; inp.focus(); return; }
      location.href = CFG.app + "?codigo=" + encodeURIComponent(c);
    });
  });

  // ---------- Globo terráqueo ----------
  var GLOBE = null;
  function initGlobe(el) {
    if (!window.d3 || !d3.geoOrthographic) return;
    var data; try { data = JSON.parse(el.querySelector(".globe-data").textContent); } catch (e) { return; }
    var canvas = el.querySelector("canvas"), ctx = canvas.getContext("2d");
    var card = el.querySelector(".globe-card"), intro = el.querySelector(".globe-intro");
    var VLC = [-0.376, 39.47];
    var proj = d3.geoOrthographic().clipAngle(90).precision(0.5), path = d3.geoPath(proj, ctx);
    var grat = d3.geoGraticule10(), sphere = { type: "Sphere" }, land = null;
    var rot = [-30, -22, 0], size = 0, dpr = 1, active = null, hover = null, lit = null, filter = "all";
    var dragging = false, last = 0, idle = 0, anim = null, t0 = performance.now();
    fetch(el.getAttribute("data-land")).then(function (r) { return r.json(); }).then(function (topo) {
      land = d3.feature(topo, topo.objects.land); draw();
    }).catch(function () {});
    function resize() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      size = r.width; canvas.width = size * dpr; canvas.height = size * dpr;
      proj.translate([size / 2, size / 2]).scale(size / 2 - 6); draw();
    }
    function visible(ll) { return d3.geoDistance(ll, [-rot[0], -rot[1]]) < Math.PI / 2 - 0.05; }
    function on(p) { return filter === "all" || p.tags.indexOf(filter) >= 0; }
    function draw() {
      if (!size) return;
      var now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
      proj.rotate(rot);
      // océano
      var g = ctx.createRadialGradient(size * .38, size * .32, size * .05, size / 2, size / 2, size / 2);
      g.addColorStop(0, "#1E5479"); g.addColorStop(1, "#0B2E4A");
      ctx.beginPath(); path(sphere); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); path(grat); ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1; ctx.stroke();
      if (land) { ctx.beginPath(); path(land); ctx.fillStyle = "#E8DCC8"; ctx.fill(); ctx.strokeStyle = "rgba(10,42,67,.35)"; ctx.lineWidth = .6; ctx.stroke(); }
      // borde y brillo
      ctx.beginPath(); path(sphere); ctx.strokeStyle = "rgba(230,194,126,.55)"; ctx.lineWidth = 1.2; ctx.stroke();
      // vuelo desde Valencia hasta el destino elegido
      var sel = active || hover;
      if (sel) {
        ctx.beginPath(); path({ type: "LineString", coordinates: [VLC, [sel.ll[1], sel.ll[0]]] });
        ctx.setLineDash([3, 5]); ctx.strokeStyle = "rgba(200,105,74,.95)"; ctx.lineWidth = 1.8; ctx.stroke(); ctx.setLineDash([]);
      }
      if (visible(VLC)) { var v = proj(VLC); ctx.beginPath(); ctx.arc(v[0], v[1], 3.2, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); ctx.font = "700 11px Figtree, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillText("Valencia", v[0] + 6, v[1] + 4); }
      // puntos de destino
      var pulse = (Math.sin((now - t0) / 380) + 1) / 2;
      data.forEach(function (p) {
        var ll = [p.ll[1], p.ll[0]]; if (!visible(ll)) return;
        var xy = proj(ll), ok = on(p), isA = p === active, isH = p === hover || p.slug === lit;
        if (!ok) { ctx.beginPath(); ctx.arc(xy[0], xy[1], 3, 0, 7); ctx.fillStyle = "rgba(169,186,203,.45)"; ctx.fill(); return; }
        var hi = filter !== "all";
        var r = isA ? 7 : (isH ? 6.5 : 5);
        ctx.beginPath(); ctx.arc(xy[0], xy[1], r + 5 + pulse * (hi || isA ? 7 : 4), 0, 7);
        ctx.fillStyle = (isA || hi) ? "rgba(200,105,74," + (0.35 - pulse * 0.25) + ")" : "rgba(230,194,126," + (0.3 - pulse * 0.2) + ")"; ctx.fill();
        ctx.beginPath(); ctx.arc(xy[0], xy[1], r, 0, 7);
        ctx.fillStyle = (isA || hi) ? "#C8694A" : "#E6C27E"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
        if (isA || isH || hi) {
          ctx.font = "700 " + (isA ? 13 : 12) + "px Figtree, sans-serif";
          var w = ctx.measureText(p.name).width + 14, x = xy[0] + 10, y = xy[1] - 22;
          if (x + w > size) x = xy[0] - w - 10;
          ctx.fillStyle = isA ? "#C8694A" : "rgba(6,26,43,.82)"; roundRect(x, y, w, 20, 6); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.fillText(p.name, x + 7, y + 14);
        }
      });
    }
    function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function hit(mx, my) {
      var best = null, bd = 18;
      data.forEach(function (p) { var ll = [p.ll[1], p.ll[0]]; if (!visible(ll) || !on(p)) return; var xy = proj(ll), dd = Math.hypot(xy[0] - mx, xy[1] - my); if (dd < bd) { bd = dd; best = p; } });
      return best;
    }
    function rotateTo(p) {
      var from = rot.slice(), to = [-p.ll[1], -p.ll[0] * 0.8, 0], start = performance.now(), dur = REDUCE ? 1 : 1100;
      var dl = ((to[0] - from[0] + 540) % 360) - 180; to[0] = from[0] + dl;
      anim = function (now) { var k = Math.min(1, (now - start) / dur), e2 = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; rot = [from[0] + (to[0] - from[0]) * e2, from[1] + (to[1] - from[1]) * e2, 0]; if (k >= 1) anim = null; };
    }
    function show(p) {
      active = p; idle = performance.now();
      if (!p) { card.hidden = true; intro.hidden = false; return; }
      rotateTo(p);
      var facts = p.facts.map(function (f) { return "<div><small>" + esc(f[0]) + "</small><b>" + esc(f[1]) + "</b></div>"; }).join("");
      var must = p.must.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("");
      var msg = encodeURIComponent("Hola " + (CFG.agent || "") + ", me interesa un viaje a " + p.name + ".");
      card.innerHTML = '<div class="gc-img"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '">' +
        (p.price ? '<span class="price-tag gc-price"><small>Desde</small> ' + esc(p.price) + "</span>" : "") +
        '<button class="gc-close" type="button" aria-label="Volver a la lista">' + ICON.close + '</button>' +
        '<div class="gc-title"><span class="dest-region">' + esc(p.region) + "</span><h3>" + esc(p.name) + "</h3></div></div>" +
        '<div class="gc-body"><div class="gc-facts">' + facts + '</div><div><span class="pass-label">Imprescindibles</span><ul class="gc-must" style="margin-top:8px">' + must + "</ul></div>" +
        '<div class="gc-actions"><a class="btn btn-gold" href="' + esc(p.url) + '">Ver viaje completo ' + ICON.arrow + '</a><a class="btn btn-wa btn-sm" href="https://wa.me/' + esc(CFG.whatsapp) + "?text=" + msg + '" target="_blank" rel="noopener">' + ICON.wa + " Consultar</a></div></div>";
      card.hidden = false; intro.hidden = true;
      card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
      card.querySelector(".gc-close").addEventListener("click", function () { show(null); var b = el.querySelector('[data-pick="' + p.slug + '"]'); b && b.focus(); });
    }
    // arrastrar para girar
    var start = null;
    canvas.addEventListener("pointerdown", function (e) { start = { x: e.clientX, y: e.clientY, r: rot.slice(), moved: false }; canvas.setPointerCapture(e.pointerId); anim = null; });
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      if (start) {
        var dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { start.moved = true; dragging = true; canvas.classList.add("dragging"); }
        var k = 180 / (size || 400);
        rot = [start.r[0] + dx * k, Math.max(-70, Math.min(70, start.r[1] - dy * k)), 0]; idle = performance.now();
      } else {
        var p = hit(e.clientX - r.left, e.clientY - r.top);
        if (p !== hover) { hover = p; canvas.style.cursor = p ? "pointer" : ""; }
      }
    });
    function up(e) {
      if (!start) return;
      var r = canvas.getBoundingClientRect();
      if (!start.moved) { var p = hit(e.clientX - r.left, e.clientY - r.top); if (p) show(p); }
      start = null; dragging = false; canvas.classList.remove("dragging"); idle = performance.now();
    }
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", function () { start = null; dragging = false; });
    canvas.addEventListener("pointerleave", function () { hover = null; });
    $$("[data-pick]", el).forEach(function (b) { b.addEventListener("click", function () { show(data.filter(function (p) { return p.slug === b.getAttribute("data-pick"); })[0]); }); });
    // bucle de dibujo (solo cuando el globo está en pantalla)
    var visibleOnScreen = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visibleOnScreen = es[0].isIntersecting; }).observe(el);
    function loop(now) {
      if (visibleOnScreen && !d.hidden) {
        if (anim) anim(now);
        else if (!dragging && !active && !REDUCE && now - idle > 2500) rot[0] += (now - last) * 0.006;
        draw();
      }
      last = now; requestAnimationFrame(loop);
    }
    window.addEventListener("resize", resize); resize(); requestAnimationFrame(function (n) { last = n; loop(n); });
    GLOBE = {
      setFilter: function (f) { filter = f; if (active && !on(active)) show(null); $$("[data-pick]", el).forEach(function (b) { b.classList.toggle("dim", f !== "all" && b.getAttribute("data-tags").split(" ").indexOf(f) < 0); }); },
      light: function (slug) { lit = slug; }
    };
  }
  function bootGlobe() {
    var el = d.querySelector("[data-globe]"); if (!el) return;
    if (window.d3) initGlobe(el); else window.addEventListener("load", function () { initGlobe(el); applyUrlFilter(); });
  }
  bootGlobe();

  // tarjetas pequeñas: iluminan su punto en el globo
  $$(".mini-card").forEach(function (c) {
    c.addEventListener("mouseenter", function () { GLOBE && GLOBE.light(c.getAttribute("data-slug")); });
    c.addEventListener("mouseleave", function () { GLOBE && GLOBE.light(null); });
  });

  // Filtro de destinos: manda sobre el globo y las tarjetas a la vez (y se puede abrir con ?filtro=lunas-de-miel)
  var filters = $$(".filter[data-filter]");
  function setFilter(t, push) {
    filters.forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-filter") === t ? "true" : "false"); });
    $$(".dest-grid [data-tags]").forEach(function (c) { c.classList.toggle("hide", t !== "all" && c.getAttribute("data-tags").split(" ").indexOf(t) < 0); });
    GLOBE && GLOBE.setFilter(t);
    if (push && history.replaceState) {
      var b = filters.filter(function (x) { return x.getAttribute("data-filter") === t; })[0];
      try { var u = new URL(location.href); if (t === "all") u.searchParams.delete("filtro"); else u.searchParams.set("filtro", b.getAttribute("data-slug")); history.replaceState(null, "", u.toString()); } catch (e) {}
    }
  }
  filters.forEach(function (b) { b.addEventListener("click", function () { setFilter(b.getAttribute("data-filter"), true); }); });
  function applyUrlFilter() {
    if (!filters.length) return;
    try {
      var q = new URLSearchParams(location.search).get("filtro"); if (!q) return;
      var b = filters.filter(function (x) { return x.getAttribute("data-slug") === q || x.getAttribute("data-filter") === q; })[0];
      if (b) setFilter(b.getAttribute("data-filter"), false);
    } catch (e) {}
  }
  applyUrlFilter();

  // Ofertas: filtro por presupuesto
  var bud = $$(".filter[data-budget]");
  bud.forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-budget"), n = 0;
      bud.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("[data-offers] .offer").forEach(function (o) { var hide = k !== "all" && o.getAttribute("data-budget") !== k; o.classList.toggle("hide", hide); if (!hide) n++; });
      var em = d.querySelector(".empty-note"); if (em) em.hidden = n > 0;
    });
  });

  // Blog: filtro por tema
  var tops = $$(".filter[data-topic]");
  tops.forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-topic");
      tops.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("[data-posts] .post-card").forEach(function (o) { o.classList.toggle("hide", k !== "all" && o.getAttribute("data-topic") !== k); });
    });
  });

  // Índice del artículo: resalta la sección visible
  var toc = $$(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var secs = toc.map(function (a) { return d.getElementById(a.getAttribute("href").slice(1)); });
    var tio = new IntersectionObserver(function () {
      var y = 140, cur = 0;
      secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top < y) cur = k; });
      toc.forEach(function (a, k) { a.classList.toggle("on", k === cur); });
    }, { rootMargin: "-120px 0px -60% 0px", threshold: [0, 1] });
    secs.forEach(function (s) { s && tio.observe(s); });
  }

  // ---------- Mapas 2D (Leaflet + OpenStreetMap en blanco y negro, en blanco y negro) ----------
  function initMap(box) {
    if (!window.L || box._map) return;
    var pts; try { pts = JSON.parse(box.getAttribute("data-points")); } catch (e) { return; }
    box.innerHTML = "";
    var map = L.map(box, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, tap: false });
    box._map = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }).addTo(map);
    var markers = {}, latlngs = [];
    pts.forEach(function (p) {
      var single = pts.length === 1;
      var icon = L.divIcon({ className: "", html: '<span class="pin' + (single ? " home" : "") + '">' + (single ? "★" : p.n) + "</span>", iconSize: [26, 26], iconAnchor: [13, 13] });
      var m = L.marker(p.ll, { icon: icon, keyboard: false, riseOnHover: true }).addTo(map);
      m.bindTooltip(esc(p.name), { className: "pin-tip", direction: "top", offset: [0, -14], permanent: single });
      m.on("mouseover", function () { mark(p.n, true); }); m.on("mouseout", function () { mark(p.n, false); });
      m.on("click", function () { var li = scope.querySelector('[data-pt="' + p.n + '"]'); if (li) { li.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "center" }); mark(p.n, true); } });
      markers[p.n] = m; latlngs.push(p.ll);
    });
    var z = parseInt(box.getAttribute("data-mapzoom") || "0", 10);
    if (latlngs.length === 1) map.setView(latlngs[0], z || 14);
    else map.fitBounds(latlngs, { padding: [28, 28], maxZoom: 14 });
    var scope = box.closest(".dest-layout, .art-layout") || d;
    function mark(n, onn) {
      var m = markers[n]; if (m) { var el = m.getElement(); el && el.querySelector(".pin").classList.toggle("on", onn); if (onn) m.setZIndexOffset(1000); else m.setZIndexOffset(0); }
      $$('[data-pt="' + n + '"]', scope).forEach(function (li) { li.classList.toggle("on", onn); });
    }
    $$("[data-pt]", scope).forEach(function (li) {
      var n = li.getAttribute("data-pt");
      li.addEventListener("mouseenter", function () { mark(n, true); });
      li.addEventListener("mouseleave", function () { mark(n, false); });
      li.addEventListener("focus", function () { mark(n, true); });
      li.addEventListener("blur", function () { mark(n, false); });
      li.addEventListener("click", function () { var m = markers[n]; if (m) { map.panTo(m.getLatLng(), { animate: !REDUCE }); m.openTooltip(); setTimeout(function () { m.closeTooltip(); }, 1800); } });
    });
    setTimeout(function () { map.invalidateSize(); }, 200);
  }
  function bootMaps() {
    var maps = $$(".mini-map[data-points]"); if (!maps.length) return;
    function go() {
      if ("IntersectionObserver" in window) {
        var mio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { initMap(e.target); mio.unobserve(e.target); } }); }, { rootMargin: "300px" });
        maps.forEach(function (m) { mio.observe(m); });
      } else maps.forEach(initMap);
    }
    if (window.L) go(); else window.addEventListener("load", go);
  }
  bootMaps();

  // Galería ampliable
  $$("[data-zoom]").forEach(function (b) {
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
    try { var q = new URLSearchParams(location.search).get("destino"); if (q) form.elements.destino.value = q; } catch (e) {}
  }

  // Año del pie
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
