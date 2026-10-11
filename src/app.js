(function () {
  'use strict';

  var DATA = JSON.parse(document.getElementById('data').textContent);
  var DOCS = DATA.docs;
  var ORDER = DATA.order;
  var ROOT_ID = DATA.tree.id;
  var KIND_LABEL = { bdl: 'BDL', abap: 'ABAP', ex: '예제', etc: '개요' };
  var KIND_FILTERS = [['all', '전체'], ['bdl', 'BDL'], ['abap', 'ABAP'], ['ex', '예제']];
  var MAX_HITS = 100;

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    q: $('q'), clear: $('clearBtn'), search: document.querySelector('.search'),
    tree: $('tree'), results: $('results'), treeHead: $('treeHead'), resultHead: $('resultHead'),
    resultCount: $('resultCount'), chips: $('chips'),
    doc: $('doc'), outline: $('outline'), main: $('main'), side: $('side'),
    menu: $('menuBtn'), scrim: $('scrim'), grip: $('grip'), theme: $('themeBtn')
  };

  // 주소에 constructor 같은 상속된 속성 이름이 와도 항목으로 잘못 알지 않게 한다
  function has(id) { return Object.prototype.hasOwnProperty.call(DOCS, id); }
  var parentOf = Object.create(null);
  (function walk(node, parent) {
    parentOf[node.id] = parent;
    (node.c || []).forEach(function (c) { walk(c, node.id); });
  })(DATA.tree, null);

  // 저장소: 파일로 바로 열거나 사생활 보호 창이면 막혀 있을 수 있으니 실패해도 그냥 넘어간다
  var store = {
    get: function (key) { try { return localStorage.getItem('rapguide.' + key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem('rapguide.' + key, value); } catch (e) { /* 무시 */ } }
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ---------- 밝은 화면 / 어두운 화면 ---------- */
  function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }
  var savedTheme = store.get('theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  el.theme.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
  });

  /* ---------- 목차 ---------- */
  var open = {};
  try { open = JSON.parse(store.get('open') || '{}') || {}; } catch (e) { open = {}; }
  if (!Object.keys(open).length) {
    open[ROOT_ID] = 1;
    (DATA.tree.c || []).forEach(function (c) { open[c.id] = 1; });
  }
  var CHEVRON = '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M3 1.5L7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function treeHtml(node) {
    var d = DOCS[node.id];
    var kids = node.c || [];
    var html = '<li data-id="' + node.id + '"' + (kids.length && !open[node.id] ? ' class="shut"' : '') + '>';
    html += '<div class="row">';
    html += kids.length
      ? '<button class="twist" type="button" aria-label="하위 항목 펴기/접기" aria-expanded="' + (open[node.id] ? 'true' : 'false') + '">' + CHEVRON + '</button>'
      : '<span class="twist leaf"></span>';
    html += '<a class="node" href="#/' + node.id + '" title="' + esc(d.t + '  ·  ' + d.e) + '"><span class="node-text">' + esc(d.t) + '</span>' +
      (d.g === 'ex' ? '<span class="tag">예제</span>' : '') + '</a></div>';
    if (kids.length) html += '<ul>' + kids.map(treeHtml).join('') + '</ul>';
    return html + '</li>';
  }
  el.tree.className = 'side-body tree';
  el.tree.innerHTML = '<ul>' + treeHtml(DATA.tree) + '</ul>';

  function liOf(id) { return el.tree.querySelector('li[data-id="' + id + '"]'); }
  function setOpen(id, isOpen) {
    var li = liOf(id);
    if (!li || !li.querySelector('ul')) return;
    li.classList.toggle('shut', !isOpen);
    li.querySelector('.twist').setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) open[id] = 1; else delete open[id];
  }
  function saveOpen() { store.set('open', JSON.stringify(open)); }

  el.tree.addEventListener('click', function (ev) {
    var twist = ev.target.closest('.twist');
    if (twist && !twist.classList.contains('leaf')) {
      var li = twist.closest('li');
      setOpen(li.dataset.id, li.classList.contains('shut'));
      saveOpen();
      return;
    }
    var node = ev.target.closest('.node');
    if (node) {
      // 이미 보고 있는 항목을 다시 누르면 접었다 폈다 한다
      var id = node.closest('li').dataset.id;
      if (id === current && liOf(id).querySelector('ul')) {
        setOpen(id, liOf(id).classList.contains('shut'));
        saveOpen();
      }
      closeSide();
    }
  });
  $('expandBtn').addEventListener('click', function () { ORDER.forEach(function (id) { setOpen(id, true); }); saveOpen(); });
  $('collapseBtn').addEventListener('click', function () {
    ORDER.forEach(function (id) { setOpen(id, id === ROOT_ID); });
    revealInTree(current);
    saveOpen();
  });

  function revealInTree(id) {
    for (var p = parentOf[id]; p; p = parentOf[p]) setOpen(p, true);
    var old = el.tree.querySelector('.row.here');
    if (old) { old.classList.remove('here'); old.querySelector('.node').removeAttribute('aria-current'); }
    var li = liOf(id);
    if (!li) return;
    var row = li.querySelector('.row');
    row.classList.add('here');
    row.querySelector('.node').setAttribute('aria-current', 'page');
    var box = el.tree.getBoundingClientRect();
    var r = row.getBoundingClientRect();
    if (r.top < box.top + 8 || r.bottom > box.bottom - 8) {
      el.tree.scrollTop += r.top - box.top - box.height / 3;
    }
  }

  /* ---------- 문서 보여 주기 ---------- */
  var current = null;
  var pendingTerms = null;

  function kindTag(d) { return '<span class="kind kind-' + d.g + '">' + KIND_LABEL[d.g] + '</span>'; }

  function show(id, anchor) {
    if (!has(id)) id = ROOT_ID;
    var d = DOCS[id];
    current = id;

    var crumbs = [];
    for (var p = parentOf[id]; p; p = parentOf[p]) crumbs.unshift('<a href="#/' + p + '">' + esc(DOCS[p].t) + '</a>');
    var html = crumbs.length ? '<nav class="crumbs" aria-label="현재 위치">' + crumbs.join('<span class="sep">›</span>') + '</nav>' : '';

    html += '<h1>' + esc(d.t) + '</h1>';
    html += '<div class="doc-meta">' + kindTag(d) + '<span class="doc-en">' + esc(d.e) + '</span>' +
      '<a href="' + esc(d.u) + '" target="_blank" rel="noopener">SAP 원문 보기</a></div>';
    if (d.s) html += '<p class="lead">' + esc(d.s) + '</p>';
    html += d.h;

    if (d.c.length) {
      html += '<h2 id="kids">하위 항목</h2><ul class="kids">' + d.c.map(function (c) {
        return '<li><a href="#/' + c + '">' + esc(DOCS[c].t) + '</a><span>' + esc(DOCS[c].s || DOCS[c].e) + '</span></li>';
      }).join('') + '</ul>';
    }

    var i = ORDER.indexOf(id);
    var prev = ORDER[i - 1];
    var next = ORDER[i + 1];
    html += '<nav class="pager" aria-label="앞뒤 항목">' +
      (prev ? '<a class="prev" href="#/' + prev + '"><small>앞 항목</small><b>' + esc(DOCS[prev].t) + '</b></a>' : '<span class="gap"></span>') +
      (next ? '<a class="next" href="#/' + next + '"><small>다음 항목</small><b>' + esc(DOCS[next].t) + '</b></a>' : '<span class="gap"></span>') +
      '</nav>';
    html += '<p class="foot">SAP ABAP 키워드 문서(ABAP Cloud)의 RAP 부분을 읽고 한글로 풀어 쓴 비공식 참고 자료입니다. ' +
      '문법 틀은 원문을 따르고, 설명과 예제는 새로 썼습니다. 예제는 그 항목의 문법만 보이게 줄인 코드입니다. 정확한 내용은 위의 "SAP 원문 보기"로 확인하세요. 만든 날: ' + esc(DATA.built) + '</p>';

    el.doc.innerHTML = html;

    // 코드 블록마다 복사 단추
    el.doc.querySelectorAll('.code-bar').forEach(function (bar) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'copy';
      b.textContent = '복사';
      bar.appendChild(b);
    });

    var outline = d.o.slice();
    if (d.c.length) outline.push(['kids', '하위 항목']);
    el.outline.innerHTML = outline.length > 1
      ? '<div class="outline-title">이 문서의 단락</div>' + outline.map(function (o) {
          return '<a href="#/' + id + '/' + o[0] + '">' + esc(o[1]) + '</a>';
        }).join('')
      : '';

    document.title = d.t + ' · RAP 키워드 길잡이';
    revealInTree(id);

    var terms = pendingTerms;
    pendingTerms = null;
    var firstMark = terms ? markTerms(terms) : null;
    var target = anchor ? document.getElementById(anchor) : null;
    if (target) target.scrollIntoView();
    else if (firstMark) firstMark.scrollIntoView({ block: 'center' });
    else el.main.scrollTop = 0;
  }

  // 본문에서 검색어를 찾아 표시한다. 본문에서 처음 걸린 곳을 돌려준다
  function markTerms(terms) {
    var re = new RegExp('(' + terms.map(escRe).join('|') + ')', 'gi');
    var walker = document.createTreeWalker(el.doc, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (n.parentNode.closest('.pager, .foot, .crumbs, .copy, .code-bar')) continue;
      if (re.test(n.nodeValue)) nodes.push(n);
      re.lastIndex = 0;
    }
    var first = null;
    var headerHit = false;
    nodes.forEach(function (n) {
      var text = n.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0;
      text.replace(re, function (m, g, at) {
        frag.appendChild(document.createTextNode(text.slice(last, at)));
        var mk = document.createElement('mark');
        mk.textContent = m;
        frag.appendChild(mk);
        last = at + m.length;
        return m;
      });
      frag.appendChild(document.createTextNode(text.slice(last)));
      var inHeader = n.parentNode.closest('h1, .doc-meta, .lead');
      var firstInNode = frag.querySelector('mark');
      n.parentNode.replaceChild(frag, n);
      if (inHeader) headerHit = true;
      else if (!first) first = firstInNode;
    });
    // 제목이나 요약에 검색어가 있으면 맨 위에 그대로 둔다
    return headerHit ? null : first;
  }

  el.doc.addEventListener('click', function (ev) {
    var b = ev.target.closest('.copy');
    if (!b) return;
    var text = b.closest('.code').querySelector('pre').textContent;
    var done = function (ok) {
      b.textContent = ok ? '복사됨' : '복사 실패';
      setTimeout(function () { b.textContent = '복사'; }, 1400);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else {
      done(fallbackCopy(text));
    }
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* 무시 */ }
    document.body.removeChild(ta);
    return ok;
  }

  /* ---------- 주소(#/id/단락) ---------- */
  function route() {
    // "#/" 로 시작하지 않는 해시는 항목 주소가 아니므로 보던 문서를 그대로 둔다
    if (current && location.hash && location.hash.indexOf('#/') !== 0) return;
    var m =/^#\/([^/?]*)(?:\/([^/?]+))?/.exec(location.hash) || [];
    show(m[1] || ROOT_ID, m[2]);
  }
  window.addEventListener('hashchange', route);
  document.querySelector('.skip').addEventListener('click', function (ev) {
    ev.preventDefault();
    el.main.focus();
  });

  /* ---------- 검색 ---------- */
  var index = null;
  var hits = [];
  var sel = -1;
  var kindFilter = 'all';

  function buildIndex() {
    var box = document.createElement('div');
    index = ORDER.map(function (id) {
      var d = DOCS[id];
      box.innerHTML = d.h;
      return {
        id: id,
        t: d.t.toLowerCase(),
        e: d.e.toLowerCase(),
        k: d.k.toLowerCase().split(/\s*,\s*/),
        s: d.s.toLowerCase(),
        raw: box.textContent.replace(/\s+/g, ' '),
        x: null
      };
    });
    index.forEach(function (it) { it.x = it.raw.toLowerCase(); });
  }

  function count(hay, needle) {
    var n = 0;
    for (var at = hay.indexOf(needle); at !== -1 && n < 12; at = hay.indexOf(needle, at + needle.length)) n++;
    return n;
  }

  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    if (!index) buildIndex();
    var whole = terms.join(' ');
    var out = [];
    index.forEach(function (it, pos) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var s = 0;
        if (it.t.indexOf(term) !== -1) s += 100;
        if (it.e.indexOf(term) !== -1) s += 80;
        for (var j = 0; j < it.k.length; j++) {
          if (it.k[j] === term) { s += 90; break; }
          if (it.k[j].indexOf(term) !== -1) { s += 50; break; }
        }
        if (it.s.indexOf(term) !== -1) s += 25;
        s += count(it.x, term) * 3;
        if (!s) return; // 낱말이 모두 들어 있어야 한다
        score += s;
      }
      if (terms.length > 1) {
        if (it.t.indexOf(whole) !== -1 || it.e.indexOf(whole) !== -1) score += 150;
        else if (it.k.indexOf(whole) !== -1) score += 120;
        else if (it.x.indexOf(whole) !== -1) score += 30;
      } else if (it.t === whole || it.e === whole || it.e.replace(/^rap( bdl)? - /, '') === whole) {
        score += 200;
      }
      out.push({ id: it.id, score: score, pos: pos, it: it });
    });
    out.sort(function (a, b) { return b.score - a.score || a.pos - b.pos; });
    return out;
  }

  function hilite(text, terms) {
    var re = new RegExp('(' + terms.map(escRe).join('|') + ')', 'gi');
    // 먼저 자르고 조각마다 이스케이프한다. 거꾸로 하면 &gt; 안의 gt 까지 걸린다
    return text.split(re).map(function (part, i) {
      return i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part);
    }).join('');
  }

  function snippet(it, d, terms) {
    var at = -1;
    for (var i = 0; i < terms.length && at === -1; i++) at = it.x.indexOf(terms[i]);
    if (at === -1 || it.s.indexOf(terms[0]) !== -1) return d.s || it.raw.slice(0, 110);
    var from = Math.max(0, at - 36);
    return (from ? '…' : '') + it.raw.slice(from, from + 120) + '…';
  }

  function renderResults() {
    var query = el.q.value.trim();
    var searching = query.length > 0;
    el.search.classList.toggle('has-text', el.q.value.length > 0);
    el.clear.hidden = !el.q.value.length;
    el.tree.hidden = el.treeHead.hidden = searching;
    el.results.hidden = el.resultHead.hidden = !searching;
    if (!searching) { hits = []; sel = -1; return; }

    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var all = search(query);
    var counts = { all: all.length, bdl: 0, abap: 0, ex: 0 };
    all.forEach(function (h) { if (counts[DOCS[h.id].g] !== undefined) counts[DOCS[h.id].g]++; });
    hits = kindFilter === 'all' ? all : all.filter(function (h) { return DOCS[h.id].g === kindFilter; });

    el.chips.innerHTML = KIND_FILTERS.map(function (f) {
      return '<button class="chip" type="button" data-kind="' + f[0] + '" aria-pressed="' + (kindFilter === f[0]) + '">' + f[1] + ' ' + counts[f[0]] + '</button>';
    }).join('');
    el.resultCount.textContent = hits.length ? '찾은 항목 ' + hits.length + '개' : '찾은 항목 없음';

    if (!hits.length) {
      el.results.innerHTML = '<p class="empty">"' + esc(query) + '" 이(가) 들어 있는 항목이 없습니다.<br>' +
        '낱말을 줄이거나 영문 키워드로 바꿔 보세요. 예) <b>determination</b>, <b>%tky</b>, <b>draft</b></p>';
      sel = -1;
      return;
    }
    el.results.innerHTML = hits.slice(0, MAX_HITS).map(function (h, i) {
      var d = DOCS[h.id];
      return '<a class="hit" href="#/' + h.id + '" data-i="' + i + '">' +
        '<span class="hit-title"><span>' + hilite(d.t, terms) + '</span></span>' +
        '<span class="hit-en">' + hilite(d.e, terms) + '</span>' +
        '<span class="hit-snip">' + hilite(snippet(h.it, d, terms), terms) + '</span></a>';
    }).join('') + (hits.length > MAX_HITS ? '<p class="empty">앞에서부터 ' + MAX_HITS + '개만 보여 줍니다. 낱말을 더 넣어 좁혀 보세요.</p>' : '');
    el.results.scrollTop = 0;
    select(-1);
  }

  function select(i) {
    var items = el.results.querySelectorAll('.hit');
    if (sel >= 0 && items[sel]) items[sel].classList.remove('sel');
    sel = Math.max(-1, Math.min(i, items.length - 1));
    if (sel >= 0) {
      items[sel].classList.add('sel');
      items[sel].scrollIntoView({ block: 'nearest' });
    }
  }

  function openHit(id) {
    pendingTerms = el.q.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (location.hash === '#/' + id) route(); else location.hash = '#/' + id;
    closeSide();
  }

  var timer = null;
  var stale = false; // 검색어가 바뀌었는데 결과를 아직 다시 그리지 않았다
  el.q.addEventListener('input', function () {
    clearTimeout(timer);
    stale = true;
    timer = setTimeout(function () { stale = false; renderResults(); }, 90);
  });
  el.q.addEventListener('keydown', function (ev) {
    if (ev.isComposing) return; // 한글 조합 중에는 손대지 않는다
    if (ev.key === 'ArrowDown') { ev.preventDefault(); select(sel + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); select(sel - 1); }
    else if (ev.key === 'Enter') {
      // 다시 그리면 ↑↓ 로 고른 항목이 풀리므로, 검색어가 바뀐 때에만 다시 그린다
      if (stale) { clearTimeout(timer); stale = false; renderResults(); }
      var pick = hits[Math.max(sel, 0)];
      if (pick) openHit(pick.id);
    } else if (ev.key === 'Escape') {
      if (el.q.value) { clearSearch(); } else { el.q.blur(); }
    }
  });
  el.results.addEventListener('click', function (ev) {
    var a = ev.target.closest('.hit');
    if (!a) return;
    ev.preventDefault();
    select(+a.dataset.i);
    openHit(hits[+a.dataset.i].id);
  });
  el.chips.addEventListener('click', function (ev) {
    var chip = ev.target.closest('.chip');
    if (!chip) return;
    kindFilter = chip.dataset.kind;
    renderResults();
  });
  function clearSearch() {
    el.q.value = '';
    kindFilter = 'all';
    renderResults();
    revealInTree(current);
  }
  el.clear.addEventListener('click', function () { clearSearch(); el.q.focus(); });

  document.addEventListener('keydown', function (ev) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((ev.key === '/' && !typing) || ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k')) {
      ev.preventDefault();
      if (window.matchMedia('(max-width: 820px)').matches) openSide();
      el.q.focus();
      el.q.select();
    }
  });
  el.q.addEventListener('focus', function () {
    if (el.q.value && window.matchMedia('(max-width: 820px)').matches) openSide();
  });

  /* ---------- 좁은 화면에서 목차 여닫기 ---------- */
  var narrow = window.matchMedia('(max-width: 820px)');
  // 좁은 화면에서 닫힌 목차는 화면 밖에 있으므로 초점도 받지 않게 한다
  function syncSide() { el.side.inert = narrow.matches && !document.body.classList.contains('side-open'); }
  function openSide() { document.body.classList.add('side-open'); el.scrim.hidden = false; el.menu.setAttribute('aria-expanded', 'true'); syncSide(); }
  function closeSide() {
    var hadFocus = el.side.contains(document.activeElement);
    document.body.classList.remove('side-open'); el.scrim.hidden = true; el.menu.setAttribute('aria-expanded', 'false');
    syncSide();
    if (hadFocus && el.side.inert) el.menu.focus();
  }
  if (narrow.addEventListener) narrow.addEventListener('change', syncSide); else narrow.addListener(syncSide);
  syncSide();
  el.menu.addEventListener('click', function () {
    if (document.body.classList.contains('side-open')) closeSide(); else openSide();
  });
  el.scrim.addEventListener('click', closeSide);
  el.q.addEventListener('input', function () {
    if (window.matchMedia('(max-width: 820px)').matches) openSide();
  });

  /* ---------- 목차 너비 조절 ---------- */
  var MIN_W = 220;
  var MAX_W = 640;
  function setWidth(width) {
    width = Math.max(MIN_W, Math.min(MAX_W, Math.round(width)));
    document.documentElement.style.setProperty('--side-w', width + 'px');
    el.grip.setAttribute('aria-valuenow', width);
    return width;
  }
  var savedWidth = parseInt(store.get('sideWidth'), 10);
  if (savedWidth >= MIN_W && savedWidth <= MAX_W) setWidth(savedWidth);
  else el.grip.setAttribute('aria-valuenow', Math.round(el.side.getBoundingClientRect().width) || MIN_W);
  // 키보드로는 ← → 로 조절한다
  el.grip.addEventListener('keydown', function (ev) {
    var step = ev.key === 'ArrowLeft' ? -16 : ev.key === 'ArrowRight' ? 16 : 0;
    if (!step) return;
    ev.preventDefault();
    store.set('sideWidth', String(setWidth(el.side.getBoundingClientRect().width + step)));
  });
  el.grip.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    el.grip.classList.add('dragging');
    el.grip.setPointerCapture(ev.pointerId);
    var width = 0;
    var move = function (e) {
      width = setWidth(e.clientX);
    };
    var up = function () {
      el.grip.classList.remove('dragging');
      el.grip.removeEventListener('pointermove', move);
      el.grip.removeEventListener('pointerup', up);
      if (width) store.set('sideWidth', String(width));
    };
    el.grip.addEventListener('pointermove', move);
    el.grip.addEventListener('pointerup', up);
  });

  route();

  // 첫 검색이 바로 뜨도록, 화면을 그린 뒤 한가할 때 검색용 색인을 미리 만든다
  (window.requestIdleCallback || function (fn) { setTimeout(fn, 800); })(function () {
    if (!index) buildIndex();
  });
})();
