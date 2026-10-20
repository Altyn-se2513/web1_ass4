/* 
   THEME TOGGLE
*/
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

/* 
   TASK 1 — Form Validation (Contact form)
*/
(function () {
  const form = document.getElementById('contact-form');
  const errBox = document.getElementById('contact-error');
  if (!form || !errBox) return;

  const nameRegex = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]{1,49}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const errors = [];

    if (!name) {
      errors.push('Name is required.');
    } else if (/\d/.test(name)) {
      errors.push('Name cannot contain digits.');
    } else if (!nameRegex.test(name)) {
      errors.push('Name must contain only letters (2–50 characters), no special symbols.');
    }

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

  const nameInput = document.getElementById('name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[\d]/g, '');
    });
  }
})();

/* Accordion for FAQ */
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

/* 
   TASK 3 — Popup
*/
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

/* 
   TASK 4 — Change Background Color 
*/
(function () {
  const lightPalette = [
    '#eef5fc', '#ee2ed5', '#fcf930',
    '#2279ea', '#de2d2d', '#28d074'
  ];
  const darkPalette = [
    '#728296', '#a1369d', '#a2a02c',
    '#14335d', '#964b4b', '#36743f'
  ];
  let idx = 0;
  const btn = document.getElementById('bg-color-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const colors = theme === 'dark' ? darkPalette : lightPalette;
    idx = (idx + 1) % colors.length;
    document.documentElement.style.setProperty('--bg-page', colors[idx]);
  });
})();

/* 
   TASK 5 — Date & Time
*/
(function () {
  function update() {
    const el = document.getElementById('datetime');
    if (!el) return;
    const now = new Date();
    const options = {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    };
    el.textContent = now.toLocaleString('en-US', options);
  }
  update();
  setInterval(update, 1000);
})();

/* 
   EXTRA — Monthly / Yearly price switch
*/
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


/* --- Табы Login / Sign Up --- */
(function () {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  if (!tabLogin || !tabRegister || !loginSection || !registerSection) return;

  function showLogin() {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginSection.hidden = false;
    registerSection.hidden = true;
  }
  function showRegister() {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    loginSection.hidden = true;
    registerSection.hidden = false;
  }

  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);

  const linkToRegister = document.getElementById('link-to-register');
  if (linkToRegister) linkToRegister.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
  const linkToLogin = document.getElementById('link-to-login');
  if (linkToLogin) linkToLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
})();

/* --- Streak --- */
(function () {
  const KEY_DAYS = 'bc_readDays';
  const getDays = () => JSON.parse(localStorage.getItem(KEY_DAYS) || '[]');
  const setDays = (a) => localStorage.setItem(KEY_DAYS, JSON.stringify(a));
  const todayISO = () => new Date().toISOString().slice(0, 10);

  function computeStreak() {
    const set = new Set(getDays());
    let current = 0;
    let d = new Date();
    if (!set.has(todayISO())) d.setDate(d.getDate() - 1);
    while (set.has(d.toISOString().slice(0, 10))) { current++; d.setDate(d.getDate() - 1); }

    let best = 0, run = 0, prev = null;
    const sorted = [...set].sort();
    for (const iso of sorted) {
      if (prev) {
        const pd = new Date(prev); pd.setDate(pd.getDate() + 1);
        run = (pd.toISOString().slice(0, 10) === iso) ? run + 1 : 1;
      } else run = 1;
      best = Math.max(best, run);
      prev = iso;
    }
    return { current, best: Math.max(best, current), total: set.size };
  }

  function updateStreakUI() {
    const { current, best, total } = computeStreak();
    ['streak-count', 'stat-current', 'stat-current-2', 'hero-streak'].forEach((id) => {
      const el = document.getElementById(id); if (el) el.textContent = current;
    });
    ['stat-best', 'stat-best-2'].forEach((id) => {
      const el = document.getElementById(id); if (el) el.textContent = best;
    });
    ['stat-total', 'stat-total-2'].forEach((id) => {
      const el = document.getElementById(id); if (el) el.textContent = total;
    });
    const msg = document.getElementById('streak-message');
    if (msg) {
      if (current === 0) msg.textContent = 'Log your first 20-min session today.';
      else if (current === 1) msg.textContent = 'Day 1 — keep going!';
      else msg.textContent = `${current} days in a row. Don't break the chain!`;
    }
    const cal = document.getElementById('streak-calendar');
    if (cal) {
      const set = new Set(getDays());
      const today = todayISO();
      let html = '';
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const cls = ['cal-cell'];
        if (set.has(iso)) cls.push('active');
        if (iso === today) cls.push('today');
        html += `<div class="${cls.join(' ')}">${d.getDate()}</div>`;
      }
      cal.innerHTML = html;
    }
  }

  window.updateStreakUI = updateStreakUI;

  const toggle = document.getElementById('streak-toggle');
  const panel = document.getElementById('streak-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }
  const logBtn = document.getElementById('log-read-btn');
  if (logBtn) {
    logBtn.addEventListener('click', () => {
      const days = getDays();
      const today = todayISO();
      if (days.includes(today)) { alert('Already logged for today!'); return; }
      days.push(today); setDays(days);
      updateStreakUI();
      alert('Logged 20 minutes. Keep it up!');
    });
  }

  if (document.getElementById('streak-count')) updateStreakUI();
})();

