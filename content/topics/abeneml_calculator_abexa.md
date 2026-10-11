---
title: 예제 - RAP 계산기
summary: 사용자가 넣은 숫자 둘과 연산 기호로 생성 작업을 실행하면 BO 가 계산해 저장하는 계산기 예제입니다. AUTO FILL CID 와 COMMIT ENTITIES 의 응답 처리를 보여 줍니다.
keywords: RAP calculator, 계산기, MODIFY ENTITY, CREATE, AUTO FILL CID, FIELDS WITH, COMMIT ENTITIES RESPONSE OF, REPORTED, %msg, 관리형, 예제, CL_DEMO_RAP_EML_U_CALCULATOR
---

## 설명

간단한 managed RAP BO 로 만든 계산기입니다. 사용자가 숫자 둘과 연산 기호 하나를 넣으면, 프로그램은 그 세 값을 필드로 삼아 `MODIFY ENTITY` 의 **생성 작업 하나**를 실행합니다. 계산은 BO 안에서 이루어지고, 결과는 저장된 인스턴스의 결과 필드에 들어갑니다.

원문 BO 의 필드는 숫자 둘(`num1`, `num2`), 연산 기호(`arithm_op`), 계산 결과(`calc_result`)입니다. 입력 화면은 연산 기호로 `+`, `-`, `*`, `P` 를 안내합니다. 이 BO 는 draft 를 쓰도록 돼 있지만 이 예제에서는 draft 가 아무 구실도 하지 않습니다. 더 자세한 내용은 관련 예제 [[abensheet_rap_calc_dr_ln_m_abexa]] 를 봅니다.

이 항목에서 볼 것은 RAP BO consumer(사용자) 쪽 코드입니다.

- `%cid` 를 직접 적지 않고 `AUTO FILL CID` 에 맡깁니다.
- `COMMIT ENTITIES RESPONSE OF` 로 save sequence(저장 순서)의 `REPORTED` 응답을 받아, 계산할 수 없을 때의 메시지를 꺼냅니다.

## 예제

같은 흐름을 Travel 로 옮긴 것입니다. 항공 요금과 수수료를 넣어 여행을 만들면 BO 가 `TotalPrice` 를 계산해 저장한다고 가정합니다.

```abap
DATA: lv_flightprice TYPE c LENGTH 10 VALUE '500',
      lv_bookingfee  TYPE c LENGTH 10 VALUE '30'.

" 원문처럼 MODIFY 문을 TRY 로 감싸 예외를 잡는다
TRY.
    MODIFY ENTITY zr_travel
      CREATE AUTO FILL CID
      FIELDS ( travelid flightprice bookingfee )
      WITH VALUE #( ( travelid    = '00000001'
                      flightprice = lv_flightprice
                      bookingfee  = lv_bookingfee ) ).
  CATCH cx_root INTO DATA(lx_error).
    DATA(lv_error_text) = lx_error->get_text( ).
ENDTRY.

" 저장한다. save sequence 에서 나온 메시지를 REPORTED 로 받는다
COMMIT ENTITIES RESPONSE OF zr_travel
  REPORTED DATA(ls_reported).

IF sy-subrc <> 0.
  " save sequence 에서 문제가 났다
ENDIF.

" 계산할 수 없었다면 메시지가 들어 있다
LOOP AT ls_reported-travel ASSIGNING FIELD-SYMBOL(<ls_reported>).
  DATA(lv_message) = <ls_reported>-%msg->if_message~get_text( ).
ENDLOOP.

" 저장된 결과를 읽는다. persistent table 에서는 테이블 열 이름을 쓴다
SELECT SINGLE flight_price, booking_fee, total_price
  FROM ztravel
  WHERE travel_id = '00000001'
  INTO @DATA(ls_calculation).
```

## 알아두기

- 원문 프로그램은 실행하면 입력 화면에서 숫자 둘과 연산 기호를 받습니다. 그 값으로 인스턴스를 만들고 저장한 뒤, persistent table 에서 한 줄을 읽어 숫자 둘, 연산 기호, 계산 결과를 출력합니다.
- `MODIFY` 문에서 예외가 나면 예외 문구를 출력합니다. `COMMIT ENTITIES` 뒤에 `REPORTED` 에 메시지가 있으면 "계산을 실행할 수 없다"는 제목과 함께 메시지를 출력합니다.
- `AUTO FILL CID` 를 붙이면 비어 있는 `%cid` 가 자동으로 채워집니다. 생성 작업에서는 `%cid` 를 쓸 일이 없어도 지정하는 것이 좋습니다. 자세한 내용은 [[abapmodify_entity_entities_fields]] 를 봅니다.
- save sequence 의 응답을 받으려고 `COMMIT ENTITIES` 에 `RESPONSE OF bdef` 와 `REPORTED` 를 붙였습니다. 문법은 [[abapcommit_entities]] 를 봅니다.

## 관련 항목

- [[abensheet_rap_calc_dr_ln_m_abexa]]
- [[abapmodify_entity_entities_fields]]
- [[abapmodify_entity_short]]
- [[abapcommit_entities]]
- [[abapeml_modify_examples_abexas]]
