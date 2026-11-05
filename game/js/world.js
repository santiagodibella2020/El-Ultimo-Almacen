'use strict';
// ================= WORLD =================
let S=null; // saved state
let vehicles=[],lairs=[],altar=null,pineMat,broadMat;
let nH,nM,nD,heights,terrainMesh,water,ruins,conts,fossils,trees,rocks,aabbs,aabbGrid,treeGrid,ruinGrid,walls,shelfUnits,turrets,truck,mapImg,explored,pickups,enemies,customers,builds,pet,buildings,roofs;
let world=null; // THREE.Group holding all generated content
const roadX0=z=>30*Math.sin(z*.006)+8*Math.sin(z*.021);
// v0.26: la ruta entra derecha a la ciudad (avenida principal).
const CITY_RX=Math.round(roadX0(580));
let LEGACY26=false;// true mientras se calcula el terreno como era antes de la 0.26
const roadX=z=>z<452||LEGACY26?roadX0(z):lerp(roadX0(z),CITY_RX,smooth(452,486,z));
function townW(x,z){return (1-smooth(70,88,Math.abs(z-TOWN_Z)))*(1-smooth(50,64,Math.abs(x-roadX(z))))}
function rawHeight(x,z){
  let h=(fbm(nH,x*.0042,z*.0042,5)-.5)*95+(nD(x*.03,z*.03)-.5)*3;
  const d=Math.max(Math.abs(x),Math.abs(z));h+=ridge26(d);
  const rd=Math.abs(x-roadX(z));if(rd<9){const t=smooth(9,4,rd);h=lerp(h,Math.max(h*.7,WATER_Y+1.2),t*.8)}
  const tw=townW(x,z);if(tw>0)h=lerp(h,TOWN_Y+(nD(x*.05,z*.05)-.5)*.3,tw);
  const r=Math.hypot(x,z);const t=smooth(30,75,r);h=lerp(2,h,t);
  return h}
function moist(x,z){return fbm(nM,x*.006+40,z*.006-20,3)}
function terrainY(x,z){const fx=(x+HALF)/STEP,fz=(z+HALF)/STEP;const ix=clamp(Math.floor(fx),0,SEG-1),iz=clamp(Math.floor(fz),0,SEG-1);const tx=clamp(fx-ix,0,1),tz=clamp(fz-iz,0,1);const W=SEG+1;
  const a=heights[iz*W+ix],b=heights[iz*W+ix+1],c=heights[(iz+1)*W+ix],d=heights[(iz+1)*W+ix+1];
  if(tx+tz<=1)return a+(b-a)*tx+(c-a)*tz; return d+(c-d)*(1-tx)+(b-d)*(1-tz)}
function groundY(x,z){let y=terrainY(x,z);const list=ruinGrid.get(gkey(x,z,20));if(list)for(const r of list){if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1&&r.floor>y)y=r.floor}
  if(x>-6&&x<6&&z>-16&&z<-8)y=Math.max(y,2.05);return y}
// v0.26: altura como era antes de agrandar el mapa (montañas desde 420 m), para que lo de siempre quede igual.
// Las lomas de siempre (desde 420 m) siguen igual hasta los 450 m; después bajan a la zona nueva, y el borde del mapa queda en EDGE.
function ridge26(d){if(LEGACY26)return d>420?(d-420)*.55:0;return d<=420?0:d<450?(d-420)*.55:d<500?16.5*(1-smooth(450,500,d)):d>EDGE?(d-EDGE)*.55:0}
let oldH26=null,oldH26n=null;
function oldY26(x,z,y){const d=Math.max(Math.abs(x),Math.abs(z));if(d<=450)return y==null?terrainY(x,z):y;
  const W=251;if(oldH26n!==nH){oldH26n=nH;oldH26=new Float32Array(W*W);LEGACY26=true;try{for(let j=0;j<W;j++)for(let i=0;i<W;i++)oldH26[j*W+i]=rawHeight(-500+i*4,-500+j*4)}finally{LEGACY26=false}}
  const fx=(x+500)/4,fz=(z+500)/4;const ix=clamp(Math.floor(fx),0,W-2),iz=clamp(Math.floor(fz),0,W-2);const tx=clamp(fx-ix,0,1),tz=clamp(fz-iz,0,1);
  const a=oldH26[iz*W+ix],b=oldH26[iz*W+ix+1],c=oldH26[(iz+1)*W+ix],e=oldH26[(iz+1)*W+ix+1];if(tx+tz<=1)return a+(b-a)*tx+(c-a)*tz;return e+(c-e)*(1-tx)+(b-e)*(1-tz)}
const gkey=(x,z,c)=>(Math.floor(x/c)+500)*2000+(Math.floor(z/c)+500);
function addAABB(b){aabbs.push(b);const x0=Math.floor((b.x0-2)/16),x1=Math.floor((b.x1+2)/16),z0=Math.floor((b.z0-2)/16),z1=Math.floor((b.z1+2)/16);for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=(i+500)*2000+(j+500);let l=aabbGrid.get(k);if(!l)aabbGrid.set(k,l=[]);l.push(b)}return b}
const EMPTY=[];
const qAABB=(x,z)=>aabbGrid.get(gkey(x,z,16))||EMPTY;
function addTreeObj(t){const k=gkey(t.x,t.z,8);let l=treeGrid.get(k);if(!l)treeGrid.set(k,l=[]);l.push(t)}
function qTrees(x,z,fn){const cx=Math.floor(x/8),cz=Math.floor(z/8);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=treeGrid.get((cx+i+500)*2000+(cz+j+500));if(l)for(const t of l)if(t.alive&&fn(t))return t}return null}
function addFloorArea(r){const k=new Set();for(let gx=Math.floor(r.x0/20);gx<=Math.floor(r.x1/20);gx++)for(let gz=Math.floor(r.z0/20);gz<=Math.floor(r.z1/20);gz++)k.add((gx+500)*2000+(gz+500));k.forEach(kk=>{let l=ruinGrid.get(kk);if(!l)ruinGrid.set(kk,l=[]);l.push(r)})}
function addCont(type,x,z,y,mesh,extra){const c=Object.assign({i:conts.length,type,x,z,y,mesh},extra||{});conts.push(c);return c}
function signTexture(text,bg='#1b1712',fg='#e3a33b'){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,512,128);let size=86;x.font=`800 ${size}px "Saira Condensed", Impact, sans-serif`;while(x.measureText(text).width>480&&size>30){size-=4;x.font=`800 ${size}px "Saira Condensed", Impact, sans-serif`}x.textAlign='center';x.textBaseline='middle';x.fillStyle=fg;x.fillText(text,256,68);return new T3.CanvasTexture(c)}

