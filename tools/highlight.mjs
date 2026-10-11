// 코드 블록에 색을 입힌다 (빌드할 때 한 번만 돌고, 화면에서는 돌지 않는다)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

const words = (s) => new Set(s.trim().split(/\s+/));

const BDL_KEYWORDS = words(`
  managed unmanaged abstract projection interface extension implementation in class unique strict
  define behavior for alias persistent table draft lock master dependent by authorization etag total
  with additional save late early numbering create update delete read field readonly mandatory
  features instance global precheck internal static factory action function result parameter
  selective deep entity determination validation on modify association mapping corresponding control
  except use extend foreign event node hierarchy external default repeatable none standard query
  changedocuments cascade context privileged disable allowed scope side effects affects messages
  permissions of own ancestor collaborative determine prepare activate discard edit resume optimized
  using redefine private provider contract transactional_query transactional_interface augment
  suppress extensible auth all fields link type inheriting from cleanup finalize adjustnumbers
  adjust numbers and always response request subscribe to events extensibility enabled
  ignore warning info flags abbreviation element include self permission new
`);

const CDS_KEYWORDS = words(`
  define root view entity as select from projection on provider contract transactional_query
  transactional_interface composition of association to parent redirected key where join inner left
  outer right cross and or not case when then else end cast abstract custom with parameters extend
  union all distinct group by having exists null is like between virtual localized type table
  function hierarchy returns implemented method one many exact default filter child
`);

// 한 번에 하나씩 맨 앞 토막을 떼어 내는 간단한 토막내기
function tokenize(code, rules) {
  let out = '';
  let rest = code;
  let atLineStart = true;
  while (rest.length) {
    let hit = null;
    for (const [re, cls, cond] of rules) {
      if (cond === 'bol' && !atLineStart) continue;
      const m = re.exec(rest);
      if (m && m.index === 0 && m[0].length) {
        hit = [m[0], typeof cls === 'function' ? cls(m[0]) : cls];
        break;
      }
    }
    if (!hit) hit = [rest[0], null];
    out += hit[1] ? span(hit[1], hit[0]) : esc(hit[0]);
    atLineStart = hit[0].endsWith('\n');
    rest = rest.slice(hit[0].length);
  }
  return out;
}

const ABAP_RULES = [
  [/^\*[^\n]*/, 'c', 'bol'],
  [/^"[^\n]*/, 'c'],
  [/^'(?:[^'\n]|'')*'/, 's'],
  [/^`(?:[^`\n]|``)*`/, 's'],
  [/^\|[^|\n]*\|/, 's'],
  [/^%[A-Za-z_][A-Za-z0-9_]*/, 'p'],
  [/^[A-Za-z_][A-Za-z0-9_]*(?:-[A-Z]+\b)*/, (w) => (/^[A-Z]{2,}(?:-[A-Z]+)*$/.test(w) ? 'k' : null)],
  [/^\d+/, 'n'],
  [/^\s+/, null],
];

const cStyleRules = (keywords) => [
  [/^\/\/[^\n]*/, 'c'],
  [/^\/\*[\s\S]*?\*\//, 'c'],
  [/^'(?:[^'\n]|'')*'/, 's'],
  [/^@[A-Za-z_][\w.]*/, 'a'],
  [/^\$[A-Za-z_]\w*/, 'k'],
  [/^%[A-Za-z_]\w*/, 'p'],
  [/^[A-Za-z_]\w*/, (w) => (keywords.has(w) ? 'k' : null)],
  [/^\d+/, 'n'],
  [/^\s+/, null],
];

// 문법 틀: ABAP 꼴(대문자 = 키워드, 자리표시는 소문자)인지 BDL 꼴(소문자 = 키워드, 자리표시는 ActionName 처럼 섞어 쓴 이름)인지 가린다.
// 대문자 낱말이 섞어 쓴 이름보다 많으면 ABAP 꼴로 본다
function syntaxRules(code) {
  const count = (re) => (code.match(re) || []).length;
  const abapStyle = count(/(?<![A-Za-z_%$])[A-Z]{3,}(?![A-Za-z_])/g) > count(/(?<![A-Za-z_%$])[A-Z][a-z]+[A-Za-z0-9]*/g);
  const word = abapStyle
    ? (w) => (/^[A-Z][A-Z0-9_]*(?:-[A-Z]+)*$/.test(w) ? 'k' : 'v')
    : (w) => (/[A-Z]/.test(w) ? 'v' : 'k');
  return [
    [/^\/\/[^\n]*/, 'c'],
    [/^"[^\n]*/, 'c'],
    [/^'(?:[^'\n]|'')*'/, 's'],
    [/^\.\.\./, 'm'],
    [/^[\[\]{}|]/, 'm'],
    [/^%[A-Za-z_]\w*/, 'p'],
    [/^\$[A-Za-z_]\w*/, 'k'],
    [/^[A-Za-z_][A-Za-z0-9_]*(?:-[A-Za-z]+)*/, word],
    [/^\s+/, null],
  ];
}

export function highlight(code, lang) {
  switch (lang) {
    case 'abap':
      return tokenize(code, ABAP_RULES);
    case 'bdl':
      return tokenize(code, cStyleRules(BDL_KEYWORDS));
    case 'cds':
      return tokenize(code, cStyleRules(CDS_KEYWORDS));
    case 'syntax':
      return tokenize(code, syntaxRules(code));
    default:
      return esc(code);
  }
}
