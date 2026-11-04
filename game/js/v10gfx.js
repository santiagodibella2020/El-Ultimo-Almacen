/* v0.10: texturas de alta resolución (1024 px, trazos vectoriales nítidos + grano fino) */
function canvasTex(draw,size=256){
  const K=4,px=size*K,c=document.createElement('canvas');c.width=c.height=px;const x=c.getContext('2d');
  x.scale(K,K);draw(x,size);x.setTransform(1,0,0,1,0,0);
  // grano fino a resolución completa: rompe el aspecto "borroso" del escalado
  const id=x.getImageData(0,0,px,px),d=id.data;let sd=1234567;
  for(let i=0;i<d.length;i+=4){sd=(sd*1103515245+12345)&0x7fffffff;const n=((sd>>16)&15)-7;d[i]+=n;d[i+1]+=n;d[i+2]+=n}
  x.putImageData(id,0,0);
  const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());return t}
