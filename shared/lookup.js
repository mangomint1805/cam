/* Bấm vào từ vựng trong bài đọc để xem nghĩa – dùng chung cho mọi bộ đề.
   Không sửa HTML bài đọc (để không đụng phần tô sáng/ghi chú); gạch chân bằng CSS Custom Highlight nếu trình duyệt hỗ trợ. */
(function () {
  'use strict';
  // lời nhắc hướng dẫn cho người mới (hiện một lần trên mỗi máy)
  (function () {
    var seen = false; try { seen = !!localStorage.getItem('cam.guide.seen'); } catch (e) {}
    if (seen) return;
    var t = document.createElement('div');
    t.setAttribute('role', 'note');
    // góc dưới bên trái: không che tên đề, thanh audio hay nút nổi bên phải (điện thoại và máy tính như nhau)
    t.style.cssText = 'position:fixed;left:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:65;max-width:min(330px,calc(100vw - 88px));background:#1e232b;color:#fff;border-radius:12px;padding:10px 44px 10px 14px;font:13.5px/1.45 "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 8px 26px rgba(0,0,0,.25)';
    t.innerHTML = 'Lần đầu dùng trang này? <a href="../huong-dan.html" style="color:#f2c879;font-weight:700">Xem hướng dẫn 2 phút →</a><button type="button" aria-label="Đóng" style="position:absolute;top:2px;right:2px;width:40px;height:40px;border:0;background:none;color:#fff;font-size:16px;cursor:pointer">✕</button>';
    function done() { try { localStorage.setItem('cam.guide.seen', '1'); } catch (e) {} t.remove(); }
    t.querySelector('button').onclick = done; t.querySelector('a').onclick = function () { try { localStorage.setItem('cam.guide.seen', '1'); } catch (e) {} };
    var go = function () { document.body.appendChild(t); setTimeout(function () { if (t.isConnected) done(); }, 15000); };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  })();
  if (/[?&]thi=1/.test(location.search)) return;   // thi thử: không tra từ
  var m = document.title.match(/Test\s+(\d)/);
  var V = (window.C20VOCAB && m && window.C20VOCAB[m[1]]) || {};

  function clean(t) { return t.replace(/\([^)]*\)/g, '').replace(/\//g, ', ').replace(/\s+/g, ' ').trim(); }
  function slug(t) { return clean(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, ''); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function forms(w) {
    var f = [w];
    if (/e$/.test(w)) f.push(w + 's', w + 'd', w.slice(0, -1) + 'ing', w + 'r', w + 'st');
    else if (/[^aeiou]y$/.test(w)) f.push(w.slice(0, -1) + 'ies', w.slice(0, -1) + 'ied', w + 'ing', w.slice(0, -1) + 'ier');
    else if (/(s|x|z|ch|sh)$/.test(w)) f.push(w + 'es', w + 'ed', w + 'ing');
    else {
      f.push(w + 's', w + 'ed', w + 'ing', w + 'er', w + 'ly');
      if (/[^aeiou][aeiou][bdgmnprt]$/.test(w)) { var d = w + w.slice(-1); f.push(d + 'ed', d + 'ing'); }
    }
    return f;
  }
  function pattern(en) {
    var words = clean(en).split(/,\s*/)[0].toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    var reEsc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]"); };
    var first = '(?:' + forms(words[0]).map(reEsc).join('|') + ')';
    var rest = words.slice(1).map(function (x) { return x === 'sth' || x === 'sb' || x === 'something' || x === 'someone' ? "[\\w'’-]+" : reEsc(x); });
    var body = words.length === 1 ? '(?:' + forms(words[0]).map(reEsc).join('|') + ')' : first + rest.map(function (r) { return '\\s+' + r; }).join('');
    return new RegExp("(^|[^A-Za-z'’-])(" + body + ")(?![A-Za-z'’-])", 'gi');
  }

  var css = document.createElement('style');
  css.textContent =
    '::highlight(cam-vocab){text-decoration:underline dotted #a8691a 2px;text-underline-offset:3px;background-color:rgba(242,226,196,.45)}' +
    '.vpop{position:absolute;z-index:70;max-width:300px;background:#fff;border:1px solid #ddd7c9;border-top:3px solid #a8691a;border-radius:10px;box-shadow:0 10px 30px rgba(30,35,43,.2);padding:10px 12px;font:14px/1.45 "IBM Plex Sans",system-ui,sans-serif;color:#1e232b}' +
    '.vpop .w{font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:600;color:#6b4410}' +
    '.vpop .p{color:#666e7a;font-size:12.5px;margin-left:6px}' +
    '.vpop .facts{margin-top:7px;font-size:12.5px}.vpop .facts a{color:#6b4410}.vpop .sv{font:600 12.5px/1 "IBM Plex Sans",sans-serif;border:1.5px solid #ddd7c9;background:#fff;border-radius:999px;padding:4px 9px;cursor:pointer;color:#6b4410}' +
    '.vpop .i{color:#666e7a;font-size:13px}' +
    '.vpop .v{margin-top:4px}' +
    '.vpop button{font:inherit;font-size:13px;border:1px solid #ddd7c9;background:#faf8f4;border-radius:7px;padding:2px 9px;cursor:pointer;margin-left:6px;vertical-align:2px}' +
    '.vpop .x{position:absolute;top:4px;right:6px;border:0;background:none;font-size:15px;color:#666e7a;padding:2px 4px}' +
    '.vhint{font-size:12.5px;color:#6b4410}' +
    '::highlight(cam-pick){background-color:rgba(168,105,26,.28)}' +
    '.vpop .d{margin-top:4px;font-size:13.5px} .vpop .d b{color:#666e7a;font-weight:600;font-size:12px;text-transform:lowercase;margin-right:4px}' +
    '.vpop .src{margin-top:6px;font-size:11px;color:#9aa0a8}';
  document.head.appendChild(css);

  var HL = (window.CSS && CSS.highlights && window.Highlight) ? new Highlight() : null;
  if (HL) CSS.highlights.set('cam-vocab', HL);
  var hits = [];

  function scan() {
    hits = []; if (HL) HL.clear();
    var pss = document.querySelectorAll('.passage');
    for (var a = 0; a < pss.length; a++) {
      var ps = pss[a], i = +String(ps.id).replace('passage', ''), list = V['R' + i];
      var box = ps.querySelector('.ptext'); if (!list || !box) continue;
      var pats = list.map(function (e) { return { e: e, re: pattern(e.en) }; }).filter(function (x) { return x.re; });
      var tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, null), node;
      while ((node = tw.nextNode())) {
        if (node.parentElement && node.parentElement.closest('.evtag,.loc,button')) continue;
        var t = node.nodeValue; if (!t || t.length < 3) continue;
        pats.forEach(function (p) {
          p.re.lastIndex = 0; var mm;
          while ((mm = p.re.exec(t))) {
            var s = mm.index + mm[1].length, r = document.createRange();
            r.setStart(node, s); r.setEnd(node, s + mm[2].length);
            hits.push({ r: r, e: p.e }); if (HL) HL.add(r);
          }
        });
      }
    }
  }

  var W = null, wLoading = false, wQueue = [];
  function loadWords(cb) {
    if (W) return cb();
    wQueue.push(cb); if (wLoading) return; wLoading = true;
    var sc = document.createElement('script'); sc.src = '../shared/dict.js?v=1';
    sc.onload = function () { W = window.CAMWORDS || { e: {}, f: {} }; wQueue.splice(0).forEach(function (f) { f(); }); };
    sc.onerror = function () { W = { e: {}, f: {} }; wQueue.splice(0).forEach(function (f) { f(); }); };
    document.head.appendChild(sc);
  }
  function dictFind(w) {
    w = w.toLowerCase().replace(/[’‘]/g, "'").replace(/^['-]+|['-]+$/g, '');
    if (!w) return null;
    var tries = [w, w.replace(/'s$/, ''), w.replace(/s'$/, 's')];
    for (var i = 0; i < tries.length; i++) {
      var t = tries[i]; if (W.e[t]) return { w: t, e: W.e[t] };
      if (W.f[t] && W.e[W.f[t]]) return { w: W.f[t], e: W.e[W.f[t]] };
    }
    return null;
  }
  var PICK = (window.CSS && CSS.highlights && window.Highlight) ? new Highlight() : null;
  if (PICK) CSS.highlights.set('cam-pick', PICK);
  var pop = document.createElement('div'); pop.className = 'vpop'; pop.hidden = true; document.body.appendChild(pop);
  var au = new Audio();
  function voice() { try { var v = (JSON.parse(localStorage.getItem('summaryNew.fc.voice')) || {}).v || ''; return v.indexOf('f:') === 0 ? v.slice(2) : 'us-f'; } catch (e) { return 'us-f'; } }
  function say(en) {
    au.src = 'audio/vocab/' + voice() + '/' + slug(en) + '.mp3';
    au.play().catch(function () { try { var u = new SpeechSynthesisUtterance(clean(en)); u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) {} });
  }
  function show(h, x, y) {
    var e = h.e;
    pop.innerHTML = '<button type="button" class="x" aria-label="Đóng">✕</button><span class="w">' + esc(e.en) + '</span><span class="p">' + esc(e.pos || '') + '</span>' +
      '<div class="i">' + esc(e.ipa || '') + ' <button type="button" class="s">🔊 Nghe</button></div><div class="v">' + esc(e.vi || '') + '</div>';
    pop.hidden = false;
    pop.querySelector('.x').onclick = function () { pop.hidden = true; };
    pop.querySelector('.s').onclick = function () { say(e.en); };
    var rc = h.r.getBoundingClientRect();
    var left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, rc.left));
    var top = rc.bottom + 8 + window.scrollY;
    if (rc.bottom + pop.offsetHeight + 16 > window.innerHeight) top = rc.top - pop.offsetHeight - 8 + window.scrollY;
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  function sayNative(t) { try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'en-GB'; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {} }
  function fcGet() { try { return JSON.parse(localStorage.getItem('vocab.cards')) || {}; } catch (e) { return {}; } }
  function showDict(word, r) {
    var f = dictFind(word);
    var POS = { noun: 'n', verb: 'v', adjective: 'adj', adverb: 'adv', preposition: 'prep', conjunction: 'conj', pronoun: 'pron', phrase: 'phr' };
    var body = f ? f.e[1].map(function (d) { return '<div class="d"><b>' + esc(POS[d[0]] || d[0] || '') + '</b>' + esc(d[1].join('; ')) + '</div>'; }).join('')
                 : '<div class="d">Chưa có trong từ điển của web. Thử bấm vào từ gốc, hoặc hỏi thầy nhé.</div>';
    pop.innerHTML = '<button type="button" class="x" aria-label="Đóng">✕</button><span class="w">' + esc(f ? f.w : word) + '</span>' +
      '<div class="i">' + esc(f ? f.e[0] || '' : '') + ' <button type="button" class="s">🔊 Nghe</button></div>' + body + (f ? '<div class="facts"><button type="button" class="sv">' + (fcGet()[f.w] ? '★ Đã lưu' : '☆ Lưu flashcard') + '</button> <a href="../flashcards.html">Bộ flashcard →</a></div><div class="src">Từ điển Anh–Việt rút gọn</div>' : '');
    pop.hidden = false;
    pop.querySelector('.x').onclick = function () { pop.hidden = true; if (PICK) PICK.clear(); };
    pop.querySelector('.s').onclick = function () { sayNative(f ? f.w : word); };
    var sv = pop.querySelector('.sv');
    if (sv) sv.onclick = function () {
      var C = fcGet();
      if (C[f.w]) { delete C[f.w]; sv.textContent = '☆ Lưu flashcard'; }
      else {
        var blk = r.startContainer.parentElement && r.startContainer.parentElement.closest('p,li,td,div'), tx = (blk ? blk.textContent : '').replace(/\s+/g, ' ').trim();
        var ex = tx.split(/(?<=[.!?])\s+/).filter(function (x) { return x.toLowerCase().indexOf(word.toLowerCase()) >= 0; })[0] || '';
        C[f.w] = { w: f.w, ipa: f.e[0] || '', m: f.e[1].map(function (d) { return (POS[d[0]] ? POS[d[0]] + '. ' : '') + d[1].join('; '); }).join(' | '), ex: ex.slice(0, 220), src: document.title, at: Date.now(), lv: 0 };
        sv.textContent = '★ Đã lưu';
      }
      try { localStorage.setItem('vocab.cards', JSON.stringify(C)); } catch (e) {}
    };
    var rc = r.getBoundingClientRect();
    var left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, rc.left));
    var top = rc.bottom + 8 + window.scrollY;
    if (rc.bottom + pop.offsetHeight + 16 > window.innerHeight) top = rc.top - pop.offsetHeight - 8 + window.scrollY;
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  function wordAt(n, o) {
    if (!n || n.nodeType !== 3) return null;
    var t = n.nodeValue, a = o, b = o, re = /[A-Za-z'’-]/;
    while (a > 0 && re.test(t[a - 1])) a--;
    while (b < t.length && re.test(t[b])) b++;
    while (a < b && /['’-]/.test(t[a])) a++;
    while (b > a && /['’-]/.test(t[b - 1])) b--;
    if (b - a < 2) return null;
    var r = document.createRange(); r.setStart(n, a); r.setEnd(n, b);
    return { w: t.slice(a, b), r: r };
  }
  function caret(x, y) {
    if (document.caretPositionFromPoint) { var p = document.caretPositionFromPoint(x, y); return p && { n: p.offsetNode, o: p.offset }; }
    if (document.caretRangeFromPoint) { var r = document.caretRangeFromPoint(x, y); return r && { n: r.startContainer, o: r.startOffset }; }
    return null;
  }
  document.addEventListener('click', function (ev) {
    if (pop.contains(ev.target)) return;
    var zone = ev.target.closest && ev.target.closest('.ptext,.script-body,.pqs,.part');
    var bad = ev.target.closest && ev.target.closest('mark.hl,button,.loc,label,input,select,textarea,a,.fix,audio,summary,.opts');
    if (!zone || bad || String(window.getSelection() || '').trim()) { pop.hidden = true; if (PICK) PICK.clear(); return; }
    var c = caret(ev.clientX, ev.clientY); if (!c) { pop.hidden = true; return; }
    for (var k = 0; k < hits.length; k++) {
      var r = hits[k].r;
      try { if (r.startContainer === c.n && c.o >= r.startOffset && c.o <= r.endOffset) { if (PICK) PICK.clear(); show(hits[k]); return; } } catch (e) {}
    }
    var wd = wordAt(c.n, c.o);
    if (!wd) { pop.hidden = true; if (PICK) PICK.clear(); return; }
    if (PICK) { PICK.clear(); PICK.add(wd.r); }
    loadWords(function () { showDict(wd.w, wd.r); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.hidden = true; });
  window.addEventListener('resize', function () { pop.hidden = true; });

  function hint() {
    document.querySelectorAll('.passage .ptools').forEach(function (bar) {
      if (bar.querySelector('.vhint')) return;
      var s = document.createElement('span'); s.className = 'vhint'; s.textContent = '· Bấm vào một từ bất kỳ để tra nghĩa';
      var first = bar.querySelector('span'); if (first) first.insertAdjacentElement('afterend', s); else bar.appendChild(s);
    });
  }
  var tmr = null;
  function rescan() { clearTimeout(tmr); tmr = setTimeout(scan, 120); }
  function init() {
    scan(); hint();
    var mo = new MutationObserver(function (list) {
      for (var j = 0; j < list.length; j++) { var t = list[j].target; if (t.closest && t.closest('.ptext') || (t.nodeType === 3 && t.parentElement && t.parentElement.closest('.ptext'))) { rescan(); return; } }
    });
    document.querySelectorAll('.ptext').forEach(function (p) { mo.observe(p, { childList: true, subtree: true, characterData: true }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
