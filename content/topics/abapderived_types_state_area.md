---
title: 상태 영역 (%state_area)
summary: REPORTED 의 메시지를 상태 메시지로 만들고, 나중에 그 메시지를 찾아 지울 때 쓰는 문자열 구성요소입니다.
keywords: %state_area, reported, REPORTED EARLY, REPORTED LATE, state message, transition message, 상태 메시지, 전이 메시지, 상태 영역, state_area_all, %STATE, 메시지 무효화
---

## 설명

`%state_area` 는 response parameter(응답 매개변수) `REPORTED` 에 들어 있는 `string` 타입 구성요소입니다. RAP BO provider(제공자)가 채웁니다.

이 값이 메시지의 종류를 가릅니다.

- `%state_area` 를 채우면 프레임워크는 그 메시지를 **상태 메시지**(state message)로 봅니다.
- 비워 두면 **transition message(전이 메시지)**(transition message)로 봅니다.

EML 에서는 상태 메시지를 `READ` 문으로만 받아 볼 수 있습니다([[abapread_entity_short]]). 이때 `%state_area` 에는 `%STATE` 라는 값이 들어옵니다. 그 밖의 EML 문에서 받는 `reported` 에는 transition message 만 들어 있습니다. ([[abaptype_response_for]])

`%state_area` 가 주로 쓰이는 곳은 다음과 같습니다.

- draft 를 쓰는 경우([[abenbdl_with_draft]]). 상태 메시지는 RAP BO 의 상태가 바뀔 때까지 저장되어 남기 때문입니다. 적어 넣은 문자열 자체는 RAP BO consumer(사용자)에게 의미가 없습니다. RAP BO consumer 가 관심을 두는 것은 transition message 뿐입니다.
- unmanaged RAP BO 의 saver method(세이버 메서드) [[abensaver_finalize]] 와 [[abensaver_check_before_save]]
- managed RAP BO 의 determination 과 validation

### 상태 메시지 지우기

상태 메시지는 RAP BO provider 구현에서 **직접 무효화**해야 합니다. 무효화란 저장되어 남은 메시지의 연결을 끊는 일입니다. 지울 메시지는 인스턴스 키([[abapderived_types_tky]])와 `%state_area` 문자열로 찾습니다. 메시지(`%msg`) 없이 키와 상태 영역만 넣은 줄을 `reported` 에 추가하면 됩니다.

상수 `if_abap_behv=>state_area_all` 을 넣으면 그 인스턴스의 상태 메시지를 모두 무효화합니다.

### 타입

`STRING`

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `REPORTED [EARLY|LATE]`

## 예제

예약 금액 validation 입니다. 먼저 같은 상태 영역에 남아 있던 메시지를 지우고, 문제가 있을 때만 새 상태 메시지를 넣습니다.

```abap
METHOD validateprice.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY booking
      FIELDS ( flightprice )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_booking).

  LOOP AT lt_booking INTO DATA(ls_booking).
    " 1) 지난번 validation 이 남긴 상태 메시지를 무효화한다
    APPEND VALUE #( %tky        = ls_booking-%tky
                    %state_area = 'VALIDATE_PRICE' )
      TO reported-booking.

    IF ls_booking-flightprice <= 0.
      APPEND VALUE #( %tky = ls_booking-%tky ) TO failed-booking.

      " 2) 같은 상태 영역 이름으로 새 상태 메시지를 넣는다
      APPEND VALUE #(
        %tky        = ls_booking-%tky
        %state_area = 'VALIDATE_PRICE'
        %path       = VALUE #( travel-travelid = ls_booking-travelid )
        %msg        = new_message_with_text(
                        severity = if_abap_behv_message=>severity-error
                        text     = '예약 금액은 0보다 커야 합니다.' )
        %element-flightprice = if_abap_behv=>mk-on )
        TO reported-booking.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

한 인스턴스의 상태 메시지를 영역 구분 없이 모두 지우려면 상수를 씁니다.

```abap
APPEND VALUE #( %tky        = ls_booking-%tky
                %state_area = if_abap_behv=>state_area_all )
  TO reported-booking.
```

## 알아두기

- 상태 메시지를 쓰는 validation 이나 determination 에서는 무효화하는 줄을 먼저 넣습니다. SAP 예제도 새 메시지를 넣기 전에 상태 영역부터 무효화합니다.
- 상태 메시지는 반드시 RAP BO 에 묶여야 하므로 [[abapderived_types_other]] 에는 넣을 수 없습니다.
- 메시지 처리 전반은 SAP 의 RAP 개발 안내서 "Messages" 단원에 자세히 나와 있습니다.

## 관련 항목

- [[abapderived_types_msg]]
- [[abapderived_types_path]]
- [[abapderived_types_element]]
- [[abapderived_types_tky]]
- [[abenbdl_validations]]
- [[abenderived_types_reported_abexa]]
- [[abenrap_messages_abexa]]
