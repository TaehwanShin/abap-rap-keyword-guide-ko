---
title: %cid_ref (내용 ID 참조)
summary: 같은 MODIFY 요청 안에서 %cid 로 이름 붙인 인스턴스를 가리키는 구성요소입니다.
keywords: %cid_ref, %cid, content ID, 내용 ID 참조, ABP_BEHV_CID, CREATE BY, UPDATE, DELETE, EXECUTE, 인스턴스 액션, 같은 요청 안 참조
---

## 설명

`%cid_ref` 는 BDEF derived type(BDEF 파생 타입)의 구성요소입니다. [[abapderived_types_cid|%cid]] 를 **직접 적어** 이름 붙인 RAP BO 인스턴스를 가리킬 때 씁니다. 값은 가리키려는 `%cid` 와 같은 문자열입니다.

가리키는 `%cid` 는 **같은 `MODIFY` 요청** 안에 있어야 합니다. 다른 요청에 있는 `%cid` 는 `%cid_ref` 로 가리킬 수 없습니다.

같은 요청에서 방금 만든 인스턴스를 가리킬 때는 다음을 지킵니다.

- 만드는 쪽에 `%cid` 를 적고, 가리키는 쪽 작업에 `%cid_ref` 를 적어야 합니다. 그러지 않으면 가리키는 쪽 작업이 새 인스턴스를 찾지 못합니다.
- 가리키는 쪽 작업에서 [[abapderived_types_key|%key]] 는 무시됩니다. `%cid_ref` 를 적었다면 `%key` 는 적지 않아도 됩니다.

### 타입

`ABP_BEHV_CID`

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `CREATE` (association 으로 만들기 작업에서만)
- `UPDATE`
- `DELETE`
- `ACTION IMPORT`, `ACTION RESULT` (instance action)

## 예제

여행 세 건을 만들고, 같은 요청 안에서 첫 번째 여행에는 예약을 달고, 두 번째 여행은 수정하고, 세 번째 여행은 지웁니다. 세 작업 모두 `%cid_ref` 로 대상을 가리킵니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #(
    ( %cid = 'cid1' travelid = '00000001' agencyid = '070001' customerid = '000010' )
    ( %cid = 'cid2' travelid = '00000002' agencyid = '070002' customerid = '000020' )
    ( %cid = 'cid3' travelid = '00000003' agencyid = '070003' customerid = '000030' ) )
  " cid1 여행에 예약을 단다
  CREATE BY \_booking
  FIELDS ( bookingid flightprice currencycode )
  WITH VALUE #(
    ( %cid_ref = 'cid1'
      %target  = VALUE #( ( %cid         = 'cid_booking1'
                            bookingid    = '0001'
                            flightprice  = '500.00'
                            currencycode = 'EUR' ) ) ) )
  " cid2 여행의 상태를 바꾼다
  UPDATE FIELDS ( status )
  WITH VALUE #( ( %cid_ref = 'cid2' status = 'A' ) )
  " cid3 여행을 지운다
  DELETE FROM VALUE #( ( %cid_ref = 'cid3' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

## 알아두기

- 작업이 `%cid_ref` 로 인스턴스를 가리키면, 같은 줄에 적은 키 값은 사실상 무시됩니다. 예를 들어 생성 뒤에 오는 수정 요청이 `%cid_ref` 로 대상을 가리킨다면, 그 수정 요청에 키 값을 함께 적었는지는 상관이 없습니다. 있지도 않은 키를 적어도 마찬가지입니다.
- RAP BO 계약에 따르면, 예를 들어 한 EML 요청 안에서 같은 인스턴스를 두 번 수정하는 것은 허용되지 않습니다. 그런데 지금 문법으로는, 같은 RAP 트랜잭션에서 생성 요청 뒤에 오는 작업이 앞서 만든 인스턴스를 `%cid_ref` 로도 가리키고 키 값만으로도 가리킬 수 있습니다. 문법이 이것을 막아 주지는 않습니다.
- `%cid_ref` 는 `AUTO FILL CID` 로 자동으로 만든 `%cid` 를 가리킬 수 없습니다. 가리킬 `%cid` 는 직접 적어야 합니다.

## 관련 항목

- [[abapderived_types_cid]]
- [[abapderived_types_keys_identifiers]]
- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_op]]
- [[abenbdl_action]]
- [[abenderived_types_cid_cidref_abexa]]
