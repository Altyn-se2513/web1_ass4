import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================================================
   REGISTER
   ========================================================= */
(function () {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errBox   = document.getElementById('register-error');
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-password-confirm').value;
    const terms    = document.getElementById('reg-terms').checked;

    const errors = [];

    if (!name) {
      errors.push('Name is required.');
    } else if (/\d/.test(name)) {
      errors.push('Name cannot contain digits.');
    } else if (!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]{1,49}$/.test(name)) {
      errors.push('Name must contain only letters (2–50 characters), no special symbols.');
    }

    if (!email) {
      errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address.');
    }

    if (!password) {
      errors.push('Password is required.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters.');
    }

    if (password !== confirm) {
      errors.push('Passwords do not match.');
    }

    if (!terms) {
      errors.push('You must agree to the terms.');
    }

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
      const goal  = document.getElementById('reg-goal').value;

      localStorage.setItem('bc_acc_genre_' + email, genre);
      localStorage.setItem('bc_acc_goal_'  + email, goal);
      localStorage.setItem('bc_acc_since_' + email, new Date().toISOString());

      form.reset();
    } catch (err) {
      errBox.textContent = err.message || 'Registration failed.';
      errBox.hidden = false;
    }
  });
})();

/* =========================================================
   LOGIN
   ========================================================= */
(function () {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errBox   = document.getElementById('login-error');
    const email    = document.getElementById('login-email').value.trim();
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

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */
(function () {
  const link = document.getElementById('forgot-password-link');
  if (!link) return;

  link.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    if (!email) {
      alert('Enter your email address first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Check your inbox.');
    } catch (err) {
      alert(err.message);
    }
  });
})();

/* =========================================================
   LOGOUT
   ========================================================= */
(function () {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (err) {
      alert(err.message);
    }
  });
})();

/* =========================================================
   AUTH STATE — показать профиль / форму
   ========================================================= */
onAuthStateChanged(auth, (user) => {
  const authSection    = document.getElementById('auth-section');
  const profileSection = document.getElementById('profile-section');
  if (!authSection || !profileSection) return;

  if (user) {
    authSection.hidden = true;
    profileSection.hidden = false;

    const email = user.email || '';

    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user.displayName || email.split('@')[0];

    const accNameEl = document.getElementById('acc-name');
    if (accNameEl) accNameEl.textContent = user.displayName || '—';

    const accEmailEl = document.getElementById('acc-email');
    if (accEmailEl) accEmailEl.textContent = email;

    const accGenreEl = document.getElementById('acc-genre');
    if (accGenreEl) accGenreEl.textContent = localStorage.getItem('bc_acc_genre_' + email) || '—';

    const accGoalEl = document.getElementById('acc-goal');
    if (accGoalEl) accGoalEl.textContent = localStorage.getItem('bc_acc_goal_' + email) || '20';

    const accSinceEl = document.getElementById('acc-since');
    const since = localStorage.getItem('bc_acc_since_' + email);
    if (accSinceEl) {
      accSinceEl.textContent = since
        ? new Date(since).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : '—';
    }

    if (typeof window.updateStreakUI === 'function')         window.updateStreakUI();
    if (typeof window.renderShelf === 'function')            window.renderShelf();
    if (typeof window.renderReadingProgress === 'function')  window.renderReadingProgress();

  } else {
    authSection.hidden = false;
    profileSection.hidden = true;
  }
});
