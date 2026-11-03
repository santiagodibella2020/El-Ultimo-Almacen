'use strict';
// ================= LANGUAGES =================
// Spanish is the source language. Each game/lang/<code>.js file fills I18N[code] with
// { 'texto en español': 'translation' }. Missing strings fall back to Spanish.
const I18N={};
const LANGS=[['es','Español'],['en','English'],['pt','Português (Brasil)'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['ru','Русский'],['pl','Polski'],['tr','Türkçe'],['zh','简体中文'],['ja','日本語'],['ko','한국어']];
const LOCALES={es:'es-AR',en:'en-US',pt:'pt-BR',fr:'fr-FR',de:'de-DE',it:'it-IT',ru:'ru-RU',pl:'pl-PL',tr:'tr-TR',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR'};
let LANG='es';
function L(s,vars){
  let o=s;if(LANG!=='es'){const d=I18N[LANG];if(d&&d[s])o=d[s]}
  if(vars)o=o.replace(/\{(\w+)\}/g,(m,k)=>vars[k]!==undefined?vars[k]:m);
  return o}
function detectLang(){const n=((navigator.languages&&navigator.languages[0])||navigator.language||'en').toLowerCase();const c=n.slice(0,2);return LANGS.some(l=>l[0]===c)?c:'en'}
// Static HTML: any element with data-t gets its own Spanish text as the key.
function applyStatic(){
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-t]').forEach(el=>{if(!el.dataset.t)el.dataset.t=el.textContent.trim();el.textContent=L(el.dataset.t)});
  document.querySelectorAll('[data-tl]').forEach(el=>{el.setAttribute('aria-label',L(el.dataset.tl))});
  document.title=L('El Último Almacén');
}
