'use strict';
document.body.classList.remove('no-js');
const P = window.BottlePhysics;
const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
function node(tag, attrs = {}, text = '') {
  const n = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) n.setAttribute(key, value);
  if (text) n.textContent = text;
  return n;
}
function line(svg, x1, y1, x2, y2, attrs = {}) { svg.append(node('line', {x1,y1,x2,y2,...attrs})); }
function label(svg, x, y, text, attrs = {}) { svg.append(node('text', {x,y,...attrs}, text)); }
function frame(svg, xTitle, ymax = 1.05) {
  svg.replaceChildren();
  const width = Number(svg.getAttribute('viewBox').split(' ')[2]);
  const left = 67, right = width - 25, top = 22, bottom = 360;
  const X = x => left + x * (right-left), Y = y => bottom - y / ymax * (bottom-top);
  for (let i = 0; i <= 4; i++) {
    const f=i/4;
    line(svg,X(f),top,X(f),bottom,{class:'grid'});
    line(svg,left,Y(f),right,Y(f),{class:'grid'});
    label(svg,X(f),bottom+24,(f*100).toFixed(0)+'%',{'text-anchor':'middle'});
    label(svg,left-12,Y(f)+5,f.toFixed(2),{'text-anchor':'end'});
  }
  label(svg,(left+right)/2,410,xTitle,{'text-anchor':'middle',class:'axis-title'});
  label(svg,18,(top+bottom)/2,'Height / response scale',{'text-anchor':'middle',transform:`rotate(-90 18 ${(top+bottom)/2})`,class:'axis-title'});
  return {X,Y,left,right,top,bottom};
}
function curve(svg, transform, fn, color, dash = '', width = 3) {
  let d='';
  for(let i=0;i<=600;i++) { const x=i/600; d+=(i?'L':'M')+transform.X(x).toFixed(3)+','+transform.Y(fn(x)).toFixed(3); }
  svg.append(node('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-dasharray':dash,'stroke-linecap':'round'}));
}
function bottle(svg,u,z,b,shape) {
  svg.replaceChildren();
  const yy = v => 218-190*v;
  const half = v => 53*Math.sqrt(1-shape+2*shape*v);
  let outline='', water='';
  const points=[];
  for(let i=0;i<=60;i++)points.push([150-half(i/60),yy(i/60)]);
  for(let i=60;i>=0;i--)points.push([150+half(i/60),yy(i/60)]);
  outline=points.map((p,i)=>(i?'L':'M')+p.join(',')).join('')+'Z';
  const wp=[];
  for(let i=0;i<=60;i++){let v=u*i/60;wp.push([150-half(v),yy(v)]);}
  for(let i=60;i>=0;i--){let v=u*i/60;wp.push([150+half(v),yy(v)]);}
  water=wp.map((p,i)=>(i?'L':'M')+p.join(',')).join('')+'Z';
  svg.append(node('path',{d:water,class:'water'}));
  svg.append(node('path',{d:outline,class:'outline'}));
  line(svg,150,20,150,223,{stroke:'#64849e','stroke-dasharray':'4 5'});
  line(svg,150-half(u),yy(u),150+half(u),yy(u),{class:'waterline'});
  line(svg,65,yy(b),240,yy(b),{stroke:'#fbbf24','stroke-dasharray':'3 5',opacity:.6});
  svg.append(node('circle',{cx:150,cy:yy(z),r:7,fill:'#fbbf24'}));
  label(svg,150+half(u)+10,yy(u)-3,'surface',{'font-size':12});
  label(svg,162,yy(z)+20,'CG',{'font-size':12,fill:'#fbbf24'});
  label(svg,25,20,'H',{'font-style':'italic'}); label(svg,25,222,'0');
}
const controllers=[];
function setupSimulator(prefix, advanced = false) {
  let playing=false, previous=0, raf;
  const fill=$(`${prefix}-fill`),mass=$(`${prefix}-mass`),base=$(`${prefix}-base`);
  const values=()=>({f:Number(fill.value)/100,r:10**Number(mass.value),b:Number(base.value),shape:advanced?Number($('shape').value):0});
  function pause(){playing=false;cancelAnimationFrame(raf);$(`${prefix}-play`).textContent='Play';}
  function render(){
    const {f,r,b,shape}=values(),u=P.depth(f,shape),z=P.cg(u,r,b,shape),min=P.minimum(r,b,shape);
    $(`${prefix}-fill-value`).textContent=(f*100).toFixed(1).replace('.0','')+'%';
    $(`${prefix}-mass-value`).textContent=r.toFixed(3);
    $(`${prefix}-base-value`).textContent=b.toFixed(2);
    if(advanced)$('shape-value').textContent=shape.toFixed(2);
    $(`${prefix}-current`).textContent=z.toFixed(3)+' H';
    $(`${prefix}-minimum`).textContent=min.z.toFixed(3)+' H';
    $(`${prefix}-critical`).textContent=(min.f*100).toFixed(1).replace('.0','')+'%';
    let direction=Math.abs(u-z)<.001?'At the minimum':u>z?'CG falls as water is removed':'CG rises as water is removed';
    if(f===0)direction='Empty: the CG equals the shell’s balance point';
    $(`${prefix}-status`).textContent=direction;
    const svg=$(`${prefix}-plot`),tr=frame(svg,'Fraction consumed (constant-rate time fraction)');
    curve(svg,tr,x=>P.depth(1-x,shape),'#8ba3ba','7 6',1.6);
    curve(svg,tr,()=>b,'#fbbf24','3 6',1.3);
    curve(svg,tr,x=>P.cg(P.depth(1-x,shape),r,b,shape),'#38bdf8');
    svg.append(node('circle',{cx:tr.X(1-min.f),cy:tr.Y(min.z),r:6,fill:'#fbbf24'}));
    svg.append(node('circle',{cx:tr.X(1-f),cy:tr.Y(z),r:7,fill:'#38bdf8',stroke:'#e2e8f0','stroke-width':2}));
    bottle($(`${prefix}-bottle`),u,z,b,shape);
  }
  for(const control of [fill,mass,base,...(advanced?[$('shape')]:[])])control.addEventListener('input',()=>{pause();render();});
  function step(now){
    if(!playing)return;
    if(!previous)previous=now;
    const f=Math.max(0,Number(fill.value)-(now-previous)/200);previous=now;
    fill.value=String(f);render();
    if(f<=0)pause();else raf=requestAnimationFrame(step);
  }
  $(`${prefix}-play`).addEventListener('click',()=>{
    if(playing){pause();return;}
    if(Number(fill.value)<=0)fill.value='100';
    playing=true;previous=0;$(`${prefix}-play`).textContent='Pause';raf=requestAnimationFrame(step);
  });
  $(`${prefix}-reset`).addEventListener('click',()=>{pause();fill.value='50';mass.value=String(Math.log10(.125));base.value='.5';if(advanced)$('shape').value='0';render();});
  $(`${prefix}-csv`).addEventListener('click',()=>{
    const {r,b,shape}=values();
    let data='fraction_consumed,water_fraction,depth_over_H,cg_over_H,mass_ratio,empty_cg_over_H,area_slope\n';
    for(let i=0;i<=1000;i++){const t=i/1000,f=1-t,u=P.depth(f,shape);data+=[t,f,u,P.cg(u,r,b,shape),r,b,shape].join(',')+'\n';}
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));
    a.href=url;a.download=`bottle-${prefix}-model.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  controllers.push({pause});render();
}
setupSimulator('ideal');setupSimulator('real',true);

function family(){
  const r=10**Number($('family-r').value),svg=$('family-plot'),tr=frame(svg,'Normalized added amount f (drinking runs right → left)');
  $('family-r-value').textContent=r.toFixed(3);
  curve(svg,tr,x=>x,'#8ba3ba','6 6',1.5);
  curve(svg,tr,x=>P.shared(x,r),'#38bdf8','',3);
  const specs=[{X:800,scale:40,color:'#fb923c',label:'Thermal'}, {X:8,scale:12,color:'#c084fc',label:'Electrical'}, {X:16,scale:6,color:'#34d399',label:'Momentum'}, {X:2,scale:.1,color:'#f472b6',label:'Solution'}];
  let err=0;
  specs.forEach((spec,j)=>{
    const W0=r*spec.X,Y0=spec.scale/2;
    for(let i=0;i<=1000;i++){
      const f=i/1000,x=f*spec.X;
      const y=(W0*Y0+(spec.scale/spec.X)*x*x/2)/(W0+x)/spec.scale;
      err=Math.max(err,Math.abs(y-P.shared(f,r)));
      if(i>=50+j*25 && (i-50-j*25)%140===0 && document.querySelector(`[data-family="${j}"]`).checked){
        const cx=tr.X(f),cy=tr.Y(y);
        let mark;
        if(j===0)mark=node('circle',{cx,cy,r:5,fill:spec.color});
        if(j===1)mark=node('rect',{x:cx-5,y:cy-5,width:10,height:10,fill:spec.color});
        if(j===2)mark=node('path',{d:`M${cx},${cy-6}l6,11h-12Z`,fill:spec.color});
        if(j===3)mark=node('path',{d:`M${cx},${cy-6}l6,6l-6,6l-6,-6Z`,fill:spec.color});
        mark.append(node('title',{},`${spec.label}: f=${f.toFixed(3)}, y=${y.toFixed(4)}`));svg.append(mark);
      }
    }
  });
  const min=P.minimum(r,.5,0);
  svg.append(node('circle',{cx:tr.X(min.f),cy:tr.Y(min.z),r:6,fill:'#fbbf24'}));
  $('family-error').textContent=`Common minimum: f = y = ${min.f.toFixed(4)}. Maximum mismatch among dimensional calculations: ${err.toExponential(1)} (floating-point precision).`;
}
$('family-r').addEventListener('input',family);document.querySelectorAll('[data-family]').forEach(n=>n.addEventListener('change',family));family();

const tabs=[...document.querySelectorAll('[role=tab]')];
function activate(key,focus=false){
  if(!$(key)||!$(key).matches('[role=tabpanel]'))key='math';
  controllers.forEach(c=>c.pause());
  for(const tab of tabs){const active=tab.getAttribute('aria-controls')===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;$(tab.getAttribute('aria-controls')).hidden=!active;if(active&&focus)tab.focus();}
}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>{const key=tab.getAttribute('aria-controls');history.replaceState(null,'','#'+key);activate(key);});
  tab.addEventListener('keydown',e=>{let idx;if(e.key==='ArrowRight')idx=(i+1)%tabs.length;if(e.key==='ArrowLeft')idx=(i+tabs.length-1)%tabs.length;if(e.key==='Home')idx=0;if(e.key==='End')idx=tabs.length-1;if(idx!==undefined){e.preventDefault();tabs[idx].click();tabs[idx].focus();}});
});
function fromHash(){
  const key=location.hash.slice(1);
  const target=$(key);
  if(target && !target.matches('[role=tabpanel]')){
    const panel=target.closest('[role=tabpanel]');
    activate(panel?.id||'math');
    requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }else activate(key||'math');
}
window.addEventListener('hashchange',fromHash);fromHash();
let printState;
window.addEventListener('beforeprint',()=>{controllers.forEach(c=>c.pause());printState=[...document.querySelectorAll('details')].map(d=>d.open);document.querySelectorAll('details').forEach(d=>d.open=true);});
window.addEventListener('afterprint',()=>{document.querySelectorAll('details').forEach((d,i)=>d.open=printState?.[i]||false);});
$('print').addEventListener('click',()=>window.print());
try{renderMathInElement(document.body,{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false,strict:'warn'});}catch(error){console.error('Math typesetting failed:',error);}
