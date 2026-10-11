---
title: behavior definition (RAP Behavior Definition, BDEF)
summary: behavior definition(BDEF)가 무엇이고, 머리말·entity behavior definition·authorization context 로 어떻게 짜이는지 설명합니다.
keywords: behavior definition, BDEF, 동작 정의, BDEF header, 머리말, entity behavior definition, 엔터티 동작 정의, characteristics, body, authorization context, 권한 컨텍스트, 구조
---

## 설명

behavior definition(동작 정의, 줄여서 BDEF)는 RAP business object(비즈니스 객체)의 **트랜잭션 동작**을 적어 두는 ABAP 저장소 객체입니다. 트랜잭션 동작이란 RAP BO consumer(사용자)가 이 RAP BO 를 어떻게 쓸 수 있고 어디까지 쓸 수 있는지를 말합니다.

BDEF 는 늘 CDS 데이터 모델 위에 섭니다. 데이터 모델에는 root entity(루트 엔터티)가 적어도 하나 있어야 하고, BDEF 는 그 root entity 를 가리킵니다. root entity 하나에 BDEF 는 많아야 하나입니다.

BDEF 는 다음 조각으로 이루어집니다.

| 조각 | 내용 |
| --- | --- |
| 머리말 | RAP BO 전체에 걸리는 설정. 구현 타입, strict mode, draft 사용 여부 같은 것 |
| entity(엔터티) behavior definition | entity 하나의 동작. 적어도 하나는 있어야 합니다. |
| authorization context | 권한 객체를 묶어 둔 것. 없어도 되고 여러 개 있어도 됩니다. |

entity behavior definition 은 다시 두 조각으로 나뉩니다.

- **entity 동작 특성** : persistent table, 잠금, 권한, ETag 같은 entity 의 일반 성질
- **entity 동작 본문** : 중괄호 안에 적는 작업, 필드 성질, validation, determination 같은 것

## 예제

BDEF 의 각 조각이 어디에 놓이는지 주석으로 표시했습니다.

```bdl
// ── 머리말 ──
managed implementation in class zbp_r_travel unique;
strict ( 2 );

// ── entity behavior definition (루트) ──
define behavior for ZR_Travel alias Travel
// entity 동작 특성
persistent table ztravel
lock master
authorization master ( instance )
{
  // entity 동작 본문
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  association _Booking { create; }
}

// ── entity behavior definition (자식) ──
define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly : update ) TravelID, BookingID;
  association _Travel;
}
```

## 관련 항목

BDEF 의 조각마다 따로 항목이 있습니다.

- [[abenbdl_bdef_header]] : 머리말에 올 수 있는 설정
- [[abenbdl_define_beh]] : `define behavior for` 로 시작하는 entity behavior definition
- [[abenbdl_character]] : entity 동작 특성
- [[abenbdl_body]] : entity 동작 본문
- [[abenbdl_authorization_context]] : authorization context

BDL 문법 자체를 다루는 하위 갈래는 다음과 같습니다.

- [[abenbdl_syntax]] : 일반 문법 규칙, 프라그마, 언어 요소 표
- [[abenbdl]] : 구현 타입별 BDL 문
