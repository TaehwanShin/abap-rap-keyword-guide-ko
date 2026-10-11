---
title: response parameter - 동적이 아닌 EML 문
summary: 짧은 꼴과 긴 꼴 EML 문에서 FAILED, MAPPED, REPORTED 뒤에 적는 구조의 타입(TYPE RESPONSE FOR)과 그 안의 테이블, 구성요소를 설명합니다.
keywords: response_param, 응답 매개변수, FAILED, MAPPED, REPORTED, TYPE RESPONSE FOR, TYPE RESPONSE FOR FAILED, TYPE RESPONSE FOR MAPPED, TYPE RESPONSE FOR REPORTED, EARLY, LATE, TYPE TABLE FOR, %cid, %tky, %pid, %msg, %fail
---

## 문법

```syntax
... [FAILED failed_resp]
    [MAPPED mapped_resp]
    [REPORTED reported_resp] ...
```

## 설명

동적이 아닌 꼴, 곧 짧은 꼴이나 긴 꼴의 EML 문(예: [[abapmodify_entity_short|MODIFY ENTITY]], [[abapmodify_entities_long|MODIFY ENTITIES]])에서 응답을 받는 방법입니다. 세 가지를 쓸 수 있는 문이라면 함께 써도 됩니다.

`failed_resp`, `mapped_resp`, `reported_resp` 는 **deep structure**(안에 내부 테이블이 든 구조)입니다. BDEF derived type(BDEF 파생 타입) [[abaptype_response_for|TYPE RESPONSE FOR]] 로 선언해야 합니다. `DATA( )` 나 `FINAL( )` 로 그 자리에서 선언해도 됩니다.

이 구조 안에는 RAP BO 의 entity(엔터티)마다 내부 테이블이 하나씩 들어 있습니다. 그래서 BO 의 모든 entity 에 걸친 정보를 한 번에 받을 수 있습니다. 예를 들어 `ls_failed-travel`, `ls_failed-booking` 처럼 읽습니다.

안에 든 내부 테이블의 타입은 [[abaptype_table_for|TYPE TABLE FOR]] 이고, 상황에 따라 `EARLY` 나 `LATE` 가 붙습니다.

- `EARLY` 가 기본입니다. 적지 않아도 `EARLY` 입니다. `TYPE RESPONSE FOR FAILED` 로 선언하면 저절로 `TYPE RESPONSE FOR FAILED EARLY` 가 됩니다.
- `LATE` 는 다음 두 경우에만 쓸 수 있습니다.
  - RAP BO 에 [[abenbdl_late_numbering|late numbering]] 이 정의되어 있을 때
  - [[abapemlcommit_entities_long|COMMIT ENTITIES RESPONSE OF]] 문을 쓸 때. 응답을 받는 변수를 `LATE` 를 붙인 타입으로 선언해야 합니다.

### 응답 구조의 종류

**FAILED** — interaction phase(상호작용 단계)에서 작업이 실패한 인스턴스를 기록합니다. `LATE` 를 붙이면 저장 단계에서 나온 기록입니다.

| 구조 타입 | 안에 든 테이블 타입 |
| --- | --- |
| `TYPE RESPONSE FOR FAILED` | `TYPE TABLE FOR FAILED` |
| `TYPE RESPONSE FOR FAILED EARLY` | `TYPE TABLE FOR FAILED EARLY` |
| `TYPE RESPONSE FOR FAILED LATE` | `TYPE TABLE FOR FAILED LATE` |

테이블의 구성요소: `%action`, `%assoc`, `%cid`, `%create`, `%delete`, `%fail`, `%key`, `%op`, `%pky`, `%tky`, `%update`

- `LATE` 테이블에는 `%cid` 가 없습니다.
- BO 에 `late numbering` 이 정의되어 있으면 `%pid` 가 있습니다.
- draft 를 쓰는 BO 에서는 `%is_draft` 가 있습니다.

**MAPPED** — 수정 작업에서, 새로 만든 인스턴스의 키 값을 요청에 넣은 내용 ID(`%cid`)와 짝지어 돌려줍니다. 그 뒤에 이어지는 작업은 모두 이 짝지어진 키를 써야 합니다.

