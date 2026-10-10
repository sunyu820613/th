// DLNA / UPnP MediaServer: browse ContentDirectory over SOAP.
// A web app cannot do SSDP multicast discovery, so the user enters either the device description URL
// (e.g. http://192.168.1.2:8200/rootDesc.xml for MiniDLNA) or the ContentDirectory control URL directly.
var DlnaSource = (function () {
  var SVC = 'urn:schemas-upnp-org:service:ContentDirectory:1';
  var PAGE = 500, MAX = 5000;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function localText(parent, local) {
    for (var i = 0; i < parent.children.length; i++) {
      if (parent.children[i].localName === local) return parent.children[i].textContent;
    }
    return '';
  }

  // Resolve (and cache on the source object) the control URL.
  function controlUrl(source) {
    if (source._control) return Promise.resolve(source._control);
    if (!/\.xml(\?|$)/i.test(source.url)) {
      source._control = source.url;
      return Promise.resolve(source._control);
    }
    return Net.request(source.url).then(function (res) {
      var doc = new DOMParser().parseFromString(res.text, 'application/xml');
      var base = localText(doc.documentElement, 'URLBase') || source.url;
      var services = doc.getElementsByTagNameNS('*', 'service');
      for (var i = 0; i < services.length; i++) {
        if (localText(services[i], 'serviceType').indexOf('ContentDirectory') >= 0) {
          source._control = Util.resolve(base, localText(services[i], 'controlURL'));
          return source._control;
        }
      }
      throw new Error('该设备没有 ContentDirectory 服务');
    });
  }

  function browse(ctl, id, start) {
    var body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
      's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:Browse xmlns:u="' + SVC + '">' +
      '<ObjectID>' + esc(id) + '</ObjectID><BrowseFlag>BrowseDirectChildren</BrowseFlag><Filter>*</Filter>' +
      '<StartingIndex>' + start + '</StartingIndex><RequestedCount>' + PAGE + '</RequestedCount>' +
      '<SortCriteria></SortCriteria></u:Browse></s:Body></s:Envelope>';
    return Net.request(ctl, {
      method: 'POST', body: body,
      headers: { 'Content-Type': 'text/xml; charset="utf-8"', SOAPACTION: '"' + SVC + '#Browse"' }
    }).then(function (res) {
      var env = new DOMParser().parseFromString(res.text, 'application/xml');
      var result = env.getElementsByTagName('Result')[0];
      var returned = parseInt((env.getElementsByTagName('NumberReturned')[0] || {}).textContent || '0', 10);
      var total = parseInt((env.getElementsByTagName('TotalMatches')[0] || {}).textContent || '0', 10);
      var didl = new DOMParser().parseFromString(result ? result.textContent : '<x/>', 'application/xml');
      return { entries: parseDidl(didl.documentElement), returned: returned, total: total };
    });
  }

  function parseDidl(root) {
    var out = [];
    for (var i = 0; i < root.children.length; i++) {
      var n = root.children[i], title = localText(n, 'title');
      if (n.localName === 'container') {
        out.push({ name: title, loc: n.getAttribute('id'), isDir: true, kind: 'dir' });
      } else if (n.localName === 'item') {
        var best = null, subs = [];
        for (var j = 0; j < n.children.length; j++) {
          var r = n.children[j];
          if (r.localName !== 'res') continue;
          var pi = r.getAttribute('protocolInfo') || '';
          if (/:text\//i.test(pi) || /srt|ass|vtt/i.test(pi)) { subs.push({ name: title + '.srt', url: r.textContent.trim() }); continue; }
          if (!best && /:(video|audio)\//i.test(pi)) best = r;
        }
        if (!best) continue; // images etc.
        var size = best.getAttribute('size');
        out.push({
          name: title, url: best.textContent.trim(), isDir: false, kind: /:audio\//i.test(best.getAttribute('protocolInfo')) ? 'audio' : 'video',
          size: size ? parseInt(size, 10) : null, subs: subs
        });
      }
    }
    return out;
  }

  function list(source, loc) {
    var id = loc || '0';
    return controlUrl(source).then(function (ctl) {
      var all = [];
      function page(start) {
        return browse(ctl, id, start).then(function (r) {
          all = all.concat(r.entries);
          var next = start + (r.returned || PAGE);
          if (r.returned > 0 && next < r.total && next < MAX) return page(next);
        });
      }
      return page(0).then(function () {
        return { title: id === '0' ? source.name : '', entries: all };
      });
    });
  }

  return { list: list, rootLoc: function () { return '0'; } };
})();