function genWorld(seed){
  if(world){scene.remove(world);world.traverse(o=>{if(o.geometry&&o.geometry!==BOX&&o.geometry!==CYL&&o.geometry!==CONE)o.geometry.dispose()})}
  world=new T3.Group();scene.add(world);
  const rng=mulberry32(seed),rng0=rng;nH=makeNoise(seed^0x51);nM=makeNoise(seed^0xa7);nD=makeNoise(seed^0x3c);
  aabbs=[];aabbGrid=new Map();treeGrid=new Map();ruinGrid=new Map();conts=[];buildings=[];roofs=[];
  // Terrain: muted, washed-out colors
  const W=SEG+1;heights=new Float32Array(W*W);
  const geo=new T3.PlaneGeometry(SIZE,SIZE,SEG,SEG);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,cols=new Float32Array(pos.count*3);
  const cG=[.36,.42,.26],cF=[.24,.3,.19],cS=[.58,.52,.38],cR=[.45,.43,.4],cB=[.27,.3,.24],cRoad=[.3,.29,.27],cY=[.4,.35,.28],cT=[.38,.4,.3];
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);const h=rawHeight(x,z);pos.setY(i,h);
    const iz=Math.round((z+HALF)/STEP),ix=Math.round((x+HALF)/STEP);heights[iz*W+ix]=h;
    const m=moist(x,z);let c=m>.56?cF:m<.4?cS:cG;if(h>16)c=cR;if(h<WATER_Y+.6)c=cB;if(townW(x,z)>.5)c=cT;if(Math.abs(x-roadX(z))<4.2&&h>WATER_Y)c=cRoad;if(Math.max(Math.abs(x),Math.abs(z))<PAL+1)c=cY;
    const n=(nD(x*.3,z*.3)-.5)*.12;cols[i*3]=c[0]*(1+n);cols[i*3+1]=c[1]*(1+n);cols[i*3+2]=c[2]*(1+n)}
  geo.setAttribute('color',new T3.BufferAttribute(cols,3));geo.computeVertexNormals();
  terrainMesh=new T3.Mesh(geo,new T3.MeshLambertMaterial({vertexColors:true,flatShading:true}));terrainMesh.receiveShadow=true;world.add(terrainMesh);
  water=new T3.Mesh(new T3.PlaneGeometry(SIZE,SIZE).rotateX(-Math.PI/2),new T3.MeshLambertMaterial({color:0x2b4a52,transparent:true,opacity:.86}));water.position.y=WATER_Y;world.add(water);
  buildOutpost(rng);
  buildTown(rng);
  // Ruins scattered in the wild
  ruins=[];
  const types=['Farmacia','Mercado','Taller','Gasolinera','Casa','Casa','Casa'];
  const ruinCont={Farmacia:['farmacia','botiquin','caja'],Mercado:['gondola','gondola','caja'],Taller:['herramientas','caja','caja'],Gasolinera:['kiosco','caja','surtidor'],Casa:['alacena','armario','caja','heladera','tacho']};
  for(let a=0;a<900&&ruins.length<22;a++){
    const w=8+rng()*7|0,d=7+rng()*6|0;const ang=rng()*Math.PI*2,rad=80+rng()*350;const cx=Math.cos(ang)*rad,cz=Math.sin(ang)*rad;
    const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
    if(ruins.some(r=>x0<r.x1+12&&x1>r.x0-12&&z0<r.z1+12&&z1>r.z0-12))continue;
    if(Math.abs(cx-roadX0(cz))<w/2+7)continue;if(townW(cx,cz)>0||Math.abs(cz-TOWN_Z)<100&&Math.abs(cx-roadX0(cz))<80)continue;
    const hs=[oldY26(x0,z0),oldY26(x1,z0),oldY26(x0,z1),oldY26(x1,z1),oldY26(cx,cz)];const mn=Math.min(...hs),mx=Math.max(...hs);
    if(mn<WATER_Y+.8||mx-mn>4.5)continue;
    const type=types[rng()*types.length|0];const r={x0,x1,z0,z1,cx,cz,w,d,type,floor:mx+.12,ruin:true};ruins.push(r);
    const g=grp(0,0,0,world);
    const fl=bx(w,1,d,'#5b5850',cx,0,cz,g);fl.scale.y=mx-mn+.6;fl.position.y=mx-.15-(mx-mn+.6)/2+.3;
    addAABB({x0,x1,z0,z1,y0:mn-2,y1:r.floor-.02,kind:'floor'});
    const wallH=2.6+rng()*.8,cWall=rng()<.5?'#77746c':'#6e6a60';
    const doors=[];for(let k=0;k<2;k++)doors.push({side:rng()*4|0,pos:.25+rng()*.5});
    const segLen=1.6;
    for(let side=0;side<4;side++){const horiz=side<2,len=horiz?w:d,n=Math.max(2,Math.round(len/segLen)),sl=len/n;
      for(let k=0;k<n;k++){const f=(k+.5)/n;if(doors.some(dd=>dd.side===side&&Math.abs(dd.pos-f)<.75/n+.04))continue;if(rng()<.13)continue;
        const hh=rng()<.25?wallH*(.35+rng()*.4):wallH;
        let x,z,sx,sz;if(horiz){x=x0+f*w;z=side===0?z0:z1;sx=sl+.02;sz=.35}else{z=z0+f*d;x=side===2?x0:x1;sx=.35;sz=sl+.02}
        bx(sx,hh,sz,cWall,x,r.floor+hh/2,z,g);addAABB({x0:x-sx/2,x1:x+sx/2,z0:z-sz/2,z1:z+sz/2,y0:mn-2,y1:r.floor+hh,kind:'solid'})}}
    if(rng()<.5){const rf=bx(w*.5,.25,d*.6,'#5a5750',x0+w*.3,r.floor+wallH,z0+d*.35,g);rf.rotation.z=.06}
    const pool=ruinCont[type];const nc=2+rng()*3|0;for(let k=0;k<nc;k++){const x=x0+1.3+rng()*(w-2.6),z=z0+1.3+rng()*(d-2.6);const ct=pool[rng()*pool.length|0];const m=bx(.8,.7,.8,'#7b5a34',x,r.floor+.35,z,g);const lid=bx(1.05,.12,1.05,'#5a3f22',0,.5,0,m);addCont(ct==='surtidor'||ct==='heladera'||ct==='gondola'?'caja':ct,x,z,r.floor,m)}
    addFloorArea(r);
  }
  // Abandoned cars along the road
  for(let k=0;k<26;k++){const z=-420+rng()*840;if(Math.abs(z)<40)continue;const x=roadX(z)+(rng()-.5)*6;const y=terrainY(x,z);if(y<WATER_Y+.5)continue;const rot=rng()<.5?0:Math.PI/2;
    const g=grp(x,y,z,world);g.rotation.y=rot+(rng()-.5)*.2;const col=['#6b3a2e','#4a5a62','#7a6a3a','#525a4a','#8a8a84'][rng()*5|0];bx(1.8,.8,4.2,col,0,.75,0,g);bx(1.6,.65,2,'#2a2f30',0,1.45,-.2,g);[[-.85,1.3],[.85,1.3],[-.85,-1.3],[.85,-1.3]].forEach(([wx,wz])=>{const wh=bx(.35,.7,.7,'#1c1c1c',wx,.35,wz,g,CYL);wh.rotation.z=Math.PI/2});
    const hw=rot?2.1:.9,hd=rot?.9:2.1;addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y-1,y1:y+1.8,kind:'solid'});addCont('baul',x+(rot?0:1.4)*0+(rot?2.5:0),z+(rot?0:2.5),y,null,{car:true})}
  // Fossils
  fossils=[];for(let a=0;a<8000&&fossils.length<16;a++){const x=(rng()-.5)*860,z=(rng()-.5)*860;if(Math.hypot(x,z)<90)continue;if(moist(x,z)>.4)continue;if(townW(x,z)>0)continue;const y=terrainY(x,z);if(y<WATER_Y+1||y>15)continue;if(fossils.some(f=>Math.hypot(f.x-x,f.z-z)<60))continue;if(ruins.some(r=>x>r.x0-4&&x<r.x1+4&&z>r.z0-4&&z<r.z1+4))continue;
    const g=grp(x,y,z,world);const mound=bx(3,.4,2.4,'#7a6544',0,.1,0,g);mound.rotation.y=rng()*3;for(let i=0;i<5;i++){const b=bx(.12,1.2,.12,'#e4dcc4',(i-2)*.4,.35,0,g,CYL);b.rotation.z=.6+(rng()-.5)*.3}const sp=bx(.15,.15,2.2,'#e4dcc4',0,.2,0,g,CYL);sp.rotation.x=Math.PI/2;
    fossils.push({x,z,y,uses:3,mesh:g})}
  // Trees & rocks
  trees=[];rocks=[];
  const cand=[];const rngO=mulberry32((seed^0x26e0)>>>0);// v0.26: el anillo nuevo usa otro generador para no mover lo de siempre
  for(let gx=-EDGE-50;gx<EDGE+50;gx+=5)for(let gz=-EDGE-50;gz<EDGE+50;gz+=5){const old=gx>=-470&&gx<470&&gz>=-470&&gz<470,rng=old?rng0:rngO;const x=gx+rng()*4,z=gz+rng()*4;const m=moist(x,z),y=terrainY(x,z),yc=old?oldY26(x,z,y):y;if(yc<WATER_Y+.6||yc>28)continue;if(Math.max(Math.abs(x),Math.abs(z))<45)continue;if(Math.abs(x-(old?roadX0:roadX)(z))<6)continue;if(townW(x,z)>.05)continue;if(ruins.some(r=>x>r.x0-3&&x<r.x1+3&&z>r.z0-3&&z<r.z1+3))continue;
    if(!old&&rngO()<.6)continue;const r=rng();if(m>.56&&r<.5)cand.push({x,z,y,type:0,old});else if(m>.42&&m<=.56&&r<.05)cand.push({x,z,y,type:1,old});else if(m<=.42&&r<.012)cand.push({x,z,y,type:1,old});else if(r>.985)rocks.push({x,z,y,s:.6+rng()*1.4,old})}
  {const o=cand.filter(t=>t.old),n=cand.filter(t=>!t.old);cand.length=0;cand.push(...o,...n);const ro=rocks.filter(t=>t.old),rn=rocks.filter(t=>!t.old);rocks.length=0;rocks.push(...ro,...rn)}
  const pines=cand.filter(t=>t.type===0),broads=cand.filter(t=>t.type===1);
  const trunkM=new T3.InstancedMesh(CYL,mat('#4a3523'),cand.length),pineM=new T3.InstancedMesh(new T3.ConeGeometry(1,1,7),pineMat=new T3.MeshLambertMaterial({color:0x2a3a24}),pines.length),broadM=new T3.InstancedMesh(new T3.IcosahedronGeometry(1,0),broadMat=new T3.MeshLambertMaterial({color:0x3a4f2e}),broads.length);
  [trunkM,pineM,broadM].forEach(m=>{m.castShadow=true;m.receiveShadow=true;world.add(m)});
  const dm=new T3.Object3D();let ti=0,pi=0,bi=0;
  for(const t of cand){const rng=t.old?rng0:rngO;const s=.8+rng()*.6;t.s=s;t.r=.35*s;t.alive=true;t.hp=4;t.h=t.type?5*s:9*s;
    dm.rotation.set(0,0,0);dm.scale.set(.5*s,(t.type?2:2.4)*s,.5*s);dm.position.set(t.x,t.y+(t.type?2:2.4)*s/2-.1,t.z);dm.updateMatrix();trunkM.setMatrixAt(ti,dm.matrix);t.ti=ti++;
    if(t.type===0){dm.position.set(t.x,t.y+2.2*s+3.2*s,t.z);dm.scale.set(2.2*s,7*s,2.2*s);dm.rotation.y=rng()*3;dm.updateMatrix();pineM.setMatrixAt(pi,dm.matrix);t.ci=pi++;t.cm=pineM}
    else{dm.position.set(t.x,t.y+2*s+1.6*s,t.z);dm.scale.set(2.6*s,2.2*s,2.6*s);dm.rotation.y=rng()*3;dm.updateMatrix();broadM.setMatrixAt(bi,dm.matrix);t.ci=bi++;t.cm=broadM}
    trees.push(t);addTreeObj(t)}
  t3trunk=trunkM;
  const rockM=new T3.InstancedMesh(new T3.DodecahedronGeometry(1,0),mat('#6d6a62'),rocks.length);rockM.castShadow=true;rockM.receiveShadow=true;world.add(rockM);
  rocks.forEach((r,i)=>{const rng=r.old?rng0:rngO;dm.position.set(r.x,r.y+r.s*.3,r.z);dm.scale.set(r.s,r.s*.75,r.s*1.1);dm.rotation.set(rng(),rng()*3,0);dm.updateMatrix();rockM.setMatrixAt(i,dm.matrix);addTreeObj({x:r.x,z:r.z,y:r.y,r:r.s*.85,h:r.s*1.2,alive:true,rock:true})});
  buildAltar(rng);buildLairs(rng);buildVehicles(rng);
  // Map image
  mapImg=document.createElement('canvas');mapImg.width=W;mapImg.height=W;const mc=mapImg.getContext('2d'),id=mc.createImageData(W,W);
  for(let iz=0;iz<W;iz++)for(let ix=0;ix<W;ix++){const i=iz*W+ix,j=(iz*W+ix)*3,h=heights[i];let r,g,b;if(h<WATER_Y){r=40;g=70;b=82}else{r=cols[j]*255;g=cols[j+1]*255;b=cols[j+2]*255;const sh=clamp((h+10)/40,0,1)*.4+.8;r*=sh;g*=sh;b*=sh}id.data[i*4]=r;id.data[i*4+1]=g;id.data[i*4+2]=b;id.data[i*4+3]=255}
  mc.putImageData(id,0,0);
  explored=new Uint8Array(EXW*EXW);
  buildSky();
}