mapping 정보는 기본으로 interaction phase 에서 나옵니다. 이때 `%cid` 가 실제 키나 `%pid` 와 짝지어집니다. `LATE` 를 붙이면 mapping 정보가 저장할 때에야 나온다는 뜻입니다. 저장 단계에서는 `%pid` 가 실제 키와 짝지어집니다.

| 구조 타입 | 안에 든 테이블 타입 |
| --- | --- |
| `TYPE RESPONSE FOR MAPPED` | `TYPE TABLE FOR MAPPED` |
| `TYPE RESPONSE FOR MAPPED EARLY` | `TYPE TABLE FOR MAPPED EARLY` |
| `TYPE RESPONSE FOR MAPPED LATE` | `TYPE TABLE FOR MAPPED LATE` |

- 추가 구문이 없거나 `EARLY` 인 테이블의 구성요소: `%cid`, `%key`, `%pky`, `%tky`
- `LATE` 인 테이블의 구성요소: `%key`, `%pre`, `%tmp`
- BO 에 `late numbering` 이 정의되어 있으면 어느 쪽이든 `%pid` 가 있습니다.
- draft 를 쓰는 BO 에서 `%is_draft` 는 `EARLY` 쪽에만 있습니다.

**REPORTED** — 특정 인스턴스에 얽힌 메시지를 돌려줍니다. 예를 들어 interaction phase 에서 실패한 인스턴스의 메시지입니다. `LATE` 를 붙이면 저장 단계에서 나온 메시지입니다.

| 구조 타입 | 안에 든 테이블 타입 |
| --- | --- |
| `TYPE RESPONSE FOR REPORTED` | `TYPE TABLE FOR REPORTED` |
| `TYPE RESPONSE FOR REPORTED EARLY` | `TYPE TABLE FOR REPORTED EARLY` |
| `TYPE RESPONSE FOR REPORTED LATE` | `TYPE TABLE FOR REPORTED LATE` |

테이블의 구성요소: `%cid`, `%element`, `%global`, `%key`, `%msg`, `%pky`, `%state_area`, `%tky`

- `LATE` 테이블에는 `%cid` 가 없습니다.
- BO 에 `late numbering` 이 정의되어 있으면 `%pid` 가 있습니다.
- draft 를 쓰는 BO 에서는 `%is_draft` 가 있습니다.

구성요소 하나하나의 뜻은 [[abapderived_types_comp]] 에 있습니다.

## 예제

응답 구조를 미리 선언해 두고 씁니다. entity 마다 테이블이 따로 있으므로 여행과 예약의 실패를 나누어 볼 수 있습니다.

```abap
DATA ls_failed   TYPE RESPONSE FOR FAILED zr_travel.     " EARLY 와 같다
DATA ls_reported TYPE RESPONSE FOR REPORTED zr_travel.

MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( status )
    WITH VALUE #( ( travelid = '00000001' status = 'A' ) )
  ENTITY booking
    DELETE FROM VALUE #( ( travelid = '00000001' bookingid = '0001' ) )
  FAILED ls_failed
  REPORTED ls_reported.

LOOP AT ls_failed-travel INTO DATA(ls_failed_travel).
  " 실패한 여행. ls_failed_travel-%tky 로 어느 인스턴스인지 안다
ENDLOOP.

LOOP AT ls_failed-booking INTO DATA(ls_failed_booking).
  " 실패한 예약
ENDLOOP.
```

저장 단계의 응답은 `LATE` 를 붙인 타입으로 받습니다.

```abap
DATA ls_failed_late   TYPE RESPONSE FOR FAILED LATE zr_travel.
DATA ls_reported_late TYPE RESPONSE FOR REPORTED LATE zr_travel.

COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED ls_failed_late
  REPORTED ls_reported_late.
```

## 알아두기

- RAP BO provider(제공자) 구현에서 response parameter(응답 매개변수)를 다루는 규칙은 SAP 의 ABAP RESTful Application Programming Model 개발 가이드 "General RAP BO Implementation Contract" 절에 있습니다.

## 관련 항목

- [[abapeml_response]]
- [[abapeml_responses_dyn]]
- [[abaptype_response_for]]
- [[abaptype_table_for]]
- [[abapderived_types_comp]]
- [[abenbdl_late_numbering]]
- [[abapemlcommit_entities_long]]
- [[abeneml_responses_abexa]]
