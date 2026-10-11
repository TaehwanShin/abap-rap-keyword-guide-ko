---
title: 삭제 작업 표시 (%delete)
summary: standard operation 가운데 삭제를 가리키는 표시입니다. 삭제 권한·feature control 정보를 묻거나 받을 때, 삭제가 실패했음을 알릴 때 씁니다.
keywords: %delete, 삭제 작업 표시, delete, ABP_BEHV_FLAG, GET PERMISSIONS, PERMISSIONS REQUEST, PERMISSIONS RESULT, FEATURES, AUTHORIZATION, FAILED, REPORTED, 표준 작업
---

## 설명

`%delete` 는 BDEF derived type(BDEF 파생 타입)의 구성요소입니다. standard operation(표준 작업)의 제어 정보를 묻거나 돌려줄 때 쓰는 표시이고, 그 가운데 **삭제**를 가리킵니다.

예를 들어 `DELETE` 작업([[abapmodify_entity_entities_op]])을 했을 때, `failed` 응답([[abaptype_response_for]])의 `%delete` 표시를 보면 인스턴스 삭제가 실패했는지 알 수 있습니다.

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

instance 권한 handler method(핸들러 메서드)에서 `%delete` 에 답을 넣습니다. 승인된 여행(`Status = 'A'`)은 지울 수 없게 합니다.

```abap
METHOD get_instance_authorizations.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky    = ls_travel-%tky
      %delete = COND #( WHEN ls_travel-status = 'A'
                        THEN if_abap_behv=>auth-unauthorized
                        ELSE if_abap_behv=>auth-allowed ) ) ).
ENDMETHOD.
```

RAP BO consumer(사용자)는 삭제를 요청한 뒤 `failed` 에서 `%delete` 표시를 확인합니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    DELETE FROM VALUE #( ( travelid = '00000001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_failed-travel INTO DATA(ls_fail)
     WHERE %delete = if_abap_behv=>mk-on.
  " 삭제하지 못한 여행: ls_fail-travelid
ENDLOOP.
```

## 알아두기

- 요청할 때는 `if_abap_behv=>mk-on` 으로 표시하고, 결과는 권한·feature control(기능 제어)·허용 정보용 상수로 읽습니다. 상수 종류는 [[abapeml_derived_type_flags]] 에 있습니다.
- 생성과 수정에는 짝이 되는 [[abapderived_types_create]], [[abapderived_types_update]] 가 있습니다. 세 표시는 [[abapderived_types_op]] 로 묶여 있습니다.

## 관련 항목

- [[abapderived_types_create]]
- [[abapderived_types_update]]
- [[abapderived_types_op]]
- [[abapderived_types_fail]]
- [[abapget_permissions]]
- [[abenbdl_standard_operations]]
- [[abenderived_types_misc_abexa]]
