'use strict';
/* 0.47: empalizada y portón en el campamento de la banda, invernadero junto a la huerta y avisos de la gran horda (rugidos lejanos). */
function apply47(){if(!world||!H32.ready)return;
  const cg=P45.find(p=>p.tag==='cage');
  if(cg&&H32.geo.empalizada&&H32.geo.porton_madera){const R=mulberry32((worldSeed()^0x47a1)>>>0),g=unit32('empalizada',2.1),L=g.boundingBox.getSize(new THREE.Vector3()).z,r=7.5,n=Math.max(8,Math.round(2*Math.PI*r/L)),list=[];
    for(let i=1;i<n;i++){const a=i/n*Math.PI*2,x=cg.x+Math.cos(a)*r,z=cg.z+Math.sin(a)*r;if(!free32(x,z,.5))continue;list.push({x,y:terrainY(x,z)-.2,z,ry:-a,t:.8+R()*.15})}
    if(list.length)inst32(g,list);
    const gx=cg.x+r,gz=cg.z,gg=unit32('porton_madera',2.6);if(free32(gx,gz,.5))inst32(gg,[{x:gx,y:terrainY(gx,gz)-.05,z:gz,ry:Math.PI/2,t:.9}])}
  if(H32.geo.invernadero){const x=-24,z=9,g=unit32('invernadero',3.2),sz=g.boundingBox.getSize(new THREE.Vector3());
    inst32(g,[{x,y:groundY(x,z)-.05,z,ry:Math.PI/2,t:1}]);solid32(x,z,sz.z*.5,sz.x*.5,groundY(x,z),3)}}
const _a47=apply32;apply32=function(){_a47.apply(this,arguments);try{apply47()}catch(e){console.error('v47',e)}};
// avisos: rugidos lejanos la tarde de la gran horda y la víspera
const _oh47=onHour;onHour=function(prev,now){_oh47(prev,now);try{const cross=v=>prev<v&&now>=v,big=d=>d>=7&&d%7===0;
  if(cross(18.5)&&big(S.day)){sfx('roar',P.x+70,P.z);toast(L('Los perros no paran de aullar. Algo grande se acerca.'),'#cc4b30',6)}
  if(cross(16)&&big(S.day+1)){sfx('roar',P.x-80,P.z);toast(L('A lo lejos se oyen rugidos.'),'#e3a33b',5)}}catch(e){console.error('n47',e)}};
