---
title: 파생 event (managed event)
summary: 이미 있는 business event 를 가리켜, 페이로드만 다르게 정한 event 를 구현 없이 하나 더 만드는 문법입니다.
keywords: managed event, 파생 이벤트, derived event, on, parameter, payload, 페이로드, CDS view entity, PRIVILEGED, 이벤트 확장
---

## 문법

```syntax
managed event DerivedEventName on RefEvent parameter ViewEntityName;
```

## 설명

managed 또는 unmanaged RAP BO 에 **파생 event**를 선언합니다. 파생 event 는 이미 구현된 event `RefEvent` 를 가리켜 만들며, 그 event 와 다른 페이로드(실어 보낼 값)를 정할 수 있습니다.

`RefEvent` 가 발생하면 파생 event 도 자기 페이로드를 싣고 함께 발생합니다. behavior pool(동작 풀)에 따로 구현할 것이 없습니다.

- `DerivedEventName` : 파생 event 의 이름입니다. BDL 의 이름 규칙([[abenbdl_general_syntax_rules]])을 따릅니다.
- `on RefEvent` : 가리킬 event 입니다. **지금 쓰고 있는 behavior definition(동작 정의)**에 있는 event 여야 합니다. extension(확장) 안에서 선언한다면, 확장하고 있는 원래 BDEF 에 있는 event 를 적습니다.
- `parameter ViewEntityName` : 반드시 적습니다. `RefEvent` 의 페이로드를 새로 정합니다.

매개변수 `ViewEntityName` 에는 규칙이 있습니다.

- association 이 **하나도 없는** CDS 뷰 entity(엔터티)여야 합니다.
- 이 뷰 entity 의 키 필드가, `RefEvent` 가 선언된 entity 의 키 필드와 맞아야 합니다.
- 파생 event 의 매개변수는 늘 평평합니다. 깊은 구조나 association 이 있는 뷰 entity 는 쓸 수 없습니다.

### 쓸 수 있는 곳

managed RAP BO 와 unmanaged RAP BO 에서 선언할 수 있습니다.

## 예제

페이로드로 쓸 뷰 entity 입니다. 키가 `ZR_Travel` 의 키 `TravelID` 와 같고, association 이 없습니다.

```cds
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: '여행 event 의 페이로드'
define view entity ZI_TravelPayload
  as select from ztravel
{
  key travel_id   as TravelID,
      agency_id   as AgencyID,
      status      as Status,
      total_price as TotalPrice
}
```

behavior definition 에서 원래 event `travelChanged` 를 가리켜 파생 event 를 선언합니다.

```bdl
managed with additional save
implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;

  // 원래 event: behavior pool 에서 RAISE ENTITY EVENT 로 내보낸다
  event travelChanged;

  // 파생 event: travelChanged 가 발생하면 ZI_TravelPayload 의 값을 싣고 함께 발생한다
  managed event travelChangedExt on travelChanged parameter ZI_TravelPayload;
}
```

behavior pool 에서는 `travelChanged` 만 내보내면 됩니다. `travelChangedExt` 는 프레임워크가 뷰 entity 에서 값을 읽어 알아서 내보냅니다.

## 알아두기

- 프레임워크는 페이로드용 뷰 entity 를 기본으로 `PRIVILEGED` 권한으로 읽습니다([[abapeml_privileged]]). 페이로드 데이터를 읽을 때 권한 확인을 하지 않는다는 뜻입니다.
- 원문 예제는 파생 event 를 BDEF extension 안에서 선언합니다. 원래 BDEF 를 고치지 않고 다른 페이로드의 event 를 보탤 수 있다는 점을 보여 줍니다.

## 관련 항목

- [[abenbdl_event_overview]]
- [[abenbdl_event]]
- [[abenbdl_event_side_effect]]
- [[abapeml_privileged]]
- [[abenbdl_general_syntax_rules]]
