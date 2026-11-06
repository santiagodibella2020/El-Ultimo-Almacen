'use strict';
/* 0.46: el pozo, los puestos de mercado y las torres del pueblo pasan a usar modelos de Hunyuan3D (tanda 7). */
let m46=null;
function sw46(g,k,h){try{if(!H32.ready||!H32.geo[k])return g;g.children.slice().forEach(c=>c.visible=false);
  if(!m46)m46=new THREE.MeshLambertMaterial({vertexColors:true});const me=new THREE.Mesh(unit32(k,h),m46);me.castShadow=true;me.receiveShadow=true;g.add(me)}catch(e){console.error('v46',e)}return g}
const _p46=mkPozo37;mkPozo37=function(x,z,bs){return sw46(_p46(x,z,bs),'pozo_bomba',2.8)};
const _m46=mkMercado37;mkMercado37=function(x,z,k,bs){return sw46(_m46(x,z,k,bs),'puesto_mercado',2.8)};
const _t46=mkTorre37;mkTorre37=function(x,z,bs){return sw46(_t46(x,z,bs),'torre_vigia',6.6)};
