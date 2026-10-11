---
title: global 권한 확인 (authorization:global)
summary: authorization master entity 에 정한 authorization control 대신, 그 작업에는 인스턴스와 상관없는 global 권한 확인을 쓰게 하는 추가 구문입니다.
keywords: authorization:global, authorization global, 전역 권한, 권한 제어, FOR GLOBAL AUTHORIZATION, authorization:instance, 확장, extension, 추가 구문
---

## 문법

```syntax
... (authorization:global) ...
```

## 설명

`authorization:global` 을 붙인 작업은 authorization master entity(엔터티)에 정한 [[abenbdl_authorization|authorization control]] 을 쓰지 않고, 대신 **global 권한 확인**을 받습니다.

붙일 수 있는 작업은 다음과 같습니다.

- [[abenbdl_action|action]], [[abenbdl_determine_action|determine action]], [[abenbdl_function|function]] : authorization master entity 에서도, authorization dependent entity 에서도 쓸 수 있습니다.
- 자식으로 가는 association 의 create-by-association

### authorization:instance 와 함께 쓰기

action, determine action, function, create-by-association 에는 `authorization:global` 과 [[abenbdl_actions_auth_instance|authorization:instance]] 를 함께 붙일 수 있습니다. 그러면 작업을 실행하기 전에 handler method(핸들러 메서드) [[abaphandler_meth_global_auth|FOR GLOBAL AUTHORIZATION]] 과 [[abaphandler_meth_auth|FOR INSTANCE AUTHORIZATION]] 을 둘 다 확인합니다.

```bdl
action ( authorization : global, authorization : instance ) MyAction;
function ( authorization : global, authorization : instance ) MyFunction result [1] $self;
association _child { create ( authorization : global, authorization : instance ); }
```

### 아무것도 붙이지 않으면

action, function, create-by-association 에 authorization control(권한 제어)를 따로 적지 않으면, authorization master 에 정한 방식(`global`, `instance`, 또는 둘 다)이 그대로 쓰입니다.

## 예제

base BDEF(기반 BDEF) 는 authorization master 에 authorization control 을 정하고, 확장할 수 있게 열어 둡니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
extensible;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance, global )
extensible
{
  create;
  update;
  delete;
  field ( readonly ) TravelID;
}
```

BDEF extension(확장)에서 action 을 새로 넣습니다. action 마다 authorization control 을 적어, 원래 BDEF 의 authorization control 을 대신합니다. extension action 과 그 권한 확인은 extension 쪽 behavior pool(동작 풀)에 구현합니다.

```bdl
extension using interface ZI_Travel
implementation in class zbp_x_travel unique;

extend behavior for Travel
{
  action ( authorization : global ) zzExportTravel;
  action ( authorization : instance ) zzArchiveTravel;
  action ( authorization : global, authorization : instance ) zzReopenTravel;
  action ( authorization : none ) zzPingTravel;
}
```

## 알아두기

- [[abenbdl_internal|internal]] 작업에는 쓸 수 없습니다.
- managed, unmanaged, projection RAP BO 에서는 authorization master entity 에 정한 authorization control 이 모든 작업에 적용됩니다. [[abenbdl_actions_auth|authorization:none]], [[abenbdl_actions_auth_update|authorization:update]], `authorization:global`, `authorization:instance` 는 골라서 붙이는 것입니다.
- base BDEF 의 extension 에서는 작업마다 authorization control 을 따로 적어야 합니다. extension 작업의 authorization control 이 원래 RAP BO 의 authorization control 에 기대지 않아야, 원래 BO 가 바뀌어도 흔들리지 않기 때문입니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abenbdl_actions_auth_instance]]
- [[abenbdl_actions_auth]]
- [[abenbdl_actions_auth_update]]
- [[abaphandler_meth_global_auth]]
- [[abaphandler_meth_auth]]
- [[abenbdl_operations_additions]]
