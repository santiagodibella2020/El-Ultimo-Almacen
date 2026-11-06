'use strict';
/* v0.43: armas del mundo que se levantan y guía de los primeros días.
   - Las armas tiradas (escopeta, rifle, hacha, machete) se levantan con E; si ya tenés el arma te dan munición o la dejan en mejor estado.
   - Un cartelito en la esquina te va dando un objetivo a la vez (saquear, vender, construir, pasar la noche, sumar gente...), con premio al cumplirlo. */
const WMAP43={escopeta_doble:'escopeta',rifle_caza:'rifle',hacha_bombero:'hacha',machete:'machete'};
const taken43=()=>S.taken43||(S.taken43=[]);
function hideTaken43(){try{for(const k in WMAP43){const im=V41.im&&V41.im[k];if(!im)continue;const m=new THREE.Matrix4().makeScale(0,0,0);
  for(const t of taken43()){const [kk,i]=t.split(':');if(kk===k)im.setMatrixAt(+i,m)}im.instanceMatrix.needsUpdate=true}}catch(e){console.error('v43',e)}}
const _apply43=apply32;apply32=function(){_apply43.apply(this,arguments);hideTaken43()};
const _findInteract43=findInteract;
findInteract=function(){
  if(!P.inTruck&&S&&typeof V41!=='undefined'){let best=null,bd=1.9;
    for(const k in WMAP43){const l=V41[k];if(!l)continue;l.forEach((p,i)=>{if(taken43().includes(k+':'+i))return;const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;best={k,i}}})}
    if(best){const w=WMAP43[best.k];return{label:L('E · Levantar: {w}',{w:wn(w)}),sub:ownsW(w)?L('Ya tenés una: te da munición o la deja en mejor estado'):'',
      act:()=>{taken43().push(best.k+':'+best.i);hideTaken43();sfx('pickup');giveWeapon(w)}}}}
  return _findInteract43()};

// ---------- guía de los primeros días ----------
const G43=[
 {t:()=>L('Revisá 3 muebles o cajas del pueblo (E)'),ok:()=>S.stats.looted>=3,r:30},
 {t:()=>L('Vendé algo desde el mostrador del almacén'),ok:()=>S.stats.sold>=1,r:40},
 {t:()=>L('Construí una defensa en el patio'),ok:()=>S.stats.built>=1,r:50},
 {t:()=>L('Sobreviví tu primera noche'),ok:()=>S.stats.nights>=1,r:60},
 {t:()=>L('Sumá a una persona a tu gente (panel del almacén)'),ok:()=>crew28().list.length>=1,r:80},
 {t:()=>L('Hablá con alguien de un pueblo (E)'),ok:()=>Object.values((S.story&&S.story.npc)||{}).some(n=>n.met),r:80},
 {t:()=>L('Revisá 15 muebles o cajas'),ok:()=>S.stats.looted>=15,r:100},
 {t:()=>L('Construí una estructura del pueblo'),ok:()=>{try{return Object.values(town37().b).some(v=>v>0)}catch(e){return false}},r:120},
 {t:()=>L('Llegá a la Ciudad de San Ignacio'),ok:()=>P.z>470,r:150},
 {t:()=>L('Aguantá hasta el día 7'),ok:()=>S.day>=7,r:200}];
let el43=null,tick43=0;
function guide43(dt){if(!S)return;tick43-=dt;if(tick43>0)return;tick43=.5;
  if(!el43){el43=document.createElement('div');el43.id='goal43';el43.style.cssText='position:absolute;right:14px;top:14px;max-width:250px;background:rgba(10,14,12,.82);padding:7px 12px;border-left:3px solid #e3a33b;font:600 13px var(--f-body,sans-serif);color:#dedcc9;pointer-events:none';
    const h=document.getElementById('hud');if(!h)return;h.appendChild(el43)}
  if(S.guide43==null)S.guide43=S.day>=3?G43.length:0;
  const i=S.guide43|0,g=G43[i];
  if(!g||gstate!=='play'||S.opt43off){el43.hidden=true;return}
  if(g.ok()){S.guide43=i+1;S.money+=g.r;sfx('goal');gainXp(10);toast(L('Objetivo cumplido: +${m}',{m:g.r}),'#8fbb62',4);return}
  el43.hidden=false;el43.innerHTML=`<span style="font:500 11px var(--f-mono,monospace);color:#e3a33b;letter-spacing:.08em">${esc(L('OBJETIVO'))} ${i+1}/${G43.length}</span><br>${esc(g.t())}`}
const _update43=update;update=function(dt){try{guide43(dt)}catch(e){console.error('v43 guía',e)}return _update43.call(this,dt)};
