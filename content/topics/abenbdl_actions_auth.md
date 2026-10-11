---
title: 권한 확인 제외 (authorization:none)
summary: authorization control 이 걸린 RAP BO 에서 특정 작업 하나만 권한 확인 대상에서 빼는 추가 구문입니다.
keywords: authorization:none, authorization none, 권한 확인 제외, 권한 없음, 권한 제어, authorization master, authorization dependent, 추가 구문
---

## 문법

```syntax
... (authorization:none) ...
```

## 설명

`authorization:none` 을 붙인 작업은 [[abenbdl_authorization|권한 확인]]을 받지 않습니다. 먼저 BO 에 authorization control(권한 제어)가 정의되고 구현되어 있어야 합니다.

붙일 수 있는 작업은 다음과 같습니다.

- [[abenbdl_standard_operations|standard operation]] `create`, `update`, `delete`. 다만 `create` 에는 global 권한일 때만 쓸 수 있습니다.
- [[abenbdl_association|association 작업]]
- [[abenbdl_action|action]]. 다만 static action 에는 global 권한일 때만 쓸 수 있습니다.
- [[abenbdl_determine_action|determine action]]
- [[abenbdl_draft_action|draft action]] `Edit`
- RAP 계층 action
- [[abenbdl_function|function]]

어느 entity(엔터티)에서 쓸 수 있는지는 작업에 따라 다릅니다.

- action 과 determine action : authorization master entity 에서도, authorization dependent entity 에서도 쓸 수 있습니다.
- standard operation(표준 작업), association 작업, draft action `Edit` : authorization master entity 에서만 쓸 수 있습니다.

## 예제

작업 종류마다 적는 자리가 조금씩 다릅니다. draft 를 쓰는 여행 BO 의 behavior definition(동작 정의)에서 필요한 줄만 뽑았습니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( instance )
{
  create;
  update;

  // standard operation
  delete ( authorization : none );

  // association 작업
  association _Booking { create ( authorization : none ); with draft; }

  // action
  action ( authorization : none ) acceptTravel result [1] $self;

  // determine action
  validation validateDates on save { create; field BeginDate, EndDate; }
  determine action ( authorization : none ) checkTravel
  {
    validation validateDates;
  }

  // draft action
  draft action ( authorization : none ) Edit;
}
```

## 알아두기

- managed, unmanaged, projection RAP BO 에서는 authorization master entity 에 정한 authorization control 이 모든 action 에 적용됩니다. `authorization:none`, [[abenbdl_actions_auth_update|authorization:update]], [[abenbdl_actions_auth_global|authorization:global]], [[abenbdl_actions_auth_instance|authorization:instance]] 는 골라서 붙이는 것입니다.
- base BDEF(기반 BDEF) 의 extension(확장)에서는 사정이 다릅니다. action 마다 authorization control 을 따로 적어야 합니다. extension action 의 authorization control 이 원래 RAP BO 의 authorization control 에 기대지 않아야, 원래 BO 가 바뀌어도 흔들리지 않기 때문입니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abenbdl_actions_auth_update]]
- [[abenbdl_actions_auth_global]]
- [[abenbdl_actions_auth_instance]]
- [[abenbdl_operations_additions]]
