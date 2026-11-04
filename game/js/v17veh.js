'use strict';
/* v0.17: vehículos con modelos 3D hechos (CC0: Kenney Car Kit y Quaternius), ver tools/models/veh.
   Los modelos reemplazan las cajas de cada vehículo. La física, las colisiones y la carga siguen
   usando las medidas de VEH; el modelo se escala para ocupar ese mismo lugar. */
const GLB17T={ready:false,tpl:{}};
// Colores por nombre de material (modelos de Quaternius). 'body' = color propio del vehículo.
const MAT17={
  sedan:{Blue:'body',Windows:'glass',Black:'#141414',Grey:'#3a3a3a',Headlights:'light',TailLights:'tail'},
  jeep:{White:'body',Windows:'glass',Black:'#141414',Grey:'#3a3a3a',Headlights:'light',TailLights:'tail'},
  ambulancia:{White:'body',Red:'#8a2a22',Windows:'glass',Bumper:'#3a3a38',Lights:'light',Grey:'#55554f',Material:'#151515'},
  colectivo:{Top:'body',Bottom:'#3e3a32',Windows:'glass',Details:'#2a2a28',Bumper:'#3a3a38',Lights:'light',Material:'#151515'},
};
// Cómo se ubica cada modelo: giro (para que el frente quede en +z) y, si hace falta, otra caja de destino.
const FIT17={colectivo:{rot:Math.PI/2},tractor:{len:3.3,wid:2.1,zc:l=>l/2-1.65}};
(function(){try{
  const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB17);let n=0;
  ks.forEach(k=>ld.parse(b64(GLB17[k]),'',gl=>{GLB17T.tpl[k]=gl.scene;if(++n===ks.length){GLB17T.ready=true;try{if(typeof vehicles!=='undefined'&&vehicles)vehicles.forEach(attach17)}catch(e){console.error('glb17 attach',e)}}},
    err=>{console.error('glb17',k,err);if(++n===ks.length)GLB17T.ready=true}))}catch(e){console.error('glb17',e)}})();

// Kenney usa una sola textura-paleta: se pasa a colores por vértice para poder cambiar el color de la carrocería y gastarlo.
const pal17=new Map();
function texPixels17(tex){if(pal17.has(tex))return pal17.get(tex);const im=tex.image;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
  const r={w:c.width,h:c.height,d:x.getImageData(0,0,c.width,c.height).data};pal17.set(tex,r);return r}
function sat17(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx<=0?0:(mx-mn)/mx}
function bakeKenney17(root,bodyCol){
  const meshes=[];root.traverse(o=>{if(o.isMesh&&o.material&&o.material.map)meshes.push(o)});
  const hueW=new Float32Array(36),hsl={h:0,s:0,l:0},tmp=new THREE.Color();
  for(const m of meshes){const g=m.geometry=m.geometry.clone();const uv=g.attributes.uv,px=texPixels17(m.material.map);const n=g.attributes.position.count;const col=new Float32Array(n*3);
    for(let i=0;i<n;i++){const u=uv.getX(i),v=uv.getY(i);const x=Math.min(px.w-1,Math.max(0,Math.floor((u-Math.floor(u))*px.w))),y=Math.min(px.h-1,Math.max(0,Math.floor((v-Math.floor(v))*px.h)));const o=(y*px.w+x)*4;
      const r=px.d[o]/255,gg=px.d[o+1]/255,b=px.d[o+2]/255;col[i*3]=r;col[i*3+1]=gg;col[i*3+2]=b;
      if(!/wheel/i.test(m.name)&&sat17(r,gg,b)>.3){tmp.setRGB(r,gg,b).getHSL(hsl);hueW[Math.floor(hsl.h*36)%36]++}}
    g.setAttribute('color',new THREE.BufferAttribute(col,3))}
  let hb=0;for(let i=1;i<36;i++)if(hueW[i]+hueW[(i+35)%36]+hueW[(i+1)%36]>hueW[hb]+hueW[(hb+35)%36]+hueW[(hb+1)%36])hb=i;
  const mainH=(hb+.5)/36,target=new THREE.Color(bodyCol),grey=new THREE.Color();
  for(const m of meshes){const c=m.geometry.attributes.color;
    for(let i=0;i<c.count;i++){const r=c.getX(i),g=c.getY(i),b=c.getZ(i);tmp.setRGB(r,g,b).getHSL(hsl);let dh=Math.abs(hsl.h-mainH);dh=Math.min(dh,1-dh);
      if(!/wheel/i.test(m.name)&&sat17(r,g,b)>.3&&dh<.09){const k=Math.min(1.15,Math.max(.6,hsl.l/.5));tmp.copy(target).multiplyScalar(k)}
      else{const l=(r+g+b)/3;grey.setRGB(l,l,l);tmp.lerp(grey,.45).multiplyScalar(.82)}
      c.setXYZ(i,tmp.r,tmp.g,tmp.b)}
    m.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.08})}}
