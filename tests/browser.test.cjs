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
  await page.locator('#ideal-play').click();
  await page.waitForFunction(()=>Number(document.getElementById('ideal-fill').value)<49);
  await page.locator('#ideal-play').click();
  assert.equal(await page.locator('#ideal-play').innerText(),'Play');
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
  await page.locator('details summary').first().click();
  assert.equal(await page.locator('details').first().getAttribute('open'),'');
  await page.goto(base+'/#math');
  await page.locator('#tab-math').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#tab-intuition').getAttribute('aria-selected'),'true');
  await page.keyboard.press('End');
  assert.equal(await page.locator('#tab-next').getAttribute('aria-selected'),'true');
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
  await page.locator('#tab-math').click();
  await page.screenshot({path:process.env.QA_DIR?path.join(process.env.QA_DIR,'mobile.png'):'/tmp/bottle-mobile.png',fullPage:false});
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(external,[]);
  console.log('PASS: six tabs, equations, sliders, animation, CSV, shape, dimensional curves, references, keyboard tabs, print, mobile layout, and zero external requests.');
  await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);process.exit(1)});
