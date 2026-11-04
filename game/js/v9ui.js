/* v0.9 interfaz: Escape siempre vuelve atrás, sin callejones sin salida */
(function(){
const BACK9=['panel','inv','map','loot','altar','npc','diario','pause','options','newgame'];
addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!BACK9.includes(gstate))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.repeat)return;
  if(gstate==='panel')closePanel();
  else if(gstate==='options')closeOptions();
  else if(gstate==='newgame')toMenu();
  else resume();
  try{pressed={}}catch(_){}
},true);
/* si el navegador rechaza recapturar el mouse justo después de Esc, reintentar solo */
let retry9=0;
document.addEventListener('pointerlockerror',()=>{
  if(gstate!=='wait'||retry9>3)return;retry9++;
  setTimeout(()=>{if(gstate==='wait')requestLock()},1300);
});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement)retry9=0});
/* en pantalla completa del DOM, que Esc llegue al juego */
document.addEventListener('fullscreenchange',()=>{
  try{if(document.fullscreenElement&&navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(['Escape']).catch(()=>{})}catch(_){}
});
})();
