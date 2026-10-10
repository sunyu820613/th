#!/usr/bin/env node
// Zero-dependency CORS gateway for LAN Player.
//
//   node tools/gateway.js [port]            (default 8787)
//
// Request  GET http://<gateway>/http/192.168.1.5:8200/path/x.m3u8
// Forwards to http://192.168.1.5:8200/path/x.m3u8 and adds CORS headers. Because the target is encoded in the
// *path*, relative URLs inside HLS manifests and WebDAV hrefs keep resolving through the gateway.
// Use it when a server (MiniDLNA, nginx autoindex, IPTV relay…) does not send CORS headers and the TV blocks the request.
// Bind it on a trusted LAN only: it will fetch any http(s) URL it is asked to.
'use strict';
const http = require('http');
const https = require('https');

const PORT = parseInt(process.argv[2] || process.env.PORT || '8787', 10);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS, PROPFIND',
  'Access-Control-Allow-Headers': '*, Authorization, Depth, Content-Type, Range, SOAPACTION',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
  'Access-Control-Max-Age': '86400'
};

function parseTarget(reqUrl) {
  const m = /^\/(https?)\/([^/?#]+)(\/[^#]*)?$/.exec(reqUrl);
  if (!m) return null;
  return { protocol: m[1], host: m[2], path: m[3] || '/' };
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }
  const t = parseTarget(req.url);
  if (!t) {
    res.writeHead(400, Object.assign({ 'Content-Type': 'text/plain' }, CORS));
    return res.end('Use /http/<host:port>/<path> or /https/<host:port>/<path>\n');
  }

  const [hostname, port] = t.host.split(':');
  const headers = Object.assign({}, req.headers, { host: t.host });
  delete headers.origin;
  delete headers.referer;
  const lib = t.protocol === 'https' ? https : http;
  const up = lib.request({
    protocol: t.protocol + ':', hostname, port: port || (t.protocol === 'https' ? 443 : 80),
    method: req.method, path: t.path, headers
  }, (ur) => {
    // Keep redirects inside the gateway.
    // Drop upstream CORS headers: a duplicated "Access-Control-Allow-Origin: *, *" is rejected by browsers.
    const h = {};
    Object.keys(ur.headers).forEach((k) => { if (!/^access-control-/i.test(k)) h[k] = ur.headers[k]; });
    Object.assign(h, CORS);
    if (ur.headers.location) {
      try {
        const loc = new URL(ur.headers.location, `${t.protocol}://${t.host}${t.path}`);
        h.location = `/${loc.protocol.slice(0, -1)}/${loc.host}${loc.pathname}${loc.search}`;
      } catch (e) { /* leave as is */ }
    }
    res.writeHead(ur.statusCode, h);
    ur.pipe(res);
  });
  up.on('error', (e) => {
    if (!res.headersSent) res.writeHead(502, Object.assign({ 'Content-Type': 'text/plain' }, CORS));
    res.end('Bad gateway: ' + e.message + '\n');
  });
  res.on('close', () => up.destroy());
  req.pipe(up);
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log(`LAN Player gateway listening on :${PORT}`));
}
module.exports = { server, parseTarget };
