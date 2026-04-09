/* ==========================================
   CYNTHIA WANJIRA — F1 Creator Portfolio
   JavaScript: Content Loading, Animations, Nav, Form
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== CONTENT LOADING =====
  async function loadContent() {
    let loaded = false;

    // Priority 1: localStorage (admin-saved content)
    const stored = localStorage.getItem('cw_admin_content');
    if (stored) {
      try {
        const content = JSON.parse(stored);
        populatePage(content);
        loaded = true;
      } catch (e) { /* fall through */ }
    }

    // Priority 2: content.json file
    if (!loaded) {
      try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('No content.json');
        const content = await response.json();
        populatePage(content);
        loaded = true;
      } catch (e) { /* fall through */ }
    }

    if (!loaded) {
      console.log('Using hardcoded HTML content');
    }

    // Initialize all interactions after content is ready
    initAll();
  }

  function populatePage(c) {
    // --- Hero ---
    if (c.hero) {
      const heroGreeting = document.querySelector('.hero-greeting');
      const heroTitle = document.querySelector('.hero-title');
      const heroDesc = document.querySelector('.hero-desc');
      const heroImg = document.querySelector('.hero-image-wrapper img');
      const ctaPrimary = document.querySelector('.hero-cta-group .btn-primary');
      const ctaOutline = document.querySelector('.hero-cta-group .btn-outline');

      if (heroGreeting) heroGreeting.textContent = c.hero.greeting;
      if (heroTitle) heroTitle.innerHTML = c.hero.title;
      if (heroDesc) heroDesc.textContent = c.hero.description;
      if (heroImg) heroImg.src = c.hero.image;
      if (ctaPrimary) {
        ctaPrimary.textContent = c.hero.cta1Text;
        ctaPrimary.href = c.hero.cta1Link;
      }
      if (ctaOutline) {
        ctaOutline.textContent = c.hero.cta2Text;
        ctaOutline.href = c.hero.cta2Link;
      }
    }

    // --- About ---
    if (c.about) {
      const aboutTitle = document.querySelector('.about-text-content .section-title');
      const aboutBios = document.querySelectorAll('.about-bio');
      const aboutImg = document.querySelector('.about-image-wrapper img');
      const aboutTags = document.querySelector('.about-tags');

      if (aboutTitle) aboutTitle.innerHTML = c.about.title;
      if (aboutImg) aboutImg.src = c.about.image;

      // Update bio paragraphs
      if (aboutBios.length > 0 && c.about.bio) {
        const bioContainer = aboutBios[0].parentElement;
        // Remove existing bio paragraphs
        aboutBios.forEach(p => p.remove());
        // Insert new ones before the tags
        const tagsEl = bioContainer.querySelector('.about-tags');
        c.about.bio.forEach(text => {
          const p = document.createElement('p');
          p.className = 'about-bio';
          p.innerHTML = text;
          bioContainer.insertBefore(p, tagsEl);
        });
      }

      // Update tags
      if (aboutTags && c.about.tags) {
        aboutTags.innerHTML = c.about.tags
          .map(tag => `<span class="about-tag">${tag}</span>`)
          .join('');
      }
    }

    // --- Portfolio ---
    if (c.portfolio) {
      const grid = document.querySelector('.portfolio-grid');
      if (grid) {
        // Collect unique categories for filter buttons
        const categories = [...new Set(c.portfolio.map(p => p.category))];
        const filterContainer = document.querySelector('.portfolio-filters');
        if (filterContainer) {
          filterContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>';
          categories.forEach(cat => {
            const label = c.portfolio.find(p => p.category === cat)?.type || cat;
            filterContainer.innerHTML += `<button class="filter-btn" data-filter="${cat}">${label}</button>`;
          });
        }

        // Build portfolio cards
        grid.innerHTML = '';
        c.portfolio.forEach((item, i) => {
          const card = document.createElement('div');
          card.className = `portfolio-card reveal-scale delay-${Math.min(i + 1, 5)}`;
          card.setAttribute('data-category', item.category);

          if (item.mediaType === 'video') {
            card.innerHTML = `
              <video src="${item.image}" muted loop playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;"></video>
              <div class="portfolio-card-overlay">
                <span class="portfolio-card-type">${item.type}</span>
                <h3 class="portfolio-card-title">${item.title}</h3>
                <p class="portfolio-card-desc">${item.description}</p>
              </div>
            `;
            // Play video on hover
            card.addEventListener('mouseenter', () => card.querySelector('video')?.play());
            card.addEventListener('mouseleave', () => {
              const v = card.querySelector('video');
              if (v) { v.pause(); v.currentTime = 0; }
            });
          } else {
            card.innerHTML = `
              <img src="${item.image}" alt="${item.title}" loading="lazy">
              <div class="portfolio-card-overlay">
                <span class="portfolio-card-type">${item.type}</span>
                <h3 class="portfolio-card-title">${item.title}</h3>
                <p class="portfolio-card-desc">${item.description}</p>
              </div>
            `;
          }
          grid.appendChild(card);
        });
      }
    }

    // --- Stats ---
    if (c.stats) {
      const statCards = document.querySelectorAll('.stat-card');
      c.stats.forEach((stat, i) => {
        if (statCards[i]) {
          const icon = statCards[i].querySelector('.stat-icon');
          const number = statCards[i].querySelector('.stat-number');
          const label = statCards[i].querySelector('.stat-label');
          if (icon) icon.textContent = stat.icon;
          if (number) {
            number.setAttribute('data-target', stat.target);
            number.setAttribute('data-suffix', stat.suffix);
            number.textContent = '0';
          }
          if (label) label.textContent = stat.label;
        }
      });
    }

    // --- Services ---
    if (c.services) {
      const serviceCards = document.querySelectorAll('.service-card');
      c.services.forEach((svc, i) => {
        if (serviceCards[i]) {
          const icon = serviceCards[i].querySelector('.service-icon');
          const title = serviceCards[i].querySelector('.service-title');
          const desc = serviceCards[i].querySelector('.service-desc');
          const features = serviceCards[i].querySelector('.service-features');
          const cta = serviceCards[i].querySelector('.btn-primary');

          if (icon) icon.textContent = svc.icon;
          if (title) title.textContent = svc.title;
          if (desc) desc.textContent = svc.description;
          if (features && svc.features) {
            features.innerHTML = svc.features.map(f => `<li>${f}</li>`).join('');
          }
          if (cta) {
            cta.textContent = svc.ctaText;
            cta.href = svc.ctaLink;
          }
        }
      });
    }

    // --- Contact ---
    if (c.contact) {
      const emailLink = document.getElementById('contact-email-link');
      const tiktokLink = document.getElementById('contact-tiktok-link');
      const igLink = document.getElementById('contact-instagram-link');
      const infoText = document.querySelector('.contact-info-text');

      if (emailLink) {
        emailLink.href = `mailto:${c.contact.email}`;
        const emailDetail = emailLink.querySelector('div > div:last-child');
        if (emailDetail) emailDetail.textContent = c.contact.email;
      }

      if (tiktokLink) {
        tiktokLink.href = c.contact.tiktokUrl;
        const tiktokDetail = tiktokLink.querySelector('div > div:last-child');
        if (tiktokDetail) tiktokDetail.textContent = c.contact.tiktok;
      }

      if (igLink) {
        igLink.href = c.contact.instagramUrl;
        const igDetail = igLink.querySelector('div > div:last-child');
        if (igDetail) igDetail.textContent = c.contact.instagram;
      }

      if (infoText && c.contact.introText) {
        infoText.textContent = c.contact.introText;
      }

      // Update footer social links
      const footerTiktok = document.getElementById('footer-tiktok');
      const footerIg = document.getElementById('footer-instagram');
      if (footerTiktok) footerTiktok.href = c.contact.tiktokUrl;
      if (footerIg) footerIg.href = c.contact.instagramUrl;

      // Update hero social links
      const heroSocials = document.querySelectorAll('.hero-socials a');
      heroSocials.forEach(a => {
        if (a.textContent.includes('TikTok')) a.href = c.contact.tiktokUrl;
        if (a.textContent.includes('Instagram')) a.href = c.contact.instagramUrl;
      });
    }
  }

  // ===== INITIALIZE ALL INTERACTIONS =====
  function initAll() {
    initSmoothScroll();
    initNavigation();
    initScrollTracking();
    initRevealAnimations();
    initCounters();
    initPortfolioFilter();
    initLightbox();
    initContactForm();
    initParallax();
    initCardGlow();
    initPreloader();
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile nav if open
          const navLinks = document.getElementById('nav-links');
          const navToggle = document.getElementById('nav-toggle');
          if (navLinks) navLinks.classList.remove('open');
          if (navToggle) navToggle.classList.remove('open');
        }
      });
    });
  }

  // ===== NAVIGATION =====
  function initNavigation() {
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // ===== SCROLL-BASED SECTION TRACKING (FIXED) =====
  function initScrollTracking() {
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-links a[data-section], .dot-nav a[data-section]');
    const navOffset = 120; // Account for fixed nav + some buffer

    function updateActiveSection() {
      const scrollPos = window.scrollY + navOffset;
      let currentSection = '';

      // Find which section we're currently in by checking each section's top offset
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      // Edge case: if we're near the very bottom of the page, activate the last section
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) currentSection = lastSection.getAttribute('id');
      }

      // Edge case: if we're at the very top, activate hero
      if (window.scrollY < 100) {
        currentSection = 'hero';
      }

      // Update active states
      if (currentSection) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === currentSection) {
            link.classList.add('active');
          }
        });
      }
    }

    // Use requestAnimationFrame-throttled scroll listener for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial call
    updateActiveSection();
  }

  // ===== SCROLL REVEAL ANIMATIONS =====
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ===== ANIMATED COUNTERS =====
  function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let countersStarted = false;

    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
      }
      return num.toString();
    }

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000;
      const steps = 60;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = 1 - Math.pow(1 - step / steps, 3);
        const current = Math.floor(target * progress);

        el.textContent = formatNumber(current) + suffix;

        if (step >= steps) {
          el.textContent = formatNumber(target) + suffix;
          clearInterval(timer);
        }
      }, duration / steps);
    }

    const statsSection = document.getElementById('stats');
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statNumbers.forEach((el, i) => {
            setTimeout(() => animateCounter(el), i * 200);
          });
        }
      });
    }, { threshold: 0.4 });

    if (statsSection) statsObserver.observe(statsSection);
  }

  // ===== PORTFOLIO FILTER =====
  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioCards.forEach(card => {
          const category = card.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            card.style.display = '';

            requestAnimationFrame(() => {
              setTimeout(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
              }, 50);
            });
          } else {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => { card.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  // ===== PORTFOLIO LIGHTBOX =====
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    portfolioCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ===== CONTACT FORM =====
  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) return;

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        const emailInput = document.getElementById('contact-email');
        emailInput.style.borderColor = '#FF2D78';
        emailInput.focus();
        return;
      }

      const submitBtn = document.getElementById('contact-submit');
      submitBtn.textContent = 'Sending...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      setTimeout(() => {
        contactForm.style.display = 'none';
        formSuccess.classList.add('active');
      }, 1500);
    });

    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = 'var(--clr-rose)';
      });
      input.addEventListener('blur', () => {
        if (!input.value) input.style.borderColor = 'rgba(232, 160, 191, 0.1)';
      });
      input.addEventListener('input', () => {
        input.style.borderColor = 'var(--clr-rose)';
      });
    });
  }

  // ===== PARALLAX ON HERO IMAGE =====
  function initParallax() {
    const heroImage = document.querySelector('.hero-image-wrapper');
    const heroFrame = document.querySelector('.hero-image-frame');

    if (heroImage && window.innerWidth > 768) {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        heroImage.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
        if (heroFrame) heroFrame.style.transform = `translate(${x * -5}px, ${y * -5}px)`;
      });
    }
  }

  // ===== CURSOR GLOW ON CARDS =====
  function initCardGlow() {
    document.querySelectorAll('.service-card, .stat-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = card.classList.contains('service-card') ? 400 : 300;
        card.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, rgba(232, 160, 191, 0.06), var(--clr-grey-card) 50%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.background = 'var(--clr-grey-card)';
      });
    });
  }

  // ===== PRELOADER =====
  function initPreloader() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    window.addEventListener('load', () => {
      document.body.style.opacity = '1';
    });

    if (document.readyState === 'complete') {
      document.body.style.opacity = '1';
    }
  }

  // ===== START =====
  loadContent();

});
