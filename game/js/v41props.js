'use strict';
/* v0.41-0.42: autos abandonados y armas tiradas con modelos de Hunyuan3D (tanda 4).
   - Una pickup oxidada y un sedán abandonado al costado de las rutas y los caminos, torcidos como si los hubieran dejado ahí.
   - Escopeta, rifle de caza, hacha de bombero y machete tirados cerca de campamentos, estaciones y terminales (son decoración, no se levantan). */
// acostado: el eje más largo queda horizontal, de largo L, apoyado en el piso
function lay41(k,L){const g=H32.geo[k].clone();let bb=g.boundingBox,s=bb.getSize(new THREE.Vector3());
  if(s.y>=s.x&&s.y>=s.z){g.rotateX(-Math.PI/2);g.computeBoundingBox();bb=g.boundingBox;s=bb.getSize(new THREE.Vector3())}
  const c=bb.getCenter(new THREE.Vector3());g.translate(-c.x,-bb.min.y,-c.z);const m=Math.max(s.x,s.z);g.scale(L/m,L/m,L/m);g.computeBoundingBox();g.computeBoundingSphere();return g}
const V41={};
function apply41(){if(!world||!H32.ready)return;
  const R=mulberry32((worldSeed()^0x41c0de)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  // ----- autos -----
  const cars=[['pickup_oxidada',1.9,12],['sedan_abandonado',1.5,14],['camion_basura',3,6],['ambulancia_vieja',2.4,5],['tractor_viejo',2.3,5]];
  const pts=typeof roadPts36==='function'?roadPts36().filter(p=>(p.road>=0&&Math.abs(p.x-roadX(p.z))>12)||(p.road===-1&&p.z>-690&&p.z<420)):[];
  for(const [key,H,n] of cars){if(!H32.geo[key]||!pts.length)continue;
    const g=unit32(key,H),sz=g.boundingBox.getSize(new THREE.Vector3()),longX=sz.x>sz.z,L=Math.max(sz.x,sz.z),W=Math.min(sz.x,sz.z),list=[];
    for(let a=0;a<900&&list.length<n;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=4.8+R()*2.2,x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!free32(x,z,Math.max(1.4,L*.32))||roadD36(x,z)<3.6||Math.abs(x-roadX(z))<3.6||Math.hypot(x,z)<60)continue;if(townW(x,z)>.3)continue;
      const y=terrainY(x,z),ry=p.yaw-(longX?Math.PI/2:0)+(R()-.5)*(R()<.3?2.2:.7)+(R()<.5?Math.PI:0);
      list.push({x,y:y-.05,z,ry,t:.78+R()*.22});
      const dx=longX?Math.cos(ry):Math.sin(ry),dz=longX?-Math.sin(ry):Math.cos(ry);
      for(const q of [-1,1])solid32(x+dx*L*.25*q,z+dz*L*.25*q,W*.55,W*.55,y,H*.8)}
    V41[key]=list;if(list.length)inst32(g,list)}

  // ----- v0.42: palés con cajas, carteles de ruta y casas rurales de chapa -----
  const scat=(key,h,n,sr,near)=>{if(!H32.geo[key])return;const list=[];
    for(let a=0;a<900&&list.length<n;a++){let x,z;
      if(near&&sites.length&&a<500){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*(.3+R()*.55);x=s.x+Math.cos(an)*d;z=s.z+Math.sin(an)*d}
      else{const p=pts[(R()*pts.length)|0];if(!p)break;const side=R()<.5?-1:1,off=5+R()*2.5;x=p.x+Math.cos(p.yaw)*side*off;z=p.z-Math.sin(p.yaw)*side*off}
      if(!free32(x,z,sr+.3)||Math.abs(x-roadX(z))<3.6||townW(x,z)>.3)continue;const y=terrainY(x,z);list.push({x,y,z,ry:R()*6.283,t:.85+R()*.2});if(sr)solid32(x,z,sr,sr,y,h*.8)}
    V41[key]=list;if(list.length)inst32(unit32(key,h),list)};
  scat('pale_cajas',.9,22,.65,true);
  // carteles: al borde del camino, mirando hacia la calzada
  if(H32.geo.cartel_ruta&&pts.length){const list=[],g=unit32('cartel_ruta',3.2);
    for(let a=0;a<600&&list.length<18;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=4.4+R()*.8,x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!free32(x,z,.4)||roadD36(x,z)<3.4||Math.abs(x-roadX(z))<3.4||Math.hypot(x,z)<50||townW(x,z)>.3)continue;
      const y=terrainY(x,z);list.push({x,y,z,ry:p.yaw+(side>0?-Math.PI/2:Math.PI/2)+(R()-.5)*.4,t:.85+R()*.2});solid32(x,z,.2,.2,y,3)}
    V41.cartel_ruta=list;if(list.length)inst32(g,list)}
  // casas de chapa: lejos del camino, de frente a él
  if(H32.geo.casa_chapa&&pts.length){const g=unit32('casa_chapa',3.4),sz=g.boundingBox.getSize(new THREE.Vector3()),list=[];
    for(let a=0;a<900&&list.length<7;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=15+R()*10,x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!free32(x,z,Math.max(sz.x,sz.z)*.55)||roadD36(x,z)<10||Math.abs(x-roadX(z))<12||Math.hypot(x,z)<90||townW(x,z)>.3)continue;
      if(list.some(q=>Math.hypot(q.x-x,q.z-z)<40))continue;
      const y=terrainY(x,z),ry=Math.round((p.yaw+(side>0?-Math.PI/2:Math.PI/2))/(Math.PI/2))*(Math.PI/2),q=Math.abs(Math.sin(ry))>.5;
      list.push({x,y:y-.1,z,ry,t:.85+R()*.15});solid32(x,z,(q?sz.z:sz.x)*.42,(q?sz.x:sz.z)*.42,y,3.4)}
    V41.casa_chapa=list;if(list.length)inst32(g,list)}
  // ----- armas tiradas -----
  const guns=[['escopeta_doble',1.15,6],['rifle_caza',1.15,6],['hacha_bombero',.95,8],['machete',.65,8]];
  for(const [key,L,n] of guns){if(!H32.geo[key]||!sites.length)continue;const list=[];
    for(let a=0;a<300&&list.length<n;a++){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*(.2+R()*.6),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;
      if(!free32(x,z,.5))continue;list.push({x,y:terrainY(x,z)+.02,z,ry:R()*6.283,t:.85+R()*.2})}
    V41[key]=list;if(list.length)inst32(lay41(key,L),list)}}
const _apply41=apply32;apply32=function(){_apply41.apply(this,arguments);try{apply41()}catch(e){console.error('v41',e)}};
