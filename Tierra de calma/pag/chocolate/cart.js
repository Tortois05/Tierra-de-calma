// cart.js

const cart = {
  get items() { return store.get('cart', []); },
  set items(v) { store.set('cart', v); },

  add(id, qty = 1) {
    const it = [...this.items];
    const idx = it.findIndex(x => x.id === id);
    if (idx > -1) it[idx].qty += qty;
    else it.push({ id, qty });
    this.items = it;
    uiCart();
  },

  update(id, qty) {
    const it = this.items.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x);
    this.items = it;
    uiCart();
  },

  remove(id) {
    this.items = this.items.filter(x => x.id !== id);
    uiCart();
  },

  clear() {
    this.items = [];
    uiCart();
  },

  total() {
    const products = window.PRODUCTS || [];
    return this.items.reduce((acc, it) => {
      const p = products.find(p => p.id === it.id);
      return acc + (p?.price || 0) * it.qty;
    }, 0);
  }
};

function openDrawer() { $('#drawer').classList.add('open'); }
function closeDrawer() { $('#drawer').classList.remove('open'); }

function addToCart(id, qty = 1) {
  cart.add(id, qty);
  openDrawer();
}

function uiCart() {
  const products = window.PRODUCTS || [];
  const c = cart.items;

  $('#cartCount').textContent = c.reduce((a, b) => a + b.qty, 0);
  $('#cartTotal').textContent = fmt(cart.total());

  const list = $('#cartItems');
  list.innerHTML = '';

  c.forEach(it => {
    const p = products.find(x => x.id === it.id);

    // Si PRODUCTS todavía no está listo, mostramos fallback (para que NO quede vacío)
    if (!p) {
      const li = document.createElement('div');
      li.className = 'cart-item';
      li.innerHTML = `
        <div style="grid-column:1/4">
          <div class="name">${it.id}</div>
          <div class="meta">Cargando datos del producto…</div>
        </div>
      `;
      list.appendChild(li);
      return;
    }

    const li = document.createElement('div');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">
          ${fmt(p.price)} x
          <input type="number" min="1" value="${it.qty}"
            style="width:56px;background:transparent;border:1px solid #333;border-radius:6px;color:#fff;padding:4px 6px">
          = <strong>${fmt(p.price * it.qty)}</strong>
        </div>
      </div>
      <div class="right">
        <button class="danger" data-remove type="button">Quitar</button>
      </div>
    `;
    list.appendChild(li);

    const qtyInput = li.querySelector('input');
    qtyInput.onchange = () => cart.update(it.id, +qtyInput.value || 1);

    li.querySelector('[data-remove]').onclick = () => cart.remove(it.id);
  });

  const summary = $('#chkSummary');
  if (summary) summary.textContent = `Total a pagar: ${fmt(cart.total())}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // drawer
  $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
  $('#cartBtn')?.addEventListener('click', openDrawer);

  // checkout
  $('#checkoutBtn')?.addEventListener('click', () => {
    if (!cart.items.length) return alert('Tu carrito está vacío.');
    if (!auth.user) return $('#loginModal').classList.add('open');

    closeDrawer();
    $('#chkSummary').textContent = `Total a pagar: ${fmt(cart.total())}`;
    $('#checkoutModal').classList.add('open');
  });

  $$('[data-close-checkout]').forEach(el =>
    el.addEventListener('click', () => $('#checkoutModal').classList.remove('open'))
  );

  // pagar (Checkout Pro)
  document.getElementById('payNow')?.addEventListener('click', async () => {
    const name = document.getElementById('chkName')?.value.trim();
    const mail = document.getElementById('chkMail')?.value.trim();
    if (!name || !mail) return alert('Completá nombre y correo');

    const products = window.PRODUCTS || [];
    const cartItems = store.get('cart', []) || [];

    const items = cartItems.map(ci => {
      const p = products.find(x => x.id === ci.id);
      return {
        title: p?.name || ci.id,
        quantity: Number(ci.qty || 1),
        unit_price: Number(p?.price || 0)
      };
    });

    if (!items.length) return alert('Tu carrito está vacío.');

    const BACKEND = "https://tierra-de-calma-backend.onrender.com";

    try {
      if (typeof showLoader === 'function') showLoader('Redirigiendo al pago…');

      const r = await fetch(`${BACKEND}/create_preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      const data = await r.json();

      if (!r.ok || !data.init_point) {
        console.error(data);
        alert('No se pudo iniciar el pago. Probá de nuevo.');
        if (typeof hideLoader === 'function') hideLoader();
        return;
      }

      window.location.href = data.init_point;

    } catch (e) {
      console.error(e);
      alert('Error de conexión con el servidor de pagos.');
      if (typeof hideLoader === 'function') hideLoader();
    }
  });

  uiCart();
});

// ✅ exponer global para app.js
window.cart = cart;
window.addToCart = addToCart;
window.uiCart = uiCart;

window.addEventListener('pageshow', () => {
  if (typeof hideLoader === 'function') hideLoader();
});
