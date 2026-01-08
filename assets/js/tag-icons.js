/* ==========================================================================
   Codermug Theme - Tag Icons
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {

  /* ==========================================================================
     ICON MAPPING
     ========================================================================== */

  const tagIcons = {
    'k8s-deep-dive': '☸️',
    'kubernetes': '☸️',
    'itil': '📋',
    'note-de-version': '📝',
    'notes-de-version': '📝',
    'default': '💻'
  };

  /* ==========================================================================
     APPLY ICONS TO CARDS
     ========================================================================== */

  document.querySelectorAll('.card-icon[data-tag]').forEach(function(el) {
    const tag = el.getAttribute('data-tag');
    const icon = tagIcons[tag] || tagIcons['default'];
    const iconEl = el.querySelector('.tag-icon');
    
    if (iconEl) {
      iconEl.textContent = icon;
    } else {
      const svg = el.querySelector('svg');
      if (svg && tag && tagIcons[tag]) {
        const span = document.createElement('span');
        span.className = 'tag-icon';
        span.textContent = tagIcons[tag];
        svg.replaceWith(span);
      }
    }
  });

  /* ==========================================================================
     APPLY ICONS TO PLACEHOLDERS
     ========================================================================== */

  document.querySelectorAll('.card-image-placeholder[data-tag]').forEach(function(el) {
    const tag = el.getAttribute('data-tag');
    const icon = tagIcons[tag] || tagIcons['default'];
    const iconEl = el.querySelector('.placeholder-icon');
    
    if (iconEl) {
      iconEl.textContent = icon;
    }
  });
});
