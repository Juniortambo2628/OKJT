// Renders the reel's intro (2.6 s) and outro (3.6 s) cards to frames at 1080x1920.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', 'reel');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 })).newPage();
  await p.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'fonts.googleapis.com') return route.fulfill({ path: path.join(R, 'fonts.css'), contentType: 'text/css' });
    if (u.host === 'local.test') {
      if (u.pathname === '/') return route.fulfill({ body: '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.join(R, 'index.html'), 'utf8') + '</body></html>', contentType: 'text/html' });
      const f = path.join(R, decodeURIComponent(u.pathname)); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' });
    }
    return route.abort();
  });
  for (const [card, dur] of [['intro', 2.6], ['outro', 3.6]]) {
    await p.goto(`http://local.test/?card=${card}`); await p.waitForFunction(() => window.__ready === true);
    const dir = path.join(R, `frames_${card}`); fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < Math.round(dur * 30); i++) { await p.evaluate((t) => window.__renderAt(t), i / 30); await p.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 }); }
  }
  await b.close();
})();
