'use strict';
// ================= GAME DATA =================
// Every name here is the Spanish source text; the UI runs it through L() to translate.
const SIZE=1000, SEG=250, STEP=SIZE/SEG, HALF=SIZE/2, WATER_Y=-5, SAVE_KEY='ultimo-almacen-3d-v1', SET_KEY='ultimo-almacen-settings', SAVE_V=4,WORLD_SEED=1109;
const PAL=22; // palisade half size
const COUNTER={x:3.5,z:-11.1}, CUST_SPOT={x:3.5,z:-9.6}, BED={x:-4.6,z:-9.4};
const TRUCK_HOME={x:11,z:9};
const TOWN_Z=175, TOWN_Y=3;

// cat: food, drink, med, mat, tool, val, bag
const ITEMS={
  lata:{n:'Lata de comida',v:12,w:1,c:'#b9a26b',cat:'food',food:35},
  pan:{n:'Pan',v:6,w:.3,c:'#d8b26a',cat:'food',food:18,rot:3},
  fruta:{n:'Fruta',v:5,w:.3,c:'#c8553a',cat:'food',food:12,drink:6,rot:4},
  leche:{n:'Leche',v:7,w:1,c:'#eeeee4',cat:'food',food:8,drink:25,rot:2},
  galletitas:{n:'Galletitas',v:8,w:.3,c:'#c49a5a',cat:'food',food:16},
  chocolate:{n:'Chocolate',v:10,w:.2,c:'#6b4128',cat:'food',food:10,calm:30},
  carne:{n:'Carne cruda',v:10,w:2,c:'#a8463c',cat:'food',food:15,raw:true,rot:2},
  asada:{n:'Carne asada',v:30,w:2,c:'#9a6431',cat:'food',food:55,rot:4},
  podrida:{n:'Comida podrida',v:0,w:.5,c:'#5d6b3a',cat:'food',food:10,sick:true},
  agua:{n:'Botella de agua',v:9,w:1,c:'#6fa3c4',cat:'drink',drink:45},
  gaseosa:{n:'Gaseosa',v:6,w:1,c:'#7a3a2a',cat:'drink',drink:30,food:4},
  venda:{n:'Venda',v:16,w:.1,c:'#e6e1d3',cat:'med',heal:12,bandage:true},
  desinfectante:{n:'Desinfectante',v:22,w:.4,c:'#8ad0c8',cat:'med',disinfect:true},
  analgesicos:{n:'Analgésicos',v:20,w:.1,c:'#e0e070',cat:'med',pain:true},
  antibioticos:{n:'Antibióticos',v:70,w:.1,c:'#d07ad0',cat:'med',cure:true},
  medicina:{n:'Botiquín',v:48,w:.6,c:'#d45a5a',cat:'med',heal:60,bandage:true,disinfect:true},
  madera:{n:'Madera',v:5,w:1.5,c:'#8a6b45',cat:'mat'},
  tablas:{n:'Tablas',v:9,w:1,c:'#b08a5a',cat:'mat'},
  clavos:{n:'Clavos',v:3,w:.05,c:'#9aa0a4',cat:'mat'},
  chapa:{n:'Chapa',v:12,w:2,c:'#7d8a90',cat:'mat'},
  chatarra:{n:'Chatarra',v:6,w:1.5,c:'#8d918f',cat:'mat'},
  cinta:{n:'Cinta adhesiva',v:8,w:.1,c:'#c0c0b8',cat:'mat'},
  cuerda:{n:'Cuerda',v:7,w:.4,c:'#a89060',cat:'mat'},
  tela:{n:'Tela',v:3,w:.1,c:'#7a8aa0',cat:'mat'},
  polvora:{n:'Pólvora',v:18,w:.3,c:'#3a3a3a',cat:'mat'},
  combustible:{n:'Combustible',v:22,w:2,c:'#c98b2b',cat:'mat'},
  pilas:{n:'Pilas',v:9,w:.1,c:'#d8c040',cat:'tool'},
  encendedor:{n:'Encendedor',v:8,w:.05,c:'#d06a3a',cat:'tool'},
  serrucho:{n:'Serrucho',v:25,w:1,c:'#b0b4b8',cat:'tool'},
  herramientas:{n:'Caja de herramientas',v:45,w:3,c:'#b0402a',cat:'tool'},
  cuero:{n:'Cuero',v:18,w:2,c:'#8c6a45',cat:'val'},
  hueso:{n:'Hueso fósil',v:14,w:1.5,c:'#d8d0b8',cat:'val'},
  colmillo:{n:'Colmillo',v:26,w:.4,c:'#f2ecd8',cat:'val'},
  joyas:{n:'Joyas',v:60,w:.1,c:'#e0c060',cat:'val'},
  ambar:{n:'Ámbar',v:130,w:.4,c:'#e5a12e',cat:'val'},
  rinonera:{n:'Riñonera',v:15,w:.3,c:'#5a5a48',cat:'bag',cap:4},
  mochila_e:{n:'Mochila escolar',v:30,w:.6,c:'#3f5a7a',cat:'bag',cap:10},
  mochila_c:{n:'Mochila de campamento',v:70,w:1,c:'#5a6a3a',cat:'bag',cap:18},
  bolso_m:{n:'Bolso militar',v:140,w:1.5,c:'#4a5236',cat:'bag',cap:26},
};
const IK=Object.keys(ITEMS);
const CATS={food:'Comida',drink:'Bebida',med:'Medicina',mat:'Material',tool:'Herramienta',val:'Valioso',bag:'Mochila'};