// ================= TOWN =================
// A small roadside town: two rows of lots on each side of the route. Houses have rooms and
// furniture you search one by one; stores have their own shelves.
const STORE_DEF={
  super:{n:'Supermercado',w:16,d:14,col:'#7d7a6e'},
  farm:{n:'Farmacia',w:12,d:10,col:'#6f7a74'},
  ferre:{n:'Ferretería',w:12,d:10,col:'#7a6a58'},
  arm:{n:'Armería',w:11,d:9,col:'#5d6268'},
  gas:{n:'Estación de servicio',w:12,d:9,col:'#7a7468'},
};
function buildTown(rng){
  const lots=[];
  for(let z=110;z<=240;z+=18)for(const side of [-1,1])for(const row of [0,1])lots.push({z,side,row,off:side*(15+row*23)});
  // Fixed stores on the main street, the rest are houses (some empty lots)
  const front=lots.filter(l=>l.row===0);
  const pick=()=>front.splice(rng()*front.length|0,1)[0];
  ['super','farm','ferre','arm','gas'].forEach(k=>{pick().store=k});
  for(const l of lots){
    if(!l.store&&rng()<.14)continue;
    const def=l.store?STORE_DEF[l.store]:null;const w=def?def.w:9+(rng()*2|0),d=def?def.d:9+(rng()*2|0);
    const cx=roadX(l.z)+l.off,cz=l.z;
    buildBuilding(rng,cx,cz,w,d,l.store,l.side);
  }
  // Trash cans on the sidewalks
  for(let z=104;z<=246;z+=9){if(rng()<.5)continue;const side=rng()<.5?-1:1;const x=roadX(z)+side*6;const y=terrainY(x,z);const m=bx(.6,.9,.6,'#3c4a40',x,y+.45,z,world,CYL);addAABB({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,y0:y-1,y1:y+.9,kind:'solid'});addCont('tacho',x,z,y,m)}
}
function buildBuilding(rng,cx,cz,w,d,store,side){
  const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
  const hs=[terrainY(x0,z0),terrainY(x1,z0),terrainY(x0,z1),terrainY(x1,z1)];const mn=Math.min(...hs),mx=Math.max(...hs);const floor=mx+.15;
  const b={x0,x1,z0,z1,cx,cz,w,d,floor,store,name:store?STORE_DEF[store].n:'Casa'};buildings.push(b);
  const g=grp(0,0,0,world);
  const fl=bx(w,mx-mn+.6,d,'#4f4a42',cx,(floor+mn-.45)/2,cz,g);
  addAABB({x0,x1,z0,z1,y0:mn-2,y1:floor-.02,kind:'floor'});addFloorArea({x0,x1,z0,z1,floor});
  const H=3,col=store?STORE_DEF[store].col:['#8a7d6a','#7a7f78','#8f8676','#6f6a62','#8a7468'][rng()*5|0];
  // door faces the road: side -1 means building is west of the road -> door on the east wall (x1)
  const doorWall=side<0?3:2;const doorPos=store?.5:.3;const doorW=store?2.4:1.5;
  const wallSeg=(x,z,sx,sz,h,y)=>{bx(sx,h,sz,col,x,y+h/2,z,g);addAABB({x0:x-sx/2,x1:x+sx/2,z0:z-sz/2,z1:z+sz/2,y0:mn-2,y1:y+h,kind:'solid'})};
  for(let s=0;s<4;s++){const horiz=s<2,len=horiz?w:d;const fixed=horiz?(s===0?z0:z1):(s===2?x0:x1);const a=horiz?x0:z0;
    const gaps=[];if(s===doorWall)gaps.push([len*doorPos-doorW/2,len*doorPos+doorW/2]);
    let p=0;const cuts=gaps.sort((u,v)=>u[0]-v[0]);for(const [ga,gb] of [...cuts,[len,len]]){if(ga-p>.05){const m=a+(p+ga)/2,L_=ga-p;if(horiz)wallSeg(m,fixed,L_+.02,.3,H,floor);else wallSeg(fixed,m,.3,L_+.02,H,floor)}
      if(gb<len){const m=a+(ga+gb)/2,L_=gb-ga;if(horiz)bx(L_,.5,.3,col,m,floor+H-.25,fixed,g);else bx(.3,.5,L_,col,fixed,floor+H-.25,m,g)}p=gb}
    // windows: dark panes
    const nw=Math.floor(len/4);for(let i=0;i<nw;i++){const f=(i+.5)/nw*len;if(cuts.some(([ga,gb])=>f>ga-1&&f<gb+1))continue;const wm=bx(horiz?1.1:.04,.9,horiz?.04:1.1,'#20282a',0,0,0,g);if(horiz)wm.position.set(a+f,floor+1.6,fixed+(s===0?-.17:.17));else wm.position.set(fixed+(s===2?-.17:.17),floor+1.6,a+f)}}
  // Roof (hidden in isometric view while you are inside)
  const roof=grp(0,0,0,world);bx(w+.6,.25,d+.6,store?'#3d3a36':['#5a3a2e','#4a4a48','#5e4a3a'][rng()*3|0],cx,floor+H+.12,cz,roof);
  if(!store){const ridge=bx(w+.6,.6,1.2,'#4a3428',cx,floor+H+.45,cz,roof)}
  roofs.push({g:roof,b});b.roof=roof;
  // Sign
  if(store){const t=signTexture(L(STORE_DEF[store].n).toUpperCase());const sg=new T3.Mesh(new T3.PlaneGeometry(4.4,1.1),new T3.MeshBasicMaterial({map:t,color:0xa08a6a}));const sx=doorWall===3?x1+.2:x0-.2;sg.position.set(sx,floor+H+.75,cz);sg.rotation.y=doorWall===3?Math.PI/2:-Math.PI/2;g.add(sg)}
  // Furniture: "back" is the wall opposite the door
  const back=doorWall===3?x0+.6:x1-.6, inward=doorWall===3?1:-1;
  const furn=(type,x,z,fw,fh,fd,c)=>{const m=bx(fw,fh,fd,c,x,floor+fh/2,z,g);addAABB({x0:x-fw/2,x1:x+fw/2,z0:z-fd/2,z1:z+fd/2,y0:floor-.1,y1:floor+fh,kind:'solid'});if(type)addCont(type,x,z,floor,m,{bld:b});return m};
  if(!store){
    // inner wall splits the house in two rooms (kitchen / bedroom) with a doorway
    const zm=cz+(rng()-.5)*1.2;const gapA=cx-.7,gapB=cx+.7;
    wallSeg((x0+gapA)/2,zm,gapA-x0,.2,H,floor);wallSeg((gapB+x1)/2,zm,x1-gapB,.2,H,floor);
    furn('heladera',back,z0+.8,.8,1.9,.8,'#d8d6cc');
    furn('alacena',back,z0+2.1,.7,1.1,1.4,'#6b4a30');
    if(rng()<.5)furn(null,back+inward*2.2,z0+(zm-z0)/2,1.6,.8,1,'#5a4030');// table
    furn('armario',back,z1-1,.7,2,1.5,'#5a3e2a');
    furn(null,cx+inward*.5,z1-1.3,1.6,.5,2.1,'#7a6a5a');// bed
    furn('botiquin',back,zm+.9,.35,.6,.6,'#e6e6dc');
    if(rng()<.4)furn('escritorio',back+inward*.1,zm+1.8,.6,.8,1.1,'#5e4630');
  }else if(store==='super'){
    for(let r=0;r<3;r++)for(let k=0;k<2;k++){const x=cx-3+r*3.2,z=cz-3.3+k*6;furn('gondola',x,z,1,1.7,4.2,'#8a8a80')}
    furn('kiosco',doorWall===3?x1-2.5:x0+2.5,z0+1.2,2,1,1,'#5a4a3a');furn('heladera',back,cz,.9,2,3,'#cfd6d6');
  }else if(store==='farm'){
    for(let k=0;k<3;k++)furn('farmacia',back,z0+1.6+k*3,.7,1.9,2.4,'#e0e0d8');furn('kiosco',cx,z1-1.4,2.4,1,.9,'#6a5a48');furn('botiquin',cx,z0+.6,.6,.8,.5,'#e6e6dc');
  }else if(store==='ferre'){
    for(let k=0;k<3;k++)furn('ferreteria',back,z0+1.6+k*3,.7,2,2.4,'#6a6a62');furn('herramientas',cx,z0+.8,2.2,1,.9,'#5e4a33');furn('kiosco',cx,z1-1.3,2,1,.9,'#6a5a48');
  }else if(store==='arm'){
    furn('armeria',back,cz-1.8,.8,1.2,2.6,'#3a3f44');furn('armeria',cx,z1-1.2,2.6,1,.8,'#3a3f44');furn('escritorio',cx,z0+.9,1.4,.8,.7,'#5e4630');
  }else if(store==='gas'){
    furn('kiosco',back,cz,1,1,3,'#6a5a48');furn('gondola',cx,cz,1,1.5,3.5,'#8a8a80');furn('heladera',cx,z0+.7,2.4,2,.8,'#cfd6d6');
    const px=doorWall===3?x1+6:x0-6;[-3,3].forEach(o=>{const y=terrainY(px,cz+o);const m=bx(.7,1.6,.5,'#b84a2a',px,y+.8,cz+o,world);addAABB({x0:px-.35,x1:px+.35,z0:cz+o-.25,z1:cz+o+.25,y0:y-1,y1:y+1.6,kind:'solid'});addCont('surtidor',px,cz+o,y,m)});
    bx(4,.25,9,'#5a5a56',px,terrainY(px,cz)+4,cz,world);
  }
}
function insideBuilding(x,z){for(const b of buildings)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return b;return null}

