'use strict';
/* v0.27: enemigos más vivos.
   - Vista: ven en un cono hacia adelante y las paredes tapan. Si les das la espalda o te escondés detrás de
     un muro, no te detectan tan fácil. Correr cerca o estar pegado a ellos sí te delata.
   - Memoria: si te pierden de vista van al último lugar donde te vieron y siguen tu rastro un rato;
     después buscan por la zona y se rinden.
   - Oído: un disparo lejano no les dice dónde estás: van a investigar de dónde vino el ruido.
   - Avisos: un zombi que te ve gruñe y los de al lado se acercan a ver; un raptor chilla y llama a la manada.
   - Esquivan obstáculos (paredes, muebles, autos) en vez de chocarse.
   - Manadas de raptores: rodean por los costados antes de atacar, muerden y se alejan para volver a entrar. */
const AI27={losStep:1.1,eye:1.45};
const pack27=e=>{const d=EDEF[e.type];return d&&(d.kind||'').includes('d')&&d.speed>=4.5&&!d.boss&&!d.neutral};
const zomb27=e=>{const d=EDEF[e.type];return d&&d.kind==='z'};

// ---------- Línea de vista ----------
function los27(e){const x0=e.x,z0=e.z,y0=e.y+AI27.eye*(e.scale||1),x1=P.inTruck?truck.x:P.x,z1=P.inTruck?truck.z:P.z,y1=(P.inTruck?truck.y:P.y)+1.4;
  const dx=x1-x0,dz=z1-z0,d=Math.hypot(dx,dz);if(d<2)return true;const n=Math.ceil(d/8),seen=new Set();
  for(let i=0;i<=n;i++){const t=i/n;for(const b of qAABB(x0+dx*t,z0+dz*t)){if(seen.has(b))continue;seen.add(b);if(b.dead||b.kind==='floor')continue;
    // segmento contra caja (slab)
    let t0=0,t1=1;if(Math.abs(dx)<1e-6){if(x0<=b.x0||x0>=b.x1)continue}else{let a=(b.x0-x0)/dx,c=(b.x1-x0)/dx;if(a>c){const q=a;a=c;c=q}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>=t1)continue}
    if(Math.abs(dz)<1e-6){if(z0<=b.z0||z0>=b.z1)continue}else{let a=(b.z0-z0)/dz,c=(b.z1-z0)/dz;if(a>c){const q=a;a=c;c=q}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>=t1)continue}
    if(t1<.04||t0>.96)continue;const ym=y0+(y1-y0)*(t0+t1)/2;if(ym>b.y0&&ym<b.y1)return false}}
  return true}
function losC27(e,dt){e.losT27=(e.losT27||0)-dt;if(e.losT27<=0||e.los27==null){e.losT27=.22+Math.random()*.1;e.los27=los27(e)}return e.los27}

// ---------- Detectar ----------
function ai27sees(e,dP,ar,dt){
  if(dP<3.5)return true;
  const running=keys['shift']&&!P.inTruck&&!(keys['control']||P.crouch);
  if(P.inTruck&&dP<ar)return true;// el motor se escucha
  if(running&&dP<ar*.55)return true;
  const tx=P.x-e.x,tz=P.z-e.z,face=Math.abs(angDiff(e.yaw,Math.atan2(tx,tz)));
  const cone=e.inv27?1:face<1.1?1:face<1.9?.7:.38;// de espaldas ven poco
  if(dP>ar*cone)return false;
  return losC27(e,dt)}
