'use strict';
// ================= UTILS =================
const $=id=>document.getElementById(id);
const T3=window.THREE;
let R=Math.random;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rint=(a,b)=>a+Math.floor(R()*(b-a+1));
const fmt=n=>Math.round(n).toLocaleString(LOCALES[LANG]||'es-AR');
const kg=n=>(Math.round(n*10)/10).toLocaleString(LOCALES[LANG]||'es-AR');
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const angDiff=(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function makeNoise(seed){const rng=mulberry32(seed),p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=rng()*(i+1)|0;[p[i],p[j]]=[p[j],p[i]]}const perm=new Uint8Array(512);for(let i=0;i<512;i++)perm[i]=p[i&255];const val=new Float32Array(256);for(let i=0;i<256;i++)val[i]=rng();
  const v=(ix,iz)=>val[perm[(ix&255)+perm[iz&255]]];
  return(x,z)=>{const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,sx=fx*fx*(3-2*fx),sz=fz*fz*(3-2*fz);const a=v(ix,iz),b=v(ix+1,iz),c=v(ix,iz+1),d=v(ix+1,iz+1);return a+(b-a)*sx+(c-a)*sz+(a-b-c+d)*sx*sz}}
function fbm(n,x,z,o=4){let s=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){s+=a*n(x*f+i*17.3,z*f-i*9.1);t+=a;a*=.5;f*=2}return s/t}
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
const IS_DESKTOP=/Electron/i.test(navigator.userAgent);

// ================= SETTINGS =================
const DEF_SETTINGS={sens:1,sensAds:1,invertY:false,qual:'alta',res:1,fov:72,bright:1,grain:true,filter:true,cam:'fp',vol:.8,sfx:1,amb:.7,lang:null,hints:true};
let settings=Object.assign({},DEF_SETTINGS);
try{const old=JSON.parse(lsGet(SET_KEY)||'{}');if(old.snd==='0'){old.vol=0}delete old.snd;Object.assign(settings,old)}catch(e){}
if(!settings.lang)settings.lang=detectLang();
LANG=settings.lang;
const saveSettings=()=>lsSet(SET_KEY,JSON.stringify(settings));

// ================= RENDERER =================
const cv=$('game');
const renderer=new T3.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.shadowMap.enabled=settings.qual==='alta';renderer.shadowMap.type=T3.PCFSoftShadowMap;renderer.autoClear=false;
const scene=new T3.Scene();
const camera=new T3.PerspectiveCamera(72,1,.1,900);camera.rotation.order='YXZ';scene.add(camera);
const wScene=new T3.Scene(),wCam=new T3.PerspectiveCamera(60,1,.01,10);
const hemi=new T3.HemisphereLight(0xc8d4c0,0x3a3020,.6);scene.add(hemi);
const sun=new T3.DirectionalLight(0xfff0d0,.9);sun.castShadow=settings.qual==='alta';sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-55;sc.right=55;sc.top=55;sc.bottom=-55;sc.near=1;sc.far=400;sun.shadow.bias=-.0006;scene.add(sun);scene.add(sun.target);
// The flashlight rides on a rig that follows the camera in first person and the body in isometric view.
const flashRig=new T3.Object3D();scene.add(flashRig);
const flash=new T3.SpotLight(0xfff2d6,0,48,.42,.45,1.2);flashRig.add(flash);flash.position.set(.2,-.15,0);const flashTarget=new T3.Object3D();flashRig.add(flashTarget);flashTarget.position.set(0,0,-10);flash.target=flashTarget;
const muzzleLight=new T3.PointLight(0xffc070,0,14,2);scene.add(muzzleLight);
const wAmb=new T3.AmbientLight(0xffffff,.55);wScene.add(wAmb);const wDir=new T3.DirectionalLight(0xffffff,.6);wDir.position.set(1,2,1);wScene.add(wDir);
scene.fog=new T3.FogExp2(0x9fb0aa,.006);
function applyQuality(){
  const hi=settings.qual==='alta';renderer.shadowMap.enabled=hi;sun.castShadow=hi;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,settings.qual==='baja'?1:1.5)*settings.res);
  camera.far=settings.qual==='baja'?320:settings.qual==='media'?560:900;camera.updateProjectionMatrix();
  scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});resize();applyPost()}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();wCam.aspect=w/h;wCam.updateProjectionMatrix()}
