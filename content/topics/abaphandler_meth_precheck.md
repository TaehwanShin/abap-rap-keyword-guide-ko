---
title: precheck handler method (FOR PRECHECK)
summary: 생성·수정·삭제·action 요청을 실제로 처리하기 전에 미리 걸러 내는 precheck 를 구현하는 handler method 입니다.
keywords: FOR PRECHECK, 사전 점검, precheck, 핸들러 메서드, FOR CREATE, FOR UPDATE, FOR DELETE, FOR ACTION, REQUEST, failed, reported, 요청 거르기
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR PRECHECK
   [IMPORTING] { REFERENCE(im_par_pre) | im_par_pre }
   FOR { CREATE bdef }
     | { CREATE bdef\_assoc }
     | { UPDATE bdef }
     | { DELETE bdef }
     | { ACTION bdef~action
         [REQUEST { REFERENCE(req_act_pre) | req_act_pre } ] }
   [CHANGING { [failed TYPE data] [reported TYPE data] }].
```

## 설명

[[abenbdl_precheck|precheck]] 를 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `assoc` : association 이름.
- `action` : action 이름.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_precheck]] 에 있습니다.

### 변형과 입력 매개변수

`FOR` 뒤에 무엇을 적느냐에 따라 어느 작업을 미리 점검하는지와 `im_par_pre` 의 타입이 달라집니다. 모두 [[abaptype_table_for|TYPE TABLE FOR ...]] 타입의 내부 테이블이고, `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다.

| 변형 | 미리 점검하는 작업 | `im_par_pre` 의 내용과 타입 |
| --- | --- | --- |
| `CREATE bdef` | [[abenbdl_standard_operations|생성]] | 만들 entity(엔터티). `TYPE TABLE FOR CREATE bdef` |
| `CREATE bdef\_assoc` | [[abenbdl_association|create-by-association]] | 만들 entity. `TYPE TABLE FOR CREATE bdef\_assoc` |
| `UPDATE bdef` | [[abenbdl_standard_operations|수정]] | 바꿀 entity. `TYPE TABLE FOR UPDATE bdef` |
| `DELETE bdef` | [[abenbdl_standard_operations|삭제]] | 지울 entity 의 키. `TYPE TABLE FOR DELETE bdef` |
| `ACTION bdef~action` | [[abenbdl_action|action]] | action 을 처리할 entity 의 키. `TYPE TABLE FOR ACTION IMPORT bdef~action` |

### REQUEST (action 전용)

`REQUEST req_act_pre` 는 behavior definition 에 매개변수를 달아 선언한 action 에서만 쓸 수 있습니다. `req_act_pre` 는 입력 매개변수이고, [[abaptype_structure_for|TYPE STRUCTURE FOR ACTION REQUEST bdef]] 타입의 구조입니다.

### response parameter (CHANGING)

모든 변형에서 `failed` 와 `reported` 를 적지 않고도 쓸 수 있습니다. `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

## 예제

여행을 수정할 때 합계 금액이 0 보다 작으면 요청을 받아들이지 않습니다. behavior definition 에는 이렇게 선언합니다.

```bdl
update ( precheck );
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS precheck_update FOR PRECHECK
      IMPORTING entities FOR UPDATE travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD precheck_update.
    LOOP AT entities INTO DATA(ls_entity).
      " 금액 필드를 바꾸려는 요청만 본다
      IF ls_entity-%control-totalprice <> if_abap_behv=>mk-on.
        CONTINUE.
      ENDIF.

      IF ls_entity-totalprice < 0.
        APPEND VALUE #( %tky = ls_entity-%tky ) TO failed-travel.
        APPEND VALUE #( %tky                = ls_entity-%tky
                        %element-totalprice = if_abap_behv=>mk-on
                        %msg                = new_message_with_text(
                          severity = if_abap_behv_message=>severity-error
                          text     = '합계 금액은 0 보다 작을 수 없습니다.' ) )
               TO reported-travel.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- precheck handler method 에는 `mapped` 가 없습니다. 쓸 수 있는 response parameter(응답 매개변수)는 `failed` 와 `reported` 입니다.
- 더 자세한 내용은 ABAP RESTful Application Programming Model 개발 안내서의 "Operation Precheck" 절에 있습니다.
- action 의 precheck 를 보여 주는 예제가 [[abenrap_handler_methods_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_precheck]]
- [[abapmethods_for_rap_behv]]
- [[abaphandler_meth_modify]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abenrap_handler_methods_abexa]]
