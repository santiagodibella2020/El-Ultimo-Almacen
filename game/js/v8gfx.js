'use strict';
// ================= v0.8 · Mid-range graphics: post-processing, grading and richer lighting =================
// The scene is rendered into an anti-aliased offscreen target, a soft bloom is built from its bright parts and
// everything is composited in one pass with exposure, a filmic contrast curve, split-toning (cool shadows, warm
// highlights), saturation and a vignette. 'alta' uses 4x MSAA and full bloom, 'media' skips MSAA, 'baja' skips it all.

const post8={on:false,rt:null,b:[],ms:0,mats:{},quad:null,cam:null,scn:null,failed:false};
const VS8='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function fsMat8(frag,uniforms){return new T3.ShaderMaterial({vertexShader:VS8,fragmentShader:frag,uniforms,depthTest:false,depthWrite:false})}
function initPost8(){
  if(post8.quad||post8.failed)return;
  try{
    post8.cam=new T3.OrthographicCamera(-1,1,1,-1,0,1);post8.scn=new T3.Scene();
    post8.quad=new T3.Mesh(new T3.PlaneGeometry(2,2),new T3.MeshBasicMaterial());post8.quad.frustumCulled=false;post8.scn.add(post8.quad);
    post8.mats.bright=fsMat8('uniform sampler2D tex;uniform float thr;varying vec2 vUv;void main(){vec3 c=texture2D(tex,vUv).rgb;float l=dot(c,vec3(.299,.587,.114));float k=smoothstep(thr,thr+.3,l);gl_FragColor=vec4(c*k,1.);}',{tex:{value:null},thr:{value:.62}});
    post8.mats.blur=fsMat8('uniform sampler2D tex;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(tex,vUv).rgb*.2270270;c+=texture2D(tex,vUv+dir*1.3846).rgb*.3162162;c+=texture2D(tex,vUv-dir*1.3846).rgb*.3162162;c+=texture2D(tex,vUv+dir*3.2307).rgb*.0702702;c+=texture2D(tex,vUv-dir*3.2307).rgb*.0702702;gl_FragColor=vec4(c,1.);}',{tex:{value:null},dir:{value:new T3.Vector2()}});
    post8.mats.comp=fsMat8(`uniform sampler2D tex,b1,b2;uniform float expo,bloom,vig,sat,contrast,time,flash,sharp;uniform vec2 px;uniform vec3 shadowT,highT;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){
        vec3 c=texture2D(tex,vUv).rgb;
        vec3 nb=(texture2D(tex,vUv+vec2(px.x,0.)).rgb+texture2D(tex,vUv-vec2(px.x,0.)).rgb+texture2D(tex,vUv+vec2(0.,px.y)).rgb+texture2D(tex,vUv-vec2(0.,px.y)).rgb)*.25;
        c+=clamp(c-nb,-.12,.12)*sharp;                             // nitidez (unsharp mask)
        c+=(texture2D(b1,vUv).rgb*.55+texture2D(b2,vUv).rgb*.75)*bloom;
        c*=expo;
        c=c/(1.+max(c-.78,0.)*1.1);c=clamp(c,0.,1.);               // soft shoulder first, so nothing escapes 0..1
        float l=dot(c,vec3(.299,.587,.114));
        c=mix(vec3(l),c,sat);                                     // saturation
        vec3 s=c*c*(3.-2.*c);c=mix(c,s,contrast);                 // filmic S-curve
        float lm=dot(c,vec3(.299,.587,.114));
        c=mix(c,c*shadowT,(1.-smoothstep(.0,.5,lm))*.55);        // cool shadows
        c=mix(c,c*highT,smoothstep(.35,1.,lm)*.5);                // warm highlights
        vec2 q=vUv-.5;float v=1.-dot(q,q)*vig*1.6;c*=clamp(v,0.,1.);
        c+=(hash(vUv*vec2(1731.,947.)+time)-.5)/255.;             // dither, kills banding in the sky
        gl_FragColor=vec4(clamp(c,0.,1.),1.);}`,
      {tex:{value:null},b1:{value:null},b2:{value:null},expo:{value:1.0},bloom:{value:.42},vig:{value:.55},sat:{value:1.12},contrast:{value:.38},time:{value:0},flash:{value:0},sharp:{value:.9},px:{value:new T3.Vector2(.001,.001)},shadowT:{value:new T3.Color(.9,.97,1.1)},highT:{value:new T3.Color(1.06,1.02,.94)}});
    return true;
  }catch(e){console.error('post8 init',e);post8.failed=true;post8.on=false}
}
function sizePost8(){
  const w=renderer.domElement.width,h=renderer.domElement.height;if(!w||!h)return;
  const ms=settings.qual==='alta'&&renderer.capabilities.isWebGL2?4:0;
  if(!post8.rt||post8.rt.width!==w||post8.rt.height!==h||post8.ms!==ms){
    post8.rt&&post8.rt.dispose();post8.b.forEach(r=>r.dispose());
    const o={minFilter:T3.LinearFilter,magFilter:T3.LinearFilter,format:T3.RGBAFormat,type:T3.UnsignedByteType};
    post8.rt=ms?new T3.WebGLMultisampleRenderTarget(w,h,o):new T3.WebGLRenderTarget(w,h,o);if(ms)post8.rt.samples=ms;
    post8.ms=ms;post8.b=[];
    for(const d of[4,8]){const bw=Math.max(2,w/d|0),bh=Math.max(2,h/d|0);for(let k=0;k<2;k++)post8.b.push(new T3.WebGLRenderTarget(bw,bh,{minFilter:T3.LinearFilter,magFilter:T3.LinearFilter,format:T3.RGBAFormat,type:T3.UnsignedByteType,depthBuffer:false}))}
  }
}
function pass8(mat,target){post8.quad.material=mat;renderer.setRenderTarget(target);renderer.render(post8.scn,post8.cam)}
function runPost8(){
  const m=post8.mats,rt=post8.rt,[a1,a2,c1,c2]=post8.b;
  // bloom: bright pass into a quarter-res target, blurred horizontally then vertically; then the same at 1/8
  m.bright.uniforms.tex.value=rt.texture;m.bright.uniforms.thr.value=S&&darkness()>.5?.5:.66;pass8(m.bright,a1);
  m.blur.uniforms.tex.value=a1.texture;m.blur.uniforms.dir.value.set(1/a1.width,0);pass8(m.blur,a2);
  m.blur.uniforms.tex.value=a2.texture;m.blur.uniforms.dir.value.set(0,1/a1.height);pass8(m.blur,a1);
  m.blur.uniforms.tex.value=a1.texture;m.blur.uniforms.dir.value.set(1/c1.width,0);pass8(m.blur,c1);
  m.blur.uniforms.tex.value=c1.texture;m.blur.uniforms.dir.value.set(1/c1.width,0);pass8(m.blur,c2);
  m.blur.uniforms.tex.value=c2.texture;m.blur.uniforms.dir.value.set(0,1/c1.height);pass8(m.blur,c1);
  const u=m.comp.uniforms;u.tex.value=rt.texture;u.b1.value=a1.texture;u.b2.value=c1.texture;u.time.value=time%10;
  u.expo.value=1.0*(settings.bright||1);u.px.value.set(1/rt.width,1/rt.height);
  pass8(m.comp,null);
}
const _render8=render;
render=function(dt){
  const hi=settings.qual!=='baja'&&!post8.failed;
  if(!hi){post8.on=false;return _render8(dt)}
  if(!post8.quad&&!initPost8()){return _render8(dt)}
  post8.on=true;sizePost8();
  if(S){applyLighting();updateCamera(dt);updateRain(dt,weatherFx().rain,camera.position.x,camera.position.y,camera.position.z)}
  const viewmodel=S&&!P.inTruck&&camMode==='fp'&&!['menu','newgame','options','cine'].includes(gstate);
  renderer.setRenderTarget(post8.rt);renderer.clear();renderer.render(scene,camera);renderer.clearDepth();if(viewmodel)renderer.render(wScene,wCam);
  runPost8();
};
// The grade now happens in the shader, so drop the old CSS saturate/contrast/sepia filter while post is active.
const _applyPost8=applyPost;
applyPost=function(){_applyPost8();if(settings.qual!=='baja'&&!post8.failed){cv.style.filter='';$('vbase').hidden=true}};
const _applyQuality8=applyQuality;applyQuality=function(){_applyQuality8();applyPost()};

