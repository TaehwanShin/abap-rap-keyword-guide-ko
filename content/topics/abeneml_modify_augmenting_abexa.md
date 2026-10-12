---
title: 예제 - MODIFY AUGMENTING
summary: projection BO 의 생성, 수정, create-by-association 작업에 MODIFY AUGMENTING 으로 필드 값을 자동으로 보태는 예제입니다.
keywords: MODIFY AUGMENTING 예제, AUGMENTING, augment, 보강, 프로젝션, projection, use create ( augment ), use update ( augment ), create by association, 연관 관계로 생성, %control
---

## 설명

projection BO 에서 `AUGMENTING` 을 붙인 `MODIFY` 문을 쓰는 예제입니다.

base BDEF(기반 BDEF) 는 managed 이고, composition 으로 이어진 entity(엔터티) 두 개(부모와 자식)의 동작을 정의합니다. projection BDEF 는 base BDEF 의 standard operation(표준 작업)을 `use` 로 가져다 쓰면서, 생성, 수정, create-by-association 세 작업에 `augment` 를 적었습니다.

projection BDEF 의 behavior pool(동작 풀)에는 augmentation 을 구현한 메서드가 세 개 있습니다.

| 메서드 | 하는 일 |
| --- | --- |
| `augment_create` | 생성 작업을 augment 합니다. 인스턴스를 새로 만들 때마다 필드 하나에 정해 둔 글자 값을 넣습니다. |
| `augment_update` | 수정 작업을 augment 합니다. 인스턴스를 고칠 때마다 다른 필드 하나에 정해 둔 숫자 값을 넣습니다. |
| `augment_cba_child` | create-by-association 작업을 augment 합니다. 부모를 거쳐 자식 인스턴스를 만들 때마다 자식의 필드 하나에 정해 둔 글자 값을 넣습니다. |

세 메서드 모두 RAP BO consumer(사용자)가 보내지 않은 필드를 채웁니다.

## 예제

여행 모델로 줄여 쓴 것입니다. projection BDEF 에서 augment 할 작업에 `augment` 를 적습니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create ( augment );
  use update ( augment );
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

projection 의 behavior pool 입니다. 새 여행에는 상태 `O`(열림)를, 고친 여행에는 고친 시각을, 여행을 거쳐 만드는 예약에는 예약 상태 `N`(신규)을 보탭니다. `BookingID` 와 `BookingStatus` 는 예약 entity 의 필드입니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS augment_create FOR MODIFY
      IMPORTING entities FOR CREATE travel.
    METHODS augment_update FOR MODIFY
      IMPORTING entities FOR UPDATE travel.
    METHODS augment_cba_booking FOR MODIFY
      IMPORTING entities FOR CREATE travel\_booking.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD augment_create.
    DATA lt_augment TYPE TABLE FOR CREATE zr_travel.

    " 원래 요청과 같은 %cid 로, 보탤 필드만 표시해서 넘긴다
    lt_augment = VALUE #( FOR ls_entity IN entities
                          ( %cid            = ls_entity-%cid
                            travelid        = ls_entity-travelid
                            status          = 'O'
                            %control-status = if_abap_behv=>mk-on ) ).

    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY zr_travel
        CREATE FROM lt_augment.
  ENDMETHOD.

  METHOD augment_update.
    DATA lt_augment TYPE TABLE FOR UPDATE zr_travel.
    GET TIME STAMP FIELD DATA(lv_now).

    lt_augment = VALUE #( FOR ls_entity IN entities
                          ( travelid               = ls_entity-travelid
                            lastchangedat          = lv_now
                            %control-lastchangedat = if_abap_behv=>mk-on ) ).

    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY zr_travel
        UPDATE FROM lt_augment.
  ENDMETHOD.

  METHOD augment_cba_booking.
    DATA lt_augment TYPE TABLE FOR CREATE zr_travel\_booking.

    " 여행을 거쳐 만드는 예약마다 예약 상태 N(신규)을 보탠다
    lt_augment = VALUE #(
      FOR ls_entity IN entities
      ( %cid_ref = ls_entity-%cid_ref
        travelid = ls_entity-travelid
        %target  = VALUE #( FOR ls_target IN ls_entity-%target
                            ( %cid                   = ls_target-%cid
                              bookingid              = ls_target-bookingid
                              bookingstatus          = 'N'
                              %control-bookingstatus = if_abap_behv=>mk-on ) ) ) ).

    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY zr_travel
        CREATE BY \_booking FROM lt_augment.
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer 는 projection 에 평소처럼 요청을 보냅니다. `Status` 는 보내지 않습니다.

```abap
MODIFY ENTITY zc_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #( ( %cid = 'c1' travelid = '00000001' agencyid = '070001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

원문 예제를 실행하면 다음과 같이 됩니다.

- `MODIFY` 문으로 부모 인스턴스 두 개를 만들고 커밋합니다. 이어서 그 가운데 하나를 고치고 커밋합니다. augmentation 덕분에 새 인스턴스마다 생성용 값이 저절로 들어가고, 고친 인스턴스에는 수정용 값이 들어갑니다.
- 또 다른 `MODIFY` 문으로 부모 인스턴스마다 자식 인스턴스를 하나씩 create-by-association 합니다. 새 자식 인스턴스마다 augmentation 용 값이 저절로 들어갑니다.
- 화면에는 root entity(루트 엔터티)와 child entity(자식 엔터티)의 데이터베이스 테이블 내용이 나옵니다. 요청에 넣지 않은 필드에 값이 들어 있는 것을 확인할 수 있습니다.

눈여겨볼 점은 두 가지입니다. projection 에 요청을 보내는 쪽은 augmentation 이 있는지 몰라도 됩니다. 그리고 `MODIFY AUGMENTING` 문에는 `FAILED`, `MAPPED`, `REPORTED` 를 적지 않습니다.

이 예제는 RAP BO consumer 가 augment 할 필드를 요청에 넣지 않는다고 보고 쓴 것입니다. augmentation 은 원래 요청의 필드를 덮어쓰면 안 됩니다([[abapmodify_aug_entity_entities]]). 사용자가 `Status`, `LastChangedAt`, `BookingStatus` 를 직접 보낼 수도 있다면, 입력의 `%control` 을 보고 표시가 off 인 필드만 보태야 합니다.

## 관련 항목

- [[abapmodify_aug_entity_entities]]
- [[abenbdl_augment_projection]]
- [[abeneml_modify_augm_relating_abexa]]
- [[abeneml_in_abp]]
