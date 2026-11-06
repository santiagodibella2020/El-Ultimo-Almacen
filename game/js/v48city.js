'use strict';
/* 0.48: más vida en rutas y campamentos con modelos de Hunyuan3D (tanda 8): patrulleros, colectivos, motos y bicis abandonados, casas de suburbio,
   muebles tirados cerca de campamentos y estaciones, generador con torre de luz y tanque de agua. */
function apply48(){if(!world||!H32.ready)return;
  const R=mulberry32((worldSeed()^0x48c17f)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  const pts=typeof roadPts36==='function'?roadPts36().filter(p=>(p.road>=0&&Math.abs(p.x-roadX(p.z))>12)||(p.road===-1&&p.z>-690&&p.z<420)):[];
  const okp=(x,z,r)=>free32(x,z,r+.3)&&Math.abs(x-roadX(z))>3.6&&roadD36(x,z)>3.4&&townW(x,z)<=.3&&Math.hypot(x,z)>60;
  // junto al camino (vehículos)
  const road=(key,H,n,off0,off1)=>{if(!H32.geo[key]||!pts.length)return;const g=unit32(key,H),sz=g.boundingBox.getSize(new THREE.Vector3()),longX=sz.x>sz.z,L=Math.max(sz.x,sz.z),W=Math.min(sz.x,sz.z),list=[];
    for(let a=0;a<900&&list.length<n;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=off0+R()*(off1-off0),x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!okp(x,z,Math.max(.8,L*.3)))continue;const y=terrainY(x,z),ry=p.yaw-(longX?Math.PI/2:0)+(R()-.5)*(R()<.3?2.2:.7)+(R()<.5?Math.PI:0);
      list.push({x,y:y-.05,z,ry,t:.8+R()*.2});
      const dx=longX?Math.cos(ry):Math.sin(ry),dz=longX?-Math.sin(ry):Math.cos(ry);for(const q of [-1,1])solid32(x+dx*L*.25*q,z+dz*L*.25*q,W*.5,W*.5,y,H*.8)}
    if(list.length)inst32(g,list)};
  road('patrullero',1.5,5,4.8,7);road('colectivo_viejo',3,4,5,7.5);road('motocicleta',1.1,7,4.5,6.5);road('bicicleta',1,7,4.3,6);
  // casas de suburbio
  if(H32.geo.casa_suburbio&&pts.length){const g=unit32('casa_suburbio',3.6),sz=g.boundingBox.getSize(new THREE.Vector3()),list=[];
    for(let a=0;a<900&&list.length<6;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=16+R()*10,x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!free32(x,z,Math.max(sz.x,sz.z)*.55)||roadD36(x,z)<10||Math.abs(x-roadX(z))<12||Math.hypot(x,z)<90||townW(x,z)>.3)continue;if(list.some(q=>Math.hypot(q.x-x,q.z-z)<40))continue;
      const y=terrainY(x,z),ry=Math.round((p.yaw+(side>0?-Math.PI/2:Math.PI/2))/(Math.PI/2))*(Math.PI/2),q=Math.abs(Math.sin(ry))>.5;
      list.push({x,y:y-.1,z,ry,t:.85+R()*.15});solid32(x,z,(q?sz.z:sz.x)*.42,(q?sz.x:sz.z)*.42,y,3.6)}
    if(list.length)inst32(g,list)}
  // cerca de campamentos, estaciones y terminales
  const near=(key,H,n,sr)=>{if(!H32.geo[key]||!sites.length)return;const g=unit32(key,H),list=[];
    for(let a=0;a<400&&list.length<n;a++){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*(.25+R()*.55),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;
      if(!free32(x,z,sr+.3))continue;const y=terrainY(x,z);list.push({x,y:y-.03,z,ry:R()*6.283,t:.8+R()*.2});if(sr)solid32(x,z,sr,sr,y,H*.8)}
    if(list.length)inst32(g,list)};
  near('sofa_roto',.9,6,.7);near('cama_hierro',.7,5,.6);near('mesa_sillas',.9,5,.8);near('estanteria_madera',1.8,5,.5);near('heladera_mostrador',1.7,4,.5);
  near('generador_torre_luz',3.6,3,.6);near('tanque_agua',5,3,.9)}
const _a48=apply32;apply32=function(){_a48.apply(this,arguments);try{apply48()}catch(e){console.error('v48',e)}};
