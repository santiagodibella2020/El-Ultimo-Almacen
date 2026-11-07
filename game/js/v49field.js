'use strict';
/* 0.49: campo y calle (tanda 9): molinos, silos, carretas, tranqueras, postes de luz, bancos, semáforos, cabinas, hidrantes, buzones, barriles con fuego y neumáticos. */
function apply49(){if(!world||!H32.ready)return;
  const R=mulberry32((worldSeed()^0x49f1e1)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  const pts=typeof roadPts36==='function'?roadPts36().filter(p=>(p.road>=0&&Math.abs(p.x-roadX(p.z))>12)||(p.road===-1&&p.z>-690&&p.z<420)):[];
  const okp=(x,z,r)=>free32(x,z,r+.3)&&Math.abs(x-roadX(z))>3.6&&roadD36(x,z)>3.4&&townW(x,z)<=.3&&Math.hypot(x,z)>60;
  // junto al camino (vehículos)
  const road=(key,H,n,off0,off1)=>{if(!H32.geo[key]||!pts.length)return;const g=unit32(key,H),sz=g.boundingBox.getSize(new THREE.Vector3()),longX=sz.x>sz.z,L=Math.max(sz.x,sz.z),W=Math.min(sz.x,sz.z),list=[];
    for(let a=0;a<900&&list.length<n;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=off0+R()*(off1-off0),x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!okp(x,z,Math.max(.8,L*.3)))continue;const y=terrainY(x,z),ry=p.yaw-(longX?Math.PI/2:0)+(R()-.5)*(R()<.3?2.2:.7)+(R()<.5?Math.PI:0);
      list.push({x,y:y-.05,z,ry,t:.8+R()*.2});
      const dx=longX?Math.cos(ry):Math.sin(ry),dz=longX?-Math.sin(ry):Math.cos(ry);for(const q of [-1,1])solid32(x+dx*L*.25*q,z+dz*L*.25*q,W*.5,W*.5,y,H*.8)}
    if(list.length)inst32(g,list)};
  // junto al camino, mirando a la calzada o de frente
  const edge=(key,H,n,off0,off1,sr,face)=>{if(!H32.geo[key]||!pts.length)return;const g=unit32(key,H),list=[];
    for(let a=0;a<900&&list.length<n;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=off0+R()*(off1-off0),x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!okp(x,z,sr||.3))continue;const y=terrainY(x,z);list.push({x,y:y-.05,z,ry:face?p.yaw+(side>0?-Math.PI/2:Math.PI/2)+(R()-.5)*.3:R()*6.283,t:.8+R()*.2});if(sr)solid32(x,z,sr,sr,y,H*.8)}
    if(list.length)inst32(g,list)};
  edge('molino_viento',7,3,18,32,.9);edge('silo_granos',8,2,20,32,1.6);edge('carreta_madera',1.4,5,5,8,.8);edge('tranquera',1.5,6,5.5,8,.5,true);edge('poste_luz',6,10,4.3,5,.2,true);
  const near=(key,H,n,sr)=>{if(!H32.geo[key]||!sites.length)return;const g=unit32(key,H),list=[];
    for(let a=0;a<400&&list.length<n;a++){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*(.25+R()*.55),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;
      if(!free32(x,z,sr+.3))continue;const y=terrainY(x,z);list.push({x,y:y-.03,z,ry:R()*6.283,t:.8+R()*.2});if(sr)solid32(x,z,sr,sr,y,H*.8)}
    if(list.length)inst32(g,list)};
  near('banco_plaza',.9,4,.7);near('semaforo',4,2,.2);near('cabina_telefono',2.3,2,.5);near('hidrante',.9,3,.25);near('buzon_correo',1.3,3,.3);near('barril_fuego',1,5,.4);near('montana_neumaticos',1.4,4,.8)}
const _a49=apply32;apply32=function(){_a49.apply(this,arguments);try{apply49()}catch(e){console.error('v49',e)}};
