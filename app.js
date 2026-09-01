/* ═══════════════════════════════════════════════════════════
   CONQUISQUEST · APP.JS
   Navegación, interacciones y animaciones
   Autor: Eduardo Villanueva — Conquistadores Región 4
════════════════════════════════════════════════════════════ */

'use strict';

// ── Estado global ────────────────────────────────────────
let currentRole = null;

// ── SVG Gradient para el progress ring ──────────────────
(function injectGradient() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>
    </defs>`;
  document.body.prepend(svg);
})();

// ── Navegación de pantallas ──────────────────────────────
function showScreen(id, direction = 'in') {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.animation = '';
  });
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  target.style.animation = direction === 'in'
    ? 'slideIn .35s cubic-bezier(.4,0,.2,1) both'
    : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectRole(role) {
  currentRole = role;

  // Animate card selection
  const card = document.getElementById(`card-${role}`);
  if (card) {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => { card.style.transform = ''; }, 150);
  }

  // Show loading effect then navigate
  setTimeout(() => {
    showScreen(`screen-${role}`);
    showToast(getWelcomeMsg(role));

    // Trigger progress animations after screen loads
    setTimeout(() => {
      animateProgressRings();
      animateBars();
      animateNumbers();
    }, 200);
  }, 250);
}

function goBack() {
  showScreen('screen-selector', 'out');
  currentRole = null;
}

function getWelcomeMsg(role) {
  const msgs = {
    conquistador: '⚔️ ¡Bienvenida, Ana! Seguís en racha 🔥',
    instructor:   '📋 Panel de Instructor cargado',
    director:     '🧭 Panel Regional Zona 4 — GM. Abel',
  };
  return msgs[role] || '✅ Cargando...';
}

// ── Animaciones ──────────────────────────────────────────

function animateProgressRings() {
  document.querySelectorAll('.ring-fill').forEach(circle => {
    const pct = parseFloat(getComputedStyle(circle).getPropertyValue('--pct')) || 0;
    const circumference = 314;
    circle.style.strokeDashoffset = circumference;
    requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 1.5s ease-out';
      circle.style.strokeDashoffset = circumference * (1 - pct);
    });
  });
}

function animateBars() {
  document.querySelectorAll('.at-prog-bar, .club-bar, .rank-bar').forEach(bar => {
    const target = bar.style.getPropertyValue('--w') || bar.style.width;
    bar.style.width = '0';
    requestAnimationFrame(() => {
      bar.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
      bar.style.width = target;
    });
  });

  // XP bar
  const xpBar = document.querySelector('.xp-bar');
  if (xpBar) {
    const pct = getComputedStyle(xpBar).getPropertyValue('--pct') || '68%';
    xpBar.style.width = '0';
    requestAnimationFrame(() => {
      xpBar.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1)';
      xpBar.style.width = pct;
    });
  }
}

function animateNumbers() {
  // Animate streak number
  const streak = document.querySelector('.streak-big');
  if (streak) {
    const target = parseInt(streak.textContent) || 0;
    let current = 0;
    const step = Math.ceil(target / 20);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      streak.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 40);
  }
}

// ── Toast notification ───────────────────────────────────
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Interacciones de la UI ────────────────────────────────

// Evidencias — aprobar / rechazar
document.addEventListener('click', e => {
  if (e.target.classList.contains('ev-approve')) {
    const item = e.target.closest('.ev-item');
    const alumno = item?.querySelector('.ev-alumno')?.textContent || '';
    const req    = item?.querySelector('.ev-req')?.textContent || '';
    pulseElement(item, '#dcfce7');
    setTimeout(() => item?.remove(), 400);
    showToast(`✔ Evidencia de ${alumno} aprobada — +50 XP`);
    updateBadgeCount();
  }

  if (e.target.classList.contains('ev-reject')) {
    const item = e.target.closest('.ev-item');
    const alumno = item?.querySelector('.ev-alumno')?.textContent || '';
    pulseElement(item, '#fee2e2');
    setTimeout(() => item?.remove(), 400);
    showToast(`✘ Evidencia de ${alumno} rechazada`);
    updateBadgeCount();
  }

  // Casos director — citar
  if (e.target.classList.contains('caso-btn')) {
    const item = e.target.closest('.caso-item');
    const nombre = item?.querySelector('.caso-nombre')?.textContent || '';
    showToast(`📅 Citación enviada a ${nombre}`);
    e.target.textContent = '✔ Citado';
    e.target.style.background = 'var(--green)';
    e.target.disabled = true;
  }

  // Ver todos los requisitos
  if (e.target.closest('.btn-ver-todos')) {
    showToast('📋 Vista completa de requisitos próximamente');
  }
});

function pulseElement(el, color) {
  if (!el) return;
  const orig = el.style.background;
  el.style.transition = 'background .2s, transform .2s';
  el.style.background = color;
  el.style.transform = 'scale(1.02)';
  setTimeout(() => {
    el.style.background = orig;
    el.style.transform = '';
  }, 300);
}

function updateBadgeCount() {
  const list = document.querySelectorAll('.ev-item');
  const badge = document.querySelector('.widget-evidencias .badge-count');
  if (badge) badge.textContent = list.length;
}

// ── Upload area ──────────────────────────────────────────
function triggerUpload() {
  // En producción aquí iría <input type="file"> real
  showToast('📁 Selector de archivos próximamente');
}

// Drag & drop visual
const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
  ['dragenter','dragover'].forEach(ev => {
    uploadArea.addEventListener(ev, e => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--blue)';
      uploadArea.style.background  = 'var(--blue-l)';
    });
  });
  ['dragleave','drop'].forEach(ev => {
    uploadArea.addEventListener(ev, e => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      uploadArea.style.background  = '';
      if (ev === 'drop') showToast('📤 Archivo recibido — procesando...');
    });
  });
}

// ── Role card hover effects ──────────────────────────────
document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.querySelector('.role-card-glow').style.opacity = '1';
  });
  card.addEventListener('mouseleave', () => {
    card.querySelector('.role-card-glow').style.opacity = '0';
  });
});

// ── Inyectar animación CSS slide-in ─────────────────────
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
  from { opacity: 0; transform: translateY(18px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
`;
document.head.appendChild(style);

// ── Keyboard shortcut ────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && currentRole) goBack();
});

// ── Init ─────────────────────────────────────────────────
console.log(
  '%cConquisQuest — Región 4 APCE\n%cDesarrollado por Eduardo Villanueva · 2026',
  'color:#3b82f6;font-size:18px;font-weight:900;font-family:monospace',
  'color:#64748b;font-size:12px'
);
