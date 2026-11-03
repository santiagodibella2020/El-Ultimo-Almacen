'use strict';
// ================= MODELS =================
function humanoid(cloth,skin,pants,zombie,scale=1){
  const g=new T3.Group(),b=grp(0,0,0,g);b.scale.setScalar(scale);
  const torso=bx(.5,.65,.28,cloth,0,1.17,0,b);bx(.52,.2,.3,pants,0,.86,0,b);
  bx(.3,.32,.3,skin,0,1.68,zombie?.06:0,b);if(zombie){bx(.06,.06,.02,'#c8f08a',-.07,1.71,.22,b);bx(.06,.06,.02,'#c8f08a',.07,1.71,.22,b);if(R()<.5)bx(.2,.18,.02,'#5a1e16',.08,1.2,.15,b)}
  const legL=grp(-.13,.82,0,b),legR=grp(.13,.82,0,b);bx(.19,.82,.21,pants,0,-.41,0,legL);bx(.19,.82,.21,pants,0,-.41,0,legR);
  const armL=grp(-.34,1.44,0,b),armR=grp(.34,1.44,0,b);bx(.14,.64,.15,zombie?skin:cloth,0,-.32,0,armL);bx(.14,.64,.15,zombie?skin:cloth,0,-.32,0,armR);
  if(zombie){armL.rotation.x=-1.35;armR.rotation.x=-1.5;torso.rotation.x=.12}
  g.userData={legs:[legL,legR],arms:[armL,armR],root:b,type:'h'};return g}
function raptorModel(rot){
  const g=new T3.Group(),b=grp(0,0,0,g);const c1=rot?'#56634e':'#7d6a3c',c2=rot?'#3c4636':'#5a4a28';
  bx(.5,.55,1.2,c1,0,.92,0,b);const neck=bx(.24,.32,.55,c1,0,1.15,.7,b);neck.rotation.x=-.6;const head=grp(0,1.38,.98,b);bx(.3,.3,.6,c1,0,0,.1,head);bx(.24,.1,.45,c2,0,-.15,.15,head);
  if(!rot){bx(.05,.05,.05,'#d8b347',-.14,.06,.2,head);bx(.05,.05,.05,'#d8b347',.14,.06,.2,head)}else{bx(.32,.05,.4,'#cfc8a6',0,.16,.05,head)}
  const tail=grp(0,.98,-.55,b);bx(.3,.3,.8,c1,0,0,-.4,tail);const t2=grp(0,0,-.8,tail);bx(.18,.18,.9,c2,0,0,-.45,t2);
  const legL=grp(-.2,.85,.05,b),legR=grp(.2,.85,.05,b);[legL,legR].forEach(l=>{bx(.18,.5,.28,c2,0,-.25,0,l);bx(.12,.4,.12,c2,0,-.62,.08,l);bx(.16,.06,.3,c2,0,-.82,.18,l)});
  bx(.1,.3,.1,c2,-.2,.95,.55,b);bx(.1,.3,.1,c2,.2,.95,.55,b);
  for(let i=0;i<3;i++)bx(.52,.06,.12,rot?'#cfc8a6':'#4a3a1c',0,1.2,-.35+i*.35,b);
  g.userData={legs:[legL,legR],tail,tail2:t2,head,root:b,type:'r'};return g}
function cornudoModel(){
  const g=new T3.Group(),b=grp(0,0,0,g);const c1='#6d5a4a',c2='#4e3f33';
  bx(1.7,1.5,3.2,c1,0,1.45,0,b);const head=grp(0,1.35,1.85,b);bx(1.1,.95,1.2,c1,0,0,.2,head);bx(2,1.5,.2,'#8a6a52',0,.45,-.35,head);
  [[-.35,.35],[.35,.35]].forEach(([x,y])=>{const h=bx(.14,1.1,.14,'#e8dcc0',x,y,.95,head,CONE);h.rotation.x=Math.PI/2});const nh=bx(.14,.5,.14,'#e8dcc0',0,-.05,.95,head,CONE);nh.rotation.x=Math.PI/2.3;
  const legs=[];[[-.6,.9],[.6,.9],[-.6,-1],[.6,-1]].forEach(([x,z])=>{const l=grp(x,1,z,b);bx(.45,1.1,.45,c2,0,-.5,0,l);legs.push(l)});
  const tail=grp(0,1.4,-1.6,b);bx(.6,.5,1.6,c1,0,0,-.7,tail);
  g.userData={legs,tail,head,root:b,type:'c'};return g}
