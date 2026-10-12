---
title: SET NAMES 문
summary: BDEF derived type 의 %control 이나 %element 에서 값이 들어 있는 칸을 찾아 그 필드 이름들을 목록으로 뽑아내는 문입니다.
keywords: SET NAMES, FROM FLAGS, MAPPING TYPE, MAPPING LIKE, %control, %element, ABP_FIELD_NAME_TAB, ABP_FIELD_NAME, 필드 이름 목록, 표시 값, type mapping, 타입 매핑, BEHAVIOR_FLAGS_NAMES_ERROR, TCHK_TYPE_LOAD
---

## 문법

```syntax
SET NAMES fields FROM FLAGS src { MAPPING { TYPE p_type }
                                        | { LIKE var }
                                }.
```

원문의 문법 틀은 `MAPPING` 을 꼭 붙이는 것처럼 적혀 있습니다. 하지만 원문 예제는 `SET NAMES fields FROM FLAGS src.` 처럼 `MAPPING` 없이도 씁니다. 위 틀은 이름 mapping 을 함께 쓰는 꼴입니다.

## 설명

[[abapset_flags|SET FLAGS]] 의 반대 방향입니다. BDEF derived type(BDEF 파생 타입)의 [[abapderived_types_comp|%control]] 이나 [[abapderived_types_comp|%element]] 구조를 보고, **초기값이 아닌 칸의 필드 이름**을 목록에 담습니다. 이 구조들의 칸은 기술 타입이 `x` 입니다.

RAP BO 는 BDEF derived type 을 쓰는데 동작을 구현한 코드는 다른 타입을 쓰는 응용 프로그램에서 쓰려고 만든 문입니다. 그 다른 타입의 필드 이름이 RAP BO 의 CDS entity(엔터티)와 다르면 이름 mapping 이 필요합니다.

- `fields` : 결과를 받는 필드 이름 목록입니다. 일반 식을 쓸 수 있는 자리이고, 변수를 쓴다면 필드 이름을 담는 테이블이어야 합니다. 타입은 `ABP_FIELD_NAME_TAB`, 줄 타입은 `ABP_FIELD_NAME` 입니다.
- `src` : 일반 식을 쓸 수 있는 자리입니다. 변수를 쓴다면 `%control` 이나 `%element` 가 들어 있는 BDEF derived type 이어야 합니다.

### MAPPING TYPE p_type

구조로 된 DDIC 타입(예: 옛 타입)과 type mapping 이 필요할 때 씁니다. behavior definition(동작 정의)에 그 타입의 mapping([[abenbdl_type_mapping|mapping for]])이 있어야 합니다.

### MAPPING LIKE var

하는 일은 `MAPPING TYPE` 과 같습니다. 타입 이름을 쓸 수 없고 그 타입으로 된 변수만 있을 때 씁니다. 여기서도 behavior definition 에 mapping 이 있어야 합니다.

## 예제

```abap
DATA: lt_fields     TYPE abp_field_name_tab,
      lt_old_fields TYPE abp_field_name_tab,
      ls_update     TYPE STRUCTURE FOR UPDATE zr_travel,
      ls_legacy     TYPE zstravel_legacy.

ls_update-%control = VALUE #( TravelID = if_abap_behv=>mk-on
                              AgencyID = if_abap_behv=>mk-off
                              Status   = if_abap_behv=>mk-on ).

" on 인 필드의 이름만 목록에 담긴다. AgencyID 는 들어가지 않는다
SET NAMES lt_fields FROM FLAGS ls_update.

" 옛 구조의 필드 이름으로 받는다 (behavior definition 에 mapping for zstravel_legacy 가 있다)
SET NAMES lt_old_fields FROM FLAGS ls_update MAPPING TYPE zstravel_legacy.

" 타입 이름 대신 그 타입의 변수로 mapping 을 가리킨다
SET NAMES lt_old_fields FROM FLAGS ls_update MAPPING LIKE ls_legacy.
```

## 알아두기

- 실행할 수 없는 경우에는 런타임 오류가 납니다.
  - `TCHK_TYPE_LOAD` : 필드 이름 쪽 타입이 맞지 않습니다.
  - `BEHAVIOR_FLAGS_NAMES_ERROR` : BDEF derived type 쪽 타입이 맞지 않거나, `MAPPING` 을 쓴 변형에서 mapping 이 없습니다.
- `%element` 에는 RAP BO 의 association 이름이 모두 들어 있습니다. 그런데 association 에는 type mapping 을 정의할 수 없습니다. 그래서 `%element` 가 있는 derived type 에 `MAPPING` 을 함께 쓰면 association 에 해당하는 정보는 사라집니다. `fields` 에는 mapping 된 구성요소 이름만 남습니다.
- 실행 예제는 `MAPPING` 을 붙이지 않은 꼴까지 세 가지를 보여 줍니다. [[abeneml_set_names_abexa]] 를 보세요.

## 관련 항목

- [[abapset_flags]]
- [[abeneml_set_names_abexa]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_comp]]
- [[abapderived_types_control]]
- [[abapderived_types_element]]
- [[abapeml_type_mapping]]
