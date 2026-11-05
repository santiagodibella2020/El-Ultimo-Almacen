'use strict';
// ================= v0.6: VILLAGES, PLACES, PEOPLE, A QUIET STORY, MORE VEHICLES, CARGO ACCESS =================
// Loaded after v5. Wraps world generation, interaction and the HUD. Every global here is unique to v6.

// ---------- Data ----------
Object.assign(ITEMS,{
  te:{n:'Té de yuyos',v:14,w:.2,c:'#8a9a4a',cat:'drink',drink:18,calm:35},
  charqui:{n:'Charqui',v:20,w:.3,c:'#7a3a28',cat:'food',food:30},
  mochila_t:{n:'Mochila táctica',v:300,w:1.4,c:'#3a4030',cat:'bag',cap:34},
  kit_motor:{n:'Kit de motor',v:110,w:3,c:'#6a6a70',cat:'tool'},
  radio:{n:'Radio portátil',v:140,w:.8,c:'#4a4a40',cat:'tool'},
});
IK.length=0;IK.push(...Object.keys(ITEMS));
Object.assign(VEH,{
  sedan:{n:'Auto familiar',cap:70,max:31,acc:11,fuel:.75,len:4.5,wid:1.85,col:'#3e5566',bed:'trunk',cabZ:-.2,style:'sedan',eye:1.5},
  jeep:{n:'Todoterreno 4x4',cap:110,max:28,acc:10,fuel:1.15,len:4.3,wid:2,col:'#55603e',bed:'open',cabZ:.55,style:'jeep',eye:1.9},
  ambulancia:{n:'Ambulancia',cap:150,max:25,acc:8,fuel:1.25,len:5.8,wid:2.2,col:'#e2e0d6',bed:'box',cabZ:1.85,style:'amb',eye:2.05},
  colectivo:{n:'Colectivo',cap:280,max:17,acc:4,fuel:1.7,len:10.5,wid:2.6,col:'#c9a23a',bed:'bus',cabZ:4.3,style:'bus',eye:2.35,broken:true},
});
const NEWV6=['sedan','jeep','ambulancia','colectivo'];
STORE_DEF.estacion={n:'Estación',w:12,d:8,col:'#8a6a50'};

const PLACES6={
  sauce:{n:'Paso del Sauce',kind:'village',r:34,road:[-390,-250],off:40,safe:true},
  colonia:{n:'Colonia Esperanza',kind:'colonia',r:34,rad:[190,380],safe:true},
  estacion:{n:'La Estación',kind:'station',r:28,rad:[170,400],safe:true},
  estancia:{n:'Estancia La Paloma',kind:'farm',r:28,rad:[150,400],safe:true},
  antena:{n:'Antena del Cerro Chato',kind:'antenna',r:13,rad:[200,420],high:true,safe:true},
  campamento:{n:'Campamento del Arroyo',kind:'camp',r:16,rad:[150,400],wet:true,safe:true},
  terminal:{n:'Terminal de ómnibus',kind:'terminal',r:20,road:[300,400],off:24,safe:true},
  mirador:{n:'Mirador',kind:'tower',r:9,rad:[120,320]},
  cementerio:{n:'Cementerio de la loma',kind:'cemetery',r:15,rad:[110,330]},
};
const THREADS6={
  ibarra:{n:'Los Ibarra',d:'La familia que tenía el almacén antes que vos.',money:500,rep:.6},
  piedra:{n:'La Piedra Verde',d:'De dónde salieron la bruma y los dinosaurios.',money:400,items:{nucleo:3,ambar:1}},
  caravana:{n:'La caravana',d:'Los que se fueron por la ruta.',money:300,items:{kit_motor:1}},
  radio:{n:'La voz de la radio',d:'Alguien transmite cada noche desde la costa.',money:500,rep:.6},
};
const FRAGS6={
  ibarra1:{th:'ibarra',tx:'Doña Elvira: «El almacén era de los Ibarra. Don Julio abría a las siete aunque lloviera a cántaros. Cuando llegó la bruma se quedó solo, cuidando el mostrador.»',hint:'Alguien en Paso del Sauce conoció a los dueños del almacén.'},
  ibarra2:{th:'ibarra',tx:'Una tumba nueva, hecha a mano: «Julio Ibarra. Cuidó el almacén hasta el final.» Alguien dejó flores secas y una cinta de nena atada a la cruz.',hint:'Hay una tumba nueva en el cementerio de la loma.'},
  ibarra3:{th:'ibarra',tx:'Doña Elvira te da una foto vieja: una nena sentada en el mostrador de tu almacén. Atrás dice: «Sofía, ocho años. Se fue con la caravana.»',hint:'Doña Elvira guarda algo. Tal vez si la ayudás…'},
  ibarra4:{th:'ibarra',tx:'Hermana Inés: «Sofía Ibarra pasó un invierno con nosotras. Antes de irse a la costa me pidió una sola cosa: que si alguien abría el almacén, lo cuidáramos.»',hint:'En Colonia Esperanza alguien conoció a la hija de los Ibarra.'},
  piedra1:{th:'piedra',tx:'Rufino: «Los bichos no salieron de ningún laboratorio. Los vi salir de la tierra, cerca del cráter, la misma noche que la piedra empezó a brillar.»',hint:'Un cazador del campamento vio algo la primera noche.'},
  piedra2:{th:'piedra',tx:'Libreta de un geólogo, junto a la piedra: «Muestra 14: no es ningún mineral conocido. Late. Los huesos fósiles que la rodean están tibios.»',hint:'Alguien estudió la Piedra Verde antes que vos. Buscá cerca del cráter.'},
  piedra3:{th:'piedra',tx:'Hermana Inés, mirando los núcleos: «La bruma baja de noche porque la piedra respira. Cuando cae uno de los grandes, la bruma se calma unos días. Están atados a ella.»',hint:'La hermana Inés estudia la bruma. Le faltan muestras.'},
  piedra4:{th:'piedra',tx:'Radio, con interferencia: «…la piedra no es de acá. Cayó hace millones de años y se los llevó. Ahora los está devolviendo, de a uno…»',hint:'De noche, la radio dice cosas que nadie más sabe.'},
  caravana1:{th:'caravana',tx:'Tano: «Salimos treinta en la caravana: dos colectivos, un camión y mi chata. En la terminal nos agarró la bruma. Yo me quedé a arreglar lo que quedó.»',hint:'El mecánico de la estación viajaba con la caravana.'},
  caravana2:{th:'caravana',tx:'Lista pegada en la boletería. Muchos nombres tachados y uno subrayado: «S. Ibarra, asiento 12». Abajo, con otra letra: «Destino: Puerto Escondido».',hint:'En la terminal de ómnibus quedó la lista de pasajeros.'},
  caravana3:{th:'caravana',tx:'Tano despliega un mapa engrasado: «El camino a la costa sale por la estación. Si algún día el colectivo vuelve a andar, ese es el rumbo.»',hint:'Tano necesita repuestos. Él sabe adónde fue la caravana.'},
  caravana4:{th:'caravana',tx:'Pizarrón de la estación, escrito con tiza: «Caravana 2 pasó el día 14. Todos bien. Seguimos a la costa. No esperen el tren».',hint:'La estación de tren tiene un pizarrón con mensajes.'},
  radio1:{th:'radio',tx:'Lucho: «Todas las noches, a las once, alguien transmite desde la costa. Siempre lo mismo: el clima, los nombres de los que llegaron y una canción.»',hint:'En la antena del cerro alguien escucha la radio.'},
  radio2:{th:'radio',tx:'Con las pilas nuevas la antena llega más lejos. Lucho anota un nombre que repite la radio: «Sofía Ibarra, llegó bien. Manda saludos al almacén».',hint:'Lucho necesita pilas para la antena.'},
  radio3:{th:'radio',tx:'Grabado en la baranda del mirador: «Desde acá, los días claros, se ve el humo del puerto. No estamos solos».',hint:'Desde el mirador se ve lejos. Alguien dejó un mensaje arriba.'},
  radio4:{th:'radio',tx:'Radio: «Puerto Escondido, aquí. Tenemos agua, semillas y una escuela. Si tienen un almacén abierto, no lo cierren: la ruta los necesita».',hint:'Con una radio portátil vas a escuchar la transmisión de las once.'},
};
const EPILOGUE6={tx:'Ya sabés por qué este almacén importa. Don Julio lo cuidó, Sofía llegó a la costa y la ruta sigue viva. No hace falta irse a ningún lado: alcanza con seguir abierto.'};
const RADIO6=[
  {tx:'Radio: «Buenas noches a los que quedan. En la costa llovió y la cosecha viene bien.»'},
  {tx:'Radio: «Mensaje para la ruta: si ven humo blanco, es gente amiga. Si ven bruma, cierren la puerta.»'},
  {tx:'Radio: «Hoy llegaron dos familias del norte. Bienvenidas. Mañana sale el sol.»'},
];
const SVC6={
  mapa:{n:'Marcar lugares en el mapa',d:'Te marca todos los lugares de la zona.'},
  arreglo:{n:'Arreglar un vehículo cercano',d:'Arregla el vehículo roto más cercano (hasta 60 m).'},
  tanque:{n:'Llenar el tanque',d:'Llena la nafta del vehículo más cercano (hasta 60 m).'},
  cura:{n:'Curar heridas',d:'Venda y desinfecta tus heridas y cura la infección.'},
};
const NPC6={
  elvira:{n:'Doña Elvira',role:'Pulpera',place:'sauce',look:['#6a4a5a','#c9a888','#3a3028'],acc:'shawl',
    hi:'Pasá, pasá. Acá no se pelea nadie, salvo con el precio de la yerba.',
    talk:[{frag:'ibarra1'},{txt:'Si vas para la loma, fijate en el cementerio. Alguien anduvo arreglando una tumba.',reveal:'cementerio'},{txt:'Los del campamento cazan bichos grandes. Pagan bien los colmillos.',reveal:'campamento'}],
    sell:[['antibioticos',90],['mochila_c',105],['campera',70],['te',16],['leche',9],['svc:mapa',90]],
    buy:{joyas:1.6,colmillo:1.4,cuero:1.5,tela:2},
    favors:[{need:{pan:3,lata:4},pay:140,frag:'ibarra3',ask:'Se me acabó la mercadería para los que pasan. ¿Me traés pan y unas latas?',thanks:'Dios te lo pague. Tomá, esto era de los Ibarra. Te corresponde.'},
      {need:{tablas:6,clavos:20},pay:220,ask:'El techo del puesto se llueve. Con unas tablas y clavos lo arreglo.',thanks:'Ahora sí, que llueva lo que quiera.'}]},
  ines:{n:'Hermana Inés',role:'Monja',place:'colonia',look:['#2a2a32','#d0b090','#2a2a32'],acc:'veil',
    hi:'Bienvenido a la colonia. Si venís en paz, hay lugar en la mesa.',
    talk:[{txt:'Acá le damos de comer al que llega. Nadie pregunta de dónde viene.'},{frag:'ibarra4'},{txt:'Desde el mirador se ve casi todo el valle. Subí alguna vez.',reveal:'mirador'}],
    sell:[['medicina',60],['venda',18],['desinfectante',26],['te',14],['svc:cura',40]],
    buy:{nucleo:2.5,lata:1.4,agua:1.3},
    favors:[{need:{nucleo:4},pay:200,frag:'piedra3',ask:'Necesito núcleos de bruma para entender qué nos pasa. Los sueltan los podridos.',thanks:'Gracias. Ahora entiendo un poco más. Escuchá…'},
      {need:{lata:6,agua:6},pay:180,ask:'Llegaron chicos nuevos. Si me traés latas y agua, comen toda la semana.',thanks:'Los chicos te mandan saludos.'}]},
  tano:{n:'Tano',role:'Mecánico',place:'estacion',look:['#3a4a5a','#c09a78','#2a3440'],acc:'cap',
    hi:'¿Qué traés? Si tiene motor, lo arreglo. Si no tiene, también.',
    talk:[{frag:'caravana1'},{txt:'En la terminal quedó un colectivo. Le falta poco para andar.',reveal:'terminal'},{txt:'Un auto chico gasta poco. Un camión lleva todo, pero toma nafta como loco.'}],
    sell:[['herramientas',70],['chatarra',10],['combustible',32],['kit_motor',140],['svc:arreglo',220],['svc:tanque',45]],
    buy:{pilas:1.2,cinta:1.5,combustible:1.3},
    favors:[{need:{chatarra:10,cinta:3},pay:180,frag:'caravana3',ask:'Para dejar andando la chata me falta chatarra y cinta. ¿Me das una mano?',thanks:'Gracias, che. Mirá esto, nunca se lo mostré a nadie.'},
      {need:{combustible:4},pay:160,ask:'Sin nafta no pruebo nada. Traeme unos bidones.',thanks:'Eso suena a motor contento.'}]},
  lucho:{n:'Lucho',role:'Radioaficionado',place:'antena',look:['#4a5a4a','#b89070','#30302a'],acc:'phones',
    hi:'Shh… perdón. Estaba escuchando. ¿Necesitás algo?',
    talk:[{frag:'radio1'},{txt:'Con una radio portátil podés escuchar la transmisión de las once desde tu almacén.'},{txt:'Allá abajo hay una colonia. La hermana Inés cuida a todos.',reveal:'colonia'}],
    sell:[['radio',150],['pilas',12],['encendedor',10],['analgesicos',24]],
    buy:{chatarra:1.2,cinta:1.4},
    favors:[{need:{pilas:6},pay:120,frag:'radio2',ask:'La antena anda con lo justo. Con seis pilas llego más lejos.',thanks:'¡Ahí está! ¿Escuchaste ese nombre?'},
      {need:{chatarra:6,cinta:2},pay:160,ask:'El viento me dobló un tramo de la antena. Traeme chatarra y cinta.',thanks:'Listo. Ahora se escucha hasta el mar.'}]},
  rufino:{n:'Rufino',role:'Cazador',place:'campamento',look:['#5a4a30','#a8805e','#3a3020'],acc:'hat',
    hi:'Despacio. Los bichos huelen el apuro.',
    talk:[{frag:'piedra1'},{txt:'Al sur hay una estación de tren. El Tano arregla cualquier cosa con motor.',reveal:'estacion'},{txt:'Los raptores cazan en manada. Si ves uno, hay tres más mirándote.'}],
    sell:[['w:ballesta',380],['a:virotes:12',30],['a:rifle:10',55],['charqui',22]],
    buy:{carne:1.8,cuero:1.6,colmillo:1.8,hueso:1.6,ambar:1.3,placa:1.5,cuchilla:1.5,muestra:1.5,garra:1.5,cuerno:1.5,glandula:1.5},
    favors:[{need:{carne:6},pay:150,ask:'La cacería viene flaca. Traeme carne cruda y te pago bien.',thanks:'Esto alcanza para una semana. Gracias.'},
      {need:{colmillo:3,cuero:2},pay:0,item:{mochila_t:1},ask:'Si me conseguís colmillos y cuero, te doy una mochila de verdad.',thanks:'Tomá. Aguanta lo que le pongas.'}]},
  benito:{n:'Don Benito',role:'Estanciero',place:'estancia',look:['#6a5a3a','#c49a78','#3a3a44'],acc:'beard',
    hi:'Buen día. El campo no para, ni con bruma.',
    talk:[{txt:'El molino todavía anda. Mientras gire, hay agua.'},{txt:'En Paso del Sauce está Doña Elvira. Conoció a todo el mundo.',reveal:'sauce'},{txt:'Del otro lado del monte hay un campamento de cazadores.',reveal:'campamento'}],
    sell:[['fruta',6],['leche',8],['pan',7],['asada',32],['mochila_e',40]],
    buy:{herramientas:1.3,clavos:2,tablas:1.6,madera:1.7,serrucho:1.4},
    favors:[{need:{madera:10,clavos:15},pay:160,ask:'El corral se viene abajo. Con madera y clavos lo levanto.',thanks:'Ya está. Gracias, de verdad.'},
      {need:{herramientas:1,serrucho:1},pay:120,item:{asada:4},ask:'Se me rompieron las herramientas. Sin eso el campo no se trabaja.',thanks:'Tomá, carne asada de la buena. Y la plata.'}]},
  marta:{n:'Marta, la Gringa',role:'Comerciante',place:'terminal',look:['#7a3a3a','#e0b898','#2a2a30'],acc:'scarf',
    hi:'Compro, vendo y no pregunto. ¿Qué buscás?',
    talk:[{txt:'Lo que no tengo, lo consigo. Lo que tengo, lo cobro.'},{txt:'La caravana salió de esta terminal. Fijate en la boletería, todavía está la lista.'},{txt:'En el cerro hay una antena. El que vive ahí no duerme nunca.',reveal:'antena'}],
    sell:[['mochila_t',340],['bolso_m',190],['w:escopetac',820],['a:cartuchos:16',45],['a:fusil:30',70],['analgesicos',24]],
    buy:{joyas:1.8,ambar:1.5,colmillo:1.2,polvora:1.5},
    favors:[{need:{ambar:2},pay:420,ask:'Tengo un comprador para ámbar. Dos piezas y te pago como nadie.',thanks:'Un placer hacer negocios.'},
      {need:{joyas:4},pay:380,ask:'Joyas. Las que encuentres. Yo sé dónde venderlas.',thanks:'Brillan lindo. Tomá lo tuyo.'}]},
};
GOALS.splice(GOALS.length-1,0,
  {id:'lugares',n:'Visitá todos los lugares de la zona',r:500,test:()=>!!(S.story&&S.story.places.length>=Object.keys(PLACES6).length)},
  {id:'historia',n:'Descubrí toda la historia',r:1000,test:()=>!!(S.story&&S.story.frags.length>=Object.keys(FRAGS6).length)},
);

