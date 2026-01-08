/* ==========================================================================
   Codermug Theme - Random Slogans
   ========================================================================== */

const slogans = [
  {
    title: "Auto-hébergé",
    subtitle: "Sous Docker et sous caféiné"
  },
  {
    title: "Un café mérité",
    subtitle: "Pour chaque downtime évité."
  },
  {
    title: "J'ai 99 problèmes",
    subtitle: "Mais une VM qui boot n'en est pas un."
  },
  {
    title: "Infra stable",
    subtitle: "Admin instable (sans café)."
  },
  {
    title: "Une tasse pour l'admin",
    subtitle: "Une prière pour le cluster."
  },
  {
    title: "Sans café",
    subtitle: "Même le DNS rame."
  },
  {
    title: "Homelab addict",
    subtitle: "Sponsorisé par la caféine."
  },
  {
    title: "Si vous lisez ça",
    subtitle: "C'est que ça marche (pour l'instant)."
  },
  {
    title: "Pour ma santé mentale",
    subtitle: "Offrez moi un SSD (ou un café)."
  }
];

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

function getSlogan() {
  return slogans[Math.floor(Math.random() * slogans.length)];
}

document.addEventListener('DOMContentLoaded', function() {
  const sloganElement = document.getElementById('siteSlogan');
  if (sloganElement) {
    const slogan = getSlogan();
    sloganElement.innerHTML = `<span class="slogan-title">${slogan.title}</span> — <span class="slogan-subtitle">${slogan.subtitle}</span>`;
  }
});
