---
title: 예제 - MODIFY 문의 세 가지 형식
summary: 같은 managed BO 를 MODIFY ENTITY, MODIFY ENTITIES OF, MODIFY ENTITIES OPERATIONS 세 형식으로 바꿔 보며 차이를 견주는 예제입니다.
keywords: MODIFY ENTITY, MODIFY ENTITIES OF, MODIFY ENTITIES OPERATIONS, 짧은 형식, 긴 형식, 동적 형식, ABP_BEHV_CHANGES_TAB, COMMIT ENTITIES, 예제, CL_DEMO_RAP_EML_MODIFY
---

## 설명

EML `MODIFY` 문에는 세 가지 형식이 있습니다. 이 예제는 간단한 managed RAP BO 하나를 세 형식으로 차례로 바꿔 봅니다.

- `MODIFY ENTITY bdef` : 짧은 형식. entity(엔터티) 하나를 다룹니다.
- `MODIFY ENTITIES OF bdef` : 긴 형식. 한 BO 의 여러 entity 를 다룹니다.
- `MODIFY ENTITIES OPERATIONS op_tab` : 동적 형식. 작업 목록을 내부 테이블로 넘깁니다.

원문의 BO 는 root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나로 이루어져 있습니다. 루트에는 `create`, `update`, `delete` 와 자식을 만드는 association 이, 자식에는 `update`, `delete` 가 선언돼 있습니다. standard operation(표준 작업)만 쓰므로 behavior pool(동작 풀)은 만들지 않았습니다. 아래에서는 같은 짜임새를 Travel / Booking 으로 옮겼습니다.

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
}
```

## 예제

### 짧은 형식

root entity 이름을 바로 적고, 여행 하나와 그 여행의 예약 하나를 만듭니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #( ( %cid = 'cid1' travelid = '00000001' agencyid = '070001' ) )
  CREATE BY \_booking FIELDS ( bookingid flightprice )
  WITH VALUE #( ( %cid_ref = 'cid1'
                  %target  = VALUE #( ( %cid = 'cid2' bookingid = '0001'
                                        flightprice = '500.00' ) ) ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported)
  MAPPED   DATA(ls_mapped).

COMMIT ENTITIES.
```

### 긴 형식

`ENTITY` 로 entity 를 나누어 적습니다. 루트를 만들고 고치고, 예약을 붙이고, 붙인 예약을 child entity 쪽에서 바로 고칩니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid )
    WITH VALUE #( ( %cid = 'cid3' travelid = '00000002' agencyid = '070001' ) )
  ENTITY travel
    UPDATE FIELDS ( agencyid )
    WITH VALUE #( ( %cid_ref = 'cid3' agencyid = '070002' ) )
  ENTITY travel
    CREATE BY \_booking FIELDS ( bookingid flightprice )
    WITH VALUE #( ( %cid_ref = 'cid3'
                    %target  = VALUE #( ( %cid = 'cid4' bookingid = '0001'
                                          flightprice = '500.00' ) ) ) )
  ENTITY booking
    UPDATE FIELDS ( flightprice )
    WITH VALUE #( ( %cid_ref = 'cid4' flightprice = '450.00' ) )
  FAILED   ls_failed
  REPORTED ls_reported
  MAPPED   ls_mapped.

COMMIT ENTITIES.
```

### 동적 형식

작업마다 인스턴스 테이블을 따로 만들고, `ABP_BEHV_CHANGES_TAB` 타입 테이블에 한 줄씩 담아 넘깁니다.

```abap
DATA: lt_op     TYPE abp_behv_changes_tab,
      lt_create TYPE TABLE FOR CREATE zr_travel,
      lt_delete TYPE TABLE FOR DELETE zr_booking.

lt_create = VALUE #(
  ( %cid = 'cid5'
    travelid = '00000003'  %control-travelid = if_abap_behv=>mk-on
    agencyid = '070001'    %control-agencyid = if_abap_behv=>mk-on ) ).

lt_delete = VALUE #( ( travelid = '00000002' bookingid = '0001' ) ).

lt_op = VALUE #(
  ( op = if_abap_behv=>op-m-create
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_create ) )
  ( op = if_abap_behv=>op-m-delete
    entity_name = 'ZR_BOOKING'
    instances   = REF #( lt_delete ) ) ).

MODIFY ENTITIES OPERATIONS lt_op
  FAILED   DATA(lt_failed_dyn)
  REPORTED DATA(lt_reported_dyn)
  MAPPED   DATA(lt_mapped_dyn).

COMMIT ENTITIES.
```

## 알아두기

- 원문 프로그램은 형식마다 `MODIFY` 문을 실행하고 `COMMIT ENTITIES` 로 저장한 뒤, persistent table 을 `SELECT` 로 읽어 루트와 자식 테이블의 내용을 출력합니다. 형식이 바뀔 때마다 테이블을 비우고 다시 시작하므로 형식별 결과를 따로 볼 수 있습니다.
- `MODIFY` 문은 transactional buffer(트랜잭션 버퍼)만 바꿉니다. managed BO 라서 버퍼는 프레임워크가 맡고, `COMMIT ENTITIES` 가 실행돼야 persistent table 에 저장됩니다. 원문은 `COMMIT ENTITIES` 뒤에 `sy-subrc` 를 보고 save sequence(저장 순서)에서 문제가 났는지 확인합니다.
- 짧은 형식과 긴 형식에서는 `FIELDS ( ... ) WITH` 를 써서 `%control` 을 문장에 맡겼습니다. 동적 형식에서는 인스턴스 테이블을 직접 만들므로 `%control` 을 손으로 켭니다.
- 긴 형식에서 `OF` 뒤에는 root entity 의 전체 이름을, `ENTITY` 뒤에는 BDEF 의 별칭을 씁니다.
- 원문의 동적 형식 부분은 루트 생성·수정·삭제, create-by-association(`op-m-create_ba` 와 `sub_name`), 자식 수정·삭제까지 여섯 가지 작업을 한 테이블에 담습니다. 여기서는 두 가지만 남겼습니다.

## 관련 항목

- [[abapmodify_entity_short]]
- [[abapmodify_entities_long]]
- [[abapmodify_entities_operations_dyn]]
- [[abapcommit_entities]]
- [[abapeml_modify_examples_abexas]]
