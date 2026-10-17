const assert=require('node:assert/strict');const S=require('../stability-physics.js');
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b} (tol ${tol})`);
const r=.125,q=0.09711541605262927;
close(S.rigid(.25).y,.25);close(S.rigid(.25).angle,Math.atan(q/.25));
let oldE=-1,oldJ=-1;for(let k=0;k<=1000;k++){const f=k/1000,a=S.rigid(f);assert.ok(a.energy>oldE);assert.ok(a.angularImpulse>oldJ);oldE=a.energy;oldJ=a.angularImpulse;close(a.angularImpulse*a.angularImpulse/(2*a.inertia),a.energy);}
for(const b of [0,.05,.2,.5,.9])for(const rr of [.02,.125,2]){const opt=S.energyOptimum(rr,q,b),e=S.rigid(opt,rr,q,b).energy;for(let k=0;k<=1000;k++)assert.ok(S.rigid(k/1000,rr,q,b).energy<=e+1e-10);}
// Independent x-slice integration of a 3D cylinder using midpoint x quadrature.
function independent(f,t,level,n=20000){const si=Math.sin(t),co=Math.cos(t);let v=0,jx=0,js=0;for(let k=0;k<n;k++){let x=-q+2*q*(k+.5)/n,width=2*Math.sqrt(q*q-x*x),top=Math.min(1,Math.max(0,(level-(q-x)*si)/co));v+=width*top;jx+=width*x*top;js+=width*top*top/2;}const scale=2*q/n/(Math.PI*q*q);return{v:v*scale,wx:((jx-q*v)*co+js*si)*scale,wz:((q*v-jx)*si+js*co)*scale};}
for(const f of [.02,.1,.25,.5,.9,.98])for(const t of [.1,.5,1.1]){const a=S.relaxed(f,t),b=independent(f,t,a.level);close(a.volume,f,1e-10);close(b.v,f,3e-5);close(a.waterX*f,b.wx,3e-5);close(a.waterZ*f,b.wz,3e-5);const frozen=(r+f)*(q*Math.sin(t)+S.cg(f)*Math.cos(t));assert.ok(a.energy<=frozen+1e-6);}
for(const f of [0,1])for(const t of [0,.2,1]){const a=S.relaxed(f,t);close(a.x,-q*Math.cos(t)+.5*Math.sin(t));close(a.z,q*Math.sin(t)+.5*Math.cos(t));}
for(const f of [.1,.25,.5,.9]){const t=.2,a=S.relaxed(f,t),expected=q*(r+f)*Math.sin(t)+(r/2+f*f/2)*Math.cos(t)-q*q*Math.sin(t)**2/(8*Math.cos(t));close(a.energy,expected);const dt=1e-5;close((S.relaxed(f,t+dt).energy-S.relaxed(f,t-dt).energy)/(2*dt),-(r+f)*a.x,1e-7);const c=S.relaxedCritical(f);close(c.state.x,0,1e-8);assert.ok(c.energy<=S.rigid(f).energy+1e-6);}
let lo=.2,hi=.35;for(let k=0;k<60;k++){let f=(lo+hi)/2,v=f*f/2+r*f-r/2-q*q/4-q**4/(8*f*f);if(v>0)hi=f;else lo=f;}let f=(lo+hi)/2,critical=S.relaxedCritical(f);close(f,.25667818106496276,1e-10);close(critical.angle,Math.atan(q/f),1e-8);for(let k=0;k<=100;k++)assert.ok(S.relaxedCritical(k/100).angle<=critical.angle+2e-6);
console.log('PASS: energy/impulse identities and optima; independent 3D quadrature; free-surface energy reduction, torque, endpoints, and best-fill condition.');
