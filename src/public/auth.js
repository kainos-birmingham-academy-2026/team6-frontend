(() => {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;

    button.hidden = false;
    button.addEventListener("click", () => {
      const revealed = input.type === "text";
      input.type = revealed ? "password" : "text";
      button.textContent = revealed ? "Show" : "Hide";
      button.setAttribute("aria-pressed", String(!revealed));
      button.setAttribute("aria-label", revealed ? "Show password" : "Hide password");
    });
  });
})();
