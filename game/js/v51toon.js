'use strict';
/* v0.51 (prueba): estilo caricaturesco.
   - Luz en bandas (sombreado tipo dibujo) para todos los materiales con luz: Lambert, Phong y Standard.
   - Texturas suavizadas: se mezcla cada textura con su versión borrosa, así se ve más "pintada" y menos foto.
   - Contornos oscuros alrededor de los objetos, sacados del buffer de profundidad en el pase final.
   - Cielo azul fuerte, niebla clara y celeste, sombras azuladas en vez de negras, colores saturados.
   settings.style='real' vuelve al look anterior (hay que recargar). */
const TOON51={on:settings.style!=='real',edge:1};

if(TOON51.on){
  // ---------- sombreado en bandas ----------
  const SC=THREE.ShaderChunk;
  SC.common+='\nfloat toon51(float d){return 0.3+smoothstep(-0.04,0.04,d)*0.42+smoothstep(0.3,0.38,d)*0.28;}\n';
  SC.lights_lambert_vertex=SC.lights_lambert_vertex.replace(/saturate\( dotNL \)/g,'toon51( dotNL )').replace(/saturate\( -dotNL \)/g,'toon51( -dotNL )');
  const DN='float dotNL = saturate( dot( geometry.normal, directLight.direction ) );',DT='float dotNL = toon51( dot( geometry.normal, directLight.direction ) );';
  SC.lights_physical_pars_fragment=SC.lights_physical_pars_fragment.split(DN).join(DT);
  SC.lights_phong_pars_fragment=SC.lights_phong_pars_fragment.split(DN).join(DT);
  // ---------- texturas más lisas (se mezcla con un mip más chico) ----------
  SC.map_fragment=SC.map_fragment.replace('vec4 texelColor = texture2D( map, vUv );',
    'vec4 texelColor = texture2D( map, vUv );texelColor.rgb = mix( texelColor.rgb, texture2D( map, vUv, 3.5 ).rgb, 0.55 );');

  // ---------- luz y cielo ----------
  skyDay.set(0xa8d8f8);skyDusk.set(0xf0a070);skyNight.set(0x101a3a);skyRain.set(0x8ea0b4);
  try{C8.zDay.set(0x1f78e6);C8.zDusk.set(0x6a5ab0);C8.zNight.set(0x060c24);C8.hDay.set(0xbfe0ff);C8.gDay.set(0x7a9a50);C8.sunHi.set(0xfff6e0);C8.sunLo.set(0xffa060)}catch(e){}
  const _al51=applyLighting;
  applyLighting=function(){_al51.apply(this,arguments);
    if(!S)return;
    const dk=darkness();
    // menos contraste entre sol y sombra: el lado oscuro queda celeste/lila, no negro
    sun.intensity*=.78;hemi.intensity=hemi.intensity*1.35+.1*(1-dk);
    scene.fog.density=Math.min(scene.fog.density,.0019+dk*.011+weatherFx().fog*.55);
  };

  // ---------- contornos: target sin MSAA pero con textura de profundidad ----------
  const _size51=sizePost8;
  sizePost8=function(){
    const w=renderer.domElement.width,h=renderer.domElement.height;if(!w||!h)return;
    if(post8.rt&&post8.rt.width===w&&post8.rt.height===h&&post8.rt.depthTexture)return;
    try{
      post8.rt&&post8.rt.dispose();post8.b.forEach(r=>r.dispose());
      const o={minFilter:T3.LinearFilter,magFilter:T3.LinearFilter,format:T3.RGBAFormat,type:T3.UnsignedByteType};
      const rt=new T3.WebGLRenderTarget(w,h,o);rt.depthTexture=new T3.DepthTexture(w,h);rt.depthTexture.type=T3.UnsignedIntType;
      post8.rt=rt;post8.ms=0;post8.b=[];
      for(const d of[4,8]){const bw=Math.max(2,w/d|0),bh=Math.max(2,h/d|0);for(let k=0;k<2;k++)post8.b.push(new T3.WebGLRenderTarget(bw,bh,{minFilter:T3.LinearFilter,magFilter:T3.LinearFilter,format:T3.RGBAFormat,type:T3.UnsignedByteType,depthBuffer:false}))}
    }catch(e){console.error('v51 rt',e);TOON51.edge=0;post8.rt=null;return _size51()}
  };
  function patchComp51(){
    const m=post8.mats&&post8.mats.comp;if(!m||m.__t51)return;m.__t51=1;
    m.uniforms.dep={value:null};m.uniforms.cn={value:.1};m.uniforms.cf={value:1000};m.uniforms.edge={value:1};
    m.fragmentShader=m.fragmentShader
      .replace('uniform vec3 shadowT,highT;','uniform vec3 shadowT,highT;uniform sampler2D dep;uniform float cn,cf,edge;\n      float lin51(vec2 uv){float z=texture2D(dep,uv).x*2.-1.;return 2.*cn*cf/(cf+cn-z*(cf-cn));}')
      .replace('c*=expo;',`c*=expo;
        if(edge>0.){
          float d0=lin51(vUv);vec2 o=px*1.6;
          float s=lin51(vUv+vec2(o.x,0.))+lin51(vUv-vec2(o.x,0.))+lin51(vUv+vec2(0.,o.y))+lin51(vUv-vec2(0.,o.y));
          float r=abs(s-4.*d0)/max(d0,.05);
          float e=smoothstep(.07,.2,r)*(1.-smoothstep(70.,190.,d0))*edge;
          c=mix(c,c*vec3(.12,.1,.18),e*.9);
        }`);
    m.needsUpdate=true;
  }
  const _runPost51=runPost8;
  runPost8=function(){
    patchComp51();
    const u=post8.mats.comp.uniforms;
    if(u.dep){u.dep.value=post8.rt.depthTexture||null;u.edge.value=post8.rt.depthTexture&&TOON51.edge?1:0;u.cn.value=camera.near;u.cf.value=camera.far}
    return _runPost51.apply(this,arguments)};

  // ---------- gradación de color: viva, luminosa, poco viñeteo ----------
  const _render51=render;
  render=function(dt){
    try{const u=post8.mats.comp.uniforms;u.sat.value=1.42;u.contrast.value=.2;u.vig.value=.1;u.bloom.value=.3;u.sharp.value=.15;
      u.shadowT.value.setRGB(.84,.9,1.16);u.highT.value.setRGB(1.06,1.03,.94)}catch(e){}
    try{if(grassInst&&!grassInst.userData.t51){grassInst.userData.t51=1;grassInst.material.color.setRGB(.6,.9,.38)}}catch(e){}
    try{if(terrainMesh&&!terrainMesh.userData.t51){terrainMesh.userData.t51=1;terrainMesh.material.color.setRGB(.78,.96,.6)}}catch(e){}
    return _render51(dt)};
}
