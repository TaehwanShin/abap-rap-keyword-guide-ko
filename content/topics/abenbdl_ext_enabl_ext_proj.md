---
title: projection BDEF extension 의 extensibility
summary: projection BDEF extension 에 extensible 을 적어, 그 extension 을 또 다른 projection BDEF extension 으로 다시 확장할 수 있게 하는 문법입니다.
keywords: extensible, extension for projection, extension layering, 확장 겹치기, 프로젝션 BDEF 확장, projection BDEF extension, extend behavior for, define behavior for, 확장 노드, mapping corresponding extensible, 확장 허용
---

## 문법

```syntax
extension for projection
extensible;
[...]
extend behavior for EntityName
  [...]
{
  [...]
  [mapping for PartnerType corresponding extensible]
   ...
}

define behavior for ExtNode
  extensible
  [...]
{
  [...]
  [mapping for PartnerType corresponding extensible]
  ...
}
[...]
...
```

## 설명

projection BDEF extension(확장)을 다시 확장할 수 있게 하려면, 그 BDEF extension 안에 `extensible` 을 적습니다. 적는 자리는 네 군데입니다.

### 1. extension 머리말의 extensible

extension 을 허용하는 출발점입니다. 이것이 없으면 이 BDEF extension 을 다시 확장할 수 없습니다. 머리말에 적었다면, 이 extension 의 구성요소를 **적어도 하나** `extensible` 로 선언해야 합니다.

머리말의 `extensible` 로 덧붙일 수 있게 되는 것은 다음과 같습니다.

- projection 계층의 extension 노드에 동작을 정의하는 일 (projection extension entity(엔터티))

### 2. entity 동작 extension(extend behavior for) 본문의 extensible

- `mapping for PartnerType corresponding extensible` : type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다. 이름이 같은 구성요소가 자동으로 연결되어야 하기 때문입니다.

### 3. extension 노드(define behavior for)의 entity 동작 특성에 적는 extensible

extension 을 허용할 extension 노드**마다** 반드시 적습니다. 그 노드에 BDEF extension 으로 다음을 덧붙일 수 있게 됩니다.

- extension 필드에 붙이는 field characteristics(필드 특성)
- managed·unmanaged 기반 RAP BO의 action, function, association 을 다시 쓰는 일

### 4. extension 노드 본문의 extensible

- `mapping for PartnerType corresponding extensible` : 확장당하는 RAP BO에 정의된 type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다.

## 예제

첫째 projection BDEF extension 입니다. projection `ZC_Travel` 에 메모 노드의 projection(`ZZ_C_TravelNote`)을 extension 노드로 더하고, 이 extension 을 다시 확장할 수 있게 열어 둡니다.

```bdl
extension for projection;
extensible;

extend behavior for Travel
{
  use association _ZZNote { create; }
}

define behavior for ZZ_C_TravelNote alias ZZNote
extensible
{
  use association _Travel;
}
```

둘째 projection BDEF extension 입니다. 첫째 extension 을 확장합니다.

```bdl
extension for projection;

extend behavior for Travel
{
}

extend behavior for ZZNote
{
  // base BO 의 extension 노드에 정의된 action 을 projection 으로 끌어온다
  use action zz2_markDone;
}
```

## 알아두기

- projection 이 바라보는 아래쪽 BDEF가 `extensible` 일 필요는 없습니다. projection BDEF는 그 아래 RAP BO와 상관없이 따로 extension 을 허용할 수 있습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling_ext]]
- [[abenbdl_extension_layering]]
- [[abenbdl_ext_enabling_projection]]
- [[abenbdl_extension_for_projection]]
- [[abenbdl_extend_beh_proj]]
- [[abenbdl_proj_ext_entity]]
- [[abenbdl_extensible]]
- [[abenbdl_type_mapping]]
