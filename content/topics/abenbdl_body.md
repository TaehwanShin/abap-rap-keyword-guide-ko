---
title: entity 동작 본문 (EntityBehaviorBody)
summary: define behavior for 의 중괄호 안에 적는 내용으로, field characteristics·작업·validation·determination·event·mapping 같은 요소가 들어갑니다.
keywords: EntityBehaviorBody, 엔터티 동작 본문, 동작 본문, field, validation, determination, event, side effects, mapping, group, 중괄호, define behavior for
---

## 문법

```syntax
... {[FieldCharacteristics]
     [FieldNumbering]
     [RAP BO Operations]
     [validation]
     [determination]
     [Events]
     [side effects]
     [changedocuments, Options]
     [instance hierarchy]
     [BDEF alternative key]
     [TypeMapping]}
     [group]
...
```

## 설명

entity(엔터티) 동작 본문은 `define behavior for ...` 뒤 중괄호 `{ }` 안에 적는 부분입니다. entity 가 **무엇을 할 수 있는지**가 여기에 모입니다. 잠금·권한·ETag 같은 entity 전체의 성질은 중괄호 앞(entity 동작 특성)에 적고, 필드나 작업 하나하나에 관한 내용은 중괄호 안에 적습니다.

본문에 들어갈 수 있는 요소는 다음과 같습니다. 모두 선택입니다.

| 요소 | 하는 일 |
| --- | --- |
| [[abenbdl_field_char|field characteristics]] | 필드에 접근 제한을 겁니다. 예를 들어 readonly 나 mandatory 입력으로 지정합니다. |
| [[abenbdl_field_numbering|필드 numbering]] | 키 필드에 managed internal numbering 을 정합니다. |
| [[abenbdl_operations|RAP BO 작업]] | BO 의 동작을 이루는 작업들입니다. 생성·수정·삭제, action, function 등이 여기에 듭니다. |
| [[abenbdl_validations|validation]] | BO 인스턴스가 일관된 상태인지 확인합니다. |
| [[abenbdl_determinations|determination]] | 실행 중에 필드 값을 계산하거나 정합니다. |
| [[abenbdl_event_overview|event]] | 비동기 통신에 쓰는 RAP business event 입니다. |
| [[abenbdl_side_effects|side effects]] | BO 속성 사이의 의존 관계를 적어, 영향받는 속성을 화면에서 다시 읽어 오게 합니다. |
| [[abenbdl_changedocs_options|change documents 옵션]] | entity 가 change documents 를 쓰도록 되어 있을 때, 기록 옵션을 본문에 적습니다. |
| [[abenbdl_instance_hierarchy|인스턴스 계층]] | 편집할 수 있는 트리 화면 시나리오를 켭니다. |
| [[abenbdl_define_key|BDEF 대체 키]] | 직접 정의하는 BDEF 키입니다. 순수 키(pure key)와 보조 키(secondary key)가 있고, 예를 들어 [[abenbdl_keyfunction|key function]]에 쓰입니다. |
| [[abenbdl_type_mapping|type mapping]] | 데이터베이스 테이블의 필드 이름이 CDS 데이터 모델의 필드 이름과 다를 때 필요합니다. |
| [[abenbdl_grouping|구현 그룹 (group)]] | BO 업무 로직 가운데 구현이 필요한 부분을 여러 그룹으로 나눕니다. 그룹마다 [[abenbdl_in_class_unique|구현 클래스]]를 따로 둡니다. |

## 예제

`Travel` 의 동작 본문에 여러 요소를 함께 적은 모습입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  // field characteristics
  field ( readonly ) TravelID, LastChangedAt;
  field ( mandatory ) AgencyID, CustomerID;

  // RAP BO 작업
  create;
  update;
  delete;
  association _Booking { create; }
  action acceptTravel result [1] $self;

  // validation 과 determination
  validation validateDates on save { create; field BeginDate, EndDate; }
  determination setInitialStatus on modify { create; }

  // event
  event travelAccepted;

  // side effects: 시작일이 바뀌면 총액을 다시 읽어 온다
  side effects { field BeginDate affects field TotalPrice; }

  // type mapping: CDS 필드 이름 = 테이블 필드 이름
  mapping for ztravel
  {
    TravelID      = travel_id;
    AgencyID      = agency_id;
    CustomerID    = customer_id;
    BeginDate     = begin_date;
    EndDate       = end_date;
    TotalPrice    = total_price;
    CurrencyCode  = currency_code;
    Status        = status;
    LastChangedAt = last_changed_at;
  }
}

// child entity Booking 의 behavior definition 은 줄였다
```

## 관련 항목

- [[abenbdl_field_char]]
- [[abenbdl_field_numbering]]
- [[abenbdl_operations]]
- [[abenbdl_validations]]
- [[abenbdl_determinations]]
- [[abenbdl_event_overview]]
- [[abenbdl_side_effects]]
- [[abenbdl_changedocs_options]]
- [[abenbdl_instance_hierarchy]]
- [[abenbdl_define_key]]
- [[abenbdl_type_mapping]]
- [[abenbdl_grouping]]
