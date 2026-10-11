---
title: draft 테이블 (draft table)
summary: draft 데이터를 담는 DDIC 데이터베이스 테이블을 정하는 구문입니다. draft 를 켠 managed·unmanaged RAP BO 에는 꼭 있어야 합니다.
keywords: draft table, 초안 테이블, query, draft query view, SYCH_BDL_DRAFT_ADMIN_INC, %admin, draft admin include, DRAFTUUID, late numbering, with draft, Discard, ABAP SQL
---

## 문법

```syntax
...
draft table DraftTableName [query DraftQueryView]
...
```

## 설명

draft 테이블은 draft 데이터를 담는 DDIC 데이터베이스 테이블입니다. 바탕이 되는 CDS entity(엔터티)의 필드를 그대로 비추어야 합니다.

### 테이블이 지켜야 할 것

- CDS entity 의 필드마다 테이블에도 필드가 하나씩 있어야 합니다. 필드 차례는 상관없습니다.
- 첫 필드는 데이터 타입이 `CLNT` 인 클라이언트 필드여야 합니다.
- 필드 이름은 CDS entity 의 필드 이름과 같아야 합니다. CDS entity 에서 별칭을 붙였다면 그 별칭을 써야 합니다.
- 데이터 타입과 필드 길이가 정확히 같아야 합니다.
- RAP 트랜잭션 엔진이 draft 를 다루는 데 쓰는 기술 정보가 더 들어 있어야 합니다. 이 정보는 draft 관리 인클루드로 넣습니다. 미리 정의된 DDIC 인클루드 구조 `SYCH_BDL_DRAFT_ADMIN_INC` 가 그것입니다.

선택 구문 `query` 로 draft 조회 뷰 `DraftQueryView` 를 달 수 있습니다. draft 조회 뷰를 쓰면 DCL 로 draft 데이터의 읽기 접근을 제한할 수 있습니다. [[abenbdl_draft_query_view]] 를 보세요.

### 쓸 수 있는 곳

- 구현 타입이 `managed` 나 `unmanaged` 이고 draft 를 켠 RAP BO 에 씁니다. 이런 BO 에서는 꼭 적어야 합니다.
- projection BDEF 와 interface BDEF 는 draft 테이블을 저절로 물려받습니다. 따로 적지 않습니다. [[abenbdl_use_projection]] 을 보세요.

## 예제

`ZR_Travel` 의 draft 테이블입니다. 필드 이름과 타입을 CDS entity 에 맞추고, 끝에 draft 관리 인클루드를 넣습니다.

```cds
@EndUserText.label : '여행 draft 테이블'
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table ztravel_d {
  key client    : abap.clnt not null;
  key travelid  : abap.numc(8) not null;
  agencyid      : abap.numc(6);
  customerid    : abap.numc(6);
  begindate     : abap.dats;
  enddate       : abap.dats;
  @Semantics.amount.currencyCode : 'ztravel_d.currencycode'
  totalprice    : abap.curr(16,2);
  currencycode  : abap.cuky;
  status        : abap.char(1);
  lastchangedat : timestampl;
  "%admin"      : include sych_bdl_draft_admin_inc;
}
```

BDEF 에서는 entity 동작 특성 자리에 적습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt;

  draft action Activate optimized;
  draft action Discard;
  draft action Edit;
  draft action Resume;
  draft determine action Prepare;
}
```

### draft 테이블을 ABAP SQL 로 비우면 안 되는 까닭

아래 코드를 두 번 잇달아 돌린다고 합시다. draft 테이블을 ABAP SQL 로 비우고, 키가 `00000003` 인 draft 인스턴스를 EML 로 만들어 저장합니다.

```abap
" 잘못된 방법: draft 테이블을 ABAP SQL 로 비운다
DELETE FROM ztravel_d.

MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid )
    WITH VALUE #( ( %cid      = 'T3'
                    %is_draft = if_abap_behv=>mk-on
                    travelid  = '00000003' ) )
  REPORTED DATA(ls_reported)
  FAILED   DATA(ls_failed)
  MAPPED   DATA(ls_mapped).

COMMIT ENTITIES.
```

첫 번째에는 draft 가 테이블에 들어갑니다. 두 번째에는 draft 만들기가 실패하고 draft 테이블은 빈 채로 남습니다. draft 에는 ABAP SQL 로 지울 수 없는 메타데이터가 딸려 있기 때문입니다. 테이블은 비웠어도 메타데이터가 남아 있어서 같은 키가 겹친 것으로 봅니다.

draft 는 RAP 프레임워크로 지워야 합니다. draft action `Discard` 나 EML 의 `DELETE` 를 쓰면 draft 테이블의 줄과 메타데이터가 함께 지워집니다. 그래서 같은 키로 draft 를 몇 번이고 다시 만들 수 있습니다.

```abap
" 올바른 방법: draft action Discard 로 지운다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE discard FROM VALUE #( ( %key-travelid = '00000003' ) )
  REPORTED ls_reported
  FAILED   ls_failed
  MAPPED   ls_mapped.

COMMIT ENTITIES.
```

## 알아두기

- draft 테이블은 BDEF 편집기의 빠른 수정(quick fix)으로 자동으로 만들 수 있습니다. BO 에 draft 처리를 켜면 이 빠른 수정이 나옵니다.
- draft 를 켠 RAP BO 에 [[abenbdl_late_numbering|late numbering]] 을 쓰면, draft 테이블에 데이터 타입이 `raw(16)` 인 키 필드 `DRAFTUUID` 가 하나 더 있어야 합니다.
- draft 테이블은 보통의 DDIC 데이터베이스 테이블이라 ABAP SQL 이나 AMDP 로도 접근할 수 있습니다. 기술적으로는 되지만 권하지 않습니다. EML 처럼 RAP 프레임워크를 거쳐서만 접근해야 draft 메타데이터가 함께 갱신됩니다.

## 관련 항목

- [[abenbdl_draft_query_view]]
- [[abenbdl_draft_handling]]
- [[abenbdl_draft_action]]
- [[abenbdl_persistent_table]]
- [[abenbdl_late_numbering]]
- [[abenbdl_use_projection]]
- [[abapmodify_entity_entities_op]]
- [[abenbdl_character]]
