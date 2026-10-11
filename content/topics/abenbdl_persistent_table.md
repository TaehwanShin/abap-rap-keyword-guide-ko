---
title: persistent table
summary: managed RAP BO 의 entity 가 데이터를 저장하는 DDIC 데이터베이스 테이블을 정하는 구문입니다. managed 에서는 꼭 적어야 합니다.
keywords: persistent table, 영구 테이블, 저장 테이블, DDIC database table, managed, 관리형, with unmanaged save, etag, total etag, UUID, numbering managed, mapping, 타입 매핑
---

## 문법

```syntax
...
persistent table TableName
 ...
```

## 설명

persistent table 은 RAP BO 가 바탕으로 삼는 DDIC 데이터베이스 테이블입니다. RAP BO 작업이 이 테이블에 있는 데이터를 다룹니다. 테이블에 가해지는 변경은 모두 RAP 프레임워크가 관리합니다.

### 쓸 수 있는 곳

- **managed RAP BO 에서만** 쓰고, managed 에서는 꼭 적어야 합니다.
- 예외가 하나 있습니다. [[abenbdl_saving|with unmanaged save]] 로 unmanaged save 를 쓰는 managed RAP BO 에서는 persistent table 을 적으면 안 됩니다.
- projection BO 는 persistent table 을 저절로 물려받습니다. 적을 필요가 없습니다.

### 테이블이 갖춰야 할 것

**BDEF 에 ETag 필드를 정했을 때**

- persistent table 에 테이블의 상태를 나타내는 필드가 있어야 합니다. 타임스탬프 필드가 그 예입니다.
- 이 필드에 CDS 에서 `@Semantics.systemDateTime.localInstanceLastChangedAt: true` 같은 알맞은 주석을 달면 RAP 프레임워크가 값을 알아서 갱신합니다.

**[[abenbdl_with_draft|draft 를 켠]] RAP BO 에 `total etag` 필드가 있을 때**

- persistent table 에 BO 인스턴스가 바뀔 때마다 갱신되는 필드가 있어야 합니다. `etag master` 필드와는 **다른** 필드여야 합니다.
- `total etag` 필드는 [[abenbdl_locking|lock master entity]] 에 있어야 합니다.
- 이 필드가 타임스탬프이고 CDS 데이터 모델에서 `@Semantics.systemDateTime.lastChangedAt` 주석을 달았다면 RAP 프레임워크가 알아서 갱신합니다.

**기본 키 필드가 `raw(16)` (UUID) 일 때**

- RAP 프레임워크가 internal numbering 으로 값을 채워 줄 수 있습니다. 구문은 [[abenbdl_field_numbering|numbering:managed]] 입니다.

UUID 를 기본 키로 쓰기로 했다면 다음 규칙을 따릅니다.

- 모든 entity(엔터티)에 UUID 키 필드가 있어야 합니다.
- child entity(자식 엔터티)에는 부모의 UUID 를 담는 필드가 있어야 합니다. composition 의 association 을 정의하는 데 필요합니다.
- lock master entity 와 부모-자식 사이가 아닌 child entity 에는 lock master 의 UUID 를 담는 필드가 있어야 합니다. lock master entity 로 가는 association 을 정의하는 데 필요하고, 이 association 은 ETag 처리에 쓰입니다.

## 예제

부모와 child entity 에 persistent table 을 하나씩 정한 managed BDEF 입니다. CDS 뷰의 필드 이름이 테이블의 필드 이름과 달라서 `mapping` 으로 이어 줍니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  association _Booking { create; }

  field ( readonly : update ) TravelID;

  mapping for ztravel
  {
    TravelID = travel_id;
    AgencyID = agency_id;
    Status   = status;
  }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly : update ) TravelID, BookingID;
  association _Travel;

  mapping for zbooking
  {
    TravelID  = travel_id;
    BookingID = booking_id;
  }
}
```

EML 로 여행과 예약을 만들고 저장합니다. `COMMIT ENTITIES` 가 끝나면 바뀐 데이터가 `ztravel` 과 `zbooking` 에 들어가 있습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid status )
      WITH VALUE #( ( %cid = 'T1' travelid = '00000001' agencyid = '070001' status = 'O' ) )
    CREATE BY \_booking
      FIELDS ( bookingid )
      WITH VALUE #( ( %cid_ref = 'T1'
                      %target  = VALUE #( ( %cid = 'B1' bookingid = '0001' ) ) ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

- persistent table 의 필드 이름이 바탕 데이터 모델의 CDS 뷰 필드 이름과 다르면, entity 동작 본문에 type mapping(`mapping for`)이 있어야 합니다. CDS 데이터 모델의 필드에 별칭을 붙였을 때 흔히 그렇게 됩니다.
- persistent table 은 보통의 DDIC 데이터베이스 테이블이라 ABAP SQL 이나 AMDP 로도 접근할 수 있습니다. 기술적으로는 되지만 권하지 않습니다. ABAP EML 처럼 RAP 프레임워크를 거쳐서만 접근하기를 권합니다.

## 관련 항목

- [[abenbdl_saving]]
- [[abenbdl_draft_table]]
- [[abenbdl_locking]]
- [[abenbdl_field_numbering]]
- [[abapcommit_entities]]
- [[abeneml_modify_op_abexa]]
- [[abenbdl_character]]