// ---------- Sites: chosen per world seed, before the terrain is built, so the ground is flattened ----------
let seed6=WORLD_SEED,sites6=null,sitesNoise6=null,npcs6=[],notes6=[],anim6=[],lookout6=null;
const townMain6=townW;
function rawMain6(x,z){
  let h=(fbm(nH,x*.0042,z*.0042,5)-.5)*95+(nD(x*.03,z*.03)-.5)*3;
  const d=Math.max(Math.abs(x),Math.abs(z));h+=ridge26(d);
  const rd=Math.abs(x-roadX(z));if(rd<9){const t=smooth(9,4,rd);h=lerp(h,Math.max(h*.7,WATER_Y+1.2),t*.8)}
  const tw=townMain6(x,z);if(tw>0)h=lerp(h,TOWN_Y+(nD(x*.05,z*.05)-.5)*.3,tw);
  const r=Math.hypot(x,z);const t=smooth(30,75,r);h=lerp(2,h,t);return h}
function sitesGet6(){
  if(sites6&&sitesNoise6===nH)return sites6;sitesNoise6=nH;sites6=[];const rng=mulberry32((seed6^0x5eed6)>>>0);let idx=0;
  for(const [id,p] of Object.entries(PLACES6)){let best=null;
    for(let a=0;a<700&&!best;a++){let x,z;
      if(p.road){z=p.road[0]+rng()*(p.road[1]-p.road[0]);x=roadX(z)+(rng()<.5?-1:1)*p.off}
      else{const ang=rng()*6.283,rad=p.rad[0]+rng()*(p.rad[1]-p.rad[0]);x=Math.cos(ang)*rad;z=Math.sin(ang)*rad}
      if(Math.abs(x)>405||Math.abs(z)>405)continue;if(Math.hypot(x,z)<100)continue;
      if(Math.hypot(x-roadX(TOWN_Z),z-TOWN_Z)<150||Math.abs(z-TOWN_Z)<100&&Math.abs(x-roadX(z))<90)continue;
      if(sites6.some(s=>Math.hypot(s.x-x,s.z-z)<s.r+p.r+70))continue;
      if(!p.road&&Math.abs(x-roadX(z))<p.r+14)continue;
      const y=rawMain6(x,z);const hs=[];for(let i=0;i<8;i++)hs.push(rawMain6(x+Math.cos(i*.785)*p.r,z+Math.sin(i*.785)*p.r));
      const mn=Math.min(y,...hs),mx=Math.max(y,...hs);
      if(mn<WATER_Y+1.8)continue;if(mx-mn>(a<350?6:11))continue;
      if(p.high){if(y<9&&a<450)continue}else if(y>16)continue;
      if(p.wet&&moist(x,z)<.5&&a<450)continue;
      best={id,x,z,r:p.r,kind:p.kind,y:p.high?y:clamp((y*2+mx+mn)/4,WATER_Y+2.2,16),safe:!!p.safe}}
    if(!best){const ang=idx/9*6.283+.4,x=Math.cos(ang)*260,z=Math.sin(ang)*260;best={id,x,z,r:p.r,kind:p.kind,y:clamp(rawMain6(x,z),WATER_Y+2.2,16),safe:!!p.safe}}
    sites6.push(best);idx++}
  return sites6}
townW=function(x,z){let w=townMain6(x,z);if(w>=1||!nH)return w;for(const p of sitesGet6()){const dx=x-p.x,dz=z-p.z;if(dx>p.r+16||dx<-p.r-16||dz>p.r+16||dz<-p.r-16)continue;const ww=1-smooth(p.r*.92,p.r+14,Math.hypot(dx,dz));if(ww>w)w=ww}return w};
rawHeight=function(x,z){let h=rawMain6(x,z);for(const p of sitesGet6()){const dx=x-p.x,dz=z-p.z;if(dx>p.r+22||dx<-p.r-22||dz>p.r+22||dz<-p.r-22)continue;const w=1-smooth(p.r*.9,p.r+20,Math.hypot(dx,dz));if(w>0)h=lerp(h,p.y+(nD(x*.05,z*.05)-.5)*.25,w)}return h};
const site6=id=>(sites6||[]).find(s=>s.id===id);
const inSafe6=(x,z,pad)=>(sites6||[]).some(s=>s.safe&&Math.abs(x-s.x)<s.r+pad&&Math.abs(z-s.z)<s.r+pad&&Math.hypot(x-s.x,z-s.z)<s.r+pad);

// ---------- Building helpers ----------
const solid6=(x,z,w,d,y,h)=>addAABB({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y-1,y1:y+h,kind:'solid'});
function sign6(text,x,z,yaw){const y=terrainY(x,z);const g=grp(x,y,z,world);g.rotation.y=yaw;bx(.14,2.2,.14,'#4a3a28',-1.6,1.1,0,g);bx(.14,2.2,.14,'#4a3a28',1.6,1.1,0,g);
  const sg=new T3.Mesh(new T3.PlaneGeometry(3.6,.9),new T3.MeshBasicMaterial({map:signTexture(text.toUpperCase(),'#2a2218','#d8c8a0'),color:0xb0a080}));sg.position.set(0,1.8,.08);g.add(sg);
  const back=sg.clone();back.rotation.y=Math.PI;back.position.z=-.08;g.add(back)}
