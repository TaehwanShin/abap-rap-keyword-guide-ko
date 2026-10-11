---
title: 예제 - EML 문에 PRIVILEGED 쓰기
summary: 같은 action 을 PRIVILEGED 없이 한 번, 붙여서 한 번 실행해 권한 확인 결과가 어떻게 달라지는지 보여 주는 예제입니다.
keywords: PRIVILEGED 예제, 특권 모드, privileged mode, with privileged mode, authorization context, 권한 컨텍스트, AUTHORITY-CHECK, CL_ABAP_BEHV_AUX, GET_CURRENT_CONTEXT, MODIFY ENTITY, EXECUTE
---

## 설명

managed BO 의 action 하나를 `PRIVILEGED` 없이 실행하고, 이어서 `PRIVILEGED` 를 붙여 실행하는 예제입니다.

BDEF 머리말에 `with privileged mode disabling ...` 이 있고, 그 뒤에 적은 authorization context 에 권한 객체가 나열되어 있습니다. privileged mode 로 접근하면 이 권한 객체의 확인을 건너뜁니다.

action `check_privileged` 의 handler method(핸들러 메서드)는 다음 순서로 움직입니다.

1. `CL_ABAP_BEHV_AUX` 클래스의 `GET_CURRENT_CONTEXT` 메서드로 지금 privileged mode 인지 알아봅니다. RAP BO provider(제공자)는 이 메서드로 privileged mode 여부를 물을 수 있습니다. 예제는 그 결과를 표시로 남깁니다.
2. `AUTHORITY-CHECK OBJECT` 문으로 권한을 확인하고 `sy-subrc` 값을 남깁니다.
3. 넘어온 키를 하나씩 돌면서 response parameter(응답 매개변수)를 채웁니다. 권한이 없으면 `failed` 와 `reported` 를 둘 다 채웁니다. 권한이 있으면 `reported` 에 성공 메시지만 넣습니다.

원문 예제는 privileged mode 표시와 `sy-subrc` 값을 behavior pool(동작 풀) 전역 클래스의 변수에 넣어 둡니다. BO 를 부른 프로그램이 그 값을 읽어 화면에 보여 주려는 것이고, 설명을 위한 장치입니다.

## 예제

여행 모델로 줄여 쓴 것입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with privileged mode disabling TravelAuth;

define authorization context TravelAuth
{
  'Z_TRAVEL';
}

define own authorization context by privileged mode;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  action checkPrivileged;
  field ( readonly : update ) TravelID;
}
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS checkprivileged FOR MODIFY
      IMPORTING keys FOR ACTION travel~checkprivileged.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD checkprivileged.
    " 1) 지금 privileged mode 로 불렸는지 알아본다
    cl_abap_behv_aux=>get_current_context( IMPORTING privileged = DATA(lv_privileged) ).

    " 2) 권한을 확인한다. privileged mode 라면 통과한다
    AUTHORITY-CHECK OBJECT 'Z_TRAVEL' ID 'ACTVT' FIELD '02'.
    DATA(lv_subrc) = sy-subrc.

    " 3) response parameter 를 채운다
    LOOP AT keys INTO DATA(ls_key).
      IF lv_subrc <> 0.
        APPEND VALUE #( %tky        = ls_key-%tky
                        %fail-cause = if_abap_behv=>cause-unauthorized ) TO failed-travel.
        APPEND VALUE #( %tky = ls_key-%tky
                        %msg = new_message_with_text(
                                 severity = if_abap_behv_message=>severity-error
                                 text     = '권한이 없습니다.' ) ) TO reported-travel.
      ELSE.
        APPEND VALUE #( %tky = ls_key-%tky
                        %msg = new_message_with_text(
                                 severity = if_abap_behv_message=>severity-success
                                 text     = '권한 확인을 통과했습니다.' ) ) TO reported-travel.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

BO 를 쓰는 쪽에서 같은 action 을 두 번 실행합니다.

```abap
" PRIVILEGED 없이
MODIFY ENTITY zr_travel
  EXECUTE checkprivileged
  FROM VALUE #( ( travelid = '00000001' ) ( travelid = '00000002' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" PRIVILEGED 를 붙여서
MODIFY ENTITY PRIVILEGED zr_travel
  EXECUTE checkprivileged
  FROM VALUE #( ( travelid = '00000001' ) ( travelid = '00000002' ) )
  FAILED DATA(ls_failed_priv)
  REPORTED DATA(ls_reported_priv).
```

## 알아두기

원문 예제를 실행하면 두 요청의 결과가 이렇게 갈립니다.

| 요청 | `sy-subrc` | privileged mode | 응답 |
| --- | --- | --- | --- |
| `PRIVILEGED` 없음 | 12 (권한 없음) | 아님 | `failed` 와 `reported` 가 채워집니다. 권한이 없는 인스턴스 전부와 실패 메시지가 들어 있습니다. |
| `PRIVILEGED` 있음 | 0 (권한 있음) | 맞음 | `reported` 에 성공 메시지만 들어 있습니다. |

두 요청은 넘기는 키도 실행하는 action 도 같습니다. 달라진 것은 `PRIVILEGED` 하나뿐이고, 그것만으로 권한 확인을 비켜 간다는 점을 눈여겨봅니다.

## 관련 항목

- [[abapeml_privileged]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_authorization_context]]
- [[abaprap_cl_abap_behv_aux]]
- [[abeneml_forwarding_priv_abexa]]
