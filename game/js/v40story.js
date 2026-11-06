'use strict';
/* v0.40: historia con personajes, decisiones con consecuencias y finales distintos.
   - Cada persona del almacén tiene una historia propia en tres momentos (fugitivo, duelo, esperanza). Cuando te quiere hablar, te avisa y la decisión que tomes cambia lo que pasa.
   - Lo que hacés en la ruta (ayudar o no) se recuerda: cambia precios, regalos y rumores.
   - Desde el día 15, el diario te deja contar cómo termina tu historia: hay cinco finales según el pueblo, la gente, los vecinos y tus decisiones. La partida sigue después. */

const mor40=(w,d)=>{w.mor=Math.max(0,Math.min(100,w.mor+d))};
const allMor40=d=>{for(const x of crew28().list)mor40(x,d)};
const gone40=w=>{const C=crew28();C.list=C.list.filter(x=>x!==w)};
const places40=n=>Object.keys(PLACES6).filter(p=>reveal6(p)).slice(0,n).length;
// cada arco: dos decisiones y un desenlace que depende de lo que elegiste (F = lo que pasó)
const ARC40={
 fugitivo:{
  b:[{txt:n=>L('{n} te lleva aparte, con la voz temblorosa. «Tengo que contarte algo: escapé de una banda de la ruta. Si vienen a buscarme, no quiero que lastimen a nadie.»',{n}),
     o:[{t:()=>L('«Acá nadie entrega a nadie.»'),f:(w,F)=>{F.prot=1;mor40(w,10);return L('{n} respira hondo. «No me voy a olvidar de esto.»',{n:w.name})}},
        {t:()=>L('Pedirle que cuente todo lo que sabe'),f:(w,F)=>{mor40(w,-6);const k=places40(2);return L('{n} te marca en el mapa dónde vio a la banda. Se nota incómodo.',{n:w.name})}}]},
    {txt:n=>L('{n} vio humo sobre la ruta y cree que es la banda. «Dame con qué defenderme o me voy esta noche.»',{n}),
     o:[{t:()=>L('Darle 20 balas'),ok:()=>(S.ammo.balas||0)>=20,f:(w,F)=>{S.ammo.balas-=20;F.arma=1;mor40(w,8);return L('{n} las guarda sin decir nada, pero se nota más firme.',{n:w.name})}},
        {t:()=>L('«Quedate tranquilo, los guardias se encargan.»'),f:(w,F)=>{F.conf=1;if(Math.random()<.5){mor40(w,4);return L('{n} asiente. Quiere creerte.',{n:w.name})}mor40(w,-8);return L('{n} no te cree del todo, pero se queda.',{n:w.name})}},
        {t:()=>L('Dejar que se vaya esa noche'),f:(w,F)=>{const n=w.name;gone40(w);return L('{n} se fue de noche. No volviste a saber nada más.',{n})}}]},
    (w,F)=>F.prot&&(F.arma||F.conf)?{txt:L('{n} te espera en el patio con un mapa. «Los de la banda se fueron al sur. Esto era de su depósito: es tuyo.»',{n:w.name}),
        res:L('Aceptás el mapa y el botín. {n} ya no mira por encima del hombro: este es su lugar.',{n:w.name}),eff:()=>{S.money+=300;give6('medicina',1);S.ammo.balas=(S.ammo.balas||0)+30;w.loyal40=1;story6().banda=1}}
      :{txt:L('{n} dejó una nota sobre la mesa: «Gracias por el techo. No puedo quedarme.»',{n:w.name}),
        res:L('Se fue antes del amanecer. Quizás en otro lugar encuentre paz.'),eff:()=>{gone40(w)}}]},
 duelo:{
  b:[{txt:n=>L('{n} te muestra una cinta de nena atada a la muñeca. «Perdí a mi hija en la ruta cuando empezó la bruma. Si ves algo...»',{n}),
     o:[{t:()=>L('«Voy a preguntar por ella en cada lugar.»'),f:(w,F)=>{F.prom=1;mor40(w,8);return L('{n} te agarra la mano sin decir nada.',{n:w.name})}},
        {t:()=>L('«Pasó mucho tiempo. Lo siento.»'),f:(w,F)=>{mor40(w,-10);return L('{n} asiente despacio y vuelve al trabajo.',{n:w.name})}}]},
    {txt:n=>L('{n} te pide un día libre para buscar a su hija en la ciudad. «Vuelvo antes de que anochezca.»',{n}),
     o:[{t:()=>L('Dejar que vaya'),f:(w,F)=>{F.fue=1;places40(2);return L('{n} vuelve de noche, con los pies hechos pedazos y con noticias de lugares que no conocías. Los marcaste en el mapa.',{n:w.name})}},
        {t:()=>L('«Esperá a que armemos una expedición.»'),f:(w,F)=>{F.esp=1;mor40(w,-5);return L('{n} baja la cabeza. «Está bien. Esperemos.»',{n:w.name})}}]},
    (w,F)=>F.prom&&F.fue?{txt:L('{n} irrumpe corriendo: «¡La encontré! Está viva, en la colonia. Me la llevo, pero no quiero irme sin agradecerte.»',{n:w.name}),
        res:L('Se despide con un abrazo largo y te deja todo lo que ahorró. Antes de irse te presenta a un amigo que busca refugio.'),eff:()=>{S.money+=400;gone40(w);story6().reunidos=1;karma39(1);try{makeCand37()}catch(e){}}}
      :F.prom?{txt:L('{n} sigue sin noticias de su hija. «Pero no me olvido de que lo intentaste.»',{n:w.name}),res:L('Se queda, más callado, pero con algo de esperanza.'),eff:()=>{mor40(w,10)}}
      :{txt:L('{n} ya no habla de su hija. Trabaja de sol a sol, sin levantar la vista.',{n:w.name}),res:L('Algo se apagó en esa persona y no sabés cómo volver a encenderlo.'),eff:()=>{mor40(w,-8)}}]},
 esperanza:{
  b:[{txt:n=>L('{n} propone una comida para todos alrededor del fuego. «Hace mucho que nadie come sentado con otros.»',{n}),
     o:[{t:()=>L('Hacerla (4 latas)'),need:{lata:4},f:(w,F)=>{take39({lata:4});F.cena=1;allMor40(6);karma39(1);return L('Comieron juntos, hablaron de antes y hasta hubo risas.')}},
        {t:()=>L('«Ahora no, hay que ahorrar.»'),f:(w,F)=>{mor40(w,-6);return L('{n} asiente sin discutir.',{n:w.name})}}]},
    {txt:n=>L('{n} quiere escribir en la pared del almacén los nombres de los que ya no están.',{n}),
     o:[{t:()=>L('Dejar que lo haga'),f:(w,F)=>{F.memo=1;allMor40(4);return L('Entre todos fueron sumando nombres. Nadie dijo mucho, pero se notó.')}},
        {t:()=>L('«Mejor mirar hacia adelante.»'),f:(w,F)=>L('{n} guarda el carbón y no vuelve a tocar el tema.',{n:w.name})}]},
    (w,F)=>F.cena&&F.memo?{txt:L('La gente empezó a llamar «la casa» al almacén. {n} lo escribió en el cartel de la entrada.',{n:w.name}),res:L('Algo cambió: ya no es un lugar donde sobrevivir, sino un lugar donde vivir.'),eff:()=>{allMor40(12);w.loyal40=1;story6().hope=1}}
      :F.cena||F.memo?{txt:L('{n} te agradece por lo que dejaste hacer. «Es un comienzo.»',{n:w.name}),res:L('Se nota un poco más de calma entre la gente.'),eff:()=>{allMor40(5)}}
      :{txt:L('{n} ya casi no habla con nadie. Dice que ya no hay nada que festejar.',{n:w.name}),res:L('El silencio se instala en el patio.'),eff:()=>{allMor40(-5)}}]}};
