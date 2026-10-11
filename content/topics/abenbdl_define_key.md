---
title: BDEF 대체 키 (define pure key / define secondary key)
summary: entity 의 기본 키 말고, 다른 필드 조합을 대체 키로 직접 정의합니다. 순수 키와 보조 키 두 가지가 있습니다.
keywords: define key, define pure key, define secondary key, 대체 키, alternative key, 순수 키, 보조 키, secondary table key, key function, 키 함수, use key, %data
---

## 문법

```syntax
define {pure|secondary} key AlternativeKey { altKeyField1; altKeyField2; }
```

## 설명

behavior definition(동작 정의)에는 원래 두 가지 키가 있습니다.

- **기본 키** : 기반 CDS 데이터 모델의 키 정의에서 그대로 옵니다.
- **미리 정해진 보조 테이블 키** : BDEF derived type(BDEF 파생 타입)에 이미 들어 있는 키입니다. [[abapderived_types_secondary_keys]] 를 봅니다.

여기에 더해 직접 정의하는 **대체 키**가 두 가지 있습니다.

| 종류 | 하는 일 |
| --- | --- |
| 순수 키 (`define pure key`) | 기반 CDS entity(엔터티)의 필드 묶음을 대체 키로 쓸 수 있게 정의합니다. 예를 들어 key function([[abenbdl_keyfunction]])의 매개변수 모양을 정할 때 씁니다. |
| 보조 키 (`define secondary key`) | 순수 키와 같은 효과가 있습니다. 여기에 더해, 구성요소 `%data` 가 있는 모든 BDEF derived type 에 **보조 테이블 키**를 만들어 줍니다. `TABLE FOR CREATE`, `TABLE FOR UPDATE`, `TABLE FOR READ RESULT`, `TABLE FOR CHANGE` 등이 해당합니다([[abaptype_table_for]]). |

### 적는 규칙

- `AlternativeKey` 는 대체 키를 가리킬 때 쓰는 이름입니다. 이름 규칙은 `TYPES` 문의 보조 키 이름 규칙을 따릅니다.
- 대체 키는 기반 CDS entity 의 필드 `altKeyField1`, `altKeyField2`, ... 하나 이상으로 이뤄집니다. 같은 필드를 두 번 적을 수 없습니다.
- 보조 키는 entity 하나에 **열 개까지** 정의할 수 있습니다. 순수 키는 개수 제한이 없습니다.
- 보조 키에는 내부 테이블의 보조 테이블 키와 같은 제약이 있습니다. 특히 한 보조 키의 필드가 다른 보조 키 필드의 부분 집합이면 안 됩니다.

### 언제 무엇을 쓰나

대체 키는 예를 들어 key function 의 매개변수 모양을 정하는 데 씁니다. key function 은 RAP 재사용 객체가 끼어 있는 cross-BO association 에서 association 을 따라 읽을 수 있게 해 줍니다.

- key function 을 정의하려는 것이면 **순수 키**를 권장합니다.
- 그 필드들을 보조 색인으로 삼아 테이블을 빠르게 돌고 싶으면 **보조 키**를 권장합니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BDEF 와 RAP BO interface 에서는 base BO(기반 BO) 의 대체 키를 다시 쓸 수 있습니다. [[abenbdl_use_projection]] 을 봅니다.

## 예제

여행 entity 에 순수 키 하나와 보조 키 하나를 정의합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  // 순수 키: key function 의 매개변수 모양으로 쓴다
  define pure key byCustomer { CustomerID; BeginDate; }

  // 보조 키: derived type 테이블에 보조 테이블 키가 생긴다
  define secondary key byAgency { AgencyID; }
}
```

보조 키는 `%data` 가 있는 derived type 테이블에서 보조 테이블 키로 쓸 수 있습니다.

```abap
READ ENTITIES OF zr_travel IN LOCAL MODE
  ENTITY travel
    ALL FIELDS WITH CORRESPONDING #( keys )
  RESULT DATA(lt_travel).

" 보조 키 byagency 로 여행사 070001 의 여행만 돈다
LOOP AT lt_travel INTO DATA(ls_travel)
     USING KEY byagency WHERE agencyid = '070001'.
  " 처리 내용
ENDLOOP.
```

## 알아두기

- 대체 키 필드에는 `STRING`, `RAWSTRING`, `GEOM_EWKB`, `LCHR`, `LRAW` 타입을 쓰지 않는 것이 좋습니다.
- `pure` 나 `secondary` 없이 `define key` 만 적는 문법은 낡은 문법입니다. 쓰지 말고 `define secondary key` 나 `define pure key` 를 씁니다.

## 관련 항목

- [[abenbdl_keyfunction]]
- [[abapderived_types_secondary_keys]]
- [[abapderived_types_data]]
- [[abaptype_table_for]]
- [[abenbdl_use_projection]]
