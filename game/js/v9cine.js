/* v0.9 cinemáticas: barras de cine, cámara con recorrido, subtítulos. Se saltean con Esc / Espacio / clic. */
let cine9=null;
const CINE9={
  smooth:t=>t*t*(3-2*t),
  lerp3:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]
};
(function(){
  const bars=document.createElement('div');bars.id='cine9';bars.hidden=true;
  bars.innerHTML='<div class="cb top"></div><div class="cb bot"></div><div class="csub"></div><div class="cfade"></div><div class="cskip"></div>';
  document.body.appendChild(bars);
  const st=document.createElement('style');
  st.textContent=`#cine9{position:fixed;inset:0;z-index:30;pointer-events:none}#cine9[hidden]{display:none}
  #cine9 .cb{position:absolute;left:0;right:0;height:12.5vh;background:#000;transition:transform .9s ease}
  #cine9 .top{top:0}#cine9 .bot{bottom:0}
  #cine9 .csub{position:absolute;left:0;right:0;bottom:3vh;text-align:center;color:#f2ede0;font:600 clamp(15px,2.3vh,24px)/1.3 'Inter',sans-serif;letter-spacing:.02em;text-shadow:0 2px 8px #000;padding:0 8vw;opacity:0;transition:opacity .6s}
  #cine9 .csub.on{opacity:1}
  #cine9 .cfade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .7s}
  #cine9 .cskip{position:absolute;right:2vw;top:13.5vh;color:#cfc9b8;font:500 12px 'Inter',sans-serif;opacity:.7}
  body.cine #hud,body.cine #toasts{display:none!important}`;
  document.head.appendChild(st);
})();
const gy9=(x,z)=>{try{return groundY(x,z)}catch(e){return 0}};
function playCine9(id,shots,onEnd){
  if(!S||cine9||gstate==='dead'||(navigator.webdriver&&!window.__cineTest))return false;
  S.cine9=S.cine9||{};if(S.cine9[id])return false;S.cine9[id]=1;
  hideAll();mouse.down=false;unlock();
  cine9={id,shots,i:0,t:0,onEnd,prev:gstate,total:shots.reduce((a,s)=>a+s.d,0),el:0,end:false};
  gstate='cine';document.body.classList.toggle('cine',true);
  const r=$('cine9');r.hidden=false;r.querySelector('.cskip').textContent=L('Esc: saltear');
  r.querySelector('.cfade').style.opacity=1;setTimeout(()=>{if(cine9)r.querySelector('.cfade').style.opacity=0},60);
  startShot9();return true}
function startShot9(){const s=cine9.shots[cine9.i],sub=$('cine9').querySelector('.csub');
  if(s.text){sub.textContent=L(s.text);sub.classList.add("on")}else sub.classList.remove('on')}
function endCine9(){if(!cine9)return;const c=cine9;cine9=null;
  const r=$('cine9');r.hidden=true;r.querySelector('.csub').classList.remove('on');r.querySelector('.cfade').style.opacity=0;
  document.body.classList.remove('cine');camera.fov=settings.fov||camera.fov;camera.updateProjectionMatrix();
  gstate='play';resume();try{if(c.onEnd)c.onEnd()}catch(e){console.error(e)}}
function skipCine9(){if(cine9&&!cine9.end){cine9.end=true;const f=$('cine9').querySelector('.cfade');f.style.opacity=1;setTimeout(endCine9,350)}}
function tickCine9(dt){
  if(!cine9)return;time+=dt;cine9.el+=dt;
  const s=cine9.shots[cine9.i];cine9.t+=dt;
  if(cine9.t>=s.d){cine9.i++;cine9.t=0;if(cine9.i>=cine9.shots.length){skipCine9();cine9.i=cine9.shots.length-1;cine9.t=999;return}startShot9()}
  const last=cine9.i===cine9.shots.length-1&&cine9.shots[cine9.i].d-cine9.t<.8;if(last&&!cine9.end)skipCine9()}
