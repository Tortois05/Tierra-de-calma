// auth.js

const auth = {
  get user() {
    return store.get('user', null);
  },
  login(email) {
    const name = (email.split('@')[0] || 'Usuario').trim();
    const u = { email, name, photo: '' };
    store.set('user', u);
    return u;
  },
  logout() {
    localStorage.removeItem('user');
  }
};

function updateUserUI() {
  const u = auth.user;

  const loginBtn = document.getElementById('loginBtn');
  const userPill = document.getElementById('userPill');
  const userName = document.getElementById('userName');
  const avatar = document.getElementById('userAvatar');

  if (u) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userPill) userPill.style.display = 'flex';
    if (userName) userName.textContent = u.name || 'Usuario';

    // Avatar (foto si existe, sino inicial)
    if (avatar) {
      if (u.photo) {
        avatar.textContent = '';
        avatar.style.backgroundImage = `url('${u.photo}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
      } else {
        avatar.style.backgroundImage = '';
        avatar.textContent = (u.name?.[0] || 'U').toUpperCase();
      }
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userPill) userPill.style.display = 'none';
    if (avatar) {
      avatar.style.backgroundImage = '';
      avatar.textContent = 'U';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('loginModal');
  const openBtn = document.getElementById('loginBtn');
  const closeButtons = document.querySelectorAll('[data-close-login]');

  // Abrir / cerrar modal
  openBtn?.addEventListener('click', () => loginModal?.classList.add('open'));
  closeButtons.forEach(b => b.addEventListener('click', () => loginModal?.classList.remove('open')));

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    auth.logout();
    updateUserUI();
  });

  // Helpers de validación
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function setErr(inputEl, errEl, msg) {
    if (!inputEl || !errEl) return;
    errEl.textContent = msg || '';
    inputEl.classList.toggle('is-invalid', Boolean(msg));
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle('is-loading', loading);
    btn.textContent = loading ? 'Procesando…' : (btn.dataset.label || btn.textContent);
  }

  // Tabs
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');

  function showLogin() {
    tabLogin?.classList.add('is-active');
    tabRegister?.classList.remove('is-active');
    tabLogin?.setAttribute('aria-selected', 'true');
    tabRegister?.setAttribute('aria-selected', 'false');
    loginPanel?.classList.remove('hidden');
    registerPanel?.classList.add('hidden');
  }

  function showRegister() {
    tabRegister?.classList.add('is-active');
    tabLogin?.classList.remove('is-active');
    tabRegister?.setAttribute('aria-selected', 'true');
    tabLogin?.setAttribute('aria-selected', 'false');
    registerPanel?.classList.remove('hidden');
    loginPanel?.classList.add('hidden');
  }

  tabLogin?.addEventListener('click', showLogin);
  tabRegister?.addEventListener('click', showRegister);
  document.getElementById('goRegister')?.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
  document.getElementById('goLogin')?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

  // Show/hide password
  document.getElementById('togglePassLogin')?.addEventListener('click', () => {
    const inp = document.getElementById('password');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('togglePassReg')?.addEventListener('click', () => {
    const inp = document.getElementById('regPass');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Forgot password (demo)
  document.getElementById('forgotPass')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Recuperación de contraseña: se implementa con backend (envío de email).');
  });

  // LOGIN normal
  const btnLogin = document.getElementById('doLogin');
  if (btnLogin) btnLogin.dataset.label = btnLogin.textContent;

  btnLogin?.addEventListener('click', () => {
    const emailEl = document.getElementById('email');
    const passEl = document.getElementById('password');
    const errEmail = document.getElementById('errLoginEmail');
    const errPass = document.getElementById('errLoginPass');

    const email = (emailEl?.value || '').trim();
    const pass = (passEl?.value || '').trim();

    setErr(emailEl, errEmail, '');
    setErr(passEl, errPass, '');

    let ok = true;
    if (!email || !isEmail(email)) { setErr(emailEl, errEmail, 'Ingresá un email válido.'); ok = false; }
    if (!pass || pass.length < 6) { setErr(passEl, errPass, 'Contraseña inválida (mín. 6).'); ok = false; }
    if (!ok) return;

    setLoading(btnLogin, true);

    setTimeout(() => {
      auth.login(email);
      updateUserUI();
      loginModal?.classList.remove('open');
      setLoading(btnLogin, false);
    }, 250);
  });

  // REGISTER normal (demo local)
  const btnReg = document.getElementById('doRegister');
  if (btnReg) btnReg.dataset.label = btnReg.textContent;

  btnReg?.addEventListener('click', () => {
    const nameEl = document.getElementById('regName');
    const emailEl = document.getElementById('regEmail');
    const passEl = document.getElementById('regPass');
    const pass2El = document.getElementById('regPass2');

    const errName = document.getElementById('errRegName');
    const errEmail = document.getElementById('errRegEmail');
    const errPass = document.getElementById('errRegPass');
    const errPass2 = document.getElementById('errRegPass2');

    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const pass = (passEl?.value || '').trim();
    const pass2 = (pass2El?.value || '').trim();

    setErr(nameEl, errName, '');
    setErr(emailEl, errEmail, '');
    setErr(passEl, errPass, '');
    setErr(pass2El, errPass2, '');

    let ok = true;
    if (!name || name.length < 2) { setErr(nameEl, errName, 'Ingresá tu nombre.'); ok = false; }
    if (!email || !isEmail(email)) { setErr(emailEl, errEmail, 'Ingresá un email válido.'); ok = false; }
    if (!pass || pass.length < 6) { setErr(passEl, errPass, 'Mínimo 6 caracteres.'); ok = false; }
    if (pass2 !== pass) { setErr(pass2El, errPass2, 'Las contraseñas no coinciden.'); ok = false; }
    if (!ok) return;

    setLoading(btnReg, true);

    setTimeout(() => {
      store.set('user', { name, email, photo: '' });
      updateUserUI();
      loginModal?.classList.remove('open');
      showLogin();
      setLoading(btnReg, false);
    }, 250);
  });

  // ===== Google Sign-In REAL (GIS) =====
  // IMPORTANTE: pegá tu Client ID acá
  const GOOGLE_CLIENT_ID = "729104131389-47fvko17gj0cu4keh08q78mjn7v10mba.apps.googleusercontent.com";

  function decodeJwtPayload(credential) {
    const payload = credential.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  }

  window.handleGoogleCredentialResponse = (response) => {
  try {
    showLoader('Iniciando sesión…');

    const data = decodeJwtPayload(response.credential);

    const user = {
      name: data.name || data.given_name || 'Usuario',
      email: data.email || '',
      photo: data.picture || ''
    };

    store.set('user', user);
    updateUserUI();

    document.getElementById('loginModal')?.classList.remove('open');

    // un toque de delay para que se sienta suave (opcional)
    setTimeout(hideLoader, 250);
  } catch (e) {
    hideLoader();
    console.error(e);
    alert('No se pudo iniciar sesión con Google.');
  }
};


  const googleBtn = document.getElementById('googleLogin');

  // Esperamos a que cargue el script de Google (gsi/client)
  function initGoogle() {
    if (!googleBtn) return;
    if (!window.google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.handleGoogleCredentialResponse
    });

    // Tu botón humanizado: abre el prompt de selección
    googleBtn.addEventListener('click', () => {
      google.accounts.id.prompt();
    });
  }

  // Intentar inicializar ahora y también en breve (por carga async)
  initGoogle();
  setTimeout(initGoogle, 800);

  // Init UI
  updateUserUI();
});
