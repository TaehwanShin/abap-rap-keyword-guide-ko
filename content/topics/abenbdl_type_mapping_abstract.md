---
title: abstract BDEF 의 mapping (mapping, deep mapping)
summary: abstract BDEF 의 타입을 DDIC 구조에 연결하는 문법으로, flat structure 에는 mapping for 를, 중첩된 deep structure 에는 deep mapping for 를 씁니다.
keywords: mapping, deep mapping, mapping for, deep mapping for, sub, corresponding, extensible, 타입 매핑, 깊은 매핑, 추상 BDEF, abstract BDEF, DDIC 구조, 계층 타입, with hierarchy
---

## 문법

type mapping

```syntax
... mapping for PartnerType ...
```

deep mapping

```syntax
... deep mapping for NestedDeepDDICType [corresponding [extensible]]
   {
      EntityComp1 = PartnerComp1
     [...]
     [sub _Compos1 = Partnersub1][,
      sub _Compos2 = Partnersub2]
     [...]
    }
...
```

## 설명

RAP type mapping 은 abstract BDEF 의 데이터 타입을 DDIC 쪽 상대 타입에 연결합니다. 상대 타입의 모양에 따라 두 가지 가운데 하나를 씁니다.

| 상대 타입 | 쓰는 문법 |
| --- | --- |
| flat structure 이고 기본 타입끼리만 연결 | `mapping for` |
| 중첩 구조 또는 deep structure | `deep mapping for` |

### mapping for

구성요소를 flat DDIC 구조에 연결합니다. 문법은 managed·unmanaged RAP BO 의 type mapping 과 같습니다. [[abenbdl_type_mapping]] 을 보세요.

### deep mapping for

`with hierarchy` 가 붙은 abstract BDEF 에서, 만들어진 계층 derived type(파생 타입)을 중첩되거나 deep DDIC 타입에 연결합니다. 이런 mapping 은 반드시 `deep` 으로 시작합니다.

**sub** : child entity(자식 엔터티)를 상대 타입의 하위 구성요소에 연결합니다.

```syntax
sub _Compos1 = Partnersub1
```

- 왼쪽 `_Compos1` 은 entity(엔터티)의 composition 이름입니다.
- 오른쪽은 상대 타입 `NestedDeepDDICType` 의 구성요소 이름입니다.
- composition 의 카디널리티가 1보다 크면 child entity 를 **중첩 테이블** 구성요소에 연결합니다.
- 카디널리티가 1 이하면 **하위 구조**에 연결합니다.
- 서로 연결하는 두 구성요소는 모양이 맞아야 합니다. 둘 다 테이블이거나 둘 다 구조여야 합니다.

계층 derived type 전체를 덮으려면, composition 계층에 있는 **entity 마다** 자기 상대 타입으로 가는 mapping 을 정의해야 합니다. 그리고 단계마다 child entity 를 `sub` 로 이어 줍니다.

**corresponding** : 이름이 같은 구성요소를 자동으로 연결합니다.

**extensible** : 이 type mapping 에 BDEF extension(확장)을 허용합니다. RAP BO consumer(사용자)가 이 mapping 에 extension 필드를 더할 수 있게 됩니다. `corresponding` 과 함께 써야만 합니다. 이름이 같은 구성요소가 자동으로 연결되어야 하기 때문입니다. 예) `deep mapping for NestedDeepDDICType corresponding extensible;` extensibility(확장 허용)에 관한 내용은 [[abenbdl_ext_enabling_abstract]] 에 있습니다.

## 예제

여행 입력값과 그 아래 예약 입력값을, DDIC 구조 `zs_travel_input` 과 그 안의 테이블 구성요소 `bookings`(줄 타입 `zs_booking_input`)에 연결합니다. entity 마다 mapping 을 하나씩 둡니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
{
  association _Booking;

  deep mapping for zs_travel_input
  {
    AgencyID  = agency_id;
    BeginDate = begin_date;
    // composition _Booking 을 테이블 구성요소 bookings 에 연결
    sub _Booking = bookings;
  }
}

define behavior for ZA_BookingInput alias BookingInput
{
  deep mapping for zs_booking_input corresponding
  {
    FlightDate  = flight_date;
    FlightPrice = flight_price;
  }
}
```

## 알아두기

- `deep mapping` 은 머리말에 `with hierarchy` 가 있는 abstract BDEF 에서만 씁니다.
- `extensible` 은 `corresponding` 없이 쓸 수 없습니다.
- 스칼라 entity(`scalar entity`)로 넣은 노드에는 type mapping 이 의미가 없습니다.

## 관련 항목

- [[abenbdl_body_abstract]]
- [[abenbdl_type_mapping]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_association_abstract]]
- [[abenbdl_extensible]]
- [[abenbdl_ext_enabling_abstract]]
- [[abenbdl_redefine_param]]
