/* 0.44: castigo al morir (la mochila queda donde caíste), noches variadas (asalto de raptores a la huerta, tormenta de noche) y horda grande anunciada cada 7 días. */
// ---------- Mochila caída ----------
let mk44=null;
const _die44=die;die=function(){const inv=Object.assign({},S.inv),x=P.x,z=P.z;_die44();try{const has=Object.keys(inv).some(k=>inv[k]>0);S.drop44=has?{x,z,inv,day:S.day}:null;
  if(has){const t=$('deadText');t.textContent+=' '+L('Tu mochila quedó donde caíste: volvé a buscarla antes de dos días.')}}catch(e){console.error('d44',e)}};
const _respawn44=respawn;respawn=function(){_respawn44();try{const d=S.drop44;if(d)toast(L('Tu mochila quedó a {n} m.',{n:Math.round(Math.hypot(d.x-P.x,d.z-P.z))}),'#e3a33b',6)}catch(e){}};
function mark44(){const d=S.drop44;if(d&&S.day>d.day+2){S.drop44=null;toast(L('Perdiste tu mochila: alguien se la llevó.'),'#cc4b30',5)}
  const dd=S.drop44;if(!dd){if(mk44){scene.remove(mk44);mk44=null}return}
  if(!mk44){mk44=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.7,.5,.5),new THREE.MeshBasicMaterial({color:0x8a6a3a}));b.position.y=.3;mk44.add(b);
    const r=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,40,6,1,true),new THREE.MeshBasicMaterial({color:0xe3a33b,transparent:true,opacity:.35,depthWrite:false}));r.position.y=20;mk44.add(r);scene.add(mk44)}
  mk44.position.set(dd.x,groundY(dd.x,dd.z),dd.z)}
const _findInteract44=findInteract;findInteract=function(){const d=S.drop44;
  if(d&&!P.inTruck&&Math.hypot(d.x-P.x,d.z-P.z)<2.6)return{label:L('E · Recuperar tu mochila'),sub:'',act:()=>{for(const k in d.inv)S.inv[k]=(S.inv[k]||0)+d.inv[k];S.drop44=null;sfx('pickup');toast(L('Recuperaste lo que llevabas.'),'#8fbb62',4)}};
  return _findInteract44()};
// ---------- Noches variadas y horda anunciada ----------
const BIG44=d=>d>=7&&d%7===0;
const _onHour44=onHour;onHour=function(prev,now){_onHour44(prev,now);try{const cross=v=>prev<v&&now>=v;
  if(cross(8)&&BIG44(S.day+1))toast(L('Se huele en el aire: mañana de noche viene una horda enorme. Reforzá las defensas y juntá munición.'),'#cc4b30',8);
  if(cross(20)){S.raid44=null;
    if(BIG44(S.day)){hordeLeft=Math.round(hordeLeft*2);S.big44=S.day;sfx('roar');shake=.5;toast(L('¡La gran horda! Esta noche vienen {n} podridos. Resistí hasta el amanecer.',{n:hordeLeft}),'#cc4b30',9)}
    else if(S.day>=3&&!(S.night23&&S.night23.on)){const r=Math.random();
      if(r<.22&&S.farm26&&S.farm26.p.some(p=>p.k)){S.raid44=S.day;for(let i=0;i<3;i++)setTimeout(()=>{try{const e=spawnEnemy('raptor',-14+(Math.random()-.5)*14,9+(Math.random()-.5)*8);e.raid44=1}catch(_){}},800+i*500);
        sfx('night');toast(L('Raptores rondan la huerta esta noche. Si llegan al amanecer, arrasan los cultivos.'),'#e3a33b',8)}
      else if(r<.4){S.weather=S.weather||{};S.weather.k='tormenta';S.weather.t=CYCLE()*(9/24);hordeLeft=Math.round(hordeLeft*1.2);toast(L('Tormenta de noche: la lluvia trae más podridos.'),'#9fb0aa',7)}}}
  if(cross(5)){if(S.raid44===S.day-1||S.raid44===S.day){const live=enemies.filter(e=>e.raid44&&!e.dead&&!e.dying);
      if(live.length&&S.farm26){let n=0;S.farm26.p.forEach(p=>{if(p.k&&Math.random()<.6){p.k=null;p.g=0;n++}});live.forEach(e=>{e.dying=.01});if(n){if(typeof crops26Refresh==='function')crops26Refresh();toast(L('Los raptores arrasaron {n} cultivos.',{n}),'#cc4b30',6)}}
      else toast(L('Los raptores no pasaron de la huerta. Se salvaron los cultivos.'),'#8fbb62',5);S.raid44=null}
    if(S.big44&&S.big44>=S.day-1){const m=60+S.big44*25;S.money+=m;S.rep=Math.min(5,S.rep+.3);sfx('goal');toast(L('Sobreviviste a la gran horda. Los sobrevivientes te dejan ${m} y mejora tu reputación.',{m:fmt(m)}),'#9fd27a',8);S.big44=null}}
}catch(e){console.error('n44',e)}};
const _update44=update;update=function(dt){_update44(dt);try{mark44()}catch(e){}};
