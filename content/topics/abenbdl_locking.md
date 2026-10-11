---
title: 잠금 (lock master, lock dependent)
summary: 한 사람이 인스턴스를 고치는 동안 다른 사람이 같은 데이터를 바꾸지 못하게 막는 RAP 잠금 방식을 entity 마다 정하는 문법입니다.
keywords: lock, lock master, lock dependent by, unmanaged, 잠금, 잠금 마스터, 잠금 종속, 비관적 동시성 제어, pessimistic concurrency control, FOR LOCK, SET LOCKS, lock:none
---

## 문법

```syntax
... lock master [unmanaged]
  | lock dependent by _Assoc
```

## 설명

entity(엔터티)에 RAP 잠금 방식을 정합니다. 잠금은 여러 사용자가 데이터베이스의 같은 데이터를 동시에 바꾸지 못하게 막습니다. 미리 잠가 두고 작업하기 때문에 **비관적 동시성 제어**라고도 부릅니다.

어떤 인스턴스에 잠금 요청이 오면 그 인스턴스의 lock master 와, 거기에 딸린 lock dependent 인스턴스가 모두 잠깁니다. 곧 노드 하나에 잠금 요청이 오면 BO 인스턴스 전체가 잠깁니다. lock dependent entity 에 잠금 요청이 올 때마다 lock master entity 도 함께 잠깁니다.

지켜야 할 규칙은 다음과 같습니다.

- 루트 노드는 `lock master` 로 선언해야 합니다.
- child entity(자식 엔터티)는 모두 `lock dependent by _Assoc` 으로 lock dependent 로 선언해야 합니다. lock dependent 인스턴스에 온 잠금 요청은 lock master entity 로 넘어갑니다.
- 모든 entity 는 `lock master` 이거나 `lock dependent` 여야 합니다. 둘 다 아닌 entity 는 있을 수 없습니다.
- lock dependent entity 에서 lock master 로 가는 association `_Assoc` 은 entity behavior definition(동작 정의)에 `association _AssocToLockMaster { }` 로 적어 두어야 합니다. CDS 데이터 모델에도 이 association 이 있어야 합니다.

### 누가 잠금을 구현하는가

| BO 종류 | 잠금 구현 |
| --- | --- |
| managed | managed RAP BO provider(제공자)가 처리합니다. behavior pool(동작 풀)에 구현할 것이 없습니다. |
| managed + `unmanaged` | behavior pool 의 [[abaphandler_meth_lock|FOR LOCK]] 메서드에 직접 구현합니다. 실행 때 이 메서드가 불립니다. |
| unmanaged | lock master entity 마다 [[abaphandler_meth_lock|FOR LOCK]] handler method(핸들러 메서드)를 구현해야 합니다. |

### 잠금이 걸리는 때

entity 에 잠금을 정해 두면, 아래 변경 작업이 실행되는 동안 대상 인스턴스가 자동으로 잠깁니다.

- [[abenbdl_standard_operations|update]]
- [[abenbdl_standard_operations|delete]]
- [[abenbdl_association|create-by-association (create by association)]]
- [[abenbdl_action|action]]. action 에 [[abenbdl_lock_none|lock:none]] 을 붙이면 그 action 을 실행할 때는 잠금을 걸지 않습니다.

`create` 는 조금 다릅니다. managed RAP BO 에서는 생성할 때 새 키 값이 있으면 그 값을 전역 잠금 테이블에 적습니다. RAP 프레임워크가 자동으로 하는 키 중복 확인의 한 부분입니다. unmanaged RAP BO 에서는 키 중복을 자동으로 확인하지 않고, 키 값을 전역 잠금 테이블에 적지도 않습니다.

### draft 를 쓰는 BO

[[abenbdl_with_draft|draft 를 쓰는 BO]] 에서도 잠금을 따져야 합니다. 이미 있는 active(활성) 인스턴스에 draft 인스턴스가 만들어지면, active 인스턴스에 배타 잠금이 걸려 다른 사용자가 바꿀 수 없습니다. 이 배타 잠금은 ABAP 세션이 끝나도 정해진 시간 동안 남습니다. 유지 시간은 설정할 수 있습니다.

유지 시간이 지나 배타 잠금이 풀리면 [[abenbdl_etag|낙관적 잠금 단계]]가 시작됩니다. 이 단계에서는 배타 잠금이 없습니다. 다만 active 인스턴스가 그 사이 바뀌지 않았다면 draft 를 이어서 편집할 수 있습니다.

### projection BDEF

projection BO 는 base BO(기반 BO) 에 정의하고 구현한 잠금을 그대로 다시 씁니다. 따로 적을 필요가 없습니다. [[abenbdl_character_projection]] 를 참고하세요.

## 예제

루트 `Travel` 이 lock master 이고, 자식 `Booking` 은 to-parent association `_Travel` 을 따라 잠깁니다. 예약 하나를 고치면 그 예약이 속한 여행 전체가 잠깁니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  field ( readonly ) TravelID;

  association _Booking { create; }

  // 이 action 을 실행할 때는 잠금을 걸지 않는다
  action ( lock : none ) recalcPrice result [1] $self;
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;

  field ( readonly ) TravelID, BookingID;

  // lock master 로 가는 association 을 적어 둔다
  association _Travel { }
}
```

managed BO 인데 잠금만 직접 구현하고 싶다면 `lock master unmanaged` 로 적고, handler class(핸들러 클래스)에 `FOR LOCK` 메서드를 만듭니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    " lock master unmanaged 일 때 직접 구현하는 잠금 메서드
    METHODS lock FOR LOCK
      IMPORTING keys FOR LOCK travel.
ENDCLASS.
```

## 알아두기

- 잠금은 전역 잠금 테이블에서 관리합니다.
- [[abenbdl_draft_action|draft action Resume]] 은 잠금이 풀린 뒤 draft 를 이어서 편집할 때, persistent table 의 인스턴스에 잠금을 다시 겁니다.
- EML 의 [[abapset_locks|SET LOCKS]] 문으로 RAP BO 인스턴스를 직접 잠글 수 있습니다.
- lock dependent, authorization dependent, ETag 종속을 한 줄로 줄여 쓸 수 있습니다. `( lock, authorization, etag ) dependent by _Assoc` 형태이며 [[abenbdl_short_syntax]] 에서 설명합니다.

## 관련 항목

- [[abaphandler_meth_lock]]
- [[abenbdl_lock_none]]
- [[abenbdl_etag]]
- [[abapset_locks]]
- [[abenbdl_short_syntax]]
- [[abenbdl_with_draft]]
