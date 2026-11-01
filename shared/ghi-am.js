/* Ghi âm bài nói + chép lời tự động (nếu máy hỗ trợ) + tự kiểm tra: số từ, thời gian, từ/phút, từ đệm.
   Mọi thứ chỉ nằm trên máy học viên, không tải lên đâu cả.
   Dùng: var r = MREC.mount(element, { name: 'part2-xxx', onStop: fn }); r.start(); r.stop(); r.on() */
(function () {
  'use strict';
  var css = '' +
    '.mrec{border:1.5px solid var(--line,#ddd7c9);border-radius:14px;padding:10px 12px;margin:12px 0 0;background:var(--card,#fff)}' +
    '.mrec-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    '.mrec-b{font:inherit;font-weight:700;font-size:14px;border:0;border-radius:999px;padding:9px 16px;cursor:pointer;background:#b4441f;color:#fff;min-height:40px}' +
    '.mrec-b.on{background:#1e232b}.mrec-b.on::before{content:"";display:inline-block;width:9px;height:9px;border-radius:50%;background:#ff5a4a;margin-right:7px;animation:mrecP 1s infinite}' +
    '@keyframes mrecP{50%{opacity:.25}}' +
    '.mrec-t{font:600 22px/1 Fraunces,Georgia,serif;font-variant-numeric:tabular-nums;color:var(--brand-ink,#6b4410)}' +
    '.mrec-s{font-size:12.5px;color:var(--dim,#666e7a)}' +
    '.mrec-tr{margin:8px 0 0;font-size:14px;line-height:1.5;background:var(--panel2,#f2efe8);border-radius:10px;padding:8px 10px;max-height:140px;overflow:auto;white-space:pre-wrap}' +
    '.mrec-tr i{color:var(--dim,#666e7a)}.mrec-tr mark{background:#ffd9c7;border-radius:3px;color:inherit}' +
    '.mrec-out audio{width:100%;margin:8px 0 4px}' +
    '.mrec-st{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}' +
    '.mrec-st div{background:var(--panel2,#f2efe8);border-radius:10px;padding:6px 8px;text-align:center}.mrec-st b{display:block;font:600 19px/1.1 Fraunces,Georgia,serif;color:var(--brand-ink,#6b4410)}.mrec-st span{font-size:11.5px;color:var(--dim,#666e7a)}' +
    '.mrec-fl{font-size:13.5px;margin:4px 0}.mrec-fl code{background:#ffe9dc;border-radius:6px;padding:1px 6px;margin:0 3px 3px 0;display:inline-block;font:600 12.5px/1.5 "IBM Plex Sans",sans-serif;color:#8a3412}' +
    '.mrec-a{display:inline-block;font-weight:700;font-size:13.5px;color:var(--brand-ink,#6b4410);margin-right:12px}' +
    '.mrec-h{font-size:13px;color:var(--dim,#666e7a);margin-top:6px}.mrec-h summary{cursor:pointer;font-weight:600}.mrec-h ul{margin:4px 0;padding-left:18px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  // từ đệm hay gặp khi nói (máy chép lời đôi khi bỏ qua "um/uh", nên con số chỉ để tham khảo)
  var FILL = ['um', 'umm', 'uh', 'uhm', 'er', 'erm', 'ah', 'hmm', 'like', 'you know', 'i mean', 'basically', 'actually', 'kind of', 'sort of', 'literally'];
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function words(t) { var m = String(t || '').match(/[A-Za-z0-9'’-]+/g); return m ? m.length : 0; }
  function fillers(t) {
    var low = ' ' + String(t || '').toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ') + ' ', out = [];
    FILL.forEach(function (f) { var n = low.split(' ' + f + ' ').length - 1; if (n) out.push([f, n]); });
    return out.sort(function (a, b) { return b[1] - a[1]; });
  }
  function markF(t) {
    var re = new RegExp('\\b(' + FILL.map(function (f) { return f.replace(/ /g, '\\s+'); }).join('|') + ')\\b', 'gi');
    return esc(t).replace(re, '<mark>$1</mark>');
  }

  function mount(el, o) {
    o = o || {};
    var box = document.createElement('div'); box.className = 'mrec';
    box.innerHTML =
      '<div class="mrec-row"><button type="button" class="mrec-b">🎙 Ghi âm</button><span class="mrec-t">0:00</span>' +
      '<span class="mrec-s">' + (canRec ? (SR ? 'Bấm để ghi âm + chép lời' : 'Bấm để ghi âm') : 'Trình duyệt này không ghi âm được') + '</span></div>' +
      '<div class="mrec-tr" hidden></div><div class="mrec-out" hidden></div>' +
      '<details class="mrec-h"><summary>Cách dùng ghi âm</summary><ul>' +
      '<li>Bấm <b>🎙 Ghi âm</b>, cho phép dùng micro, nói xong bấm <b>■ Dừng</b>.</li>' +
      '<li>Nghe lại, tải file về máy nếu muốn gửi thầy qua Zalo.</li>' +
      '<li>Trên Chrome (máy tính, Android) web tự chép lời bạn nói để đếm số từ, tốc độ và các từ đệm (um, uh, like…). iPhone / Safari chưa hỗ trợ chép lời: vẫn ghi âm và nghe lại được.</li>' +
      '<li>Bản ghi chỉ nằm trên máy này, không gửi lên mạng. Đóng hộp này là bản ghi mất, nhớ tải về trước.</li></ul></details>';
    el.appendChild(box);
    var btn = box.querySelector('.mrec-b'), clk = box.querySelector('.mrec-t'), sub = box.querySelector('.mrec-s'), trEl = box.querySelector('.mrec-tr'), out = box.querySelector('.mrec-out');
    if (!canRec) btn.disabled = true;
    var rec = null, stream = null, chunks = [], t0 = 0, iv = 0, url = '', recog = null, finalT = '', interim = '', srOk = !!SR, wantSR = false, used = false;

    function showTr() {
      if (!srOk) return;
      trEl.hidden = false;
      trEl.innerHTML = finalT || interim ? esc(finalT) + (interim ? '<i>' + esc(interim) + '</i>' : '') : '<i>Đang nghe… nói tiếng Anh nhé.</i>';
      trEl.scrollTop = trEl.scrollHeight;
    }
    function startSR() {
      if (!srOk) return;
      try {
        recog = new SR(); recog.lang = 'en-US'; recog.continuous = true; recog.interimResults = true;
        recog.onresult = function (e) {
          interim = '';
          for (var i = e.resultIndex; i < e.results.length; i++) {
            var r = e.results[i];
            if (r.isFinal) finalT += (finalT ? ' ' : '') + r[0].transcript.trim(); else interim += r[0].transcript;
          }
          showTr();
        };
        recog.onerror = function (e) {
          if (e && /not-allowed|service-not-allowed|network|audio-capture|language-not-supported/.test(e.error)) { srOk = false; wantSR = false; trEl.hidden = false; trEl.innerHTML = '<i>Máy này chưa chép lời tự động được (' + esc(e.error) + '). Vẫn ghi âm bình thường, bạn tự nghe lại nhé.</i>'; }
        };
        // Chrome tự dừng khi im lặng lâu: còn đang ghi âm thì bật lại
        recog.onend = function () { if (wantSR && rec && rec.state === 'recording') { try { recog.start(); } catch (e) {} } };
        wantSR = true; recog.start(); showTr();
      } catch (e) { srOk = false; }
    }
    function stopSR() { wantSR = false; if (recog) { try { recog.stop(); } catch (e) {} } }

    function start() {
      if (!canRec || (rec && rec.state === 'recording')) return Promise.resolve(false);
      return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s; chunks = []; finalT = ''; interim = ''; used = true;
        try { rec = new MediaRecorder(s, { audioBitsPerSecond: 32000 }); } catch (e) { rec = new MediaRecorder(s); }
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = done;
        rec.start(1000); t0 = Date.now();
        btn.classList.add('on'); btn.textContent = '■ Dừng'; sub.textContent = 'Đang ghi âm…'; out.hidden = true;
        clearInterval(iv); iv = setInterval(function () { clk.textContent = fmt((Date.now() - t0) / 1000); }, 250);
        if (srOk) startSR(); else { trEl.hidden = false; trEl.innerHTML = '<i>Máy này chưa hỗ trợ chép lời tự động (thường gặp trên iPhone / Safari). Vẫn ghi âm bình thường, nói xong tự nghe lại nhé.</i>'; }
        return true;
      }).catch(function () { sub.textContent = 'Chưa dùng được micro: hãy cho phép web dùng micro rồi thử lại.'; return false; });
    }
    function stop() { if (rec && rec.state === 'recording') rec.stop(); }
    function done() {
      var dur = (Date.now() - t0) / 1000;
      clearInterval(iv); stopSR(); if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      btn.classList.remove('on'); btn.textContent = '🎙 Ghi lại'; sub.textContent = 'Xong — nghe lại bên dưới';
      var type = (rec && rec.mimeType) || (chunks[0] && chunks[0].type) || 'audio/webm';
      var blob = new Blob(chunks, { type: type }); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
      var ext = /mp4|m4a|aac/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm';
      var d = new Date(), stamp = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2);
      var full = (finalT + ' ' + interim).trim(), n = words(full), wpm = dur > 5 ? Math.round(n / (dur / 60)) : 0, fl = fillers(full);
      var h = '<audio controls src="' + url + '"></audio>' +
        '<a class="mrec-a" href="' + url + '" download="noi-' + esc(o.name || 'ielts') + '-' + stamp + '.' + ext + '">⬇ Tải bản ghi</a>';
      if (srOk && n) {
        h += '<div class="mrec-st"><div><b>' + n + '</b><span>số từ</span></div><div><b>' + fmt(dur) + '</b><span>thời gian nói</span></div><div><b>' + wpm + '</b><span>từ / phút</span></div></div>' +
          '<p class="mrec-fl">' + (fl.length ? 'Từ đệm: ' + fl.map(function (f) { return '<code>' + esc(f[0]) + ' ×' + f[1] + '</code>'; }).join('') : 'Không thấy từ đệm nào — tốt lắm! 👏') + '</p>' +
          '<p class="mrec-s">' + (wpm < 90 ? 'Tốc độ hơi chậm: thử nói liền mạch hơn, bớt ngắt quãng.' : wpm > 170 ? 'Nói hơi nhanh: chậm lại một chút cho rõ ý.' : 'Tốc độ ổn (người bản xứ thường nói khoảng 110–150 từ/phút).') +
          (o.minSec && dur < o.minSec ? ' Bài nói còn ngắn: Part 2 nên nói đủ 1 phút 30 – 2 phút.' : '') + ' Số liệu do máy chép lời nên chỉ để tham khảo.</p>';
        trEl.hidden = false; trEl.innerHTML = markF(full);
      } else {
        if (srOk) trEl.hidden = true;
        h += '<div class="mrec-st"><div><b>' + fmt(dur) + '</b><span>thời gian nói</span></div></div>' +
          '<p class="mrec-s">' + (srOk ? 'Máy chưa nghe ra chữ nào để đếm từ. Thử nói to, rõ hơn và gần micro.' : 'Tự nghe lại: có ngập ngừng, lặp “um, uh” nhiều không? Đủ ý chưa?') + (o.minSec && dur < o.minSec ? ' Part 2 nên nói đủ 1 phút 30 – 2 phút.' : '') + '</p>';
      }
      out.innerHTML = h; out.hidden = false;
      if (o.onStop) o.onStop({ dur: dur, words: n, transcript: full });
    }
    btn.onclick = function () { if (rec && rec.state === 'recording') stop(); else start(); };
    return { start: start, stop: stop, on: function () { return !!(rec && rec.state === 'recording'); }, has: function () { return used; },
      kill: function () { stop(); stopSR(); clearInterval(iv); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); }, ok: canRec };
  }
  window.MREC = { mount: mount, ok: canRec, sr: !!SR };
})();
