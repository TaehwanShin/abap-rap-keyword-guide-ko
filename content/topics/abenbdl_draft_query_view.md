---
title: draft 조회 뷰 (query)
summary: draft table 뒤에 query 를 붙여 draft 테이블에 CDS 뷰를 달고, 그 뷰에 DCL 을 걸어 draft 데이터의 읽기 접근을 제한하는 구문입니다.
keywords: query, draft query view, 초안 조회 뷰, draft table, DCL, access control, 접근 제어, 읽기 제한, 초안 데이터 권한, C0 contract, extensibility
---

## 문법

```syntax
... query DraftQueryView
```

## 설명

draft 테이블에 draft 조회 뷰 `DraftQueryView` 를 정합니다. `query` 는 선택 구문이고, [[abenbdl_draft_table|draft table DraftTableName]] 바로 뒤에 적습니다.

draft 조회 뷰가 필요한 까닭은 이렇습니다. active(활성) 테이블에서 읽는 CDS 뷰 entity(엔터티)에 DCL(데이터 제어 언어)로 걸어 둔 접근 제한은 **draft 데이터에는 적용되지 않습니다**. draft 조회 뷰를 두고 거기에 DCL 을 걸면 draft 데이터에도 읽기 제한을 걸 수 있습니다.

draft 조회 뷰는 다음을 지켜야 합니다.

- CDS 뷰 entity 이거나 CDS DDIC 기반 뷰(폐기됨)여야 합니다.
- `FROM` 뒤의 데이터 소스가 그 draft 테이블이어야 합니다.
- draft 테이블의 필드를 관리용 필드까지 **모두** 담아야 합니다. 빠진 필드가 있으면 문법 경고가 납니다.

### 쓸 수 있는 곳

- 구현 타입이 `managed` 나 `unmanaged` 이고 draft 를 켠 RAP BO
- projection BDEF 와 interface BDEF 에서는 `query` 를 쓸 수 없습니다. base BDEF(기반 BDEF) 에 draft 조회 뷰가 있으면 저절로 물려받고, draft 데이터의 접근 제한도 그대로 다시 씁니다. [[abenbdl_use_projection]] 을 보세요.

## 예제

draft 테이블 `ztravel_d` 에 draft 조회 뷰 `ZR_TravelDraftQuery` 를 답니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d query ZR_TravelDraftQuery
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

draft 조회 뷰는 draft 테이블에서 관리용 필드까지 모두 고릅니다.

```cds
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Travel draft query view'
define view entity ZR_TravelDraftQuery
  as select from ztravel_d
{
  key travelid                      as TravelID,
      agencyid                      as AgencyID,
      customerid                    as CustomerID,
      begindate                     as BeginDate,
      enddate                       as EndDate,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      totalprice                    as TotalPrice,
      currencycode                  as CurrencyCode,
      status                        as Status,
      lastchangedat                 as LastChangedAt,
      // draft 관리용 필드
      draftentitycreationdatetime   as DraftEntityCreationDateTime,
      draftentitylastchangedatetime as DraftEntityLastChangeDateTime,
      draftadministrativedatauuid   as DraftAdministrativeDataUUID,
      draftentityoperationcode      as DraftEntityOperationCode,
      hasactiveentity               as HasActiveEntity,
      draftfieldchanges             as DraftFieldChanges
}
```

이 뷰에 DCL 을 걸어 draft 데이터의 읽기를 제한합니다. 여기서는 여행사 `070001` 의 draft 만 읽을 수 있게 했습니다.

```cds
@EndUserText.label: 'Read restriction for travel drafts'
@MappingRole: true
define role ZR_TravelDraftQuery {
  grant select on ZR_TravelDraftQuery
    where AgencyID = '070001';
}
```

이제 EML 로 draft 인스턴스를 읽으면 이 조건에 맞는 것만 돌아옵니다. draft 테이블을 ABAP SQL 로 직접 읽으면 조건과 상관없이 모든 줄이 나옵니다.

## 알아두기

- RAP extension(확장)성에서 RAP BO 를 extension 용 C0 계약으로 분류하려면 draft 조회 뷰가 먼저 있어야 합니다.

## 관련 항목

- [[abenbdl_draft_query_abexa]]
- [[abenbdl_draft_table]]
- [[abenbdl_draft_handling]]
- [[abenbdl_draft_action]]
- [[abenbdl_use_projection]]
- [[abapread_entity_entities]]
- [[abapmodify_entity_entities_op]]
