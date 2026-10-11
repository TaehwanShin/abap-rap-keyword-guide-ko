---
title: collaborative draft 켜기 (with collaborative draft)
summary: BDEF 머리말에 with collaborative draft; 를 적어, 여러 사용자가 같은 draft 인스턴스를 함께 고치는 collaborative draft 를 켭니다.
keywords: with collaborative draft, collaborative draft, 공동 작업 초안, 공동 작업 초안, draft action Share, Share, draft, 초안, cross-BO, draft scope
---

## 문법

```syntax
...
with collaborative draft;
 ...
```

## 설명

`with collaborative draft` 는 RAP BO 에 **collaborative draft** 를 켭니다. 여러 사용자가 같은 draft 인스턴스를 함께 고칠 수 있게 됩니다. BDEF 머리말에 적습니다.

collaborative draft 를 쓰려면 BDEF 에 [[abenbdl_draft_action|draft action]] `Share` 도 더해야 합니다.

draft 처리는 어떤 경우든 RAP 트랜잭션 엔진이 모두 맡습니다. draft 데이터를 draft 테이블에 어떻게 쓰는지는 개발자가 신경 쓸 일이 아닙니다.

## 예제

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with collaborative draft;

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
  draft action Share;      // collaborative draft 에 필요하다
  draft determine action Prepare;
}
```

## 알아두기

- collaborative draft 는 여러 BO 에 걸친 시나리오에서도 됩니다. 조건은 두 가지입니다. 두 BO 모두 collaborative draft 를 켰어야 하고, 그 시나리오가 [[abenbdl_dependent_draft_abexa|draft 범위(draft scope)]]를 온전히 지원해야 합니다.

## 관련 항목

- [[abenbdl_draft_handling]]
- [[abenbdl_with_draft]]
- [[abenbdl_draft_action]]
- [[abenbdl_dependent_draft_abexa]]
