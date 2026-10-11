---
title: 복사 action (copy action)
summary: 편집 가능한 트리뷰에서 이미 있는 계층 노드를 바탕으로 새 노드를 만드는 계층 action 입니다. instance hierarchy 안에만 적습니다.
keywords: copy action, 복사 액션, instance hierarchy, hierarchy action, 계층 액션, factory action, 팩토리 액션, %cid, FOR MODIFY, 노드 복제, treeview, use action
---

## 문법

```syntax
copy action
 [(
   [features: {instance | global}]
   [precheck]
   [authorization:none]
   [authorization:update]
   [authorization:global]
   [authorization:instance]
   [lock:none]
  )]
  ActionName [external 'ExternalName'];
```

## 설명

복사 action 은 **계층 action**의 하나입니다. 편집 가능한 트리뷰에서 계층 노드를 어떻게 복제할지 정합니다. 이미 있는 노드를 바탕으로 새 노드를 만들 때 씁니다.

복사 action 은 `instance hierarchy` 뒤의 중괄호 안에 적습니다([[abenbdl_instance_hierarchy]]). 선택 사항이고, 인스턴스 계층 안에서만 적을 수 있습니다.

복사 action 은 **인스턴스에 묶인 factory action**입니다. 그래서 결과로 만들어지는 인스턴스에 `%cid` 를 쓸 수 있습니다([[abapderived_types_cid]]).

프레임워크가 대신 해 주지 않으므로 직접 구현해야 합니다. behavior pool(동작 풀)의 handler method(핸들러 메서드) `FOR MODIFY` 에 씁니다([[abaphandler_meth_modify]]).

### 붙일 수 있는 추가 구문

괄호 안에는 작업 추가 구문([[abenbdl_operations_additions]])을 적습니다. 여러 개면 쉼표로 나눕니다.

| 추가 구문 | 뜻 |
| --- | --- |
| `features:instance` | business object(비즈니스 객체) 안의 조건에 따라 복사 action 을 켜고 끕니다. [[abenbdl_actions_fc]] |
| `features:global` | business object 바깥의 조건에 따라 복사 action 을 켜고 끕니다. [[abenbdl_actions_fc]] |
| `precheck` | 원하지 않는 변경이 버퍼에 닿지 않게 미리 막습니다. [[abenbdl_precheck]] |
| `authorization:none` | 이 action 을 권한 확인에서 뺍니다. [[abenbdl_actions_auth]] |
| `authorization:update` | 수정 작업에 구현한 권한 확인을 그대로 따릅니다. [[abenbdl_actions_auth_update]] |
| `authorization:global` | authorization master entity(엔터티)에 정한 authorization control(권한 제어) 대신 global 권한 확인을 합니다. [[abenbdl_actions_auth_global]] |
| `authorization:instance` | authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 합니다. [[abenbdl_actions_auth_instance]] |
| `lock:none` | action 을 실행하는 인스턴스에 잠금을 걸지 않습니다. [[abenbdl_lock_none]] |

`external 'ExternalName'` 은 바깥에 보일 이름을 따로 정하는 선택 사항입니다([[abenbdl_external]]).

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 와 RAP BO interface 에서는 base BDEF(기반 BDEF) 의 복사 action 을 `use action ActionName` 으로 다시 씁니다. [[abenbdl_use_projection]] 을 봅니다.

## 예제

일정 항목 entity `Item` 의 인스턴스 계층에 복사 action 을 넣습니다. 상태에 따라 복사를 켜고 끄도록 feature control(기능 제어)를 걸었습니다.

```bdl
define behavior for ZR_TravelItem alias Item
persistent table ztravel_item
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID, ItemID;
  association _Travel;

  instance hierarchy ZH_TravelItem
  {
    copy action ( features : instance, precheck ) copyItem external 'CopyTravelItem';
  }
}
```

projection 에서는 다른 action 과 똑같이 다시 씁니다.

```bdl
define behavior for ZC_TravelItem alias Item
{
  use update;
  use delete;

  use action copyItem;
  use association _Travel;
}
```

## 알아두기

- 복사 action 은 `instance hierarchy` 밖에는 적을 수 없습니다.
- managed RAP BO 에서도 복사 action 의 구현은 직접 써야 합니다.

## 관련 항목

- [[abenbdl_instance_hierarchy]]
- [[abenbdl_reorder_action]]
- [[abenbdl_action_factory]]
- [[abaphandler_meth_modify]]
- [[abapderived_types_cid]]
- [[abenbdl_operations_additions]]
- [[abenbdl_use_projection]]
