#!/usr/bin/env node
// Zero-dependency CORS gateway for LAN Player.
//
//   node tools/gateway.js [port] [--allow-origin=<origin>]... [--allow-loopback] [--host=<bind addr>]
//
// Request  GET http://<gateway>/http/192.168.1.5:8200/path/x.m3u8
// Forwards to http://192.168.1.5:8200/path/x.m3u8 and adds CORS headers. Because the target is encoded in the
// *path*, relative URLs inside HLS manifests and WebDAV hrefs keep resolving through the gateway.
//
// Safety (it is a forward proxy, so it is locked down by default):
//  - Requests carrying an http(s) Origin are refused: that means a web page in some browser, not the TV app
//    (webOS apps load from file:// and send no / "null" / file:// Origin). Allow a page explicitly with --allow-origin.
//  - Loopback and link-local targets (127.0.0.0/8, ::1, localhost, 169.254.0.0/16) are refused unless --allow-loopback.
//  - Only GET, HEAD, POST, OPTIONS and PROPFIND are forwarded.
// It still proxies any other LAN host: run it on a trusted network only.
'use strict';
const http = require('http');
const https = require('https');

const METHODS = ['GET', 'HEAD', 'POST', 'OPTIONS', 'PROPFIND'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': METHODS.join(', '),
  'Access-Control-Allow-Headers': '*, Authorization, Depth, Content-Type, Range, SOAPACTION',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
  'Access-Control-Max-Age': '86400'
};

function parseTarget(reqUrl) {
  const m = /^\/(https?)\/([^/?#]+)(\/[^#]*)?$/.exec(reqUrl);
  if (!m) return null;
  return { protocol: m[1], host: m[2], path: m[3] || '/' };
}

function hostnameOf(hostPort) {
  // "[::1]:80" | "host:80" | "host"
  const m = /^\[([^\]]+)\](?::\d+)?$/.exec(hostPort);
  return (m ? m[1] : hostPort.replace(/:\d+$/, '')).toLowerCase();
}

function isLoopbackOrLinkLocal(hostname) {
  return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '::1' || hostname === '0.0.0.0' ||
    /^127\./.test(hostname) || /^169\.254\./.test(hostname) || /^fe80:/i.test(hostname) || /^::ffff:(127\.|169\.254\.)/i.test(hostname);
}

function originAllowed(origin, allowed) {
  if (!origin || origin === 'null' || /^file:/i.test(origin)) return true; // native / file:// apps
  return allowed.indexOf(origin) >= 0;
}

function deny(res, code, msg) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'text/plain' }, CORS));
  res.end(msg + '\n');
}

function createServer(opts) {
  opts = opts || {};
  const allowedOrigins = opts.allowOrigins || [];
  const server = http.createServer((req, res) => {
    if (!originAllowed(req.headers.origin, allowedOrigins)) return deny(res, 403, 'Origin not allowed (use --allow-origin)');
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS);
      return res.end();
    }
    if (METHODS.indexOf(req.method) < 0) return deny(res, 405, 'Method not allowed');

    const t = parseTarget(req.url);
    if (!t) return deny(res, 400, 'Use /http/<host:port>/<path> or /https/<host:port>/<path>');
    const hostname = hostnameOf(t.host);
    if (!opts.allowLoopback && isLoopbackOrLinkLocal(hostname)) return deny(res, 403, 'Loopback / link-local targets are blocked (use --allow-loopback)');

    const portMatch = /:(\d+)$/.exec(t.host);
    const headers = Object.assign({}, req.headers, { host: t.host });
    delete headers.origin;
    delete headers.referer;
    const lib = t.protocol === 'https' ? https : http;
    const up = lib.request({
      protocol: t.protocol + ':', hostname, port: portMatch ? portMatch[1] : (t.protocol === 'https' ? 443 : 80),
      method: req.method, path: t.path, headers
    }, (ur) => {
      // Drop upstream CORS headers: a duplicated "Access-Control-Allow-Origin: *, *" is rejected by browsers.
      const h = {};
      Object.keys(ur.headers).forEach((k) => { if (!/^access-control-/i.test(k)) h[k] = ur.headers[k]; });
      Object.assign(h, CORS);
      // Keep redirects inside the gateway.
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
  return server;
}

function parseArgs(argv) {
  const o = { port: parseInt(process.env.PORT || '8787', 10), host: '0.0.0.0', allowOrigins: [], allowLoopback: false };
  argv.forEach((a) => {
    let m;
    if (/^\d+$/.test(a)) o.port = parseInt(a, 10);
    else if ((m = /^--allow-origin=(.+)$/.exec(a))) o.allowOrigins.push(m[1]);
    else if ((m = /^--host=(.+)$/.exec(a))) o.host = m[1];
    else if (a === '--allow-loopback') o.allowLoopback = true;
  });
  return o;
}

if (require.main === module) {
  const o = parseArgs(process.argv.slice(2));
  createServer(o).listen(o.port, o.host, () => console.log(`LAN Player gateway listening on ${o.host}:${o.port}`));
}
module.exports = { createServer, parseTarget, parseArgs, isLoopbackOrLinkLocal, originAllowed };
