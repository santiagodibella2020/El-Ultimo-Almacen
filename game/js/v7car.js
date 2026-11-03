'use strict';
// ================= v0.7 · Vehicle physics, driving views and cockpit interiors =================
// Loaded after v6anim.js. Replaces updateVehicle with a version that has suspension, airborne jumps,
// slope forces, speed-sensitive steering and tyre grip limits, and adds a chase camera plus a real
// cockpit (dashboard, steering wheel, pillars, gauges) for the interior view. V switches between them.

let view7='chase';try{const v=localStorage.getItem('ua-view7');if(v==='chase'||v==='cabin')view7=v}catch(e){}
let camYaw7=0,camY7=null,lookIdle7=0,lastLook7=0,viewHint7=0;
const G7=16;                      // gravity used while a vehicle is airborne (a bit floaty on purpose)
const TAU7=Math.PI*2;
const angDiff7=(a,b)=>{let d=(a-b)%TAU7;if(d>Math.PI)d-=TAU7;if(d<-Math.PI)d+=TAU7;return d};

// ---------- Landing ----------
function land7(tr,imp,driven){
  if(imp<2.2)return;
  tr.suspV-=Math.min(imp,14)*.45;
  sfx(imp>9?'crash':'thud',tr.x,tr.z);
  try{burst(tr.x,tr.y+.35,tr.z,'#a89878',Math.min(14,4+imp|0),2.5+imp*.15)}catch(e){}
  if(driven)shake=Math.max(shake,Math.min(.7,imp*.05));
  if(imp>10)tr.speed*=.88;
}

