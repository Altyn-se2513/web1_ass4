import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ============ AUTH TABS ============ */
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

/* ============ REGISTER ============ */
(function () {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('register-error');
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;
    const terms = document.getElementById('reg-terms').checked;
    const errors = [];

    if (!name) errors.push('Name is required.');
    if (!email) errors.push('Email is required.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
    if (!password) errors.push('Password is required.');
    else if (password.length < 6) errors.push('Password must be at least 6 characters.');
    if (password !== confirm) errors.push('Passwords do not match.');
    if (!terms) errors.push('You must agree to the terms.');

    if (errors.length) {
      errBox.innerHTML = errors.map((m) => '• ' + m).join('<br>');
      errBox.hidden = false;
      return;
    }

    errBox.hidden = true;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const genre = document.getElementById('reg-genre').value;
      const goal = document.getElementById('reg-goal').value;
      localStorage.setItem('bc_acc_genre_' + email, genre);
      localStorage.setItem('bc_acc_goal_' + email, goal);
      localStorage.setItem('bc_acc_since_' + email, new Date().toISOString());
      form.reset();
    } catch (err) {
      errBox.textContent = err.message || 'Registration failed.';
      errBox.hidden = false;
    }
  });
})();

/* ============ LOGIN ============ */
(function () {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('login-error');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    errBox.hidden = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      form.reset();
    } catch (err) {
      errBox.textContent = err.message || 'Login failed.';
      errBox.hidden = false;
    }
  });
})();

/* ============ FORGOT PASSWORD ============ */
(function () {
  const link = document.getElementById('forgot-password-link');
  if (!link) return;
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    if (!email) { alert('Enter your email address first.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Check your inbox.');
    } catch (err) {
      alert(err.message);
    }
  });
})();

/* ============ LOGOUT ============ */
(function () {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try { await signOut(auth); } catch (err) { alert(err.message); }
  });
})();

/* ============ AUTH STATE ============ */
onAuthStateChanged(auth, (user) => {
  const authSection = document.getElementById('auth-section');
  const profileSection = document.getElementById('profile-section');
  if (!authSection || !profileSection) return;

  if (user) {
    authSection.hidden = true;
    profileSection.hidden = false;

    const email = user.email || '';
    document.getElementById('user-name').textContent = user.displayName || email.split('@')[0];
    document.getElementById('acc-name').textContent = user.displayName || '—';
    document.getElementById('acc-email').textContent = email;
    document.getElementById('acc-genre').textContent = localStorage.getItem('bc_acc_genre_' + email) || '—';
    document.getElementById('acc-goal').textContent = localStorage.getItem('bc_acc_goal_' + email) || '20';

    const since = localStorage.getItem('bc_acc_since_' + email);
    document.getElementById('acc-since').textContent = since
      ? new Date(since).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';

    updateStreakUI();
    renderShelf();
    renderReadingProgress();
  } else {
    authSection.hidden = false;
    profileSection.hidden = true;
  }
});

/* ============ STREAK ============ */
const KEY_DAYS = 'bc_readDays';
const getDays = () => JSON.parse(localStorage.getItem(KEY_DAYS) || '[]');
const setDays = (a) => localStorage.setItem(KEY_DAYS, JSON.stringify(a));
const todayISO = () => new Date().toISOString().slice(0, 10);

function computeStreak() {
  const set = new Set(getDays());
  let current = 0;
  let d = new Date();
  if (!set.has(todayISO())) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    current++;
    d.setDate(d.getDate() - 1);
  }

  let best = 0, run = 0, prev = null;
  const sorted = [...set].sort();
  for (const iso of sorted) {
    if (prev) {
      const pd = new Date(prev); pd.setDate(pd.getDate() + 1);
      if (pd.toISOString().slice(0, 10) === iso) run++;
      else run = 1;
    } else run = 1;
    best = Math.max(best, run);
    prev = iso;
  }

  return { current, best: Math.max(best, current), total: set.size };
}

function updateStreakUI() {
  const { current, best, total } = computeStreak();

  ['streak-count', 'stat-current', 'stat-current-2', 'hero-streak'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = current;
  });
  ['stat-best', 'stat-best-2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = best;
  });
  ['stat-total', 'stat-total-2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = total;
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

(function () {
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
      days.push(today);
      setDays(days);
      updateStreakUI();
      alert('Logged 20 minutes. Keep it up!');
    });
  }

  updateStreakUI();
})();

/* ============ SHELF ============ */
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
      <button class="btn btn-sm btn-outline-danger shelf-remove" data-id="${b.id}" type="button" title="Remove from shelf">✕</button>
    </div>
  `).join('');

  el.querySelectorAll('.shelf-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      setShelf(getShelf().filter((x) => x.id !== btn.dataset.id));
      renderShelf();
    });
  });
}

/* ============ READING PROGRESS ============ */
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
        setProgress(books);
        renderReadingProgress();
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

(function () {
  const form = document.getElementById('add-book-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const total = parseInt(document.getElementById('book-total').value, 10) || 0;
    const current = parseInt(document.getElementById('book-current').value, 10) || 0;
    if (!title) { alert('Book title is required.'); return; }
    const books = getProgress();
    books.push({
      id: 'bk_' + Date.now(),
      title, author,
      total: Math.max(0, total),
      current: Math.max(0, Math.min(total || current, current))
    });
    setProgress(books);
    renderReadingProgress();
    form.reset();
  });

  renderReadingProgress();
})();
