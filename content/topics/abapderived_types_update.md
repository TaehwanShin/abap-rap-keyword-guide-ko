---
title: 수정 작업 표시 (%update)
summary: standard operation 가운데 수정을 가리키는 표시입니다. 수정 권한·feature control 정보를 묻거나 받을 때, 수정이 실패했음을 알릴 때 씁니다.
keywords: %update, 수정 작업 표시, update, ABP_BEHV_FLAG, GET PERMISSIONS, PERMISSIONS REQUEST, PERMISSIONS RESULT, FEATURES, AUTHORIZATION, FAILED, REPORTED, 표준 작업
---

## 설명

`%update` 는 BDEF derived type(BDEF 파생 타입)의 구성요소입니다. standard operation(표준 작업)의 제어 정보를 묻거나 돌려줄 때 쓰는 표시이고, 그 가운데 **수정**을 가리킵니다.

예를 들어 `UPDATE` 작업([[abapmodify_entity_entities_op]])을 했을 때, `failed` 응답([[abaptype_response_for]])의 `%update` 표시를 보면 인스턴스 수정이 실패했는지 알 수 있습니다.

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

BDEF 에서 수정에 instance feature control(기능 제어)를 겁니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update ( features : instance );
  delete;
}
```

handler method(핸들러 메서드)에서 `%update` 에 답을 넣습니다. 승인된 여행(`Status = 'A'`)은 더 고칠 수 없게 합니다.

```abap
METHOD get_instance_features.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky    = ls_travel-%tky
      %update = COND #( WHEN ls_travel-status = 'A'
                        THEN if_abap_behv=>fc-o-disabled
                        ELSE if_abap_behv=>fc-o-enabled ) ) ).
ENDMETHOD.
```

## 알아두기

- 요청할 때는 `if_abap_behv=>mk-on` 으로 표시하고, 결과는 권한·feature control·허용 정보용 상수로 읽습니다. 상수 종류는 [[abapeml_derived_type_flags]] 에 있습니다.
- 생성과 삭제에는 짝이 되는 [[abapderived_types_create]], [[abapderived_types_delete]] 가 있습니다. 세 표시는 [[abapderived_types_op]] 로 묶여 있습니다.

## 관련 항목

- [[abapderived_types_create]]
- [[abapderived_types_delete]]
- [[abapderived_types_op]]
- [[abapderived_types_features]]
- [[abapget_permissions]]
- [[abenbdl_standard_operations]]
- [[abenderived_types_misc_abexa]]
