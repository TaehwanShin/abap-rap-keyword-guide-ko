---
title: %foreign (외부 entity 묶음)
summary: saver method map_messages 의 reported 응답에서, behavior definition 에 적은 외부 entity 를 모두 묶어 담는 구성요소 묶음입니다.
keywords: %foreign, foreign entity, 외부 엔터티, map_messages, REPORTED LATE, TYPE RESPONSE FOR REPORTED LATE, 메시지 매핑, 세이버 메서드, 구성요소 묶음
---

## 설명

`%foreign` 은 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**입니다. saver method(세이버 메서드) [[abensaver_map_messages|map_messages]] 에서 받는 `REPORTED` response parameter(응답 매개변수) 안에 들어 있습니다.

이 묶음에는 behavior definition(동작 정의)에 적어 둔 **외부 entity(엔터티)**(foreign entity, 다른 BO 의 entity)가 모두 모여 있습니다. 외부 entity 마다 하위 구성요소가 하나씩 있어서, 그 entity 에서 넘어온 메시지를 꺼내 볼 수 있습니다.

### 타입

`%foreign` 의 하위 구성요소는 타입이 [[abaptype_table_for|TYPE TABLE FOR REPORTED LATE]] 인 내부 테이블입니다.

### 쓰이는 곳

- [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]]

## 예제

여행 BO 의 behavior definition 머리에 여행사 entity 를 외부 entity 로 적어 둡니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
foreign entity ZR_Agency;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
}
```

saver class(세이버 클래스)의 `map_messages` 에서 외부 entity 의 메시지를 읽어, 여행 BO 의 메시지로 바꿔 담습니다.

```abap
METHOD map_messages.
  LOOP AT reported-%foreign-zr_agency ASSIGNING FIELD-SYMBOL(<ls_foreign>).
    " 외부 entity 의 메시지를 고쳐서 우리 BO 의 REPORTED 에 넣는다
    INSERT VALUE #( %msg = new_message_with_text(
                             severity = if_abap_behv_message=>severity-information
                             text     = |여행사 { <ls_foreign>-%key-agencyid } 가 저장되었습니다.| ) )
           INTO TABLE reported-travel.
  ENDLOOP.

  " 원래 메시지를 지우면 바깥으로 나가는 결과에서 빠진다
  CLEAR reported-%foreign-zr_agency.
ENDMETHOD.
```

## 알아두기

- 원래 메시지를 지워서 바깥 결과에 나가지 않게 할 수 있습니다.
- 메시지 mapping 에 대한 자세한 내용은 ABAP RESTful Application Programming Model 개발 안내서의 Message Mapping 절에 나옵니다.
- unmanaged BO 의 saver class 에서 `map_messages` 를 구현하며 `%foreign` 을 쓰는 모습은 [[abenabp_map_messages_abexa]] 에 나옵니다.

## 관련 항목

- [[abensaver_map_messages]]
- [[abenbdl_foreign]]
- [[abapderived_types_own]]
- [[abapderived_types_msg]]
- [[abapderived_types_info]]
- [[abaptype_response_for]]
