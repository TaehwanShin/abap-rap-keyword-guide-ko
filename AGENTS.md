# 작업 안내 (사람·Codex·Claude 공통)

이 저장소는 SAP ABAP 키워드 문서 가운데 **RAP 부분**을 쉬운 한글로 풀어 쓴 참고서 앱이다.
왼쪽에 목차, 오른쪽에 문서, 위쪽에 검색이 있는 **단일 HTML 파일**(`index.html`)로 만들어진다.

## 폴더 구성

| 위치 | 내용 |
| --- | --- |
| `content/toc.json` | 목차. SAP 원문 목차와 같은 순서·구조. `id` 는 원문 파일 이름(확장자 제외) |
| `content/topics/<id>.md` | 항목 하나에 파일 하나. 한글 본문 |
| `src/` | 화면(HTML 틀, CSS, JS). 실행 때 외부 라이브러리 없음 |
| `tools/build.mjs` | 항목 파일을 모아 `index.html` 한 파일로 만든다 |
| `tools/check.mjs` | 항목 파일 형식 검사 |
| `index.html` | 만들어진 결과물. 직접 고치지 말고 `npm run build` 로 다시 만든다 |

## 자주 쓰는 명령

```
npm install          # 처음 한 번 (빌드에 쓰는 marked 설치)
npm run check        # 항목 파일 전체 검사
node tools/check.mjs abenbdl_action abenbdl_static   # 고른 항목만 검사
npm run build        # index.html 다시 만들기
```

본문을 고쳤으면 `npm run check` → `npm run build` 순서로 돌리고 `index.html` 도 함께 커밋한다.

## 항목 파일 형식

파일 이름은 `content/topics/<id>.md`, 인코딩은 UTF-8.

````markdown
---
title: action
summary: 생성·수정·삭제 같은 standard operation 말고, 직접 만든 업무 처리를 entity 에 붙이는 문법입니다.
keywords: action, 액션, static action, factory action, save action
---

## 문법

```syntax
[internal] [static] action ActionName [InputParameter] [OutputParameter];
```

## 설명

...

## 예제

```bdl
action acceptTravel result [1] $self;
```

## 알아두기

- ...

## 관련 항목

- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_factory|factory action]]
````

### 머리말

- `title` : 한글 제목. 키워드가 있으면 괄호 안에 원래 철자를 적는다. 예) `draft 켜기 (with draft)`, `MODIFY ENTITIES 문`
  원문 그대로 쓰는 용어가 곧 제목이면 한글 없이 적어도 된다. 예) `determination`, `validation`
- `summary` : 한 문장, 160자 이하. 목차·검색 결과·하위 항목 목록에 그대로 보인다.
- `keywords` : 쉼표로 나눈 검색어. 원문 키워드(영문 철자 그대로)와 한글 표현을 함께 넣는다.
- 세 값 모두 한 줄로 쓴다. 영어 원제목과 원문 주소는 `toc.json` 에서 자동으로 붙으니 적지 않는다.

### 본문 단락 (이 순서, 필요 없는 단락은 뺀다)

1. `## 문법` — 원문의 문법 틀. 코드 블록 언어는 `syntax`. 대괄호·중괄호·세로줄 표기는 원문 그대로 둔다.
2. `## 설명` — 무엇을 하는 것인지, 언제 쓰는지, 각 선택 항목이 무슨 뜻인지.
3. `## 예제` — 짧고 바로 읽히는 코드. 코드 앞이나 뒤에 한두 문장으로 무엇을 보여 주는지 적는다.
4. `## 알아두기` — 제약, 자주 하는 실수, 함께 쓸 수 없는 조합.
5. `## 관련 항목` — `[[id]]` 목록.

- 제목은 `##` 와 `###` 만 쓴다. `#` 는 쓰지 않는다.
- 다른 항목으로 가는 연결은 `[[id]]` (그 항목의 한글 제목이 자동으로 보임) 또는 `[[id|보일 글]]`.
  `id` 는 `content/toc.json` 에 있는 것만 쓴다.
- 코드 블록 언어 표시는 `abap`, `bdl`, `cds`, `syntax`, `text` 다섯 가지만 쓴다.
- 표, 목록, 굵은 글씨, `짧은 코드` 는 보통 마크다운 그대로 쓴다.

## 글쓰기 규칙

**원문을 문장 단위로 옮겨 적지 않는다.** 원문을 읽고 이해한 내용을 우리말로 새로 쓴다.
문법 틀(키워드 나열)은 사실 정보이므로 그대로 싣고, 설명 글과 예제 코드는 직접 쓴다.
SAP 예제 프로그램의 코드를 통째로 베끼지 않는다. 같은 내용을 아래 공통 예제 모델로 짧게 다시 쓴다.

