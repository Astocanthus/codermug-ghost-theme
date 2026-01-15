/* ==========================================================================
   Share Bar & Series Navigation
   ========================================================================== */

(function() {
  'use strict';

  // Elements
  const shareBarDesktop = document.getElementById('shareBarDesktop');
  const shareBarMobile = document.getElementById('shareBarMobile');
  const seriesNavDesktop = document.getElementById('seriesNavDesktop');
  const seriesNavMobile = document.getElementById('seriesNavMobile');
  const postContent = document.getElementById('postContent');
  
  const progressRingDesktop = document.getElementById('progressRingDesktop');
  const progressRingMobile = document.getElementById('progressRingMobile');

  if (!postContent) return;

  // Constants
  const CIRCUMFERENCE_DESKTOP = 2 * Math.PI * 16;
  const CIRCUMFERENCE_MOBILE = 2 * Math.PI * 20;
  const SHOW_THRESHOLD = 300;

  // Store scroll position
  let scrollPosition = 0;

  // Initialize progress rings
  function initProgressRings() {
    if (progressRingDesktop) {
      progressRingDesktop.style.strokeDasharray = CIRCUMFERENCE_DESKTOP;
      progressRingDesktop.style.strokeDashoffset = CIRCUMFERENCE_DESKTOP;
    }
    
    if (progressRingMobile) {
      progressRingMobile.style.strokeDasharray = CIRCUMFERENCE_MOBILE;
      progressRingMobile.style.strokeDashoffset = CIRCUMFERENCE_MOBILE;
    }
  }

  // Update reading progress
  function updateProgress() {
    const postRect = postContent.getBoundingClientRect();
    const postTop = postRect.top + window.scrollY;
    const postHeight = postContent.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const start = postTop - windowHeight;
    const end = postTop + postHeight - windowHeight;
    const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);

    // Update progress rings
    if (progressRingDesktop) {
      const offsetDesktop = CIRCUMFERENCE_DESKTOP - (progress * CIRCUMFERENCE_DESKTOP);
      progressRingDesktop.style.strokeDashoffset = offsetDesktop;
    }
    
    if (progressRingMobile) {
      const offsetMobile = CIRCUMFERENCE_MOBILE - (progress * CIRCUMFERENCE_MOBILE);
      progressRingMobile.style.strokeDashoffset = offsetMobile;
    }

    // Show/hide share bars
    const shouldShow = scrollY > SHOW_THRESHOLD;
    
    [shareBarDesktop, shareBarMobile].forEach(bar => {
      if (bar) bar.classList.toggle('is-visible', shouldShow);
    });
  }

  // Check if mobile
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Prevent body scroll - lock in place
  function disableBodyScroll() {
    scrollPosition = window.scrollY;
    
    // Add class to both html and body
    document.documentElement.classList.add('series-nav-open');
    document.body.classList.add('series-nav-open');
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  }

  // Enable body scroll - restore position INSTANTLY without animation
  function enableBodyScroll() {
    // Remove class from both html and body
    document.documentElement.classList.remove('series-nav-open');
    document.body.classList.remove('series-nav-open');
    
    // Disable smooth scrolling temporarily
    const htmlStyle = document.documentElement.style.scrollBehavior;
    const bodyStyle = document.body.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore scroll position INSTANTLY (no animation)
    document.documentElement.scrollTop = scrollPosition;
    document.body.scrollTop = scrollPosition;
    
    // Restore smooth scrolling after a frame
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = htmlStyle;
      document.body.style.scrollBehavior = bodyStyle;
    });
  }

  // Toggle series navigation
  function toggleSeriesNav() {
    const nav = isMobile() ? seriesNavMobile : seriesNavDesktop;
    const toggleBtns = document.querySelectorAll('.js-series-toggle');
    
    if (!nav) return;

    const isOpen = nav.classList.contains('is-open');
    
    // Toggle open state
    nav.classList.toggle('is-open');
    
    // Toggle button active state
    toggleBtns.forEach(btn => btn.classList.toggle('is-active', !isOpen));
    
    // Handle body scroll
    if (isOpen) {
      enableBodyScroll();
    } else {
      disableBodyScroll();
    }
  }

  // Close series navigation
  function closeSeriesNav() {
    [seriesNavDesktop, seriesNavMobile].forEach(nav => {
      if (nav) nav.classList.remove('is-open');
    });
    
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.classList.remove('is-active');
    });
    
    enableBodyScroll();
  }

  // Handle resize
  function handleResize() {
    const wasOpen = document.querySelector('.series-nav.is-open');
    if (wasOpen) {
      closeSeriesNav();
    }
  }

  // Event listeners
  function initEventListeners() {
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.addEventListener('click', toggleSeriesNav);
    });
    
    document.querySelectorAll('.js-series-close').forEach(btn => {
      btn.addEventListener('click', closeSeriesNav);
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeSeriesNav();
    });

    window.addEventListener('resize', handleResize);
  }

  // Initialize
  initProgressRings();
  initEventListeners();
  updateProgress();

})();