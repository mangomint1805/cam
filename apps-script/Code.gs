/**
 * Minto English — nhận kết quả luyện tập (TOEIC ETS 2026 + Cambridge IELTS) và ghi vào Google Sheet.
 *
 * CÁCH CẬP NHẬT (đã có bản cũ):
 *  1. Mở Google Sheet kết quả → Tiện ích mở rộng → Apps Script.
 *  2. Xoá hết code cũ, dán toàn bộ file này vào, bấm Lưu.
 *  3. Chọn hàm setup ở thanh trên → bấm Chạy (lần đầu Google sẽ hỏi quyền, bấm Cho phép).
 *     → Tạo thêm 2 tab "Góp ý" và "Bài viết", và ghi nhớ tài khoản Google của thầy (xem ở Nhật ký thực thi).
 *     Google sẽ hỏi thêm quyền "kết nối dịch vụ bên ngoài": bấm Cho phép (dùng để kiểm tra đăng nhập của thầy).
 *  4. Triển khai → Quản lý các bản triển khai → bấm bút chì ở bản đang dùng → Phiên bản: "Phiên bản mới" → Triển khai.
 *     (Giữ nguyên bản triển khai cũ để link /exec KHÔNG đổi.)
 *
 * Kết quả bài làm vẫn vào tab cũ; góp ý / báo lỗi vào tab "Góp ý"; bài Writing vào tab "Bài viết".
 * Trang "Bảng theo dõi lớp" chỉ mở được khi đăng nhập đúng tài khoản Google của thầy.
 * (Mã giáo viên cũ vẫn chạy cho tới khi chạy hàm tatMaGiaoVien.)
 */
const SHEET_NAME = 'Kết quả Cam 20';
const HEAD = ['Thời gian', 'Họ tên', 'Lớp / nhóm', 'Test', 'Phần', 'Chế độ', 'Đúng', 'Tổng', '% đúng', 'Band (ước tính)',
              'Số phút', 'Câu sai', 'Hết giờ tự nộp', 'Thiết bị', 'Email', 'Bài làm'];
