---
title: global feature control handler method (FOR GLOBAL FEATURES)
summary: 특정 인스턴스와 상관없이 작업이나 action 을 통째로 켜고 끄는 값을 돌려주는 handler method 입니다.
keywords: FOR GLOBAL FEATURES, 전역 기능 제어, global feature control, features global, 핸들러 메서드, REQUEST, RESULT, get_global_features, reported
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR GLOBAL FEATURES
   [IMPORTING] REQUEST { REFERENCE(req_gl_feat) | req_gl_feat }
   FOR bdef
   RESULT { REFERENCE(res_gl_feat) | res_gl_feat }
   [CHANGING reported TYPE data].
```

## 설명

RAP BO entity(엔터티)의 [[abenbdl_actions_fc|global feature control]] 을 구현하는 handler method 입니다. global feature control(기능 제어)는 인스턴스의 값이 아니라 다른 조건으로 작업을 켜고 끕니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_actions_fc]] 에 있습니다.

### 매개변수

| 매개변수 | 방향 | 내용 |
| --- | --- | --- |
| `req_gl_feat` | 입력 | 어떤 작업의 feature control 값을 묻는지 알려 주는 요청 매개변수. [[abaptype_structure_for|TYPE STRUCTURE FOR GLOBAL FEATURES REQUEST bdef]] 타입의 구조입니다. `IMPORTING` 낱말은 생략할 수 있습니다. |
| `res_gl_feat` | `CHANGING` | 구한 결과를 담습니다. [[abaptype_structure_for|TYPE STRUCTURE FOR GLOBAL FEATURES RESULT bdef]] 타입의 구조입니다. |
| `reported` | `CHANGING` | 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. |

- 키를 넘겨받는 입력 매개변수가 없습니다. 인스턴스별로 답하지 않기 때문에 결과도 구조 하나입니다.
- `req_gl_feat` 와 `res_gl_feat` 는 `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다.
- `reported` 는 `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR REPORTED]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR REPORTED` 타입을 바로 적어도 됩니다.

## 예제

마감일이 지나면 여행 삭제를 막습니다. behavior definition 에는 이렇게 선언합니다.

```bdl
delete ( features : global );
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_features FOR GLOBAL FEATURES
      IMPORTING REQUEST requested_features FOR travel
      RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_global_features.
    " 삭제 기능을 물었을 때만 답한다
    CHECK requested_features-%delete = if_abap_behv=>mk-on.

    " 마감일(예: 12월 31일)이 지나면 삭제를 끈다
    DATA(lv_today) = cl_abap_context_info=>get_system_date( ).
    result-%delete = COND #( WHEN lv_today > '20261231'
                             THEN if_abap_behv=>fc-o-disabled
                             ELSE if_abap_behv=>fc-o-enabled ).
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 이 메서드에서 쓸 수 있는 response parameter 는 `reported` 하나뿐입니다. `failed` 는 없습니다.
- 인스턴스의 상태에 따라 달라지는 feature control 은 [[abaphandler_meth_features|instance feature control handler method]] 에서 다룹니다.

## 관련 항목

- [[abenbdl_actions_fc]]
- [[abaphandler_meth_features]]
- [[abapmethods_for_rap_behv]]
- [[abaptype_structure_for]]
- [[abenrap_handler_methods_abexa]]
