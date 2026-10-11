---
title: instance 권한 handler method (FOR INSTANCE AUTHORIZATION)
summary: 인스턴스마다 수정·삭제·action 을 해도 되는지 확인해 돌려주는 handler method 입니다.
keywords: FOR INSTANCE AUTHORIZATION, FOR AUTHORIZATION, 인스턴스 권한, instance authorization, 권한 확인, 핸들러 메서드, AUTHORITY-CHECK, REQUEST, RESULT, get_instance_authorizations, failed, reported
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR [INSTANCE] AUTHORIZATION
   [IMPORTING] { REFERENCE(im_par_auth) | im_par_auth }
   REQUEST { REFERENCE(req_auth) | req_auth }
   FOR bdef
   RESULT { REFERENCE(res_auth) | res_auth }
  [CHANGING { [failed TYPE data] [reported TYPE data] }].
```

## 설명

RAP BO entity(엔터티)에 접근할 때 [[abenbdl_authorization|인스턴스 기반 권한]]을 확인하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `INSTANCE` 는 문법 틀에서 선택 항목입니다. `FOR AUTHORIZATION` 이라고만 적어도 됩니다.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_authorization]] 에 있습니다.

### 매개변수

| 매개변수 | 방향 | 내용 |
| --- | --- | --- |
| `im_par_auth` | 입력 | 권한을 확인할 인스턴스의 키. [[abaptype_table_for|TYPE TABLE FOR AUTHORIZATION KEY]] 타입의 내부 테이블입니다. `IMPORTING` 낱말은 생략할 수 있습니다. |
| `req_auth` | 입력 | 어떤 작업의 권한을 묻는지 알려 주는 요청 매개변수. [[abaptype_structure_for|TYPE STRUCTURE FOR AUTHORIZATION REQUEST]] 타입의 구조입니다. |
| `res_auth` | `CHANGING` | 확인한 결과를 담습니다. [[abaptype_table_for|TYPE TABLE FOR AUTHORIZATION RESULT]] 타입의 내부 테이블입니다. |
| `failed`, `reported` | `CHANGING` | 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. |

- `im_par_auth`, `req_auth`, `res_auth` 는 `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다.
- `failed` 와 `reported` 는 `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

## 예제

여행사마다 수정 권한이 있는지 확인해, 수정·삭제와 승인 action 을 허용하거나 막습니다. behavior definition 에는 `authorization master ( instance )` 가 있어야 합니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR travel
      RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_instance_authorizations.
    " 권한 확인에 쓸 여행사 번호를 읽는다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( agencyid ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel)
      FAILED failed.

    LOOP AT lt_travel INTO DATA(ls_travel).
      " 이 여행사의 여행을 바꿀 권한(활동 02)이 있는지 확인한다
      AUTHORITY-CHECK OBJECT 'ZTRAVEL'
        ID 'ZAGENCY' FIELD ls_travel-agencyid
        ID 'ACTVT'   FIELD '02'.

      DATA(lv_auth) = COND #( WHEN sy-subrc = 0
                              THEN if_abap_behv=>auth-allowed
                              ELSE if_abap_behv=>auth-unauthorized ).

      APPEND VALUE #( %tky                 = ls_travel-%tky
                      %update              = lv_auth
                      %delete              = lv_auth
                      %action-accepttravel = lv_auth ) TO result.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

`requested_authorizations` 에는 지금 어떤 작업의 권한을 묻는지가 표시되어 있습니다. 필요한 것만 골라 확인하려면 이 구조를 봅니다.

## 알아두기

- 권한 handler method 는 `AUTHORITY-CHECK OBJECT` 로 구현하는 것이 좋습니다.
- 인스턴스와 상관없이 따지는 global 권한은 [[abaphandler_meth_global_auth|global 권한 handler method]] 에서 확인합니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abaphandler_meth_global_auth]]
- [[abapmethods_for_rap_behv]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abenrap_handler_methods_abexa]]
