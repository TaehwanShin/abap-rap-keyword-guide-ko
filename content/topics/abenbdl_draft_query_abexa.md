---
title: 예제 - DCL 접근 제어가 걸린 RAP BO (draft 조회 뷰)
summary: active 데이터와 draft 데이터에 각각 DCL 읽기 제한을 걸고, EML 로 읽을 때와 ABAP SQL 로 읽을 때 결과가 어떻게 다른지 보여 주는 예제입니다.
keywords: draft query view, 초안 조회 뷰, DCL, access control, 접근 제어, 예제, query, draft table, READ ENTITIES, SELECT, %is_draft, Discard, 읽기 제한
---

## 설명

이 예제는 RAP BO 의 **읽기 접근 제어**가 active(활성) 데이터와 draft 데이터에서 각각 어떻게 걸리고 어떻게 적용되는지 보여 줍니다. 접근 제어는 CDS DCL(데이터 제어 언어)로 씁니다.

짜임새는 이렇습니다.

- 루트 뷰 entity(엔터티)에 DCL 접근 조건이 하나 붙어 있습니다. **active 데이터**의 읽기를 제한합니다.
- draft 테이블의 모든 필드를 고르는 CDS 뷰 entity 가 따로 있습니다. 이것이 draft 조회 뷰입니다. 여기에 DCL 이 하나 더 붙어 있습니다. **draft 데이터**의 읽기를 제한합니다.
- BDEF 는 managed 이고 draft 를 켰습니다. `draft table ... query ...` 로 draft 조회 뷰를 답니다.

아래 코드는 원문의 데모 객체를 여행 모델로 옮겨 줄인 것입니다.

## 예제

draft 조회 뷰입니다. draft 테이블 `ztravel_d` 의 필드를 관리용 필드까지 모두 고릅니다.

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

BDEF 에서 draft 테이블 뒤에 `query` 로 답니다. entity behavior definition(동작 정의)의 앞부분만 옮겼습니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d query ZR_TravelDraftQuery   // draft 조회 뷰를 단다
lock master
total etag LastChangedAt
authorization master ( none )
{
  // standard operation, 필드 성질, draft action 은 줄임
}
```

draft 인스턴스를 만들고, 같은 데이터를 EML 과 ABAP SQL 로 한 번씩 읽습니다. active 인스턴스도 `%is_draft` 만 빼고 같은 방식으로 만들고 읽습니다.

```abap
" draft 인스턴스 네 개를 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid )
    WITH VALUE #(
      ( %cid = 'D1' %is_draft = if_abap_behv=>mk-on travelid = '00000011' agencyid = '070001' )
      ( %cid = 'D2' %is_draft = if_abap_behv=>mk-on travelid = '00000012' agencyid = '070001' )
      ( %cid = 'D3' %is_draft = if_abap_behv=>mk-on travelid = '00000013' agencyid = '070002' )
      ( %cid = 'D4' %is_draft = if_abap_behv=>mk-on travelid = '00000014' agencyid = '070003' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

" EML 로 읽기: draft 조회 뷰의 DCL 조건이 적용된다
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #(
      ( travelid = '00000011' %is_draft = if_abap_behv=>mk-on )
      ( travelid = '00000012' %is_draft = if_abap_behv=>mk-on )
      ( travelid = '00000013' %is_draft = if_abap_behv=>mk-on )
      ( travelid = '00000014' %is_draft = if_abap_behv=>mk-on ) )
  RESULT FINAL(lt_draft_eml)
  FAILED FINAL(ls_read_failed).

" ABAP SQL 로 읽기: draft 테이블의 모든 줄이 나온다
SELECT * FROM ztravel_d INTO TABLE @DATA(lt_draft_sql).

" 끝으로 draft action Discard 로 draft 테이블을 비운다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE discard FROM VALUE #( ( %key-travelid = '00000011' ) ( %key-travelid = '00000012' )
                                  ( %key-travelid = '00000013' ) ( %key-travelid = '00000014' ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

## 알아두기

원문 예제는 다음 차례로 진행하고, 네 가지 읽기 결과를 나란히 화면에 냅니다.

1. EML `MODIFY ENTITIES ... CREATE` 로 active 인스턴스 네 개를 만들고 저장합니다.
2. active 인스턴스를 EML `READ ENTITIES` 로 읽고, 이어서 ABAP SQL `SELECT` 로 읽습니다.
3. EML 로 draft 인스턴스 네 개를 만들고 저장합니다.
4. draft 인스턴스를 EML `READ ENTITIES` 로 읽고, 이어서 ABAP SQL `SELECT` 로 읽습니다.
5. draft action `Discard` 로 draft 테이블을 비웁니다.

결과에서 눈여겨볼 점은 다음과 같습니다.

- **active 데이터, EML 읽기** : 루트 뷰 entity 에 붙은 DCL 접근 조건이 적용됩니다. 조건에 맞지 않는 줄은 걸러져 일부만 나옵니다.
- **active 데이터, SQL 읽기** : 데이터베이스에 저장된 인스턴스가 모두 나옵니다.
- **draft 데이터, EML 읽기** : draft 조회 뷰에 붙은 DCL 접근 조건이 적용됩니다. 여기서도 일부가 걸러집니다.
- **draft 데이터, SQL 읽기** : draft 테이블에 저장된 인스턴스가 모두 나옵니다.

곧 DCL 접근 제어는 RAP 프레임워크(EML)를 거쳐 읽을 때 적용되고, 테이블을 ABAP SQL 로 직접 읽을 때는 적용되지 않습니다. draft 데이터에 읽기 제한을 걸려면 draft 조회 뷰가 따로 있어야 한다는 점도 함께 보여 줍니다.

원문의 객체 이름은 루트 뷰 entity 와 BDEF 가 `DEMO_RAP_MANAGED_DRAFT_QUERY`, draft 조회 뷰가 `DEMO_RAP_DRAFT_QUERY_VIEW`, 실행 클래스가 `CL_DEMO_RAP_DRAFT_QUERY_VIEW` 입니다. 두 DCL 소스(`DEMO_RAP_DRAFT_QUERY`, `DEMO_RAP_DCL_DRAFT`)의 코드는 원문에 실려 있지 않습니다.

## 관련 항목

- [[abenbdl_draft_query_view]]
- [[abenbdl_draft_table]]
- [[abenbdl_draft_action]]
- [[abapread_entity_entities]]
- [[abapmodify_entity_entities_op]]
