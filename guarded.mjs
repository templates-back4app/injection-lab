// The same comment, against a backend that validates on the way in.
import { anon, owner, waitUp } from './client.mjs';
await waitUp();
const line = (q, a) => console.log(`    ${q.padEnd(46)}${a}`);
const PAYLOAD =
  `<img src=x onerror="document.getElementById('stolen').textContent='session token taken: '+localStorage.getItem('sessionToken')">`;

const blocked = await anon.post('/classes/Comment', { author: 'a visitor', body: PAYLOAD });
line('the same comment, posted again:', blocked.ok ? 'accepted' : `refused — ${blocked.json.error}`);
const ordinary = await anon.post('/classes/Comment', { author: 'a visitor', body: 'nice one, 3 < 5 though' });
line('an ordinary comment with a < in it:', ordinary.ok ? 'accepted' : `refused — ${ordinary.json.error}`);
const rows = await owner.get('/classes/Comment?limit=100');
line('comments in the table now:', String(rows.json.results.length));
console.log('');
