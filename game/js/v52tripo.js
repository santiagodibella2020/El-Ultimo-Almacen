'use strict';
/* 0.52: lo que faltaba de Tripo. El invernadero del campamento usa el modelo nuevo y aparecen motos tiradas en la ruta,
   cajones de metal y botiquines cerca de campamentos y estaciones, y cuerpos de zombis caídos alrededor. */
// acostado boca arriba: el alto pasa a ser el largo (sirve para cuerpos en pose T aunque los brazos sean más anchos que el alto)
function flat52(k,L){const g=H32.geo[k].clone();g.rotateX(-Math.PI/2);g.computeBoundingBox();const bb=g.boundingBox,s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  g.translate(-c.x,-bb.min.y,-c.z);const k2=L/s.z;g.scale(k2,k2,k2);g.computeBoundingBox();g.computeBoundingSphere();return g}
function apply52(){if(!world||!H32.ready)return;
  const R=mulberry32((worldSeed()^0x52b0d1)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  const pts=typeof roadPts36==='function'?roadPts36().filter(p=>(p.road>=0&&Math.abs(p.x-roadX(p.z))>12)||(p.road===-1&&p.z>-690&&p.z<420)):[];
  const nearPts=(g,n,d0,d1,solid,H)=>{const list=[];if(!sites.length)return list;
    for(let a=0;a<500&&list.length<n;a++){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*(d0+R()*(d1-d0)),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;
      if(!free32(x,z,.6))continue;const y=terrainY(x,z);list.push({x,y:y-.03,z,ry:R()*6.283,t:.8+R()*.2});if(solid)solid32(x,z,solid,solid,y,H)}
    if(list.length)inst32(g,list);return list};
  if(H32.geo.cajon_metal)nearPts(unit32('cajon_metal',.8),8,.25,.8,.5,.8);
  if(H32.geo.botiquin)nearPts(unit32('botiquin',.35),6,.15,.6,0,0);
  // cuerpos caídos: cerca de los sitios y alguno suelto al costado del camino
  for(const [k,L,n] of [['zombi',1.8,10],['zombi_grande',2.2,5]]){if(!H32.geo[k])continue;nearPts(flat52(k,L),n,.3,1.1,0,0)}
  // motos tiradas al costado de la ruta
  if(H32.geo.moto_tirada&&pts.length){const g=lay41('moto_tirada',2),list=[];
    for(let a=0;a<600&&list.length<6;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=4.4+R()*2.5,x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!free32(x,z,.9)||roadD36(x,z)<3.6||Math.abs(x-roadX(z))<3.6||townW(x,z)>.3||Math.hypot(x,z)<60)continue;
      list.push({x,y:terrainY(x,z)-.02,z,ry:R()*6.283,t:.85+R()*.15})}
    if(list.length)inst32(g,list)}}
const _a52=apply32;apply32=function(){_a52.apply(this,arguments);try{apply52()}catch(e){console.error('v52',e)}};
