---
title: instance 권한 확인 (authorization:instance)
summary: authorization master entity 에 정한 authorization control 대신, 그 작업에는 인스턴스마다 따지는 권한 확인을 쓰게 하는 추가 구문입니다.
keywords: authorization:instance, authorization instance, 인스턴스 권한, 권한 제어, FOR INSTANCE AUTHORIZATION, authorization:global, 확장, extension, 추가 구문
---

## 문법

```syntax
... (authorization:instance) ...
```

## 설명

`authorization:instance` 를 붙인 작업은 authorization master entity(엔터티)에 정한 [[abenbdl_authorization|authorization control]] 을 쓰지 않고, 대신 **instance 권한 확인**을 받습니다. 인스턴스 하나하나를 놓고 실행해도 되는지 따집니다.

붙일 수 있는 작업은 다음과 같습니다.

- [[abenbdl_action|action]], [[abenbdl_determine_action|determine action]], [[abenbdl_function|function]] : authorization master entity 에서도, authorization dependent entity 에서도 쓸 수 있습니다.
- 자식으로 가는 association 의 create-by-association

### authorization:global 과 함께 쓰기

action, determine action, function, create-by-association 에는 `authorization:instance` 와 [[abenbdl_actions_auth_global|authorization:global]] 을 함께 붙일 수 있습니다. 그러면 작업을 실행하기 전에 handler method(핸들러 메서드) [[abaphandler_meth_global_auth|FOR GLOBAL AUTHORIZATION]] 과 [[abaphandler_meth_auth|FOR INSTANCE AUTHORIZATION]] 을 둘 다 확인합니다.

```bdl
action ( authorization : global, authorization : instance ) MyAction;
function ( authorization : global, authorization : instance ) MyFunction result [1] $self;
association _child { create ( authorization : global, authorization : instance ); }
```

### 아무것도 붙이지 않으면

action, function, create-by-association 에 authorization control(권한 제어)를 따로 적지 않으면, authorization master 에 정한 방식(`global`, `instance`, 또는 둘 다)이 그대로 쓰입니다.

## 예제

base BDEF(기반 BDEF) 가 extension(확장)을 허용하는 여행 BO 라고 합시다. BDEF extension 에서 넣는 action 에는 authorization control 을 하나씩 적습니다. root entity(루트 엔터티)의 extension action 에는 instance 권한 확인을 걸고, authorization dependent entity 인 예약의 action 은 수정 권한에 맡깁니다.

```bdl
extension using interface ZI_Travel
implementation in class zbp_x_travel unique;

extend behavior for Travel
{
  // 여행 인스턴스마다 권한을 따진다
  action ( authorization : instance ) zzArchiveTravel;

  // global 권한과 instance 권한을 둘 다 확인한다
  action ( authorization : global, authorization : instance ) zzReopenTravel;
}

extend behavior for Booking
{
  action ( authorization : update ) zzRebook;
}
```

instance 권한 확인은 extension 쪽 behavior pool(동작 풀)의 handler method 에 구현합니다.

```abap
METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
  IMPORTING keys REQUEST requested_authorizations FOR travel RESULT result.
```

## 알아두기

- [[abenbdl_internal|internal]] 작업에는 쓸 수 없습니다.
- [[abenbdl_static|정적]] RAP BO 작업에는 쓸 수 없습니다.
- managed, unmanaged, projection RAP BO 에서는 authorization master entity 에 정한 authorization control 이 모든 작업에 적용됩니다. [[abenbdl_actions_auth|authorization:none]], [[abenbdl_actions_auth_update|authorization:update]], `authorization:global`, `authorization:instance` 는 골라서 붙이는 것입니다.
- base BDEF 의 extension 에서는 작업마다 authorization control 을 따로 적어야 합니다. extension 작업의 authorization control 이 원래 RAP BO 의 authorization control 에 기대지 않아야, 원래 BO 가 바뀌어도 흔들리지 않기 때문입니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abenbdl_actions_auth_global]]
- [[abenbdl_actions_auth]]
- [[abenbdl_actions_auth_update]]
- [[abaphandler_meth_auth]]
- [[abaphandler_meth_global_auth]]
- [[abenbdl_operations_additions]]
