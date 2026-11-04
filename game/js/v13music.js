/* v0.13: música dinámica procedural (día tranquilo, noche tensa, combate con percusión) */
const MUS13={on:false,next:0,beat:0,chord:0,g:{},lvl:{day:0,night:0,fight:0}};
const N13=n=>440*Math.pow(2,(n-69)/12);
const CH13=[[50,57,62,65],[46,53,58,62],[41,48,57,60],[48,55,60,64]];   // Dm, Bb, F, C
const NCH13=[[38,45,50,56],[38,44,50,53]];                              // drones nocturnos con tritono
const PENT13=[62,65,67,69,72,74,77];
function musInit13(){if(MUS13.on||!AC)return;MUS13.on=true;
  MUS13.bus=AC.createGain();MUS13.bus.connect(MASTER);
  for(const k of['day','night','fight']){const g=AC.createGain();g.gain.value=0;g.connect(MUS13.bus);MUS13.g[k]=g}
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.connect(MUS13.g.day);MUS13.dayLP=lp;
  const lpn=AC.createBiquadFilter();lpn.type='lowpass';lpn.frequency.value=420;lpn.connect(MUS13.g.night);MUS13.nightLP=lpn;
  // eco suave para las notas sueltas
  const dl=AC.createDelay(1);dl.delayTime.value=.42;const fb=AC.createGain();fb.gain.value=.32;dl.connect(fb);fb.connect(dl);dl.connect(MUS13.g.day);MUS13.echo=dl;
  MUS13.next=AC.currentTime+.2}
function pad13(notes,t,dur,dest,vol){for(const n of notes)for(const det of[-6,6]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=N13(n);o.detune.value=det;const g=AC.createGain();
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.35);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05)}}
function pluck13(n,t,vol){const o=AC.createOscillator();o.type='triangle';o.frequency.value=N13(n);const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+1.6);o.connect(g);g.connect(MUS13.g.day);g.connect(MUS13.echo);o.start(t);o.stop(t+1.7)}
function kick13(t,vol){const o=AC.createOscillator();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.18);const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(MUS13.g.fight);o.start(t);o.stop(t+.32)}
function tom13(t,vol){const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=180;f.Q.value=3;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);s.connect(f);f.connect(g);g.connect(MUS13.g.fight);s.start(t,R()*1.5);s.stop(t+.22)}
function bass13(n,t,vol){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=N13(n);const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=380;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(f);f.connect(g);g.connect(MUS13.g.fight);o.start(t);o.stop(t+.22)}
function musTick13(){
  if(!AC||!S)return;musInit13();if(!MUS13.on)return;
  const vol=.55*(settings.amb==null?1:settings.amb);MUS13.bus.gain.setTargetAtTime(gstate==='menu'?vol*.6:vol,AC.currentTime,.5);
  // intensidad según la situación
  const dk=darkness();let threat=0;for(const e of enemies){if(e.dead||e.dying||!e.aggro||EDEF[e.type].neutral)continue;const d=Math.hypot(e.x-P.x,e.z-P.z);if(d<35)threat+=EDEF[e.type].boss?3:EDEF[e.type].mini?2:1}
  const fight=threat>=2||(threat>=1&&dk>.5)?1:0;
  const tg={day:fight?0:(1-dk)*.9,night:fight?.25:dk,fight};const now=AC.currentTime;
  for(const k in tg){MUS13.lvl[k]+=(tg[k]-MUS13.lvl[k])*.08;MUS13.g[k].gain.setTargetAtTime(MUS13.lvl[k],now,.6)}
  // programar un compás adelante
  const BEAT=fight?.32:.5;if(MUS13.next<now-.1)MUS13.next=now+.05;
  while(MUS13.next<now+.6){const t=MUS13.next,b=MUS13.beat++;
    if(b%16===0){MUS13.chord=(MUS13.chord+1)%4;const dur=BEAT*16;pad13(CH13[MUS13.chord],t,dur,MUS13.dayLP,.028);pad13(NCH13[(b/16|0)%2],t,dur,MUS13.nightLP,.035)}
    if(MUS13.lvl.day>.05&&R()<.28)pluck13(PENT13[R()*PENT13.length|0]-(R()<.3?12:0),t,.09);
    if(MUS13.lvl.night>.05&&b%8===4&&R()<.5)pluck13(NCH13[0][R()*4|0]+12,t,.05);
    if(MUS13.lvl.fight>.05){if(b%2===0)kick13(t,.5);if(b%4===3)tom13(t,.35);bass13(CH13[MUS13.chord][0]-12+(b%4===2?7:0),t,.22)}
    MUS13.next+=BEAT}}
let musT13=0;
const _render13m=render;
render=function(dt){try{if((musT13-=dt)<=0){musT13=.25;musTick13()}}catch(e){}return _render13m(dt)};
