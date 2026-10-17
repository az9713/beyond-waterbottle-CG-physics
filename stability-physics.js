/* Dimensionless H=1, full-water mass=1; fixed circular base radius q=R/H. */
(function(root){
'use strict';
const cg=(f,r=.125,b=.5)=>(r*b+f*f/2)/(r+f);
function rigid(f,r=.125,q=0.09711541605262927,b=.5){
  const y=cg(f,r,b),mass=r+f,d=Math.hypot(q,y),lift=q*q/(d+y);
  const energy=mass*lift;
  // Thin uniform cylindrical sidewall, massless end caps; immobilized solid-cylinder water.
  const inertia=r*(1.5*q*q+1/3)+f*(1.25*q*q+f*f/3);
  return {y,mass,angle:Math.atan2(q,y),energy,inertia,angularImpulse:Math.sqrt(2*inertia*energy),omega:Math.sqrt(2*energy/inertia),acceleration:q/y};
}
function energyOptimum(r,q,b=.5){const a=b+q*q/(2*r);return Math.min(1,a+Math.hypot(a,q));}
// Exact circular-segment formula, midpoint quadrature in axial s, numerical surface elevation.
function relaxed(f,theta,r=.125,q=0.09711541605262927,n=240){
  const si=Math.sin(theta),co=Math.cos(theta),area=Math.PI*q*q;
  if(f<=0)return {x:-q*co+.5*si,z:q*si+.5*co,energy:r*(q*si+.5*co),level:0,volume:0,waterX:null,waterZ:null};
  if(f>=1)return {x:-q*co+.5*si,z:q*si+.5*co,energy:(r+1)*(q*si+.5*co),level:2*q*si+co,volume:1,waterX:-q*co+.5*si,waterZ:q*si+.5*co};
  if(Math.abs(si)<1e-8){const y=cg(f,r);return{x:-q,z:y,energy:(r+f)*y,level:f,volume:f,waterX:-q,waterZ:f/2};}
  if(q*Math.abs(Math.tan(theta))<=Math.min(f,1-f)){
    const jx=q*q*Math.tan(theta)/4,js=f*f/2+q*q*Math.tan(theta)**2/8;
    const wx=(jx-q*f)*co+js*si,wz=(q*f-jx)*si+js*co;
    const sx=-q*co+.5*si,sz=q*si+.5*co;
    return{x:(r*sx+wx)/(r+f),z:(r*sz+wz)/(r+f),energy:r*sz+wz,level:q*si+f*co,volume:f,waterX:wx/f,waterZ:wz/f};
  }
  function integrate(level,withMoments=false){
    let v=0,jx=0,js=0;
    for(let k=0;k<n;k++){
      const s=(k+.5)/n,c=q+(s*co-level)/si;
      let a,mx;
      if(c<=-q){a=area;mx=0;}else if(c>=q){a=0;mx=0;}else{const h=Math.sqrt(q*q-c*c);a=q*q*Math.acos(c/q)-c*h;mx=2*h*h*h/3;}
      v+=a;
      if(withMoments){jx+=mx;js+=s*a;}
    }
    return {v:v/n/area,jx:jx/n/area,js:js/n/area};
  }
  let low=0,high=2*q*si+co;
  for(let j=0;j<42;j++){const mid=(low+high)/2;if(integrate(mid).v<f)low=mid;else high=mid;}
  const level=(low+high)/2,a=integrate(level,true),wx=(a.jx-q*a.v)*co+a.js*si,wz=(q*a.v-a.jx)*si+a.js*co;
  const sx=-q*co+.5*si,sz=q*si+.5*co;
  return {x:(r*sx+wx)/(r+f),z:(r*sz+wz)/(r+f),energy:r*sz+wz,level,volume:a.v,waterX:wx/f,waterZ:wz/f};
}
function relaxedCritical(f,r=.125,q=0.09711541605262927,n=240){
  let low=0,high=Math.PI/2;
  for(let j=0;j<30;j++){const mid=(low+high)/2;if(relaxed(f,mid,r,q,n).x>0)high=mid;else low=mid;}
  const angle=(low+high)/2,state=relaxed(f,angle,r,q,n);
  return {angle,energy:state.energy-(r+f)*cg(f,r),state};
}
function clipCentral(f,theta,level,q,mode='relaxed'){
  let poly=[[-q,0],[q,0],[q,mode==='rigid'?f:1],[-q,mode==='rigid'?f:1]];
  if(mode==='rigid')return poly;
  const height=p=>(q-p[0])*Math.sin(theta)+p[1]*Math.cos(theta);
  const out=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],ha=height(a)-level,hb=height(b)-level;
    if(ha<=0)out.push(a);
    if((ha<=0)!==(hb<=0)){const t=ha/(ha-hb);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  }
  return out;
}
const api={cg,rigid,energyOptimum,relaxed,relaxedCritical,clipCentral};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.StabilityPhysics=api;
})(typeof window==='undefined'?globalThis:window);
