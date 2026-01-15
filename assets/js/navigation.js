/* ==========================================================================
   Codermug Theme - Navigation Script
   ========================================================================== */

/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */

function toggleMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.getElementById('mobileNav');

  btn.classList.toggle('active');
  nav.classList.toggle('active');

  if (nav.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  } else {
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
}

/* ==========================================================================
   MOBILE DROPDOWN
   ========================================================================== */

function toggleMobileDropdown(event) {
  event.preventDefault();
  const dropdown = document.getElementById('mobileDropdown');
  dropdown.classList.toggle('active');

  const arrow = event.currentTarget.querySelector('svg');
  if (arrow) {
    arrow.style.transform = dropdown.classList.contains('active')
      ? 'rotate(180deg)'
      : 'rotate(0deg)';
  }
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

document.addEventListener('click', function(event) {
  const nav = document.getElementById('mobileNav');
  const btn = document.querySelector('.mobile-menu-btn');

  if (nav && nav.classList.contains('active')) {
    if (!nav.contains(event.target) && !btn.contains(event.target)) {
      toggleMobileMenu();
    }
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const nav = document.getElementById('mobileNav');
    if (nav && nav.classList.contains('active')) {
      toggleMobileMenu();
    }
  }
});

let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (window.innerWidth > 768) {
      const nav = document.getElementById('mobileNav');
      const btn = document.querySelector('.mobile-menu-btn');

      if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        btn.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
      }
    }
  }, 250);
});

/* ==========================================================================
   SMOOTH SCROLL
   ========================================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href.length > 1) {
      const id = decodeURIComponent(href.slice(1));
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
