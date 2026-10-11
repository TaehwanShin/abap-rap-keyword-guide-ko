---
title: 저장 방식 (with additional save, with unmanaged save)
summary: managed RAP BO 의 기본 저장에 단계를 보태거나(additional save) 기본 저장을 끄고 직접 저장하게(unmanaged save) 하는 구문입니다. save_modified 를 다시 구현해야 합니다.
keywords: SavingOptions, with additional save, with unmanaged save, and cleanup, with full data, 추가 저장, 비관리형 저장, 저장 방식, save_modified, cleanup, saver class, 세이버 클래스, %data, %control
---

## 문법

```syntax
... {with additional save [and cleanup][with full data]}
  | {with unmanaged save [and cleanup][with full data]} ...
```

## 설명

managed RAP BO 는 기본으로 RAP 프레임워크가 저장을 해 줍니다(managed 저장). 이 구문으로 그 저장을 바꿉니다.

| 구문 | 이름 | 하는 일 |
| --- | --- | --- |
| `with additional save` | additional save | 기본 save sequence(저장 순서)에 단계를 **보탭니다**. managed 저장은 그대로 일어납니다. |
| `with unmanaged save` | unmanaged save | 기본 저장을 **막고**, 직접 만든 저장 로직으로 바꿉니다. |

두 구문 모두 behavior pool(동작 풀)의 [[abenabp_saver_class|saver class]] 에서 메서드 [[abaprap_saver_meth_save_modified|save_modified]] 를 다시 구현해야 합니다.

### 적는 자리

- **BDEF 머리말**, 키워드 `managed` 바로 뒤. BO 의 모든 entity(엔터티)에 걸립니다. 예) `managed with additional save implementation in class ...;`
- **entity 동작 특성**. entity 마다 따로 정할 수 있습니다. 예) `define behavior for EntityName with unmanaged save`

### 쓸 수 있는 곳

managed RAP BO 에서만 씁니다. unmanaged BO 는 본디 저장 방식을 직접 만듭니다.

### with additional save

기본 save sequence 도중에 다른 기능을 더 부를 수 있게 합니다. change documents 를 쓰거나 애플리케이션 로그를 남기는 일이 그 예입니다. 로컬 saver class(세이버 클래스)에 구현이 있어야 합니다.

### with unmanaged save

BO 의 managed 런타임이 변경 내용을 저장하지 못하게 막고, 직접 만든 저장 방식을 구현하게 합니다. 로컬 saver class 에 구현이 있어야 합니다.

unmanaged save 에서는 [[abenbdl_persistent_table|persistent table]] 을 적으면 안 됩니다.

### and cleanup

붙이면 saver method(세이버 메서드) [[abensaver_method_cleanup|cleanup]] 도 다시 정의해야 합니다.

### with full data

additional save 나 unmanaged save 를 쓰면, 기본으로는 **키 필드와 바뀐 필드의 값만** `save_modified` 에 넘어옵니다. `with full data` 를 붙이면 인스턴스 데이터 **전부**가 넘어옵니다. 곧 `save_modified` 가 불릴 때 구성요소 묶음 [[abapderived_types_data|%data]] 의 모든 필드에 값이 채워져 있습니다.

- 구성요소 묶음 [[abapderived_types_control|%control]] 은 달라지지 않습니다. `%control` 에는 여전히 바뀐 필드만 표시됩니다.
- 바뀐 필드뿐 아니라 모든 필드가 뒤처리에 필요할 때 씁니다. `READ` 를 한 번 더 하지 않아도 됩니다.

## 예제

머리말에 `with full data` 를 붙인 additional save 를 정합니다.

```bdl
managed with additional save with full data
implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

behavior pool 의 saver class 에서 `save_modified` 를 다시 정의합니다. 여기서는 바뀐 여행을 로그 테이블 `ztravel_log` 에 남깁니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    " update-travel : 이번 트랜잭션에서 수정된 여행
    IF update-travel IS NOT INITIAL.
      INSERT ztravel_log FROM TABLE @( VALUE #(
        FOR ls_travel IN update-travel
        ( travel_id  = ls_travel-travelid
          status     = ls_travel-status      " with full data 라서 안 바뀐 필드도 값이 있다
          changed_at = utclong_current( ) ) ) ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer(사용자)가 `AgencyID` 만 고칩니다. `Status` 는 건드리지 않습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( agencyid )
    WITH VALUE #( ( travelid = '00000001' agencyid = '070002' ) ).

COMMIT ENTITIES.
```

`with full data` 가 있으면 `save_modified` 의 `update-travel` 에 `Status` 를 비롯한 모든 필드의 값이 들어옵니다. `with full data` 가 없으면 고친 필드인 `AgencyID` 와 키 필드만 믿을 수 있습니다.

## 알아두기

- `with full data` 없이 넘어온 데이터에서, 고치지 않은 필드에는 믿을 수 있는 값이 들어 있지 않습니다. 초기값처럼 보일 때도 있지만 늘 그런 것은 아닙니다. 고치지 않은 필드의 값은 읽어 쓰면 안 됩니다.
- additional save 와 unmanaged save 에서는 saver method `save` 가 아니라 `save_modified` 를 구현합니다.

## 관련 항목

- [[abaprap_saver_meth_save_modified]]
- [[abenabp_saver_class]]
- [[abensaver_method_cleanup]]
- [[abenrap_additional_save_abexa]]
- [[abenrap_managed_unm_save_abexa]]
- [[abapderived_types_data]]
- [[abapderived_types_control]]
- [[abenbdl_persistent_table]]
- [[abenbdl_bdef_header]]
- [[abenbdl_character]]
