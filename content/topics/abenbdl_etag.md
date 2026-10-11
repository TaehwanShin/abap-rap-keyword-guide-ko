---
title: ETag 동시 수정 확인 (etag master, etag dependent, total etag)
summary: 여러 사람이 같은 데이터를 고칠 때 남의 변경을 덮어쓰지 않도록, 변경 여부를 비교할 필드를 ETag 로 지정하는 문법입니다.
keywords: etag, etag master, etag dependent by, total etag, ETag, 낙관적 동시성 제어, optimistic concurrency control, 동시 수정 확인, use etag, localInstanceLastChangedAt, lastChangedAt
---

## 문법

active(활성) 데이터용 ETag

```syntax
  etag master MasterField
| etag dependent by _Assoc
```

draft 데이터용 ETag

```syntax
total etag TotalEtagField
```

## 설명

ETag 는 **낙관적 동시성 제어**에 쓰는 필드입니다. 데이터를 읽어 둔 동안 잠가 두는 대신, 변경 요청이 올 때마다 "내가 읽은 뒤로 누가 바꾸지 않았는가"를 확인하는 방식입니다.

ETag 로 지정한 필드는 인스턴스의 현재 상태를 나타냅니다. 인스턴스가 바뀔 때마다 이 필드 값도 바뀝니다. RAP BO consumer(사용자)가 변경을 요청하면, 요청에 실려 온 ETag 값과 지금 값을 비교합니다. 두 값이 같을 때만 변경을 받아들입니다. 그래서 여러 사람이 같은 데이터를 다룰 때 뜻하지 않게 남의 변경을 덮어쓰는 일을 막습니다.

ETag 는 두 종류입니다.

| 종류 | 대상 | 꼭 써야 하는가 |
| --- | --- | --- |
| `etag master` / `etag dependent` | active(영구) 데이터 | 선택입니다. entity(엔터티)마다 entity 동작 특성에 따로 적습니다. |
| `total etag` | draft 와 active 데이터 사이의 전환 | draft 를 쓰는 BO 에서만 쓸 수 있고, 그런 BO 에서는 필수입니다. |

managed RAP BO 에서는 아래 두 조건이 맞으면 managed RAP BO provider(제공자)가 ETag 처리를 맡습니다. behavior pool(동작 풀)에 따로 구현할 것이 없습니다.

- 인스턴스가 바뀔 때마다 ETag 필드가 빠짐없이 갱신됩니다.
- 그 ETag 필드를 쓰는 모든 entity 에서 etag master 필드를 읽을 수 있습니다.

unmanaged RAP BO 에서는 ETag 필드 처리를 behavior pool 에 직접 구현합니다.

### etag master MasterField

entity 를 etag master entity 로 만들고, 변경 여부를 기록할 필드 `MasterField` 를 정합니다.

- etag master 필드는 선택입니다.
- entity 하나만이 아니라 여러 entity 가 etag master 가 될 수 있습니다. composition 트리의 어느 단계에 있는 entity 든 됩니다.
- `MasterField` 의 데이터 타입은 `string` 으로 바꿀 수 있는 타입이면 됩니다.
- managed RAP BO 에서는 아래 두 조건이 맞으면 필드 값이 자동으로 채워집니다.
    - CDS 에서 필드에 `@Semantics.systemDateTime.localInstanceLastChangedAt: true` 를 붙였습니다.
    - 데이터 타입이 `utclong`, `TIMESTAMP`, `TIMESTAMPL` 가운데 하나입니다.
- unmanaged RAP BO 에서는 개발자가 etag master 필드에 값을 채워야 합니다.

### etag dependent by _Assoc

entity 를 ETag 종속 entity 로 만듭니다. 자기 ETag 필드가 없고, association `_Assoc` 으로 닿는 etag master entity 의 ETag 필드를 씁니다.

- etag master 로 가는 association 은 entity 동작 본문에 `association _Assoc { }` 로 적어 읽을 수 있게 해 두어야 합니다. CDS 데이터 모델에도 이 association 이 있어야 합니다.
- etag master entity 는 composition 트리에서 종속 entity 보다 위에 있어야 합니다.