let t3trunk=null;
function setTreeVisible(t,v){const dm=new T3.Object3D();if(!v){dm.scale.set(0,0,0);dm.updateMatrix();t3trunk.setMatrixAt(t.ti,dm.matrix);t.cm.setMatrixAt(t.ci,dm.matrix);t3trunk.instanceMatrix.needsUpdate=true;t.cm.instanceMatrix.needsUpdate=true;
  const st=bx(.5*t.s,.5,.5*t.s,'#4a3523',t.x,t.y+.2,t.z,world,CYL);st.castShadow=false}}

// ================= OUTPOST =================
let signMat,shopLight,yardLight,lampMats,fogonG,fireMesh,fogonLight,bancoG,heladeraG,truckLight;
function buildOutpost(rng){
  const g=grp(0,0,0,world);const Y=2;
  walls=[];
  for(let side=0;side<4;side++)for(let k=0;k<11;k++){
    const c=-PAL+2+k*4;let x,z,horiz=side<2;if(horiz){x=c;z=side===0?-PAL:PAL}else{z=c;x=side===2?-PAL:PAL}
    const gate=k===5;const sg=grp(x,Y,z,g);if(!horiz)sg.rotation.y=Math.PI/2;
    if(gate){bx(3.9,1.6,.25,'#4f5559',0,.8,0,sg);const st=bx(4.4,.12,.27,'#e3a33b',0,.8,0,sg);st.rotation.z=.35;bx(.3,2.2,.3,'#2f3336',-2,1.1,0,sg);bx(.3,2.2,.3,'#2f3336',2,1.1,0,sg)}
    else{for(let p=0;p<5;p++){const lg=bx(.42,1,.42,'#6e563a',-1.6+p*.8,.75,0,sg,CYL);lg.scale.y=1.5+((p*7+k)%3)*.12;lg.position.y=lg.scale.y/2}bx(4,.18,.2,'#4a3a28',0,1.05,.24,sg)}
    const hw=horiz?2:.3,hd=horiz?.3:2;
    const b=addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:Y-2,y1:Y+1.45,kind:gate?'gate':'wall',wi:walls.length});
    walls.push({mesh:sg,box:b,gate,x,z})}
  const sh=grp(0,Y,0,g);const cW='#7a5a3d';
  bx(12,3.6,.3,cW,0,1.8,-16,sh);bx(.3,3.6,8,cW,-6,1.8,-12,sh);bx(.3,3.6,8,cW,6,1.8,-12,sh);bx(4.8,3.6,.3,cW,-3.6,1.8,-8,sh);bx(4.8,3.6,.3,cW,3.6,1.8,-8,sh);bx(2.4,1,.3,cW,0,3.1,-8,sh);
  const roofG=grp(0,0,0,world);const roof=bx(13,.3,9.2,'#4f3526',0,Y+3.75,-12,roofG);bx(12,.08,8,'#5a5550',0,.04,-12,sh);
  roofs.push({g:roofG,b:{x0:-6,x1:6,z0:-16,z1:-8}});
  [[-6,6,-16.2,-15.8],[-6.2,-5.8,-16,-8],[5.8,6.2,-16,-8],[-6,-1.2,-8.2,-7.8],[1.2,6,-8.2,-7.8]].forEach(([x0,x1,z0,z1])=>addAABB({x0,x1,z0,z1,y0:0,y1:Y+3.6,kind:'solid'}));
  bx(3,1,1,'#5b4430',3.5,.5,-11.1,sh);bx(3.1,.08,1.1,'#7a5c3f',3.5,1.02,-11.1,sh);bx(.5,.3,.4,'#2a2d2e',4.5,1.2,-11.3,sh);
  addAABB({x0:2,x1:5,z0:-11.6,z1:-10.6,y0:0,y1:Y+1,kind:'solid'});
  // bed (sleep)
  bx(1.1,.45,2.1,'#6a5a48',BED.x,.25,BED.z,sh);bx(1,.12,.5,'#c8c2b0',BED.x,.52,BED.z-.75,sh);addAABB({x0:BED.x-.55,x1:BED.x+.55,z0:BED.z-1.05,z1:BED.z+1.05,y0:0,y1:Y+.5,kind:'solid'});
  signMat=new T3.MeshBasicMaterial({map:signTexture(L('ALMACÉN')),color:0x9a7a4a});const sign=new T3.Mesh(new T3.PlaneGeometry(4,1),signMat);sign.position.set(0,4.5,-7.8);sh.add(sign);
  shelfUnits=[];for(let i=0;i<7;i++){const x=-5+i*1.6;const u=grp(x,0,-15.3,sh);bx(1.4,2.2,.7,'#3f2f20',0,1.1,0,u);for(let b=0;b<3;b++)bx(1.4,.06,.75,'#6b5136',0,.5+b*.65,0,u);
    const prods=[];for(let b=0;b<3;b++)for(let p=0;p<3;p++){const m=bx(.32,.38,.32,'#888',-.45+p*.45,.72+b*.65,.08,u);m.visible=false;prods.push(m)}
    shelfUnits.push({group:u,prods,x,z:-15.3})}
  addAABB({x0:-5.8,x1:5.8,z0:-15.8,z1:-14.9,y0:0,y1:Y+2.2,kind:'solid'});
  shopLight=new T3.PointLight(0xffc77a,0,16,1.6);shopLight.position.set(0,Y+3,-12);g.add(shopLight);
  yardLight=new T3.PointLight(0xffb25a,0,36,1.5);yardLight.position.set(0,Y+5,-5);g.add(yardLight);
  lampMats=[];[[-14,-6],[14,-6],[-14,14],[14,14]].forEach(([x,z])=>{bx(.15,3.4,.15,'#2a2a26',x,Y+1.7,z,g);const l=new T3.Mesh(BOX,new T3.MeshBasicMaterial({color:0x3a3020}));l.scale.set(.4,.25,.4);l.position.set(x,Y+3.4,z);g.add(l);lampMats.push(l.material)});
  turrets=[[-19,-19],[19,-19],[-19,19],[19,19]].map(([x,z])=>{const tg=grp(x,Y,z,g);bx(.9,1.6,.9,'#3d4346',0,.8,0,tg);const head=grp(0,1.8,0,tg);bx(.7,.5,.7,'#5a6266',0,0,0,head);bx(.14,.14,1.1,'#1b1f22',0,0,.6,head);tg.visible=false;return{x,z,y:Y+1.8,group:tg,head,cd:0,yaw:0}});
  fogonG=grp(-9,Y,-4,g);for(let i=0;i<7;i++){const a=i/7*6.283;bx(.3,.25,.3,'#5a5550',Math.cos(a)*.6,.12,Math.sin(a)*.6,fogonG)}fireMesh=bx(.5,.6,.5,new T3.MeshBasicMaterial({color:0xf08a28}),0,.35,0,fogonG,CONE);fogonG.visible=false;
  fogonLight=new T3.PointLight(0xff8a30,0,14,2);fogonLight.position.set(-9,Y+1,-4);g.add(fogonLight);
  bancoG=grp(9,Y,-4,g);bx(2,.9,.9,'#5e4a33',0,.45,0,bancoG);bx(.4,.25,.3,'#8d918f',-.5,1,0,bancoG);bx(.6,.15,.3,'#8d918f',.4,.97,.1,bancoG);bancoG.visible=false;
  heladeraG=grp(-5.3,Y,-13.5,g);bx(.8,1.9,.8,'#cfd6d6',0,.95,0,heladeraG);heladeraG.visible=false;
}
// Cargo vehicles: one builder for every kind (pickup, van, box truck, tractor with trailer).
function buildVehicle(k,x,z,yaw){
  const d=VEH[k],L2=d.len/2,W2=d.wid/2,g=grp(0,0,0,world),body=grp(0,0,0,g);
  const glass=new T3.MeshLambertMaterial({color:0x2a3a40,transparent:true,opacity:.7}),dark='#2a2a2a';
  const cz=d.cabZ;let cab,wsh,dash;
  if(d.bed==='trailer'){ // tractor in front, open trailer behind
    bx(1.4,.9,2.6,d.col,0,1.2,L2-1.4,body);cab=bx(1.5,1.4,1.3,d.col,0,2.3,cz-.4,body);wsh=bx(1.4,.9,.06,glass,0,2.45,cz+.27,body);bx(.25,.8,.25,dark,.4,2.1,L2-.4,body,CYL);
    bx(d.wid,.35,4.2,'#6a5a3a',0,1.05,-L2+2.3,body);bx(.1,.6,4.2,'#5a4a2a',-W2,1.5,-L2+2.3,body);bx(.1,.6,4.2,'#5a4a2a',W2,1.5,-L2+2.3,body);bx(d.wid,.6,.1,'#5a4a2a',0,1.5,-L2+.2,body);
  }else{
    bx(d.wid,.55,d.len,d.col,0,.95,0,body);cab=bx(d.wid-.1,1.05,1.9,d.col,0,1.75,cz,body);wsh=bx(d.wid-.2,.7,.08,glass,0,1.95,cz+.96,body);
    bx(d.wid-.2,.3,.25,dark,0,.85,L2+.05,body);const hl=new T3.MeshBasicMaterial({color:0xfff1c0});bx(.35,.18,.05,hl,-W2+.35,1.05,L2+.02,body);bx(.35,.18,.05,hl,W2-.35,1.05,L2+.02,body);
    const bedL=d.len-2.1,bedZ=cz-.95-bedL/2;
    if(d.bed==='open'){bx(d.wid,.5,.12,'#5a2a20',0,1.45,bedZ-bedL/2,body);bx(.12,.5,bedL,'#5a2a20',-W2+.05,1.45,bedZ,body);bx(.12,.5,bedL,'#5a2a20',W2-.05,1.45,bedZ,body)}
    else{const h=k==='camion'?2.6:1.9;bx(d.wid,h,bedL,k==='camion'?'#c8c4b8':d.col,0,1.2+h/2,bedZ,body);if(k==='camion')bx(d.wid-.3,.6,.05,'#8a2a22',0,1.2+h*.7,bedZ-bedL/2-.03,body)}
  }
  dash=bx(d.wid-.2,.25,.5,dark,0,(d.bed==='trailer'?1.95:1.35),cz+.75,body);dash.visible=false;
  const wheels=[];const wz=d.len*.31,big=d.bed==='trailer';
  [[-W2-.05,wz],[W2+.05,wz],[-W2-.05,-wz],[W2+.05,-wz]].forEach(([wx,wzz],i)=>{const r=big&&i>=2?1.2:.9;const wg=grp(wx,r/2,wzz,g);const w=bx(r,.4,r,'#161616',0,0,0,wg,CYL);w.rotation.z=Math.PI/2;wheels.push(wg)});
  if(d.len>6)[[-W2-.05,-wz+1.2],[W2+.05,-wz+1.2]].forEach(([wx,wzz])=>{const wg=grp(wx,.45,wzz,g);const w=bx(.9,.4,.9,'#161616',0,0,0,wg,CYL);w.rotation.z=Math.PI/2});
  const cargo=grp(0,1.25,0,body);const cargoBoxes=[];const bl=d.bed==='trailer'?4:d.len-2.4,bz=d.bed==='trailer'?-L2+2.3:cz-.95-(d.len-2.1)/2;const n=d.bed==='open'||d.bed==='trailer'?6:0;
  for(let i=0;i<n;i++){const m=bx(.55,.45,.55,'#7b5a34',-.5+(i%3)*.5,0,bz+(i<3?-bl/4:bl/4),cargo);m.visible=false;cargoBoxes.push(m)}
  return{k,def:d,cabin:[cab,wsh],dash,group:g,body,wheels,cargoBoxes,x,z,yaw,speed:0,steer:0,y:2,lookYaw:0,lookPitch:0}}
