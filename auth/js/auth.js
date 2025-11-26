// Auth helper script
const API_BASE_URL = "API_BASE_URL"; // <- replace with your backend URL
const SIGNUP_PATH = "/api/auth/signup";
const LOGIN_PATH = "/api/auth/login";
const REDIRECT_AFTER_LOGIN = "/dashboard.html";
const TOKEN_KEY = "ntc_auth_token";

// Utility: SHA-256 hex
async function sha256Hex(str){
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Helpers for modal
function openModal(el){ if(!el) return; el.setAttribute('aria-hidden','false'); }
function closeModal(el){ if(!el) return; el.setAttribute('aria-hidden','true'); }

function showMessage(el, msg, isError){ if(!el) return; el.textContent = msg; el.style.color = isError? '#b00020' : ''; }

async function postJson(path, payload){
  const url = (API_BASE_URL || '').replace(/\/$/, '') + path;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(()=>({ success:false, message:'Invalid JSON response' }));
  return { status: res.status, ok: res.ok, body: json };
}

// DOM refs
const openLogin = document.getElementById('openLogin');
const openSignup = document.getElementById('openSignup');
const heroSignup = document.getElementById('heroSignup');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginMsg = document.getElementById('loginMsg');
const signupMsg = document.getElementById('signupMsg');

// Wire UI
[openLogin, document.querySelectorAll('[data-open-login]')].flat().forEach(btn=>{ if(btn) btn.addEventListener('click', ()=>openModal(loginModal)); });
if(openSignup) openSignup.addEventListener('click', ()=>openModal(signupModal));
if(heroSignup) heroSignup.addEventListener('click', ()=>openModal(signupModal));

// Close buttons inside modals
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', (e)=>{ const modal = e.target.closest('.modal'); closeModal(modal); }));

// Signup flow
signupForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  signupMsg.textContent = '';
  const name = signupForm.signupName.value.trim();
  const username = signupForm.signupUsername.value.trim();
  const email = signupForm.signupEmail.value.trim();
  const phone = signupForm.signupPhone.value.trim();
  const password = signupForm.signupPassword.value;

  if(!name || !username || !email || password.length < 6){ showMessage(signupMsg, 'Please fill all required fields (password min 6 chars)', true); return; }

  // client-side hash
  const pwdHash = await sha256Hex(password);

  const payload = { name, username, email, phone, password: pwdHash, plan: 'Individual' };
  showMessage(signupMsg, 'Creating account...');
  try{
    const { ok, body } = await postJson(SIGNUP_PATH, payload);
    if(ok && body && (body.token || body.success)){
      const token = body.token || (body.data && body.data.token) || null;
      if(token) localStorage.setItem(TOKEN_KEY, token);
      showMessage(signupMsg, 'Account created. Redirecting...');
      setTimeout(()=>{ window.location.href = REDIRECT_AFTER_LOGIN; }, 700);
    } else {
      const msg = (body && (body.message || body.error)) || 'Signup failed';
      showMessage(signupMsg, msg, true);
    }
  }catch(err){ showMessage(signupMsg, 'Network error: '+err.message, true); }
});

// Login flow
loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  loginMsg.textContent = '';
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value;
  if(!username || password.length < 1){ showMessage(loginMsg, 'Missing username or password', true); return; }
  const pwdHash = await sha256Hex(password);
  const payload = { username, password: pwdHash };
  showMessage(loginMsg, 'Signing in...');
  try{
    const { ok, body } = await postJson(LOGIN_PATH, payload);
    if(ok && body && (body.token || body.success)){
      const token = body.token || (body.data && body.data.token) || null;
      if(token) localStorage.setItem(TOKEN_KEY, token);
      showMessage(loginMsg, 'Login successful. Redirecting...');
      setTimeout(()=>{ window.location.href = REDIRECT_AFTER_LOGIN; }, 500);
    } else {
      const msg = (body && (body.message || body.error)) || 'Login failed';
      showMessage(loginMsg, msg, true);
    }
  }catch(err){ showMessage(loginMsg, 'Network error: '+err.message, true); }
});

// Simple auth state
function isAuthenticated(){ return !!localStorage.getItem(TOKEN_KEY); }

function init(){
  if(isAuthenticated()){
    // If already signed in redirect immediately
    window.location.href = REDIRECT_AFTER_LOGIN;
    return;
  }

  // close modal on overlay click
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click', (ev)=>{ if(ev.target === m) closeModal(m); }));
}

init();
