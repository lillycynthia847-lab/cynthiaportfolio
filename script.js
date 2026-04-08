/* ==========================================
   CYNTHIA WANJIRA — F1 Creator Portfolio
   JavaScript: Animations, Counters, Form, Nav
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile nav if open
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  });

  // ===== NAVIGATION =====
  const nav = document.getElementById('main-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // Scroll effect on nav
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // ===== ACTIVE SECTION TRACKING =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a[data-section], .dot-nav a[data-section]');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');
        
        navLinksAll.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -30% 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Don't unobserve - let it stay visible
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== ANIMATED COUNTERS =====
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
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out curve
      const progress = 1 - Math.pow(1 - step / steps, 3);
      current = Math.floor(target * progress);
      
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

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // ===== PORTFOLIO FILTER =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
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
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ===== PORTFOLIO LIGHTBOX =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  portfolioCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ESC key to close lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      return;
    }

    // Validate email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      const emailInput = document.getElementById('contact-email');
      emailInput.style.borderColor = '#FF2D78';
      emailInput.focus();
      return;
    }

    // Simulate submission
    const submitBtn = document.getElementById('contact-submit');
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;

    setTimeout(() => {
      contactForm.style.display = 'none';
      formSuccess.classList.add('active');
    }, 1500);
  });

  // Form input focus effects
  document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.style.borderColor = 'var(--clr-rose)';
    });
    
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.style.borderColor = 'rgba(232, 160, 191, 0.1)';
      }
    });

    // Reset error state on input
    input.addEventListener('input', () => {
      input.style.borderColor = 'var(--clr-rose)';
    });
  });

  // ===== PARALLAX ON HERO IMAGE =====
  const heroImage = document.querySelector('.hero-image-wrapper');
  const heroFrame = document.querySelector('.hero-image-frame');
  
  if (heroImage && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      heroImage.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
      heroFrame.style.transform = `translate(${x * -5}px, ${y * -5}px)`;
    });
  }

  // ===== CURSOR GLOW ON SERVICE CARDS =====
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(232, 160, 191, 0.06), var(--clr-grey-card) 50%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = 'var(--clr-grey-card)';
    });
  });

  // ===== CURSOR GLOW ON STAT CARDS =====
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(232, 160, 191, 0.06), var(--clr-grey-card) 50%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = 'var(--clr-grey-card)';
    });
  });

  // ===== PRELOADER (optional quick fade) =====
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  // Fallback if load event already fired
  if (document.readyState === 'complete') {
    document.body.style.opacity = '1';
  }

});
