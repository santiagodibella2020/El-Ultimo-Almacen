'use strict';
/* v0.38: sensación de golpe, IA de enemigos por especie y director de dificultad.
   - Golpes: pausa breve al impactar (más en melé y en la cabeza), retroceso y tambaleo según dónde pegás, sonido propio y sacudida al matar.
   - Cornudos territoriales (avisan antes de embestir), raptores que te acechan mientras los mirás y atacan cuando mirás para otro lado,
     manadas con líder (si lo matás se dispersan), podridos que van hacia ruidos (guardias, torretas, camioneta a fondo).
   - Director: mide cómo te va (vida, daño reciente, bajas) y ajusta el tamaño de las hordas y el botín, sin avisarte. */

// ---------- sonidos ----------
const _sfx38=sfx;
sfx=function(k,x,z){if(k==='m38'||k==='h38'||k==='k38'){if(!AC)return;try{
    if(k==='m38'){nz(.07,260,.5);tn(120,45,.1,'sine',.32)}
    else if(k==='h38'){nz(.05,2200,.35);tn(900,300,.06,'square',.12);tn(95,40,.14,'sine',.34)}
    else{nz(.2,380,.6);tn(70,30,.22,'sine',.4);nz(.12,2000,.2,.02)}}catch(e){}return}
  return _sfx38.apply(this,arguments)};

// ---------- pausa al impactar ----------
let hs38=0;
const _update38=update;
update=function(dt){if(hs38>0){hs38-=dt;dt*=.08}
  try{dir38tick(dt)}catch(e){console.error('v38 dir',e)}
  return _update38.call(this,dt)};

// ---------- ruidos que atraen podridos ----------
function noise38(x,z,r){for(const o of enemies){if(o.aggro||o.dying||o.dead||o.horde||!zomb27(o))continue;
  if(Math.hypot(o.x-x,o.z-z)<r&&!(o.inv27&&o.inv27.t>8))o.inv27={x:x+(Math.random()-.5)*5,z:z+(Math.random()-.5)*5,t:14}}}

// ---------- golpes: retroceso y tambaleo ----------
const _hurt38=hurtEnemy;
hurtEnemy=function(e,dmg,head,src,by,ap){
  const ok=e&&!e.dead&&!e.dying&&EDEF[e.type];_hurt38.apply(this,arguments);
  try{if(!ok)return;const ed=EDEF[e.type];
    if(src==='t'){noise38(e.x,e.z,32);}
    if(src!=='p'&&src!=='pet')return;
    // los raptores de una manada reaccionan si herís a uno: dejan de acechar
    if(ed.kind&&ed.kind.includes('d')){for(const o of enemies)if(o!==e&&o.stalk38&&Math.hypot(o.x-e.x,o.z-e.z)<30)o.stalk38=false;e.stalk38=false}
    const w=src==='p'?W():null,melee=!!(w&&w.melee),dead=e.hp<=0;
    const big=!!(ed.boss||ed.mini||e.type==='rex'||e.type==='coloso'||ed.heavy),frac=dmg/Math.max(1,e.maxHp);
    hs38=Math.min(.14,Math.max(hs38,(dead?.075:head?.055:.028)*(melee?1.8:1)));
    sfx(dead?'k38':head?'h38':'m38',e.x,e.z);
    if(dead){shake=Math.max(shake,melee?.25:big?.2:.08);return}
    if(big||e.charge>0||e.fuse>0)return;
    if(head||melee||frac>.2){
      const a=Math.atan2(e.x-P.x,e.z-P.z),f=(melee?6.5:head?5:3.4)/Math.max(.7,Math.sqrt(e.scale||1));
      e.knock=Math.max(e.knock||0,head?.26:melee?.2:.12);e.kx=Math.sin(a)*f;e.kz=Math.cos(a)*f;
      e.flinch38=head?.3:.2;e.flinchHead38=!!head;e.lunge=0}
  }catch(err){console.error('v38 golpe',err)}};
