/* ==========================================================================
   Share Bar, Series Navigation & TOC Navigation
   ========================================================================== */

(function() {
  'use strict';

  // Elements
  const shareBarDesktop = document.getElementById('shareBarDesktop');
  const shareBarMobile = document.getElementById('shareBarMobile');
  const seriesNavDesktop = document.getElementById('seriesNavDesktop');
  const seriesNavMobile = document.getElementById('seriesNavMobile');
  const tocNavDesktop = document.getElementById('tocNavDesktop');
  const tocNavMobile = document.getElementById('tocNavMobile');
  const tocContentDesktop = document.getElementById('tocContentDesktop');
  const tocContentMobile = document.getElementById('tocContentMobile');
  const postContent = document.getElementById('postContent');
  
  const progressRingDesktop = document.getElementById('progressRingDesktop');
  const progressRingMobile = document.getElementById('progressRingMobile');

  if (!postContent) return;

  // Constants
  const CIRCUMFERENCE_DESKTOP = 2 * Math.PI * 16;
  const CIRCUMFERENCE_MOBILE = 2 * Math.PI * 20;
  const SHOW_THRESHOLD = 300;

  // Store scroll position and TOC headings
  let scrollPosition = 0;
  let tocHeadings = [];
  let isBodyScrollLocked = false;

  /* ==========================================================================
     Progress Ring & Share Bar Visibility
     ========================================================================== */

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

  function updateProgress() {
    const postRect = postContent.getBoundingClientRect();
    const postTop = postRect.top + window.scrollY;
    const postHeight = postContent.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const start = postTop - windowHeight;
    const end = postTop + postHeight - windowHeight;
    const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);

    if (progressRingDesktop) {
      const offsetDesktop = CIRCUMFERENCE_DESKTOP - (progress * CIRCUMFERENCE_DESKTOP);
      progressRingDesktop.style.strokeDashoffset = offsetDesktop;
    }
    
    if (progressRingMobile) {
      const offsetMobile = CIRCUMFERENCE_MOBILE - (progress * CIRCUMFERENCE_MOBILE);
      progressRingMobile.style.strokeDashoffset = offsetMobile;
    }

    const shouldShow = scrollY > SHOW_THRESHOLD;
    
    [shareBarDesktop, shareBarMobile].forEach(bar => {
      if (bar) bar.classList.toggle('is-visible', shouldShow);
    });

    // Update active TOC item
    updateActiveTocItem();
  }

  /* ==========================================================================
     Body Scroll Lock
     ========================================================================== */

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function disableBodyScroll() {
    if (isBodyScrollLocked) return;
    
    scrollPosition = window.scrollY;
    isBodyScrollLocked = true;
    
    document.documentElement.classList.add('series-nav-open');
    document.body.classList.add('series-nav-open');
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  }

  function enableBodyScroll() {
    if (!isBodyScrollLocked) return;
    
    isBodyScrollLocked = false;
    
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
    
    // Restore scroll position INSTANTLY
    document.documentElement.scrollTop = scrollPosition;
    document.body.scrollTop = scrollPosition;
    
    // Restore smooth scrolling after a frame
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = htmlStyle;
      document.body.style.scrollBehavior = bodyStyle;
    });
  }

  /* ==========================================================================
     Series Navigation
     ========================================================================== */

  function toggleSeriesNav() {
    const nav = isMobile() ? seriesNavMobile : seriesNavDesktop;
    const toggleBtns = document.querySelectorAll('.js-series-toggle');
    
    if (!nav) return;

    const isOpen = nav.classList.contains('is-open');
    
    // Close TOC if open (without unlocking scroll)
    closeTocNavSilent();

    nav.classList.toggle('is-open');
    toggleBtns.forEach(btn => btn.classList.toggle('is-active', !isOpen));
    
    if (isOpen) {
      enableBodyScroll();
    } else {
      disableBodyScroll();
    }
  }

  function closeSeriesNav() {
    const wasOpen = document.querySelector('.series-nav.is-open');
    
    [seriesNavDesktop, seriesNavMobile].forEach(nav => {
      if (nav) nav.classList.remove('is-open');
    });
    
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.classList.remove('is-active');
    });
    
    if (wasOpen) {
      enableBodyScroll();
    }
  }

  // Close without affecting scroll lock (for cross-close)
  function closeSeriesNavSilent() {
    [seriesNavDesktop, seriesNavMobile].forEach(nav => {
      if (nav) nav.classList.remove('is-open');
    });
    
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.classList.remove('is-active');
    });
  }

  /* ==========================================================================
     TOC Navigation - Dynamic Generation
     ========================================================================== */

  function buildToc() {
    const headings = postContent.querySelectorAll('h1, h2, h3');
    
    if (headings.length === 0) {
      const emptyHtml = `
        <div class="toc-empty">
          <svg class="toc-empty__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <p>Aucun titre dans cet article</p>
        </div>
      `;
      if (tocContentDesktop) tocContentDesktop.innerHTML = emptyHtml;
      if (tocContentMobile) tocContentMobile.innerHTML = emptyHtml;
      return;
    }

    tocHeadings = [];
    let html = '<ul class="toc-list">';
    let currentH2Index = -1;
    let hasH3 = false;

    headings.forEach((heading, index) => {
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent.trim();
      
      // Generate ID if missing
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
      
      const id = heading.id;
      tocHeadings.push({ id, element: heading, level });

      if (level === 'h1') {
        html += `
          <li class="toc-item toc-item--h1">
            <a href="#${id}" class="toc-link" data-toc-id="${id}">
              <svg class="toc-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/>
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
                <path d="M19 19l-4-4"/>
                <path d="M5 19l4-4"/>
              </svg>
              <span>${text}</span>
            </a>
          </li>
        `;
      } else if (level === 'h2') {
        // Close previous H3 sublist if exists
        if (hasH3) {
          html += '</ul></li>';
          hasH3 = false;
        } else if (currentH2Index >= 0) {
          html += '</li>';
        }
        
        currentH2Index++;
        html += `
          <li class="toc-item toc-item--h2" data-h2-index="${currentH2Index}">
            <a href="#${id}" class="toc-link" data-toc-id="${id}">
              <span>${text}</span>
            </a>
        `;
      } else if (level === 'h3' && currentH2Index >= 0) {
        if (!hasH3) {
          html += '<ul class="toc-sublist">';
          hasH3 = true;
        }
        
        html += `
          <li class="toc-item toc-item--h3">
            <a href="#${id}" class="toc-link" data-toc-id="${id}">
              <span>${text}</span>
            </a>
          </li>
        `;
      }
    });

    // Close any remaining open tags
    if (hasH3) {
      html += '</ul></li>';
    } else if (currentH2Index >= 0) {
      html += '</li>';
    }
    
    html += '</ul>';

    if (tocContentDesktop) tocContentDesktop.innerHTML = html;
    if (tocContentMobile) tocContentMobile.innerHTML = html;

    // Attach click handlers
    document.querySelectorAll('.toc-link').forEach(link => {
      link.addEventListener('click', handleTocClick);
    });
  }

  function handleTocClick(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('data-toc-id');
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) return;

    // Store target position before closing (while body is still fixed)
    const headerOffset = 100;
    
    // Close TOC panel and unlock scroll
    closeTocNav();

    // Wait for scroll restore, then navigate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  function updateActiveTocItem() {
    if (tocHeadings.length === 0) return;

    const scrollY = window.scrollY;
    const offset = 150;

    let activeId = tocHeadings[0].id;

    for (const heading of tocHeadings) {
      const rect = heading.element.getBoundingClientRect();
      if (rect.top <= offset) {
        activeId = heading.id;
      } else {
        break;
      }
    }

    document.querySelectorAll('.toc-link').forEach(link => {
      const isActive = link.getAttribute('data-toc-id') === activeId;
      link.classList.toggle('is-active', isActive);
    });
  }

  /* ==========================================================================
     TOC Navigation - Toggle
     ========================================================================== */

  function toggleTocNav() {
    const nav = isMobile() ? tocNavMobile : tocNavDesktop;
    const toggleBtns = document.querySelectorAll('.js-toc-toggle');
    
    if (!nav) return;

    const isOpen = nav.classList.contains('is-open');
    
    // Close series nav if open (without unlocking scroll)
    closeSeriesNavSilent();

    nav.classList.toggle('is-open');
    toggleBtns.forEach(btn => btn.classList.toggle('is-active', !isOpen));
    
    if (isOpen) {
      enableBodyScroll();
    } else {
      disableBodyScroll();
    }
  }

  function closeTocNav() {
    const wasOpen = document.querySelector('.toc-nav.is-open');
    
    [tocNavDesktop, tocNavMobile].forEach(nav => {
      if (nav) nav.classList.remove('is-open');
    });
    
    document.querySelectorAll('.js-toc-toggle').forEach(btn => {
      btn.classList.remove('is-active');
    });
    
    if (wasOpen) {
      enableBodyScroll();
    }
  }

  // Close without affecting scroll lock (for cross-close)
  function closeTocNavSilent() {
    [tocNavDesktop, tocNavMobile].forEach(nav => {
      if (nav) nav.classList.remove('is-open');
    });
    
    document.querySelectorAll('.js-toc-toggle').forEach(btn => {
      btn.classList.remove('is-active');
    });
  }

  /* ==========================================================================
     Resize Handler
     ========================================================================== */

  function handleResize() {
    const wasSeriesOpen = document.querySelector('.series-nav.is-open');
    const wasTocOpen = document.querySelector('.toc-nav.is-open');
    
    if (wasSeriesOpen) closeSeriesNav();
    if (wasTocOpen) closeTocNav();
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  function initEventListeners() {
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    // Series navigation
    document.querySelectorAll('.js-series-toggle').forEach(btn => {
      btn.addEventListener('click', toggleSeriesNav);
    });
    
    document.querySelectorAll('.js-series-close').forEach(btn => {
      btn.addEventListener('click', closeSeriesNav);
    });

    // TOC navigation
    document.querySelectorAll('.js-toc-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTocNav);
    });
    
    document.querySelectorAll('.js-toc-close').forEach(btn => {
      btn.addEventListener('click', closeTocNav);
    });
    
    // Keyboard & resize
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeSeriesNav();
        closeTocNav();
      }
    });

    window.addEventListener('resize', handleResize);
  }

  /* ==========================================================================
     Initialize
     ========================================================================== */

  initProgressRings();
  buildToc();
  initEventListeners();
  updateProgress();

})();