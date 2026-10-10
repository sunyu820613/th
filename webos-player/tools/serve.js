#!/usr/bin/env node
// Tiny static server to try the app in a desktop browser (Chrome): node tools/serve.js [port]  ->  http://localhost:8080
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'app');
const PORT = parseInt(process.argv[2] || '8080', 10);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.normalize(path.join(ROOT, rel === '/' ? 'index.html' : rel));
  if (file.indexOf(ROOT) !== 0) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`LAN Player: http://localhost:${PORT}  (keys: arrows, Enter, Esc=Back, R/G/Y/B = colour keys)`));
