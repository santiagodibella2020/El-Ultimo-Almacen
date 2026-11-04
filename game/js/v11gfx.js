/* v0.11: gradación "táctica": más apagado y con más contraste, sombras profundas y definidas */
sun.shadow.mapSize.set(4096,4096);sun.shadow.radius=2;sun.shadow.normalBias=.02;
const _applyLighting11=applyLighting;
applyLighting=function(){_applyLighting11();
  if(!S)return;
  // más sol y menos luz de cielo => sombras marcadas (aspecto más "duro" de shooter táctico)
  sun.intensity*=1.25;hemi.intensity*=.85;
};
const _render11=render;
render=function(dt){
  try{if(post8&&post8.mats&&post8.mats.comp){const u=post8.mats.comp.uniforms;u.sat.value=.98;u.contrast.value=.62;u.vig.value=.22;u.bloom.value=.14;u.sharp.value=1.1}}catch(e){}
  try{if(typeof grassInst!=='undefined'&&grassInst&&!grassInst.userData.t11){grassInst.userData.t11=1;grassInst.material.color.setRGB(.68,.74,.6)}}catch(e){}
  return _render11(dt)};
