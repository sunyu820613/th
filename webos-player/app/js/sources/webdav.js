// WebDAV (PROPFIND Depth:1). Also the recommended bridge for SMB/NFS/cloud: run `rclone serve webdav` or Alist.
var WebdavSource = (function () {
  var BODY = '<?xml version="1.0" encoding="utf-8"?>' +
    '<d:propfind xmlns:d="DAV:"><d:prop><d:displayname/><d:getcontentlength/><d:resourcetype/></d:prop></d:propfind>';

  function text(node, local) {
    var n = node.getElementsByTagNameNS('*', local)[0];
    return n ? n.textContent : '';
  }

  function trimSlash(u) { return u.replace(/\/+$/, ''); }

  function list(source, loc) {
    var url = loc || source.url;
    url = url.replace(/\/?$/, '/');
    return Net.request(url, {
      method: 'PROPFIND', headers: { Depth: '1', 'Content-Type': 'application/xml; charset=utf-8' },
      body: BODY, user: source.user, pass: source.pass
    }).then(function (res) {
      var doc = new DOMParser().parseFromString(res.text, 'application/xml');
      var rs = doc.getElementsByTagNameNS('*', 'response'), out = [];
      var selfPath = trimSlash(Util.safeDecode(new URL(url).pathname));
      for (var i = 0; i < rs.length; i++) {
        var href = text(rs[i], 'href');
        if (!href) continue;
        var abs = Util.resolve(url, href);
        if (trimSlash(Util.safeDecode(new URL(abs).pathname)) === selfPath) continue;
        var isDir = rs[i].getElementsByTagNameNS('*', 'collection').length > 0;
        var name = text(rs[i], 'displayname') || Util.basename(abs);
        var size = text(rs[i], 'getcontentlength');
        if (isDir) abs = abs.replace(/\/?$/, '/');
        out.push({
          name: name, url: abs, loc: abs, isDir: isDir, size: size ? parseInt(size, 10) : null,
          kind: isDir ? 'dir' : Util.kind(name)
        });
      }
      return { title: Util.basename(url) || source.name, entries: HttpSource.sortEntries(out) };
    });
  }

  return { list: list, rootLoc: function (s) { return s.url; } };
})();
