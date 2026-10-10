// localStorage-backed store: sources, watch history, settings.
var Store = (function () {
  var PREFIX = 'lp.';

  function get(key, def) {
    try {
      var v = localStorage.getItem(PREFIX + key);
      return v == null ? def : JSON.parse(v);
    } catch (e) { return def; }
  }

  function set(key, val) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { /* quota / private mode */ }
  }

  var DEFAULTS = { hls: 'auto', proxy: '', autoSub: true };

  function settings() {
    var s = get('settings', {}), out = {};
    for (var k in DEFAULTS) out[k] = s[k] === undefined ? DEFAULTS[k] : s[k];
    return out;
  }

  function saveSettings(s) { set('settings', s); }

  function sources() { return get('sources', []); }

  function saveSource(src) {
    var list = sources(), i;
    if (!src.id) src.id = Util.uid();
    for (i = 0; i < list.length; i++) if (list[i].id === src.id) break;
    list[i] = src;
    set('sources', list);
    return src;
  }

  function removeSource(id) {
    set('sources', sources().filter(function (s) { return s.id !== id; }));
  }

  // history: { [url]: {url, name, pos, dur, live, t} }
  var MAX_HISTORY = 200;

  function history() { return get('history', {}); }

  function saveProgress(item, pos, dur) {
    if (!item || !item.url || item.live) return;
    var h = history();
    var done = dur > 0 && dur - pos < Math.min(20, dur * 0.05); // watched to (almost) the end
    h[item.url] = { url: item.url, name: item.name, pos: done ? 0 : pos, dur: dur, t: Date.now() };
    var keys = Object.keys(h);
    if (keys.length > MAX_HISTORY) {
      keys.sort(function (a, b) { return h[a].t - h[b].t; });
      keys.slice(0, keys.length - MAX_HISTORY).forEach(function (k) { delete h[k]; });
    }
    set('history', h);
  }

  function getPosition(url) {
    var e = history()[url];
    return e ? e.pos : 0;
  }

  // Unfinished items, most recent first.
  function recent(n) {
    var h = history();
    return Object.keys(h).map(function (k) { return h[k]; })
      .filter(function (e) { return e.pos > 10 && e.dur > 0; })
      .sort(function (a, b) { return b.t - a.t; }).slice(0, n);
  }

  function clearHistory() { set('history', {}); }

  return {
    settings: settings, saveSettings: saveSettings,
    sources: sources, saveSource: saveSource, removeSource: removeSource,
    saveProgress: saveProgress, getPosition: getPosition, recent: recent, clearHistory: clearHistory
  };
})();
