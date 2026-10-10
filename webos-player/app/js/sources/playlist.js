// M3U/M3U8 channel lists (live TV). Groups (group-title) become folders when there are several.
var PlaylistSource = (function () {
  var cache = {}; // url -> {t, parsed}
  var TTL = 5 * 60 * 1000;

  function load(source) {
    var c = cache[source.url];
    if (c && Date.now() - c.t < TTL) return Promise.resolve(c.parsed);
    return Net.request(source.url, { user: source.user, pass: source.pass, timeout: 30000 }).then(function (res) {
      var parsed = M3U.parse(res.text, source.url);
      cache[source.url] = { t: Date.now(), parsed: parsed };
      return parsed;
    });
  }

  function toEntry(it) {
    var kind = Util.kind(it.url);
    return {
      name: it.name, url: it.url, isDir: false, kind: kind === 'other' || kind === 'playlist' ? 'video' : kind,
      live: Util.isLiveUrl(it.url), group: it.group, logo: it.logo
    };
  }

  // loc: '' = root, 'g:<name>' = one group, 'g:' = all channels
  function list(source, loc) {
    return load(source).then(function (p) {
      if (p.type === 'hls') {
        return { title: source.name, entries: [{ name: source.name, url: source.url, isDir: false, kind: 'video', live: true }] };
      }
      var groups = M3U.groups(p.items);
      if (!loc && groups.length > 1) {
        var dirs = groups.map(function (g) { return { name: g, isDir: true, kind: 'dir', loc: 'g:' + g }; });
        dirs.unshift({ name: '全部频道 (' + p.items.length + ')', isDir: true, kind: 'dir', loc: 'g:' });
        return { title: source.name, entries: dirs };
      }
      var g = loc ? loc.slice(2) : '';
      var items = p.items.filter(function (it) { return !g || it.group === g; });
      return { title: g || source.name, entries: items.map(toEntry) };
    });
  }

  return { list: list, rootLoc: function () { return ''; } };
})();

var Sources = {
  http: HttpSource,
  webdav: WebdavSource,
  dlna: DlnaSource,
  m3u: PlaylistSource,
  TYPES: [
    { value: 'http', label: 'HTTP 目录', hint: 'http://192.168.1.10:8080/movies/' },
    { value: 'webdav', label: 'WebDAV (含 SMB 网关)', hint: 'http://192.168.1.10:5244/dav/' },
    { value: 'dlna', label: 'DLNA / UPnP', hint: 'http://192.168.1.2:8200/rootDesc.xml' },
    { value: 'm3u', label: '直播列表 M3U/M3U8', hint: 'http://192.168.1.10/iptv.m3u' }
  ],
  label: function (type) {
    for (var i = 0; i < Sources.TYPES.length; i++) if (Sources.TYPES[i].value === type) return Sources.TYPES[i].label;
    return type;
  }
};
