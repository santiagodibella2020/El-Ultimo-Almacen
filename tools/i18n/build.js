// Compiles tools/i18n/<lang>.txt ("N|translation", N = line in source.txt)
// into game/lang/<lang>.js. Strings added after the freeze go in <lang>.extra.json
// as { "texto en español": "translation" }.
const fs=require('fs'),path=require('path');
const D=__dirname,OUT=path.join(D,'..','..','game','lang');
const src=fs.readFileSync(path.join(D,'source.txt'),'utf8').split('\n');
for(const f of fs.readdirSync(D).filter(f=>/^[a-z]{2}\.txt$/.test(f))){
  const code=f.slice(0,2),dict={};let bad=0;
  for(const line of fs.readFileSync(path.join(D,f),'utf8').split('\n')){
    const m=line.match(/^(\d+)\|(.*)$/);if(!m)continue;const k=src[+m[1]-1];if(k===undefined){bad++;continue}
    const kv=(k.match(/\{\w+\}/g)||[]).sort().join(),tv=(m[2].match(/\{\w+\}/g)||[]).sort().join();
    if(kv!==tv){console.warn(code,m[1],'placeholders differ:',k,'=>',m[2]);bad++}
    dict[k]=m[2]}
  const ex=path.join(D,code+'.extra.json');if(fs.existsSync(ex))Object.assign(dict,JSON.parse(fs.readFileSync(ex,'utf8')));
  fs.writeFileSync(path.join(OUT,code+'.js'),`I18N.${code}=${JSON.stringify(dict)};\n`);
  console.log(code,Object.keys(dict).length,'strings',bad?bad+' problems':'')}
