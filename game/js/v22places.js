'use strict';
/* v0.22: lugares nuevos para explorar. Una estación de servicio sobre la ruta, una escuela rural y un hospital.
   No son lugares seguros: cada día que te acercás hay podridos adentro y alrededor. Tienen botín propio
   (camillas, vitrinas de medicamentos, pupitres, la cocina del comedor). */
Object.assign(PLACES6,{
  servicio:{n:'Estación de servicio La Posta',kind:'gas22',r:22,rad:[120,400]},
  escuela:{n:'Escuela rural N.º 14',kind:'school22',r:25,rad:[140,380]},
  hospital:{n:'Hospital San Roque',kind:'hosp22',r:30,rad:[170,400]},
});
// Si un lugar nuevo no encontró dónde ir (o cayó encima de otro), se busca otro lugar libre.
const _sitesGet22=sitesGet6;sitesGet6=function(){const r=_sitesGet22();if(r.fixed22)return r;r.fixed22=true;const rng=mulberry32((seed6^0x2222)>>>0);
  for(const s of r){if(!P22KIND[s.kind])continue;const bad=(x,z,rr)=>Math.hypot(x,z)<110||Math.hypot(x-roadX(TOWN_Z),z-TOWN_Z)<160||Math.abs(z-TOWN_Z)<110&&Math.abs(x-roadX(z))<95||
      r.some(o=>o!==s&&Math.hypot(o.x-x,o.z-z)<o.r+rr+50);
    if(!bad(s.x,s.z,s.r))continue;
    for(let a=0;a<3000;a++){const ang=rng()*6.283,rad=120+rng()*290,x=Math.cos(ang)*rad,z=Math.sin(ang)*rad;if(bad(x,z,s.r))continue;if(Math.abs(x-roadX(z))<s.r+12)continue;
      const y=rawMain6(x,z);const hs=[];for(let i=0;i<8;i++)hs.push(rawMain6(x+Math.cos(i*.785)*s.r,z+Math.sin(i*.785)*s.r));const mn=Math.min(y,...hs),mx=Math.max(y,...hs);
      if(mn<WATER_Y+1.8||mx-mn>(a<1500?7:12)||y>16)continue;s.x=x;s.z=z;s.y=clamp((y*2+mx+mn)/4,WATER_Y+2.2,16);break}}
  return r};
function names22(){return [L('Estación de servicio La Posta'),L('Escuela rural N.º 14'),L('Hospital San Roque')]}
const P22KIND={gas22:1,school22:1,hosp22:1};
let B22=[];

