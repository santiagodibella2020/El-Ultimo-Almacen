/* v0.15: zombis y raptores con modelos hechos en Blender (malla orgánica, esqueleto y animaciones) */
// Modelos de Quaternius: colores glTF (lineales) al espacio de color del juego, texturas sin conversión y sin metal.
function fixMat15(m){(Array.isArray(m)?m:[m]).forEach(m=>{if(!m)return;if(m.map){m.map.encoding=THREE.LinearEncoding;m.map.needsUpdate=true}else if(m.color)m.color.convertLinearToSRGB();if('metalness' in m)m.metalness=0;if('roughness' in m)m.roughness=Math.max(.75,m.roughness)})}
const GLB15T={ready:false,tpl:{}};
(function(){try{const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();let n=0;const ks=Object.keys(GLB15);
  ks.forEach(k=>ld.parse(b64(GLB15[k]),'',gl=>{gl.scene.traverse(o=>{if(o.isMesh){fixMat15(o.material);o.castShadow=true;o.receiveShadow=true;o.geometry.computeBoundingSphere();o.geometry.boundingSphere.radius*=1.6}});GLB15T.tpl[k]=gl;if(++n===ks.length)GLB15T.ready=true},err=>console.error('glb15',k,err)))}catch(e){console.error('glb15',e)}})();
const baseOf15=t=>{let k=t,i=0;while(EDEF[k]&&EDEF[k].base&&i++<4)k=EDEF[k].base;return k};
const HUM15={caminante:1,corredor:.95,bruto:1.35,griton:.95,soldado:1.05},RAP15={raptor:1,raptorp:1};
/* v0.16: hinchado, Rex y cuadrúpedos */
const EXT16={hinchado:['hinchado',1],rex:['rex',3],cornudo:['cornudo',1],acorazado:['acorazado',1]};
const CLOTH15=['#5a5f52','#6a5a48','#4a5562','#7a7468','#5a4a3a','#3a3a44','#6a6a5a','#7a5a4a'];
function glbMesh15(type){
  if(!GLB15T.ready)return null;const d=EDEF[type],b=baseOf15(type);
  const ext=EXT16[type]||EXT16[b];const kind=ext?ext[0]:HUM15[b]?'zombie':RAP15[b]?'raptor':null;if(!kind||!GLB15T.tpl[kind])return null;
  const tpl=GLB15T.tpl[kind];const inner=THREE.SkeletonUtils.clone(tpl.scene);
  const sc=ext?ext[1]:(HUM15[b]||RAP15[b]||1);inner.scale.setScalar(sc);
  const mats=[];inner.traverse(o=>{if(o.isMesh){o.material=o.material.clone();mats.push(o.material)}});
  const tint=new THREE.Color();
  for(const m of mats){const nm=m.name;
    if(kind==='hinchado'){
      if(m.map)m.color.set('#b8c890');
      if(nm==='cloth')m.color.set(['#6a6450','#5a5a4a','#7a6a50'][R()*3|0]);if(nm==='pants')m.color.set('#3a3a34');if(nm==='skin')m.color.set('#9aa070');
    }else if(kind==='rex'){if(nm==='hide')m.color.set('#6a5a44');
    }else if(kind==='cornudo'||kind==='acorazado'){if(nm==='hide')m.color.set(kind==='cornudo'?'#7a6a52':'#5a5a46');
    }else if(kind==='zombie'){
      // modelo con textura: un tinte suave para que no sean todos iguales
      if(m.map){m.color.set(b==='soldado'?'#8a9a70':CLOTH15[R()*CLOTH15.length|0]).lerp(new THREE.Color(1,1,1),.55);if(b==='bruto')m.color.multiplyScalar(.85)}
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
  g.userData={glb:kind,mixer,acts,cur:'idle',mats,meshes:[],root:inner,type:(kind==='zombie'||kind==='hinchado')?'h':'r',legs:[],arms:[]};
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
    if(u.glb==='cornudo'||u.glb==='acorazado'){if(v>3)play15(u,'run',.25,v/5);else if(v>.2)play15(u,'walk',.25,Math.max(.6,v/1.8));else play15(u,'idle',.4,1)}
    else if(u.glb==='rex'){if(v>2.2)play15(u,'run',.25,v/2.6);else if(v>.15)play15(u,'walk',.25,Math.max(.6,v/.9));else play15(u,'idle',.4,1)}
    else if(u.glb==='zombie'||u.glb==='hinchado'){if(v>2.4)play15(u,'run',.25,v/3.1);else if(v>.25)play15(u,'walk',.25,Math.max(.6,v/.75));else play15(u,'idle',.4,1)}
    else{if(v>3.5)play15(u,'run',.2,v/7);else if(v>.3)play15(u,'walk',.25,Math.max(.6,v/2.2));else play15(u,'idle',.4,1)}}
  const fl=e.flash>0||(e.hitT>0);for(const mm of u.mats)mm.emissive.setRGB(fl?.35:0,fl?.08:0,fl?.06:0);
  u.mixer.update(dt)};
const _die15=die6;
die6=function(e,dt){const m=e.mesh,u=m.userData;if(!u.glb)return _die15(e,dt);
  e.dying+=dt;const t=e.dying;if(u.cur!=='die')play15(u,'die',.15,1);
  for(const mm of u.mats)mm.emissive.setRGB(0,0,0);
  m.position.set(e.x,e.y-Math.max(0,t-2.4)*.5,e.z);m.rotation.y=e.yaw;u.mixer.update(dt);
  if(t>3.2){scene.remove(m);e.dead=true;for(const mm of u.mats)mm.dispose();if(u.root.traverse)u.root.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton&&o.skeleton.boneTexture){o.skeleton.boneTexture.dispose();o.skeleton.boneTexture=null}})}};

