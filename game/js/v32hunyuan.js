'use strict';
/* v0.32: props semi-realistas generados con Hunyuan3D-2 (IA) en la PC de santiago, ver tools/models/hunyuan.
   Los modelos traen el color por vértice (la textura de 2048 se bajó a ~4000 caras, ver convert.py).
   - Barriles oxidados: en estaciones, campamentos, el pueblo y al costado de la ruta.
   - Bidones: se suman a los que ya había tirados.
   - Cajas con candado (las de botín) usan el modelo nuevo, y lo mismo cualquier mueble que tenga modelo propio en CONT32. */
const H32={ready:false,geo:{},want:false};
// modelos cuyo color salió demasiado chillón: se acerca al gris (0 = igual, 1 = gris)
const DESAT32={tanque_gasolina:.6};
// qué contenedor usa qué modelo (se activa solo si el modelo está en glb32.js)
const CONT32={caja:'caja_armas',surtidor:'surtidor_nafta',heladera:'heladera_oxidada',camilla:'camilla_hospital',pupitre:'pupitre_escolar',
  gondola:'gondola_super',herramientas:'banco_herramientas',tacho:'contenedor_basura',botiquin:'botiquin_pared',kiosco:'mostrador_caja'};
// los muebles que ahora tienen modelo propio dejan de usar el de Quaternius (v18)
if(typeof CONT18!=='undefined')for(const t in CONT32)if(typeof GLB32!=='undefined'&&GLB32[CONT32[t]])delete CONT18[t];
(function(){try{
  const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB32);let n=0;
  const done=()=>{if(++n<ks.length)return;H32.ready=true;if(H32.want)try{apply32()}catch(e){console.error('v32',e)}};
  ks.forEach(k=>ld.parse(b64(GLB32[k]),'',gl=>{try{let g=null;gl.scene.updateMatrixWorld(true);
      gl.scene.traverse(o=>{if(o.isMesh&&!g){g=o.geometry.clone();g.applyMatrix4(o.matrixWorld)}});
      if(g){const d=DESAT32[k],ca=g.attributes.color;if(d&&ca)for(let i=0;i<ca.count;i++){const r=ca.getX(i),gg=ca.getY(i),b=ca.getZ(i),l=.3*r+.59*gg+.11*b;ca.setXYZ(i,r+(l-r)*d,gg+(l-gg)*d,b+(l-b)*d)}
        g.computeBoundingBox();H32.geo[k]=g}}catch(e){console.error('glb32',k,e)}done()},e=>{console.error('glb32',k,e);done()}))}catch(e){console.error('glb32',e)}})();

// Apoyado en y=0, centrado en x/z. h: alto en metros (el ancho sigue la proporción).
function unit32(k,h){const g=H32.geo[k].clone();const bb=g.boundingBox,s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  g.translate(-c.x,-bb.min.y,-c.z);g.scale(h/s.y,h/s.y,h/s.y);g.computeBoundingBox();g.computeBoundingSphere();return g}
// Lleva el modelo a una caja de ancho w, alto h y fondo d.
function box32(k){const g=H32.geo[k].clone();const bb=g.boundingBox,s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  g.translate(-c.x,-bb.min.y,-c.z);g.scale(1/s.x,1/s.y,1/s.z);g.computeBoundingBox();g.computeBoundingSphere();return g}
let mat32=null,extra32=[];
function inst32(geo,list,shadow){if(!list.length)return null;if(!mat32)mat32=new THREE.MeshLambertMaterial({vertexColors:true});
  const im=new THREE.InstancedMesh(geo,mat32,list.length),dm=new THREE.Object3D(),col=new THREE.Color();
  list.forEach((p,i)=>{dm.position.set(p.x,p.y,p.z);dm.rotation.set(p.rx||0,p.ry||0,p.rz||0);dm.scale.set(p.sx||p.k||1,p.sy||p.k||1,p.sz||p.k||1);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);const t=p.t||1;im.setColorAt(i,col.setRGB(t,t,t))});
  im.castShadow=shadow!==false;im.receiveShadow=true;im.frustumCulled=false;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;world.add(im);extra32.push(im);return im}
const solid32=(x,z,hw,hd,y,h)=>{if(typeof addAABB==='function')addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y-1,y1:y+h,kind:'solid'})};
const free32=(x,z,r)=>{if(typeof insideBuilding==='function'&&insideBuilding(x,z))return false;if(typeof circleBlocked==='function'&&circleBlocked(x,z,r,'t'))return false;
  const y=terrainY(x,z);return y>WATER_Y+.4};