// ---------- Edificio genérico: losa, paredes con puertas y ventanas, tabiques y techo ----------
function bld22(cx,cz,w,d,o){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,H=o.H||3.2,col=o.col||'#8a8478';
  const hs=[terrainY(x0,z0),terrainY(x1,z0),terrainY(x0,z1),terrainY(x1,z1),terrainY(cx,cz)];const mn=Math.min(...hs),mx=Math.max(...hs),floor=mx+.15;
  const b={x0,x1,z0,z1,cx,cz,w,d,floor,name:o.name||'',p22:true};B22.push(b);buildings.push(b);
  const g=grp(0,0,0,world);
  bx(w,mx-mn+.6,d,o.floorCol||'#6a665e',cx,(floor+mn-.45)/2,cz,g);
  addAABB({x0,x1,z0,z1,y0:mn-2,y1:floor-.02,kind:'floor'});addFloorArea({x0,x1,z0,z1,floor});
  const seg=(x,z,sx,sz,h,y,c)=>{bx(sx,h,sz,c||col,x,y+h/2,z,g);addAABB({x0:x-sx/2,x1:x+sx/2,z0:z-sz/2,z1:z+sz/2,y0:mn-2,y1:y+h,kind:'solid'})};
  // pared recta con huecos [pos,ancho] medidos desde el comienzo
  const wall=(horiz,fixed,a0,len,gaps,th,outer,side)=>{let p=0;const cuts=gaps.map(([pp,gw])=>[pp-gw/2,pp+gw/2]).sort((u,v)=>u[0]-v[0]);
    for(const [ga,gb] of [...cuts,[len,len]]){if(ga-p>.05){const m=a0+(p+ga)/2,l=ga-p;if(horiz)seg(m,fixed,l+.02,th,H,floor);else seg(fixed,m,th,l+.02,H,floor)}
      if(gb<len){const m=a0+(ga+gb)/2,l=gb-ga;if(horiz)bx(l,.6,th,col,m,floor+H-.3,fixed,g);else bx(th,.6,l,col,fixed,floor+H-.3,m,g)}p=gb}
    if(!outer)return;const nw=Math.floor(len/3.2);for(let i=0;i<nw;i++){const f=(i+.5)/nw*len;if(cuts.some(([ga,gb])=>f>ga-1.1&&f<gb+1.1))continue;
      const off=(side===0||side===2?-1:1)*(th/2+.02);const wm=bx(horiz?1.3:.04,1,horiz?.04:1.3,'#1e2628',0,0,0,g);
      if(horiz)wm.position.set(a0+f,floor+1.7,fixed+off);else wm.position.set(fixed+off,floor+1.7,a0+f);
      const sill=bx(horiz?1.5:.1,.1,horiz?.1:1.5,'#b8b2a4',0,0,0,g);if(horiz)sill.position.set(a0+f,floor+1.15,fixed+off);else sill.position.set(fixed+off,floor+1.15,a0+f)}};
  const doors=o.doors||[[1,.5,2]];const dg=s=>doors.filter(dd=>dd[0]===s).map(([,pos,dw])=>[pos*(s<2?w:d),dw]);
  wall(true,z0,x0,w,dg(0),.32,true,0);wall(true,z1,x0,w,dg(1),.32,true,1);wall(false,x0,z0,d,dg(2),.32,true,2);wall(false,x1,z0,d,dg(3),.32,true,3);
  // tabiques: {x} o {z} en coordenadas locales (desde el centro), desde/hasta y huecos en metros desde el comienzo
  for(const t of (o.inner||[])){if(t.x!=null){const a=cz+(t.a??-d/2),l=(t.b??d/2)-(t.a??-d/2);wall(false,cx+t.x,a,l,t.gaps||[],.18,false)}
    else{const a=cx+(t.a??-w/2),l=(t.b??w/2)-(t.a??-w/2);wall(true,cz+t.z,a,l,t.gaps||[],.18,false)}}
  // techo y piso de arriba (se esconden juntos en la vista isométrica)
  const roof=grp(0,0,0,world);bx(w+.5,.3,d+.5,o.roofCol||'#4a4844',cx,floor+H+.15,cz,roof);
  if(o.upper){const U=o.upper;bx(w,U,d,col,cx,floor+H+.3+U/2,cz,roof);bx(w+.6,.3,d+.6,o.roofCol||'#4a4844',cx,floor+H+.3+U+.15,cz,roof);
    for(const [s,len] of [[0,w],[1,w],[2,d],[3,d]]){const n=Math.floor(len/3.2);for(let i=0;i<n;i++){const f=(i+.5)/n*len-len/2;
      const m=bx(s<2?1.3:.04,1,s<2?.04:1.3,'#1e2628',0,0,0,roof);if(s<2)m.position.set(cx+f,floor+H+.3+U/2+.1,s===0?z0-.02:z1+.02);else m.position.set(s===2?x0-.02:x1+.02,floor+H+.3+U/2+.1,cz+f)}}}
  else bx(w+.7,.18,.18,'#3a3834',cx,floor+H+.36,z1+.3,roof);
  roofs.push({g:roof,b});b.roof=roof;
  b.g=g;b.top=floor+H+.3+(o.upper||0);
  // mueble: si type no es null es un contenedor revisable
  b.furn=(type,x,z,fw,fh,fd,c,yOff)=>{const m=bx(fw,fh,fd,c,cx+x,floor+(yOff||0)+fh/2,cz+z,g);addAABB({x0:cx+x-fw/2,x1:cx+x+fw/2,z0:cz+z-fd/2,z1:cz+z+fd/2,y0:floor-.1,y1:floor+(yOff||0)+fh,kind:'solid'});
    if(type)addCont(type,cx+x,cz+z,floor,m,{bld:b});return m};
  b.deco=(x,z,fw,fh,fd,c,yOff,geo)=>bx(fw,fh,fd,c,cx+x,floor+(yOff||0)+fh/2,cz+z,g,geo);
  return b}