function buildVehicles(rng){
  truckLight=new T3.SpotLight(0xfff1c0,0,60,.5,.5,1.2);truckLight.position.set(0,1.2,2.5);const tt=new T3.Object3D();tt.position.set(0,0,20);truckLight.add(tt);truckLight.target=tt;
  const spots={pickup:[TRUCK_HOME.x,TRUCK_HOME.z,Math.PI]};
  const onRoad=(z0,z1)=>{for(let k=0;k<60;k++){const z=z0+rng()*(z1-z0);const x=roadX(z)+(rng()<.5?-1:1)*7;if(terrainY(x,z)>WATER_Y+.6&&!circleBlocked(x,z,3,'t'))return[x,z,(rng()<.5?0:Math.PI)+Math.atan(roadX(z+1)-roadX(z))]}return[roadX(z0)+8,z0,0]};
  spots.furgon=onRoad(TOWN_Z-40,TOWN_Z+40);spots.camion=onRoad(-420,-220);
  const farm=ruins.filter(r=>r.type==='Casa'&&Math.hypot(r.cx,r.cz)>150);const fr=farm[(rng()*farm.length)|0];spots.tractor=fr?[fr.x1+4,fr.cz,rng()*6.28]:onRoad(250,420);
  vehicles=Object.keys(VEH).map(k=>buildVehicle(k,...spots[k]));vehicles.forEach(v=>v.spot=spots[v.k]);truck=vehicles[0];truck.group.add(truckLight)}
