---
title: RESULT result_tab (결과 받기)
summary: 읽기 작업과 action 실행의 결과를 내부 테이블로 받는 추가 구문입니다. 작업 종류마다 정해진 BDEF derived type 을 씁니다.
keywords: RESULT, result_tab, 결과, 결과 테이블, TABLE FOR READ RESULT, TABLE FOR FUNCTION RESULT, TABLE FOR ACTION RESULT, %param, %tky, READ ENTITIES, MODIFY ENTITIES, EXECUTE
---

## 문법

```syntax
... RESULT result_tab ...
```

## 설명

`RESULT` 는 EML 작업의 결과를 내부 테이블 `result_tab` 에 담습니다. 결과를 돌려주는 작업은 두 가지입니다.

- 모든 `READ` 작업
- action 을 실행하는 `MODIFY` 작업

`result_tab` 은 작업에 맞는 BDEF derived type(BDEF 파생 타입)이어야 합니다. 읽기 작업에서는 `RESULT` 를 반드시 적어야 합니다. action 을 실행하는 변경 작업에서만 생략할 수 있습니다.

작업별 타입과 결과 줄에 들어 있는 구성요소는 다음과 같습니다.

| 작업 | 타입 | 줄에 들어 있는 구성요소 |
| --- | --- | --- |
| `READ` 작업 (function 실행 제외) | `TABLE FOR READ RESULT bdef[\_assoc]` | `%data`, `%key`, `%pky`, `%tky` |
| function 을 실행하는 `READ` 작업 (`READ ... EXECUTE`) | `TABLE FOR FUNCTION RESULT bdef~function` | `%key`, `%param`, `%pky`, `%tky` |
| action 을 실행하는 `MODIFY` 작업 (`MODIFY ... EXECUTE`) | `TABLE FOR ACTION RESULT bdef~action` | `%cid_ref`, `%key`, `%param`, `%pky`, `%tky` |

결과 테이블의 줄은 특수한 구성요소가 들어 있는 중첩 구조입니다. 구성요소 하나하나의 뜻은 [[abapderived_types_comp]] 에 있습니다.

## 예제

여행을 읽은 결과와, 승인 action 을 실행한 결과를 각각 받습니다. 인라인 선언을 쓰면 타입이 자동으로 정해집니다.

```abap
" 읽기: RESULT 가 꼭 있어야 한다
READ ENTITIES OF zr_travel
  ENTITY travel
    FIELDS ( agencyid status )
    WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel)        " TABLE FOR READ RESULT zr_travel
  FAILED DATA(ls_failed_read).

" action 실행: RESULT 는 선택이다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE accepttravel
    FROM VALUE #( ( travelid = '00000001' ) )
  RESULT   DATA(lt_result)      " TABLE FOR ACTION RESULT zr_travel~accepttravel
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" action 이 돌려준 값은 %param 에 들어 있다
LOOP AT lt_result INTO DATA(ls_result).
  DATA(lv_status) = ls_result-%param-status.
ENDLOOP.
```

## 알아두기

- late numbering 을 쓰는 BO 에서는 결과 줄에 `%pid` 가 더 있습니다.
- draft 를 쓰는 BO 에서는 결과 줄에 `%is_draft` 가 더 있습니다.
- 생성·수정·삭제 같은 standard operation(표준 작업)은 결과를 돌려주지 않습니다. 바뀐 데이터가 필요하면 뒤이어 `READ` 문으로 읽습니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_entities_op]]
- [[abapmodify_entity_entities]]
- [[abenbdl_function]]
- [[abapderived_types_comp]]
- [[abapeml_response]]
