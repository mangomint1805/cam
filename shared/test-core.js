/* Trang làm bài Cambridge IELTS — code dùng chung cho mọi đề (c17–c21, v7, v9).
   Mỗi trang test-N.html khai báo window.CAMTEST = {book, label, short, d:{KEY, QT, EV, XP, N}} rồi nạp file này.
   Sửa ở đây là áp dụng cho cả 22 đề. */

(function(){
'use strict';
var P=window.CAMTEST||{}, D=P.d||{}, KEY=D.KEY, QT=D.QT, EV=D.EV, XP=D.XP, N=D.N, BK=P.book, BLABEL=P.label, BSHORT=P.short;
var CFG=window.C20CFG||{};
var QS=new URLSearchParams(location.search), MODE=(QS.get('part')||'').toUpperCase();
if(!/^(L[1-4]|R[1-3]|L|R)$/.test(MODE)) MODE='';
var EXAM=QS.get('thi')==='1' && (MODE==='L'||MODE==='R');
var SK=BK+'.t'+N+(MODE?'.'+MODE:'')+(EXAM?'.thi':'');
var XEM=QS.get('xem'); if(XEM){ SK+='.xem'; try{ var _xh=JSON.parse((QS.get('peek')&&sessionStorage.getItem('mt.peek'))||lsGet(BK+'.hist'))||[], _xr=_xh.filter(function(x){return String(x.t)===XEM;})[0]; if(_xr&&_xr.ans){ var _xs={ans:_xr.ans,done:{},time:{L:0,R:0}}; _xs.done[_xr.sec]={got:_xr.got,total:_xr.total}; lsSet(SK,JSON.stringify(_xs)); window._XEMREC=_xr; } }catch(e){} }
function $(s,r){return (r||document).querySelector(s);} function $$(s,r){return [].slice.call((r||document).querySelectorAll(s));}
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function esc(t){ return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

// ================= chế độ làm riêng một phần / thi thử =================
(function(){
  if(!MODE) return;
  var s=MODE[0], n=MODE.slice(1);
  document.body.classList.add('one');
  var other=document.getElementById(s==='L'?'sectR':'sectL'); if(other) other.remove();
  if(n){ $$(s==='L'?'.part':'.passage').forEach(function(x){ if(x.id!==(s==='L'?'part':'passage')+n) x.remove(); }); }
  var lab=document.getElementById('modelabel'); lab.hidden=false;
  lab.textContent=(EXAM?'Thi thử · ':'')+(s==='L'?'Listening':'Reading')+(n?(s==='L'?' · Part ':' · Passage ')+n:(EXAM?'':' · cả phần'));
  document.title=document.title+' · '+lab.textContent;
  if(n) $$('.hint').forEach(function(h){ h.textContent='Bấm số câu để nhảy tới câu đó. Bài làm được tự lưu trên máy này.'+(s==='R'?' Gợi ý: khoảng 20 phút cho một passage.':''); });
  if(EXAM){ document.body.classList.add('exam');
    $$('.hint').forEach(function(h){ h.textContent=s==='L'?'Thi thử: audio phát liền 4 part, mỗi part chỉ nghe một lần, không tạm dừng. Nghe xong có 2 phút kiểm tra rồi bài tự nộp.':'Thi thử: 60 phút cho 3 passage. Hết giờ bài tự nộp.'; });
    $$('[data-act=reset]').forEach(function(b){ b.textContent='Thi lại'; });
  }
})();

var state={};
try{state=JSON.parse(lsGet(SK))||{};}catch(e){state={};}
state.ans=state.ans||{}; state.done=state.done||{}; state.time=state.time||{L:0,R:0};
function save(){ lsSet(SK,JSON.stringify(state)); }
var cur=MODE?MODE[0]:'L';

// ================= lưu & khôi phục bài làm =================
$$('.ans').forEach(function(el){var q=el.dataset.q; if(state.ans[q]!=null) el.value=state.ans[q];
  el.addEventListener('input',function(){state.ans[q]=el.value; save(); grid();}); el.addEventListener('change',function(){state.ans[q]=el.value; save(); grid();});});
$$('.opts').forEach(function(bq){
  var q=bq.dataset.q, q2=bq.dataset.q2, boxes=$$('.ans-opt',bq);
  var saved=state.ans[q]; if(saved!=null){ boxes.forEach(function(b){ b.checked=String(saved).split(',').indexOf(b.value)>=0; }); }
  boxes.forEach(function(b){ b.addEventListener('change',function(){
    if(q2){ var pick=+b.dataset.pick, on=boxes.filter(function(x){return x.checked;}); if(on.length>pick){ b.checked=false; return; } }
    state.ans[q]=boxes.filter(function(x){return x.checked;}).map(function(x){return x.value;}).join(','); save(); grid();
  }); });
});

// ================= danh sách câu =================
var PRESENT={};
$$('.ans').forEach(function(el){PRESENT[el.dataset.q]=1;});
$$('.opts').forEach(function(b){ var s=b.dataset.q[0],a=+b.dataset.q.slice(1),z=b.dataset.q2?+b.dataset.q2.slice(1):a; for(var n=a;n<=z;n++) PRESENT[s+n]=1; });
function qnums(s){ return Object.keys(QT).filter(function(k){return k[0]===s&&PRESENT[k];}).map(function(k){return +k.slice(1);}).sort(function(a,b){return a-b;}); }
function pairOf(s,n){ return $$('.opts[data-q2]').filter(function(b){var a=+b.dataset.q.slice(1),z=+b.dataset.q2.slice(1);return b.dataset.q[0]===s&&n>=a&&n<=z;})[0]; }
function answered(s,n){
  var k=s+n;
  if(QT[k]==='multi'){ var bq=pairOf(s,n); if(!bq) return false; var v=(state.ans[bq.dataset.q]||'').split(',').filter(Boolean); return v.length>n-(+bq.dataset.q.slice(1)); }
  return !!(state.ans[k]&&String(state.ans[k]).trim());
}
function target(s,n){ var bq; return document.getElementById(s+'q'+n) || $('[data-q="'+s+n+'"]') || ((bq=pairOf(s,n))&&bq.previousElementSibling); }
function grid(){
  ['L','R'].forEach(function(s){
    var g=$('.panel[data-s="'+s+'"] .grid'); if(!g) return; if(!g.children.length){
      qnums(s).forEach(function(n){var a=document.createElement('a'); a.href='#'; a.textContent=n; a.dataset.n=n;
        a.onclick=function(e){e.preventDefault(); var t=target(s,n); if(t){ t.scrollIntoView({behavior:'smooth',block:'center'}); var f=t.matches&&t.matches('.ans')?t:(t.querySelector&&t.querySelector('.ans,.ans-opt')); if(f) setTimeout(function(){f.focus({preventScroll:true});},350);} };
        g.appendChild(a);});
    }
    $$('a',g).forEach(function(a){ if(!state.done[s]) a.className=answered(s,+a.dataset.n)?'done':''; });
  });
}

// ================= chấm điểm =================
function norm(x){ return String(x||'').toLowerCase().replace(/[’']/g,"'").replace(/[£$€]/g,'').replace(/[.,;:!?]+$/,'').replace(/\s+/g,' ').trim(); }
function variants(key){
  var out=[]; String(key).split(/\s*\/\s*|\s+OR\s+/).forEach(function(alt){
    var opts=[''], parts=alt.split(/(\([^)]*\))/);
    parts.forEach(function(p){ if(/^\(.*\)$/.test(p)){ var inner=p.slice(1,-1); opts=opts.concat(opts.map(function(o){return o+inner;})); } else opts=opts.map(function(o){return o+p;}); });
    opts.forEach(function(o){out.push(norm(o));});
  }); return out;
}
function isRight(k,val){ var key=KEY[k]; if(key==null) return null; var v=norm(val); if(!v) return false;
  return variants(key).some(function(x){ return x===v || x.replace(/-/g,' ')===v.replace(/-/g,' '); }); }
var BAND={L:[[39,9],[37,8.5],[35,8],[32,7.5],[30,7],[26,6.5],[23,6],[18,5.5],[16,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5]],
          R:[[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[19,5.5],[15,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5]]};
function band(s,sc){ for(var i=0;i<BAND[s].length;i++) if(sc>=BAND[s][i][0]) return BAND[s][i][1]; return 'dưới 2.5'; }
var lastRes={};
function grade(s){
  var sect=$('#sect'+s), total=0, got=0, res={};
  $$('.fix',sect).forEach(function(f){f.remove();});
  $$('.ans',sect).forEach(function(el){ var k=el.dataset.q, r=isRight(k,el.value); if(r===null) return; total++;
    el.classList.remove('ok-mark','bad-mark'); el.classList.add(r?'ok-mark':'bad-mark'); res[+k.slice(1)]=r; if(r) got++;
    else{ var f=document.createElement('span'); f.className='fix'; f.textContent='✓ '+String(KEY[k]); el.insertAdjacentElement('afterend',f);} });
  $$('.opts',sect).forEach(function(bq){
    var q=+bq.dataset.q.slice(1), q2=bq.dataset.q2?+bq.dataset.q2.slice(1):q, keys=[], picked=$$('.ans-opt',bq).filter(function(b){return b.checked;}).map(function(b){return b.value;});
    for(var n=q;n<=q2;n++){ var kv=KEY[s+n]; if(kv!=null) keys.push(String(kv).toUpperCase().trim()); }
    if(!keys.length) return;
    $$('.opt',bq).forEach(function(o){ var v=$('input',o).value; o.classList.remove('right','wrong');
      if(keys.indexOf(v)>=0) o.classList.add('right'); else if($('input',o).checked) o.classList.add('wrong'); });
    var hits=picked.filter(function(p){return keys.indexOf(p)>=0;});
    for(var m=q;m<=q2;m++){ total++; var ok=(m-q)<hits.length; res[m]=ok; if(ok) got++; }
  });
  state.done[s]={got:got,total:total}; save(); lastRes[s]=res;
  var g=$('.panel[data-s="'+s+'"] .grid'); $$('a',g).forEach(function(a){ var r=res[+a.dataset.n]; a.className=r===true?'g-ok':r===false?'g-bad':''; });
  showScore(s); sect.classList.add('done-lock','revealed'); addLocs(s);
  return res;
}
function mshareIelts(s){ var d=state.done[s]; if(!d) return; var h=[]; try{ h=JSON.parse(lsGet(BK+'.hist'))||[]; }catch(e){}
  var rec=null; for(var i=h.length-1;i>=0;i--){ if(h[i].test===+N&&h[i].sec===s&&h[i].total===40){ rec=h[i]; break; } }
  var bv=band(s,d.got), bd=typeof bv==='number'?bv:0, pc=d.got/40, bp=rec&&rec.byPart||{}, w=who();
  window.MSHARE({kicker:'PHIẾU KẾT QUẢ LUYỆN TẬP IELTS', name:w.name||'Học viên', line:BLABEL+' · Test '+N+' · '+(s==='L'?'Listening':'Reading')+' · '+new Date().toLocaleDateString('vi-VN'),
    bigLabel:'BAND ƯỚC TÍNH', big:typeof bv==='number'?(bv%1?bv.toFixed(1):bv+'.0'):'<2.5', bigOf:(s==='L'?'Listening':'Reading')+' · '+d.got+'/40 câu', pct:bd/9, sub:'', tiles:[{k:'Câu đúng',v:d.got+'/40'},{k:'Tỉ lệ đúng',v:Math.round(pc*100)+'%'},{k:'Thời gian',v:Math.round((state.time[s]||0)/60)+' phút'}],
    bars:[], parts:Object.keys(bp).sort().map(function(k){ var a=bp[k]; return {label:(k[0]==='L'?'Part ':'Passage ')+k.slice(1), txt:a[0]+'/'+a[1], pct:a[1]?a[0]/a[1]:0}; }),
    mood:pc>=.9?'love':pc>=.8?'party':pc>=.65?'cool':'happy', msg:pc>=.8?'Band đẹp quá! Ai luyện IELTS cùng mình không?':pc>=.55?'Tiến bộ từng ngày, cố lên nào!':'Mới bắt đầu thôi, lần sau sẽ cao hơn!',
    url:'mangomint1805.github.io/cam', file:'minto-ielts-'+BK+'-test'+N+'-'+s}); }
window.mshareIelts=mshareIelts;
function camKq(s){ var h=[]; try{ h=JSON.parse(lsGet(BK+'.hist'))||[]; }catch(e){} var rec=null; for(var i=h.length-1;i>=0;i--){ if(h[i].test===+N&&h[i].sec===s&&h[i].ans){ rec=h[i]; break; } } if(!rec) return; var w=who();
  var K={self:true,data:{v:1,site:'I',b:(location.pathname.match(/\/((?:c|v)\d+)\/test-/)||[])[1]||'',t:+N,s:s,p:rec.part,at:rec.t,a:rec.ans,w:rec.wrong},name:w.name,lop:w.lop,test:document.title.replace(/\s*·\s*Test.*$/,'')+' · Test '+N,part:(s==='L'?'Listening':'Reading')+(String(rec.part).length===2?(s==='L'?' Part ':' Passage ')+String(rec.part).slice(1):''),mode:rec.exam?'Thi thử':'Luyện tập',when:rec.t,got:rec.got,total:rec.total,minutes:rec.secs?Math.round(rec.secs/6)/10:'',score:rec.band?String(rec.band):''};
  try{ sessionStorage.setItem('mt.kq',JSON.stringify(K)); }catch(e){} window.open('/ket-qua.html','_blank'); }
window.camKq=camKq;

function showScore(s){ var d=state.done[s], el=$('.panel[data-s="'+s+'"] .score'); if(!el) return; if(!d){el.innerHTML='';return;}
  el.innerHTML='Đúng '+d.got+'/'+d.total+(d.total===40?' <span class="band">Band ≈ '+band(s,d.got)+'</span>':'')+
    ' <button type="button" class="btn alt sm" onclick="camKq(\''+s+'\')">📊 Phân tích chi tiết</button>'+(d.total===40&&window.MSHARE?' <button type="button" class="btn alt sm" onclick="mshareIelts(\''+s+'\')">📸 Lưu ảnh khoe story</button>':'')+'<span class="after">Bấm 📍 cạnh mỗi câu để xem chỗ có đáp án'+(s==='L'?' trong lời thoại':' trong bài đọc')+', bấm 💡 để đọc giải thích tiếng Việt.</span>'+nextBox(s); }
// khung "Làm tiếp" (ui.js): gợi ý theo phần làm yếu nhất của lần nộp gần nhất
function nextBox(s){ if(!window.MNEXT) return ''; var h=[]; try{ h=JSON.parse(lsGet(BK+'.hist'))||[]; }catch(e){} var rec=null; for(var i=h.length-1;i>=0;i--){ if(h[i].test===+N&&h[i].sec===s){ rec=h[i]; break; } }
  return window.MNEXT({parts:rec&&rec.byPart||{}, test:+N, book:BK}); }

// ================= 1. lời thoại & vị trí đáp án =================
function addLocs(s){
  var sect=$('#sect'+s); $$('.loc,.xpb',sect).forEach(function(b){b.remove();});
  qnums(s).forEach(function(n){
    var k=s+n; if(!EV[k] && !XP[k]) return;
    if(QT[k]==='multi'){ var bq=pairOf(s,n); if(bq && +bq.dataset.q.slice(1)!==n) return; }
    var frag=[];
    if(EV[k]){ var b=document.createElement('button'); b.type='button'; b.className='loc'; b.title='Xem chỗ có đáp án câu '+n; b.textContent='📍 '+n;
      b.onclick=function(){ showEv(s,n); }; frag.push(b); }
    if(XP[k]){ var x=document.createElement('button'); x.type='button'; x.className='loc xpb'; x.title='Giải thích câu '+n; x.textContent='💡';
      x.onclick=function(){ showXp(s,n); }; frag.push(x); }
    var w=$('[data-q="'+k+'"]',sect), anchor=null, parent=null;
    if(w && w.classList.contains('ans')){ anchor=w.nextElementSibling&&w.nextElementSibling.classList.contains('fix')?w.nextElementSibling:w; }
    else { parent=target(s,n); }
    frag.forEach(function(el){ if(anchor){ anchor.insertAdjacentElement('afterend',el); anchor=el; } else if(parent) parent.appendChild(el); });
  });
}
function keyText(s,n){
  var k=s+n, bq=QT[k]==='multi'?pairOf(s,n):null;
  if(bq){ var a=+bq.dataset.q.slice(1), z=+bq.dataset.q2.slice(1), o=[]; for(var m=a;m<=z;m++) if(KEY[s+m]!=null) o.push(KEY[s+m]); return {q:a+'–'+z, a:o.join(' & ')}; }
  return {q:''+n, a:String(KEY[k]==null?'':KEY[k]).split('/').map(function(x){return x.trim();}).join(' / ')};
}
function showXp(s,n){
  var box=$('#xpSheet'); if(!box){ box=document.createElement('div'); box.id='xpSheet'; box.setAttribute('role','dialog');
    box.innerHTML='<div class="xp-in"><div class="xp-head"><b class="xp-t"></b><button type="button" class="xp-x" aria-label="Đóng">✕</button></div><div class="xp-a"></div><p class="xp-b"></p><div class="xp-f"><button type="button" class="xp-ev">📍 Xem chỗ có đáp án</button><span><button type="button" class="xp-prev">‹ Câu trước</button><button type="button" class="xp-next">Câu sau ›</button></span></div></div>';
    document.body.appendChild(box); $('.xp-x',box).onclick=function(){ box.classList.remove('on'); };
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') box.classList.remove('on'); }); }
  var kt=keyText(s,n), res=(lastRes[s]||{})[n];
  $('.xp-t',box).textContent=(s==='L'?'Listening':'Reading')+' · Câu '+kt.q;
  $('.xp-a',box).innerHTML='Đáp án: <b></b>'+(res===true?' <span class="xp-ok">Bạn làm đúng ✓</span>':res===false?' <span class="xp-no">Bạn làm sai ✗</span>':'');
  $('b',$('.xp-a',box)).textContent=kt.a;
  $('.xp-b',box).textContent=XP[s+n]||'';
  var ev=$('.xp-ev',box); ev.style.display=EV[s+n]?'':'none'; ev.onclick=function(){ box.classList.remove('on'); showEv(s,n); };
  var list=qnums(s).filter(function(m){ if(!XP[s+m]) return false; if(QT[s+m]!=='multi') return true; var b=pairOf(s,m); return !b||+b.dataset.q.slice(1)===m; }), i=list.indexOf(n);
  var pv=$('.xp-prev',box), nx=$('.xp-next',box);
  pv.disabled=i<=0; nx.disabled=i<0||i>=list.length-1;
  pv.onclick=function(){ if(i>0) showXp(s,list[i-1]); }; nx.onclick=function(){ if(i<list.length-1) showXp(s,list[i+1]); };
  box.classList.add('on');
}
function flash(el){ el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
function showEv(s,n){
  var k=s+n, v=EV[k];
  if(s==='L'){
    var sp=document.getElementById(v); if(!sp) return;
    var d=sp.closest('details'); if(d) d.open=true;
    $$('.evhl').forEach(function(x){x.classList.remove('evhl');});
    sp.classList.add('evhl'); sp.setAttribute('data-q',n);
    sp.scrollIntoView({behavior:'smooth',block:'center'}); flash(sp);
  } else {
    var pi=n<=13?1:n<=26?2:3, box=$('#passage'+pi+' .ptext'); if(!box) return;
    var m=markSentence(box,v,n); if(m){ m.scrollIntoView({behavior:'smooth',block:'center'}); flash(m); }
  }
}
function markSentence(root,sentence,n){
  var old=root.querySelector('mark.ev[data-q="'+n+'"]'); if(old) return old;
  var tgt=sentence.replace(/\s+/g,''), head=tgt.slice(0,40);
  var ps=$$('p',root);
  for(var i=0;i<ps.length;i++){
    var walker=document.createTreeWalker(ps[i],NodeFilter.SHOW_TEXT,null), map=[], str='', node;
    while((node=walker.nextNode())){ var t=node.nodeValue; for(var j=0;j<t.length;j++){ if(!/\s/.test(t[j])){ map.push([node,j]); str+=t[j]; } } }
    var at=str.indexOf(head); if(at<0) continue;
    var end=Math.min(str.length,at+tgt.length)-1, first=null;
    // gom theo từng text node rồi bọc <mark>
    var segs=[], k=at;
    while(k<=end){ var nd=map[k][0], st=map[k][1], en=st; while(k+1<=end && map[k+1][0]===nd){ k++; en=map[k][1]; } segs.push([nd,st,en+1]); k++; }
    segs.reverse().forEach(function(sg){ var r=document.createRange(); r.setStart(sg[0],sg[1]); r.setEnd(sg[0],sg[2]);
      var mk=document.createElement('mark'); mk.className='ev'; mk.setAttribute('data-q',n); try{ r.surroundContents(mk); first=mk; }catch(e){} });
    if(first){ var tag=document.createElement('sup'); tag.className='evtag'; tag.textContent=n; first.insertBefore(tag,first.firstChild); }
    return first;
  }
  return null;
}

// ================= 3. gửi kết quả về Google Sheet + lưu lịch sử =================
function who(){ return {name:lsGet('cam20.name')||'', lop:lsGet('cam20.lop')||''}; }
function logResult(s,res,auto){
  var d=state.done[s]; if(!d) return;
  var wrong=Object.keys(res).filter(function(n){return res[n]===false;}).map(Number).sort(function(a,b){return a-b;});
  var byPart={}; Object.keys(res).forEach(function(n){ n=+n; var pk=s==='L'?'L'+Math.ceil(n/10):'R'+(n<=13?1:n<=26?2:3); var b=byPart[pk]||(byPart[pk]=[0,0]); b[1]++; if(res[n]) b[0]++; });
  var rec={t:Date.now(), test:+N, sec:s, part:MODE.length===2?MODE:(s), exam:EXAM, got:d.got, total:d.total, byPart:byPart,
    band:d.total===40?band(s,d.got):'', secs:state.time[s]||0, wrong:wrong, ans:(function(){ var o={}; Object.keys(state.ans||{}).forEach(function(k){ if(k.charAt(0)===s&&state.ans[k]!==''&&state.ans[k]!=null) o[k]=state.ans[k]; }); return o; })()};
  var h=[]; try{ h=JSON.parse(lsGet(BK+'.hist'))||[]; }catch(e){}
  h.push(rec); if(h.length>300) h=h.slice(-300); lsSet(BK+'.hist',JSON.stringify(h));
  var url=CFG.SCRIPT_URL; if(!url) return;
  var w=who(), body={kind:'cam20', name:w.name, lop:w.lop, test:BSHORT+' · Test '+N,
    part:(s==='L'?'Listening':'Reading')+(MODE.length===2?(s==='L'?' Part ':' Passage ')+MODE.slice(1):''),
    mode:EXAM?'Thi thử':'Luyện tập', got:d.got, total:d.total, band:rec.band, minutes:Math.round((state.time[s]||0)/6)/10,
    wrong:wrong.join(', '), auto:!!auto, submittedAt:new Date(rec.t).toISOString(), answers:JSON.stringify({v:1,site:'I',b:(location.pathname.match(/\/((?:c|v)\d+)\/test-/)||[])[1]||'',t:+N,s:s,p:rec.part,at:rec.t,a:rec.ans,w:wrong}), userAgent:navigator.userAgent};
  try{ fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)}); }catch(e){}
}
function askName(cb){
  var w=who(); if(w.name){ cb(); return; }
  var m=$('#namebox'); m.hidden=false; $('#nmName').value=w.name; $('#nmLop').value=w.lop; setTimeout(function(){$('#nmName').focus();},50);
  $('#nmForm').onsubmit=function(e){ e.preventDefault(); var nm=$('#nmName').value.trim(); if(!nm){ $('#nmErr').textContent='Nhập họ tên để thầy nhận được kết quả nhé.'; return; }
    lsSet('cam20.name',nm); lsSet('cam20.lop',$('#nmLop').value.trim()); m.hidden=true; cb(); };
  $('#nmSkip').onclick=function(){ m.hidden=true; cb(); };
}
function submit(s,auto){
  var p=$('.panel[data-s="'+s+'"]'); if(!p||state.done[s]) return;
  var go=function(){ var res=grade(s); logResult(s,res,auto); showScore(s); stopExam(); p.scrollIntoView({behavior:'smooth'}); }; // showScore lần nữa: khung Làm tiếp đọc lần nộp vừa lưu
  if(auto){ go(); return; }
  var miss=qnums(s).filter(function(n){return !answered(s,n);}).length;
  if(miss && !confirm('Còn '+miss+' câu chưa làm. Vẫn nộp bài?')) return;
  askName(go);
}
$$('.panel').forEach(function(p){ var s=p.dataset.s;
  $('[data-act=submit]',p).onclick=function(){ submit(s,false); };
  $('[data-act=reset]',p).onclick=function(){
    if(!confirm(EXAM?'Thi lại từ đầu? Bài làm lần này sẽ bị xoá.':'Xoá hết bài làm phần này và làm lại?')) return;
    var sect=$('#sect'+s); Object.keys(state.ans).forEach(function(k){ if(k[0]===s) delete state.ans[k]; });
    delete state.done[s]; state.time[s]=0; delete state.started; delete state.apart; delete state.apos; delete state.audioEnd; save();
    if(EXAM){ location.reload(); return; }
    $$('.ans',sect).forEach(function(el){el.value=''; el.classList.remove('ok-mark','bad-mark');});
    $$('.ans-opt',sect).forEach(function(b){b.checked=false;}); $$('.opt',sect).forEach(function(o){o.classList.remove('right','wrong');});
    $$('.fix,.loc,.evtag',sect).forEach(function(f){f.remove();});
    $$('mark.ev',sect).forEach(function(mk){ var t=document.createTextNode(mk.textContent); mk.replaceWith(t); });
    $$('.evhl',sect).forEach(function(x){x.classList.remove('evhl');}); $$('details.script',sect).forEach(function(d){d.open=false;});
    sect.classList.remove('done-lock','revealed');
    $$('audio',sect).forEach(function(a){a.pause(); a.currentTime=0;});
    showScore(s); grid(); window.scrollTo(0,0); };
});

// ================= 2. chế độ thi thử =================
var examTimer=null;
function stopExam(){ if(examTimer){ clearInterval(examTimer); examTimer=null; } $$('#sectL audio').forEach(function(a){a.pause();}); var eb=$('#exambar'); if(eb&&EXAM&&state.done[MODE[0]]){ eb.classList.add('over'); eb.innerHTML='<b>Đã nộp bài thi thử.</b> Xem điểm, đáp án và '+(MODE[0]==='L'?'lời thoại':'vị trí đáp án trong bài')+' ở dưới, hoặc bấm “Thi lại” để làm lại.'; } }
function fmt(t){t=Math.max(0,Math.round(t));var m=Math.floor(t/60),x=t%60;return (m<10?'0':'')+m+':'+(x<10?'0':'')+x;}
function setupExam(){
  if(!EXAM) return;
  var s=MODE[0], sect=$('#sect'+s), bar=document.createElement('div'); bar.id='exambar'; bar.className='exambar';
  sect.insertBefore(bar, sect.firstChild);
  if(state.done[s]){ bar.innerHTML='<b>Đã nộp bài thi thử.</b> Xem điểm và lời thoại ở dưới, hoặc bấm “Thi lại” để làm lại.'; bar.classList.add('over'); return; }
  var w=who();
  var rules=s==='L'?['Audio phát liền Part 1 → Part 4, mỗi part chỉ nghe một lần, không tạm dừng hay tua.','Vừa nghe vừa điền đáp án. Nghe xong có 2 phút kiểm tra, sau đó bài tự nộp.','Đeo tai nghe và kiểm tra âm lượng trước khi bắt đầu.']
                   :['Có 60 phút cho 3 passage (40 câu). Đồng hồ đếm ngược ở góc trên.','Hết giờ bài tự nộp, nên nhớ để ý thời gian.'];
  var ov=$('#examstart'); ov.hidden=state.started?true:false;
  $('#exTitle').textContent='Thi thử '+(s==='L'?'Listening':'Reading')+' · Test '+N;
  $('#exRules').innerHTML=rules.map(function(r){return '<li>'+esc(r)+'</li>';}).join('');
  $('#exName').value=w.name; $('#exLop').value=w.lop;
  $('#exForm').onsubmit=function(e){ e.preventDefault(); var nm=$('#exName').value.trim(); if(!nm){ $('#exErr').textContent='Nhập họ tên trước khi bắt đầu nhé.'; return; }
    lsSet('cam20.name',nm); lsSet('cam20.lop',$('#exLop').value.trim()); ov.hidden=true; state.started=Date.now(); save(); run(true); };
  if(state.started) run(false);
  function run(fresh){
    if(s==='R'){
      var LIM=60*60;
      var tickR=function(){ var left=LIM-(Date.now()-state.started)/1000; state.time.R=Math.min(LIM,Math.round((Date.now()-state.started)/1000));
        bar.innerHTML='⏳ Còn lại <b class="cd'+(left<300?' low':'')+'">'+fmt(left)+'</b> · hết giờ bài tự nộp'; $('#timer').textContent=fmt(left);
        if(left<=0){ stopExam(); submit('R',true); } };
      tickR(); examTimer=setInterval(tickR,1000);
    } else {
      var auds=$$('#sectL .audio audio'); var idx=state.apart||0;
      var showBar=function(txt,pct){ bar.innerHTML=txt+(pct!=null?'<div class="eprog"><i style="width:'+pct+'%"></i></div>':''); };
      var endPhase=function(){ if(!state.audioEnd){ state.audioEnd=Date.now(); save(); }
        var tickE=function(){ var left=120-(Date.now()-state.audioEnd)/1000; showBar('✅ Đã nghe xong. Còn <b class="cd low">'+fmt(left)+'</b> để kiểm tra lại đáp án, sau đó bài tự nộp.',null); $('#timer').textContent=fmt(left);
          if(left<=0){ stopExam(); submit('L',true); } };
        tickE(); examTimer=setInterval(tickE,1000); };
      if(state.audioEnd||idx>=auds.length){ endPhase(); return; }
      var play=function(){
        var a=auds[idx]; if(!a){ endPhase(); return; }
        if(state.apos && state.apart===idx){ try{ a.currentTime=state.apos; }catch(e){} }
        a.onended=function(){ idx++; state.apart=idx; state.apos=0; save(); play(); };
        a.ontimeupdate=function(){ if(!a.duration) return; var pct=a.currentTime/a.duration*100;
          showBar('🎧 Đang phát <b>Part '+(idx+1)+'</b> / 4 · '+fmt(a.currentTime)+' / '+fmt(a.duration),pct);
          if(Math.floor(a.currentTime)%3===0){ state.apart=idx; state.apos=a.currentTime; save(); } };
        var pr=a.play(); if(pr&&pr.catch) pr.catch(function(){ showBar('<button type="button" class="btn" id="exResume">▶ Bấm để tiếp tục nghe Part '+(idx+1)+'</button>',null); $('#exResume').onclick=function(){ play(); }; });
        var pc=document.getElementById('part'+(idx+1)); if(pc && fresh!==false) pc.scrollIntoView({behavior:'smooth'});
      };
      if(fresh) play();
      else showBar('<button type="button" class="btn" id="exResume">▶ Tiếp tục nghe Part '+(idx+1)+'</button> <span class="hint">Trang vừa tải lại, bấm để nghe tiếp từ chỗ dừng.</span>',null), $('#exResume').onclick=function(){ play(); };
      examTimer=setInterval(function(){ state.time.L=Math.round((Date.now()-state.started)/1000); $('#timer').textContent=fmt(state.time.L); },1000);
    }
  }
}

// ================= 4. tô sáng & ghi chú trong bài đọc =================
var HK=BK+'.hl.t'+N;
function hlLoad(){ var o={}; try{o=JSON.parse(lsGet(HK))||{};}catch(e){} return o; }
function hlSave(){ var o={}; $$('.passage').forEach(function(ps){ $$('.ptext p',ps).forEach(function(p,i){ if(p.querySelector('mark.hl')){ var c=p.cloneNode(true); $$('mark.ev,.evtag,.loc',c).forEach(function(x){ if(x.tagName==='MARK') x.replaceWith(document.createTextNode(x.textContent)); else x.remove(); }); o[ps.id+':'+i]=c.innerHTML; } }); }); lsSet(HK,JSON.stringify(o)); }
function hlRestore(){ var o=hlLoad(); Object.keys(o).forEach(function(k){ var a=k.split(':'), ps=document.getElementById(a[0]); if(!ps) return; var p=$$('.ptext p',ps)[+a[1]]; if(p) p.innerHTML=o[k]; }); }
function setupHighlight(){
  if(!$('.ptext')) return;
  hlRestore();
  var tb=document.createElement('div'); tb.className='hltool'; tb.hidden=true;
  tb.innerHTML='<button type="button" data-h="y">🖍 Tô vàng</button><button type="button" data-h="n">📝 Ghi chú</button>';
  document.body.appendChild(tb);
  var nb=document.createElement('div'); nb.className='notebox'; nb.hidden=true;
  nb.innerHTML='<textarea rows="3" placeholder="Ghi chú của bạn…"></textarea><div><button type="button" data-n="save" class="btn">Lưu</button> <button type="button" data-n="del" class="btn alt">Bỏ tô</button></div>';
  document.body.appendChild(nb);
  var range=null, curMark=null;
  function place(el,x,y){ el.style.left=Math.max(8,Math.min(window.innerWidth-el.offsetWidth-8,x))+'px'; el.style.top=(y+window.scrollY)+'px'; }
  function onSel(){
    var sel=window.getSelection(); if(!sel.rangeCount||sel.isCollapsed){ tb.hidden=true; return; }
    var r=sel.getRangeAt(0), p1=r.startContainer.parentElement&&r.startContainer.parentElement.closest('.ptext p'), p2=r.endContainer.parentElement&&r.endContainer.parentElement.closest('.ptext p');
    if(!p1||p1!==p2||!r.toString().trim()){ tb.hidden=true; return; }
    range=r.cloneRange(); tb.hidden=false; var rc=r.getBoundingClientRect(); place(tb,rc.left+rc.width/2-tb.offsetWidth/2,rc.top-44);
  }
  document.addEventListener('mouseup',function(e){ if(tb.contains(e.target)||nb.contains(e.target)) return; setTimeout(onSel,10); });
  document.addEventListener('touchend',function(e){ if(tb.contains(e.target)||nb.contains(e.target)) return; setTimeout(onSel,250); });
  document.addEventListener('mousedown',function(e){ if(!nb.contains(e.target)&&!(e.target.closest&&e.target.closest('mark.hl'))) nb.hidden=true; });
  function wrap(){ if(!range) return null; var mk=document.createElement('mark'); mk.className='hl';
    try{ mk.appendChild(range.extractContents()); range.insertNode(mk); }catch(e){ return null; } window.getSelection().removeAllRanges(); tb.hidden=true; range=null; hlSave(); return mk; }
  tb.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; var mk=wrap(); if(mk&&b.dataset.h==='n') openNote(mk); });
  function openNote(mk){ curMark=mk; nb.hidden=false; $('textarea',nb).value=mk.getAttribute('data-note')||''; var rc=mk.getBoundingClientRect(); place(nb,rc.left,rc.bottom+6); $('textarea',nb).focus(); }
  document.addEventListener('click',function(e){ var mk=e.target.closest&&e.target.closest('mark.hl'); if(mk && !window.getSelection().toString()) openNote(mk); });
  nb.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b||!curMark) return;
    if(b.dataset.n==='save'){ var v=$('textarea',nb).value.trim(); if(v){ curMark.setAttribute('data-note',v); curMark.title=v; curMark.classList.add('has-note'); } else { curMark.removeAttribute('data-note'); curMark.removeAttribute('title'); curMark.classList.remove('has-note'); } }
    else { var t=document.createDocumentFragment(); while(curMark.firstChild) t.appendChild(curMark.firstChild); curMark.replaceWith(t); }
    nb.hidden=true; curMark=null; hlSave(); });
  $$('.passage').forEach(function(ps){
    var h=document.createElement('div'); h.className='ptools';
    h.innerHTML='<span>Bôi đen chữ trong bài để tô vàng hoặc ghi chú.</span><button type="button" class="mini" data-clear>Xoá tô sáng</button>';
    var head=$('.part-title',ps); head.insertAdjacentElement('afterend',h);
    $('[data-clear]',h).onclick=function(){ if(!confirm('Xoá hết tô sáng và ghi chú của passage này?')) return; $$('.ptext mark.hl',ps).forEach(function(mk){ var t=document.createDocumentFragment(); while(mk.firstChild) t.appendChild(mk.firstChild); mk.replaceWith(t); }); hlSave(); };
  });
}

