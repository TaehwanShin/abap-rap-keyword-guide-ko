---
title: extension 의 구현 그룹 (group)
summary: BDEF extension 에서 구현이 필요한 요소를 여러 그룹으로 나누고 그룹마다 다른 구현 클래스를 붙이는 구문입니다.
keywords: group, 그룹, 구현 그룹, implementation in class unique, extension, extend behavior for, 확장 동작 풀, 구현 클래스 나누기
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

그룹은 비즈니스 로직 가운데 구현이 필요한 부분을 여러 덩어리로 나눕니다. 그룹마다 구현 클래스를 따로 붙입니다.

BDEF extension(확장)에서도 원본 RAP BO 와 똑같이 동작합니다. 일반 규칙은 [[abenbdl_grouping]] 에 있습니다. 그룹은 `extend behavior for` 의 중괄호 안에 적습니다.

extension 에서 알아 둘 점은 두 가지입니다.

- 원본 BDEF 가 구현을 여러 그룹으로 나누어 두었더라도, extension 은 **새 그룹을 더 보탤** 수 있습니다.
- 원본 BDEF 에 있는 그룹 하나하나를 확장할 수는 없습니다.

그룹에 붙이는 `implementation in class ... unique` 는 extension behavior pool(동작 풀)을 정하는 구문입니다. 규칙은 [[abenbdl_in_class_unique_ext]] 를 따릅니다.

## 예제

extension 에서 보태는 validation 과 action 을 두 그룹으로 나누고, 그룹마다 구현 클래스를 따로 둡니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  group discount implementation in class zbp_x_travel_discount unique
  {
    validation checkDiscount on save { field ZZDiscount; }
    action ( authorization : none ) resetDiscount result [1] $self;
  }

  group hold implementation in class zbp_x_travel_hold unique
  {
    validation checkPurpose on save { field ZZPurpose; }
    action ( features : instance, authorization : none ) holdTravel result [1] $self;
  }
}
```

## 알아두기

- 원본 BDEF 에 있는 그룹은 extension 대상이 아닙니다. extension 에서는 새 그룹을 만드는 것만 할 수 있습니다.

## 관련 항목

- [[abenbdl_grouping]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_extend_beh]]
- [[abenbdl_entity_beh_extension]]
