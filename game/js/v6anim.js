'use strict';
// ================= v0.6: ANIMATION =================
// Enemies: real walk/run cycles, idle, wind-up and strike, flinch, and falls that depend on the body.
// First-person: weapon sway, sprint pose, weapon switch, staged reloads, melee arcs, landing and breathing.
const ease6=t=>t<=0?0:t>=1?1:t*t*(3-2*t);

// ---------- Enemies ----------
const _hurtEnemy6=hurtEnemy;hurtEnemy=function(e){if(e&&!e.dying)e.hitT=.25;return _hurtEnemy6.apply(this,arguments)};
animateEnemy=function(e,dt,sp){
  const m=e.mesh,u=m.userData,d=EDEF[e.type];m.position.set(e.x,e.y,e.z);m.rotation.y=e.yaw;
  if(e.ph==null)e.ph=R()*6.28;
  const vel=e.px6==null?0:Math.min(14,Math.hypot(e.x-e.px6,e.z-e.pz6)/Math.max(dt,1e-3));e.px6=e.x;e.pz6=e.z;
  e.vs6=lerp(e.vs6||0,vel,Math.min(1,dt*8));const sc=e.scale||1;
  const run=clamp(e.vs6/(3.2*sc),0,1.7),g=Math.min(1,run),t=time+e.ph,s=Math.sin(e.anim),c=Math.cos(e.anim);
  if(e.hitT>0)e.hitT-=dt;const hit=e.hitT>0?Math.sin((1-e.hitT/.25)*Math.PI):0;
  const tx=P.inTruck?truck.x:P.x,tz=P.inTruck?truck.z:P.z,dP=Math.hypot(tx-e.x,tz-e.z);
  const reach=e.r+.55+(d.heavy?.6:0)+(e.type==='rex'?1.8:0);
  const wind=(e.aggro&&!d.neutral&&e.atk<=.3&&dP<reach+1.8)?ease6(1-(dP-reach)/1.8):0;
  const strike=e.atk>.5?ease6((e.atk-.5)/.4):0;
  if(u.type==='h'){
    const shamble=e.type==='caminante'||e.type==='bruto'||e.type==='hinchado';
    const amp=.55*g+.18*Math.max(0,run-1);
    u.legs[0].rotation.x=s*amp;u.legs[1].rotation.x=-Math.sin(e.anim+(shamble?.5:0))*amp*(shamble?.65:1);
    u.root.position.y=Math.abs(c)*.05*g-(shamble?.02*g:0);
    u.root.rotation.x=.05+.16*g+(run>1?.1:0)-hit*.35+strike*.22-wind*.12;
    u.root.rotation.z=Math.sin(e.anim*.5)*.06*g*(shamble?1.5:.6)+Math.sin(t*.7)*.035*(1-g);
    let a0,a1;
    if(e.type==='corredor'||run>1.1){a0=-.85+c*.8*g;a1=-.85-c*.8*g}
    else{const droop=1-g;a0=-1.35+Math.sin(e.anim*.5)*.15+droop*.3+Math.sin(t*1.1)*.05;a1=-1.5-Math.sin(e.anim*.5)*.15+droop*.35+Math.sin(t*.9+1)*.05}
    if(u.screamer){const per=d.boss?12:d.mini?9:7;if(per-e.scrT<1.3){a0=a1=-2.8;u.root.rotation.x-=.25}}
    a0=lerp(a0,-2.5,wind);a1=lerp(a1,-2.6,wind);a0=lerp(a0,-.85,strike);a1=lerp(a1,-.95,strike);
    u.arms[0].rotation.x=a0;u.arms[1].rotation.x=a1;u.arms[0].rotation.z=-.08-wind*.2;u.arms[1].rotation.z=.08+wind*.2;
  }else if(u.type==='r'||u.type==='x'){
    const rex=u.type==='x';
    u.legs[0].rotation.x=s*.75*g;u.legs[1].rotation.x=-s*.75*g;
    u.root.position.y=Math.abs(c)*(rex?.12:.07)*g+Math.sin(t*2)*.012;
    u.root.rotation.x=.07*g+(run>1?.08:0)-hit*.25+strike*.12-wind*.06;
    u.root.rotation.z=Math.sin(e.anim)*.03*g;
    u.tail.rotation.y=Math.sin(e.anim*.5)*.28*g+Math.sin(t*1.3)*.22*(1-g);u.tail.rotation.x=-.04+.08*g;
    if(u.tail2){u.tail2.rotation.y=Math.sin(e.anim*.5-1)*.4*g+Math.sin(t*1.3-1)*.3*(1-g);u.tail2.rotation.x=.05*g}
    if(u.head){u.head.rotation.y=e.aggro?0:Math.sin(t*.55)*.5*(1-g);u.head.rotation.x=-c*.07*g+Math.sin(t*.8)*.05*(1-g)-wind*.35+strike*.3}
    if(u.jaw)u.jaw.rotation.x=.08+wind*.5+strike*.2+(rex&&!e.aggro?Math.max(0,Math.sin(t*.4))*.15:0);
    if(rex){const sg=Math.sign(s);if(e.ls6!=null&&sg!==e.ls6&&g>.3&&dP<50){shake=Math.max(shake,.22*(1-dP/50));sfx('thud',e.x,e.z)}e.ls6=sg}
  }else if(u.type==='c'){
    u.legs.forEach((l,i)=>l.rotation.x=(i===0||i===3?s:-s)*.45*g);
    u.root.position.y=Math.abs(c)*.05*g;u.root.rotation.z=Math.sin(e.anim)*.035*g;u.root.rotation.x=-hit*.15;
    if(u.head){u.head.rotation.x=e.charge>0?.35:(-c*.06*g+Math.sin(t*.5)*.08*(1-g)+strike*.4-wind*.15);u.head.rotation.y=e.aggro?0:Math.sin(t*.35)*.35*(1-g)}
    if(u.tail)u.tail.rotation.y=Math.sin(e.anim*.4)*.25+Math.sin(t)*.1;
  }
};
function die6(e,dt){
  e.dying+=dt;const t=e.dying,m=e.mesh,u=m.userData;m.rotation.order='YXZ';m.rotation.y=e.yaw;
  if(e.fb6==null){const a=Math.atan2(e.x-P.x,e.z-P.z);e.fb6=Math.abs(angDiff(e.yaw,a))>Math.PI/2?-1:1;e.fs6=e.side||1}
  if(u.type==='h'){
    const k=ease6(t/.3),f=t<.18?0:ease6((t-.18)/.5),bo=t>.68&&t<.95?Math.sin((t-.68)/.27*Math.PI)*.08:0;
    m.rotation.x=e.fb6*(f*1.45-bo);m.rotation.z=e.fs6*f*.22;
    u.root.position.y=-k*.22*(1-f*.7);u.root.rotation.x=0;u.root.rotation.z=0;
    u.legs[0].rotation.x=-k*.7*(1-f)+f*.2;u.legs[1].rotation.x=-k*.35+f*.1;
    const ta=e.fb6<0?-2.9:-.3,r=Math.min(1,dt*7);u.arms[0].rotation.x=lerp(u.arms[0].rotation.x,ta,r);u.arms[1].rotation.x=lerp(u.arms[1].rotation.x,ta+.4,r);
    u.arms[0].rotation.z=lerp(u.arms[0].rotation.z,-.5*f,r);u.arms[1].rotation.z=lerp(u.arms[1].rotation.z,.5*f,r);
  }else if(u.type==='r'||u.type==='x'){
    const rex=u.type==='x',f=ease6(t/(rex?1.1:.55)),kk=Math.max(0,1-t/1.6);
    m.rotation.x=0;m.rotation.z=e.fs6*f*1.42;u.root.rotation.x=0;
    u.legs[0].rotation.x=Math.sin(t*16)*.6*kk;u.legs[1].rotation.x=Math.sin(t*16+1.5)*.6*kk;
    if(u.tail)u.tail.rotation.y=Math.sin(t*8)*.3*kk;if(u.head)u.head.rotation.x=-.3*f;if(u.jaw)u.jaw.rotation.x=.5*f;
    if(rex&&!e.th6&&t>1.1){e.th6=1;shake=Math.max(shake,.6);sfx('thud',e.x,e.z);burst(e.x,e.y+.5,e.z,'#7a6544',14,4)}
  }else{
    const k=ease6(t/.4),f=t<.3?0:ease6((t-.3)/.6);
    u.legs.forEach((l,i)=>l.rotation.x=(i<2?-1:1)*k*.5);u.root.position.y=-k*.45;m.rotation.x=0;m.rotation.z=e.fs6*f*1.2;
    if(u.head)u.head.rotation.x=.4*k;
  }
  m.position.set(e.x,e.y-Math.max(0,t-2.2)*.6,e.z);
  if(t>3.2){scene.remove(m);e.dead=true}}
