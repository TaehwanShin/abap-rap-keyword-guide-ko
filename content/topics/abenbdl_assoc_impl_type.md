---
title: association 구현 방식 (managed | unmanaged)
summary: association 작업을 managed RAP BO provider 가 처리할지, behavior pool 에 직접 구현할지를 association 마다 정하는 추가 구문입니다.
keywords: AssocImplType, managed association, unmanaged association, 연관 관계 구현 방식, 관리형 연관 관계, 비관리형 연관 관계, with cross associations, source-resolved, target-resolved
---

## 문법

```syntax
... [ managed | unmanaged ]
```

## 설명

`association` 앞에 `managed` 나 `unmanaged` 를 붙이면, BO 전체의 구현 방식과 다르게 **그 association 의 작업만** 누가 처리할지 정할 수 있습니다. standard operation(표준 작업)은 read-by-association·생성이고, non-standard operation(비표준 작업)은 link action, unlink action, inverse function 입니다.

### managed

구현 방식이 unmanaged 인 BO 에서만 쓸 수 있습니다. association 종류에 따라 처리 주체가 갈립니다.

| association 종류 | 작업 | 처리하는 쪽 |
| --- | --- | --- |
| 소스 해석(source-resolved) | standard operation | managed RAP BO provider(제공자). behavior pool(동작 풀)에 구현하지 않습니다. |
| 소스 해석 | non-standard operation, active(활성) 인스턴스 | 개발자가 behavior pool 에 구현합니다. |
| 소스 해석 | non-standard operation, draft 인스턴스 | draft 를 쓰는 unmanaged BO 에서는 managed RAP BO provider 가 처리합니다. |
| 대상 해석(target-resolved) | standard operation 과 non-standard operation | managed RAP BO provider. active 인스턴스도, draft 를 쓰는 BO 의 draft 인스턴스도 마찬가지입니다. |

### unmanaged

구현 방식이 managed 인 BO, 그리고 draft 를 쓰는 unmanaged BO 에서만 쓸 수 있습니다. standard operation 과 non-standard operation 을 모두 behavior pool 에 직접 구현해야 합니다. draft 를 쓰는 BO 에서는 active 인스턴스와 draft 인스턴스 둘 다 그렇습니다.

### 아무것도 적지 않을 때

| BO 구현 방식 | 처리하는 쪽 |
| --- | --- |
| managed | standard operation 과 non-standard operation 모두 managed RAP BO provider 가 처리합니다. active 인스턴스도, draft 를 쓰는 BO 의 draft 인스턴스도 같습니다. |
| unmanaged, active 인스턴스 | standard operation 과 non-standard operation 모두 behavior pool 에 구현해야 합니다. |
| unmanaged, draft 인스턴스 | association 작업 대부분을 managed RAP BO provider 가 처리합니다. |

## 예제

managed BO 인 여행에 association 이 둘 있습니다. `_Booking` 은 provider 에게 맡기고, 조건이 붙은 `_ConfirmedBooking` 만 `unmanaged` 로 선언해 직접 구현합니다.

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

  // managed RAP BO provider 가 처리한다
  association _Booking { create; }

  // 읽기와 생성을 behavior pool 에 직접 구현한다
  unmanaged association _ConfirmedBooking { create; }
}
```

## 알아두기

- 구현 방식을 적지 않으면 provider 가 처리해 주지만, 모든 association 에서 트랜잭션 처리가 제대로 된다는 보장은 없습니다. managed BO 에서도, unmanaged BO 의 draft 인스턴스에서도 그렇습니다.
- managed BO 에서 다른 BO 로 가는 소스 해석 association 은 BDEF 머리말의 [[abenbdl_with_cross_assoc|with cross associations]] 에 영향을 받습니다. 이 추가 구문이 없으면 지원하지 않는 경우가 있습니다. 예를 들어 연관 대상이 late numbering 을 쓰면 create-by-association 할 수 없습니다.
- 이미 지원하는 경우에도 `with cross associations` 를 쓰면 문법 검사와 오류 처리가 더해진, 개선된 managed 런타임 구현으로 바뀝니다.

## 관련 항목

- [[abenbdl_association]]
- [[abenbdl_unmanaged_assoc_abexa]]
- [[abenbdl_assoc_stand_ops]]
- [[abenbdl_assoc_nonstand_ops]]
- [[abenbdl_with_cross_assoc]]
