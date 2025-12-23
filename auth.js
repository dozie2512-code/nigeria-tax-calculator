// Firebase Authentication for Nigeria Tax Calculator
(function(){
  // Firebase configuration (must match index.html)
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
  
  const STORAGE_KEY = 'ntc_full_accounting_v2';
  
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

  function showMsg(el, msg, success){ el.textContent = msg || ''; el.style.color = success? 'green':'#b00'; }

  document.addEventListener('DOMContentLoaded', ()=>{
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const loginPanel = document.getElementById('loginPanel');
    const signupPanel = document.getElementById('signupPanel');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    const loginMsg = document.getElementById('loginMsg');
    const signupName = document.getElementById('signupName');
    const signupUser = document.getElementById('signupUser');
    const signupEmail = document.getElementById('signupEmail');
    const signupPass = document.getElementById('signupPass');
    const signupPass2 = document.getElementById('signupPass2');
    const signupMsg = document.getElementById('signupMsg');
    const signupCancel = document.getElementById('signupCancel');
    const loginDemo = document.getElementById('loginDemo');

    function switchTo(panel){
      if(panel==='login'){
        tabLogin.classList.add('active'); tabSignup.classList.remove('active'); loginPanel.classList.remove('hidden'); signupPanel.classList.add('hidden');
      }else{
        tabSignup.classList.add('active'); tabLogin.classList.remove('active'); signupPanel.classList.remove('hidden'); loginPanel.classList.add('hidden');
      }
    }

    tabLogin.addEventListener('click', ()=>switchTo('login'));
    tabSignup.addEventListener('click', ()=>switchTo('signup'));

    signupCancel.addEventListener('click', ()=>{ signupForm.reset(); switchTo('login'); signupMsg.textContent=''; });

    signupForm.addEventListener('submit', async (e)=>{
      e.preventDefault(); signupMsg.textContent='';
      const name = signupName.value.trim(); const username = signupUser.value.trim(); const email = signupEmail.value.trim().toLowerCase();
      const pass = signupPass.value; const pass2 = signupPass2.value;
      if(!name||!username||!email||!pass) return showMsg(signupMsg,'Please fill all fields',true);
      if(pass !== pass2) return showMsg(signupMsg,'Passwords do not match',true);
      if(pass.length < 6) return showMsg(signupMsg,'Password must be at least 6 characters',true);
      
      // Check if user exists
      let state = loadState() || {users: [], businesses: [], transactions: {}, auth: {currentUserId: null}, audit: [], attachments: {}};
      if(state.users.find(u=>u.email===email)) return showMsg(signupMsg,'Email already registered',true);
      if(state.users.find(u=>u.username===username)) return showMsg(signupMsg,'Username already taken',true);
      
      if(!firebaseAuth) return showMsg(signupMsg,'Authentication unavailable',true);
      
      showMsg(signupMsg,'Creating account...');
      try{
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, pass);
        const firebaseUid = userCredential.user.uid;
        
        const userId = uid('user');
        const newUser = { 
          id: userId, 
          username, 
          display: name, 
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
        state.users.push(newUser);
        state.auth.currentUserId = userId;
        saveState(state);
        
        showMsg(signupMsg,'Account created — redirecting...', true);
        setTimeout(()=>{ window.location.href = '/index.html'; }, 700);
      } catch(err){
        let msg = 'Signup failed';
        if(err.code === 'auth/email-already-in-use') msg = 'Email already registered';
        else if(err.code === 'auth/weak-password') msg = 'Password too weak';
        else if(err.code === 'auth/invalid-email') msg = 'Invalid email';
        showMsg(signupMsg, msg, true);
      }
    });

    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault(); loginMsg.textContent='';
      const email = loginUser.value.trim(); const pass = loginPass.value;
      if(!email||!pass) return showMsg(loginMsg,'Email and password required',true);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(email)) return showMsg(loginMsg,'Please enter a valid email',true);
      
      if(!firebaseAuth) return showMsg(loginMsg,'Authentication unavailable',true);
      
      showMsg(loginMsg,'Signing in...');
      try{
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, pass);
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
        
        showMsg(loginMsg,'Signed in — redirecting...', true);
        setTimeout(()=>{ window.location.href = '/index.html'; }, 400);
      } catch(err){
        let msg = 'Login failed';
        if(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') 
          msg = 'Invalid email or password';
        else if(err.code === 'auth/invalid-email') msg = 'Invalid email';
        else if(err.code === 'auth/user-disabled') msg = 'Account disabled';
        else if(err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try later';
        showMsg(loginMsg, msg, true);
      }
    });

    // Demo account helper - disabled (Firebase only)
    if(loginDemo) {
      loginDemo.addEventListener('click', ()=>{
        alert('Demo account unavailable. Please sign up for a free account.');
      });
    }

    // Check Firebase auth state on page load
    if(firebaseAuth){
      firebaseAuth.onAuthStateChanged((user)=>{
        if(user){
          // User is signed in, redirect to app
          const state = loadState();
          if(state && state.auth && state.auth.currentUserId){
            window.location.href = '/index.html';
          }
        }
      });
    }

  });
})();
