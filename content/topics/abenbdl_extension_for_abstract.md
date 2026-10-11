---
title: abstract BDEF extension (extension for abstract)
summary: 이미 있는 abstract behavior definition 에 새 노드, field characteristics, association, type mapping, 스칼라 entity 를 덧붙이는 extension 문법입니다.
keywords: extension for abstract, 추상 BDEF 확장, abstract BDEF extension, extend behavior for, define behavior for, scalar entity, extensible, 확장 노드, suppress, 계층 타입, 타입 매핑 확장
---

## 문법

```syntax
extension for abstract;
  [extensible;]
  [define behavior for ...]
  [extend behavior for ...]
  [scalar entity ...]
...
```

## 설명

`extension for abstract` 로 시작하는 behavior definition(동작 정의)는 **abstract BDEF extension(확장)**입니다. 이미 있는 abstract behavior definition 을 고치지 않고, 바깥에서 내용을 덧붙입니다. abstract behavior definition 하나에 extension 을 여러 개 붙일 수 있고, 개수 제한은 없습니다.

extension 안에는 다음 네 가지를 쓸 수 있습니다.

| 구성 | 하는 일 |
| --- | --- |
| `extensible` | 이 extension 을 다시 확장할 수 있게 엽니다(extension 겹치기). 자세한 내용은 [[abenbdl_ext_enabl_ext_abs]] 에 있습니다. |
| `define behavior for` | abstract BDEF 의 계층 타입(노드가 층을 이루는 구조 타입)에 새 노드를 보탭니다. 이 노드를 extension 노드라고 합니다. |
| `extend behavior for` | 이미 있는 노드를 확장합니다. |
| `scalar entity` | 계층 타입에 스칼라 entity(엔터티)를 새로 보탭니다. |

### define behavior for — extension 노드 보태기

새 노드를 계층 타입에 넣습니다. 먼저 두 가지가 갖춰져 있어야 합니다.

- 원래 abstract behavior definition 이 BDEF extension 을 분명하게 허용해야 합니다. 허용하는 방법은 [[abenbdl_ext_enabling_abstract]] 에 있습니다.
- extension 노드가 RAP 데이터 모델 extension 으로 데이터 모델에 먼저 들어가 있어야 합니다.

extension 노드에는 abstract BDEF 와 같은 방식으로 [[abenbdl_field_abstract|field characteristics]], [[abenbdl_association_abstract|association]], [[abenbdl_type_mapping_abstract|type mapping]] 을 적습니다. 다른 점은 하나뿐입니다. abstract BDEF extension 에서는 필드에도 association 에도 `mandatory:execute` 를 쓸 수 없습니다. 본문에 쓸 수 있는 내용은 [[abenbdl_body_abstract]] 를 봅니다.

### extend behavior for — 있는 노드 확장하기

원래 abstract BDEF 의 노드에 내용을 덧붙입니다. 여기서도 원래 behavior definition 이 extension 을 허용해야 합니다([[abenbdl_ext_enabling_abstract]]). 할 수 있는 일은 네 가지입니다.

- extension 필드에 field characteristics(필드 특성) `suppress` 를 줍니다.
- extension 노드를 대상으로 하는 association 을 보탭니다.
- 이미 있는 type mapping 을 확장합니다. 원래 type mapping 이 extension 을 분명하게 허용해야 합니다.
- 상대 타입과 잇는 type mapping 을 새로 만듭니다. 이 mapping 에는 extension 필드만 넣을 수 있고, 원래 데이터 모델의 필드는 넣을 수 없습니다. 문법은 abstract BDEF 의 [[abenbdl_type_mapping_abstract|type mapping]] 과 똑같습니다.

### scalar entity — 스칼라 entity 보태기

스칼라 entity 를 스칼라 타입으로 계층 타입에 넣습니다. 이 스칼라 entity 도 extension 노드여야 합니다. 곧, RAP 데이터 모델 extension 으로 데이터 모델에 들어가 있어야 합니다. 문법은 abstract BDEF 와 똑같고 [[abenbdl_define_beh_abstract]] 에 있습니다.

## 예제

여행 요청을 나타내는 abstract behavior definition `ZA_TravelRequest` 를 확장합니다. 루트 노드에 association 과 mapping 을 덧붙이고, extension 노드 `ZA_TravelRequestNote` 와 스칼라 entity `ZA_TravelRequestTag` 를 새로 넣습니다.

```bdl
extension for abstract;
extensible;

// 원래 있던 루트 노드를 확장한다
extend behavior for ZA_TravelRequest
{
  // extension 필드에 field characteristics suppress 를 준다
  field ( suppress ) ZZInternalRemark;

  // extension 노드로 가는 association
  association _ZZNote;

  // 이미 있는 deep mapping 에 extension 노드를 잇는다
  extend deep mapping for zs_travel_request
  {
    sub _ZZNote = zz_note;
  }
}

// 스칼라 entity 를 계층 타입에 넣는다
scalar entity ZA_TravelRequestTag field ZZTag;

// extension 노드를 새로 정의한다
define behavior for ZA_TravelRequestNote
{
  field ( suppress ) ZZNoteLanguage;
}
```

## 알아두기

- 원래 abstract behavior definition 이 extension 을 허용하지 않으면 `define behavior for` 도 `extend behavior for` 도 쓸 수 없습니다.
- `define behavior for` 와 `scalar entity` 로 넣는 노드는 RAP 데이터 모델 extension 으로 먼저 데이터 모델에 들어가 있어야 합니다.
- abstract BDEF extension 에서는 `mandatory:execute` 를 쓸 수 없습니다.
- 새로 만드는 type mapping 에는 원래 데이터 모델의 필드를 넣지 못합니다.

## 관련 항목

- [[abenbdl_extensibility_abstract]]
- [[abenbdl_ext_enabling_abstract]]
- [[abenbdl_ext_enabl_ext_abs]]
- [[abenbdl_body_abstract]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_field_abstract]]
- [[abenbdl_association_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_extension_layering]]
