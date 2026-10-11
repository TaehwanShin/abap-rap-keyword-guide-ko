---
title: 읽기 handler method (FOR READ)
summary: 읽기, read-by-association, function 실행처럼 데이터를 바꾸지 않는 요청을 구현하는 handler method 입니다.
keywords: FOR READ, 읽기 핸들러 메서드, read, read by association, 연관 관계로 읽기, FOR FUNCTION, 함수, function, FULL, RESULT, LINK, REQUEST, result selective, failed, reported
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR READ
   [IMPORTING] { REFERENCE(im_par_read) | im_par_read }
   FOR { READ bdef RESULT { REFERENCE(res_read) | res_read } }
     | { READ bdef\_assoc FULL { REFERENCE(full_rba) | full_rba }
                          RESULT { REFERENCE(res_rba) | res_rba }
                          LINK { REFERENCE(link_rba) | link_rba } }
     | { FUNCTION bdef~function [REQUEST { REFERENCE(req_func) | req_func }]
                                 RESULT { REFERENCE(res_func) | res_func }  }
   [CHANGING { [failed TYPE data] [reported TYPE data] }].
```

## 설명

RAP 의 읽기 작업을 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다. 다만 [[abaprap_handler_default_val_func|default values function]]의 메서드는 이름이 정해져 있습니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `assoc` : association 이름.
- `function` : function 이름.

매개변수는 `REFERENCE( )` 로 감싸 참조로 넘겨받을 수 있습니다. 이름이 정해진 `failed` 와 `reported` 만 예외입니다.

### 변형 1: `READ bdef` — 읽기

RAP 읽기 작업의 요청을 처리합니다. behavior definition 에서는 읽을 entity(엔터티)가 [[abenbdl_define_beh|define behavior for]] 뒤에 선언되어 있어야 합니다.

- `im_par_read` (입력) : 읽을 entity. [[abaptype_table_for|TYPE TABLE FOR READ IMPORT bdef]] 타입의 내부 테이블입니다.
- `res_read` (`CHANGING`) : 읽은 결과를 담습니다. 꼭 있어야 하고, `RESULT` 낱말 뒤에 적습니다. [[abaptype_table_for|TYPE TABLE FOR READ RESULT bdef]] 타입의 내부 테이블입니다.

### 변형 2: `READ bdef\_assoc` — read-by-association

association 을 따라 읽는 요청을 처리합니다. 여기서도 읽을 entity 가 [[abenbdl_define_beh|define behavior for]] 뒤에 선언되어 있어야 합니다.

| 매개변수 | 방향 | 내용 |
| --- | --- | --- |
| `im_par_read` | 입력 | 읽을 entity. `TYPE TABLE FOR READ IMPORT bdef\_assoc` 타입의 내부 테이블입니다. |
| `full_rba` | 입력 | 대상 인스턴스 전체(`res_rba`)를 가져올지, 연결 정보(`link_rba`)만 가져올지 알려 줍니다. 길이 1 인 `c` 타입의 참/거짓 값이고, `'X'` 이면 대상 인스턴스 전체를 뜻합니다. |
| `res_rba` | `CHANGING` | 읽은 결과. `RESULT` 뒤에 적습니다. `TYPE TABLE FOR READ RESULT bdef\_assoc` 타입의 내부 테이블입니다. |
| `link_rba` | `CHANGING` | 원본 entity 와 대상 entity 의 키를 짝지은 연결 정보. `TYPE TABLE FOR READ LINK bdef\_assoc` 타입의 내부 테이블입니다. |

EML 에서 `FULL` 을 드러내 지정할 수 있는 것은 동적 형식의 `READ` 문([[abapread_entities_operations|READ ENTITIES OPERATIONS]])뿐입니다. 짧은 형식([[abapread_entity_short|READ ENTITY]])과 긴 형식([[abapread_entities_long|READ ENTITIES]])에서는 지정할 수 없습니다. 이때는 연결 정보나 데이터를 요청했느냐에 따라 저절로 정해지므로 따로 지정할 필요가 없습니다.

### 변형 3: `FUNCTION bdef~function` — function

[[abenbdl_function|function]]의 읽기 요청을 처리합니다. behavior definition 쪽에 적어야 하는 내용은 [[abenbdl_function]] 에 있습니다.

- `im_par_read` (입력) : 읽을 RAP BO 인스턴스. [[abaptype_table_for|TYPE TABLE FOR FUNCTION IMPORT bdef~function]] 타입의 내부 테이블입니다.
- `req_func` (입력) : `REQUEST` 뒤에 적는 매개변수입니다. behavior definition 에서 function 을 [[abenbdl_action_output_para|result selective]] 로 선언했을 때만 쓸 수 있습니다. [[abaptype_structure_for|TYPE STRUCTURE FOR FUNCTION REQUEST bdef~function]] 타입의 구조입니다.
- `res_func` (`CHANGING`) : 읽은 결과. `RESULT` 뒤에 적습니다. `TYPE TABLE FOR FUNCTION RESULT` 타입의 내부 테이블입니다([[abaptype_table_for]]).

### response parameter (CHANGING)

모든 변형에서 `failed` 와 `reported` 를 적지 않고도 쓸 수 있습니다. `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

### 매개변수를 적는 순서

선언에서 매개변수는 다음 순서로 적어야 합니다.

```syntax
... IMPORTING ... FULL ... RESULT ... LINK ... CHANGING ...
```

## 예제

unmanaged 여행 RAP BO 의 읽기 handler method 선언입니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    " 읽기
    METHODS read FOR READ
      IMPORTING keys FOR READ travel RESULT result.

    " read-by-association: 여행에 딸린 예약
    METHODS rba_booking FOR READ
      IMPORTING keys_rba FOR READ travel\_booking
      FULL result_requested RESULT result LINK association_links.

    " function
    METHODS getopenamount FOR READ
      IMPORTING keys FOR FUNCTION travel~getopenamount RESULT result.

    " result selective 로 선언한 function
    METHODS getsummary FOR READ
      IMPORTING keys FOR FUNCTION travel~getsummary
      REQUEST requested_fields RESULT result.
ENDCLASS.
```

`read` 는 요청받은 키의 여행을 찾아 `result` 에 담고, 찾지 못한 키는 `failed` 로 알려 줍니다. `lcl_buffer` 는 직접 만든 transactional buffer(트랜잭션 버퍼) 클래스입니다.

```abap
METHOD read.
  LOOP AT keys INTO DATA(ls_key).
    READ TABLE lcl_buffer=>mt_travel INTO DATA(ls_travel)
         WITH KEY travelid = ls_key-travelid.

    IF sy-subrc = 0.
      APPEND CORRESPONDING #( ls_travel ) TO result.
    ELSE.
      APPEND VALUE #( travelid    = ls_key-travelid
                      %fail-cause = if_abap_behv=>cause-not_found )
             TO failed-travel.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- `RESULT` 매개변수는 `CHANGING` 낱말이 아니라 `RESULT` 낱말 뒤에 적습니다.
- 읽기 handler method 에는 `mapped` 가 없습니다.
- default values function 을 구현하는 메서드도 `FOR READ ... FUNCTION` 으로 선언합니다. 정해진 이름과 매개변수는 [[abaprap_handler_default_val_func]] 에 있습니다.

## 관련 항목

- [[abapmethods_for_rap_behv]]
- [[abaprap_handler_default_val_func]]
- [[abenbdl_function]]
- [[abenbdl_define_beh]]
- [[abaptype_table_for]]
- [[abapread_entities_operations]]
- [[abenrap_handler_methods_abexa]]
- [[abenbdl_function_abexa]]
