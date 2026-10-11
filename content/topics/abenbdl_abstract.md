---
title: abstract behavior definition (abstract BDEF)
summary: 트랜잭션 동작 없이 타입만 정해 주는 behavior definition 으로, 주로 action 과 function 의 깊은 매개변수 타입으로 씁니다.
keywords: abstract, abstract BDEF, abstract behavior definition, 추상 BDEF, 추상 동작 정의, 깊은 매개변수, deep parameter, deep table parameter, deep result, with hierarchy, 계층 타입, 추상 엔터티, deep mapping
---

## 설명

abstract behavior definition(동작 정의, abstract BDEF)는 구현 타입이 `abstract` 인 behavior definition 입니다. 다른 behavior definition 과 마찬가지로 BDL 소스 코드로 만듭니다.

abstract BDEF가 하는 일은 거의 하나입니다. action 이나 function 의 **깊은 매개변수**(구조 안에 구조나 테이블이 들어 있는 매개변수)에 **타입을 정해 주는 것**입니다. CDS abstract entity(엔터티) 여러 개를 composition 으로 엮어 두고, abstract BDEF로 그 전체를 하나의 계층 타입으로 묶습니다.

그래서 쓸 수 있는 문법이 얼마 없습니다.

- association
- type mapping
- field characteristics(필드 특성) 몇 가지

생성·수정·삭제, action, validation 같은 **트랜잭션 동작은 abstract BDEF에 정의할 수 없습니다.**

abstract BDEF는 다음 항목으로 나뉩니다.

- [[abenbdl_bdef_abstract_header]] : 머리말. `abstract`, `strict`, `extensible`, `with hierarchy` 를 적습니다.
- [[abenbdl_define_beh_abstract]] : entity 별 behavior definition. `define behavior for` 또는 `scalar entity` 로 노드를 타입에 넣습니다.
- [[abenbdl_body_abstract]] : entity 동작 본문. field characteristics, association, mapping 을 적습니다.

abstract BDEF를 매개변수로 쓰는 방법은 다음 항목에 있습니다.

- managed·unmanaged BO의 action·function 에서 입력 매개변수로 쓰기 : [[abenbdl_action_input_param]]
- 출력 매개변수로 쓰기 : [[abenbdl_action_output_para]]

## 예제

여행 입력값(`ZA_TravelInput`)과 그 아래 예약 입력값(`ZA_BookingInput`)을 계층으로 묶은 abstract BDEF입니다. 각 노드를 DDIC 구조로 옮길 mapping 도 함께 정의합니다.

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

managed BDEF에서 이 abstract BDEF를 action 매개변수로 씁니다. 어떤 키워드를 붙이느냐에 따라 평평한 구조, 깊은 구조, 깊은 테이블로 쓰입니다.

```bdl
// 평평한 매개변수
static action createFlat parameter ZA_TravelInput;

// 깊은 구조: 예약 테이블까지 들어 있는 구조 하나
static action createDeep deep parameter ZA_TravelInput;

// 깊은 테이블: 위 구조가 여러 줄
static action createMany deep table parameter ZA_TravelInput;

// 깊은 출력 매개변수
action getInput deep result selective [1] ZA_TravelInput;
```

## 알아두기

- abstract BDEF에는 트랜잭션 동작을 정의할 수 없습니다.
- abstract BDEF도 확장할 수 있도록 C0 계약(extension(확장)용 릴리스 계약)으로 분류할 수 있습니다. extension 을 허용하는 방법은 [[abenbdl_ext_enabling_abstract]] 에 있습니다.

## 관련 항목

- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_body_abstract]]
- [[abenbdl_field_abstract]]
- [[abenbdl_association_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abenbdl_redefine_param]]
- [[abenbdl_extensibility_abstract]]
