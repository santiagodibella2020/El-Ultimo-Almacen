'use strict';
// ================= v0.7 · Pixel-art icons for items, weapons and ammo =================
// Every item, weapon and ammo type gets a hand-drawn 16x16 sprite built from small primitives, then a bevel
// pass (light top-left, dark bottom-right) and a 1px outline are added so they read clearly at a glance.
// Used in every list (inventory, loot, trade, stash, hotbar), on dropped items in the world and on store shelves.

const IC7={};
const hex7=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);return[n>>16&255,n>>8&255,n&255]};
const tn7=(c,f)=>{if(!c)return c;const[a,b,d]=hex7(c);const m=f>0?255:0,t=Math.abs(f);const q=v=>Math.round(v+(m-v)*t);return'#'+[q(a),q(b),q(d)].map(v=>v.toString(16).padStart(2,'0')).join('')};
function grid7(){
  const a=new Array(256).fill(null);
  const g={a,
    p(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=1&&x<=14&&y>=1&&y<=14)a[y*16+x]=c;return g},
    r(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)g.p(x+i,y+j,c);return g},
    l(x0,y0,x1,y1,c,t){const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx-dy,x=x0,y=y0;for(let n=0;n<64;n++){g.p(x,y,c);if(t>1)g.p(x+1,y,c);if(t>2)g.p(x,y+1,c);if(x===x1&&y===y1)break;const e2=2*e;if(e2>-dy){e-=dy;x+=sx}if(e2<dx){e+=dx;y+=sy}}return g},
    o(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const u=(x-cx)/rx,v=(y-cy)/ry;if(u*u+v*v<=1.05)g.p(x,y,c)}return g},
    ring(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const u=(x-cx)/rx,v=(y-cy)/ry,d=u*u+v*v;if(d<=1.1&&d>=.45)g.p(x,y,c)}return g},
    // a vertical run of pixels used for curved horns and claws: list of [x,y,w]
    run(list,c){for(const[x,y,w]of list)g.r(x,y,w||1,1,c);return g}
  };return g}

