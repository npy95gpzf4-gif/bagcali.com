import { createClient } from '@supabase/supabase-js';
import { publicSupabaseConfig } from './config.js';
import { exchanges, prices, validateConnection, simulateOrder } from './model.js';
const $ = id => document.getElementById(id);
const url = import.meta.env.VITE_SUPABASE_URL || publicSupabaseConfig.url;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || publicSupabaseConfig.publishableKey;
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && key.startsWith('sb_publishable_');
const supabase = configured ? createClient(url, key, { auth: { flowType: 'pkce', detectSessionInUrl: true } }) : null;
let mode = 'login', activeUser = null, selected = null;
let connected = new Set(), account = { balance: 10000, holdings: {} }, orders = [];
const money = value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function message(id, text, success = false) { $(id).textContent = text; $(id).classList.toggle('success', success); }
function resetDemo() { connected = new Set(); account = { balance: 10000, holdings: {} }; orders = []; selected = null; $('activity').replaceChildren(); $('empty-activity').hidden = false; $('connection-form').hidden = true; refreshConnections(); }
function setMode(next) {
  mode = next;
  ['login', 'register'].forEach(tab => { const b = $('tab-' + tab); b.setAttribute('aria-selected', String(tab === mode)); b.tabIndex = tab === mode ? 0 : -1; });
  $('auth-panel').setAttribute('aria-labelledby', 'tab-' + mode);
  $('auth-title').textContent = mode === 'login' ? 'Welcome back.' : 'Start with your account.';
  $('auth-description').textContent = mode === 'login' ? 'Sign in to your demo workspace.' : 'Create an account to explore the demo.';
  $('auth-submit').textContent = mode === 'login' ? 'Sign in ↗' : 'Create account ↗';
  $('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('password').minLength = mode === 'login' ? 1 : 12;
  $('password').value = '';
  $('password-hint').hidden = mode !== 'register'; $('reset-password').hidden = mode !== 'login';
  message('auth-message', '');
}
['login', 'register'].forEach(tab => {
  $('tab-' + tab).addEventListener('click', () => setMode(tab));
  $('tab-' + tab).addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'login' : event.key === 'End' ? 'register' : mode === 'login' ? 'register' : 'login'; setMode(next); $('tab-' + next).focus(); } });
});
async function updateUser() {
  if (!supabase) return;
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data.user;
  if (activeUser?.id !== user?.id) resetDemo();
  activeUser = user;
  if (!$('update-password').hidden) return;
  $('auth-view').hidden = Boolean(user); $('workspace').hidden = !user; $('sign-out').hidden = !user;
  $('user-label').textContent = user?.email || '';
}
$('setup-notice').hidden = configured; $('auth-submit').disabled = !configured; $('reset-password').disabled = !configured;
$('auth-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!supabase) return;
  $('auth-submit').disabled = true; message('auth-message', 'Please wait…', true);
  try {
    const credentials = { email: $('email').value.trim(), password: $('password').value };
    const result = mode === 'register' ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: location.origin + '/trade/' } }) : await supabase.auth.signInWithPassword(credentials);
    $('password').value = '';
    if (result.error) throw result.error;
    if (mode === 'register' && !result.data.session) message('auth-message', 'Check your email to confirm your account, then return here to sign in.', true);
    else { message('auth-message', ''); await updateUser(); }
  } catch (error) { message('auth-message', error.message || 'Unable to access your account. Please try again.'); }
  finally { $('auth-submit').disabled = false; }
});
$('sign-out').addEventListener('click', async () => {
  if (!supabase) return;
  $('sign-out').disabled = true;
  const { error } = await supabase.auth.signOut();
  $('sign-out').disabled = false;
  if (error) { message('order-message', 'Sign-out failed. Please retry.'); return; }
  activeUser = null; resetDemo(); $('workspace').hidden = true; $('auth-view').hidden = false; $('sign-out').hidden = true;
});
$('reset-password').addEventListener('click', async () => {
  if (!supabase) return;
  const email = $('email'); if (!email.value || !email.checkValidity()) { email.reportValidity(); email.focus(); return; }
  $('reset-password').disabled = true;
  const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin + '/trade/' });
  message('auth-message', error ? error.message : 'If this email has an account, a password reset link will arrive shortly.', !error);
  $('reset-password').disabled = false;
});
$('password-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!supabase) return;
  const button = event.target.querySelector('button'); button.disabled = true;
  const { error } = await supabase.auth.updateUser({ password: $('new-password').value });
  $('new-password').value = ''; button.disabled = false;
  message('auth-message', error ? error.message : 'Password updated.', !error);
  if (!error) { $('update-password').hidden = true; $('auth-form').hidden = false; await updateUser(); }
});
if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    // Keep asynchronous Supabase calls out of the synchronous auth callback.
    if (event === 'PASSWORD_RECOVERY') {
      $('workspace').hidden = true; $('auth-view').hidden = false; $('auth-form').hidden = true; $('reset-password').hidden = true;
      $('update-password').hidden = false; message('auth-message', 'Choose a new password.', true);
    } else if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
      setTimeout(() => { if ($('update-password').hidden) updateUser(); }, 0);
    }
  });
  updateUser();
}
function renderExchanges() {
  $('exchange-grid').replaceChildren();
  exchanges.forEach(exchange => {
    const button = document.createElement('button'); button.className = 'exchange'; button.type = 'button';
    button.setAttribute('aria-pressed', String(selected === exchange.id));
    const mark = document.createElement('span'); mark.textContent = exchange.mark;
    const name = document.createElement('strong'); name.textContent = exchange.name;
    const state = document.createElement('small'); state.textContent = connected.has(exchange.id) ? 'Demo connected' : 'Not connected';
    button.append(mark, name, state); button.addEventListener('click', () => selectExchange(exchange)); $('exchange-grid').append(button);
  });
}
function selectExchange(exchange) {
  selected = exchange.id; renderExchanges(); $('connection-form').hidden = false;
  $('exchange-title').textContent = exchange.name + ' · Demo connection';
  $('api-key').value = 'DEMO-' + exchange.id.toUpperCase() + '-SAMPLE-KEY'; $('api-secret').value = 'DEMO-NOT-A-REAL-SECRET';
  $('passphrase-label').hidden = !exchange.passphrase;
  $('secret-label').firstChild.textContent = exchange.id === 'coinbase' ? 'API private key (sample)' : 'API secret (sample)';
  ['permission-read','permission-trade','permission-withdraw','permission-ip'].forEach(id => $(id).checked = connected.has(exchange.id));
  $('disconnect-exchange').hidden = !connected.has(selected); $('connect-exchange').disabled = connected.has(selected);
  message('connection-message', '');
}
function refreshConnections() {
  const previous = $('order-exchange').value; $('order-exchange').replaceChildren();
  if (!connected.size) { const o = new Option('Connect an exchange first', ''); $('order-exchange').append(o); }
  exchanges.filter(e => connected.has(e.id)).forEach(e => $('order-exchange').append(new Option(e.name + ' (demo)', e.id)));
  if (connected.has(previous)) $('order-exchange').value = previous;
  $('connection-count').textContent = connected.size + ' connected'; $('order-submit').disabled = !connected.size;
  $('balance').textContent = money(account.balance) + ' USDT'; renderExchanges(); updatePrice();
}
$('connect-exchange').addEventListener('click', () => {
  if (!activeUser) return;
  const error = validateConnection(selected, { read: $('permission-read').checked, trade: $('permission-trade').checked, withdrawalOff: $('permission-withdraw').checked, ip: $('permission-ip').checked });
  if (error) return message('connection-message', error);
  connected.add(selected); refreshConnections(); $('connect-exchange').disabled = true; $('disconnect-exchange').hidden = false;
  message('connection-message', 'Demo connection ready. No exchange API was contacted and no credentials were saved.', true);
});
$('disconnect-exchange').addEventListener('click', () => { connected.delete(selected); refreshConnections(); $('connect-exchange').disabled = false; $('disconnect-exchange').hidden = true; message('connection-message', 'Demo connection removed.', true); });
function updatePrice() {
  const symbol = $('symbol').value; $('order-price').textContent = 'Fixed demo price: ' + money(prices[symbol]) + ' USDT';
  $('holdings').textContent = 'Demo holding: ' + (account.holdings[symbol] || 0) + ' ' + symbol.split('/')[0];
}
$('symbol').addEventListener('change', updatePrice);
$('order-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!activeUser || !connected.has($('order-exchange').value)) return message('order-message', 'Connect a demo exchange first.');
  try {
    const symbol = $('symbol').value, side = $('side').value, quantity = Number($('quantity').value);
    account = simulateOrder(account, symbol, side, quantity); orders.push({ symbol, side, quantity });
    const li = document.createElement('li'); li.textContent = side.toUpperCase() + ' ' + quantity + ' ' + symbol + ' · Simulated fill';
    const time = document.createElement('small'); time.textContent = exchanges.find(e => e.id === $('order-exchange').value).name + ' · ' + new Date().toLocaleTimeString() + ' · Fixed demo price ' + money(prices[symbol]);
    li.append(time); $('activity').prepend(li); while ($('activity').children.length > 30) $('activity').lastChild.remove();
    $('empty-activity').hidden = true; refreshConnections(); message('order-message', 'Paper order filled. No real order was sent.', true); $('quantity').value = '';
  } catch (error) { message('order-message', error.message); }
});
setMode('login'); refreshConnections();