const ARCS40=Object.keys(ARC40);
const JOBLBL40=w=>{try{return job28(w.job)[0]}catch(e){return ''}};
function arc40(w){if(!w.arc40)w.arc40={id:ARCS40[w.id%3],beat:0,at:S.day+3,F:{}};return w.arc40}
function openArc40(w){const A=arc40(w),B=ARC40[A.id].b[A.beat],C=crew28();if(!B)return;
  const done=()=>{A.beat++;A.at=S.day+(A.beat===1?4:5);C.pend40=null};
  let T;
  if(typeof B==='function'){const R=B(w,A.F);T={n:()=>w.name+' · '+JOBLBL40(w),txt:()=>R.txt,opts:[{t:()=>L('Escuchar lo que tiene para decir'),f:()=>{R.eff();A.beat=3;C.pend40=null;return R.res}}]}}
  else T={n:()=>w.name+' · '+JOBLBL40(w),txt:()=>B.txt(w.name),opts:B.o.map(o=>({t:o.t,ok:o.ok,need:o.need,f:()=>{const r=o.f(w,A.F);done();return r}}))};
  openEv39({T,done:false,arc:true})}
const _ci40=crewInteract28;
crewInteract28=function(){const C=crew28();
  try{if(!P.inTruck&&C.pend40){let best=null,bd=2.2;for(const [id,o] of crewG28){if(!o.g.visible)continue;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<bd){bd=d;best=id}}
    if(best===C.pend40){const w=C.list.find(x=>x.id===best);if(w)return{label:L('E · {n} quiere hablarte',{n:w.name}),sub:L('Es importante para {n}',{n:w.name}),act:()=>openArc40(w)}}}}catch(e){console.error('v40',e)}
  return _ci40.apply(this,arguments)};
