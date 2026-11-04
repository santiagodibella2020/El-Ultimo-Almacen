/* v0.14: contador de FPS opcional (Opciones > Video) */
(function(){const el=document.createElement('div');el.id='fps14';el.style.cssText='position:fixed;right:10px;top:8px;z-index:40;font:600 12px monospace;color:#d8f0c0;text-shadow:0 1px 2px #000;pointer-events:none';el.hidden=true;document.body.appendChild(el);
  let acc=0,n=0,worst=0;const _r=render;
  render=function(dt){acc+=dt;n++;worst=Math.max(worst,dt);if(acc>=.5){if(settings.fps){el.hidden=false;el.textContent=Math.round(n/acc)+' FPS · '+Math.round(worst*1000)+' ms'}else el.hidden=true;acc=0;n=0;worst=0}return _r(dt)}})();