### total etag TotalEtagField

draft 를 쓰는 BO 에서, draft 를 영구 데이터로 넘길 때 동시 수정을 확인할 필드를 정합니다.

사용자가 draft 를 편집하다 자리를 비우면 편집 세션의 배타 잠금이 풀립니다. 그 사이에 다른 사람이 active 데이터를 바꿨을 수 있습니다. active 데이터가 바뀔 때마다 total ETag 필드가 갱신됩니다. 사용자가 돌아와 draft 를 이어서 편집하려 하면 시스템이 active 데이터와 draft 의 total ETag 를 비교합니다. 두 값이 같을 때만 draft 를 이어 갈 수 있습니다.

- draft 를 쓰는 RAP BO 에서는 반드시 있어야 합니다.
- `lock master` 바로 다음에 적습니다.
- lock master entity 의 entity 동작 특성에 한 번 적으면, 그 BO 의 모든 entity 에 적용됩니다.
- `TotalEtagField` 의 데이터 타입은 `string` 으로 바꿀 수 있는 타입이어야 하고, 길이는 40자를 넘을 수 없습니다.
- managed RAP BO 에서는 아래 두 조건이 맞으면 필드 값이 자동으로 채워집니다.
    - CDS 에서 필드에 `@Semantics.systemDateTime.lastChangedAt: true` 를 붙였습니다.
    - 데이터 타입이 `utclong`, `TIMESTAMP`, `TIMESTAMPL` 가운데 하나입니다.
- unmanaged RAP BO 에서는 개발자가 total ETag 필드에 값을 채워야 합니다.

## 예제

draft 를 쓰는 managed BO 입니다. 루트 `Travel` 은 `LastChangedAt` 을 total ETag 로, `LocalLastChangedAt` 을 etag master 필드로 씁니다. 자식 `Booking` 은 부모의 ETag 를 따라갑니다.

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
etag master LocalLastChangedAt
{
  create;
  update;
  delete;

  field ( readonly ) TravelID, LastChangedAt, LocalLastChangedAt;

  association _Booking { create; with draft; }

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
etag dependent by _Travel
{
  update;
  delete;

  field ( readonly ) TravelID, BookingID;

  // etag master 로 가는 association 을 읽을 수 있게 둔다
  association _Travel { with draft; }
}
```

managed provider 가 값을 알아서 채우게 하려면 CDS 뷰에서 두 필드에 어노테이션을 붙입니다.

```cds
define root view entity ZR_Travel
  as select from ztravel
  composition [0..*] of ZR_Booking as _Booking
{
  key travel_id             as TravelID,
      status                as Status,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at       as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,
      _Booking
}
```

## 알아두기

- draft 를 쓰는 BO 에서는 total ETag 와 `etag master` / `etag dependent` 가 서로 보완합니다. 둘을 함께 쓰기를 권장합니다.
- total ETag 필드와 etag master 필드는 서로 다른 필드여도 되고, 같은 필드 하나를 함께 써도 됩니다.
- RAP 프레임워크가 ETag 와 total ETag 용으로 쓸 수 있는 재사용 데이터 엘리먼트를 제공합니다.
- managed provider 가 ETag 필드를 맡는다면, 그 필드를 `field ( readonly )` 로 막아 두기를 권장합니다. [[abenbdl_field_char]] 를 참고하세요.
- unmanaged RAP BO 에서는 ETag 필드와 total ETag 필드를 save sequence(저장 순서) 안에서 처리하기를 권장합니다.
- projection BDEF 와 interface BDEF 에서는 `use etag` 로 이 기능을 다시 씁니다. [[abenbdl_use_projection]] 를 참고하세요.
- lock dependent, authorization dependent, ETag 종속을 한 줄로 줄여 쓸 수 있습니다. `( lock, authorization, etag ) dependent by _Assoc` 형태이며 [[abenbdl_short_syntax]] 에서 설명합니다.

## 관련 항목

- [[abenbdl_locking]]
- [[abenbdl_with_draft]]
- [[abenbdl_short_syntax]]
- [[abenbdl_field_char]]
- [[abenbdl_use_projection]]
