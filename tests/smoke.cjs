const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.pdf':'application/pdf'};
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const local = path.resolve(root, '.' + pathname.replace(/^\/PropuestaGMMMC2027/, '') + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!local.startsWith(root + path.sep)) {response.writeHead(403).end(); return;}
  fs.readFile(local, (error, data) => {
    if (error) {response.writeHead(404).end(); return;}
    response.writeHead(200, {'Content-Type': mime[path.extname(local)] || 'application/octet-stream'}); response.end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless: true, ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {})});
  const report = {responsive: [], platforms: [], slides: 0, pdf: null};
  try {
    const page = await browser.newPage({acceptDownloads: true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}/PropuestaGMMMC2027/`;
    await page.goto(base);
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      for (const img of document.images) img.loading = 'eager';
      await Promise.all([...document.images].filter(img=>img.getAttribute('src')).map(img => img.decode()));
      await document.fonts.ready;
    });
    assert.match(await page.title(), /GMMMC 2027/);
    const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.ok(!/(src|href)="\.\.\//.test(source), 'No external workspace dependencies');
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({width, height: 1000});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      report.responsive.push(width);
    }
    const targets = {piano:'https://piano.imusicala.com', estudiantes:'https://fsa-estudiantes.web.app', docentes:'https://fsa-docentes.web.app', lideres:'https://fsa-lideres.web.app', muestras:'https://musicala.github.io/muestrasdeprocesofsa/'};
    for (const [key, url] of Object.entries(targets)) {
      const button = page.locator(`main [data-platform="${key}"]`);
      assert.equal(await button.count(), 1);
      assert.equal(await button.getAttribute('href'), url);
      assert.equal(await button.getAttribute('target'), '_blank');
      assert.equal(await button.getAttribute('rel'), 'noopener noreferrer');
      report.platforms.push(key);
    }
    // Check native popup behavior without logging into or modifying any remote app.
    const app = page.locator('main [data-platform="piano"]');
    const popupPromise = page.waitForEvent('popup');
    await app.click(); const popup = await popupPromise;
    await popup.waitForURL(url => url.href.startsWith(targets.piano), {waitUntil:'commit'});
    assert.equal(await popup.evaluate(() => window.opener === null), true); await popup.close();

    await page.locator('#crea-tab-E').click();
    assert.equal(await page.locator('#crea-panel-E').isVisible(), true);
    await page.locator('#simStart').fill('2027-02-01');
    await page.locator('#simEnd').fill('2027-02-28');
    assert.equal(await page.locator('#simCount').textContent(), '8');
    await page.locator('#presentBtn').click();
    report.slides = Number((await page.locator('#deckCount').textContent()).split('/')[1]);
    for (let i = 0; i < report.slides; i++) {
      assert.equal(await page.locator('#deckBody').evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
      if (await page.locator('#presentation #simulador').count()) {
        await page.locator('#simGroups').fill('2');
        await page.locator('[data-date="2027-02-02"]').click();
        assert.match(await page.locator('#simTraining').textContent(), /1.260.000/);
        await page.locator('#eventName').fill('Muestra de proceso');
        await page.locator('#eventForm button[type=submit]').click();
        assert.match(await page.locator('#simTotal').textContent(), /1.620.000/);
      }
      if (i < report.slides - 1) await page.locator('#deckNext').click();
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('main #simulador').count(), 1);
    assert.equal(await page.locator('#simGroups').inputValue(), '2');
    if (process.env.CHECK_PDF === '1') {
      const pending = page.waitForEvent('download', {timeout: 180000});
      await page.locator('#downloadPdfBtn').click();
      const download = await pending;
      const output = path.join(os.tmpdir(), 'Musicala-GMMMC-2027-verificacion.pdf');
      await download.saveAs(output);
      const data = fs.readFileSync(output);
      assert.equal(data.subarray(0, 5).toString(), '%PDF-');
      assert.ok(data.length > 100000);
      report.pdf = {bytes: data.length, file: output};
      assert.equal(await page.locator('.pdf-render-frame').count(), 0);
    }
    // The same exported folder also supports direct local file opening.
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    assert.equal(await page.locator('main .platform-button').count(), 5);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error); server.close(); process.exitCode = 1;});