### 말투

- "~합니다 / ~입니다" 체. 짧은 문장. 한 문장에 한 가지 내용.
- 번역투를 피한다.
  - "~에 의해 ~되어진다" → "~가 ~한다"
  - "~를 가진다 / ~를 갖는다" → "~가 있다"
  - "~하는 것이 가능하다" → "~할 수 있다"
  - "~에 대한", "~의 경우에 있어서", "~를 통해" 를 줄인다.
  - "해당", "상기", "본" 같은 말 대신 그것이 무엇인지 직접 쓴다.
- ABAP·BDL 키워드, 클래스·메서드·타입 이름, `%tky` 같은 구성요소 이름은 **원래 철자 그대로** 코드 글꼴로 쓴다.
- 처음 나오는 낯선 말은 한 번 풀어 준다. 예) "transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)"
- 원문에 없는 내용을 지어내지 않는다. 확실하지 않으면 쓰지 않는다.

### 용어 (문서 전체에서 똑같이 쓴다)

RAP 에서 키워드나 이름으로 내놓는 말은 **원문 그대로** 쓴다. 현장에서도 "managed 냐 unmanaged 냐", "behavior definition" 이라고 말하지 우리말로 옮겨 부르지 않는다.
원문 낱말 뒤의 조사는 한 칸 띄우고, 그 낱말을 소리 내어 읽었을 때의 받침에 맞춘다. 예) `action 을`, `draft 를`, `behavior pool 로`

**1. 원문만 쓰는 말** (우리말로 옮기지 않는다)

| 원문 그대로 | 쓰지 않는 표기 |
| --- | --- |
| managed / unmanaged | 관리형 / 비관리형 |
| draft, draft table, draft action, collaborative draft, exclusive draft | 초안 … |
| projection | 프로젝션 |
| determination, determine action | 결정, 결정 액션 |
| validation | 검증 (값을 "검증한다"처럼 풀어 쓰는 말은 써도 된다) |
| strict mode | 엄격 모드 |
| action, factory action, default factory action, non-factory action, save action | 액션 … |
| function, key function, default values function, recommendation function | 함수 … |
| association, composition, to-parent association, ancestor association, cross-BO association | 연관 관계, 구성 관계 … |
| read-by-association, create-by-association | 연관 관계로 읽기 / 생성 |
| lock master / lock dependent | 잠금 마스터 / 잠금 종속 |
| authorization master / authorization dependent / authorization context | 권한 마스터 / 권한 종속 / 권한 컨텍스트 |
| etag master | ETag 마스터 |
| early numbering / late numbering / internal numbering / external numbering | 이른·늦은·내부·외부 번호 부여 |
| precheck | 사전 점검 |
| augment (동사처럼 쓸 때), augmentation | 보강 |
| side effects | 부수 효과 |
| persistent table | 영구 테이블 |
| additional save / unmanaged save | 추가 저장 / 비관리형 저장 |
| privileged mode | 특권 모드 |
| change documents | 변경 문서 |
| recommendations | 추천 |
| interface, abstract (BDEF 종류) | 인터페이스, 추상 |
| mapping, type mapping | 매핑 |
| readonly, mandatory (필드에 붙는 말) | 읽기 전용, 필수 |
| static, internal, repeatable (action·function 앞) | 정적, 내부, 반복 가능 |
| global, instance (feature control·권한 앞) | 전역, 인스턴스 |
| event, business event | 이벤트, 비즈니스 이벤트 |
| deep parameter, deep table parameter, deep result, deep mapping, deep create | 깊은 매개변수, 깊은 테이블 매개변수, 깊은 결과 … |
| flat / deep (parameter, structure, table, type 앞) | 평평한·평면·납작한 / 깊은 |

**2. 원문(한글) 꼴로 쓰는 말**

한 항목의 본문에서 처음 나올 때만 `behavior pool(동작 풀)` 처럼 괄호에 한글을 달고, 그 뒤로는 원문만 쓴다.
제목(`title`), 요약(`summary`), 단락 제목(`##`), 코드 주석, 연결 글(`[[id|글]]`)에는 괄호를 달지 않고 원문만 쓴다.
괄호 바로 뒤의 조사는 한글에 맞춘다. 예) `feature control(기능 제어)를`

