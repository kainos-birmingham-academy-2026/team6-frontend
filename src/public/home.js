(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const counters = document.querySelectorAll(".counter");
  const runCounter = (element) => {
    const target = Number(element.dataset.countTo || "0");
    if (prefersReducedMotion) {
      element.textContent = target.toLocaleString();
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCounter);
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const carousel = document.querySelector("[data-testimonials]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".testimonial"));
    const dotsWrap = carousel.querySelector(".testimonial-dots");
    let index = 0;
    let timer;

    const dots = slides.map((_, position) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonial-dot";
      dot.setAttribute("aria-label", `Show story ${position + 1}`);
      dot.addEventListener("click", () => show(position));
      dotsWrap.appendChild(dot);
      return dot;
    });

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, position) => slide.classList.toggle("is-active", position === index));
      dots.forEach((dot, position) => dot.classList.toggle("is-active", position === index));
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      timer = window.setInterval(() => show(index + 1), 6000);
    }

    function stopAutoplay() {
      window.clearInterval(timer);
    }

    carousel
      .querySelector("[data-testimonial-prev]")
      .addEventListener("click", () => show(index - 1));
    carousel
      .querySelector("[data-testimonial-next]")
      .addEventListener("click", () => show(index + 1));
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);

    show(0);
    startAutoplay();
  }

  const videoFrame = document.querySelector(".video-frame[data-video-id]");
  const videoId = videoFrame?.dataset.videoId?.trim();
  if (videoFrame && videoId && /^[\w-]{6,20}$/.test(videoId)) {
    videoFrame.addEventListener("click", (event) => {
      event.preventDefault();
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;
      iframe.title = "Life at Kainos";
      iframe.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.className = "video-embed";
      videoFrame.replaceWith(iframe);
    });
  }
})();
