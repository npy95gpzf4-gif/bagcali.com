(() => {
  const menu = document.querySelector('.account-menu');
  const toggle = document.querySelector('.account-toggle');
  const options = document.querySelector('.account-options');
  const dialog = document.querySelector('.login-dialog');
  const form = document.querySelector('#login-form');
  const email = document.querySelector('#login-email');
  const password = document.querySelector('#login-password');
  const error = document.querySelector('#login-error');
  const reveal = document.querySelector('.password-toggle');
  let opener = toggle;
  function setMenu(open) { options.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); }
  toggle.addEventListener('click', () => setMenu(options.hidden));
  menu.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') setMenu(true); });
  menu.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !menu.contains(document.activeElement)) setMenu(false); });
  menu.addEventListener('focusout', e => { if (!menu.contains(e.relatedTarget)) setMenu(false); });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) setMenu(false); });
  toggle.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); setMenu(true); options.querySelector('button').focus(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !options.hidden) { setMenu(false); toggle.focus(); } });
  function reset() {
    form.reset(); error.hidden = true; password.type = 'password'; reveal.textContent = 'Show'; reveal.setAttribute('aria-label', 'Show password'); reveal.setAttribute('aria-pressed', 'false');
    [email, password].forEach(input => { input.removeAttribute('aria-invalid'); document.querySelector('#' + input.getAttribute('aria-describedby')).textContent = ''; });
  }
  options.querySelectorAll('[data-login]').forEach(button => button.addEventListener('click', () => {
    opener = toggle; reset(); document.querySelector('#login-title').textContent = button.dataset.login + ' login'; setMenu(false); dialog.showModal(); document.body.classList.add('login-open'); email.focus();
  }));
  document.querySelector('.login-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); });
  dialog.addEventListener('close', () => { reset(); document.body.classList.remove('login-open'); opener.focus(); });
  reveal.addEventListener('click', () => { const show = password.type === 'password'; password.type = show ? 'text' : 'password'; reveal.textContent = show ? 'Hide' : 'Show'; reveal.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); reveal.setAttribute('aria-pressed', String(show)); });
  [email, password].forEach(input => input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); document.querySelector('#' + input.getAttribute('aria-describedby')).textContent = ''; }));
  form.addEventListener('submit', e => {
    e.preventDefault(); error.hidden = true;
    const emailMessage = !email.value.trim() ? 'Please enter your email address.' : email.validity.typeMismatch ? 'Please enter a valid email address.' : '';
    const passwordMessage = !password.value.trim() ? 'Please enter your password.' : '';
    [[email, emailMessage], [password, passwordMessage]].forEach(([input, message]) => { document.querySelector('#' + input.getAttribute('aria-describedby')).textContent = message; input.setAttribute('aria-invalid', String(Boolean(message))); });
    if (emailMessage || passwordMessage) { (emailMessage ? email : password).focus(); return; }
    // Visual prototype only. Credentials are never sent or stored.
    error.hidden = false;
  });
})();
