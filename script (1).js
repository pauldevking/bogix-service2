/* =============================================
   TECHFIX – script.js
   ============================================= */

'use strict';

/* ---- Utility: select elements ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================
   1. HEADER: scroll effect + active nav link
   ============================================ */
const header = $('#header');
const navLinks = $$('.nav__link');
const sections = $$('section[id]');

function onScroll() {
  /* Scrolled shadow */
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  /* Active nav link highlight */
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // init

/* ============================================
   2. BURGER MENU (mobile)
   ============================================ */
const burger = $('#burger');
const nav = $('#nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  /* Close on nav link click */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================
   3. SMOOTH SCROLL for anchor links
   ============================================ */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================
   4. INTERSECTION OBSERVER – scroll animations
   ============================================ */
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

/* Service cards */
const serviceCards = $$('.service-card');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      cardObserver.unobserve(entry.target);
    }
  });
}, observerOptions);
serviceCards.forEach(card => cardObserver.observe(card));

/* Generic fade-in for other elements */
const fadeEls = $$('.why-feature, .testi-card, .blog-card, .kpi, .problem-item');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 60 * (parseInt(entry.target.dataset.index) || 0));
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

fadeEls.forEach((el, i) => {
  el.dataset.index = i % 6;
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});

/* ============================================
   5. COUNTER ANIMATION
   ============================================ */
function animateCounter(el, target, suffix = '', duration = 1600) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = isDecimal
      ? (target * ease).toFixed(1)
      : Math.round(target * ease);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* Hero stats counters */
const heroCounters = [
  { selector: '.hero__stats .stat:nth-child(1) strong', target: 1000, suffix: '+' },
  { selector: '.hero__stats .stat:nth-child(2) strong', target: 98, suffix: '%' },
  { selector: '.hero__stats .stat:nth-child(3) strong', target: 24, suffix: 'h' },
];

/* KPI counters */
const kpiCounters = [
  { selector: '.kpi:nth-child(1) strong', target: 1000, suffix: '+' },
  { selector: '.kpi:nth-child(2) strong', target: 500, suffix: '+' },
  { selector: '.kpi:nth-child(3) strong', target: 4.9, suffix: '/5' },
];

let heroAnimated = false;
let kpiAnimated = false;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    if (entry.target.classList.contains('hero__stats') && !heroAnimated) {
      heroAnimated = true;
      heroCounters.forEach(({ selector, target, suffix }) => {
        const el = $(selector);
        if (el) animateCounter(el, target, suffix);
      });
    }
    if (entry.target.classList.contains('kpi-row') && !kpiAnimated) {
      kpiAnimated = true;
      kpiCounters.forEach(({ selector, target, suffix }) => {
        const el = $(selector);
        if (el) animateCounter(el, target, suffix);
      });
    }
  });
}, { threshold: 0.4 });

const heroStats = $('.hero__stats');
const kpiRow = $('.kpi-row');
if (heroStats) counterObserver.observe(heroStats);
if (kpiRow) counterObserver.observe(kpiRow);

/* ============================================
   6. CONTACT FORM
   ============================================ */
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    /* Basic validation */
    const nom = contactForm.querySelector('[name="nom"]');
    const tel = contactForm.querySelector('[name="tel"]');
    const message = contactForm.querySelector('[name="message"]');
    let valid = true;

    [nom, tel, message].forEach(field => {
      if (!field || !field.value.trim()) {
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
        setTimeout(() => {
          field.style.borderColor = '';
          field.style.boxShadow = '';
        }, 2500);
        valid = false;
      }
    });

    if (!valid) return;

    /* Simulate send */
    const btn = contactForm.querySelector('.btn[type="submit"]');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Envoyer la demande';
      btn.disabled = false;
      formSuccess.classList.add('show');
      contactForm.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1200);
  });

  /* Real-time border reset */
  $$('input, select, textarea', contactForm).forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow = '';
    });
  });
}

/* ============================================
   7. PRICING TABLE – highlight on hover
   ============================================ */
const pricingRows = $$('.pricing-table tbody tr');
pricingRows.forEach(row => {
  row.addEventListener('mouseenter', () => {
    const cells = $$('td', row);
    cells.forEach(td => {
      td.style.transition = 'background 0.2s ease';
    });
  });
});

/* ============================================
   8. BLOG CARD – subtle parallax on hover
   ============================================ */
$$('.blog-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
    card.style.boxShadow = `${-x * 0.5}px ${-y * 0.5}px 28px rgba(10,14,42,0.18)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

/* ============================================
   9. SERVICE CARD – tilt effect
   ============================================ */
$$('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    card.style.transform = `translateY(-6px) rotateX(${-y * 0.5}deg) rotateY(${x * 0.5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ============================================
   10. PRICING TABLE – sticky popular indicator
   ============================================ */
const pricingTable = $('.pricing-table');
if (pricingTable) {
  /* Add hover highlights to Standard and Premium column cells */
  $$('.pricing-table tbody tr').forEach(row => {
    const cells = $$('td', row);
    if (cells.length === 3) {
      cells[2].style.background = 'rgba(26,115,232,0.02)';
    }
  });
}

/* ============================================
   11. SCROLL-TO-TOP (auto reveal)
   ============================================ */
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.setAttribute('aria-label', 'Retour en haut');
scrollTopBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="M18 15l-6-6-6 6"/></svg>`;
scrollTopBtn.style.cssText = `
  position: fixed;
  bottom: 100px;
  right: 28px;
  width: 44px;
  height: 44px;
  background: var(--navy);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 998;
  font-family: inherit;
`;
document.body.appendChild(scrollTopBtn);

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.style.opacity = '1';
    scrollTopBtn.style.transform = 'translateY(0)';
  } else {
    scrollTopBtn.style.opacity = '0';
    scrollTopBtn.style.transform = 'translateY(10px)';
  }
}, { passive: true });

/* ============================================
   12. PROBLEM ITEMS – click to contact
   ============================================ */
$$('.problem-item').forEach(item => {
  item.addEventListener('click', () => {
    const label = item.querySelector('span')?.textContent || '';
    const select = $('[name="probleme"]', contactForm);
    if (select && label) {
      /* Try to match option */
      $$('option', select).forEach(opt => {
        if (opt.textContent.toLowerCase().includes(label.toLowerCase().split(' ')[0])) {
          select.value = opt.value;
        }
      });
    }
    /* Smooth scroll to contact */
    const contact = $('#contact');
    if (contact) {
      const top = contact.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================
   13. PAGE LOAD – entry animation for hero
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '1';
  });
});