// Weapons. key = hotbar order. w = weight in kg.
const WEAP={
  pistola:{n:'Pistola 9 mm',dmg:22,rate:.18,mag:12,reload:1.2,hip:.028,ads:.006,range:100,ammo:'balas',pellets:1,pierce:1,noise:40,recoil:.024,fov:58,w:.8,v:200},
  revolver:{n:'Revólver',dmg:42,rate:.45,mag:6,reload:2,hip:.032,ads:.005,range:110,ammo:'revolver',pellets:1,pierce:2,noise:50,recoil:.05,fov:55,w:1,v:260},
  escopeta:{n:'Escopeta',dmg:12,rate:.8,mag:6,reload:2.2,hip:.08,ads:.06,range:34,ammo:'cartuchos',pellets:8,pierce:1,noise:55,recoil:.075,fov:62,w:3.5,v:350},
  rifle:{n:'Rifle de caza',dmg:90,rate:1.0,mag:5,reload:2.3,hip:.06,ads:.0012,range:280,ammo:'rifle',pellets:1,pierce:3,noise:70,recoil:.06,fov:20,scope:true,w:4,v:750},
  fusil:{n:'Fusil de asalto',dmg:25,rate:.1,mag:30,reload:2.4,hip:.05,ads:.009,range:170,ammo:'fusil',pellets:1,pierce:1,noise:75,recoil:.019,fov:50,auto:true,w:3.5,v:1100},
  cuchillo:{n:'Cuchillo',melee:true,dmg:22,rate:.32,reach:1.8,dur:60,w:.3,v:30},
  sarten:{n:'Sartén',melee:true,dmg:26,rate:.6,reach:1.9,dur:80,knock:1.2,w:1.5,v:20},
  bate:{n:'Bate de béisbol',melee:true,dmg:34,rate:.7,reach:2.3,dur:70,knock:1.8,w:1.5,v:40},
  martillo:{n:'Martillo',melee:true,dmg:28,rate:.55,reach:1.8,dur:90,w:1,v:35,tool:true},
  palanca:{n:'Palanca',melee:true,dmg:36,rate:.65,reach:2.1,dur:160,knock:1,w:1.8,v:55},
  machete:{n:'Machete',melee:true,dmg:38,rate:.5,reach:2.2,dur:110,chop:1,w:1,v:60},
  hacha:{n:'Hacha',melee:true,dmg:52,rate:.85,reach:2.2,dur:100,chop:2.5,knock:1,w:2.5,v:90},
  lanza:{n:'Lanza',melee:true,dmg:30,rate:.55,reach:2.9,dur:40,w:1.5,v:15},
};
const WORDER=['pistola','revolver','escopeta','rifle','fusil','cuchillo','sarten','bate','martillo','palanca','machete','hacha','lanza'];
const AMMO_N={balas:'Balas 9 mm',revolver:'Balas .38',cartuchos:'Cartuchos',rifle:'Balas de rifle',fusil:'Balas 5.56'};
const AMMO_W={balas:.01,revolver:.012,cartuchos:.04,rifle:.03,fusil:.012};