function fence6(cx,cz,r,gaps){const n=Math.round(r*6.283/3.4);let prev=null;
  for(let i=0;i<=n;i++){const a=i/n*6.283;const open=gaps.some(g=>Math.abs(angDiff(a,g))<.11);const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=terrainY(x,z);
    if(open){prev=null;continue}bx(.18,1.3,.18,'#5a4630',x,y+.6,z,world);addAABB({x0:x-.12,x1:x+.12,z0:z-.12,z1:z+.12,y0:y-1,y1:y+1.3,kind:'solid'});
    if(prev){const mx=(x+prev.x)/2,mz=(z+prev.z)/2,len=Math.hypot(x-prev.x,z-prev.z),yaw=Math.atan2(x-prev.x,z-prev.z),my=(y+prev.y)/2;
      for(const hh of [.5,1.05]){const rl=bx(.08,.1,len,'#6a5238',mx,my+hh,mz,world);rl.rotation.y=yaw}}prev={x,z,y}}}
function stall6(x,z,yaw,col){const y=terrainY(x,z);const g=grp(x,y,z,world);g.rotation.y=yaw;
  bx(2.8,1,.8,'#6a5038',0,.5,0,g);bx(3,.08,1,'#4a3826',0,1.02,0,g);
  [[-1.4,.45],[1.4,.45],[-1.4,-1.7],[1.4,-1.7]].forEach(([px,pz])=>bx(.12,2.5,.12,'#4a3a28',px,1.25,pz,g));
  const aw=bx(3.3,.08,2.6,col,0,2.5,-.6,g);aw.rotation.x=-.12;bx(3.3,.3,.04,col,0,2.32,.66,g);
  bx(2.8,1.7,.4,'#5a4030',0,.85,-1.75,g);for(let i=0;i<9;i++){if(i===2)continue;bx(i<5?.18:.22,i<5?.18:.26,i<5?.18:.22,['#b9a26b','#c8553a','#6fa3c4','#d8b26a','#8a9a4a'][i%5],-1.2+(i%5)*.6,i<5?1.15:1.86,i<5?.15:-1.6,g)}
  for(let i=0;i<3;i++)bx(.6,.45,.5,'#7b5a34',-1+i*.9,.22,.95,g);
  const c=Math.abs(Math.sin(yaw))>.5;solid6(x,z,c?.8:2.8,c?2.8:.8,y,1);
  return{x:x-Math.sin(yaw)*1.1,z:z-Math.cos(yaw)*1.1,yaw}}
function tree6(x,z,s){const y=terrainY(x,z);bx(.4*s,2.6*s,.4*s,'#4a3523',x,y+1.3*s,z,world,CYL);bx(3*s,2.6*s,3*s,'#3a4f2e',x,y+3.4*s,z,world,new T3.IcosahedronGeometry(.6,0));addTreeObj({x,z,y,r:.35*s,h:5*s,alive:true,rock:true})}
function cont6(type,x,z,y,w,h,d,col,extra){const m=bx(w,h,d,col,x,y+h/2,z,world);solid6(x,z,w,d,y,h);addCont(type,x,z,y,m,extra);return m}

// ---------- Places ----------
function buildVillage6(s,rng,colonia){const cx=s.x,cz=s.z;
  const slots=colonia?[[-15,-6,-1],[15,-6,1],[-15,10,-1],[15,10,1],[-15,24,-1]]:[[-15,-14,-1],[15,-14,1],[-15,2,-1],[15,2,1],[-15,18,-1],[15,18,1]];
  for(const [ox,oz,side] of slots){if(rng()<.12)continue;buildBuilding(rng,cx+ox,cz+oz,9+(rng()*2|0),9+(rng()*2|0),null,side)}
  const toRoad=Math.atan2(roadX(cz)-cx,0)>0?0:Math.PI;
  fence6(cx,cz,s.r+1.5,[toRoad,toRoad+Math.PI,Math.PI/2,-Math.PI/2]);
  const ex=cx+Math.cos(toRoad)*(s.r+4);sign6(L(PLACES6[s.id].n),ex,cz+3,toRoad===0?Math.PI/2:-Math.PI/2);
  tree6(cx-3,cz+4,1.1);const by=terrainY(cx+2,cz+4);bx(1.6,.45,.5,'#5a4630',cx+2.2,by+.4,cz+4,world);
  if(colonia){chapel6(cx,cz-25);npc6('ines',cx+2.4,cz-17.3,0);
    for(let i=0;i<6;i++){const gx=cx-8+(i%3)*2.2,gz=cz+28+(i<3?0:2);bx(1.6,.25,1.4,'#4a3a26',gx,terrainY(gx,gz)+.12,gz,world);for(let k=0;k<3;k++)bx(.25,.35,.25,'#4f7a2e',gx-.5+k*.5,terrainY(gx,gz)+.4,gz,world)}}
  else{const st=stall6(cx,cz-24,0,'#8a3a2a');npc6('elvira',st.x,st.z,0);
    const tx=cx+7,tz=cz+29,ty=terrainY(tx,tz);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bx(.25,7,.25,'#5a4a3a',tx+a*1.3,ty+3.5,tz+b*1.3,world));bx(3.6,2.6,3.6,'#7a6a58',tx,ty+8.2,tz,world,CYL);bx(4,.6,4,'#4a3a30',tx,ty+9.7,tz,world,CONE);solid6(tx,tz,3,3,ty,10);
    const wx=cx+6,wz=cz-6,wy=terrainY(wx,wz);bx(1.8,.8,1.8,'#6d6a62',wx,wy+.4,wz,world,CYL);bx(.12,1.8,.12,'#4a3a28',wx-.8,wy+.9,wz,world);bx(.12,1.8,.12,'#4a3a28',wx+.8,wy+.9,wz,world);bx(2,.12,.6,'#5a3a2e',wx,wy+1.85,wz,world);solid6(wx,wz,1.8,1.8,wy,.8)}}
function chapel6(x,z){const y=terrainY(x,z),w=8,d=12,H=4.6,c='#d8d0c0';const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2;
  const wall=(px,pz,sw,sd)=>{bx(sw,H,sd,c,px,y+H/2,pz,world);solid6(px,pz,sw,sd,y,H)};
  wall(x,z0,w,.35);wall(x0,z,.35,d);wall(x1,z,.35,d);wall(x0+1.5,z1,3,.35);wall(x1-1.5,z1,3,.35);bx(2,.8,.35,c,x,y+H-.4,z1,world);
  bx(w,.3,d,'#5a4a3e',x,y+.05,z,world);
  for(const sd of [-1,1]){const r=bx(w/2/Math.cos(.5)+.5,.25,d+.8,'#6a3a2a',x+sd*w/4,y+H+1.1,z,world);r.rotation.z=-sd*.5}
  bx(.3,2.4,d+.8,c,x,y+H+.9,z,world);bx(2,3.2,2,c,x,y+H+1.6,z1-1,world);bx(2.3,.25,2.3,'#6a3a2a',x,y+H+3.3,z1-1,world);
  bx(.15,1.3,.15,'#3a3020',x,y+H+4.1,z1-1,world);bx(.7,.15,.15,'#3a3020',x,y+H+4.3,z1-1,world);
  for(let i=0;i<4;i++)for(const sd of [-1,1]){bx(2.2,.5,.5,'#5a4030',x+sd*1.9,y+.25,z-2+i*2,world);solid6(x+sd*1.9,z-2+i*2,2.2,.5,y,.5)}
  bx(1.8,1,.8,'#e8e0d0',x,y+.5,z0+1.2,world);solid6(x,z0+1.2,1.8,.8,y,1);
  addCont('botiquin',x+2.6,z0+1,y,bx(.6,.8,.5,'#e6e6dc',x+2.6,y+.4,z0+1,world));addCont('alacena',x-2.6,z0+1,y,bx(.7,1.1,1.2,'#6b4a30',x-2.6,y+.55,z0+1,world))}
function buildStation6(s,rng){const cx=s.x,cz=s.z,rx=cx+6,y=terrainY(rx,cz);
  const L2=s.r+2;bx(.1,.14,L2*2,'#6e6e6a',rx-.75,y+.18,cz,world);bx(.1,.14,L2*2,'#6e6e6a',rx+.75,y+.18,cz,world);
  for(let k=-L2;k<L2;k+=1.4)bx(2.4,.1,.3,'#4a3a2a',rx,y+.06,cz+k,world);
  bx(4,.5,22,'#8a8478',rx-3.4,y+.25,cz,world);
  buildBuilding(rng,cx-6,cz,12,8,'estacion',-1);const b=buildings[buildings.length-1];
  cont6('escritorio',cx-9.5,cz-2.5,b.floor,1.2,.8,.6,'#5e4630',{bld:b});cont6('caja',cx-9.6,cz+2.6,b.floor,.8,.7,.8,'#7b5a34',{bld:b});
  bx(.06,1.1,1.6,'#1e2a22',cx+.2,b.floor+1.6,cz+2.2,world);notes6.push({frag:'caravana4',label:'Pizarrón',x:cx+.6,z:cz+2.2});
  for(const wz of [cz+16,cz-17]){const g=grp(rx,y,wz,world);bx(2.8,2.7,8,wz>cz?'#7a3a2a':'#4a5a6a',0,1.9,0,g);bx(3,.2,8.2,'#3a3a3a',0,3.3,0,g);[-3,-2,2,3].forEach(o=>bx(.8,.5,.8,'#161616',0,.4,o,g,CYL).rotation.z=Math.PI/2);solid6(rx,wz,2.8,8,y,3.3);
    cont6(wz>cz?'herramientas':'caja',rx-2,wz,y,.8,.7,.8,'#7b5a34')}
  const tx=cx-6,tz=cz-14,ty=terrainY(tx,tz);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>bx(.2,5,.2,'#4a3a30',tx+a*1,ty+2.5,tz+c*1,world));bx(2.8,2.2,2.8,'#5a5a56',tx,ty+6,tz,world,CYL);solid6(tx,tz,2.4,2.4,ty,7);
  const wy=terrainY(cx-6,cz-5.4),wb=grp(cx-6,wy,cz-5.4,world);bx(2.2,.9,.9,'#5e4a33',0,.45,0,wb);bx(.5,.3,.3,'#8d918f',-.5,1,0,wb);bx(.3,.5,.3,'#b0402a',.6,1.1,0,wb);solid6(cx-6,cz-5.4,2.2,.9,wy,1);
  npc6('tano',cx-6,cz-6.6,Math.PI)}
