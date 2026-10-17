"""Generate two seekable HyperFrames compositions from the same SVG/math as the lab."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parent.parent
out=ROOT/'animations/tipping';out.mkdir(parents=True,exist_ok=True)
runtime=ROOT.parent/'hyperframes-runtime/node_modules/gsap'
# Each film is an independent composition project.
for candidate in ['LICENSE','LICENSE.md','LICENSE.txt']:
    if (runtime/candidate).exists():shutil.copyfile(runtime/candidate,out/'GSAP-LICENSE.txt');break
font=ROOT/'vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2'
shared=(ROOT/'stability-physics.js').read_text()+'\n'+(ROOT/'stability-render.js').read_text()
for name,mode in [('index','tilt'),('criteria','criteria')]:
    project=out/mode;project.mkdir(exist_ok=True)
    shutil.copyfile(runtime/'dist/gsap.min.js',project/'gsap.min.js')
    shutil.copyfile(font,project/'ScienceSans.woff2')
    ident='stability-'+mode
    title='A free surface changes the tipping threshold' if mode=='tilt' else 'The question determines the winning fill'
    sub='Same 25% fill. Different constraints on the water.' if mode=='tilt' else 'Immobilized-water reference: angle, energy, impulse, angular speed.'
    draw="const t=state.t;const deg=t<1?0:t<3?20.98*(t-1)/2:t<5?20.98:t<7?20.98+9.02*(t-5)/2:t<8?30:Math.max(0,30*(10-t)/2);document.getElementById('stage').innerHTML=StabilityRender.comparison(.25,deg*Math.PI/180);" if mode=='tilt' else "document.getElementById('stage').innerHTML=StabilityRender.sweep(Math.max(0,Math.min(1,(state.t-.5)/9)));"
    foot='Computed 3D water volume and centroids. Prescribed tilt, not a falling or sloshing simulation.' if mode=='tilt' else 'H = 30 cm; R = 2.913 cm; shell = 100 g; full water = 800 g. Different row scales.'
    page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1280,height=720"><title>'''+title+'''</title><script src="gsap.min.js"></script><style>
@font-face{font-family:ScienceSans;src:url('ScienceSans.woff2') format('woff2')}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#0b1220;color:#e2e8f0;font-family:ScienceSans,sans-serif}#root{position:relative;width:100%;height:100%;overflow:hidden;padding:30px 45px}.clip{position:absolute;inset:0;padding:30px 45px}.film-title{position:absolute;top:20px;left:45px;width:1190px;height:55px}p{position:absolute;top:77px;left:45px;right:45px;font-size:21px;line-height:1.4;margin:12px 0 0}#stage{position:absolute;top:125px;left:45px;right:45px;height:500px;display:flex;justify-content:center;gap:25px;align-items:center}#stage svg{height:100%;max-width:100%;flex:1;min-width:0}#stage text{font-family:ScienceSans,sans-serif}footer{position:absolute;left:45px;right:45px;bottom:22px;font-size:18px;color:#a8bbcf;border-top:1px solid #28445b;padding-top:12px}
</style></head><body><div id="root" data-composition-id="'''+ident+'''" data-start="0" data-width="1280" data-height="720" data-duration="10" data-fps="24"><svg class="film-title" viewBox="0 0 1190 55"><text x="0" y="38" fill="#38bdf8" font-size="34" font-family="ScienceSans,sans-serif">'''+title+'''</text></svg><p>'''+sub+'''</p><div id="stage"></div><footer>'''+foot+'''</footer></div><script>'''+shared+'''
const state={t:0};function draw(){'''+draw+'''}draw();const timeline=gsap.timeline({paused:true});timeline.to(state,{t:10,duration:10,ease:'none',onUpdate:draw},0);window.__timelines=window.__timelines||{};window.__timelines['''+repr(ident)+''']=timeline;
</script></body></html>'''
    (project/'index.html').write_text(page)
(out/'hyperframes.json').write_text('{"name":"bottle-stability-animations"}\n')
(out/'BRIEF.md').write_text('''# Bottle stability animations

Existing educational site extension; two silent, seekable computed-physics films.

- Framework: HyperFrames CLI 0.8.169; local rendering, no hosted credits.
- Audience: mathematically fluent reader; explanatory accuracy comes first.
- Canvas: 1280 × 720, 24 fps, 10 seconds each, dark theme, no music or narration.
- Film 1: same quarter fill under a prescribed tilt; compare immobilized and freely settled water.
- Film 2: sweep fill; show four distinct resistance measures and physical units.
- Must: label all motion as computed illustration, not a calibrated fall; distinguish central section from 3D volume.
- Sources: shared stability-physics.js and stability-render.js in repository root. No generated images.
- Review: lint, render, sample beginning/middle/end, inspect frames and measured video duration.
''')
print('Wrote two HyperFrames compositions.')