function paintQuat17(root,k,bodyCol){const map=MAT17[k]||{};root.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];
  const out=mats.map(m=>{const want=map[m.name]||'#4a4a46';
    if(want==='glass')return new THREE.MeshStandardMaterial({color:0x1c262a,roughness:.25,metalness:.3});
    if(want==='light')return new THREE.MeshStandardMaterial({color:0xd8cfa0,emissive:0x3a3420,roughness:.4});
    if(want==='tail')return new THREE.MeshStandardMaterial({color:0x6a1812,emissive:0x200404,roughness:.5});
    return new THREE.MeshStandardMaterial({color:new THREE.Color(want==='body'?bodyCol:want),roughness:.8,metalness:.1})});
  o.material=Array.isArray(o.material)?out:out[0]})}

function attach17(v){
  if(!v||v.m17||!GLB17T.ready)return;const tpl=GLB17T.tpl[v.k];if(!tpl)return;
  try{
    const d=v.def,f=FIT17[v.k]||{};
    const inner=tpl.clone(true);inner.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
    if(MAT17[v.k])paintQuat17(inner,v.k,d.col);else bakeKenney17(inner,d.col);
    const rot=new THREE.Group();rot.add(inner);rot.rotation.y=f.rot||0;
    const fit=new THREE.Group();fit.add(rot);fit.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(rot),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
    const L=f.len||d.len,W=f.wid||d.wid,sx=W/sz.x,sz2=L/sz.z,sy=(sx+sz2)/2;
    rot.position.set(-c.x,-bb.min.y,-c.z);fit.scale.set(sx,sy,sz2);fit.position.set(0,0,f.zc?f.zc(d.len):0);
    // Se esconden las cajas viejas (menos la carga y la cabina interior).
    const keep=new Set(v.cargoBoxes||[]);v.group.traverse(o=>{if(o.isMesh&&!keep.has(o))o.visible=false});
    v.body.add(fit);
    if(d.bed==='trailer'){const L2=d.len/2,W2=d.wid/2,tr=new THREE.Group();v.body.add(tr);
      bx(d.wid,.35,4.2,'#5a4a32',0,1.05,-L2+2.3,tr);bx(.1,.6,4.2,'#4a3a26',-W2,1.5,-L2+2.3,tr);bx(.1,.6,4.2,'#4a3a26',W2,1.5,-L2+2.3,tr);bx(d.wid,.6,.1,'#4a3a26',0,1.5,-L2+.2,tr);
      bx(.15,.15,1.6,'#2a2a28',0,.85,-L2+4.9,tr);
      [[-W2-.05,-L2+2.3],[W2+.05,-L2+2.3]].forEach(([x,z])=>{const w=bx(1,.35,1,'#151515',x,.5,z,tr,CYL);w.rotation.z=Math.PI/2});
      tr.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});v.cabin=[fit,tr]}
    else v.cabin=[fit];
    // Ruedas: cada una gira sobre su propio centro.
    v.body.updateMatrixWorld(true);const wl=[];const isW=o=>/wheel/i.test(o.name);inner.traverse(o=>{if(isW(o)&&(o.isMesh||o.children.length)&&!(o.parent&&isW(o.parent)))wl.push(o)});
    v.w17=wl.map(m=>{const b=new THREE.Box3().setFromObject(m),cc=b.getCenter(new THREE.Vector3());v.body.worldToLocal(cc);
      const p=new THREE.Group();p.position.copy(cc);v.body.add(p);p.updateMatrixWorld(true);p.attach(m);
      const s=b.getSize(new THREE.Vector3());return{p,front:cc.z>0,single:s.x<Math.max(s.y,s.z)*1.2,r:Math.max(.2,Math.max(s.y,s.z)/2)}});
    v.spin17=0;v.m17=fit;
  }catch(e){console.error('glb17 vehicle',v.k,e)}}

const _buildVehicles17=buildVehicles;
buildVehicles=function(rng){_buildVehicles17(rng);try{if(GLB17T.ready)vehicles.forEach(attach17)}catch(e){console.error('glb17',e)}};
const _updateVehicle17=updateVehicle;
updateVehicle=function(tr,dt){_updateVehicle17(tr,dt);if(!tr.w17)return;
  tr.spin17+=(tr.speed||0)*Math.min(dt,.05);
  for(const w of tr.w17){w.p.rotation.set(tr.spin17/w.r,w.front&&w.single?(tr.steer||0):0,0,'YXZ')}};
