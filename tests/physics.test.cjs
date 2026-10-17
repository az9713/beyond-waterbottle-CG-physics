const assert = require('node:assert/strict');
const P = require('../physics.js');
const near = (a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
near(P.cg(1),.5); near(P.cg(0),.5); near(P.cg(.5),.3);
near(P.minimum().f,.25);near(P.minimum().z,.25);
near(P.cg(.1),.3);
for(const shape of [-.85,-.4,0,.4,.85])for(const r of [.003,.01,.125,1,10])for(const b of [0,.1,.5,.9,1]){
  const min=P.minimum(r,b,shape);
  near(min.z,min.u);
  near(P.volume(1,shape),1);
  for(let i=0;i<=100;i++){
    const f=i/100,u=P.depth(f,shape),z=P.cg(u,r,b,shape);
    near(P.volume(u,shape),f);
    assert.ok(z>=min.z-1e-10);
    if(u>0&&u<1){
      const eps=1e-6;
      const derivative=(P.cg(u+eps,r,b,shape)-P.cg(u-eps,r,b,shape))/(2*eps);
      near(derivative,(1-shape+2*shape*u)/(r+f)*(u-z),1e-7*Math.max(1,Math.abs(derivative)));
    }
  }
}
// Independent midpoint quadrature verifies the noncylindrical moment model.
for(const shape of [-.85,0,.85]){
  let v=0,j=0;const u=.63,n=20000,du=u/n;
  for(let i=0;i<n;i++){const s=(i+.5)*du,area=1-shape+2*shape*s;v+=area*du;j+=s*area*du;}
  near(v,P.volume(u,shape),1e-8);near(j,P.moment(u,shape),1e-8);
}
// Dimensional equations must collapse independently, not by plotting one array four times.
for(const [X,scale] of [[800,40],[8,12],[16,6],[2,.1]])for(const r of [.01,.125,1,10])for(let i=0;i<=100;i++){
  const f=i/100,x=X*f,W0=r*X,Y0=scale/2;
  near((W0*Y0+(scale/X)*x*x/2)/(W0+x)/scale,P.shared(f,r));
}
// The zero-shell limit cannot be evaluated by pretending the empty system has mass.
assert.ok(Number.isNaN(P.cg(0,0)));
console.log('PASS: endpoints, turning points, boundary cases, derivative identity, quadrature, and dimensional collapse.');