const _updateCamera9=updateCamera;
updateCamera=function(dt){
  if(gstate!=='cine'||!cine9)return _updateCamera9(dt);
  const s=cine9.shots[Math.min(cine9.i,cine9.shots.length-1)],k=CINE9.smooth(Math.min(1,cine9.t/s.d));
  const a=s.from(),b=s.to?s.to():a,p=CINE9.lerp3(a,b,k),la=s.look(),lb=s.lookTo?s.lookTo():la,l=CINE9.lerp3(la,lb,k);
  p[1]=Math.max(p[1],gy9(p[0],p[2])+1.2);
  camera.position.set(p[0],p[1],p[2]);camera.lookAt(l[0],l[1],l[2]);
  const fv=s.fov||55;if(Math.abs(camera.fov-fv)>.1){camera.fov=fv;camera.updateProjectionMatrix()}};
const _render9c=render;
render=function(dt){if(gstate==='cine')tickCine9(dt);return _render9c(dt)};
addEventListener('keydown',e=>{if(gstate==='cine'&&(e.key==='Escape'||e.key===' '||e.key==='Enter')){e.preventDefault();e.stopImmediatePropagation();skipCine9()}},true);
addEventListener('mousedown',()=>{if(gstate==='cine')skipCine9()},true);

// ---- guiones ----
function introCine9(){
  const cx=0,cz=0,cy=gy9(cx,cz);const store=[cx,cy+3,cz];
  playCine9('intro',[
    {d:6,from:()=>[70,cy+34,80],to:()=>[38,cy+16,48],look:()=>store,fov:48,text:'Hace meses que el mundo se pudrió.'},
    {d:6,from:()=>[-34,cy+5,22],to:()=>[-20,cy+3.5,-26],look:()=>[0,cy+2,0],fov:58,text:'Los podridos caminan de noche. Los dinosaurios volvieron a la tierra.'},
    {d:5.5,from:()=>[10,cy+2,36],to:()=>[2,cy+2.2,22],look:()=>[0,cy+2,0],fov:60,text:'Pero el almacén sigue en pie.'},
    {d:5,from:()=>[P.x+2,P.y+1.9,P.z+5],to:()=>[P.x+.4,P.y+1.75,P.z+1.4],look:()=>[P.x-Math.sin(P.yaw)*30,P.y+3,P.z-Math.cos(P.yaw)*30],fov:66,text:'Mientras haya mercadería, habrá un mañana.'}
  ])}
function bossCine9(e){
  const nm=(typeof EDEF!=='undefined'&&EDEF[e.type]&&EDEF[e.type].n)||'';
  const side=Math.atan2(P.x-e.x,P.z-e.z);
  playCine9('boss_'+e.type,[
    {d:4.2,from:()=>[e.x+Math.sin(side+.9)*17,gy9(e.x,e.z)+2.2,e.z+Math.cos(side+.9)*17],to:()=>[e.x+Math.sin(side-.5)*11,gy9(e.x,e.z)+2.6,e.z+Math.cos(side-.5)*11],look:()=>[e.x,gy9(e.x,e.z)+(e.mesh&&e.mesh.position?1.8:1.8),e.z],fov:50,text:'Algo enorme despertó…'}
  ])}
// la intro corre una sola vez, al empezar partida nueva
const _startGame9=startGame;
startGame=function(state){const r=_startGame9.apply(this,arguments);
  if(S&&S.day===1&&!(S.cine9&&S.cine9.intro)&&S.t<CYCLE()*.5)setTimeout(()=>{if(gstate==='play')try{introCine9()}catch(e){console.error(e)}},900);return r};
// jefes: primera vez que aparece uno cerca
let bossChk9=0;const bossSeen9={};
const _update9c=update;
update=function(dt){_update9c(dt);
  if(gstate!=='play'||(bossChk9-=dt)>0)return;bossChk9=.7;
  for(const e of enemies){const d=EDEF[e.type];if(!d||!(d.boss)||e.dead||e.dying||bossSeen9[e.type])continue;
    if(Math.hypot(e.x-P.x,e.z-P.z)<60){bossSeen9[e.type]=1;if(!P.inTruck)bossCine9(e);break}}};
