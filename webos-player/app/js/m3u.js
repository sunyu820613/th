// M3U / M3U8 channel list parser. Also understands the common "name,url" / "group,#genre#" text format.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./util.js'));
  else root.M3U = factory(root.Util);
})(this, function (Util) {
  function attrs(s) {
    var out = {}, re = /([\w-]+)="([^"]*)"/g, m;
    while ((m = re.exec(s))) out[m[1].toLowerCase()] = m[2];
    return out;
  }

  // Returns { type: 'hls' | 'list', items: [{name, url, group, logo}] }
  // 'hls' means the text is itself a media/master playlist (play the URL it came from, don't list it).
  function parse(text, baseUrl) {
    text = String(text || '').replace(/^﻿/, '');
    var lines = text.split(/\r?\n/);
    if (/#EXT-X-(STREAM-INF|TARGETDURATION|MEDIA-SEQUENCE|VERSION)/.test(text)) return { type: 'hls', items: [] };

    var items = [], pending = null, group = '';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      if (line.indexOf('#EXTINF') === 0) {
        var comma = line.indexOf(',');
        var meta = attrs(line);
        pending = {
          name: comma >= 0 ? line.slice(comma + 1).trim() : '',
          group: meta['group-title'] || '',
          logo: meta['tvg-logo'] || ''
        };
        if (!pending.name) pending.name = meta['tvg-name'] || '';
        continue;
      }
      if (line.indexOf('#EXTGRP:') === 0) {
        if (pending) pending.group = line.slice(8).trim();
        continue;
      }
      if (line.charAt(0) === '#') continue;

      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(line) || (baseUrl && !/,/.test(line) && pending)) {
        var url = baseUrl ? Util.resolve(baseUrl, line) : line;
        var it = pending || { name: '', group: group, logo: '' };
        if (!it.name) it.name = Util.basename(url) || url;
        if (!it.group && !pending) it.group = group;
        it.url = url;
        items.push(it);
        pending = null;
        continue;
      }

      // "name,url" or "group,#genre#"
      var c = line.indexOf(',');
      if (c > 0) {
        var left = line.slice(0, c).trim(), right = line.slice(c + 1).trim();
        if (right === '#genre#') { group = left; continue; }
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(right)) {
          items.push({ name: left, url: right, group: group, logo: '' });
        }
      }
    }
    return { type: 'list', items: items };
  }

  function groups(items) {
    var seen = {}, out = [];
    items.forEach(function (it) {
      if (it.group && !seen[it.group]) { seen[it.group] = 1; out.push(it.group); }
    });
    return out;
  }

  return { parse: parse, groups: groups };
});