function buildFarm6(s,rng){const cx=s.x,cz=s.z;
  buildBuilding(rng,cx-12,cz-8,10,9,null,-1);
  const bx0=cx+10,bz0=cz+4,y=terrainY(bx0,bz0),w=10,d=14,H=5,c='#7a3a2a';
  const wall=(px,pz,sw,sd)=>{bx(sw,H,sd,c,px,y+H/2,pz,world);solid6(px,pz,sw,sd,y,H)};
  wall(bx0,bz0-d/2,w,.3);wall(bx0,bz0+d/2,w,.3);wall(bx0+w/2,bz0,.3,d);wall(bx0-w/2,bz0-4.5,.3,5);wall(bx0-w/2,bz0+4.5,.3,5);bx(.3,1.2,4,c,bx0-w/2,y+H-.6,bz0,world);
  for(const sd of [-1,1]){const r=bx(w/2/Math.cos(.55)+.4,.25,d+.6,'#4a4a48',bx0+sd*w/4,y+H+1.3,bz0,world);r.rotation.z=-sd*.55}
  bx(.3,2.6,d+.6,c,bx0,y+H+1.1,bz0,world);
  cont6('herramientas',bx0+3.6,bz0-5,y,1.2,.9,.8,'#5e4a33');cont6('caja',bx0+3.8,bz0+5,y,.8,.7,.8,'#7b5a34');cont6('caja',bx0+2.4,bz0+5.2,y,.8,.7,.8,'#7b5a34');
  for(let i=0;i<5;i++)bx(1.1,.9,1.1,'#c8b060',bx0+1,y+.45,bz0-2+i*1.15,world);
  const sx=cx+10,sz=cz-12,sy=terrainY(sx,sz);bx(4,9,4,'#9a9a92',sx,sy+4.5,sz,world,CYL);bx(4.4,1.6,4.4,'#7a7a72',sx,sy+9.8,sz,world,CONE);solid6(sx,sz,3.6,3.6,sy,10.5);
  const mx=cx-14,mz=cz+14,my=terrainY(mx,mz);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c2])=>{const l=bx(.18,8.4,.18,'#7a7a74',mx+a*.9,my+4.1,mz+c2*.9,world);l.rotation.z=-a*.08;l.rotation.x=c2*.08});
  for(let k=1;k<4;k++)bx(1.9-k*.35,.08,.08,'#7a7a74',mx,my+k*2,mz+.9-k*.15,world);solid6(mx,mz,1.8,1.8,my,8);
  anim6.push({kind:'mill',x:mx,y:my+8.6,z:mz+.4});
  for(let i=0;i<9;i++){const fx=cx-6+i*2.4;for(const fz of [cz+22,cz+32]){const fy=terrainY(fx,fz);bx(.16,1.2,.16,'#6a5238',fx,fy+.6,fz,world);if(i<8){bx(2.4,.1,.08,'#6a5238',fx+1.2,fy+.5,fz,world);bx(2.4,.1,.08,'#6a5238',fx+1.2,fy+1,fz,world)}}}
  for(let k=0;k<4;k++){const fz=cz+22+k*2.5,fx=cx-6;bx(.16,1.2,.16,'#6a5238',fx,terrainY(fx,fz)+.6,fz,world)}
  const st=stall6(cx-1,cz-3,Math.PI/2,'#5a7a3a');npc6('benito',st.x,st.z,Math.PI/2)}
function buildAntenna6(s){const cx=s.x,cz=s.z,y=terrainY(cx,cz);const H=24,n=8;
  for(let k=0;k<n;k++){const y0=k*H/n,hw=2-1.55*(k+.5)/n,hw2=2-1.55*(k+1)/n;
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])bx(.16,H/n+.05,.16,'#b8b8b0',cx+a*hw,y+y0+H/n/2,cz+b*hw,world);
    for(const sd of [-1,1]){bx(2*hw2,.08,.08,'#b8b8b0',cx,y+y0+H/n,cz+sd*hw2,world);bx(.08,.08,2*hw2,'#b8b8b0',cx+sd*hw2,y+y0+H/n,cz,world);
      const dg=bx(.06,Math.hypot(2*hw,H/n),.06,'#a8a8a0',cx,y+y0+H/n/2,cz+sd*hw,world);dg.rotation.z=Math.atan2(2*hw,H/n)*sd}}
  bx(.1,3,.1,'#b8b8b0',cx,y+H+1.5,cz,world);solid6(cx,cz,4,4,y,H);
  anim6.push({kind:'beacon',x:cx,y:y+H+3.1,z:cz});
  const hx=cx+6,hz=cz+3,hy=terrainY(hx,hz);bx(4,2.6,.2,'#8a8478',hx,hy+1.3,hz-1.5,world);bx(.2,2.6,3,'#8a8478',hx-2,hy+1.3,hz,world);bx(.2,2.6,3,'#8a8478',hx+2,hy+1.3,hz,world);bx(4.6,.2,3.8,'#4a4a48',hx,hy+2.7,hz+.2,world);
  solid6(hx,hz-1.5,4,.2,hy,2.6);solid6(hx-2,hz,.2,3,hy,2.6);solid6(hx+2,hz,.2,3,hy,2.6);
  bx(2.4,.8,.8,'#5e4630',hx,hy+.4,hz-.8,world);solid6(hx,hz-.8,2.4,.8,hy,.8);bx(.6,.4,.4,'#3a3a34',hx-.6,hy+1,hz-.9,world);bx(.4,.5,.35,'#2a3a2a',hx+.4,hy+1.05,hz-.9,world);
  cont6('caja',hx+1.4,hz+.6,hy,.8,.7,.8,'#7b5a34');cont6('escritorio',hx-1.4,hz+.6,hy,.6,.8,1,'#5e4630');
  const gx=cx-4,gz=cz+4,gy=terrainY(gx,gz);bx(1.2,.9,.8,'#6a5a2a',gx,gy+.45,gz,world);solid6(gx,gz,1.2,.8,gy,.9);
  npc6('lucho',hx,hz+.6,0)}
function buildCamp6(s,rng){const cx=s.x,cz=s.z;const tent=new T3.ConeGeometry(.5,1,4);
  for(let i=0;i<4;i++){const a=i/4*6.283+.4,tx=cx+Math.cos(a)*8,tz=cz+Math.sin(a)*8,ty=terrainY(tx,tz);const t=bx(3.4,2.4,3.4,['#5a6a4a','#7a6a4a','#4a5a5a','#6a5a3a'][i],tx,ty+1.2,tz,world,tent);t.rotation.y=Math.PI/4+a;solid6(tx,tz,2.4,2.4,ty,2.4)}
  const fy=terrainY(cx,cz);for(let i=0;i<8;i++){const a=i/8*6.283;bx(.3,.25,.3,'#5a5550',cx+Math.cos(a)*.7,fy+.12,cz+Math.sin(a)*.7,world)}
  bx(.3,.6,.3,'#3a2a1a',cx,fy+.1,cz,world);anim6.push({kind:'fire',x:cx,y:fy,z:cz});
  for(const [ox,oz,ry] of [[2.6,0,0],[-2.6,0,0],[0,2.6,Math.PI/2]]){const l=bx(.4,2.2,.4,'#5a4030',cx+ox,fy+.25,cz+oz,world,CYL);l.rotation.set(Math.PI/2,ry,0);if(!ry)l.rotation.set(Math.PI/2,0,0);else l.rotation.set(0,0,Math.PI/2)}
  const rx=cx-5,rz=cz-4,ry2=terrainY(rx,rz);bx(.12,2,.12,'#4a3a28',rx-1.4,ry2+1,rz,world);bx(.12,2,.12,'#4a3a28',rx+1.4,ry2+1,rz,world);bx(3,.1,.1,'#4a3a28',rx,ry2+1.9,rz,world);
  for(let i=0;i<3;i++)bx(.7,1.1,.05,'#8c6a45',rx-.9+i*.9,ry2+1.3,rz,world);
  cont6('caja',cx+4.5,cz-3.5,terrainY(cx+4.5,cz-3.5),.8,.7,.8,'#7b5a34');cont6('caja',cx-3.8,cz+4.2,terrainY(cx-3.8,cz+4.2),.8,.7,.8,'#7b5a34');
  npc6('rufino',cx+2.2,cz+1.6,-2.2)}
function buildTerminal6(s,rng){const cx=s.x,cz=s.z;const side=cx>roadX(cz)?1:-1,y=terrainY(cx,cz);
  bx(8,.25,22,'#8a8478',cx,y+.12,cz,world);
  for(const oz of [-9,-3,3,9])for(const ox of [-2.5,2.5])bx(.18,3.2,.18,'#5a5a56',cx+ox,y+1.6,cz+oz,world);bx(6.2,.2,20,'#4a5a5a',cx,y+3.25,cz,world);
  for(const oz of [-6,0,6]){bx(2.4,.45,.6,'#6a5238',cx+side*1.8,y+.45,cz+oz,world);solid6(cx+side*1.8,cz+oz,2.4,.6,y,.5)}
  const bx0=cx+side*1.5,bz0=cz+13,c='#7a7468';bx(3.2,2.8,.2,c,bx0,y+1.4,bz0+1.5,world);bx(.2,2.8,3,c,bx0-1.5,y+1.4,bz0,world);bx(.2,2.8,3,c,bx0+1.5,y+1.4,bz0,world);bx(3.2,1.1,.2,c,bx0,y+.55,bz0-1.5,world);bx(3.2,.6,.2,c,bx0,y+2.5,bz0-1.5,world);bx(3.6,.2,3.6,'#3d3a36',bx0,y+2.9,bz0,world);
  solid6(bx0,bz0,3.2,3.2,y,2.8);notes6.push({frag:'caravana2',label:'Lista de pasajeros',x:bx0,z:bz0-2.1});
  const t=signTexture(L('Terminal').toUpperCase());const sg=new T3.Mesh(new T3.PlaneGeometry(4,1),new T3.MeshBasicMaterial({map:t,color:0xa08a6a}));sg.position.set(cx,y+3.9,cz-10.2);sg.rotation.y=Math.PI;world.add(sg);
  cont6('kiosco',bx0+side*-.6,bz0+.6,y,1,.9,.7,'#6a5a48');
  const st=stall6(cx-side*.2,cz-14,0,'#3a4a6a');npc6('marta',st.x,st.z,0);
  s.bus=[cx-side*7.5,cz,Math.atan(roadX(cz+1)-roadX(cz))+(side>0?0:Math.PI)]}
function buildTower6(s){const cx=s.x,cz=s.z,y=terrainY(cx,cz),H=6.5;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bx(.22,H+1.2,.22,'#5a4630',cx+a*1.4,y+(H+1.2)/2,cz+b*1.4,world));
  bx(3.4,.2,3.4,'#6a5238',cx,y+H,cz,world);for(const sd of [-1,1]){bx(3.4,.1,.1,'#5a4630',cx,y+H+1,cz+sd*1.65,world);bx(.1,.1,3.4,'#5a4630',cx+sd*1.65,y+H+1,cz,world)}
  for(let k=1;k<4;k++){const d=bx(.1,Math.hypot(2.8,H/3),.1,'#5a4630',cx,y+(k-.5)*H/3,cz+1.4,world);d.rotation.z=(k%2?1:-1)*Math.atan2(2.8,H/3)}
  bx(.1,H,.1,'#4a3a28',cx-.35,y+H/2,cz-1.6,world);bx(.1,H,.1,'#4a3a28',cx+.35,y+H/2,cz-1.6,world);for(let k=0;k<12;k++)bx(.7,.06,.08,'#4a3a28',cx,y+.4+k*.52,cz-1.6,world);
  bx(2.6,.6,2.6,'#4a3a30',cx,y+H+2.1,cz,world,CONE);solid6(cx,cz,3,3,y,H);
  lookout6={x:cx,z:cz-2.2}}
