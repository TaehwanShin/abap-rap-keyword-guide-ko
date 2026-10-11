---
title: association 표시 (%assoc)
summary: BDEF 에 정의한 association 을 구성요소로 둔 구조입니다. 연관된 entity 의 feature control·권한 정보를 묻거나 받을 때, 실패가 association 과 얽혔을 때 표시합니다.
keywords: %assoc, 연관 관계 표시, association, ABP_BEHV_FLAG, GET PERMISSIONS, PERMISSIONS REQUEST, PERMISSIONS RESULT, FEATURES, AUTHORIZATION, FAILED, 기능 제어, create by association, FILLED_COMPONENTS_X
---

## 설명

`%assoc` 는 BDEF derived type(BDEF 파생 타입)에 들어 있는 구조형 구성요소입니다. BDEF 에 정의한 association 이 하나씩 구성요소로 들어 있습니다. association `_Booking` 이 있으면 `%assoc-_booking` 이 생깁니다.

쓰임새는 두 가지입니다.

- feature control(기능 제어, [[abenbdl_actions_fc]])에서 연관된 entity(엔터티)에 걸린 제어 정보를 묻거나 돌려줄 때. 예를 들어 "이 여행에 예약을 더 만들 수 있는가"를 답합니다.
- 실패가 났을 때, 응답에서 어떤 association 이 얽혀 있었는지 알릴 때

### 타입

`%assoc` 구조의 구성요소 타입은 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `PERMISSIONS REQUEST`
- `PERMISSIONS RESULT`
- `FAILED [EARLY|LATE]`
- `[INSTANCE|GLOBAL] AUTHORIZATION REQUEST`
- `[INSTANCE|GLOBAL] AUTHORIZATION RESULT`
- `[INSTANCE|GLOBAL] FEATURES REQUEST`
- `[INSTANCE|GLOBAL] FEATURES RESULT`

## 예제

BDEF 에서 association 으로 하는 생성에 instance feature control 을 겁니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  // 예약 생성을 여행마다 켜고 끈다
  association _Booking { create ( features : instance ); }
}
```

handler method(핸들러 메서드)에서 `%assoc-_booking` 에 답을 넣습니다. 승인된 여행(`Status = 'A'`)에는 예약을 더 만들 수 없게 합니다.

```abap
METHOD get_instance_features.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky            = ls_travel-%tky
      %assoc-_booking = COND #( WHEN ls_travel-status = 'A'
                                THEN if_abap_behv=>fc-o-disabled
                                ELSE if_abap_behv=>fc-o-enabled ) ) ).
ENDMETHOD.
```

RAP BO consumer(사용자)는 `GET PERMISSIONS` 문의 요청 구조에서 `%assoc-_booking = if_abap_behv=>mk-on` 으로 표시해 이 정보를 물어봅니다.

## 알아두기

- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드는 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 값이 채워진 구성요소만 골라 처리하게 도와줍니다. `%assoc` 처럼 표시로만 이루어진 구조를 살필 때 쓸모 있습니다.
- `%action` 과 달리 `REPORTED [EARLY|LATE]` 타입은 쓰이는 곳 목록에 없습니다.

## 관련 항목

- [[abenbdl_actions_fc]]
- [[abapget_permissions]]
- [[abapderived_types_action]]
- [[abapderived_types_op]]
- [[abapderived_types_features]]
- [[abapderived_types_target]]
- [[abenderived_types_misc_abexa]]
