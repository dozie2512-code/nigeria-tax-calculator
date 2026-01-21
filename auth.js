// Client-side auth for prototype: SHA-256 hashing, localStorage users, token in localStorage
(function(){
  const USERS_KEY = 'ntc_auth_users_v1';
  const TOKEN_KEY = 'ntc_auth_token_v1';
  const TOKEN_TTL_MS = 7*24*60*60*1000; // 7 days

  function uid(prefix='id'){return prefix+'_'+Math.random().toString(36).slice(2,10)}

  async function sha256Hex(str){
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function loadUsers(){
    try{const raw = localStorage.getItem(USERS_KEY);return raw?JSON.parse(raw):[];}catch(e){return []}
  }
  function saveUsers(u){localStorage.setItem(USERS_KEY,JSON.stringify(u));}

  function setTokenFor(userId){
    const tokenObj = {id: uid('tok'), userId, issued: Date.now()};
    localStorage.setItem(TOKEN_KEY, btoa(JSON.stringify(tokenObj)));
  }

  function getUserByLogin(login){
    const users = loadUsers();
    return users.find(u => u.username === login || u.username === login.toLowerCase());
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
      if(!name||!username||!email||!pass) return showMsg(signupMsg,'Please fill all fields','error');
      if(pass !== pass2) return showMsg(signupMsg,'Passwords do not match');
      // email uniqueness
      const users = loadUsers();
      if(users.find(u=>u.email===email)) return showMsg(signupMsg,'Email already used');
      if(users.find(u=>u.username===username)) return showMsg(signupMsg,'Username already used');
      const passHash = await sha256Hex(pass);
      const newUser = { id: uid('usr'), name, username, email, passHash, created: Date.now() };
      users.push(newUser); saveUsers(users);
      setTokenFor(newUser.id);
      showMsg(signupMsg,'Account created — redirecting...', true);
      setTimeout(()=>{ window.location.href = '/index.html'; }, 700);
    });

    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault(); loginMsg.textContent='';
      const login = loginUser.value.trim(); const pass = loginPass.value;
      if(!login||!pass) return showMsg(loginMsg,'Provide username and password');
      const user = getUserByLogin(login);
      if(!user) return showMsg(loginMsg,'No matching user');
      const passHash = await sha256Hex(pass);
      if(passHash !== user.passHash) return showMsg(loginMsg,'Invalid credentials');
      setTokenFor(user.id);
      showMsg(loginMsg,'Signed in — redirecting...', true);
      setTimeout(()=>{ window.location.href = '/index.html'; }, 400);
    });

    // Demo account helper
    loginDemo.addEventListener('click', async ()=>{
      const users = loadUsers();
      let demo = users.find(u=>u.username==='demo');
      if(!demo){
        const passHash = await sha256Hex('demo123');
        demo = { id: uid('usr'), name:'Demo User', username:'demo', email:'demo@example.com', passHash, created: Date.now() };
        users.push(demo); saveUsers(users);
      }
      setTokenFor(demo.id);
      window.location.href = '/index.html';
    });

    // If already authenticated, redirect
    try{
      const tok = localStorage.getItem(TOKEN_KEY);
      if(tok){ const obj = JSON.parse(atob(tok)); if(obj && obj.issued && (Date.now() - obj.issued) < TOKEN_TTL_MS){ window.location.href = '/index.html'; }}
    }catch(e){}

  });
})();
