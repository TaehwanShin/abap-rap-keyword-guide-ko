---
title: 예제 - 작업 augmentation
summary: projection BO에서 생성과 create-by-association 요청을 augment 해, 요청에서 지정하지 않은 필드를 채우고 인스턴스를 더 만드는 과정을 보여 주는 예제입니다.
keywords: augment, operation augmentation, 작업 보강, 보강 예제, MODIFY AUGMENTING ENTITIES, RELATING TO, create by association, 연관 관계로 생성, projection BDEF, 프로젝션 BDEF, field ( modify )
---

## 설명

이 예제는 projection BO에 [[abenbdl_augment_projection|augmentation]] 을 정의하고 구현하는 방법을 보여 줍니다.

- base BO(기반 BO)는 managed 입니다. composition 으로 이어진 entity(엔터티) 두 개(부모와 자식)가 있습니다.
- projection BDEF는 base BDEF(기반 BDEF)의 standard operation(표준 작업)을 다시 쓰면서 `create`, `update`, create-by-association 에 `augment` 를 붙입니다.
- projection 의 behavior pool(동작 풀)에 augmentation 메서드를 세 개 둡니다. 생성용, 수정용, create-by-association 용입니다.

augmentation 으로 할 수 있는 일은 두 가지입니다. 원래 요청의 인스턴스에 **필드 값을 덧붙이는 일**과, 요청에 **새 인스턴스를 더하는 일**입니다. 예제는 둘 다 보여 줍니다.

아래 코드는 같은 내용을 공통 예제 모델(여행과 예약)로 줄여 쓴 것입니다. 수정용 augmentation 은 빼고, 생성과 create-by-association 만 augment 합니다.

## 예제

projection BDEF입니다. augment 할 작업마다 `( augment )` 를 붙입니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create ( augment );
  use update;
  use delete;

  use association _Booking { create ( augment ); }
}

define behavior for ZC_Booking alias Booking
{
  use update;
  use delete;

  use association _Travel;
}
```

projection 의 behavior pool 입니다. augmentation 메서드 두 개는 모두 `FOR MODIFY` handler method(핸들러 메서드)입니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS augment_create FOR MODIFY
      IMPORTING entities FOR CREATE travel.
    METHODS augment_cba_booking FOR MODIFY
      IMPORTING entities FOR CREATE travel\_booking.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD augment_create.
    " 새 여행의 Status 를 'N' 으로 채운다
    DATA lt_create   TYPE TABLE FOR CREATE zr_travel.
    DATA lt_relating TYPE abp_behv_relating_tab.

    LOOP AT entities INTO DATA(ls_entity).
      APPEND sy-tabix TO lt_relating.
      APPEND VALUE #( %cid            = ls_entity-%cid
                      TravelID        = ls_entity-TravelID
                      Status          = 'N'
                      %control-Status = if_abap_behv=>mk-on ) TO lt_create.
    ENDLOOP.

    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY travel
        CREATE FROM lt_create
        RELATING TO entities BY lt_relating.
  ENDMETHOD.

  METHOD augment_cba_booking.
    DATA lt_cba TYPE TABLE FOR CREATE zr_travel\_booking.

    " 1) 요청에 들어온 예약마다 BookingStatus 를 'N' 으로 채운다
    LOOP AT entities INTO DATA(ls_travel).
      APPEND VALUE #( %cid_ref = ls_travel-%cid_ref
                      TravelID = ls_travel-TravelID
                      %target  = VALUE #( FOR ls_booking IN ls_travel-%target
                                          ( %cid                   = ls_booking-%cid
                                            BookingID              = ls_booking-BookingID
                                            BookingStatus          = 'N'
                                            %control-BookingStatus = if_abap_behv=>mk-on ) ) )
             TO lt_cba.
    ENDLOOP.

    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY travel
        CREATE BY \_booking FROM lt_cba.

    " 2) 여행마다 예약을 하나 더 만든다 (새 인스턴스 추가)
    DATA lt_extra TYPE TABLE FOR CREATE zr_travel\_booking.

    LOOP AT entities INTO ls_travel.
      APPEND VALUE #( %cid_ref = ls_travel-%cid_ref
                      TravelID = ls_travel-TravelID
                      %target  = VALUE #( ( BookingID          = '9999'
                                            %control-BookingID = if_abap_behv=>mk-on ) ) )
             TO lt_extra.
    ENDLOOP.

    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY travel
        CREATE BY \_booking AUTO FILL CID WITH lt_extra.
  ENDMETHOD.
ENDCLASS.
```

projection BO를 EML로 부릅니다. 사용자는 augmentation 이 있다는 것을 몰라도 됩니다.

```abap
MODIFY ENTITIES OF zc_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID )
    WITH VALUE #( ( %cid = 'cid1' TravelID = '00000001' AgencyID = '070001' ) )
    CREATE BY \_booking
    FIELDS ( BookingID )
    WITH VALUE #( ( %cid_ref = 'cid1'
                    %target  = VALUE #( ( %cid = 'cid2' BookingID = '0001' ) ) ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

실행하면 다음과 같이 됩니다.

- 여행을 만들면 요청에 없던 `Status` 가 `'N'` 으로 채워져 저장됩니다. augmentation 이 자동으로 실행된 결과입니다.
- association 으로 예약 하나를 만들었는데 예약이 두 건 저장됩니다. 요청한 예약에는 `BookingStatus` 가 채워지고, augmentation 이 더한 예약(`BookingID` = `'9999'`)이 하나 더 생깁니다.
- 원문 예제는 여기에 더해, 여행을 수정할 때마다 숫자 필드 하나에 정해 둔 값을 넣는 수정용 augmentation 메서드도 구현합니다. 방법은 생성용과 같고 `CREATE FROM` 대신 `UPDATE FROM` 을 씁니다.

눈여겨볼 점입니다.

- augmentation 메서드는 projection 의 behavior pool 에 있지만, `MODIFY AUGMENTING ENTITIES` 의 대상은 **base BO**(`zr_travel`)입니다. derived type(파생 타입)도 base BO 의 것으로 선언합니다.
- 생성과 수정에서는 `RELATING TO ... BY` 로, 덧붙이는 줄이 원래 요청의 몇 번째 줄에 딸린 것인지 알려 줍니다.
- 원래 요청에 이미 값이 있는 필드는 augmentation 으로 바꿀 수 없습니다. 원래 요청에서 지정하지 않은 필드만 채워집니다.
- 원문 예제는 RAP BO 계약을 모두 지키지는 않습니다. 설명용으로 짧게 만든 것입니다.

## 관련 항목

- [[abenbdl_augment_projection]]
- [[abenbdl_field_augment]]
- [[abenbdl_use_projection]]
- [[abaphandler_meth_modify]]
- [[abeneml_modify_augmenting_abexa]]
