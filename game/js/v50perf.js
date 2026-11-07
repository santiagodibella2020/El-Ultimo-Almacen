'use strict';
/* 0.50: rendimiento. Las instancias de los modelos de Hunyuan3D se reparten en celdas de ~96 m, así la cámara y las sombras
   descartan las celdas que no se ven en lugar de dibujar los 66 modelos de todo el mapa en cada cuadro. */
const CELL50=96;
inst32=function(geo,list,shadow){if(!list.length)return null;if(!mat32)mat32=new THREE.MeshLambertMaterial({vertexColors:true});
  if(!geo.boundingSphere)geo.computeBoundingSphere();const gs=geo.boundingSphere,gr=gs.radius*1.6+gs.center.length()*1.6;
  const cells=new Map();list.forEach((p,i)=>{const k=Math.floor(p.x/CELL50)+','+Math.floor(p.z/CELL50);let c=cells.get(k);if(!c){c={cx:(Math.floor(p.x/CELL50)+.5)*CELL50,cz:(Math.floor(p.z/CELL50)+.5)*CELL50,items:[]};cells.set(k,c)}c.items.push([p,i])});
  const where=new Array(list.length),chunks=[],dm=new THREE.Object3D(),col=new THREE.Color();
  for(const c of cells.values()){const g=new THREE.BufferGeometry();g.index=geo.index;for(const n in geo.attributes)g.setAttribute(n,geo.attributes[n]);
    let rad=0;for(const [p] of c.items)rad=Math.max(rad,Math.hypot(p.x-c.cx,p.y,p.z-c.cz));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),rad+gr);g.boundingBox=geo.boundingBox;
    const im=new THREE.InstancedMesh(g,mat32,c.items.length);
    c.items.forEach(([p,i],j)=>{dm.position.set(p.x-c.cx,p.y,p.z-c.cz);dm.rotation.set(p.rx||0,p.ry||0,p.rz||0);dm.scale.set(p.sx||p.k||1,p.sy||p.k||1,p.sz||p.k||1);dm.updateMatrix();im.setMatrixAt(j,dm.matrix);const t=p.t||1;im.setColorAt(j,col.setRGB(t,t,t));where[i]=[im,j]});
    im.position.set(c.cx,0,c.cz);im.updateMatrix();im.matrixAutoUpdate=false;im.castShadow=shadow!==false;im.receiveShadow=true;im.frustumCulled=true;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
    world.add(im);extra32.push(im);chunks.push(im)}
  if(chunks.length===1)return chunks[0];
  // fachada: quien guarda el resultado (armas del suelo) sigue pudiendo ocultar instancias por índice
  return{setMatrixAt(i,m){const w=where[i];if(w)w[0].setMatrixAt(w[1],m)},instanceMatrix:{set needsUpdate(v){chunks.forEach(c=>c.instanceMatrix.needsUpdate=true)}},chunks}};