// ---------- Lighting: bluer sky, warm low sun, moonlit nights ----------
skyDay.set(0xaec4d4);skyDusk.set(0xdb9a68);skyNight.set(0x0a1424);
const moon8=new T3.DirectionalLight(0x7d98c8,0);scene.add(moon8);scene.add(moon8.target);
const C8={hDay:new T3.Color(0xbcd2ee),hNight:new T3.Color(0x4e6ea4),gDay:new T3.Color(0x6a5a3e),gNight:new T3.Color(0x1c2030),sunHi:new T3.Color(0xfff2dc),sunLo:new T3.Color(0xff9a50),sunMoon:new T3.Color(0x7f9cc8),
  zDay:new T3.Color(0x4a7fc4),zDusk:new T3.Color(0x4a5a88),zNight:new T3.Color(0x050a16),tmp:new T3.Color()};
const _applyLighting8=applyLighting;
applyLighting=function(){_applyLighting8();
  if(!S)return;
  const h=hourOf(S.t),dk=darkness(),wf=weatherFx();
  const el=Math.sin(clamp((h-6)/12,0,1)*Math.PI),e=Math.pow(Math.max(el,0),.45),low=1-smooth(0,.45,el);
  // sun: strong at midday, still warm and present at golden hour, gone at night
  sun.intensity=(1-dk)*(.24+.8*e)*(1-wf.dim*.85)+lightning*1.5;
  sun.color.copy(C8.sunHi).lerp(C8.sunLo,low*(1-dk)*.9);if(dk>.5)sun.color.copy(C8.sunMoon);
  hemi.color.copy(C8.hDay).lerp(C8.hNight,dk);hemi.groundColor.copy(C8.gDay).lerp(C8.gNight,dk);
  hemi.intensity=(.72-.44*dk)*(1-wf.dim*.45)+lightning*.4;
  moon8.position.set(P.x-50,P.y+90,P.z+40);moon8.target.position.set(P.x,P.y,P.z);moon8.intensity=.65*dk*(1-wf.dim*.75);
  // sky dome: deeper blue overhead by day, rosy band at dusk
  try{if(skyDome){const u=skyDome.material.uniforms,dusk=low*(1-dk);
    C8.tmp.copy(C8.zDay).lerp(C8.zDusk,dusk).lerp(C8.zNight,dk);u.top.value.copy(scene.fog.color).lerp(C8.tmp,.8*(1-wf.dim)).multiplyScalar(1-.25*dk);
    u.sunDir.value.copy(sun.position).sub(sun.target.position).normalize();u.sunCol.value.copy(sun.color)}}catch(err){}
};