// el cuerpo se echa atrás si le das en la cabeza y se dobla si le das en el torso
const _anim38=animateEnemy;
animateEnemy=function(e,dt,sp){_anim38.apply(this,arguments);
  try{const u=e.mesh.userData;if(!u.root)return;
    if(e.flinch38>0){e.flinch38-=dt;const k=Math.max(0,e.flinch38)/.3;u.root.rotation.x=(e.flinchHead38?-.55:.4)*k;if(e.flinch38<=0)u.root.rotation.x=0}
    else if(u.root.rotation.x!==0&&!(e.stun>0))u.root.rotation.x=0}catch(err){}};

// ---------- IA por especie ----------
const fwd38=new THREE.Vector3();
let warnToast38=false,packToast38=false;
function face38(e,tx,tz,rate,dt){e.yaw+=clamp(angDiff(e.yaw,Math.atan2(tx-e.x,tz-e.z)),-rate*dt,rate*dt)}
function step38(e,ang,sp,dt){const h=moveCircle(e,Math.sin(ang)*sp*dt,Math.cos(ang)*sp*dt,e.r,'e');e.anim+=dt*sp*2.2/(e.scale||1);e.y=groundY(e.x,e.z);return h}
function ai38(e,dt){const d=EDEF[e.type];if(!d||gstate!=='play'&&gstate!=='dead')return false;
  const tx=P.inTruck?truck.x:P.x,tz=P.inTruck?truck.z:P.z,dx=tx-e.x,dz=tz-e.z,dP=Math.hypot(dx,dz);
  // --- cornudo territorial: patea, te mira y recién después embiste ---
  if(e.type==='cornudo'&&d.neutral&&!e.lair){
    if(!e.home38)e.home38={x:e.x,z:e.z};
    if(e.angry){if(Math.hypot(e.x-e.home38.x,e.z-e.home38.z)>55){e.angry=false;e.cool38=14}return false}
    e.cool38=(e.cool38||0)-dt;
    if(e.warn38>0){e.warn38-=dt;face38(e,tx,tz,2.6,dt);e.anim+=dt*6;
      if(Math.floor(e.warn38*3)!==Math.floor((e.warn38+dt)*3)){shake=Math.max(shake,dP<18?.08:0)}
      if(e.warn38<=0){if(dP<(P.crouch?9:14)){e.angry=true;sfx('bellow',e.x,e.z)}else e.cool38=10}
      else if(dP>24){e.warn38=0;e.cool38=8}
      e.y=groundY(e.x,e.z);animateEnemy(e,dt,0);return true}
    if(e.cool38<=0&&dP<(P.crouch?9:15)){e.warn38=2.6;sfx('bellow',e.x,e.z);
      if(!warnToast38){warnToast38=true;toast(L('El cornudo patea el suelo: te está avisando. Alejate o va a embestir.'),'#e3a33b',5)}return true}
    return false}
  // --- raptores: acechan en manada, con líder ---
  if(e.type==='raptor'&&!e.horde&&!(e.stun>0)){
    if(e.lead38===undefined){const mates=enemies.filter(o=>o.type==='raptor'&&!o.horde&&!o.dying&&!o.dead&&Math.hypot(o.x-e.x,o.z-e.z)<14);
      let L0=mates[0]||e;for(const o of mates)if(o.maxHp>L0.maxHp)L0=o;
      for(const o of mates){o.lead38=o===L0?null:L0;if(o===L0){o.stalk38=Math.random()<.7;o.stalkT38=0}else{o.stalk38=true;o.fdelay38=.4+Math.random()*1.2}}
      if(!mates.includes(e)){e.lead38=null;e.stalk38=Math.random()<.7}}
    // sin líder, la manada se dispersa
    if(e.lead38&&(e.lead38.dying||e.lead38.dead)&&!e.brk38){e.brk38=true;e.lead38=null;
      if(Math.random()<.65){e.flee38=7+Math.random()*4;e.aggro=false;e.stalk38=false;if(!packToast38){packToast38=true;toast(L('Sin su líder, la manada se dispersa.'),'#8fbb62',4)}}}
    if(e.flee38>0){e.flee38-=dt;if(dP>70)e.flee38=0;
      const a=Math.atan2(-dx,-dz)+Math.sin(time+e.anim)*.4;e.yaw+=clamp(angDiff(e.yaw,a),-8*dt,8*dt);step38(e,e.yaw,e.speed*1.1,dt);animateEnemy(e,dt,e.speed);return true}
    if(e.aggro&&e.stalk38&&dP>7&&dP<44){
      e.stalkT38=(e.stalkT38||0)+dt;
      const lead=e.lead38,follow=lead&&!lead.dying&&!lead.dead;
      if(follow&&!lead.stalk38)e.fdelay38=(e.fdelay38||0)-dt;
      camera.getWorldDirection(fwd38);const dot=-(fwd38.x*dx+fwd38.z*dz)/Math.max(dP,1e-3);// >0: me está mirando
      const looking=dot>.35,weak=S.hp<maxHp()*.35||P.inTruck;
      // el que acecha aguanta mirado; ataca si mirás para otro lado, si estás flojo o tras un rato (los seguidores esperan a su líder)
      const go=follow?(!lead.stalk38&&e.fdelay38<=0):!looking;
      if(go||weak||e.stalkT38>14||dP<8.5){e.stalk38=false;sfx('shriek',e.x,e.z)}
      else{const want=11+((e.anim*.37)%1)*4,tang=Math.atan2(dx,dz)+(e.fl27||1)*Math.PI/2,rad=dP<want-1.5?Math.atan2(-dx,-dz):dP>want+1.5?Math.atan2(dx,dz):tang;
        const a=dP>=want-1.5&&dP<=want+1.5?tang:rad;e.yaw+=clamp(angDiff(e.yaw,a),-6*dt,6*dt);
        step38(e,e.yaw,e.speed*.55,dt);animateEnemy(e,dt,e.speed*.55);
        // mientras acecha, igual te mira de frente
        e.mesh.rotation.y=Math.atan2(dx,dz);return true}}}
  return false}
