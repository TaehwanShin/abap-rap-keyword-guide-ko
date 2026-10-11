---
title: 종속 선언 줄여 쓰기 (dependent by 짧은 문법)
summary: lock, authorization, etag, changedocuments 의 dependent by 선언을 괄호로 묶어 한 줄로 쓰는 문법입니다.
keywords: dependent by, lock dependent, authorization dependent, etag dependent, changedocuments dependent, 짧은 문법, syntax short form, 줄여 쓰기, 종속 선언
---

## 문법

```syntax
([lock][, authorization][, etag] [, changedocuments]) dependent by _Assoc
```

## 설명

child entity(자식 엔터티)에는 "부모를 따른다"는 선언이 여러 줄 붙곤 합니다. 아래 네 문을 괄호 하나로 묶어 한 줄로 쓸 수 있습니다.

- `lock dependent by _Assoc`
- `authorization dependent by _Assoc`
- `etag dependent by _Assoc`
- `changedocuments dependent by _Assoc`

조건이 하나 있습니다. 묶어 적는 것들의 마스터(authorization master, lock master, etag master, change documents 마스터)가 **같은 entity(엔터티) 하나에** 정의되어 있고, 그 entity 가 association `_Assoc` 으로 닿아야 합니다. 원문 설명은 네 마스터를 모두 들지만, 원문 예제는 change documents 마스터 없이 세 가지만 묶습니다.

괄호 안의 `lock`, `authorization`, `etag`, `changedocuments` 는 하나하나가 선택입니다. 다만 적어도 하나는 적어야 합니다.

## 예제

루트 `Travel` 이 lock master, authorization master, etag master 를 모두 맡습니다. 그래서 자식 `Booking` 은 세 가지 종속 선언을 한 줄로 줄여 쓸 수 있습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
etag master LastChangedAt
{
  create;
  update;
  delete;

  field ( readonly ) TravelID, LastChangedAt;
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
( lock, authorization, etag ) dependent by _Travel
{
  update;
  delete;

  field ( readonly ) TravelID, BookingID;
  association _Travel { }
}
```

줄여 쓰지 않으면 `Booking` 쪽은 아래 세 줄이 됩니다. 뜻은 똑같습니다.

```bdl
lock dependent by _Travel
authorization dependent by _Travel
etag dependent by _Travel
```

## 알아두기

- 원문 예제에는 `( lock, etag, authorization )` 처럼 문법 틀과 다른 순서로 적은 것도 있습니다.

## 관련 항목

- [[abenbdl_locking]]
- [[abenbdl_authorization]]
- [[abenbdl_etag]]
- [[abenbdl_change_documents]]