function rexModel(){
  const g=new T3.Group(),b=grp(0,0,0,g);const c1='#4f5a48',c2='#353d30';
  bx(1.8,2,3.6,c1,0,3.2,0,b);const neck=bx(1.1,1.2,1.3,c1,0,3.9,1.9,b);neck.rotation.x=-.4;
  const head=grp(0,4.3,2.6,b);bx(1.3,1.2,2.2,c1,0,0,.5,head);const jaw=grp(0,-.5,-.3,head);bx(1.1,.4,2,c2,0,0,.85,jaw);
  for(let i=0;i<6;i++){bx(.08,.25,.08,'#e8e0c8',-.5,-.15,.4+i*.3,head);bx(.08,.25,.08,'#e8e0c8',.5,-.15,.4+i*.3,head)}
  bx(.12,.12,.12,'#b8f070',-.6,.25,.9,head);bx(.12,.12,.12,'#b8f070',.6,.25,.9,head);
  for(let i=-1;i<=1;i++)bx(1.9,.12,.3,'#cfc8a8',0,3.5,i*.9,b);
  const tail=grp(0,3.2,-1.8,b);bx(1,1,2.6,c1,0,0,-1.2,tail);const t2=grp(0,0,-2.5,tail);bx(.6,.6,2.8,c2,0,0,-1.3,t2);
  const legL=grp(-.7,2.6,0,b),legR=grp(.7,2.6,0,b);[legL,legR].forEach(l=>{bx(.7,1.6,1,c2,0,-.7,0,l);bx(.45,1.1,.45,c2,0,-1.8,.2,l);bx(.6,.2,1,c2,0,-2.5,.4,l)});
  bx(.2,.6,.2,c2,-.6,3.3,1.6,b);bx(.2,.6,.2,c2,.6,3.3,1.6,b);
  g.userData={legs:[legL,legR],tail,tail2:t2,head,jaw,root:b,type:'x'};return g}
function acorazadoModel(){
  const g=new T3.Group(),b=grp(0,0,0,g);const c1='#5a5a46',c2='#3e3e30',pl='#8a8670';
  bx(1.9,1,2.8,c1,0,1.05,0,b);for(let i=0;i<4;i++)for(let j=-1;j<=1;j++)bx(.42,.22,.5,pl,j*.6,1.62,-1+i*.66,b);
  for(let i=0;i<5;i++){const sp=bx(.12,.45,.12,'#d8d0b8',(i%2?-.98:.98),1.3,-1.1+i*.55,b,CONE);sp.rotation.z=(i%2?1:-1)*1.2}
  const head=grp(0,.95,1.55,b);bx(.8,.6,.8,c1,0,0,.2,head);bx(.9,.15,.5,pl,0,.35,.1,head);bx(.08,.08,.04,'#b8f070',-.25,.1,.62,head);bx(.08,.08,.04,'#b8f070',.25,.1,.62,head);
  const legs=[];[[-.75,.9],[.75,.9],[-.75,-.9],[.75,-.9]].forEach(([x,z])=>{const l=grp(x,.6,z,b);bx(.4,.65,.4,c2,0,-.3,0,l);legs.push(l)});
  const tail=grp(0,1,-1.4,b);bx(.4,.35,1.6,c1,0,0,-.75,tail);bx(.8,.5,.6,pl,0,0,-1.6,tail);
  g.userData={legs,tail,head,root:b,type:'c'};return g}
