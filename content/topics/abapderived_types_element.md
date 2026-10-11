---
title: %element (메시지 대상 필드 표시)
summary: reported 응답에서 메시지가 entity 의 어느 필드나 association 에 대한 것인지 표시하는 구성요소입니다.
keywords: %element, REPORTED, 메시지 대상, 필드 표시, ABP_BEHV_FLAG, if_abap_behv=>mk-on, %msg, 검증, validation, 오류 메시지
---

## 설명

`%element` 는 BDEF derived type(BDEF 파생 타입)의 구성요소이며, response parameter(응답 매개변수) `REPORTED` 에서 씁니다.

`%element` 는 구조입니다. 메시지가 가리키는 RAP BO entity(엔터티)의 기본 키 필드와 데이터 필드, 그리고 association 이 모두 구성요소로 들어 있습니다. 이 가운데 메시지와 관계있는 필드나 association 에 표시를 하면, 메시지를 그 대상 하나 또는 여러 개에 붙일 수 있습니다. 오류 메시지가 여러 개일 때도 어느 메시지가 어느 필드에 대한 것인지 분명해집니다.

association 에 표시하면, 메시지는 그 association 에 딸린 하위 인스턴스 전체를 가리킵니다.

### 타입

`%element` 의 하위 구성요소는 타입이 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `REPORTED [EARLY|LATE]`

## 예제

여행의 종료일이 시작일보다 빠르면 오류로 처리하는 validation 입니다. 메시지를 `BeginDate` 와 `EndDate` 두 필드에 붙입니다.

```abap
METHOD validatedates.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( begindate enddate ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  LOOP AT lt_travel INTO DATA(ls_travel).
    IF ls_travel-enddate < ls_travel-begindate.
      " 실패한 인스턴스를 알린다
      APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.

      " 메시지를 두 날짜 필드에 붙인다
      APPEND VALUE #( %tky = ls_travel-%tky
                      %msg = new_message_with_text(
                               severity = if_abap_behv_message=>severity-error
                               text     = '종료일이 시작일보다 빠릅니다.' )
                      %element-begindate = if_abap_behv=>mk-on
                      %element-enddate   = if_abap_behv=>mk-on ) TO reported-travel.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- 메시지 처리 전반은 ABAP RESTful Application Programming Model 개발 안내서의 Messages 절에 나옵니다.
- `%element` 를 포함해 메시지와 관련된 구성요소 여러 개를 managed BO 에서 함께 쓰는 모습은 [[abenderived_types_reported_abexa]] 에 나옵니다.

## 관련 항목

- [[abapderived_types_msg]]
- [[abapderived_types_state_area]]
- [[abapderived_types_path]]
- [[abapderived_types_info]]
- [[abenbdl_validations]]
- [[abaptype_response_for]]