| 원문 | 괄호에 다는 한글 |
| --- | --- |
| behavior definition (BDEF) | 동작 정의 |
| behavior pool (ABP) | 동작 풀 |
| behavior implementation | 동작 구현 |
| feature control | 기능 제어 |
| authorization control | 권한 제어 |
| field characteristics | 필드 특성 |
| standard operation / non-standard operation | 표준 작업 / 비표준 작업 |
| BDEF derived type | BDEF 파생 타입 |
| transactional buffer | 트랜잭션 버퍼 |
| interaction phase | 상호작용 단계 |
| save sequence, early save phase, late save phase | 저장 순서, 이른 저장 단계, 늦은 저장 단계 |
| active | 활성 ("활성화한다"는 그대로 쓴다) |
| entity, root entity, child entity, parent entity, leaf entity, custom entity | 엔터티, 루트·자식·부모·리프·사용자 정의 엔터티 |
| handler method / saver method | 핸들러 메서드 / 세이버 메서드 |
| handler class / saver class | 핸들러 클래스 / 세이버 클래스 |
| response parameter | 응답 매개변수 (`failed`, `mapped`, `reported`) |
| base BO / base BDEF | 기반 BO / 기반 BDEF |
| extension | 확장 ("기능을 확장한다"처럼 풀어 쓰는 말은 그대로 쓴다) |
| extensibility | 확장 허용 |
| transition message | 전이 메시지 |
| service definition / service binding | 서비스 정의 / 서비스 바인딩 |
| business object (RAP BO) | 비즈니스 객체 |
| RAP BO provider / RAP BO consumer | RAP BO 제공자 / RAP BO 사용자 (화면을 쓰는 사람은 그냥 "사용자") |

**3. 우리말로 쓰는 말** (설명에 쓰는 보통 말)

| 원문 | 한글 표기 |
| --- | --- |
| entity instance | entity 인스턴스 (줄여서 인스턴스) |
| lock / authorization (단독으로) | 잠금 / 권한 |
| create / update / delete / read | 생성 / 수정 / 삭제 / 읽기 |
| component / component group | 구성요소 / 구성요소 묶음 |
| input / output parameter | 입력 / 출력 매개변수 |
| header | 머리말 |
| ETag | ETag (동시 수정 확인용 값) |
| (short) dump / runtime error | 런타임 오류 |
| syntax error / warning | 문법 오류 / 문법 경고 |
| addition | 추가 구문 |
| statement | 문 (예: `MODIFY ENTITIES` 문) |
| EML, CDS, OData, CRUD, LUW | 굳어진 약어는 그대로 |

검색어(`keywords`)에는 옛 한글 표기를 남겨 둔다. 화면에는 보이지 않고, 한글로 찾아도 걸리게 하려는 것이다.

### 공통 예제 모델

예제 코드는 아래 이름을 쓴다. 필요하면 필드나 action 을 보태도 된다.

- root entity `ZR_Travel` (별칭 `Travel`), child entity `ZR_Booking` (별칭 `Booking`), composition `_Booking`, to-parent association `_Travel`
- persistent table `ztravel`, `zbooking` / draft 테이블 `ztravel_d`, `zbooking_d`
- projection `ZC_Travel`, `ZC_Booking` / interface `ZI_Travel`
- behavior pool `zbp_r_travel`, handler class `lhc_travel`, saver class `lsc_travel`
- 필드: `TravelID`, `AgencyID`, `CustomerID`, `BeginDate`, `EndDate`, `TotalPrice`, `CurrencyCode`, `Status`, `LastChangedAt`
- 테이블 열: `travel_id`, `agency_id`, `customer_id`, `begin_date`, `end_date`, `total_price`, `currency_code`, `status`, `last_changed_at`
- 예제는 그 항목의 문법만 보이게 줄여 쓴다. `mapping for` 와 키 필드의 `readonly` 특성은 그 항목의 주제가 아니면 줄인다.
  줄이지 않은 완성 모델은 첫 항목(`abenabap_rap`)의 "이 참고서의 예제 읽는 법"에 있다. 모델을 바꾸면 그곳도 함께 고친다.
- ABAP 코드에서 키워드는 대문자, 직접 지은 이름은 소문자(`lt_travel`, `ls_failed`)로 쓴다. 최신 문법(인라인 선언, `VALUE #( )`)을 쓴다.
- 주석은 한글로 단다.

## 화면 코드를 고칠 때

- `src/app.js`, `src/style.css`, `src/template.html` 을 고친 뒤 `npm run build`.
- 결과물은 인터넷 없이 `index.html` 을 두 번 눌러 열어도 돌아가야 한다. 실행 때 외부 주소에서 무엇도 불러오지 않는다.
