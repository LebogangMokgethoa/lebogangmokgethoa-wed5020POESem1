/* ==========================================================
   map.js - Contact page
   Interactive map built with Leaflet (leafletjs.com) and
   OpenStreetMap tiles. One marker per shelter location.
   ========================================================== */
(function () {
  'use strict';

  var mapEl = document.getElementById('map');
  if (!mapEl) { return; }

  // If the Leaflet library could not load (offline, blocked) show the addresses instead of an empty box
  if (typeof L === 'undefined') {
    mapEl.classList.add('map-fallback');
    mapEl.textContent = 'The interactive map could not be loaded. Our locations: 12 Rescue Road, Pretoria and 45 Companion Street, Johannesburg.';
    return;
  }

  // Approximate city-centre coordinates [latitude, longitude]
  var sites = {
    pretoria: { name: 'Main Shelter', address: '12 Rescue Road, Pretoria', coords: [-25.7479, 28.2293] },
    johannesburg: { name: 'Satellite Adoption Centre', address: '45 Companion Street, Johannesburg', coords: [-26.2041, 28.0473] }
  };

  var map = L.map(mapEl, { scrollWheelZoom: false });   // scroll wheel zoom off so the page can still scroll past the map
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var markers = {};
  var bounds = [];
  Object.keys(sites).forEach(function (key) {
    var site = sites[key];
    var popup = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = site.name;
    popup.appendChild(title);
    popup.appendChild(document.createElement('br'));
    popup.appendChild(document.createTextNode(site.address));

    markers[key] = L.marker(site.coords, { title: site.name, alt: site.name }).addTo(map).bindPopup(popup);
    bounds.push(site.coords);
  });
  map.fitBounds(bounds, { padding: [40, 40] });

  // The two buttons above the map fly to a location and open its pop-up
  document.querySelectorAll('[data-map]').forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-map');
      map.flyTo(sites[key].coords, 12);
      markers[key].openPopup();
    });
  });
})();