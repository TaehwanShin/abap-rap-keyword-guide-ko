---
title: default factory action
summary: entity 의 static factory action 가운데 하나를 기본으로 지정해, OData 같은 프레임워크가 표준 action 으로 쓰게 하는 문법입니다.
keywords: default factory action, static default factory action, 기본 팩토리 액션, 정적 기본 팩토리 액션, default, factory action, 프로젝션, BDEF 확장
---

## 문법

```syntax
[internal] static default factory action
                  [(
                  [features: global]
                  [precheck]
                  [authorization:none]
                  [authorization:global]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                   [cardinality]
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

## 설명

entity(엔터티) 하나에 static factory action 을 **정확히 하나** 골라 `default` 를 붙이면, 그 action 이 기본 static factory action 이 됩니다. 규칙은 [[abenbdl_action_factory|factory action]] 과 같습니다.

`default` 는 BO 를 쓰는 프레임워크, 예를 들어 OData 가 읽어 들입니다. 이런 프레임워크는 특정 시나리오에서 default factory action 을 표준 action 으로 씁니다.

default factory action 에 붙일 수 있는 [[abenbdl_operations_additions|작업 추가 구문]]은 다음과 같습니다.

- [[abenbdl_internal|internal]]
- [[abenbdl_static|static]]
- [[abenbdl_actions_fc|features:global]]
- [[abenbdl_precheck|precheck]]
- [[abenbdl_actions_auth|authorization:none]]
- [[abenbdl_actions_auth_global|authorization:global]]
- [[abenbdl_external|external]]
- [[abenbdl_action_input_param|InputParameter]]
- [[abenbdl_default_function|default function]]

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO
    - base BDEF(기반 BDEF) 의 default factory action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).
    - projection 계층에 default factory action 을 새로 만들 수도 있습니다. base BO(기반 BO) 의 default factory action 을 다시 쓰면서 projection BDEF 에도 새 default factory action 을 정의하면, **projection 쪽 action 이 기본**이 됩니다. base BDEF 의 default factory action 을 덮어씁니다. projection BDEF 의 action 과 function 은 [[abenbdl_nonstandard_projection]] 에서 설명합니다.
- RAP BO interface 에서는 base BDEF 의 default factory action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

base BDEF 입니다. static factory action 이 둘 있고, 그 가운데 `newTravel` 이 기본입니다.

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

  field ( readonly : update ) TravelID;

  // default factory action
  static default factory action newTravel [1..*];

  // 기본이 아닌 static factory action
  static factory action newTravelFromTemplate [0..1];
}
```

projection BDEF 는 두 action 을 다시 쓰면서 default factory action 을 새로 하나 정의합니다. 이때 OData 같은 프레임워크는 projection 의 `newTravelForAgency` 를 기본으로 봅니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;

  use action newTravel;
  use action newTravelFromTemplate;

  // projection 에서 새로 정의한 default factory action 이 우선한다
  static default factory action newTravelForAgency [1];
}
```

## 알아두기

- BDEF extension(확장)에서는 default factory action 을 지정할 수 없습니다.
- 문법 틀에서 보듯 [[abenbdl_action_factory|factory action]]보다 쓸 수 있는 추가 구문이 적습니다. `features: instance`, `authorization:update`, `authorization:instance`, `lock:none` 은 default factory action 의 문법 틀에 없습니다.
- default factory action 은 [[abenbdl_action_onsave|save action]] 이 될 수 없습니다.

## 관련 항목

- [[abenbdl_action_factory]]
- [[abenbdl_action]]
- [[abenbdl_use_projection]]
- [[abenbdl_nonstandard_projection]]
