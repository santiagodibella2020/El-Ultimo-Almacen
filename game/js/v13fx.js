/* v0.13: sensación al disparar - agujeros de bala, sangre en el piso, enemigos que acusan el impacto */
const FX13={decals:[],max:140,tex:{}};
(function(){
  const mk=(draw)=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');draw(x);const t=new T3.CanvasTexture(c);return t};
  FX13.tex.hole=mk(x=>{const g=x.createRadialGradient(64,64,0,64,64,60);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.18,'rgba(10,8,6,.95)');g.addColorStop(.3,'rgba(40,34,28,.7)');g.addColorStop(.6,'rgba(60,52,44,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
    x.strokeStyle='rgba(20,16,12,.6)';x.lineWidth=1.4;for(let i=0;i<7;i++){const a=Math.random()*6.28;x.beginPath();x.moveTo(64+Math.cos(a)*12,64+Math.sin(a)*12);x.lineTo(64+Math.cos(a)*(26+Math.random()*22),64+Math.sin(a)*(26+Math.random()*22));x.stroke()}});
  const splat=(x)=>{x.fillStyle='#fff';for(let i=0;i<14;i++){const r=6+Math.random()*22,a=Math.random()*6.28,d=Math.random()*30;x.globalAlpha=.85;x.beginPath();x.arc(64+Math.cos(a)*d,64+Math.sin(a)*d,r,0,6.3);x.fill()}
    for(let i=0;i<18;i++){const a=Math.random()*6.28,d=34+Math.random()*24;x.globalAlpha=.7;x.beginPath();x.arc(64+Math.cos(a)*d,64+Math.sin(a)*d,1.5+Math.random()*4,0,6.3);x.fill()}x.globalAlpha=1};
  FX13.tex.blood=mk(splat);
})();
const DEC_GEO13=new T3.PlaneGeometry(1,1);
function decal13(kind,x,y,z,size,color,face){
  const m=new T3.MeshLambertMaterial({map:FX13.tex[kind],color:color||0xffffff,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,opacity:kind==='blood'?.92:1});
  const d=new T3.Mesh(DEC_GEO13,m);d.position.set(x,y,z);d.scale.setScalar(size);d.renderOrder=2;
  if(face==='up'){d.rotation.x=-Math.PI/2;d.rotation.z=Math.random()*6.28}else{d.lookAt(face.x,face.y,face.z);d.rotateZ(Math.random()*6.28)}
  scene.add(d);FX13.decals.push({d,life:kind==='blood'?90:60});
  while(FX13.decals.length>FX13.max){const o=FX13.decals.shift();scene.remove(o.d);o.d.material.dispose()}}
const gy13=(x,z)=>{try{return groundY(x,z)}catch(e){return 0}};
// impactos en paredes/suelo: el disparo ya genera un "burst" color polvo en el punto final
const _burst13=burst;
burst=function(x,y,z,color,n,sp,size,grav){
  if(color==='#b8ac8a'&&n===3){const c=camera.position;const v=new T3.Vector3(c.x-x,c.y-y,c.z-z).normalize();
    const g=gy13(x,z);if(y-g<.08)decal13('hole',x,g+.02,z,.16,0x8a8478,'up');else decal13('hole',x+v.x*.03,y+v.y*.03,z+v.z*.03,.14,0xffffff,c)}
  return _burst13.apply(this,arguments)};
// impactos en enemigos: retroceso del cuerpo, salpicadura y charcos
const _hurt13=hurtEnemy;
hurtEnemy=function(e,dmg,head,src,by,ap){
  const was=!(e.dead||e.dying);const r=_hurt13.apply(this,arguments);
  if(!was)return r;
  try{const ed=EDEF[e.type],big=ed.boss||ed.mini||(e.scale||1)>1.3;
    const col=ed.kind==='d'?0x6a1610:0x3a2a14;
    const dx=e.x-P.x,dz=e.z-P.z,dl=Math.hypot(dx,dz)||1;
    if(src==='p'||src==='m'){e.flinch13=big?.08:.2;e.fdx13=dx/dl;e.fdz13=dz/dl;if(!big){e.x+=dx/dl*.12;e.z+=dz/dl*.12}}
    if(Math.random()<.55){const bx2=e.x+dx/dl*(.4+Math.random()*.9)+(Math.random()-.5)*.6,bz2=e.z+dz/dl*(.4+Math.random()*.9)+(Math.random()-.5)*.6;decal13('blood',bx2,gy13(bx2,bz2)+.025,bz2,.35+Math.random()*.45,col,'up')}
    if(head)_burst13(e.x,e.y+1.6*(e.scale||1),e.z,ed.kind==='d'?'#7a1a12':'#3a2a14',6,3,.06);
    if(e.dying||e.dead||e.hp<=0){decal13('blood',e.x,gy13(e.x,e.z)+.03,e.z,(1.1+Math.random()*.6)*(e.scale||1)*(ed.kind==='d'?1.4:1),col,'up')}
  }catch(err){}
  return r};
const _update13=update;
update=function(dt){_update13(dt);
  for(let i=FX13.decals.length-1;i>=0;i--){const o=FX13.decals[i];o.life-=dt;if(o.life<8)o.d.material.opacity=Math.max(0,o.life/8);if(o.life<=0){scene.remove(o.d);o.d.material.dispose();FX13.decals.splice(i,1)}}};
const _clear13=typeof clearRuntime==='function'?clearRuntime:null;
if(_clear13)clearRuntime=function(){FX13.decals.forEach(o=>{scene.remove(o.d);o.d.material.dispose()});FX13.decals.length=0;return _clear13.apply(this,arguments)};
