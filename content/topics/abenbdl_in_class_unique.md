---
title: behavior pool 지정 (implementation in class ... unique)
summary: RAP BO 의 동작을 구현할 behavior pool 클래스를 정하는 구문으로, 머리말·entity·구현 그룹 세 자리에 적을 수 있습니다.
keywords: implementation in class, unique, 동작 풀, behavior pool, ABP, BP_, 구현 클래스, handler class, saver class, group, 구현 그룹
---

## 문법

```syntax
... implementation in class ClassName unique
```

## 설명

RAP BO 의 behavior pool(동작 풀)을 정합니다. behavior pool(ABP)은 behavior implementation(동작 구현)만 담는 특별한 클래스 풀입니다. 전역 클래스 이름은 보통 `BP_` 로 시작합니다.

전역 클래스가 동작을 직접 구현하지는 않습니다. 구현은 그 안의 로컬 handler class(핸들러 클래스)와 saver class(세이버 클래스)에 씁니다. 이 클래스들이 unmanaged RAP BO provider(제공자) 노릇을 하고, RAP BO 에 접근이 들어오면 RAP 런타임 엔진이 이들을 부릅니다.

### 어디에 적나

적는 자리에 따라 구현이 나뉘는 모양이 달라집니다.

| 자리 | 결과 |
| --- | --- |
| BDEF 머리말 | 자기 구현 클래스가 따로 없는 모든 entity(엔터티)의 구현이 이 클래스 하나에 들어갑니다. entity 별 behavior pool 을 더 둘 수도 있습니다. |
| entity behavior definition(동작 정의) | CDS entity 마다 정합니다. RAP BO 의 노드마다 구현 클래스를 따로 둘 수 있습니다. 머리말에도 클래스가 있으면, 그 클래스는 자기 구현 클래스가 없는 entity 를 맡습니다. |
| entity 동작 본문의 구현 그룹 | `group` 으로 나눈 그룹마다 정합니다([[abenbdl_grouping]]). 그룹마다 구현 클래스가 있어야 하고, 이때 entity 에는 구현 클래스를 두면 안 됩니다. 머리말의 클래스는 함께 둘 수 있습니다. |

어떤 entity 나 그룹의 동작은 **거기에 정한 behavior pool 에서만** 구현할 수 있습니다. 다른 클래스가 구현하려 하면 오류 메시지가 납니다.

`unique` 는 꼭 붙여야 합니다. 작업 하나를 딱 한 번만 구현할 수 있다는 뜻입니다.

### 구현 타입별로 필요한가

- **managed RAP BO** : [[abenbdl_standard_operations|standard operation]], [[abenbdl_association|association 작업]], transactional buffer(트랜잭션 버퍼), save sequence(저장 순서)는 RAP 프레임워크가 해 줍니다. 이런 것에는 behavior pool 이 필요 없습니다. authorization control(권한 제어)처럼 managed RAP BO provider 가 해 줄 수 없는 것에만 behavior pool 이 필요합니다.
- **unmanaged RAP BO** : behavior pool 이 꼭 있어야 합니다. 구현 전부를 behavior pool 안의 unmanaged RAP BO provider 가 맡습니다.
- **projection BDEF** : 없어도 되지만 둘 수 있습니다. base BO(기반 BO) 에서 [[abenbdl_use_projection|다시 쓰는]] 기능은 base BO 의 구현을 그대로 쓰므로 구현이 필요 없습니다. projection BDEF 에 [[abenbdl_nonstandard_projection|새 action 이나 function]] 을 정의했다면 behavior pool 이 필요합니다.

## 예제

머리말에 behavior pool 을 정합니다. 모든 entity 의 구현이 `zbp_r_travel` 에 들어갑니다.

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
}
```

entity 마다 behavior pool 을 정합니다.

```bdl
managed;
strict ( 2 );

define behavior for ZR_Travel alias Travel
implementation in class zbp_r_travel unique
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
implementation in class zbp_r_booking unique
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID;
  association _Travel;
}
```

구현 그룹마다 behavior pool 을 정합니다. unmanaged save(`with unmanaged save`)을 구현하려면 머리말에도 클래스가 있어야 합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
with unmanaged save
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  group approval implementation in class zbp_r_travel_appr unique
  {
    action acceptTravel result [1] $self;
  }

  group checks implementation in class zbp_r_travel_chk unique
  {
    validation validateDates on save { create; field BeginDate, EndDate; }
  }
}
```

## 관련 항목

- [[abenabap_behavior_pools]]
- [[abenbdl_grouping]]
- [[abenbdl_bdef_header]]
- [[abenbdl_define_beh]]
- [[abenbdl_use_projection]]
- [[abenbdl_nonstandard_projection]]
