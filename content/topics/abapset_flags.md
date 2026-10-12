---
title: SET FLAGS 문
summary: 필드 이름 목록을 받아 BDEF derived type 의 %control 이나 %element 에서 그 필드들을 on 으로 하고 나머지는 off 로 하는 문입니다.
keywords: SET FLAGS, FROM NAMES, MAPPING TYPE, MAPPING LIKE, %control, %element, ABP_FIELD_NAME_TAB, ABP_FIELD_NAME, 필드 이름 목록, 표시 값, type mapping, 타입 매핑, BEHAVIOR_FLAGS_NAMES_ERROR, TCHK_TYPE_LOAD
---

## 문법

```syntax
SET FLAGS src FROM NAMES fields { MAPPING { TYPE p_type }
                                        | { LIKE var }
                                }.
```

원문의 문법 틀은 `MAPPING` 을 꼭 붙이는 것처럼 적혀 있습니다. 하지만 원문 예제는 `SET FLAGS src FROM NAMES fields.` 처럼 `MAPPING` 없이도 씁니다. 위 틀은 이름 mapping 을 함께 쓰는 꼴입니다.

## 설명

BDEF derived type(BDEF 파생 타입)에는 [[abapderived_types_comp|%control]] 이나 [[abapderived_types_comp|%element]] 같은 구성요소가 있습니다. 그 안의 칸은 필드마다 하나씩 있고 기술 타입이 `x` 입니다. `SET FLAGS` 는 **필드 이름 목록**을 이 칸들의 값으로 바꿔 줍니다. 반대 방향은 [[abapset_names|SET NAMES]] 가 맡습니다.

RAP BO 는 BDEF derived type 을 쓰는데 동작을 구현한 코드는 다른 타입을 쓰는 응용 프로그램에서 쓰려고 만든 문입니다. 그 다른 타입의 필드 이름이 RAP BO 의 CDS entity(엔터티)와 다르면 이름 mapping 이 필요합니다.

- `src` : `%control` 이나 `%element` 가 들어 있는 BDEF derived type 변수입니다.
- `fields` : 일반 식을 쓸 수 있는 자리입니다. 변수를 쓴다면 필드 이름이 하나 이상 든 테이블이어야 합니다. 타입은 `ABP_FIELD_NAME_TAB`, 줄 타입은 `ABP_FIELD_NAME` 입니다.

실행하면 목록에 있는 이름을 `%control` 또는 `%element` 구조의 구성요소 이름으로 찾아 값을 `01` 로 둡니다. 목록에 없는 필드는 `00` 이 됩니다.

### MAPPING TYPE p_type

구조로 된 DDIC 타입(예: 옛 타입)과 type mapping 이 필요할 때 씁니다. 이때 `fields` 에는 **옛 타입의 필드 이름**을 넣습니다. behavior definition(동작 정의)에 그 타입의 mapping([[abenbdl_type_mapping|mapping for]])이 있어야 합니다.

### MAPPING LIKE var

하는 일은 `MAPPING TYPE` 과 같습니다. 타입 이름을 쓸 수 없고 그 타입으로 된 변수만 있을 때 씁니다. `fields` 에는 마찬가지로 옛 타입의 필드 이름을 넣고, behavior definition 에 mapping 이 있어야 합니다.

## 예제

```abap
DATA: lt_fields     TYPE abp_field_name_tab,
      lt_old_fields TYPE abp_field_name_tab,
      ls_create     TYPE STRUCTURE FOR CREATE zr_travel,
      ls_legacy     TYPE zstravel_legacy.

" entity 필드 이름으로 된 목록
lt_fields = VALUE #( ( CONV #( 'TRAVELID' ) )
                     ( CONV #( 'AGENCYID' ) )
                     ( CONV #( 'STATUS' ) ) ).

" 목록에 있는 세 필드의 %control 이 01, 나머지는 00 이 된다
SET FLAGS ls_create FROM NAMES lt_fields.

" 옛 구조의 필드 이름으로 된 목록 (behavior definition 에 mapping for zstravel_legacy 가 있다)
lt_old_fields = VALUE #( ( CONV #( 'TRAV_ID' ) )
                         ( CONV #( 'STAT' ) ) ).

" 타입 이름으로 mapping 을 가리킨다
SET FLAGS ls_create FROM NAMES lt_old_fields MAPPING TYPE zstravel_legacy.

" 그 타입의 변수로 mapping 을 가리킨다
SET FLAGS ls_create FROM NAMES lt_old_fields MAPPING LIKE ls_legacy.
```

## 알아두기

- 실행할 수 없는 경우에는 런타임 오류가 납니다.
  - `TCHK_TYPE_LOAD` : 필드 이름 쪽 타입이 맞지 않습니다.
  - `BEHAVIOR_FLAGS_NAMES_ERROR` : BDEF derived type 쪽 타입이 맞지 않거나, `MAPPING` 을 쓴 변형에서 mapping 이 없습니다.
- `MAPPING` 을 쓸 때 `fields` 에 entity 필드 이름을 넣으면 안 됩니다. mapping 대상인 옛 타입의 필드 이름을 넣습니다.
- 실행 예제는 `MAPPING` 을 붙이지 않은 꼴까지 세 가지를 보여 줍니다. [[abeneml_set_flags_abexa]] 를 보세요.

## 관련 항목

- [[abapset_names]]
- [[abeneml_set_flags_abexa]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_comp]]
- [[abapderived_types_control]]
- [[abapderived_types_element]]
- [[abapeml_type_mapping]]