// ---------- Main vehicle step ----------
function updateVehicle(tr,dt){
  dt=Math.min(dt,.05);
  const def=tr.def,st=tr.st,driven=P.inTruck&&tr===truck;
  if(tr.vy===undefined)Object.assign(tr,{vy:0,vyF:0,air:false,pS:0,rS:0,susp:0,suspV:0,prevSpeed:0,hadY:false,wBase:null,wOff:[0,0,0,0]});
  let thr=0,brake=false,steerIn=0;
  if(driven){
    thr=(keys['w']?1:0)-(keys['s']?1:0);brake=!!keys[' '];steerIn=(keys['a']?1:0)-(keys['d']?1:0);
    if(!tr.air){
      if(st.fuel<=0&&thr!==0){if(fullMsgT<=0){toast(L('Sin nafta. Cargá combustible con G o desde el taller.'),'#cc4b30');fullMsgT=4}}
      else{const load=1-Math.min(.35,kgOf(st.cargo)/vehCap(tr)*.35);if(thr>0)tr.speed+=(tr.speed<0?18:def.acc*load)*dt;else if(thr<0)tr.speed-=(tr.speed>0?16:6)*dt}
      if(brake)tr.speed*=Math.pow(.05,dt);
    }
    tr.speed*=Math.pow(.7,dt);if(!thr&&Math.abs(tr.speed)<.3&&!tr.air)tr.speed=0;
    tr.speed=clamp(tr.speed,-7,def.max*(snowCover>.5&&def.bed!=='trailer'?.8:1));
    st.fuel=Math.max(0,st.fuel-Math.abs(tr.speed)*dt*.012*def.fuel*(PK('conductor')?.6:1)*(720/CYCLE()*.5+.5));
    engineSound(true,(tr.air?def.max*.8:tr.speed)*26/def.max);
  }else if(tr.speed!==0&&!tr.air){tr.speed*=Math.pow(.2,dt);if(Math.abs(tr.speed)<.2)tr.speed=0}
  // steering: the faster you go the less the wheels can turn, and it settles back quickly
  const sp=Math.abs(tr.speed);
  const maxS=.55/(1+Math.pow(sp/9,1.2));
  tr.steer=lerp(tr.steer,steerIn*maxS*(tr.air?.25:1),Math.min(1,dt*(steerIn?7:10)));
  if(!driven&&!tr.air)tr.steer*=.9;
  const moving=tr.speed!==0||tr.air;
  let c=Math.cos(tr.yaw),s=Math.sin(tr.yaw);const hl=def.len/3,hw=def.wid/2;
  let hF,hB,hL,hR;
  const sample=()=>{c=Math.cos(tr.yaw);s=Math.sin(tr.yaw);hF=groundY(tr.x+s*hl,tr.z+c*hl);hB=groundY(tr.x-s*hl,tr.z-c*hl);hL=groundY(tr.x+c*hw,tr.z-s*hw);hR=groundY(tr.x-c*hw,tr.z+s*hw)};
  let yawRate=0;
  if(moving){
    sample();
    // gravity along the slope: coast downhill, labour uphill, and cliffs stall you
    if(!tr.air){const slope=(hF-hB)/(hl*2);tr.speed-=slope*9.8*.5*dt*(tr.speed>=0?1:-1)*(Math.abs(tr.speed)>.2||Math.abs(slope)>.12?1:0);
      if(slope>.85&&tr.speed>0)tr.speed*=Math.pow(.02,dt)}
    const wb=def.len*.6;
    yawRate=tr.speed*Math.tan(tr.steer)/wb;
    if(tr.air)yawRate*=.25;
    else{
      if(brake&&sp>8){yawRate*=1.7;tr.speed*=Math.pow(.55,dt)}              // handbrake turn
      const grip=15,lim=sp>1?grip/sp:9;                                       // tyres run out of grip: scrub speed instead of spinning
      if(Math.abs(yawRate)>lim){yawRate=Math.sign(yawRate)*lim;tr.speed*=Math.pow(.75,dt)}
    }
    const ny=tr.yaw+yawRate*dt;
    const nx=tr.x+Math.sin(ny)*tr.speed*dt,nz=tr.z+Math.cos(ny)*tr.speed*dt;
    const hit=vehBlocked(tr,nx,nz,ny);
    if(hit){if(Math.abs(tr.speed)>6){sfx('crash',tr.x,tr.z);if(driven)shake=Math.max(shake,.3)}tr.speed*=-.25;yawRate=0}else{tr.x=nx;tr.z=nz;tr.yaw=ny}
    if(Math.abs(tr.speed)>3.5){const off=def.len/2-1;const fx=tr.x+Math.sin(tr.yaw)*off*Math.sign(tr.speed),fz=tr.z+Math.cos(tr.yaw)*off*Math.sign(tr.speed);
      for(const e of enemies){if(e.dead||e.dying)continue;const d=Math.hypot(e.x-fx,e.z-fz);if(d<def.wid*.85+e.r){const mass=def.cap>200?1.6:1;const dmg=Math.abs(tr.speed)*7*mass*(PK('conductor')?1.4:1);if(EDEF[e.type].heavy&&e.hp>dmg){tr.speed*=.3}else tr.speed*=.88;const wasAlive=!e.dying;hurtEnemy(e,dmg,false,'truck');if(wasAlive&&e.dying&&driven)S.stats.runover++;const a=Math.atan2(e.x-tr.x,e.z-tr.z);e.x+=Math.sin(a)*1.2;e.z+=Math.cos(a)*1.2;sfx('thud',e.x,e.z)}}}
  }
  // ---- vertical motion, suspension and body attitude ----
  if(moving||driven||!tr.placed||Math.abs(tr.suspV)>.02||Math.abs(tr.susp)>.01){
    sample();
    const gT=(hF+hB+hL+hR)/4;
    let landed=false;
    if(!tr.hadY||!tr.placed){tr.y=gT;tr.vy=0;tr.vyF=0;tr.air=false;tr.hadY=true}
    else if(tr.air){
      tr.vy-=G7*dt;tr.y+=tr.vy*dt;
      if(tr.y<=gT){const imp=-tr.vy;tr.y=gT;tr.air=false;tr.vy=0;tr.vyF=0;landed=true;land7(tr,imp,driven)}
    }else{
      const yb=tr.y+tr.vyF*dt-.5*G7*dt*dt;                       // where a ballistic car would be right now
      if(tr.vyF>1.2&&sp>5&&gT<yb-.06){tr.air=true;tr.vy=tr.vyF-G7*dt;tr.y=yb}   // ground fell away faster than gravity: take off
      else{const nv=(gT-tr.y)/dt;tr.y=gT;tr.vyF=lerp(tr.vyF,clamp(nv,-12,12),Math.min(1,dt*14))}
    }
    // suspension: a damped spring on the body fed by the vertical acceleration of the ground
    const accY=(tr.vyF-(tr.prevVyF||0))/Math.max(dt,.001);tr.prevVyF=tr.vyF;
    let target=tr.air?.08:clamp(-accY*.008,-.2,.2);
    if(!tr.air&&sp>6&&Math.abs(tr.x-roadX(tr.z))>5)tr.suspV+=(R()-.5)*sp*.05;   // washboard off the road
    tr.suspV+=(130*(target-tr.susp)-11*tr.suspV)*dt;tr.susp=clamp(tr.susp+tr.suspV*dt,-.3,.3);
    // attitude
    const longAcc=(tr.speed-tr.prevSpeed)/Math.max(dt,.001);tr.prevSpeed=tr.speed;
    const latAcc=tr.speed*yawRate;
    let tP,tR;
    if(tr.air){tP=Math.atan2(tr.vy,Math.max(5,sp))*.85;tR=tr.rS*.985}
    else{tP=Math.atan2(hF-hB,hl*2)+clamp(longAcc*.0035,-.07,.07);tR=Math.atan2(hL-hR,hw*2)+clamp(latAcc*.0035,-.1,.1)}
    const k=Math.min(1,dt*(tr.air?2.2:9));tr.pS+=(tP-tr.pS)*k;tr.rS+=(tR-tr.rS)*k;
    const g=tr.group;g.position.set(tr.x,tr.y,tr.z);g.rotation.set(0,0,0);g.rotateY(tr.yaw);g.rotateX(-tr.pS);g.rotateZ(tr.rS);
    tr.body.position.y=tr.susp;
    // wheels follow the ground under each one, and droop while airborne
    g.updateMatrixWorld(true);
    if(!tr.wBase)tr.wBase=tr.wheels.map(w=>w.position.y);
    const wv=new T3.Vector3();
    tr.wheels.forEach((w,i)=>{
      let off;
      if(tr.air)off=-.16;
      else{wv.set(w.position.x,tr.wBase[i],w.position.z).applyMatrix4(g.matrixWorld);off=clamp(groundY(wv.x,wv.z)-(wv.y-tr.wBase[i]),-.3,.32)}
      tr.wOff[i]=lerp(tr.wOff[i]||0,off,Math.min(1,dt*(tr.air?4:16)));
      w.position.y=tr.wBase[i]+tr.wOff[i];
      w.children[0].rotation.x+=tr.speed*dt/.45;if(i<2)w.rotation.y=tr.steer});
    tr.placed=true;
  }
  const kg=kgOf(st.cargo),cap=vehCap(tr);tr.cargoBoxes.forEach((b,i)=>b.visible=kg>i*cap/tr.cargoBoxes.length*.9);
  if(driven)truckLight.intensity=darkness()>.3?2.2:0;
}

