---
title: %global (전역 메시지 표시)
summary: reported 응답에서 메시지가 global feature control 이나 global 권한에 대한 것이며 특정 인스턴스에 딸리지 않았음을 표시하는 구성요소입니다.
keywords: %global, REPORTED, 전역 기능 제어, 전역 권한, global feature control, global authorization, ABP_BEHV_FLAG, get_global_authorizations, 메시지
---

## 설명

`%global` 은 BDEF derived type(BDEF 파생 타입)의 구성요소이며, response parameter(응답 매개변수) `REPORTED` 안에 들어 있습니다.

메시지가 [[abenbdl_actions_fc|global feature control]]나 [[abenbdl_authorization|global 권한]]에서 나온 것임을 표시합니다. 이런 메시지는 특정 인스턴스에 딸려 있지 않습니다.

### 타입

`ABP_BEHV_FLAG`

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `REPORTED [EARLY|LATE]`

## 예제

global 권한을 확인하는 handler method(핸들러 메서드)입니다. 수정 권한이 없으면 메시지를 내면서 `%global` 을 켭니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_global_authorizations.
    IF requested_authorizations-%update = if_abap_behv=>mk-on.
      AUTHORITY-CHECK OBJECT 'ZTRAVEL' ID 'ACTVT' FIELD '02'.

      IF sy-subrc = 0.
        result-%update = if_abap_behv=>auth-allowed.
      ELSE.
        result-%update = if_abap_behv=>auth-unauthorized.

        " 특정 여행이 아니라 여행 전체에 대한 메시지다
        APPEND VALUE #( %msg    = new_message_with_text(
                                    severity = if_abap_behv_message=>severity-error
                                    text     = '여행을 수정할 권한이 없습니다.' )
                        %global = if_abap_behv=>mk-on ) TO reported-travel.
      ENDIF.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 원문 예제는 `get_global_authorizations` 에서 생성·수정·삭제 권한을 각각 확인하고, 허용했을 때와 거부했을 때 모두 `%global` 을 켠 메시지를 `reported` 에 넣습니다. 이때 `%create`, `%update`, `%delete` 구성요소도 함께 채웁니다.
- 메시지 처리 전반은 ABAP RESTful Application Programming Model 개발 안내서의 Messages 절에 나옵니다.
- `%global` 을 포함해 메시지와 관련된 구성요소 여러 개를 managed BO 에서 함께 쓰는 모습은 [[abenderived_types_reported_abexa]] 에 나옵니다.

## 관련 항목

- [[abapderived_types_msg]]
- [[abapderived_types_other]]
- [[abapderived_types_info]]
- [[abenbdl_actions_fc]]
- [[abenbdl_authorization]]
- [[abaptype_response_for]]
