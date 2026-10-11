---
title: map_messages saver method
summary: foreign entity 로 등록한 다른 BO 가 돌려준 메시지를 내 BO 의 말로 바꾸거나 지우는 saver method 입니다.
keywords: map_messages, 세이버 메서드, saver method, 메시지 매핑, message mapping, foreign entity, 외부 엔터티, %foreign, reported, REPORTED LATE, 전이 메시지, transition message
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS map_messages REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD map_messages.
      ...
      ENDMETHOD.
      ...
ENDCLASS.
```

## 설명

`map_messages` 는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드에 둡니다. 미리 정해져 있는 메서드이므로 `REDEFINITION` 으로 다시 정의합니다. `base_class` 는 saver class 가 상속하는 기본 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

한 RAP 트랜잭션에서 내 BO 말고 다른 BO 도 함께 바뀌는 일이 있습니다. 그 다른 BO 는 바깥에 직접 드러나 있지 않아서, 거기서 나온 메시지를 사용자가 그대로 보면 무슨 뜻인지 알기 어렵습니다. `map_messages` 는 이런 메시지를 다루는 자리입니다. 업무 요구에 따라 드러나 있는 BO 의 업무 맥락에 맞게 바꿔 넘길 수도 있고, 그냥 무시하고 지울 수도 있습니다.

- 써도 되고 안 써도 됩니다.
- BDEF 에 다른 BO 를 [[abenbdl_foreign|foreign entity]] 로 적어 둔 RAP BO 의 behavior pool 에서만 쓸 수 있습니다.
- 미리 정해진 `CHANGING` 매개변수가 하나 있습니다. `reported` 이고 타입은 [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]] 입니다.
- BDEF 에 foreign entity 를 적으면, 드러나 있는 BO 의 `reported` 안에 그 foreign entity 도 구성요소로 들어옵니다. 그래서 foreign entity 가 돌려준 메시지를 읽어 내 BO 의 메시지로 옮길 수 있습니다. foreign entity 는 `reported-%foreign` 아래에 모여 있습니다([[abapderived_types_foreign]]).
- foreign entity 로 적은 BO 가 자기 saver class 에서 `reported` 에 transition message(전이 메시지)를 담아 돌려줬을 때만 불립니다.
- 원문은 이 메서드가 early save phase(이른 저장 단계)에서 불린다고 적고 있습니다. 다만 원문 예제 [[abenabp_map_messages_abexa]] 에서 foreign entity 쪽 saver class 가 구현한 메서드는 late save phase(늦은 저장 단계)의 `save` 하나뿐입니다.

## 예제

여행 BO 의 BDEF 머리말에 여행사 BO 를 foreign entity 로 적습니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );
foreign entity ZR_Agency;

define behavior for ZR_Travel alias Travel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

saver class 에서는 여행사 BO 가 낸 메시지를 여행 쪽 글로 바꿔 `reported-travel` 에 넣고, 원래 메시지는 지웁니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save         REDEFINITION.
    METHODS map_messages REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save.
    MODIFY ztravel FROM TABLE @lcl_buffer=>mt_travel.
  ENDMETHOD.

  METHOD map_messages.
    LOOP AT reported-%foreign-zr_agency ASSIGNING FIELD-SYMBOL(<ls_foreign>).
      " 여행사 BO 의 메시지를 여행 화면에 맞는 글로 바꿔 넣는다
      INSERT VALUE #( %msg = new_message_with_text(
                               severity = if_abap_behv_message=>severity-information
                               text     = |여행사 { <ls_foreign>-agencyid } 정보도 함께 저장했습니다.| ) )
             INTO TABLE reported-travel.
    ENDLOOP.

    " 원래 메시지는 지워서 바깥 응답에 남지 않게 한다
    CLEAR reported-%foreign-zr_agency.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 저장 단계에서 옮길 수 있는 것은 transition message 뿐입니다. 상태 메시지는 저장 단계에서 mapping 할 수 없습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abenbdl_foreign]]
- [[abapderived_types_foreign]]
- [[abaptype_response_for]]
- [[abenabp_map_messages_abexa]]