const FB_NAME = 'Góp ý';
const FB_HEAD = ['Thời gian', 'Họ tên', 'Lớp / nhóm', 'Loại', 'Nội dung', 'Trang', 'Thiết bị', 'Email'];
const FIREBASE_API_KEY = 'AIzaSyA7LEweMPy4tSjjR_An_KZaGXSzGI2nQv4'; // mã công khai của web (giống trong acc.js), dùng để hỏi Google kiểm tra thẻ đăng nhập
const WS_NAME = 'Bài viết';
const WS_HEAD = ['Thời gian', 'Họ tên', 'Lớp / nhóm', 'Đề', 'Task', 'Số từ', 'Yêu cầu', 'Số phút', 'Bài viết', 'Email'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.kind !== 'cam20') return out_({ ok: false, error: 'sai loại dữ liệu' });
    const when = new Date(d.submittedAt || Date.now()), name = t_(d.name, 80) || '(chưa nhập tên)', lop = t_(d.lop, 60), email = t_(d.email, 120);
    const part = String(d.part || '').slice(0, 120), ua = t_(d.userAgent, 200);
    if (part.indexOf('Góp ý') === 0 || d.mode === 'Góp ý') {
      const msg = String(d.wrong || '').slice(0, 5000), i = msg.lastIndexOf('\n— Trang: ');
      tab_(FB_NAME, FB_HEAD).appendRow([when, name, lop, t_(part.replace(/^Góp ý · /, '')), t_(i >= 0 ? msg.slice(0, i) : msg), t_(i >= 0 ? msg.slice(i + 10) : ''), ua, email]);
      return out_({ ok: true });
    }
    if (d.mode === 'Writing') {
      tab_(WS_NAME, WS_HEAD).appendRow([when, name, lop, t_(d.test, 120), t_(part), Number(d.got) || '', Number(d.total) || '', t_(d.minutes, 20), t_(d.wrong, 20000), email]);
      return out_({ ok: true });
    }
    const sh = tab_(SHEET_NAME, HEAD);
    const total = Number(d.total) || 0, got = Number(d.got) || 0;
    const pct = total ? Math.round(got / total * 1000) / 10 : '';
    sh.appendRow([when, name, lop, t_(d.test, 120), t_(part), t_(d.mode, 40), got, total, pct, t_(d.band, 10), t_(d.minutes, 20), t_(d.wrong, 5000), d.auto ? 'Có' : '', ua, email, t_(d.answers, 49000)]);
    const r = sh.getLastRow();
    if (pct !== '') sh.getRange(r, 7, 1, 4).setBackground(pct >= 70 ? '#e1f4ec' : pct >= 50 ? '#fdf3dc' : '#fbe6e2');
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Bảng theo dõi lớp: GET ...exec?idt=<thẻ đăng nhập Google của thầy> (hoặc ?key=MÃ_GIÁO_VIÊN nếu còn bật mã)
function doGet(e) {
  const p = (e && e.parameter) || {}, P = PropertiesService.getScriptProperties(), key = P.getProperty('GV_KEY');
  const ok = (p.idt && isGv_(p.idt)) || (key && p.key === key);
  if (!ok) return out_({ ok: true, info: 'Minto English results endpoint' });
  const read = (n, max) => {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); if (!sh || sh.getLastRow() < 2) return [];
    const last = sh.getLastRow(), from = Math.max(2, last - max + 1);
    return sh.getRange(from, 1, last - from + 1, sh.getLastColumn()).getValues().map(r => r.map(v => v instanceof Date ? v.toISOString() : v));
  };
  const data = { ok: true, results: read(SHEET_NAME, 5000), feedback: read(FB_NAME, 300), writing: read(WS_NAME, 300) };
  const cb = String(p.callback || '');
  if (/^[A-Za-z_$][\w$]*$/.test(cb)) return ContentService.createTextOutput(cb + '(' + JSON.stringify(data) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return out_(data);
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  tab_(SHEET_NAME, HEAD); tab_(FB_NAME, FB_HEAD); tab_(WS_NAME, WS_HEAD);
  ['Trang tính1', 'Sheet1'].forEach(n => { const d = ss.getSheetByName(n); if (d && ss.getSheets().length > 1) ss.deleteSheet(d); });
  const P = PropertiesService.getScriptProperties();
  if (!P.getProperty('GV_EMAIL')) P.setProperty('GV_EMAIL', Session.getEffectiveUser().getEmail().toLowerCase());
  Logger.log('Tài khoản thầy (đăng nhập Google bằng tài khoản này là mở được Bảng theo dõi lớp): ' + P.getProperty('GV_EMAIL'));
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true }); // để Google hỏi quyền kết nối mạng ngay lúc chạy setup
  const key = P.getProperty('GV_KEY');
  Logger.log(key ? 'Mã giáo viên cũ vẫn đang bật. Thử đăng nhập Google trên gv.html thấy ổn thì chạy hàm tatMaGiaoVien để tắt mã.' : 'Mã giáo viên đã tắt: chỉ đăng nhập Google mới mở được.');
}

// Tắt hẳn mã giáo viên: sau khi chạy, chỉ tài khoản Google của thầy mới đọc được kết quả.
function tatMaGiaoVien() {
  PropertiesService.getScriptProperties().deleteProperty('GV_KEY');
  Logger.log('Đã tắt mã giáo viên.');
}

// Hỏi Google xem thẻ đăng nhập (Firebase ID token) có hợp lệ và đúng email thầy không. Kết quả nhớ 10 phút.
function isGv_(idt) {
  const gv = PropertiesService.getScriptProperties().getProperty('GV_EMAIL');
  if (!gv || typeof idt !== 'string' || idt.length > 4000) return false;
  const C = CacheService.getScriptCache(), ck = 'gv' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idt)).slice(0, 40);
  if (C.get(ck) === '1') return true;
  const r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_API_KEY, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idt }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return false;
  const u = (JSON.parse(r.getContentText()).users || [])[0];
  const yes = !!(u && u.emailVerified && String(u.email || '').toLowerCase() === gv);
  if (yes) C.put(ck, '1', 600);
  return yes;
}

function tab_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() > 0 && sh.getLastColumn() < head.length) {
    sh.getRange(1, sh.getLastColumn() + 1, 1, head.length - sh.getLastColumn()).setValues([head.slice(sh.getLastColumn())]).setFontWeight('bold').setBackground('#f2e2c4');
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(head);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#f2e2c4');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sh.setColumnWidth(2, 180);
  }
  return sh;
}

// Chữ học viên gửi lên: cắt bớt độ dài, và thêm dấu ' trước chữ bắt đầu bằng = + - @
// để Google Sheet hiểu là chữ thường, không chạy như công thức (VD tên "=IMPORTXML(...)").
function t_(v, max) {
  if (typeof v === 'number') return v;
  const s = String(v == null ? '' : v).slice(0, max || 500);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
