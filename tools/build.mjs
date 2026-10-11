// content/ 의 목차와 항목 파일을 모아 index.html 한 파일로 만든다
//   node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { ROOT, loadToc, flattenToc, readTopic, topicExists, splitFences, outsideInlineCode } from './lib.mjs';
import { highlight } from './highlight.mjs';

const SOURCE_BASE = 'https://help.sap.com/docs/abap-cloud/abap-keyword/';
const LANG_LABEL = { abap: 'ABAP', bdl: 'BDL', cds: 'CDS', syntax: '문법', text: '' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toc = loadToc();
const flat = flattenToc(toc);
const byId = new Map(flat.map((t) => [t.id, t]));
const warnings = [];

// 항목의 갈래: 목차에서 어느 가지에 있는지로 정한다
function kindOf(id) {
  if (/_abexas?$/.test(id)) return 'ex';
  for (let cur = byId.get(id); cur; cur = byId.get(cur.parent)) {
    if (cur.id === 'abencds_bdef') return 'bdl';
    if (cur.id === 'abenabap_for_rap_bos') return 'abap';
  }
  return 'etc';
}

const topics = new Map();
for (const t of flat) {
  const topic = readTopic(t.id);
  if (topic === null && topicExists(t.id)) {
    console.error(`✗ ${t.id}: 머리말(---)을 읽지 못함. npm run check 로 확인할 것`);
    process.exit(1);
  }
  if (topic === null) warnings.push(`아직 없는 항목: ${t.id}`);
  topics.set(t.id, topic);
}
const titleOf = (id) => topics.get(id)?.meta.title || byId.get(id).en;

// [[id]] 와 [[id|보일 글]] 을 보통 마크다운 연결로 바꾼다 (코드 블록과 `짧은 코드` 밖에서만)
function resolveLinks(text, fromId, linked) {
  return outsideInlineCode(text, (plain) => plain.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (all, rawId, label) => {
    const id = rawId.trim();
    if (!byId.has(id)) {
      warnings.push(`${fromId}: 없는 항목으로 가는 연결 [[${id}]]`);
      return label || id;
    }
    linked.add(id);
    const shown = (label || titleOf(id)).replace(/([\[\]])/g, '\\$1');
    return `[${shown}](#/${id})`;
  }));
}

// 원문의 문법 틀은 이어지는 줄을 스무 칸 가까이 들여 쓴다. 좁은 화면에서도 읽히도록 두 칸으로 당긴다
function pullLeft(code) {
  const lines = code.split('\n');
  const indents = lines.map((l) => (l.trim() ? /^ */.exec(l)[0].length : 0)).filter((n) => n > 0);
  const least = indents.length ? Math.min(...indents) : 0;
  if (least <= 4) return code;
  return lines.map((l) => (l.startsWith(' ') ? l.slice(least - 2) : l)).join('\n');
}

