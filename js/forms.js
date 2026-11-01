/* ==========================================================
   forms.js - Get Involved (enquiry) and Contact forms
   - JavaScript validation with clear error messages
   - Enquiry form: AJAX submission, then a personal response
     with the cost and availability for the chosen enquiry
   - Contact form: builds an email the visitor can send
   Visitor text is only ever added with textContent (never
   innerHTML) so it cannot inject code.
   ========================================================== */
(function () {
  'use strict';

  /* >>> Change this one line to change who receives contact-form emails <<< */
  var RECIPIENT = 'info@pawsshelter.co.za';

  /* Used only if data/rates.json cannot be loaded */
  var FALLBACK_RATES = {
    responseDays: 2,
    adopt: { puppyFee: 1200, adultFee: 850, includes: 'covers sterilisation, vaccinations and a microchip' },
    volunteer: { cost: 0, openSpots: {} },
    sponsor: {}
  };

  /* ---------- helpers ---------- */
  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }
  function money(n) { return 'R' + Number(n).toLocaleString('en-ZA'); }
  function ymd(date) {                       // Date -> "2026-10-29" (local time) for <input type="date">
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + m + '-' + d;
  }
  function niceDate(value) {
    var parts = value.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ---------- 1. VALIDATION ---------- */
  function validateField(field) {
    var value = field.value.trim();
    var label = field.dataset.label || 'This field';

    if (field.type === 'checkbox') {
      return field.required && !field.checked ? 'Please tick the box to continue.' : '';
    }
    if (field.required && value === '') {
      return field.tagName === 'SELECT' ? 'Please choose an option.' : label + ' is required.';
    }
    if (value === '') { return ''; }             // optional and empty: nothing more to check

    switch (field.dataset.rule) {
      case 'name':
        return /^[A-Za-z\u00C0-\u024F' -]{2,60}$/.test(value) ? '' : 'Use letters only (2 to 60 characters).';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? '' : 'Enter a valid email address, e.g. name@example.com.';
      case 'phone':
        // South African numbers: 0 + 9 digits, or +27 + 9 digits
        return /^(\+27|0)[1-9]\d{8}$/.test(value.replace(/[\s-]/g, '')) ? '' : 'Enter a valid South African number, e.g. 012 345 6789 or +27 82 123 4567.';
      case 'date':
        return dateError(value);
      case 'amount':
        var n = Number(value);
        return (isFinite(n) && n >= 20 && n <= 100000) ? '' : 'Enter an amount between R20 and R100 000.';
      case 'message':
        if (value.length < 10) { return 'Please write at least 10 characters (you have ' + value.length + ').'; }
        if (value.length > 500) { return 'Please keep your message under 500 characters.'; }
        return '';
    }
    return '';
  }

  function dateError(value) {
    var chosen = new Date(value + 'T00:00:00');
    if (isNaN(chosen)) { return 'Enter a valid date.'; }
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var limit = new Date(today); limit.setFullYear(limit.getFullYear() + 1);
    if (chosen < today) { return 'Please choose today or a future date.'; }
    if (chosen > limit) { return 'Please choose a date within the next 12 months.'; }
    return '';
  }

  function showError(field, message) {
    var box = document.getElementById(field.id + '-error');
    if (box) { box.textContent = message; field.setAttribute('aria-describedby', box.id); }
    field.classList.toggle('invalid', message !== '');
    field.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
  }

  function activeFields(form) {                // skips hidden inputs, the honeypot and fields in a disabled group
    return Array.prototype.filter.call(form.querySelectorAll('input, select, textarea'), function (f) {
      return f.type !== 'hidden' && f.name !== 'bot-field' && !f.matches(':disabled');
    });
  }

  function validateForm(form) {
    var firstBad = null;
    activeFields(form).forEach(function (field) {
      var message = validateField(field);
      showError(field, message);
      if (message && !firstBad) { firstBad = field; }
    });
    if (firstBad) { firstBad.focus(); }
    return !firstBad;
  }

  function liveValidation(form) {              // check a field when the visitor leaves it, and keep re-checking while fixing it
    form.addEventListener('focusout', function (e) {
      if (e.target.matches('input, select, textarea') && e.target.name !== 'bot-field') { showError(e.target, validateField(e.target)); }
    });
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) { showError(e.target, validateField(e.target)); }
    });
  }

  function characterCounters(form) {
    form.querySelectorAll('textarea[data-counter]').forEach(function (area) {
      var out = document.getElementById(area.id + '-count');
      area.refreshCount = function () { out.textContent = area.value.length + ' / ' + area.maxLength; };
      area.addEventListener('input', area.refreshCount);
      area.refreshCount();
    });
  }

  /* ---------- 2. ENQUIRY FORM ---------- */
  var enquiry = document.getElementById('enquiry-form');
  if (enquiry) { initEnquiry(enquiry); }

  function initEnquiry(form) {
    var typeSelect = form.elements['enquiry-type'];
    var groups = form.querySelectorAll('.type-fields');
    var dateField = form.elements.date;
    var panel = document.getElementById('enquiry-response');

    liveValidation(form);
    characterCounters(form);

    // Date picker only allows today up to one year ahead
    var today = new Date();
    var limit = new Date(); limit.setFullYear(limit.getFullYear() + 1);
    dateField.min = ymd(today);
    dateField.max = ymd(limit);

    // Show only the questions that match the chosen enquiry type
    function syncGroups() {
      groups.forEach(function (group) {
        var on = group.dataset.for === typeSelect.value;
        group.hidden = !on;
        group.disabled = !on;
        if (!on) {
          group.querySelectorAll('input, select').forEach(function (f) { showError(f, ''); });
        }
      });
    }
    typeSelect.addEventListener('change', syncGroups);

    // Links such as enquiries.html?type=adopt&pet=Golden pre-fill the form
    var params = new URLSearchParams(window.location.search);
    var wantedType = params.get('type');
    if (wantedType && typeSelect.querySelector('option[value="' + CSS.escape(wantedType) + '"]')) { typeSelect.value = wantedType; }
    var wantedPet = params.get('pet');
    if (wantedPet && form.elements.pet && Array.prototype.some.call(form.elements.pet.options, function (o) { return o.value === wantedPet; })) {
      form.elements.pet.value = wantedPet;
    }
    syncGroups();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.elements['bot-field'].value) { return; }           // honeypot filled in: a bot, ignore it
      if (!validateForm(form)) { return; }

      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Sending...';
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      // AJAX: send the form and fetch the prices/availability at the same time, without reloading the page
      Promise.all([getJson('data/rates.json'), getJson('data/pets.json'), postForm(form)]).then(function (results) {
        showResponse(panel, data, results[0] || FALLBACK_RATES, results[1], results[2]);
        form.reset();
        syncGroups();
        form.querySelectorAll('textarea[data-counter]').forEach(function (a) { a.refreshCount(); });
        button.disabled = false;
        button.textContent = 'Submit Enquiry';
      });
    });
  }

  function getJson(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  function postForm(form) {                    // resolves true if the server accepted the submission (Netlify Forms), otherwise false
    var body = new URLSearchParams(new FormData(form)).toString();
    return fetch(form.getAttribute('action') || '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function showResponse(panel, data, rates, petData, saved) {
    var lines = [];
    var title = 'Thank you, ' + data.name.split(' ')[0] + '!';

    if (data['enquiry-type'] === 'adopt') {
      var pets = (petData && petData.pets) || [];
      var pet = pets.filter(function (p) { return p.name === data.pet; })[0];
      var a = rates.adopt;
      if (pet) {
        var fee = pet.months < 12 ? a.puppyFee : a.adultFee;
        lines.push(pet.name + ' (' + pet.breed + ', ' + pet.age + ') is ' + (pet.status === 'available' ? 'currently available for adoption.' : 'not available right now.'));
        lines.push('Adoption fee: ' + money(fee) + ' (' + a.includes + ').');
      } else {
        lines.push('Adoption fees: ' + money(a.puppyFee) + ' for puppies under 1 year and ' + money(a.adultFee) + ' for dogs 1 year and older (' + a.includes + ').');
        lines.push('Several dogs are available right now. Browse them on our Adopt page.');
      }
      lines.push('Your preferred visit date is ' + niceDate(data.date) + '. We will confirm a time within ' + rates.responseDays + ' working days.');
    } else if (data['enquiry-type'] === 'volunteer') {
      var spots = rates.volunteer.openSpots[data.availability];
      lines.push('Volunteering is free of charge.');
      lines.push(spots !== undefined
        ? data.availability + ' currently have ' + spots + ' places open.'
        : 'We will check availability for ' + data.availability + ' and let you know.');
      lines.push('Your preferred start date is ' + niceDate(data.date) + '. Please wear closed shoes and clothes you do not mind getting dirty.');
    } else if (data['enquiry-type'] === 'sponsor') {
      var tier = rates.sponsor[data.tier];
      if (tier) {
        lines.push(tier.label + ' sponsorship: ' + money(tier.monthly) + ' per month, which covers ' + tier.covers + '.');
      }
      lines.push('Your preferred start date is ' + niceDate(data.date) + '. We will email you the payment details.');
    } else {
      lines.push('Thank you for pledging ' + money(data.amount) + '. Every donation goes towards food, veterinary care and safe housing for our animals.');
      lines.push('We will email you our EFT details and a reference number. Your preferred payment date is ' + niceDate(data.date) + '.');
    }
    lines.push('A member of our team will reply to ' + data.email + ' within ' + rates.responseDays + ' working days.');

    panel.replaceChildren();
    panel.appendChild(make('h3', null, title));
    var list = make('ul');
    lines.forEach(function (line) { list.appendChild(make('li', null, line)); });
    panel.appendChild(list);
    if (!saved) {
      panel.appendChild(make('p', 'response-note', 'Note: this copy of the site is not connected to a form-handling service, so your details were not stored. Deploying on Netlify switches this on.'));
    }
    panel.hidden = false;
    panel.focus();
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- 3. CONTACT FORM ---------- */
  var contact = document.getElementById('contact-form');
  if (contact) { initContact(contact); }

  function initContact(form) {
    var preview = document.getElementById('email-preview');
    var status = document.getElementById('copy-status');
    var emailText = '';

    liveValidation(form);
    characterCounters(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateForm(form)) { return; }

      var d = {};
      new FormData(form).forEach(function (value, key) { d[key] = value.trim(); });

      // Compile the validated details into an email
      var subject = d['message-type'] + ' - message from ' + d.name;
      var body = [
        'Hello Paws Shelter team,', '',
        d.message, '',
        '--',
        'Name: ' + d.name,
        'Email: ' + d.email,
        'Phone: ' + (d.phone || 'Not provided'),
        'Type of message: ' + d['message-type']
      ].join('\r\n');

      document.getElementById('email-to').textContent = RECIPIENT;
      document.getElementById('email-subject').textContent = subject;
      document.getElementById('email-body').textContent = body;
      document.getElementById('send-email').href =
        'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      emailText = 'To: ' + RECIPIENT + '\nSubject: ' + subject + '\n\n' + body;

      status.textContent = '';
      preview.hidden = false;
      preview.focus();
      preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    document.getElementById('copy-email').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailText).then(
          function () { status.textContent = 'Email text copied.'; },
          function () { status.textContent = 'Could not copy. Please select the text and copy it manually.'; });
      } else {
        status.textContent = 'Copying is not supported in this browser. Please select the text and copy it manually.';
      }
    });

    document.getElementById('edit-email').addEventListener('click', function () {
      preview.hidden = true;
      form.elements.message.focus();
    });
  }
})();