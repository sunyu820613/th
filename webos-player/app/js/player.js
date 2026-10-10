// Playback screen: engine selection (native / hls.js / mpegts.js), resume, subtitles, audio tracks, live channel zapping.
var Player = (function () {
  var video, osd, toolbar;
  var state = {
    items: [], index: 0, engine: null, hls: null, mpegts: null, tried: [],
    hideTimer: null, saveAt: 0, seekCount: 0, seekTimer: null, subUrls: [], ratio: 0, resumeTo: 0, onExit: null, open: false
  };
  var RATIOS = [
    { label: '自适应', value: 'contain' },
    { label: '铺满裁切', value: 'cover' },
    { label: '拉伸', value: 'fill' }
  ];
  var SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  var IS_WEBOS = /web0s|webos/i.test(navigator.userAgent);

  function $(id) { return document.getElementById(id); }
  function cur() { return state.items[state.index]; }
  function isLive() { return !!(cur() && cur().live) || video.duration === Infinity; }

  function init() {
    video = $('video');
    osd = $('osd');
    toolbar = $('toolbar');

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('waiting', function () { $('spinner').classList.add('show'); });
    video.addEventListener('playing', function () { $('spinner').classList.remove('show'); hideError(); paintPlay(); });
    video.addEventListener('canplay', function () { $('spinner').classList.remove('show'); });
    video.addEventListener('pause', paintPlay);
    video.addEventListener('ended', function () { next(true); });
    video.addEventListener('error', function () { onNativeError(); });

    toolbar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (b) { act(b.getAttribute('data-act')); showOsd(true); }
    });
  }

  // ---------- opening / closing ----------

  // opts: {items:[{name,url,live,subs,auth}], index, onExit}
  function open(opts) {
    state.items = opts.items;
    state.index = opts.index || 0;
    state.onExit = opts.onExit;
    state.open = true;
    load(state.index);
  }

  function close() {
    if (!state.open) return;
    saveProgress(true);
    teardown();
    state.open = false;
    clearTimeout(state.hideTimer);
    $('spinner').classList.remove('show');
    hideError();
    if (state.onExit) state.onExit();
  }

  function teardown() {
    if (state.hls) { try { state.hls.destroy(); } catch (e) { /* ignore */ } state.hls = null; }
    if (state.mpegts) { try { state.mpegts.destroy(); } catch (e) { /* ignore */ } state.mpegts = null; }
    clearSubs();
    video.pause();
    video.removeAttribute('src');
    while (video.firstChild) video.removeChild(video.firstChild);
    try { video.load(); } catch (e) { /* ignore */ }
  }

  // ---------- engine selection ----------

  function engineOrder(item) {
    var e = Util.ext(item.url), s = Store.settings();
    var hlsOk = window.Hls && Hls.isSupported();
    var mpOk = window.mpegts && mpegts.isSupported();
    var nativeHls = !!video.canPlayType('application/vnd.apple.mpegurl');
    var order;
    if (e === 'm3u8') {
      var preferNative = s.hls === 'native' || (s.hls === 'auto' && IS_WEBOS && nativeHls);
      order = preferNative ? ['native', 'hls'] : ['hls', 'native'];
    } else if (e === 'flv') {
      order = ['flv'];
    } else if (e === 'ts') {
      // webOS: the system player decodes TS in hardware incl. 4K HEVC, which mpegts.js (MSE, H.264-centric) cannot.
      order = (item.live && !IS_WEBOS) ? ['mpegts', 'native'] : ['native', 'mpegts'];
    } else if (item.live) {
      order = ['native', 'hls', 'mpegts']; // unknown live URL: could be HLS or raw TS
    } else {
      order = ['native'];
    }
    return order.filter(function (x) {
      return x === 'native' || (x === 'hls' && hlsOk) || ((x === 'mpegts' || x === 'flv') && mpOk);
    }).concat(order.indexOf('native') < 0 ? ['native'] : []);
  }

  function load(i) {
    saveProgress(true);
    teardown();
    hideError();
    state.index = i;
    var item = cur();
    state.tried = [];
    state.resumeTo = item.live ? 0 : Store.getPosition(item.url);
    $('osd-title').textContent = item.name;
    $('osd-sub').textContent = state.items.length > 1 ? (i + 1) + ' / ' + state.items.length : '';
    $('spinner').classList.add('show');
    paintMode();
    video.style.objectFit = RATIOS[state.ratio].value;
    startNext();
    showOsd(false);
  }

  function startNext() {
    var item = cur();
    var order = engineOrder(item).filter(function (x) { return state.tried.indexOf(x) < 0; });
    if (!order.length) return fail('无法播放此流(格式不受支持或地址不可达)');
    var eng = order[0];
    state.tried.push(eng);
    state.engine = eng;
    var auth = item.auth && item.auth.user ? item.auth : null;
    var src = item.url;
    var viaGw = function (u) { return Net.viaGateway(u); };
    var authHeader = auth ? Net.basicAuth(auth.user, auth.pass) : null;

    try {
      if (eng === 'native') {
        // <video> cannot send headers, so credentials have to ride in the URL (see README limitations).
        video.src = auth ? Util.withCreds(src, auth.user, auth.pass) : src;
        video.play();
      } else if (eng === 'hls') {
        // Cap buffered bytes, not just seconds: a 4K stream at 50+ Mbps would otherwise exhaust a TV's heap.
        state.hls = new Hls({
          xhrSetup: authHeader ? function (xhr) { xhr.setRequestHeader('Authorization', authHeader); } : undefined,
          enableWorker: true, lowLatencyMode: false, maxBufferLength: 30, maxBufferSize: 40 * 1000 * 1000 });
        state.hls.on(Hls.Events.ERROR, function (ev, data) {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && state.hlsRetry < 2) { state.hlsRetry++; state.hls.startLoad(); return; }
            switchEngine('hls: ' + data.details);
          }
        });
        state.hlsRetry = 0;
        state.hls.loadSource(viaGw(src));
        state.hls.attachMedia(video);
        video.play();
      } else {
        var type = (eng === 'flv' || Util.ext(item.url) === 'flv') ? 'flv' : 'mpegts';
        state.mpegts = mpegts.createPlayer(
          { type: type, isLive: !!item.live, url: viaGw(src) },
          { headers: authHeader ? { Authorization: authHeader } : undefined, enableWorker: false, lazyLoadMaxDuration: 60, liveBufferLatencyChasing: !!item.live, liveBufferLatencyMaxLatency: 5 }
        );
        state.mpegts.on(mpegts.Events.ERROR, function (t, d) { switchEngine('mpegts: ' + t + ' ' + d); });
        state.mpegts.attachMediaElement(video);
        state.mpegts.load();
        var p = state.mpegts.play();
        if (p && p.catch) p.catch(function () { /* autoplay rejection; user can press OK */ });
      }
    } catch (e) {
      switchEngine(String(e));
    }
  }

  // Current engine failed: tear down just the engine and try the next candidate.
  function switchEngine(reason) {
    if (!state.open) return;
    if (window.console) console.warn('[player] engine failed:', state.engine, reason);
    if (state.hls) { try { state.hls.destroy(); } catch (e) { /* ignore */ } state.hls = null; }
    if (state.mpegts) { try { state.mpegts.destroy(); } catch (e) { /* ignore */ } state.mpegts = null; }
    video.removeAttribute('src');
    try { video.load(); } catch (e) { /* ignore */ }
    startNext();
  }

  function onNativeError() {
    if (!state.open || state.engine !== 'native' || !video.getAttribute('src')) return;
    var code = video.error ? video.error.code : 0;
    switchEngine('native error ' + code);
  }

  function fail(msg) {
    $('spinner').classList.remove('show');
    $('perr').textContent = msg;
    $('perr').classList.add('show');
    showOsd(true);
  }

  function hideError() { $('perr').classList.remove('show'); }

  // ---------- events ----------

  function onMeta() {
    if (state.resumeTo > 10 && isFinite(video.duration) && video.duration - state.resumeTo > Math.min(30, video.duration * 0.05)) {
      try { video.currentTime = state.resumeTo; UI.toast('已从 ' + Util.fmtTime(state.resumeTo) + ' 继续播放'); } catch (e) { /* ignore */ }
    }
    state.resumeTo = 0;
    paintMode();
    loadSubtitles();
  }

  function onTime() {
    if (isFinite(video.duration) && video.duration > 0) {
      var pct = video.currentTime / video.duration * 100;
      $('bar-fill').style.width = pct + '%';
      $('osd-time').textContent = Util.fmtTime(video.currentTime) + ' / ' + Util.fmtTime(video.duration);
    } else {
      $('osd-time').textContent = '';
    }
    if (cur() && cur().live) $('osd-time').textContent = '';
    var now = Date.now();
    if (now - state.saveAt > 5000) { state.saveAt = now; saveProgress(false); }
  }

  function saveProgress() {
    var item = cur();
    if (!item || item.live || !isFinite(video.duration) || !video.duration) return;
    Store.saveProgress(item, video.currentTime, video.duration);
  }

  function paintMode() {
    var live = isLive();
    osd.classList.toggle('live', live);
    $('osd-live').style.display = live ? '' : 'none';
    var btns = toolbar.querySelectorAll('[data-act]');
    for (var i = 0; i < btns.length; i++) {
      var a = btns[i].getAttribute('data-act');
      var hide = (live && (a === 'rew' || a === 'fwd' || a === 'speed')) || (!live && a === 'list' && state.items.length < 2);
      btns[i].style.display = hide ? 'none' : '';
    }
    paintPlay();
  }

  function paintPlay() {
    var b = toolbar.querySelector('[data-act="play"]');
    if (b) b.textContent = video.paused ? '播放' : '暂停';
  }

  // ---------- OSD ----------

  function showOsd(full) {
    osd.classList.add('show');
    osd.classList.toggle('compact', !full);
    if (full && !toolbar.contains(document.activeElement)) {
      var vis = Nav.items(osd);
      var play = toolbar.querySelector('[data-act="play"]');
      Nav.focus(play && play.offsetParent ? play : vis[0]);
    }
    clearTimeout(state.hideTimer);
    state.hideTimer = setTimeout(hideOsd, 5000);
  }

  function hideOsd() {
    if (UI.top()) { state.hideTimer = setTimeout(hideOsd, 2000); return; } // dialog open: look again later
    osd.classList.remove('show');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function osdVisible() { return osd.classList.contains('show') && !osd.classList.contains('compact'); }

  // ---------- actions ----------

  function seekBy(dir) {
    if (isLive() || !isFinite(video.duration)) return;
    state.seekCount++;
    clearTimeout(state.seekTimer);
    state.seekTimer = setTimeout(function () { state.seekCount = 0; }, 700);
    var steps = [10, 10, 10, 30, 30, 30, 60, 60, 120];
    var step = steps[Math.min(state.seekCount - 1, steps.length - 1)];
    video.currentTime = Math.max(0, Math.min(video.duration - 1, video.currentTime + dir * step));
    onTime();
    showOsd(false);
  }

  function togglePlay() {
    if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () { /* ignore */ }); } else video.pause();
  }

  function next(auto) {
    if (state.index < state.items.length - 1) load(state.index + 1);
    else if (auto) close();
    else UI.toast('已经是最后一个');
  }

  function prev() {
    if (state.index > 0) load(state.index - 1);
    else UI.toast('已经是第一个');
  }

  function act(a) {
    switch (a) {
      case 'play': togglePlay(); break;
      case 'rew': seekBy(-1); break;
      case 'fwd': seekBy(1); break;
      case 'prev': prev(); break;
      case 'next': next(false); break;
      case 'sub': pickSubtitle(); break;
      case 'audio': pickAudio(); break;
      case 'speed': pickSpeed(); break;
      case 'ratio': pickRatio(); break;
      case 'list': pickItem(); break;
    }
  }

  function pickItem() {
    osd.classList.remove('show'); // keep the drawer clean
    var opts = state.items.map(function (it, i) { return { label: (i + 1) + '. ' + it.name, value: i }; });
    UI.choose(isLive() ? '频道列表' : '播放列表', opts, state.index, { side: true }).then(function (v) {
      if (v !== undefined && v !== state.index) load(v);
    });
  }

  function pickSpeed() {
    UI.choose('播放速度', SPEEDS.map(function (s) { return { label: s + 'x', value: s }; }), video.playbackRate)
      .then(function (v) { if (v !== undefined) video.playbackRate = v; });
  }

  function pickRatio() {
    UI.choose('画面比例', RATIOS.map(function (r, i) { return { label: r.label, value: i }; }), state.ratio)
      .then(function (v) {
        if (v === undefined) return;
        state.ratio = v;
        video.style.objectFit = RATIOS[v].value;
      });
  }

  // ---------- subtitles ----------

  function clearSubs() {
    state.subUrls.forEach(function (u) { URL.revokeObjectURL(u); });
    state.subUrls = [];
  }

  function subScore(name) {
    return /(chs|zh|chi|cn|简|中|chinese)/i.test(name) ? 0 : 1;
  }

  function loadSubtitles() {
    var item = cur();
    var subs = (item && item.subs) || [];
    if (!subs.length) return;
    var sorted = subs.slice().sort(function (a, b) { return subScore(a.name) - subScore(b.name); });
    var auto = Store.settings().autoSub;
    sorted.forEach(function (s, idx) {
      Net.request(s.url, { binary: true, user: item.auth && item.auth.user, pass: item.auth && item.auth.pass, timeout: 20000 })
        .then(function (res) {
          if (cur() !== item) return;
          var vtt = Subtitle.toVtt(Subtitle.decode(res.buffer), s.name);
          var url = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
          state.subUrls.push(url);
          var t = document.createElement('track');
          t.kind = 'subtitles';
          t.label = Util.stripExt(s.name).replace(Util.stripExt(item.name), '').replace(/^[.\-_ ]+/, '') || s.name;
          t.src = url;
          video.appendChild(t);
          t.track.mode = auto && idx === 0 ? 'showing' : 'disabled';
        })
        .catch(function () { /* subtitle is optional */ });
    });
  }

  function pickSubtitle() {
    var tracks = video.textTracks, opts = [{ label: '关闭字幕', value: -1 }], sel = -1;
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      if (t.kind !== 'subtitles' && t.kind !== 'captions') continue;
      opts.push({ label: t.label || t.language || ('字幕 ' + (i + 1)), value: i });
      if (t.mode === 'showing') sel = i;
    }
    if (opts.length === 1) return UI.toast('没有可用字幕(同目录同名 srt/ass/vtt 会自动加载)');
    UI.choose('字幕', opts, sel).then(function (v) {
      if (v === undefined) return;
      for (var j = 0; j < tracks.length; j++) tracks[j].mode = (j === v) ? 'showing' : 'disabled';
    });
  }

  // ---------- audio ----------

  function pickAudio() {
    var opts = [], sel;
    if (state.hls && state.hls.audioTracks && state.hls.audioTracks.length > 1) {
      state.hls.audioTracks.forEach(function (t, i) { opts.push({ label: t.name || t.lang || ('音轨 ' + (i + 1)), value: i }); });
      sel = state.hls.audioTrack;
      return UI.choose('音轨', opts, sel).then(function (v) { if (v !== undefined) state.hls.audioTrack = v; });
    }
    var at = video.audioTracks;
    if (at && at.length > 1) {
      for (var i = 0; i < at.length; i++) {
        opts.push({ label: (at[i].label || at[i].language || ('音轨 ' + (i + 1))), value: i });
        if (at[i].enabled) sel = i;
      }
      return UI.choose('音轨', opts, sel).then(function (v) {
        if (v === undefined) return;
        for (var j = 0; j < at.length; j++) at[j].enabled = (j === v);
      });
    }
    UI.toast('没有可切换的音轨');
  }

  // ---------- keys ----------

  // Returns true when the key was consumed. Dialog layers are handled by the app before this is called.
  function onKey(a) {
    if (!state.open) return false;
    var full = osdVisible(), live = isLive();
    switch (a) {
      case 'back': case 'stop':
        if (full && a === 'back') { hideOsd(); return true; }
        close(); return true;
      case 'play': case 'pause': case 'playpause':
        if (a === 'play') { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
        else if (a === 'pause') video.pause();
        else togglePlay();
        showOsd(false); return true;
      case 'ff': seekBy(1); return true;
      case 'rw': seekBy(-1); return true;
      case 'chup': prev(); return true;
      case 'chdown': next(false); return true;
      case 'info': showOsd(true); return true;
      case 'red': pickSubtitle(); return true;
      case 'green': pickAudio(); return true;
      case 'yellow': if (!live) pickSpeed(); return true;
      case 'blue': pickRatio(); return true;
    }
    if (full) {
      if (a === 'ok') return false; // let focused toolbar button receive the click
      if (a === 'left' || a === 'right' || a === 'up' || a === 'down') {
        showOsd(true); // refresh timer
        if (!Nav.move(a) && a === 'down') hideOsd();
        return true;
      }
      return false;
    }
    // OSD hidden or compact
    switch (a) {
      case 'left': seekBy(-1); return true;
      case 'right': seekBy(1); return true;
      case 'up':
        if (live && state.items.length > 1) prev(); else showOsd(true);
        return true;
      case 'down':
        if (live && state.items.length > 1) next(false); else showOsd(true);
        return true;
      case 'ok':
        if (live) { state.items.length > 1 ? pickItem() : showOsd(true); }
        else { togglePlay(); showOsd(false); }
        return true;
    }
    return false;
  }

  return { init: init, open: open, close: close, onKey: onKey, isOpen: function () { return state.open; } };
})();
