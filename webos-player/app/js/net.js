// XHR-based requests (works on old webOS Chromium without fetch/AbortController),
// plus optional CORS gateway rewriting (see tools/gateway.js).
var Net = (function () {
  // http://host:port/a/b  ->  <gateway>/http/host:port/a/b   (relative URLs keep working)
  function viaGateway(url) {
    var gw = (Store.settings().proxy || '').replace(/\/+$/, '');
    if (!gw) return url;
    var m = /^(https?):\/\/(.*)$/i.exec(url);
    if (!m || url.indexOf(gw + '/') === 0) return url;
    return gw + '/' + m[1].toLowerCase() + '/' + m[2];
  }

  function basic(user, pass) {
    return 'Basic ' + btoa(unescape(encodeURIComponent(user + ':' + (pass || ''))));
  }

  // opts: {method, headers, body, user, pass, binary, timeout, direct}
  // Resolves {status, text|buffer, headers(getter), url}
  function request(url, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var target = opts.direct ? url : viaGateway(url);
      xhr.open(opts.method || 'GET', target, true);
      xhr.timeout = opts.timeout || 15000;
      if (opts.binary) xhr.responseType = 'arraybuffer';
      var h = opts.headers || {};
      for (var k in h) xhr.setRequestHeader(k, h[k]);
      if (opts.user) xhr.setRequestHeader('Authorization', basic(opts.user, opts.pass));
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            status: xhr.status,
            text: opts.binary ? null : xhr.responseText,
            buffer: opts.binary ? xhr.response : null,
            header: function (n) { return xhr.getResponseHeader(n); },
            url: target
          });
        } else {
          reject(new Error('HTTP ' + xhr.status + (xhr.status === 401 ? '(需要账号密码)' : '')));
        }
      };
      xhr.onerror = function () {
        reject(new Error('网络请求失败(地址不通,或服务器未开启 CORS,可在设置里配置网关)'));
      };
      xhr.ontimeout = function () { reject(new Error('请求超时')); };
      xhr.send(opts.body || null);
    });
  }

  return { request: request, viaGateway: viaGateway };
})();