// ================= 6. flashcard từ vựng từng passage =================
function setupVocab(){
  var V=(window.C20VOCAB||{})[N]; if(!V||!window.C20FC) return;
  $$('.passage').forEach(function(ps){ var i=+ps.id.replace('passage',''), cards=V['R'+i]; if(!cards) return;
    var bar=$('.ptools',ps); if(!bar){ bar=document.createElement('div'); bar.className='ptools'; $('.part-title',ps).insertAdjacentElement('afterend',bar); }
    var b=document.createElement('button'); b.type='button'; b.className='mini vocab'; b.textContent='🃏 Từ vựng ('+cards.length+')';
    b.onclick=function(){ window.C20FC.open(cards,'Từ vựng · Test '+N+' · Passage '+i,BK+'.fc.t'+N+'.R'+i); };
    bar.appendChild(b);
  });
}

// ================= tab & đồng hồ =================
function tab(s){ cur=s; $$('.tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.s===s);});
  $$('.sect').forEach(function(x){x.classList.toggle('on',x.id==='sect'+s);});
  if(!$('#sect'+s)) return;
  if(s==='R') $$('#sectL audio').forEach(function(a){a.pause();});
  if(!MODE){ try{history.replaceState(null,'',s==='R'?'#reading':'#listening');}catch(e){} } tick(); }
$$('.tabs button').forEach(function(b){b.onclick=function(){tab(b.dataset.s); window.scrollTo(0,0);};});
function tick(){ if(!EXAM) $('#timer').textContent=fmt(state.time[cur]||0); }
if(!EXAM) setInterval(function(){ if(document.hidden||state.done[cur]) return; state.time[cur]=(state.time[cur]||0)+1; tick(); if(state.time[cur]%10===0) save(); },1000);

setupHighlight(); setupVocab();
['L','R'].forEach(function(s){ if(state.done[s]&&$('#sect'+s)) grade(s); });
grid(); tab(MODE?MODE[0]:(location.hash==='#reading'?'R':'L'));
setupExam();
})();

