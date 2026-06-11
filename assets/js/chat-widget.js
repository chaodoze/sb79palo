// "Ask AI about SB 79" — grounded chat widget for council-watch.
// Posts to /api/chat (Cloudflare Worker), renders answers + citations.
// No frameworks; uses a tiny inline Markdown subset renderer.

(function () {
  if (window.__sb79ChatLoaded) return;
  window.__sb79ChatLoaded = true;

  const SUGGESTED = [
    "What is SB 79?",
    "Which Palo Alto Caltrain station is which tier?",
    "What did Council decide, and what happens next?",
    "How do I comment at the next meeting?",
  ];

  const SESSION_KEY = "sb79.chat.sessionId";

  function getSessionId() {
    try {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return `nostore-${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  // Inline markdown subset: **bold**, *italic*, [text](url), bullet lists, paragraphs.
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMarkdown(src) {
    const lines = src.split(/\r?\n/);
    const html = [];
    let listOpen = false;
    let para = [];
    const flushPara = () => {
      if (para.length) {
        html.push("<p>" + inline(para.join(" ")) + "</p>");
        para = [];
      }
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        flushPara();
        if (listOpen) { html.push("</ul>"); listOpen = false; }
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        flushPara();
        if (!listOpen) { html.push("<ul>"); listOpen = true; }
        html.push("<li>" + inline(line.replace(/^[-*]\s+/, "")) + "</li>");
        continue;
      }
      if (listOpen) { html.push("</ul>"); listOpen = false; }
      para.push(line);
    }
    flushPara();
    if (listOpen) html.push("</ul>");
    return html.join("");
  }

  function inline(text) {
    let s = escapeHtml(text);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?=[^*]|$)/g, "$1<em>$2</em>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    return s;
  }

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, "");
      else if (v != null && v !== false) node.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  const state = {
    sessionId: getSessionId(),
    history: [],
    busy: false,
    panel: null,
    body: null,
    input: null,
    sendBtn: null,
    fab: null,
  };

  function buildFab() {
    const fab = el(
      "button",
      { class: "chat-fab", type: "button", "aria-label": "Open SB 79 assistant", "aria-haspopup": "dialog" },
      el("span", { class: "chat-fab-dot", "aria-hidden": "true" }),
      "Ask AI about SB 79",
    );
    fab.addEventListener("click", openPanel);
    return fab;
  }

  function buildPanel() {
    const close = el("button", { class: "chat-close", type: "button", "aria-label": "Close" }, "✕");
    close.addEventListener("click", closePanel);

    const head = el(
      "div",
      { class: "chat-head" },
      el(
        "div",
        { class: "chat-head-title" },
        el("strong", {}, "Ask AI about SB 79"),
        el("span", {}, "Grounded in our sources"),
      ),
      el("span", { class: "chat-experimental" }, "Experimental"),
      close,
    );

    const body = el("div", { class: "chat-body", "aria-live": "polite", role: "log" });
    renderEmpty(body);

    const input = el("textarea", {
      class: "chat-input",
      rows: 1,
      placeholder: "Ask anything about SB 79 in Palo Alto…",
      "aria-label": "Message",
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 128) + "px";
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    const sendBtn = el("button", { class: "chat-send", type: "submit" }, "Send");
    const form = el("form", { class: "chat-form" }, input, sendBtn);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      send();
    });

    const foot = el(
      "div",
      { class: "chat-foot" },
      "Answers cite only the sources listed in ",
      el("a", { href: "/about.html", target: "_blank", rel: "noopener" }, "About & sources"),
      ". Chats are logged anonymously.",
    );

    const panel = el(
      "div",
      { class: "chat-panel", role: "dialog", "aria-label": "SB 79 assistant", hidden: true },
      head,
      body,
      form,
      foot,
    );

    state.panel = panel;
    state.body = body;
    state.input = input;
    state.sendBtn = sendBtn;
    return panel;
  }

  function renderEmpty(body) {
    body.innerHTML = "";
    const intro = el(
      "p",
      {},
      "Hi. I can answer questions about SB 79 — the bill, what Palo Alto is deciding, neighboring cities — using the sources this site has verified. I'll say so if I don't know.",
    );
    const sugList = el(
      "div",
      { class: "chat-suggestions" },
      ...SUGGESTED.map((q) => {
        const b = el("button", { class: "chat-suggestion", type: "button" }, q);
        b.addEventListener("click", () => {
          state.input.value = q;
          send();
        });
        return b;
      }),
    );
    body.appendChild(el("div", { class: "chat-empty" }, intro, sugList));
  }

  function openPanel() {
    if (!state.panel) {
      state.panel = buildPanel();
      document.body.appendChild(state.panel);
    }
    state.panel.removeAttribute("hidden");
    if (state.fab) state.fab.style.display = "none";
    setTimeout(() => state.input?.focus(), 50);
  }

  function closePanel() {
    state.panel?.setAttribute("hidden", "");
    if (state.fab) state.fab.style.display = "";
  }

  function appendUser(content) {
    if (state.body.querySelector(".chat-empty")) state.body.innerHTML = "";
    state.body.appendChild(el("div", { class: "chat-msg chat-msg-user" }, content));
    state.body.scrollTop = state.body.scrollHeight;
  }

  function appendTyping() {
    const t = el(
      "div",
      { class: "chat-typing", "aria-label": "Assistant is typing" },
      el("span"),
      el("span"),
      el("span"),
    );
    state.body.appendChild(t);
    state.body.scrollTop = state.body.scrollHeight;
    return t;
  }

  function appendError(message) {
    state.body.appendChild(el("div", { class: "chat-error" }, message));
    state.body.scrollTop = state.body.scrollHeight;
  }

  function appendAssistant(payload) {
    const wrap = el("div", { class: "chat-msg chat-msg-assistant" + (payload.refused ? " is-refused" : "") });
    const body = el("div", { class: "chat-answer" });
    body.innerHTML = renderMarkdown(payload.answer || "");
    annotateCitations(body, payload.citations);
    wrap.appendChild(body);

    if (Array.isArray(payload.citations) && payload.citations.length) {
      const cite = el("div", { class: "chat-citations" });
      const heading = el("div", {}, "Sources");
      const list = el("ol", {});
      payload.citations.forEach((c, i) => {
        const a = el("a", { href: c.url, target: "_blank", rel: "noopener" }, c.title || c.id);
        const li = el("li", { value: i + 1 }, a);
        list.appendChild(li);
      });
      cite.append(heading, list);
      wrap.appendChild(cite);
    }
    state.body.appendChild(wrap);
    state.body.scrollTop = state.body.scrollHeight;
  }

  function annotateCitations(container, citations) {
    if (!Array.isArray(citations) || citations.length === 0) return;
    container.querySelectorAll("p, li").forEach((node) => {
      let text = node.textContent || "";
      if (!text) return;
    });
    // We don't auto-place superscript markers inside the answer text because
    // the model returns annotations indexed against the raw output (which we
    // already escape/parse for Markdown). The numbered footnote list under
    // the answer is the citation surface for v1.
  }

  async function send() {
    if (state.busy) return;
    const text = (state.input.value || "").trim();
    if (!text) return;
    state.input.value = "";
    state.input.style.height = "auto";

    appendUser(text);
    state.history.push({ role: "user", content: text });

    state.busy = true;
    state.sendBtn.disabled = true;
    const typing = appendTyping();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: state.sessionId, messages: state.history }),
      });
      typing.remove();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        appendError(err.error || `Error ${res.status}. Try again in a moment.`);
        return;
      }

      const data = await res.json();
      appendAssistant(data);
      state.history.push({ role: "assistant", content: data.answer || "" });
    } catch (err) {
      typing.remove();
      appendError("Network error. Check your connection and try again.");
    } finally {
      state.busy = false;
      state.sendBtn.disabled = false;
      state.input.focus();
    }
  }

  function init() {
    state.fab = buildFab();
    document.body.appendChild(state.fab);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
