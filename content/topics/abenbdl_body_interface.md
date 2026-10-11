---
title: interface BDEF 의 entity 동작 본문
summary: interface BDEF 의 중괄호 안에는 use 로 가져올 작업·event 와 field characteristics, 두 가지만 적을 수 있습니다.
keywords: 엔터티 동작 본문, EntityBehaviorBody, 인터페이스 BDEF, interface, use, use create, use action, use event, field, FieldCharacteristics, 필드 특성, 재사용
---

## 문법

```syntax
... [use  ];
    [FieldCharacteristics];
...
```

## 설명

interface BDEF 의 entity(엔터티) 동작 본문에는 두 가지를 적습니다. base BDEF(기반 BDEF) 의 요소를 가져오는 `use` 와 field characteristics(필드 특성)입니다.

### use

RAP BO 작업과 business event 를 가져옵니다([[abenbdl_use_projection]]). base BO(기반 BO) 에서 가져오려는 것은 **하나하나 `use` 로 적어야** 합니다. 대상은 다음과 같습니다.

- standard operation(표준 작업)
- association 작업
- action, function
- draft action
- event

가져오는 방식은 [[abenbdl_use_projection]] 에 적힌 그대로입니다. 한 가지만 다릅니다. 추가 구문 `precheck` 와 `augment` 는 interface BDEF 에서 쓸 수 없습니다.

### field characteristics

interface BDEF 는 base BO 의 field characteristics 를 모두 저절로 물려받습니다. 여기에 field characteristics 를 더 보탤 수 있습니다. 다만 기반 계층의 field characteristics 와 어긋나면 안 됩니다. interface BDEF 에서 쓸 수 있는 field characteristics 는 [[abenbdl_field_interface]] 에 정리돼 있습니다.

## 예제

```bdl
interface;
use draft;

define behavior for ZI_Travel alias Travel
use etag
{
  // standard operation
  use create;
  use update;
  use delete;

  // draft action
  use action Edit;
  use action Activate;
  use action Discard;
  use action Resume;
  use action Prepare;

  // action, association 작업, event
  use action acceptTravel;
  use association _Booking { create; with draft; }
  use event travelCreated;

  // field characteristics 보태기
  field ( suppress ) LastChangedAt;
}
```

## 알아두기

- `use` 로 적지 않은 작업이나 event 는 interface 에서 쓸 수 없습니다. 저절로 넘어오지 않습니다.
- `precheck` 와 `augment` 는 behavior pool(동작 풀)에 구현이 필요한 추가 구문입니다. projection BDEF 에서만 쓸 수 있고 interface BDEF 에서는 쓸 수 없습니다.
- 본문의 문법 틀에는 `use` 와 field characteristics 만 있습니다. projection BDEF 와 달리 새 action 이나 function 을 정의하는 자리가 없습니다.

## 관련 항목

- [[abenbdl_define_beh_interface]]
- [[abenbdl_field_interface]]
- [[abenbdl_use_projection]]
- [[abenbdl_rap_bo_interface]]
