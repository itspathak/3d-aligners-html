document.addEventListener("DOMContentLoaded", () => {
  // AOS scroll animations
  //
  // AOS's stylesheet holds every [data-aos^=fade] element at opacity: 0 and
  // only .aos-animate brings it back, so this library decides whether the
  // content is visible at all. Two things made a section show up late here:
  //
  //   1. aos.js was loaded from unpkg.com, so a slow or blocked CDN delayed
  //      AOS.init() and the section sat blank until it arrived. It is served
  //      from vendor/ with the rest of the site now.
  //   2. AOS caches every element's offset when it initialises. This page is
  //      full of images and web fonts, so the document kept growing after
  //      that snapshot and the cached trigger points drifted, which could fire
  //      a section late or leave it hidden. refreshHard() re-measures once
  //      loading has actually finished.
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches
    });

    window.addEventListener("load", () => AOS.refreshHard());
  } else {
    // Last resort. Without the library nothing can ever add .aos-animate, so
    // the stylesheet would keep the section at opacity: 0 permanently.
    const style = document.createElement("style");
    style.textContent =
      "[data-aos]{opacity:1 !important;transform:none !important}";
    document.head.appendChild(style);
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

  // Video lightbox: load the clicked video, then clean it up on close.
  const videoModal = document.getElementById("videoModal");
  const videoPlayer = document.getElementById("globalVideoPlayer");
  if (videoModal && videoPlayer) {
    const videoSource = videoPlayer.querySelector("source");

    videoModal.addEventListener("show.bs.modal", (event) => {
      const videoSrc = event.relatedTarget && event.relatedTarget.dataset.videoSrc;
      if (!videoSrc) return;
      videoSource.src = videoSrc;
      videoPlayer.load();
    });

    videoModal.addEventListener("shown.bs.modal", () => {
      videoPlayer.play().catch(() => { });
    });

    videoModal.addEventListener("hidden.bs.modal", () => {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
      videoSource.removeAttribute("src");
      videoPlayer.load();
    });
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

  /* ------------------------------------------------------------
     TREATMENT PHASE SLIDER
     Slides, thumbnails and the counter total are all written
     out statically in the HTML. This code only wires up the
     carousel and keeps the UI in sync while it changes.
     ------------------------------------------------------------ */

  // The page carries the same phase section more than once, alternating
  // which side the slider sits on, so every root is wired up on its own.
  document.querySelectorAll("[data-treatment-phase]").forEach((phaseRoot) => {
  if (window.jQuery && jQuery.fn.owlCarousel) {
    const $ = jQuery;
    const track = phaseRoot.querySelector("[data-phase-track]");
    const rail = phaseRoot.querySelector("[data-phase-thumbs]");
    const dotsBox = phaseRoot.querySelector("[data-phase-dots]");
    const currentOut = phaseRoot.querySelector("[data-phase-current]");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pad2 = (n) => String(n).padStart(2, "0");
    const total = track.querySelectorAll(".item").length;
    const $track = $(track);
    let replayTimer = 0;

    // loop:false + rewind:true is deliberate. With loop:true Owl clones the
    // slides, which makes both to.owl.carousel and e.item.index unreliable,
    // so thumbnail clicks would not move the stage. rewind:true still gives
    // endless autoplay: it jumps from the last slide back to the first.
    $track.owlCarousel({
      items: 1,
      loop: false,
      rewind: true,
      margin: 0,
      dots: true,
      dotsEach: 1,
      dotsContainer: dotsBox,
      nav: false,
      autoplay: !calm,
      autoplayTimeout: 5200,
      autoplayHoverPause: true,
      smartSpeed: 550
    });

    // Single source of truth for "which slide is showing".
    function show(index) {
      if (!(index >= 0) || index >= total) return;
      currentOut.textContent = pad2(index + 1);
      rail.querySelectorAll(".treatment-phase__thumb").forEach((btn, i) => {
        btn.setAttribute("aria-selected", String(i === index));
      });
    }

    // Read the active slide back from Owl, with the dots as a fallback.
    $track.on("changed.owl.carousel", (e) => {
      const index = e.item && typeof e.item.index === "number" ? e.item.index : -1;
      if (index >= 0 && index < total) {
        show(index);
        return;
      }
      const $dots = $(dotsBox).find(".owl-dot");
      const fromDots = $dots.index($dots.filter(".active"));
      show(fromDots > -1 ? fromDots : 0);
    });

    // Pause, jump, then give the picked image a full interval before the
    // autoplay timer picks up again.
    function goTo(index) {
      show(index);
      $track.trigger("to.owl.carousel", [index, 550]);
      if (calm) return;

      $track.trigger("stop.owl.autoplay");
      window.clearTimeout(replayTimer);
      replayTimer = window.setTimeout(() => $track.trigger("play.owl.autoplay"), 550);
    }

    // Clicking a thumbnail shows that image in the stage.
    rail.addEventListener("click", (e) => {
      const btn = e.target.closest(".treatment-phase__thumb");
      if (!btn) return;
      goTo(Number(btn.dataset.index));
    });

    // Left / right arrows move between thumbnails once one has focus.
    rail.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const buttons = Array.from(rail.querySelectorAll(".treatment-phase__thumb"));
      const at = buttons.indexOf(document.activeElement);
      if (at === -1) return;

      e.preventDefault();
      const step = e.key === "ArrowRight" ? 1 : -1;
      const next = buttons[(at + step + buttons.length) % buttons.length];
      next.focus();
      goTo(Number(next.dataset.index));
    });

    // Hold autoplay while the user is browsing the rail.
    rail.addEventListener("mouseenter", () => $track.trigger("stop.owl.autoplay"));
    rail.addEventListener("mouseleave", () => $track.trigger("play.owl.autoplay"));
  }
  });
});
