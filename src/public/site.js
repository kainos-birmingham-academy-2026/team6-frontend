(() => {
  document.documentElement.classList.add("js");

  const nav = document.querySelector(".site-nav");
  if (nav) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-link theme-toggle";
    toggle.setAttribute("aria-label", "Toggle dark mode");

    const setIcon = () => {
      toggle.textContent = document.documentElement.dataset.theme === "dark" ? "☀️" : "🌙";
    };
    setIcon();

    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      setIcon();
    });

    nav.appendChild(toggle);
  }

  const revealItems = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
})();
