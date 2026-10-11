/* ============================================================
   THEME TOGGLE
   ============================================================ */
(function () {
  const key = 'bc_theme';
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');

  function updateButton() {
    if (!button) return;
    const isDark = root.getAttribute('data-theme') === 'dark';
    button.textContent = isDark ? '☀' : '☾';
    button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  updateButton();

  if (button) {
    button.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(key, next);

      root.style.removeProperty('--bg-page');

      updateButton();
    });
  }
})();

/* ============================================================
   TASK 1 — Form Validation (Contact form)
   ============================================================ */
(function () {
  const form = document.getElementById('contact-form');
  const errBox = document.getElementById('contact-error');
  if (!form || !errBox) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = [];

    if (!name) errors.push('Name is required.');
    if (!email) errors.push('Email is required.');
    else if (!emailRegex.test(email)) errors.push('Please enter a valid email address.');
    if (!message) errors.push('Message is required.');
    else if (message.length < 10) errors.push('Message must be at least 10 characters.');

    if (errors.length) {
      errBox.innerHTML = errors.map((m) => '• ' + m).join('<br>');
      errBox.hidden = false;
      errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    errBox.hidden = true;
    alert('Demo form — your message was not actually sent.');
    form.reset();
  });
})();

/* ============================================================
   TASK 2 — Accordion
   ============================================================ */
(function () {
  const headers = document.querySelectorAll('.accordion-header');
  if (!headers.length) return;

  headers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const content = btn.nextElementSibling;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.accordion-item-custom.active').forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const c = other.querySelector('.accordion-content');
          if (c) c.style.maxHeight = null;
          const b = other.querySelector('.accordion-header');   
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        content.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ============================================================
   TASK 3 — Popup
   ============================================================ */
(function () {
  const popup = document.getElementById('popup-overlay');
  const openBtn = document.getElementById('open-popup');
  const closeBtn = document.getElementById('close-popup');
  const popupForm = document.getElementById('popup-subscribe-form');

  function openPopup() {
    if (!popup) return;
    popup.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closePopup() {
    if (!popup) return;
    popup.hidden = true;
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openPopup);
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  if (popup) {
    popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !popup.hidden) closePopup();
    });
  }

  if (popupForm) {
  popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('popup-email').value.trim();
    const err = document.getElementById('popup-error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = email
        ? 'Please enter a valid email address.'
        : 'Email is required.';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    alert('Demo — subscription was not actually created.');
    popupForm.reset();
    closePopup();
  });
}

})();

/* ============================================================
   TASK 4 — Change Background Color 
   ============================================================ */
(function () {
  const lightPalette = [
    '#eef5fc', '#e6f0fa', '#e8f1fb',
    '#eaf3ff', '#f0f6ff', '#eef7f2'
  ];
  const darkPalette = [
    '#0a1a2e', '#0f2138', '#142740',
    '#0e1e33', '#13253d', '#0c2a3a',
    '#1a2a44', '#0f1c30'
  ];
  let idx = 0;
  const btn = document.getElementById('bg-color-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const colors = theme === 'dark' ? darkPalette : lightPalette;
    idx = (idx + 1) % colors.length;
    // Меняем CSS-переменную — фон обновится на всей странице
    document.documentElement.style.setProperty('--bg-page', colors[idx]);
  });
})();

/* ============================================================
   TASK 5 — Date & Time
   ============================================================ */
(function () {
  function update() {
    const el = document.getElementById('datetime');
    if (!el) return;
    const now = new Date();
    const options = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    };
    el.textContent = now.toLocaleString('en-US', options);
  }
  update();
  setInterval(update, 1000);
})();

/* ============================================================
   EXTRA — Monthly / Yearly price switch
   ============================================================ */
(function () {
  const yearly = document.getElementById('billing-yearly');
  if (!yearly) return;
  const prices = document.querySelectorAll('.pricing-card .price');
  prices.forEach((p) => {
    p.dataset.monthly = p.firstChild.textContent.replace('$', '').trim();
  });
  document.querySelectorAll('input[name="billing"]').forEach((r) =>
    r.addEventListener('change', () => {
      prices.forEach((p) => {
        const m = parseFloat(p.dataset.monthly);
        const val = m === 0 ? '0'
          : (yearly.checked ? (m * 12 * 0.8).toFixed(2) : m.toFixed(2));
        const period = yearly.checked ? 'year' : 'month';
        p.innerHTML = '$' + val + '<small> / ' + period + '</small>';
      });
    })
  );
})();