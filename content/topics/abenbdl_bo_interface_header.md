---
title: interface BDEF 의 머리말
summary: interface; 로 시작하는 interface BDEF 머리말에 적을 수 있는 항목을 정리합니다. 새로 정의하지는 못하고 base BO 의 것을 가져오기만 합니다.
keywords: interface, 인터페이스 BDEF, behavior definition header, 머리말, extensible, with managed instance filter, use draft, use collaborative draft, use side effects, with privileged mode, foreign entity
---

## 문법

```syntax
interface;
[extensible;]
[with managed instance filter;]
[use draft; | use collaborative draft;]
[use side effects;]
[with privileged mode;]
[foreign entity EntityName;]
 EntityBehaviorDefinition1 [,EntityBehaviorDefinition2] [, ...]
...
```

## 설명

interface BDEF 의 머리말은 base BO(기반 BO) 의 요소 몇 가지를 **가져올** 수 있습니다. 새 요소를 정의할 수는 없습니다. 구현 유형 `interface` 만 필수이고 나머지는 모두 선택 사항입니다.

| 항목 | 뜻 |
| --- | --- |
| `interface` | 구현 유형입니다([[abenbdl_impl_type]]). interface BDEF 는 구현 유형이 `interface` 여야 하고, CDS 트랜잭션 interface 를 바탕으로 해야 합니다. |
| `extensible` | BDEF extension(확장, [[abenbdl_extension]])을 허용합니다. base BDEF(기반 BDEF) 에 `extensible` 로 정의한 entity(엔터티)가 적어도 하나 있어야 합니다. [[abenbdl_extensible]] |
| `with managed instance filter` | ABAP EML 이나 웹 클라이언트의 OData 요청으로 접근할 때, 기반 CDS 트랜잭션 interface 의 `WHERE` 조건을 따집니다. 적지 않으면 `WHERE` 절을 무시합니다. [[abenbdl_mngd_instance_check_proj]] |
| `use draft` | base BO 의 draft 처리([[abenbdl_with_draft]])를 가져옵니다. |
| `use collaborative draft` | base BO 의 collaborative draft 처리([[abenbdl_with_coll_draft]])를 가져옵니다. |
| `use side effects` | base BO 의 side effects([[abenbdl_side_effects]])를 가져옵니다. |
| `with privileged mode` | privileged mode 를 쓸 수 있게 합니다. base BO 에 privileged mode 가 적혀 있어야 합니다. [[abenbdl_privileged_mode]] |
| `foreign entity EntityName` | 외부 entity 를 정의합니다([[abenbdl_foreign]]). BO 구조에 들지 않는 entity 를 응답 구조의 구성요소로 넣어, 다른 BO 의 메시지를 실어 나를 수 있게 합니다. |

`use ...` 로 가져오는 방법은 [[abenbdl_use_projection]] 에 자세히 나와 있습니다.

머리말 뒤에는 `define behavior for` 로 시작하는 entity behavior definition(동작 정의, [[abenbdl_define_beh_interface]])가 하나 이상 옵니다.

## 예제

draft 와 side effects 를 base BO 에서 가져오는 interface BDEF 입니다. draft 를 가져왔으므로 draft action 도 `use action` 으로 하나하나 가져옵니다.

```bdl
interface;
use draft;
use side effects;

define behavior for ZI_Travel alias Travel
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

  // 이 필드는 interface 의 BDEF derived type 에서 뺀다
  field ( suppress ) LastChangedAt;
}

define behavior for ZI_Booking alias Booking
use etag
{
  use update;
  use delete;

  use association _Travel { with draft; }
}
```

## 알아두기

- behavior pool(동작 풀)을 적을 수 없습니다. `implementation in class` 를 쓸 수 없습니다([[abenbdl_in_class_unique]]). interface BDEF 는 런타임 핸들러가 없는 BDEF 입니다.
- strict mode 를 직접 적을 수 없습니다. 엄격한 검사가 저절로 적용됩니다.
- `with cross associations` 를 직접 적을 수 없습니다([[abenbdl_with_cross_assoc]]). 기반 behavior definition 에 적혀 있으면 저절로 적용됩니다.

## 관련 항목

- [[abenbdl_rap_bo_interface]]
- [[abenbdl_define_beh_interface]]
- [[abenbdl_use_projection]]
- [[abenbdl_mngd_instance_check_proj]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_foreign]]
- [[abenbdl_extensible]]
