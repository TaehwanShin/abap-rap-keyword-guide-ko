---
title: CDS 기반 권한 (읽기 접근 제어)
summary: RAP BO 의 읽기 접근은 CDS 접근 제어(DCL)로 막으며, 이때 entity 끼리 지켜야 하는 AccessControl.authorizationCheck 값의 규칙을 설명합니다.
keywords: CDS-based authorization, AccessControl.authorizationCheck, DCL, CDS 접근 제어, 읽기 권한, #MANDATORY, #NOT_REQUIRED, #NOT_ALLOWED, #PRIVILEGED_ONLY, #CHECK, 권한 마스터 묶음
---

## 설명

RAP BO 의 **읽기 접근**은 behavior definition(동작 정의)가 아니라 CDS 쪽에서 막습니다. BO 가 바탕으로 삼는 CDS 데이터 모델에 ABAP CDS 의 데이터 제어 언어(CDS DCL)로 접근 제어를 만듭니다. 생성·수정·삭제 같은 변경 작업의 권한은 [[abenbdl_authorization]] 에서 다룹니다.

CDS 데이터 정의에서 접근 제어 설정에 쓰는 어노테이션은 `AccessControl.authorizationCheck` 입니다.

### entity 사이의 규칙

behavior definition 에 들어 있는 CDS entity(엔터티)는 이 어노테이션 값에 규칙이 있습니다. 규칙은 **authorization master 묶음**마다 확인합니다. authorization master 묶음은 authorization master entity 하나와 거기에 딸린 authorization dependent entity 전부를 말합니다.

권한은 계층을 따라 내려갑니다. 아래로 내려갈수록 권한 확인은 같거나 더 엄격해질 수만 있습니다. 느슨해질 수는 없습니다.

| parent entity(부모 엔터티)의 값 | child entity(자식 엔터티)에 쓸 수 있는 값 |
| --- | --- |
| `#NOT_REQUIRED` | `#NOT_REQUIRED`, `#MANDATORY` |
| `#NOT_ALLOWED` | `#NOT_ALLOWED`, `#NOT_REQUIRED`, `#MANDATORY` |
| `#PRIVILEGED_ONLY` | `#PRIVILEGED_ONLY` 만 |

여기에 두 가지가 더 있습니다.

- `#CHECK` 는 아예 쓰지 않습니다. 대신 `#MANDATORY` 를 씁니다.
- `#PRIVILEGED_ONLY` 인 entity 의 자식은 모두 CDS composition 으로 이어져 있어야 합니다. 원문은 그 composition 을 "이 어노테이션의 값으로 지정된" 것이라고 적습니다. 그런데 `AccessControl.authorizationCheck` 의 값은 `#PRIVILEGED_ONLY` 같은 정해진 값뿐이어서, 어느 어노테이션을 가리키는지는 원문만으로 알 수 없습니다.

## 예제

루트 `ZR_Travel` 은 `#NOT_REQUIRED`, 자식 `ZR_Booking` 은 `#MANDATORY` 입니다. 자식이 부모보다 엄격하므로 규칙에 맞습니다.

```cds
@AccessControl.authorizationCheck: #NOT_REQUIRED
define root view entity ZR_Travel
  as select from ztravel
  composition [0..*] of ZR_Booking as _Booking
{
  key travel_id as TravelID,
      agency_id as AgencyID,
      status    as Status,
      _Booking
}
```

```cds
@AccessControl.authorizationCheck: #MANDATORY
define view entity ZR_Booking
  as select from zbooking
  association to parent ZR_Travel as _Travel
    on $projection.TravelID = _Travel.TravelID
{
  key travel_id  as TravelID,
  key booking_id as BookingID,
      _Travel
}
```

반대로 `ZR_Travel` 이 `#NOT_REQUIRED` 인데 `ZR_Booking` 을 `#NOT_ALLOWED` 로 두면 규칙에 어긋납니다. 표에서 `#NOT_REQUIRED` 의 자식에는 `#NOT_ALLOWED` 가 없기 때문입니다.

## 알아두기

- DCL 로 만든 접근 제어는 기반 계층에서 projection 과 RAP BO interface 로 그대로 전달됩니다. 읽기 접근 제어를 구현하고 확인하는 실행 예제는 [[abenbdl_draft_query_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_authorization]]
- [[abenbdl_draft_query_abexa]]
