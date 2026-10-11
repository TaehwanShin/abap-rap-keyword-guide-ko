---
title: 예제 - EML 문에 FORWARDING PRIVILEGED 쓰기
summary: action 구현 안에서 다른 BO 의 action 을 부를 때 FORWARDING PRIVILEGED 로 특권 상태를 넘기는 방법과, 같은 일을 손으로 하는 방법을 견주는 예제입니다.
keywords: FORWARDING PRIVILEGED 예제, PRIVILEGED, 특권 모드, privileged mode, CL_ABAP_BEHV_AUX, GET_CURRENT_CONTEXT, NO_PRIVILEGED, MODIFY ENTITY, EXECUTE, 액션, 다른 BO 호출
---

## 설명

managed BO 두 개를 써서 `FORWARDING PRIVILEGED` 를 보여 주는 예제입니다. 두 BO 의 root entity(루트 엔터티)는 같은 데이터베이스 테이블을 바탕으로 합니다.

- 첫째 BO 에는 action `forwarding_privileged` 와 `forwarding_privileged_aux` 가 있습니다.
- 둘째 BO 에는 action `act` 가 있습니다.

첫째 BO 의 두 action 은 모두 구현 안에서 둘째 BO 의 `act` 를 EML 로 실행합니다. 방법만 다릅니다.

| action | `act` 를 부르는 방법 |
| --- | --- |
| `forwarding_privileged` | `FORWARDING PRIVILEGED` 를 붙인 EML 요청 하나로 부릅니다. 이름 그대로 특권 상태를 넘깁니다. |
| `forwarding_privileged_aux` | `CL_ABAP_BEHV_AUX` 클래스의 `GET_CURRENT_CONTEXT` 로 지금 특권 상태인지 먼저 묻고, 그 답에 따라 요청을 갈라서 보냅니다. `FORWARDING PRIVILEGED` 가 하는 일을 손으로 풀어 쓴 것입니다. |

`act` 의 구현은 `GET_CURRENT_CONTEXT` 로 자기가 특권 상태로 불렸는지 알아봅니다. 그리고 인스턴스의 필드에 표시와 글을 써넣어, 특권 상태가 넘어왔는지 아닌지 눈으로 볼 수 있게 합니다.

## 예제

여행 모델로 줄여 쓴 것입니다. 여행 BO(`ZR_Travel`)의 action 두 개가 여행사 BO(`ZR_Agency`)의 action `markContacted` 를 부릅니다. 두 BO 모두 BDEF 에 `with privileged mode` 가 있다고 봅니다.

```abap
CLASS lhc_travel IMPLEMENTATION.
  METHOD notifyagency.
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel FIELDS ( agencyid ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    " 내가 특권 상태로 불렸다면 그 상태를 그대로 넘긴다
    MODIFY ENTITY FORWARDING PRIVILEGED zr_agency
      EXECUTE markcontacted
      FROM VALUE #( FOR ls_travel IN lt_travel ( agencyid = ls_travel-agencyid ) )
      FAILED DATA(ls_failed_agency)
      REPORTED DATA(ls_reported_agency).
  ENDMETHOD.

  METHOD notifyagencyaux.
    DATA lt_agency_keys TYPE TABLE FOR ACTION IMPORT zr_agency~markcontacted.

    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel FIELDS ( agencyid ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).
    lt_agency_keys = VALUE #( FOR ls_travel IN lt_travel ( agencyid = ls_travel-agencyid ) ).

    " 같은 일을 손으로: 지금 상태를 묻고 갈라서 보낸다
    cl_abap_behv_aux=>get_current_context( IMPORTING privileged = DATA(lv_privileged) ).

    IF lv_privileged = abap_true.
      MODIFY ENTITY PRIVILEGED zr_agency
        EXECUTE markcontacted FROM lt_agency_keys
        FAILED DATA(ls_failed_1) REPORTED DATA(ls_reported_1).
    ELSE.
      MODIFY ENTITY zr_agency ##NO_PRIVILEGED
        EXECUTE markcontacted FROM lt_agency_keys
        FAILED DATA(ls_failed_2) REPORTED DATA(ls_reported_2).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

여행사 BO 의 action 은 자기가 특권 상태로 불렸는지를 필드 `Note` 에 적어 둡니다.

```abap
METHOD markcontacted.
  cl_abap_behv_aux=>get_current_context( IMPORTING privileged = DATA(lv_privileged) ).

  MODIFY ENTITIES OF zr_agency IN LOCAL MODE
    ENTITY agency
      UPDATE FIELDS ( note )
      WITH VALUE #( FOR key IN keys
                    ( %tky = key-%tky
                      note = COND #( WHEN lv_privileged = abap_true
                                     THEN '특권 상태로 불림'
                                     ELSE '특권 없이 불림' ) ) )
    FAILED failed
    REPORTED reported.
ENDMETHOD.
```

BO 를 쓰는 쪽에서는 같은 action 을 `PRIVILEGED` 없이 한 번, 붙여서 한 번 실행합니다.

```abap
MODIFY ENTITY zr_travel
  EXECUTE notifyagency FROM VALUE #( ( travelid = '00000001' ) )
  FAILED DATA(ls_failed_a) REPORTED DATA(ls_reported_a).

MODIFY ENTITY PRIVILEGED zr_travel
  EXECUTE notifyagency FROM VALUE #( ( travelid = '00000002' ) )
  FAILED DATA(ls_failed_b) REPORTED DATA(ls_reported_b).

COMMIT ENTITIES.
```

## 알아두기

원문 예제를 실행하면 다음과 같이 됩니다.

- 먼저 예제용 데이터베이스 테이블에 키만 채운 줄을 여러 개 넣어 둡니다.
- EML 요청을 네 번 보냅니다. 앞의 두 번은 `forwarding_privileged` 를, 뒤의 두 번은 `forwarding_privileged_aux` 를 실행합니다. action 마다 한 번은 `PRIVILEGED` 없이, 한 번은 `PRIVILEGED` 를 붙여 실행합니다.
- action 을 실행한 뒤마다 `COMMIT ENTITIES` 로 인스턴스를 데이터베이스에 저장하고, 테이블을 읽어 화면에 보여 줍니다.
- `PRIVILEGED` 를 붙여 실행한 인스턴스에는 특권 상태가 넘어왔다는 표시가, 붙이지 않은 인스턴스에는 넘어오지 않았다는 표시가 남습니다.

두 action 의 결과가 같다는 점을 눈여겨봅니다. `FORWARDING PRIVILEGED` 는 "지금 상태를 묻고 갈라서 보내기"를 한 줄로 줄인 것입니다.

## 관련 항목

- [[abapeml_privileged]]
- [[abeneml_privileged_abexa]]
- [[abenbdl_privileged_mode]]
- [[abaprap_cl_abap_behv_aux]]
- [[abapin_local_mode]]
- [[abapcommit_entities]]
