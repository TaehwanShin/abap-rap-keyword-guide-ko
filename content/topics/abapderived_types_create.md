---
title: 생성 작업 표시 (%create)
summary: standard operation 가운데 생성을 가리키는 표시입니다. 생성 권한·feature control 정보를 묻거나 받을 때, 생성이 실패했음을 알릴 때 씁니다.
keywords: %create, 생성 작업 표시, create, ABP_BEHV_FLAG, GET PERMISSIONS, PERMISSIONS REQUEST, PERMISSIONS RESULT, FEATURES, AUTHORIZATION, FAILED, REPORTED, 표준 작업
---

## 설명

`%create` 는 BDEF derived type(BDEF 파생 타입)의 구성요소입니다. standard operation(표준 작업)의 제어 정보를 묻거나 돌려줄 때 쓰는 표시이고, 그 가운데 **생성**을 가리킵니다.

예를 들어 `CREATE` 작업([[abapmodify_entity_entities_op]])을 했을 때, `failed` 응답([[abaptype_response_for]])의 `%create` 표시를 보면 인스턴스 생성이 실패했는지 알 수 있습니다.

### 타입

`ABP_BEHV_FLAG`

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

`GET PERMISSIONS` 문으로 여행을 새로 만들 수 있는지 묻습니다. 요청 구조에서 `%create` 에 표시를 하고, 결과의 `global` 구조에서 같은 구성요소를 읽습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %create = if_abap_behv=>mk-on ).

GET PERMISSIONS ONLY GLOBAL ENTITY zr_travel
  REQUEST ls_request
  RESULT DATA(ls_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

IF ls_result-global-%create = if_abap_behv=>perm-o-unauthorized.
  " 지금 사용자는 여행을 만들 권한이 없다
ENDIF.
```

RAP BO provider(제공자) 쪽에서는 global 권한 handler method(핸들러 메서드)가 이 물음에 답합니다.

```abap
METHOD get_global_authorizations.
  " 생성 권한을 물었을 때만 답한다
  IF requested_authorizations-%create = if_abap_behv=>mk-on.
    AUTHORITY-CHECK OBJECT 'ZTRAVEL' ID 'ACTVT' FIELD '01'.
    result-%create = COND #( WHEN sy-subrc = 0
                             THEN if_abap_behv=>auth-allowed
                             ELSE if_abap_behv=>auth-unauthorized ).
  ENDIF.
ENDMETHOD.
```

## 알아두기

- 요청할 때는 `if_abap_behv=>mk-on` 으로 표시하고, 결과는 권한·feature control(기능 제어)·허용 정보용 상수로 읽습니다. 상수 종류는 [[abapeml_derived_type_flags]] 에 있습니다.
- 수정과 삭제에는 짝이 되는 [[abapderived_types_update]], [[abapderived_types_delete]] 가 있습니다. 세 표시는 [[abapderived_types_op]] 로 묶여 있습니다.

## 관련 항목

- [[abapderived_types_update]]
- [[abapderived_types_delete]]
- [[abapderived_types_op]]
- [[abapget_permissions]]
- [[abenbdl_standard_operations]]
- [[abenderived_types_misc_abexa]]
