---
title: abstract BDEF의 behavior definition 머리말
summary: abstract BDEF 맨 위에 적는 머리말로, 구현 타입 abstract 와 strict mode, extensibility, 계층 타입을 만드는 with hierarchy 를 정합니다.
keywords: abstract, strict, extensible, with hierarchy, with hierarchy like entity, like entity, 추상 BDEF 머리말, 동작 정의 머리말, behavior definition header, 계층 타입, TYPE STRUCTURE FOR HIERARCHY, TYPE TABLE FOR HIERARCHY
---

## 문법

```syntax
abstract;
[strict[(version)];]
[extensible;]
[with hierarchy [like entity];]
 entity behavior definition ...
```

## 설명

abstract BDEF의 머리말에는 다음 네 가지를 적을 수 있습니다. 머리말 뒤에는 [[abenbdl_define_beh_abstract|entity behavior definition]] 이 이어집니다.

| 구문 | 필수 여부 | 뜻 |
| --- | --- | --- |
| `abstract` | 필수 | 구현 타입입니다. abstract BDEF는 반드시 `abstract` 로 시작합니다. |
| `strict[(version)]` | 강력 권장 | strict mode 를 켭니다. 낡은 문법을 쓰지 못하게 막아 줍니다. 가장 최신 버전을 쓰는 것이 좋습니다. |
| `extensible` | 선택 | BDEF extension(확장)을 허용합니다. strict mode 가 켜져 있어야 합니다. [[abenbdl_extensible]] 참고. |
| `with hierarchy [like entity]` | 강력 권장 | 계층 타입을 만듭니다. |

### with hierarchy

`with hierarchy` 를 적으면 BDEF에 들어 있는 entity(엔터티)들로 **새로운 종류의 BDEF derived type(BDEF 파생 타입)**이 만들어집니다. 이 타입은 root entity(루트 엔터티)에서 시작해 이렇게 짜입니다.

- entity 의 필드가 모두 구성요소로 들어갑니다.
- CDS composition 하나마다 구성요소가 하나씩 더 들어갑니다.
  - 대상이 하나뿐인 composition(`TO ONE`, `TO EXACT ONE`)면 그 구성요소는 **구조**입니다.
  - 그 밖에는 **테이블**입니다.
- 그 구성요소의 타입(또는 줄 타입)도 같은 방식으로 다시 짜입니다. composition 계층의 맨 아래 노드까지 내려갑니다.

`with hierarchy` 를 빼면 abstract BDEF의 derived type 은 CDS abstract entity 하나의 타입과 똑같습니다. abstract BDEF를 만든 보람이 없습니다. 그래서 적기를 강하게 권합니다.

### like entity

`with hierarchy` 뒤에 `like entity` 를 붙일 수 있습니다. 이렇게 하면 abstract BDEF에서 만들어지는 계층 타입이, 바탕이 되는 abstract entity 에서 나오는 CDS 타입과 **같다는 것이 보장**됩니다. BDEF 타입과 CDS 타입이 서로 호환됩니다.

CDS 타입을 그냥 쓰지 않고 이렇게 BDEF를 두는 까닭은, BDEF에는 [[abenbdl_type_mapping_abstract|type mapping]] 을 더 정의할 수 있기 때문입니다.

대신 `with hierarchy like entity` 에는 규칙이 더 붙습니다.

- abstract BDEF의 derived type 에 CDS composition 이 들어 있으면 안 됩니다.
- field characteristics(필드 특성) `suppress` 를 쓸 수 없습니다. abstract entity 의 타입과 abstract BDEF의 타입이 달라지기 때문입니다.
- field characteristics `mandatory:execute` 를 쓸 수 없습니다.
- `with control` 을 쓸 수 없습니다.

## 예제

계층 타입을 만드는 머리말입니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
{
  association _Booking;
}

define behavior for ZA_BookingInput alias BookingInput
{
}
```

이 abstract BDEF의 계층 타입은 ABAP에서 이렇게 씁니다. `_Booking` 은 대상이 여러 개인 composition 이므로 테이블 구성요소가 됩니다.

```abap
DATA ls_input TYPE STRUCTURE FOR HIERARCHY za_travelinput.

ls_input-AgencyID = '070001'.
ls_input-_Booking = VALUE #( ( FlightDate = '20261101' )
                             ( FlightDate = '20261108' ) ).
```

## 알아두기

다음 네 가지는 머리말에 `with hierarchy` 가 있어야만 쓸 수 있습니다.

- [[abenbdl_define_beh_abstract|with control]]
- [[abenbdl_type_mapping_abstract|deep mapping]]
- [[abenbdl_define_beh_abstract|scalar entity]]
- [[abenbdl_association_abstract|association _Assoc with hierarchy]]

## 관련 항목

- [[abenbdl_abstract]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_impl_type]]
- [[abenbdl_strict]]
- [[abenbdl_extensible]]
- [[abenbdl_extension]]
- [[abenbdl_field_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_association_abstract]]
- [[abaptype_structure_for]]
- [[abaptype_table_for]]
