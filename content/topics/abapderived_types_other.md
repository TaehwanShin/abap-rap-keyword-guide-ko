---
title: entity 에 묶이지 않은 메시지 (%other)
summary: reported response parameter 에서, 어느 entity 와도 상관없는 transition message 를 담아 두는 구성요소입니다.
keywords: %other, reported, REPORTED EARLY, REPORTED LATE, IF_ABAP_BEHV_MESSAGE, new_message_with_text, 전이 메시지, transition message, 엔터티에 묶이지 않은 메시지, 메시지
---

## 설명

`%other` 는 response parameter(응답 매개변수) `reported` 에 들어 있는 구성요소입니다.

`reported` 타입에는 BDEF 에 정의한 entity(엔터티)마다 테이블이 하나씩 있습니다. 여기에 `%other` 가 하나 더 붙습니다. RAP BO 의 특정 entity 와 상관없는 transition message(전이 메시지)를 보낼 때, 메시지 객체를 이 구성요소에 담습니다. "작업을 마쳤습니다" 같은 안내가 그런 경우입니다.

### 타입

`STANDARD TABLE OF REF TO IF_ABAP_BEHV_MESSAGE` 입니다. 메시지 객체를 가리키는 참조를 줄마다 하나씩 넣습니다.

### 쓰이는 곳

원문은 [[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나온다고 적습니다.

- `REPORTED [EARLY|LATE]`

다만 원문의 설명과 예제에서 `%other` 는 entity 별 메시지 테이블 안에 있지 않습니다. 그 테이블들과 나란히 `reported` response parameter 에 들어 있고, `reported-%other` 로 씁니다. response parameter 의 타입은 [[abaptype_response_for]] 에서 설명합니다.

## 예제

여행 날짜를 살피는 validation 안에서, 인스턴스에 묶인 오류는 `reported-travel` 에 넣고 전체 안내 메시지는 `reported-%other` 에 넣습니다. validation 에서 `%other` 를 채우는 것은 쓰는 법을 보여 주려는 것일 뿐입니다.

```abap
METHOD validatedates.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( begindate enddate )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  LOOP AT lt_travel INTO DATA(ls_travel).
    IF ls_travel-enddate < ls_travel-begindate.
      " 인스턴스에 묶인 오류: entity 테이블에 넣는다
      APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
      APPEND VALUE #(
        %tky = ls_travel-%tky
        %msg = new_message_with_text(
                 severity = if_abap_behv_message=>severity-error
                 text     = '종료일이 시작일보다 빠릅니다.' )
        %element-enddate = if_abap_behv=>mk-on )
        TO reported-travel.
    ENDIF.
  ENDLOOP.

  " 어느 인스턴스에도 묶이지 않은 안내: %other 에 넣는다
  reported-%other = VALUE #(
    ( new_message_with_text(
        severity = if_abap_behv_message=>severity-information
        text     = '날짜 validation 을 마쳤습니다.' ) ) ).
ENDMETHOD.
```

## 알아두기

- 상태 메시지(state message)는 반드시 RAP BO 에 묶여 있어야 합니다. 그래서 상태 메시지는 `%other` 에 넣을 수 없습니다.
- 메시지 처리 전반은 SAP 의 RAP 개발 안내서 "Messages" 단원에 자세히 나와 있습니다.

## 관련 항목

- [[abapderived_types_own]]
- [[abapderived_types_msg]]
- [[abapderived_types_state_area]]
- [[abaptype_response_for]]
- [[abenbdl_validations]]
- [[abenderived_types_reported_abexa]]
