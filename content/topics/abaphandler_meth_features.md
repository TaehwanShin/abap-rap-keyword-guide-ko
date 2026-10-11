---
title: instance feature control handler method (FOR INSTANCE FEATURES)
summary: 인스턴스의 상태에 따라 작업·action 을 켜고 끄거나 필드를 readonly 로 바꾸는 값을 돌려주는 handler method 입니다.
keywords: FOR INSTANCE FEATURES, FOR FEATURES, 인스턴스 기능 제어, instance feature control, features instance, 핸들러 메서드, REQUEST, RESULT, get_instance_features, 읽기 전용, 액션 비활성
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR [INSTANCE] FEATURES
   [IMPORTING] { REFERENCE(im_par_feat) | im_par_feat }
   REQUEST { REFERENCE(req_feat) | req_feat }
   FOR bdef
   RESULT { REFERENCE(res_feat) | res_feat }
  [CHANGING { [failed TYPE data] [reported TYPE data] }].
```

## 설명

[[abenbdl_actions_fc|인스턴스 기반 feature control]] 을 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `INSTANCE` 낱말은 생략할 수 있습니다. `FOR FEATURES` 라고만 적어도 됩니다.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_actions_fc]] 에 있습니다.

### 매개변수

| 매개변수 | 방향 | 내용 |
| --- | --- | --- |
| `im_par_feat` | 입력 | feature control(기능 제어) 값을 구할 인스턴스의 키. [[abaptype_table_for|TYPE TABLE FOR INSTANCE FEATURES KEY]] 타입의 내부 테이블입니다. `IMPORTING` 낱말은 생략할 수 있습니다. |
| `req_feat` | 입력 | 어떤 작업·필드의 feature control 값을 묻는지 알려 주는 요청 매개변수. [[abaptype_structure_for|TYPE STRUCTURE FOR INSTANCE FEATURES REQUEST]] 타입의 구조입니다. |
| `res_feat` | `CHANGING` | 구한 결과를 담습니다. [[abaptype_table_for|TYPE TABLE FOR INSTANCE FEATURES RESULT]] 타입의 내부 테이블입니다. |
| `failed`, `reported` | `CHANGING` | 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. |

- `im_par_feat`, `req_feat`, `res_feat` 는 `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다.
- `failed` 와 `reported` 는 `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

## 예제

이미 승인된 여행은 승인 action 을 끄고 합계 금액을 readonly 로 만듭니다. behavior definition 에는 이렇게 선언합니다.

```bdl
action ( features : instance ) acceptTravel result [1] $self;
field ( features : instance ) TotalPrice;
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR travel
      RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_instance_features.
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel)
      FAILED failed.

    " 상태가 '승인(A)'이면 action 을 끄고 금액을 readonly 로 돌려준다
    result = VALUE #( FOR ls_travel IN lt_travel
      ( %tky                 = ls_travel-%tky
        %action-accepttravel = COND #( WHEN ls_travel-status = 'A'
                                       THEN if_abap_behv=>fc-o-disabled
                                       ELSE if_abap_behv=>fc-o-enabled )
        %field-totalprice    = COND #( WHEN ls_travel-status = 'A'
                                       THEN if_abap_behv=>fc-f-read_only
                                       ELSE if_abap_behv=>fc-f-unrestricted ) ) ).
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 인스턴스와 상관없이 정해지는 feature control 은 [[abaphandler_meth_global_features|global feature control handler method]] 에서 다룹니다.
- unmanaged 이면서 draft 를 쓰는 RAP BO 로 이 메서드를 보여 주는 예제가 [[abenrap_handler_methods_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_actions_fc]]
- [[abaphandler_meth_global_features]]
- [[abapmethods_for_rap_behv]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abenrap_handler_methods_abexa]]
