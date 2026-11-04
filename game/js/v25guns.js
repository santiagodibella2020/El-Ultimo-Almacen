'use strict';
/* v0.25: armas largas y brazos en primera persona con modelos CC0 de Quaternius (ver tools/models/guns).
   Rifle de caza, rifle de francotirador, fusil de asalto (AK) y ametralladora (P90) dejan de ser cajas.
   Las manos usan el antebrazo y la mano del modelo humano, con guante y manga. */
const P25={ready:false,geo:{},arm:null};
// rot: [giroX, giroY, giroZ] para que el caño apunte a -z y la culata quede atrás
Object.assign(WPN20,{rifle:['Rifle',0,0],francotirador:['SniperRifle',0,0],fusil:['AK47',0,-Math.PI/2],ametralladora:['P90',0,-Math.PI/2]});
(function(){try{
  const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB25);let n=0;
  const done=()=>{if(++n<ks.length)return;P25.ready=true;
    const go=()=>{if(!P20.ready){setTimeout(go,300);return}for(const k of ks)if(k!=='Arm'&&P25.geo[k])P20.geo[k]=P25.geo[k];
      try{rebuildViewmodels()}catch(e){console.error('v25 vm',e)}};go()};
  ks.forEach(k=>ld.parse(b64(GLB25[k]),'',gl=>{try{const g=raw19(gl.scene);if(k==='Arm')P25.arm=g;else P25.geo[k]=g}catch(e){console.error('glb25',k,e)}done()},e=>{console.error('glb25',k,e);done()}))}catch(e){console.error('glb25',e)}})();

// Antebrazo listo para la mano: palma en el origen, el codo hacia +y antes de girar, ancho de mano ~.085.
let arm25=null,arm25L=null,armMat25=null;
function armGeo25(left){if(left&&arm25L)return arm25L;if(!left&&arm25)return arm25;const g=P25.arm.clone();g.computeBoundingBox();
  const bb=g.boundingBox,sz=bb.getSize(new THREE.Vector3());const s=.42/sz.y;
  // la mano está abajo: la palma queda en el origen
  g.translate(-(bb.min.x+bb.max.x)/2,-bb.min.y-sz.y*.09,-(bb.min.z+bb.max.z)/2);g.scale(left?-s:s,s,s);
  if(left)arm25L=g;else arm25=g;return g}
function armMesh25(left,rx,ry,rz){if(!armMat25)armMat25=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const m=new THREE.Mesh(armGeo25(left),armMat25);m.rotation.set(rx,ry,rz);m.castShadow=false;return m}
const _rightHand25=rightHand;rightHand=function(g,x,y,z,rx=.25){if(!P25.arm)return _rightHand25(g,x,y,z,rx);
  const h=new THREE.Group();h.position.set(x,y,z);h.rotation.x=rx;g.add(h);h.add(armMesh25(false,1.95,0,0));return h};
const _leftHand25=leftHand;leftHand=function(g,x,y,z){if(!P25.arm)return _leftHand25(g,x,y,z);
  const h=new THREE.Group();h.position.set(x,y,z);g.add(h);const m=armMesh25(true,1.85,.5,0);h.add(m);return h};