let groan27=0;
function ai27aggro(e){const was=e.aggro;e.aggro=true;e.lk27={x:P.x,z:P.z};e.lost27=0;delete e.inv27;if(was)return;
  if(pack27(e)){e.fl27=(Math.random()<.5?-1:1)*(.9+Math.random()*.8);e.flT27=1.8+Math.random()*1.6;
    sfx('shriek',e.x,e.z);for(const o of enemies){if(o===e||o.aggro||o.dying||o.dead||!pack27(o))continue;if(Math.hypot(o.x-e.x,o.z-e.z)<32){o.aggro=true;o.lk27={x:P.x,z:P.z};o.lost27=0;o.fl27=-e.fl27*(.6+Math.random()*.8);o.flT27=2+Math.random()*1.8}}}
  else if(zomb27(e)){if(time-groan27>1.2){groan27=time;sfx('groan',e.x,e.z)}
    for(const o of enemies){if(o===e||o.aggro||o.dying||o.dead||!zomb27(o)||o.horde)continue;if(Math.hypot(o.x-e.x,o.z-e.z)<15)o.inv27={x:P.x+(Math.random()-.5)*4,z:P.z+(Math.random()-.5)*4,t:14}}}}

// ---------- Perderte de vista ----------
function ai27lost(e,dP,dt){const d=EDEF[e.type];if(d.boss||e.horde||e.lair||e.charge>0)return false;
  if(dP<6||losC27(e,dt)){e.lk27={x:P.inTruck?truck.x:P.x,z:P.inTruck?truck.z:P.z};e.lost27=0;return false}
  e.lost27=(e.lost27||0)+(e.wp27&&dP<30?dt*.3:dt); // si va camino a una puerta, sabe dónde te metiste
  if(e.lost27>(pack27(e)?14:d.mini?20:11)){const lk=e.lk27||{x:P.x,z:P.z};e.inv27={x:lk.x,z:lk.z,t:9};e.lost27=0;return true}
  return false}

// ---------- Perseguir ----------
function ai27chase(e,dx,dz,dP,dt){e.sp27=1;const px=e.x+dx,pz=e.z+dz;
  const seen=dP<6||e.los27!==false;let gx=px,gz=pz;
  if(!seen&&e.lk27){gx=e.lk27.x;gz=e.lk27.z;
    // rastro: al llegar al último lugar visto sigue tu olor un poco más
    if(Math.hypot(gx-e.x,gz-e.z)<1.6){const k=Math.min(4,dP)/Math.max(dP,1e-3);e.lk27={x:e.x+dx*k,z:e.z+dz*k}}}
  if(pack27(e)&&seen){
    if(e.back27>0){e.back27-=dt;e.sp27=1.05;if(e.back27<=0)e.flT27=1+Math.random()*1.5;return Math.atan2(-dx,-dz)+(e.fl27||1)*.5}
    if(e.flT27>0&&dP>6&&dP<34&&!e.lunge){e.flT27-=dt;const base=Math.atan2(e.x-px,e.z-pz)+(e.fl27||1)*.9,r=Math.max(5,dP*.55);
      gx=px+Math.sin(base)*r;gz=pz+Math.cos(base)*r;e.sp27=1.1}}
  return Math.atan2(gx-e.x,gz-e.z)}

// ---------- Investigar un ruido o el último lugar donde te vieron ----------
function ai27inv(e,dt){const v=e.inv27;if(!v)return false;v.t-=dt;if(v.t<=0||e.dying){delete e.inv27;return false}
  const d=Math.hypot(v.x-e.x,v.z-e.z);
  if(d>2.2){e.d27=Math.atan2(v.x-e.x,v.z-e.z)}else{e.d27=wander(e,dt);if(e.d27==null)e.d27=e.yaw+.8;if(v.t>5)v.t=5}
  return true}
function ai27hear(e,noise){const d=Math.hypot(e.x-P.x,e.z-P.z);
  if(e.aggro||d<noise*.35)return ai27aggro(e);
  const err=d*.12;e.inv27={x:P.x+(Math.random()-.5)*err,z:P.z+(Math.random()-.5)*err,t:22}}

