/* Start a local HTTP server first. Optional CHROMIUM_PATH for an existing binary. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
  let server;
  let base=process.env.TEST_URL;
  if(!base){
    const http=require('node:http'),root=path.resolve(__dirname,'..');
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'};
    server=http.createServer((req,res)=>{
      let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(name.endsWith('/'))name+='index.html';
      const file=path.resolve(root,'.'+name);
      if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
      fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();}else{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);}});
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    base='http://127.0.0.1:'+server.address().port;
  }
  const options={headless:true};
  if(process.env.CHROMIUM_PATH)options.executablePath=process.env.CHROMIUM_PATH;
  options.args=['--no-sandbox','--disable-dev-shm-usage'];
  const browser=await chromium.launch(options);
  const context=await browser.newContext({viewport:{width:Number(process.env.TEST_WIDTH)||1440,height:Number(process.env.TEST_HEIGHT)||1000},acceptDownloads:true});
  const page=await context.newPage(),errors=[],failures=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>failures.push(r.url()));
  page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('[role=tab]').count(),6);
  assert.equal(await page.locator('.katex-error').count(),0);
  assert.equal(await page.locator('.eq .katex-display').count(),await page.locator('.eq').count(),'Every display equation must survive HTML parsing and typeset.');
  assert.ok((await page.locator('#math').innerText()).includes('For 0<b<H'));
  assert.ok(await page.locator('.katex').count()>40);
  assert.ok(await page.locator('.visual-aid').count()>=24);
  for(const key of ['math','intuition','effects','family','unknown','next'])assert.ok(await page.locator(`#${key} .visual-aid`).count()>0,`Missing visual aids: ${key}`);
  assert.equal(await page.locator('#ideal-current').innerText(),'0.300 H');
  assert.equal(await page.locator('#ideal-minimum').innerText(),'0.250 H');
  assert.equal(await page.locator('#ideal-critical').innerText(),'25%');
  await page.screenshot({path:process.env.QA_DIR?path.join(process.env.QA_DIR,'desktop.png'):'/tmp/bottle-desktop.png'});
  for(const key of ['intuition','effects','family','unknown','next','math']){
    await page.locator(`#tab-${key}`).click();
    assert.ok(await page.locator(`#${key}`).isVisible());
    assert.equal(await page.locator('[role=tabpanel]:visible').count(),1);
  }
  await page.locator('#ideal-fill').fill('25');
  assert.equal(await page.locator('#ideal-current').innerText(),'0.250 H');
  await page.locator('#ideal-fill').fill('0');
  assert.equal(await page.locator('#ideal-current').innerText(),'0.500 H');
  await page.locator('#ideal-reset').click();
  assert.equal(await page.locator('#ideal-speed').inputValue(),'2');
  const beforeSpeed=await page.locator('#ideal-current').innerText();
  await page.locator('#ideal-speed').selectOption('8');
  assert.equal(await page.locator('#ideal-current').innerText(),beforeSpeed,'Speed must not change the physical state');
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.locator('#ideal-play').click();
  await page.clock.runFor(1000);
  const playedFill=Number(await page.locator('#ideal-fill').inputValue());
  assert.ok(Math.abs(playedFill-10)<1.5,`8× should remove about 40 percentage points per second within frame timing tolerance; got ${playedFill}% remaining`);
  await page.locator('#ideal-play').click();
  assert.equal(await page.locator('#ideal-play').innerText(),'Play');
  await page.clock.resume();
  const downloadPromise=page.waitForEvent('download');await page.locator('#ideal-csv').click();
  const download=await downloadPromise;
  const csv=fs.readFileSync(await download.path(),'utf8');
  assert.equal(csv.trim().split('\n').length,1002);
  assert.ok(csv.startsWith('fraction_consumed,water_fraction'));
  await page.locator('#tab-effects').click();
  await page.locator('#shape').fill('0.8');
  assert.equal(await page.locator('#shape-value').innerText(),'0.80');
  assert.notEqual(await page.locator('#real-critical').innerText(),'25%');
  await page.locator('#real-reset').click();
  await page.locator('#tab-family').click();
  assert.ok((await page.locator('#family-error').innerText()).includes('f = y = 0.2500'));
  const markers=await page.locator('#family-plot title').count();
  await page.locator('[data-family="0"]').uncheck();
  assert.ok(await page.locator('#family-plot title').count()<markers);
  await page.locator('#family-r').fill('0');
  assert.ok((await page.locator('#family-error').innerText()).includes('0.4142'));
  await page.goto(base+'/#ref-4');
  assert.ok(await page.locator('#next').isVisible());
  assert.ok(await page.locator('#ref-4').isVisible());
  await page.goto(base+'/#unknown');
  await page.locator('#unknown details summary').first().click();
  assert.equal(await page.locator('#unknown details').first().getAttribute('open'),'');
  await page.goto(base+'/#symmetry');
  assert.ok(await page.locator('#intuition').isVisible());
  assert.ok(await page.locator('#symmetry').isVisible());
  await page.locator('#reflection-fill').fill('50');
  assert.equal(await page.locator('#reflection-water').innerText(),'0.250 H');
  assert.equal(await page.locator('#reflection-cg').innerText(),'0.300 H');
  await page.locator('#reflection-fill').fill('0');
  assert.equal(await page.locator('#reflection-water').innerText(),'Undefined (no water)');
  assert.equal(await page.locator('#reflection-cg').innerText(),'0.500 H');
  await page.locator('#reflection-fill').fill('100');
  assert.equal(await page.locator('#reflection-water').innerText(),'0.500 H');
  assert.equal(await page.locator('#reflection-cg').innerText(),'0.500 H');
  await page.locator('#symmetry-proof summary').click();
  assert.equal(await page.locator('#symmetry-proof').getAttribute('open'),'');
  assert.ok(await page.locator('#symmetry-proof .katex-display').count()>=7);
  assert.equal(await page.locator('#symmetry-proof .katex-display').count(),await page.locator('#symmetry-proof .eq').count());
  assert.equal(await page.locator('.katex-error').count(),0);
  for(const [key,title,file] of [
    ['intuition','See the two different reflection planes','reflection-pairs'],
    ['effects','A fixed water amount, two orientations','tilt'],
    ['family','Temperature: the incoming value must cross the current average','analogue'],
    ['next','Keep the prediction and measurement routes independent','workflow']
  ]){
    await page.locator(`#tab-${key}`).click();
    const fig=page.locator('figure.visual-aid').filter({hasText:title});
    assert.equal(await fig.count(),1);
    await fig.screenshot({path:path.join(process.env.QA_DIR||'/tmp',`bottle-${file}.png`)});
  }
  await page.goto(base+'/#math');
  await page.locator('#tab-math').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#tab-intuition').getAttribute('aria-selected'),'true');
  await page.keyboard.press('End');
  assert.equal(await page.locator('#tab-next').getAttribute('aria-selected'),'true');
  await page.locator('.skip').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#tab-next').getAttribute('aria-selected'),'true','Skip must preserve the current chapter');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'main','Skip must focus the content');
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('[role=tabpanel]:visible').count(),6);
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/#math');
  for(const key of ['math','intuition','effects','family','unknown','next']){
    await page.locator(`#tab-${key}`).click();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,`page overflow on mobile: ${key}`);
  }
  await page.goto(base+'/#reflection-explorer');
  await page.locator('#reflection-fill').fill('25');
  assert.equal(await page.locator('#reflection-cg').innerText(),'0.250 H');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.locator('#reflection-explorer').screenshot({path:path.join(process.env.QA_DIR||'/tmp','bottle-reflection-mobile.png')});
  await page.locator('#tab-math').click();
  await page.screenshot({path:process.env.QA_DIR?path.join(process.env.QA_DIR,'mobile.png'):'/tmp/bottle-mobile.png',fullPage:false});
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(external,[]);
  console.log('PASS: six tabs, equations, sliders, animation, CSV, shape, dimensional curves, references, keyboard tabs, print, mobile layout, and zero external requests.');
  await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);process.exit(1)});
