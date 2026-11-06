'use strict';
/* v0.36: sombras estables, manos y golpes cuerpo a cuerpo.
   - Sombras: el mapa de sombras sigue al jugador pegándose a la grilla de texels (no titila al caminar) y cubre más terreno.
   - Armas melé grandes se agarran con las dos manos.
   - Cada arma melé tiene su propio golpe (tajo, hachazo, barrido, estocada) con su duración, y la cámara recibe el impacto. */

// ---------- sombras ----------
(function(){
  const sc=sun.shadow.camera;sc.left=-80;sc.right=80;sc.top=80;sc.bottom=-80;sc.near=1;sc.far=420;sc.updateProjectionMatrix();
  sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;
  const texel=160/4096;
  const L=new THREE.Vector3(),R=new THREE.Vector3(),U=new THREE.Vector3(),off=new THREE.Vector3(),t=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  const _al=applyLighting;
  applyLighting=function(){_al.apply(this,arguments);
    try{if(!S||!sun.castShadow)return;
      off.copy(sun.position).sub(sun.target.position);L.copy(off).normalize();
      R.crossVectors(UP,L);if(R.lengthSq()<1e-6)return;R.normalize();U.crossVectors(L,R);
      t.copy(sun.target.position);const a=t.dot(R),b=t.dot(U);
      t.addScaledVector(R,Math.round(a/texel)*texel-a).addScaledVector(U,Math.round(b/texel)*texel-b);
      sun.target.position.copy(t);sun.position.copy(t).add(off);sun.target.updateMatrixWorld();sun.updateMatrixWorld()}catch(e){}};
})();

// ---------- manos: las armas grandes se agarran con las dos ----------
const TWO36={hacha:-.22,bate:-.14,lanza:-.4,katana:.1,mazo:-.3,palanca:-.2};
const _weaponHD36=weaponHD;
weaponHD=function(k,g){const r=_weaponHD36(k,g);try{if(TWO36[k]!==undefined)leftHand(g,-.01,-.005,TWO36[k])}catch(e){console.error('v36 mano',k,e)}return r};
try{rebuildViewmodels()}catch(e){}

// ---------- golpes cuerpo a cuerpo ----------
const STY36={cuchillo:'stab',lanza:'stab',machete:'slash',katana:'slash',hacha:'over',mazo:'over',martillo:'over',sarten:'over',bate:'side',palanca:'side'};
const DUR36={cuchillo:.26,lanza:.34,machete:.34,katana:.3,hacha:.5,mazo:.66,martillo:.4,sarten:.42,bate:.48,palanca:.46};
// cuadros: [fase, rx, ry, rz, px, py, pz]  (rx>0 levanta la punta, ry>0 la manda a la izquierda)
// posición de reposo (el arma en guardia, no colgando) por estilo
const REST36={over:[.55,-.2,-.12,.03,.02,.02],side:[.3,-.35,-.2,.06,0,.02],slash:[.2,-.25,-.15,.04,.02,0],stab:[-.25,-.05,0,0,0,0]};
const MID36={
  over:[[.3,1.15,-.15,-.2,.04,.1,.1],[.52,-1.5,.1,.1,-.03,-.16,-.2],[.64,-1.7,.1,.12,-.03,-.2,-.22]],
  side:[[.28,-.1,-.95,-.5,.12,0,.06],[.55,-.4,1.25,.5,-.12,-.04,-.15],[.68,-.4,1.4,.6,-.14,-.04,-.16]],
  slash:[[.25,.55,-.6,-.7,.08,.08,.04],[.5,-1.2,.9,.6,-.1,-.12,-.12],[.64,-1.4,1.1,.7,-.12,-.14,-.12]],
  stab:[[.3,-.2,-.1,0,.01,-.02,.14],[.5,-.08,0,0,0,0,-.34],[.64,-.1,0,0,0,0,-.3]]};
const KEY36={};for(const k in MID36)KEY36[k]=[[0,...REST36[k]],...MID36[k],[1,...REST36[k]]];
const sm36=x=>x*x*(3-2*x);
function pose36(style,pr){const K=KEY36[style]||KEY36.slash;for(let i=1;i<K.length;i++){if(pr<=K[i][0]||i===K.length-1){const a=K[i-1],b=K[i],u=sm36(clamp((pr-a[0])/(b[0]-a[0]),0,1));return [1,2,3,4,5,6].map(j=>a[j]+(b[j]-a[j])*u)}}}
const sw36={t:99,dur:.4,style:'slash',hit:false};let kick36=0;
const _swing36=swing;
swing=function(){const k=S.cur;_swing36.apply(this,arguments);try{sw36.t=0;sw36.dur=DUR36[k]||.4;sw36.style=STY36[k]||'slash';sw36.hit=false}catch(e){}};
const _updateCamera36=updateCamera;
updateCamera=function(dt){_updateCamera36.apply(this,arguments);
  try{if(!S||['menu','newgame','options'].includes(gstate))return;
    if(sw36.hold!=null)sw36.t=sw36.hold*sw36.dur;else sw36.t+=dt;const w=W(),g=vm[S.cur];
    const off=P.inTruck||camMode!=='fp'||!vmRoot.visible||!g||!w||!w.melee||buildMode;
    if(off){kick36=Math.max(0,kick36-dt*6);if(kick36>0)camera.rotation.x-=kick36*.05;return}
    if(sw36.t>=sw36.dur&&sw36.hold==null){const q=REST36[STY36[S.cur]||'slash'];g.rotation.set(q[0],q[1],q[2]);vmRoot.position.x+=q[3];vmRoot.position.y+=q[4];vmRoot.position.z+=q[5];kick36=Math.max(0,kick36-dt*6);if(kick36>0)camera.rotation.x-=kick36*.05;return}
    const pr=sw36.t/sw36.dur,p=pose36(sw36.style,pr);
    g.rotation.set(p[0],p[1],p[2]);vmRoot.position.x+=p[3];vmRoot.position.y+=p[4];vmRoot.position.z+=p[5];
    // el impacto: un golpecito de cámara cuando el arma llega al punto de contacto
    if(!sw36.hit&&pr>=(sw36.style==='stab'?.5:.52)){sw36.hit=true;kick36=sw36.style==='stab'?.5:1}
    kick36=Math.max(0,kick36-dt*6);if(kick36>0)camera.rotation.x-=kick36*.05}catch(e){console.error('v36 golpe',e)}};
