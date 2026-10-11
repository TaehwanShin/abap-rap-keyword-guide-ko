---
title: standard operation (create, update, delete)
summary: entity 인스턴스를 만들고 고치고 지우는 standard operation 을 behavior definition 에서 켜는 문법과, 작업마다 붙일 수 있는 추가 구문을 설명합니다.
keywords: create, update, delete, standard operations, 표준 작업, 생성, 수정, 삭제, CRUD, CUD, internal, features:instance, features:global, precheck, authorization:none, authorization:update, default function, GetDefaultsForCreate
---

## 문법

```syntax
... [internal] create [([features:global]
                      [,precheck]
                      [,authorization:none]);]
                      [{default function [GetDefaultsForCreate];}]
  | [internal] update [({features:instance | features:global}
                      [,precheck]
                      [,authorization:none])];
  | [internal] delete [({features:instance | features:global}
                      [,precheck]
                      [,authorization:none]
                      [,authorization:update])];
```

## 설명

`create`, `update`, `delete` 가 standard operation(표준 작업)입니다. 셋 다 behavior definition(동작 정의)에 **적어야 켜집니다.** 예를 들어 `update` 를 적은 entity(엔터티)는 수정할 수 있고, 적지 않은 entity 는 RAP BO consumer(사용자)가 수정을 요청할 수 없습니다.

**읽기는 적지 않습니다.** behavior definition 에 나오는 entity 는 언제나 읽기가 자동으로 켜져 있고, 따로 선언하면 안 됩니다.

| 작업 | 하는 일 |
| --- | --- |
| `create` | entity 의 인스턴스를 새로 만듭니다. |
| `update` | 인스턴스 하나 또는 여러 개를 바꿉니다. |
| `delete` | 인스턴스 하나 또는 여러 개를 지웁니다. |

### create 와 child entity

- **managed RAP BO** : `create` 는 루트 노드에만 적을 수 있습니다. 자식 노드는 [[abenbdl_internal|내부용]]으로만 생성이 자동으로 켜져 있습니다. 그래서 바깥의 사용자는 자식 인스턴스를 부모를 거쳐서만, 곧 [[abenbdl_association|create-by-association]] 으로만 만들 수 있습니다. 자식을 직접 생성하는 것은 그 BO 자신의 behavior pool(동작 풀) 구현 안에서만 됩니다.
- **unmanaged RAP BO** : child entity(자식 엔터티)를 직접 생성하게 할 수 있지만 권장하지 않습니다.

### delete 와 자식 인스턴스

managed RAP BO 에서는 부모 인스턴스를 지우면 거기에 딸린 자식 인스턴스가 모두 자동으로 지워집니다. unmanaged RAP BO 에서도 삭제를 이렇게 구현하기를 권장합니다.

### 붙일 수 있는 추가 구문

| 추가 구문 | 뜻 | 쓸 수 있는 작업 |
| --- | --- | --- |
| [[abenbdl_internal|internal]] | internal 작업으로 만듭니다. | `create`, `update`, `delete` |
| [[abenbdl_actions_fc|features:instance]] | 인스턴스 상태에 따라 작업을 켜고 끄는 동적 feature control(기능 제어)입니다. | `update`, `delete` (`create` 에는 쓸 수 없음) |
| [[abenbdl_actions_fc|features:global]] | global feature control 입니다. | `create`, `update`, `delete` |
| [[abenbdl_precheck|precheck]] | precheck 를 겁니다. | `create`, `update`, `delete` |
| [[abenbdl_actions_auth|authorization:none]] | 이 작업을 [[abenbdl_authorization|권한 확인]]에서 뺍니다. | `create`, `update`, `delete` |
| [[abenbdl_actions_auth_update|authorization:update]] | authorization control(권한 제어)를 수정 작업의 권한 확인에 맡깁니다. | `delete` 만 |
| [[abenbdl_default_function|default function]] | default values function 을 정합니다. 화면에서 필드 값이 미리 채워집니다. | `create` 만 |

### BO 종류에 따른 구현

- **managed RAP BO** : managed RAP BO provider(제공자)가 standard operation 을 모두 처리하므로 behavior pool 이 필요 없습니다. 다만 몇몇 추가 구문은 구현이 필요합니다. 추가 구문 항목마다 적혀 있습니다.
- **unmanaged RAP BO** : standard operation 마다 behavior pool 의 [[abapmethods_for_rap_behv|handler method]] [[abaphandler_meth_modify|FOR MODIFY]] 에 구현해야 합니다.
- **projection BO 와 RAP BO interface** : base BDEF(기반 BDEF) 의 standard operation 을 키워드 `use` 로 다시 씁니다. [[abenbdl_use_projection]] 을 참고하세요.

## 예제

managed BO 입니다. 루트에는 세 작업을 모두 켜고, 자식에는 `create` 를 적지 않습니다. 예약은 `_Booking` association 으로만 만듭니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  // 생성: global feature control 과 precheck 를 건다
  create ( features : global, precheck );

  // 수정: 인스턴스 상태에 따라 켜고 끈다
  update ( features : instance );

  // 삭제: 수정 권한이 있으면 삭제도 허용한다
  delete ( features : instance, authorization : update );

  field ( readonly ) TravelID;

  // 자식은 create-by-association 한다
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  // managed BO 의 자식에는 create 를 적지 않는다
  update;
  delete;

  field ( readonly ) TravelID, BookingID;
  association _Travel { }
}
```

## 알아두기

- EML 로 생성할 때 [[abapmodify_entity_entities_fields|AUTO FILL CID]] 를 붙이면 BDEF derived type(BDEF 파생 타입) 구성요소 [[abapderived_types_cid|%cid]] 가 자동으로 채워집니다.
- 실행 예제는 [[abeneml_modify_op_abexa]] (managed)와 [[abeneml_modify_op_u_abexa]] (unmanaged)에 있습니다.

## 관련 항목

- [[abenbdl_operations]]
- [[abenbdl_association]]
- [[abenbdl_operations_additions]]
- [[abenbdl_default_function]]
- [[abaphandler_meth_modify]]
- [[abenbdl_use_projection]]
- [[abeneml_modify_op_abexa]]
- [[abeneml_modify_op_u_abexa]]
