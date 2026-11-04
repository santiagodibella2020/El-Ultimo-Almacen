/* v0.9: look "shooter táctico" - nítido, limpio, colores vivos, menos niebla turbia */
const CS9={fog:.5};
(function(){
  if(T3.Texture&&T3.Texture.DEFAULT_ANISOTROPY!==undefined)T3.Texture.DEFAULT_ANISOTROPY=16;
})();
const _render9=render;
render=function(dt){
  // grade más limpio: poco bloom, viñeta suave, más saturación y contraste
  try{if(typeof post8!=='undefined'&&post8.mats&&post8.mats.comp){const u=post8.mats.comp.uniforms;u.bloom.value=.2;u.vig.value=.28;u.sat.value=1.24;u.contrast.value=.5}}catch(e){}
  // niebla más liviana: se ve lejos y definido (menos "sopa" gris)
  if(scene.fog&&!scene.fog.__c9){scene.fog.__c9=1}
  if(scene.fog&&S){scene.fog.density=Math.min(scene.fog.density,.0028+darkness()*.012+weatherFx().fog*.6)}
  return _render9(dt)};
const _applyPost9=applyPost;
applyPost=function(){_applyPost9();grainC.style.opacity='0'};
function aniso9(){const mx=renderer.capabilities.getMaxAnisotropy();scene.traverse(o=>{const m=o.material;if(!m)return;(Array.isArray(m)?m:[m]).forEach(mm=>{['map','normalMap','emissiveMap'].forEach(k=>{if(mm[k]&&mm[k].anisotropy!==mx){mm[k].anisotropy=mx;mm[k].needsUpdate=true}})})})}
const _genWorld9=genWorld;
genWorld=function(){const r=_genWorld9.apply(this,arguments);try{aniso9()}catch(e){}return r};
// resolución interna más alta en calidad alta (RTX): píxeles nítidos
const _setQual9=typeof applyQuality==='function'?applyQuality:null;
if(_setQual9){applyQuality=function(){const r=_setQual9.apply(this,arguments);if(settings.qual==='alta'){renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)*settings.res);resize()}return r}}
