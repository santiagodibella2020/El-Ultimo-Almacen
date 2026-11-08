'use strict';
/* 0.51: modelos de Tripo (IA). Varios reemplazan a los de Hunyuan3D en glb32.js (autos, colectivo, casa de chapa, torre, empalizada,
   portón, pozo, muebles y armas) y estos son nuevos: casas de dos plantas, contenedores, antenas, cementerios con lápidas, un altar,
   fogones, garrafas, barricadas de tablas, cajas fuertes, carteles, mochilas, cajones de verdura y pistolas tiradas (se levantan con E). */
function apply51(){if(!world||!H32.ready)return;
  const R=mulberry32((worldSeed()^0x51a7c0)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  const pts=typeof roadPts36==='function'?roadPts36().filter(p=>(p.road>=0&&Math.abs(p.x-roadX(p.z))>12)||(p.road===-1&&p.z>-690&&p.z<420)):[];
  const okp=(x,z,r)=>free32(x,z,r+.3)&&Math.abs(x-roadX(z))>3.6&&roadD36(x,z)>3.4&&townW(x,z)<=.3&&Math.hypot(x,z)>60;
  // sólido a lo largo del lado largo (para lo que no es redondo)
  const solidL=(g,x,z,y,ry,H)=>{const sz=g.boundingBox.getSize(new THREE.Vector3()),longX=sz.x>sz.z,L=Math.max(sz.x,sz.z),W=Math.min(sz.x,sz.z);
    const dx=longX?Math.cos(ry):Math.sin(ry),dz=longX?-Math.sin(ry):Math.cos(ry),n=Math.max(1,Math.round(L/W));
    for(let i=0;i<n;i++){const t=n===1?0:(i/(n-1)-.5)*(L-W);solid32(x+dx*t,z+dz*t,W*.5,W*.5,y,H*.9)}};
  // al costado del camino, de frente a la calzada
  const edge=(key,H,n,off0,off1,sr,face,sep)=>{if(!H32.geo[key]||!pts.length)return;const g=unit32(key,H),list=[];
    for(let a=0;a<900&&list.length<n;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=off0+R()*(off1-off0),x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!okp(x,z,sr))continue;if(sep&&list.some(q=>Math.hypot(q.x-x,q.z-z)<sep))continue;
      const y=terrainY(x,z),ry=face?Math.round((p.yaw+(side>0?-Math.PI/2:Math.PI/2))/(Math.PI/2))*(Math.PI/2)+(face===2?(R()-.5)*.3:0):R()*6.283;
      list.push({x,y:y-.08,z,ry,t:.85+R()*.15});solidL(g,x,z,y,ry,H)}
    if(list.length)inst32(g,list)};
  // cerca de campamentos, estaciones y terminales
  const near=(key,H,n,solid,d0,d1)=>{if(!H32.geo[key]||!sites.length)return;const g=unit32(key,H),list=[];
    for(let a=0;a<500&&list.length<n;a++){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*((d0||.25)+R()*((d1||.8)-(d0||.25))),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;
      if(!free32(x,z,.6))continue;const y=terrainY(x,z),ry=R()*6.283;list.push({x,y:y-.03,z,ry,t:.8+R()*.2});if(solid)solidL(g,x,z,y,ry,H)}
    if(list.length)inst32(g,list)};
  edge('casa_dos_plantas',7,4,18,28,4,1,60);
  edge('antena',13,3,14,30,.6,0,200);
  edge('barricada_tablas',1.7,8,4.6,7,.9,2);
  edge('cartel_poste',2.8,10,4.3,5.2,.2,2);
  near('contenedor_maritimo',2.6,6,true,.5,1);
  near('caja_fuerte',1.1,4,true);near('garrafa_gas',.6,14,false);near('fogon',.7,6,false,.15,.5);
  near('mochila',.5,6,false);near('cajon_verduras',.45,10,false);
  // cementerios: lápidas en hileras, lejos del camino; uno tiene el altar en la cabecera
  if(H32.geo.lapida&&pts.length){const g=unit32('lapida',1.1),list=[];let alt=null;
    for(let a=0,c=0;a<400&&c<3;a++){const p=pts[(R()*pts.length)|0],side=R()<.5?-1:1,off=14+R()*10,x=p.x+Math.cos(p.yaw)*side*off,z=p.z-Math.sin(p.yaw)*side*off;
      if(!okp(x,z,5))continue;const ry=p.yaw,cx=Math.cos(ry),sx=Math.sin(ry);c++;
      for(let i=0;i<3;i++)for(let j=0;j<4;j++){if(R()<.2)continue;const u=(j-1.5)*2,v=(i-1)*2.6,px=x+cx*u+sx*v,pz=z-sx*u+cx*v;if(!free32(px,pz,.3))continue;
        const y=terrainY(px,pz);list.push({x:px,y:y-.05,z:pz,ry:ry+(R()-.5)*.25,rz:(R()-.5)*.12,t:.75+R()*.25});solid32(px,pz,.3,.3,y,1)}
      if(!alt&&H32.geo.altar){const px=x+sx*5.2,pz=z+cx*5.2;if(free32(px,pz,1))alt={x:px,y:terrainY(px,pz)-.05,z:pz,ry,t:.9}}}
    if(list.length)inst32(g,list);
    if(alt){inst32(unit32('altar',1.4),[alt]);solid32(alt.x,alt.z,.8,.8,alt.y,1.4)}}}
const _a51=apply32;apply32=function(){_a51.apply(this,arguments);try{apply51()}catch(e){console.error('v51',e)}};
