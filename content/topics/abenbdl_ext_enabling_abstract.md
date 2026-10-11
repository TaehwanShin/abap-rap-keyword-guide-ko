---
title: abstract BDEF 의 extensibility
summary: abstract BDEF 에서 extensible 을 머리말, 노드, mapping 에 적어 abstract BDEF extension 이 계층 타입에 무엇을 덧붙일 수 있는지 정하는 문법입니다.
keywords: extensible, abstract, 추상 BDEF, 확장 허용, abstract BDEF extension, 추상 BDEF 확장, deep mapping corresponding extensible, mapping corresponding extensible, extension for abstract, scalar entity, 계층 타입, strict
---

## 문법

```syntax
abstract
strict[(version)];
extensible;
define behavior for AbstractEntity
  extensible
  [...]
{
  [...]
  [[deep] mapping for PartnerType corresponding extensible]
  [...]
}
 ...
```

## 설명

abstract BDEF 에 abstract BDEF extension(확장)을 허용하려면 `extensible` 을 적습니다. 적는 자리는 세 군데입니다.

**전제 조건** : `strict[(version)]` 로 BDEF strict mode 가 켜져 있어야 합니다.

### 1. 머리말의 extensible

extension 을 허용하는 출발점입니다. 이것이 없으면 확장할 수 없습니다. 머리말에 적었다면, `define behavior for AbstractEntity ...` 뒤에서 entity(엔터티)를 **적어도 하나** `extensible` 로 선언해야 합니다.

머리말의 `extensible` 로 abstract BDEF extension 이 덧붙일 수 있게 되는 것은 다음과 같습니다.

- `define behavior for AbstractEntity` 로 계층 타입에 새 노드를 더하는 일
- 계층 타입에 새 스칼라 entity 를 더하는 일

### 2. 노드의 extensible

`define behavior for AbstractEntity` 뒤에 적습니다. extension 을 허용할 노드**마다** 반드시 적습니다. 그 노드에 abstract BDEF extension 으로 다음을 덧붙일 수 있게 됩니다.

- extension 필드에 붙이는 field characteristics(필드 특성)
- association
- type mapping

### 3. entity 동작 본문의 extensible

- `[deep] mapping for PartnerType corresponding extensible` : 원래 abstract BDEF 에 정의된 type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다. 이름이 같은 구성요소가 자동으로 연결되어야 하기 때문입니다.

## 예제

두 노드 모두 extension 을 허용한 abstract BDEF 입니다. 루트 노드의 deep mapping 도 확장할 수 있게 열어 두었습니다.

```bdl
abstract;
strict ( 2 );
extensible;
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
extensible
with control
{
  association _Booking;

  deep mapping for zs_travel_input corresponding extensible
  {
    AgencyID = agency_id;
    sub _Booking = bookings;
  }
}

define behavior for ZA_BookingInput alias BookingInput
extensible
with control
{
}
```

## 알아두기

- 바탕이 되는 CDS abstract entity 가 `extensible` 로 선언되어 있을 필요는 없습니다.
- abstract BDEF 를 확장하는 문법은 [[abenbdl_extension_for_abstract]] 에 있습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling]]
- [[abenbdl_extensibility_abstract]]
- [[abenbdl_extension_for_abstract]]
- [[abenbdl_ext_enabl_ext_abs]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_extensible]]
- [[abenbdl_strict]]
