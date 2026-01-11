/* ==========================================================================
   Codermug Theme - Home Page Script (Magnetic Scroll Navigation)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    /* ==========================================================================
       ELEMENTS
       ========================================================================== */

    var track = document.querySelector('.home-track');
    var dots = document.querySelectorAll('.home-nav-dot');
    var sections = document.querySelectorAll('.home-section');

    if (!track) return;

    /* ==========================================================================
       STATE
       ========================================================================== */

    var state = {
        currentSection: 0,
        isAnimating: false,
        totalSections: sections.length
    };

    /* ==========================================================================
       MOBILE DETECTION
       ========================================================================== */

    function isMobile() {
        return window.innerWidth <= 768;
    }

    /* ==========================================================================
       SLIDE TO SECTION
       ========================================================================== */

    function slideToSection(index) {
        if (state.isAnimating) return;
        if (index < 0 || index >= state.totalSections) return;

        var prevSection = state.currentSection;

        state.isAnimating = true;
        state.currentSection = index;

        // Transform track (only on desktop)
        if (!isMobile()) {
            var translateY = -index * 100;
            track.style.transform = 'translateY(' + translateY + 'vh)';
        }

        // Update dots
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === index);
        });

        // Reset previous section animations
        if (prevSection !== index) {
            resetSectionAnimations(prevSection);
        }

        // Activate current section animations
        activateSectionAnimations(index);

        setTimeout(function() {
            state.isAnimating = false;
        }, 700);
    }

    /* ==========================================================================
       SECTION ANIMATIONS
       ========================================================================== */

    function activateSectionAnimations(sectionIndex) {
        var section = sections[sectionIndex];
        if (!section) return;

        // Add active class to trigger CSS animations
        section.classList.add('active');
    }

    function resetSectionAnimations(sectionIndex) {
        var section = sections[sectionIndex];
        if (!section) return;

        // Remove active class to reset animations
        section.classList.remove('active');
    }

    /* ==========================================================================
       NAVIGATION
       ========================================================================== */

    function navigate(direction) {
        if (state.isAnimating) return;

        var newSection = state.currentSection + direction;

        if (newSection >= 0 && newSection < state.totalSections) {
            slideToSection(newSection);
        }
    }

    /* ==========================================================================
       EVENT HANDLERS
       ========================================================================== */

    // Wheel handler with debounce (desktop only)
    var wheelDelta = 0;
    var wheelTimeout = null;

    function handleWheel(e) {
        if (isMobile()) return;
        
        e.preventDefault();
        wheelDelta += e.deltaY;

        if (wheelTimeout) return;

        wheelTimeout = setTimeout(function() {
            navigate(wheelDelta > 0 ? 1 : -1);
            wheelDelta = 0;
            wheelTimeout = null;
        }, 50);
    }

    // Keyboard handler
    function handleKeydown(e) {
        if (isMobile()) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            navigate(1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            navigate(-1);
        }
    }

    // Touch handlers (desktop only for swipe navigation)
    var touchStartY = 0;

    function handleTouchStart(e) {
        if (isMobile()) return;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        if (isMobile()) return;
        
        var diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            navigate(diff > 0 ? 1 : -1);
        }
    }

    /* ==========================================================================
       DOT NAVIGATION
       ========================================================================== */

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            if (isMobile()) {
                // On mobile, scroll to section
                var section = sections[index];
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    // Update dots manually
                    dots.forEach(function(d, i) {
                        d.classList.toggle('active', i === index);
                    });
                }
            } else {
                slideToSection(index);
            }
        });
    });

    /* ==========================================================================
       CTA BUTTONS WITH data-goto
       ========================================================================== */

    document.querySelectorAll('[data-goto]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var targetIndex = parseInt(btn.dataset.goto);
            
            if (isMobile()) {
                var section = sections[targetIndex];
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                slideToSection(targetIndex);
            }
        });
    });

    /* ==========================================================================
       ARTICLES PAGINATION
       ========================================================================== */

    var articleRows = document.querySelectorAll('.home-article-row');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var paginationInfo = document.getElementById('paginationInfo');

    if (articleRows.length > 0 && prevBtn && nextBtn && paginationInfo) {
        var perPage = 5;
        var currentPage = 0;
        var totalArticles = articleRows.length;
        var totalPages = Math.ceil(totalArticles / perPage);

        function updatePagination() {
            var start = currentPage * perPage;
            var end = Math.min(start + perPage, totalArticles);

            articleRows.forEach(function(row, i) {
                row.setAttribute('data-hidden', i < start || i >= end ? 'true' : 'false');
            });

            paginationInfo.textContent = (start + 1) + '-' + end + ' sur ' + totalArticles;
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage >= totalPages - 1;
        }

        prevBtn.addEventListener('click', function() {
            if (currentPage > 0) {
                currentPage--;
                updatePagination();
            }
        });

        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages - 1) {
                currentPage++;
                updatePagination();
            }
        });

        updatePagination();
    }

    /* ==========================================================================
       MOBILE SCROLL OBSERVER
       ========================================================================== */

    function setupMobileScrollObserver() {
        if (!isMobile()) return;

        var observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var section = entry.target;
                    var index = Array.from(sections).indexOf(section);
                    
                    // Update dots
                    dots.forEach(function(dot, i) {
                        dot.classList.toggle('active', i === index);
                    });

                    // Activate animations
                    section.classList.add('active');
                }
            });
        }, observerOptions);

        sections.forEach(function(section) {
            observer.observe(section);
        });
    }

    /* ==========================================================================
       RESIZE HANDLER
       ========================================================================== */

    var resizeTimeout;
    
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (isMobile()) {
                // Reset transform on mobile
                track.style.transform = 'none';
                // Setup scroll observer
                setupMobileScrollObserver();
            } else {
                // Restore transform on desktop
                var translateY = -state.currentSection * 100;
                track.style.transform = 'translateY(' + translateY + 'vh)';
            }
        }, 100);
    }

    /* ==========================================================================
       INIT
       ========================================================================== */

    // Event listeners (desktop)
    if (!isMobile()) {
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    window.addEventListener('resize', handleResize);

    // Initialize
    if (isMobile()) {
        track.style.transform = 'none';
        setupMobileScrollObserver();
        // Activate first section on mobile
        sections[0].classList.add('active');
    } else {
        slideToSection(0);
    }
});

function initVisitedSections() {
    const sections = document.querySelectorAll('.home-section');
    
    // Function to mark a section as visited
    function markAsVisited(section) {
        if (section && !section.classList.contains('visited')) {
            section.classList.add('visited');
        }
    }
    
    // Mark initially active section
    const activeSection = document.querySelector('.home-section.active');
    if (activeSection) {
        markAsVisited(activeSection);
    }
    
    // Use MutationObserver to detect when sections become active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const section = mutation.target;
                if (section.classList.contains('active')) {
                    // Small delay to let CSS transition start
                    requestAnimationFrame(() => {
                        markAsVisited(section);
                    });
                }
            }
        });
    });
    
    // Observe all sections for class changes
    sections.forEach((section) => {
        observer.observe(section, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    });
    }

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitedSections);
} else {
    initVisitedSections();
}