// Miniboss zones and the Green Stone crater where the bosses are summoned.
function buildLairs(rng){
  lairs=[];const kinds=Object.keys(LAIRS);
  for(const k of kinds){let site=null;for(let a=0;a<400&&!site;a++){const ang=rng()*6.283,rad=170+rng()*280;const x=Math.cos(ang)*rad,z=Math.sin(ang)*rad;if(Math.abs(x)>440||Math.abs(z)>440)continue;
      const y=terrainY(x,z);if(y<WATER_Y+1.5||y>14)continue;if(Math.hypot(x-roadX(TOWN_Z),z-TOWN_Z)<130)continue;if(lairs.some(l=>Math.hypot(l.x-x,l.z-z)<140))continue;if(Math.hypot(x-altar.x,z-altar.z)<120)continue;
      const m=moist(x,z);if(k==='laguna'&&m<.45)continue;if(k==='salina'&&m>.42)continue;if(k==='canadon'&&m<.5)continue;site={x,z,y}}
    if(!site){const ang=kinds.indexOf(k)/kinds.length*6.283;site={x:Math.cos(ang)*300,z:Math.sin(ang)*300};site.y=terrainY(site.x,site.z)}
    const g=grp(site.x,site.y,site.z,world);const l={k,x:site.x,z:site.z,y:site.y,g};
    if(k==='militar'){for(let i=0;i<10;i++){const a=i/10*6.283;bx(2.2,.9,.9,'#8a7a55',Math.cos(a)*11,.45,Math.sin(a)*11,g).rotation.y=-a}for(let i=0;i<2;i++){const t=bx(5,3,4,'#4a5236',-4+i*8,1.5,-3,g,CONE);t.rotation.y=Math.PI/4}bx(.12,6,.12,'#555',0,3,0,g,CYL);bx(1.4,.9,.05,'#4a5236',.7,5.4,0,g)}
    else if(k==='frigorifico'||k==='hospital'){const w=16,d=12,c=k==='hospital'?'#d8d4c8':'#9a9a92';bx(w,4,.4,c,0,2,-d/2,g);bx(.4,4,d,c,-w/2,2,0,g);bx(.4,4,d,c,w/2,2,0,g);bx(w/2-2,4,.4,c,-w/4-1,2,d/2,g);bx(w/2-2,4,.4,c,w/4+1,2,d/2,g);
      [[0,-d/2,w,.4],[-w/2,0,.4,d],[w/2,0,.4,d],[-w/4-1,d/2,w/2-2,.4],[w/4+1,d/2,w/2-2,.4]].forEach(([ox,oz,ww,dd])=>addAABB({x0:site.x+ox-ww/2,x1:site.x+ox+ww/2,z0:site.z+oz-dd/2,z1:site.z+oz+dd/2,y0:site.y-1,y1:site.y+4,kind:'solid'}));
      if(k==='hospital'){bx(1.6,.5,.06,'#b02a22',0,3.4,d/2+.25,g);bx(.5,1.6,.06,'#b02a22',0,3.4,d/2+.26,g)}else for(let i=0;i<5;i++)bx(.05,1.2,.05,'#888',-5+i*2.5,3.4,0,g)}
    else if(k==='canadon'){for(let i=0;i<14;i++){const a=i/14*6.283,r=12+rng()*4;const rk=bx(3+rng()*3,3+rng()*5,3+rng()*3,'#6d6a62',Math.cos(a)*r,1.5,Math.sin(a)*r,g,new T3.DodecahedronGeometry(.6,0));rk.rotation.y=rng()*3}for(let i=0;i<8;i++){const b=bx(.12,1.2,.12,'#e4dcc4',(rng()-.5)*10,.2,(rng()-.5)*10,g,CYL);b.rotation.z=1.4}}
    else if(k==='salina'){const p=new T3.Mesh(new T3.CircleGeometry(22,24).rotateX(-Math.PI/2),mat('#d8d4c4'));p.position.y=.08;g.add(p);for(let i=0;i<5;i++){const h=bx(.3,2,.3,'#e8dcc0',(rng()-.5)*20,.5,(rng()-.5)*20,g,CONE);h.rotation.z=1}}
    else if(k==='laguna'){const p=new T3.Mesh(new T3.CircleGeometry(16,20).rotateX(-Math.PI/2),new T3.MeshLambertMaterial({color:0x4a6a2a,emissive:0x1a3a0a}));p.position.y=.12;g.add(p);for(let i=0;i<6;i++){const a=rng()*6.28;const t=bx(.4,6,.4,'#3a3020',Math.cos(a)*19,3,Math.sin(a)*19,g,CYL);t.rotation.z=(rng()-.5)*.4}}
    lairs.push(l)}}
