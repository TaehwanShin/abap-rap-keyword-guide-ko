---
title: 예제 - 노드 extension
summary: 여러 층으로 된 BO 에 extension 노드를 하나 보태고, ancestor association 을 써서 마스터 entity 를 직접 가리키지 않고 동작을 정의한 뒤 한꺼번에 생성해 보는 예제입니다.
keywords: node extension, 노드 확장, 확장 노드, define behavior for, using, ancestor association, extend view entity, composition, CREATE BY, deep create, 상위 연관 관계, 예제
---

## 설명

이 예제는 RAP BO 에 **동작이 있는 extension(확장) 노드**를 보태는 과정을 보여 줍니다.

**원본 BO**

- 루트, 자식, 손자, 증손자 네 노드가 CDS composition 으로 이어진 트리입니다. 손자 노드의 CDS 뷰에는 새 composition 을 허용하는 표시가 있습니다.
- 원본 BDEF 는 managed 이고 draft 를 쓰며, extension 지점이 여러 개 열려 있습니다.
- 원본 behavior pool(동작 풀)은 instance 권한 확인을 구현합니다. 한 필드가 특정 값이면 수정과 삭제를 막습니다.

**extension**

- 증손자와 같은 층에 extension 노드를 하나 보탭니다. 이 노드의 CDS 뷰는 원본 네 노드 모두로 가는 association 을 정의합니다. 부모(손자), 형제(증손자), 조부모(자식), 증조부모(루트)입니다.
- extension 노드의 바로 위 부모인 손자 노드의 CDS 뷰를 확장해, extension 노드로 가는 composition 을 정의하고 내놓습니다.
- BDEF extension 은 interface 를 거쳐 손자 노드에서 새 composition 에 동작을 켜고, `define behavior for` 로 extension 노드의 동작을 정의합니다.
- extension 노드에서 조부모와 증조부모로 가는 association 은 `ancestor association` 으로 선언합니다. 바로 위 부모로 가는 association 은 보통 `association` 입니다. lock master 와 authorization master 는 이름으로 가리키지 않고 `( lock, authorization ) dependent` 라고만 적습니다.

## 예제

공통 예제 모델로 줄여 썼습니다. `Travel` → `Booking` 아래에 extension 노드 `ZR_BookingSuppl` 을 보탭니다. 먼저 CDS 쪽입니다.

```cds
define view entity ZR_BookingSuppl
  as select from zbooksuppl
  association to parent ZR_Booking as _Booking
    on  $projection.TravelID  = _Booking.TravelID
    and $projection.BookingID = _Booking.BookingID
  association [1..1] to ZR_Travel as _Travel
    on $projection.TravelID = _Travel.TravelID
{
  key travel_id     as TravelID,
  key booking_id    as BookingID,
  key supplement_id as SupplementID,
      price         as Price,
      _Booking,
      _Travel
}
```

```cds
// parent entity 에 composition 을 보탠다
extend view entity ZR_Booking with
  composition [0..*] of ZR_BookingSuppl as _BookingSuppl
{
  _BookingSuppl
}
```

BDEF extension 입니다.

```bdl
extension using interface ZI_Travel;

extend behavior for Booking
{
  association _BookingSuppl { create; with draft; }
}

define behavior for ZR_BookingSuppl alias BookingSuppl
  using ZI_BookingSuppl
persistent table zbooksuppl
draft table zbooksuppl_d
( lock, authorization ) dependent
{
  update;
  delete;
  field ( readonly ) TravelID, BookingID;
  field ( readonly : update ) SupplementID;

  association _Booking { with draft; }
  ancestor association _Travel { with draft; }
}
```

사용하는 쪽은 interface 를 거쳐 트리 전체를 한 번에 만들고, 이어서 extension 노드를 수정합니다.

```abap
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid )
    WITH VALUE #( ( %cid = 'travel1' travelid = '00000001' agencyid = '070001' ) )
    CREATE BY \_booking FIELDS ( bookingid )
    WITH VALUE #( ( %cid_ref = 'travel1'
                    %target  = VALUE #( ( %cid = 'booking1' bookingid = '0001' ) ) ) )
  ENTITY booking
    " extension 노드도 composition 을 따라 만든다
    CREATE BY \_bookingsuppl FIELDS ( supplementid price )
    WITH VALUE #( ( %cid_ref = 'booking1'
                    %target  = VALUE #( ( %cid = 'suppl1' supplementid = '01' price = '30.00' ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

MODIFY ENTITIES OF zi_travel
  ENTITY bookingsuppl
    UPDATE FIELDS ( price )
    WITH VALUE #( ( travelid = '00000001' bookingid = '0001' supplementid = '01'
                    price    = '45.00' ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

### 실행하면

- **한꺼번에 생성**: composition 트리의 entity(엔터티)마다 인스턴스를 하나씩 만듭니다. extension 노드도 여기에 들어갑니다.
- **extension 노드 수정**: 수정 작업의 instance 권한 확인은 **원본 BO 의 behavior pool** 에 구현된 것이 실행됩니다. 확인을 통과해 수정이 성공합니다.
- 원문 프로그램은 entity 데이터를 담는 테이블 다섯 개의 내용을 모두 보여 줍니다.

## 알아두기

- extension 노드는 interface BDEF 에 적혀 있지 않지만, 사용하는 쪽에서는 `MODIFY ENTITIES OF` interface `ENTITY` extension 노드 별칭 형태로 다른 entity 처럼 다룹니다.
- extension 노드에 권한 확인을 따로 구현하지 않았는데도 원본의 instance 권한 확인이 적용됩니다. 원본의 구현은 extension 노드에 대한 작업에도 그대로 걸립니다. ([[abenbdl_in_class_unique_ext]] 참고)
- 원문 예제의 extension 노드에는 형제 노드로 가는 association 도 있습니다. 형제로 가는 association 은 `ancestor` 로 선언하지 않습니다.

## 관련 항목

- [[abenbdl_define_beh_extend]]
- [[abenbdl_ancestor_ext]]
- [[abenbdl_using_interface]]
- [[abenbdl_new_elem_ext]]
- [[abenbdl__behavior_ext_abexa]]
- [[abapmodify_entity_entities_op]]
