---
title: CORRESPONDING type mapping (ABAP EML)
summary: CORRESPONDING 연산자의 RAP 전용 변형으로, BDEF derived type 과 그렇지 않은 타입 사이에서 필드 이름 mapping 과 %control 을 함께 처리해 값을 옮깁니다.
keywords: CORRESPONDING, MAPPING FROM ENTITY, MAPPING TO ENTITY, USING CONTROL, CHANGING CONTROL, type mapping, 타입 매핑, %control, 레거시 타입, legacy type, BDEF derived type, BDEF 파생 타입, mapping for
---

## 문법

```syntax
    { [ non_der_type = | ... ] CORRESPONDING {dtype|#}( [ ... ] in_der_type MAPPING FROM ENTITY ) }
  | { [ out_der_type = | ... ] CORRESPONDING {dtype|#}( [ ... ] non_der_type MAPPING TO ENTITY ) }
  | { [ non_der_type = | ... ] CORRESPONDING {dtype|#}( [ ... ] in_der_type [ ... ] USING CONTROL [ ... ] ) }
  | { [ non_der_type = | ... ] CORRESPONDING {dtype|#}( [ ... ] in_der_type MAPPING FROM ENTITY USING CONTROL ) }
  | { [ in_der_type = | ... ] CORRESPONDING {dtype|#}( [ ... ] non_der_type [ ... ] CHANGING CONTROL [ ... ] ) } ...
```

## 설명

RAP 에서 provider(제공자)와 consumer(사용자)는 BDEF derived type(BDEF 파생 타입)으로 데이터를 주고받습니다. 한편 실제 처리 로직은 BDEF 에서 나오지 않은 타입, 흔히 예전부터 쓰던 타입으로 짜여 있기도 합니다. 기존 기능을 RAP 로 감싸는 [[abenbdl_impl_type|unmanaged]] 구현에서 특히 그렇습니다. managed 라도 이미 있는 determination·validation 코드가 옛 타입을 쓰면 같은 일이 생깁니다.

이 `CORRESPONDING` 변형들은 두 쪽 타입을 서로 맞춰 줍니다. 다음 두 경우에 필요합니다.

- 옛 타입의 필드 이름이 RAP BO 의 필드 이름과 다를 때
- "어느 필드가 채워졌는가" 하는 정보([[abapderived_types_comp|%control]])가 옛 타입 쪽에 따로 있을 때

필드마다 대입문을 따로 쓰지 않아도 되므로 고치기 쉽고 실수가 줄어듭니다. 일부 변형은 behavior definition(동작 정의)에 [[abenbdl_type_mapping|mapping for]] 가 미리 있어야 합니다.

문법 틀에 나오는 이름의 뜻은 이렇습니다.

| 이름 | 뜻 |
| --- | --- |
| `non_der_type` | BDEF 에서 나오지 않은 타입의 데이터 객체 |
| `in_der_type` | RAP 입력 derived type. 예) `TYPE TABLE FOR UPDATE`, `TYPE STRUCTURE FOR UPDATE` |
| `out_der_type` | RAP 출력 derived type. 예) [[abaptype_table_for|TYPE TABLE FOR READ RESULT]], [[abaptype_structure_for|TYPE STRUCTURE FOR READ RESULT]] |
| `dtype` / `#` | 결과 타입. 일반 `CORRESPONDING` 과 같습니다. |
| 괄호 안의 `...` | 변형마다 정해진 자리에 올 수 있는 추가 구문 |

### 변형 한눈에 보기

| 변형 | 방향 | BDEF 의 mapping | 하는 일 |
| --- | --- | --- | --- |
| `MAPPING FROM ENTITY` | 입력 derived type → 일반 타입 | 필요 | 필드 이름을 mapping 대로 바꿔 옮깁니다. |
| `MAPPING TO ENTITY` | 일반 타입 → 출력 derived type | 필요 | 필드 이름을 mapping 대로 바꿔 옮깁니다. |
| `USING CONTROL` | 입력 derived type → 일반 타입 | 필요 없음 | `%control` 에서 on 인 필드만 옮깁니다. |
| `MAPPING FROM ENTITY USING CONTROL` | 입력 derived type → 일반 타입 | 필요 (`control` 표기 포함) | 이름을 바꾸면서 `%control` 에서 on 인 필드만 옮깁니다. |
| `CHANGING CONTROL` | 일반 타입 → 입력 derived type | 필요 없음 | 값을 옮기면서 `%control` 을 채웁니다. |

### MAPPING FROM ENTITY

입력 derived type 을 일반 타입으로 옮깁니다. 그 일반 타입의 mapping 이 behavior definition 에 있어야 합니다.

### MAPPING TO ENTITY

일반 타입을 출력 derived type 으로 옮깁니다. 여기서도 mapping 이 behavior definition 에 있어야 합니다.

### USING CONTROL

`%control` 을 따져서 옮깁니다. `in_der_type` 은 `%control` 구성요소가 있는 BDEF derived type 이어야 합니다. `%control` 에서 on 인 필드만 옮기고, off 인(초기값인) 필드는 옮기지 않습니다. 예제처럼 `BASE` 없이 쓰면 옮기지 않은 필드는 결과에서 초기값이 됩니다. behavior definition 에 mapping 이 없어도 됩니다.

