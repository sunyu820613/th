// App shell: key routing, home screen (sources / continue watching / settings), browse screen.
var App = (function () {
  var KEYMAP = {
    13: 'ok', 37: 'left', 38: 'up', 39: 'right', 40: 'down',
    461: 'back', 27: 'back', 8: 'back', 10009: 'back',
    415: 'play', 19: 'pause', 413: 'stop', 417: 'ff', 412: 'rw', 32: 'playpause', 179: 'playpause',
    33: 'chup', 34: 'chdown', 403: 'red', 404: 'green', 405: 'yellow', 406: 'blue', 457: 'info',
    // desktop testing shortcuts
    82: 'red', 71: 'green', 89: 'yellow', 66: 'blue', 73: 'info'
  };

  var $ = UI.$, el = UI.el;
  var screen = 'home';
  var stack = [];       // browse frames: {source, loc, title, entries, filter, focus}
  var frameCache = null;

  function show(name) {
    screen = name;
    ['home', 'browse', 'player'].forEach(function (n) { $(n).classList.toggle('active', n === name); });
    Nav.setBase($(name));
  }

  // ---------- keys ----------

  function onKeyDown(e) {
    var a = KEYMAP[e.keyCode];
    var t = e.target;
    var inInput = t && t.tagName === 'INPUT';

    if (inInput) {
      if (a === 'left' || a === 'right' || (e.keyCode === 8)) return;      // text editing
      if (a === 'ok') return;                                              // open/close the keyboard
      if (e.keyCode === 27 || a === 'back') { t.blur(); }
    }
    if (!a) return;

    var layer = UI.top();
    if (layer) {
      e.preventDefault();
      if (a === 'back') { layer.cancel(); return; }
      if (a === 'ok') { var c = Nav.current(); if (c) c.click(); return; }
      if (a === 'up' || a === 'down' || a === 'left' || a === 'right') Nav.move(a);
      return;
    }

    e.preventDefault();
    if (screen === 'player') {
      if (Player.onKey(a)) return;
    } else if (screen === 'browse') {
      if (browseKey(a)) return;
    } else if (screen === 'home') {
      if (homeKey(a)) return;
    }

    if (a === 'ok') { var f = Nav.current(); if (f) f.click(); }
    else if (a === 'up' || a === 'down' || a === 'left' || a === 'right') Nav.move(a);
    else if (a === 'back') goBack();
  }

  function goBack() {
    if (screen === 'browse') browseBack();
    else if (screen === 'home') {
      if (window.PalmSystem && PalmSystem.platformBack) PalmSystem.platformBack();
      else if (window.webOS && webOS.platformBack) webOS.platformBack();
    }
  }

  // ---------- home ----------

  function sourceIcon(type) {
    return { http: 'HTTP', webdav: 'DAV', dlna: 'DLNA', m3u: '直播' }[type] || '来源';
  }

  function renderHome() {
    var grid = $('src-grid'), recent = $('recent-row');
    grid.innerHTML = '';
    recent.innerHTML = '';

    Store.sources().forEach(function (s) {
      var c = el('button', 'focusable card');
      c.appendChild(el('div', 'ico', sourceIcon(s.type)));
      c.appendChild(el('div', 'ttl', s.name));
      c.appendChild(el('div', 'sub', Sources.label(s.type)));
      c.onclick = function () { openSource(s); };
      c.setAttribute('data-src', s.id);
      grid.appendChild(c);
    });
    [['添加', '添加来源', addSource], ['地址', '快速播放地址', quickPlay], ['设置', '设置', openSettings]].forEach(function (x) {
      var c = el('button', 'focusable card action');
      c.appendChild(el('div', 'ico', x[0]));
      c.appendChild(el('div', 'ttl', x[1]));
      c.onclick = x[2];
      grid.appendChild(c);
    });

    var rec = Store.recent(8);
    $('recent-sec').style.display = rec.length ? '' : 'none';
    rec.forEach(function (r) {
      var c = el('button', 'focusable card wide');
      c.appendChild(el('div', 'ttl', r.name));
      c.appendChild(el('div', 'sub', Util.fmtTime(r.pos) + ' / ' + Util.fmtTime(r.dur)));
      var bar = el('div', 'mini'); var fill = el('i'); fill.style.width = Math.min(100, r.pos / r.dur * 100) + '%';
      bar.appendChild(fill); c.appendChild(bar);
      c.onclick = function () { playItems([{ name: r.name, url: r.url, live: false }], 0); };
      recent.appendChild(c);
    });
  }

  function homeKey(a) {
    if (a === 'yellow' || a === 'red') {
      var c = Nav.current();
      var id = c && c.getAttribute('data-src');
      if (a === 'red') { addSource(); return true; }
      if (id) { editSource(id); return true; }
    }
    return false;
  }

  function sourceFields(s) {
    s = s || { type: 'http' };
    return [
      { key: 'type', label: '类型', type: 'choice', value: s.type, options: Sources.TYPES.map(function (t) { return { label: t.label, value: t.value }; }) },
      { key: 'name', label: '名称', value: s.name || '', placeholder: '例如:NAS 电影' },
      { key: 'url', label: '地址', value: s.url || '', placeholder: 'http://192.168.1.10:8080/' },
      { key: 'user', label: '账号(可选)', value: s.user || '' },
      { key: 'pass', label: '密码(可选)', type: 'password', value: s.pass || '' }
    ];
  }

  function normalizeUrl(u) {
    if (u && !/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = 'http://' + u;
    return u;
  }

  function saveForm(base, v) {
    if (!v || v.__action) return null;
    v.url = normalizeUrl(v.url);
    if (!v.url) { UI.toast('请填写地址'); return null; }
    var hint = Sources.TYPES.filter(function (t) { return t.value === v.type; })[0];
    if (!v.name) v.name = hint.label + ' ' + (v.url.replace(/^https?:\/\//, '').split('/')[0]);
    var s = { id: base && base.id, type: v.type, name: v.name, url: v.url, user: v.user, pass: v.pass };
    return Store.saveSource(s);
  }

  function addSource() {
    UI.form('添加来源', sourceFields(), '保存').then(function (v) {
      if (saveForm(null, v)) { renderHome(); UI.toast('已添加'); }
    });
  }

  function editSource(id) {
    var s = Store.sources().filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    UI.form('编辑来源', sourceFields(s), '保存', { label: '删除', action: 'delete' }).then(function (v) {
      if (v && v.__action === 'delete') {
        UI.confirm('删除「' + s.name + '」?', '删除').then(function (ok) {
          if (ok) { Store.removeSource(id); renderHome(); Nav.focusFirst($('home')); }
        });
      } else if (saveForm(s, v)) { renderHome(); }
    });
  }

  function quickPlay() {
    UI.form('快速播放', [
      { key: 'url', label: '视频/直播地址', placeholder: 'http://…/live.m3u8  或  .flv / .ts / .mp4' }
    ], '播放').then(function (v) {
      if (!v || !v.url) return;
      var url = normalizeUrl(v.url);
      var live = ['mp4', 'mkv', 'avi', 'mov'].indexOf(Util.ext(url)) < 0;
      playItems([{ name: Util.basename(url) || url, url: url, live: live }], 0);
    });
  }

  function openSettings() {
    var s = Store.settings();
    UI.form('设置', [
      { key: 'hls', label: 'HLS 解码方式', type: 'choice', value: s.hls, options: [
        { label: '自动(推荐)', value: 'auto' }, { label: '优先 hls.js', value: 'hls' }, { label: '优先系统原生', value: 'native' }] },
      { key: 'autoSub', label: '自动加载字幕', type: 'choice', value: s.autoSub, options: [
        { label: '开', value: true }, { label: '关', value: false }] },
      { key: 'proxy', label: 'CORS 网关地址', value: s.proxy, placeholder: '可选,如 http://192.168.1.10:8787' },
      { key: 'clear', label: '清除观看记录', type: 'choice', value: 'no', options: [
        { label: '否', value: 'no' }, { label: '是', value: 'yes' }] }
    ], '保存').then(function (v) {
      if (!v) return;
      Store.saveSettings({ hls: v.hls, autoSub: v.autoSub, proxy: v.proxy.replace(/\/+$/, '') });
      if (v.clear === 'yes') Store.clearHistory();
      renderHome();
      UI.toast('设置已保存');
    });
  }

  // ---------- browse ----------

  function openSource(source) {
    stack = [];
    show('browse');
    pushFrame(source, Sources[source.type].rootLoc(source), source.name);
  }

  function pushFrame(source, loc, title) {
    var frame = { source: source, loc: loc, title: title, entries: [], filter: '', focus: 0 };
    loadFrame(frame).then(function (ok) {
      if (ok) {
        if (stack.length) stack[stack.length - 1].focus = focusedIndex();
        stack.push(frame);
        renderFrame();
      } else if (!stack.length) {
        show('home'); // failed on the root: bounce back
        renderHome();
        Nav.focusFirst($('home'));
      }
    });
  }

  function loadFrame(frame) {
    $('b-status').textContent = '加载中…';
    $('b-status').style.display = '';
    return Sources[frame.source.type].list(frame.source, frame.loc).then(function (r) {
      frame.entries = r.entries;
      if (r.title) frame.title = r.title;
      return true;
    }).catch(function (err) {
      UI.toast('加载失败:' + err.message, 5000);
      $('b-status').style.display = 'none';
      return false;
    });
  }

  function focusedIndex() {
    var c = Nav.current();
    return c && c.hasAttribute('data-i') ? parseInt(c.getAttribute('data-i'), 10) : 0;
  }

  function visibleEntries(frame) {
    var f = frame.filter.toLowerCase();
    return frame.entries.filter(function (e) {
      return e.kind !== 'sub' && e.kind !== 'other' && (!f || e.name.toLowerCase().indexOf(f) >= 0);
    });
  }

  function entryIcon(e) {
    return { dir: '目录', video: '视频', audio: '音频', playlist: '列表' }[e.kind] || '文件';
  }

  function renderFrame() {
    var frame = stack[stack.length - 1];
    var list = $('b-list');
    list.innerHTML = '';
    $('b-path').textContent = stack.map(function (f) { return f.title; }).join('  ›  ');
    var entries = visibleEntries(frame);
    $('b-status').style.display = entries.length ? 'none' : '';
    $('b-status').textContent = frame.filter ? '没有匹配「' + frame.filter + '」的项目' : '这里是空的';
    $('b-filter').textContent = frame.filter ? '筛选:' + frame.filter : '';

    var frag = document.createDocumentFragment();
    entries.forEach(function (e, i) {
      var row = el('button', 'focusable row-item');
      row.setAttribute('data-i', i);
      row.appendChild(el('span', 'ico k-' + e.kind, entryIcon(e)));
      row.appendChild(el('span', 'name', e.name));
      var meta = e.live ? 'LIVE' : Util.fmtSize(e.size);
      if (meta) row.appendChild(el('span', 'meta' + (e.live ? ' live' : ''), meta));
      row.onclick = function () { onEntry(frame, entries, i); };
      frag.appendChild(row);
    });
    list.appendChild(frag);
    var items = list.children;
    Nav.focus(items[Math.min(frame.focus, items.length - 1)] || null);
    if (!items.length) { var f = Nav.items($('browse'))[0]; if (f) Nav.focus(f); }
  }

  function onEntry(frame, entries, i) {
    var e = entries[i];
    frame.focus = i;
    if (e.isDir) return pushFrame(frame.source, e.loc, e.name);
    if (e.kind === 'playlist') {
      return pushFrame({ type: 'm3u', name: e.name, url: e.url, user: frame.source.user, pass: frame.source.pass }, '', e.name);
    }
    // Build a playlist from every playable file in this view, starting at the chosen one.
    var playable = [], start = 0;
    entries.forEach(function (x, idx) {
      if (x.isDir || (x.kind !== 'video' && x.kind !== 'audio')) return;
      if (idx === i) start = playable.length;
      playable.push(toPlayItem(frame, x));
    });
    playItems(playable, start);
  }

  function toPlayItem(frame, x) {
    var subs = x.subs || [], base = Util.stripExt(x.name);
    if (!subs.length) {
      frame.entries.forEach(function (s) {
        if (s.kind === 'sub' && s.name.indexOf(base) === 0) subs.push({ name: s.name, url: s.url });
      });
    }
    var auth = frame.source.user ? { user: frame.source.user, pass: frame.source.pass } : null;
    return { name: x.name, url: x.url, live: !!x.live, subs: subs, auth: auth };
  }

  function browseKey(a) {
    if (a === 'blue' || a === 'yellow') {
      var frame = stack[stack.length - 1];
      if (!frame) return true;
      UI.form('筛选', [{ key: 'q', label: '名称包含', value: frame.filter }], '确定').then(function (v) {
        if (!v) return;
        frame.filter = v.q; frame.focus = 0; renderFrame();
      });
      return true;
    }
    if (a === 'red') {
      var f = stack[stack.length - 1];
      if (f) { f.focus = focusedIndex(); loadFrame(f).then(function (ok) { if (ok) renderFrame(); }); }
      return true;
    }
    return false;
  }

  function browseBack() {
    if (stack.length > 1) {
      stack.pop();
      renderFrame();
    } else {
      stack = [];
      show('home');
      renderHome();
      Nav.focusFirst($('home'));
    }
  }

  // ---------- playback ----------

  function playItems(items, index) {
    if (!items.length) return UI.toast('没有可播放的文件');
    var returnTo = screen;
    show('player');
    Player.open({
      items: items, index: index,
      onExit: function () {
        show(returnTo);
        if (returnTo === 'home') { renderHome(); Nav.focusFirst($('home')); }
        else renderFrame();
      }
    });
  }

  function start() {
    Player.init();
    document.addEventListener('keydown', onKeyDown, true);
    show('home');
    renderHome();
    Nav.focusFirst($('home'));
    // First run: guide the user straight to adding a source.
    if (!Store.sources().length) UI.toast('先添加一个来源:选择「＋ 添加来源」', 4000);
  }

  return { start: start };
})();

window.addEventListener('load', App.start);
