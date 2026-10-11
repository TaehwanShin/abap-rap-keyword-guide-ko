---
title: field characteristics 표시 (%field)
summary: field characteristics 정보를 묻거나 받을 때 필드를 표시하는 구조입니다. BDEF 에서 field characteristics 를 정한 필드가 구성요소로 들어 있습니다.
keywords: %field, 필드 특성, field characteristics, readonly, mandatory, ABP_BEHV_FEATURE, GET PERMISSIONS, PERMISSIONS REQUEST, PERMISSIONS RESULT, INSTANCE FEATURES, perm-f-read_only, fc-f-read_only, FILLED_COMPONENTS_X
---

## 설명

`%field` 는 BDEF derived type(BDEF 파생 타입)에 들어 있는 구조형 구성요소입니다. field characteristics(필드 특성, [[abenbdl_field_char]]) 정보를 다룰 때 씁니다. readonly 인지, mandatory 입력인지 같은 정보입니다. 구조 안의 구성요소에 표시를 해서 정보를 묻거나 돌려줍니다.

`%field` 의 구성요소는 **BDEF 에서 field characteristics 를 정한 요소**들입니다. 필드 `BeginDate` 는 `%field-begindate` 로 씁니다.

### 타입

데이터 필드 이름을 딴 구성요소로 이루어진 구조입니다. 구성요소 타입은 `ABP_BEHV_FEATURE` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `PERMISSIONS REQUEST`
- `PERMISSIONS RESULT`
- `[INSTANCE] FEATURES REQUEST`
- `[INSTANCE] FEATURES RESULT`

## 예제

`GET PERMISSIONS` 문으로 여행의 필드 두 개가 어떤 상태인지 묻습니다. 요청 구조에서 `%field` 에 표시를 하고, 결과에서 같은 구성요소를 읽습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %field-begindate = if_abap_behv=>mk-on
                      %field-status    = if_abap_behv=>mk-on ).

GET PERMISSIONS ONLY INSTANCE FEATURES ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' ) )
  REQUEST ls_request
  RESULT DATA(ls_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_result-instances INTO DATA(ls_instance).
  IF ls_instance-%field-begindate = if_abap_behv=>perm-f-read_only.
    " 이 여행의 시작일은 지금 고칠 수 없다
  ENDIF.
ENDLOOP.
```

RAP BO provider(제공자) 쪽에서는 instance feature control(기능 제어) handler method(핸들러 메서드)가 `%field` 에 답을 넣습니다.

```abap
" get_instance_features 안에서
APPEND VALUE #(
  %tky             = ls_travel-%tky
  %field-begindate = COND #( WHEN ls_travel-status = 'A'
                             THEN if_abap_behv=>fc-f-read_only
                             ELSE if_abap_behv=>fc-f-unrestricted ) )
  TO result.
```

## 알아두기

- feature control 쪽 쓰이는 곳은 `INSTANCE` 만 적혀 있습니다. `%create` 나 `%action` 과 달리 `GLOBAL FEATURES` 타입은 목록에 없습니다.
- 구성요소 타입으로 적힌 `ABP_BEHV_FEATURE` 는 필드 허용 정보와 feature control 결과용으로는 낡은 타입입니다. 대신 `ABP_BEHV_FIELD_PERM` 이나 `ABP_BEHV_FIELD_CTRL` 을 씁니다. ([[abapeml_derived_type_flags]])
- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드는 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 값이 채워진 구성요소만 골라 처리하게 도와줍니다. 표시로 이루어진 derived type 구조를 살필 때 쓸모 있습니다.

## 관련 항목

- [[abenbdl_field_char]]
- [[abenbdl_actions_fc]]
- [[abapget_permissions]]
- [[abapderived_types_features]]
- [[abapderived_types_perm]]
- [[abapderived_types_control]]
- [[abenderived_types_misc_abexa]]
