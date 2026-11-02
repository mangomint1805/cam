/* Nút chỉnh tốc độ audio (0.75x / 1x / 1.25x) cạnh mỗi audio khi luyện tập; tắt khi thi thử. */
(function () {
  'use strict';
  if (/[?&]thi=1/.test(location.search)) return;
  var SP = 1; try { SP = parseFloat(localStorage.getItem('cam.speed')) || 1; } catch (e) {}
  var css = document.createElement('style');
  css.textContent = '.spd{display:inline-flex;gap:4px;align-items:center;font-size:12.5px;color:#666e7a}.spd button{font:700 12px/1 "IBM Plex Sans",sans-serif;border:1.5px solid #ddd7c9;background:#fff;color:#666e7a;border-radius:999px;padding:4px 8px;cursor:pointer}.spd button[aria-pressed=true]{background:var(--brand,#9a5f14);border-color:var(--brand,#9a5f14);color:#fff}';
  document.head.appendChild(css);
  function all() { return [].slice.call(document.querySelectorAll('audio')); }
  function set(v) { SP = v; try { localStorage.setItem('cam.speed', v); } catch (e) {} all().forEach(function (a) { a.playbackRate = v; });
    [].forEach.call(document.querySelectorAll('.spd button'), function (b) { b.setAttribute('aria-pressed', String(+b.dataset.v === v)); }); }
  [].forEach.call(document.querySelectorAll('.audio'), function (box) {
    if (box.querySelector('.spd')) return;
    var g = document.createElement('span'); g.className = 'spd'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Tốc độ audio');
    g.innerHTML = 'Tốc độ ' + [0.75, 1, 1.25].map(function (v) { return '<button type="button" data-v="' + v + '" aria-pressed="' + (v === SP) + '">' + v + 'x</button>'; }).join('');
    box.appendChild(g);
    g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) set(+b.dataset.v); });
  });
  document.addEventListener('play', function (e) { if (e.target.tagName === 'AUDIO') e.target.playbackRate = SP; }, true);
})();
