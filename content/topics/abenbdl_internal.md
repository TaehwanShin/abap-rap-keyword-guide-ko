---
title: internal 전용 작업 (internal)
summary: RAP BO 작업을 behavior pool 안에서만 부를 수 있게 막는 추가 구문입니다. 바깥에서 부르면 런타임 오류가 납니다.
keywords: internal, 내부 작업, 내부 전용, internal action, 동작 풀, IN LOCAL MODE, 런타임 오류, 추가 구문
---

## 문법

```syntax
... internal ...
```

## 설명

`internal` 을 붙인 작업은 **behavior pool(동작 풀) 안에서만** 부를 수 있습니다. 예를 들어 [[abenbdl_action|action]], [[abenbdl_validations|validation]], [[abenbdl_determinations|determination]] 의 구현 안에서 부릅니다. 바깥의 RAP BO consumer(사용자)가 internal 작업을 실행하려 하면 런타임 오류가 납니다.

붙일 수 있는 작업은 다음과 같습니다.

- [[abenbdl_standard_operations|standard operation]]
- [[abenbdl_association|association 작업]]
- [[abenbdl_action|action]]
- [[abenbdl_function|function]]
- [[abenbdl_determine_action|determine action]]
- [[abenbdl_draft_action|draft action]]

막는 일은 RAP 프레임워크가 합니다. `internal` 때문에 behavior pool 에 따로 구현할 것은 없습니다.

## 예제

총액을 다시 계산하는 internal action 을 만들고, 여행이 만들어질 때 도는 determination 에서 그 action 을 부릅니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  internal action recalcTotalPrice;

  determination calcTotal on modify { create; }
}
```

determination 의 구현에서 `IN LOCAL MODE` 로 internal action 을 실행합니다.

```abap
METHOD calctotal.
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      EXECUTE recalctotalprice
      FROM CORRESPONDING #( keys )
    REPORTED DATA(ls_reported).
ENDMETHOD.
```

바깥에서 여행을 만들면 determination 이 돌고, determination 이 internal action 을 불러 인스턴스마다 `TotalPrice` 가 계산됩니다. 바깥에서 `recalcTotalPrice` 를 직접 실행할 수는 없습니다.

## 알아두기

- internal 작업에는 [[abenbdl_actions_fc|feature control]] 을 쓸 수 없습니다. feature control(기능 제어)는 바깥에서 오는 접근을 다스리는 것이라 internal 작업에는 필요 없습니다.
- internal 작업에는 [[abenbdl_precheck|precheck]] 를 쓸 수 없습니다.
- internal 작업에는 [[abenbdl_actions_auth_update|authorization:update]], [[abenbdl_actions_auth_global|authorization:global]], [[abenbdl_actions_auth_instance|authorization:instance]] 를 쓸 수 없습니다.
- internal 작업은 projection BDEF 나 interface BDEF 에서 [[abenbdl_use_projection|use]] 로 다시 쓸 수 없습니다. 거기서는 보이지 않기 때문입니다.

## 관련 항목

- [[abenbdl_operations_additions]]
- [[abenbdl_action]]
- [[abenbdl_actions_fc]]
- [[abenbdl_precheck]]
- [[abapin_local_mode]]
- [[abenbdl_use_projection]]
