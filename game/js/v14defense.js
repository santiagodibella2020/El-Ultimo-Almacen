/* v0.14: defensa del almacén más profunda - alambre de púas, minas caseras y noches de asedio */
Object.assign(BUILDS,{
  alambre:{n:'Alambre de púas',d:'Frena mucho y lastima a lo que intente cruzarlo.',cost:{chatarra:2,cuerda:1}},
  mina:{n:'Mina casera',d:'Explota cuando un bicho la pisa. Se usa una sola vez.',cost:{polvora:2,chatarra:1,clavos:3}}
});
BORDER.push('alambre','mina');
const _placeBuild14=placeBuild;
placeBuild=function(t,x,z,rot,hp,silent){const b=_placeBuild14.apply(this,arguments);const g=b&&b.mesh;if(!g)return b;
  if(t==='alambre'){for(const s of[-1.3,0,1.3]){bx(.08,.9,.08,'#4a3a28',s,.45,0,g)}for(let r=0;r<3;r++){const w=bx(2.8,.03,.03,'#8a8a84',0,.25+r*.25,0,g);w.rotation.x=r*.6}
    for(let i=0;i<14;i++)bx(.06,.06,.06,'#6a6a64',-1.3+i*.2,.25+(i%3)*.25,0,g)}
  else if(t==='mina'){bx(.5,.12,.5,'#3a3a32',0,.06,0,g,CYL);bx(.12,.05,.12,'#8a2a1a',0,.14,0,g,CYL);bx(.04,.1,.04,'#aaa',.1,.16,0,g)}
  return b};
let def14T=0;
const _update14d=update;
update=function(dt){_update14d(dt);if(gstate!=='play'||!S)return;
  // trampas
  for(const b of builds){if(b.t!=='alambre'&&b.t!=='mina')continue;
    for(const e of enemies){if(e.dead||e.dying)continue;const d=EDEF[e.type];if(d.neutral)continue;
      const lx=e.x-b.x,lz=e.z-b.z,c=Math.cos(b.rot),s=Math.sin(b.rot),ax=lx*c-lz*s,az=lx*s+lz*c;
      if(b.t==='alambre'&&Math.abs(ax)<1.5&&Math.abs(az)<.6){const sp=d.speed||2;e.x-=Math.sin(e.yaw)*sp*dt*.7;e.z-=Math.cos(e.yaw)*sp*dt*.7;e.hp-=10*dt;if(e.hp<=0){killEnemy(e,L('Alambre de púas'),false)}}
      if(b.t==='mina'&&!b.used&&Math.hypot(lx,lz)<1.1){b.used=true;explode(b.x,b.y+.3,b.z,4.5,170,'p');removeBuild(b);break}}}
  // noches de asedio: cada 7 días, horda grande y un jefe de la bruma
  if((def14T-=dt)>0)return;def14T=1;const h=hourOf(S.t),siege=S.day%7===0;S.siege14=S.siege14||{};
  if(siege&&h>=8&&h<9&&!S.siege14['w'+S.day]){S.siege14['w'+S.day]=1;toast(L('Esta noche hay asedio: la bruma trae el doble de podridos y un jefe. Prepará el almacén.'),'#cc4b30',9)}
  if(siege&&h>=20.05&&h<21&&!S.siege14['n'+S.day]){S.siege14['n'+S.day]=1;hordeLeft=Math.round(hordeLeft*1.8)+4;const bosses=['sargento','matarife','paciente','alfa'];spawnHordeGroup(bosses[(S.day/7|0)%bosses.length]);sfx('roar');shake=.5;toast(L('¡Asedio! Aguantá hasta el amanecer.'),'#cc4b30',7)}
  if(S.day%7===1&&S.day>1&&h>=5.1&&h<6&&S.siege14['n'+(S.day-1)]&&!S.siege14['r'+S.day]){S.siege14['r'+S.day]=1;const pay=150+S.day*20;S.money+=pay;gainXp(60);sfx('goal');toast(L('Aguantaste el asedio. La gente de la ruta te manda ${n} y te tiene más respeto.',{n:pay}),'#8fbb62',8);S.rep=Math.min(20,S.rep+1)}
};
