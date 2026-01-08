// Firebase Authentication for Nigeria Tax Calculator
const REDIRECT_AFTER_LOGIN = "../index.html";
const STORAGE_KEY = "ntc_full_accounting_v2";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyLT58G18M7XPNLd3J6YnAMnLcKeEPmto",
  authDomain: "aaaa-b8178.firebaseapp.com",
  projectId: "aaaa-b8178",
  storageBucket: "aaaa-b8178.firebasestorage.app",
  messagingSenderId: "313899934004",
  appId: "1:313899934004:web:cb2b729fb3b42c57e00561",
  measurementId: "G-X18YDSXSZV"
};

// Initialize Firebase
let firebaseApp = null;
let firebaseAuth = null;

try {
  firebaseApp = firebase.initializeApp(firebaseConfig);
  firebaseAuth = firebase.auth();
  console.log('Firebase initialized successfully');
} catch (e) {
  console.error('Firebase initialization failed:', e);
  alert('Authentication system unavailable. Please check your internet connection.');
}

function uid(prefix='id'){return prefix+'_'+Math.random().toString(36).slice(2,10)}

function loadState(){
  try{const raw = localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null;}catch(e){return null}
}

function saveState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}

function findUserByEmail(email){
  const state = loadState();
  if(!state || !state.users) return null;
  return state.users.find(u => u.email === email);
}

function findUserByFirebaseUid(uid){
  const state = loadState();
  if(!state || !state.users) return null;
  return state.users.find(u => u.firebaseUid === uid);
}

// Helpers for modal
function openModal(el){ if(!el) return; el.setAttribute('aria-hidden','false'); }
function closeModal(el){ if(!el) return; el.setAttribute('aria-hidden','true'); }

function showMessage(el, msg, isError){ if(!el) return; el.textContent = msg; el.style.color = isError? '#b00020' : 'green'; }

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
[openLogin, ...document.querySelectorAll('[data-open-login]')].forEach(btn => {
  if (btn && loginModal) btn.addEventListener('click', () => openModal(loginModal));
});
if (openSignup && signupModal) openSignup.addEventListener('click', () => openModal(signupModal));
if (heroSignup && signupModal) heroSignup.addEventListener('click', () => openModal(signupModal));

// Close buttons inside modals
document.querySelectorAll('[data-close]').forEach(b => {
  b.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    closeModal(modal);
  });
});

// Signup flow
if (signupForm) signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupMsg.textContent = '';
  const name = signupForm.signupName.value.trim();
  const username = signupForm.signupUsername.value.trim();
  const email = signupForm.signupEmail.value.trim().toLowerCase();
  const phone = signupForm.signupPhone.value.trim();
  const password = signupForm.signupPassword.value;

  if(!name || !username || !email || password.length < 6){ showMessage(signupMsg, 'Please fill all required fields (password min 6 chars)', true); return; }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){ showMessage(signupMsg, 'Please enter a valid email address', true); return; }

  // Check if user exists
  let state = loadState() || {users: [], businesses: [], transactions: {}, auth: {currentUserId: null}, audit: [], attachments: {}};
  if(state.users.find(u=>u.email===email)){ showMessage(signupMsg, 'Email already registered', true); return; }
  if(state.users.find(u=>u.username===username)){ showMessage(signupMsg, 'Username already taken', true); return; }

  if(!firebaseAuth){ showMessage(signupMsg, 'Authentication unavailable', true); return; }

  showMessage(signupMsg, 'Creating account...');
  try{
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    const firebaseUid = userCredential.user.uid;

    const userId = uid('user');
    const newUser = {
      id: userId,
      username,
      display: name,
      email,
      phone,
      firebaseUid,
      role: 'User',
      isAdmin: false,
      permissions: {view: true, edit: true, delete: false},
      plan: 'Individual',
      createdAt: Date.now(),
      trialStart: Date.now(),
      tourSeen: false,
      createdByAdmin: false
    };
    state.users.push(newUser);
    state.auth.currentUserId = userId;
    saveState(state);

    showMessage(signupMsg, 'Account created. Redirecting...');
    setTimeout(()=>{ window.location.href = REDIRECT_AFTER_LOGIN; }, 700);
  } catch(err){
    let msg = 'Signup failed';
    if(err.code === 'auth/email-already-in-use') msg = 'Email already registered';
    else if(err.code === 'auth/weak-password') msg = 'Password too weak (min 6 chars)';
    else if(err.code === 'auth/invalid-email') msg = 'Invalid email';
    showMessage(signupMsg, msg, true);
  }
});

// Login flow
if (loginForm) loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginMsg.textContent = '';
  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value;
  if(!email || password.length < 1){ showMessage(loginMsg, 'Email and password required', true); return; }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){ showMessage(loginMsg, 'Please enter a valid email', true); return; }

  if(!firebaseAuth){ showMessage(loginMsg, 'Authentication unavailable', true); return; }

  showMessage(loginMsg, 'Signing in...');
  try{
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    const firebaseUid = userCredential.user.uid;

    // Find or create local user
    let state = loadState() || {users: [], businesses: [], transactions: {}, auth: {currentUserId: null}, audit: [], attachments: {}};
    let user = findUserByFirebaseUid(firebaseUid);
    if(!user) {
      user = findUserByEmail(email);
      if(user && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
      }
    }
    if(!user){
      const userId = uid('user');
      user = {
        id: userId,
        username: email.split('@')[0],
        display: email.split('@')[0],
        email,
        firebaseUid,
        role: 'User',
        isAdmin: false,
        permissions: {view: true, edit: true, delete: false},
        plan: 'Individual',
        createdAt: Date.now(),
        trialStart: Date.now(),
        tourSeen: false,
        createdByAdmin: false
      };
      state.users.push(user);
    }
    state.auth.currentUserId = user.id;
    saveState(state);

    showMessage(loginMsg, 'Login successful. Redirecting...');
    setTimeout(()=>{ window.location.href = REDIRECT_AFTER_LOGIN; }, 500);
  } catch(err){
    let msg = 'Login failed';
    if(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')
      msg = 'Invalid email or password';
    else if(err.code === 'auth/invalid-email') msg = 'Invalid email';
    else if(err.code === 'auth/user-disabled') msg = 'Account disabled';
    else if(err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try later';
    showMessage(loginMsg, msg, true);
  }
});

// Check Firebase auth state
function init(){
  // close modal on overlay click
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click', (ev)=>{ if(ev.target === m) closeModal(m); }));

  // Check if user is already signed in
  if(firebaseAuth){
    firebaseAuth.onAuthStateChanged((user)=>{
      if(user){
        const state = loadState();
        if(state && state.auth && state.auth.currentUserId){
          window.location.href = REDIRECT_AFTER_LOGIN;
        }
      }
    });
  }
}

init();