function apply32(){H32.want=false;if(!world||!H32.ready)return;
  for(const m of extra32)if(m.parent)m.parent.remove(m);extra32=[];
  const R=mulberry32((worldSeed()^0x32c0de)>>>0);
  // ----- barriles: grupos de 2 a 4 en estaciones, campamentos y retenes; sueltos en el pueblo y la ruta -----
  if(H32.geo.barril_oxidado){const list=[];
    const add=(x,z,solid)=>{if(!free32(x,z,.5))return;const y=terrainY(x,z),h=.88+R()*.14;list.push({x,y,z,ry:R()*6.283,k:h/1.0*1,t:.85+R()*.2});if(solid)solid32(x,z,.32,.32,y,h)};
    let sites=[];try{sites=sitesGet6()}catch(e){}
    for(const s of sites){if(!(s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal'))continue;
      for(let g=0;g<(s.kind==='gas22'?3:2);g++){const a=R()*6.283,d=s.r*(.5+R()*.4),cx=s.x+Math.cos(a)*d,cz=s.z+Math.sin(a)*d;
        for(let i=0,n=2+(R()*3|0);i<n;i++)add(cx+(R()-.5)*1.6,cz+(R()-.5)*1.6,true)}}
    for(let a=0,placed=0;a<900&&placed<46;a++){const inTown=a<500;const z=inTown?TOWN_Z+(R()-.5)*160:(R()-.5)*SIZE*.9;const x=inTown?roadX(z)+(R()-.5)*110:roadX(z)+(R()<.5?-1:1)*(5+R()*3);
      if(Math.abs(x-roadX(z))<3.6)continue;if(inTown&&townW(x,z)<.3)continue;const n0=list.length;add(x,z,true);if(list.length>n0)placed++}
    if(list.length){const g=unit32('barril_oxidado',1);inst32(g,list.map(p=>({x:p.x,y:p.y,z:p.z,ry:p.ry,sx:p.k,sy:p.k,sz:p.k,t:p.t})))}}
  // ----- bidones -----
  if(H32.geo.tanque_gasolina){const list=[];
    for(let a=0;a<700&&list.length<34;a++){const inTown=a<400;const z=inTown?TOWN_Z+(R()-.5)*160:(R()-.5)*SIZE*.9;const x=inTown?roadX(z)+(R()-.5)*110:roadX(z)+(R()<.5?-1:1)*(4.6+R()*3);
      if(Math.abs(x-roadX(z))<3.4)continue;if(inTown&&townW(x,z)<.3)continue;if(!free32(x,z,.4))continue;
      list.push({x,y:terrainY(x,z),z,ry:R()*6.283,k:.5+R()*.12,t:.85+R()*.2})}
    if(list.length)inst32(unit32('tanque_gasolina',1),list)}
  // ----- decoración suelta: bolsas de arena, cajones de madera y carros de supermercado -----
  const scatter=(key,h,n,solidR,inTownOnly,near)=>{if(!H32.geo[key])return;const list=[];
    for(let a=0;a<900&&list.length<n;a++){let x,z;
      if(near&&near.length&&a<400){const s=near[(R()*near.length)|0],an=R()*6.283,d=s.r*(.35+R()*.5);x=s.x+Math.cos(an)*d;z=s.z+Math.sin(an)*d}
      else{const inTown=inTownOnly||a<600;z=inTown?TOWN_Z+(R()-.5)*160:(R()-.5)*SIZE*.9;x=inTown?roadX(z)+(R()-.5)*110:roadX(z)+(R()<.5?-1:1)*(4.8+R()*3);
        if(inTown&&townW(x,z)<.3)continue}
      if(Math.abs(x-roadX(z))<3.4)continue;if(!free32(x,z,solidR+.2))continue;
      const y=terrainY(x,z),k=h*(.9+R()*.2);list.push({x,y,z,ry:R()*6.283,k,t:.85+R()*.2});if(solidR)solid32(x,z,solidR,solidR,y,k*.8)}
    if(list.length)inst32(unit32(key,1),list.map(p=>({x:p.x,y:p.y,z:p.z,ry:p.ry,sx:p.k,sy:p.k,sz:p.k,t:p.t})))};
  let st=[];try{st=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  scatter('bolsas_arena',.6,26,.45,false,st);
  scatter('cajon_madera',.75,30,.4,false,st);
  scatter('carro_supermercado',.95,16,.4,true,null);
  scatter('generador_electrico',.9,8,.5,false,st);
  scatter('barricada_madera',1.3,14,.9,false,st);
  scatter('bidon_agua',.8,24,.3,false,null);
  // ----- muebles y cajas de botín con modelo propio -----
  const emptyGeo=new THREE.BufferGeometry();emptyGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));emptyGeo.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
  const per={};
  for(const c of conts){const key=CONT32[c.type];const ms=c.mesh;if(!key||!H32.geo[key]||!ms||!ms.isMesh||c.car||c.m18||c.m32)continue;
    const b=c.bld||(typeof insideBuilding==='function'&&insideBuilding(c.x,c.z));
    const bw=ms.scale.x,bh=ms.scale.y,bd=ms.scale.z;const y0=ms.position.y-bh/2;
    // los muebles apoyados contra una pared miran hacia adentro; las cajas sueltas giran al azar
    const yaw=c.type==='caja'&&!b?R()*6.283:(typeof face18==='function'&&b?face18(b,c.x,c.z):R()*6.283);
    const side=Math.abs(Math.sin(yaw))>.5;
    (per[key]||(per[key]=[])).push({x:c.x,y:y0,z:c.z,ry:yaw,sx:side?bd:bw,sy:bh,sz:side?bw:bd,t:1});
    ms.geometry=emptyGeo;c.m32=true}
  for(const k in per)inst32(box32(k),per[k])}
const _genWorld32=genWorld;genWorld=function(seed){const r=_genWorld32.apply(this,arguments);try{if(H32.ready)apply32();else H32.want=true}catch(e){console.error('v32',e)}return r};
