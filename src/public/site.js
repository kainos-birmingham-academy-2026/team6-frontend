(() => {
  document.documentElement.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const confettiHost = document.querySelector("[data-confetti]");
  if (confettiHost && !prefersReducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2000;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const colors = ["#283583", "#41679f", "#004631", "#61a83f", "#ffffff"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: -1.5 + Math.random() * 3,
      rotation: Math.random() * Math.PI,
      spin: -0.2 + Math.random() * 0.4
    }));

    const duration = 3200;
    const start = performance.now();

    const draw = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((piece) => {
        piece.x += piece.speedX;
        piece.y += piece.speedY;
        piece.rotation += piece.spin;
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
        ctx.restore();
      });

      if (now - start < duration) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(draw);
  }

  const revealItems = document.querySelectorAll(".reveal");

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

