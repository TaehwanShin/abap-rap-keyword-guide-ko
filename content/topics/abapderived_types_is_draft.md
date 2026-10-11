---
title: %is_draft (draft 표시)
summary: RAP BO 인스턴스가 draft 인스턴스인지 active 인스턴스인지 나타내는 구성요소로, %tky 안에 들어 있습니다.
keywords: %is_draft, draft indicator, 초안 표시, 초안 인스턴스, 활성 인스턴스, ABP_BEHV_FLAG, %tky, if_abap_behv=>mk-on, with draft
---

## 설명

`%is_draft` 는 BDEF derived type(BDEF 파생 타입)의 구성요소이며 **draft 표시**입니다. 인스턴스가 [[abenbdl_with_draft|draft]] 인스턴스인지 active(활성) 인스턴스인지 나타냅니다.

draft 인스턴스를 만들려면 `MODIFY` 요청에서 `%is_draft` 를 **직접** 켜야 합니다.

### 타입

`ABP_BEHV_FLAG`

### 쓰이는 곳

`MODIFY` 요청에서 `%is_draft` 는 두 가지로 적을 수 있습니다.

- 바로 적기 : `%is_draft = if_abap_behv=>mk-on`
- 구성요소 묶음 [[abapderived_types_tky|%tky]] 를 거쳐 적기 : `%tky-%is_draft = ...`. `%is_draft` 가 `%tky` 의 구성요소이기 때문입니다.

## 예제

draft 를 켠 여행 BO 에 draft 인스턴스 두 건을 만듭니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #(
    ( %cid       = 'cid1'
      %is_draft  = if_abap_behv=>mk-on    " draft 로 만든다
      travelid   = '00000004'
      agencyid   = '070001'
      customerid = '000010' )
    ( %cid       = 'cid2'
      %is_draft  = if_abap_behv=>mk-on
      travelid   = '00000005'
      agencyid   = '070002'
      customerid = '000020' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

## 알아두기

- `%is_draft` 를 켜지 않으면 draft 인스턴스가 만들어지지 않습니다. draft 를 만들 때는 빠뜨리지 않도록 합니다.
- `%tky` 안에 `%is_draft` 가 들어 있으므로, `%tky` 로 키와 draft 표시를 함께 다룰 수 있습니다.

## 관련 항목

- [[abapderived_types_tky]]
- [[abapderived_types_keys_identifiers]]
- [[abenbdl_with_draft]]
- [[abapmodify_entity_entities]]
- [[abenderived_types_isdraft_abexa]]