const solid22=(x,z,w,d,y,h)=>addAABB({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y-1,y1:y+h,kind:'solid'});
function pad22(cx,cz,w,d,c){const y=Math.max(terrainY(cx-w/2,cz-d/2),terrainY(cx+w/2,cz-d/2),terrainY(cx-w/2,cz+d/2),terrainY(cx+w/2,cz+d/2),terrainY(cx,cz));
  const m=bx(w,.5,d,c,cx,y-.17,cz,world);m.castShadow=false;return y+.08}
function board22(text,x,y,z,yaw,w,h,bg,fg){const sg=new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:signTexture(text,bg,fg),color:0xb8ad98}));
  sg.position.set(x,y,z);sg.rotation.y=yaw;world.add(sg);return sg}
function bed22(b,x,z,cont){b.furn(cont?'camilla':null,x,z,1,.55,2.1,'#d8d8d0');b.deco(x,z-.75,.95,.18,.5,'#eef0ea',.55);b.deco(x,z+.2,1,.08,1.3,'#7a9ab0',.55);
  b.deco(x+.55,z-1.05,.05,1.5,.05,'#8a8e90');b.deco(x+.55,z-1.05,.25,.35,.05,'#c8d0d0',1.2)}
function desk22(b,x,z,cont){b.furn(cont?'pupitre':null,x,z,1.1,.72,.55,'#8a6a44');b.deco(x,z+.55,.42,.42,.4,'#6a7a8a',0);b.deco(x,z+.75,.42,.45,.05,'#6a7a8a',.42)}