addEventListener('resize',resize);
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)*settings.res);resize();

const BOX=new T3.BoxGeometry(1,1,1),CYL=new T3.CylinderGeometry(.5,.5,1,8),CONE=new T3.ConeGeometry(.5,1,6);
const MATS={};function mat(c,o){const k=c+(o?JSON.stringify(o):'');return MATS[k]||(MATS[k]=new T3.MeshLambertMaterial(Object.assign({color:c},o||{})))}
const WHITE=new T3.MeshBasicMaterial({color:0xfff4e0});
function bx(w,h,d,c,x,y,z,parent,geo){const m=new T3.Mesh(geo||BOX,typeof c==='string'||typeof c==='number'?mat(c):c);m.scale.set(w,h,d);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;if(parent)parent.add(m);return m}
function grp(x,y,z,parent){const g=new T3.Group();g.position.set(x||0,y||0,z||0);if(parent)parent.add(g);return g}

// ================= POST FX (film grain, vignette, color grade) =================
const grainC=$('grain'),grainX=grainC.getContext('2d');let grainT=0;
function drawGrain(){const w=grainC.width,h=grainC.height,id=grainX.createImageData(w,h),d=id.data;for(let i=0;i<d.length;i+=4){const v=R()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}grainX.putImageData(id,0,0)}
function applyPost(){
  const f=[];if(settings.filter)f.push('saturate(.78)','contrast(1.07)','sepia(.08)');if(settings.bright!==1)f.push(`brightness(${settings.bright})`);
  cv.style.filter=f.join(' ');grainC.hidden=!settings.grain;$('vbase').hidden=!settings.filter}
function tickGrain(dt){if(!settings.grain)return;grainT-=dt;if(grainT<=0){grainT=.05;drawGrain();grainC.style.transform=`translate(${(R()*-40)|0}px,${(R()*-40)|0}px)`}}

// ================= AUDIO =================
let AC=null,NB=null,MASTER=null,SFXG=null,AMBG=null,engine=null,rainSnd=null,windSnd=null;
function initAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();MASTER=AC.createGain();MASTER.connect(AC.destination);SFXG=AC.createGain();SFXG.connect(MASTER);AMBG=AC.createGain();AMBG.connect(MASTER);applyVolume();
  const len=AC.sampleRate*2|0;NB=AC.createBuffer(1,len,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<len;i++)d[i]=R()*2-1;
  const loop=(freq,type)=>{const s=AC.createBufferSource();s.buffer=NB;s.loop=true;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(AMBG);s.start();return g};
  rainSnd=loop(2600,'highpass');windSnd=loop(380,'lowpass')}catch(e){AC=null}}
