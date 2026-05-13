/* =========================
   CONFIG
========================= */
const PRODUCT_PRICE_ARS = 4000;
const BACKEND_URL = "https://tierra-de-calma-backend.onrender.com";
const CREATE_PREF_ENDPOINT = `${BACKEND_URL}/create_preference`;

// MP Brick
const MP_PUBLIC_KEY = "APP_USR-ce13d625-73b7-40b4-bc6e-0784aef4bbad";
let mp = null;
let bricksBuilder = null;
let walletController = null;

function ensureMercadoPagoReady() {
  if (mp && bricksBuilder) return;
  if (!window.MercadoPago) {
    throw new Error("Falta el SDK MP: <script src='https://sdk.mercadopago.com/js/v2'></script>");
  }
  mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "es-AR" });
  bricksBuilder = mp.bricks();
}

async function createPreferenceSingleItem({ title, unit_price, payerEmail }) {
  const res = await fetch(CREATE_PREF_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  items,
  payerEmail: mail,

  customer: {
    name,
    email: mail,
    document: document.getElementById('chkDni')?.value.trim() || "",
    address: document.getElementById('chkAddr')?.value.trim() || "",
    phone: document.getElementById('chkPhone')?.value.trim() || ""
  },

  note: document.getElementById('chkNote')?.value.trim() || ""
})

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Backend error: ${res.status} ${t}`);
  }

  const data = await res.json();
  if (!data?.preferenceId) throw new Error("Backend no devolvió preferenceId");
  return data.preferenceId;
}

async function renderWalletBrick(preferenceId) {
  ensureMercadoPagoReady();

  const container = document.getElementById("mp_wallet_container");
  if (!container) throw new Error("Falta <div id='mp_wallet_container'></div> dentro del buyModal.");

  // limpiar anterior
  try {
    if (walletController?.unmount) await walletController.unmount();
  } catch (_) {}
  container.innerHTML = "";

  walletController = await bricksBuilder.create("wallet", "mp_wallet_container", {
    initialization: { preferenceId },
    customization: { texts: { valueProp: "smart_option" } },
  });
}

async function unmountWalletBrick() {
  try {
    if (walletController?.unmount) await walletController.unmount();
  } catch (_) {}
  walletController = null;

  const container = document.getElementById("mp_wallet_container");
  if (container) container.innerHTML = "";
}

/* =========================
   ELEMENTOS
========================= */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const header = document.querySelector(".header");
const year = document.getElementById("year");

// Modal detalles
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const modalBuy = document.getElementById("modalBuy");

// Modal login
const loginModal = document.getElementById("loginModal");
const openLoginFromMenu = document.getElementById("openLoginFromMenu");
const closeLogin = document.getElementById("closeLogin");
const loginCancel = document.getElementById("loginCancel");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const registerBtn = document.getElementById("registerBtn");

// Modal compra
const buyModal = document.getElementById("buyModal");
const buyBody = document.getElementById("buyBody");
const closeBuy = document.getElementById("closeBuy");

// Dropdown usuario
const userSessionBtn = document.getElementById("userSessionBtn");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");

if (year) year.textContent = new Date().getFullYear();

/* =========================
   MENÚ
========================= */
menuBtn?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("menu--open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

menu?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    menu.classList.remove("menu--open");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

/* =========================
   LOGIN (demo)
========================= */
function isLoggedIn() {
  return localStorage.getItem("tea_logged_in") === "1";
}

function setLoggedIn(email, name = "") {
  localStorage.setItem("tea_logged_in", "1");
  if (email) localStorage.setItem("tea_user_email", email);
  if (name) localStorage.setItem("tea_user_name", name);
}

function clearSession() {
  localStorage.removeItem("tea_logged_in");
  localStorage.removeItem("tea_user_email");
  localStorage.removeItem("tea_user_name");
  localStorage.removeItem("tea_user_photo");
}

function openLoginModal() {
  loginModal.classList.add("modal--open");
  loginModal.setAttribute("aria-hidden", "false");
  setTimeout(() => loginEmail?.focus(), 50);
}

function closeLoginModal() {
  loginModal.classList.remove("modal--open");
  loginModal.setAttribute("aria-hidden", "true");
  loginModal.removeAttribute("data-pending-tea");
}

openLoginFromMenu?.addEventListener("click", () => {
  menu?.classList.remove("menu--open");
  menuBtn?.setAttribute("aria-expanded", "false");
  openLoginModal();
});

closeLogin?.addEventListener("click", closeLoginModal);
loginCancel?.addEventListener("click", closeLoginModal);

/* =========================
   TEAS
========================= */
const TEAS = {
  "terere-tropical": { title:"Tereré Tropical", body:`<p><strong>Perfil:</strong> Frutal, aromático y veraniego.</p>` },
  "terere-despeja": { title:"Despeja Todo", body:`<p><strong>Perfil:</strong> Fresco con fondo especiado.</p>` },
  "terere-citrico": { title:"Refrescante Cítrico", body:`<p><strong>Perfil:</strong> Muy fresco y cítrico.</p>` },

  "te-floral-especial": { title:"Floral Especial", body:`<p><strong>Perfil:</strong> Floral y suavemente dulce.</p>` },
  "te-detox-hebral": { title:"Detox Hebral", body:`<p><strong>Perfil:</strong> Depurativo y equilibrado.</p>` },
  "te-digestivo-suave": { title:"Digestivo Suave", body:`<p><strong>Perfil:</strong> Delicado y reconfortante.</p>` },
  "te-diuretico-natural": { title:"Diurético Natural", body:`<p><strong>Perfil:</strong> Liviano y purificante.</p>` },
  "te-floral-dulce": { title:"Floral Dulce", body:`<p><strong>Perfil:</strong> Floral y suave.</p>` },
  "te-calor-corporal": { title:"Calor Corporal", body:`<p><strong>Perfil:</strong> Cálido e intenso.</p>` },
  "te-relajante-suave": { title:"Relajante Suave", body:`<p><strong>Perfil:</strong> Relajante y ligero.</p>` },
  "te-relajante-profundo": { title:"Relajante Profundo", body:`<p><strong>Perfil:</strong> Muy calmante.</p>` },
  "te-anti-resfrio": { title:"Anti Resfrío", body:`<p><strong>Perfil:</strong> Reconfortante.</p>` },

  "mate-detox": { title:"Mate Detox", body:`<p><strong>Perfil:</strong> Liviano y herbal.</p>` },
  "mate-digestivo": { title:"Mate Digestivo", body:`<p><strong>Perfil:</strong> Suave y herbal.</p>` },
  "mate-energia": { title:"Mate Energía Natural", body:`<p><strong>Perfil:</strong> Estimulante.</p>` },
  "mate-anti-frio": { title:"Mate Anti Frío", body:`<p><strong>Perfil:</strong> Cálido.</p>` },
};

/* =========================
   MODAL VER MÁS
========================= */
function openModal(teaKey){
  const data = TEAS[teaKey];
  if(!data) return;
  document.getElementById("modalTitle").textContent = data.title;
  modalBody.innerHTML = data.body;
  modal.dataset.tea = teaKey;

  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function hideModal(){
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("data-tea");
}

closeModal?.addEventListener("click", hideModal);
modal?.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") hideModal();
});

/* =========================
   MODAL COMPRA + BRICK
========================= */
async function openBuyModal(teaKey){
  const item = TEAS[teaKey];
  if (!item) return;

  buyBody.innerHTML = `
    <p class="muted">Producto seleccionado</p>
    <h3 style="margin:6px 0 12px;">${item.title}</h3>
    <div class="priceBox">
      <span class="muted">Precio</span>
      <strong style="font-size:22px;">$ ${PRODUCT_PRICE_ARS.toLocaleString("es-AR")}</strong>
    </div>
    <p class="muted small" style="margin-top:10px;">Pagás de forma segura con Mercado Pago.</p>
  `;

  buyModal.dataset.tea = teaKey;
  buyModal.classList.add("modal--open");
  buyModal.setAttribute("aria-hidden", "false");

  const payerEmail = localStorage.getItem("tea_user_email") || "";

  try {
    const preferenceId = await createPreferenceSingleItem({
      title: item.title,
      unit_price: PRODUCT_PRICE_ARS,
      payerEmail,
    });
    await renderWalletBrick(preferenceId);
  } catch (err) {
    console.error(err);
    const c = document.getElementById("mp_wallet_container");
    if (c) c.innerHTML = "<p class='muted'>No se pudo cargar Mercado Pago. Probá de nuevo.</p>";
  }
}

async function closeBuyModal(){
  buyModal.classList.remove("modal--open");
  buyModal.setAttribute("aria-hidden", "true");
  buyModal.removeAttribute("data-tea");
  await unmountWalletBrick();
}

closeBuy?.addEventListener("click", () => closeBuyModal());
buyModal?.addEventListener("click", (e) => {
  if (e.target?.dataset?.buyClose === "true") closeBuyModal();
});

/* =========================
   HEADER USER
========================= */
function getUserNameFromEmail(email){
  if(!email) return "";
  return email.split("@")[0];
}

function updateUserHeader(){
  const wrap = document.getElementById("userWrap");
  const nameEl = document.getElementById("userName");
  const avatarEl = document.getElementById("userAvatar");
  const menuEl = document.getElementById("userMenu");
  const btn = document.getElementById("userSessionBtn");

  if (!wrap || !nameEl || !menuEl || !btn) return;

  if (isLoggedIn()) {
    const name =
      localStorage.getItem("tea_user_name") ||
      getUserNameFromEmail(localStorage.getItem("tea_user_email") || "") ||
      "Usuario";

    const photo = localStorage.getItem("tea_user_photo");

    nameEl.textContent = `Hola, ${name}`;
    wrap.hidden = false;

    if (avatarEl && photo) {
      avatarEl.src = photo;
      avatarEl.hidden = false;
    } else if (avatarEl) {
      avatarEl.hidden = true;
    }
  } else {
    menuEl.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    wrap.hidden = true;
    nameEl.textContent = "";
    if (avatarEl) avatarEl.hidden = true;
  }
}

/* =========================
   LOGIN normal + registro
========================= */
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  if (!email) return alert("Ingresá un email");

  setLoggedIn(email);

  const pendingTea = loginModal.getAttribute("data-pending-tea");
  closeLoginModal();
  updateUserHeader();

  if (pendingTea) openBuyModal(pendingTea);
  else alert("✅ Sesión iniciada");
});

registerBtn?.addEventListener("click", () => {
  const email = loginEmail.value.trim();
  if (!email) return alert("Ingresá un email para registrarte");

  setLoggedIn(email);

  const pendingTea = loginModal.getAttribute("data-pending-tea");
  closeLoginModal();
  updateUserHeader();

  if (pendingTea) openBuyModal(pendingTea);
  else alert("✅ Registro exitoso");
});

/* =========================
   GOOGLE REAL (GIS callback)
========================= */
window.handleCredentialResponse = (response) => {
  try {
    const jwt = response.credential;
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

    const email = payload?.email || "";
    const name = payload?.given_name || payload?.name || "";
    const photo = payload?.picture || "";

    if (!email) return alert("No se pudo obtener el email de Google.");

    setLoggedIn(email, name);
    localStorage.setItem("tea_user_photo", photo);

    const pendingTea = loginModal.getAttribute("data-pending-tea");
    closeLoginModal();
    updateUserHeader();

    if (pendingTea) openBuyModal(pendingTea);
  } catch (e) {
    console.error(e);
    alert("No se pudo iniciar sesión con Google.");
  }
};

/* =========================
   DROPDOWN usuario
========================= */
function closeUserMenu(){
  if (!userMenu || !userSessionBtn) return;
  userMenu.hidden = true;
  userSessionBtn.setAttribute("aria-expanded", "false");
}

userSessionBtn?.addEventListener("click", () => {
  if (!userMenu) return;
  const isOpen = !userMenu.hidden;
  userMenu.hidden = isOpen;
  userSessionBtn.setAttribute("aria-expanded", String(!isOpen));
});

logoutBtn?.addEventListener("click", () => {
  clearSession();
  closeUserMenu();
  updateUserHeader();
  alert("Sesión cerrada ✅");
});

document.addEventListener("click", (e) => {
  const wrap = document.getElementById("userWrap");
  if (!wrap || !userMenu) return;
  if (!wrap.contains(e.target)) closeUserMenu();
});

/* =========================
   BOTONES Buy/Details
========================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const card = btn.closest(".teaCard");
  if (!card) return;

  const teaKey = card.dataset.tea;
  if (!teaKey) return;

  if (btn.classList.contains("details")) openModal(teaKey);

  if (btn.classList.contains("buyNow")) {
    if (!isLoggedIn()) {
      loginModal.setAttribute("data-pending-tea", teaKey);
      openLoginModal();
      return;
    }
    openBuyModal(teaKey);
  }
});

modalBuy?.addEventListener("click", () => {
  const teaKey = modal?.dataset?.tea;
  if (!teaKey) return;

  if (!isLoggedIn()) {
    loginModal.setAttribute("data-pending-tea", teaKey);
    openLoginModal();
    return;
  }
  openBuyModal(teaKey);
});

/* =========================
   Header hide on scroll
========================= */
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (!header) return;

  const current = window.scrollY;

  if (current <= 0) {
    header.classList.remove("header--hidden");
  } else if (current > lastScrollY + 5) {
    header.classList.add("header--hidden");
    menu?.classList.remove("menu--open");
    menuBtn?.setAttribute("aria-expanded", "false");
    closeUserMenu();
  } else if (current < lastScrollY - 5) {
    header.classList.remove("header--hidden");
  }

  lastScrollY = current;
}, { passive: true });

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  updateUserHeader();
});
