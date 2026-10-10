// Plain HTTP directory listing: nginx/Apache autoindex (HTML), nginx autoindex_format json, Alist-style static indexes.
var HttpSource = (function () {
  function dirUrl(u) { return u.replace(/[?#].*$/, '').replace(/\/?$/, '/'); }

  function entryFrom(name, url, isDir, size) {
    return { name: name, url: url, loc: url, isDir: isDir, size: size, kind: isDir ? 'dir' : Util.kind(name) };
  }

  function parseJson(arr, base) {
    return arr.map(function (e) {
      var isDir = e.type === 'directory';
      return entryFrom(e.name, Util.resolve(base, encodeURIComponent(e.name) + (isDir ? '/' : '')), isDir, e.size);
    });
  }

  function parseHtml(html, base) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var cur = Util.resolve(dirUrl(base), ''), seen = {}, out = []; // normalised like `abs` below (host case, :80, %-encoding)
    var links = doc.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var raw = links[i].getAttribute('href');
      if (!raw || raw.charAt(0) === '?' || raw.charAt(0) === '#' || /^(javascript|mailto):/i.test(raw)) continue;
      var abs = Util.resolve(cur, raw).replace(/[?#].*$/, '');
      if (abs.indexOf(cur) !== 0 || abs === cur || seen[abs]) continue; // parent / sort links / external
      seen[abs] = 1;
      var isDir = /\/$/.test(abs);
      var name = Util.basename(abs) || (links[i].textContent || '').trim();
      out.push(entryFrom(name, abs, isDir, null));
    }
    return out;
  }

  function sortEntries(list) {
    return list.sort(function (a, b) {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return Util.naturalSort(a.name, b.name);
    });
  }

  function list(source, loc) {
    var url = loc || source.url;
    return Net.request(dirUrl(url), { user: source.user, pass: source.pass }).then(function (res) {
      var t = res.text.trim(), entries;
      if (t.charAt(0) === '[') {
        try { entries = parseJson(JSON.parse(t), dirUrl(url)); } catch (e) { entries = []; }
      } else {
        entries = parseHtml(res.text, url);
      }
      return { title: Util.basename(dirUrl(url)) || source.name, entries: sortEntries(entries) };
    });
  }

  return { list: list, sortEntries: sortEntries, rootLoc: function (s) { return s.url; } };
})();
