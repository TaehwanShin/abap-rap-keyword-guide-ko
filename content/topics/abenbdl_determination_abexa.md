---
title: 예제 - determination
summary: managed RAP BO 에서 determination 을 선언하고, 구현하고, EML 로 불러 결과를 확인하는 흐름을 처음부터 끝까지 보여 주는 예제입니다.
keywords: determination, 결정, 예제, on modify, on save, numbering managed, FOR DETERMINE, MODIFY ENTITIES, COMMIT ENTITIES, 총액 계산
---

## 설명

이 예제는 managed RAP BO 에서 determination([[abenbdl_determinations]])을 **선언하고, 구현하고, 사용하는** 세 단계를 한 번에 보여 줍니다. 원문은 판매 주문과 주문 품목으로 설명합니다. 여기서는 같은 구조를 여행(`Travel`)과 예약(`Booking`)으로 옮겨 적습니다.

데이터 모델은 root entity(루트 엔터티) `ZR_Travel` 과 child entity(자식 엔터티) `ZR_Booking` 입니다. 여행 하나에 예약이 여러 개 딸립니다. 여행의 기술 키 `TravelUUID` 는 `numbering : managed` 로 프레임워크가 채웁니다([[abenbdl_field_numbering]]). 사람이 읽는 번호 `TravelID` 는 determination 이 채웁니다.

determination 은 네 개입니다.

| determination | entity(엔터티) | 시점과 조건 | 하는 일 |
| --- | --- | --- | --- |
| `setTravelID` | 여행 | `on save`, `create` | save sequence(저장 순서)에서 `TravelID` 에 값을 넣습니다. |
| `setStatusNew` | 여행 | `on modify`, `create` | 새 여행의 상태를 `O`(열림)로 채웁니다. |
| `calcTotalPrice` | 여행 | `on modify`, `create` | 딸린 예약의 금액을 모두 더해 여행 총액을 채웁니다. |
| `recalcTotalPrice` | 예약 | `on modify`, 필드 변경 | `calcTotalPrice` 의 짝입니다. 예약 없이 만든 여행에 나중에 예약이 붙으면 그때 총액을 계산합니다. |

## 예제

behavior definition(동작 정의)입니다. 여행 테이블은 필드 이름이 entity 와 달라 `mapping` 으로 이어 줍니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  association _Booking { create; }

  field ( readonly, numbering : managed ) TravelUUID;
  field ( readonly ) TotalPrice;

  determination setTravelID on save { create; }
  determination setStatusNew on modify { create; }
  determination calcTotalPrice on modify { create; }

  mapping for ztravel
  {
    TravelUUID = travel_uuid;
    TravelID   = travel_id;
    CustomerID = customer_id;
    Status     = status;
    TotalPrice = total_price;
  }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly : update ) TravelUUID;
  field ( readonly, numbering : managed ) BookingUUID;
  association _Travel { }

  determination recalcTotalPrice on modify { field FlightPrice; }
}
```

총액을 계산하는 determination 의 구현입니다. association 을 따라 예약을 읽고([[abenbdl_association]]), 여행마다 금액을 더해 다시 써 넣습니다.

```abap
METHOD calctotalprice.
  " 넘어온 여행에 딸린 예약을 association 으로 읽는다
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel BY \_booking
      FIELDS ( traveluuid flightprice ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_booking).

  DATA lt_update TYPE TABLE FOR UPDATE zr_travel.

  LOOP AT keys INTO DATA(ls_key).
    APPEND VALUE #( %tky = ls_key-%tky ) TO lt_update
      ASSIGNING FIELD-SYMBOL(<ls_update>).
    " 이 여행의 예약 금액을 모두 더한다
    LOOP AT lt_booking INTO DATA(ls_booking)
         WHERE traveluuid = ls_key-traveluuid.
      <ls_update>-totalprice += ls_booking-flightprice.
    ENDLOOP.
  ENDLOOP.

  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( totalprice ) WITH lt_update.
ENDMETHOD.
```

RAP BO consumer(사용자) 쪽 코드입니다. 여행 둘을 만들고 여행마다 예약을 둘씩 붙입니다. 여행에는 고객 번호만 넘깁니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( customerid ) WITH VALUE #(
      ( %cid = 'T1' customerid = '000001' )
      ( %cid = 'T2' customerid = '000002' ) )
    CREATE BY \_booking FIELDS ( flightprice ) WITH VALUE #(
      ( %cid_ref = 'T1'
        %target  = VALUE #( ( %cid = 'B1' flightprice = '300' )
                            ( %cid = 'B2' flightprice = '150' ) ) )
      ( %cid_ref = 'T2'
        %target  = VALUE #( ( %cid = 'B3' flightprice = '500' )
                            ( %cid = 'B4' flightprice = '120' ) ) ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

" determination 이 채운 값을 테이블에서 확인한다
SELECT travel_uuid, travel_id, status, customer_id, total_price
  FROM ztravel
  INTO TABLE @DATA(lt_result).
```

## 알아두기

- 실행하면 여행 두 건이 저장됩니다. 넘긴 값은 고객 번호뿐인데도 `travel_id`, `status`, `total_price` 가 모두 채워져 있습니다. 여행의 determination 세 개가 모두 "생성"을 조건으로 걸려 실행됐기 때문입니다.
- 기술 키 `travel_uuid` 는 determination 이 아니라 `numbering : managed` 가 채웁니다.
- `setTravelID` 만 `on save` 입니다. 번호는 save sequence 에 들어가서야 정해집니다. 나머지 둘은 `on modify` 라서 저장하기 전 버퍼에 이미 값이 들어 있습니다.
- `calcTotalPrice` 와 `recalcTotalPrice` 는 하는 일이 같고 트리거 조건만 다릅니다. 원문 예제도 두 determination 을 같은 로직으로 구현합니다.
- 원문 예제의 `setID` 는 번호를 임의의 정수로 채웁니다. 설명용 구현일 뿐입니다.

## 관련 항목

- [[abenbdl_determinations]]
- [[abaphandler_meth_det]]
- [[abenbdl_field_numbering]]
- [[abenbdl_association]]
- [[abenbdl_type_mapping]]
