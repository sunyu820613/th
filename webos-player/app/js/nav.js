// Remote-control (D-pad) spatial navigation. Elements opt in with class "focusable".
// A scope is the root element navigation is confined to (the active screen, or an open dialog layer).
var Nav = (function () {
  var scopes = [];

  function scope() { return scopes.length ? scopes[scopes.length - 1] : document.body; }
  function pushScope(el) { scopes.push(el); }
  function popScope() { scopes.pop(); }
  function setBase(el) { scopes[0] = el; if (scopes.length === 0) scopes.push(el); }

  function items(root) {
    var all = (root || scope()).querySelectorAll('.focusable'), out = [];
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.offsetParent !== null && !e.disabled) out.push(e);
    }
    return out;
  }

  function focus(el) {
    if (!el) return;
    el.focus();
    if (el.scrollIntoViewIfNeeded) el.scrollIntoViewIfNeeded(false); else el.scrollIntoView(false);
  }

  function current() {
    var a = document.activeElement;
    return a && a.classList && a.classList.contains('focusable') && scope().contains(a) ? a : null;
  }

  function focusFirst(root) {
    var l = items(root);
    if (l.length) focus(l[0]);
  }

  function rect(e) { return e.getBoundingClientRect(); }

  // Returns true if focus moved.
  function move(dir) {
    var cur = current(), list = items();
    if (!list.length) return false;
    if (!cur) { focus(list[0]); return true; }

    // Fast path for long vertical lists (thousands of channels).
    var listRoot = cur.parentElement;
    if (listRoot && listRoot.hasAttribute('data-list') && (dir === 'up' || dir === 'down')) {
      var sib = dir === 'up' ? cur.previousElementSibling : cur.nextElementSibling;
      while (sib && !sib.classList.contains('focusable')) sib = dir === 'up' ? sib.previousElementSibling : sib.nextElementSibling;
      if (sib) { focus(sib); return true; }
    }

    var r = rect(cur), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var best = null, bestScore = Infinity;
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c === cur) continue;
      var b = rect(c), bx = b.left + b.width / 2, by = b.top + b.height / 2;
      var dx = bx - cx, dy = by - cy, main, cross;
      if (dir === 'left') { if (b.right > r.left + 4 && dx >= 0) continue; main = -dx; cross = Math.abs(dy); }
      else if (dir === 'right') { if (b.left < r.right - 4 && dx <= 0) continue; main = dx; cross = Math.abs(dy); }
      else if (dir === 'up') { if (b.bottom > r.top + 4 && dy >= 0) continue; main = -dy; cross = Math.abs(dx); }
      else { if (b.top < r.bottom - 4 && dy <= 0) continue; main = dy; cross = Math.abs(dx); }
      if (main <= 0) continue;
      var score = main + cross * 3;
      if (score < bestScore) { bestScore = score; best = c; }
    }
    if (best) { focus(best); return true; }
    return false;
  }

  return { scope: scope, pushScope: pushScope, popScope: popScope, setBase: setBase, items: items,
    focus: focus, focusFirst: focusFirst, current: current, move: move };
})();
