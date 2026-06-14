const fillInner   = document.getElementById('fillInner');
const loaderWrap  = document.getElementById('loaderWrap');

if (fillInner && loaderWrap) {
let current = 0;
const target = 100;

// Simulate a realistic loading curve (fast then slows, then finishes)
function easeProgress(t) {
  // t: 0→1  returns 0→1 with a slight S-curve
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const duration = 1600; // ms total
let startTime = null;

function step(ts) {
  if (!startTime) startTime = ts;
  const elapsed = Math.min(ts - startTime, duration);
  const rawT    = elapsed / duration;
  const eased   = easeProgress(rawT);
  const pct     = Math.round(eased * 100);

  fillInner.style.width   = pct + '%';

  if (elapsed < duration) {
    requestAnimationFrame(step);
  } else {
    fillInner.style.width  = '100%';
    loaderWrap.classList.add('done');
    /* Curtain is lifting — let the hero entrance choreography begin now. */
    document.documentElement.classList.add('loaded');
    /* remove from dom after animation finishes */
    setTimeout(() => {
        loaderWrap.style.display = "none";
    }, 2000);
  }
}

requestAnimationFrame(step);
}
else {
  /* No loader on this page — let the hero entrance run immediately. */
  document.documentElement.classList.add('loaded');
}


const observerOptions = {
  root: null, // use the viewport
  threshold: 0.1 // trigger when 10% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Optional: stop observing once it has revealed
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Target all elements with the .reveal class
document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});


const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';

  if (reduceMotion || isNaN(target)) {
    return; // leave the static HTML value in place
  }

  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);

      const duration = 1100;
      let startTime = null;
      el.textContent = '0' + suffix;

      function step(ts) {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  countObserver.observe(el);
});




document.querySelectorAll('.teacher-card-container').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('is-flipped');
  });
});




  const btn = document.getElementById('burgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (btn && sidebar && overlay) {
 
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('active'));
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');
  }
 
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
  }
 
  btn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
 
  overlay.addEventListener('click', closeSidebar);
 
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });
 
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      closeSidebar();
    });
  });
  }

