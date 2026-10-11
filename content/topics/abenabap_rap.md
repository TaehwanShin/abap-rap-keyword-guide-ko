---
title: ABAP RAP business object
summary: RAP business object(RAP BO)가 무엇으로 이루어지는지, 곧 데이터 모델·동작·비즈니스 서비스가 어떻게 맞물리는지 훑어봅니다.
keywords: RAP, RAP BO, RAP business object, RAP 비즈니스 객체, root entity, 루트 엔터티, child entity, 자식 엔터티, leaf entity, BDEF, 동작 정의, managed, unmanaged, business service, EML, 개요
---

## 설명

RAP business object(비즈니스 객체, RAP BO)는 ABAP CDS 로 그린 데이터를 **트랜잭션으로** 다룰 수 있게 해 주는 단위입니다. 만들고, 고치고, 지우고, 저장하는 일이 모두 RAP BO 를 거칩니다.

RAP BO 는 저장소에 따로 있는 객체 하나가 아닙니다. 아래 세 가지가 서로 이어져서 하나의 RAP BO 가 됩니다. 이 셋을 묶어 주는 중심이 behavior definition(동작 정의, BDEF)입니다.

### 데이터 모델

데이터 모델은 CDS entity(엔터티)로 만듭니다. entity 들은 composition 과 to-parent association 으로 이어져 나무 모양(CDS 구성 트리)을 이룹니다.

| 이름 | 뜻 |
| --- | --- |
| root entity(루트 엔터티) | RAP BO 마다 꼭 하나 있습니다. `ROOT` 를 붙여 정의한 CDS 뷰, CDS custom entity(사용자 정의 엔터티), CDS abstract entity 입니다. RAP BO 를 대표합니다. 자식은 둘 수 있지만 부모는 없습니다. |
| child entity(자식 엔터티) | composition 으로 다른 entity 아래에 달린 entity 입니다. 자식이 되려면 부모로 가는 to-parent association 을 정의하고 바깥에 내놓아야 합니다. |
| parent entity(부모 엔터티) | composition 으로 자식을 거느린 entity 입니다. 자식 하나에 부모는 꼭 하나입니다. 자식마다 to-parent association 을 하나만 정의하고 내놓게 되어 있어 문법이 이를 지켜 줍니다. |
| leaf entity(리프 엔터티) | 자식이 없는 entity 입니다. parent entity 가 아닌 entity 가 모두 여기에 듭니다. |

### 동작

RAP BO 가 무엇을 할 수 있는지는 behavior definition(BDEF)에 적습니다. BDEF 는 RAP BO 의 큰 성격을 정하고, CRUD 작업과 그 밖의 action 가운데 무엇을 내놓을지 정합니다.

RAP BO 는 두 갈래입니다.

- **managed** : 동작의 전부나 일부를 managed RAP BO provider(제공자)가 대신 해 줍니다.
- **unmanaged** : 동작 전부를 ABAP behavior implementation(동작 구현)에 직접 써야 합니다.

BDEF 는 RAP BO consumer(사용자)와 RAP BO provider 가 주고받는 말의 모양도 정합니다. 주고받는 것은 BDEF derived type(BDEF 파생 타입, BDEF 에 맞춰 자동으로 만들어지는 타입)으로 된 내부 테이블입니다.

- RAP BO provider 는 매개변수 타입이 BDEF derived type 인 메서드를 구현합니다.
- RAP BO consumer 는 BDEF derived type 의 내부 테이블을 provider 에게 보내거나 provider 에게서 받습니다.

### RAP 비즈니스 서비스

RAP 비즈니스 서비스는 AS ABAP 바깥의 웹 클라이언트가 CDS entity 를 쓸 수 있게 열어 주는 창구입니다. 요청은 읽기만 하는 조회(query)이거나 트랜잭션 요청입니다.

- **조회** : AS ABAP 에서 데이터베이스로 가는 접근은 모두 RAP 트랜잭션 엔진이 감쌉니다. 보통은 ABAP 코드를 따로 쓸 필요가 없습니다. 예외로, ABAP 클래스로 구현하는 CDS custom entity 를 쓸 때만 직접 코드를 씁니다.
- **트랜잭션 요청** : RAP BO 가 있어야 합니다. CDS entity 에 BDEF 로 동작을 정의하고, 그 entity 를 비즈니스 서비스로 내놓습니다. 동작은 managed RAP BO provider 가 맡거나 ABAP behavior implementation 이 맡습니다.