let arcT40=0;
const _crewTick40=crewTick28;
crewTick28=function(dt){_crewTick40.apply(this,arguments);
  try{arcT40-=dt;if(arcT40>0)return;arcT40=4;const C=crew28(),h=hourOf(S.t);
    for(const w of C.list)if(w.loyal40&&w.mor<70)w.mor=70;
    if(C.pend40){const w=C.list.find(x=>x.id===C.pend40);if(!w||(arc40(w).beat>=3))C.pend40=null;else return}
    if(h<9||h>18||isNight())return;
    for(const w of C.list){const A=arc40(w);if(A.beat<3&&S.day>=A.at&&w.hp>30&&crewG28.get(w.id)&&crewG28.get(w.id).g.visible){C.pend40=w.id;sfx('goal');toast(L('{n} quiere hablarte. Acercate y apretá E.',{n:w.name}),'#e3a33b',7);break}}}catch(e){console.error('v40 arco',e)}};

// lo que hiciste en la ruta se sabe: regalos y rumores
const _newDay40=newDay;
newDay=function(){_newDay40.apply(this,arguments);
  try{const s=story6(),k=s.karma||0;
    if((s.helped||0)>=2&&Math.random()<.25){const q=['lata','agua','venda','pilas'][Math.random()*4|0];S.stash[q]=(S.stash[q]||0)+(2+(Math.random()*3|0));toast(L('Alguien a quien ayudaste dejó un paquete en la puerta del almacén.'),'#8fbb62',6)}
    if(k<=-3&&Math.random()<.2){allMor40(-3);toast(L('Corrió el rumor de que dejás gente tirada en la ruta. A la gente del almacén le pesa.'),'#cc4b30',6)}}catch(e){}};