### MAPPING FROM ENTITY USING CONTROL

앞의 두 가지를 합친 변형입니다. `%control` 에서 on 인 필드만 옮기는데, 일반 타입의 필드 이름이 BDEF derived type 과 다를 때 씁니다. 그래서 behavior definition 에 `control` 표기가 들어간 mapping 이 있어야 합니다.

### CHANGING CONTROL

제어 정보가 없는 일반 타입을 보고 BDEF derived type 의 `%control` 을 채웁니다. 일반 타입의 필드가 초기값이면 그 필드의 `%control` 을 초기값(`00`)으로 두고, 값이 있으면 on 으로 둡니다(`01`). 입력 derived type 에만 쓸 수 있습니다. 입력 derived type 에는 모두 `%control` 구조가 있기 때문입니다.

behavior definition 에 mapping 이 없어도 됩니다. 다만 일반 타입의 필드 이름이 달라서 이름 mapping 까지 해야 한다면 두 단계로 나눕니다. behavior definition 에 `control` 표기가 들어간 mapping 을 적어 두고, 먼저 `MAPPING TO ENTITY` 로 이름을 맞춘 다음, 그 결과에 `CHANGING CONTROL` 을 써서 `%control` 을 채웁니다.

### 괄호 안에 쓸 수 있는 추가 구문

| 변형 | 내부 테이블 타입 | 구조 타입 |
| --- | --- | --- |
| `MAPPING FROM ENTITY`, `MAPPING TO ENTITY`, `MAPPING FROM ENTITY USING CONTROL` | 없음 | `BASE`, `APPENDING` |
| `USING CONTROL`, `CHANGING CONTROL` | `BASE`, `APPENDING`, `EXACT`, `MAPPING`, `DISCARDING DUPLICATES`, `EXCEPT` | `BASE`, `APPENDING`, `EXACT`, `MAPPING`, `EXCEPT` |

## 예제

옛 구조 `zstravel_legacy` 는 필드 이름이 entity(엔터티)와 다릅니다(`trav_id`, `agency`, `stat`). behavior definition 에 짝을 적어 둡니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  // 옛 구조와 그 제어 구조의 필드를 entity 필드와 짝짓는다
  mapping for zstravel_legacy control zstravel_legacy_x corresponding
  {
    TravelID = trav_id control trav_id_x;
    AgencyID = agency  control agency_x;
    Status   = stat    control stat_x;
  }
}
```

ABAP 에서는 변형을 골라 한 줄로 옮깁니다. `zstravel_plain` 은 필드 이름이 entity 와 같은 구조입니다.

```abap
DATA: lt_update TYPE TABLE FOR UPDATE zr_travel,
      lt_result TYPE TABLE FOR READ RESULT zr_travel,
      lt_legacy TYPE STANDARD TABLE OF zstravel_legacy WITH EMPTY KEY,
      lt_plain  TYPE STANDARD TABLE OF zstravel_plain WITH EMPTY KEY.

lt_update = VALUE #( ( TravelID = '00000001' AgencyID = '070001' Status = 'A'
                       %control = VALUE #( TravelID = if_abap_behv=>mk-on
                                           AgencyID = if_abap_behv=>mk-off
                                           Status   = if_abap_behv=>mk-on ) ) ).

" 1) 입력 derived type → 옛 구조 (이름을 mapping 대로 바꾼다)
lt_legacy = CORRESPONDING #( lt_update MAPPING FROM ENTITY ).

" 2) 옛 구조 → 출력 derived type
lt_result = CORRESPONDING #( lt_legacy MAPPING TO ENTITY ).

" 3) %control 에서 on 인 필드만 옮긴다. AgencyID 는 off 라서 옮기지 않는다
lt_plain = CORRESPONDING #( lt_update USING CONTROL ).

" 4) 이름을 바꾸면서 on 인 필드만 옮긴다
lt_legacy = CORRESPONDING #( lt_update MAPPING FROM ENTITY USING CONTROL ).

" 5) 값이 있는 필드는 %control 을 on 으로 하고, 비어 있는 필드는 off 로 둔다
lt_update = CORRESPONDING #( lt_plain CHANGING CONTROL ).
```

## 알아두기

- `MAPPING FROM ENTITY`, `MAPPING TO ENTITY`, `MAPPING FROM ENTITY USING CONTROL` 은 behavior definition 에 그 타입의 mapping 이 없으면 쓸 수 없습니다. `USING CONTROL` 과 `CHANGING CONTROL` 은 mapping 없이 씁니다.
- 내부 테이블을 옮길 때 `MAPPING ... ENTITY` 가 들어간 변형에는 다른 추가 구문을 함께 쓸 수 없습니다.
- `CHANGING CONTROL` 로 이름이 다른 타입을 옮기려면 `MAPPING TO ENTITY` 를 쓴 문장을 먼저 따로 한 번 거쳐야 합니다.

## 관련 항목

- [[abeneml_type_mapping_abexa]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_comp]]
- [[abapmapping_from_entity]]
- [[abapset_flags]]
- [[abapset_names]]
- [[abapeml_type_mapping]]
