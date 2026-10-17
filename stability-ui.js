'use strict';
(function(){
const S=window.StabilityPhysics,V=window.StabilityRender,get=id=>document.getElementById(id);
if(!get('stability-fill'))return;
let playing=false,previous=null,raf,angleProgress=0,lastKey='',lastCritical;
function pause(){playing=false;cancelAnimationFrame(raf);get('stability-play').textContent='Animate tilt';}
function vals(){return{f:Number(get('stability-fill').value)/100,r:10**Number(get('stability-r').value),q:Number(get('stability-radius').value),angle:Number(get('stability-angle').value)*Math.PI/180};}
function render(){
 const {f,r,q,angle}=vals(),a=S.rigid(f,r,q),key=[f,r,q].join(',');
 if(key!==lastKey){lastCritical=S.relaxedCritical(f,r,q);lastKey=key;}
 const b=lastCritical,deg=x=>(x*180/Math.PI).toFixed(2)+'°';
 get('stability-fill-value').textContent=(100*f).toFixed(0)+'%';get('stability-r-value').textContent=r.toFixed(3);get('stability-radius-value').textContent=q.toFixed(3);get('stability-angle-value').textContent=deg(angle);
 get('stability-views').innerHTML=V.comparison(f,angle,r,q);
 const readout=`Rigid threshold: ${deg(a.angle)}. Settled-water threshold: ${deg(b.angle)}. Energy barrier: ${(a.energy*1000*Math.PI*q*q*.3**3*9.81*.3).toFixed(5)} J rigid; ${(b.energy*1000*Math.PI*q*q*.3**3*9.81*.3).toFixed(5)} J settled. Dimensional energies use H = 30 cm and water density 1000 kg/m³. Full water mass: ${(1000*Math.PI*q*q*.3**3*1000).toFixed(1)} g; shell mass: ${(r*1000*Math.PI*q*q*.3**3*1000).toFixed(1)} g.`;
 if(get('stability-readout').textContent!==readout)get('stability-readout').textContent=readout;
 get('stability-bars').innerHTML=V.sweep(f,r,q);
}
for(const id of ['stability-fill','stability-r','stability-radius','stability-angle'])get(id).addEventListener('input',()=>{pause();render();});
function step(now){if(!playing)return;if(previous===null)previous=now;angleProgress+=(now-previous)/1000;previous=now;get('stability-angle').value=String(20*(1-Math.cos(angleProgress*Math.PI/4)));render();if(angleProgress>=8){pause();}else raf=requestAnimationFrame(step);}
get('stability-play').addEventListener('click',()=>{if(playing){pause();return;}playing=true;angleProgress=0;previous=null;get('stability-play').textContent='Pause tilt';raf=requestAnimationFrame(step);});
get('stability-reset').addEventListener('click',()=>{pause();get('stability-fill').value='25';get('stability-r').value=String(Math.log10(.125));get('stability-radius').value=String(0.09711541605262927);get('stability-angle').value='0';render();});
get('stability-critical').addEventListener('click',()=>{pause();const{f,r,q}=vals();get('stability-angle').value=String(S.relaxedCritical(f,r,q).angle*180/Math.PI);render();});
if(typeof controllers!=='undefined')controllers.push({pause:()=>{pause();document.querySelectorAll('#stability video').forEach(video=>video.pause());}});
render();
})();