function buildCemetery6(s,rng){const cx=s.x,cz=s.z,w=22,d=16;
  const wall=(x,z,sw,sd)=>{const y=terrainY(x,z);bx(sw,.8,sd,'#8a8478',x,y+.4,z,world);solid6(x,z,sw,sd,y,.8)};
  wall(cx,cz-d/2,w,.4);wall(cx-w/2,cz,.4,d);wall(cx+w/2,cz,.4,d);wall(cx-6.5,cz+d/2,9,.4);wall(cx+6.5,cz+d/2,9,.4);
  for(let r=0;r<3;r++)for(let k=0;k<6;k++){if(rng()<.2)continue;const x=cx-8+k*3.2,z=cz-5+r*4,y=terrainY(x,z);
    if(rng()<.5){bx(.14,1.1,.14,'#5a4a3a',x,y+.55,z,world);bx(.6,.12,.12,'#5a4a3a',x,y+.8,z,world)}else{bx(.7,.9,.2,'#8a8a82',x,y+.45,z,world)}bx(.8,.15,1.6,'#5a4a36',x,y+.07,z+.9,world)}
  const gx=cx,gz=cz+5.5,gy=terrainY(gx,gz);bx(.16,1.3,.16,'#6a5238',gx,gy+.65,gz,world);bx(.7,.14,.14,'#6a5238',gx,gy+.95,gz,world);bx(.9,.3,1.8,'#4a3a26',gx,gy+.15,gz+1,world);
  for(let i=0;i<5;i++)bx(.1,.12,.1,['#c8553a','#e0c060','#d8d0e0'][i%3],gx-.3+i*.15,gy+.36,gz+.6,world);bx(.05,.4,.05,'#e8a0b0',gx+.09,gy+.9,gz+.09,world);
  notes6.push({frag:'ibarra2',label:'Tumba nueva',x:gx,z:gz+1.8});
  tree6(cx+8,cz-4,1.3);tree6(cx-9,cz+3,1)}
function buildPlaces6(){const rng=mulberry32((seed6^0x91ace)>>>0);npcs6=[];notes6=[];anim6=[];lookout6=null;
  for(const s of sitesGet6()){try{
    if(s.kind==='village')buildVillage6(s,rng,false);else if(s.kind==='colonia')buildVillage6(s,rng,true);
    else if(s.kind==='station')buildStation6(s,rng);else if(s.kind==='farm')buildFarm6(s,rng);else if(s.kind==='antenna')buildAntenna6(s);
    else if(s.kind==='camp')buildCamp6(s,rng);else if(s.kind==='terminal')buildTerminal6(s,rng);else if(s.kind==='tower')buildTower6(s);else if(s.kind==='cemetery')buildCemetery6(s,rng)}catch(e){console.error('place',s.id,e)}}
  if(altar)notes6.push({frag:'piedra2',label:'Libreta del geólogo',x:altar.x+5.5,z:altar.z+1.5,book:true})}

// ---------- NPCs (built after static merging so they can move) ----------
function npc6(id,x,z,yaw){npcs6.push({id,x,z,yaw,baseYaw:yaw,mesh:null,ph:R()*6})}
function npcModel6(id){const d=NPC6[id],[cl,sk,pa]=d.look;const m=humanoid(cl,sk,pa,false);const b=m.userData.root,u=m.userData;
  bx(.05,.05,.02,'#1a1a1a',-.07,1.71,.155,b);bx(.05,.05,.02,'#1a1a1a',.07,1.71,.155,b);bx(.1,.025,.02,'#7a4a40',0,1.6,.155,b);
  u.arms.forEach(a=>bx(.12,.1,.12,sk,0,-.69,0,a));u.legs.forEach(l=>bx(.21,.1,.3,'#2a2018',0,-.79,.04,l));
  const a=d.acc;
  if(a==='shawl'){bx(.58,.32,.34,'#5a3a4a',0,1.36,0,b);bx(.33,.12,.33,'#b8b4aa',0,1.86,-.02,b);bx(.14,.14,.14,'#b8b4aa',0,1.9,-.15,b)}
  else if(a==='veil'){bx(.36,.4,.36,'#1e1e26',0,1.74,-.03,b);bx(.34,.05,.02,'#e8e8e0',0,1.8,.165,b);bx(.06,.06,.02,'#c8b060',0,1.32,.15,b)}
  else if(a==='cap'){bx(.33,.1,.33,'#2a3a6a',0,1.87,0,b);bx(.3,.03,.16,'#2a3a6a',0,1.83,.2,b);bx(.06,.6,.02,'#2a3440',-.15,1.2,.145,b);bx(.06,.6,.02,'#2a3440',.15,1.2,.145,b)}
  else if(a==='phones'){bx(.07,.14,.14,'#222',-.18,1.7,0,b);bx(.07,.14,.14,'#222',.18,1.7,0,b);bx(.38,.04,.06,'#222',0,1.87,0,b);bx(.28,.06,.02,'#333',0,1.73,.16,b);bx(.3,.1,.31,'#3a2a20',0,1.85,-.02,b)}
  else if(a==='hat'){bx(.6,.04,.6,'#5a4228',0,1.84,0,b);bx(.33,.16,.33,'#5a4228',0,1.93,0,b);bx(.3,.08,.02,'#4a3a2a',0,1.6,.155,b);bx(.08,.7,.06,'#3a2a1a',.12,1.15,-.17,b).rotation.z=.6}
  else if(a==='beard'){bx(.56,.04,.56,'#8a7a5a',0,1.84,0,b);bx(.33,.14,.33,'#8a7a5a',0,1.92,0,b);bx(.28,.16,.06,'#d8d4cc',0,1.57,.15,b)}
  else if(a==='scarf'){bx(.34,.42,.12,'#7a3a22',0,1.58,-.15,b);bx(.33,.1,.33,'#7a3a22',0,1.85,-.01,b);bx(.42,.12,.34,'#c8a03a',0,1.46,0,b)}
  try{mergeSiblings(m,protectSet(m))}catch(e){}
  m.traverse(o=>{if(o.isMesh)o.castShadow=true});return m}
function spawnNpcs6(){for(const n of npcs6){n.mesh=npcModel6(n.id);n.mesh.position.set(n.x,groundY(n.x,n.z),n.z);n.mesh.rotation.y=n.yaw;world.add(n.mesh)}}
function updateNpcs6(dt){for(const n of npcs6){if(!n.mesh)continue;const dx=P.x-n.x,dz=P.z-n.z;if(Math.abs(dx)>70||Math.abs(dz)>70){n.mesh.visible=false;continue}n.mesh.visible=true;
  const d=Math.hypot(dx,dz),u=n.mesh.userData,t=time+n.ph;const want=d<9?Math.atan2(dx,dz):n.baseYaw;n.yaw+=clamp(angDiff(n.yaw,want),-2.5*dt,2.5*dt);n.mesh.rotation.y=n.yaw;
  u.root.position.y=Math.sin(t*1.7)*.008;u.root.rotation.x=Math.sin(t*.6)*.02;u.root.rotation.z=Math.sin(t*.43)*.015;
  const talk=d<4?1:0;u.arms[0].rotation.x=-.08+Math.sin(t*1.1)*.05-talk*(.35+Math.sin(t*3)*.25);u.arms[0].rotation.z=-.06;u.arms[1].rotation.x=-.05+Math.sin(t*1.3+1)*.05;u.arms[1].rotation.z=.06;
  u.legs[0].rotation.x=0;u.legs[1].rotation.x=0}}

// ---------- Animated props ----------
let beacon6Mat=null,fire6Mat=null;
function spawnAnim6(){beacon6Mat=new T3.MeshBasicMaterial({color:0xff3020});fire6Mat=new T3.MeshBasicMaterial({color:0xf08a28});
  for(const a of anim6){if(a.kind==='mill'){const g=grp(a.x,a.y,a.z,world);bx(.5,.5,.6,'#6a6a64',0,0,-.3,g);bx(.08,.08,2.2,'#6a6a64',0,0,-1.2,g);bx(.05,1.4,1.2,'#8a8a84',0,0,-2.2,g);
      const hub=grp(0,0,.1,g);for(let i=0;i<12;i++){const bl=bx(.32,1.9,.04,'#c8c8c0',0,0,0,hub);bl.geometry=new T3.BoxGeometry(1,1,1).translate(0,.55,0);bl.rotation.z=i/12*6.283}a.obj=hub}
    else if(a.kind==='beacon'){const m=bx(.35,.35,.35,beacon6Mat,a.x,a.y,a.z,world,new T3.SphereGeometry(.5,8,6));a.obj=m}
    else if(a.kind==='fire'){const m=bx(.55,.7,.55,fire6Mat,a.x,a.y+.35,a.z,world,CONE);a.obj=m}}}
function updateAnim6(dt){for(const a of anim6){if(!a.obj)continue;if(a.kind==='mill')a.obj.rotation.z+=dt*(1.2+Math.sin(time*.2)*.5);
  else if(a.kind==='beacon')a.obj.visible=(time%2)<1;else if(a.kind==='fire'){const f=1+Math.sin(time*13)*.12+Math.sin(time*7.3)*.1;a.obj.scale.set(.55*f,.7*(2-f),.55*f);a.obj.rotation.y+=dt*2}}}

