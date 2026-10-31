/* Flashcard từ vựng cho từng passage – mở bằng C20FC.open(cards, title, storeKey) */
(function () {
  'use strict';

  var cards = [];

  // ---------- 2. Lưu tiến độ (theo từng bài, chỉ trên máy này) ----------
  var KEY = '';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(known)); } catch (e) {} }
  var known = {}; // { "word": 1 }

  // ---------- 3. CSS ----------
  var css = '' +
    '.fc-open{display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:700;font-size:15px;color:#fff;background:var(--amber,#a8691a);border:0;border-radius:10px;padding:11px 16px;cursor:pointer;margin:4px 0 8px;}' +
    '.fc-open:hover{filter:brightness(1.08);}' +
    '.fc-open small{font-weight:500;opacity:.85;}' +
    '.fc-jump{display:inline-flex;align-items:center;gap:6px;margin:16px 0 0;font:inherit;font-size:14.5px;font-weight:600;color:var(--amber-ink,#6b4410);background:var(--amber-soft,#f2e2c4);border:1.5px solid var(--amber,#a8691a);border-radius:999px;padding:7px 14px;cursor:pointer;}' +
    '.fc-bg{position:fixed;inset:0;z-index:50;background:rgba(30,35,43,.55);display:none;align-items:center;justify-content:center;padding:16px;}' +
    '.fc-bg.on{display:flex;}' +
    '.fc-box{width:100%;max-width:520px;background:var(--paper,#faf8f4);border-radius:16px;padding:18px 18px 16px;box-shadow:0 20px 50px rgba(0,0,0,.25);max-height:100%;overflow-y:auto;overflow-x:hidden;}' +
    '.fc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;}' +
    '.fc-head b{font-family:Lora,"Times New Roman",serif;font-size:19px;font-weight:600;}' +
    '.fc-x{font:inherit;font-size:22px;line-height:1;background:none;border:0;color:var(--dim,#666e7a);cursor:pointer;padding:4px 8px;border-radius:8px;}' +
    '.fc-bar{height:6px;background:var(--line,#ddd7c9);border-radius:99px;margin:12px 0 4px;overflow:hidden;}' +
    '.fc-bar i{display:block;height:100%;width:0;background:var(--teal,#1f8f6c);transition:width .3s;}' +
    '.fc-stat{display:flex;justify-content:space-between;font-size:13px;color:var(--dim,#666e7a);}' +
    '.fc-tools{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 10px;}' +
    '.fc-tools button{font:inherit;font-size:13.5px;font-weight:600;background:var(--card,#fff);color:var(--amber-ink,#6b4410);border:1.5px solid var(--line,#ddd7c9);border-radius:8px;padding:6px 10px;cursor:pointer;}' +
    '.fc-tools button[aria-pressed=true]{border-color:var(--amber,#a8691a);background:var(--amber-soft,#f2e2c4);}' +
    '.fc-scene{perspective:1200px;}' +
    '.fc-card{position:relative;height:250px;cursor:pointer;transform-style:preserve-3d;transition:transform .45s;border-radius:14px;outline:none;}' +
    '.fc-card.flip{transform:rotateY(180deg);}' +
    '.fc-card:focus-visible{box-shadow:0 0 0 3px var(--amber,#a8691a);}' +
    '.fc-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:14px;border:1.5px solid var(--line,#ddd7c9);background:var(--card,#fff);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;}' +
    '.fc-back{transform:rotateY(180deg);background:var(--amber-soft,#f2e2c4);border-color:var(--amber,#a8691a);}' +
    '.fc-word{font-size:clamp(24px,7vw,34px);font-weight:700;line-height:1.25;color:var(--ink,#1e232b);word-break:break-word;}' +
    '.fc-back .fc-word{color:var(--amber-ink,#6b4410);font-size:clamp(21px,6vw,28px);}' +
    '.fc-pos{margin-top:8px;font-size:13px;font-weight:600;color:var(--dim,#666e7a);background:var(--paper,#faf8f4);border:1px solid var(--line,#ddd7c9);border-radius:99px;padding:2px 10px;}' +
    '.fc-ipa{margin-top:6px;font-size:16px;color:var(--dim,#666e7a);font-family:"Segoe UI","Noto Sans","Lucida Sans Unicode",system-ui,sans-serif;}' +
    '.fc-hint{position:absolute;bottom:10px;font-size:12px;color:var(--dim,#666e7a);}' +
    '.fc-say{position:absolute;top:10px;right:10px;font-size:20px;background:none;border:0;cursor:pointer;padding:6px;border-radius:8px;}' +
    '.fc-tag{position:absolute;top:12px;left:12px;font-size:12px;font-weight:700;color:var(--teal,#1f8f6c);}' +
    '.fc-nav{display:grid;grid-template-columns:52px 1fr 1fr 52px;gap:8px;margin-top:12px;}' +
    '.fc-nav button{font:inherit;font-weight:700;font-size:15px;border-radius:10px;padding:12px 6px;cursor:pointer;border:1.5px solid var(--line,#ddd7c9);background:var(--card,#fff);color:var(--ink,#1e232b);min-height:48px;}' +
    '.fc-nav .no{border-color:#d9a3a3;color:#9b2c2c;background:#fdf1f1;}' +
    '.fc-nav .yes{border-color:var(--teal,#1f8f6c);color:#fff;background:var(--teal,#1f8f6c);}' +
    '.fc-keys{margin:10px 0 0;font-size:12px;color:var(--dim,#666e7a);text-align:center;}' +
    '.fc-done{text-align:center;padding:26px 8px 8px;}' +
    '.fc-done .big{font-size:44px;}' +
    '.fc-done p{margin:6px 0;}' +
    '.fc-done button{font:inherit;font-weight:700;margin:6px 4px 0;border-radius:10px;padding:10px 14px;cursor:pointer;border:1.5px solid var(--amber,#a8691a);background:var(--card,#fff);color:var(--amber-ink,#6b4410);}' +
    '.fc-done button.main{background:var(--amber,#a8691a);color:#fff;}' +
    '.fc-voice{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:-2px 0 12px;padding:9px 11px;background:var(--card,#fff);border:1px dashed var(--line,#ddd7c9);border-radius:10px;font-size:13.5px;color:var(--dim,#666e7a);}' +
    '.fc-voice label{display:flex;align-items:center;gap:6px;}' +
    '.fc-voice select{font:inherit;font-size:13.5px;color:var(--ink,#1e232b);background:var(--paper,#faf8f4);border:1px solid var(--line,#ddd7c9);border-radius:7px;padding:4px 6px;max-width:190px;}' +
    '.fc-voice input{width:16px;height:16px;accent-color:var(--amber,#a8691a);}' +
    '.fc-card{transition:transform .55s cubic-bezier(.34,1.45,.5,1);}' +
    '.fc-bg.on{animation:fcFade .2s ease-out;}' +
    '.fc-bg.on .fc-box{animation:fcPop .32s cubic-bezier(.34,1.56,.64,1);}' +
    '.fc-scene{position:relative;}' +
    '.fc-scene.in-r{animation:fcInR .38s cubic-bezier(.22,1,.36,1);}' +
    '.fc-scene.in-l{animation:fcInL .38s cubic-bezier(.22,1,.36,1);}' +
    '.fc-scene.out-ok{animation:fcOutOk .42s ease-in forwards;}' +
    '.fc-scene.out-no{animation:fcShake .3s ease-in-out, fcOutNo .3s ease-in .3s forwards;}' +
    '.fc-scene.out-ok .fc-face{border-color:var(--teal,#1f8f6c);box-shadow:0 0 0 4px rgba(31,143,108,.25);}' +
    '.fc-scene.out-no .fc-face{border-color:#d9a3a3;box-shadow:0 0 0 4px rgba(155,44,44,.15);}' +
    '.fc-stamp{position:absolute;left:50%;top:50%;z-index:3;font-size:62px;line-height:1;pointer-events:none;transform:translate(-50%,-50%) scale(0);animation:fcStamp .42s cubic-bezier(.34,1.56,.64,1) forwards;}' +
    '.fc-say.talk{animation:fcTalk .6s ease-in-out infinite;}' +
    '.fc-done .big{display:inline-block;animation:fcBounce 1s cubic-bezier(.34,1.56,.64,1);}' +
    '.fc-done{animation:fcInR .4s cubic-bezier(.22,1,.36,1);}' +
    '.fc-confetti{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:60;}' +
    '.fc-confetti i{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;animation:fcFall linear forwards;}' +
    '.fc-nav button{transition:transform .12s;}' +
    '.fc-nav button:active{transform:scale(.94);}' +
    '@keyframes fcFade{from{opacity:0}}' +
    '@keyframes fcPop{from{transform:scale(.85) translateY(20px);opacity:0}}' +
    '@keyframes fcInR{from{transform:translateX(70px) rotate(4deg);opacity:0}}' +
    '@keyframes fcInL{from{transform:translateX(-70px) rotate(-4deg);opacity:0}}' +
    '@keyframes fcOutOk{to{transform:translateX(130px) rotate(10deg);opacity:0}}' +
    '@keyframes fcOutNo{to{transform:translateX(-130px) rotate(-10deg);opacity:0}}' +
    '@keyframes fcShake{20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}' +
    '@keyframes fcStamp{to{transform:translate(-50%,-50%) scale(1)}}' +
    '@keyframes fcTalk{50%{transform:scale(1.25)}}' +
    '@keyframes fcBounce{0%{transform:scale(0) rotate(-30deg)}60%{transform:scale(1.3) rotate(10deg)}100%{transform:scale(1)}}' +
    '@keyframes fcFall{to{transform:translateY(110vh) rotate(720deg);}}' +
    '@media (max-width:480px){.fc-card{height:220px}.fc-keys{display:none}}' +
    '@media (prefers-reduced-motion:reduce){.fc-card,.fc-scene,.fc-bg,.fc-box,.fc-stamp,.fc-done,.fc-done .big{transition:none!important;animation:none!important}.fc-stamp{transform:translate(-50%,-50%)}.fc-confetti{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- 5. Hộp flashcard ----------
  var bg = document.createElement('div');
  bg.className = 'fc-bg';
  bg.innerHTML =
    '<div class="fc-box" role="dialog" aria-modal="true" aria-label="Flashcard từ vựng">' +
    '<div class="fc-head"><b class="fc-title">Flashcard từ vựng</b><button class="fc-x" type="button" aria-label="Đóng">✕</button></div>' +
    '<div class="fc-bar"><i></i></div>' +
    '<div class="fc-stat"><span class="fc-pos-n"></span><span class="fc-known-n"></span></div>' +
    '<div class="fc-tools">' +
    '<button type="button" data-t="dir" aria-pressed="false">Mặt trước: English</button>' +
    '<button type="button" data-t="mix" aria-pressed="false">🔀 Trộn thẻ</button>' +
    '<button type="button" data-t="only" aria-pressed="false">Chỉ từ chưa thuộc</button>' +
    '<button type="button" data-t="reset">↺ Làm lại từ đầu</button>' +
    '</div>' +
    '<div class="fc-voice">' +
    '<label>🔊 Giọng đọc <select class="fc-vsel" aria-label="Giọng đọc"></select></label>' +
    '<label>Tốc độ <select class="fc-rate" aria-label="Tốc độ đọc"><option value="0.7">Chậm</option><option value="0.9">Vừa</option><option value="1.1">Nhanh</option></select></label>' +
    '<label><input type="checkbox" class="fc-auto"> Tự đọc từ</label>' +
    '</div>' +
    '<div class="fc-main"></div>' +
    '</div>';
  document.body.appendChild(bg);
  var main = bg.querySelector('.fc-main');
  var tDir = bg.querySelector('[data-t=dir]'), tMix = bg.querySelector('[data-t=mix]'), tOnly = bg.querySelector('[data-t=only]');

  var viFirst = false, mixed = false, onlyNew = false;
  var deck = [], i = 0, flipped = false, lastFocus = null, enter = 'in-r', busy = false;

  function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function build() {
    deck = cards.filter(function (c) { return !onlyNew || !known[c.en]; });
    if (mixed) shuffle(deck);
    i = 0; flipped = false; if (enter !== '') enter = 'in-r'; render();
  }
  function countKnown() { return cards.filter(function (c) { return known[c.en]; }).length; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Phát âm: mặc định phát file mp3 có sẵn trong thư mục audio/ (tạo bằng tools/make_audio.py),
  // chạy được trên mọi điện thoại và cả trong Zalo/Messenger. Có thể chọn giọng của máy nếu muốn.
  // Nếu thiếu file thì dùng giọng của máy, cuối cùng là giọng Google online.
  var native = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  var canSpeak = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VKEY = 'summaryNew.fc.voice';
  var vs = (function () { try { return JSON.parse(localStorage.getItem(VKEY)) || {}; } catch (e) { return {}; } })();
  if (!vs.r) vs.r = '0.9';
  if (!vs.v || vs.v.indexOf('g:') === 0) vs.v = 'f:us-f';
  function saveVs() { try { localStorage.setItem(VKEY, JSON.stringify(vs)); } catch (e) {} }
  var vsel = bg.querySelector('.fc-vsel'), rsel = bg.querySelector('.fc-rate'), auto = bg.querySelector('.fc-auto');
  var ACC = { US: 'Mỹ', GB: 'Anh', AU: 'Úc', IN: 'Ấn Độ', CA: 'Canada', IE: 'Ireland', NZ: 'New Zealand', ZA: 'Nam Phi', SG: 'Singapore', PH: 'Philippines' };
  var AUDIO_BASE = (function () {
    var sc = document.querySelector('script[src*="fc.js"]');
    return sc ? sc.getAttribute('src').replace(/fc\.js.*$/, '') + 'audio/vocab/' : 'audio/vocab/';
  })();
  function clean(t) { return t.replace(/\([^)]*\)/g, '').replace(/\//g, ', ').replace(/\s+/g, ' ').trim(); }
  function slug(t) { return clean(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, ''); }
  function voices() { if (!native) return []; try { return speechSynthesis.getVoices().filter(function (v) { return /^en[-_]?/i.test(v.lang); }); } catch (e) { return []; } }
  function fillVoices() {
    var list = voices();
    var html = '<option value="f:us-f">Mỹ · nữ</option><option value="f:us-m">Mỹ · nam</option><option value="f:uk-f">Anh · nữ</option>';
    list.sort(function (a, b) { return a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name); });
    if (list.length) html += '<optgroup label="Giọng có trên máy">';
    list.forEach(function (v) {
      var cc = (v.lang.split(/[-_]/)[1] || '').toUpperCase();
      var name = v.name.replace(/^(Microsoft|Google)\s+/, '').replace(/\s*(Online \(Natural\)|\(Natural\))/, ' ✨').replace(/\s*-\s*English.*$/, '');
      html += '<option value="' + esc(v.voiceURI) + '">' + esc(name) + ' · ' + (ACC[cc] || v.lang) + '</option>';
    });
    if (list.length) html += '</optgroup>';
    vsel.innerHTML = html;
    vsel.value = vs.v;
    if (vsel.value !== vs.v) vsel.value = 'f:us-f';
  }
  function talk(on) { [].forEach.call(main.querySelectorAll('.fc-say'), function (b) { b.classList.toggle('talk', on); }); }
  var audio = new Audio(), watchdog = null, onFail = null;
  audio.preload = 'auto';
  audio.addEventListener('playing', function () { talk(true); });
  audio.addEventListener('ended', function () { talk(false); });
  audio.addEventListener('error', function () { talk(false); if (onFail) { var f = onFail; onFail = null; f(); } });
  function stopAll() {
    clearTimeout(watchdog); onFail = null;
    try { audio.pause(); } catch (e) {}
    if (native) try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); } catch (e) {}
    talk(false);
  }
  function rate() { return parseFloat(vs.r) || 0.9; }
  function playUrl(url, fail) {
    try {
      onFail = fail || null;
      audio.src = url;
      audio.playbackRate = Math.max(0.6, rate() + 0.1);
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function (e) { talk(false); if (e && e.name === 'NotSupportedError' && onFail) { var f = onFail; onFail = null; f(); } });
    } catch (e) { talk(false); }
  }
  function gSpeak(t) { playUrl('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=' + encodeURIComponent(t)); }
  function nativeSpeak(t, voiceURI, fail) {
    var list = voices();
    if (!native || !list.length) { fail(); return; }
    try {
      var u = new SpeechSynthesisUtterance(t);
      var v = voiceURI && list.filter(function (x) { return x.voiceURI === voiceURI; })[0];
      if (!v) v = list.filter(function (x) { return /en[-_]US/i.test(x.lang); })[0] || list[0];
      u.voice = v; u.lang = v.lang; u.rate = rate();
      var started = false;
      u.onstart = function () { started = true; clearTimeout(watchdog); talk(true); };
      u.onend = function () { talk(false); };
      u.onerror = function (e) { talk(false); if (!started && e && e.error !== 'interrupted' && e.error !== 'canceled') fail(); };
      speechSynthesis.speak(u);
      watchdog = setTimeout(function () { if (!started) { try { speechSynthesis.cancel(); } catch (e) {} fail(); } }, 1500);
    } catch (e) { fail(); }
  }
  function speak(text) {
    var t = clean(text);
    stopAll();
    var file = AUDIO_BASE + 'us-f/' + slug(text) + '.mp3';
    if (vs.v.indexOf('f:') === 0) {
      file = AUDIO_BASE + vs.v.slice(2) + '/' + slug(text) + '.mp3';
      playUrl(file, function () { nativeSpeak(t, '', function () { gSpeak(t); }); });
    } else {
      nativeSpeak(t, vs.v, function () { playUrl(file, function () { gSpeak(t); }); });
    }
  }
  fillVoices();
  if (native) try { speechSynthesis.addEventListener('voiceschanged', fillVoices); } catch (e) { try { speechSynthesis.onvoiceschanged = fillVoices; } catch (e2) {} }
  rsel.value = vs.r; auto.checked = !!vs.a;
  function sample() { var c = deck[i] || cards[0]; speak(c.en); }
  vsel.addEventListener('change', function () { vs.v = vsel.value; saveVs(); sample(); });
  rsel.addEventListener('change', function () { vs.r = rsel.value; saveVs(); sample(); });
  auto.addEventListener('change', function () { vs.a = auto.checked ? 1 : 0; saveVs(); if (auto.checked) sample(); });
  function autoSay() { if (vs.a && deck[i] && (viFirst ? flipped : !flipped)) speak(deck[i].en); }

  function stats() {
    var k = countKnown();
    bg.querySelector('.fc-bar i').style.width = (k / cards.length * 100) + '%';
    bg.querySelector('.fc-known-n').textContent = 'Đã thuộc: ' + k + '/' + cards.length;
    bg.querySelector('.fc-pos-n').textContent = deck.length ? 'Thẻ ' + Math.min(i + 1, deck.length) + '/' + deck.length : '';
  }

  function render() {
    stats();
    if (!deck.length || i >= deck.length) { renderDone(); return; }
    var c = deck[i];
    var enFace = '<div class="fc-word">' + esc(c.en) + '</div>' + (c.ipa ? '<div class="fc-ipa">' + esc(c.ipa) + '</div>' : '') + (c.pos ? '<span class="fc-pos">' + c.pos + '</span>' : '');
    var viFace = '<div class="fc-word">' + esc(c.vi) + '</div>';
    var front = viFirst ? viFace : enFace, back = viFirst ? enFace : viFace;
    var say = canSpeak ? '<button class="fc-say" type="button" aria-label="Nghe phát âm" title="Nghe phát âm">🔊</button>' : '';
    var tag = known[c.en] ? '<span class="fc-tag">✓ Đã thuộc</span>' : '';
    main.innerHTML =
      '<div class="fc-scene' + (enter ? ' ' + enter : '') + '"><div class="fc-card' + (flipped ? ' flip' : '') + '" tabindex="0" role="button" aria-label="Lật thẻ">' +
      '<div class="fc-face">' + tag + (viFirst ? '' : say) + front + '<span class="fc-hint">Chạm để lật thẻ</span></div>' +
      '<div class="fc-face fc-back">' + tag + (viFirst ? say : '') + back + '</div>' +
      '</div></div>' +
      '<div class="fc-nav">' +
      '<button type="button" data-a="prev" aria-label="Thẻ trước">←</button>' +
      '<button type="button" class="no" data-a="no">Chưa thuộc</button>' +
      '<button type="button" class="yes" data-a="yes">Đã thuộc ✓</button>' +
      '<button type="button" data-a="next" aria-label="Thẻ sau">→</button>' +
      '</div>' +
      '<p class="fc-keys">Phím tắt: Space lật thẻ · ← → chuyển thẻ · 1 chưa thuộc · 2 đã thuộc</p>';
    var card = main.querySelector('.fc-card');
    card.addEventListener('click', function (e) { if (e.target.closest('.fc-say')) return; flip(); });
    [].forEach.call(main.querySelectorAll('.fc-say'), function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); speak(c.en); });
    });
    swipe(card);
    enter = '';
    autoSay();
  }

  function renderDone() {
    var k = countKnown(), left = cards.length - k;
    main.innerHTML =
      '<div class="fc-done"><div class="big">' + (left ? '💪' : '🎉') + '</div>' +
      (left
        ? '<p><b>Xong một vòng!</b></p><p>Còn <b>' + left + '</b> từ chưa thuộc. Ôn lại mấy từ đó nhé.</p>' +
          '<button type="button" class="main" data-d="again">Ôn ' + left + ' từ chưa thuộc</button><button type="button" data-d="all">Xem lại tất cả</button>'
        : '<p><b>Giỏi quá, thuộc hết ' + cards.length + ' từ rồi!</b></p><p>Mai mở lại ôn thêm một lần cho nhớ lâu nha.</p>' +
          '<button type="button" class="main" data-d="all">Xem lại tất cả</button><button type="button" data-d="reset">↺ Làm lại từ đầu</button>') +
      '</div>';
    if (!left) confetti();
  }
  function confetti() {
    if (reduce) return;
    var box = document.createElement('div'); box.className = 'fc-confetti';
    var col = ['#a8691a', '#1f8f6c', '#e0a43a', '#d9534f', '#4a90d9', '#f2c94c'];
    for (var k = 0; k < 70; k++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = col[k % col.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * .5) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      if (k % 3 === 0) p.style.borderRadius = '50%';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 3800);
  }

  function flip() { if (busy) return; flipped = !flipped; var c = main.querySelector('.fc-card'); if (c) c.classList.toggle('flip', flipped); autoSay(); }
  function go(d) {
    if (!deck.length || busy) return;
    var old = i;
    i = Math.max(0, Math.min(deck.length, i + d)); if (i >= deck.length && d < 0) i = deck.length - 1;
    if (i === old) return;
    enter = d > 0 ? 'in-r' : 'in-l'; flipped = false; render();
  }
  function mark(v) {
    if (i >= deck.length || busy) return;
    var c = deck[i]; if (v) known[c.en] = 1; else delete known[c.en]; save();
    stats();
    var sc = main.querySelector('.fc-scene');
    var next = function () { busy = false; i++; flipped = false; enter = 'in-r'; render(); };
    if (reduce || !sc) { next(); return; }
    busy = true;
    var st = document.createElement('span'); st.className = 'fc-stamp'; st.textContent = v ? '✅' : '🔁';
    sc.appendChild(st);
    sc.classList.add(v ? 'out-ok' : 'out-no');
    setTimeout(next, v ? 430 : 610);
  }

  function swipe(el) {
    var x0 = null, y0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { e.preventDefault(); go(dx < 0 ? 1 : -1); }
    });
  }

  main.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.dataset.a, d = b.dataset.d;
    if (a === 'prev') go(-1); else if (a === 'next') go(1);
    else if (a === 'yes') mark(true); else if (a === 'no') mark(false);
    else if (d === 'again') { onlyNew = true; tOnly.setAttribute('aria-pressed', 'true'); build(); }
    else if (d === 'all') { onlyNew = false; tOnly.setAttribute('aria-pressed', 'false'); build(); }
    else if (d === 'reset') { known = {}; save(); onlyNew = false; tOnly.setAttribute('aria-pressed', 'false'); build(); }
  });
  bg.querySelector('.fc-tools').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = b.dataset.t;
    if (t === 'dir') { viFirst = !viFirst; b.textContent = 'Mặt trước: ' + (viFirst ? 'Tiếng Việt' : 'English'); b.setAttribute('aria-pressed', viFirst); flipped = false; render(); }
    else if (t === 'mix') { mixed = !mixed; b.setAttribute('aria-pressed', mixed); build(); }
    else if (t === 'only') { onlyNew = !onlyNew; b.setAttribute('aria-pressed', onlyNew); build(); }
    else if (t === 'reset') { known = {}; save(); build(); }
  });
  bg.querySelector('.fc-x').addEventListener('click', close);
  bg.addEventListener('click', function (e) { if (e.target === bg) close(); });

  document.addEventListener('keydown', function (e) {
    if (!bg.classList.contains('on')) return;
    if (e.key === 'Escape') { close(); return; }
    if (/^(SELECT|INPUT)$/.test(e.target.tagName)) return;
    var inTools = e.target.closest && e.target.closest('.fc-tools, .fc-voice, .fc-done, .fc-x');
    if (e.key === ' ' || e.key === 'Enter') { if (inTools || (e.target.tagName === 'BUTTON' && !e.target.classList.contains('fc-card'))) return; e.preventDefault(); flip(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === '1') mark(false);
    else if (e.key === '2') mark(true);
  });

  function open(list, title, storeKey) {
    cards = list.slice(); KEY = storeKey || 'c20.fc'; known = load();
    bg.querySelector('.fc-title').textContent = title || 'Flashcard từ vựng';
    lastFocus = document.activeElement;
    bg.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    busy = false; enter = ''; build();
    var c = main.querySelector('.fc-card'); if (c) c.focus();
  }
  function close() {
    bg.classList.remove('on'); document.documentElement.style.overflow = '';
    stopAll();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.C20FC = { open: open };
})();
