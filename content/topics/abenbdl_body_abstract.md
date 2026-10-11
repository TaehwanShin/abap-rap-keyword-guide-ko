---
title: abstract BDEF의 entity 동작 본문
summary: abstract BDEF의 define behavior for 뒤 중괄호 안에 적는 내용으로, field characteristics·association·mapping 세 가지만 올 수 있습니다.
keywords: entity behavior body, 엔터티 동작 본문, 추상 BDEF, abstract BDEF, field characteristics, 필드 특성, association, 연관 관계, mapping, deep mapping, 매핑
---

## 문법

```syntax
... {[field characteristics];
     [associations];
     [mapping];}
...
```

## 설명

abstract BDEF에서 `define behavior for` 뒤의 중괄호 `{ ... }` 안이 entity(엔터티) 동작 본문입니다. abstract BDEF는 타입을 정하는 용도라서, 본문에 올 수 있는 것이 세 가지뿐입니다. standard operation(표준 작업)이나 action, validation 같은 트랜잭션 동작은 올 수 없습니다.

- [[abenbdl_field_abstract]] : abstract BDEF의 필드에 특성을 줍니다. derived type(파생 타입)에서 필드를 빼는 `suppress` 와, 값을 꼭 넘기게 하는 `mandatory:execute` 가 있습니다.
- [[abenbdl_association_abstract]] : association 을 계층 BDEF derived type 에 넣습니다. composition 도 여기서는 `association` 키워드로 적습니다.
- [[abenbdl_type_mapping_abstract]] : abstract BDEF의 데이터 타입을 DDIC 쪽 상대 타입에 연결합니다. 평평한 구조에 쓰는 type mapping(`mapping for`)과 중첩 구조에 쓰는 깊은 mapping(`deep mapping for`) 두 가지가 있습니다.

## 예제

세 가지를 모두 쓴 본문입니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
with control
{
  // field characteristics
  field ( mandatory : execute ) AgencyID;

  // association (composition)
  association _Booking;

  // mapping
  deep mapping for zs_travel_input
  {
    AgencyID  = agency_id;
    BeginDate = begin_date;
    sub _Booking = bookings;
  }
}

define behavior for ZA_BookingInput alias BookingInput
with control
{
  deep mapping for zs_booking_input corresponding
  {
    FlightDate  = flight_date;
    FlightPrice = flight_price;
  }
}
```

## 관련 항목

- [[abenbdl_define_beh_abstract]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_abstract]]