function renderBody(id, body) {
  const linked = new Set();
  const source = splitFences(body)
    .map((p) => (p.code ? '```' + p.lang + '\n' + p.text + '\n```' : resolveLinks(p.text, id, linked)))
    .join('\n');

  let headingNo = 0;
  const outline = [];
  const renderer = {
    code({ text, lang }) {
      const language = (lang || 'text').trim();
      if (language === 'syntax') text = pullLeft(text);
      const label = LANG_LABEL[language] ?? '';
      return `<div class="code code-${esc(language)}"><div class="code-bar"><span>${label}</span></div><pre><code>${highlight(text, language)}</code></pre></div>\n`;
    },
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      const level = Math.min(Math.max(depth, 2), 4);
      const anchor = `s${++headingNo}`;
      if (level === 2) outline.push([anchor, inner.replace(/<[^>]+>/g, '')]);
      return `<h${level} id="${anchor}">${inner}</h${level}>\n`;
    },
    // 긴 코드에만 표시를 달아, 표 안에서 짧은 코드는 중간에 줄이 바뀌지 않게 한다 (text 는 이미 이스케이프된 글)
    codespan({ text }) {
      return `<code${text.length > 30 ? ' class="lg"' : ''}>${text}</code>`;
    },
    // 본문에 직접 적은 HTML 은 줄바꿈(<br>)만 살리고 나머지는 글자로 보여 준다 (스크립트가 끼어들지 못하게)
    html({ text }) {
      return /^<br\s*\/?>$/i.test(text.trim()) ? '<br>' : esc(text);
    },
    // 연결은 이 문서 안(#/id)과 웹 주소(http, https)만 받는다
    link({ href, tokens }) {
      const inner = this.parser.parseInline(tokens);
      if (!/^(#\/|https?:\/\/)/i.test(href)) {
        warnings.push(`${id}: 받지 않는 연결 주소 (${href})`);
        return inner;
      }
      return `<a href="${esc(href)}">${inner}</a>`;
    },
    image({ text }) {
      warnings.push(`${id}: 본문 그림은 쓰지 않음 (${text})`);
      return esc(text);
    },
  };
  const md = new Marked({ gfm: true, renderer });
  const html = md
    .parse(source)
    .replace(/<table>([\s\S]*?)<\/table>/g, (all, rows) => {
      // 첫 칸이 빈 줄은 윗줄에 딸린 줄이다. 윗줄과 붙여 보이도록 표시한다
      const inner = rows.replace(/<tr>(\s*<td[^>]*><\/td>)/g, '<tr class="sub">$1');
      const cols =(/<thead>[\s\S]*?<\/thead>/.exec(inner)?.[0].match(/<th[ >]/g) || []).length;
      if (cols < 6) return `<div class="tbl"><table>${inner}</table></div>`;
      // 열이 여섯 개 넘는 표는 글자와 여백을 줄인다. 릴리스 번호처럼 숫자만 있는 칸은 줄이 바뀌지 않게 표시한다
      const body = inner.replace(/<td>([\s\S]*?)<\/td>/g, (cell, text) => {
        const lines = text.split(/<br\s*\/?>/).map((l) => l.replace(/<[^>]+>/g, '').trim());
        return lines.every((l) => /^[-\d.]+$/.test(l)) ? `<td class="tight">${text}</td>` : cell;
      });
      return `<div class="tbl"><table class="wide">${body}</table></div>`;
    });
  return { html, outline, linked };
}

const docs = {};
for (const t of flat) {
  const topic = topics.get(t.id);
  const doc = { e: t.en, u: SOURCE_BASE + t.slug, g: kindOf(t.id) };
  if (topic) {
    const { html, outline, linked } = renderBody(t.id, topic.body);
    doc.t = topic.meta.title || t.en;
    doc.s = topic.meta.summary || '';
    doc.k = topic.meta.keywords || '';
    doc.h = html;
    doc.o = outline;
    // 본문에서 이미 연결한 하위 항목은 "하위 항목" 목록에서 뺀다
    doc.c = t.children.filter((c) => !linked.has(c));
  } else {
    doc.t = t.en;
    doc.s = '';
    doc.k = '';
    doc.h = '<p class="todo">아직 한글 본문이 없는 항목입니다. 위의 원문 연결로 SAP 문서를 확인하세요.</p>';
    doc.o = [];
    doc.c = t.children;
  }
  docs[t.id] = doc;
}

const tree = (function slim(node) {
  return node.c ? { id: node.id, c: node.c.map(slim) } : { id: node.id };
})(toc);

const data = { built: new Date().toISOString().slice(0, 10), tree, order: flat.map((t) => t.id), docs };
// </script> 가 중간에 끼지 않도록 < 를 풀어 쓴다
const chr = String.fromCharCode;
const json = JSON.stringify(data).split('<').join(chr(92) + 'u003c').split(chr(0x2028)).join('').split(chr(0x2029)).join('');

const read = (name) => fs.readFileSync(path.join(ROOT, 'src', name), 'utf8');
const html = read('template.html')
  .replace('/*__CSS__*/', () => read('style.css'))
  .replace('/*__JS__*/', () => read('app.js'))
  .replace('__DATA__', () => json);

fs.writeFileSync(path.join(ROOT, 'index.html'), html);

const written = flat.filter((t) => topics.get(t.id)).length;
for (const w of warnings.slice(0, 40)) console.log('! ' + w);
if (warnings.length > 40) console.log(`! ... 그 밖에 ${warnings.length - 40}건`);
console.log(`index.html 만듦: 항목 ${written}/${flat.length}개, ${(html.length / 1024).toFixed(0)} KB, 경고 ${warnings.length}건`);
