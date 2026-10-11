---
title: recommendation function
summary: 사용자가 넣은 값과 지난 사용 이력을 바탕으로 SAP Fiori 화면의 입력 칸에 recommendation 값을 띄워 주는 function 을 선언합니다.
keywords: recommendation function, 추천 함수, RAP recommendations, 추천 값, 입력 도움, field recommendations, use recommendations, side effects, 부수 효과
---

## 문법

```syntax
recommendation function MyRecommendationFunction;
```

## 설명

recommendation function 은 **RAP recommendation 값**을 계산합니다. recommendation 값은 사용자가 넣은 값과 지난 사용 이력을 바탕으로 SAP Fiori 화면에서 입력을 거들어 주는 값입니다.

계산 결과는 화면의 **recommendations 대상 필드**에 recommendation 값으로 보입니다. recommendations 대상 필드는 `field ( recommendations )` 로 정합니다([[abenbdl_field_char]]).

- 이름 `MyRecommendationFunction` 은 behavior definition(동작 정의)의 일반 이름 규칙([[abenbdl_general_syntax_rules]])을 따릅니다. 길이는 30자까지입니다.
- behavior definition 하나에 recommendation function 은 **하나만** 둘 수 있습니다.

### 언제 실행되나

recommendation function 은 side effects([[abenbdl_side_effects]])가 부릅니다. function 선언과 "언제 부를지"를 따로 적는 셈입니다. side effects 정의에 `recommendation function ... executed on ...` 을 넣어 실행 조건을 정합니다. function 이 실행될 때마다 recommendations 대상 필드를 다시 읽고 recommendation 값을 화면에 보여 줍니다.

### 쓸 수 있는 곳

- draft 를 쓰는 managed RAP BO
- draft 를 쓰는 unmanaged RAP BO

recommendation 값이 실제로 동작하려면 projection BO 에서 `use recommendations` 로 base BDEF(기반 BDEF) 의 recommendation 값과 관련 side effects 를 다시 써야 합니다. [[abenbdl_use_projection]] 을 봅니다.

## 예제

고객이 바뀌면 여행사 recommendation 값을 다시 계산합니다. `AgencyID` 가 recommendations 대상 필드입니다.

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

  // recommendation 값을 보여 줄 필드
  field ( recommendations ) AgencyID;

  recommendation function recommendAgency;

  side effects
  {
    // CustomerID 가 바뀌면 recommendation function 을 실행한다
    recommendation function recommendAgency executed on field CustomerID;
  }

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare;
}
```

projection 에서는 머리말에 다시 쓰겠다고 적습니다.

```bdl
projection;
strict ( 2 );
use draft;
use side effects;
use recommendations;

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;

  use action Edit;
  use action Activate;
  use action Discard;
  use action Resume;
  use action Prepare;
}
```

## 알아두기

- draft 를 쓰지 않는 RAP BO 에는 쓸 수 없습니다.
- recommendation function 은 side effects 로만 실행됩니다. projection 에서 `use recommendations` 만 쓰고 side effects 를 다시 쓰지 않으면 recommendation 값이 동작하지 않습니다.

## 관련 항목

- [[abenbdl_side_effects]]
- [[abenbdl_field_char]]
- [[abenbdl_use_projection]]
- [[abenbdl_bdef_projection_header]]
- [[abenbdl_general_syntax_rules]]
