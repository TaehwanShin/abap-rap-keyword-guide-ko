---
title: 그룹 (group)
summary: 한 business object 의 구현을 여러 클래스로 나눠, 여러 사람이 동시에 작업할 수 있게 하는 문법입니다.
keywords: group, 그룹, grouping, implementation in class, unique, 구현 나누기, 동작 풀 나누기, CCIMP, 대규모 프로젝트, 동시 작업
---

## 문법

```syntax
...
group Group1 implementation in class Class1 unique
{
  // implementation-relevant content
}

group Group2 implementation in class Class2 unique
{
  //implementation-relevant content
}

[group Group3 ...]
...
```

## 설명

그룹은 business object(비즈니스 객체)의 업무 로직 가운데 **구현이 필요한 부분**을 여러 묶음으로 나눕니다. 묶음마다 구현 클래스([[abenbdl_in_class_unique]])를 따로 줍니다. 이렇게 하면 한 business object 의 구현을 기술적으로 여러 조각으로 나눌 수 있습니다.

그룹을 쓰지 않으면 구현은 한 번에 한 사람만 할 수 있습니다. 구현이 들어가는 CCIMP 인클루드를 여러 사람이 동시에 고칠 수 없기 때문입니다.

### 그룹 안에 꼭 넣어야 하는 것

그룹을 쓴다면 managed 든 unmanaged 든 다음은 반드시 그룹 안에 있어야 합니다.

- action ([[abenbdl_action]])
- determination ([[abenbdl_determinations]])
- validation ([[abenbdl_validations]])
- feature control(기능 제어) — 필드에 건 것([[abenbdl_field_char]])과 작업에 건 것([[abenbdl_actions_fc]]) 모두

unmanaged RAP BO 에서는 여기에 더해 다음도 그룹 안에 넣어야 합니다.

- standard operation(표준 작업) `create`, `read`, `update`, `delete`
- association 작업 ([[abenbdl_association]])
- `lock` — lock master entity(엔터티)의 잠금 처리([[abenbdl_locking]])를 어느 그룹에 맡길지 정해야 합니다.

### 그룹 안에 넣을 수 없는 것

- type mapping ([[abenbdl_type_mapping]]). 구현이 필요 없는 부분입니다.

### 안에 넣어도 되고 밖에 둬도 되는 것

- managed RAP BO 의 `create`, `update`, `delete` 와 association 작업
- 구현이 필요 없는 field characteristics(필드 특성) ([[abenbdl_field_char]])

### 그 밖의 규칙

- 그룹을 쓰면 entity 수준의 구현 클래스는 적을 수 없습니다. `define behavior for MyEntity alias MyAlias implementation in class ClassName unique` 는 허용되지 않습니다.
- behavior definition(동작 정의) 머리말에 적는, 하위 노드까지 BO 전체에 적용되는 구현 클래스는 적을 수 있습니다. `managed implementation in class ClassName unique` 는 허용됩니다.
- 서로 다른 그룹을 같은 구현 클래스로 구현해도 됩니다.
- 그룹 이름 `Group1`, `Group2`, ... 는 같은 이름의 action, determination, validation 과 겹치면 안 됩니다.
- RAP BO consumer(사용자)에게 그룹 이름은 아무 의미가 없습니다. 그래서 나중에 그룹 이름을 바꿔도 됩니다.
- association 은 통째로만 그룹에 넣을 수 있습니다. 그래서 association 을 따라 읽기와 association 으로 만들기는 같은 클래스에서 구현해야 합니다.

### 쓸 수 있는 곳

managed RAP BO, unmanaged RAP BO

## 예제

여행 entity 의 구현을 "승인 처리"와 "점검·계산" 두 그룹으로 나눕니다. 두 사람이 각자 클래스를 맡아 동시에 작업할 수 있습니다.

```bdl
managed;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  // managed 이므로 standard operation 은 그룹 밖에 둬도 된다
  create;
  update;
  delete;
  association _Booking { create; }

  // 구현이 필요 없는 field characteristics 도 밖에 둘 수 있다
  field ( readonly : update ) TravelID;

  group approval implementation in class zbp_r_travel_approval unique
  {
    action acceptTravel result [1] $self;
    action rejectTravel result [1] $self;
  }

  group checks implementation in class zbp_r_travel_checks unique
  {
    validation validateDates on save { create; field BeginDate, EndDate; }
    determination setStatusNew on modify { create; }
  }

  // type mapping 은 그룹 안에 넣을 수 없다
  mapping for ztravel corresponding;
}
```

## 알아두기

- 그룹과 entity 수준 `implementation in class` 는 함께 쓸 수 없습니다.
- 큰 개발 프로젝트에서 그룹을 쓰는 방법은 RAP 개발 안내서의 "Using Groups in Large Development Projects" 에 나와 있습니다.

## 관련 항목

- [[abenbdl_in_class_unique]]
- [[abenbdl_action]]
- [[abenbdl_determinations]]
- [[abenbdl_validations]]
- [[abenbdl_actions_fc]]
- [[abenbdl_field_char]]
- [[abenbdl_association]]
- [[abenbdl_locking]]
- [[abenbdl_type_mapping]]
