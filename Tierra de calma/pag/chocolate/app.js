// app.js

// ===== HERO =====
const HERO_SLIDES = [
  { id:"quienes-somos", title:"¿Quiénes somos?", text:"Tierra de Calma nace del deseo de transformar lo cotidiano en un ritual de bienestar.", longText:"Somos un emprendimiento artesanal dedicado a crear experiencias que invitan a detenerse, respirar y disfrutar los pequeños placeres de la vida: una taza de té, un chocolate, un momento de calma.", image:"img/Quienes somos.jpeg" },
  { id:"bombones", title:"Bombones surtidos", text:"Nuestros bombones son pequeñas joyas de chocolate artesanal, creadas para despertar los sentidos.", image:"img/Bombones - portada.jpeg" },
  { id:"tabletas", title:"Tabletas (Macizas y Rellenas)", text:"Ideales para quienes buscan reconectar con los sabores genuinos y disfrutar de un instante de calma.", image:"img/Tabletas - portada.jpeg" },
  { id:"almendras", title:"Almendras", text:"Un equilibrio ideal entre energía y dulzura para disfrutar en cualquier momento del día.", image:"img/Almendras2 - portada.jpeg" },
  { id:"nueces", title:"Nueces", text:"Bocaditos de nueces con dulce de leche y chocolate suave.", image:"img/Nueces - portada.jpeg" },
  { id:"cocoas", title:"Cocoas", text:"Esferas de chocolate que se derriten en leche caliente. Experiencia mágica.", image:"img/Cocoas - portada.jpeg" },
  { id:"crunchy", title:"Crunchy snacks", text:"Cereales crocantes cubiertos con chocolate artesanal.", image:"img/Crunchy snacks - portada.jpeg" },
  { id:"surtidas", title:"Surtidas", text:"Cajas surtidas para regalar (o regalarte).", image:"img/Surtidas - portada.jpeg" }
];

let heroIndex = 0;
let heroTimer = null;