// ---------- Vehicles: four new body styles ----------
function buildVehicle6(k,x,z,yaw){
  const d=VEH[k],L2=d.len/2,W2=d.wid/2,g=grp(0,0,0,world),body=grp(0,0,0,g);
  const glass=new T3.MeshLambertMaterial({color:0x2a3a40,transparent:true,opacity:.7}),dark='#2a2a2a',hl=new T3.MeshBasicMaterial({color:0xfff1c0}),tl=new T3.MeshBasicMaterial({color:0x8a1a14});
  const cz=d.cabZ;let cab,wsh,dash;const boxes=[];const cargo=grp(0,0,0,body);let wr=.8,by=.95;
  if(d.style==='sedan'){wr=.66;
    bx(d.wid,.5,d.len,d.col,0,.62,0,body);bx(d.wid-.06,.12,1.2,d.col,0,.92,L2-.62,body);bx(d.wid-.06,.1,.9,d.col,0,.92,-L2+.48,body);
    cab=bx(d.wid-.14,.6,2.1,d.col,0,1.2,cz,body);wsh=bx(d.wid-.24,.5,.06,glass,0,1.18,cz+1.08,body);
    bx(.04,.38,1.8,glass,-W2+.06,1.2,cz,body);bx(.04,.38,1.8,glass,W2-.06,1.2,cz,body);bx(d.wid-.24,.4,.06,glass,0,1.18,cz-1.08,body);
    bx(d.wid+.04,.18,.2,'#3a3a3a',0,.5,L2+.02,body);bx(d.wid+.04,.18,.2,'#3a3a3a',0,.5,-L2-.02,body);
    bx(.3,.12,.04,hl,-W2+.3,.78,L2+.03,body);bx(.3,.12,.04,hl,W2-.3,.78,L2+.03,body);bx(.3,.12,.04,tl,-W2+.3,.78,-L2-.03,body);bx(.3,.12,.04,tl,W2-.3,.78,-L2-.03,body);
    dash=bx(d.wid-.3,.2,.4,dark,0,1.02,cz+.82,body)}
  else if(d.style==='jeep'){wr=.86;by=1.05;
    bx(d.wid,.6,d.len,d.col,0,1.0,0,body);bx(d.wid-.04,.12,1.3,d.col,0,1.36,L2-.7,body);
    cab=bx(d.wid-.1,.8,1.5,d.col,0,1.75,cz,body);wsh=bx(d.wid-.2,.6,.06,glass,0,1.78,cz+.77,body);
    bx(.08,.9,.08,dark,-W2+.12,1.75,cz-1.5,body);bx(.08,.9,.08,dark,W2-.12,1.75,cz-1.5,body);bx(d.wid-.2,.08,.08,dark,0,2.2,cz-1.5,body);
    bx(d.wid,.4,.1,d.col,0,1.5,-L2+.05,body);bx(.1,.4,1.9,d.col,-W2+.05,1.5,-L2+1,body);bx(.1,.4,1.9,d.col,W2-.05,1.5,-L2+1,body);
    const sp=bx(.75,.25,.75,'#161616',0,1.25,-L2-.15,body,CYL);sp.rotation.x=Math.PI/2;
    bx(d.wid-.3,.12,.12,'#3a3a3a',0,.95,L2+.25,body);bx(d.wid-.3,.12,.12,'#3a3a3a',0,1.25,L2+.25,body);
    bx(.25,.25,.04,hl,-W2+.35,1.2,L2+.03,body);bx(.25,.25,.04,hl,W2-.35,1.2,L2+.03,body);
    dash=bx(d.wid-.25,.22,.4,dark,0,1.48,cz+.55,body);cargo.position.y=1.6;
    for(let i=0;i<3;i++){const m=bx(.5,.4,.5,'#7b5a34',-.5+i*.5,0,-L2+1,cargo);m.visible=false;boxes.push(m)}}
  else if(d.style==='amb'){
    bx(d.wid,.55,d.len,'#d8d6cc',0,.95,0,body);cab=bx(d.wid-.1,1.05,1.9,d.col,0,1.75,cz,body);wsh=bx(d.wid-.2,.7,.08,glass,0,1.95,cz+.96,body);
    const bedL=d.len-2.1,bedZ=cz-.95-bedL/2;bx(d.wid,2.1,bedL,d.col,0,2.25,bedZ,body);
    for(const sd of [-1,1]){bx(.04,.3,bedL,'#b02a22',sd*(W2+.01),1.9,bedZ,body);bx(.05,.9,.3,'#b02a22',sd*(W2+.02),2.6,bedZ,body);bx(.05,.3,.9,'#b02a22',sd*(W2+.02),2.6,bedZ,body)}
    bx(1.2,.18,.35,new T3.MeshBasicMaterial({color:0xc02020}),-.35,2.36,cz-.6,body);bx(.6,.18,.35,new T3.MeshBasicMaterial({color:0x2050c0}),.45,2.36,cz-.6,body);
    bx(d.wid-.2,.3,.25,dark,0,.85,L2+.05,body);bx(.35,.18,.05,hl,-W2+.35,1.05,L2+.02,body);bx(.35,.18,.05,hl,W2-.35,1.05,L2+.02,body);
    bx(.25,.25,.04,tl,-W2+.2,1.4,-L2-.01,body);bx(.25,.25,.04,tl,W2-.2,1.4,-L2-.01,body);
    dash=bx(d.wid-.2,.25,.5,dark,0,1.35,cz+.75,body)}
  else{wr=1.05;by=1.3; // bus
    bx(d.wid,2.4,d.len,d.col,0,1.95,0,body);bx(d.wid+.02,.5,d.len+.02,'#e8e4d8',0,1.05,0,body);bx(d.wid+.02,.2,d.len+.02,'#e8e4d8',0,3.05,0,body);
    for(const sd of [-1,1])bx(.04,.85,d.len-2.2,glass,sd*(W2+.01),2.35,-.6,body);
    cab=bx(d.wid-.1,.4,.4,d.col,0,3.3,L2-.4,body);wsh=bx(d.wid-.2,1.2,.08,glass,0,2.35,L2+.02,body);
    bx(d.wid-.2,.4,.2,dark,0,.9,L2+.05,body);bx(.35,.2,.05,hl,-W2+.35,1.2,L2+.06,body);bx(.35,.2,.05,hl,W2-.35,1.2,L2+.06,body);bx(.3,.3,.04,tl,-W2+.25,1.3,-L2-.02,body);bx(.3,.3,.04,tl,W2-.25,1.3,-L2-.02,body);
    const sg=new T3.Mesh(new T3.PlaneGeometry(1.8,.35),new T3.MeshBasicMaterial({map:signTexture(L('Puerto Escondido').toUpperCase(),'#111','#f0b030')}));sg.position.set(0,3.0,L2+.07);body.add(sg);
    dash=bx(d.wid-.3,.3,.5,dark,0,1.65,cz+.4,body)}
  dash.visible=false;
  const wheels=[];const wz=d.style==='bus'?d.len*.34:d.len*.31;
  [[-W2-.05,wz],[W2+.05,wz],[-W2-.05,-wz],[W2+.05,-wz]].forEach(([wx,wzz])=>{const wg=grp(wx,wr/2,wzz,g);const w=bx(wr,d.style==='jeep'?.45:.32,wr,'#161616',0,0,0,wg,CYL);w.rotation.z=Math.PI/2;bx(wr*.5,.06,wr*.5,'#8a8a84',(wx<0?-1:1)*.17,0,0,wg,CYL).rotation.z=Math.PI/2;wheels.push(wg)});
  return{k,def:d,cabin:[cab,wsh],dash,group:g,body,wheels,cargoBoxes:boxes,x,z,yaw,speed:0,steer:0,y:2,lookYaw:0,lookPitch:0}}
function vehSpot6(k,rng){
  const free=(x,z)=>terrainY(x,z)>WATER_Y+.6&&!circleBlocked(x,z,2.6,'t')&&!vehicles.some(v=>Math.hypot(v.x-x,v.z-z)<7);
  const around=(x,z,yaw)=>{for(let r=0;r<30;r+=1.5)for(let i=0;i<8;i++){const a=i/8*6.283;const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(free(px,pz))return[px,pz,yaw]}return[x,z,yaw]};
  const road=(z0,z1)=>{for(let i=0;i<80;i++){const z=z0+rng()*(z1-z0);const x=roadX(z)+(rng()<.5?-1:1)*7;if(free(x,z))return[x,z,(rng()<.5?0:Math.PI)+Math.atan(roadX(z+1)-roadX(z))]}return around(roadX(z0)+8,z0,0)};
  if(k==='sedan')return road(TOWN_Z-70,TOWN_Z+70);
  if(k==='jeep'){const s=site6('estancia');return s?around(s.x+2,s.z-17,rng()*6.28):road(-200,-100)}
  if(k==='ambulancia'){const s=site6('colonia');return s?around(s.x+8,s.z-30,Math.PI/2):road(-100,-60)}
  const s=site6('terminal');if(s&&s.bus){const [x,z,yaw]=s.bus;return free(x,z)?[x,z,yaw]:around(x,z,yaw)}return road(300,400)}
// Lairs and the Green Stone avoid the villages: while they pick a site, ground near a place reads as unusable.
function awayFromSites6(fn){return function(rng){const tY=terrainY;terrainY=function(x,z){if(sites6&&sites6.some(s=>Math.hypot(x-s.x,z-s.z)<s.r+75))return 99;return tY(x,z)};
  try{fn(rng)}finally{terrainY=tY}
  const fix=o=>{if(o&&o.y>90){o.y=tY(o.x,o.z);if(o.g)o.g.position.y=o.y}};fix(altar);(lairs||[]).forEach(fix)}}
buildAltar=awayFromSites6(buildAltar);buildLairs=awayFromSites6(buildLairs);
const _buildVehicles6=buildVehicles;
buildVehicles=function(rng){
  try{buildPlaces6()}catch(e){console.error('places',e)}
  const extra={};for(const k of NEWV6){extra[k]=VEH[k];delete VEH[k]}
  try{_buildVehicles6(rng)}finally{Object.assign(VEH,extra)}
  const r2=mulberry32((seed6^0xca12)>>>0);
  for(const k of NEWV6){try{const sp=vehSpot6(k,r2);const v=buildVehicle6(k,...sp);v.spot=sp;vehicles.push(v)}catch(e){console.error('veh6',k,e)}}};
const _initVehicles6=initVehicles;initVehicles=function(){_initVehicles6();
  const seed={ambulancia:{medicina:2,venda:4,desinfectante:2,antibioticos:1},sedan:{lata:3,agua:2,galletitas:2},colectivo:{tela:6,joyas:1,mochila_e:1},jeep:{cuerda:2,combustible:1}};
  for(const k of NEWV6){const st=S.veh[k];if(st&&!st.init6){st.init6=true;Object.assign(st.cargo,seed[k]||{})}}};

// ---------- Cargo: open any vehicle from behind ----------
let cargoV6=null;
function openCargo6(v){cargoV6=v;gstate='loot';unlock();sfx('door');$('lootPutAll').hidden=false;renderCargo6();show('loot')}
function renderCargo6(){const v=cargoV6,c=v.st.cargo;
  $('lootName').textContent=L('Carga: {v}',{v:vName(v)});
  $('lootKg').textContent=`${L('Mochila')} ${kg(invKg())} / ${capKg()} kg · ${L('Caja {a}/{b} kg',{a:kg(kgOf(c)),b:vehCap(v)})}`;
  const mine=IK.filter(k=>S.inv[k]>0).map(k=>row(`<div>${ico(k)}${esc(nm(k))}</div><div class="num">×${S.inv[k]} · ${kg(ITEMS[k].w*S.inv[k])} kg</div><div class="acts">${btn('→','cput1',`data-k="${k}" aria-label="${esc(L('Guardar'))}"`)}${S.inv[k]>1?btn(L('Todo'),'cputk',`data-k="${k}"`):''}</div>`,'r3')).join('');
  const theirs=IK.filter(k=>c[k]>0).map(k=>row(`<div>${ico(k)}${esc(nm(k))}</div><div class="num">×${c[k]} · ${kg(ITEMS[k].w*c[k])} kg</div><div class="acts">${btn('←','ctake1',`data-k="${k}"`)}${c[k]>1?btn(L('Todo'),'ctakek',`data-k="${k}"`):''}</div>`,'r3')).join('');
  $('lootMine').innerHTML=mine||`<p class="note">${esc(L('La mochila está vacía.'))}</p>`;
  $('lootTheirs').innerHTML=theirs||`<p class="note">${esc(L('Vacío.'))}</p>`;
  $('lootMsg').textContent=lootMsg||L('Las armas y la munición van siempre con vos.');lootMsg=''}
function cargoPut6(k,q){const c=cargoV6.st.cargo;const left=addTo(c,vehCap(cargoV6),k,q);const got=q-left;S.inv[k]-=got;if(left)lootMsg=L('La caja está llena.');if(got)sfx('pickup')}
function cargoTake6(k,q){const c=cargoV6.st.cargo;const left=addInv(k,q);const got=q-left;c[k]-=got;if(left)lootMsg=L('No te entra más: llevás demasiado peso.');if(got)sfx('pickup')}
$('loot').addEventListener('click',e=>{if(!cargoV6)return;const b=e.target.closest('[data-a]');if(!b)return;e.stopImmediatePropagation();const a=b.dataset.a,k=b.dataset.k,c=cargoV6.st.cargo;
  if(a==='lootclose'){resume();return}
  if(a==='cput1')cargoPut6(k,1);if(a==='cputk')cargoPut6(k,S.inv[k]);
  if(a==='ctake1')cargoTake6(k,1);if(a==='ctakek')cargoTake6(k,c[k]);
  if(a==='putall')for(const kk of IK)if(S.inv[kk]>0)cargoPut6(kk,S.inv[kk]);
  if(a==='takeall')for(const kk of IK)if(c[kk]>0)cargoTake6(kk,c[kk]);
  renderCargo6()},true);
const _openLoot6=openLoot;openLoot=function(c){cargoV6=null;$('lootPutAll').hidden=true;_openLoot6(c)};