function buildAltar(rng){
  let x=0,z=0;for(let a=0;a<300;a++){const ang=rng()*6.283,rad=300+rng()*120;x=Math.cos(ang)*rad;z=Math.sin(ang)*rad;if(Math.abs(x)>430||Math.abs(z)>430)continue;const y=terrainY(x,z);if(y>WATER_Y+1.5&&y<12&&Math.hypot(x-roadX(TOWN_Z),z-TOWN_Z)>150)break}
  const y=terrainY(x,z);const g=grp(x,y,z,world);
  const crater=new T3.Mesh(new T3.CircleGeometry(26,28).rotateX(-Math.PI/2),mat('#2a2a24'));crater.position.y=.1;g.add(crater);
  const stoneMat=new T3.MeshLambertMaterial({color:0x4aa83a,emissive:0x2a8a1a});const st=bx(2.2,7,2.2,stoneMat,0,3.2,0,g,new T3.DodecahedronGeometry(.6,0));st.rotation.set(.3,.5,.2);
  for(let i=0;i<8;i++){const a=i/8*6.283;bx(1,3+rng()*2,1,'#5a5850',Math.cos(a)*9,1.5,Math.sin(a)*9,g)}
  const light=new T3.PointLight(0x7aff5a,1.6,40,2);light.position.y=5;g.add(light);
  addAABB({x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5,y0:y-1,y1:y+7,kind:'solid'});
  altar={x,z,y,g,stone:st}}
