---
title: validation handler method (FOR VALIDATE)
summary: behavior definition 에 선언한 validation을 구현하는 handler method 로, 저장할 때 데이터가 올바른지 확인하고 문제를 알립니다.
keywords: FOR VALIDATE ON SAVE, 검증, validation, 핸들러 메서드, handler method, TYPE TABLE FOR VALIDATION, failed, reported, 저장 시점 검증
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR VALIDATE ON SAVE
   [IMPORTING] { REFERENCE(im_par_val) | im_par_val }
   FOR bdef~val
   [CHANGING { [failed TYPE data] [reported TYPE data] }].
```

## 설명

[[abenbdl_validations|validation]] 을 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `val` : behavior definition 에 선언한 validation 의 이름.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_validations]] 에 있습니다.

### 매개변수

- `im_par_val` (입력) : 검증할 RAP BO 인스턴스의 키가 들어 있습니다. [[abaptype_table_for|TYPE TABLE FOR VALIDATION bdef~val]] 타입의 내부 테이블입니다. `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다. `IMPORTING` 낱말은 생략할 수 있습니다.
- `failed`, `reported` (`CHANGING`) : 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

## 예제

종료일이 시작일보다 빠르면 저장을 막습니다. behavior definition 에는 이렇게 선언합니다.

```bdl
validation validateDates on save { create; field BeginDate, EndDate; }
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validatedates FOR VALIDATE ON SAVE
      IMPORTING keys FOR travel~validatedates.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD validatedates.
    " 넘어온 키의 여행 날짜를 버퍼에서 읽는다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( begindate enddate ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    LOOP AT lt_travel INTO DATA(ls_travel).
      IF ls_travel-enddate >= ls_travel-begindate.
        CONTINUE.
      ENDIF.

      " 실패한 인스턴스와 메시지를 남긴다
      APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
      APPEND VALUE #( %tky              = ls_travel-%tky
                      %element-enddate  = if_abap_behv=>mk-on
                      %msg              = new_message_with_text(
                        severity = if_abap_behv_message=>severity-error
                        text     = '종료일이 시작일보다 빠릅니다.' ) )
             TO reported-travel.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- validation handler method 에는 `mapped` 가 없습니다. 쓸 수 있는 response parameter 는 `failed` 와 `reported` 입니다.
- 선언에 쓸 수 있는 시점은 `ON SAVE` 하나뿐입니다. determination 과 달리 `ON MODIFY` 변형은 문법 틀에 없습니다.
- 입력으로는 키만 넘어옵니다. 검증할 필드 값은 EML 로 읽습니다.

## 관련 항목

- [[abenbdl_validations]]
- [[abapmethods_for_rap_behv]]
- [[abaphandler_meth_det]]
- [[abaptype_table_for]]
- [[abaptype_response_for]]
- [[abenrap_handler_methods_abexa]]
- [[abenbdl_validation_abexa]]
