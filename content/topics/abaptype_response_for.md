---
title: TYPE RESPONSE FOR (응답 구조 타입)
summary: response parameter failed, mapped, reported 의 타입으로, RAP BO 의 entity 마다 내부 테이블을 하나씩 품은 깊은 구조입니다.
keywords: TYPE RESPONSE FOR, RESPONSE FOR FAILED, RESPONSE FOR MAPPED, RESPONSE FOR REPORTED, EARLY, LATE, failed, mapped, reported, 응답 매개변수, 응답 구조, BDEF 파생 타입, ABP_BEHV_RESPONSE_TAB
---

## 문법

```syntax
... RESPONSE FOR { FAILED
                 | MAPPED
                 | REPORTED
                   { [EARLY | LATE] }
                   bdef } ...
```

## 설명

`TYPE RESPONSE FOR` 는 RAP 응답을 주고받는 데 쓰는 BDEF derived type(BDEF 파생 타입)입니다. response parameter(응답 매개변수) `failed`, `mapped`, `reported` 와, EML 문에서 응답을 받는 변수가 이 타입입니다.

이 타입은 **깊은 구조**입니다. RAP BO 의 entity(엔터티)마다 내부 테이블이 구성요소로 하나씩 들어 있습니다. 그래서 RAP BO 전체의 응답을 한 번에 넘기고 받을 수 있습니다. `bdef` 자리에는 RAP BO root entity(루트 엔터티)의 이름을 적습니다.

| 종류 | 담는 내용 |
| --- | --- |
| `FAILED` | 작업이 실패한 인스턴스 |
| `MAPPED` | 새로 만든 인스턴스의 `%cid` 와 키를 짝지은 정보 |
| `REPORTED` | 인스턴스에 딸린 메시지 |

### EARLY 와 LATE

- `EARLY` : interaction phase(상호작용 단계)에서 나오는 응답입니다. 아무것도 적지 않으면 `EARLY` 로 봅니다. 예를 들어 `TYPE RESPONSE FOR FAILED` 로 선언하면 저절로 `TYPE RESPONSE FOR FAILED EARLY` 가 됩니다.
- `LATE` : save sequence(저장 순서)에서 나오는 응답입니다. 다음 두 경우에만 쓸 수 있습니다.
  - RAP BO 에 late numbering 이 정의되어 있을 때
  - `COMMIT ENTITIES RESPONSE OF` 문을 쓸 때. 이 문에서 응답을 받는 변수는 `LATE` 를 붙인 타입이어야 합니다.

### 쓰이는 곳

**handler method(핸들러 메서드)와 saver method(세이버 메서드)의 response parameter.** `mapped`, `failed`, `reported` 는 behavior pool(동작 풀)에서 선언하지 않아도 쓸 수 있습니다. 직접 적을 수도 있습니다. 이때는 범용 타입 `DATA` 로 적고, 실행 시점에 `TYPE RESPONSE FOR ...` 타입이 됩니다.

```abap
METHODS create FOR MODIFY
  IMPORTING entities FOR CREATE travel
  CHANGING  failed   TYPE DATA
            mapped   TYPE DATA
            reported TYPE DATA.
```

**EML 문의 `MAPPED`, `FAILED`, `REPORTED` 뒤에 적는 변수.** 동적이 아닌 EML 문에서 이 변수가 `TYPE RESPONSE FOR` 타입입니다. EML 문 때문에 behavior pool 의 메서드가 불리면 그 응답이 여기에 담깁니다. `FAILED FINAL(ls_failed)` 처럼 인라인으로 선언해도 같은 타입이 됩니다. 동적 EML 문에서는 `ABP_BEHV_RESPONSE_TAB` 타입의 내부 테이블을 씁니다([[abapeml_responses_dyn]]).

**ABAP 프로그램의 변수와 타입 선언.** `DATA` 나 `TYPES` 에 그대로 쓸 수 있습니다.

### 안에 든 내부 테이블

안에 든 내부 테이블은 `TYPE TABLE FOR` 타입이고, 구조에 `EARLY` 나 `LATE` 를 붙였으면 테이블에도 같은 것이 붙습니다.

