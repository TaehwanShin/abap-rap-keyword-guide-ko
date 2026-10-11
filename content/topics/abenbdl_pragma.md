---
title: RAP BDL 프라그마 (pragma)
summary: BDEF 에서 ##코드 꼴의 프라그마를 적어 문법 검사 경고를 숨기는 방법과, 프라그마를 둘 수 있는 자리를 설명합니다.
keywords: pragma, 프라그마, ##, ##DRAFT_ASSOC, ##TYPE, 문법 경고 숨기기, syntax check warning, 경고 억제
---

## 문법

```syntax
... ##code...
```

## 설명

프라그마는 문법 검사 경고를 숨길 때 씁니다. 샵 두 개(`##`) 뒤에 프라그마 코드 `code` 를 붙여 적습니다. 어떤 경고를 숨길지는 코드가 정합니다.

- 대소문자를 가리지 않습니다.
- 안에 빈칸이 들어가면 안 됩니다.
- 프라그마는 **지금 문 하나**에만 듣습니다. 문은 다음 세미콜론(`;`)이나 중괄호(`{`, `}`)에서 끝납니다.

### 둘 수 있는 자리

- 줄 맨 앞. 앞에 빈칸은 몇 개든 괜찮습니다.
- 줄 맨 끝. 뒤에는 세미콜론(`;`)이나 중괄호(`{`, `}`)만 올 수 있습니다.
- 괄호 `( ... )` 의 앞, 뒤, 안에는 둘 수 없습니다.

원문은 "줄 맨 끝"이라고 적지만, 원문 예제에서는 아래 예제의 `association _Booking ##DRAFT_ASSOC { create; }` 처럼 프라그마 뒤 여는 중괄호 다음에도 같은 줄에 코드가 이어집니다.

허용된 자리라면 프라그마 여러 개를 빈칸으로 띄워 잇달아 적을 수 있습니다.

### 경고가 가리키는 곳에 붙인다

프라그마는 문 안에서도 **경고가 가리키는 바로 그 부분**에 붙여야 합니다.

예를 들어 draft 를 쓰는 BDEF 에서 association `_Booking` 이 draft 를 지원하지 않아 경고가 났다면, 경고는 `_Booking` 을 가리킵니다. 그러니 `##DRAFT_ASSOC` 는 `_Booking` 바로 뒤에 붙입니다. 줄 끝, 곧 중괄호 뒤에 붙이면 안 됩니다.

action 매개변수의 타입 때문에 난 경고도 마찬가지입니다. 경고가 가리키는 것은 action 이 아니라 타입이므로 `##TYPE` 은 타입 이름 바로 옆에 붙입니다.

## 예제

draft 를 쓰는 BDEF 에서 프라그마 두 가지로 경고를 숨깁니다.

- `##DRAFT_ASSOC` : association 이 draft 를 지원하지 않는다는 경고를 숨깁니다.
- `##TYPE` : action 매개변수로 쓴 abstract entity(엔터티) `ZA_TravelNote` 가 deep structure 인데 이 BDEF 에서는 flat parameter 로만 쓴다는 경고를 숨깁니다.

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

  // 경고가 가리키는 _Booking 바로 뒤에 붙인다
  association _Booking ##DRAFT_ASSOC { create; }

  // 경고가 가리키는 타입 이름 바로 뒤에 붙인다
  action addNote parameter ZA_TravelNote ##TYPE;

  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt;

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare;
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
draft table zbooking_d
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID, BookingID;
  association _Travel ##DRAFT_ASSOC;
}
```

## 알아두기

- 틀린 자리에 둔 프라그마는 아무 효과가 없습니다.
- 어떤 경고를 어떤 프라그마로 숨길 수 있는지는 그 경고 메시지의 긴 글(long text)에 적혀 있습니다.

## 관련 항목

- [[abenbdl_general_syntax_rules]]
- [[abenbdl_syntax]]