function escupidorModel(){
  const m=raptorModel(false);const u=m.userData;
  m.traverse(o=>{if(o.isMesh){const h=o.material.color.getHexString();if(h==='7d6a3c')o.material=mat('#5a6a3a');else if(h==='5a4a28')o.material=mat('#3e4a28')}});
  for(let i=-1;i<=1;i+=2){const f=bx(.04,.55,.45,'#c8a03a',i*.2,.05,-.05,u.head);f.rotation.z=i*.7}
  bx(.06,.22,.5,'#b84a2a',0,.25,0,u.head);return m}
function tintModel(m,tint,amt){const tc=new T3.Color(tint);m.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&!o.material.isMeshBasicMaterial){const c=o.material.color.clone().lerp(tc,amt);o.material=mat('#'+c.getHexString())}})}
function baseMesh(type){
  switch(type){
  case 'caminante':return humanoid(['#4d5546','#5a4a3a','#3f4a52','#5a5a4a','#6a5a4a','#3a3a44'][R()*6|0],'#8b9a6e',['#2f3328','#3a3a44','#4a3a2a'][R()*3|0],true);
  case 'corredor':return humanoid('#6f6a55','#9aa57a','#3a3a30',true,.95);
  case 'bruto':return humanoid('#4a4f3c','#7b8a5e','#2a2d22',true,1.4);
  case 'griton':{const m=humanoid('#6a6458','#a8b090','#3a3a30',true,.95);const r=m.userData.root;bx(.16,.14,.04,'#3a0e0a',0,1.6,.22,r);m.userData.arms.forEach(a=>a.rotation.x=-2.6);m.userData.screamer=true;return m}
  case 'hinchado':{const m=humanoid('#5a5a3a','#9aa060','#3a3a2a',true,1.1);const r=m.userData.root;bx(.75,.8,.7,'#8a9a4a',0,1.15,.12,r,new T3.SphereGeometry(.55,8,6));for(let i=0;i<4;i++)bx(.14,.14,.14,'#c8d06a',(R()-.5)*.6,1+R()*.5,.5,r);return m}
  case 'soldado':{const m=humanoid('#4a5236','#7b8a5e','#3a3f2a',true,1.05);const r=m.userData.root;bx(.36,.14,.36,'#3a4030',0,1.88,.04,r);bx(.56,.5,.34,'#2f3526',0,1.2,0,r);return m}
  case 'raptor':return raptorModel(false);case 'raptorp':return raptorModel(true);
  case 'escupidor':return escupidorModel();
  case 'cornudo':return cornudoModel();case 'acorazado':return acorazadoModel();
  default:return rexModel()}}
const MODEL_KEYS=['caminante','corredor','bruto','griton','hinchado','soldado','raptor','raptorp','escupidor','cornudo','acorazado','rex'];
const modelKey=t=>MODEL_KEYS.includes(t)?t:modelKey(EDEF[t].base);
const hitKey=t=>HIT[t]?t:hitKey(EDEF[t].base);
function makeEnemyMesh(type){
  const d=EDEF[type];const m=baseMesh(modelKey(type));
  if(d.tint)tintModel(m,d.tint,d.boss?.5:.4);
  if(type==='saltador')tintModel(m,'#8a6a2a',.35);
  if(d.scale)m.scale.setScalar(d.scale);
  if(d.mini||d.boss){const r=m.userData.root;const eye=new T3.MeshBasicMaterial({color:d.kind==='d'?0xffb030:0xb8ff70});m.traverse(o=>{if(o.isMesh&&o.material.color&&['c8f08a','b8f070','d8b347'].includes(o.material.color.getHexString()))o.material=eye})}
  const meshes=[];m.traverse(o=>{if(o.isMesh){o.userData.base=o.material;meshes.push(o)}});m.userData.meshes=meshes;return m}