// ---------- Cockpit ----------
let gauge7=null;
function gaugeTex7(){
  if(gauge7)return gauge7;const cv=document.createElement('canvas');cv.width=128;cv.height=48;const tx=new T3.CanvasTexture(cv);tx.magFilter=T3.NearestFilter;tx.minFilter=T3.NearestFilter;
  gauge7={cv,tx,x:cv.getContext('2d'),t:0,last:''};return gauge7}
function drawGauge7(sp,fuel,maxSp){
  const g=gaugeTex7(),k=Math.round(sp)+'|'+Math.round(fuel);if(k===g.last)return;g.last=k;const x=g.x;
  x.fillStyle='#0d0f0c';x.fillRect(0,0,128,48);
  const cx=40,cy=36,r=30;x.lineWidth=3;x.strokeStyle='#33382d';x.beginPath();x.arc(cx,cy,r,Math.PI*.85,Math.PI*2.15);x.stroke();
  const f=clamp(sp/(maxSp*3.6),0,1),a=Math.PI*.85+f*Math.PI*1.3;x.strokeStyle=f>.85?'#e0553a':'#d8b850';x.beginPath();x.arc(cx,cy,r,Math.PI*.85,a);x.stroke();
  x.strokeStyle='#e8e4d0';x.lineWidth=2;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*(r-4),cy+Math.sin(a)*(r-4));x.stroke();
  x.fillStyle='#e8e4d0';x.font='bold 15px monospace';x.textAlign='center';x.fillText(String(Math.round(sp)),cx,cy-4);x.font='9px monospace';x.fillText('km/h',cx,cy+8);
  const fl=clamp(fuel/100,0,1);x.fillStyle='#33382d';x.fillRect(86,10,30,28);x.fillStyle=fl<.15?'#e0553a':'#7aa84a';x.fillRect(88,36-fl*24,26,fl*24);x.fillStyle='#e8e4d0';x.font='9px monospace';x.fillText('E   F',101,8);
  g.tx.needsUpdate=true}
