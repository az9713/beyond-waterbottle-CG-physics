/* SVG views shared by the interactive lab and deterministic HyperFrames films. */
(function(root){
'use strict';
const S=typeof module!=='undefined'&&module.exports?require('./stability-physics.js'):root.StabilityPhysics;
const colors={cyan:'#38bdf8',gold:'#fbbf24',pink:'#f472b6',white:'#e2e8f0',muted:'#a8bbcf',grid:'#28445b',green:'#34d399'};
const line=(x,y,a,b,c,d='')=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" stroke="${c}" stroke-width="2" stroke-dasharray="${d}"/>`;
const text=(x,y,t,c=colors.muted,size=14)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-family="system-ui,sans-serif">${t}</text>`;
function panel(f,theta,mode='rigid',r=.125,q=0.09711541605262927){
  const w=430,h=410,scale=220,px=150,py=337;
  const si=Math.sin(theta),co=Math.cos(theta),T=(x,s)=>[px+scale*((x-q)*co+s*si),py-scale*((q-x)*si+s*co)];
  const rigid=S.rigid(f,r,q),a=mode==='rigid'?{x:-q*co+rigid.y*si,z:q*si+rigid.y*co,level:f}:S.relaxed(f,theta,r,q);
  const polygon=pts=>pts.map(p=>T(p[0],p[1]).join(',')).join(' ');
  const vessel=polygon([[-q,0],[q,0],[q,1],[-q,1]]);
  const water=S.clipCentral(f,theta,a.level,q,mode);
  const cx=px+scale*a.x,cy=py-scale*a.z;
  const over=a.x>1e-7,neutral=Math.abs(a.x)<1e-7;
  let out=`<svg class="science-svg stability-view" viewBox="0 0 ${w} ${h}" role="img" aria-label="${mode==='rigid'?'Immobilized payload':'Settled liquid'} at ${(theta*180/Math.PI).toFixed(1)} degrees"><title>Computed ${mode} geometry, ${Math.round(f*100)}% full</title>`;
  out+=line(25,py+1,405,py+1,colors.muted)+line(px,35,px,py+10,colors.muted,'4 6');
  if(f>0)out+=`<polygon points="${polygon(water)}" fill="#124966" stroke="${colors.cyan}" stroke-width="2"/>`;
  out+=`<polygon points="${vessel}" fill="none" stroke="${colors.white}" stroke-width="2.5"/>`;
  out+=`<circle cx="${px}" cy="${py}" r="5" fill="${colors.pink}"/><circle cx="${cx}" cy="${cy}" r="7" fill="${colors.gold}"/>`;
  out+=line(cx,cy+10,cx,cy+48,colors.gold)+`<path d="M${cx-5},${cy+40}l5,8l5,-8" fill="none" stroke="${colors.gold}" stroke-width="2"/>`;
  out+=line(px,py-12,cx,py-12,over?colors.pink:colors.green);
  out+=text(20,24,mode==='rigid'?'Immobilized water reference':'Freely settling water',colors.white,18);
  out+=text(20,48,`${Math.round(f*100)}% full · ${(theta*180/Math.PI).toFixed(1)}° prescribed tilt`);
  out+=text(20,369,neutral?'CG nearly above pivot':over?'Gravity drives further tipping':'Gravity restores upright',over?colors.pink:colors.green,16);
  out+=text(20,394,'Gold = combined CG / weight; pink = rim pivot',colors.muted,12);
  return out+'</svg>';
}
function comparison(f,theta,r=.125,q=0.09711541605262927){return panel(f,theta,'rigid',r,q)+panel(f,theta,'relaxed',r,q);}
let sweepKey='',sweepMax;
function sweep(f,r=.125,q=0.09711541605262927){
  const a=S.rigid(f,r,q),H=.30,mfull=1000*Math.PI*q*q*H**3,g=9.81,p=.25;
  const key=[r,q].join(',');
  if(key!==sweepKey){sweepMax=[0,0,0,0];for(let i=0;i<=1000;i++){const v=S.rigid(i/1000,r,q);[v.angle*180/Math.PI,v.energy*mfull*g*H,v.angularImpulse*mfull*H*Math.sqrt(g*H)/p,v.omega*Math.sqrt(g/H)].forEach((n,j)=>sweepMax[j]=Math.max(sweepMax[j],n));}sweepKey=key;}
  const vals=[['Tilt angle',a.angle*180/Math.PI,sweepMax[0],'degrees',colors.cyan],['Lifting energy',a.energy*mfull*g*H,sweepMax[1],'joules',colors.gold],['Impulse at 25 cm',a.angularImpulse*mfull*H*Math.sqrt(g*H)/p,sweepMax[2],'N s',colors.pink],['Initial angular speed',a.omega*Math.sqrt(g/H),sweepMax[3],'rad/s',colors.green]];
  let out='<svg class="science-svg" viewBox="0 0 900 440" role="img" aria-label="Different resistance measures as fill changes"><title>Calculated rigid-payload thresholds</title>'+text(20,35,`${(f*100).toFixed(0)}% full: different tests reward different fills`,colors.white,25);
  vals.forEach((v,i)=>{const y=90+i*83;out+=text(20,y,v[0],colors.white,19)+`<rect x="270" y="${y-20}" width="420" height="26" rx="4" fill="#14283b"/><rect x="270" y="${y-20}" width="${420*Math.min(1,v[1]/v[2])}" height="26" rx="4" fill="${v[4]}"/>`+text(710,y,`${v[1].toFixed(3)} ${v[3]}`,v[4],18);});
  out+=text(20,430,'Each bar / its own maximum over fill. Computed rigid model; free-water impact dynamics are not solved.',colors.muted,14);
  return out+'</svg>';
}
const api={panel,comparison,sweep};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.StabilityRender=api;
})(typeof window==='undefined'?globalThis:window);