// hit spheres (local, forward = +z)
const HIT={
  caminante:{head:[0,1.68,.06,.21],body:[[0,1.15,0,.36],[0,.55,0,.3]]},
  corredor:{head:[0,1.6,.06,.2],body:[[0,1.1,0,.34],[0,.52,0,.3]]},
  bruto:{head:[0,2.35,.08,.29],body:[[0,1.62,0,.5],[0,.77,0,.42]]},
  raptor:{head:[0,1.38,1.05,.26],body:[[0,.92,0,.5],[0,1.1,.6,.25]]},
  raptorp:{head:[0,1.38,1.05,.26],body:[[0,.92,0,.5],[0,1.1,.6,.25]]},
  cornudo:{head:[0,1.4,2.05,.65],body:[[0,1.45,.4,1],[0,1.45,-.8,1]]},
  griton:{head:[0,1.6,.06,.2],body:[[0,1.1,0,.34],[0,.52,0,.3]]},
  hinchado:{head:[0,1.85,.07,.23],body:[[0,1.25,.1,.55],[0,.6,0,.33]]},
  soldado:{head:[0,1.8,.06,.22],body:[[0,1.22,0,.38],[0,.58,0,.32]]},
  acorazado:{head:[0,1,1.75,.45],body:[[0,1.2,.5,.95],[0,1.2,-.6,.95]]},
  rex:{head:[0,4.3,3,.95],body:[[0,3.2,0,1.6],[0,3.9,1.8,.9],[0,1.6,0,.9]]},
};

// Weapon props: the same shapes serve the first-person viewmodel and the hand of the body in isometric view.
function weaponShape(k,g){
  const dark='#1e2022',metal='#3a3d40',wood='#6b4a2c',steel='#bfc4c6',grip='#3a2b1d';
  switch(k){
  case 'pistola':bx(.06,.11,.26,dark,0,0,-.05,g);bx(.055,.15,.07,metal,0,-.1,.04,g).rotation.x=.2;bx(.012,.02,.02,'#e3a33b',0,.065,-.15,g);break;
  case 'revolver':bx(.05,.06,.3,metal,0,.02,-.12,g);bx(.08,.08,.1,'#55585c',0,0,0,g,CYL).rotation.x=Math.PI/2;bx(.05,.14,.07,wood,0,-.1,.06,g).rotation.x=.3;break;
  case 'escopeta':bx(.07,.08,.75,dark,0,0,-.25,g);bx(.08,.07,.3,wood,0,-.06,-.3,g);bx(.075,.13,.28,wood,0,-.05,.22,g);bx(.04,.04,.6,metal,0,.05,-.3,g);break;
  case 'rifle':{bx(.06,.07,.85,dark,0,0,-.3,g);bx(.07,.1,.45,wood,0,-.05,.15,g);const sc=bx(.06,.06,.32,'#111',0,.09,-.12,g,CYL);sc.rotation.x=Math.PI/2;bx(.05,.12,.06,metal,0,-.09,0,g);break}
  case 'fusil':bx(.06,.09,.7,'#2a2c2a',0,0,-.25,g);bx(.05,.18,.08,'#2a2c2a',0,-.12,-.15,g).rotation.x=.25;bx(.06,.1,.25,'#2a2c2a',0,-.02,.2,g);bx(.03,.03,.25,metal,0,.01,-.7,g);bx(.03,.05,.12,metal,0,.08,-.1,g);break;
  case 'cuchillo':bx(.015,.04,.22,steel,0,0,-.18,g);bx(.03,.04,.12,grip,0,0,0,g);break;
  case 'sarten':bx(.03,.03,.3,'#222',0,0,0,g);bx(.28,.04,.28,'#2a2a2a',0,0,-.28,g,CYL);break;
  case 'bate':{const b=bx(.07,.75,.07,'#a8875a',0,0,-.3,g,CYL);b.rotation.x=Math.PI/2;b.scale.set(.09,.75,.09);break}
  case 'martillo':bx(.03,.03,.36,grip,0,0,-.08,g);bx(.06,.14,.06,metal,0,0,-.28,g);break;
  case 'palanca':bx(.03,.03,.7,'#7a2a22',0,0,-.25,g);bx(.03,.1,.03,'#7a2a22',0,.04,-.6,g);break;
  case 'machete':bx(.02,.07,.55,steel,0,0,-.3,g);bx(.035,.05,.16,grip,0,0,.03,g);break;
  case 'hacha':bx(.035,.035,.65,wood,0,0,-.22,g);bx(.02,.2,.14,steel,0,.04,-.52,g);break;
  case 'lanza':bx(.03,.03,1.2,wood,0,0,-.45,g);bx(.015,.05,.18,steel,0,0,-1.1,g);break;
  case 'ballesta':bx(.06,.07,.6,wood,0,0,-.15,g);bx(.7,.04,.05,dark,0,.02,-.42,g);bx(.012,.012,.55,steel,0,.05,-.2,g);bx(.05,.12,.08,grip,0,-.09,.08,g);break;
  case 'escopetac':bx(.08,.1,.7,'#22241f',0,0,-.25,g);bx(.06,.2,.1,'#22241f',0,-.12,-.1,g);bx(.07,.12,.22,'#2a2c26',0,-.03,.2,g);bx(.04,.04,.55,metal,0,.06,-.3,g);break;
  case 'francotirador':{bx(.07,.08,1.15,'#2a2d26',0,0,-.4,g);bx(.08,.12,.4,'#3a3d30',0,-.05,.2,g);const sc=bx(.08,.08,.42,'#111',0,.11,-.15,g,CYL);sc.rotation.x=Math.PI/2;bx(.03,.2,.03,metal,-.08,-.12,-.85,g);bx(.03,.2,.03,metal,.08,-.12,-.85,g);break}
  case 'ametralladora':bx(.1,.12,.9,'#22241f',0,0,-.3,g);bx(.14,.14,.18,'#3a3d30',.08,-.1,-.15,g);bx(.05,.05,.35,metal,0,.02,-.85,g);bx(.07,.12,.25,'#2a2c26',0,-.03,.25,g);bx(.03,.18,.03,metal,0,-.12,-.65,g);break;
  case 'lanzagranadas':bx(.11,.11,.55,'#3a4030',0,0,-.2,g,CYL).rotation.x=Math.PI/2;bx(.18,.18,.18,'#2a2c26',0,-.02,-.02,g,CYL).rotation.x=Math.PI/2;bx(.06,.14,.08,grip,0,-.12,.1,g);break;
  case 'katana':bx(.012,.04,.85,steel,0,0,-.5,g);bx(.08,.06,.02,'#b8952a',0,0,-.07,g);bx(.03,.035,.22,'#2a1a14',0,0,.05,g);break;
  case 'mazo':bx(.04,.04,.85,wood,0,0,-.3,g);bx(.16,.16,.3,'#4a4d50',0,0,-.72,g);break;
  case 'build':{const lg=bx(.05,.05,.3,'#8a6b45',0,0,-.1,g,CYL);lg.rotation.x=Math.PI/2;break}
  }return g}
