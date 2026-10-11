---
title: entity behavior definition (define behavior for)
summary: define behavior for 로 RAP BO 의 entity 하나하나에 동작을 정의하는 문법입니다. root entity 에는 꼭 있어야 하고, behavior definition 이 없는 entity 는 고칠 수 없습니다.
keywords: define behavior for, EntityBehaviorDefinition, 엔터티 동작 정의, alias, 별칭, external, implementation in class, root entity, child entity, 루트 엔터티, 자식 엔터티, 구성 트리
---

## 문법

```syntax
define behavior for RootEntity [alias AliasName] [ external ExternalName]
{[implementation in class ClassName [unique]]}
EntityBehaviorCharacteristics
{
  EntityBehaviorBody
}

[define behavior for ChildEntity1][, define behavior for ChildEntity2][, ...
]
```

원문의 문법 틀은 `unique` 를 선택 항목으로 적지만, [[abenbdl_in_class_unique]] 의 원문은 `unique` 가 필수라고 적습니다. 아래 예제도 `unique` 를 붙여 씁니다.

## 설명

RAP BO 의 동작을 정의합니다. BDEF 에는 `define behavior for` 로 시작하는 entity(엔터티) behavior definition(동작 정의)가 하나 이상 들어가고, 저마다 BO 의 서로 다른 노드를 가리킵니다.

- root entity(루트 엔터티) `RootEntity` 의 behavior definition 은 **꼭** 있어야 합니다.
- child entity(자식 엔터티)의 behavior definition 은 선택입니다.
- behavior definition 이 따로 없는 entity 에는 트랜잭션 성격이 없습니다. RAP 안에서 그 entity 는 고칠 수 없습니다.

root entity 로 쓸 수 있는 것은 구현 타입에 따라 다릅니다.

| 구현 타입 | root entity 가 될 수 있는 것 |
| --- | --- |
| managed RAP BO | CDS 뷰 entity, CDS DDIC 기반 뷰(폐기됨) |
| unmanaged RAP BO | CDS 뷰 entity, CDS custom entity(사용자 정의 엔터티), CDS DDIC 기반 뷰(폐기됨) |

CDS custom entity 는 RAP unmanaged 조회의 데이터 모델 바탕으로 쓰입니다.

### 구성 요소

| 구문 | 하는 일 |
| --- | --- |
| `alias AliasName` | entity 에 별칭을 붙입니다. 별칭은 ABAP Dictionary 전체에서 하나뿐일 필요가 없어서 entity 이름보다 알아보기 쉽게 지을 수 있습니다. 별칭은 [[abenabap_behavior_pools]] 의 메서드 문법과 [[abenrpm_derived_types]] 에 나타납니다. 30자까지입니다. |
| `external ExternalName` | 바깥에서 쓸 이름을 따로 붙입니다. 이 이름은 OData 메타데이터에 나가지만 ABAP 은 알지 못합니다. 별칭보다 훨씬 길어도 됩니다. [[abenbdl_external]] |
| `implementation in class ClassName unique` | entity 마다 behavior pool(동작 풀)을 정합니다. 이 클래스에 그 entity 의 트랜잭션 동작을 구현합니다. [[abenbdl_in_class_unique]] |
| `EntityBehaviorCharacteristics` | entity 의 일반 성질을 정하는 entity 동작 특성입니다. [[abenbdl_character]] |
| `EntityBehaviorBody` | entity 의 트랜잭션 동작을 정하는 본문입니다. [[abenbdl_body]] |

## 예제

root entity 와 child entity 하나로 된 구성 트리입니다. 두 entity 모두에 동작을 정의한 managed BDEF 입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  association _Booking { create; }
  field ( readonly : update ) TravelID;

  mapping for ztravel
  {
    TravelID   = travel_id;
    AgencyID   = agency_id;
    CustomerID = customer_id;
  }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  association _Travel { }
  field ( readonly : update ) TravelID, BookingID;

  mapping for zbooking
  {
    TravelID  = travel_id;
    BookingID = booking_id;
  }
}
```

같은 구성 트리를 draft 를 켠 unmanaged BDEF 로 적은 것입니다. 동작은 behavior pool `zbp_r_travel` 의 로컬 클래스에 구현합니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
draft table ztravel_d
lock master
total etag LastChangedAt
etag master LocalLastChangedAt
authorization master ( global, instance )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt, LocalLastChangedAt;

  draft action Activate optimized;
  draft action Discard;
  draft action Edit;
  draft action Resume;
  draft determine action Prepare;

  association _Booking { create; with draft; }
}

define behavior for ZR_Booking alias Booking
draft table zbooking_d
( lock, authorization, etag ) dependent by _Travel
{
  update;
  delete;
  association _Travel { with draft; }
  field ( readonly : update ) TravelID, BookingID;
}
```

## 알아두기

- [[abenbdl_strict|strict mode]] 에서는 구성 트리의 behavior definition 에 **빈 곳**이 있으면 안 됩니다. 트리가 1(루트), 2(자식), 3(손자)으로 되어 있을 때 1 과 3 에만 동작을 정의하고 2 를 빼면 빈 곳이 생기므로 허용되지 않습니다.
- strict mode 에서는 바탕이 되는 CDS entity(`RootEntity`, `ChildEntity1`, `ChildEntity2`, ...)가 CDS DDIC 기반 뷰(폐기됨)이면 안 됩니다.

## 관련 항목

- [[abenbdl_character]] : `persistent table`, `lock`, `authorization` 같은 entity 동작 특성
- [[abenbdl_body]] : 중괄호 안에 적는 entity 동작 본문
- [[abenbdl_external]]
- [[abenbdl_in_class_unique]]
- [[abenabap_behavior_pools]]
- [[abenrpm_derived_types]]
- [[abenbdl_bdef_header]]