function cockpit7(v){
  const d=v.def,g=v.group,ck=grp(0,0,0,g);ck.visible=false;
  const W2=d.wid/2,ex=-.42,ey=d.eye||2.05,ez=d.bed==='trailer'?d.cabZ-.5:d.bed==='bus'?d.cabZ:d.cabZ+.05;
  const big=d.style==='bus'||d.bed==='trailer',em={emissive:0x1b1913};
  const dk=mat('#2a2923',em),dk2=mat('#3a372e',em),fab=mat('#4d493b',em),trim=mat('#1c1b17',em),roof=mat('#8d8978',{emissive:0x2a2822});
  const dy=ey-.44,dz=ez+.8;
  bx(d.wid-.12,.24,.55,dk,0,dy,dz,ck);bx(d.wid-.12,.07,.5,dk2,0,dy+.15,dz-.03,ck);
  bx(.66,.17,.24,trim,ex,dy+.21,dz-.1,ck);
  const gm=new T3.Mesh(new T3.PlaneGeometry(.56,.21),new T3.MeshBasicMaterial({map:gaugeTex7().tx}));gm.position.set(ex,dy+.2,dz-.225);gm.rotation.set(-.35,Math.PI,0);ck.add(gm);
  bx(.3,.05,.12,trim,0,dy+.2,dz-.2,ck);                                  // radio slot
  // steering wheel: tilted pivot, spinning child
  const wr=big?.27:.19,piv=grp(ex,ey-.37,ez+(big?.66:.58),ck);piv.rotation.x=-(big?2.45:2.75);
  const sw=grp(0,0,0,piv);const rim=new T3.Mesh(new T3.TorusGeometry(wr,.028,6,18),trim);sw.add(rim);
  bx(wr*1.9,.04,.03,trim,0,0,0,sw);bx(.04,wr*.9,.03,trim,0,-wr*.45,0,sw);bx(.11,.11,.05,dk2,0,0,0,sw);
  v.sw7=sw;
  // frame: A pillars, roof header, B pillars, doors
  for(const sx of[-1,1]){
    const p=bx(.075,.8,.08,fab,sx*(W2-.12),ey-.04,ez+1.0,ck);p.rotation.x=-.5;
    bx(.08,.8,.09,dk2,sx*(W2-.1),ey-.02,ez-.7,ck);
    bx(.08,.34,1.7,fab,sx*(W2-.09),ey-.5,ez+.12,ck);
    bx(.06,.05,1.6,trim,sx*(W2-.1),ey-.32,ez+.12,ck);
    bx(.06,.05,1.6,fab,sx*(W2-.1),ey+.42,ez+.1,ck);}
  bx(d.wid-.1,.05,.07,fab,0,ey+.43,ez+1.1,ck);
  bx(d.wid-.1,.04,2.0,roof,0,ey+.45,ez+.1,ck);
  // mirror, seats, console
  bx(.3,.09,.03,trim,0,ey+.27,ez+.95,ck);bx(.26,.06,.02,mat('#7e9096',{emissive:0x303a3c}),0,ey+.27,ez+.935,ck);bx(.03,.1,.03,trim,0,ey+.34,ez+.98,ck);
  bx(.52,.74,.15,fab,ex,ey-.5,ez-.48,ck);bx(.3,.18,.1,fab,ex,ey-.05,ez-.5,ck);
  bx(.52,.74,.15,fab,-ex,ey-.5,ez-.48,ck);bx(.3,.18,.1,fab,-ex,ey-.05,ez-.5,ck);
  bx(.2,.22,.6,dk2,0,ey-.72,ez+.3,ck);bx(.06,.22,.06,trim,0,ey-.56,ez+.3,ck);
  ck.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false}});
  return ck}

