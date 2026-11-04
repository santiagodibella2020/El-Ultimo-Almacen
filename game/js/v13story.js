/* v0.13: cinemática del final de la historia y de la primera noche */
function finalCine13(){
  const st=(sites6||[]).find(s=>s.id==='cementerio'),cy=gy9(0,0);
  const shots=[];
  if(st)shots.push({d:6.5,from:()=>[st.x+14,st.y+5,st.z+10],to:()=>[st.x+7,st.y+2.6,st.z+5],look:()=>[st.x,st.y+1,st.z],fov:50,text:'Don Julio cuidó este almacén hasta el final.'});
  const rz=-120;shots.push({d:6.5,from:()=>[roadX(rz)+3,gy9(roadX(rz),rz)+2.2,rz+30],to:()=>[roadX(rz)+1,gy9(roadX(rz),rz)+2.6,rz-10],look:()=>[roadX(rz-200),gy9(roadX(rz-200),rz-200)+4,rz-200],fov:58,text:'Sofía llegó a la costa. La ruta sigue viva.'});
  shots.push({d:6,from:()=>[-40,cy+18,46],to:()=>[-22,cy+9,30],look:()=>[0,cy+2,-8],fov:52,text:'No hace falta irse a ningún lado.'});
  shots.push({d:6,from:()=>[0,cy+3,14],to:()=>[0,cy+4.2,-2],look:()=>[0,cy+4.4,-8],fov:55,text:'Alcanza con seguir abierto.'});
  playCine9('final',shots)}
function nightCine13(){
  const a=P.yaw;
  playCine9('noche1',[
    {d:5,from:()=>[P.x+Math.sin(a)*4,P.y+2.2,P.z+Math.cos(a)*4],to:()=>[P.x+Math.sin(a)*7,P.y+5,P.z+Math.cos(a)*7],look:()=>[P.x-Math.sin(a)*40,P.y+2,P.z-Math.cos(a)*40],fov:60,text:'Cae la primera noche.'},
    {d:5,from:()=>[P.x-Math.sin(a+1)*6,P.y+1.4,P.z-Math.cos(a+1)*6],to:()=>[P.x-Math.sin(a+.6)*5,P.y+1.6,P.z-Math.cos(a+.6)*5],look:()=>[P.x,P.y+1.4,P.z],fov:62,text:'De noche los podridos salen a buscarte. Volvé al almacén y defendelo.'}
  ])}
const _giveFrag13=giveFrag6;
giveFrag6=function(id){const r=_giveFrag13.apply(this,arguments);
  try{const s=story6();if(s.frags.length===Object.keys(FRAGS6).length&&!(S.cine9&&S.cine9.final)){const t=setInterval(()=>{if(!S||(S.cine9&&S.cine9.final)){clearInterval(t);return}if(gstate==='play'){clearInterval(t);finalCine13()}},2500)}}catch(e){}
  return r};
let nightChk13=0;
const _update13s=update;
update=function(dt){_update13s(dt);
  if((nightChk13-=dt)>0||gstate!=='play'||!S)return;nightChk13=1;
  if(S.day===1&&darkness()>.35&&!(S.cine9&&S.cine9.noche1)&&!P.inTruck)nightCine13()};
