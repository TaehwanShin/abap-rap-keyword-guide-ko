---
title: %msg (메시지)
summary: reported 응답에서 메시지 객체를 담는 구성요소로, 메시지 interface IF_ABAP_BEHV_MESSAGE 의 인스턴스를 넣습니다.
keywords: %msg, REPORTED, 메시지, IF_ABAP_BEHV_MESSAGE, IF_T100_DYN_MSG, new_message, new_message_with_text, severity, 오류 메시지
---

## 설명

`%msg` 는 BDEF derived type(BDEF 파생 타입)의 구성요소이며, response parameter(응답 매개변수) `REPORTED` 안에 들어 있습니다.

`%msg` 에는 메시지 interface `IF_ABAP_BEHV_MESSAGE` 를 구현한 객체를 넣습니다. 이 interface 를 직접 구현할 필요가 없다면, 물려받은 메서드 `new_message( )` 나 `new_message_with_text( )` 를 부르면 됩니다. 이 메서드들이 표준 구현의 메시지 객체를 만들어 줍니다.

### 타입

`TYPE REF TO IF_ABAP_BEHV_MESSAGE` (이 interface 에는 `IF_T100_DYN_MSG` 가 들어 있습니다)

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `REPORTED [EARLY|LATE]`

## 예제

저장하기 전에 고객 번호가 비어 있는지 확인하는 validation 입니다. 비어 있으면 `%msg` 에 오류 메시지를 넣어 돌려줍니다.

```abap
METHOD validatecustomer.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( customerid ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  LOOP AT lt_travel INTO DATA(ls_travel) WHERE customerid IS INITIAL.
    APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.

    " 글을 직접 적어 메시지를 만든다
    APPEND VALUE #( %tky = ls_travel-%tky
                    %msg = new_message_with_text(
                             severity = if_abap_behv_message=>severity-error
                             text     = '고객 번호를 입력하세요.' )
                    %element-customerid = if_abap_behv=>mk-on ) TO reported-travel.
  ENDLOOP.
ENDMETHOD.
```

메시지 클래스에 등록해 둔 메시지를 쓰려면 `new_message( )` 를 부릅니다.

```abap
APPEND VALUE #( %tky = ls_travel-%tky
                %msg = new_message( id       = 'ZTRAVEL'
                                    number   = '001'
                                    severity = if_abap_behv_message=>severity-error
                                    v1       = ls_travel-travelid ) ) TO reported-travel.
```

## 알아두기

- 원문 예제는 child entity(자식 엔터티)의 필드 값을 저장 전에 확인하는 validation 입니다. 값이 범위를 벗어나면 `%msg` 와 함께 `%tky`, `%state_area`, `%path`, `%element` 를 채워 `reported` 에 넣습니다. 특정 인스턴스에 딸리지 않은 메시지는 `reported-%other` 에 넣습니다.
- 메시지 처리 전반은 ABAP RESTful Application Programming Model 개발 안내서의 Messages 절에 나옵니다.
- `%msg` 를 포함해 메시지와 관련된 구성요소 여러 개를 managed BO 에서 함께 쓰는 모습은 [[abenderived_types_reported_abexa]] 에 나옵니다.

## 관련 항목

- [[abapderived_types_element]]
- [[abapderived_types_state_area]]
- [[abapderived_types_path]]
- [[abapderived_types_other]]
- [[abapderived_types_info]]
- [[abenbdl_validations]]
- [[abaptype_response_for]]