const METAL='#9aa0a6',STEEL='#6c7176',DARK='#2e2f31',WOOD='#7a4f2c',BRASS='#d8b050',RED='#c0392b';
// each sprite receives (g, base colour)
const SPR7={
  can:(g,c)=>{g.r(4,4,8,9,c).r(4,3,8,1,'#d0d3d4').r(4,13,8,1,tn7(c,-.35)).r(4,7,8,3,'#e8e0c8').r(5,8,6,1,tn7(c,-.35)).p(6,2,'#aab0b4').p(7,2,'#aab0b4')},
  soda:(g,c)=>{g.r(5,3,6,11,c).r(5,2,6,1,'#c8ccd0').r(5,7,6,3,'#f0e6d0').r(6,8,4,1,RED).r(5,13,6,1,tn7(c,-.4)).p(9,1,'#aab0b4')},
  bread:(g,c)=>{g.o(8,9,6.2,4,c).o(8,8,5,2.5,tn7(c,.18)).l(5,7,6,9,tn7(c,-.35)).l(8,6,9,9,tn7(c,-.35)).l(11,7,12,9,tn7(c,-.35))},
  apple:(g,c)=>{g.o(7,9,4,4.5,c).o(10,9,4,4.5,c).r(7,6,4,6,c).r(8,3,1,3,'#5a3a20').r(9,3,3,2,'#4f9a3a').p(5,7,tn7(c,.45)).p(5,8,tn7(c,.45))},
  carton:(g,c)=>{g.r(4,6,8,8,c).r(4,4,8,2,tn7(c,-.12)).r(5,3,6,1,tn7(c,-.25)).r(5,8,6,4,'#3a6ab0').r(6,9,4,1,'#e8eef4').r(6,11,3,1,'#e8eef4')},
  cookies:(g,c)=>{g.o(6,9,4,4,c).o(10,6,3.4,3.4,tn7(c,.1)).p(5,8,'#4a2a18').p(7,10,'#4a2a18').p(6,7,'#4a2a18').p(10,5,'#4a2a18').p(11,7,'#4a2a18')},
  choco:(g,c)=>{g.r(3,5,10,9,c).r(3,3,10,3,'#c4c8d0').r(4,2,3,1,'#c4c8d0').r(3,8,10,1,tn7(c,.28)).r(3,11,10,1,tn7(c,.28)).r(7,6,1,8,tn7(c,.28)).r(10,6,1,8,tn7(c,.28)).r(4,4,8,1,'#8a8e98')},
  steak:(g,c)=>{g.o(7,8,5.5,4.5,c).o(7,8,3.6,2.6,tn7(c,.22)).r(11,7,3,2,'#ece4d4').p(14,6,'#ece4d4').p(14,9,'#ece4d4').l(4,10,9,6,tn7(c,.5))},
  grilled:(g,c)=>{g.o(7,8,5.5,4.5,c).l(4,6,10,12,tn7(c,-.45)).l(6,5,12,11,tn7(c,-.45)).l(3,8,8,13,tn7(c,-.45)).r(11,7,3,2,'#e8dcc4')},
  rotten:(g,c)=>{g.o(8,9,5.2,4.6,c).p(6,8,tn7(c,.4)).p(9,10,tn7(c,.4)).p(10,7,tn7(c,-.4)).p(7,11,tn7(c,-.4)).p(5,4,'#1c1c18').p(11,3,'#1c1c18').p(9,5,'#1c1c18').l(7,3,7,4,'#7a8a40')},
  bottle:(g,c)=>{g.r(6,2,4,2,'#e0e0e8').r(7,4,2,2,tn7(c,.5)).r(5,6,6,8,c).r(6,7,1,6,tn7(c,.55)).r(5,9,6,2,'#e8f0f4').p(8,10,'#3a6a9a')},
  roll:(g,c)=>{g.r(3,5,10,7,c).r(3,7,10,1,tn7(c,-.22)).r(3,9,10,1,tn7(c,-.22)).o(3,8.5,1.3,3.5,tn7(c,-.1)).r(11,12,3,2,c).r(7,5,2,7,'#d0a0a0').p(8,8,RED)},
  spray:(g,c)=>{g.r(5,7,6,7,c).r(6,5,4,2,'#d4d8da').r(7,3,3,2,'#d4d8da').r(10,3,2,1,'#d4d8da').r(7,9,2,3,'#f0f4f4').p(8,10,RED)},
  pills:(g,c)=>{g.r(5,5,6,9,'#d88a30').r(4,3,8,2,'#f4f4f0').r(5,8,6,4,'#f0e8d8').r(6,9,1,1,c).r(8,9,1,1,c).r(7,11,1,1,c).r(9,11,1,1,c)},
  capsule:(g,c)=>{for(const[x,y,a,b]of[[3,4,'#f0e8f0',c],[3,9,'#f0e8f0',c]]){g.r(x,y,5,3,a).r(x+5,y,5,3,b).p(x,y,null).p(x,y+2,null).p(x+9,y,null).p(x+9,y+2,null)}g.r(4,5,2,1,'#ffffff').r(4,10,2,1,'#ffffff')},
  kit:(g,c)=>{g.r(2,5,12,9,'#f0eee8').r(5,3,6,2,'#8a8a8a').r(6,4,4,1,'#f0eee8').r(7,7,2,6,c).r(5,9,6,2,c).r(2,13,12,1,'#c8c4b8')},
  log:(g,c)=>{g.r(3,5,11,7,c).l(4,6,13,6,tn7(c,-.3)).l(4,9,13,9,tn7(c,-.3)).o(3,8.5,1.8,3.5,tn7(c,.4)).p(3,8,tn7(c,-.2)).p(3,9,tn7(c,-.2)).r(8,4,3,1,tn7(c,-.2))},
  planks:(g,c)=>{g.r(2,4,12,3,c).r(3,8,11,3,tn7(c,-.12)).r(2,12,12,2,c).l(4,5,10,5,tn7(c,-.3)).l(5,9,12,9,tn7(c,-.35)).p(3,5,DARK).p(12,5,DARK).p(4,9,DARK).p(13,9,DARK)},
  nails:(g,c)=>{for(const x of[4,8,11]){g.r(x-1,3,3,1,'#c8ccd0').r(x,4,1,9,c).p(x,13,tn7(c,-.4))}},
  sheet:(g,c)=>{g.r(2,4,12,10,c);for(let x=2;x<14;x+=2)g.r(x,4,1,10,tn7(c,.22));g.p(3,5,DARK).p(12,5,DARK).p(3,12,DARK).p(12,12,DARK)},
  scrap:(g,c)=>{g.o(7,8,4.6,4.6,c).o(7,8,1.6,1.6,null).r(6,2,3,2,c).r(6,12,3,2,c).r(2,7,2,3,c).r(11,7,2,3,c).r(10,10,4,2,'#9a6a4a').r(2,11,3,2,'#6a7a82')},
  tape:(g,c)=>{g.o(8,8,6,6,c).o(8,8,3,3,null).ring(8,8,6,6,tn7(c,-.25)).r(11,12,3,2,tn7(c,.2))},
  rope:(g,c)=>{g.ring(8,8,6,5,c).ring(8,8,3.6,3,tn7(c,.12)).r(3,12,5,1,c).r(2,13,3,1,c).p(10,4,tn7(c,-.35)).p(5,5,tn7(c,-.35)).p(12,9,tn7(c,-.35))},
  cloth:(g,c)=>{g.r(2,5,12,8,c).r(2,8,12,1,tn7(c,-.22)).r(2,11,12,1,tn7(c,-.22)).r(4,5,1,8,tn7(c,.15)).r(10,5,1,8,tn7(c,.15)).p(2,4,c).p(13,4,c)},
  powder:(g,c)=>{g.o(8,10,5,4,'#4a463f').r(7,3,3,4,'#4a463f').r(6,6,5,1,'#c8a050').p(7,10,'#6a665c').p(6,9,'#6a665c').r(7,2,3,1,'#8a6a40')},
  jerry:(g,c)=>{g.r(3,5,10,9,c).r(4,3,4,2,c).r(5,4,2,1,null).r(10,3,2,2,'#2a2a2a').l(4,7,11,12,tn7(c,-.35)).l(11,7,4,12,tn7(c,-.35)).r(3,5,10,1,tn7(c,.25))},
  batt:(g,c)=>{for(const x of[3,9]){g.r(x,5,4,9,c).r(x+1,4,2,1,'#c8c8c8').r(x,10,4,4,'#2a2a2a').r(x,9,4,1,tn7(c,.3))}g.p(4,7,'#2a2a2a').p(10,7,'#2a2a2a')},
  lighter:(g,c)=>{g.r(5,6,6,8,c).r(5,4,6,2,'#c8c8c8').o(8,2,1.3,1.8,'#f0a030').p(8,2,'#fff0a0').r(6,8,1,5,tn7(c,.4))},
  saw:(g,c)=>{g.r(2,5,10,4,c).l(2,9,11,9,DARK);for(let x=2;x<12;x+=2)g.p(x,10,c);g.r(11,4,3,6,WOOD).p(12,6,null).p(12,7,null).r(3,6,8,1,tn7(c,.4))},
  toolbox:(g,c)=>{g.r(2,6,12,8,c).r(2,9,12,1,tn7(c,-.35)).r(5,3,6,1,'#303030').r(5,4,1,2,'#303030').r(10,4,1,2,'#303030').r(7,8,2,3,'#d8c040').r(2,6,12,1,tn7(c,.25))},
  hide:(g,c)=>{g.o(8,8,6,4.6,c).r(2,5,3,2,c).r(12,5,3,2,c).r(3,11,3,2,c).r(11,11,3,2,c).p(7,7,tn7(c,.3)).p(9,9,tn7(c,.3)).p(6,10,tn7(c,-.3)).p(10,6,tn7(c,-.3)).p(5,8,tn7(c,.3))},
  bone:(g,c)=>{g.r(4,7,8,2,c).o(3,6.2,1.6,1.6,c).o(3,9.8,1.6,1.6,c).o(13,6.2,1.6,1.6,c).o(13,9.8,1.6,1.6,c).p(7,7,tn7(c,.4)).p(9,8,tn7(c,-.3))},
  tusk:(g,c)=>{g.run([[10,2,4],[9,3,5],[9,4,4],[8,5,4],[7,6,4],[7,7,3],[6,8,3],[5,9,3],[5,10,2],[4,11,2],[4,12,1],[4,13,1]],c);g.p(12,3,tn7(c,.5)).p(11,4,tn7(c,.5)).p(10,5,tn7(c,.5)).p(9,6,tn7(c,.5)).p(7,8,tn7(c,.5))},
  jewels:(g,c)=>{g.ring(8,10,4.2,4,c).o(8,10,2,2,null).r(6,4,5,3,'#5ac0e0').r(7,3,3,1,'#5ac0e0').p(7,5,'#d8f4ff').p(8,4,'#d8f4ff').r(7,7,3,1,'#3a90b0')},
  amber:(g,c)=>{g.o(8,8,5.4,5,c).o(7,6,3,2,tn7(c,.4)).r(7,8,3,1,'#3a2a10').p(6,8,'#3a2a10').p(10,9,'#3a2a10').p(8,10,'#3a2a10').p(11,5,tn7(c,.6))},
  jacket:(g,c)=>{g.r(4,3,8,11,c).r(1,4,3,8,c).r(12,4,3,8,c).r(6,3,4,2,tn7(c,-.35)).r(8,5,1,9,tn7(c,-.4)).r(4,12,8,2,tn7(c,-.15)).p(2,12,tn7(c,-.4)).p(13,12,tn7(c,-.4))},
  orb:(g,c)=>{g.o(8,8,5.4,5.4,tn7(c,-.35)).o(8,8,4.2,4.2,c).o(8,8,2.2,2.2,tn7(c,.45)).p(6,6,'#f4ffe8').p(5,8,tn7(c,.3))},
  plate:(g,c)=>{g.r(3,4,10,9,c).r(5,6,6,5,tn7(c,-.2)).p(4,5,DARK).p(11,5,DARK).p(4,11,DARK).p(11,11,DARK).r(3,4,10,1,tn7(c,.4)).p(7,8,tn7(c,.5))},
  blade:(g,c)=>{g.r(2,6,9,3,c).r(11,7,2,1,c).p(13,8,c).r(2,6,9,1,tn7(c,.5)).r(1,6,0,0,c).r(10,5,1,5,'#6a6a62').r(11,6,3,3,'#5a3a22').p(12,7,'#3a2414')},
  vial:(g,c)=>{g.r(6,4,4,9,'#cfe4e4').r(6,8,4,5,c).r(6,2,4,2,'#9a7a50').p(7,9,tn7(c,.6)).p(9,11,tn7(c,.6)).p(7,5,'#ffffff')},
  claw:(g,c)=>{g.run([[9,2,4],[9,3,5],[8,4,5],[8,5,4],[7,6,4],[6,7,4],[6,8,3],[5,9,3],[4,10,3],[4,11,2],[3,12,2],[3,13,1]],c);g.p(10,3,tn7(c,.8)).p(9,5,tn7(c,.8)).p(8,6,tn7(c,.8)).p(7,7,tn7(c,.8)).p(6,8,tn7(c,.8))},
  horn:(g,c)=>{g.run([[9,2,5],[8,3,6],[8,4,5],[7,5,5],[7,6,4],[6,7,4],[5,8,4],[5,9,3],[4,10,3],[4,11,2],[3,12,2],[3,13,1]],c);g.r(8,4,5,1,tn7(c,-.3)).r(7,6,4,1,tn7(c,-.3)).r(5,8,4,1,tn7(c,-.3)).r(4,10,3,1,tn7(c,-.3)).p(10,3,tn7(c,.5))},
  gland:(g,c)=>{g.o(8,9,5.2,4,c).o(7,8,2.4,1.8,tn7(c,.4)).l(11,5,12,3,tn7(c,-.3)).l(4,5,3,3,tn7(c,-.3)).p(10,10,tn7(c,-.45)).p(5,11,tn7(c,-.45)).p(11,7,tn7(c,.55))},
  tea:(g,c)=>{g.r(3,7,8,7,'#ece6da').r(3,7,8,2,c).r(11,8,3,1,'#ece6da').r(13,9,1,2,'#ece6da').r(11,11,2,1,'#ece6da').p(5,4,'#d8dcdc').p(6,3,'#d8dcdc').p(8,4,'#d8dcdc').p(9,2,'#d8dcdc').p(6,5,'#d8dcdc')},
  jerky:(g,c)=>{g.r(2,4,11,3,c).r(3,8,11,3,tn7(c,-.12)).r(2,12,10,2,c).l(4,5,9,5,tn7(c,.35)).l(5,9,11,9,tn7(c,.35)).p(13,5,'#c8b898').p(12,12,'#c8b898')},
  fanny:(g,c)=>{g.r(1,5,14,1,DARK).r(3,6,10,7,c).r(3,8,10,1,tn7(c,-.4)).r(7,9,2,2,'#c8c8c0').r(3,6,10,1,tn7(c,.25))},
  pack:(g,c)=>{g.r(4,4,8,10,c).r(5,9,6,4,tn7(c,-.2)).r(7,2,2,2,tn7(c,-.35)).r(4,8,8,1,tn7(c,-.4)).r(7,10,2,1,'#c8c8c0').r(3,6,1,6,tn7(c,-.3)).r(12,6,1,6,tn7(c,-.3)).r(4,4,8,1,tn7(c,.3))},
  campack:(g,c)=>{g.r(4,5,8,9,c).r(3,2,10,3,'#8a7a50').l(4,3,12,3,tn7(c,-.3)).r(5,9,6,4,tn7(c,-.2)).r(2,8,2,5,tn7(c,-.15)).r(12,8,2,5,tn7(c,-.15)).r(7,10,2,1,'#c8c8c0')},
  duffel:(g,c)=>{g.r(2,6,12,7,c).r(5,4,6,1,DARK).r(5,5,1,1,DARK).r(10,5,1,1,DARK).r(2,8,12,1,tn7(c,-.35)).r(10,9,3,3,'#8a8a6a').r(2,6,12,1,tn7(c,.25))},
  tacpack:(g,c)=>{g.r(4,3,8,11,c).r(5,5,6,2,tn7(c,.15)).r(5,8,6,2,tn7(c,.15)).r(5,11,6,2,tn7(c,.15)).r(3,6,1,6,tn7(c,-.3)).r(12,6,1,6,tn7(c,-.3)).r(7,2,2,1,DARK);for(let x=5;x<11;x+=2){g.p(x,6,tn7(c,-.4)).p(x,9,tn7(c,-.4)).p(x,12,tn7(c,-.4))}},
  engine:(g,c)=>{g.r(3,7,10,7,c).r(4,3,2,4,'#b4b8bc').r(7,3,2,4,'#b4b8bc').r(10,3,2,4,'#b4b8bc').r(4,2,2,1,'#e0e0e0').r(7,2,2,1,'#e0e0e0').r(10,2,2,1,'#e0e0e0').r(3,10,10,1,tn7(c,-.4)).p(5,12,tn7(c,.4)).p(10,12,tn7(c,.4))},
  radio:(g,c)=>{g.r(2,6,12,8,c).l(12,6,13,1,'#c8c8c8').r(3,8,5,5,tn7(c,-.35));for(let y=9;y<13;y+=2)g.r(3,y,5,1,tn7(c,.2));g.o(10.5,9.5,1.8,1.8,'#d8c040').r(9,12,4,1,'#8a8a82').p(10,9,'#fff4a0')},
  // ----- weapons (muzzle to the right) -----
  w_pistol:(g)=>{g.r(3,5,10,3,'#8a8e92').r(3,5,10,1,'#b6babe').r(12,6,1,1,DARK).r(4,8,3,6,'#4a3a2c').r(7,8,2,1,DARK).p(8,9,DARK).p(5,4,DARK).r(12,5,1,1,'#b6babe')},
  w_revolver:(g)=>{g.r(7,5,7,2,'#a2a6aa').r(4,5,4,4,'#8a8e92').o(6.5,7,2,2,'#6a6e72').r(3,8,3,6,'#6a4a2c').p(4,4,DARK).r(7,7,3,1,'#6a6e72').p(8,8,DARK)},
  w_shotgun:(g)=>{g.r(1,5,13,2,'#4a4d50').r(2,7,9,1,'#34363a').r(1,7,4,4,'#7a4a2a').r(3,11,2,2,'#7a4a2a').r(6,7,4,2,'#8a5a30').r(5,5,3,3,'#5a5d60').p(8,9,DARK).r(1,5,13,1,'#6a6e72')},
  w_rifle:(g)=>{g.r(1,7,5,3,'#7a4a2a').r(6,7,8,1,'#3a3c3e').r(6,8,5,2,'#4a4d50').r(5,5,6,2,'#2a2a2a').p(11,6,'#7ac0e0').p(5,6,'#7ac0e0').r(2,10,2,2,'#7a4a2a').p(9,10,DARK)},
  w_assault:(g)=>{g.r(1,6,3,3,'#2e3032').r(4,5,6,3,'#3a3d40').r(10,6,4,1,'#2a2a2a').r(9,5,3,3,'#4a4d50').r(6,8,2,5,'#2a2c2e').p(5,4,'#2a2a2a').p(11,4,'#2a2a2a').r(4,5,6,1,'#5a5d60').p(4,9,DARK)},
  w_knife:(g)=>{g.r(7,6,6,2,'#d4d8dc').p(13,7,'#d4d8dc').r(7,6,6,1,'#f4f8fa').r(6,5,1,5,'#8a8a8a').r(2,6,4,3,'#4a3020').p(3,7,'#6a4a30')},
  w_pan:(g)=>{g.o(5.5,8,4.2,4.2,'#2a2a2a').o(5.5,8,3.2,3.2,'#3e3e40').r(9,7,5,2,'#2a2a2a').p(13,8,null).p(7,6,'#5a5a5e')},
  w_bat:(g)=>{g.l(3,13,12,4,'#b08a58',2).o(11,4,2,2,'#c8a068').p(3,13,'#6a4a2c').p(2,13,'#6a4a2c').l(5,11,9,7,'#d8b880')},
  w_hammer:(g)=>{g.l(3,13,10,5,WOOD,2).r(7,2,7,3,'#8a8e92').r(7,2,7,1,'#b6babe').r(12,5,2,1,'#6a6e72').p(6,3,'#6a6e72')},
  w_crowbar:(g)=>{g.l(3,13,12,4,'#5a5e62',2).p(12,3,'#5a5e62').p(13,3,'#5a5e62').p(13,4,'#5a5e62').r(2,13,2,1,RED).p(3,12,RED)},
  w_machete:(g)=>{g.l(3,12,12,3,'#c8ccd0',2).l(4,13,12,5,'#8a8e92').r(2,12,3,2,'#4a3020').p(1,13,'#4a3020').p(12,3,'#e8eef0')},
  w_axe:(g)=>{g.l(3,13,11,3,WOOD,2).r(9,2,5,6,'#8a8e92').r(12,2,2,6,'#c4c8cc').r(9,2,1,6,'#6a6e72').p(8,4,'#6a6e72')},
  w_spear:(g)=>{g.l(2,13,12,3,'#a07a48').r(12,1,2,1,'#c8ccd0').r(12,2,2,2,'#c8ccd0').r(11,3,3,2,'#d8dcdf').p(13,1,'#ffffff').p(11,4,'#8a8e92')},
  w_crossbow:(g)=>{g.r(2,5,12,1,'#6a4a28').r(1,6,2,2,'#6a4a28').r(13,6,2,2,'#6a4a28').r(6,5,3,9,'#7a4a2a').l(2,7,7,10,'#d8d4c8').l(14,7,9,10,'#d8d4c8').r(7,2,1,6,'#b0b4b8').p(7,1,'#d8dcdf')},
  w_combat:(g)=>{g.r(1,5,13,2,'#3a3d40').r(2,7,10,2,'#2a2c2e').r(1,7,4,4,'#4a3a2c').r(3,11,2,2,'#4a3a2c').r(5,5,3,3,'#4a4d50').r(8,9,2,1,DARK).r(1,5,13,1,'#5a5d60').p(7,10,DARK)},
  w_sniper:(g)=>{g.r(1,7,5,3,'#3a3d40').r(6,7,8,1,'#2a2a2a').r(6,8,4,2,'#4a4d50').r(4,4,8,2,'#1e1f20').p(11,5,'#7ac0e0').p(4,5,'#7ac0e0').r(12,8,1,3,DARK).r(14,8,0,0,DARK).r(2,10,2,2,'#3a3d40')},
  w_mg:(g)=>{g.r(1,6,3,3,'#3a3d40').r(4,5,6,3,'#4a4d50').r(10,5,4,3,'#6a6e72').r(10,6,4,1,'#2a2a2a').r(5,8,5,5,'#4a5a30').r(11,8,1,4,DARK).r(13,8,1,4,DARK).p(6,10,'#d8b050').p(8,10,'#d8b050')},
  w_launcher:(g)=>{g.r(2,5,11,4,'#4a5036').r(13,4,1,6,'#2a2a2a').r(2,5,11,1,'#6a7248').r(6,9,2,4,'#2a2a2a').r(3,3,3,2,'#2a2a2a').r(4,9,1,3,'#3a3a3a').p(11,6,'#7ac0e0')},
  w_katana:(g)=>{g.l(3,12,13,2,'#d8dcdf').l(4,13,13,3,'#9aa0a4').r(1,13,3,2,'#2a2a30').p(4,12,'#c8a040').p(5,11,'#c8a040').p(2,14,DARK)},
  w_maul:(g)=>{g.l(3,13,10,6,WOOD,2).r(3,2,10,5,'#6c6c72').r(3,2,10,1,'#9a9aa0').r(3,6,10,1,'#4a4a50').r(2,3,1,3,'#8a8a90').r(13,3,1,3,'#8a8a90')},
  // ----- ammunition -----
  a_pistol:(g)=>{for(const x of[3,7,11]){g.r(x,8,3,5,BRASS).r(x,6,3,2,'#c8794a').r(x,12,3,1,tn7(BRASS,-.35)).p(x,8,tn7(BRASS,.4))}},
  a_revolver:(g)=>{for(const x of[3,9]){g.r(x,7,4,6,BRASS).r(x,4,4,3,'#a8a8a0').r(x,12,4,1,tn7(BRASS,-.35)).p(x,7,tn7(BRASS,.4))}},
  a_shell:(g)=>{for(const x of[2,6,10]){g.r(x,4,3,8,RED).r(x,11,3,3,BRASS).r(x,4,3,1,tn7(RED,-.35)).p(x,5,tn7(RED,.4))}},
  a_rifle:(g)=>{for(const x of[3,7,11]){g.r(x,9,3,5,BRASS).r(x,4,3,5,'#b8764a').r(x,13,3,1,tn7(BRASS,-.35)).p(x+1,3,'#b8764a')}},
  a_assault:(g)=>{for(const x of[3,7,11]){g.r(x,8,3,5,'#a8a8a0').r(x,4,3,4,'#4f8a3a').p(x+1,3,'#4f8a3a').r(x,12,3,1,tn7('#a8a8a0',-.35))}},
  a_bolt:(g)=>{for(const y of[4,8,12]){g.r(2,y,10,1,'#a07a48').r(12,y-1,2,3,'#c8ccd0').p(14,y,'#c8ccd0').r(2,y-1,1,3,'#d8d4c8')}},
  a_p50:(g)=>{for(const x of[3,9]){g.r(x,8,4,6,BRASS).r(x,3,4,5,'#a0a0a0').p(x+1,2,'#a0a0a0').p(x+2,2,'#a0a0a0').r(x,13,4,1,tn7(BRASS,-.35)).p(x,8,tn7(BRASS,.4))}},
  a_grenade:(g)=>{g.o(8,9,4.4,4.6,'#4a5a30').r(6,3,4,2,'#9a9a90').r(10,3,3,1,'#9a9a90').p(13,4,'#9a9a90').l(5,7,11,7,'#34402a').l(5,10,11,10,'#34402a').p(6,8,'#7a8a50')},
  box:(g,c)=>{g.r(3,4,10,9,c).r(3,4,10,1,tn7(c,.3)).r(3,8,10,1,tn7(c,-.3)).p(8,10,'#fff')}
};
const IMAP7={
  lata:['can'],pan:['bread'],fruta:['apple'],leche:['carton'],galletitas:['cookies'],chocolate:['choco'],carne:['steak'],asada:['grilled'],podrida:['rotten'],
  agua:['bottle'],gaseosa:['soda'],venda:['roll'],desinfectante:['spray'],analgesicos:['pills'],antibioticos:['capsule'],medicina:['kit'],
  madera:['log'],tablas:['planks'],clavos:['nails'],chapa:['sheet'],chatarra:['scrap'],cinta:['tape'],cuerda:['rope'],tela:['cloth'],polvora:['powder'],combustible:['jerry'],
  pilas:['batt'],encendedor:['lighter'],serrucho:['saw'],herramientas:['toolbox'],cuero:['hide'],hueso:['bone'],colmillo:['tusk'],joyas:['jewels'],ambar:['amber'],
  rinonera:['fanny'],mochila_e:['pack'],mochila_c:['campack'],bolso_m:['duffel'],campera:['jacket'],nucleo:['orb'],placa:['plate'],cuchilla:['blade'],muestra:['vial'],
  garra:['claw'],cuerno:['horn'],glandula:['gland'],te:['tea'],charqui:['jerky'],mochila_t:['tacpack'],kit_motor:['engine'],radio:['radio'],
  'w:pistola':['w_pistol'],'w:revolver':['w_revolver'],'w:escopeta':['w_shotgun'],'w:rifle':['w_rifle'],'w:fusil':['w_assault'],'w:cuchillo':['w_knife'],'w:sarten':['w_pan'],
  'w:bate':['w_bat'],'w:martillo':['w_hammer'],'w:palanca':['w_crowbar'],'w:machete':['w_machete'],'w:hacha':['w_axe'],'w:lanza':['w_spear'],'w:ballesta':['w_crossbow'],
  'w:escopetac':['w_combat'],'w:francotirador':['w_sniper'],'w:ametralladora':['w_mg'],'w:lanzagranadas':['w_launcher'],'w:katana':['w_katana'],'w:mazo':['w_maul'],
  'ammo:balas':['a_pistol'],'ammo:revolver':['a_revolver'],'ammo:cartuchos':['a_shell'],'ammo:rifle':['a_rifle'],'ammo:fusil':['a_assault'],'ammo:virotes':['a_bolt'],
  'ammo:p50':['a_p50'],'ammo:granadas':['a_grenade']
};
function baseColor7(key){if(ITEMS[key])return ITEMS[key].c;return'#9aa0a6'}
function canvas7(key){
  if(IC7[key])return IC7[key].cv;
  const m=IMAP7[key],fn=SPR7[m?m[0]:'box'],c=baseColor7(key);
  const g=grid7();try{fn(g,c)}catch(e){console.error('icon',key,e)}
  const a=g.a,out=a.slice();
  // bevel: light on the top/left rim, dark on the bottom/right rim
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=a[y*16+x];if(!v)continue;
    const up=y>0?a[(y-1)*16+x]:null,dn=y<15?a[(y+1)*16+x]:null,lf=x>0?a[y*16+x-1]:null,rt=x<15?a[y*16+x+1]:null;
    let f=0;if(!up)f+=.2;if(!lf)f+=.1;if(!dn)f-=.22;if(!rt)f-=.12;if(f)out[y*16+x]=tn7(v,f)}
  // outline
  const OUT='#16120d';
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(a[y*16+x])continue;
    const nb=(x>0&&a[y*16+x-1])||(x<15&&a[y*16+x+1])||(y>0&&a[(y-1)*16+x])||(y<15&&a[(y+1)*16+x]);if(nb)out[y*16+x]=OUT}
  const cv=document.createElement('canvas');cv.width=cv.height=16;const cx=cv.getContext('2d');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=out[y*16+x];if(v){cx.fillStyle=v;cx.fillRect(x,y,1,1)}}
  IC7[key]={cv,url:null};return cv}
