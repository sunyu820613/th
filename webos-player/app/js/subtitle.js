// External subtitle support: decode (UTF-8 / UTF-16 / GB18030) and convert SRT / ASS / SSA to WebVTT.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./util.js'));
  else root.Subtitle = factory(root.Util);
})(this, function (Util) {
  function decode(buf) {
    var u8 = new Uint8Array(buf);
    if (u8[0] === 0xFF && u8[1] === 0xFE) return new TextDecoder('utf-16le').decode(u8);
    if (u8[0] === 0xFE && u8[1] === 0xFF) return new TextDecoder('utf-16be').decode(u8);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(u8).replace(/^﻿/, '');
    } catch (e) {
      try { return new TextDecoder('gb18030').decode(u8); } catch (e2) { return new TextDecoder('utf-8').decode(u8); }
    }
  }

  function srtToVtt(text) {
    var body = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
      .replace(/(\d{1,2}:\d{2}:\d{2}),(\d{1,3})/g, function (_, a, b) { return a + '.' + (b + '00').slice(0, 3); })
      .replace(/\{\\an?\d\}/g, '');
    return 'WEBVTT\n\n' + body.trim() + '\n';
  }

  function assTime(t) {
    var m = /^(\d+):(\d{2}):(\d{2})[.:](\d{1,3})$/.exec(t.trim());
    if (!m) return null;
    var h = ('0' + m[1]).slice(-2);
    var ms = (m[4] + '00').slice(0, 3);
    return h + ':' + m[2] + ':' + m[3] + '.' + ms;
  }

  function assToVtt(text) {
    var lines = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
    var inEvents = false, fmt = null, cues = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (/^\[.*\]$/.test(line)) { inEvents = /^\[events\]$/i.test(line); continue; }
      if (!inEvents) continue;
      if (/^format:/i.test(line)) {
        fmt = line.slice(7).split(',').map(function (s) { return s.trim().toLowerCase(); });
      } else if (/^dialogue:/i.test(line) && fmt) {
        var parts = line.slice(9).split(','), n = fmt.length;
        var rec = parts.slice(0, n - 1);
        rec.push(parts.slice(n - 1).join(','));
        var start = assTime(rec[fmt.indexOf('start')] || ''), end = assTime(rec[fmt.indexOf('end')] || '');
        var txt = (rec[fmt.indexOf('text')] || '')
          .replace(/\{[^}]*\}/g, '').replace(/\\[Nn]/g, '\n').replace(/\\h/g, ' ').trim();
        if (start && end && txt) cues.push({ s: start, e: end, t: txt });
      }
    }
    cues.sort(function (a, b) { return a.s < b.s ? -1 : a.s > b.s ? 1 : 0; });
    return 'WEBVTT\n\n' + cues.map(function (c) { return c.s + ' --> ' + c.e + '\n' + c.t; }).join('\n\n') + '\n';
  }

  function toVtt(text, name) {
    var e = Util.ext(name);
    if (e === 'ass' || e === 'ssa') return assToVtt(text);
    if (e === 'srt') return srtToVtt(text);
    return /^﻿?WEBVTT/.test(text) ? text.replace(/^﻿/, '') : srtToVtt(text);
  }

  return { decode: decode, toVtt: toVtt, srtToVtt: srtToVtt, assToVtt: assToVtt };
});