// ---------- Terrain: smooth shading, patchy macro variation, rocky steep slopes ----------
function upgradeTerrain8(){
  const m=terrainMesh.material;m.flatShading=false;m.color.setScalar(.86);
  m.onBeforeCompile=sh=>{
    sh.uniforms.macroMap={value:TEX.grass};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW8;varying float vSl8;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvW8=(modelMatrix*vec4(position,1.)).xyz;vSl8=1.-clamp(normal.y,0.,1.);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vW8;varying float vSl8;uniform sampler2D macroMap;')
      .replace('#include <map_fragment>',`#include <map_fragment>
        float m1=texture2D(macroMap,vW8.xz*.011).g,m2=texture2D(macroMap,vW8.xz*.0027+.37).g;
        diffuseColor.rgb*=1.+.7*(m1-.6)+.5*(m2-.6);
        float lum=dot(diffuseColor.rgb,vec3(.33));
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.46,.42,.37)*(lum*2.2+.08),smoothstep(.17,.36,vSl8)*.75);`);
  };
  m.customProgramCacheKey=()=>'terrain8';m.needsUpdate=true;
}

// ---------- Water: animated normals, fresnel sky reflection, sun glint ----------
let waterMat8=null;
function upgradeWater8(){
  if(!waterMat8)waterMat8=new T3.ShaderMaterial({transparent:true,fog:true,
    uniforms:T3.UniformsUtils.merge([T3.UniformsLib.fog,{time:{value:0},sunDir:{value:new T3.Vector3(0,1,0)},sunCol:{value:new T3.Color(1,.95,.85)},skyCol:{value:new T3.Color(.6,.7,.8)},deep:{value:new T3.Color(.09,.2,.25)},shallow:{value:new T3.Color(.2,.42,.46)},lit:{value:1}}]),
    vertexShader:'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader:`uniform float time,lit;uniform vec3 sunDir,sunCol,skyCol,deep,shallow;varying vec3 vW;
      #include <common>
      #include <fog_pars_fragment>
      void main(){
        vec2 p=vW.xz;vec2 g=vec2(0.);
        g+=vec2(cos(p.x*.9+time*1.1),cos(p.y*.7+time*.9))*.05;
        g+=vec2(.6,.8)*cos(dot(p,vec2(.6,.8))*1.7+time*1.6)*.045;
        g+=vec2(-.8,.6)*cos(dot(p,vec2(-.8,.6))*3.3-time*2.1)*.03;
        g+=vec2(.28,-.96)*cos(dot(p,vec2(.28,-.96))*6.1+time*2.9)*.015;
        vec3 n=normalize(vec3(-g.x,1.,-g.y));
        vec3 v=normalize(cameraPosition-vW);
        float fr=pow(1.-max(dot(n,v),0.),3.);
        vec3 col=mix(deep,shallow,clamp(.4+(g.x+g.y)*4.,0.,1.))*lit;
        col=mix(col,skyCol*(.75+.35*n.y),clamp(fr*.95+.1,0.,1.));
        vec3 h=normalize(normalize(sunDir)+v);col+=sunCol*pow(max(dot(n,h),0.),220.)*1.6*lit;
        gl_FragColor=vec4(col,.9-.12*fr);
        #include <fog_fragment>
      }`});
  water.material=waterMat8;
}
function tickWater8(){
  if(!waterMat8||!water||water.material!==waterMat8)return;const u=waterMat8.uniforms,dk=darkness();
  u.time.value=time;u.sunDir.value.copy(sun.position).sub(sun.target.position).normalize();u.sunCol.value.copy(sun.color).multiplyScalar(1-dk);
  u.skyCol.value.copy(scene.fog.color).lerp(C8.tmp,.45);u.lit.value=.35+.65*(1-dk*.8);
}

// ---------- Trees & rocks: layered pines, fluffy canopies, tapered trunks, per-tree colour ----------
function merge8(parts){
  let n=0;const gs=parts.map(p=>{const g=p.g.index?p.g.toNonIndexed():p.g;n+=g.attributes.position.count;return g});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  gs.forEach((g,k)=>{const pa=g.attributes.position,na=g.attributes.normal,cf=parts[k].col;for(let i=0;i<pa.count;i++){
    P[(o+i)*3]=pa.getX(i);P[(o+i)*3+1]=pa.getY(i);P[(o+i)*3+2]=pa.getZ(i);N[(o+i)*3]=na.getX(i);N[(o+i)*3+1]=na.getY(i);N[(o+i)*3+2]=na.getZ(i);
    const c=cf(pa.getX(i),pa.getY(i),pa.getZ(i));C[(o+i)*3]=c[0];C[(o+i)*3+1]=c[1];C[(o+i)*3+2]=c[2]}o+=pa.count});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(P,3));g.setAttribute('normal',new T3.BufferAttribute(N,3));g.setAttribute('color',new T3.BufferAttribute(C,3));return g}
const h8=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)};
function jitter8(g,a){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x+(h8(x,y,z)-.5)*a,y+(h8(z,x,y)-.5)*a*.6,z+(h8(y,z,x)-.5)*a)}g.computeVertexNormals();return g}
function pineGeo8(){
  const R=[1.02,.86,.68,.46],H=[.42,.38,.34,.3],Y=[-.5,-.27,-.04,.2],parts=[];
  R.forEach((r,k)=>{const g=jitter8(new T3.ConeGeometry(r,H[k],9,1,true),.08*r);g.translate(0,Y[k]+H[k]/2,0);g.rotateY(k*.7);
    parts.push({g,col:(x,y)=>{const t=(y-Y[k])/H[k],b=(.74+.1*k+.34*Math.max(0,Math.min(1,t)))*1.28;return[b*.96,b,b*.9]}})});
  return merge8(parts)}
function broadGeo8(){
  const S=[[0,0,0,1],[.62,-.14,.2,.66],[-.58,.02,-.3,.7],[.08,.52,-.12,.62]],parts=[];
  S.forEach(([x,y,z,r])=>{const g=jitter8(new T3.IcosahedronGeometry(r,1),.16*r);g.translate(x,y,z);parts.push({g,col:(px,py,pz)=>{const t=Math.max(0,Math.min(1,(py+.9)/1.9)),n=.9+.2*h8(px,py,pz),b=(.66+.6*t)*n*1.2;return[b,b*1.02,b*.9]}})});
  return merge8(parts)}
function rockGeo8(){const g=jitter8(new T3.IcosahedronGeometry(1,1),.35);const p=g.attributes.position,c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const t=.78+.3*Math.max(0,p.getY(i)),n=.92+.16*h8(p.getX(i),p.getY(i),p.getZ(i));c[i*3]=t*n;c[i*3+1]=t*n*.98;c[i*3+2]=t*n*.94}g.setAttribute('color',new T3.BufferAttribute(c,3));return g}
function upgradeNature8(){
  const pine=trees.find(t=>t.type===0),broad=trees.find(t=>t.type===1);
  const col=new T3.Color(),vary=(mesh,list)=>{list.forEach(t=>{const k=.84+R()*.3;col.setRGB(k*(.96+R()*.08),k,k*(.94+R()*.1));mesh.setColorAt(t.ci,col)});mesh.instanceColor.needsUpdate=true};
  if(pine&&pine.cm){const m=pine.cm;m.geometry.dispose();m.geometry=pineGeo8();m.material.vertexColors=true;m.material.flatShading=false;m.material.needsUpdate=true;vary(m,trees.filter(t=>t.type===0))}
  if(broad&&broad.cm){const m=broad.cm;m.geometry.dispose();m.geometry=broadGeo8();m.material.vertexColors=true;m.material.flatShading=false;m.material.needsUpdate=true;vary(m,trees.filter(t=>t.type===1))}
  if(t3trunk){t3trunk.geometry=new T3.CylinderGeometry(.34,.54,1,7,1);}
  const rk=world.children.find(o=>o.isInstancedMesh&&o.geometry.type==='DodecahedronGeometry');
  if(rk){rk.geometry=rockGeo8();rk.material=new T3.MeshLambertMaterial({color:0x7a766c,vertexColors:true});}
}
const _genWorld8=genWorld;genWorld=function(seed){_genWorld8(seed);try{upgradeTerrain8();upgradeWater8();upgradeNature8()}catch(e){console.error('v8 world',e)}};
const _render8b=render;render=function(dt){tickWater8();_render8b(dt)};
const _applyPost8b=applyPost;applyPost=function(){_applyPost8b();grainC.style.opacity=post8.on||(settings.qual!=='baja'&&!post8.failed)?'.045':''};