/* v0.16: la gente de los pueblos con el modelo humano de Blender */
function npcGlb16(id){if(!GLB15T.ready||!GLB15T.tpl.human)return null;const d=NPC6[id],[cl,sk,pa]=d.look,tpl=GLB15T.tpl.human;
  const inner=THREE.SkeletonUtils.clone(tpl.scene),mats=[];
  inner.traverse(o=>{if(o.isMesh){o.material=o.material.clone();mats.push(o.material);const n=o.material.name;if(n==='cloth')o.material.color.set(cl);else if(n==='skin')o.material.color.set(sk);else if(n==='pants')o.material.color.set(pa);o.material.emissive=new THREE.Color(0)}});
  let head=null,chest=null;inner.traverse(o=>{if(o.isBone){if(o.name==='head')head=o;if(o.name==='chest')chest=o}});
  const g=new THREE.Group();g.add(inner);const acc=new THREE.Group(),lo=new THREE.Group();
  const B=(w,h,dd,c,x,y,z,top)=>{const hd=top!==false&&y>1.52;return bx(w*.8,h,dd*.78,c,x*.8,y,z*(hd?.72:.85),hd?acc:lo)};
  const a=d.acc;
  if(a==='shawl'){B(.58,.32,.34,'#5a3a4a',0,1.36,0);B(.33,.12,.33,'#b8b4aa',0,1.86,-.02);B(.14,.14,.14,'#b8b4aa',0,1.9,-.15)}
  else if(a==='veil'){B(.34,.42,.26,'#1e1e26',0,1.74,-.08);B(.32,.05,.06,'#e8e8e0',0,1.85,.1);B(.06,.06,.02,'#c8b060',0,1.32,.15)}
  else if(a==='cap'){B(.33,.1,.33,'#2a3a6a',0,1.87,0);B(.3,.03,.16,'#2a3a6a',0,1.83,.2);B(.06,.6,.02,'#2a3440',-.15,1.2,.145);B(.06,.6,.02,'#2a3440',.15,1.2,.145)}
  else if(a==='phones'){B(.07,.14,.14,'#222',-.18,1.7,0);B(.07,.14,.14,'#222',.18,1.7,0);B(.38,.04,.06,'#222',0,1.87,0);B(.3,.1,.31,'#3a2a20',0,1.85,-.02)}
  else if(a==='hat'){B(.6,.04,.6,'#5a4228',0,1.84,0);B(.33,.16,.33,'#5a4228',0,1.93,0);B(.08,.7,.06,'#3a2a1a',.12,1.15,-.17).rotation.z=.6}
  else if(a==='beard'){B(.56,.04,.56,'#8a7a5a',0,1.84,0);B(.33,.14,.33,'#8a7a5a',0,1.92,0);B(.28,.16,.06,'#d8d4cc',0,1.6,.15)}
  else if(a==='scarf'){B(.34,.42,.12,'#7a3a22',0,1.58,-.15,false);B(.33,.1,.33,'#7a3a22',0,1.85,-.01);B(.42,.12,.34,'#c8a03a',0,1.46,0)}
  inner.add(acc);inner.add(lo);inner.updateMatrixWorld(true);if(head)head.attach(acc);if(chest)chest.attach(lo);
  [acc,lo].forEach(q=>q.traverse(o=>{if(o.isMesh)o.castShadow=true}));
  const mixer=new THREE.AnimationMixer(inner),acts={};for(const c of tpl.animations)acts[c.name]=mixer.clipAction(c);
  acts.idle.play();acts.idle.time=R()*2;
  g.userData={glb:'human',mixer,acts,cur:'idle',mats,root:inner,legs:[],arms:[]};return g}
const _npcModel16=npcModel6;
npcModel6=function(id){try{const g=npcGlb16(id);if(g)return g}catch(e){console.error('npc16',e)}return _npcModel16(id)};
const _updateNpcs16=updateNpcs6;
updateNpcs6=function(dt){const old=[];
  for(const n of npcs6){if(!n.mesh)continue;const u=n.mesh.userData;if(u.glb!=='human'){old.push(n);continue}
    const dx=P.x-n.x,dz=P.z-n.z;if(Math.abs(dx)>70||Math.abs(dz)>70){n.mesh.visible=false;continue}n.mesh.visible=true;
    const d=Math.hypot(dx,dz),want=d<9?Math.atan2(dx,dz):n.baseYaw,dy=clamp(angDiff(n.yaw,want),-2.5*dt,2.5*dt);n.yaw+=dy;n.mesh.rotation.y=n.yaw;
    play15(u,Math.abs(dy)>.02?'walk':'idle',.35,Math.abs(dy)>.02?.6:1);u.mixer.update(dt)}
  if(old.length){const all=npcs6.slice();npcs6.length=0;npcs6.push(...old);try{_updateNpcs16(dt)}finally{npcs6.length=0;npcs6.push(...all)}}};
// si los modelos terminan de cargar después de crear el mundo, cambiar los NPC ya colocados
const _upd16=update;
update=function(dt){_upd16(dt);if(GLB15T.ready&&typeof npcs6!=='undefined'&&!update.npc16){update.npc16=1;for(const n of npcs6){if(n.mesh&&n.mesh.userData.glb!=='human'&&n.mesh.parent){const p=n.mesh.parent,m=npcModel6(n.id);if(m.userData.glb==='human'){p.remove(n.mesh);m.position.copy(n.mesh.position);m.rotation.y=n.yaw;n.mesh=m;p.add(m)}}}}};