// ---------- Esquivar obstáculos ----------
const SOFT27={wall:1,gate:1,barr:1};// contra la empalizada y las barricadas tienen que pegar
function ai27steer(e,dir,dt){e.stT27=(e.stT27||0)-dt;if(e.stT27>0)return dir+(e.stO27||0);e.stT27=.2+Math.random()*.08;
  const pr=e.r+1.3;const free=a=>{const h=circleBlocked(e.x+Math.sin(a)*pr,e.z+Math.cos(a)*pr,e.r*.9,'e');return !h||SOFT27[h.kind]};
  if(free(dir)){e.stO27=0;return dir}
  if(!e.side27)e.side27=Math.random()<.5?-1:1;
  for(const o of [.5,1,1.5,2.1]){for(const s of [e.side27,-e.side27]){if(free(dir+o*s)){e.stO27=o*s;e.side27=s;e.stT27=.35;return dir+o*s}}}
  e.stO27=Math.PI*.85*e.side27;e.stT27=.5;return dir+e.stO27}

// ---------- Mordida y retirada (raptores) ----------
const _updateEnemy27=updateEnemy;updateEnemy=function(e,dt){const a0=e.atk;_updateEnemy27(e,dt);
  if(!e.dying&&e.aggro&&pack27(e)&&e.atk>a0+.3&&!(e.back27>0)&&Math.random()<.75){e.back27=.55+Math.random()*.4}};


// ---------- Puertas: entrar y salir de los edificios para buscarte ----------
function door27(b,side,pos,dw){const n=side===0?[0,-1]:side===1?[0,1]:side===2?[-1,0]:[1,0];
  const cx=side<2?b.x0+pos*b.w:side===2?b.x0:b.x1,cz=side<2?(side===0?b.z0:b.z1):b.z0+pos*b.d;
  (b.doors27||(b.doors27=[])).push({ix:cx-n[0]*1.3,iz:cz-n[1]*1.3,ox:cx+n[0]*2,oz:cz+n[1]*2,w:dw})}
if(typeof bld22==='function'){const _bld27=bld22;bld22=function(cx,cz,w,d,o){const b=_bld27(cx,cz,w,d,o);try{for(const [s,p,dw] of (o.doors||[[1,.5,2]]))door27(b,s,p,dw)}catch(e){}return b}}
const _buildBuilding27=buildBuilding;buildBuilding=function(rng,cx,cz,w,d,store,side){_buildBuilding27(rng,cx,cz,w,d,store,side);
  try{const b=buildings[buildings.length-1];if(b&&!b.doors27)door27(b,side<0?3:2,store?.5:.3,store?2.4:1.5)}catch(e){}};
// Devuelve el punto al que conviene ir para llegar a (gx,gz) pasando por las puertas.
function route27(e,gx,gz){const eb=insideBuilding(e.x,e.z),tb=insideBuilding(gx,gz);if(eb===tb)return null;
  const pick=(b,fx,fz,tx,tz)=>{let best=null,bd=1e9;for(const dr of b.doors27){const c=Math.hypot(dr.ix-fx,dr.iz-fz)+Math.hypot(dr.ox-tx,dr.oz-tz);if(c<bd){bd=c;best=dr}}return best};
  if(eb&&eb.doors27&&eb.doors27.length){if(e.dc27&&e.dc27.b===eb&&e.dc27.t>time)return{x:e.dc27.d.ox,z:e.dc27.d.oz,door:1};
    const dr=pick(eb,e.x,e.z,gx,gz);if(Math.hypot(dr.ix-e.x,dr.iz-e.z)>.8)return{x:dr.ix,z:dr.iz};e.dc27={b:eb,d:dr,t:time+4};return{x:dr.ox,z:dr.oz,door:1}}
  if(tb&&tb.doors27&&tb.doors27.length){if(e.dc27&&e.dc27.b===tb&&e.dc27.t>time)return{x:e.dc27.d.ix,z:e.dc27.d.iz,door:1};
    let best=null,bd=1e9;for(const dr of tb.doors27){const c=Math.hypot(dr.ox-e.x,dr.oz-e.z)+Math.hypot(dr.ix-gx,dr.iz-gz);if(c<bd){bd=c;best=dr}}
    if(Math.hypot(best.ox-e.x,best.oz-e.z)>.8)return{x:best.ox,z:best.oz};e.dc27={b:tb,d:best,t:time+4};return{x:best.ix,z:best.iz,door:1}}
  return null}
