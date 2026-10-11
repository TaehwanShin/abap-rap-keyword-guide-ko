// 목차(toc.json)와 항목 파일(content/topics/*.md)을 읽는 공통 함수
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TOPIC_DIR = path.join(ROOT, 'content', 'topics');
export const CODE_LANGS = ['abap', 'bdl', 'cds', 'syntax', 'text'];

export function loadToc() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'toc.json'), 'utf8'));
}

// 목차를 위에서 아래로 훑어 [{id, en, slug, parent, depth}] 로 편다
export function flattenToc(toc) {
  const out = [];
  (function walk(node, parent, depth) {
    out.push({ id: node.id, en: node.en, slug: node.slug, parent, depth, children: (node.c || []).map((c) => c.id) });
    for (const c of node.c || []) walk(c, node.id, depth + 1);
  })(toc, null, 0);
  return out;
}

// 머리말(--- 사이의 "이름: 값" 줄)과 본문을 나눈다
export function parseTopic(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

export function topicExists(id) {
  return fs.existsSync(path.join(TOPIC_DIR, id + '.md'));
}

// 파일이 없어도, 머리말이 깨져 읽지 못해도 null 이다. 둘을 가리려면 topicExists 를 함께 본다
export function readTopic(id) {
  if (!topicExists(id)) return null;
  return parseTopic(fs.readFileSync(path.join(TOPIC_DIR, id + '.md'), 'utf8'));
}

// 글에서 `짧은 코드` 를 뺀 나머지에만 fn 을 적용한다
export function outsideInlineCode(text, fn) {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(/(`+)[\s\S]*?\1/g)) {
    out += fn(text.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + fn(text.slice(last));
}

// 본문을 코드 블록과 그 밖의 글로 나눈다: [{code: bool, lang, text}]
export function splitFences(body) {
  const parts = [];
  const lines = body.split(/\r?\n/);
  let buf = [];
  let lang = null;
  for (const line of lines) {
    const fence = /^```\s*([\w-]*)\s*$/.exec(line);
    if (fence && lang === null) {
      parts.push({ code: false, text: buf.join('\n') });
      buf = [];
      lang = fence[1] || '';
    } else if (fence && lang !== null) {
      parts.push({ code: true, lang, text: buf.join('\n') });
      buf = [];
      lang = null;
    } else {
      buf.push(line);
    }
  }
  parts.push({ code: lang !== null, lang: lang || '', text: buf.join('\n'), unclosed: lang !== null });
  return parts;
}
