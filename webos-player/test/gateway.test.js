const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const gw = require('../tools/gateway.js');

function listen(server) { return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port))); }
function get(port, path, headers, method) {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, host: '127.0.0.1', path, method: method || 'GET', headers }, (res) => {
      let body = ''; res.on('data', (d) => body += d); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end();
  });
}

test('gateway: parseTarget / loopback / origin rules', () => {
  assert.deepStrictEqual(gw.parseTarget('/http/192.168.1.5:8200/a/b?x=1'), { protocol: 'http', host: '192.168.1.5:8200', path: '/a/b?x=1' });
  assert.strictEqual(gw.parseTarget('/ftp/x/y'), null);
  for (const h of ['localhost', '127.0.0.1', '::1', '169.254.169.254', '::ffff:127.0.0.1']) assert.ok(gw.isLoopbackOrLinkLocal(h), h);
  for (const h of ['192.168.1.5', '10.0.0.2', 'nas.lan']) assert.ok(!gw.isLoopbackOrLinkLocal(h), h);
  assert.ok(gw.originAllowed(undefined, []) && gw.originAllowed('null', []) && gw.originAllowed('file://', []));
  assert.ok(!gw.originAllowed('http://evil.example', []) && gw.originAllowed('http://ok.example', ['http://ok.example']));
});

test('gateway: proxies, adds a single CORS header set, and refuses hostile requests', async () => {
  const upstream = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }); // upstream also sends CORS
    res.end('hello ' + req.url + ' ' + req.method);
  });
  const up = await listen(upstream);
  const strict = gw.createServer({});
  const open = gw.createServer({ allowLoopback: true });
  const sp = await listen(strict), op = await listen(open);
  try {
    // default: loopback upstream blocked
    assert.strictEqual((await get(sp, `/http/127.0.0.1:${up}/x`)).status, 403);
    // allowed with the flag; upstream CORS header is not duplicated
    const ok = await get(op, `/http/127.0.0.1:${up}/dir/x?y=1`);
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(ok.body, 'hello /dir/x?y=1 GET');
    assert.strictEqual(ok.headers['access-control-allow-origin'], '*'); // would be '*, *' if duplicated
    // a web page origin is refused, TV-style origins are fine
    assert.strictEqual((await get(op, `/http/127.0.0.1:${up}/x`, { Origin: 'http://evil.example' })).status, 403);
    assert.strictEqual((await get(op, `/http/127.0.0.1:${up}/x`, { Origin: 'file://' })).status, 200);
    // method allow-list and preflight
    assert.strictEqual((await get(op, `/http/127.0.0.1:${up}/x`, {}, 'DELETE')).status, 405);
    assert.strictEqual((await get(op, '/anything', {}, 'OPTIONS')).status, 204);
    assert.strictEqual((await get(op, '/nope')).status, 400);
  } finally { [upstream, strict, open].forEach((s) => s.close()); }
});
