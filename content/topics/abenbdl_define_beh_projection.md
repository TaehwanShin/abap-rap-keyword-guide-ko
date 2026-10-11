---
title: projection BDEF 의 entity behavior definition (define behavior for)
summary: projection BDEF 에서 entity 마다 적는 define behavior for 문입니다. 별칭, 바깥 이름, 구현 클래스, entity 동작 특성과 본문을 정합니다.
keywords: define behavior for, 프로젝션 BDEF, projection, alias, external, implementation in class, 엔터티 동작 정의, CDS projection view, 프로젝션 뷰
---

## 문법

```syntax
define behavior for ProjectedEntity [alias AliasName] [ external ExternalName]
{[implementation in class ClassName [unique]]}
EntityBehaviorCharacteristics
{
  EntityBehaviorBody
}

[behavior for ChildEntity1][, behavior for ChildEntity2][, ...
]
```

## 설명

RAP projection BO 의 동작을 entity(엔터티) 단위로 정의합니다. projection behavior definition(동작 정의)는 base BO(기반 BO) 의 노드를 일부만 가져와도 되고 모두 가져와도 됩니다. root entity(루트 엔터티) `ProjectedEntity` 는 CDS projection 뷰여야 합니다.

- `alias AliasName` : 별칭입니다. entity 이름은 ABAP Dictionary 전체에서 겹치지 않아야 하지만 별칭은 그럴 필요가 없어 더 알아보기 쉽게 지을 수 있습니다. 별칭은 behavior pool(동작 풀)의 메서드 문법과 derived type(파생 타입, [[abenrpm_derived_types]])에 보입니다. 길이는 30자까지입니다.
- `external ExternalName` : 바깥에서 쓸 이름을 따로 정합니다([[abenbdl_external]]). 이 이름은 OData 메타데이터에 나타나지만 ABAP 에서는 알지 못합니다. 별칭보다 훨씬 길게 지을 수 있습니다.
- `implementation in class ClassName unique` : behavior pool 입니다([[abenbdl_in_class_unique]]). 새 action 이나 function 을 정의해서([[abenbdl_nonstandard_projection]]) 구현이 필요한 entity 마다 적을 수 있습니다. projection BDEF 의 머리말([[abenbdl_bdef_projection_header]])에 적어도 되고, entity behavior definition 에 적어도 됩니다.
- `EntityBehaviorCharacteristics` : entity 동작 특성입니다([[abenbdl_character_projection]]). entity 마다 일반 속성을 정합니다.
- `EntityBehaviorBody` : entity 동작 본문입니다([[abenbdl_body_projection]]). base BDEF(기반 BDEF) 의 트랜잭션 동작 가운데 일부, 예를 들어 standard operation(표준 작업)이나 field characteristics(필드 특성)을 내놓습니다. 새 action([[abenbdl_nonstandard_projection]]), function([[abenbdl_function_projection]]), field characteristics([[abenbdl_field_projection]])도 정의할 수 있습니다.

## 예제

여행 entity 에만 새 action 이 있어서, 구현 클래스를 머리말이 아니라 여행 entity 에 적었습니다.

```bdl
projection;
strict ( 2 );

define behavior for ZC_Travel alias Travel external 'TravelForAgency'
implementation in class zbp_c_travel unique
use etag
{
  use create;
  use update;
  use delete;

  use action acceptTravel;
  use association _Booking { create; }

  // projection 에서 새로 정의한 action
  action ( authorization : none ) markAsFavorite;
}

define behavior for ZC_Booking alias Booking
use etag
{
  use update;
  use delete;

  use association _Travel;
}
```

## 알아두기

- base BO 에서 가져온 것만 있는 entity 에는 구현 클래스가 필요 없습니다. base BO 의 구현을 그대로 씁니다.
- persistent table, 잠금, numbering 같은 것은 projection 에 적지 않습니다. 저절로 물려받습니다. [[abenbdl_character_projection]] 을 봅니다.

## 관련 항목

- [[abenbdl_projection_bo]]
- [[abenbdl_bdef_projection_header]]
- [[abenbdl_character_projection]]
- [[abenbdl_body_projection]]
- [[abenbdl_nonstandard_projection]]
- [[abenbdl_external]]
- [[abenbdl_in_class_unique]]
