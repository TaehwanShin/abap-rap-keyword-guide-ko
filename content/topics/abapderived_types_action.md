---
title: action 표시 (%action)
summary: BDEF 에 정의한 action 을 구성요소로 둔 구조입니다. feature control·권한 정보를 묻거나 받을 때, 실패한 action 을 알릴 때 표시합니다.
keywords: %action, 액션 표시, ABP_BEHV_FLAG, GET PERMISSIONS, PERMISSIONS REQUEST, PERMISSIONS RESULT, FEATURES, AUTHORIZATION, FAILED, REPORTED, 기능 제어, 권한, FILLED_COMPONENTS_X
---

## 설명

`%action` 은 BDEF derived type(BDEF 파생 타입)에 들어 있는 구조형 구성요소입니다. BDEF 에 정의한 action 이 하나씩 구성요소로 들어 있습니다. action `acceptTravel` 이 있으면 `%action-accepttravel` 이 생깁니다.

쓰임새는 두 가지입니다.

- feature control(기능 제어, [[abenbdl_actions_fc]])에서 action 을 쓸 수 있는지 묻거나 그 답을 돌려줄 때
- response parameter(응답 매개변수)에서 어떤 action 이 실패했는지 알릴 때

어느 경우든 `%action` 구조 안에서 그 action 구성요소에 **표시**를 해야 합니다.

### 타입

`%action` 구조의 구성요소 타입은 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `PERMISSIONS REQUEST`
- `PERMISSIONS RESULT`
- `FAILED [EARLY|LATE]`
- `REPORTED [EARLY|LATE]`
- `[INSTANCE|GLOBAL] FEATURES REQUEST`
- `[INSTANCE|GLOBAL] FEATURES RESULT`
- `[INSTANCE|GLOBAL] AUTHORIZATION REQUEST`
- `[INSTANCE|GLOBAL] AUTHORIZATION RESULT`

## 예제

`GET PERMISSIONS` 문으로 여행 승인 action 을 쓸 수 있는지 묻습니다. 요청 구조에서 `%action-accepttravel` 에 표시를 하고, 결과에서 같은 구성요소를 읽습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

" 승인 action 의 허용 정보를 요청한다
ls_request = VALUE #( %action-accepttravel = if_abap_behv=>mk-on ).

GET PERMISSIONS ONLY INSTANCE ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' ) )
  REQUEST ls_request
  RESULT DATA(ls_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_result-instances INTO DATA(ls_instance).
  IF ls_instance-%action-accepttravel = if_abap_behv=>perm-o-unauthorized.
    " 이 여행은 승인할 권한이 없다
  ENDIF.
ENDLOOP.
```

## 알아두기

- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드는 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 값이 채워진 구성요소만 골라 처리하게 도와줍니다. `%action` 처럼 표시로만 이루어진 구조를 살필 때 쓸모 있습니다.
- 요청할 때 넣는 값과 결과로 받는 값은 쓰는 상수가 다릅니다. [[abapeml_derived_type_flags]] 를 참고합니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_actions_fc]]
- [[abapget_permissions]]
- [[abapderived_types_op]]
- [[abapderived_types_assoc]]
- [[abapderived_types_features]]
- [[abenderived_types_misc_abexa]]
