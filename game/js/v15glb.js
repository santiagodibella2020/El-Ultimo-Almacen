/* v0.15: zombis y raptores con modelos hechos en Blender (malla orgánica, esqueleto y animaciones) */
const GLB15T={ready:false,tpl:{}};
(function(){try{const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();let n=0;const ks=Object.keys(GLB15);
  ks.forEach(k=>ld.parse(b64(GLB15[k]),'',gl=>{gl.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.geometry.computeBoundingSphere();o.geometry.boundingSphere.radius*=1.6}});GLB15T.tpl[k]=gl;if(++n===ks.length)GLB15T.ready=true},err=>console.error('glb15',k,err)))}catch(e){console.error('glb15',e)}})();
const baseOf15=t=>{let k=t,i=0;while(EDEF[k]&&EDEF[k].base&&i++<4)k=EDEF[k].base;return k};
const HUM15={caminante:1,corredor:.95,bruto:1.35,griton:.95,soldado:1.05},RAP15={raptor:1,raptorp:1};
const CLOTH15=['#5a5f52','#6a5a48','#4a5562','#7a7468','#5a4a3a','#3a3a44','#6a6a5a','#7a5a4a'];
function glbMesh15(type){
  if(!GLB15T.ready)return null;const d=EDEF[type],b=baseOf15(type);
  const kind=HUM15[b]?'zombie':RAP15[b]?'raptor':null;if(!kind)return null;
  const tpl=GLB15T.tpl[kind];const inner=THREE.SkeletonUtils.clone(tpl.scene);
  const sc=(HUM15[b]||RAP15[b]||1);inner.scale.setScalar(sc);
  const mats=[];inner.traverse(o=>{if(o.isMesh){o.material=o.material.clone();mats.push(o.material)}});
  const tint=new THREE.Color();
  for(const m of mats){const nm=m.name;
    if(kind==='zombie'){
      if(nm==='cloth')m.color.set(b==='soldado'?'#4a5236':CLOTH15[R()*CLOTH15.length|0]);
      if(nm==='pants')m.color.set(b==='soldado'?'#3f4630':['#3a4250','#4a4238','#2f3238','#55503f'][R()*4|0]);
      if(nm==='skin')m.color.set(b==='corredor'?'#9aa07e':b==='bruto'?'#7b8a5e':b==='griton'?'#b0b49a':'#8b9a6e');
    }else{
      if(nm==='hide')m.color.set(type==='raptorp'?'#6a7a52':type==='escupidor'||type==='reina'?'#5a7a3a':type==='saltador'?'#9a7a3a':'#a08a5a');
    }
    if(d.tint&&nm!=='claw'){tint.set(d.tint);m.color.lerp(tint,d.boss?.5:.4)}
    m.emissive=new THREE.Color(0);m.roughness=Math.min(1,m.roughness+.05)}
  const g=new THREE.Group();g.add(inner);if(d.scale)g.scale.setScalar(d.scale);
  const mixer=new THREE.AnimationMixer(inner),acts={};
  for(const c of tpl.animations){acts[c.name]=mixer.clipAction(c)}
  ['attack','die'].forEach(k=>{if(acts[k]){acts[k].setLoop(THREE.LoopOnce);acts[k].clampWhenFinished=true}});
  acts.idle.play();
  g.userData={glb:kind,mixer,acts,cur:'idle',mats,meshes:[],root:inner,type:kind==='zombie'?'h':'r',legs:[],arms:[]};
  return g}
const _makeEnemyMesh15=makeEnemyMesh;
makeEnemyMesh=function(type){try{const g=glbMesh15(type);if(g)return g}catch(e){console.error('glb15 mesh',e)}return _makeEnemyMesh15(type)};
function play15(u,name,fade,speed){const a=u.acts[name];if(!a)return;if(speed!=null)a.timeScale=speed;if(u.cur===name)return;
  const prev=u.acts[u.cur];a.reset();a.play();if(prev)a.crossFadeFrom(prev,fade,false);u.cur=name}
const _animateEnemy15=animateEnemy;
animateEnemy=function(e,dt,sp){const m=e.mesh,u=m.userData;if(!u.glb)return _animateEnemy15(e,dt,sp);
  m.position.set(e.x,e.y,e.z);m.rotation.y=e.yaw;
  const vel=e.px15==null?0:Math.min(14,Math.hypot(e.x-e.px15,e.z-e.pz15)/Math.max(dt,1e-3));e.px15=e.x;e.pz15=e.z;
  e.vs15=(e.vs15||0)+(vel-(e.vs15||0))*Math.min(1,dt*8);const sc=(e.scale||1)*u.root.scale.x,v=e.vs15/sc;
  if(e.atk>.5&&u.cur!=='attack'&&!e.atk15){e.atk15=1;play15(u,'attack',.12,1.1)}
  if(e.atk<=.5)e.atk15=0;
  if(u.cur!=='attack'||!u.acts.attack.isRunning()){
    if(u.glb==='zombie'){if(v>2.4)play15(u,'run',.25,v/3.1);else if(v>.25)play15(u,'walk',.25,Math.max(.6,v/.75));else play15(u,'idle',.4,1)}
    else{if(v>3.5)play15(u,'run',.2,v/7);else if(v>.3)play15(u,'walk',.25,Math.max(.6,v/2.2));else play15(u,'idle',.4,1)}}
  const fl=e.flash>0||(e.hitT>0);for(const mm of u.mats)mm.emissive.setRGB(fl?.35:0,fl?.08:0,fl?.06:0);
  u.mixer.update(dt)};
const _die15=die6;
die6=function(e,dt){const m=e.mesh,u=m.userData;if(!u.glb)return _die15(e,dt);
  e.dying+=dt;const t=e.dying;if(u.cur!=='die')play15(u,'die',.15,1);
  for(const mm of u.mats)mm.emissive.setRGB(0,0,0);
  m.position.set(e.x,e.y-Math.max(0,t-2.4)*.5,e.z);m.rotation.y=e.yaw;u.mixer.update(dt);
  if(t>3.2){scene.remove(m);e.dead=true;for(const mm of u.mats)mm.dispose();if(u.root.traverse)u.root.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton&&o.skeleton.boneTexture){o.skeleton.boneTexture.dispose();o.skeleton.boneTexture=null}})}};
