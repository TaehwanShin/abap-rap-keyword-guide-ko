---
title: projection BDEF 의 entity 동작 본문
summary: projection BDEF 의 중괄호 안에 적을 수 있는 것, 곧 field characteristics·필드 augmentation·use·새 action 과 function·type mapping 을 정리합니다.
keywords: 엔터티 동작 본문, EntityBehaviorBody, 프로젝션 BDEF, projection, use, field, FieldCharacteristics, FieldAugmentation, augment, action, function, mapping for, 타입 매핑, 재사용
---

## 문법

```syntax
... {[FieldCharacteristics];
     [FieldAugmentation];
     [use];
     [action];
     [function];
     [TypeMapping];}
...
```

## 설명

projection BDEF 의 entity(엔터티) 동작 본문에서는 base BDEF(기반 BDEF) 의 요소를 **가져오고**, 새 요소를 **보탤** 수 있습니다.

| 적는 것 | 뜻 |
| --- | --- |
| field characteristics(필드 특성) | projection BDEF 는 base BO(기반 BO) 의 field characteristics 를 모두 저절로 물려받습니다. base BDEF 가 어떤 필드에 속성을 주지 않았다면, 그 필드의 속성을 projection BDEF 에서 줄 수 있습니다. [[abenbdl_field_projection]] |
| 필드 augmentation | projection behavior definition(동작 정의)의 readonly 필드에 쓰는 RAP BO augmentation 입니다. [[abenbdl_field_augment]] |
| `use` | RAP BO 작업을 가져옵니다. base BO 에서 가져오려는 작업은 **하나하나 `use` 로 적어야** 합니다. standard operation(표준 작업), association 작업, action, function, draft action 이 모두 해당합니다. [[abenbdl_use_projection]] |
| action | 새 action 을 정의합니다. behavior pool(동작 풀)에 구현해야 합니다. [[abenbdl_nonstandard_projection]] |
| function | 새 function 을 정의합니다. behavior pool 에 구현해야 합니다. [[abenbdl_function_projection]] |
| type mapping | 지금 데이터 모델의 BDEF derived type(BDEF 파생 타입)을, derived type 의 구성요소 모양과 맞지 않는 다른 타입에 이어 줍니다. managed·unmanaged BDEF 에서와 똑같이 동작합니다. [[abenbdl_type_mapping]] |

## 예제

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );
use draft;

define behavior for ZC_Travel alias Travel
use etag
{
  // field characteristics: base BDEF 가 속성을 주지 않은 필드에만 줄 수 있다
  field ( readonly ) TotalPrice;

  // base BO 의 작업 가져오기
  use create;
  use update;
  use delete;

  use action Edit;
  use action Activate;
  use action Discard;
  use action Resume;
  use action Prepare;

  use action acceptTravel;
  use association _Booking { create; with draft; }

  // projection 의 새 action. zbp_c_travel 에 구현한다
  action ( authorization : none ) markAsFavorite;

  // type mapping
  mapping for zs_travel_legacy corresponding
  {
    TravelID = trip_no;
  }
}
```

## 알아두기

- `use` 로 적지 않은 작업은 projection 에서 쓸 수 없습니다. 저절로 넘어오지 않습니다.
- 새 action 이나 function 을 정의하면 projection 에 behavior pool 이 필요합니다. 머리말이나 entity behavior definition 에 `implementation in class` 를 적습니다.

## 관련 항목

- [[abenbdl_define_beh_projection]]
- [[abenbdl_field_projection]]
- [[abenbdl_field_augment]]
- [[abenbdl_use_projection]]
- [[abenbdl_nonstandard_projection]]
- [[abenbdl_function_projection]]
- [[abenbdl_type_mapping]]