function iconUrl7(key){canvas7(key);const e=IC7[key];return e.url||(e.url=e.cv.toDataURL())}
const ico=(key)=>`<img class="ico" alt="" src="${iconUrl7(key)}">`;

// ---------- 3D: sprites for dropped items, boxes for shelf goods ----------
const SPM7={},SHM7={};
function spriteMat7(key){if(SPM7[key])return SPM7[key];const tx=new T3.CanvasTexture(canvas7(key));tx.magFilter=T3.NearestFilter;tx.minFilter=T3.NearestFilter;tx.generateMipmaps=false;
  return SPM7[key]=new T3.MeshBasicMaterial({map:tx,alphaTest:.5,side:T3.DoubleSide})}
const PLANE7=new T3.PlaneGeometry(1,1);
function shelfMat7(key){if(SHM7[key])return SHM7[key];const tx=new T3.CanvasTexture(canvas7(key));tx.magFilter=T3.NearestFilter;tx.minFilter=T3.NearestFilter;tx.generateMipmaps=false;
  return SHM7[key]=new T3.MeshLambertMaterial({map:tx,alphaTest:.5,emissive:0x2a2a2a})}
const _spawnPickup7=spawnPickup;spawnPickup=function(x,z,item,qty){_spawnPickup7(x,z,item,qty);
  const p=pickups[pickups.length-1];if(!p||p.item!==item)return;
  const sp=new T3.Mesh(PLANE7,spriteMat7(item));
  sp.position.copy(p.mesh.position);sp.position.y+=.12;sp.scale.set(.8,.8,.8);p.by=.12;scene.remove(p.mesh);scene.add(sp);p.mesh=sp};
const _refreshShelves7=refreshShelves;refreshShelves=function(){_refreshShelves7();
  shelfUnits.forEach((u,i)=>{const sh=S.shelves[i];u.prods.forEach((m,j)=>{if(!m.flat7){m.flat7=1;m.scale.set(.44,.44,.1);m.position.z=.41;m.position.y+=.05;m.castShadow=false}if(sh&&sh.item&&m.visible)m.material=shelfMat7(sh.item)})})};
// dim the unlit sprites at night so they sit in the scene
let sprT7=0;const _update7=update;update=function(dt){_update7(dt);if(!S||gstate!=='play')return;
  // dropped items are flat pixel sprites that always turn to face you (rotating around the vertical axis only)
  for(const p of pickups){const m=p.mesh;m.position.y+=.12;m.rotation.set(0,Math.atan2(camera.position.x-m.position.x,camera.position.z-m.position.z),0)}
  sprT7-=dt;if(sprT7>0)return;sprT7=.5;
  const k=1-.62*darkness();for(const m of Object.values(SPM7))m.color.setScalar(k)};
