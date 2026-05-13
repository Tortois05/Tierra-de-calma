// utils.js
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const fmt = n => n.toLocaleString('es-AR', { style:'currency', currency:'ARS' });

const store = {
  get(k, def){ try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};

function showLoader(text="Cargando…"){
  const el = document.getElementById('loader');
  if(!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
  const t = el.querySelector('.loader-text');
  if(t) t.textContent = text;
}

function hideLoader(){
  const el = document.getElementById('loader');
  if(!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
}
