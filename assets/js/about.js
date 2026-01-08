/* ==========================================================================
   Codermug Theme - About Page Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    /* ==========================================================================
       ELEMENTS
       ========================================================================== */

    var sectionsTrack = document.querySelector('.about-track');
    var aboutWrapper = document.querySelector('.about-wrapper');
    var navDots = document.querySelectorAll('.about-nav-dot');
    var terminalContents = document.querySelectorAll('.about-terminal-content');
    var terminalInfos = document.querySelectorAll('.about-terminal-info');
    var progressBar = document.querySelector('.about-terminal-progress-bar');

    if (!sectionsTrack) return;

    /* ==========================================================================
       STATE
       ========================================================================== */

    var state = {
        currentSection: 0,
        currentSubstep: 0,
        isAnimating: false,
        totalSections: 7,
        terminalSteps: 5
    };

    /* ==========================================================================
       SLIDE TO SECTION
       ========================================================================== */

    function slideToSection(index, substep) {
        substep = substep || 0;
        
        if (state.isAnimating) return;
        if (index < 0 || index >= state.totalSections) return;

        var prevSection = state.currentSection;

        state.isAnimating = true;
        state.currentSection = index;
        state.currentSubstep = substep;

        var translateY = -index * 100;
        sectionsTrack.style.transform = 'translateY(' + translateY + 'vh)';

        navDots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === index);
        });

        aboutWrapper.classList.toggle('show-grid', index > 0);

        if (index >= 2 && index <= 5) {
            setTimeout(function() {
                animateStackItems(index);
            }, 300);
        }

        if (index === 1) {
            updateTerminalStep(substep);
        }

        if (prevSection >= 2 && prevSection <= 5 && prevSection !== index) {
            setTimeout(function() {
                resetStackItems(prevSection);
            }, 700);
        }

        setTimeout(function() {
            state.isAnimating = false;
        }, 700);
    }

    /* ==========================================================================
       TERMINAL STEP
       ========================================================================== */

    function updateTerminalStep(step) {
        var clampedStep = Math.max(0, Math.min(step, state.terminalSteps - 1));
        state.currentSubstep = clampedStep;

        terminalContents.forEach(function(content, i) {
            content.classList.toggle('active', i === clampedStep);
        });

        terminalInfos.forEach(function(info, i) {
            info.classList.toggle('active', i === clampedStep);
        });

        var progress = (clampedStep + 1) / state.terminalSteps * 100;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }

    /* ==========================================================================
       STACK ITEMS ANIMATION
       ========================================================================== */

    function animateStackItems(sectionIndex) {
        var section = document.querySelector('[data-section="' + sectionIndex + '"]');
        if (!section) return;
        
        var items = section.querySelectorAll('.about-stack-item');
        items.forEach(function(item, i) {
            setTimeout(function() {
                item.classList.add('visible');
            }, i * 50);
        });
    }

    function resetStackItems(sectionIndex) {
        var section = document.querySelector('[data-section="' + sectionIndex + '"]');
        if (!section) return;
        
        var items = section.querySelectorAll('.about-stack-item');
        items.forEach(function(item) {
            item.classList.remove('visible');
        });
    }

    /* ==========================================================================
       NAVIGATION
       ========================================================================== */

    function navigate(direction) {
        if (state.isAnimating) return;

        var currentSection = state.currentSection;
        var currentSubstep = state.currentSubstep;

        if (currentSection === 1) {
            var newSubstep = currentSubstep + direction;

            if (newSubstep >= 0 && newSubstep < state.terminalSteps) {
                updateTerminalStep(newSubstep);
                return;
            }

            if (newSubstep < 0) {
                slideToSection(0);
            } else {
                slideToSection(2);
            }
            return;
        }

        var newSection = currentSection + direction;

        if (newSection >= 0 && newSection < state.totalSections) {
            if (newSection === 1) {
                var substep = direction > 0 ? 0 : state.terminalSteps - 1;
                slideToSection(1, substep);
            } else {
                slideToSection(newSection);
            }
        }
    }

    /* ==========================================================================
       EVENT HANDLERS
       ========================================================================== */

    var wheelTimeout = null;
    var wheelDelta = 0;

    function handleWheel(e) {
        e.preventDefault();
        wheelDelta += e.deltaY;

        if (wheelTimeout) return;

        wheelTimeout = setTimeout(function() {
            navigate(wheelDelta > 0 ? 1 : -1);
            wheelDelta = 0;
            wheelTimeout = null;
        }, 50);
    }

    function handleKeydown(e) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            navigate(1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            navigate(-1);
        }
    }

    var touchStartY = 0;

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        var diff = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            navigate(diff > 0 ? 1 : -1);
        }
    }

    /* ==========================================================================
       INIT
       ========================================================================== */

    navDots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            slideToSection(index, index === 1 ? 0 : undefined);
        });
    });

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    slideToSection(0);
});