// ================= SKY & WEATHER =================
let starPts,mistPts,rainLines,rainPos;
const RAIN_N=1400;
function buildSky(){
  if(!starPts){const n=600,p=new Float32Array(n*3);for(let i=0;i<n;i++){const u=R()*2-1,a=R()*6.283,r=Math.sqrt(1-u*u);p[i*3]=Math.cos(a)*r*500;p[i*3+1]=Math.abs(u)*500+40;p[i*3+2]=Math.sin(a)*r*500}const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(p,3));starPts=new T3.Points(g,new T3.PointsMaterial({color:0xdde6e0,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false}));scene.add(starPts)}
  if(!mistPts){const n=500,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(R()-.5)*90;p[i*3+1]=R()*6;p[i*3+2]=(R()-.5)*90}const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(p,3));mistPts=new T3.Points(g,new T3.PointsMaterial({color:0x9fd27a,size:.12,transparent:true,opacity:0,depthWrite:false}));scene.add(mistPts)}
  if(!rainLines){rainPos=new Float32Array(RAIN_N*6);for(let i=0;i<RAIN_N;i++){const x=(R()-.5)*60,y=R()*30,z=(R()-.5)*60;rainPos.set([x,y,z,x+.05,y-.7,z],i*6)}const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(rainPos,3));rainLines=new T3.LineSegments(g,new T3.LineBasicMaterial({color:0xaab8c0,transparent:true,opacity:0,depthWrite:false}));rainLines.frustumCulled=false;scene.add(rainLines)}
}
function updateRain(dt,amount,cx,cy,cz){
  rainLines.visible=amount>.01;if(!rainLines.visible)return;rainLines.material.opacity=.35*amount;
  const fall=26*dt;for(let i=0;i<RAIN_N;i++){const o=i*6;rainPos[o+1]-=fall;rainPos[o+4]-=fall;if(rainPos[o+1]<-2){const y=26+R()*6;rainPos[o+1]=y;rainPos[o+4]=y-.7}}
  rainLines.geometry.attributes.position.needsUpdate=true;rainLines.position.set(cx,cy-6,cz)}