/* --- Shelf --- */
(function () {
  const KEY_SHELF = 'bc_shelf';
  const getShelf = () => JSON.parse(localStorage.getItem(KEY_SHELF) || '[]');
  const setShelf = (a) => localStorage.setItem(KEY_SHELF, JSON.stringify(a));

  function renderShelf() {
    const el = document.getElementById('my-shelf');
    if (!el) return;
    const shelf = getShelf();
    if (!shelf.length) {
      el.innerHTML = '<p class="text-small">No books on your shelf yet. Add some from the <a href="3product.html">catalog</a>.</p>';
      return;
    }
    el.innerHTML = shelf.map((b) => `
      <div class="shelf-item p-2">
        <img src="${b.cover || 'imgs/logo.png'}" alt="${b.title}">
        <div class="shelf-item-info">
          <h4 class="mb-1">${b.title}</h4>
          <p class="mb-0">${b.author || ''}</p>
        </div>
        <button class="btn btn-sm btn-outline-danger shelf-remove" data-id="${b.id}" type="button" title="Remove">✕</button>
      </div>
    `).join('');
    el.querySelectorAll('.shelf-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        setShelf(getShelf().filter((x) => x.id !== btn.dataset.id));
        renderShelf();
      });
    });
  }

  window.renderShelf = renderShelf;
})();

/* --- Reading Progress --- */
(function () {
  const KEY_PROGRESS = 'bc_progress';
  const getProgress = () => JSON.parse(localStorage.getItem(KEY_PROGRESS) || '[]');
  const setProgress = (a) => localStorage.setItem(KEY_PROGRESS, JSON.stringify(a));

  function renderReadingProgress() {
    const el = document.getElementById('my-books');
    if (!el) return;
    const books = getProgress();
    if (!books.length) {
      el.innerHTML = '<p class="text-small">No books in progress yet. Add one below to start tracking.</p>';
      return;
    }
    el.innerHTML = books.map((b) => {
      const pct = b.total > 0 ? Math.min(100, Math.round((b.current / b.total) * 100)) : 0;
      return `
        <div class="book-item p-3">
          <div class="book-item-info">
            <h4 class="mb-1">${b.title}</h4>
            <p class="book-item-author mb-1">${b.author || '—'}</p>
            <p class="book-item-progress mb-2">${b.current} / ${b.total || '?'} pages · ${pct}%</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="book-item-actions">
            <input type="number" class="form-control form-control-sm" style="width:80px" min="0" max="${b.total}" value="${b.current}" data-page-input="${b.id}">
            <button class="btn btn-sm btn-outline-primary" data-update="${b.id}" type="button">Update</button>
            <button class="btn btn-sm btn-outline-danger" data-remove-progress="${b.id}" type="button">✕</button>
          </div>
        </div>
      `;
    }).join('');

    el.querySelectorAll('[data-update]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.update;
        const input = el.querySelector(`[data-page-input="${id}"]`);
        const books = getProgress();
        const b = books.find((x) => x.id === id);
        if (b) {
          b.current = Math.max(0, Math.min(b.total, parseInt(input.value, 10) || 0));
          setProgress(books); renderReadingProgress();
        }
      });
    });
    el.querySelectorAll('[data-remove-progress]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setProgress(getProgress().filter((x) => x.id !== btn.dataset.removeProgress));
        renderReadingProgress();
      });
    });
  }

  window.renderReadingProgress = renderReadingProgress;

  const form = document.getElementById('add-book-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('book-title').value.trim();
      const author = document.getElementById('book-author').value.trim();
      const total = parseInt(document.getElementById('book-total').value, 10) || 0;
      const current = parseInt(document.getElementById('book-current').value, 10) || 0;
      if (!title) { alert('Book title is required.'); return; }
      const books = getProgress();
      books.push({
        id: 'bk_' + Date.now(), title, author,
        total: Math.max(0, total),
        current: Math.max(0, Math.min(total || current, current))
      });
      setProgress(books);
      renderReadingProgress();
      form.reset();
    });
    renderReadingProgress();
  }
})();
