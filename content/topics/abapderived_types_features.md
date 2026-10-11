---
title: feature control 결과 묶음 (%features)
summary: feature control handler method 가 답을 돌려줄 때 쓰는 구성요소 묶음입니다. BDEF 에서 feature control 을 건 작업·action·필드·association 이 구성요소로 들어 있습니다.
keywords: %features, 기능 제어, feature control, FEATURES RESULT, INSTANCE FEATURES, GLOBAL FEATURES, get_instance_features, get_global_features, fc-o-enabled, fc-o-disabled, fc-f-read_only, fc-f-unrestricted, ABP_BEHV_FLAG, FILLED_COMPONENTS_X
---

## 설명

`%features` 는 BDEF derived type(BDEF 파생 타입)의 구성요소 묶음입니다. feature control(기능 제어, [[abenbdl_actions_fc]]) 정보를 돌려줄 때 씁니다. 묶음 안의 구성요소에 표시를 해서 답을 줍니다.

`%features` 의 구성요소는 **BDEF 에서 feature control 을 건 요소**들입니다. feature control 을 걸지 않은 요소는 들어 있지 않습니다. 구성요소는 예를 들어 이렇게 씁니다.

| 쓰는 법 | 가리키는 것 |
| --- | --- |
| `%features-%update` | 수정 작업 |
| `%features-%delete` | 삭제 작업 |
| `%features-%action-action_name` | action `action_name` |
| `%features-%field-field_name` | 필드 `field_name` |

### 타입

원문은 `%features` 구조의 구성요소 타입을 `ABP_BEHV_FLAG` 로 적고 있습니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `[INSTANCE|GLOBAL] FEATURES RESULT`

## 예제

BDEF 에서 필드, action, association 으로 하는 생성에 instance feature control 을 겁니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  field ( features : instance ) BeginDate;
  action ( features : instance ) acceptTravel result [1] $self;
  association _Booking { create ( features : instance ); }
}
```

handler method(핸들러 메서드)에서 `%features` 를 채워 돌려줍니다. 승인된 여행(`Status = 'A'`)은 시작일을 readonly 로 바꾸고, 다시 승인하거나 예약을 더 만들 수 없게 합니다.

```abap
METHOD get_instance_features.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  LOOP AT lt_travel INTO DATA(ls_travel).
    DATA(lv_accepted) = xsdbool( ls_travel-status = 'A' ).

    APPEND VALUE #(
      %tky      = ls_travel-%tky
      %features = VALUE #(
        %field-begindate     = COND #( WHEN lv_accepted = abap_true
                                       THEN if_abap_behv=>fc-f-read_only
                                       ELSE if_abap_behv=>fc-f-unrestricted )
        %action-accepttravel = COND #( WHEN lv_accepted = abap_true
                                       THEN if_abap_behv=>fc-o-disabled
                                       ELSE if_abap_behv=>fc-o-enabled )
        %assoc-_booking      = COND #( WHEN lv_accepted = abap_true
                                       THEN if_abap_behv=>fc-o-disabled
                                       ELSE if_abap_behv=>fc-o-enabled ) ) )
      TO result.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- 필드에는 `if_abap_behv=>fc-f-...` 상수를, 작업·action·association 에는 `if_abap_behv=>fc-o-...` 상수를 넣습니다. 서로 바꿔 쓰지 않도록 합니다. ([[abapeml_derived_type_flags]])
- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드는 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 값이 채워진 구성요소만 골라 처리하게 도와줍니다. 표시로 이루어진 derived type 구조를 살필 때 쓸모 있습니다.

## 관련 항목

- [[abenbdl_actions_fc]]
- [[abapderived_types_field]]
- [[abapderived_types_action]]
- [[abapderived_types_assoc]]
- [[abapderived_types_update]]
- [[abapderived_types_perm]]
- [[abenderived_types_misc_abexa]]
