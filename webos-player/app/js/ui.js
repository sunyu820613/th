// Shared UI pieces: toast, modal layers (choice list, form, confirm).
var UI = (function () {
  var layers = []; // {el, cancel}
  var toastTimer;

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function toast(msg, ms) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2500);
  }

  function open(layerEl, cancel) {
    $('layers').appendChild(layerEl);
    layers.push({ el: layerEl, cancel: cancel, prevFocus: document.activeElement });
    Nav.pushScope(layerEl);
  }

  function close() {
    var l = layers.pop();
    if (!l) return;
    Nav.popScope();
    if (l.el.parentNode) l.el.parentNode.removeChild(l.el);
    if (l.prevFocus && document.body.contains(l.prevFocus)) Nav.focus(l.prevFocus);
  }

  function top() { return layers.length ? layers[layers.length - 1] : null; }

  function button(label, cls) {
    var b = el('button', 'focusable ' + (cls || ''), label);
    b.type = 'button';
    return b;
  }

  // options: [{label, value, sub}] -> Promise<value | undefined>
  function choose(title, options, selected, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var layer = el('div', 'layer' + (opts.side ? ' side' : ''));
      var box = el('div', 'box');
      box.appendChild(el('h2', null, title));
      var list = el('div', 'choices');
      list.setAttribute('data-list', '');
      var first = null, chosen = null;
      var done = function (v) { close(); resolve(v); };
      options.forEach(function (o) {
        var b = button(o.label, 'choice' + (o.value === selected ? ' selected' : ''));
        if (o.sub) b.appendChild(el('span', 'sub', o.sub));
        b.onclick = function () { done(o.value); };
        list.appendChild(b);
        if (!first) first = b;
        if (o.value === selected) chosen = b;
      });
      var focusEl = chosen || first;
      if (!options.length) list.appendChild(el('div', 'empty', opts.empty || '没有可选项'));
      box.appendChild(list);
      layer.appendChild(box);
      open(layer, function () { done(undefined); });
      if (focusEl) Nav.focus(focusEl);
    });
  }

  // fields: [{key,label,type:'text'|'password'|'choice',value,placeholder,options:[{label,value}]}]
  // -> Promise<values | null>
  function form(title, fields, okLabel, extra) {
    return new Promise(function (resolve) {
      var layer = el('div', 'layer');
      var box = el('div', 'box form');
      box.appendChild(el('h2', null, title));
      var getters = {};
      fields.forEach(function (f) {
        var row = el('label', 'row');
        row.appendChild(el('span', 'lbl', f.label));
        if (f.type === 'choice') {
          var idx = 0;
          f.options.forEach(function (o, i) { if (o.value === f.value) idx = i; });
          var b = button('', 'field');
          var paint = function () { b.textContent = '‹  ' + f.options[idx].label + '  ›'; };
          b.onclick = function () { idx = (idx + 1) % f.options.length; paint(); };
          b.onkeydown = function (e) {
            if (e.keyCode === 37) { idx = (idx + f.options.length - 1) % f.options.length; paint(); e.preventDefault(); e.stopPropagation(); }
            else if (e.keyCode === 39) { b.onclick(); e.preventDefault(); e.stopPropagation(); }
          };
          paint();
          getters[f.key] = function () { return f.options[idx].value; };
          row.appendChild(b);
        } else {
          var inp = el('input', 'focusable field');
          inp.type = f.type || 'text';
          inp.value = f.value || '';
          inp.placeholder = f.placeholder || '';
          inp.setAttribute('autocomplete', 'off');
          inp.setAttribute('autocapitalize', 'off');
          getters[f.key] = function () { return inp.value.trim(); };
          row.appendChild(inp);
        }
        box.appendChild(row);
      });
      var bar = el('div', 'btns');
      var ok = button(okLabel || '确定', 'primary');
      var cancel = button('取消');
      var finish = function (v) { close(); resolve(v); };
      var collect = function () {
        var out = {};
        for (var k in getters) out[k] = getters[k]();
        return out;
      };
      ok.onclick = function () { finish(collect()); };
      cancel.onclick = function () { finish(null); };
      bar.appendChild(ok);
      if (extra) {
        var xb = button(extra.label, 'danger');
        xb.onclick = function () { finish({ __action: extra.action }); };
        bar.appendChild(xb);
      }
      bar.appendChild(cancel);
      box.appendChild(bar);
      layer.appendChild(box);
      open(layer, function () { finish(null); });
      Nav.focusFirst(layer);
    });
  }

  function confirm(msg, okLabel) {
    return new Promise(function (resolve) {
      var layer = el('div', 'layer');
      var box = el('div', 'box');
      box.appendChild(el('h2', null, msg));
      var bar = el('div', 'btns');
      var ok = button(okLabel || '确定', 'danger');
      var no = button('取消');
      var finish = function (v) { close(); resolve(v); };
      ok.onclick = function () { finish(true); };
      no.onclick = function () { finish(false); };
      bar.appendChild(no);
      bar.appendChild(ok);
      box.appendChild(bar);
      layer.appendChild(box);
      open(layer, function () { finish(false); });
      Nav.focus(no);
    });
  }

  return { $: $, el: el, toast: toast, choose: choose, form: form, confirm: confirm, top: top, button: button };
})();