// ---------- Story state ----------
function story6(){if(!S.story)S.story={};const s=S.story;s.frags=s.frags||[];s.places=s.places||[];s.known=s.known||[];s.npc=s.npc||{};s.threads=s.threads||[];s.radio=s.radio||0;s.lookout=!!s.lookout;return s}
const npcSt6=id=>{const s=story6();return s.npc[id]||(s.npc[id]={talk:0,fav:0,met:false})};
function giveFrag6(id){const s=story6();if(!FRAGS6[id]||s.frags.includes(id))return false;s.frags.push(id);const th=FRAGS6[id].th;
  sfx('skill');gainXp(15);toast(L('Nuevo relato en tu diario: {t}',{t:L(THREADS6[th].n)})+(s.frags.length===1?' · '+L('Apretá J para leerlo.'):''),'#c9a24a',6);
  const all=Object.keys(FRAGS6).filter(f=>FRAGS6[f].th===th);if(all.every(f=>s.frags.includes(f))&&!s.threads.includes(th)){s.threads.push(th);const t=THREADS6[th];
    S.money+=t.money||0;if(t.rep)S.rep=Math.min(20,S.rep+t.rep);if(t.items)for(const [k,q] of Object.entries(t.items))S.stash[k]=(S.stash[k]||0)+q;
    setTimeout(()=>{sfx('goal');toast(L('Completaste el relato «{t}». Recompensa: ${m}.',{t:L(t.n),m:fmt(t.money||0)})+(t.items?' '+L('Te dejaron algo en el depósito.'):''),'#e3a33b',8)},1500)}
  if(s.frags.length===Object.keys(FRAGS6).length)setTimeout(()=>{toast(L('Conocés toda la historia. Leé el final en tu diario (J).'),'#e3a33b',9)},4000);
  return true}
function discover6(id,quiet){const s=story6();if(s.places.includes(id))return;s.places.push(id);if(!s.known.includes(id))s.known.push(id);if(quiet)return;sfx('goal');gainXp(10);toast(L('Descubriste: {p}',{p:L(PLACES6[id].n)}),'#c9a24a',4.5)}
function reveal6(id){const s=story6();if(s.known.includes(id)||s.places.includes(id))return false;s.known.push(id);return true}
let disc6T=0;
function updateStory6(dt){disc6T-=dt;if(disc6T>0)return;disc6T=.5;if(!sites6)return;for(const s of sites6){if(Math.abs(P.x-s.x)<s.r+25&&Math.abs(P.z-s.z)<s.r+25&&Math.hypot(P.x-s.x,P.z-s.z)<s.r+22)discover6(s.id)}}

// ---------- Interaction ----------
const _findInteract6=findInteract;
findInteract=function(){
  if(P.inTruck||!S.story)return _findInteract6();
  const px=P.x,pz=P.z,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  const look=(x,z,maxD)=>{const dx=x-px,dz=z-pz,d=Math.hypot(dx,dz);if(d>maxD)return false;if(d<1.2)return true;return (dx*fx+dz*fz)/d>.55};
  for(const n of npcs6){if(look(n.x,n.z,2.8)){const d=NPC6[n.id];return{label:L('E · Hablar con {n}',{n:L(d.n)}),sub:L(d.role)+' · '+L(PLACES6[d.place].n),act:()=>openNpc6(n)}}}
  for(const n of notes6){if(look(n.x,n.z,2.4)){const got=S.story.frags.includes(n.frag);return{label:L('E · Leer: {t}',{t:L(n.label)}),sub:got?L('Ya está en tu diario'):'',act:()=>{giveFrag6(n.frag);openDiario6(n.frag)}}}}
  if(lookout6&&look(lookout6.x,lookout6.z,2.6))return{label:L('Mantené E · Subir al mirador'),sub:S.story.lookout?L('Ya subiste'):L('Desde arriba se ve todo el valle'),hold:2,key:'lookout',type:'cook',act:climb6};
  for(const v of vehicles){const s=Math.sin(v.yaw),c=Math.cos(v.yaw),hl=v.def.len/2+.5;const rx=v.x-s*hl,rz=v.z-c*hl;
    if(Math.abs(px-rx)<3&&Math.abs(pz-rz)<3&&look(rx,rz,2.4)&&Math.hypot(px-rx,pz-rz)<Math.hypot(px-v.x,pz-v.z))
      return{label:L('E · Abrir carga: {v}',{v:vName(v)}),sub:L('Caja {a}/{b} kg',{a:kg(kgOf(v.st.cargo)),b:vehCap(v)}),act:()=>openCargo6(v)}}
  return _findInteract6()};
const _vehInteract6=vehInteract;vehInteract=function(look){
  for(const v of vehicles){if(look(v.x,v.z,v.def.len/2+1.6)){if(v.st.broken&&(S.inv.kit_motor||0)>0)return{label:L('Mantené E · Reparar con el kit: {v}',{v:vName(v)}),sub:L('Usa 1 kit de motor'),hold:3,key:'kit'+v.k,type:'fix',act:()=>{S.inv.kit_motor--;v.st.broken=false;sfx('build');gainXp(20);toast(L('Arreglaste: {v}. Ya podés manejarlo.',{v:vName(v)}),'#8fbb62',5)}};break}}
  const r=_vehInteract6(look);if(r&&r.act&&!r.hold)r.sub=(r.sub||'')+' · '+L('Por atrás: abrir carga');return r};
function climb6(){const s=story6();sfx('step');const R0=Math.floor((P.z+HALF)/10),C0=Math.floor((P.x+HALF)/10),rad=20;
  for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){if(i*i+j*j>rad*rad)continue;const x=C0+i,z=R0+j;if(x>=0&&z>=0&&x<EXW&&z<EXW)explored[z*EXW+x]=1}
  let n=0;for(const p of sites6||[])if(Math.hypot(p.x-P.x,p.z-P.z)<300&&reveal6(p.id))n++;
  toast(L('Desde arriba ves todo el valle.')+(n?' '+L('Marcaste {n} lugares nuevos en el mapa.',{n}):''),'#c9a24a',6);
  if(!s.lookout){s.lookout=true;gainXp(15)}giveFrag6('radio3')}

// ---------- NPC dialog ----------
let npcCur6=null,npcTab6='charla',npcLine6='',npcMsg6='';
function openNpc6(n){npcCur6=n;npcTab6='charla';const st=npcSt6(n.id);npcLine6=L(NPC6[n.id].hi);npcMsg6='';if(!st.met){st.met=true;gainXp(5)}
  gstate='npc';unlock();sfx('pickup');renderNpc6();show('npc')}
const nearVeh6=n=>vehNear(n.x,n.z,40);
const have6=(n,k)=>(S.inv[k]||0)+nearVeh6(n).reduce((s,v)=>s+(v.st.cargo[k]||0),0);
function take6(n,k,q){let left=q;const a=Math.min(left,S.inv[k]||0);S.inv[k]=(S.inv[k]||0)-a;left-=a;for(const v of nearVeh6(n)){if(left<=0)break;const b=Math.min(left,v.st.cargo[k]||0);v.st.cargo[k]-=b;left-=b}}
function give6(k,q){const left=addInv(k,q);if(left>0){const v=vehNear(P.x,P.z,40)[0];if(v)v.st.cargo[k]=(v.st.cargo[k]||0)+left;else S.stash[k]=(S.stash[k]||0)+left}}
function offerName6(key){if(key.startsWith('svc:'))return L(SVC6[key.slice(4)].n);if(key.startsWith('w:'))return wn(key.slice(2));if(key.startsWith('a:')){const [,a,q]=key.split(':');return `${an(a)} ×${q}`}return nm(key)}
function offerDesc6(key){if(key.startsWith('svc:'))return L(SVC6[key.slice(4)].d);if(key.startsWith('w:'))return L('Arma');if(key.startsWith('a:'))return L('Munición');const it=ITEMS[key];return L(CATS[it.cat])+(it.cap?' · +'+it.cap+' kg':'')+` · ${kg(it.w)} kg`}
function svc6(n,k){
  if(k==='mapa'){let c=0;for(const p of Object.keys(PLACES6))if(reveal6(p))c++;return c?L('Te marcó {n} lugares en el mapa.',{n:c}):false}
  if(k==='arreglo'){const v=vehNear(n.x,n.z,60).filter(v=>v.st.broken)[0];if(!v){npcMsg6=L('No hay ningún vehículo roto cerca.');return false}v.st.broken=false;return L('Arreglaste: {v}. Ya podés manejarlo.',{v:vName(v)})}
  if(k==='tanque'){const v=vehNear(n.x,n.z,60).filter(v=>v.st.fuel<99).sort((a,b)=>a.st.fuel-b.st.fuel)[0];if(!v){npcMsg6=L('No hay ningún vehículo cerca para cargar.');return false}v.st.fuel=100;return L('Tanque lleno: {v}.',{v:vName(v)})}
  if(k==='cura'){if(!S.wounds.length&&!(S.infect>0)&&S.hp>=maxHp()){npcMsg6=L('No tenés nada para curar.');return false}S.wounds.forEach(w=>{w.band=true;w.dis=true});S.infect=0;S.hp=Math.min(maxHp(),S.hp+50);return L('Te curaron las heridas.')}
  return false}
function buy6(n,i){const [key,p]=NPC6[n.id].sell[i];if(S.money<p){npcMsg6=L('No te alcanza la plata.');return}
  let ok=true,msg='';
  if(key.startsWith('svc:')){const r=svc6(n,key.slice(4));if(!r){if(!npcMsg6)npcMsg6=L('No hace falta ahora.');return}msg=r}
  else if(key.startsWith('w:')){const w=key.slice(2);if(ownsW(w)){npcMsg6=L('Ya tenés esa arma.');return}giveWeapon(w);msg=L('Compraste: {i}.',{i:wn(w)})}
  else if(key.startsWith('a:')){const [,a,q]=key.split(':');S.ammo[a]=(S.ammo[a]||0)+(+q);msg=L('Compraste: {i}.',{i:offerName6(key)})}
  else{give6(key,1);msg=L('Compraste: {i}.',{i:nm(key)})}
  if(ok){S.money-=p;sfx('coin');npcMsg6=msg}}
function sell6(n,k,all){const mult=NPC6[n.id].buy[k];if(!mult)return;const have=have6(n,k);if(!have)return;const q=all?have:1;const price=Math.max(1,Math.round(ITEMS[k].v*mult));take6(n,k,q);S.money+=price*q;S.stats.earned+=price*q;sfx('coin');npcMsg6=L('Vendiste {q} × {i} por ${m}.',{q,i:nm(k),m:fmt(price*q)})}
function favor6(n){const d=NPC6[n.id],st=npcSt6(n.id),f=d.favors[st.fav];if(!f)return;if(!Object.entries(f.need).every(([k,q])=>have6(n,k)>=q)){npcMsg6=L('Todavía te falta algo.');return}
  for(const [k,q] of Object.entries(f.need))take6(n,k,q);st.fav++;S.money+=f.pay||0;S.rep=Math.min(20,S.rep+.25);if(f.item)for(const [k,q] of Object.entries(f.item))give6(k,q);
  sfx('goal');gainXp(25);npcLine6=L(f.thanks);npcMsg6=L('Favor cumplido.')+(f.pay?' +$'+fmt(f.pay):'');if(f.frag&&giveFrag6(f.frag))npcLine6+=' '+L('(Nuevo relato en tu diario.)');npcTab6='charla'}
function talk6(n){const d=NPC6[n.id],st=npcSt6(n.id),ln=d.talk[st.talk%d.talk.length];st.talk++;npcMsg6='';
  if(ln.frag){npcLine6=L(FRAGS6[ln.frag].tx);giveFrag6(ln.frag)}else npcLine6=L(ln.txt);
  if(ln.reveal&&reveal6(ln.reveal))npcMsg6=L('Te marcó en el mapa: {p}.',{p:L(PLACES6[ln.reveal].n)})}
