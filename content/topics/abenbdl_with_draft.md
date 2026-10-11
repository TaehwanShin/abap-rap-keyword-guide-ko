---
title: draft 켜기 (with draft)
summary: BDEF 머리말에 with draft; 를 적어 RAP BO 전체에 exclusive draft 처리를 켭니다.
keywords: with draft, draft, 초안, 단독 초안, exclusive draft, draft handling, 초안 처리, draft-enabled
---

## 문법

```syntax
...
with draft;
 ...
```

## 설명

`with draft` 는 RAP BO 에 draft 처리를 켭니다. 이렇게 켠 draft 는 **exclusive draft**(exclusive draft)입니다.

BDEF 머리말에 적습니다. RAP BO 전체에 draft 를 켜기 때문입니다. BO 안의 entity(엔터티) 몇 개에만 draft 를 켤 수는 없습니다.

draft 처리는 어떤 경우든 RAP 트랜잭션 엔진이 모두 맡습니다. draft 데이터를 draft 테이블에 어떻게 쓰는지는 개발자가 신경 쓸 일이 아닙니다.

## 예제

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
}
```

## 알아두기

- draft 를 켜면 draft 테이블, `total etag` 같은 요소도 함께 적어야 합니다. 무엇이 필요한지는 [[abenbdl_draft_handling]] 에 모아 두었습니다.

## 관련 항목

- [[abenbdl_draft_handling]]
- [[abenbdl_with_coll_draft]]
- [[abenbdl_draft_action2_abexa]]
- [[abenbdl_draft_action1_abexa]]
