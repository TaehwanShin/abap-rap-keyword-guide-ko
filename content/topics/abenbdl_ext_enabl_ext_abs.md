---
title: abstract BDEF extension 의 extensibility
summary: abstract BDEF extension 에 extensible 을 적어, 그 extension 을 또 다른 abstract BDEF extension 으로 다시 확장할 수 있게 하는 문법입니다.
keywords: extensible, extension for abstract, extension layering, 확장 겹치기, 추상 BDEF 확장, abstract BDEF extension, extend behavior for, define behavior for, scalar entity, deep mapping corresponding extensible, extend deep mapping, 확장 허용, 계층 타입
---

## 문법

```syntax
extension for abstract
extensible;
[...]
extend behavior for EntityName
  [...]
{
  [...]
  [[deep] mapping for PartnerType corresponding extensible]
   ...
}

define behavior for ExtNode
  extensible
  [...]
{
  [...]
  [[deep] mapping for PartnerType corresponding extensible]
  ...
}
[...]
...
```

## 설명

abstract BDEF extension(확장)을 다시 확장할 수 있게 하려면, 그 BDEF extension 안에 `extensible` 을 적습니다. 적는 자리는 네 군데입니다.

### 1. extension 머리말의 extensible

extension 을 허용하는 출발점입니다. 이것이 없으면 이 abstract BDEF extension 을 다시 확장할 수 없습니다. 머리말에 적었다면, 이 extension 의 구성요소를 **적어도 하나** `extensible` 로 선언해야 합니다.

머리말의 `extensible` 로, 또 다른 abstract BDEF extension 이 다음을 덧붙일 수 있게 됩니다.

- `define behavior for AbstractEntity` 로 abstract BDEF 의 계층 타입에 새 노드를 더하는 일
- `scalar entity` 로 계층 타입에 새 스칼라 entity(엔터티)를 더하는 일

### 2. entity 동작 extension(extend behavior for) 본문의 extensible

- `[deep] mapping for PartnerType corresponding extensible` : type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다. 이름이 같은 구성요소가 자동으로 연결되어야 하기 때문입니다.

### 3. 새 노드(define behavior for)의 extensible

`define behavior for AbstractEntity` 뒤에 적습니다. extension 을 허용할 노드**마다** 반드시 적습니다. 그 노드에 abstract BDEF extension 으로 다음을 덧붙일 수 있게 됩니다.

- extension 필드에 붙이는 field characteristics(필드 특성)
- association
- type mapping

### 4. 새 노드 본문의 extensible

- `[deep] mapping for PartnerType corresponding extensible` : 원래 abstract BDEF 에 정의된 type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다.

## 예제

첫째 abstract BDEF extension 입니다. 여행 입력값의 계층 타입에 구조 노드(`ZZ_A_RemarkInput`)와 스칼라 entity(`ZZ_A_LabelInput`)를 더하고, 이 extension 을 다시 확장할 수 있게 열어 둡니다.

```bdl
extension for abstract;
extensible;

extend behavior for TravelInput
{
  association _ZZRemark;

  extend deep mapping for zs_travel_input
  {
    sub _ZZRemark = zz_remarks;
  }
}

extend behavior for BookingInput
{
  association _ZZLabel;
}

// 새 노드 두 개: 스칼라 하나, 구조 하나
scalar entity ZZ_A_LabelInput field LabelText;

define behavior for ZZ_A_RemarkInput alias ZZRemark
with control
extensible
{
}
```

둘째 abstract BDEF extension 입니다. 첫째 extension 을 확장합니다. 첫째 extension 이 `extensible` 로 열어 둔 노드 `ZZRemark` 에 extension 필드의 field characteristics 를 더합니다.

```bdl
extension for abstract;

extend behavior for TravelInput
{
}

extend behavior for ZZRemark
{
  // extension 필드를 derived type 에서 뺀다
  field ( suppress ) ZZ2_InternalFlag;
}
```

## 알아두기

- 바탕이 되는 CDS abstract entity 가 `extensible` 로 선언되어 있을 필요는 없습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling_ext]]
- [[abenbdl_extension_layering]]
- [[abenbdl_ext_enabling_abstract]]
- [[abenbdl_extension_for_abstract]]
- [[abenbdl_extensibility_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_extensible]]
