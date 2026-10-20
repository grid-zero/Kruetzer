const fillInner   = document.getElementById('fillInner');
const loaderWrap  = document.getElementById('loaderWrap');

const skipLoader = document.documentElement.classList.contains('no-loader');

if (fillInner && loaderWrap && !skipLoader) {
/* Play the loader once per browser session, then skip it on later visits */
try { sessionStorage.setItem('kreutzer-intro', '1'); } catch (e) {}
let current = 0;
const target = 100;

// Simulate a realistic loading curve (fast then slows, then finishes)
function easeProgress(t) {
  // t: 0→1  returns 0→1 with a slight S-curve
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const duration = 900; // ms total
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
  /* No loader on this page (or it already played this session) — let the hero entrance run immediately. */
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




document.querySelectorAll('.teacher-card-container').forEach(card => {
  function flip() {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));
    // un-pinning while hovered should still turn the card back over
    card.classList.toggle('hover-off', !flipped);
  }
  card.addEventListener('mouseleave', () => card.classList.remove('hover-off'));
  card.addEventListener('click', e => {
    // let links on the back of the card navigate without flipping first
    if (e.target.closest('a')) return;
    flip();
  });
  card.addEventListener('keydown', e => {
    if (e.target !== card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
});


/* Header gains a denser background once the page scrolls (cosmetic only) */
const siteHeader = document.getElementById('siteHeader');
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}




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
 
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
  }


  // Enquiry form: submit with fetch, then go to the thank-you page.
  // Without JS the form still posts straight to Formspree.
  const enquiryForm = document.getElementById('enquiryForm');
  const formStatus = document.getElementById('formStatus');
  if (enquiryForm && formStatus && window.fetch) {
    const submitBtn = enquiryForm.querySelector('button[type="submit"]');

    enquiryForm.addEventListener('submit', async e => {
      e.preventDefault();
      formStatus.className = 'form-status';
      formStatus.textContent = 'Sending…';
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(enquiryForm.action, {
          method: 'POST',
          body: new FormData(enquiryForm),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error(res.status);

        window.location.href = 'thanks.html';
      } catch (err) {
        formStatus.classList.add('is-error');
        formStatus.innerHTML = 'Sorry, your message didn\'t send. Please try again, or email us at <a href="mailto:hello@kreutzer.com.au">hello@kreutzer.com.au</a>.';
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