RAP BO 가 있는 가장 큰 까닭은 웹 클라이언트가 보낸 트랜잭션 OData 요청을 REST 방식에 맞게 처리하는 것입니다. 그 밖에, 같은 AS ABAP 안의 ABAP 프로그램도 ABAP EML 로 RAP BO 를 부를 수 있습니다.

## 예제

root entity `ZR_Travel` 과 child entity `ZR_Booking` 으로 된 구성 트리입니다. 루트는 `composition` 으로 자식을 달고, 자식은 `association to parent` 로 부모를 가리킵니다.

```cds
define root view entity ZR_Travel
  as select from ztravel
  composition [0..*] of ZR_Booking as _Booking
{
  key travel_id as TravelID,
      agency_id as AgencyID,
      status    as Status,
      _Booking   // 자식으로 가는 composition 을 내놓는다
}
```

```cds
define view entity ZR_Booking
  as select from zbooking
  association to parent ZR_Travel as _Travel
    on $projection.TravelID = _Travel.TravelID
{
  key travel_id  as TravelID,
  key booking_id as BookingID,
      _Travel    // to-parent association 을 내놓아야 자식이 될 수 있다
}
```

## 이 참고서의 예제 읽는 법

모든 항목의 예제는 여행(`ZR_Travel`)과 예약(`ZR_Booking`)이라는 같은 모델을 씁니다. 이름은 아래와 같습니다.

| 무엇 | 이름 |
| --- | --- |
| root entity / child entity | `ZR_Travel` (별칭 `Travel`) / `ZR_Booking` (별칭 `Booking`) |
| composition / to-parent association | `_Booking` / `_Travel` |
| persistent table / draft 테이블 | `ztravel`, `zbooking` / `ztravel_d`, `zbooking_d` |
| projection / interface | `ZC_Travel`, `ZC_Booking` / `ZI_Travel` |
| behavior pool(동작 풀), handler class(핸들러 클래스), saver class(세이버 클래스) | `zbp_r_travel`, `lhc_travel`, `lsc_travel` |
| CDS 필드 | `TravelID`, `AgencyID`, `CustomerID`, `BeginDate`, `EndDate`, `TotalPrice`, `CurrencyCode`, `Status`, `LastChangedAt` |
| 테이블 열 | `travel_id`, `agency_id`, `customer_id`, `begin_date`, `end_date`, `total_price`, `currency_code`, `status`, `last_changed_at` |

**예제는 그 항목이 다루는 문법만 보이도록 줄인 코드입니다.** 주제와 상관없는 부분은 빠져 있습니다. 특히 아래 두 가지는 거의 모든 예제에서 줄였으니, 실제 시스템에 옮길 때는 채워 넣어야 합니다.

- 테이블 열 이름과 CDS 필드 이름을 짝짓는 `mapping for` ([[abenbdl_type_mapping]])
- 키 필드에 붙이는 `readonly` 또는 `readonly : update` ([[abenbdl_field_char]])

줄이지 않은 behavior definition 은 아래와 같습니다. 다른 항목의 예제는 여기에 그 항목의 문법을 보탠 것으로 읽으면 됩니다.

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

  // 키는 만들 때만 넣을 수 있다
  field ( readonly : update ) TravelID;

  association _Booking { create; }

  // 이름이 다른 테이블 열과 CDS 필드를 짝짓는다
  mapping for ztravel corresponding
  {
    TravelID      = travel_id;
    AgencyID      = agency_id;
    CustomerID    = customer_id;
    BeginDate     = begin_date;
    EndDate       = end_date;
    TotalPrice    = total_price;
    CurrencyCode  = currency_code;
    LastChangedAt = last_changed_at;
  }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;

  // 부모 키는 부모에게서 받고, 자기 키는 만들 때만 넣는다
  field ( readonly ) TravelID;
  field ( readonly : update ) BookingID;

  association _Travel;

  mapping for zbooking corresponding
  {
    TravelID  = travel_id;
    BookingID = booking_id;
  }
}
```

예제 코드는 SAP 시스템에서 활성화해 확인한 것이 아닙니다. 그대로 붙여 넣기보다 문법을 익히는 데 쓰고, 정확한 내용은 항목마다 달린 "SAP 원문 보기"로 확인하세요.

## 관련 항목

이 갈래는 아래 네 묶음으로 나뉩니다.

- [[abencds_business_services]] : service definition(서비스 정의)와 service binding(서비스 바인딩)으로 RAP BO 를 바깥에 여는 방법
- [[abencds_bdef]] : behavior definition(BDEF)의 짜임새와 BDL 문법
- [[abenabap_for_rap_bos]] : behavior pool, EML 처럼 RAP BO 를 다루는 ABAP 문
- [[abenrap_glossary]] : RAP 용어 풀이