function applyVolume(){if(!AC)return;MASTER.gain.value=.5*settings.vol;SFXG.gain.value=settings.sfx;AMBG.gain.value=settings.amb}
function ambient(rain,wind){if(!AC)return;rainSnd.gain.setTargetAtTime(rain*.12,AC.currentTime,.5);windSnd.gain.setTargetAtTime(wind*.1,AC.currentTime,.8)}
function nz(dur,freq,vol,delay=0,type='lowpass'){const t=AC.currentTime+delay;const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(SFXG);s.start(t,R()*1.5);s.stop(t+dur+.05)}
function tn(f0,f1,dur,type,vol,delay=0){const t=AC.currentTime+delay;const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(f1,20),t+dur);const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(SFXG);o.start(t);o.stop(t+dur+.05)}
function sfx(k,x,z){if(!AC)return;let v=1;if(x!==undefined){const d=Math.hypot(x-P.x,z-P.z);v=Math.max(0,1-d/110);if(v<.03)return}
  try{switch(k){
  case 'pistola':nz(.14,2400,.6*v);tn(180,60,.08,'square',.12*v);break;
  case 'revolver':nz(.22,1800,.8*v);tn(150,50,.14,'square',.2*v);break;
  case 'escopeta':nz(.35,1000,.95*v);tn(95,35,.22,'square',.28*v);break;
  case 'rifle':nz(.4,3200,.85*v);tn(140,40,.25,'sawtooth',.25*v);nz(.6,500,.2*v,.08);break;
  case 'fusil':nz(.1,2800,.55*v);tn(160,70,.06,'square',.12*v);break;
  case 'turret':nz(.09,2600,.3*v);break;
  case 'hit':tn(260,120,.05,'square',.06*v);break;
  case 'head':tn(1800,1800,.08,'sine',.16);tn(2400,2400,.12,'sine',.1,.03);break;
  case 'kill':nz(.14,500,.28*v);tn(90,50,.12,'sine',.18*v);break;
  case 'swing':nz(.14,3500,.25*v,0,'highpass');break;
  case 'blunt':nz(.1,600,.45*v);tn(140,60,.08,'sine',.2*v);break;
  case 'break':nz(.3,1600,.5);tn(400,90,.25,'square',.12);break;
  case 'chop':nz(.1,900,.4);tn(320,180,.06,'triangle',.15);break;
  case 'tree':nz(.8,400,.5);tn(90,40,.6,'sawtooth',.12);break;
  case 'empty':tn(1300,1300,.03,'square',.06);break;
  case 'reload':tn(900,900,.03,'square',.07);tn(600,600,.04,'square',.07,.3);tn(1100,1100,.03,'square',.07,.6);break;
  case 'hurt':tn(150,70,.2,'sawtooth',.22);break;
  case 'groan':tn(95+R()*30,55,.7,'sawtooth',.09*v);break;
  case 'shriek':tn(700,1500,.18,'sawtooth',.1*v);tn(1300,500,.22,'square',.06*v,.12);break;
  case 'roar':tn(120,40,1.4,'sawtooth',.5*v);nz(1.2,300,.4*v);break;
  case 'bellow':tn(160,70,.9,'sawtooth',.2*v);break;
  case 'coin':tn(1050,1050,.06,'sine',.12);tn(1580,1580,.09,'sine',.1,.06);break;
  case 'crate':nz(.2,700,.35);tn(200,120,.1,'triangle',.12);break;
  case 'door':nz(.25,500,.25);tn(180,140,.2,'triangle',.08);break;
  case 'pickup':tn(660,880,.06,'triangle',.08);break;
  case 'wall':nz(.14,380,.4*v);break;
  case 'level':[523,659,784,1046].forEach((f,i)=>tn(f,f,.16,'triangle',.12,i*.09));break;
  case 'skill':[659,880].forEach((f,i)=>tn(f,f,.14,'triangle',.1,i*.08));break;
  case 'goal':[392,523,659,784,1046].forEach((f,i)=>tn(f,f,.2,'triangle',.12,i*.08));break;
  case 'dig':nz(.12,1200,.18);break;
  case 'eat':nz(.08,1500,.15);nz(.08,1500,.15,.15);break;
  case 'step':nz(.05,500,.05);break;
  case 'jump':nz(.08,700,.08);break;
  case 'crash':nz(.4,600,.7*v);tn(80,40,.3,'square',.25*v);break;
  case 'thud':nz(.2,300,.5*v);tn(70,40,.2,'sine',.3*v);break;
  case 'build':nz(.12,800,.3);nz(.12,800,.3,.15);break;
  case 'night':tn(80,55,2.4,'sawtooth',.2);tn(120,90,2.4,'sine',.12);break;
  case 'dawn':[392,523,659].forEach((f,i)=>tn(f,f,.5,'sine',.08,i*.18));break;
  case 'tame':[523,784,1046,1318].forEach((f,i)=>tn(f,f,.2,'sine',.12,i*.1));break;
  case 'thunder':nz(2.2,180,.6);nz(1.2,700,.3,.1);break;
  case 'click':tn(1200,1200,.02,'square',.04);break;
  }}catch(e){}
}
function engineSound(on,speed){if(!AC)return;if(on&&!engine){const o=AC.createOscillator();o.type='sawtooth';const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=380;const g=AC.createGain();g.gain.value=.05;o.connect(f);f.connect(g);g.connect(SFXG);o.start();engine={o,g}}
  if(engine){if(!on){engine.g.gain.setTargetAtTime(0,AC.currentTime,.1);const e=engine;setTimeout(()=>{try{e.o.stop()}catch(err){}},400);engine=null}else engine.o.frequency.setTargetAtTime(38+Math.abs(speed)*4.2,AC.currentTime,.08)}}
