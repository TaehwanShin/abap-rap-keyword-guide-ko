---
title: abstract BDEF의 entity behavior definition (define behavior for, scalar entity)
summary: abstract BDEF에서 composition 트리의 노드를 계층 타입에 구조로 넣을지(define behavior for) 값 하나로 넣을지(scalar entity) 정하는 문법입니다.
keywords: define behavior for, scalar entity, alias, extensible, with control, %control, 추상 BDEF, abstract BDEF, 엔터티 동작 정의, 스칼라 엔터티, 계층 타입, with hierarchy
---

## 문법

```syntax
{{ define behavior for AbstractEntity [alias AliasName]
  [extensible]
  [with control]
  {
   entity behavior body
  }
}
| scalar entity AbstractEntity field FieldName }

[behavior for ChildEntity1][, behavior for ChildEntity2][, ...
]
```

## 설명

abstract BDEF의 동작을 entity(엔터티) 단위로 정의합니다. abstract BDEF는 **루트 CDS abstract entity** 하나를 바탕으로 하며, CDS composition 트리의 노드 하나 또는 여러 개에 동작을 정의할 수 있습니다.

트리의 노드를 계층 타입에 넣는 방법은 두 가지입니다.

| 방법 | 노드가 계층 타입에 들어가는 모양 |
| --- | --- |
| `define behavior for` | 구조 타입. entity 동작 본문이 반드시 있어야 합니다. |
| `scalar entity` | 스칼라 타입(정수나 문자처럼 값 하나짜리 타입) |

### define behavior for

CDS abstract entity 의 동작을 정의합니다. 다음을 붙일 수 있습니다.

- `alias AliasName` : 별칭을 줍니다. 길이는 30자까지입니다.
- `extensible` : 이 entity 에 BDEF extension(확장)을 허용합니다. abstract BDEF 머리말에도 `extensible` 을 선언해야 하고, extension 을 허용할 entity 마다 `define behavior for` 뒤에 따로 적어야 합니다. [[abenbdl_ext_enabling_abstract]] 참고.
- `with control` : derived type(파생 타입) 구조에 `%control` 구조를 더합니다. 계층 타입의 구성요소(entity 필드든 association 이든) 하나마다, 같은 이름에 타입이 `x(1)` 인 구성요소가 `%control` 안에 생깁니다. `%control` 은 구조 맨 끝에 붙습니다. 애플리케이션은 이 표시로 "같은 이름의 구성요소에 값을 넣어 보냈다"는 것을 알릴 수 있습니다. entity 마다 정하므로, 계층 타입의 모든 단계에 `%control` 이 있을 수도 있고 일부 단계에만 있을 수도 있습니다.
- entity 동작 본문 `{ ... }` : 반드시 있어야 합니다. field characteristics(필드 특성), association, type mapping 을 적습니다. [[abenbdl_body_abstract]] 참고.

### scalar entity

composition 트리의 entity 를 구조가 아니라 값 하나짜리 타입으로 계층 타입에 넣습니다. 맨 아래 노드에 자주 씁니다. `define behavior for` 대신 이렇게 적습니다.

```syntax
... scalar entity AbstractEntity field FieldName;
```

- entity `AbstractEntity` 의 필드 `FieldName` 하나가 스칼라 타입이 됩니다.
- 그 entity 의 다른 필드는 모두 무시됩니다. 그래서 필드를 숨기는 `suppress` 나 type mapping 은 의미가 없습니다.
- 루트 노드도 스칼라 entity 로 선언할 수 있습니다. 그러면 계층 타입 전체가 스칼라 타입 하나가 됩니다. 이 방법으로, entity 를 바탕으로 하면서도 기본 타입이거나 줄 타입이 기본 타입인 내부 테이블인 action 매개변수 타입을 만들 수 있습니다.

## 예제

여행 입력값 아래에 예약(`ZA_BookingInput`)과 태그(`ZA_TagInput`) 두 노드가 있습니다. 예약은 구조로, 태그는 `TagText` 필드 하나만 스칼라로 넣습니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
with control
{
  association _Booking;
  association _Tag;
}

define behavior for ZA_BookingInput alias BookingInput
with control
{
}

// 태그 노드는 TagText 값 하나로만 들어간다
scalar entity ZA_TagInput field TagText;
```

## 알아두기

- `with control` 을 쓰려면 abstract BDEF 머리말에 `with hierarchy` 가 있어야 합니다.
- abstract BDEF에는 entity 동작 특성(잠금, 권한, ETag 같은 것)을 적을 수 없습니다.
- abstract BDEF에는 트랜잭션 동작을 정의할 수 없습니다. 본문에 올 수 있는 것은 field characteristics, association, type mapping 뿐입니다.

## 관련 항목

- [[abenbdl_abstract]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_body_abstract]]
- [[abenbdl_field_abstract]]
- [[abenbdl_association_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_extensible]]
- [[abenbdl_ext_enabling_abstract]]
- [[abapderived_types_comp]]
