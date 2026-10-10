(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Util = factory();
})(this, function () {
  var VIDEO = 'mp4 m4v mkv avi mov ts m2ts mts flv wmv webm mpg mpeg rmvb 3gp vob m3u8 mp3 flac aac m4a wav ogg opus wma'.split(' ');
  var AUDIO = 'mp3 flac aac m4a wav ogg opus wma'.split(' ');
  var SUB = 'srt ass ssa vtt'.split(' ');

  function ext(url) {
    var p = String(url || '').split('#')[0].split('?')[0];
    var i = p.lastIndexOf('.');
    var s = p.lastIndexOf('/');
    return i > s ? p.slice(i + 1).toLowerCase() : '';
  }

  function safeDecode(s) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }

  function basename(url) {
    var p = String(url || '').split('#')[0].split('?')[0].replace(/\/+$/, '');
    return safeDecode(p.slice(p.lastIndexOf('/') + 1));
  }

  function stripExt(name) {
    var i = name.lastIndexOf('.');
    return i > 0 ? name.slice(0, i) : name;
  }

  // 'video' | 'audio' | 'sub' | 'playlist' | 'other'
  function kind(name) {
    var e = ext(name);
    if (e === 'm3u') return 'playlist';
    if (SUB.indexOf(e) >= 0) return 'sub';
    if (AUDIO.indexOf(e) >= 0) return 'audio';
    if (VIDEO.indexOf(e) >= 0) return 'video';
    return 'other';
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return '--:--';
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + pad2(m) : m) + ':' + pad2(s);
  }

  function fmtSize(b) {
    if (b == null || isNaN(b)) return '';
    var u = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return (i ? b.toFixed(1) : b) + ' ' + u[i];
  }

  function resolve(base, rel) {
    try { return new URL(rel, base).href; } catch (e) { return rel; }
  }

  function withCreds(url, user, pass) {
    if (!user) return url;
    return url.replace(/^(https?:\/\/)/, '$1' + encodeURIComponent(user) + ':' + encodeURIComponent(pass || '') + '@');
  }

  function naturalSort(a, b) {
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  return {
    ext: ext, basename: basename, stripExt: stripExt, kind: kind, fmtTime: fmtTime, fmtSize: fmtSize,
    resolve: resolve, withCreds: withCreds, naturalSort: naturalSort, uid: uid, safeDecode: safeDecode
  };
});