function buildHeroOnce(){
  const hero = document.getElementById('hero');
  hero.innerHTML = `
    <div class="hero-track" id="heroTrack"></div>
    <div class="hero-controls" id="heroDots"></div>
  `;

  const track = document.getElementById('heroTrack');

  HERO_SLIDES.forEach((s) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    slide.style.backgroundImage = `url('${s.image}')`;

    if (s.id === 'quienes-somos') slide.classList.add('hero-about');

    slide.innerHTML = `
      <div class="overlay"></div>
      <div class="hero-content hero-hover">
        <span class="chip">Tierra de Calma</span>
        <h2>${s.title || ''}</h2>
        <p class="hero-text">${s.text || ''}</p>
        <div class="cta">
          <button class="btn primary" data-hero-link="${s.id}" type="button">Ver detalles</button>
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  const dots = document.getElementById('heroDots');
  HERO_SLIDES.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === heroIndex ? ' active' : '');
    d.addEventListener('click', () => {
      heroIndex = i;
      updateHeroView();
      resetHeroTimer();
    });
    dots.appendChild(d);
  });

  hero.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-hero-link]');
    if(!btn) return;

    const id = btn.dataset.heroLink;

    if(id === 'quienes-somos'){
      openAboutModal(HERO_SLIDES.find(x => x.id === 'quienes-somos'));
      return;
    }

    // para el resto, baja al catálogo (prolijo)
    document.getElementById('catalogo-secciones')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });

  hero.addEventListener('mouseenter', () => clearInterval(heroTimer));
  hero.addEventListener('mouseleave', () => resetHeroTimer());

  updateHeroView();
}

function updateHeroView(){
  const track = document.getElementById('heroTrack');
  if(track) track.style.transform = `translateX(-${heroIndex * 100}%)`;

  document.querySelectorAll('#heroDots .dot')
    .forEach((d,i)=> d.classList.toggle('active', i === heroIndex));
}

function nextHero(){
  heroIndex = (heroIndex + 1) % HERO_SLIDES.length;
  updateHeroView();
}

function resetHeroTimer(){
  clearInterval(heroTimer);
  heroTimer = setInterval(nextHero, 5000);
}

// Swipe móvil
function enableHeroSwipe(){
  const hero = document.getElementById('hero');
  const track = document.getElementById('heroTrack');
  if(!hero || !track) return;

  let startX=0, startY=0, deltaX=0, dragging=false, locked=false;
  const TH = 45;

  function onStart(x,y){
    startX=x; startY=y; deltaX=0; dragging=true; locked=false;
    clearInterval(heroTimer);
    track.style.transition = 'none';
  }
  function onMove(x,y){
    if(!dragging) return;
    deltaX = x - startX;
    const dy = y - startY;

    if(!locked){
      if(Math.abs(deltaX)>10 && Math.abs(deltaX)>Math.abs(dy)) locked=true;
      else if(Math.abs(dy)>10 && Math.abs(dy)>Math.abs(deltaX)){
        dragging=false;
        track.style.transition='';
        resetHeroTimer();
        return;
      }
    }
    if(locked){
      track.style.transform = `translateX(calc(-${heroIndex*100}% + ${deltaX}px))`;
    }
  }
  function onEnd(){
    if(!dragging){ resetHeroTimer(); return; }
    dragging=false;
    track.style.transition = 'transform .5s ease-in-out';

    if(Math.abs(deltaX) >= TH){
      if(deltaX < 0) heroIndex = Math.min(heroIndex+1, HERO_SLIDES.length-1);
      else heroIndex = Math.max(heroIndex-1, 0);
    }
    updateHeroView();
    resetHeroTimer();
  }

  hero.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; onStart(t.clientX,t.clientY); }, {passive:true});
  hero.addEventListener('touchmove',  (e)=>{ const t=e.touches[0]; onMove(t.clientX,t.clientY); }, {passive:true});
  hero.addEventListener('touchend', onEnd);
}

// ===== ABOUT MODAL =====
function openAboutModal(data){
  const modal = document.getElementById('aboutModal');
  if(!modal) return;

  document.getElementById('aboutTitle').textContent = data?.title || 'Quiénes somos';
  document.getElementById('aboutBody').textContent = data?.longText || 'Contenido pendiente.';
  modal.classList.add('open');
}

function closeAboutModal(){
  document.getElementById('aboutModal')?.classList.remove('open');
}

// ===== PRODUCTS (IMPORTANTE: IDs ÚNICOS) =====
const PRODUCTS = [
  // TABLETAS
  {id:"tableta-dulce-de-leche", name:"Tableta rellena (DULCE DE LECHE)", price:8000, tag:"Dulce de leche", img:"img/Dulce de leche - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-oreo", name:"Tableta rellena (OREO)", price:8000, tag:"Oreo", img:"img/Oreo - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-naranja", name:"Tableta rellena (NARANJA)", price:8000, tag:"Naranja", img:"img/Naranja (Rellena) - tarjeta.jpeg", category:"Tabletas"},
  {id:"tableta-frutilla", name:"Tableta rellena (FRUTILLA)", price:8000, tag:"Frutilla", img:"img/Frutilla - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-banana-split", name:"Tableta rellena (BANANA SPLIT)", price:8000, tag:"Banana split", img:"img/Banana split - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-cognac", name:"Tableta rellena (COGNAC)", price:8000, tag:"Cognac", img:"img/Cognac - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-limon", name:"Tableta rellena (LIMÓN)", price:8000, tag:"Limón", img:"img/Limon - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-coco", name:"Tableta rellena (COCO)", price:8000, tag:"Coco", img:"img/Coco - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-irlandesa", name:"Tableta rellena (IRLANDESA)", price:8000, tag:"Irlandesa", img:"img/Irlandesa - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-maciza-chocolate", name:"Tableta maciza (CHOCOLATE)", price:7000, tag:"Chocolate", img:"img/Chocolate - Macizo.jpeg", category:"Tabletas"},
  {id:"tableta-maciza-oreo", name:"Tableta maciza (OREO)", price:7000, tag:"Oreo", img:"img/Oreo (maciza) - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-maciza-almendras", name:"Tableta maciza (ALMENDRAS)", price:7000, tag:"Almendras", img:"img/Almendras maciza - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-maciza-nueces", name:"Tableta maciza (NUECES)", price:7000, tag:"Nueces", img:"img/Nueces maciza - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-maciza-rocklets", name:"Tableta maciza (ROCKLETS)", price:7000, tag:"Rocklets", img:"img/Rocklets - tarjetas.jpeg", category:"Tabletas"},
  {id:"tableta-maciza-frutas-desecadas", name:"Tableta maciza (FRUTAS DESECADAS)", price:7000, tag:"Frutas desecadas", img:"img/Frutas desecadas - tarjetas.jpeg", category:"Tabletas"},

  // BOMBONES (IDs únicos)
  {id:"bombones-x4", name:"Bombones x4", price:12000, tag:"Surtidos", img:"img/Caja de bombones 4 unidad - tarjetas.jpeg", category:"Bombones"},
  {id:"bombones-x6", name:"Bombones x6", price:17000, tag:"Surtidos", img:"img/Caja de bombones 6 unidades - tarjetas.jpeg", category:"Bombones"},
  {id:"bombones-250gr", name:"Bombones 250gr", price:33000, tag:"Por peso", img:"img/Caja de bombones 250gr - tarjeta.jpeg", category:"Bombones"},
  {id:"bombones-500gr", name:"Bombones 500gr", price:50000, tag:"Por peso", img:"img/Caja de bombones 500gr - tarjeta.jpeg", category:"Bombones"},
  {id:"caja-surtida-250gr", name:"Caja surtida 250gr", price:33000, tag:"Por peso", img:"img/Caja surtida de 250gr - tarjetas.jpeg", category:"Bombones"},
  {id:"caja-surtida-500gr", name:"Caja surtida 500gr", price:50000, tag:"Por peso", img:"img/Caja de bombones 500gr 2 - tarjetas.jpeg", category:"Bombones"},

  // CEREALES & CRUNCHY (IDs únicos)
  {id:"almendras-100gr", name:"Almendras (100gr)", price:8138, tag:"Almendras en Chocolate", img:"img/Almendras - tarjetas.jpeg", category:"Cereales & Crunchy Snacks"},
  {id:"crunchy-snacks-100gr", name:"Crunchy Snacks (100gr)", price:3157, tag:"Crunchy", img:"img/Crunchy snacks - tarjetas.jpeg", category:"Cereales & Crunchy Snacks"},
  {id:"nueces-caja-5u", name:"Nueces (caja 5 unidades)", price:5000, tag:"Nueces en Chocolate", img:"img/Nueces - tarjetas.jpeg", category:"Cereales & Crunchy Snacks"},
  {id:"pasas-100gr", name:"Pasas (100gr)", price:4000, tag:"Pasas en Chocolate", img:"img/Pasas.jpeg", category:"Cereales & Crunchy Snacks"},

  // COCOA (IDs únicos)
  {id:"cocoa-grande", name:"Cocoa bomb (grande)", price:3800, tag:"Bombas rellenas", img:"img/Cocoa - tarjetas.jpeg", category:"Cocoa"},
  {id:"cocoa-chica", name:"Cocoa bomb (chica)", price:2900, tag:"Bombas rellenas", img:"img/Cocoas 2 - tarjetas.jpeg", category:"Cocoa"}
];

// ⭐ CLAVE: exportar para cart.js
window.PRODUCTS = PRODUCTS;

function renderCatalogByCategory(){
  const cont = document.getElementById('catalogo-secciones');
  if(!cont) return;
  cont.innerHTML = '';

  const grouped = PRODUCTS.reduce((acc, p) => {
    const cat = p.category || 'Otros';
    (acc[cat] ||= []).push(p);
    return acc;
  }, {});

  const CATEGORY_ORDER = [
    'Bombones',
    'Tabletas',
    'Cereales & Crunchy Snacks',
    'Cocoa',
    'Otros'
  ];

  const cats = Object.keys(grouped).sort((a,b)=>{
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  cats.forEach(cat=>{
    const section = document.createElement('section');
    section.className = 'cat-section';

    section.innerHTML = `
      <div class="cat-head">
        <h4 class="cat-title">${cat}</h4>
        <div class="cat-nav">
          <button class="cat-arrow" type="button" data-left aria-label="Anterior">‹</button>
          <button class="cat-arrow" type="button" data-right aria-label="Siguiente">›</button>
        </div>
      </div>
      <div class="cat-row">
        <div class="cat-scroll" data-scroll></div>
      </div>
    `;

    const scroller = section.querySelector('[data-scroll]');

    grouped[cat].forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.id = 'prod-' + p.id;

      card.innerHTML = `
        <div class="thumb">
          <img loading="lazy" src="${p.img}" alt="${p.name}">
          ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
        </div>
        <div class="body">
          <div class="title">${p.name}</div>
          <div class="row">
            <span class="muted">${p.tag || ''}</span>
            <span class="price">${fmt(p.price)}</span>
          </div>
          <div class="row">
            <div class="qty">
              <button data-minus type="button">-</button>
              <input type="number" value="1" min="1"/>
              <button data-plus type="button">+</button>
            </div>
            <button class="add" data-add type="button">Agregar</button>
          </div>
        </div>
      `;

      scroller.appendChild(card);

      const input = card.querySelector('input');
      card.querySelector('[data-minus]').onclick = ()=> input.value = Math.max(1, (+input.value||1)-1);
      card.querySelector('[data-plus]').onclick  = ()=> input.value = (+input.value||1)+1;
      card.querySelector('[data-add]').onclick   = ()=> window.addToCart(p.id, +input.value || 1);
    });

    // flechas
    const btnL = section.querySelector('[data-left]');
    const btnR = section.querySelector('[data-right]');
    btnL.classList.add('disabled');

    function updateArrows(){
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      btnL.classList.toggle('disabled', scroller.scrollLeft <= 1);
      btnR.classList.toggle('disabled', scroller.scrollLeft >= maxScroll - 5);
    }

    function getStep(){
      const card = scroller.querySelector('.card');
      if(!card) return scroller.clientWidth;
      const gap = 14;
      const visibleCards = 5;
      return (card.offsetWidth * visibleCards) + (gap * (visibleCards - 1));
    }

    btnL.addEventListener('click', ()=> scroller.scrollBy({ left: -getStep(), behavior:'smooth' }));
    btnR.addEventListener('click', ()=> scroller.scrollBy({ left:  getStep(), behavior:'smooth' }));
    scroller.addEventListener('scroll', updateArrows);
    requestAnimationFrame(updateArrows);

    cont.appendChild(section);
  });

  // ✅ clave: refrescar carrito cuando ya existen PRODUCTS (arregla tu bug)
  window.uiCart?.();
}

// ===== INIT ÚNICO =====
document.addEventListener("DOMContentLoaded", () => {
  buildHeroOnce();
  enableHeroSwipe();
  resetHeroTimer();
  renderCatalogByCategory();

  // loader si existe
  if (typeof hideLoader === 'function') setTimeout(hideLoader, 150);
});

// cerrar modal "Quiénes somos"
document.addEventListener('click', (e) => {
  if (e.target.closest('#closeAbout')) closeAboutModal();
  const modal = e.target.closest('#aboutModal');
  if (modal && e.target === modal) closeAboutModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAboutModal();
});

document.getElementById("sendContactBtn")?.addEventListener("click", async () => {
  const name = document.getElementById("contactName")?.value.trim();
  const email = document.getElementById("contactMail")?.value.trim();
  const message = document.getElementById("contactMessage")?.value.trim();
  const status = document.getElementById("contactStatus");

  if (!name || !email || !message) {
    if (status) status.textContent = "Completá nombre, correo y mensaje.";
    return;
  }

  const BACKEND = "https://tierra-de-calma-backend.onrender.com";

  try {
    if (status) status.textContent = "Enviando consulta...";

    const r = await fetch(`${BACKEND}/send_contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    if (!r.ok) throw new Error("Error enviando consulta");

    if (status) status.textContent = "Consulta enviada correctamente. Te responderemos pronto.";

    document.getElementById("contactName").value = "";
    document.getElementById("contactMail").value = "";
    document.getElementById("contactMessage").value = "";

  } catch (err) {
    console.error(err);
    if (status) status.textContent = "No se pudo enviar la consulta. Probá de nuevo.";
  }
});
