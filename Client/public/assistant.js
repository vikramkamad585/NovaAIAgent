/**
 * NovaAI embeddable assistant widget.
 *
 * Usage on any website:
 *   <script src="http://localhost:5173/assistant.js" data-user-id="USER_ID"></script>
 *
 * The API base defaults to the NovaAI server. Override with data-api="https://api.example.com".
 * Self-contained: no dependencies, renders inside a Shadow DOM so host-page CSS cannot interfere.
 */
(function () {
  "use strict";

  if (window.__novaWidgetLoaded) return;
  window.__novaWidgetLoaded = true;

  var script =
    document.currentScript ||
    document.querySelector('script[src*="assistant.js"]');
  if (!script) return;

  var userId = script.getAttribute("data-user-id");
  if (!userId) {
    console.warn("[NovaAI] Missing data-user-id on assistant script.");
    return;
  }

  // Derive the API base from where this script is served:
  // localhost during development, the production server otherwise.
  var scriptUrl = new URL(script.getAttribute("src") || script.src, window.location.href);
  var isLocal = scriptUrl.hostname === "localhost" || scriptUrl.hostname === "127.0.0.1";
  var apiBase = (isLocal
    ? "http://localhost:8000"
    : "https://novaaiagentserver.onrender.com"
  ).replace(/\/$/, "");

  // ---- Theme definitions (translated from AssistantPreview.jsx) ----
  var THEMES = {
    dark: {
      card: "linear-gradient(to bottom, #1e1633, #171226, #0d0a17)",
      cardRing: "rgba(255,255,255,0.1)",
      cardShadow: "0 25px 50px -12px rgba(88,28,135,0.45)",
      orb: "linear-gradient(135deg, #e879f9, #a855f7, #4f46e5)",
      orbShadow: "0 10px 20px rgba(217,70,239,0.4)",
      ring1: "rgba(168,85,247,0.30)",
      ring2: "rgba(217,70,239,0.20)",
      title: "#ffffff",
      subtitle: "#9ca3af",
      status: "#4ade80",
      bar: "linear-gradient(to top, #4ade80, #6ee7b7)",
      mic: "linear-gradient(135deg, #d946ef, #9333ea)",
      micPing: "rgba(217,70,239,0.4)",
      botBubble: "rgba(255,255,255,0.08)",
      botText: "#e5e7eb",
      userBubble: "linear-gradient(135deg, #9333ea, #22c55e)",
      userText: "#ffffff",
      inputBg: "rgba(255,255,255,0.06)",
      inputText: "#f3f4f6",
      inputBorder: "rgba(255,255,255,0.12)",
    },
    light: {
      card: "linear-gradient(to bottom, #ffffff, #faf5ff)",
      cardRing: "rgba(0,0,0,0.08)",
      cardShadow: "0 25px 50px -12px rgba(196,181,253,0.6)",
      orb: "linear-gradient(135deg, #a855f7, #22c55e)",
      orbShadow: "0 10px 20px rgba(196,181,253,0.6)",
      ring1: "rgba(168,85,247,0.30)",
      ring2: "rgba(34,197,94,0.20)",
      title: "#111827",
      subtitle: "#6b7280",
      status: "#9333ea",
      bar: "linear-gradient(to top, #a855f7, #22c55e)",
      mic: "linear-gradient(135deg, #9333ea, #22c55e)",
      micPing: "rgba(168,85,247,0.3)",
      botBubble: "#f3f4f6",
      botText: "#374151",
      userBubble: "linear-gradient(135deg, #9333ea, #22c55e)",
      userText: "#ffffff",
      inputBg: "#f9fafb",
      inputText: "#111827",
      inputBorder: "#e5e7eb",
    },
    glass: {
      card: "rgba(30,41,59,0.55)",
      cardRing: "rgba(255,255,255,0.3)",
      cardShadow: "0 25px 50px -12px rgba(56,189,248,0.3)",
      backdrop: "blur(20px)",
      orb: "linear-gradient(135deg, #7dd3fc, #22d3ee, #3b82f6)",
      orbShadow: "0 10px 20px rgba(34,211,238,0.4)",
      ring1: "rgba(56,189,248,0.30)",
      ring2: "rgba(103,232,249,0.20)",
      title: "#ffffff",
      subtitle: "rgba(255,255,255,0.8)",
      status: "#67e8f9",
      bar: "linear-gradient(to top, #67e8f9, #bae6fd)",
      mic: "linear-gradient(135deg, #38bdf8, #3b82f6)",
      micPing: "rgba(56,189,248,0.4)",
      botBubble: "rgba(255,255,255,0.12)",
      botText: "#f1f5f9",
      userBubble: "linear-gradient(135deg, #38bdf8, #3b82f6)",
      userText: "#ffffff",
      inputBg: "rgba(255,255,255,0.1)",
      inputText: "#f1f5f9",
      inputBorder: "rgba(255,255,255,0.25)",
    },
    neon: {
      card: "#000000",
      cardRing: "rgba(74,222,128,0.4)",
      cardShadow: "0 0 40px rgba(74,222,128,0.25)",
      orb: "linear-gradient(135deg, #ec4899, #d946ef, #4ade80)",
      orbShadow: "0 0 30px rgba(236,72,153,0.7)",
      ring1: "rgba(236,72,153,0.30)",
      ring2: "rgba(74,222,128,0.30)",
      title: "#86efac",
      titleShadow: "0 0 8px rgba(74,222,128,0.8)",
      subtitle: "rgba(187,247,208,0.6)",
      status: "#f472b6",
      bar: "linear-gradient(to top, #ec4899, #4ade80)",
      mic: "linear-gradient(135deg, #ec4899, #4ade80)",
      micPing: "rgba(74,222,128,0.4)",
      botBubble: "rgba(74,222,128,0.08)",
      botText: "#bbf7d0",
      userBubble: "linear-gradient(135deg, #ec4899, #4ade80)",
      userText: "#000000",
      inputBg: "rgba(74,222,128,0.06)",
      inputText: "#bbf7d0",
      inputBorder: "rgba(74,222,128,0.3)",
    },
  };

  // ---- SVG icons ----
  var ICON_CHAT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>';
  var ICON_MIC =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildCss(t) {
    var reduced = "@media (prefers-reduced-motion: reduce){.orb,.ring,.bar,.ping{animation:none!important}}";
    return (
      "*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
      "@keyframes breathe{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.08);opacity:1}}" +
      "@keyframes glow-ring{0%{transform:scale(.9);opacity:.6}100%{transform:scale(1.6);opacity:0}}" +
      "@keyframes wave{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}" +
      "@keyframes ping{75%,100%{transform:scale(2);opacity:0}}" +
      "@keyframes spin{to{transform:rotate(360deg)}}" +
      reduced +
      // launcher
      ".launcher{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;background:" +
      t.mic + ";box-shadow:" + t.orbShadow + ";z-index:2147483000;transition:transform .2s}" +
      ".launcher:hover{transform:scale(1.06)}.launcher svg{width:26px;height:26px}" +
      ".launcher .ping{position:absolute;inset:0;border-radius:50%;background:" + t.micPing + ";animation:ping 2s cubic-bezier(0,0,.2,1) infinite}" +
      // panel
      ".panel{position:fixed;bottom:24px;right:24px;width:340px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 48px);border-radius:24px;overflow:hidden;display:none;flex-direction:column;background:" +
      t.card + ";box-shadow:" + t.cardShadow + ";border:1px solid " + t.cardRing + ";z-index:2147483000" +
      (t.backdrop ? ";backdrop-filter:" + t.backdrop + ";-webkit-backdrop-filter:" + t.backdrop : "") + "}" +
      ".panel.open{display:flex}" +
      ".close{position:absolute;top:14px;right:14px;width:30px;height:30px;border:none;border-radius:8px;cursor:pointer;background:transparent;color:" +
      t.subtitle + ";display:flex;align-items:center;justify-content:center}.close svg{width:18px;height:18px}.close:hover{opacity:.7}" +
      // header
      ".head{padding:22px 20px 12px;text-align:center;flex-shrink:0}" +
      ".orb-wrap{position:relative;width:76px;height:76px;margin:0 auto}" +
      ".ring{position:absolute;inset:0;border-radius:50%}" +
      ".ring.r1{background:" + t.ring1 + ";animation:glow-ring 3s ease-out infinite}" +
      ".ring.r2{background:" + t.ring2 + ";animation:glow-ring 3s ease-out infinite 1.5s}" +
      ".orb{position:absolute;inset:8px;border-radius:50%;background:" + t.orb + ";box-shadow:" + t.orbShadow + ";animation:breathe 3s ease-in-out infinite}" +
      ".title{margin-top:12px;font-size:17px;font-weight:700;color:" + t.title + (t.titleShadow ? ";text-shadow:" + t.titleShadow : "") + "}" +
      ".sub{margin-top:4px;font-size:11px;line-height:1.4;color:" + t.subtitle + "}" +
      ".status{margin-top:8px;height:16px;font-size:12px;font-weight:600;color:" + t.status + ";display:flex;align-items:center;justify-content:center;gap:6px}" +
      ".eq{display:none;align-items:flex-end;gap:2px;height:14px}.status.active .eq{display:flex}" +
      ".bar{width:3px;border-radius:2px;background:" + t.bar + ";animation:wave 1s ease-in-out infinite}" +
      // chat
      ".log{flex:1;overflow-y:auto;padding:8px 16px;display:flex;flex-direction:column;gap:8px}" +
      ".log::-webkit-scrollbar{width:6px}.log::-webkit-scrollbar-thumb{background:" + t.cardRing + ";border-radius:3px}" +
      ".msg{max-width:80%;padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.4;word-wrap:break-word;white-space:pre-wrap}" +
      ".msg.bot{align-self:flex-start;background:" + t.botBubble + ";color:" + t.botText + ";border-bottom-left-radius:4px}" +
      ".msg.user{align-self:flex-end;background:" + t.userBubble + ";color:" + t.userText + ";border-bottom-right-radius:4px}" +
      ".typing{align-self:flex-start;display:flex;gap:4px;padding:10px 12px}" +
      ".typing span{width:6px;height:6px;border-radius:50%;background:" + t.subtitle + ";animation:breathe 1s ease-in-out infinite}" +
      ".typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}" +
      // voice control (voice-only)
      ".foot{flex-shrink:0;padding:14px 16px 20px;display:flex;flex-direction:column;align-items:center;gap:8px;border-top:1px solid " + t.cardRing + "}" +
      ".mic{position:relative;width:60px;height:60px;border:none;border-radius:50%;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;background:" +
      t.mic + ";box-shadow:" + t.orbShadow + ";transition:transform .15s}" +
      ".mic:hover{transform:scale(1.06)}.mic:active{transform:scale(.95)}.mic svg{position:relative;width:24px;height:24px}" +
      ".mic:disabled{opacity:.5;cursor:not-allowed}.mic:disabled:hover{transform:none}" +
      ".mic-ping{position:absolute;inset:0;border-radius:50%;background:" + t.micPing + ";opacity:0}" +
      ".mic.listening .mic-ping{animation:ping 1.4s cubic-bezier(0,0,.2,1) infinite}" +
      ".hint{font-size:12px;font-weight:500;color:" + t.subtitle + "}" +
      ".hidden{display:none!important}"
    );
  }

  function init(config) {
    var theme = THEMES[config.theme] || THEMES.dark;
    var name = config.assistantName || "Nova AI";

    var host = document.createElement("div");
    host.id = "nova-ai-widget-root";
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = buildCss(theme);
    root.appendChild(style);

    var barsHtml = "";
    var heights = [6, 10, 14, 8, 12];
    for (var i = 0; i < heights.length; i++) {
      barsHtml +=
        '<span class="bar" style="height:' + heights[i] + "px;animation-delay:" + i * 150 + 'ms"></span>';
    }

    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<button class="launcher" aria-label="Open assistant"><span class="ping"></span>' +
      ICON_CHAT +
      "</button>" +
      '<div class="panel" role="dialog" aria-label="' + esc(name) + ' assistant">' +
      '<button class="close" aria-label="Close assistant">' + ICON_CLOSE + "</button>" +
      '<div class="head">' +
      '<div class="orb-wrap"><span class="ring r1"></span><span class="ring r2"></span><span class="orb"></span></div>' +
      '<div class="title">Hello! I\'m ' + esc(name) + "</div>" +
      '<div class="sub">Your smart voice assistant.<br>Ask anything about ' +
      (config.businessName ? esc(config.businessName) : "our website") + ".</div>" +
      '<div class="status"><span class="status-text"></span><span class="eq">' + barsHtml + "</span></div>" +
      "</div>" +
      '<div class="log"></div>' +
      '<div class="foot">' +
      '<button class="mic" aria-label="Tap to speak">' +
      '<span class="mic-ping"></span>' + ICON_MIC + "</button>" +
      '<div class="hint">Tap to speak</div>' +
      "</div>" +
      "</div>";
    root.appendChild(wrap);

    var launcher = root.querySelector(".launcher");
    var panel = root.querySelector(".panel");
    var closeBtn = root.querySelector(".close");
    var log = root.querySelector(".log");
    var micBtn = root.querySelector(".mic");
    var hintEl = root.querySelector(".hint");
    var statusEl = root.querySelector(".status");
    var statusText = root.querySelector(".status-text");

    var history = [];
    var busy = false;
    var disabled = false;
    var greeted = false;

    function setStatus(text, active) {
      statusText.textContent = text || "";
      if (active) statusEl.classList.add("active");
      else statusEl.classList.remove("active");
    }

    function openPanel() {
      panel.classList.add("open");
      launcher.style.display = "none";
      if (!greeted) {
        greeted = true;
        addMessage("bot", "Hi! I'm " + name + ". Tap the mic and ask me anything.");
      }
    }
    function closePanel() {
      panel.classList.remove("open");
      launcher.style.display = "flex";
      stopListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    launcher.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
    });

    function addMessage(role, text) {
      var el = document.createElement("div");
      el.className = "msg " + (role === "user" ? "user" : "bot");
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    function showTyping() {
      var el = document.createElement("div");
      el.className = "typing";
      el.innerHTML = "<span></span><span></span><span></span>";
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    // ---- Voice output ----
    function speak(text) {
      if (!config.enableVoice || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.rate = 1;
        u.onstart = function () { setStatus("Speaking...", true); hintEl.textContent = "Speaking..."; };
        u.onend = function () { if (!listening) { setStatus("", false); hintEl.textContent = "Tap to speak"; } };
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    // ---- Voice input (voice-only widget) ----
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = null;
    var listening = false;
    var capturedText = "";   // full transcript captured so far
    var sendOnEnd = false;   // whether the next `onend` should submit
    var silenceTimer = null;

    // Auto-finish a short moment after the user stops talking.
    function armSilenceTimer() {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(function () {
        if (listening) finishListening();
      }, 1500);
    }

    if (SR) {
      recognition = new SR();
      recognition.lang = "en-US";
      recognition.continuous = true;      // keep listening through natural pauses
      recognition.interimResults = true;  // stream words so we can detect silence
      recognition.maxAlternatives = 1;

      recognition.onresult = function (e) {
        // Concatenate every result (final + current interim) into the full phrase.
        var full = "";
        for (var i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript + " ";
        }
        capturedText = full.replace(/\s+/g, " ").trim();
        hintEl.textContent = capturedText || "Listening...";
        armSilenceTimer();
      };
      recognition.onerror = function () { sendOnEnd = false; stopListening(); };
      recognition.onend = function () {
        listening = false;
        micBtn.classList.remove("listening");
        clearTimeout(silenceTimer);
        var text = capturedText.trim();
        capturedText = "";
        if (sendOnEnd && text) {
          sendOnEnd = false;
          sendMessage(text);
        } else {
          sendOnEnd = false;
          if (!busy) { setStatus("", false); hintEl.textContent = "Tap to speak"; }
        }
      };
    } else {
      // No speech recognition (e.g. Firefox) — the widget is voice-only.
      micBtn.disabled = true;
      hintEl.textContent = "Voice not supported in this browser";
    }

    function startListening() {
      if (!recognition || listening || disabled || busy) return;
      capturedText = "";
      sendOnEnd = false;
      try {
        recognition.start();
        listening = true;
        micBtn.classList.add("listening");
        hintEl.textContent = "Listening...";
        setStatus("Listening...", true);
      } catch (e) {}
    }

    // Stop capturing and submit whatever was heard.
    function finishListening() {
      if (!listening) return;
      sendOnEnd = true;
      clearTimeout(silenceTimer);
      try { recognition.stop(); } catch (e) {}
    }

    // Cancel capturing without submitting (e.g. closing the panel).
    function stopListening() {
      sendOnEnd = false;
      clearTimeout(silenceTimer);
      listening = false;
      micBtn.classList.remove("listening");
      try { if (recognition) recognition.stop(); } catch (e) {}
      if (!busy) { setStatus("", false); hintEl.textContent = "Tap to speak"; }
    }

    micBtn.addEventListener("click", function () {
      if (listening) finishListening();  // tap again to send immediately
      else startListening();
    });

    // ---- Chat ----
    function setDisabled(v) {
      disabled = v;
      micBtn.disabled = v;
    }

    function navigateTo(nav) {
      try {
        var url = new URL(nav.path, window.location.origin).href;
        setTimeout(function () { window.location.href = url; }, 1200);
      } catch (e) {}
    }

    function sendMessage(text) {
      text = (text || "").trim();
      if (!text || busy || disabled) return;
      addMessage("user", text);
      history.push({ role: "user", text: text });
      busy = true;
      setStatus("Thinking...", true);
      hintEl.textContent = "Thinking...";
      var typing = showTyping();

      fetch(apiBase + "/api/widget/" + encodeURIComponent(userId) + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-10) }),
      })
        .then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); })
        .then(function (res) {
          typing.remove();
          busy = false;
          var d = res.data || {};
          var reply = d.reply || "Sorry, I couldn't respond.";
          addMessage("bot", reply);
          history.push({ role: "model", text: reply });
          setStatus("", false);
          hintEl.textContent = "Tap to speak";
          speak(reply);
          if (d.navigate && d.navigate.path) navigateTo(d.navigate);
          if (d.error === "limit_reached" || d.error === "invalid") {
            setDisabled(true);
            hintEl.textContent = "Assistant unavailable";
          }
        })
        .catch(function () {
          typing.remove();
          busy = false;
          setStatus("", false);
          hintEl.textContent = "Tap to speak";
          addMessage("bot", "Sorry, I'm having trouble connecting. Please try again.");
        });
    }
  }

  // ---- Fetch config and boot ----
  fetch(apiBase + "/api/widget/" + encodeURIComponent(userId))
    .then(function (r) { return r.json(); })
    .then(function (config) {
      if (!config || config.available === false) return;
      if (document.body) init(config);
      else window.addEventListener("DOMContentLoaded", function () { init(config); });
    })
    .catch(function (e) {
      console.warn("[NovaAI] Failed to load assistant:", e);
    });
})();
