/* Asistente de viaje (chat con IA). Sirve para la app y para la web de la agencia.
   Uso: AnilloChat.mount({ code, name, agent, whatsapp, bottom }) · AnilloChat.unmount()
   Si no se pasa code, el chat pide el código de reserva antes de la primera pregunta. */
(function () {
  "use strict";
  const ENDPOINT = "https://anillotravel-assist.saanchezzmaarcoss.workers.dev";
  const CHIPS = [
    "¿A qué hora tengo que estar en el aeropuerto?",
    "¿Cómo hago el check-in?",
    "¿Qué puedo llevar en la maleta de mano?",
    "¿Cuántas maletas puedo llevar?",
    "Me han cancelado el vuelo",
  ];
  const CSS = `
.ac{--ac-bg:#F2F5F7;--ac-surface:#fff;--ac-ink:#0E2233;--ac-muted:#586A78;--ac-line:#D8E1E7;--ac-brand:#0A2A43;--ac-gold:#C9973A;--ac-me:#0A2A43;--ac-me-ink:#fff;--ac-soft:#DCEFEF;--ac-sea:#14898F;--ac-shadow:0 2px 6px rgba(14,34,51,.10),0 18px 48px rgba(14,34,51,.22);font-family:inherit;color:var(--ac-ink)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ac{--ac-bg:#07121B;--ac-surface:#0E1D2A;--ac-ink:#EAF1F5;--ac-muted:#98AAB7;--ac-line:#1E3344;--ac-me:#1C4A6E;--ac-soft:#10303A;--ac-sea:#44C2C7;--ac-gold:#E0B35A;--ac-shadow:0 2px 6px rgba(0,0,0,.4),0 18px 48px rgba(0,0,0,.5)}}
:root[data-theme="dark"] .ac{--ac-bg:#07121B;--ac-surface:#0E1D2A;--ac-ink:#EAF1F5;--ac-muted:#98AAB7;--ac-line:#1E3344;--ac-me:#1C4A6E;--ac-soft:#10303A;--ac-sea:#44C2C7;--ac-gold:#E0B35A;--ac-shadow:0 2px 6px rgba(0,0,0,.4),0 18px 48px rgba(0,0,0,.5)}
.ac *{box-sizing:border-box}
.ac [hidden]{display:none!important}
.ac-fab{position:fixed;z-index:35;right:calc(16px + env(safe-area-inset-right,0px));bottom:calc(var(--ac-bottom,16px) + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:8px;border:0;border-radius:99px;padding:12px 18px 12px 14px;background:var(--ac-brand);color:#fff;font-family:inherit;font-weight:700;font-size:15px;line-height:1;box-shadow:var(--ac-shadow);cursor:pointer}
.ac-fab svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.ac-fab:focus-visible,.ac button:focus-visible,.ac input:focus-visible{outline:3px solid var(--ac-gold);outline-offset:2px}
.ac-open .ac-fab{display:none}
.ac-panel{position:fixed;z-index:70;inset:0;display:none;flex-direction:column;background:var(--ac-surface);padding-top:env(safe-area-inset-top,0px)}
.ac-open .ac-panel{display:flex}
@media (min-width:900px){.ac-panel{inset:auto;right:20px;bottom:20px;top:20px;width:390px;border-radius:22px;overflow:hidden;box-shadow:var(--ac-shadow);border:1px solid var(--ac-line)}}
.ac-head{display:flex;align-items:center;gap:11px;padding:12px max(14px,env(safe-area-inset-right,0px)) 12px max(14px,env(safe-area-inset-left,0px));background:var(--ac-brand);color:#fff}
.ac-av{width:38px;height:38px;border-radius:50%;background:var(--ac-gold);display:grid;place-items:center;flex:none}
.ac-av svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ac-head b{display:block;font-size:16px;line-height:1.2}
.ac-head small{font-size:12.5px;opacity:.85}
.ac-x{margin-left:auto;border:0;background:rgba(255,255,255,.14);color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;display:grid;place-items:center}
.ac-x svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}
.ac-msgs{flex:1;min-height:0;overflow-y:auto;padding:16px max(12px,env(safe-area-inset-right,0px)) 10px max(12px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:9px;background:var(--ac-bg);overscroll-behavior:contain}
.ac-b{max-width:86%;padding:10px 13px;border-radius:18px;font-size:15.5px;line-height:1.45;white-space:pre-line;overflow-wrap:anywhere}
.ac-b.bot{background:var(--ac-surface);border:1px solid var(--ac-line);border-bottom-left-radius:6px;align-self:flex-start}
.ac-b.me{background:var(--ac-me);color:var(--ac-me-ink);border-bottom-right-radius:6px;align-self:flex-end}
.ac-b.err{border-color:#C2412D}
.ac-wa{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:8px 13px;border-radius:99px;background:#25D366;color:#053d1d;font-weight:700;font-size:14px;text-decoration:none}
.ac-dots{display:inline-flex;gap:4px;padding:4px 2px}
.ac-dots i{width:7px;height:7px;border-radius:50%;background:var(--ac-muted);animation:acd 1s infinite}
.ac-dots i:nth-child(2){animation-delay:.15s}.ac-dots i:nth-child(3){animation-delay:.3s}
@keyframes acd{0%,60%,100%{opacity:.25}30%{opacity:1}}
@media (prefers-reduced-motion:reduce){.ac-dots i{animation:none;opacity:.6}}
.ac-chips{display:flex;gap:7px;overflow-x:auto;padding:9px 12px 3px;background:var(--ac-surface);scrollbar-width:none}
.ac-chips::-webkit-scrollbar{display:none}
.ac-chips button{flex:none;border:1px solid var(--ac-line);background:var(--ac-surface);color:var(--ac-ink);border-radius:99px;padding:7px 12px;font:inherit;font-size:13.5px;cursor:pointer;white-space:nowrap}
.ac-form{display:flex;gap:8px;padding:9px max(12px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));background:var(--ac-surface)}
.ac-form input{flex:1;min-width:0;border:1px solid var(--ac-line);background:var(--ac-bg);color:var(--ac-ink);border-radius:99px;padding:11px 15px;font:inherit;font-size:16px}
.ac-form button{border:0;width:46px;height:46px;border-radius:50%;background:var(--ac-brand);color:#fff;cursor:pointer;display:grid;place-items:center;flex:none}
.ac-form button:disabled{opacity:.5}
.ac-form svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ac-note{font-size:12px;color:var(--ac-muted);text-align:center;padding:0 14px 6px;background:var(--ac-surface)}
`;
  const IC = {
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  let root = null, cfg = null, log = [], busy = false;

  function key() { return "va:chat:" + (cfg.code || ""); }
  function save() { if (cfg.code) set(key(), log.slice(-40)); }

  function bubble(m) {
    const d = document.createElement("div");
    d.className = "ac-b " + (m.role === "user" ? "me" : "bot") + (m.err ? " err" : "");
    d.innerHTML = esc(m.content) + (m.wa ? `<br><a class="ac-wa" href="${esc(m.wa)}" target="_blank" rel="noopener">WhatsApp con ${esc(cfg.agent)}</a>` : "");
    return d;
  }
  function render() {
    const box = root.querySelector(".ac-msgs");
    box.innerHTML = "";
    const hello = cfg.code
      ? `¡Hola${cfg.name ? ", " + cfg.name : ""}! Soy el asistente de tu viaje. Pregúntame lo que quieras: horarios, check-in, maletas, control de seguridad… Si necesitas a ${cfg.agent}, te paso con ella.`
      : `¡Hola! Soy el asistente de viaje de ${cfg.agency}. Para ayudarte con tu viaje, escribe primero tu código de reserva (por ejemplo ANI-7K4P9).`;
    box.appendChild(bubble({ role: "assistant", content: hello }));
    log.forEach((m) => box.appendChild(bubble(m)));
    root.querySelector(".ac-chips").hidden = !cfg.code || log.length > 0;
    root.querySelector(".ac-form input").placeholder = cfg.code ? "Escribe tu pregunta…" : "Tu código, p. ej. ANI-7K4P9";
    box.scrollTop = box.scrollHeight;
  }
  function add(m) {
    log.push(m); save();
    const box = root.querySelector(".ac-msgs");
    box.appendChild(bubble(m));
    root.querySelector(".ac-chips").hidden = true;
    box.scrollTop = box.scrollHeight;
  }

  async function ask(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    if (!cfg.code) {
      const c = text.toUpperCase().replace(/\s+/g, "");
      if (!/^[A-Z]{3}-?[A-Z0-9]{5}$/.test(c)) { add({ role: "assistant", content: "Ese código no parece válido. Tiene este formato: tres letras, un guion y cinco letras o números (ANI-7K4P9)." }); return; }
      cfg.code = c.includes("-") ? c : c.slice(0, 3) + "-" + c.slice(3);
      log = get(key(), []);
      render();
      add({ role: "assistant", content: `Perfecto, ya tengo tu código ${cfg.code}. ¿Qué quieres saber de tu viaje?` });
      root.querySelector(".ac-chips").hidden = false;
      return;
    }
    busy = true;
    const btn = root.querySelector(".ac-form button"); btn.disabled = true;
    const history = log.filter((m) => !m.err && !m.local).slice(-6).map((m) => ({ role: m.role, content: m.content }));
    add({ role: "user", content: text });
    const box = root.querySelector(".ac-msgs");
    const typing = document.createElement("div");
    typing.className = "ac-b bot"; typing.innerHTML = '<span class="ac-dots" aria-label="Escribiendo"><i></i><i></i><i></i></span>';
    box.appendChild(typing); box.scrollTop = box.scrollHeight;
    const waBase = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(`Hola ${cfg.agent}, mi código de viaje es ${cfg.code}. ${text}`);
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: cfg.code, message: text, history }) });
      const d = await r.json().catch(() => ({}));
      typing.remove();
      if (r.status === 404) { add({ role: "assistant", local: true, content: "No encuentro ningún viaje con ese código. Revísalo o escribe a " + cfg.agent + ".", wa: waBase }); if (!cfg.fixed) { cfg.code = null; render(); } }
      else if (r.status === 410) add({ role: "assistant", local: true, content: "Este viaje ya ha terminado, así que ya no puedo consultar sus datos. Para cualquier cosa, escribe a " + cfg.agent + ".", wa: waBase });
      else if (!r.ok || !d.answer) add({ role: "assistant", err: true, content: "No he podido responderte ahora. Escribe a " + cfg.agent + " y te ayuda enseguida.", wa: waBase });
      else add({ role: "assistant", content: d.answer, wa: d.handoff ? (d.whatsapp || waBase) : null });
    } catch (e) {
      typing.remove();
      add({ role: "assistant", err: true, content: "Parece que no hay conexión. Inténtalo de nuevo en un momento o escribe a " + cfg.agent + ".", wa: waBase });
    }
    busy = false; btn.disabled = false;
  }

  function open(on) {
    root.classList.toggle("ac-open", on);
    if (on) { render(); setTimeout(() => { const i = root.querySelector(".ac-form input"); if (i && window.matchMedia("(min-width:900px)").matches) i.focus(); }, 30); }
  }

  function mount(o) {
    o = o || {};
    const code = o.code ? String(o.code).toUpperCase() : null;
    if (root && cfg && cfg.code === code && code) return; // ya montado para este viaje
    unmount();
    cfg = { code, fixed: !!code, name: o.name || "", agent: o.agent || "Cristina", agency: o.agency || "Anillo Travel", whatsapp: String(o.whatsapp || "34610806011").replace(/[^0-9]/g, "") };
    log = code ? get(key(), []) : [];
    if (!document.getElementById("ac-css")) { const s = document.createElement("style"); s.id = "ac-css"; s.textContent = CSS; document.head.appendChild(s); }
    root = document.createElement("div");
    root.className = "ac";
    if (o.bottom) root.style.setProperty("--ac-bottom", o.bottom);
    root.innerHTML = `
      <button class="ac-fab" type="button" aria-label="Abrir el asistente">${IC.chat}<span>Pregúntame</span></button>
      <section class="ac-panel" role="dialog" aria-label="Asistente de tu viaje">
        <div class="ac-head"><span class="ac-av">${IC.chat}</span><div><b>Asistente de tu viaje</b><small>Responde al momento</small></div><button class="ac-x" type="button" aria-label="Cerrar">${IC.x}</button></div>
        <div class="ac-msgs" aria-live="polite"></div>
        <div class="ac-chips">${CHIPS.map((c) => `<button type="button">${esc(c)}</button>`).join("")}</div>
        <form class="ac-form"><input id="ac-input" type="text" autocomplete="off" enterkeyhint="send" maxlength="500" aria-label="Tu pregunta"><button type="submit" aria-label="Enviar">${IC.send}</button></form>
        <div class="ac-note">Respuestas automáticas. Para cambios, pagos o urgencias, ${esc(cfg.agent)}.</div>
      </section>`;
    document.body.appendChild(root);
    root.querySelector(".ac-fab").addEventListener("click", () => open(true));
    root.querySelector(".ac-x").addEventListener("click", () => open(false));
    root.querySelector(".ac-chips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
    root.querySelector(".ac-form").addEventListener("submit", (e) => { e.preventDefault(); const i = root.querySelector(".ac-form input"); const v = i.value; i.value = ""; ask(v); });
    document.addEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape" && root && root.classList.contains("ac-open")) open(false); }
  function unmount() {
    if (root) root.remove();
    document.removeEventListener("keydown", onKey);
    root = null; cfg = null; log = []; busy = false;
  }
  window.AnilloChat = { mount, unmount, open: () => root && open(true) };
})();
