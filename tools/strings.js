// Lists every Spanish source string the game translates, and checks the lang files.
// Usage: node tools/strings.js            -> writes tools/strings.txt
//        node tools/strings.js check      -> missing/extra keys per language
const fs=require('fs'),path=require('path'),vm=require('vm');
const G=path.join(__dirname,'..','game');
const set=new Set();const add=s=>{if(typeof s==='string'&&s.trim())set.add(s)};
// 1. L('...') literals in the code
for(const f of fs.readdirSync(path.join(G,'js'))){const src=fs.readFileSync(path.join(G,'js',f),'utf8');
  for(const m of src.matchAll(/\bL\(\s*'((?:[^'\\]|\\.)*)'/g))add(m[1].replace(/\\'/g,"'"));
  for(const m of src.matchAll(/\badd\('([^']+)'/g))add(m[1]); // statuses
}
// 2. data tables
const ctx={S:null,skLv:()=>0,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(G,'js','data.js'),'utf8').replace(/^'use strict';/,'')+';this.D={ITEMS,CATS,WEAP,AMMO_N,EDEF,CONT,UPG,RECIPES,BUILDS,PERKS,SKILLS,GOALS,SHOP,SANDBOX,PRESETS,VEH,LAIRS,SUMMONS,SEASONS,MONTHS};',ctx);
const D=ctx.D;
for(const t of [D.ITEMS,D.WEAP,D.EDEF,D.CONT,D.UPG,D.BUILDS,D.SKILLS,D.SANDBOX,D.PRESETS])for(const v of Object.values(t)){add(v.n);add(v.d);if(v.o)v.o.forEach(add)}
for(const t of [D.RECIPES,D.PERKS,D.GOALS,D.SHOP])for(const v of t){add(v.n);add(v.d)}
Object.values(D.CATS).forEach(add);Object.values(D.AMMO_N).forEach(add);
for(const t of [D.VEH,D.LAIRS,D.SUMMONS,D.SEASONS])for(const v of Object.values(t)){add(v.n);add(v.d);add(v.msg)}D.MONTHS.forEach(add);
const world=fs.readFileSync(path.join(G,'js','world.js'),'utf8'),game=fs.readFileSync(path.join(G,'js','game.js'),'utf8'),menus=fs.readFileSync(path.join(G,'js','menus.js'),'utf8'),ui=fs.readFileSync(path.join(G,'js','ui.js'),'utf8');
for(const m of world.matchAll(/\bn:'([^']+)'/g))add(m[1]);
for(const m of game.matchAll(/\bn:'([^']+)'/g))add(m[1]);
const v6=fs.readFileSync(path.join(G,'js','v6.js'),'utf8');
for(const m of v6.matchAll(/\b(?:n|d|role|hi|txt|ask|thanks|tx|hint|label):'((?:[^'\\]|\\.)*)'/g))add(m[1].replace(/\\'/g,"'"));
for(const m of world.matchAll(/const types=\[([^\]]+)\]/g))m[1].match(/'([^']+)'/g).forEach(s=>add(s.slice(1,-1)));
for(const m of menus.matchAll(/\['([A-ZÁÉÍÓÚÑa-záéíóúñ ][^']+)',st\./g))add(m[1]);
for(const m of ui.matchAll(/const DIRS=\{([^}]+)\}/g))m[1].match(/'([^']+)'/g).forEach(s=>add(s.slice(1,-1)));
// 3. static HTML
const html=fs.readFileSync(path.join(G,'index.html'),'utf8');
for(const m of html.matchAll(/<([a-z0-9]+)([^>]*)\sdata-t(?:="")?(\s[^>]*)?>([^<]*)</g))add(m[4].trim());
for(const m of html.matchAll(/data-tl="([^"]+)"/g))add(m[1]);
add('El Último Almacén');add('No se pudo generar el mundo: ');['Cansado','Agotado'].forEach(add);
const list=[...set].filter(s=>!/^[\d\s.·×→←$%°+\-:]+$/.test(s)&&s!=='REX');
if(process.argv[2]==='check'){
  for(const f of fs.readdirSync(path.join(G,'lang'))){const c={I18N:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(G,'lang',f),'utf8'),c);const code=f.replace('.js','');const d=c.I18N[code]||{};
    const miss=list.filter(s=>!(s in d)),extra=Object.keys(d).filter(k=>!set.has(k));
    const badVars=list.filter(s=>d[s]&&JSON.stringify((s.match(/\{\w+\}/g)||[]).sort())!==JSON.stringify((d[s].match(/\{\w+\}/g)||[]).sort()));
    console.log(code,'missing',miss.length,'extra',extra.length,'badVars',badVars.length);if(process.argv[3]===code){console.log('MISSING',miss);console.log('EXTRA',extra);console.log('BADVARS',badVars)}}
}else{fs.writeFileSync(path.join(__dirname,'strings.txt'),list.join('\n')+'\n');console.log(list.length,'strings')}
