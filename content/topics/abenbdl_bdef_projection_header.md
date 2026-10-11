---
title: projection BDEF 의 머리말
summary: projection 으로 시작하는 projection BDEF 머리말에 적을 수 있는 항목, 곧 구현 클래스·strict mode·draft 와 side effects 재사용 등을 정리합니다.
keywords: projection, 프로젝션 BDEF, behavior definition header, 머리말, implementation in class, strict, extensible, with managed instance filter, use draft, use side effects, use recommendations, with privileged mode disabling base context, foreign entity
---

## 문법

```syntax
projection [implementation in class ClassName unique];
[strict[(version)];]
[extensible;]
[with managed instance filter;]
[use draft;]
[use side effects;]
[use recommendations;]
[with privileged mode disabling base context;]
[foreign entity EntityName;]
 EntityBehaviorDefinition1[,EntityBehaviorDefinition2][, ...]
[AuthorizationContext1][, AuthorizationContext2][, ... ]
...
```

## 설명

projection BDEF 의 머리말입니다. 구현 유형 `projection` 만 필수이고 나머지는 모두 선택 사항입니다. 필요한 것은 **직접 적어야** 합니다.

| 항목 | 뜻 |
| --- | --- |
| `projection` | 구현 유형입니다([[abenbdl_impl_type]]). projection BDEF 는 `projection` 으로 시작해야 하고, CDS 트랜잭션 쿼리를 바탕으로 해야 합니다. |
| `implementation in class ClassName unique` | behavior pool(동작 풀)입니다([[abenbdl_in_class_unique]]). projection 에서는 필수가 아닙니다. base BO(기반 BO) 에서 가져온 기능은 base BO 의 구현을 그대로 쓰므로 따로 구현할 것이 없습니다. projection BDEF 에 새 action 이나 function 을 정의하면([[abenbdl_nonstandard_projection]]) behavior pool 이 필요합니다. |
| `strict[(version)]` | strict mode 입니다([[abenbdl_strict]]). base BO 에 strict mode 가 적혀 있어야 쓸 수 있습니다. base BO 와 projection 의 strict mode 버전이 같아야 합니다. |
| `extensible` | BDEF extension(확장, [[abenbdl_extension]])을 허용합니다. strict mode 가 켜져 있어야 합니다. projection BDEF 에서는 키워드 `extensible` 만 쓸 수 있고, [[abenbdl_extensible]] 에 나오는 추가 구문은 붙일 수 없습니다. |
| `with managed instance filter` | ABAP EML 이나 웹 클라이언트의 OData 요청으로 접근할 때, 기반 CDS 트랜잭션 쿼리의 `WHERE` 조건을 따집니다. 적지 않으면 `WHERE` 절을 무시합니다. [[abenbdl_mngd_instance_check_proj]] |
| `use draft` | base BO 의 draft 처리([[abenbdl_with_draft]])를 가져옵니다. |
| `use side effects` | base BO 의 side effects([[abenbdl_side_effects]])를 가져옵니다. |
| `use recommendations` | base BO 의 recommendation 값([[abenbdl_recommendations]])을 가져옵니다. |
| `with privileged mode disabling base context` | privileged mode 를 쓸 수 있게 합니다. base BO 에 privileged mode 가 적혀 있어야 합니다. [[abenbdl_privileged_mode]] |
| `foreign entity EntityName` | 외부 entity(엔터티)를 정의합니다([[abenbdl_foreign]]). BO 구조에 들지 않는 entity 를 응답 구조의 구성요소로 넣어, 다른 BO 의 메시지를 실어 나를 수 있게 합니다. |

`use ...` 로 가져오는 방법은 [[abenbdl_use_projection]] 에 자세히 나와 있습니다.

### 저절로 넘어오는 것

- `with cross associations` ([[abenbdl_with_cross_assoc]]). 기반 behavior definition(동작 정의)에 적혀 있으면 저절로 적용됩니다.

### 머리말 뒤에 오는 것

- `define behavior for` 로 시작하는 entity behavior definition 하나 이상 ([[abenbdl_define_beh_projection]])
- `define [own] authorization context` 로 시작하는 authorization context 정의 ([[abenbdl_authorization_context]]). 문법 틀에서 보듯 선택 사항이고, 여러 개 적을 수 있습니다.

## 예제

draft 와 side effects 를 가져오고, projection 에서 새 action 을 정의하려고 behavior pool 을 적은 머리말입니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );
use draft;
use side effects;

define behavior for ZC_Travel alias Travel
use etag
{
  use create;
  use update;
  use delete;

  use action Edit;
  use action Activate;
  use action Discard;
  use action Resume;
  use action Prepare;

  use association _Booking { create; with draft; }

  // projection 에서 새로 정의한 action. zbp_c_travel 에 구현한다
  action ( authorization : none ) markAsFavorite;
}

define behavior for ZC_Booking alias Booking
use etag
{
  use update;
  use delete;

  use association _Travel { with draft; }
}
```

외부 entity 를 적으면 managed·unmanaged RAP BO 에서와 마찬가지로 그 entity 가 `reported` 구조의 구성요소로 들어갑니다.

## 알아두기

- base BO 가 strict mode 를 쓰지 않으면 projection 에서도 쓸 수 없습니다. 버전도 맞춰야 합니다.
- `use draft` 를 적었다면 draft action 도 `use action` 으로 하나하나 가져와야 합니다.
- recommendation 값이 동작하려면 `use recommendations` 와 함께 `use side effects` 도 적어야 합니다. recommendation function 은 side effects 가 부르기 때문입니다.

## 관련 항목

- [[abenbdl_projection_bo]]
- [[abenbdl_define_beh_projection]]
- [[abenbdl_mngd_instance_check_proj]]
- [[abenbdl_use_projection]]
- [[abenbdl_nonstandard_projection]]
- [[abenbdl_authorization_context]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_foreign]]
