/* ==========================================================
   script.js - Paws Shelter (loaded on every page)
   Scroll animations, the FAQ accordion, back-to-top button
   and safe external links.
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. SCROLL REVEAL ANIMATION
     Elements with class "reveal" fade up the first time they scroll into view.
     (The CSS only hides them when JavaScript is available, so nothing is ever stuck invisible.) */
  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);          // animate once only
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('visible'); });
  }

  /* 2. ACCORDION (About page FAQ)
     Clicking a question opens its answer and closes the others.
     aria-expanded keeps screen readers informed. */
  function setOpen(button, open) {
    button.setAttribute('aria-expanded', String(open));
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) { panel.classList.toggle('open', open); }
  }
  document.querySelectorAll('.accordion').forEach(function (accordion) {
    var buttons = accordion.querySelectorAll('.accordion-trigger');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var wasOpen = button.getAttribute('aria-expanded') === 'true';
        buttons.forEach(function (b) { setOpen(b, false); });
        setOpen(button, !wasOpen);
      });
    });
  });

  /* 3. BACK-TO-TOP BUTTON (advanced DOM manipulation)
     The button is created and added to the page with JavaScript, then
     shown only after the visitor has scrolled down. */
  var topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'back-to-top';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.textContent = '\u2191';
  document.body.appendChild(topButton);

  window.addEventListener('scroll', function () {
    topButton.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  topButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* 4. SECURITY: links that open a new tab must not give the new page access to this one */
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    link.rel = 'noopener noreferrer';
  });
})();