// ---------- Cameras ----------
function drivecam7(dt){
  const v=truck;if(!v)return;const d=v.def;
  if(!v.ck)v.ck=cockpit7(v);
  const chase=view7==='chase';
  v.cabin.forEach(m=>m.visible=chase);v.dash.visible=false;v.ck.visible=!chase;
  if(!chase&&v.sw7){v.sw7.rotation.z=-v.steer*3.2;drawGauge7(Math.abs(v.speed)*3.6,v.st.fuel,d.max)}
  // mouse look recentres on its own after a moment
  if(Math.abs(v.lookYaw-lastLook7)>.002||Math.abs(v.lookPitch+.05)>.4)lookIdle7=0;else lookIdle7+=dt;
  lastLook7=v.lookYaw;
  if(lookIdle7>1.6){v.lookYaw*=Math.pow(.02,dt);v.lookPitch=lerp(v.lookPitch,-.05,Math.min(1,dt*2))}
  const sp=Math.abs(v.speed);
  if(chase){
    const aim=v.yaw+v.lookYaw;camYaw7+=angDiff7(aim,camYaw7)*(1-Math.exp(-dt*(v.lookYaw!==0?5:3.4)));
    const dist=d.len*.62+3.3+sp*.04,h=1.9+d.len*.12+(-v.lookPitch)*5;
    const fx=Math.sin(camYaw7),fz=Math.cos(camYaw7);
    const tx=v.x-fx*dist,tz=v.z-fz*dist;
    const gy=Math.max(v.y,groundY(tx,tz)),wantY=gy+h;
    camY7=camY7===null?wantY:camY7+(wantY-camY7)*(1-Math.exp(-dt*4.5));
    const cy=Math.max(camY7,groundY(tx,tz)+1);
    camera.position.set(tx,cy,tz);
    camera.lookAt(v.x+fx*(3+sp*.12),v.y+1.3+v.susp,v.z+fz*(3+sp*.12));
    if(shake>.01){camera.position.x+=(R()-.5)*shake*.15;camera.position.y+=(R()-.5)*shake*.15}
  }else{
    const g=v.group;g.updateMatrixWorld(true);
    const eye=new T3.Vector3(-.42,(d.eye||2.05),d.bed==='trailer'?d.cabZ-.5:d.bed==='bus'?d.cabZ:d.cabZ+.05);g.localToWorld(eye);
    camera.position.copy(eye);camera.position.y+=v.susp*.5;
    camera.rotation.order='YXZ';camera.rotation.set(v.lookPitch-.1+v.pS*.7,v.yaw+Math.PI+v.lookYaw,-v.rS*.5);
    if(shake>.01){camera.rotation.x+=(R()-.5)*shake*.06;camera.rotation.y+=(R()-.5)*shake*.06;camera.position.y+=(R()-.5)*shake*.04}
    camYaw7=v.yaw;camY7=null;
  }
  const fovT=settings.fov+Math.min(14,sp*.45);if(Math.abs(camera.fov-fovT)>.1){camera.fov=fovT;camera.updateProjectionMatrix()}
  flashRig.position.copy(camera.position);flashRig.quaternion.copy(camera.quaternion);
}
const _updateCamera7=updateCamera;updateCamera=function(dt){_updateCamera7(dt);if(S&&P.inTruck&&truck&&camMode==='fp'&&gstate!=='menu'){try{drivecam7(dt)}catch(e){console.error('cam7',e)}}};

// ---------- Enter / exit / view switch ----------
const _enterTruck7=enterTruck;enterTruck=function(v){_enterTruck7(v);camYaw7=truck.yaw;camY7=null;lookIdle7=0;
  if(viewHint7<3){viewHint7++;toast(L('V · cambiar vista (tercera persona / interior)'),'#dedcc9',5)}};
const _exitTruck7=exitTruck;exitTruck=function(force){const t=truck;_exitTruck7(force);if(!P.inTruck&&t&&t.ck)t.ck.visible=false};
function setView7(v){view7=v;try{localStorage.setItem('ua-view7',v)}catch(e){}camY7=null;toast(v==='chase'?L('Vista: tercera persona'):L('Vista: interior'),'#dedcc9',2)}
addEventListener('keydown',e=>{if(e.repeat||typing(e))return;if(e.key.toLowerCase()==='v'&&S&&gstate==='play'&&P.inTruck)setView7(view7==='chase'?'cabin':'chase')},true);