const _ai27chase0=ai27chase;ai27chase=function(e,dx,dz,dP,dt){const dir=_ai27chase0(e,dx,dz,dP,dt);if(e.back27>0)return dir;
  e.rT27=(e.rT27||0)-dt;if(e.rT27<=0){e.rT27=.25;const gx=e.lk27&&e.los27===false&&dP>=6?e.lk27.x:e.x+dx,gz=e.lk27&&e.los27===false&&dP>=6?e.lk27.z:e.z+dz;e.wp27=route27(e,gx,gz)}
  if(e.wp27){e.sp27=1;if(e.wp27.door){e.stuck=0;e.stT27=.1;e.stO27=0}return Math.atan2(e.wp27.x-e.x,e.wp27.z-e.z)}return dir};
const _ai27inv0=ai27inv;ai27inv=function(e,dt){if(!_ai27inv0(e,dt))return false;const v=e.inv27;if(v&&Math.hypot(v.x-e.x,v.z-e.z)>2.2){const w=route27(e,v.x,v.z);if(w){if(v.t!=null)v.t+=dt*.7;e.d27=Math.atan2(w.x-e.x,w.z-e.z)}}return true};

// ---------- Rodear edificios por las esquinas ----------
function segRect27(x0,z0,x1,z1,r){const dx=x1-x0,dz=z1-z0;let t0=0,t1=1;
  for(const [p,dd,lo,hi] of [[x0,dx,r.x0,r.x1],[z0,dz,r.z0,r.z1]]){if(Math.abs(dd)<1e-6){if(p<=lo||p>=hi)return false;continue}let a=(lo-p)/dd,c=(hi-p)/dd;if(a>c){const q=a;a=c;c=q}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>=t1)return false}
  return t1>0&&t0<1}
function around27(e,gx,gz){const eb=insideBuilding(e.x,e.z),gb=insideBuilding(gx,gz);let hit=null,ht=1e9;
  const minx=Math.min(e.x,gx)-20,maxx=Math.max(e.x,gx)+20,minz=Math.min(e.z,gz)-20,maxz=Math.max(e.z,gz)+20;
  for(const b of buildings){if(b===eb||b===gb||b.x1<minx||b.x0>maxx||b.z1<minz||b.z0>maxz)continue;const r={x0:b.x0-.9,x1:b.x1+.9,z0:b.z0-.9,z1:b.z1+.9};
    if(e.x>r.x0&&e.x<r.x1&&e.z>r.z0&&e.z<r.z1)continue;
    if(segRect27(e.x,e.z,gx,gz,r)){const d=Math.hypot(b.cx-e.x,b.cz-e.z);if(d<ht){ht=d;hit=r}}}
  if(!hit)return null;const m=.6,cs=[[hit.x0-m,hit.z0-m],[hit.x1+m,hit.z0-m],[hit.x0-m,hit.z1+m],[hit.x1+m,hit.z1+m]];let best=null,bd=1e9;
  // Si ya llegó a una esquina, planifica desde esa esquina (si no, gira en el lugar).
  let sx=e.x,sz=e.z;for(const [cx,cz] of cs)if(Math.hypot(cx-e.x,cz-e.z)<1.3){sx=cx;sz=cz}
  if(!segRect27(sx,sz,gx,gz,hit))return{x:gx,z:gz};
  for(const [cx,cz] of cs){
    if(Math.hypot(cx-sx,cz-sz)<.1||segRect27(sx,sz,cx,cz,hit))continue;const c=Math.hypot(cx-e.x,cz-e.z)+Math.hypot(gx-cx,gz-cz);if(c<bd){bd=c;best={x:cx,z:cz}}}
  return best}
const _route27b=route27;route27=function(e,gx,gz){const w=_route27b(e,gx,gz)||{x:gx,z:gz,direct:true};if(w.door)return w;const c=around27(e,w.x,w.z);return c||(w.direct?null:w)};
