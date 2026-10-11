// 항목 파일 검사 도구
//   node tools/check.mjs              전체 검사 (빠진 항목도 알려 줌)
//   node tools/check.mjs id1 id2 ...  고른 항목만 검사
//   node tools/check.mjs @목록파일     한 줄에 id 하나씩 적힌 파일로 검사
import fs from 'node:fs';
import { loadToc, flattenToc, readTopic, topicExists, splitFences, outsideInlineCode, CODE_LANGS } from './lib.mjs';

const flat = flattenToc(loadToc());
const known = new Set(flat.map((t) => t.id));

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
let ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (ids.length === 1 && ids[0].startsWith('@')) {
  ids = fs.readFileSync(ids[0].slice(1), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
const all = ids.length === 0;
if (all) ids = flat.map((t) => t.id);

let errors = 0;
let missing = 0;
const fail = (id, msg) => {
  errors++;
  console.log(`✗ ${id}: ${msg}`);
};

for (const id of ids) {
  if (!known.has(id)) {
    fail(id, '목차(toc.json)에 없는 id');
    continue;
  }
  const topic = readTopic(id);
  if (topic === null) {
    // 파일은 있는데 읽지 못했으면 전체 검사에서도 오류로 친다
    if (topicExists(id)) fail(id, '머리말(---)이 잘못됨');
    else {
      missing++;
      if (!all) fail(id, '파일이 없음');
    }
    continue;
  }
  const { meta, body } = topic;
  for (const key of ['title', 'summary', 'keywords']) {
    if (!meta[key]) fail(id, `머리말에 ${key} 가 없음`);
  }
  if (meta.summary && meta.summary.length > 160) fail(id, `summary 가 너무 김 (${meta.summary.length}자, 160자 이하)`);

  const parts = splitFences(body);
  if (parts.some((p) => p.unclosed)) fail(id, '닫히지 않은 코드 블록(```)');
  const prose = parts.filter((p) => !p.code).map((p) => p.text).join('\n');
  const hangul = (prose.match(/[가-힣]/g) || []).length;
  if (hangul < 80) fail(id, `한글 설명이 너무 짧음 (한글 ${hangul}자)`);
  for (const p of parts.filter((x) => x.code)) {
    if (!CODE_LANGS.includes(p.lang)) fail(id, `코드 블록 언어 표시가 잘못됨: "${p.lang}" (쓸 수 있는 값: ${CODE_LANGS.join(', ')})`);
    if (!p.text.trim()) fail(id, '빈 코드 블록');
  }
  if (!/^## /m.test(prose)) fail(id, '"## " 로 시작하는 단락 제목이 하나도 없음');
  if (/^# /m.test(prose)) fail(id, '"# " 제목은 쓰지 않음 (제목은 머리말 title 로)');
  for (const m of prose.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    if (!known.has(m[1].trim())) fail(id, `없는 항목으로 가는 연결: [[${m[1]}]]`);
  }
  const unlinked = prose.replace(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, '');
  if (/\[\[\s*(aben|abap)/.test(unlinked)) fail(id, '연결 [[id|보일 글]] 의 보일 글에 "]" 가 들어 있어 연결로 읽히지 않음');
  if (/\(→/.test(prose)) fail(id, '원문 정리본의 "(→id)" 표기가 남아 있음. [[id]] 로 바꿀 것');
  if (/\]\(aben|\]\(abap/.test(prose)) fail(id, '항목 연결은 [[id]] 또는 [[id|보일 글]] 로 쓸 것');
  if (/^(~~~|````)/m.test(prose)) fail(id, '코드 블록은 백틱 세 개(```)로만 감쌀 것');
  let plain = '';
  outsideInlineCode(prose, (part) => ((plain += part), part));
  const tag = /<\/?[A-Za-z][^>\n]*>|<!--/g;
  for (const m of plain.matchAll(tag)) {
    if (!/^<br\s*\/?>$/i.test(m[0])) fail(id, `본문에 HTML 을 직접 쓰지 않음: ${m[0]} (글자로 보이려면 \`코드\` 로 감쌀 것)`);
  }
  const noWiki = plain.replace(/\[\[[^\]]*\]\]/g, '');
  for (const m of noWiki.matchAll(/\]\(\s*([^)\s]+)/g)) {
    if (!/^(#\/|https?:\/\/)/i.test(m[1])) fail(id, `받지 않는 연결 주소: ${m[1]} (#/id 또는 http, https 만)`);
  }
}

const done = ids.length - missing;
console.log(`\n검사한 항목 ${ids.length}개 / 작성된 항목 ${done}개 / 오류 ${errors}건` + (all && missing ? ` / 아직 없는 항목 ${missing}개` : ''));
if (all && missing && flags.includes('--missing')) {
  for (const t of flat) if (readTopic(t.id) === null) console.log('  없음: ' + t.id);
}
process.exit(errors ? 1 : 0);
