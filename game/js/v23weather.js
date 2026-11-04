'use strict';
/* v0.23: el clima pesa y las noches se ponen más duras.
   - La lluvia apaga las fogatas que están a la intemperie. Cuando para, se vuelven a prender con 1 madera.
   - Con niebla se acercan más podridos, que llegan de a grupos sin que los veas venir.
   - Apagones: algunas noches se corta la luz del almacén. Sin luz no andan las lámparas ni las torretas
     (con el banco de recarga las torretas siguen, pero más lentas). La linterna gasta más.
   - Noche cerrada: algunas noches la bruma se espesa y la horda es más grande. */
const N23={apagon:'apagon',cerrada:'cerrada'};
function night23(){return S&&S.night23&&S.night23.on?S.night23:null}
const blackout23=()=>{const n=night23();return !!(n&&n.k==='apagon')};

// ---------- Noches ----------
const _onHour23=onHour;onHour=function(prev,now){_onHour23(prev,now);try{const cross=v=>prev<v&&now>=v;
  if(cross(20)){const storm=S.weather&&S.weather.k==='tormenta';let k=null;
    if(S.day>=3&&Math.random()<(storm?.6:.22))k='apagon';else if(S.day>=4&&Math.random()<.2)k='cerrada';
    S.night23={on:!!k,k,day:S.day};
    if(k==='apagon'){sfx('fuse');toast(L('Apagón: se cortó la luz en el almacén. Sin luz no andan las lámparas ni las torretas.'),'#cc6a4a',8);
      if(S.upg.banco)setTimeout(()=>toast(L('El banco de recarga mantiene las torretas andando, pero más lentas.'),'#e3a33b',6),2500)}
    if(k==='cerrada'){hordeLeft=Math.round(hordeLeft*1.5);S.weather.k='niebla';S.weather.t=CYCLE()*(9/24);sfx('night');
      toast(L('Noche cerrada: la bruma se espesa y vienen más podridos que nunca.'),'#cc4b30',8)}}
  if(cross(5)&&S.night23&&S.night23.on){if(S.night23.k==='apagon')toast(L('Volvió la luz.'),'#9fb0aa',4);S.night23.on=false}}catch(e){console.error('n23',e)}};

const _applyLighting23=applyLighting;applyLighting=function(){_applyLighting23();try{if(!blackout23())return;
  shopLight.intensity=0;yardLight.intensity=0;lampMats.forEach(m=>m.color.set(0x3a3020));signMat.color.set(0x9a7a4a);
  if(typeof homeLight9!=='undefined'&&homeLight9)homeLight9.intensity=0}catch(e){}};
const _weatherLine23=weatherLine;weatherLine=function(){const n=night23();return _weatherLine23()+(n?' · '+(n.k==='apagon'?L('Apagón'):L('Noche cerrada')):'')};

// ---------- Fogatas bajo la lluvia ----------
const sheltered23=(x,z)=>!!insideBuilding(x,z)||(x>-6&&x<6&&z>-16&&z<-8);
function fire23(){for(const b of builds){if(b.t!=='fogata')continue;
  if(!b.out23&&weatherFx().rain>.45&&!sheltered23(b.x,b.z)){b.out23=true;if(Math.hypot(b.x-P.x,b.z-P.z)<40)toast(L('La lluvia apagó la fogata.'),'#9fb0aa',4)}
  if(b.out23){if(b.light)b.light.intensity=0;if(b.fire)b.fire.visible=false}else if(b.fire)b.fire.visible=true}}
const _nearFire23=nearFire;nearFire=function(){if(Math.hypot(P.x+9,P.z+4)<4&&S.upg.fogon)return true;return builds.some(b=>b.t==='fogata'&&!b.out23&&Math.hypot(b.x-P.x,b.z-P.z)<4)};
const _findInteract23=findInteract;findInteract=function(){if(!P.inTruck){for(const b of builds){if(b.t!=='fogata'||!b.out23||Math.hypot(b.x-P.x,b.z-P.z)>2.4)continue;
    if(weatherFx().rain>.3)return{label:L('La lluvia apagó la fogata'),sub:L('Esperá a que pare de llover')};
    if((S.inv.madera||0)<1)return{label:L('Fogata apagada'),sub:L('Necesitás 1 madera para prenderla')};
    return{label:L('Mantené E · Prender la fogata'),sub:L('Usa 1 madera'),hold:1.2,key:'fire23',type:'cook',act:()=>{if((S.inv.madera||0)<1)return;S.inv.madera--;if(S.inv.madera<=0)delete S.inv.madera;b.out23=false;sfx('build',b.x,b.z)}}}}
  return _findInteract23()};

// ---------- Niebla: más podridos ----------
let fog23T=20,fog23Was=false;
function fogTick23(dt){const w=S.weather;const foggy=w&&(w.k==='niebla')||weatherFx().fog>.02;
  if(foggy&&!fog23Was&&darkness()<.5)toast(L('Con la niebla se acercan más podridos. No los vas a ver venir.'),'#9fb0aa',5);fog23Was=foggy;
  if(!foggy)return;fog23T-=dt;if(fog23T>0)return;fog23T=16+Math.random()*14;
  if(P.inTruck||Math.max(Math.abs(P.x),Math.abs(P.z))<PAL+4||inSafe6(P.x,P.z,10))return;
  const alive=enemies.filter(e=>e.fog23&&!e.dying&&!e.dead).length;if(alive>=14)return;
  const sp=findSpawn(P.x,P.z,38,62,0);if(!sp)return;const n=2+(Math.random()*2|0)+(S.day>=6?1:0);
  const pool=S.day>=3?['caminante','caminante','corredor','griton']:['caminante','caminante','corredor'];
  for(let i=0;i<n;i++){const e=spawnEnemy(pool[Math.random()*pool.length|0],sp.x+(Math.random()-.5)*5,sp.z+(Math.random()-.5)*5);e.fog23=true;e.aggro=true}}

// ---------- Por cuadro ----------
const _update23=update;update=function(dt){_update23(dt);try{if(gstate!=='play'||!S)return;
  fire23();fogTick23(dt);
  if(blackout23()){for(let i=0;i<S.upg.torreta;i++){const tu=turrets[i];if(!tu)continue;if(S.upg.banco){if(tu.cd>0)tu.cd+=dt*.6}else tu.cd=Math.max(tu.cd,.5)}
    if(flashOn&&darkness()>.3&&!P.inTruck)S.battery=Math.max(0,S.battery-dt*50/(CYCLE()*.9))}}catch(e){console.error('w23',e)}};
