---
title: projection BDEF 의 entity 동작 특성
summary: projection BDEF 에서 직접 적는 entity 동작 특성(use etag, extensible, authorization)과 base BO 에서 저절로 물려받는 특성을 나눠 정리합니다.
keywords: 엔터티 동작 특성, EntityBehaviorCharacteristics, 프로젝션 BDEF, projection, use etag, extensible, authorization, 자동 재사용, 상속, persistent table, lock, numbering
---

## 문법

```syntax
... [use etag]
    [extensible]
    [authorization]  ...
```

## 설명

projection BDEF 에서 `define behavior for` 와 중괄호 사이에 적는 **entity(엔터티) 동작 특성**입니다. 직접 적어야 하는 것, 경우에 따라 적는 것, 적지 않아도 base BO(기반 BO) 에서 저절로 넘어오는 것으로 나뉩니다.

### 필요하면 직접 적어야 하는 것

| 특성 | 뜻 |
| --- | --- |
| `use etag` | base BO 에 ETag 필드가 정해져 있으면 동시 수정 확인용으로 가져옵니다. ETag 는 [[abenbdl_etag]], 가져오는 방법은 [[abenbdl_use_projection]] 을 봅니다. |
| `extensible` | BDEF extension(확장)을 허용합니다. behavior definition(동작 정의) 머리말에 선언해야 하고, extension 을 허용할 **entity 마다** entity 동작 특성에도 `extensible` 을 적어야 합니다. projection BDEF 에서는 키워드 `extensible` 만 쓸 수 있고 다른 추가 구문은 붙일 수 없습니다. [[abenbdl_extensible]] |

### 경우에 따라 적거나 물려받는 것

`authorization` ([[abenbdl_authorization_projection]])

- base BO 에 정한 authorization control(권한 제어)는 모두 projection BO 로 저절로 넘어옵니다. base BO 의 authorization control 은 [[abenbdl_authorization]] 을 봅니다.
- projection BDEF 에 새 action 을 정의했다면, 그 새 action 의 authorization control 을 projection 계층에 적을 수 있습니다.

### 저절로 물려받는 것

다음은 구현에 속하는 부분이라 저절로 넘어옵니다. projection 에 적지 않습니다.

- persistent table ([[abenbdl_persistent_table]])
- draft 테이블 ([[abenbdl_draft_table]])
- 저장 옵션 ([[abenbdl_saving]])
- 잠금 ([[abenbdl_locking]]). projection BO 는 lock master 와 lock dependent 관계를 물려받습니다. projection BO 인스턴스에 변경 작업을 할 때마다 `FOR LOCK` 메서드([[abaphandler_meth_lock]])가 불리고 그 entity 가 잠깁니다.
- change documents
- early numbering ([[abenbdl_early_numb]])
- late numbering ([[abenbdl_late_numbering]])

## 예제

여행 entity 에 세 특성을 모두 적었습니다. persistent table, 잠금, numbering 은 적지 않았지만 base BO `ZR_Travel` 의 것이 그대로 적용됩니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );
extensible;

define behavior for ZC_Travel alias Travel
use etag
extensible
authorization ( global )
{
  use create;
  use update;
  use delete;

  use action acceptTravel;
  use association _Booking { create; }

  // projection 에서 새로 정의한 action. 위의 authorization ( global ) 이 적용된다
  action sendReminder;
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

- `use etag` 는 entity 마다 따로 적습니다. 적지 않으면 그 entity 에서는 동시 수정 확인 기능을 잃습니다.
- `extensible` 은 머리말에만 적어서는 부족합니다. extension 을 허용할 entity 에도 적어야 합니다.

## 관련 항목

- [[abenbdl_define_beh_projection]]
- [[abenbdl_authorization_projection]]
- [[abenbdl_body_projection]]
- [[abenbdl_use_projection]]
- [[abenbdl_etag]]
- [[abenbdl_extensible]]
- [[abenbdl_character]]
