// A comment that is markup, stored and then rendered. The page is opened in a
// real browser and the resulting DOM is read back, so "did it run" is observed
// rather than assumed.
import { anon, owner, waitUp } from './client.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME
  ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PAGE_PORT = 1348;

// The comment someone types into the box. It is not an exploit kit: it is an
// image tag whose source does not load, and the handler every image tag has.
const PAYLOAD =
  `<img src=x onerror="document.getElementById('stolen').textContent='session token taken: '+localStorage.getItem('sessionToken')">`;

await waitUp();
const line = (q, a) => console.log(`    ${q.padEnd(46)}${a}`);

// serve the page
const html = readFileSync(new URL('./page/index.html', import.meta.url), 'utf8');
const site = createServer((_, res) => { res.writeHead(200, { 'content-type': 'text/html' }); res.end(html); });
await new Promise((r) => site.listen(PAGE_PORT, '127.0.0.1', r));

// Two details that cost an afternoon each:
//   `--headless=new`, because the old headless mode hangs on --dump-dom here;
//   and an async call, because execSync blocks this process's event loop — and
//   this process is also the web server Chrome is trying to read from.
async function openInBrowser() {
  const profile = mkdtempSync(join(tmpdir(), 'injection-lab-'));
  const { stdout } = await run(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--virtual-time-budget=10000', '--dump-dom',
    `--user-data-dir=${profile}`, `http://127.0.0.1:${PAGE_PORT}/`,
  ], { encoding: 'utf8', maxBuffer: 1 << 24, timeout: 120_000 });
  if (!stdout.includes('id="stolen"')) {
    throw new Error('the browser returned no usable page — refusing to report a result');
  }
  return stdout;
}

console.log('');
console.log('  [1/2] A COMMENT THAT IS MARKUP');
console.log('');
const wrote = await anon.post('/classes/Comment', { author: 'a visitor', body: PAYLOAD });
line('the backend accepted the comment:', wrote.ok ? 'yes' : `no — ${wrote.json.error}`);

const dom = await openInBrowser();
const stolen = dom.match(/id="stolen">([^<]*)</)?.[1] ?? '(not found)';
line('after the page rendered it:', stolen);
line('the same comment in the text-rendered list:', dom.includes('&lt;img src=x') ? 'shown as the characters the person typed' : 'not shown as text');

console.log('');
console.log('  [2/2] THE SAME COMMENT, VALIDATED ON THE WAY IN');
console.log('');
site.close();
process.exit(0);
