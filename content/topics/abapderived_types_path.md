---
title: 부모로 가는 경로 (%path)
summary: REPORTED response parameter 에서, child entity 의 메시지가 어느 부모·루트 인스턴스에 딸린 것인지 알려 주는 구성요소입니다.
keywords: %path, reported, REPORTED EARLY, REPORTED LATE, 자식 엔터티, 부모 엔터티, 루트 엔터티, 메시지 경로, %key, %pid
---

## 설명

`%path` 는 response parameter(응답 매개변수) `REPORTED` 에 들어 있는 구성요소입니다. **child entity(자식 엔터티)에서만** 쓸 수 있습니다.

child entity 의 메시지에 "이 인스턴스의 부모는 누구인가"를 적어 넣는 자리입니다. child entity 가 여러 단계로 이어진 business object(비즈니스 객체)라면 `%path` 도 그만큼 늘어나, 부모와 root entity(루트 엔터티)까지 함께 가리킵니다.

root entity 아래에 있는 모든 child entity 는 메시지를 보낼 때 `%path` 를 채워야 합니다. 자식과 부모의 관계를 분명히 밝히기 위해서입니다.

### 타입

구조입니다. 그 안에 entity(엔터티) 이름을 딴 중첩 구조가 들어 있습니다. 중첩 구조의 구성요소는 [[abapderived_types_key]] 이고, 상황에 따라 [[abapderived_types_pid]] 같은 다른 `%` 구성요소가 더 붙습니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `REPORTED [EARLY|LATE]`

## 예제

예약(`Booking`)의 금액을 살피는 validation 입니다. 오류 메시지를 넣을 때, 이 예약이 딸린 여행(`Travel`)의 키를 `%path` 에 적습니다.

```abap
METHOD validateprice.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY booking
      FIELDS ( flightprice )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_booking).

  LOOP AT lt_booking INTO DATA(ls_booking) WHERE flightprice <= 0.
    APPEND VALUE #( %tky = ls_booking-%tky ) TO failed-booking.

    APPEND VALUE #(
      %tky  = ls_booking-%tky
      " 이 예약의 부모인 여행을 가리킨다
      %path = VALUE #( travel-travelid = ls_booking-travelid )
      %msg  = new_message_with_text(
                severity = if_abap_behv_message=>severity-error
                text     = '예약 금액은 0보다 커야 합니다.' )
      %element-flightprice = if_abap_behv=>mk-on )
      TO reported-booking.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- child entity 의 메시지를 보낼 때 `%path` 를 빠뜨리지 않습니다. root entity 아래의 모든 child entity 에서 채워야 하는 구성요소입니다.
- 메시지 처리 전반은 SAP 의 RAP 개발 안내서 "Messages" 단원에 자세히 나와 있습니다.

## 관련 항목

- [[abapderived_types_msg]]
- [[abapderived_types_element]]
- [[abapderived_types_state_area]]
- [[abapderived_types_own]]
- [[abenbdl_validations]]
- [[abenderived_types_reported_abexa]]
