---
title: 수정 권한에 맡기기 (authorization:update)
summary: 작업의 권한 확인을 수정(update) 작업의 권한 확인에 맡겨, 수정할 수 있는 사람만 그 작업을 실행하게 하는 추가 구문입니다.
keywords: authorization:update, authorization update, 수정 권한, 권한 위임, 권한 제어, update, authorization dependent, 추가 구문
---

## 문법

```syntax
... (authorization:update) ...
```

## 설명

`authorization:update` 를 붙인 작업은 [[abenbdl_authorization|권한 확인]]을 수정(update) 작업에 맡깁니다. 수정 작업에 정한 authorization control(권한 제어)가 그 작업에도 똑같이 적용됩니다.

- 먼저 BO 에 authorization control 이 정의되고 구현되어 있어야 합니다.
- 그 entity(엔터티)에 수정 작업이 열려 있지 않아도 됩니다. `update` 를 선언하지 않은 entity 에서도 다른 작업의 권한을 수정 작업에 맡길 수 있습니다.

붙일 수 있는 작업은 다음과 같습니다.

- [[abenbdl_standard_operations|standard operation]] `delete`
- create-by-association
- [[abenbdl_action|action]]
- [[abenbdl_determine_action|determine action]]
- RAP 계층 action

## 예제

여행을 지우는 일, 예약을 만드는 일, 여행을 승인하는 일을 모두 "여행을 수정할 수 있는가"로 판단하게 합니다. authorization dependent entity 인 예약의 action 도 같은 방식으로 맡깁니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete ( authorization : update );

  association _Booking { create ( authorization : update ); }

  action ( authorization : update ) acceptTravel result [1] $self;
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID;
  association _Travel;

  // 결국 여행(authorization master)의 수정 권한으로 판단한다
  action ( authorization : update ) cancelBooking;
}
```

## 알아두기

- authorization dependent entity 의 standard operation(표준 작업)은 자동으로 authorization master entity 의 수정 작업에 맡겨집니다.
- authorization dependent entity 의 action 을 수정 작업에 맡기면, 결국 authorization master entity 의 수정 작업에 맡겨집니다.
- [[abenbdl_internal|internal]] 작업에는 쓸 수 없습니다. internal action 은 안에서만 불리므로 권한 확인 자체가 없습니다.
- managed, unmanaged, projection RAP BO 에서는 authorization master entity 에 정한 authorization control 이 모든 action 에 적용됩니다. [[abenbdl_actions_auth|authorization:none]], `authorization:update`, [[abenbdl_actions_auth_global|authorization:global]], [[abenbdl_actions_auth_instance|authorization:instance]] 는 골라서 붙이는 것입니다.
- base BDEF(기반 BDEF) 의 extension(확장)에서는 action 마다 authorization control 을 따로 적어야 합니다. extension action 의 authorization control 이 원래 RAP BO 의 authorization control 에 기대지 않아야, 원래 BO 가 바뀌어도 흔들리지 않기 때문입니다.
- projection BDEF 에서 쓰는 예는 [[abenbdl_authorization_projection]] 에 있습니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abenbdl_actions_auth]]
- [[abenbdl_actions_auth_global]]
- [[abenbdl_actions_auth_instance]]
- [[abenbdl_authorization_projection]]
- [[abenbdl_operations_additions]]