// ---------- finales ----------
function ending40(){const C=crew28(),s=story6(),lvl=typeof level37==='function'?level37():0,crew=C.list.length,k=s.karma||0,th=s.threads||[];
  const neigh=Object.values(s.npc||{}).reduce((a,n)=>a+(n.fav||0),0),leal=C.list.filter(w=>w.loyal40).length,tw=typeof has37==='function'?has37('torre'):0,mu=typeof has37==='function'?has37('muralla'):0;
  const sc={pueblo:lvl*3+crew*.5+k*1.2+leal+neigh*.5,fortaleza:tw*2+mu*3+(k<0?4:0)+lvl,caravana:(th.includes('caravana')?4:0)+(th.includes('radio')?4:0)+(crew<6?2:0),
    memoria:(s.frags||[]).length/Math.max(1,Object.keys(FRAGS6).length)*8+(s.hope?3:0)+th.length,solitario:6-crew+(k<0?2:0)};
  let id='solitario',b=-1e9;for(const q in sc)if(sc[q]>b){b=sc[q];id=q}
  const E={pueblo:[L('La casa de todos'),L('El almacén dejó de ser un negocio y pasó a ser el centro de un pueblo. Hay calles, faroles, niños corriendo y gente que se acuerda de tu nombre. La bruma sigue ahí afuera, pero ya no manda.')],
    fortaleza:[L('La fortaleza'),L('Levantaste muros altos y torres con guardias que no duermen. Adentro, nadie pasa hambre ni miedo. Afuera, la ruta se cerró para los que no tienen nada que ofrecer. Estás a salvo, y lo sabés.')],
    caravana:[L('El camino a la costa'),L('Una noche la radio dijo tu nombre. Cargaste lo que pudiste, juntaste a los que quisieron seguirte y tomaste la ruta hacia la costa. El almacén quedó con la luz prendida por si alguien llega.')],
    memoria:[L('Los que cuentan'),L('Fuiste juntando relatos: los Ibarra, la Piedra Verde, la caravana, la voz de la radio. Ahora, cada noche, alguien en el patio los cuenta de nuevo. Nadie va a olvidar lo que pasó, ni a quién le pasó.')],
    solitario:[L('El último almacén'),L('Fueron pocos los que se quedaron, pero el almacén sigue abierto y con la persiana alta. Quizás el mundo no necesite más que eso: un lugar donde alguien te espera.')]}[id];
  const x=[];
  if(s.reunidos)x.push(L('Alguien de tu gente volvió a abrazar a su hija, y eso quedó escrito en el cartel de la entrada.'));
  if(s.banda)x.push(L('La banda de la ruta nunca volvió: quien huía de ella encontró en tu patio un lugar donde quedarse.'));
  if(s.hope)x.push(L('En la pared del almacén están los nombres de los que ya no están, y nadie los borra.'));
  if(k>=3)x.push(L('En la ruta te recuerdan por haber ayudado cuando nadie lo hacía.'));
  else if(k<=-2)x.push(L('En la ruta te recuerdan por haber seguido de largo. Hay puertas que no se abren para vos.'));
  if(neigh>=3)x.push(L('Los vecinos de los pueblos te consideran uno de los suyos.'));
  if((C.dead||0)>=3)x.push(L('Perdiste a {n} personas por el camino, y no se te olvida ninguna.',{n:C.dead}));
  x.push(L('Llegaste al día {d} con {n} personas a tu lado.',{d:S.day,n:crew}));
  return{id,title:E[0],text:E[1]+'\n\n'+x.join(' ')}}
const _rd40=renderDiario6;
renderDiario6=function(){_rd40.apply(this,arguments);try{if(S.day>=15)$('diarioBody').insertAdjacentHTML('beforeend',`<div class="btns6" style="margin-top:1rem"><button class="primary" data-a="end40">${esc(L('Contar cómo termina tu historia'))}</button></div><p class="note">${esc(L('La partida sigue después. Podés volver a contarla cuando quieras.'))}</p>`)}catch(e){}};
$('diario').addEventListener('click',e=>{const b=e.target.closest('[data-a="end40"]');if(!b)return;const E=ending40();
  openEv39({T:{n:()=>E.title,txt:()=>E.text,opts:[{t:()=>L('Seguir jugando'),f:()=>L('La historia sigue, mientras vos sigas.')}]},done:false,arc:true})});
