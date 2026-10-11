---
title: MAPPING FROM ENTITY 가 붙은 ABAP SQL 문
summary: INSERT, MODIFY, UPDATE, DELETE 문에 MAPPING FROM ENTITY 를 붙여 BDEF derived type 으로 된 구조나 내부 테이블을 DB 테이블에 바로 씁니다.
keywords: MAPPING FROM ENTITY, ABAP SQL, INSERT, MODIFY, UPDATE, DELETE, INDICATORS SET STRUCTURE, %control, type mapping, 타입 매핑, BDEF derived type, BDEF 파생 타입, persistent table, CX_SY_CONVERSION_ERROR
---

## 문법

```syntax
  { INSERT ... }
| { MODIFY ... }
| { UPDATE ... [INDICATORS SET STRUCTURE %control] }
| { DELETE ... } MAPPING FROM ENTITY.
```

## 설명

DB 테이블을 바꾸는 ABAP SQL 문 `INSERT`, `UPDATE`, `MODIFY`, `DELETE` 에 붙이는 추가 구문입니다. BDEF derived type(BDEF 파생 타입)으로 선언한 구조나 내부 테이블을 원본으로 넘길 수 있게 해 줍니다. behavior definition(동작 정의)에 [[abenbdl_type_mapping|type mapping]] 이 적혀 있을 때 특히 쓸모가 있습니다.

원본은 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 로 선언한 구조이거나 [[abaptype_table_for|TYPE TABLE FOR]] 로 선언한 내부 테이블이어야 합니다. 문마다 쓸 수 있는 타입이 정해져 있습니다.

| 문 | 하는 일 | 원본으로 쓸 수 있는 타입 |
| --- | --- | --- |
| `INSERT ... MAPPING FROM ENTITY` | 한 줄 또는 여러 줄을 새로 넣습니다. | `... FOR UPDATE`, `... FOR CREATE`, `... FOR DELETE`, `... FOR CHANGE` |
| `MODIFY ... MAPPING FROM ENTITY` | 없으면 넣고 있으면 고칩니다. | `... FOR UPDATE`, `... FOR CREATE`, `... FOR DELETE`, `... FOR CHANGE` |
| `UPDATE ... MAPPING FROM ENTITY` | 이미 있는 줄을 고칩니다. | `... FOR UPDATE`, `... FOR CREATE`, `... FOR DELETE`, `... FOR CHANGE` |
| `DELETE ... MAPPING FROM ENTITY` | 줄을 지웁니다. | `... FOR DELETE` |

각 문의 나머지 문법은 보통의 `INSERT`, `MODIFY`, `UPDATE`, `DELETE` 와 같습니다.

### UPDATE 와 INDICATORS SET STRUCTURE

`UPDATE` 에는 `INDICATORS SET STRUCTURE %control` 을 함께 쓸 수 있습니다. 그러면 [[abapderived_types_control|%control]] 구조에서 켜진 필드만 고칩니다. 꺼진 필드는 원본에 값이 들어 있어도 DB 에 쓰지 않습니다.

## 예제

derived type 으로 받은 데이터를 persistent table `ztravel` 에 그대로 씁니다.

```abap
DATA: ls_create TYPE STRUCTURE FOR CREATE zr_travel,
      lt_create TYPE TABLE FOR CREATE zr_travel,
      lt_update TYPE TABLE FOR UPDATE zr_travel,
      lt_delete TYPE TABLE FOR DELETE zr_travel.

ls_create = VALUE #( TravelID = '00000001' AgencyID = '070001' Status = 'N' ).
lt_create = VALUE #( ( TravelID = '00000002' AgencyID = '070001' Status = 'N' ) ).

" 새로 넣기: 구조 하나, 내부 테이블 통째
INSERT ztravel FROM @ls_create MAPPING FROM ENTITY.
INSERT ztravel FROM TABLE @lt_create MAPPING FROM ENTITY.

" 넣거나 고치기
MODIFY ztravel FROM TABLE @lt_create MAPPING FROM ENTITY.

" %control 에서 켜진 Status 만 고친다. AgencyID 값은 쓰지 않는다
lt_update = VALUE #( ( TravelID = '00000001' AgencyID = '079999' Status = 'A'
                       %control = VALUE #( TravelID = if_abap_behv=>mk-on
                                           AgencyID = if_abap_behv=>mk-off
                                           Status   = if_abap_behv=>mk-on ) ) ).
UPDATE ztravel FROM TABLE @lt_update
  INDICATORS SET STRUCTURE %control MAPPING FROM ENTITY.

" 지우기
lt_delete = VALUE #( ( TravelID = '00000002' ) ).
DELETE ztravel FROM TABLE @lt_delete MAPPING FROM ENTITY.
```

## 알아두기

- `UPDATE ... MAPPING FROM ENTITY` 변형은 지금은 관련된 behavior definition 에 [[abenbdl_persistent_table|persistent table]] 이 적혀 있는 경우에만 쓸 수 있습니다.
- `DELETE` 의 원본은 `... FOR DELETE` 타입만 됩니다.
- 타입 변환이 까다로운 경우(예: `INT4` 를 `NUMC` 로)에는 따로 코드를 쓰지 않아도 [[abapeml_corresponding|CORRESPONDING #( ... MAPPING FROM ENTITY )]] 가 자동으로 실행됩니다.
- 타입 변환에 실패하면 잡을 수 있는 예외 `CX_SY_CONVERSION_ERROR` 가 납니다.

## 관련 항목

- [[abensql_mapping_from_entity_abexa]]
- [[abapeml_corresponding]]
- [[abenbdl_type_mapping]]
- [[abenbdl_persistent_table]]
- [[abapderived_types_control]]
- [[abapeml_type_mapping]]
