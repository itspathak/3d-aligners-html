document.addEventListener("DOMContentLoaded", () => {
  // AOS scroll animations
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches
    });
  }

  // Owl Carousel project slider
  if (window.jQuery && jQuery.fn.owlCarousel) {
    const $feedback = jQuery(".feedback-carousel");
    $feedback.owlCarousel({
      loop: true,
      margin: 22,
      dots: true,
      dotsEach: 1,
      autoplay: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      autoplayTimeout: 5600,
      autoplayHoverPause: true,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        992: { items: 3 }
      }
    });

    jQuery(".feedback-nav .owl-prev").on("click", () => $feedback.trigger("prev.owl.carousel"));
    jQuery(".feedback-nav .owl-next").on("click", () => $feedback.trigger("next.owl.carousel"));
  }

  // Our Happy Customer testimonial slider (markup stays untouched)
  const happy = document.querySelector(".happy-feature");
  if (happy) {
    const testimonials = [
      {
        name: "Alena Alex",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=520&q=85",
        quote: "I was self-conscious about my smile for years. The process was simple, my dentist was wonderful, and now I can’t stop smiling."
      },
      {
        name: "Sarah Miller",
        photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=520&q=85",
        quote: "Clear, comfortable and so easy to wear. I barely noticed the aligners, but everyone noticed my smile."
      },
      {
        name: "Rahul Mehta",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=520&q=85",
        quote: "I saw my whole treatment plan digitally before we began. Six months later the difference is unreal."
      }
    ];

    const portrait = happy.querySelector(".happy-portrait");
    const personName = happy.querySelector(".happy-copy h3");
    const personQuote = happy.querySelector(".happy-copy p");
    const dots = Array.from(happy.querySelectorAll(".slider-dots span"));
    const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 6500;
    let at = 0;
    let tick = null;

    const animate = () => {
      happy.classList.remove("is-slide");
      void happy.offsetWidth;
      happy.classList.add("is-slide");
    };

    const show = (target) => {
      const next = (target + testimonials.length) % testimonials.length;
      if (next !== at) {
        const person = testimonials[next];
        at = next;
        portrait.src = person.photo;
        portrait.alt = person.name + ", 3D Align patient";
        personName.textContent = person.name;
        personQuote.textContent = person.quote;
        dots.forEach((dot, i) => {
          const on = i === at;
          dot.classList.toggle("active", on);
          if (on) { dot.setAttribute("aria-current", "true"); } else { dot.removeAttribute("aria-current"); }
        });
      }
      animate();
    };

    const play = () => {
      window.clearTimeout(tick);
      if (wait) tick = window.setTimeout(() => { show(at + 1); play(); }, wait);
    };

    testimonials.forEach((person) => { const img = new Image(); img.src = person.photo; });

    const arrows = document.createElement("div");
    arrows.className = "happy-arrows";
    const step = (amount) => () => { show(at + amount); play(); };
    const build = (cls, label, glyph) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = cls;
      button.setAttribute("aria-label", label);
      button.innerHTML = glyph;
      return button;
    };
    arrows.appendChild(build("happy-prev", "Previous testimonial", "&#10094;"));
    arrows.appendChild(build("happy-next", "Next testimonial", "&#10095;"));
    const stepBack = step(-1);
    const stepFwd = step(1);
    arrows.querySelector(".happy-prev").addEventListener("click", stepBack);
    arrows.querySelector(".happy-next").addEventListener("click", stepFwd);
    happy.querySelector(".slider-dots").insertAdjacentElement("afterend", arrows);

    dots.forEach((dot, i) => {
      dot.setAttribute("role", "button");
      dot.setAttribute("tabindex", "0");
      dot.setAttribute("aria-label", "Show testimonial from " + testimonials[i].name);
      const pick = () => { show(i); play(); };
      dot.addEventListener("click", pick);
      dot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); pick(); }
      });
    });

    happy.addEventListener("mouseenter", () => window.clearTimeout(tick));
    happy.addEventListener("mouseleave", play);
    happy.addEventListener("focusin", () => window.clearTimeout(tick));
    happy.addEventListener("focusout", play);

    let touchX = null;
    happy.addEventListener("touchstart", (event) => { touchX = event.changedTouches[0].clientX; }, { passive: true });
    happy.addEventListener("touchend", (event) => {
      if (touchX === null) { return; }
      const swipe = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(swipe) > 45) { show(at + (swipe < 0 ? 1 : -1)); play(); }
    }, { passive: true });

    show(0);
  }

  // Flag the header once it is actually stuck to the top.
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    let ticking = false;
    const syncStuck = () => {
      ticking = false;
      siteHeader.classList.toggle("is-stuck", window.scrollY > 10);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncStuck);
    };
    syncStuck();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  // Keep the footer year current.
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  // Close the mobile menu after choosing a section link.
  const nav = document.getElementById("mainNav");
  if (nav && window.bootstrap) {
    nav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 991.98px)").matches) {
          bootstrap.Collapse.getOrCreateInstance(nav).hide();
        }
      });
    });
  }
});
