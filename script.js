document.addEventListener('DOMContentLoaded', () => {

  // --- VARIABLES ---
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // WhatsApp Elements
  const whatsappWidget = document.getElementById('whatsapp-widget');
  const whatsappBubble = document.getElementById('whatsapp-widget-bubble');
  const whatsappClose = document.getElementById('whatsapp-widget-close');
  const whatsappNumberBtns = document.querySelectorAll('.whatsapp-number-btn');
  const whatsappNavBtn = document.getElementById('nav-whatsapp-btn');
  const whatsappHeroBtn = document.getElementById('hero-whatsapp-btn');
  const whatsappContactBtn = document.getElementById('contact-whatsapp-btn');
  const orderProductBtns = document.querySelectorAll('.order-product-btn');
  
  let currentProductOrder = null; // Stores currently selected product for WhatsApp messages

  // --- PRELOADER ---
  const preloader = document.getElementById('preloader');
  if (preloader) {
    document.body.classList.add('preloading');
    window.addEventListener('load', () => {
      // Small buffer so the transition feels intentional rather than abrupt
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        document.body.classList.remove('preloading');
      }, 400);
    });
  }

  // --- STICKY HEADER ---
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        // Sticky page headers like product detail pages always stay scrolled
        if (!document.querySelector('.product-detail-page')) {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  // --- MOBILE MENU TOGGLE ---
  if (mobileToggle && header) {
    mobileToggle.addEventListener('click', () => {
      header.classList.toggle('menu-open');
      mobileToggle.classList.toggle('active');
    });
  }

  // Smooth scroll and mobile menu close for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close menu on mobile
        if (header) header.classList.remove('menu-open');
        if (mobileToggle) mobileToggle.classList.remove('active');

        // Scroll with sticky header offset
        const headerOffset = header ? header.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- SCROLL REVEAL ANIMATIONS ---
  // Includes the original ".reveal" fade-up as well as the newer
  // ".reveal-left", ".reveal-right", ".reveal-scale" and ".reveal-fade"
  // variants used for extra visual variety. All share the same
  // "add .active once visible" behavior; the actual motion/style for
  // each variant is defined in style.css.
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade'
  );
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- ACTIVE LINK SCROLL SPY ---
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && navLinks.length > 0) {
    const scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}` || link.getAttribute('href') === `index.html#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    });
    sections.forEach(sec => scrollSpyObserver.observe(sec));
  }

  // --- TESTIMONIALS CAROUSEL SLIDER (with autoplay) ---
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const carouselContainer = document.querySelector('.testimonials-carousel-container');
  const progressTrack = document.getElementById('testimonial-progress-track');
  const progressFill = progressTrack ? progressTrack.querySelector('.testimonial-progress-fill') : null;

  let currentSlide = 0;
  const AUTOPLAY_DELAY = 6000; // ms — how long each testimonial stays on screen
  let autoplayTimer = null;

  function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  // Restarts the little progress bar under the carousel so it always
  // reflects the time remaining until the next automatic slide.
  function restartProgressBar() {
    if (!progressFill) return;
    progressFill.style.animation = 'none';
    // Force a reflow so the animation can be re-triggered cleanly
    void progressFill.offsetWidth;
    progressFill.style.animation = `testimonialProgress ${AUTOPLAY_DELAY / 1000}s linear`;
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (progressTrack) progressTrack.classList.remove('paused');
    restartProgressBar();
    autoplayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
      restartProgressBar();
    }, AUTOPLAY_DELAY);
  }

  if (slides.length > 0) {
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        startAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        startAutoplay();
      });
    }
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'));
        showSlide(idx);
        startAutoplay();
      });
    });

    // Pause the automatic sliding while the user is hovering / interacting
    // with the carousel, and resume smoothly once they move away.
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', () => {
        stopAutoplay();
        if (progressTrack) progressTrack.classList.add('paused');
      });
      carouselContainer.addEventListener('mouseleave', () => {
        startAutoplay();
      });
    }

    // Pause when the browser tab isn't visible to avoid wasted cycles,
    // and pick back up automatically when the user returns.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    startAutoplay();
  }

  // --- PRODUCT GALLERY THUMBNAILS SELECTOR ---
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainImg = document.getElementById('main-product-img');

  if (thumbs.length > 0 && mainImg) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const newSrc = thumb.getAttribute('data-src');
        if (newSrc) {
          mainImg.setAttribute('src', newSrc);
        }
      });
    });
  }

  // --- LUXURY FAQ ACCORDION TRIGGER ---
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  if (faqTriggers.length > 0) {
    faqTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const parent = trigger.parentElement;
        const wasActive = parent.classList.contains('active');
        
        // Collapse other accordions
        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('active');
        });

        if (!wasActive) {
          parent.classList.add('active');
        }
      });
    });
  }

  // --- WHATSAPP FLOATING WIDGET ---
  function openWhatsappWidget(productKey = null) {
    currentProductOrder = productKey;
    if (whatsappWidget) {
      whatsappWidget.classList.add('active');
      if (window.innerWidth < 768) {
        whatsappWidget.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }

  function closeWhatsappWidget() {
    if (whatsappWidget) {
      whatsappWidget.classList.remove('active');
    }
    currentProductOrder = null;
  }

  if (whatsappBubble && whatsappWidget) {
    whatsappBubble.addEventListener('click', (e) => {
      e.stopPropagation();
      whatsappWidget.classList.toggle('active');
    });
  }

  if (whatsappClose) {
    whatsappClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWhatsappWidget();
    });
  }

  document.addEventListener('click', (e) => {
    if (whatsappWidget && whatsappBubble) {
      if (!whatsappWidget.contains(e.target) && e.target !== whatsappBubble) {
        closeWhatsappWidget();
      }
    }
  });

  const globalWhatsappUrl = "https://wa.me/96871265767?text=Hello%20Areva%20Ingredients,%20I%20would%20like%20to%20know%20more%20about%20your%20products.";

  if (whatsappNavBtn) {
    whatsappNavBtn.addEventListener('click', () => {
      window.open(globalWhatsappUrl, '_blank');
    });
  }
  if (whatsappHeroBtn) {
    whatsappHeroBtn.addEventListener('click', () => {
      window.open(globalWhatsappUrl, '_blank');
    });
  }
  if (whatsappContactBtn) {
    whatsappContactBtn.addEventListener('click', () => {
      window.open(globalWhatsappUrl, '_blank');
    });
  }

  orderProductBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(globalWhatsappUrl, '_blank');
    });
  });

  whatsappNumberBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const phoneNumber = btn.getAttribute('data-number');
      const region = btn.getAttribute('data-region');
      let message = "";

      if (currentProductOrder === "face-oil") {
        message = `Hello Areva Ingredients, I would like to order the Areva Face Oil (30ml). Please guide me on how to proceed. (Order Region: ${region})`;
      } else if (currentProductOrder === "body-butter") {
        message = `Hello Areva Ingredients, I would like to order the Areva Body Butter (250ml). Please guide me on how to proceed. (Order Region: ${region})`;
      } else {
        message = `Hello Areva Ingredients, I have an inquiry about your premium botanical skincare products.`;
      }

      const encodedText = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedText}`;
      
      window.open(whatsappUrl, '_blank');
      closeWhatsappWidget();
    });
  });

  // Escape key closes widget
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWhatsappWidget();
    }
  });

});