// ---------- Estación de servicio ----------
function buildGas22(s,rng){const cx=s.x,cz=s.z,toRoad=Math.sign(roadX(cz)-cx)||1;
  pad22(cx,cz,40,30,'#6e6c66');
  // tienda del lado de afuera, con la puerta hacia la playa de surtidores
  const sx=cx-toRoad*9,b=bld22(sx,cz-3,10,13,{name:'servicio',col:'#c8c2b4',doors:[[toRoad>0?3:2,.5,2.4]],roofCol:'#a8322a'});
  const ins=toRoad;// hacia la ruta
  b.furn('kiosco',ins*2.6,-4.4,2.6,1,.8,'#8a2a22');b.furn('gondola',-ins*1.4,-.5,.8,1.5,4,'#9a9a92');b.furn('gondola',ins*.9,1.4,.8,1.5,3.4,'#9a9a92');
  b.furn('heladera',-ins*4.4,-3.5,.8,2,1.6,'#d8e0e4');b.furn(null,-ins*4.4,-1.3,.8,2,1.6,'#d8e0e4');b.furn('alacena',-ins*4.4,3.8,.8,1.6,2.4,'#6b4a30');
  b.deco(-ins*4.0,-3.5,.04,1.6,1.4,'#7ab0c8',.2);b.deco(-ins*4.0,-1.3,.04,1.6,1.4,'#7ab0c8',.2);
  const y=b.floor;
  // techo de la playa con sus columnas y dos islas de surtidores
  const kx=cx+toRoad*3,kz=cz,H=4.8;for(const [a,c] of [[-5,-6],[5,-6],[-5,6],[5,6]]){bx(.4,H,.4,'#d8d8d0',kx+a,y+H/2,kz+c,world);solid22(kx+a,kz+c,.4,.4,y,H)}
  bx(14,.5,17,'#e8e4dc',kx,y+H+.25,kz,world);bx(14.1,.45,17.1,'#a8322a',kx,y+H-.1,kz,world);
  for(const pz of [-3.5,3.5]){bx(1.2,.25,6,'#8a8a84',kx,y+.12,kz+pz,world);
    for(const o of [-1.6,1.6]){const m=bx(.8,1.7,.6,'#c83a2a',kx,y+1.1,kz+pz+o,world);bx(.6,.4,.05,'#1a2228',kx,y+1.5,kz+pz+o+.31*Math.sign(o),world);solid22(kx,kz+pz+o,.8,.6,y,1.9);addCont('surtidor',kx,kz+pz+o,y,m)}}
  // cartel alto con precios borrados
  const px=cx+toRoad*(s.r-3),pz=cz-s.r+5;bx(.35,8,.35,'#5a5a56',px,y+4,pz,world);solid22(px,pz,.4,.4,y,8);bx(.3,2.6,2.8,'#a8322a',px,y+8.6,pz,world);
  board22('LA POSTA',px+.17,y+9.3,pz,Math.PI/2,2.6,.7,'#a8322a','#f0e8d8');board22('LA POSTA',px-.17,y+9.3,pz,-Math.PI/2,2.6,.7,'#a8322a','#f0e8d8');
  board22('— — —',px+.17,y+8.3,pz,Math.PI/2,2.4,.8,'#1b1712','#e3a33b');board22('— — —',px-.17,y+8.3,pz,-Math.PI/2,2.4,.8,'#1b1712','#e3a33b');
  // lubricentro abierto atrás
  const lx=cx-toRoad*2,lz=cz+11,lw=8,ld=6;bx(lw,3.4,.3,'#9a948a',lx,y+1.7,lz+ld/2,world);solid22(lx,lz+ld/2,lw,.3,y,3.4);
  for(const sd of [-1,1]){bx(.3,3.4,ld,'#9a948a',lx+sd*lw/2,y+1.7,lz,world);solid22(lx+sd*lw/2,lz,.3,ld,y,3.4)}bx(lw+.4,.25,ld+.4,'#4a4844',lx,y+3.5,lz,world);
  const bench=bx(2.4,.9,.7,'#5e4a33',lx,y+.45,lz+ld/2-.6,world);solid22(lx,lz+ld/2-.6,2.4,.7,y,.9);addCont('herramientas',lx,lz+ld/2-.6,y,bench);
  for(let i=0;i<4;i++){const tx=lx-lw/2+1+(i%2)*.9,tz=lz-1.4+(i>>1)*1.2;for(let k=0;k<1+(rng()*3|0);k++){const t=bx(.75,.28,.75,'#1a1a1a',tx,y+.14+k*.28,tz,world,CYL)}}
  for(let i=0;i<3;i++){const dx=lx+lw/2-1-i*.8,dz=lz-2.2;bx(.6,.9,.6,['#2a4a6a','#6a2a22','#3a5a3a'][i],dx,y+.45,dz,world,CYL);solid22(dx,dz,.6,.6,y,.9)}
  addCont('tacho',sx+toRoad*5.8,cz+4.5,y,bx(.6,.9,.6,'#3a4a3a',sx+toRoad*5.8,y+.45,cz+4.5,world,CYL))}

