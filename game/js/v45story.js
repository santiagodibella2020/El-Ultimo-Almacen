'use strict';
/* 0.45: el misterio de la bruma (3 laboratorios abandonados con grabaciones) y la banda del camino (campamento con radio, jaula y quien manda). */
const P45=window.P45=[],GN45=['El Mono','La Zorra','Cuervo','Bastián Hierro','Tía Cadena'];
const REC45=[
 {t:()=>L('Grabación 1'),txt:()=>L('«Día 1. El compuesto salió del depósito B. Dicen que fue un accidente, pero las válvulas estaban cortadas a mano. La bruma no nació sola.»')},
 {t:()=>L('Grabación 2'),txt:()=>L('«Día 9. Los animales cambiaron primero: los dinosaurios que clonamos para el parque se pudrieron antes que la gente. Alguien sabía lo que venía y se fue sin avisar.»')},
 {t:()=>L('Grabación 3'),txt:()=>L('«Día 20. Si alguien escucha esto: la bruma se retira con el amanecer porque la luz rompe el compuesto. Esa es la grieta. Algún día habrá que dejar de escondernos de noche.»')}];
function apply45(){if(!world||!H32.ready)return;P45.length=0;
  const R=mulberry32((worldSeed()^0x45b0ba)>>>0);let sites=[];try{sites=sitesGet6().filter(s=>Math.hypot(s.x,s.z)>140)}catch(e){}if(sites.length<4)return;
  const pick=[];for(let i=0;i<40&&pick.length<4;i++){const s=sites[(R()*sites.length)|0];if(!pick.includes(s)&&!pick.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<80))pick.push(s)}
  const spot=(s,d0,d1)=>{for(let a=0;a<60;a++){const an=R()*6.283,d=s.r*(d0+R()*(d1-d0)),x=s.x+Math.cos(an)*d,z=s.z+Math.sin(an)*d;if(free32(x,z,.8))return{x,z,y:terrainY(x,z)}}return null};
  const put=(k,h,s,d0,d1,sr,tag,lay)=>{if(!H32.geo[k])return null;const p=spot(s,d0,d1);if(!p)return null;const g=lay?lay41(k,h):unit32(k,h);
    inst32(g,[{x:p.x,y:p.y+(lay?.02:0),z:p.z,ry:R()*6.283,t:1}]);if(sr)solid32(p.x,p.z,sr,sr,p.y,h);if(tag){const q=Object.assign({tag},p);P45.push(q);return q}return p};
  const nm=GN45[(worldSeed()>>>3)%GN45.length];S.gang45=S.gang45||{name:nm};
  pick.slice(0,3).forEach((s,i)=>{const t=put('mesa_laboratorio',1.1,s,.2,.5,.9);if(t){for(let j=0;j<3;j++)put('bidon_quimico',.9,s,.3,.7,.35);const g=put('grabadora_vieja',.35,s,.2,.5,0,'rec'+i,true);if(g)g.i=i}});
  const s=pick[3];if(s){put('fogata_campamento',.8,s,.1,.3,.6);put('jaula_metalica',1.7,s,.3,.6,.9,'cage');put('radio_militar',.7,s,.25,.5,.4,'radio');for(let i=0;i<3;i++)put('bidon_quimico',.8,s,.4,.8,.35)}}
const _a45=apply32;apply32=function(){_a45.apply(this,arguments);try{apply45()}catch(e){console.error('v45',e)}};
const _fi45=findInteract;findInteract=function(){
  if(!P.inTruck&&P45.length){const g=S.gang45||(S.gang45={});const lab=S.lab45||(S.lab45=[]);let best=null,bd=2.4;
    for(const p of P45){const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;best=p}}
    if(best){const b=best;
      if(b.tag==='radio')return{label:L('E · Escuchar la radio'),sub:'',act:()=>openEv39({T:{n:()=>L('Radio de la banda'),txt:()=>L('Una voz repite: «Habla {n}. El camino es nuestro: quien pase, paga. Los del almacén tienen cosas buenas, ya los vamos a visitar.»',{n:g.name}),opts:[{t:()=>L('Apagar la radio'),f:()=>{}}]},done:false,arc:true})};
      if(b.tag==='cage')return g.freed?null:{label:L('E · Abrir la jaula'),sub:'',act:()=>{g.freed=true;const s6=story6();s6.karma=(s6.karma||0)+2;s6.helped=(s6.helped||0)+1;sfx('goal');gainXp(60);toast(L('Liberaste a quien tenían preso. La banda de {n} pierde fuerza y deja de asaltar el almacén.',{n:g.name}),'#9fd27a',8)}};
      if(b.tag&&b.tag.startsWith('rec')){const i=b.i;return{label:L('E · Escuchar grabadora'),sub:lab[i]?L('Ya la escuchaste'):'',act:()=>{const r=REC45[i];lab[i]=true;
        openEv39({T:{n:r.t,txt:r.txt,opts:[{t:()=>L('Guardar la cinta'),f:()=>{}}]},done:false,arc:true});
        if(lab.filter(Boolean).length===3&&!story6().bruma45){story6().bruma45=true;gainXp(120);S.inv.medicina=(S.inv.medicina||0)+2;setTimeout(()=>toast(L('Juntaste las tres grabaciones: sabés por qué se retira la bruma con el sol. Eso cambia cómo ves las noches.'),'#9fd27a',9),600)}}}}}}
  return _fi45()};
const _oh45=onHour;onHour=function(prev,now){_oh45(prev,now);try{const cross=v=>prev<v&&now>=v;const g=S.gang45;if(!g||g.freed)return;
  if(cross(20)&&S.day>=9&&!S.big44&&Math.random()<.18){S.raid45=S.day;toast(L('{n} y su banda andan cerca del almacén esta noche. Las torretas ayudan.',{n:g.name}),'#cc4b30',7)}
  if(cross(5)&&S.raid45&&S.raid45>=S.day-1){const f=Math.max(0,1-.3*(S.upg.torreta||0)),m=Math.round(S.money*.1*f);S.raid45=null;
    if(m>0){S.money-=m;toast(L('La banda de {n} se llevó ${m} de la caja.',{n:g.name,m:fmt(m)}),'#cc4b30',7)}else toast(L('La banda de {n} se fue sin llevarse nada: las torretas la espantaron.',{n:g.name}),'#8fbb62',6)}}catch(e){console.error('n45',e)}};