const EDEF={
  caminante:{n:'Caminante',hp:45,r:.4,speed:1.6,dmg:10,wall:8,xp:8,kind:'z',aggro:26},
  corredor:{n:'Corredor',hp:28,r:.4,speed:5,dmg:8,wall:5,xp:11,kind:'z',aggro:34},
  bruto:{n:'Bruto',hp:190,r:.6,speed:1.4,dmg:26,wall:32,xp:30,kind:'z',aggro:28},
  raptor:{n:'Raptor',hp:38,r:.5,speed:6.6,dmg:12,wall:6,xp:14,kind:'d',aggro:24},
  raptorp:{n:'Raptor podrido',hp:58,r:.5,speed:5.6,dmg:14,wall:10,xp:18,kind:'zd',aggro:34},
  cornudo:{n:'Cornudo',hp:250,r:1.3,speed:2,dmg:30,wall:40,xp:36,kind:'d',aggro:0,neutral:true},
  rex:{n:'Rex Podrido',hp:1700,r:2,speed:3.4,dmg:45,wall:140,xp:380,kind:'zd',aggro:70,boss:true},
};
const DROPS={
  caminante:[['chatarra',.2,1,1],['lata',.08,1,1],['ammo:balas',.18,4,8],['tela',.25,1,2],['joyas',.04,1,1]],
  corredor:[['tela',.25,1,1],['ammo:balas',.18,3,6],['venda',.06,1,1],['pilas',.06,1,1]],
  bruto:[['chatarra',.8,1,3],['combustible',.25,1,1],['ammo:cartuchos',.3,2,4],['medicina',.08,1,1],['w:palanca',.06,1,1]],
  raptor:[['carne',1,1,1],['cuero',.5,1,1],['colmillo',.35,1,1]],
  raptorp:[['hueso',.5,1,1],['colmillo',.5,1,1],['chatarra',.2,1,1]],
  cornudo:[['carne',1,3,4],['cuero',1,2,2],['hueso',.6,1,2]],
  rex:[['ambar',1,3,4],['colmillo',1,4,6],['hueso',1,4,6],['medicina',1,2,2]],
};
// Container loot tables: [item, chance, min, max]. "w:" = weapon, "ammo:" = ammo.
const CONT={
  heladera:{n:'Heladera',loot:[['leche',.55,1,2],['fruta',.6,1,3],['carne',.3,1,2],['pan',.3,1,1],['gaseosa',.4,1,2],['agua',.45,1,2],['podrida',.35,1,2]]},
  alacena:{n:'Alacena',loot:[['lata',.65,1,3],['galletitas',.5,1,2],['chocolate',.3,1,1],['agua',.35,1,2],['gaseosa',.25,1,1],['encendedor',.12,1,1],['w:sarten',.12,1,1],['w:cuchillo',.12,1,1]]},
  armario:{n:'Armario',loot:[['tela',.8,1,4],['rinonera',.12,1,1],['mochila_e',.14,1,1],['mochila_c',.04,1,1],['cuerda',.2,1,1],['joyas',.1,1,1],['pilas',.2,1,2],['w:bate',.06,1,1]]},
  botiquin:{n:'Botiquín de baño',loot:[['venda',.7,1,3],['desinfectante',.35,1,1],['analgesicos',.4,1,1],['antibioticos',.06,1,1],['medicina',.08,1,1]]},
  escritorio:{n:'Escritorio',loot:[['pilas',.35,1,2],['joyas',.08,1,1],['encendedor',.2,1,1],['ammo:balas',.18,4,10],['ammo:revolver',.1,3,6],['cinta',.3,1,1]]},
  herramientas:{n:'Banco de herramientas',loot:[['clavos',.75,5,15],['cinta',.5,1,2],['chatarra',.5,1,2],['chapa',.25,1,1],['serrucho',.12,1,1],['herramientas',.06,1,1],['cuerda',.3,1,1],['w:martillo',.2,1,1],['w:palanca',.08,1,1],['w:hacha',.05,1,1]]},
  gondola:{n:'Góndola',loot:[['lata',.7,1,4],['galletitas',.6,1,3],['gaseosa',.55,1,3],['agua',.55,1,3],['chocolate',.4,1,2],['pan',.3,1,2],['podrida',.3,1,2]]},
  farmacia:{n:'Estante de farmacia',loot:[['venda',.8,2,4],['desinfectante',.5,1,2],['analgesicos',.55,1,2],['antibioticos',.2,1,1],['medicina',.25,1,1]]},
  ferreteria:{n:'Estante de ferretería',loot:[['clavos',.85,10,25],['cinta',.6,1,3],['chapa',.4,1,2],['cuerda',.45,1,2],['serrucho',.25,1,1],['herramientas',.12,1,1],['pilas',.4,1,3],['w:martillo',.3,1,1],['w:hacha',.12,1,1],['w:palanca',.15,1,1]]},
  armeria:{n:'Armero',loot:[['ammo:balas',.7,8,20],['ammo:revolver',.5,6,12],['ammo:cartuchos',.5,4,8],['ammo:rifle',.25,3,6],['ammo:fusil',.2,10,20],['polvora',.3,1,2],['w:revolver',.12,1,1],['w:escopeta',.08,1,1],['w:fusil',.04,1,1],['w:cuchillo',.3,1,1],['bolso_m',.06,1,1]]},
  kiosco:{n:'Mostrador',loot:[['galletitas',.5,1,2],['chocolate',.5,1,2],['gaseosa',.5,1,2],['encendedor',.35,1,1],['pilas',.35,1,2],['combustible',.3,1,1]]},
  baul:{n:'Baúl del auto',loot:[['combustible',.5,1,2],['chatarra',.6,1,3],['cinta',.25,1,1],['lata',.2,1,1],['ammo:balas',.25,5,10],['herramientas',.04,1,1],['w:bate',.05,1,1]]},
  tacho:{n:'Tacho de basura',loot:[['chatarra',.4,1,1],['tela',.4,1,2],['podrida',.5,1,2],['lata',.12,1,1],['clavos',.2,2,6]]},
  surtidor:{n:'Surtidor',loot:[['combustible',.85,1,3]]},
  camilla:{n:'Camilla',loot:[['venda',.6,1,2],['desinfectante',.3,1,1],['analgesicos',.3,1,1],['tela',.4,1,2],['antibioticos',.05,1,1]]},
  vitrina:{n:'Vitrina de medicamentos',loot:[['venda',.85,2,5],['desinfectante',.6,1,2],['analgesicos',.6,1,3],['antibioticos',.35,1,2],['medicina',.35,1,2]]},
  pupitre:{n:'Pupitre',loot:[['galletitas',.3,1,1],['chocolate',.15,1,1],['pilas',.18,1,1],['encendedor',.06,1,1],['mochila_e',.05,1,1]]},
  comedor:{n:'Cocina del comedor',loot:[['lata',.75,2,5],['galletitas',.5,1,3],['agua',.55,1,3],['leche',.3,1,2],['pan',.25,1,2],['encendedor',.15,1,1]]},
  caja:{n:'Caja',loot:[['lata',.4,1,2],['agua',.3,1,2],['venda',.25,1,1],['chatarra',.4,1,2],['ammo:balas',.3,5,10],['ammo:cartuchos',.12,2,4],['clavos',.3,3,8],['ambar',.03,1,1]]},
};
const UPG={
  estante:{n:'Estante extra',d:'Un producto más a la venta al mismo tiempo.',p:[150,300,550,900]},
  muros:{n:'Muros reforzados',d:'Toda la empalizada aguanta más golpes.',p:[250,650]},
  torreta:{n:'Torreta automática',d:'Dispara sola a lo que se acerque. Va en una esquina del patio.',p:[400,550,700,900]},
  fogon:{n:'Fogón',d:'Permite cocinar carne asada en el taller.',p:[120]},
  banco:{n:'Banco de recarga',d:'Permite fabricar munición con pólvora.',p:[300]},
  heladera:{n:'Heladera a nafta',d:'La comida del depósito se pudre mucho más lento.',p:[350]},
  mochila:{n:'Cosido de mochila',d:'+4 kg de capacidad en cualquier mochila.',p:[200,450]},
  caja:{n:'Caja de carga',d:'+40 kg en la caja de la camioneta.',p:[250,500]},
  linterna:{n:'Linterna potente',d:'El haz llega mucho más lejos y gasta menos pilas.',p:[150]},
  neon:{n:'Cartel luminoso',d:'Atrae más clientes durante el día.',p:[300]},
};
const RECIPES=[
  {id:'tablas',n:'Tablas ×3',in:{madera:2},out:['tablas',3],tool:'serrucho'},
  {id:'venda',n:'Vendas ×2',in:{tela:2},out:['venda',2]},
  {id:'vendac',n:'Vendas ×3',in:{cuero:1},out:['venda',3]},
  {id:'lanza',n:'Lanza',in:{madera:1,cinta:1},weapon:'lanza',wtool:'cuchillo'},
  {id:'balas',n:'Balas 9 mm ×10',in:{chatarra:2,polvora:1},ammo:['balas',10],need:'banco'},
  {id:'rev',n:'Balas .38 ×6',in:{chatarra:2,polvora:1},ammo:['revolver',6],need:'banco'},
  {id:'cart',n:'Cartuchos ×4',in:{chatarra:2,polvora:1},ammo:['cartuchos',4],need:'banco'},
  {id:'rifle',n:'Balas de rifle ×5',in:{chatarra:3,polvora:1},ammo:['rifle',5],need:'banco'},
  {id:'fusil',n:'Balas 5.56 ×15',in:{chatarra:3,polvora:2},ammo:['fusil',15],need:'banco'},
  {id:'polvora',n:'Pólvora',in:{combustible:1,hueso:1},out:['polvora',1],need:'banco'},
  {id:'asado',n:'Carne asada',in:{carne:1,madera:1},out:['asada',1],need:'fogon'},
  {id:'chapa',n:'Chapa',in:{chatarra:3},out:['chapa',1],tool:'herramientas'},
];
const BUILDS={
  barricada:{n:'Barricada',d:'Frena a los podridos. La rompen a golpes.',cost:{madera:4},hp:220},
  pinchos:{n:'Pinchos',d:'Lastiman y frenan a lo que pase por encima.',cost:{madera:3,chatarra:1}},
  fogata:{n:'Fogata',d:'Alumbra de noche. Con E cocinás la carne cruda.',cost:{madera:3}},
  muro:{n:'Muro de tablas',d:'Mucho más fuerte que la barricada. Necesita martillo y carpintería 2.',cost:{tablas:4,clavos:6},hp:520,skill:2},
  chapon:{n:'Muro de chapa',d:'Lo más duro que podés levantar. Carpintería 4.',cost:{chapa:3,clavos:8},hp:950,skill:4},
};
const BORDER=['barricada','pinchos','fogata','muro','chapon'];
const PERKS=[
  {id:'pulso',n:'Pulso firme',d:'+15% de daño con armas de fuego.'},
  {id:'piel',n:'Piel dura',d:'+25 de vida máxima.'},
  {id:'piernas',n:'Piernas largas',d:'+8% de velocidad.'},
  {id:'recarga',n:'Manos rápidas',d:'Recargás un 20% más rápido.'},
  {id:'mula',n:'Mula de carga',d:'+5 kg en la mochila.'},
  {id:'labia',n:'Labia',d:'Los clientes aceptan precios un 8% más altos.'},
  {id:'carnicero',n:'Carnicero',d:'Los animales sueltan 1 carne extra.'},
  {id:'carronero',n:'Carroñero',d:'Encontrás más cosas en muebles, cajas y autos.'},
  {id:'filo',n:'Filo',d:'+30% de daño cuerpo a cuerpo y las armas se gastan menos.'},
  {id:'regen',n:'Segundo aire',d:'Recuperás vida sola si pasan 5 s sin que te peguen.'},
  {id:'ojo',n:'Ojo de halcón',d:'Los tiros a la cabeza hacen un 30% más.'},
  {id:'pulmon',n:'Pulmones',d:'+30% de aguante para correr.'},
  {id:'estomago',n:'Estómago de fierro',d:'El hambre y la sed bajan un 30% más lento.'},
  {id:'domador',n:'Domador',d:'Tu raptor pega un 50% más fuerte.'},
  {id:'conductor',n:'Conductor',d:'La camioneta gasta menos nafta y atropella más fuerte.'},
  {id:'inmune',n:'Sangre espesa',d:'Las mordidas casi nunca se infectan.'},
];
// Skills that level up by doing (0 to 10).
const SKILLS={
  punteria:{n:'Puntería',d:'Menos dispersión y recarga más rápida.'},
  melee:{n:'Cuerpo a cuerpo',d:'Más daño y menos desgaste de las armas.'},
  carpinteria:{n:'Carpintería',d:'Defensas más fuertes y nuevos muros.'},
  supervivencia:{n:'Supervivencia',d:'Menos hambre y sed, talás más rápido.'},
  auxilios:{n:'Primeros auxilios',d:'Las curaciones rinden más y las heridas cierran antes.'},
  atletismo:{n:'Atletismo',d:'Más aguante y velocidad al correr.'},
};
const CLIENTS=['Doña Rosa','el Turco Salem','Marga la mecánica','el Chino del km 9','el padre Ignacio','la Colorada','Don Beto','los gauchos del sur','la doctora Paz','Ramón el camionero'];
const GOALS=[
  {id:'n3',n:'Sobreviví 3 noches',r:150,test:()=>S.stats.nights>=3},
  {id:'v50',n:'Vendé 50 productos',r:200,test:()=>S.stats.sold>=50},
  {id:'enc5',n:'Completá 5 encargos',r:250,test:()=>S.stats.contracts>=5},
  {id:'tame',n:'Domesticá un raptor',r:200,test:()=>!!S.pet},
  {id:'loot30',n:'Revisá 30 muebles del pueblo',r:200,test:()=>S.stats.looted>=30},
  {id:'hs50',n:'Hacé 50 tiros a la cabeza',r:250,test:()=>S.stats.hs>=50},
  {id:'build5',n:'Construí 5 defensas',r:150,test:()=>S.stats.built>=5},
  {id:'run20',n:'Atropellá 20 bichos con la camioneta',r:200,test:()=>S.stats.runover>=20},
  {id:'skill5',n:'Llevá una habilidad a nivel 5',r:300,test:()=>Object.keys(SKILLS).some(k=>skLv(k)>=5)},
  {id:'earn3k',n:'Ganá $3.000 en ventas',r:500,test:()=>S.stats.earned>=3000},
  {id:'rex',n:'Cazá al Rex Podrido',r:1000,test:()=>S.stats.rex>=1},
  {id:'n10',n:'Sobreviví 10 noches',r:800,test:()=>S.stats.nights>=10},
];
const SHOP=[
  {id:'escopeta',n:'Escopeta',d:'Ocho perdigones por disparo. Brutal de cerca.',p:350,weapon:true},
  {id:'revolver',n:'Revólver',d:'Seis tiros pesados que atraviesan a dos.',p:300,weapon:true},
  {id:'rifle',n:'Rifle de caza',d:'Clic derecho para mirar por la mira. Atraviesa hasta tres enemigos.',p:750,weapon:true},
  {id:'fusil',n:'Fusil de asalto',d:'Automático: mantené el clic. Gasta munición rápido.',p:1200,weapon:true,minDay:4},
  {id:'hacha',n:'Hacha',d:'Pega muy fuerte y tala en dos golpes.',p:160,weapon:true},
  {id:'a_balas',n:'Balas 9 mm ×20',d:'Para la pistola.',p:36,ammo:['balas',20]},
  {id:'a_rev',n:'Balas .38 ×12',d:'Para el revólver.',p:40,ammo:['revolver',12]},
  {id:'a_cart',n:'Cartuchos ×8',d:'Para la escopeta.',p:40,ammo:['cartuchos',8]},
  {id:'a_rifle',n:'Balas de rifle ×10',d:'Para el rifle.',p:75,ammo:['rifle',10]},
  {id:'a_fusil',n:'Balas 5.56 ×30',d:'Para el fusil.',p:90,ammo:['fusil',30]},
  {id:'i_venda',n:'Venda',d:'Para el sangrado. Va a la mochila.',p:28,item:'venda'},
  {id:'i_med',n:'Botiquín',d:'Cura mucho, desinfecta y frena el sangrado.',p:85,item:'medicina'},
  {id:'i_anti',n:'Antibióticos',d:'Curan la infección de la bruma.',p:160,item:'antibioticos'},
  {id:'i_agua',n:'Agua',d:'Para la sed. Va a la mochila.',p:14,item:'agua'},
  {id:'i_pilas',n:'Pilas',d:'Para la linterna.',p:16,item:'pilas'},
  {id:'i_clavos',n:'Clavos ×20',d:'Para los muros. Va al depósito.',p:30,stash:['clavos',20]},
  {id:'i_comb',n:'Combustible',d:'Para la camioneta. Va al depósito.',p:35,stash:['combustible',1]},
];
// Sandbox options for a new game. Each value list maps to a multiplier.
const SANDBOX={
  zpop:{n:'Población de podridos',o:['Baja','Normal','Alta','Extrema'],v:[.6,1,1.5,2.2],d:1},
  dinos:{n:'Dinosaurios',o:['Pocos','Normales','Muchos'],v:[.5,1,1.6],d:1},
  loot:{n:'Botín',o:['Escaso','Normal','Abundante'],v:[.6,1,1.5],d:1},
  daylen:{n:'Duración del día',o:['12 min','24 min','36 min','48 min'],v:[720,1440,2160,2880],d:1},
  needs:{n:'Hambre y sed',o:['Lentas','Normales','Rápidas'],v:[.6,1,1.4],d:1},
  horde:{n:'Hordas nocturnas',o:['Suaves','Normales','Brutales'],v:[.6,1,1.5],d:1},
  infect:{n:'Infección de la bruma',o:['Desactivada','Activada'],v:[0,1],d:1},
  rot:{n:'La comida se pudre',o:['No','Sí'],v:[0,1],d:1},
};
const PRESETS={
  facil:{n:'Aprendiz',d:'Pocos podridos, mucho botín y días largos. Para conocer el mundo.',sb:{zpop:0,dinos:0,loot:2,daylen:2,needs:0,horde:0,infect:0,rot:0}},
  normal:{n:'Sobreviviente',d:'La experiencia pensada: dura pero justa.',sb:{zpop:1,dinos:1,loot:1,daylen:1,needs:1,horde:1,infect:1,rot:1}},
  dificil:{n:'Apocalipsis',d:'El pueblo está lleno, el botín escasea y las noches son brutales.',sb:{zpop:3,dinos:2,loot:0,daylen:1,needs:2,horde:2,infect:1,rot:1}},
};

