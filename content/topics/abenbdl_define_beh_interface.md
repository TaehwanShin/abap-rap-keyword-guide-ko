---
title: interface BDEF 의 entity behavior definition (define behavior for)
summary: interface BDEF 에서 entity 마다 적는 define behavior for 문입니다. 별칭, 바깥 이름, use etag 만 정하고 나머지는 base BO 에서 물려받습니다.
keywords: define behavior for, 인터페이스 BDEF, interface, alias, external, use etag, 엔터티 동작 정의, CDS transactional interface, 자동 재사용
---

## 문법

```syntax
define behavior for ProjectedEntity [alias AliasName] [ external ExternalName]
[use etag]
{
  EntityBehaviorBody
}

[behavior for ChildEntity1][, behavior for ChildEntity2][, ...
]
```

## 설명

RAP BO interface 의 동작을 entity(엔터티) 단위로 정의합니다. interface behavior definition(동작 정의)는 base BO(기반 BO) 의 노드를 일부만 가져와도 되고 모두 가져와도 됩니다. root entity(루트 엔터티) `ProjectedEntity` 는 CDS 트랜잭션 interface 여야 합니다.

- `alias AliasName` : 별칭입니다. 적는 것이 좋습니다. entity 이름은 ABAP Dictionary 전체에서 겹치지 않아야 하지만 별칭은 그럴 필요가 없어 더 알아보기 쉽게 지을 수 있습니다. 길이는 30자까지입니다. 별칭을 적지 않으면 문법 경고가 납니다.
- `external ExternalName` : 바깥에서 쓸 이름을 따로 정합니다([[abenbdl_external]]). 예를 들어 interface BDEF 위에 projection 계층을 하나 더 쌓을 때 이 이름을 쓸 수 있습니다. 별칭보다 훨씬 길게 지을 수 있습니다.
- `use etag` : interface 에서 쓸 수 있는 entity 동작 특성은 **이것 하나뿐**입니다. base BO 에 ETag 필드가 정해져 있으면 동시 수정 확인용으로 가져올 수 있습니다. ETag 는 [[abenbdl_etag]], 가져오는 방법은 [[abenbdl_use_projection]] 을 봅니다.
- `EntityBehaviorBody` : entity 동작 본문입니다([[abenbdl_body_interface]]). base BDEF(기반 BDEF) 의 트랜잭션 동작 가운데 일부, 예를 들어 RAP BO 작업을 내놓습니다.

### 저절로 물려받는 것

다음 특성은 base BO 에 있으면 저절로 넘어옵니다. interface 에 **다시 적으면 안 됩니다**.

- RAP BO 작업의 authorization control(권한 제어)
- persistent table
- draft 테이블
- 저장 옵션 ([[abenbdl_saving]])
- 잠금. interface 는 lock master 와 lock dependent 관계를 물려받습니다. interface 인스턴스에 변경 작업을 할 때마다 `FOR LOCK` 메서드([[abaphandler_meth_lock]])가 불리고 해당 entity 가 잠깁니다.
- change documents
- early numbering
- late numbering

## 예제

```bdl
interface;

define behavior for ZI_Travel alias Travel external 'TravelInterface'
use etag
{
  use create;
  use update;
  use delete;

  use action acceptTravel;
  use association _Booking { create; }
}

define behavior for ZI_Booking alias Booking
use etag
{
  use update;
  use delete;

  use association _Travel;
}
```

persistent table, 잠금, authorization control 을 적지 않았습니다. base BO `ZR_Travel` 에 정한 것이 그대로 적용됩니다.

## 알아두기

- interface 에는 `persistent table`, `lock master`, `authorization master` 같은 특성을 적지 않습니다. base BO 의 것을 물려받습니다.
- `use etag` 는 entity 마다 따로 적습니다. 적지 않으면 그 entity 에서는 동시 수정 확인 기능을 잃습니다.

## 관련 항목

- [[abenbdl_rap_bo_interface]]
- [[abenbdl_bo_interface_header]]
- [[abenbdl_body_interface]]
- [[abenbdl_use_projection]]
- [[abenbdl_etag]]
- [[abenbdl_external]]
