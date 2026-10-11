---
title: RAP BO 작업 (개요)
summary: entity 동작 본문에 적는 작업의 갈래인 standard operation, association 작업, non-standard operation, determine action, draft action 을 한눈에 정리합니다.
keywords: RAP BO operations, RAP BO 작업, 표준 작업, 비표준 작업, 연관 관계 작업, determine action, draft action, 초안 액션, 액션, 함수, use, CRUD
---

## 설명

RAP BO 작업은 entity(엔터티) 동작 본문에 적는 "이 entity 로 할 수 있는 일"입니다. 프레임워크가 다 해 주는 것부터 개발자가 직접 구현하는 것까지 여러 갈래가 있습니다. 이 항목은 그 갈래를 나누어 보여 주고, 자세한 문법은 갈래마다 따로 설명합니다.

- [[abenbdl_standard_operations|standard operation]] : 생성, 읽기, 수정, 삭제입니다. 흔히 CRUD 작업이라고 부릅니다.
    - managed RAP BO 에서는 managed RAP BO provider(제공자)가 모두 처리합니다.
    - unmanaged RAP BO 에서는 behavior pool(동작 풀)의 [[abapmethods_for_rap_behv|handler method]] 에 구현해야 합니다.
- [[abenbdl_association|association 작업]] : association 경로를 따라 실행되어 연관 대상에 영향을 주는 작업입니다. association 용 standard operation(표준 작업)과 non-standard operation(비표준 작업)이 있습니다.
- [[abenbdl_nonstandard|non-standard operation]] : action 과 function 입니다. 개발자가 직접 구현합니다. 시나리오에 맞는 기능을 만들 수 있고, standard operation 여러 개로 이루어질 수도 있습니다.
- [[abenbdl_determine_action|determine action]] : BO consumer(사용자)가 [[abenbdl_validations|validation]] 과 [[abenbdl_determinations|determination]] 을 원할 때 실행시킬 수 있게 해 주는 action 입니다.
- [[abenbdl_draft_action|draft action]] : draft 테이블의 데이터를 다루는 action 입니다. managed 든 unmanaged 든 RAP 프레임워크가 모두 처리합니다.
- [[abenbdl_operations_additions|작업 추가 구문]] : 여러 갈래의 작업에 선택으로 붙일 수 있는 추가 구문입니다.

## 예제

동작 본문 한 곳에 갈래별 작업을 하나씩 적어 본 모습입니다.

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
  field ( readonly ) TravelID, LastChangedAt;

  // standard operation
  create;
  update;
  delete;

  // association 작업
  association _Booking { create; with draft; }

  // non-standard operation: action 과 function
  action acceptTravel result [1] $self;
  function getDetails result [1] $self;

  // determine action: validation 을 원할 때 실행
  validation validateDates on save { create; field BeginDate, EndDate; }
  determine action checkDates { validation validateDates; }

  // draft action
  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare;
}

// child entity Booking 의 behavior definition 은 줄였다
```

## 알아두기

- projection BDEF 에서는 base BDEF(기반 BDEF) 의 작업을 키워드 `use` 로 다시 씁니다. [[abenbdl_use_projection]] 을 참고하세요.
- projection 계층에 action 과 function 을 새로 만들 수도 있습니다. [[abenbdl_nonstandard_projection]] 을 참고하세요.
- RAP BO interface 에서도 [[abenbdl_use_projection|use]] 로 작업을 다시 씁니다.

## 관련 항목

- [[abenbdl_standard_operations]]
- [[abenbdl_association]]
- [[abenbdl_nonstandard]]
- [[abenbdl_determine_action]]
- [[abenbdl_draft_action]]
- [[abenbdl_operations_additions]]
- [[abenbdl_use_projection]]