// ================= v0.3: MORE ENEMIES, BOSSES, SEASONS, CARGO VEHICLES, WEAPONS =================
Object.assign(ITEMS,{
  campera:{n:'Campera de abrigo',v:45,w:1.2,c:'#5a4a3a',cat:'tool',warm:9},
  nucleo:{n:'Núcleo de bruma',v:40,w:.2,c:'#8fd06a',cat:'val'},
  placa:{n:'Placa del Sargento',v:260,w:.3,c:'#b0b4b8',cat:'val',trophy:true},
  cuchilla:{n:'Cuchilla del Matarife',v:260,w:2,c:'#9a9a92',cat:'val',trophy:true},
  muestra:{n:'Muestra del Paciente Cero',v:260,w:.2,c:'#9acd5a',cat:'val',trophy:true},
  garra:{n:'Garra del Alfa',v:260,w:.5,c:'#2a2a2a',cat:'val',trophy:true},
  cuerno:{n:'Cuerno del Viejo',v:260,w:3,c:'#e8dcc0',cat:'val',trophy:true},
  glandula:{n:'Glándula de la Reina',v:260,w:.4,c:'#7ac04a',cat:'val',trophy:true},
});
IK.length=0;IK.push(...Object.keys(ITEMS));
Object.assign(WEAP,{
  ballesta:{n:'Ballesta',dmg:80,rate:.3,mag:1,reload:1.5,hip:.03,ads:.003,range:130,ammo:'virotes',pellets:1,pierce:2,noise:5,recoil:.03,fov:45,w:2.5,v:420,snd:'ballesta'},
  escopetac:{n:'Escopeta de combate',dmg:11,rate:.26,mag:8,reload:2.6,hip:.085,ads:.065,range:32,ammo:'cartuchos',pellets:7,pierce:1,noise:58,recoil:.06,fov:62,w:4,v:900,snd:'escopeta'},
  francotirador:{n:'Rifle de francotirador',dmg:240,rate:1.5,mag:5,reload:3,hip:.09,ads:.0006,range:400,ammo:'p50',pellets:1,pierce:5,noise:95,recoil:.1,fov:12,scope:true,w:9,v:2400,ap:true,snd:'rifle'},
  ametralladora:{n:'Ametralladora',dmg:24,rate:.075,mag:100,reload:5.5,hip:.07,ads:.02,range:160,ammo:'fusil',pellets:1,pierce:2,noise:90,recoil:.014,fov:55,auto:true,w:10,v:2800,snd:'fusil'},
  lanzagranadas:{n:'Lanzagranadas',dmg:170,rate:.9,mag:6,reload:4,hip:.02,ads:.01,range:120,ammo:'granadas',pellets:1,pierce:1,noise:95,recoil:.09,fov:55,w:6,v:3200,grenade:true,snd:'lanzagranadas'},
  katana:{n:'Katana',melee:true,dmg:58,rate:.42,reach:2.4,dur:150,w:1.2,v:380,head:.15},
  mazo:{n:'Mazo',melee:true,dmg:80,rate:1.15,reach:2.3,dur:220,knock:3,w:6,v:160,ap:true},
});
WORDER.splice(0,WORDER.length,'pistola','revolver','escopeta','escopetac','rifle','francotirador','fusil','ametralladora','ballesta','lanzagranadas','cuchillo','katana','sarten','bate','martillo','palanca','mazo','machete','hacha','lanza');
Object.assign(AMMO_N,{virotes:'Virotes',p50:'Balas .50',granadas:'Granadas'});
Object.assign(AMMO_W,{virotes:.06,p50:.05,granadas:.25});
// Enemies. base = model and hit spheres it borrows; scale/tint change the look.
Object.assign(EDEF,{
  griton:{n:'Gritón',hp:40,r:.4,speed:2.6,dmg:7,wall:5,xp:14,kind:'z',aggro:32,scream:true},
  hinchado:{n:'Hinchado',hp:70,r:.55,speed:1.2,dmg:12,wall:10,xp:16,kind:'z',aggro:22,explode:true},
  soldado:{n:'Soldado podrido',hp:130,r:.45,speed:1.9,dmg:16,wall:12,xp:26,kind:'z',aggro:30,armor:.55},
  saltador:{n:'Saltador',base:'raptor',scale:.55,hp:22,r:.35,speed:7.2,dmg:6,wall:3,xp:8,kind:'d',aggro:22,lunge:true},
  escupidor:{n:'Escupidor',base:'raptor',hp:65,r:.5,speed:4.2,dmg:9,wall:6,xp:20,kind:'d',aggro:30,spit:1},
  acorazado:{n:'Acorazado podrido',hp:480,r:1.2,speed:1.7,dmg:30,wall:45,xp:48,kind:'zd',aggro:24,armor:.35,heavy:true},
  sargento:{n:'Sargento Podrido',base:'soldado',scale:1.45,tint:'#7a2a1a',hp:1100,r:.65,speed:2.4,dmg:26,wall:60,xp:300,kind:'z',aggro:48,armor:.5,mini:true,lair:'militar',esc:['soldado',4]},
  matarife:{n:'El Matarife',base:'bruto',scale:1.3,tint:'#7a1a14',hp:1500,r:.85,speed:2,dmg:42,wall:80,xp:320,kind:'z',aggro:40,charger:true,mini:true,lair:'frigorifico',esc:['caminante',6]},
  paciente:{n:'Paciente Cero',base:'griton',scale:1.35,tint:'#e0e6d0',hp:850,r:.55,speed:3,dmg:18,wall:30,xp:300,kind:'z',aggro:50,scream:true,summon:true,infects:true,mini:true,lair:'hospital',esc:['corredor',3]},
  alfa:{n:'Alfa Colmillo Negro',base:'raptor',scale:1.7,tint:'#1a1a1a',hp:750,r:.8,speed:7.4,dmg:24,wall:30,xp:300,kind:'d',aggro:45,lunge:true,mini:true,lair:'canadon',esc:['raptor',4]},
  viejo:{n:'Cornudo Viejo',base:'cornudo',scale:1.5,tint:'#3a2c24',hp:2600,r:1.9,speed:2.4,dmg:48,wall:120,xp:340,kind:'d',aggro:40,charger:true,heavy:true,mini:true,lair:'salina',esc:['cornudo',2]},
  reina:{n:'Reina Escupidora',base:'escupidor',scale:1.8,tint:'#2f6a2a',hp:950,r:.9,speed:4,dmg:16,wall:30,xp:320,kind:'d',aggro:45,spit:3,mini:true,lair:'laguna',esc:['escupidor',2]},
  coloso:{n:'El Coloso de la Bruma',base:'bruto',scale:2.3,tint:'#2f3a28',hp:7000,r:1.6,speed:2.6,dmg:55,wall:200,xp:900,kind:'z',aggro:90,boss:true,heavy:true,slam:true,scream:true,summon:true},
});
EDEF.raptor.lunge=true;EDEF.raptorp.lunge=true;EDEF.rex.heavy=true;EDEF.cornudo.heavy=true;EDEF.cornudo.charger=true;
Object.assign(DROPS,{
  caminante:[...DROPS.caminante,['nucleo',.06,1,1]],corredor:[...DROPS.corredor,['nucleo',.06,1,1]],bruto:[...DROPS.bruto,['nucleo',.25,1,1]],raptorp:[...DROPS.raptorp,['nucleo',.12,1,1]],
  griton:[['tela',.4,1,2],['pilas',.15,1,1],['nucleo',.15,1,1],['analgesicos',.1,1,1]],
  hinchado:[['nucleo',.3,1,2],['podrida',.4,1,2],['desinfectante',.12,1,1]],
  soldado:[['ammo:fusil',.5,6,15],['ammo:balas',.4,6,12],['venda',.25,1,2],['campera',.1,1,1],['ammo:granadas',.05,1,2],['w:fusil',.04,1,1],['w:escopetac',.03,1,1],['nucleo',.1,1,1]],
  saltador:[['carne',.8,1,1],['cuero',.25,1,1]],
  escupidor:[['carne',1,1,2],['cuero',.5,1,1],['colmillo',.4,1,1]],
  acorazado:[['hueso',1,2,4],['chapa',.4,1,1],['colmillo',.6,1,2],['nucleo',.35,1,2],['ambar',.15,1,1]],
  sargento:[['placa',1,1,1],['ammo:fusil',1,30,60],['ammo:p50',.6,5,10],['ammo:granadas',.5,2,4],['w:ametralladora',.25,1,1],['w:francotirador',.15,1,1],['joyas',.6,1,2]],
  matarife:[['cuchilla',1,1,1],['carne',1,4,6],['w:mazo',.4,1,1],['w:katana',.2,1,1],['medicina',.7,1,2],['joyas',.5,1,2]],
  paciente:[['muestra',1,1,1],['antibioticos',1,2,3],['medicina',1,1,2],['nucleo',1,2,3],['joyas',.4,1,1]],
  alfa:[['garra',1,1,1],['colmillo',1,3,5],['cuero',1,2,3],['carne',1,3,4],['ambar',.5,1,1]],
  viejo:[['cuerno',1,1,1],['carne',1,6,8],['cuero',1,4,5],['hueso',1,3,4],['ambar',.6,1,2]],
  reina:[['glandula',1,1,1],['colmillo',1,2,4],['ambar',.7,1,2],['antibioticos',.5,1,1],['cuero',1,2,3]],
  coloso:[['ambar',1,5,7],['joyas',1,4,6],['nucleo',1,5,8],['medicina',1,2,3],['w:lanzagranadas',1,1,1],['ammo:granadas',1,6,10]],
  rex:[['ambar',1,5,7],['colmillo',1,6,8],['hueso',1,6,8],['medicina',1,2,2],['w:francotirador',1,1,1],['ammo:p50',1,10,15]],
});
// Special zones where the minibosses live, and the summons at the Green Stone crater.
const LAIRS={
  militar:{n:'Puesto militar',boss:'sargento'},frigorifico:{n:'Frigorífico abandonado',boss:'matarife'},hospital:{n:'Hospital en ruinas',boss:'paciente'},
  canadon:{n:'Cañadón de los raptores',boss:'alfa'},salina:{n:'Salina',boss:'viejo'},laguna:{n:'Laguna podrida',boss:'reina'},
};
const SUMMONS={
  coloso:{n:'El Coloso de la Bruma',d:'Una montaña de podridos cosidos por la bruma. Golpea el suelo y llama a los muertos.',need:{placa:1,cuchilla:1,muestra:1,nucleo:8}},
  rex:{n:'Rex Podrido',d:'El rey de los huesos. Ya no viene solo de noche: lo despertás vos.',need:{garra:1,cuerno:1,glandula:1,colmillo:8,ambar:2}},
};
// Cargo vehicles. cap in kg.
const VEH={
  pickup:{n:'Camioneta',cap:40,max:26,acc:9,fuel:1,len:4.8,wid:2.1,col:'#6b2f22',bed:'open',cabZ:1.15},
  furgon:{n:'Furgón',cap:180,max:22,acc:7,fuel:1.35,len:5.6,wid:2.2,col:'#8a8a84',bed:'box',cabZ:1.75},
  camion:{n:'Camión de carga',cap:420,max:18,acc:4.5,fuel:1.9,len:7.8,wid:2.6,col:'#3f5a6a',bed:'box',cabZ:2.9,broken:true},
  tractor:{n:'Tractor con acoplado',cap:300,max:13,acc:5,fuel:1.1,len:7.4,wid:2.3,col:'#5a7a2a',bed:'trailer',cabZ:2.4,broken:true},
};
const SEASONS={primavera:{n:'Primavera',msg:'Llegó la primavera.'},verano:{n:'Verano',msg:'Llegó el verano.'},otono:{n:'Otoño',msg:'Llegó el otoño.'},invierno:{n:'Invierno',msg:'Llegó el invierno.'}};
const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
CONT.armario.loot.push(['campera',.22,1,1]);
CONT.armeria.loot.push(['w:ballesta',.05,1,1],['w:escopetac',.03,1,1],['ammo:virotes',.25,4,10],['ammo:p50',.06,2,5]);
CONT.herramientas.loot.push(['w:mazo',.04,1,1]);CONT.ferreteria.loot.push(['w:mazo',.06,1,1]);
RECIPES.push(
  {id:'virotes',n:'Virotes ×6',in:{madera:1,chatarra:1},ammo:['virotes',6]},
  {id:'p50',n:'Balas .50 ×5',in:{chatarra:3,polvora:2},ammo:['p50',5],need:'banco'},
  {id:'granadas',n:'Granadas ×2',in:{polvora:2,chatarra:2,cinta:1},ammo:['granadas',2],need:'banco'},
  {id:'campera',n:'Campera de abrigo',in:{tela:4,cuero:1},out:['campera',1]},
);
SHOP.splice(5,0,
  {id:'ballesta',n:'Ballesta',d:'Casi no hace ruido. Un virote por vez, pero pega fuerte.',p:420,weapon:true},
  {id:'katana',n:'Katana',d:'Rápida y filosa. Corta cabezas con facilidad.',p:380,weapon:true},
  {id:'mazo',n:'Mazo',d:'Lento y pesado. Rompe cualquier armadura y voltea a los grandes.',p:160,weapon:true},
  {id:'escopetac',n:'Escopeta de combate',d:'Semiautomática: ocho cartuchos sin bombear.',p:900,weapon:true,minDay:5},
  {id:'francotirador',n:'Rifle de francotirador',d:'Calibre .50. Atraviesa armaduras y hasta cinco enemigos.',p:2400,weapon:true,minDay:8},
  {id:'ametralladora',n:'Ametralladora',d:'Cien tiros sin recargar. Pesa diez kilos.',p:2800,weapon:true,minDay:10},
);
SHOP.push(
  {id:'a_virotes',n:'Virotes ×10',d:'Para la ballesta.',p:30,ammo:['virotes',10]},
  {id:'a_p50',n:'Balas .50 ×10',d:'Para el rifle de francotirador.',p:160,ammo:['p50',10]},
  {id:'a_gran',n:'Granadas ×4',d:'Para el lanzagranadas.',p:220,ammo:['granadas',4],minDay:10},
  {id:'i_campera',n:'Campera de abrigo',d:'Abriga en invierno. Va a la mochila.',p:70,item:'campera'},
);
GOALS.splice(GOALS.length-1,0,
  {id:'mini3',n:'Derrotá a 3 minijefes',r:600,test:()=>(S.stats.minis||0)>=3},
  {id:'coloso',n:'Derrotá al Coloso de la Bruma',r:1500,test:()=>(S.stats.coloso||0)>=1},
);