function renderNpc6(){const n=npcCur6,d=NPC6[n.id],st=npcSt6(n.id);
  $('npcRole').textContent=L(d.role)+' · '+L(PLACES6[d.place].n);$('npcName').textContent=L(d.n);$('npcMoney').textContent=`${L('Plata')} $${fmt(S.money)}`;
  const fav=d.favors[st.fav];document.querySelectorAll('#npcTabs button').forEach(b=>{b.classList.toggle('on',b.dataset.tab===npcTab6);if(b.dataset.tab==='favores')b.innerHTML=esc(L('Favores'))+(fav?'<span class="badge">1</span>':'')});
  let h='';const msg=npcMsg6?`<div class="banner">${esc(npcMsg6)}</div>`:'';
  if(npcTab6==='charla'){h=`<div class="item"><p class="say6">${esc(npcLine6)}</p></div><div class="btns6">${btn(L('Seguir charlando'),'talk','','primary')}</div>${msg}`}
  else if(npcTab6==='comprar'){h=msg+`<div class="list">${d.sell.map(([key,p],i)=>{const own=key.startsWith('w:')&&ownsW(key.slice(2));return `<div class="item ${own?'done':''}"><h3>${esc(offerName6(key))}</h3><p>${esc(offerDesc6(key))}</p><div class="meta"><span>$${fmt(p)}</span>${own?esc(L('Ya la tenés')):btn(L('Comprar'),'buy',`data-i="${i}" ${S.money<p?'disabled':''}`)}</div></div>`}).join('')}</div>`}
  else if(npcTab6==='vender'){const ks=Object.keys(d.buy).filter(k=>ITEMS[k]);h=msg+`<p class="note">${esc(L('Compra de tu mochila y de los vehículos estacionados cerca.'))}</p><div class="rows">${ks.map(k=>{const q=have6(n,k),pr=Math.max(1,Math.round(ITEMS[k].v*d.buy[k]));return row(`<div>${ico(k)}${esc(nm(k))}</div><div class="num">$${fmt(pr)} · ${esc(L('tenés {n}',{n:q}))}</div><div class="acts">${q?btn(L('Vender 1'),'sell1',`data-k="${k}"`)+(q>1?btn(L('Todo'),'sellall',`data-k="${k}"`):''):''}</div>`,'r3')}).join('')}</div>`}
  else{h=msg+(fav?`<div class="item"><p class="say6">${esc(L(fav.ask))}</p><div class="rows">${Object.entries(fav.need).map(([k,q])=>{const hv=have6(n,k);return row(`<div>${ico(k)}${esc(nm(k))}</div><div class="num" style="color:${hv>=q?'#8fbb62':'#cc7a5a'}">${Math.min(hv,q)} / ${q}</div><div></div>`,'r3')}).join('')}</div>
      <div class="meta"><span>${esc(L('Te da'))}: ${fav.pay?'$'+fmt(fav.pay):''}${fav.item?(fav.pay?' + ':'')+Object.entries(fav.item).map(([k,q])=>nm(k)+' ×'+q).join(', '):''}${fav.frag?' + '+esc(L('un relato')):''}</span>${btn(L('Entregar'),'favor','',Object.entries(fav.need).every(([k,q])=>have6(n,k)>=q)?'primary':'small')}</div></div>`
    :`<div class="item"><p class="say6">${esc(L('No necesito nada más. Gracias por todo.'))}</p></div>`)}
  $('npcBody').innerHTML=h;npcMsg6=''}
$('npc').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){npcTab6=t.dataset.tab;renderNpc6();return}const b=e.target.closest('[data-a]');if(!b||!npcCur6)return;const a=b.dataset.a;
  if(a==='npcclose'){resume();return}if(a==='talk')talk6(npcCur6);if(a==='buy')buy6(npcCur6,+b.dataset.i);if(a==='sell1')sell6(npcCur6,b.dataset.k,false);if(a==='sellall')sell6(npcCur6,b.dataset.k,true);if(a==='favor')favor6(npcCur6);renderNpc6()});

// ---------- Journal ----------
let diarioFocus6=null;
function openDiario6(focus){diarioFocus6=focus||null;gstate='diario';unlock();renderDiario6();show('diario')}
function renderDiario6(){const s=story6();const tot=Object.keys(FRAGS6).length;
  $('diarioCount').textContent=L('{a} de {b} relatos',{a:s.frags.length,b:tot});
  let h=diarioFocus6&&FRAGS6[diarioFocus6]?`<div class="banner">${esc(L(FRAGS6[diarioFocus6].tx))}</div>`:'';
  if(!s.frags.length)h+=`<p class="note">${esc(L('Todavía no sabés nada. Hablá con la gente de los pueblos y revisá los lugares de la zona: la historia se arma sola, en el orden que quieras.'))}</p>`;
  if(s.frags.length===tot)h+=`<div class="banner">${esc(L(EPILOGUE6.tx))}</div>`;
  h+=`<div class="list">${Object.entries(THREADS6).map(([th,t])=>{const fs=Object.keys(FRAGS6).filter(f=>FRAGS6[f].th===th);const got=fs.filter(f=>s.frags.includes(f)).length;
    return `<div class="item ${s.threads.includes(th)?'done6':''}"><h3>${esc(L(t.n))} <span class="cnt6">${got}/${fs.length}</span></h3><p>${esc(L(t.d))}</p>${fs.map(f=>s.frags.includes(f)?`<p class="frag6">${esc(L(FRAGS6[f].tx))}</p>`:`<p class="hint6">${esc(L(FRAGS6[f].hint))}</p>`).join('')}</div>`}).join('')}</div>`;
  h+=`<h4 class="h6">${esc(L('Lugares'))}</h4><div class="rows">${Object.entries(PLACES6).map(([id,p])=>{const v=s.places.includes(id),k=s.known.includes(id);const np=Object.values(NPC6).find(d=>d.place===id);
    return row(`<div>${dot(v?'#c9a24a':k?'#7a7a6a':'#3a3a34')}${esc(v||k?L(p.n):'???')}</div><div class="num">${esc(v?L('Visitado'):k?L('Marcado en el mapa'):L('Sin descubrir'))}</div><div class="num">${np&&(v||k)?esc(L(np.n)):''}</div>`,'r3')}).join('')}</div>`;
  $('diarioBody').innerHTML=h}
$('diario').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&b.dataset.a==='diarioclose')resume()});
OVS.push('npc','diario');
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(typing(e))return;
  if((k==='escape'||k==='e')&&(gstate==='npc'||gstate==='diario')){resume();pressed={}}
  else if(k==='j'){if(gstate==='play'&&S)openDiario6();else if(gstate==='diario')resume()}});

// ---------- Map & compass ----------
const _mapExtras6=mapExtras;mapExtras=function(m,X,Z,label){_mapExtras6(m,X,Z,label);if(!S.story||!sites6)return;const s=S.story;
  for(const p of sites6){const v=s.places.includes(p.id),k=s.known.includes(p.id);if(!v&&!k)continue;const def=PLACES6[p.id];const big=def.kind==='village'||def.kind==='colonia';
    m.fillStyle=v?'#c9a24a':'#8a8470';m.strokeStyle='#1a1610';m.lineWidth=2;m.beginPath();if(big)m.arc(X(p.x),Z(p.z),9,0,6.283);else{m.moveTo(X(p.x),Z(p.z)-8);m.lineTo(X(p.x)+7,Z(p.z)+5);m.lineTo(X(p.x)-7,Z(p.z)+5);m.closePath()}m.fill();m.stroke();
    label(L(def.n)+(v?'':' ?'),X(p.x),Z(p.z)-14)}};
const _compassExtras6=compassExtras;compassExtras=function(mark){_compassExtras6(mark);if(!S.story||!sites6)return;for(const p of sites6){if(!S.story.places.includes(p.id)&&!S.story.known.includes(p.id))continue;const d=Math.hypot(p.x-P.x,p.z-P.z);if(d>p.r+10&&d<520)mark(p.x,p.z,'#c9a24a','▲')}};

// ---------- Village safety: wild ones keep away from the people ----------
const _findSpawn6=findSpawn;findSpawn=function(cx,cz,minD,maxD,away){for(let i=0;i<6;i++){const p=_findSpawn6(cx,cz,minD,maxD,away);if(!p||!inSafe6(p.x,p.z,30))return p}return null};
const _updateEnemy6=updateEnemy;updateEnemy=function(e,dt){if(!e.dying&&!e.aggro&&!e.horde&&!e.lair&&!EDEF[e.type].boss&&inSafe6(e.x,e.z,8)){const s=sites6.find(s=>Math.hypot(e.x-s.x,e.z-s.z)<s.r+8);if(s){e.wdir=Math.atan2(e.x-s.x,e.z-s.z);e.wander=2}}return _updateEnemy6(e,dt)};

// ---------- Radio at 23:00 ----------
const _onHour6=onHour;onHour=function(prev,now){_onHour6(prev,now);if(!S.story)return;if(prev<23&&now>=23&&((S.inv.radio||0)+(S.stash.radio||0))>0){const s=story6();
  const next=['piedra4','radio4'].find(f=>!s.frags.includes(f));if(next){sfx('skill');toast(L(FRAGS6[next].tx),'#b8d0c8',12);setTimeout(()=>giveFrag6(next),800)}
  else{toast(L(RADIO6[s.radio%RADIO6.length].tx),'#b8d0c8',9);s.radio++}}};

// ---------- Driving view from the real seat of each vehicle ----------
const _updateCamera6=updateCamera;updateCamera=function(dt){_updateCamera6(dt);if(!S||!P.inTruck||camMode!=='fp'||!truck)return;const d=truck.def;
  const c=Math.cos(truck.yaw),s=Math.sin(truck.yaw);const lx=-.42,ly=d.eye||(d.bed==='trailer'?2.75:2.05),lz=d.bed==='trailer'?d.cabZ-.5:d.bed==='bus'?d.cabZ:d.cabZ+.05;
  camera.position.set(truck.x+lx*c+lz*s,truck.y+ly,truck.z-lx*s+lz*c);if(shake>.01){camera.position.x+=(R()-.5)*shake*.05}flashRig.position.copy(camera.position)};
const _updateCamera6r=updateCamera;updateCamera=function(dt){_updateCamera6r(dt);if(S&&roofs)cullRoofs6()};

// ---------- Distance culling for loose meshes that cannot be merged (furniture, roofs, people) ----------
let cull6T=0;
function cull6(){const px=P.inTruck&&truck?truck.x:P.x,pz=P.inTruck&&truck?truck.z:P.z;
  for(const c of conts){if(!c.mesh)continue;const d=Math.abs(c.x-px)+Math.abs(c.z-pz);c.mesh.visible=d<150}}
function cullRoofs6(){const px=P.x,pz=P.z;for(const r of roofs){if(!r.g.visible)continue;const b=r.b;if(Math.abs(b.cx-px)+Math.abs(b.cz-pz)>380)r.g.visible=false}}
// ---------- Hooks ----------
const _genWorld6=genWorld;genWorld=function(seed){seed6=seed;sites6=null;sitesNoise6=null;_genWorld6(seed);try{spawnNpcs6();spawnAnim6()}catch(e){console.error('npcs6',e)}};
const _startGame6=startGame;startGame=function(st){if(st)st.story=st.story||{};_startGame6(st);story6();
  if(!S.story.frags.length&&S.day<=2)hint(L('Hay gente viva en la zona. Buscá pueblos, hablá con ellos (E) y armá la historia en tu diario (J).'),24000)};
const _update6=update;update=function(dt){_update6(dt);if(gstate!=='play'||!S)return;try{updateNpcs6(dt);updateAnim6(dt);updateStory6(dt);cull6T-=dt;if(cull6T<=0){cull6T=.4;cull6()}}catch(e){console.error('v6',e)}};
