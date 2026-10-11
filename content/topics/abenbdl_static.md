---
title: static 작업 (static)
summary: action 이나 function 을 특정 entity 인스턴스에 묶지 않고 entity 전체에 걸리는 작업으로 만드는 추가 구문입니다.
keywords: static, 정적, 정적 액션, 정적 함수, static action, static function, static factory action, features:global, authorization:global, 추가 구문
---

## 문법

```syntax
... static ...
```

## 설명

`static` 을 붙인 non-standard operation(비표준 작업)은 **어느 entity(엔터티) 인스턴스에도 묶이지 않습니다**. 인스턴스 하나가 아니라 RAP BO entity 전체에 걸리는 작업입니다.

정적으로 만들 수 있는 non-standard operation 은 다음과 같습니다.

- non-factory action (factory 가 아닌 action)
- factory action
- save action
- function

static 작업에는 global feature control(기능 제어, [[abenbdl_actions_fc|features:global]])와 global authorization control(권한 제어, [[abenbdl_actions_auth_global|authorization:global]])를 쓸 수 있습니다.

## 예제

기간이 지난 여행을 한꺼번에 닫는 static action 과, 빈 틀에서 여행을 새로 만드는 static factory action 을 선언합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( global )
{
  create;
  update;
  delete;

  // 특정 여행이 아니라 여행 전체에 걸리는 action
  static action ( features : global, authorization : global ) closeExpiredTravels;

  // 인스턴스 없이 불러 새 여행을 하나 만든다
  static factory action createFromTemplate [1];
}
```

## 알아두기

- [[abenbdl_action_repeatable|repeatable]] 로 정의한 repeatable 작업은 정적으로 만들 수 없습니다.
- static 작업에는 instance feature control([[abenbdl_actions_fc|features:instance]])를 쓸 수 없습니다. 묶인 인스턴스가 없기 때문입니다.
- static 작업에는 instance authorization control([[abenbdl_actions_auth_instance|authorization:instance]])를 쓸 수 없습니다. 이유는 같습니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_actions_fc]]
- [[abenbdl_actions_auth_global]]
- [[abenbdl_lock_none]]
- [[abenbdl_operations_additions]]
