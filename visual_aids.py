"""Deterministic scientific SVGs. No generated imagery or external dependencies."""
from html import escape
from math import sqrt, sin, cos, pi, atan, exp, log10

C={'water':'#38bdf8','cg':'#fbbf24','shell':'#e2e8f0','plane':'#f472b6','muted':'#9db4ca','grid':'#28445b','green':'#34d399','purple':'#c084fc'}
class Drawing:
    def __init__(self,label,w=320,h=280):
        self.w,self.h=w,h
        self.parts=[f'<svg class="science-svg" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label,quote=True)}"><title>{escape(label)}</title>']
    def line(self,x1,y1,x2,y2,color='muted',dash='',width=1.5):
        self.parts.append(f'<line x1="{x1:.3f}" y1="{y1:.3f}" x2="{x2:.3f}" y2="{y2:.3f}" stroke="{C.get(color,color)}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
    def rect(self,x,y,w,h,color='grid',fill='none',dash=''):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{C.get(fill,fill)}" stroke="{C.get(color,color)}" stroke-width="1.6" stroke-dasharray="{dash}"/>')
    def path(self,points,color='water',fill='none',width=2.5,close=False,dash=''):
        d=' '.join(('M' if i==0 else 'L')+f'{x:.3f},{y:.3f}' for i,(x,y) in enumerate(points))+(' Z' if close else '')
        self.parts.append(f'<path d="{d}" fill="{C.get(fill,fill)}" stroke="{C.get(color,color)}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
    def text(self,x,y,text,color='muted',size=13,anchor='start'):
        lines=str(text).split('\n')
        self.parts.append(f'<text x="{x}" y="{y}" fill="{C.get(color,color)}" font-size="{size}" text-anchor="{anchor}">'+''.join(f'<tspan x="{x}" dy="{0 if i==0 else 17}">{escape(s)}</tspan>' for i,s in enumerate(lines))+'</text>')
    def dot(self,x,y,color='cg',r=6,shape='circle',fill=None):
        fill=C.get(fill or color,fill or color)
        if shape=='square':self.rect(x-r,y-r,2*r,2*r,color,'none')
        elif shape=='diamond':self.path([(x,y-r),(x+r,y),(x,y+r),(x-r,y)],color,fill,1.5,True)
        else:self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{C.get(color,color)}" stroke-width="2"/>')
    def arrow(self,x1,y1,x2,y2,color='cg'):
        self.line(x1,y1,x2,y2,color,width=2)
        dx,dy=x2-x1,y2-y1;n=sqrt(dx*dx+dy*dy)
        if n:
            ux,uy=dx/n,dy/n
            self.path([(x2,y2),(x2-7*ux+4*uy,y2-7*uy-4*ux),(x2-7*ux-4*uy,y2-7*uy+4*ux)],color,C[color],1,True)
    def finish(self):return ''.join(self.parts)+'</svg>'

def cg(f,r=.125,b=.5): return (r*b+f*f/2)/(r+f)
def figure(title,panels,caption,kind='Computed model / geometric schematic'):
    return '<figure class="visual-aid"><figcaption><strong>'+title+'</strong><span class="visual-kind">'+kind+'</span></figcaption><div class="visual-grid">'+''.join('<div class="visual-panel"><h4>'+heading+'</h4>'+svg+'<p class="visual-reading">'+reading+'</p></div>' for heading,svg,reading in panels)+'</div><p class="visual-caption">'+caption+'</p></figure>'

def bottle(f=.5,r=.125,b=.5,water_cg=False,reflection=False,shell_pairs=False,pairs=False,highlight=False,move=False,shape=0):
    d=Drawing('Bottle cross-section with exact normalized heights; water fill '+str(f))
    yy=lambda u:230-185*u
    half=lambda u:42*sqrt(1-shape+2*shape*u)
    if abs(shape)<1e-10:u=f
    else:u=2*f/((1-shape)+sqrt((1-shape)**2+4*shape*f))
    J=(1-shape)*u*u/2+2*shape*u*u*u/3
    z=(r*b+J)/(r+f)
    points=[(130-half(i/50),yy(i/50)) for i in range(51)]+[(130+half(i/50),yy(i/50)) for i in range(50,-1,-1)]
    water=[(130-half(u*i/50),yy(u*i/50)) for i in range(51)]+[(130+half(u*i/50),yy(u*i/50)) for i in range(50,-1,-1)]
    if f>0:d.path(water,'water','#124966',1,True)
    d.path(points,'shell','none',1.6,True)
    d.line(60,yy(.5),250,yy(.5),'shell','5 4')
    d.text(260,yy(.5)+4,'H/2','shell',12)
    d.text(58,yy(1)+4,'H','muted',12,'end');d.text(58,yy(0)+4,'0','muted',12,'end')
    if f>0:
        d.line(130-half(u),yy(u),130+half(u),yy(u),'water',width=2)
    if pairs or shell_pairs:
        for j,(low,col) in enumerate([(.2,'shell' if shell_pairs else 'water'),(.35,'purple' if shell_pairs else 'plane')]):
            x=88 if shell_pairs else 120+j*20
            d.line(x,yy(low),x,yy(1-low),col,'3 4')
            d.dot(x,yy(low),col,5);d.dot(x,yy(1-low),col,5)
        d.text(130,262,'Each same-color pair has equal mass.','muted',12,'middle')
    else:
        d.dot(130,yy(b),'shell',10,'square')
        if water_cg and f>0:
            zw=J/f
            if reflection:d.line(55,yy(zw),235,yy(zw),'plane','3 4',2)
            d.dot(130,yy(zw),'water',8,fill='#0b1220')
        d.dot(130,yy(z),'cg',5,'diamond')
        if highlight and f>0:
            d.rect(130-half(u),yy(u),2*half(u),5,'plane','#f472b6')
            d.text(195,yy(u)+5,'removed layer','plane',11)
            d.dot(130,yy(z),'cg',5,'diamond')
        if move and abs(u-z)>1e-6:
            step=25 if u>z else -25
            d.arrow(205,yy(z),205,yy(z)+step)
            d.text(220,yy(z)+step/2+4,'falls' if step>0 else 'rises','cg',12)
    return d.finish()

def symmetry():
    return figure('See the two different reflection planes',[
        ('Full water: mirror pairs',bottle(1,pairs=True),'Reflect across the <strong>white dashed plane at H/2</strong>. Upper and lower elements at equal distances have cancelling moments.'),
        ('Empty symmetric shell',bottle(0,shell_pairs=True),'The same pairing works <strong>only if the shell’s mass distribution has that reflection symmetry</strong>. The drawn pairs are representative.'),
        ('40% full: a lower water plane',bottle(.4,water_cg=True,reflection=True),'The <strong>pink plane at 0.20 H</strong> bisects the water. Water CG: 0.200 H; shell CG: 0.500 H; combined CG: <strong>0.271 H</strong>.')],
        'Cross-sections through the axis; all three use the same vertical scale. Cyan ring = water CG; white square = shell CG; amber diamond = combined CG. Where markers coincide they are concentric. The partial-fill example uses shell/full-water mass ratio 1/8 and shell CG H/2. A full water column and an empty symmetric shell balance at the same plane, while a partial fill does not.').replace('<figure class="visual-aid">','<figure class="visual-aid" id="symmetry-pairs">',1)

def endpoints():
    return figure('One height scale, three distinct mass distributions',[
        ('Full',bottle(1,water_cg=True),'Water, shell, and combined CG coincide at <strong>0.500 H</strong>.'),
        ('Quarter full',bottle(.25,water_cg=True),'Water CG <strong>0.125 H</strong> &lt; combined CG <strong>0.250 H</strong> &lt; shell CG <strong>0.500 H</strong>.'),
        ('Empty',bottle(0),'Only the shell remains; combined CG = <strong>0.500 H</strong>. There is no water CG.')],
        'Exact normalized positions for a cylindrical interior, shell/full-water mass ratio 1/8, and a midpoint-balanced shell. Cyan ring = water CG; white square = shell CG; amber diamond = combined CG. The common dashed plane makes the dip visible without relying on an imagined trajectory.')

def layers():
    return figure('A sip removes a layer above, through, or below the CG',[
        ('75% full: CG falls',bottle(.75,highlight=True,move=True),'Surface <strong>0.750 H</strong> is above CG <strong>0.393 H</strong>. Removing the highlighted top layer lowers the CG.'),
        ('25% full: turning point',bottle(.25,highlight=True),'Surface and CG both lie at <strong>0.250 H</strong>. An infinitesimal removal has zero first-order effect.'),
        ('5% full: CG rises',bottle(.05,highlight=True,move=True),'Surface <strong>0.050 H</strong> is below CG <strong>0.364 H</strong>. Removing low ballast raises the CG.')],
        'Pink strips mark the location of the infinitesimal layer missing between nearby settled states; their visible thickness is exaggerated. Amber diamonds show the combined CG and arrows show its direction during removal. These are comparisons of mass distributions, not paths followed by molecules through a straw. Mass ratio 1/8; shell CG H/2.')

def half_full():
    return figure('Half-full is not yet the lowest balance point',[
        ('50% full',bottle(.5,highlight=True,move=True),'Surface: <strong>0.500 H</strong>. Combined CG: <strong>0.300 H</strong>. The next removed layer lies above the CG.'),
        ('45% full',bottle(.45,move=True),'Surface: <strong>0.450 H</strong>. Combined CG: <strong>0.285 H</strong>. Removing this additional water has lowered the CG further.')],
        'Same exact cylinder model and vertical scale in both panels; mass ratio 1/8, shell CG H/2. Amber diamond = combined CG. White square / dashed line = shell CG. Pink marks a removed infinitesimal layer, with exaggerated thickness; amber arrows indicate direction only. The comparison illustrates why a midpoint-balanced cylinder’s minimum must occur below half-full.')

def ballast():
    panels=[]
    for f in [.75,.25,.05]:
        d=Drawing('Equivalent water point mass at its computed centroid')
        yy=lambda u:230-185*u
        d.line(90,45,90,230,'muted')
        d.line(60,yy(.5),255,yy(.5),'shell','4 4')
        d.dot(90,yy(.5),'shell',12,'square')
        # Circle area, not diameter, is proportional to remaining water mass.
        d.dot(150,yy(f/2),'water',30*sqrt(f),'circle',fill='#124966')
        d.dot(220,yy(cg(f)),'cg',6,'diamond')
        d.text(90,265,'Shell','shell',12,'middle');d.text(150,265,'Water','water',12,'middle');d.text(220,265,'Combined','cg',12,'middle')
        panels.append((f'{f*100:g}% water remains',d.finish(),f'Water mass is {f:g} × full-water mass; its centroid is {f/2:.3f} H. Combined CG: <strong>{cg(f):.3f} H</strong>.'))
    return figure('Equivalent ballast moves down while its influence disappears',panels,'The blue disk replaces the water mathematically, at its own centroid. Disk area is proportional to water mass; its radius therefore scales with the square root of mass. Horizontal offsets separate the three markers for legibility and do not represent lateral CG positions. All heights are exact for the stated cylinder model (mass ratio 1/8).')

def complements():
    panels=[]
    for f in [.25,.75]:
        d=Drawing('Equal centered moment, unequal total mass',h=150)
        d.text(15,22,'Moment magnitude / (full-water mass × H)',size=11)
        d.rect(15,35,180,15,'plane','plane');d.text(205,48,'0.09375','plane',12)
        d.text(15,84,'Total mass / full-water mass',size=12)
        d.rect(15,96,260*(.125+f)/1.125,15,'water','water');d.text(15,137,f'{.125+f:.3f}','water',13)
        panels.append((f'{f*100:g}% full',bottle(f)+d.finish(),f'Equal negative moment, but total mass is <strong>{.125+f:.3f}</strong> × full-water mass. CG = <strong>{cg(f):.6f} H</strong>.'))
    return figure('Complementary fills: the moment matches; the normalization does not',panels,'Pink bar lengths show moment magnitudes; both signed centered moments are −0.09375 × (full-water mass × H). They are not water-mass bars. The blue bars use one common mass scale. Their ratio differs, so the quarter-full state has a larger downward displacement from H/2. Shell/full-water mass ratio = 1/8.')

def integral():
    d=Drawing('Horizontal slice contributes its mass times height to the first moment')
    d.rect(75,35,100,190,'shell');d.rect(75,104,100,121,'water','#124966')
    d.rect(75,139,100,8,'plane','plane')
    d.line(35,225,270,225,'shell');d.arrow(205,225,205,143,'plane')
    d.text(215,187,'height s','plane',12);d.text(190,119,'surface h','water',12)
    d.text(20,258,'slice mass = density × area × thickness',size=12)
    e=Drawing('Two contributions to the total first moment')
    e.text(15,45,'Shell contribution','shell',15);e.text(15,73,'shell mass × shell CG height','shell',13)
    e.text(15,125,'Water contribution','water',15);e.text(15,153,'sum of (slice mass × slice height)','water',13)
    e.line(15,180,300,180);e.text(15,215,'Add the two moments, then divide','cg',14);e.text(15,240,'by shell mass + remaining water mass.','cg',13)
    return figure('What the mass integral is adding up',[('One horizontal slice',d.finish(),'The pink slice has a known height and a small mass. Its first-moment contribution is that mass multiplied by its height.'),('The bookkeeping',e.finish(),'The numerator combines first moments; the denominator combines masses. Neither is held fixed during emptying.')],'The pink slice thickness is exaggerated. Height is measured from the internal bottom. This diagram explains the exact integration in the adjacent derivation; it is not a fluid-flow calculation.')

def chart(label,curves,xlabel='Water remaining',ylabel='CG / H',xmin=0,xmax=1,ymin=0,ymax=.6,logx=False,points=()):
    d=Drawing(label,w=450,h=290)
    X=lambda x:58+(log10(x/xmin)/log10(xmax/xmin) if logx else (x-xmin)/(xmax-xmin))*365
    Y=lambda y:220-(y-ymin)/(ymax-ymin)*185
    for i in range(5):
        v=ymin+(ymax-ymin)*i/4;d.line(58,Y(v),423,Y(v),'grid');d.text(49,Y(v)+4,f'{v:.2g}',size=12,anchor='end')
    ticks=[.0001,.001,.01,.1,1] if logx else [xmin+(xmax-xmin)*i/4 for i in range(5)]
    for x in ticks:d.line(X(x),35,X(x),220,'grid');d.text(X(x),244,f'{x:g}',size=12,anchor='middle')
    if ymin<0<ymax:d.line(58,Y(0),423,Y(0),'shell','4 4')
    for j,(name,fn,color) in enumerate(curves):
        pts=[]
        for i in range(501):
            x=xmin*(xmax/xmin)**(i/500) if logx else xmin+(xmax-xmin)*i/500
            pts.append((X(x),Y(fn(x))))
        d.path(pts,color,width=2.3)
    for x,y,label in points:
        d.dot(X(x),Y(y),'cg',5,'diamond');d.text(X(x)+8,Y(y)-12,label,'cg',12)
    d.text(240,275,xlabel,size=13,anchor='middle');d.text(58,18,ylabel,size=13)
    return d.finish()

def mass_family(singular=False):
    rs=[.001,.01,.125] if singular else [.01,.125,10]
    cols=['water','plane','green']
    curves=[(str(r),lambda f,r=r:cg(f,r),c) for r,c in zip(rs,cols)]
    svg=chart('Computed CG curves for different shell mass ratios',curves,xmin=.0001 if singular else 0,logx=singular,xlabel='Water fraction (log scale)' if singular else 'Water fraction (0 = empty, 1 = full)')
    legend='; '.join(f'<span style="color:{C[c]}">mass ratio {r:g}</span>' for r,c in zip(rs,cols))
    return figure('A light shell hides a sharp near-empty return' if singular else 'Change the shell mass, and the depth of the dip changes',[(legend,svg,'All curves assume the same shell CG at H/2. Only the shell/full-water mass ratio changes.')],('Zero cannot appear on this logarithmic horizontal axis. For every positive shell mass, the empty-limit CG is 0.5 H even when the plotted near-empty portion lies much lower. Setting shell mass exactly to zero removes the empty system’s CG altogether.' if singular else 'The curves are computed from the exact cylinder model. A heavy shell anchors the balance point; a light shell lets it follow the water farther downward.'),'Computed model curves')

def timing():
    def intermittent(t):
        if t<.15:return 1
        if t<.4:return 1-.45*(t-.15)/.25
        if t<.6:return .55
        return .55*(1-t)/.4
    curves=[('steady',lambda t:1-t,'water'),('with pauses',intermittent,'plane')]
    return figure('The same state curve can unfold on different clocks',[
        ('Water remaining versus time',chart('Constant-rate and paused removal schedules',curves,xlabel='Elapsed time / total duration',ylabel='Water fraction',ymax=1.05),'Cyan: steady removal. Pink: two pauses with faster removal between them.'),
        ('CG versus time',chart('CG under the two prescribed sipping schedules',[(n,lambda t,fn=fn:cg(fn(t)),c) for n,fn,c in curves],xlabel='Elapsed time / total duration'), 'The minimum height is identical. Its time changes from <strong>75.0%</strong> to <strong>81.8%</strong> of the total duration.')],
        'Both schedules are prescribed illustrative inputs, not observations. Horizontal plateaus represent settled pauses. Neither schedule changes the CG-versus-fill law; shell/full-water mass ratio 1/8, shell CG H/2.','Computed response to two specified schedules')

def shapes():
    panels=[]
    for a,title in [(-.75,'Broad base'),(0,'Cylinder'),(.75,'Broad top')]:
        u=.5 if a==0 else 1/((1-a)+sqrt((1-a)**2+2*a))
        panels.append((title,bottle(.5,shape=a),f'<strong>50% of full volume</strong> occupies {u*100:.1f}% of the height. Area-slope parameter: {a:+.2f}.'))
    return figure('Equal remaining volume does not mean equal remaining depth',panels,'Same height, full internal volume, shell mass, and shell CG in all three designed examples. Width is proportional to the square root of cross-sectional area. The shell mass distribution is held fixed as an independent modeling constraint, not inferred from the drawn outline.')

def polygon_centroid(poly):
    area=cx=cy=0
    for (x,y),(xx,yy) in zip(poly,poly[1:]+poly[:1]):
        cross=x*yy-xx*y;area+=cross;cx+=(x+xx)*cross;cy+=(y+yy)*cross
    return cx/(3*area),cy/(3*area)
def clip_below(poly,level):
    wet=[]
    for p,q in zip(poly,poly[1:]+poly[:1]):
        pin,qin=p[1]>=level,q[1]>=level
        if pin:wet.append(p)
        if pin!=qin:
            t=(level-p[1])/(q[1]-p[1]);wet.append((p[0]+t*(q[0]-p[0]),level))
    return wet
def polygon_area(poly):
    return abs(sum(x*yy-xx*y for (x,y),(xx,yy) in zip(poly,poly[1:]+poly[:1])))/2
def tilted(angle):
    d=Drawing('Computed 2D rectangular vessel cross-section with horizontal water surface')
    a=angle*pi/180;c,s=cos(a),sin(a)
    rot=lambda x,y:(150+c*x-s*y,130+s*x+c*y)
    poly=[rot(-40,-90),rot(40,-90),rot(40,90),rot(-40,90)]
    wet=clip_below(poly,130)
    wc=polygon_centroid(wet);z=((.125*150+.5*wc[0])/.625,(.125*130+.5*wc[1])/.625)
    d.path(wet,'water','#124966',1,True);d.path(poly,'shell','none',1.7,True)
    d.line(40,130,260,130,'water','4 3')
    x1,y1=rot(0,-105);x2,y2=rot(0,105);d.line(x1,y1,x2,y2,'plane','4 4')
    d.dot(150,130,'shell',8,'square');d.dot(*wc,'water',6,fill='#0b1220');d.dot(*z,'cg',5,'diamond')
    d.arrow(285,45,285,100,'shell');d.text(275,27,'gravity','shell',12,'middle')
    d.text(150,260,'Water surface stays horizontal.','water',13,'middle')
    return d.finish()
def tilt():
    return figure('A fixed water amount, two orientations',[
        ('Upright',tilted(0),'The water centroid lies on the vessel’s symmetry axis.'),
        ('Tilted 35°',tilted(35),'The free surface is horizontal, while the pink vessel axis is inclined. The water and combined centroids move off that axis.')],
        'Exact polygon clipping and area centroids for a 2D rectangular cross-section (equivalently, a uniform-depth rectangular tank), half full, with shell/full-water mass ratio 1/8 and shell CG at its geometric center. This is a geometry illustration, not a cylindrical-bottle prediction or CFD solution. Cyan ring = water centroid; white square = shell CG; amber diamond = combined CG.')

def droplet():
    before=(100*.5+8*.005+1*.9)/109;after=(100*.5+8*.005)/108
    d=Drawing('Retained high water and a low pool contribute at different heights')
    d.rect(85,35,90,190,'shell');d.rect(85,223,90,2,'water','water')
    d.dot(169,54,'water',4);d.text(195,58,'1 g at 0.90 H','water',12)
    d.dot(130,130,'shell',9,'square');d.dot(130,225-190*before,'cg',5,'diamond')
    d.text(20,263,'8 g pooled at centroid 0.005 H',size=12)
    e=Drawing('Magnified CG displacement after high retained water is removed')
    yy=lambda z:235-(z-.46)/.015*185
    e.line(90,45,90,235,'shell')
    e.dot(90,yy(before),'plane',6);e.text(115,yy(before)+4,f'Before: {before:.6f} H','plane',13)
    e.dot(90,yy(after),'cg',6);e.text(115,yy(after)+4,f'After: {after:.6f} H','cg',13)
    e.arrow(65,yy(before),65,yy(after),'cg');e.text(15,265,'Magnified vertical scale; not full height.',size=12)
    return figure('Removing high retained water can lower the final CG',[
        ('Where the masses are',d.finish(),'Shell: 100 g at 0.50 H. Low pool: 8 g at 0.005 H. Retained neck water: 1 g at 0.90 H.'),
        ('The small shift, magnified',e.finish(),f'Removing the high 1 g lowers the CG by <strong>{(before-after):.6f} H</strong> (about {(before-after)*300:.2f} mm if H = 30 cm).')],
        'Moment calculation for prescribed masses and positions. The retained-water shape is schematic and not drawn to volume scale; no claim is made that a particular surface can pin this mass. The right panel explicitly magnifies the vertical range so a small shift remains visible.')

def capillary():
    d=Drawing('Bond number increases as the square of local feature size',w=450,h=200)
    for x,col,L,bo,label in [(75,'plane','.27','0.01','Surface tension'),(225,'cg','2.7','1','Competition'),(375,'water','27','100','Gravity')]:
        d.dot(x,85,col,8);d.text(x,35,label,col,14,'middle');d.text(x,122,'L = '+L+' mm',size=13,anchor='middle');d.text(x,150,'Bo = '+bo,col,14,'middle')
    d.line(75,85,375,85,'muted');d.text(225,185,'Each equal step is ×10 in size, ×100 in Bo.',size=12,anchor='middle')
    return figure('Use the size of the liquid feature—not just the bottle', [('',d.finish(),'A broad pool and a tiny wall film in the same bottle can lie in different physical regimes.')], 'Regime scale for water near room temperature using capillary length ≈2.7 mm. The three sizes are logarithmically spaced, not drawn as same-size physical droplets. This explains when a flat horizontal interface is a useful approximation; it does not solve an interface shape.','Dimensionless regime diagram')

def slosh():
    svg=chart('Illustrative decaying slosh coordinate', [('mode',lambda t:.06*exp(-.15*t)*cos(2*pi*t),'water')],xlabel='Time (chosen oscillator units)',ylabel='Lateral mode coordinate / H',xmin=0,xmax=5,ymin=-.065,ymax=.065)
    return figure('The water can move while the amount stays fixed',[('',svg,'The horizontal mode coordinate oscillates and decays. Fill level is held constant throughout.')],'Illustrative free response q/H = 0.06 exp(−0.15 t) cos(2πt), corresponding to a damped linear oscillator with these chosen time units. This is a generalized-coordinate trace, not a computed free surface or a calibrated bottle slosh prediction.','Illustrative reduced-order model')

def boundary():
    d=Drawing('Boundary conditions required by a free-surface fluid model',w=450,h=280)
    d.rect(140,65,150,150,'shell');d.rect(140,140,150,75,'water','#124966')
    d.line(140,140,290,140,'water',width=3)
    d.text(225,24,'Gas pressure + surface stress','water',14,'middle');d.line(225,35,225,137,'water','3 4')
    d.text(10,85,'Wall motion\nand no slip','shell',13);d.line(95,105,140,110,'shell')
    d.arrow(290,192,345,192,'plane');d.text(348,185,'Outlet\nflux','plane',12)
    d.text(225,257,'Initial liquid shape + velocity field','cg',14,'middle');d.line(225,235,225,195,'cg','3 4')
    return figure('A differential equation is not yet a complete flow problem',[('',d.finish(),'The liquid domain, initial state, wall conditions, outlet, and free surface must be specified together.')],'Boundary map only. It does not depict a predicted velocity field, an actual drain geometry, or a solved interface. The outlet arrow identifies prescribed mass flux rather than a simulated stream.','Boundary-condition schematic')

def kernel():
    return figure('A density correction is weighted by where it occurs',[('',chart('Sign of a small added mass contribution versus height',[('kernel',lambda s:s-.3,'plane')],xlabel='Height of added mass / H',ylabel='Signed leverage (height / H − 0.30)',ymin=-.35,ymax=.75,points=[(.3,0,'At current CG')]),'Left of height 0.30 H, added mass lowers the CG. At the CG it has no first-order effect. Above it, added mass raises the CG.')],'The line is the exact first-order leverage kernel for an initial CG at 0.30 H. The white dashed line is zero leverage. It is not a density profile. The actual correction also depends on how much density changes at each height and on the total mass.','Computed sensitivity kernel')

def analogue(kind):
    settings={'thermal':('Temperature',40,20,'°C'), 'electrical':('Voltage',12,0,' V'), 'momentum':('Velocity',6,0,' m/s'), 'solution':('Solute mass fraction',10,0,'%')}
    title,scale,offset,unit=settings[kind]
    d=Drawing('Marginal input and accumulated response in '+title.lower(),w=450,h=270)
    for i,f in enumerate([.1,.6]):
        yy=65+120*i;y=cg(f)
        X=lambda q:50+350*q
        d.text(20,yy-30,f'Added fraction = {f:.1f}',size=13)
        d.line(50,yy,400,yy,'grid',width=3)
        d.dot(X(f),yy,'water',6);d.dot(X(y),yy,'cg',6,'diamond')
        end=y+(f-y)*.6;d.arrow(X(y),yy-16,X(end),yy-16,'cg')
        d.text(20,yy+35,f'Input: {offset+scale*f:.2f}{unit}     System: {offset+scale*y:.2f}{unit}',size=13)
    return figure(title+': the incoming value must cross the current average',[(('Before minimum: decreases / after minimum: increases'),d.finish(),'Cyan circle = incoming value. Amber diamond = current accumulated response. Amber arrows indicate direction, not the size of an incremental change.')],f'Exact values from the worked {kind} example, with initial weight/reference added weight = 1/8. Horizontal position encodes a normalized {title.lower()}, not a physical location. Initial normalized response = 1/2.','Computed dimensional example')

def exchange():
    panels=[]
    for fixed in [False,True]:
        d=Drawing('Inflow and outflow determine whether the mixing weight grows')
        d.rect(85,55,150,150,'shell');d.rect(85,125,150,80,'water','#124966')
        d.arrow(25,95,85,95,'water');d.text(20,65,'Inflow','water',13)
        if fixed:d.arrow(235,165,300,165,'plane');d.text(244,199,'Outflow','plane',12)
        else:d.text(160,110,'weight grows','cg',13,'middle');d.arrow(250,180,250,125,'cg')
        d.text(160,250,'Equal rates → fixed weight' if fixed else 'No outlet → growing weight',size=13,anchor='middle')
        panels.append(('Fixed-weight exchange' if fixed else 'Accumulation',d.finish(),'Perfectly mixed outflow removes the current average.' if fixed else 'Everything added remains inside the modeled system.'))
    return figure('Similar inputs do not imply the same time equation',panels,'These control-volume schematics distinguish the boundary conditions. In the fixed-weight case, inflow and outflow rates are equal; in the accumulation case, only inflow is present. Fill shapes and arrows are schematic, not fluid simulation outputs.','System-boundary schematic')

def frames():
    panels=[]
    for full,base in [(True,0),(False,10)]:
        d=Drawing('Laboratory height includes bottle translation')
        yy=lambda cm:240-5*cm
        f=1 if full else .25;z=base+30*cg(f)
        d.rect(95,yy(base+30),90,150,'shell');d.rect(95,yy(base+30*f),90,150*f,'water','#124966')
        d.line(40,yy(15),260,yy(15),'muted','4 4')
        d.dot(140,yy(z),'cg',6,'diamond');d.text(200,yy(z)-8,f'{z:g} cm','cg',13)
        d.text(15,yy(0)+5,'0 cm',size=12);d.text(140,270,f'Bottom at {base} cm',size=13,anchor='middle')
        panels.append(('Initial: full, resting low' if full else 'Later: quarter full, lifted',d.finish(),f'CG relative to bottle bottom: {30*cg(f):g} cm. Laboratory CG height: <strong>{z:g} cm</strong>.'))
    return figure('The CG can fall relative to the bottle and rise in the room',panels,'Same vertical laboratory scale in both panels; H = 30 cm, mass ratio 1/8, midpoint shell CG. Raising the bottom by 10 cm while the relative CG falls by 7.5 cm makes the laboratory CG rise by 2.5 cm. The dashed line is the initial laboratory CG height of 15 cm.')

def stability():
    panels=[]
    for angle in [True,False]:
        d=Drawing('Comparison of frozen-mass tipping criteria',w=340,h=240)
        for i,(f,label) in enumerate([(1,'Full'),(.25,'Quarter full')]):
            z=cg(f);mass=.125+f
            val=atan(.12/z)*180/pi if angle else mass*(sqrt(z*z+.12**2)-z)
            maximum=30 if angle else .02;y=70+i*90
            d.text(15,y-15,label,size=13);d.rect(15,y,270*val/maximum,18,'water' if i==0 else 'cg','water' if i==0 else 'cg')
            d.text(15,y+43,f'{val:.2f}°' if angle else f'{val:.5f} × (full-water mass × g × H)',size=12)
        panels.append(('Tilt threshold' if angle else 'Energy barrier',d.finish(),'Quarter-full tolerates a larger quasistatic tilt.' if angle else 'Full has the larger barrier among these two states, despite its higher CG.'))
    return figure('“More stable” depends on what disturbance you mean',panels,'Computed rigid-body comparison with frozen mass distribution, centered CG, support radius / H = 0.12, shell mass ratio 1/8. Each panel has its own stated units; bar lengths are comparable only within a panel. No claim is made that full is the global energy-barrier optimum. Real water redistribution and sliding can change the result.','Computed rigid-body comparison')

def workflow():
    d=Drawing('Model and measurement must independently converge on a prediction check',w=480,h=330)
    def box(x,y,w,h,label,col='shell'):
        d.rect(x,y,w,h,col,'none');d.text(x+w/2,y+h/2-4,label,col,13,'middle')
    box(10,20,200,65,'Measure shell mass, CG\nand interior geometry')
    box(270,20,200,65,'Record water mass; measure\nCG on matched rigid replicas')
    box(10,125,200,60,'Predict the whole curve','water')
    box(270,125,200,60,'Quantify measurement error','plane')
    d.arrow(110,85,110,125,'water');d.arrow(370,85,370,125,'plane')
    d.arrow(110,185,180,235,'water');d.arrow(370,185,300,235,'plane')
    box(130,235,220,70,'Compare residuals; test\nassumptions before adding CFD','cg')
    return figure('Keep the prediction and measurement routes independent',[('',d.finish(),'A model earns trust when observations can disagree with it. Parameter calibration and validation should not silently reuse the same evidence.')],'A proposed experimental workflow, not a report of an experiment already performed. The branches distinguish theoretical prediction from independent measurement and uncertainty assessment.','Experimental-design diagram')

def reflection_interactive():
    return '''<figure class="visual-aid" id="reflection-explorer"><figcaption><strong>Move the water’s own reflection plane</strong><span class="visual-kind">Interactive exact cylinder model</span></figcaption><div class="reflection-layout"><div><label for="reflection-fill">Water remaining <output id="reflection-value">40%</output></label><input id="reflection-fill" type="range" min="0" max="100" step="1" value="40"><p class="visual-reading">The bottle midpoint stays fixed. The water midpoint follows half the water depth. The combined CG is a mass-weighted average of the shell and water centroids.</p><dl class="reflection-readouts"><dt>Shell CG / bottle midpoint</dt><dd>0.500 H</dd><dt>Water CG / water reflection plane</dt><dd id="reflection-water">0.200 H</dd><dt>Combined CG</dt><dd id="reflection-cg">0.271 H</dd></dl></div><svg id="reflection-svg" class="diagram" viewBox="0 0 300 240" role="img" aria-label="Bottle and water reflection planes and three computed centroids"></svg></div><p class="visual-caption">White square and dashed line: shell CG / bottle midpoint. Pink dashed line and cyan ring: water reflection plane / water CG. Amber diamond: combined CG. Markers are concentric when they coincide. Water surface is a solid cyan line. Shell/full-water mass ratio = 1/8; height H. At empty, no water centroid or water reflection plane is defined.</p></figure>'''

def inject_after_heading(content,heading,visual):
    anchor='<h3>'+heading+'</h3>'
    assert content.count(anchor)==1,heading
    return content.replace(anchor,anchor+visual,1)

def enrich(math,intuition,effects,family,unknown,nextp):
    math=inject_after_heading(math,'2. From a mass integral to a weighted average',integral())
    math=inject_after_heading(math,'6. Dimensionless form and asymptotics',mass_family())
    math=inject_after_heading(math,'7. Time is a separate model',timing())
    intuition=inject_after_heading(intuition,'1. The endpoints force a dip',endpoints())
    intuition=inject_after_heading(intuition,'2. Vanishing ballast resolves the paradox',ballast())
    intuition=inject_after_heading(intuition,'3. Half-full cannot be the minimum',half_full())
    intuition=inject_after_heading(intuition,'4. The marginal-layer test',layers())
    intuition=inject_after_heading(intuition,'The short argument without mathematics',symmetry()+reflection_interactive())
    intuition=inject_after_heading(intuition,'The subtler symmetry: equal moment, unequal CG',complements())
    effects=inject_after_heading(effects,'2. An analytic shape family you can explore',shapes())
    effects=inject_after_heading(effects,'4. Retained films, droplets, and moving shell material',droplet())
    effects=inject_after_heading(effects,'5. Tilt: solve an occupied three-dimensional domain',tilt())
    effects=inject_after_heading(effects,'6. Capillarity: when the horizontal-surface approximation fails',capillary())
    effects=inject_after_heading(effects,'7. Sloshing: a dynamical extension, not a corrected static curve',slosh())
    effects=inject_after_heading(effects,'8. The full fluid model and what closes it',boundary())
    effects=inject_after_heading(effects,'9. Density gradients and a systematic perturbation expansion',kernel())
    for heading,kind in [('3. Thermal mixing','thermal'),('4. Electrical charge sharing','electrical'),('5. Inelastic capture and momentum','momentum'),('6. Nonreacting solution mixing','solution')]:
        family=inject_after_heading(family,heading,analogue(kind))
    family=inject_after_heading(family,'7. Two ways the correspondence can fail',exchange())
    for title,visual in [('The zero-mass shell is a singular limit',mass_family(True)),('The experiment’s frame can dominate the signal',frames()),('Low CG does not mean hardest to knock over',stability())]:
        anchor='<summary>'+title+'</summary>';assert unknown.count(anchor)==1
        unknown=unknown.replace(anchor,anchor+visual,1)
    nextp=nextp.replace('<ol class="timeline">',workflow()+'<ol class="timeline">',1)
    return math,intuition,effects,family,unknown,nextp

if __name__=='__main__':
    # Geometry checks independent of the app's JavaScript models.
    assert abs(cg(.4)-.27142857142857146)<1e-12
    assert abs(cg(.25)-.25)<1e-12
    assert polygon_centroid([(0,0),(2,0),(2,1),(0,1)])==(1,.5)
    for angle in [0,35,60]:
        a=angle*pi/180;c,s=cos(a),sin(a)
        poly=[(150+c*x-s*y,130+s*x+c*y) for x,y in [(-40,-90),(40,-90),(40,90),(-40,90)]]
        wet=clip_below(poly,130)
        assert abs(polygon_area(wet)/polygon_area(poly)-.5)<1e-12
        assert all(y>=130-1e-12 for x,y in wet)
    assert polygon_centroid(clip_below([(110,40),(190,40),(190,220),(110,220)],130))==(150,175)
    for a in [-.75,.75]:
        u=1/((1-a)+sqrt((1-a)**2+2*a))
        assert abs((1-a)*u+a*u*u-.5)<1e-12
    print('PASS: visual model centroids, shape volumes, and example CGs.')
