// 오디션 신청 — 공통 도우미 (서버 호출, 화면 조각 만들기)
(function () {
  'use strict';
  var CFG = window.AUD_CONFIG || {};
  function rpc(fn, p) {
    return fetch(String(CFG.url || '').replace(/\/+$/, '') + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.key, Authorization: 'Bearer ' + CFG.key },
      body: JSON.stringify(p === undefined ? {} : { p: p })
    }).then(function (r) {
      if (!r.ok) throw new Error('서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요. (' + r.status + ')');
      return r.json();
    }, function () { throw new Error('인터넷 연결을 확인한 뒤 다시 시도해 주세요.'); }).then(function (d) {
      if (!d || d.ok !== true) { var e = new Error((d && d.error) || '문제가 생겼습니다.'); e.code = d && d.error; throw e; }
      return d;
    });
  }
  // h('div', {class:'x', text:'..', onclick:fn}, child, [children])
  function h(tag, attrs) {
    var el = document.createElement(tag), i;
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    function add(c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) return c.forEach(add);
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    for (i = 2; i < arguments.length; i++) add(arguments[i]);
    return el;
  }
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function dateLabel(s) { // '2026-11-18' → '11월 18일(수)'
    var p = String(s || '').split('-'); if (p.length !== 3) return s || '';
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return (+p[1]) + '월 ' + (+p[2]) + '일(' + DOW[d.getUTCDay()] + ')';
  }
  function timeLabel(closeAt) { // '2026-11-18T17:00' → '오후 5시'
    var t = String(closeAt || '').split('T')[1] || ''; var hh = +t.slice(0, 2), mm = t.slice(3, 5);
    var ap = hh < 12 ? '오전' : '오후', h12 = hh % 12 === 0 ? 12 : hh % 12;
    return ap + ' ' + h12 + '시' + (mm && mm !== '00' ? ' ' + (+mm) + '분' : '');
  }
  function mmss(sec) { if (sec === null || sec === undefined) return ''; return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
  function partLabel(p) { return p === 'both' ? '보컬·댄스' : (p === 'vocal' ? '보컬' : '댄스'); }
  // 유튜브 링크만 열고, 시작 지점을 붙입니다.
  function playUrl(url, start) {
    try {
      var u = new URL(url);
      if (u.protocol !== 'https:' || !/(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname)) return null;
      if (start) u.searchParams.set('t', start + 's');
      return u.toString();
    } catch (e) { return null; }
  }
  // 유튜브 주소에서 영상 번호만 뽑습니다(youtu.be/…, watch?v=…, shorts/…, live/…, embed/…).
  function ytId(url) {
    try {
      var u = new URL(url), id = '';
      if (u.protocol !== 'https:' || !/(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname)) return null;
      if (/youtu\.be$/.test(u.hostname)) id = u.pathname.split('/')[1] || '';
      else if (u.searchParams.get('v')) id = u.searchParams.get('v');
      else { var m = u.pathname.match(/^\/(shorts|live|embed)\/([^/?#]+)/); id = m ? m[2] : ''; }
      return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
    } catch (e) { return null; }
  }
  window.AUD = { rpc: rpc, h: h, dateLabel: dateLabel, timeLabel: timeLabel, mmss: mmss, partLabel: partLabel, playUrl: playUrl, ytId: ytId };
})();
