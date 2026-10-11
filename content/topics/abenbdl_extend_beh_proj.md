---
title: entity projection extension (extend behavior for)
summary: BDEF projection extension 안에서 projection BDEF 에 이미 있는 entity 의 동작을 넓히는 구문입니다.
keywords: extend behavior for, entity projection extension, 엔터티 프로젝션 확장, projection_extension_body, extension for projection, 프로젝션 BDEF, use, extensible
---

## 문법

```syntax
extend behavior for ProjectionEntity
 {
   projection_extension_body
 }
...
```

## 설명

entity(엔터티) projection extension(확장)은 projection BDEF 에 이미 있는 entity `ProjectionEntity` 의 동작을 넓힙니다. BDEF projection extension(`extension for projection`) 안에 적습니다.

**전제 조건**: projection BDEF 가 extension 을 명시적으로 허용해야 합니다. 방법은 [[abenbdl_ext_enabling_projection]] 에 있습니다.

중괄호 안에는 projection extension 본문 `projection_extension_body` 를 적습니다. extension 필드의 field characteristics(필드 특성), `use` 로 다시 쓰는 작업, `extend mapping for` 가 들어갑니다. 자세한 내용은 [[abenbdl_proj_ext_body]] 에 있습니다.

원본 BO 쪽의 `extend behavior for` ([[abenbdl_extend_beh]])와 키워드는 같지만 적을 수 있는 것이 훨씬 적습니다. behavior pool(동작 풀)이나 additional save 는 문법에 없습니다.

## 예제

projection BDEF `ZC_Travel` 은 머리말과 entity 에 `extensible` 을 적어 extension 을 허용합니다.

```bdl
// projection BDEF ZC_Travel
projection;
strict ( 2 );
extensible;

define behavior for ZC_Travel alias Travel
extensible
{
  use create;
  use update;
  use delete;
}
```

projection extension 은 root entity(루트 엔터티)에서 extension action 과 extension association 을 내놓습니다.

```bdl
extension for projection;

extend behavior for Travel
{
  use association _Note { create; }
  use action holdTravel;
}
```

## 관련 항목

- [[abenbdl_proj_ext_body]]
- [[abenbdl_extension_for_projection]]
- [[abenbdl_proj_ext_entity]]
- [[abenbdl_ext_enabling_projection]]
- [[abenbdl_extend_beh]]
