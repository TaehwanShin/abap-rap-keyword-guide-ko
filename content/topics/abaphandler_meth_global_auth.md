---
title: global 권한 handler method (FOR GLOBAL AUTHORIZATION)
summary: 특정 인스턴스와 상관없이, 사용자가 생성·수정·삭제 같은 작업을 해도 되는지 확인해 돌려주는 handler method 입니다.
keywords: FOR GLOBAL AUTHORIZATION, 전역 권한, global authorization, 권한 확인, 핸들러 메서드, AUTHORITY-CHECK, REQUEST, RESULT, get_global_authorizations, reported
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR GLOBAL AUTHORIZATION
   [IMPORTING] { REFERENCE(im_par_gl_auth) | im_par_gl_auth }
   REQUEST { REFERENCE(req_gl_auth) | req_gl_auth }
   FOR bdef
   RESULT { REFERENCE(res_gl_auth) | res_gl_auth }
   [CHANGING reported TYPE data].
```

이 문법 틀은 원문 그대로입니다. 틀에는 `REQUEST` 앞에 `im_par_gl_auth` 자리가 있지만, 원문은 이 매개변수를 설명하지 않고 원문 예제도 `IMPORTING REQUEST ...` 로 바로 시작합니다. 선언은 아래 예제처럼 `REQUEST` 매개변수부터 적습니다.

## 설명

RAP BO entity(엔터티)에 접근할 때 [[abenbdl_authorization|global 권한]]을 확인하는 handler method 입니다. global 권한은 인스턴스 하나하나가 아니라 작업 자체를 해도 되는지 따집니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_authorization]] 에 있습니다.

### 매개변수

| 매개변수 | 방향 | 내용 |
| --- | --- | --- |
| `req_gl_auth` | 입력 | 어떤 작업의 권한을 묻는지 알려 주는 요청 매개변수. [[abaptype_structure_for|TYPE STRUCTURE FOR GLOBAL AUTHORIZATION REQUEST]] 타입의 구조입니다. |
| `res_gl_auth` | `CHANGING` | 확인한 결과를 담습니다. [[abaptype_structure_for|TYPE STRUCTURE FOR GLOBAL AUTHORIZATION RESULT]] 타입의 구조입니다. |
| `reported` | `CHANGING` | 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. |

- instance 권한과 달리 결과가 내부 테이블이 아니라 **구조 하나**입니다. 인스턴스별로 답하지 않기 때문입니다.
- `reported` 는 `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR REPORTED]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR REPORTED` 타입을 바로 적어도 됩니다.

## 예제

여행을 만들 권한과 바꿀 권한을 확인합니다. behavior definition 에는 `authorization master ( global )` 이 있어야 합니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel
      RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_global_authorizations.
    " 생성 권한을 물었을 때만 확인한다 (활동 01)
    IF requested_authorizations-%create = if_abap_behv=>mk-on.
      AUTHORITY-CHECK OBJECT 'ZTRAVEL' ID 'ACTVT' FIELD '01'.
      result-%create = COND #( WHEN sy-subrc = 0
                               THEN if_abap_behv=>auth-allowed
                               ELSE if_abap_behv=>auth-unauthorized ).
    ENDIF.

    " 수정 권한을 물었을 때만 확인한다 (활동 02)
    IF requested_authorizations-%update = if_abap_behv=>mk-on.
      AUTHORITY-CHECK OBJECT 'ZTRAVEL' ID 'ACTVT' FIELD '02'.
      result-%update = COND #( WHEN sy-subrc = 0
                               THEN if_abap_behv=>auth-allowed
                               ELSE if_abap_behv=>auth-unauthorized ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 권한 handler method 는 `AUTHORITY-CHECK OBJECT` 로 구현하는 것이 좋습니다.
- 이 메서드에서 쓸 수 있는 response parameter 는 `reported` 하나뿐입니다. `failed` 는 없습니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abaphandler_meth_auth]]
- [[abapmethods_for_rap_behv]]
- [[abaptype_structure_for]]
- [[abenrap_handler_methods_abexa]]
- [[abenbdl_authorization_abexa]]
