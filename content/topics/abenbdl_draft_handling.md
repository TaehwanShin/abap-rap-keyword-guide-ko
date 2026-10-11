---
title: draft 처리 켜기 (DraftHandling)
summary: BDEF 머리말에 with draft 나 with collaborative draft 를 적어 RAP BO 전체에 draft 처리를 켜는 방법과, 함께 적어야 하는 요소를 설명합니다.
keywords: draft, draft handling, 초안, 초안 처리, with draft, with collaborative draft, draft table, total etag, draft action, use draft, 초안 테이블, 공동 작업 초안
---

## 문법

```syntax
...
with draft;
 | with collaborative draft;
 ...
```

## 설명

draft 처리는 `with draft` 나 `with collaborative draft` 가운데 하나로 켭니다. 이 구문은 BDEF 머리말에 적습니다. RAP BO **전체**에 draft 를 켜기 때문입니다. BO 안의 entity(엔터티) 몇 개에만 draft 를 켤 수는 없습니다.

draft 처리는 어떤 경우든 RAP 트랜잭션 엔진이 모두 맡습니다. draft 데이터를 draft 테이블에 어떻게 쓰는지는 개발자가 신경 쓸 일이 아닙니다.

| 구문 | 내용 |
| --- | --- |
| `with draft` | [[abenbdl_with_draft]] |
| `with collaborative draft` | [[abenbdl_with_coll_draft]] |

### 쓸 수 있는 곳

- managed RAP BO
- unmanaged RAP BO
- projection BDEF 와 interface BDEF 에서는 `use draft` 나 `use collaborative draft` 로 base BO(기반 BO) 의 draft 처리를 다시 씁니다. [[abenbdl_use_projection]] 을 보세요.

### 함께 적는 요소

draft 를 켜면 BDEF 의 다른 자리에도 딸린 요소가 생깁니다.

| 요소 | 내용 |
| --- | --- |
| [[abenbdl_draft_table]] | draft 인스턴스를 담는 테이블입니다. `draft table DraftTableName` 으로 적습니다. draft 를 켠 BO 에는 꼭 있어야 합니다. 뒤에 `query` 를 붙여 draft 조회 뷰([[abenbdl_draft_query_view]])를 달 수 있습니다. |
| `total etag` ([[abenbdl_etag]]) | active(활성) 버전과 draft 버전 사이에 바뀐 것이 있는지 알려 주는 필드입니다. draft 를 켠 BO 에는 꼭 있어야 합니다. |
| draft action ([[abenbdl_draft_action]]) | draft 를 켠 BO 에서만 쓸 수 있는 action 입니다. draft 테이블의 데이터를 다룹니다. draft 를 켜면 적지 않아도 생기지만, 드러내어 선언할 수도 있습니다. 다만 [[abenbdl_strict|strict mode]] 는 저절로 생기는 작업도 드러내어 선언했는지 확인합니다. draft action 항목의 원문도 draft 를 켠 managed·unmanaged RAP BO 에서는 draft action 이 필수라고 적습니다. 그러니 strict mode 에서는 draft action 을 직접 선언합니다. |
| draft 를 지원하는 association ([[abenbdl_association]]) | active 인스턴스에서 따라가면 active 데이터를, draft 인스턴스에서 따라가면 draft 데이터를 가져옵니다. association 에 `with draft` 를 붙여 만듭니다. 원문은 draft 를 켠 RAP BO 에서는 association 이 draft 를 지원해야 한다고 적습니다. 다만 [[abenbdl_pragma]] 의 원문 예제에서는 draft 를 지원하지 않는 association 에 문법 오류가 아니라 문법 경고가 나고, 그 경고를 `##DRAFT_ASSOC` 로 숨깁니다. |

## 예제

draft 를 켠 managed BDEF 입니다. draft 테이블, `total etag`, draft action, `with draft` 를 붙인 association 이 모두 들어 있습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( instance )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt;

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare;

  association _Booking { create; with draft; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
draft table zbooking_d
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly : update ) TravelID, BookingID;

  association _Travel { with draft; }
}
```

## 관련 항목

- [[abenbdl_with_draft]] : 한 사용자만 draft 를 고치는 exclusive draft
- [[abenbdl_with_coll_draft]] : 여러 사용자가 같은 draft 를 함께 고치는 collaborative draft
- [[abenbdl_draft_table]]
- [[abenbdl_draft_query_view]]
- [[abenbdl_etag]]
- [[abenbdl_draft_action]]
- [[abenbdl_association]]
- [[abenbdl_use_projection]]