const _updateEnemy6a=updateEnemy;updateEnemy=function(e,dt){if(e.dying>0){die6(e,dt);return}return _updateEnemy6a(e,dt)};

// ---------- First-person weapon ----------
const vm6={ly:null,lp:0,sx:0,sy:0,sprint:0,swT:0,cur:undefined,land:0,ground:true,roll:0};
function vmAnim6(dt){
  if(P.inTruck||camMode!=='fp'||!vmRoot.visible){vm6.ly=null;return}
  const key=buildMode?'build':S.cur,g=key&&vm[key];
  if(key!==vm6.cur){if(vm6.cur!==undefined)vm6.swT=.32;vm6.cur=key}vm6.swT=Math.max(0,vm6.swT-dt);
  if(vm6.ly==null){vm6.ly=P.yaw;vm6.lp=P.pitch}
  const dy=angDiff(vm6.ly,P.yaw),dp=P.pitch-vm6.lp;vm6.ly=P.yaw;vm6.lp=P.pitch;const id=1/Math.max(dt,1e-3),k=1-adsT*.8,rr=Math.min(1,dt*10);
  vm6.sx=lerp(vm6.sx,clamp(dy*id*.005,-.05,.05)*k,rr);vm6.sy=lerp(vm6.sy,clamp(-dp*id*.005,-.04,.04)*k,rr);
  const mv=!!(keys['w']||keys['a']||keys['s']||keys['d']);
  const sprinting=keys['shift']&&mv&&adsT<.3&&reloadT<=0&&P.onGround&&!buildMode&&stamina>1&&swingT<=0;
  vm6.sprint=lerp(vm6.sprint,sprinting?1:0,Math.min(1,dt*8));
  if(P.onGround&&!vm6.ground)vm6.land=.3;vm6.ground=P.onGround;vm6.land=Math.max(0,vm6.land-dt);
  const ld=vm6.land>0?Math.sin(vm6.land/.3*Math.PI):0,br=Math.sin(time*1.6)*(1-adsT*.85),sw=ease6(vm6.swT/.32),sp=vm6.sprint;
  const p=vmRoot.position,r=vmRoot.rotation,p0x=p.x,p0y=p.y,p0z=p.z;
  // staged reload: undo the simple dip and replace it with tilt, mag out, mag in, click
  if(reloadT>0&&reloadMax>0){const q=reloadT/reloadMax,s0=Math.sin(q*Math.PI);p.y+=.12*s0;r.x+=.6*s0;r.z-=.3*s0;
    const pr=1-q,hold=ease6(pr/.18)*(1-ease6((pr-.82)/.18));
    const out=pr>.2&&pr<.45?Math.sin((pr-.2)/.25*Math.PI):0,inn=pr>.52&&pr<.74?Math.sin((pr-.52)/.22*Math.PI):0,clk=pr>.72&&pr<.82?Math.sin((pr-.72)/.1*Math.PI):0;
    p.y+=-.075*hold-.025*out+.018*clk;p.x+=-.03*hold;r.z+=.55*hold;r.x+=-.22*hold+.1*inn-.12*clk;r.y+=-.18*hold}
  p.x+=vm6.sx-sp*.07;p.y+=vm6.sy+br*.0035-ld*.035-sw*.3-sp*.05+clamp(-P.vy*.004,-.03,.03)*(P.onGround?0:1);
  r.x+=-vm6.sy*1.4+br*.008-sw*.9-sp*.3+ld*.06;r.y+=vm6.sx*1.8+sp*.75;r.z+=vm6.sx*1.1+sp*.3;
  if(mv&&P.onGround)r.z+=Math.sin(P.bob*.5)*.016*(1-adsT);
  // melee: wind up, strike across, recover
  const w=W();if(g&&w&&w.melee&&!buildMode){let rx=-.3,ry=0,rz=0,px=0;
    if(swingT>0){const pr=1-swingT/.3;if(pr<.25){const e=ease6(pr/.25);rx=-.3+.55*e;ry=-.45*e;rz=-.35*e;px=.05*e}
      else if(pr<.6){const e=ease6((pr-.25)/.35);rx=.25-1.85*e;ry=-.45+1.55*e;rz=-.35+1.15*e;px=.05-.17*e}
      else{const e=ease6((pr-.6)/.4);rx=-1.6+1.3*e;ry=1.1-1.1*e;rz=.8-.8*e;px=-.12+.12*e}}
    g.rotation.set(rx,ry,rz);p.x+=px}
  if(vmFlash){vmFlash.position.x+=p.x-p0x;vmFlash.position.y+=p.y-p0y;vmFlash.position.z+=p.z-p0z}
  // camera: lean into strafes and dip on landing
  vm6.roll=lerp(vm6.roll,((keys['a']?1:0)-(keys['d']?1:0))*.014*(1-adsT),Math.min(1,dt*6));camera.rotation.z+=vm6.roll;camera.position.y-=ld*.07}
const _updateCamera6a=updateCamera;updateCamera=function(dt){_updateCamera6a(dt);if(!S||['menu','newgame','options'].includes(gstate))return;try{vmAnim6(dt)}catch(e){console.error('vm6',e)}};