const _updateEnemy38=updateEnemy;
updateEnemy=function(e,dt){
  try{if(!e.dying&&!e.dead&&!(e.knock>0)&&!(e.stun>0)&&!(e.fuse>0)&&ai38(e,dt))return}catch(err){console.error('v38 ia',err)}
  return _updateEnemy38.apply(this,arguments)};

// ---------- director de dificultad ----------
function dir38S(){if(!S)return null;return S.dir38||(S.dir38={dmg:0,kills:0,mult:1,loot:1,t:0})}
const _hurtPlayer38=hurtPlayer;
hurtPlayer=function(dmg,src){const hp0=S&&S.hp;_hurtPlayer38.apply(this,arguments);try{const D=dir38S();if(D&&hp0!=null)D.dmg+=Math.max(0,hp0-S.hp)}catch(e){}};
const _kill38=killEnemy;
killEnemy=function(e,by,head){const was=e&&!e.dying;_kill38.apply(this,arguments);try{if(was){const D=dir38S();if(D)D.kills+=EDEF[e.type].mini||EDEF[e.type].boss?3:1}}catch(err){}};
let truckT38=0;
function dir38tick(dt){const D=dir38S();if(!D||gstate!=='play')return;
  D.dmg*=Math.exp(-dt/110);D.kills*=Math.exp(-dt/140);D.t+=dt;
  // camioneta a fondo: el motor se oye lejos
  if(P.inTruck&&Math.abs(truck.speed)>9){truckT38-=dt;if(truckT38<=0){truckT38=3;noise38(truck.x,truck.z,50)}}
  if(D.t<4)return;D.t=0;
  const hpF=S.hp/maxHp(),score=Math.max(-1,Math.min(1,.15-D.dmg/(maxHp()*1.1)+Math.min(D.kills,14)/14*.45+(hpF-.6)*.6));
  const tm=1+score*.3,tl=1+Math.max(0,-score)*.4-Math.max(0,score)*.12;
  D.mult+=(Math.max(.7,Math.min(1.35,tm))-D.mult)*.15;D.loot+=(tl-D.loot)*.15;D.score=score}
// SB('horde') y SB('loot') (game.js) multiplican por esto
function dir38(k){const D=S&&S.dir38;if(!D)return 1;return k==='horde'?(D.mult||1):k==='loot'?(D.loot||1):1}
