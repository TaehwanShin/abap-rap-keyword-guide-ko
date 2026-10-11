---
title: 예제 - map_messages saver method
summary: 외부 entity 로 적어 둔 다른 BO 의 메시지를 map_messages 에서 바꿔 드러나 있는 BO 의 메시지로 넘기는 예제입니다.
keywords: map_messages 예제, foreign entity, 외부 엔터티, %foreign, 메시지 매핑, message mapping, REPORTED LATE, COMMIT ENTITIES RESPONSES, 비관리형, unmanaged
---

## 설명

unmanaged RAP BO 두 개로 `map_messages` 를 보여 주는 예제입니다. 하나는 바깥에 드러나 있는 BO 이고, 다른 하나는 드러나 있지 않은 BO 입니다. 드러나 있는 BO 의 BDEF 머리말에 다른 BO 를 `foreign entity` 로 적어 둡니다.

BDEF 마다 behavior pool(동작 풀)이 하나씩 있습니다. 예제를 작게 유지하려고 [[abenabp_handler_class|핸들러]] 쪽은 `create` 만, [[abenabp_saver_class|세이버]] 쪽은 `save` 만 구현했습니다. 드러나 있는 BO 의 behavior pool 에는 여기에 `map_messages` 가 더 들어 있습니다.

`map_messages` 는 이렇게 구현되어 있습니다.

1. 외부 entity(엔터티)의 `REPORTED LATE` 테이블에 든 메시지를 `LOOP AT` 으로 하나씩 꺼냅니다.
2. 메시지의 글을 바꾼 뒤, 드러나 있는 BO 의 `REPORTED LATE` 테이블에 넣습니다.
3. 반복이 끝나면 외부 entity 의 `REPORTED LATE` 테이블을 비웁니다.

## 예제

여행 모델로 줄여 쓴 것입니다. 드러나 있는 BO 는 여행(`ZR_Travel`)이고, 외부 entity 는 여행사(`ZR_Agency`)라는 별도 BO 입니다.

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

여행 BO 의 saver class(세이버 클래스)입니다. 외부 entity 의 메시지는 `reported-%foreign` 아래에 entity 이름으로 들어 있습니다.

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
      " 1) 여행사 BO 의 메시지 글을 바꾼다
      <ls_foreign>-%msg = new_message_with_text(
        severity = if_abap_behv_message=>severity-information
        text     = |여행사 { <ls_foreign>-agencyid } 정보도 함께 저장했습니다.| ).

      " 2) 바꾼 메시지를 여행 BO 의 reported 에 넣는다
      INSERT VALUE #( %msg = <ls_foreign>-%msg ) INTO TABLE reported-travel.
    ENDLOOP.

    " 3) 원래 메시지는 지워서 바깥 응답에 남지 않게 한다
    CLEAR reported-%foreign-zr_agency.
  ENDMETHOD.
ENDCLASS.
```

BO 를 쓰는 쪽에서는 한 트랜잭션 안에서 두 BO 에 각각 인스턴스를 만들고 한 번에 커밋합니다. 저장 단계의 메시지는 `COMMIT ENTITIES` 에서 받습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #( ( %cid = 'travel_1' travelid = '00000001' agencyid = '070001' ) )
  FAILED DATA(ls_failed_travel).

MODIFY ENTITY zr_agency
  CREATE FIELDS ( agencyid name )
  WITH VALUE #( ( %cid = 'agency_1' agencyid = '070001' name = '하늘여행사' ) )
  FAILED DATA(ls_failed_agency).

COMMIT ENTITIES RESPONSES REPORTED DATA(lt_reported).
```

## 알아두기

원문 예제를 실행하면 다음과 같이 됩니다.

- `MODIFY` 요청 두 개가 한 RAP 트랜잭션 안에서 실행됩니다. 드러나 있는 BO 와 외부 entity 에 인스턴스를 두 개씩 만듭니다. `COMMIT ENTITIES` 가 save sequence(저장 순서)를 시작하고 트랜잭션을 끝냅니다.
- 화면에는 두 데이터베이스 테이블에 저장된 내용과, `COMMIT ENTITIES` 가 돌려준 `REPORTED` 응답이 나옵니다.
- `REPORTED` 응답을 보면 `map_messages` 의 효과가 드러납니다. 외부 entity 의 인스턴스에서 나온 메시지가 드러나 있는 BO 쪽에 들어 있고, 글도 바뀌어 있습니다. 외부 entity 쪽 `REPORTED` 테이블은 내용을 지웠기 때문에 비어 있습니다.
- `map_messages` 가 불리려면 외부 entity 인 BO 가 자기 saver class 에서 `reported` 에 메시지를 담아 돌려줘야 합니다.

## 관련 항목

- [[abenrap_saver_methods_abexas]]
- [[abensaver_map_messages]]
- [[abenbdl_foreign]]
- [[abapderived_types_foreign]]
- [[abapemlcommit_entities_dyn]]
- [[abapmodify_entity_entities_op]]
