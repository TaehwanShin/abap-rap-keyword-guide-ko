---
title: 잠금 없이 실행 (lock:none)
summary: action 을 실행할 때 그 entity 인스턴스에 잠금을 걸지 않게 하는 추가 구문입니다.
keywords: lock:none, lock none, 잠금 없음, 잠금, non-locking, 액션, factory action, lock master, 추가 구문
---

## 문법

```syntax
... (lock:none) ...
```

## 설명

`lock:none` 을 붙인 action 은, 실행할 때 대상 entity(엔터티) 인스턴스에 잠금을 걸지 않습니다. 먼저 BO 에 RAP 잠금이 정의되고 구현되어 있어야 합니다.

붙일 수 있는 작업은 다음과 같습니다.

- 인스턴스에 묶인 [[abenbdl_action_nonfactory|non-factory action]]
- 인스턴스에 묶인 [[abenbdl_action_factory|factory action]]
- RAP 계층 action

### 어디에서 쓸 수 있나

- managed RAP BO
- unmanaged RAP BO
- projection BDEF 와 interface BDEF : base BO(기반 BO) 의 잠금 설정이 자동으로 그대로 쓰입니다. 따로 적을 필요가 없습니다. [[abenbdl_use_projection]] 참고.

## 예제

여행 내용을 바꾸지 않고 확인 메일만 보내는 action 은 잠금 없이 실행하게 합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  // 실행할 때 여행 인스턴스를 잠그지 않는다
  action ( lock : none ) sendConfirmation;

  // 잠금을 건다 (기본)
  action acceptTravel result [1] $self;
}
```

## 알아두기

- static action 에는 쓸 수 없습니다. static action 은 특정 인스턴스와 상관이 없으므로 원래부터 잠그지 않습니다.
- 잠금을 빼 주는 것은 **action 자체**뿐입니다. action 구현 안에서 하는 변경 호출은 영향을 받지 않습니다. 그래서 `lock:none` 으로 정의한 action 이라도, 그 action 이 인스턴스를 변경하면 인스턴스는 잠깁니다.

## 관련 항목

- [[abenbdl_locking]]
- [[abenbdl_action]]
- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_factory]]
- [[abenbdl_static]]
- [[abenbdl_operations_additions]]
