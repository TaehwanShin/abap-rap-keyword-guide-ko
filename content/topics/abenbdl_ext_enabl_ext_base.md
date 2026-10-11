---
title: base BDEF extension 의 extensibility
summary: managed·unmanaged BO 의 BDEF extension 에 extensible 을 적어, 그 extension 을 또 다른 BDEF extension 으로 다시 확장할 수 있게 하는 문법입니다.
keywords: extensible, extension, extension layering, 확장 겹치기, 기반 BDEF 확장, base BDEF extension, with friends, with validations on save, with determinations on save, with determinations on modify, with additional save, extend behavior for, define behavior for, 확장 노드, 확장 허용
---

## 문법

```syntax
extension [using interface];
extensible [with friends BDEFExtension1 [, BDEFExtension2] [,...]] [{
  [with validations on save;]
  [with determinations on save;]
  [with determinations on modify;]
  [with additional save;]
}];
[...]
extend behavior for EntityName
  [...]
{
  [...]
  [mapping for PartnerType corresponding extensible]
  [determine action Name extensible { ... }]
   ...
}

define behavior for ExtNode
  extensible
  [...]
{
  [...]
  [mapping for PartnerType corresponding extensible]
  [determine action Name extensible { ... }]
  [draft determine action Prepare extensible { ... }]
  ...
}
[...]
...
```

## 설명

base BDEF(기반 BDEF) extension(확장, managed·unmanaged BO 의 BDEF extension)을 다시 확장할 수 있게 하려면, 그 BDEF extension 안에 `extensible` 을 적습니다. 적는 자리와 뜻은 [[abenbdl_extensibility_enabling_m_u|base BO 의 extensibility]] 와 거의 같습니다. 자리는 네 군데입니다.

### 1. extension 머리말의 extensible

extension 을 허용하는 출발점입니다. 이것이 없으면 이 BDEF extension 을 다시 확장할 수 없습니다. 머리말에 적었다면, 이 BDEF extension 의 구성요소를 **적어도 하나** `extensible` 로 선언해야 합니다.

머리말의 `extensible` 뒤에는 두 가지를 더 붙일 수 있습니다.

- `with friends` : BDEF extension 을 하나 이상 지금 BDEF extension 의 프렌드로 선언합니다. 프렌드는 더 넓은 접근 권한을 받습니다. [[abenbdl_with_friends]] 참고.
- 중괄호 안의 허용 목록 : `with validations on save`, `with determinations on save`, `with determinations on modify`, `with additional save` 가운데 필요한 것을 적습니다. 각각 validation, determination, additional save 를 entity(엔터티) 동작 extension 에서 정의해도 된다고 허락합니다. 적지 않은 종류는, 이미 있는 entity 를 확장하는 곳(`extend behavior for`)에서 정의할 수 없습니다.

이 허용 목록은 이미 있는 entity 를 확장할 때만 해당합니다. extension 노드(`define behavior for`)에서는 validation, determination, additional save 를 언제나 쓸 수 있고 따로 허락받을 필요가 없습니다.

### 2. entity 동작 extension(extend behavior for) 본문의 extensible

- `mapping for PartnerType corresponding extensible` : type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다.
- `determine action Name extensible { ... }` : 이 `determine action` 에 validation 이나 determination 을 더할 수 있게 합니다. draft 를 쓰는 BO 에서만 됩니다.

### 3. extension 노드(define behavior for)의 entity 동작 특성에 적는 extensible

extension 을 허용할 extension 노드**마다** 반드시 적습니다. 그 노드에 BDEF extension 으로 다음을 덧붙일 수 있게 됩니다.

- determination 과 validation. 단, 그 종류가 머리말에서 허용되어 있어야 합니다.
- extension 필드에 붙이는 field characteristics(필드 특성)
- action (feature control(기능 제어) 포함)
- function
- `determine action`
- extension 노드를 대상으로 하는 association 의 동작 허용
- type mapping
- additional save

### 4. extension 노드 본문의 extensible

- `mapping for PartnerType corresponding extensible` : type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다.
- `determine action Name extensible { ... }` : 이 `determine action` 에 validation 이나 determination 을 더할 수 있게 합니다. draft 를 쓰는 BO 에서만 됩니다.
- `draft determine action Prepare extensible { ... }` : draft `determine action` 인 `Prepare` 에 validation 이나 determination 을 더할 수 있게 합니다. draft 를 쓰는 BO 에서만 됩니다.

## 예제

첫째 BDEF extension 입니다. 여행에 메모 노드(`ZZ_R_TravelNote`)를 extension 노드로 더하고, 이 extension 을 다시 확장할 수 있게 열어 둡니다.

```bdl
extension implementation in class zbp_x_travel_1 unique;
extensible
{
  with determinations on save;
  with validations on save;
}

extend behavior for Travel
{
  association _ZZNote { create; }
}

define behavior for ZZ_R_TravelNote alias ZZNote
authorization dependent
lock dependent
persistent table zztravelnote
extensible
{
  update;
  delete;

  association _Travel;

  field ( readonly : update ) TravelID, NoteID;
}
```

둘째 BDEF extension 입니다. 첫째 extension 이 만든 extension 노드 `ZZNote` 에 action, validation, determination 을 더합니다. extension 위에 extension 을 올린 것입니다.

```bdl
extension implementation in class zbp_x_travel_2 unique;

extend behavior for Travel
{
}

extend behavior for ZZNote
{
  action ( authorization : global ) zz2_markDone;
  validation zz2_checkNote on save { create; }
  determination zz2_setDefaults on save { create; }
}
```

## 알아두기

- `internal` 로 선언한 `determine action` 과 draft `determine action` 은 `extensible` 로 선언하면 안 됩니다.

unmanaged RAP BO 의 BDEF extension 에는 다음 제약이 있습니다.

- determination 과 validation 을 정의할 수 없습니다. 그래서 `with validations on save;`, `with determinations on modify;`, `with determinations on save;` 를 쓸 수 없습니다.
- additional save 를 쓸 수 없습니다. 그래서 `with additional save;` 를 쓸 수 없습니다.
- `determine action` 과 draft `determine action` `Prepare` 를 쓸 수 없습니다. 그래서 이 둘을 `extensible` 로 선언할 수 없습니다.
- 노드 extension 을 쓸 수 없습니다. 그래서 extension 노드를 `extensible` 로 선언할 수 없습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling_ext]]
- [[abenbdl_extension_layering]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_with_friends]]
- [[abenbdl_extension_syntax]]
- [[abenbdl_extend_beh]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_extensible]]
- [[abenbdl_type_mapping]]
- [[abenbdl_determine_action]]
- [[abenbdl_draft_action]]
- [[abenbdl_validations]]
- [[abenbdl_determinations]]
