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
    var big = (window.innerWidth * (window.devicePixelRatio || 1)) > 1000;
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
    var seed = 7, rnd = function () { return (seed = seed * 16807 % 2147483647) / 2147483647; };
    var STARS = Array.from({ length: 170 }, function () { return [rnd(), rnd(), rnd() * 1.1 + .35, rnd() * 6.3]; });
    var PLANE = new Path2D("M-12-1.6 3.5-1.8 9-9.2h3.3L8.9-1.9 14.6-2c2 0 3.4.8 3.4 2s-1.4 2-3.4 2L8.9 1.9l3.4 7.3H9L3.5 1.8-12 1.6l-1.5 3.6h-2.6L-15 0l-1.1-5.2h2.6Z");
    var appear = 0, R = 0, flyT = 0;
    function resize() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      size = r.width; canvas.width = size * dpr; canvas.height = size * dpr;
      R = size * 0.4; proj.translate([size / 2, size / 2]).scale(R); draw();
    }
    function visible(ll) { return d3.geoDistance(ll, [-rot[0], -rot[1]]) < Math.PI / 2 - 0.05; }
    function on(p) { return filter === "all" || p.tags.indexOf(filter) >= 0; }
    function label(txt, x, y, color, font, align) {
      ctx.font = font; ctx.textAlign = align || "left"; ctx.lineJoin = "round";
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(2,8,20,.8)"; ctx.strokeText(txt, x, y);
      ctx.fillStyle = color; ctx.fillText(txt, x, y); ctx.textAlign = "left";
    }
    function draw() {
      if (!size) return;
      var now = performance.now(), tm = now / 1e3, c = size / 2, g;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
      proj.rotate(rot);
      // estrellas que titilan
      ctx.fillStyle = "#fff";
      STARS.forEach(function (st) { ctx.globalAlpha = REDUCE ? .6 : .25 + .6 * Math.abs(Math.sin(tm * .7 + st[3])); ctx.beginPath(); ctx.arc(st[0] * size, st[1] * size, st[2] * .7, 0, 6.3); ctx.fill(); });
      ctx.globalAlpha = 1;
      // atmósfera
      g = ctx.createRadialGradient(c, c, R * .96, c, c, R * 1.22);
      g.addColorStop(0, "rgba(110,190,255,.5)"); g.addColorStop(1, "rgba(110,190,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R * 1.22, 0, 6.3); ctx.fill();
      // océano
      g = ctx.createRadialGradient(c - R * .35, c - R * .4, R * .05, c, c, R);
      g.addColorStop(0, "#3a93d6"); g.addColorStop(.7, "#14508f"); g.addColorStop(1, "#0a2a55");
      ctx.beginPath(); path(sphere); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); path(grat); ctx.strokeStyle = "rgba(255,255,255,.09)"; ctx.lineWidth = .6; ctx.stroke();
      if (land) { ctx.beginPath(); path(land); ctx.fillStyle = "#e9dcbd"; ctx.fill(); ctx.strokeStyle = "rgba(110,90,60,.45)"; ctx.lineWidth = .5; ctx.stroke(); }
      // luz y sombra (volumen)
      g = ctx.createRadialGradient(c - R * .4, c - R * .45, R * .1, c, c, R * 1.02);
      g.addColorStop(0, "rgba(255,255,255,.14)"); g.addColorStop(.55, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,8,30,.55)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, 6.3); ctx.fill();
      // ruta desde Valencia hasta el destino elegido, con el avión volando
      var sel = active || hover;
      if (sel) {
        var to = [sel.ll[1], sel.ll[0]], ip = d3.geoInterpolate(VLC, to);
        ctx.beginPath(); path({ type: "LineString", coordinates: [VLC, to] });
        ctx.setLineDash([5, 4]); ctx.strokeStyle = "#9fdcff"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        flyT = REDUCE ? 1 : Math.min(1, flyT + 0.006);
        var pos = ip(flyT);
        ctx.beginPath(); path({ type: "LineString", coordinates: [VLC, pos] }); ctx.strokeStyle = "#f4b740"; ctx.lineWidth = 3; ctx.stroke();
        if (visible(pos)) {
          var a1 = proj(ip(Math.max(0, flyT - .01))), a2 = proj(ip(Math.min(1, flyT + .01))), xy = proj(pos);
          ctx.save(); ctx.translate(xy[0], xy[1]); ctx.rotate(Math.atan2(a2[1] - a1[1], a2[0] - a1[0])); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 6; ctx.fillStyle = "#fff"; ctx.fill(PLANE); ctx.restore();
        }
      } else flyT = 0;
      if (visible(VLC)) { var v = proj(VLC); ctx.beginPath(); ctx.arc(v[0], v[1], 5, 0, 7); ctx.fillStyle = "#9fdcff"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke(); label("VALENCIA", v[0], v[1] - 12, "#fff", "800 11px Figtree, sans-serif", "center"); }
      // puntos de destino: aparecen uno a uno y laten
      var labels = [];
      if (appear) data.forEach(function (p, i) {
        var k = REDUCE ? 1 : Math.max(0, Math.min(1, (now - appear - i * 110) / 450)); if (!k) return;
        var ll = [p.ll[1], p.ll[0]]; if (!visible(ll)) return;
        var xy = proj(ll), ok = on(p), isA = p === active, isH = p === hover || p.slug === lit;
        if (!ok) { ctx.beginPath(); ctx.arc(xy[0], xy[1], 3 * k, 0, 7); ctx.fillStyle = "rgba(200,210,220,.5)"; ctx.fill(); return; }
        var pulse = (Math.sin(now / 380 + i) + 1) / 2, pop = k < 1 ? 1 + Math.sin(k * Math.PI) * .6 : 1;
        var r = (isA ? 7.5 : isH ? 7 : 5.5) * k * pop;
        ctx.beginPath(); ctx.arc(xy[0], xy[1], r + 4 + pulse * 9, 0, 7);
        ctx.fillStyle = "rgba(244,183,64," + (0.45 - pulse * 0.4) * k + ")"; ctx.fill();
        ctx.beginPath(); ctx.arc(xy[0], xy[1], r, 0, 7); ctx.fillStyle = isA ? "#C8694A" : "#f4b740"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
        labels.push({ p: p, x: xy[0], y: xy[1], r: r, k: k, big: isA || isH });
      });
      // nombres: a la derecha, a la izquierda, arriba o abajo, sin pisarse ni salirse
      var boxes = [];
      labels.sort(function (a, b) { return b.big - a.big; }).forEach(function (L) {
        var font = (L.big ? "800 13px" : "700 11.5px") + " Figtree, sans-serif"; ctx.font = font;
        var w = ctx.measureText(L.p.name).width, h = 13, gap = L.r + 6;
        var tries = [[L.x + gap, L.y + 4, "left"], [L.x - gap, L.y + 4, "right"], [L.x, L.y - gap - 2, "center"], [L.x, L.y + gap + 11, "center"]];
        for (var i = 0; i < tries.length; i++) {
          var t = tries[i], x0 = t[2] === "left" ? t[0] : t[2] === "right" ? t[0] - w : t[0] - w / 2, b = [x0 - 2, t[1] - h + 2, w + 4, h + 2];
          if (b[0] < 2 || b[0] + b[2] > size - 2 || b[1] < 2 || b[1] + b[3] > size - 2) continue;
          if (boxes.some(function (o) { return b[0] < o[0] + o[2] && o[0] < b[0] + b[2] && b[1] < o[1] + o[3] && o[1] < b[1] + b[3]; })) continue;
          boxes.push(b); ctx.globalAlpha = L.k; label(L.p.name, t[0], t[1], L.big ? "#ffd27a" : "#fff", font, t[2]); ctx.globalAlpha = 1; break;
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
      active = p; idle = performance.now(); flyT = 0;
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
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visibleOnScreen = es[0].isIntersecting; if (visibleOnScreen && !appear) appear = performance.now() + 300; }).observe(el);
    else appear = 1;
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
    $$(".dest-grid [data-tags], .mini-grid.all [data-tags]").forEach(function (c) { c.classList.toggle("hide", t !== "all" && c.getAttribute("data-tags").split(" ").indexOf(t) < 0); });
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

  // ---------- Mapas 2D con el estilo de la marca: mar azul noche, tierra arena y nombres en español ----------
  // Mapas de país o región: costa y fronteras dibujadas por nosotros (Natural Earth, assets/maps/*.json).
  // Mapas de ciudad: teselas de Esri en gris, pasadas a los colores de la marca con un filtro SVG.
  function mapFilter() {
    if (d.getElementById("anillo-map-f")) return;
    var nav = [], sand = [];
    function tv(a, b, c) { var o = []; for (var i = 0; i < 20; i++) o.push(i < 17 ? a : (i < 19 ? b : c)); return o.join(" "); }
    var div = d.createElement("div");
    div.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="anillo-map-f" color-interpolation-filters="sRGB"><feComponentTransfer>' +
      '<feFuncR type="discrete" tableValues="' + tv(.059, .91, .957) + '"/><feFuncG type="discrete" tableValues="' + tv(.208, .863, .925) + '"/><feFuncB type="discrete" tableValues="' + tv(.333, .784, .875) + '"/>' +
      '</feComponentTransfer></filter></svg>';
    d.body.appendChild(div.firstChild);
  }
  function initMap(box) {
    if (!window.L || box._map) return;
    var pts; try { pts = JSON.parse(box.getAttribute("data-points")); } catch (e) { return; }
    var shape = box.getAttribute("data-shape");
    box.innerHTML = "";
    var single = pts.length === 1;
    var map = L.map(box, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, tap: false, zoomSnap: .25 });
    box._map = map;
    var markers = {}, latlngs = pts.map(function (p) { return p.ll; });
    if (shape) {
      box.classList.add("vec");
      map.attributionControl.addAttribution("Natural Earth");
      fetch(shape).then(function (r) { return r.json(); }).then(function (g) {
        L.polygon(g.land, { stroke: true, color: "rgba(10,42,67,.18)", weight: .8, fillColor: "#E8DCC8", fillOpacity: 1, interactive: false }).addTo(map).bringToBack();
        if (g.borders && g.borders.length) L.polyline(g.borders, { color: "rgba(10,42,67,.32)", weight: 1, dashArray: "3 3", interactive: false }).addTo(map);
        var b = g.bbox; map.setMaxBounds([[b[1], b[0]], [b[3], b[2]]]);
      }).catch(function () {});
      if (pts.length > 1 && box.hasAttribute("data-route")) L.polyline(latlngs, { color: "#C9973A", weight: 2, dashArray: "2 7", lineCap: "round", opacity: .95, interactive: false }).addTo(map);
    } else {
      mapFilter(); box.classList.add("tiles");
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "© Esri" }).addTo(map);
    }
    var z = parseInt(box.getAttribute("data-mapzoom") || "0", 10);
    if (single) map.setView(latlngs[0], z || 14);
    else map.fitBounds(latlngs, { padding: [44, 44], maxZoom: shape ? 9 : 15 });
    // etiqueta de cada punto a un lado que no pise a otro
    var xy = latlngs.map(function (ll) { return map.latLngToContainerPoint(ll); });
    function side(i) {
      var near = function (dir) { return xy.some(function (q, j) { if (j === i) return false; var dx = (q.x - xy[i].x) * dir, dy = Math.abs(q.y - xy[i].y); return dx > -14 && dx < 150 && dy < 30; }); };
      var W = box.clientWidth, x = xy[i].x;
      if (x > W - 150 && !near(-1)) return "left";
      if (!near(1) && x < W - 150) return "right"; if (!near(-1) && x > 150) return "left"; if (!near(1) && x < W - 150) return "right";
      var up = xy.some(function (q, j) { return j !== i && q.y < xy[i].y && xy[i].y - q.y < 40 && Math.abs(q.x - xy[i].x) < 90; });
      return up ? "bottom" : "top";
    }
    pts.forEach(function (p, i) {
      var icon = L.divIcon({ className: "", html: '<span class="pin' + (single ? " home" : "") + '">' + (single ? "★" : p.n) + "</span>", iconSize: [26, 26], iconAnchor: [13, 13] });
      var m = L.marker(p.ll, { icon: icon, keyboard: false, riseOnHover: true }).addTo(map);
      var dir = single ? "right" : side(i), off = { right: [16, 0], left: [-16, 0], top: [0, -16], bottom: [0, 16] }[dir];
      var crowd = xy.some(function (q, j) { return j !== i && Math.abs(q.x - xy[i].x) < 34 && Math.abs(q.y - xy[i].y) < 34; });
      m.bindTooltip(esc(p.name), { className: "pin-lbl", direction: dir, offset: off, permanent: !crowd });
      m.on("mouseover", function () { mark(p.n, true); }); m.on("mouseout", function () { mark(p.n, false); });
      m.on("click", function () { var li = scope.querySelector('[data-pt="' + p.n + '"]'); if (li) { li.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "center" }); mark(p.n, true); } });
      markers[p.n] = m;
    });
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
      li.addEventListener("click", function () { var m = markers[n]; if (m) map.panTo(m.getLatLng(), { animate: !REDUCE }); });
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


  // ---------- Opiniones: carrusel (3 a la vez en ordenador, 1 en el móvil) ----------
  $$("[data-car]").forEach(function (car) {
    var track = car.querySelector(".car-track"), slides = $$(".slide", track), dots = $$(".car-dots button", car.parentNode);
    if (slides.length < 2) return;
    var k = 0, busy = false, timer = null;
    function per() { return innerWidth <= 760 ? 1 : 3; }
    function paint() { dots.forEach(function (b, i) { b.classList.toggle("on", i === k); }); }
    function step(n) {
      if (busy) return; busy = true;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      var w = slides[0].getBoundingClientRect().width + gap;
      if (n > 0) {
        track.style.transition = REDUCE ? "none" : "transform .8s cubic-bezier(.2,.7,.2,1)";
        track.style.transform = "translateX(" + (-w) + "px)";
        setTimeout(function () { track.style.transition = "none"; track.appendChild(track.firstElementChild); track.style.transform = "none"; busy = false; }, REDUCE ? 0 : 820);
      } else {
        track.style.transition = "none"; track.insertBefore(track.lastElementChild, track.firstElementChild); track.style.transform = "translateX(" + (-w) + "px)";
        track.getBoundingClientRect();
        track.style.transition = REDUCE ? "none" : "transform .8s cubic-bezier(.2,.7,.2,1)"; track.style.transform = "none";
        setTimeout(function () { busy = false; }, REDUCE ? 0 : 820);
      }
      k = (k + n + slides.length) % slides.length; paint();
    }
    function play() { stop(); if (!REDUCE) timer = setInterval(function () { if (!d.hidden) step(1); }, 4500); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    dots.forEach(function (b, i) { b.addEventListener("click", function () { var n = (i - k + slides.length) % slides.length; (function go(c) { if (c <= 0) return; step(1); setTimeout(function () { go(c - 1); }, REDUCE ? 0 : 840); })(n); play(); }); });
    car.addEventListener("mouseenter", stop); car.addEventListener("mouseleave", play);
    var x0 = null;
    car.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    car.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); x0 = null; play(); });
    paint(); play();
  });

  // ---------- Opiniones: cita grande que cambia sola (portada) ----------
  $$("[data-bq]").forEach(function (st) {
    var qs = $$(".bq", st), avs = $$(".bq-av", st.parentNode), k = 0, timer = null;
    if (qs.length < 2) return;
    function show(i) { qs[k].classList.remove("on"); avs[k] && avs[k].classList.remove("on"); k = i; qs[k].classList.add("on"); avs[k] && avs[k].classList.add("on"); }
    function play() { if (timer) clearInterval(timer); if (!REDUCE) timer = setInterval(function () { if (!d.hidden) show((k + 1) % qs.length); }, 6000); }
    avs.forEach(function (a, i) { a.addEventListener("click", function () { show(i); play(); }); });
    play();
  });

  // ---------- Vídeos de nuestros viajeros (ventana encima de la página) ----------
  var vm = d.getElementById("vmodal");
  if (vm) {
    var media = vm.querySelector(".vmedia"), cap = vm.querySelector(".vcap"), note = vm.querySelector(".vnote"), last = null;
    function closeV() { vm.hidden = true; media.innerHTML = ""; d.body.style.overflow = ""; if (last) last.focus(); }
    $$(".vcard").forEach(function (c) {
      c.addEventListener("click", function () {
        last = c; var v = c.getAttribute("data-video"), poster = c.getAttribute("data-poster");
        var isPhoto = c.getAttribute("data-kind") === "foto";
        vm.classList.toggle("photo", isPhoto);
        media.innerHTML = v ? '<video src="' + esc(v) + '" poster="' + esc(poster) + '" controls autoplay playsinline></video>' : '<img src="' + esc(poster) + '" alt="">';
        note.hidden = !!v || isPhoto;
        cap.querySelector("b").textContent = c.getAttribute("data-who"); cap.querySelector("small").textContent = c.getAttribute("data-meta");
        vm.hidden = false; d.body.style.overflow = "hidden"; vm.querySelector(".vclose").focus();
      });
    });
    vm.addEventListener("click", function (e) { if (e.target === vm || e.target.closest(".vclose")) closeV(); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !vm.hidden) closeV(); });
  }

  // Inicio: mosaico "Me apetece…" (filtra y recoloca los tamaños para que no queden huecos)
  var mzGrid = d.querySelector("[data-mz-grid]");
  if (mzGrid) {
    var mzCards = $$(".mz-card", mzGrid), mzBtns = $$(".mz-f"), MZS = ["big", "tall", "", "wide", "", "tall", "", "", "wide", "", "big", "", "", ""];
    var mzSet = function (t) {
      mzBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mz") === t ? "true" : "false"); });
      var on = mzCards.filter(function (c) { return t === "all" || c.getAttribute("data-tags").split(" ").indexOf(t) >= 0; });
      mzCards.forEach(function (c) { c.classList.remove("big", "tall", "wide"); c.classList.toggle("off", on.indexOf(c) < 0); });
      if (t === "all") { on.forEach(function (c, i) { if (MZS[i]) c.classList.add(MZS[i]); }); }
      else if (on.length === 1) { on[0].classList.add("big"); }
      else if (on.length) {
        // la primera grande (4 huecos) y el resto de 1; se ensanchan las últimas hasta completar filas de 4
        on[0].classList.add("big"); var cells = 4 + (on.length - 1), k = on.length - 1;
        while (cells % 4 && k > 0) { on[k].classList.add("wide"); cells++; k--; }
      }
      mzCards.forEach(function (c) { c.style.animation = "none"; void c.offsetWidth; c.style.animation = ""; });
    };
    mzBtns.forEach(function (b) { b.addEventListener("click", function () { mzSet(b.getAttribute("data-mz")); }); });
  }

  // Galería de viajeros: Todo / Fotos / Vídeos
  var galGrid = d.querySelector("[data-gal-grid]");
  if (galGrid) {
    var galBtns = $$(".gal-f");
    galBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-gal");
        galBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $$(".vcard", galGrid).forEach(function (c) { var isF = c.getAttribute("data-kind") === "foto"; c.classList.toggle("off", (t === "foto" && !isF) || (t === "video" && isF)); });
      });
    });
  }

  // Año del pie
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