// ---------- Escuela rural ----------
function buildSchool22(s,rng){const cx=s.x,cz=s.z;
  const w=27,d=10,bz=cz-7,b=bld22(cx,bz,w,d,{name:'escuela',col:'#e0d8c8',floorCol:'#7a6a5a',roofCol:'#5a3a2e',doors:[[1,.5,2.2],[1,.18,1.5],[1,.82,1.5]],
    inner:[{x:-4.5,gaps:[[d-1.6,1.4]]},{x:4.5,gaps:[[d-1.6,1.4]]}]});
  // franja celeste
  for(const zz of [bz-d/2-.17,bz+d/2+.17])bx(w,.35,.02,'#6aa0c8',cx,b.floor+.9,zz,world);
  // aulas: pizarrón, escritorio de la maestra y pupitres
  for(const ox of [-9,9]){b.deco(ox,-d/2+.2,4.2,1.4,.06,'#2a3a2e',1);b.deco(ox,-d/2+.24,4.4,.08,.1,'#b8b0a0',.92);
    b.furn('escritorio',ox+2.4,-d/2+1.6,1.6,.8,.8,'#6a4a30');
    let k=0;for(let r=0;r<3;r++)for(let c=0;c<3;c++){desk22(b,ox-2.6+c*2.2,-1.8+r*1.8,(k++===((rng()*9)|0))||(r===2&&c===1))}}
  // dirección y enfermería en el medio
  b.furn('escritorio',0,-d/2+1.2,2,.8,.9,'#5e4630');b.furn('armario',-3.4,-d/2+.5,1.2,2,.6,'#7a7a74');b.furn('botiquin',3.6,-1,.5,.8,.4,'#e6e6dc',1);
  b.deco(0,-d/2+.2,1.6,1.1,.05,'#6aa0c8',1.4);b.deco(0,-d/2+.21,1.6,.36,.05,'#f0f0ea',1.77);
  // comedor
  const c=bld22(cx+8,cz+11,9,7,{name:'escuela',col:'#d8d0c0',roofCol:'#5a3a2e',doors:[[0,.5,1.6]]});
  c.furn('comedor',0,3,3,1,.7,'#8a8a84');c.furn('heladera',3.6,2.8,.8,1.9,.8,'#d8d6cc');
  for(const tx of [-2.2,1]){c.furn(null,tx,-.4,1,.75,3,'#7a5a3a');for(const sd of [-1,1])c.deco(tx+sd*.85,-.4,.35,.45,2.8,'#6a4a2c')}
  // mástil, juegos y patio
  const fy=terrainY(cx-6,cz+4);bx(.14,8,.14,'#c8c8c0',cx-6,fy+4,cz+4,world);solid22(cx-6,cz+4,.2,.2,fy,8);
  for(let i=0;i<3;i++)bx(.02,.4,1.6,i===1?'#f0f0ea':'#6aa0c8',cx-6,fy+7.5-i*.4,cz+4.85,world);
  const sw=terrainY(cx-12,cz+12);for(const sd of [-1,1]){const l=bx(.12,3,.12,'#7a3a2a',cx-12+sd*1.6,sw+1.4,cz+11.4,world);l.rotation.x=.2;const l2=bx(.12,3,.12,'#7a3a2a',cx-12+sd*1.6,sw+1.4,cz+12.6,world);l2.rotation.x=-.2}
  bx(3.4,.12,.12,'#7a3a2a',cx-12,sw+2.85,cz+12,world);for(const sd of [-.7,.7]){bx(.03,2,.03,'#3a3a36',cx-12+sd,sw+1.8,cz+12,world);bx(.6,.06,.3,'#2a2a28',cx-12+sd,sw+.75,cz+12,world)}solid22(cx-12,cz+12,3.6,1.6,sw,2.9);
  const sl=terrainY(cx-4,cz+13);const ramp=bx(.9,.08,3.6,'#c8a83a',cx-4,sl+1.1,cz+13.6,world);ramp.rotation.x=-.55;bx(.9,2.1,.9,'#c8553a',cx-4,sl+1.05,cz+11.8,world);solid22(cx-4,cz+12.4,.9,2,sl,2);
  fence6(cx,cz,s.r+.5,[Math.PI/2,-Math.PI/2]);
  addCont('tacho',cx+3,cz-1,terrainY(cx+3,cz-1),bx(.6,.9,.6,'#3a5a3a',cx+3,terrainY(cx+3,cz-1)+.45,cz-1,world,CYL))}

