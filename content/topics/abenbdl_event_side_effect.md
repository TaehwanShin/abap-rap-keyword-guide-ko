---
title: side effects 용 event (event for side effects)
summary: event 가 발생하면 화면의 값을 다시 읽게 하는 event 기반 side effects 에만 쓰는 business event 를 선언합니다.
keywords: event for side effects, 부수 효과용 이벤트, event-driven side effect, 이벤트 기반 부수 효과, side effects, RAISE ENTITY EVENT, with additional save, use event
---

## 문법

```syntax
event EventName for side effects;
```

## 설명

managed 또는 unmanaged RAP BO 에 **side effects 용 business event**를 선언합니다. 이 event 는 event 기반 side effects 에만 씁니다. event 기반 side effects 는 서버에서 event 가 발생하면 화면이 정해 둔 값을 다시 읽게 하는 side effects 입니다([[abenbdl_side_effects]]).

쓰려면 두 가지를 함께 적습니다.

1. `event EventName for side effects;` 로 event 를 선언합니다.
2. `side effects { event EventName affects ...; }` 로 이 event 가 무엇을 다시 읽게 할지 정합니다.

event 는 다른 business event 와 똑같이 내보냅니다. 그 RAP BO 의 behavior pool(동작 풀)에서 EML 문 `RAISE ENTITY EVENT` 로 내보내며([[abapraise_entity_event]]), 시점은 save sequence(저장 순서)의 late save phase(늦은 저장 단계)여야 합니다. managed RAP BO 에서는 `with additional save` 로 additional save 를 켜고([[abenbdl_saving]]) 그 구현 안에서 내보내는 방법을 권장합니다.

### 쓸 수 있는 곳

- managed RAP BO 와 unmanaged RAP BO 에서 선언할 수 있습니다.
- interface BDEF 와 projection BDEF **양쪽 모두**에서 `use event` 로 다시 쓸 수 있습니다([[abenbdl_use_projection]]). 보통의 business event 는 projection BDEF 에서 다시 쓸 수 없다는 점과 다릅니다.

## 예제

총액이 바뀌었다는 event 가 발생하면 화면의 `TotalPrice` 필드를 다시 읽게 합니다.

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

  // side effects 에만 쓰는 event
  event priceChanged for side effects;

  side effects
  {
    // event 가 발생하면 TotalPrice 를 다시 읽는다
    event priceChanged affects field TotalPrice;
  }
}
```

saver method(세이버 메서드) `save_modified` 에서 event 를 내보냅니다.

```abap
METHOD save_modified.
  IF update-travel IS NOT INITIAL.
    RAISE ENTITY EVENT zr_travel~pricechanged
      FROM VALUE #( FOR ls_travel IN update-travel
                    ( travelid = ls_travel-travelid ) ).
  ENDIF.
ENDMETHOD.
```

## 알아두기

- side effects 용 event 는 event 기반 side effects 에만 쓰도록 선언하는 event 입니다. 보통의 business event 는 [[abenbdl_event]] 를 봅니다.
- projection 이나 interface 에서 다시 쓸 때는 `use event EventName` 에 `as` 로 별칭만 붙일 수 있습니다. 다른 추가 구문은 쓸 수 없습니다.

## 관련 항목

- [[abenbdl_event_overview]]
- [[abenbdl_event]]
- [[abenbdl_side_effects]]
- [[abenbdl_side_effects_target]]
- [[abapraise_entity_event]]
- [[abenbdl_saving]]
- [[abenbdl_use_projection]]