const vm={};let vmRoot=grp(0,0,0,wScene),vmFlash;vmRoot.scale.setScalar(.75);
(function buildViewmodels(){
  const glove='#3a3326';
  [...WORDER,'build'].forEach(k=>{const g=grp(0,0,0,vmRoot);weaponShape(k,g);bx(.09,.09,.32,glove,0,-.06,k==='build'?.15:.22,g);g.visible=false;vm[k]=g});
  vmFlash=new T3.Mesh(new T3.PlaneGeometry(.22,.22),new T3.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0,depthWrite:false,side:T3.DoubleSide}));wScene.add(vmFlash);
})();
// Third-person body shown in isometric view
let body=null;
function buildBody(){
  body=humanoid('#5d5a44','#c39a74','#3a3a33',false);body.userData.hand=grp(0,-.6,0,body.userData.arms[1]);
  const bag=bx(.4,.45,.18,'#4a5236',0,1.2,-.22,body.userData.root);body.userData.bag=bag;
  body.userData.props={};[...WORDER].forEach(k=>{const g=grp(0,0,0,body.userData.hand);weaponShape(k,g);g.scale.setScalar(1.4);g.rotation.x=-Math.PI/2;g.position.set(0,0,.05);g.visible=false;body.userData.props[k]=g});
  body.visible=false;scene.add(body)}