// ---------- Hospital ----------
function buildHosp22(s,rng){const cx=s.x,cz=s.z;
  const w=30,d=16,bz=cz-5,b=bld22(cx,bz,w,d,{name:'hospital',col:'#d0ccc0',floorCol:'#8a8a84',roofCol:'#5a5a56',upper:3.4,doors:[[1,.5,2.6],[3,.7,2.2]],
    inner:[{x:-5,gaps:[[d-2.4,1.6]]},{x:5,gaps:[[d-2.4,1.6],[3.6,1.4]]},{z:-1,a:5,b:15,gaps:[[5,1.4]]}]});
  // sala de internación
  let k=0;for(const r of [-1,1])for(let i=0;i<3;i++){bed22(b,-13+i*3.4,r<0?-d/2+1.3:3.4,(k++)%2===0);}
  b.deco(-10,-.6,.6,.8,.6,'#c8c8c0');b.deco(-10,-.6,.5,.05,.5,'#3a6a8a',.8);
  // recepción
  b.furn('kiosco',0,1,4,1.1,.8,'#7a8a8a');b.furn('escritorio',-2.5,-d/2+1,1.4,.8,.7,'#6a6a64');
  for(let i=0;i<4;i++)b.deco(-3+i*1.2,d/2-1,.5,.45,.5,'#3a5a6a');
  // farmacia (al fondo) y consultorio (adelante)
  b.furn('vitrina',10,-d/2+.5,2.2,2,.6,'#d8dcd8');b.furn('vitrina',14.3,-4,.6,2,2.2,'#d8dcd8');b.furn('farmacia',7,-d/2+.5,1.8,1.9,.6,'#9a9a92');
  b.furn('armario',14.3,2,.6,2,1.2,'#7a7a74');b.furn('escritorio',10,3.4,1.6,.8,.8,'#5e4630');b.furn('camilla',8.2,5.6,.9,.8,1.9,'#c8d0d0');
  // fachada: cartel y cruz roja
  const y=b.floor,fz=bz+d/2+.2;board22(L('Hospital San Roque').toUpperCase(),cx,y+5.2,fz+.02,0,8,1.6,'#e8e4dc','#a82a22');
  bx(.6,1.8,.06,'#c82a22',cx+6.5,y+5.2,fz,world);bx(1.8,.6,.06,'#c82a22',cx+6.5,y+5.2,fz,world);
  bx(5,.25,2.6,'#5a5a56',cx,y+3.3,fz+1.2,world);for(const sd of [-1,1]){bx(.2,3.2,.2,'#c8c8c0',cx+sd*2.3,y+1.6,fz+2.3,world);solid22(cx+sd*2.3,fz+2.3,.2,.2,y,3.2)}
  // cuarentena: bolsas de arena, carpa sanitaria y vallas
  const qy=terrainY(cx,cz+12);for(let i=-3;i<=3;i++){if(Math.abs(i)<1)continue;for(let h=0;h<2;h++)bx(1.1,.32,.5,'#8a7a58',cx+i*1.1+(h?.5:0),qy+.16+h*.32,cz+13,world);solid22(cx+i*1.1,cz+13,1.1,.5,qy,.64)}
  const tx=cx-11,tz=cz+10,ty=terrainY(tx,tz);const tent=bx(6,3,4.4,'#d8d4c8',tx,ty+1.4,tz,world,new T3.CylinderGeometry(.01,.75,1,4,1));tent.rotation.y=Math.PI/4;solid22(tx,tz,4.4,3.2,ty,2.4);
  bx(.06,.8,.24,'#c82a22',tx+2.13,ty+1.3,tz,world);bx(.06,.24,.8,'#c82a22',tx+2.13,ty+1.3,tz,world);
  const cy=terrainY(tx+1.8,tz+2.6);const cr=bx(.9,.7,.7,'#4a5a3a',tx+1.8,cy+.35,tz+2.6,world);solid22(tx+1.8,tz+2.6,.9,.7,cy,.7);addCont('botiquin',tx+1.8,tz+2.6,cy,cr);
  for(const [vx,vz,r] of [[cx+9,cz+12,.3],[cx+12,cz+9,1.2]]){const vy=terrainY(vx,vz);const g=grp(vx,vy,vz,world);g.rotation.y=r;bx(2.4,.12,.08,'#d8d0c0',0,.8,0,g);bx(2.4,.12,.08,'#c82a22',0,.55,0,g);bx(.08,.9,.6,'#5a5a56',-1,.45,0,g);bx(.08,.9,.6,'#5a5a56',1,.45,0,g)}
  // camillas tiradas afuera
  for(const [ox,oz] of [[-5,8],[6,6]]){const x=cx+ox,z=cz+oz,yy=terrainY(x,z);const g=grp(x,yy,z,world);g.rotation.y=rng()*3;bx(.7,.08,1.9,'#c8c8c0',0,.75,0,g);bx(.66,.06,1.8,'#7a9ab0',0,.82,0,g);
    for(const [a,c] of [[-.3,-.8],[.3,-.8],[-.3,.8],[.3,.8]])bx(.04,.75,.04,'#8a8e90',a,.37,c,g)}}