| 응답 구조 | 쓰임 | 안에 든 테이블의 타입 | 테이블의 구성요소 |
| --- | --- | --- | --- |
| `TYPE RESPONSE FOR FAILED [EARLY]`<br>`TYPE RESPONSE FOR FAILED LATE` | interaction phase 에서 작업이 실패한 인스턴스를 기록합니다. `LATE` 는 저장 단계에서 기록합니다. | `TYPE TABLE FOR FAILED [EARLY]`<br>`TYPE TABLE FOR FAILED LATE` | `%action`, `%assoc`, `%cid`, `%create`, `%delete`, `%fail`, `%key`, `%op`, `%pky`, `%tky`, `%update` |
| `TYPE RESPONSE FOR MAPPED [EARLY]`<br>`TYPE RESPONSE FOR MAPPED LATE` | `MODIFY` 계열 변경 작업에서 새로 만든 인스턴스의 키를 `%cid` 와 짝지어 돌려줍니다. 뒤따르는 작업은 모두 여기서 받은 키를 써야 합니다. | `TYPE TABLE FOR MAPPED [EARLY]`<br>`TYPE TABLE FOR MAPPED LATE` | `EARLY` : `%cid`, `%key`, `%pky`, `%tky`<br>`LATE` : `%key`, `%pre`, `%tmp` |
| `TYPE RESPONSE FOR REPORTED [EARLY]`<br>`TYPE RESPONSE FOR REPORTED LATE` | 특정 인스턴스에 딸린 메시지를 돌려줍니다. 예를 들어 interaction phase 에서 실패한 인스턴스의 메시지입니다. `LATE` 는 저장 단계에서 돌려줍니다. | `TYPE TABLE FOR REPORTED [EARLY]`<br>`TYPE TABLE FOR REPORTED LATE` | `%cid`, `%element`, `%global`, `%key`, `%msg`, `%pky`, `%state_area`, `%tky` |

구성요소는 조건에 따라 달라집니다.

- `FAILED LATE` 와 `REPORTED LATE` 테이블에는 `%cid` 가 없습니다.
- late numbering 이 정의된 BO 에서는 `%pid` 가 더 있습니다. `MAPPED` 는 `EARLY` 와 `LATE` 모두에 있습니다.
- draft 를 쓰는 BO 에서는 `%is_draft` 가 더 있습니다. `MAPPED` 는 `EARLY` 에만 있습니다.

`MAPPED` 는 기본적으로 interaction phase 에서 mapping 정보를 줍니다. 이때는 `%cid` 를 실제 키나 `%pid` 에 짝짓습니다. `LATE` 를 붙이면 mapping 정보를 저장할 때에야 받을 수 있고, 저장 단계에서는 `%pid` 를 실제 키에 짝짓습니다.

## 예제

응답 구조를 직접 선언해서 EML 문에 넘기고, entity 별 내부 테이블을 읽습니다.

```abap
DATA ls_failed   TYPE RESPONSE FOR FAILED   zr_travel.
DATA ls_mapped   TYPE RESPONSE FOR MAPPED   zr_travel.
DATA ls_reported TYPE RESPONSE FOR REPORTED zr_travel.

MODIFY ENTITIES OF zr_travel
  ENTITY Travel
    CREATE FIELDS ( travelid agencyid customerid )
      WITH VALUE #( ( %cid = 'cid1' travelid = '00000001'
                      agencyid = '070001' customerid = '000010' ) )
  FAILED   ls_failed
  MAPPED   ls_mapped
  REPORTED ls_reported.

" entity 마다 내부 테이블이 하나씩 있다: ls_failed-travel, ls_failed-booking
LOOP AT ls_failed-travel INTO DATA(ls_failed_travel).
  DATA(lv_cause) = ls_failed_travel-%fail-cause.
ENDLOOP.

" 저장 단계의 응답은 LATE 타입으로 받는다
DATA ls_failed_late   TYPE RESPONSE FOR FAILED   LATE zr_travel.
DATA ls_reported_late TYPE RESPONSE FOR REPORTED LATE zr_travel.

COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED   ls_failed_late
  REPORTED ls_reported_late.
```

## 알아두기

- ADT 디버거의 변수 탭에서 이 타입의 변수를 펼치면, composition 트리에 있는 entity 마다 내부 테이블이 하나씩 보입니다.
- 구성요소 하나하나의 뜻은 [[abapderived_types_comp]] 에 있습니다.
- RAP BO provider(제공자) 구현에서 response parameter 를 다루는 규칙은 SAP 의 RAP 개발 안내서 가운데 "General RAP BO Implementation Contract" 부분에 있습니다.

## 관련 항목

- [[abapeml_response]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abapderived_types_comp]]
- [[abapemlcommit_entities_long]]
- [[abenbdl_late_numbering]]
- [[abeneml_responses_2_abexa]]
- [[abeneml_responses_abexa]]
