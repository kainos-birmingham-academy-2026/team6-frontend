(function () {
  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const messages = document.getElementById("chat-messages");

  if (!toggle || !panel || !form || !input || !messages) {
    return;
  }

  function addMessage(text, author) {
    const item = document.createElement("li");
    item.className = "chat-msg chat-msg--" + author;
    // textContent, never innerHTML: model output is untrusted and must not be parsed as HTML.
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function setOpen(open) {
    panel.toggleAttribute("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close job roles assistant" : "Open job roles assistant"
    );
    if (open) {
      input.focus();
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(panel.hasAttribute("hidden"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setOpen(false);
      toggle.focus();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hasAttribute("hidden")) {
      setOpen(false);
      toggle.focus();
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = input.value.trim();
    if (question.length < 3) {
      return;
    }

    addMessage(question, "user");
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;

    const pending = addMessage("Thinking…", "bot");

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question })
      });

      const data = await response.json();
      pending.textContent =
        data.answer || data.error || "Sorry, something went wrong. Please try again.";
    } catch (_error) {
      pending.textContent = "Sorry, I could not reach the assistant. Please try again.";
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
