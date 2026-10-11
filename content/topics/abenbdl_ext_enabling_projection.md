---
title: projection BDEF 의 extensibility
summary: projection BDEF 에서 extensible 을 머리말, entity, type mapping 에 적어 projection BDEF extension 이 무엇을 덧붙일 수 있는지 정하는 문법입니다.
keywords: extensible, projection, 프로젝션 BDEF, 확장 허용, BDEF projection extension, 프로젝션 BDEF 확장, mapping corresponding extensible, extension for projection, 확장 노드, strict
---

## 문법

```syntax
projection
strict[(version)];
extensible;
define behavior for ProjectedEntity
  extensible
  [...]
{
  [...]
  [mapping for PartnerType corresponding extensible]
  [...]
}
 ...
```

## 설명

projection BDEF 에 projection BDEF extension(확장)을 허용하려면 `extensible` 을 적습니다. 적는 자리는 세 군데입니다.

**전제 조건** : `strict[(version)]` 로 BDEF strict mode 가 켜져 있어야 합니다.

### 1. 머리말의 extensible

extension 을 허용하는 출발점입니다. 이것이 없으면 확장할 수 없습니다. 머리말에 적었다면, entity(엔터티) 동작 특성에서 entity 를 **적어도 하나** `extensible` 로 선언해야 합니다.

머리말의 `extensible` 로 projection BDEF extension 이 덧붙일 수 있게 되는 것은 다음과 같습니다.

- projection 계층의 extension 노드에 동작을 정의하는 일 (projection extension entity)

### 2. entity 동작 특성의 extensible

extension 을 허용할 entity** 마다** 반드시 적습니다. 그 entity 에 projection BDEF extension 으로 다음을 덧붙일 수 있게 됩니다.

- extension 필드에 붙이는 field characteristics(필드 특성)
- managed·unmanaged 기반 RAP BO 의 action, function, association 을 다시 쓰는 일

### 3. entity 동작 본문의 extensible

- `mapping for PartnerType corresponding extensible` : 확장당하는 RAP BO 에 정의된 type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다. 이름이 같은 구성요소가 자동으로 연결되어야 하기 때문입니다.

## 예제

projection BDEF `ZC_Travel` 에서 root entity(루트 엔터티)의 extension 을 허용합니다.

```bdl
projection;
strict ( 2 );
extensible;

define behavior for ZC_Travel alias Travel
extensible
{
  use create;
  use update;
  use delete;

  use action acceptTravel;

  use association _Booking { create; }
}

define behavior for ZC_Booking alias Booking
{
  use update;
  use delete;

  use association _Travel;
}
```

`Travel` 은 projection BDEF extension 으로 확장할 수 있습니다. `Booking` 에는 `extensible` 이 없으므로 확장할 수 없습니다.

## 알아두기

- projection 이 바라보는 아래쪽 BDEF 가 `extensible` 일 필요는 없습니다. projection BDEF 는 그 아래 RAP BO 와 상관없이 따로 extension 을 허용할 수 있습니다.
- projection BDEF 를 확장하는 문법은 [[abenbdl_extension_for_projection]] 에 있습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling]]
- [[abenbdl_extensibility_projection]]
- [[abenbdl_extension_for_projection]]
- [[abenbdl_extend_beh_proj]]
- [[abenbdl_ext_enabl_ext_proj]]
- [[abenbdl_extensible]]
- [[abenbdl_define_beh_projection]]
- [[abenbdl_type_mapping]]
- [[abenbdl_strict]]
