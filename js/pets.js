/* ==========================================================
   pets.js - Adopt page
   Loads the pets with AJAX (fetch), then handles search, filter,
   sort and the lightbox gallery. All text is added with
   textContent (never innerHTML) so nothing typed by a visitor
   can inject code.
   ========================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('pet-grid');
  if (!grid) { return; }

  var searchBox = document.getElementById('pet-search');
  var filterBox = document.getElementById('pet-filter');
  var sortBox = document.getElementById('pet-sort');
  var countEl = document.getElementById('pet-count');
  var emptyEl = document.getElementById('pet-empty');

  var allPets = [];   // every pet loaded from data/pets.json
  var shown = [];     // the pets currently displayed after search, filter and sort

  /* ---------- 1. Load the data ---------- */
  // Fallback: if pets.json cannot be loaded (e.g. the page was opened without a web server),
  // read the same details from the data-* attributes on the cards already in the HTML.
  function petsFromHtml() {
    return Array.prototype.map.call(grid.querySelectorAll('.pet-card'), function (card) {
      var d = card.dataset;
      return { id: d.id, name: d.name, breed: d.breed, months: Number(d.months), age: d.age,
               img: d.img, alt: d.alt, blurb: d.blurb, status: d.status };
    });
  }

  fetch('data/pets.json')
    .then(function (response) {
      if (!response.ok) { throw new Error('HTTP ' + response.status); }
      return response.json();
    })
    .then(function (json) { allPets = json.pets; })
    .catch(function () { allPets = petsFromHtml(); })
    .then(update);

  /* ---------- 2. Search, filter and sort ---------- */
  function update() {
    var query = searchBox.value.trim().toLowerCase();
    var group = filterBox.value;

    shown = allPets.filter(function (pet) {
      var textMatch = !query || (pet.name + ' ' + pet.breed).toLowerCase().indexOf(query) !== -1;
      var ageMatch = group === 'all' || (group === 'puppy' ? pet.months < 12 : pet.months >= 12);
      return textMatch && ageMatch;
    });

    shown.sort(function (a, b) {
      if (sortBox.value === 'youngest') { return a.months - b.months || a.name.localeCompare(b.name); }
      if (sortBox.value === 'oldest') { return b.months - a.months || a.name.localeCompare(b.name); }
      return a.name.localeCompare(b.name);
    });

    render();
  }

  searchBox.addEventListener('input', update);
  filterBox.addEventListener('change', update);
  sortBox.addEventListener('change', update);

  /* ---------- 3. Build the cards (DOM manipulation) ---------- */
  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function makeCard(pet, index) {
    var card = make('article', 'pet-card');

    var photoButton = make('button', 'pet-open');
    photoButton.type = 'button';
    photoButton.setAttribute('aria-label', 'View a larger photo of ' + pet.name);
    var img = document.createElement('img');
    img.src = pet.img;
    img.alt = pet.alt;
    img.loading = 'lazy';
    photoButton.appendChild(img);

    var detailsButton = make('button', 'btn-outline', 'View details');
    detailsButton.type = 'button';
    detailsButton.setAttribute('aria-label', 'View details for ' + pet.name);

    [photoButton, detailsButton].forEach(function (b) {
      b.addEventListener('click', function () { openBox(index); });
    });

    card.appendChild(photoButton);
    card.appendChild(make('h3', null, pet.name));
    card.appendChild(make('p', null, pet.breed + ' \u2022 ' + pet.age + ' \u2022 Pretoria'));
    card.appendChild(detailsButton);
    return card;
  }

  function render() {
    grid.replaceChildren.apply(grid, shown.map(makeCard));
    countEl.textContent = 'Showing ' + shown.length + ' of ' + allPets.length + ' pets';
    emptyEl.hidden = shown.length > 0;
  }

  /* ---------- 4. Lightbox gallery ---------- */
  var box = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbMeta = document.getElementById('lb-meta');
  var lbText = document.getElementById('lb-text');
  var lbAdopt = document.getElementById('lb-adopt');
  var lbShare = document.getElementById('lb-share');
  var closeBtn = document.getElementById('lb-close');
  var current = 0;
  var opener = null;

  function showPet(index) {
    current = (index + shown.length) % shown.length;     // wraps round at both ends
    var pet = shown[current];
    lbImg.src = pet.img;
    lbImg.alt = pet.alt;
    lbTitle.textContent = pet.name;
    lbMeta.textContent = pet.breed + ' \u2022 ' + pet.age + ' \u2022 Pretoria';
    lbText.textContent = pet.blurb;
    lbAdopt.href = 'enquiries.html?type=adopt&pet=' + encodeURIComponent(pet.name);
    lbShare.href = 'https://wa.me/?text=' + encodeURIComponent(
      'Meet ' + pet.name + ', a ' + pet.breed + ' looking for a home at Paws Shelter: ' + location.origin + location.pathname);
  }

  function openBox(index) {
    opener = document.activeElement;
    showPet(index);
    box.hidden = false;
    document.body.classList.add('no-scroll');
    closeBtn.focus();
  }

  function closeBox() {
    box.hidden = true;
    document.body.classList.remove('no-scroll');
    if (opener && document.contains(opener)) { opener.focus(); }
  }

  closeBtn.addEventListener('click', closeBox);
  document.getElementById('lb-prev').addEventListener('click', function () { showPet(current - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { showPet(current + 1); });
  box.addEventListener('click', function (event) { if (event.target === box) { closeBox(); } });   // click on the dark backdrop

  // Keyboard: Esc closes, arrows move between pets, Tab stays inside the dialog
  document.addEventListener('keydown', function (event) {
    if (box.hidden) { return; }
    if (event.key === 'Escape') { closeBox(); }
    else if (event.key === 'ArrowLeft') { showPet(current - 1); }
    else if (event.key === 'ArrowRight') { showPet(current + 1); }
    else if (event.key === 'Tab') {
      var focusable = box.querySelectorAll('button, a[href]');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();