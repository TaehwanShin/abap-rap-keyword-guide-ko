---
title: base BO 의 extensibility (managed·unmanaged)
summary: managed·unmanaged behavior definition 에서 extensible 을 머리말, entity, 본문 요소에 적어 BDEF extension 이 무엇을 덧붙일 수 있는지 정하는 문법입니다.
keywords: extensible, with friends, with validations on save, with determinations on save, with determinations on modify, with additional save, mapping corresponding extensible, determine action extensible, draft determine action Prepare extensible, 확장 허용, 기반 BO, managed, unmanaged, 관리형, 비관리형
---

## 문법

```syntax
managed | unmanaged
strict[(version)];
extensible
[with friends BDEFExtension1 [, BDEFExtension2] [,...] ]
[{
  [with validations on save;]
  [with determinations on save;]
  [with determinations on modify;]
  [with additional save;]
}];
[...]
define behavior for RootEntity
  extensible
  [...]
{
  [...]
  [mapping for PartnerType corresponding extensible]
  [determine action Name extensible { ... }]
  [draft determine action Prepare extensible { ... }]
  ...
}
...
```

## 설명

managed·unmanaged behavior definition(동작 정의)에 BDEF extension(확장)을 허용하려면 `extensible` 을 적습니다. 적는 자리는 세 군데이고, 자리마다 허용되는 것이 다릅니다.

**전제 조건** : `strict[(version)]` 로 BDEF strict mode 가 켜져 있어야 합니다.

### 1. 머리말의 extensible

extension 을 허용하는 출발점입니다. 이것이 없으면 확장할 수 없습니다. 머리말에 적었다면, entity(엔터티) 동작 특성에서 entity 를 **적어도 하나** `extensible` 로 선언해야 합니다.

머리말의 `extensible` 로 BDEF extension 이 RAP BO 에 덧붙일 수 있게 되는 것은 다음과 같습니다.

- 외부 entity (`foreign entity`)
- 새 `for disable` authorization context 를 더하는 일, 그리고 확장당하는 쪽에 이미 있는 전체 authorization context 를 확장하는 일
- extension 노드의 behavior definition (extension entity 동작)

머리말의 `extensible` 뒤에는 두 가지를 더 붙일 수 있습니다.

- `with friends` : BDEF extension 을 하나 이상 이 behavior definition 의 프렌드로 선언합니다. 프렌드는 이 behavior definition 에 더 넓게 접근할 수 있습니다. [[abenbdl_with_friends]] 참고.
- 중괄호 안의 허용 목록 : 아래 가운데 필요한 것을 적습니다.

| 구문 | extension 에서 허용하는 것 |
| --- | --- |
| `with validations on save` | 저장 시점의 validation |
| `with determinations on save` | 저장 시점의 determination |
| `with determinations on modify` | 수정 시점의 determination |
| `with additional save` | additional save |

이 목록에 **적지 않은 종류**의 validation·determination·additional save 는, 이미 있는 entity 를 확장하는 곳(`extend behavior for`)에서 정의할 수 없습니다.

이 선언은 이미 있는 entity 를 확장할 때만 해당합니다. extension 노드(`define behavior for` 로 새로 정의하는 노드)에서는 validation, determination, additional save 를 언제나 쓸 수 있고 따로 허락받을 필요가 없습니다.

### 2. entity 동작 특성의 extensible

extension 을 허용할 entity** 마다** 반드시 적습니다. 그 entity 에 BDEF extension 으로 다음을 덧붙일 수 있게 됩니다.

- determination 과 validation. 단, 그 종류가 머리말에서 허용되어 있어야 합니다.
- extension 필드에 붙이는 field characteristics(필드 특성)
- action (feature control(기능 제어) 포함)
- function
- `determine action`
- extension 노드를 대상으로 하는 association 의 동작 허용
- type mapping
- 외부 entity
- additional save

### 3. entity 동작 본문의 extensible

본문에서는 요소 단위로 extension 을 허용합니다.

- `mapping for PartnerType corresponding extensible` : 이 type mapping 에 extension 필드를 더할 수 있게 합니다. `corresponding` 과 함께 써야만 합니다. 이름이 같은 구성요소가 자동으로 연결되어야 하기 때문입니다.
- `determine action Name extensible { ... }` : 이 `determine action` 에 validation 이나 determination 을 더할 수 있게 합니다. draft 를 쓰는 BO 에서만 됩니다.
- `draft determine action Prepare extensible { ... }` : draft `determine action` 인 `Prepare` 에 validation 이나 determination 을 더할 수 있게 합니다. draft 를 쓰는 BO 에서만 됩니다.

## 예제

저장 시점의 validation 과 determination 을 extension 에 허용한 managed BDEF 입니다. root entity(루트 엔터티)와 type mapping 을 확장할 수 있게 열어 두었습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
extensible
{
  with validations on save;
  with determinations on save;
}

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
extensible
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;

  // extension 필드를 이 mapping 에 더할 수 있다
  mapping for ztravel corresponding extensible
  {
    TravelID = travel_id;
    AgencyID = agency_id;
  }
}
```

이 BDEF 를 확장하는 쪽에서는 `Travel` 에 저장 시점 validation 을 더할 수 있습니다. 수정 시점의 determination 은 머리말에서 허용하지 않았으므로 더할 수 없습니다.

## 알아두기

- `internal` 로 선언한 `determine action` 과 draft `determine action` 은 `extensible` 로 선언하면 안 됩니다.

unmanaged RAP BO 에는 다음 제약이 있습니다.

- unmanaged RAP BO 의 BDEF extension 에서는 determination 과 validation 을 정의할 수 없습니다. 그래서 `with validations on save;`, `with determinations on modify;`, `with determinations on save;` 를 쓸 수 없습니다.
- additional save 도 쓸 수 없습니다. 그래서 `with additional save;` 를 쓸 수 없습니다.
- `determine action` 과 draft `determine action` `Prepare` 를 extension 에서 쓸 수 없습니다. 그래서 이 둘을 `extensible` 로 선언할 수 없습니다.
- 노드 extension 을 쓸 수 없습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling]]
- [[abenbdl_extensible]]
- [[abenbdl_with_friends]]
- [[abenbdl_extension_syntax]]
- [[abenbdl_extend_beh]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_type_mapping]]
- [[abenbdl_determine_action]]
- [[abenbdl_draft_action]]
- [[abenbdl_validations]]
- [[abenbdl_determinations]]
- [[abenbdl_strict]]
- [[abenbdl_define_beh]]