const _buildPlaces22=buildPlaces6;buildPlaces6=function(){B22=[];_buildPlaces22();const rng=mulberry32((seed6^0x22a7c)>>>0);
  for(const s of sitesGet6()){if(!P22KIND[s.kind])continue;try{
    if(s.kind==='gas22')buildGas22(s,rng);else if(s.kind==='school22')buildSchool22(s,rng);else buildHosp22(s,rng);
    const toRoad=Math.atan2(roadX(s.z)-s.x,0)>0?0:Math.PI;if(s.kind!=='gas22')sign6(L(PLACES6[s.id].n),s.x+Math.cos(toRoad)*(s.r+4),s.z+3,toRoad===0?Math.PI/2:-Math.PI/2)}
    catch(e){console.error('place22',s.id,e)}}};
// La decoración de casas (v0.9) no tiene que amueblar estos edificios.
if(typeof buildDecor9==='function'){const _bd22=buildDecor9;buildDecor9=function(seed){const mine=buildings.filter(b=>b.p22);if(mine.length)buildings=buildings.filter(b=>!b.p22);
  try{_bd22(seed)}finally{if(mine.length)buildings.push(...mine)}}}

// ---------- Podridos adentro: cada día que llegás, el lugar está ocupado ----------
const P22HORDE={gas22:[['caminante',4],['corredor',1],['bruto',1]],school22:[['caminante',6],['corredor',2],['griton',1]],
  hosp22:[['caminante',8],['corredor',3],['hinchado',1],['griton',1],['soldado',2]]};
let p22T=0;
function p22spawn(s){const b=B22.filter(b=>Math.hypot(b.cx-s.x,b.cz-s.z)<s.r+4);let list=P22HORDE[s.kind].map(a=>a.slice());
  if(s.kind==='gas22'&&Math.random()<.3)list=[['raptor',3],['caminante',2]];
  let n=0;for(const [t,q] of list)for(let i=0;i<q;i++){let x,z;
    if(b.length&&Math.random()<.6){const bb=b[Math.random()*b.length|0];x=bb.cx+(Math.random()-.5)*(bb.w-2);z=bb.cz+(Math.random()-.5)*(bb.d-2)}
    else{const a=Math.random()*6.283,r=4+Math.random()*(s.r-4);x=s.x+Math.cos(a)*r;z=s.z+Math.sin(a)*r}
    if(circleBlocked(x,z,.6,'e'))continue;try{const e=spawnEnemy(t,x,z);e.p22=s.id;n++}catch(err){}}
  return n}
function p22tick(dt){p22T-=dt;if(p22T>0)return;p22T=.6;if(!sites6||!S)return;S.p22=S.p22||{};
  for(const s of sites6){if(!P22KIND[s.kind])continue;const d=Math.hypot(P.x-s.x,P.z-s.z);
    if(d<s.r+55&&d>s.r*.5&&(S.p22[s.id]??-1)<S.day){S.p22[s.id]=S.day;p22spawn(s)}}}
const _update22=update;update=function(dt){_update22(dt);try{if(gstate==='play')p22tick(dt)}catch(e){console.error('p22',e)}};

// Las misiones de limpieza a veces mandan a estos lugares.
if(typeof q21spot==='function'){const _q21spot22=q21spot;q21spot=function(from){const ss=(sites6||[]).filter(s=>P22KIND[s.kind]&&Math.hypot(s.x-from.x,s.z-from.z)>120&&Math.hypot(s.x-from.x,s.z-from.z)<450);
  if(ss.length&&Math.random()<.35){const s=ss[Math.random()*ss.length|0];return{x:s.x+(Math.random()-.5)*8,z:s.z+s.r*.55}}return _q21spot22(from)}}
