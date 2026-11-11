'use strict';
/* 0.53: segunda tanda de Tripo. Reemplaza los modelos viejos de Hunyuan (ambulancia, camión, patrullero, tractor, molino, silo, tanque, casa de suburbio,
   puesto de mercado, postes, muebles, barriles, etc.) y suma hormigoneras, andamios y carros de mano cerca de campamentos y estaciones. */
function apply53(){if(!world||!H32.ready)return;
  const R=mulberry32((worldSeed()^0x53d0c5)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>s.kind==='gas22'||s.kind==='camp'||s.kind==='terminal')}catch(e){}
  const near=(key,H,n,sr,d0,d1)=>{if(!H32.geo[key]||!sites.length)return;const g=unit32(key,H),list=[];
    for(let a=0;a<500&&list.length<n;a++){const s=sites[(R()*sites.length)|0],an=R()*6.283,d=s.r*((d0||.25)+R()*((d1||.8)-(d0||.25))),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;
      if(!free32(x,z,sr+.3))continue;const y=terrainY(x,z);list.push({x,y:y-.03,z,ry:R()*6.283,t:.8+R()*.2});if(sr)solid32(x,z,sr,sr,y,H*.8)}
    if(list.length)inst32(g,list)};
  near('hormigonera',1.3,4,.6);near('andamio',3.4,4,.7);near('carro_mano',.9,5,.4)}
const _a53=apply32;apply32=function(){_a53.apply(this,arguments);try{apply53()}catch(e){console.error('v53',e)}};
