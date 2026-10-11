---
title: BDEF entity 메시지 묶음 (%own)
summary: REPORTED response parameter 에서, BDEF 에 정의한 모든 entity 의 메시지 테이블을 한 이름으로 묶은 구성요소 묶음입니다.
keywords: %own, reported, REPORTED LATE, TYPE RESPONSE FOR REPORTED LATE, 구성요소 묶음, 메시지, 엔터티 테이블
---

## 설명

`%own` 은 BDEF derived type(BDEF 파생 타입)의 구성요소 묶음입니다. response parameter(응답 매개변수) `REPORTED` 안에 있고, BDEF 에 정의한 RAP BO entity(엔터티)를 모두 한 이름 아래로 묶습니다.

entity 별 메시지 테이블을 `reported-travel` 처럼 바로 쓸 수도 있고, `reported-%own-travel` 처럼 `%own` 을 거쳐 쓸 수도 있습니다. 둘은 같은 테이블입니다. entity 에 묶이지 않은 메시지는 [[abapderived_types_other]] 에 따로 담습니다.

### 타입

`%own` 의 하위 구성요소는 `TYPE TABLE FOR REPORTED LATE` 로 된 내부 테이블입니다. ([[abaptype_table_for]])

### 쓰이는 곳

- `TYPE RESPONSE FOR REPORTED LATE` ([[abaptype_response_for]])

## 예제

예약 금액을 살피는 validation 에서 `%own` 을 거쳐 child entity(자식 엔터티) `Booking` 의 메시지 테이블을 채웁니다. validation 의 `reported` 는 `REPORTED LATE` 타입이라 `%own` 을 쓸 수 있습니다.

```abap
METHOD validateprice.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY booking
      FIELDS ( flightprice )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_booking).

  LOOP AT lt_booking INTO DATA(ls_booking) WHERE flightprice <= 0.
    APPEND VALUE #( %tky = ls_booking-%tky ) TO failed-booking.

    " reported-booking 과 같은 테이블이다
    APPEND VALUE #(
      %tky = ls_booking-%tky
      " child entity 의 메시지에는 부모인 여행의 키를 %path 에 적는다
      %path = VALUE #( travel-travelid = ls_booking-travelid )
      %msg = new_message_with_text(
               severity = if_abap_behv_message=>severity-error
               text     = '예약 금액은 0보다 커야 합니다.' )
      %element-flightprice = if_abap_behv=>mk-on )
      TO reported-%own-booking.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- 위 예제에서 `%own` 은 꼭 써야 하는 것이 아닙니다. `reported-booking` 이라고 써도 됩니다.
- 메시지 처리 전반은 SAP 의 RAP 개발 안내서 "Messages" 단원에 자세히 나와 있습니다.

## 관련 항목

- [[abapderived_types_other]]
- [[abapderived_types_msg]]
- [[abapderived_types_path]]
- [[abaptype_response_for]]
- [[abenbdl_validations]]
- [[abenderived_types_reported_abexa]]
