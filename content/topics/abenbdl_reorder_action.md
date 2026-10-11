---
title: 순서 변경 action (reorder action)
summary: 편집 가능한 트리뷰에서 계층 노드를 형제 노드 사이의 원하는 자리로 옮기는 계층 action 입니다. managed 와 unmanaged 가 있습니다.
keywords: reorder action, 순서 변경 액션, managed reorder action, hierarchy-index, 계층 색인 필드, ascending association, descending association, with cascading delete, instance hierarchy, ChangeNextSiblingAction, 형제 노드
---

## 문법

```syntax
[managed] reorder action
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
[field ( hierarchy-index ) FieldName;]
[ascending association _AscendingAssoc;]
[descending association _DescendingAssoc [{ with cascading delete; }]]
```

## 설명

순서 변경 action 은 **계층 action** 의 하나입니다. 편집 가능한 트리뷰에서 계층 노드를 형제 노드(같은 부모 아래의 노드) 사이의 원하는 자리로 옮깁니다. 옮길 때 모든 형제 인스턴스의 계층 색인 필드 값을 다시 계산합니다.

순서 변경 action 은 `instance hierarchy` 뒤의 중괄호 안에 적습니다([[abenbdl_instance_hierarchy]]). 선택 사항이고, 인스턴스 계층 안에서만 적을 수 있습니다.

### managed 순서 변경 action

`managed` 를 붙이면 managed RAP BO provider(제공자)가 구현을 대신 해 줍니다. 프레임워크가 표준 구현을 제공할 수 있도록 다음 셋을 **반드시** 함께 적어야 합니다.

| 함께 적는 것 | 뜻 |
| --- | --- |
| `field ( hierarchy-index ) FieldName;` | 계층 색인 필드입니다. 노드가 형제 사이에서 몇 번째인지 담습니다. 타입은 정수 타입이거나 `NUMC` 여야 합니다. managed 순서 변경 action 을 실행하면 모든 형제 노드의 이 값이 다시 계산됩니다. |
| `ascending association _AscendingAssoc;` | 위로 올라가는 association 입니다. 기반 CDS 뷰 entity(엔터티)에서 같은 뷰 entity 의 **부모 노드**를 가리키는 자기 association 입니다. |
| `descending association _DescendingAssoc` | 아래로 내려가는 association 입니다. 같은 뷰 entity 의 **자식 노드**를 가리키는 자기 association 이며, 위로 올라가는 association 의 반대 방향입니다. |

위아래 두 association 이 함께, 기반 CDS 뷰 entity 의 데이터가 자기 자신을 가리키며 이루는 계층을 나타냅니다.

`descending association` 뒤에 `{ with cascading delete; }` 를 붙일 수 있습니다. 선택 사항입니다. 붙이면 계층 노드를 지울 때 그 아래의 후손 노드도 데이터베이스에서 모두 지웁니다.

### unmanaged 순서 변경 action

`managed` 를 붙이지 않으면 직접 구현합니다. behavior pool(동작 풀)의 handler method(핸들러 메서드) `FOR MODIFY` 에 씁니다([[abaphandler_meth_modify]]).

### 붙일 수 있는 추가 구문

괄호 안에는 작업 추가 구문([[abenbdl_operations_additions]])을 적습니다. 여러 개면 쉼표로 나눕니다.

| 추가 구문 | 뜻 |
| --- | --- |
| `features:instance` | business object(비즈니스 객체) 안의 조건에 따라 action 을 켜고 끕니다. [[abenbdl_actions_fc]] |
| `features:global` | business object 바깥의 조건에 따라 action 을 켜고 끕니다. [[abenbdl_actions_fc]] |
| `precheck` | 원하지 않는 변경이 버퍼에 닿지 않게 미리 막습니다. [[abenbdl_precheck]] |
| `authorization:none` | 이 action 을 권한 확인에서 뺍니다. [[abenbdl_actions_auth]] |
| `authorization:update` | 수정 작업에 구현한 권한 확인을 그대로 따릅니다. [[abenbdl_actions_auth_update]] |
| `authorization:global` | authorization master entity 에 정한 authorization control(권한 제어) 대신 global 권한 확인을 합니다. [[abenbdl_actions_auth_global]] |
| `authorization:instance` | authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 합니다. [[abenbdl_actions_auth_instance]] |
| `lock:none` | action 을 실행하는 인스턴스에 잠금을 걸지 않습니다. [[abenbdl_lock_none]] |

`external 'ExternalName'` 은 바깥에 보일 이름을 따로 정하는 선택 사항입니다([[abenbdl_external]]).

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 와 RAP BO interface 에서는 base BDEF(기반 BDEF) 의 순서 변경 action 을 `use action ActionName` 으로 다시 씁니다. [[abenbdl_use_projection]] 을 봅니다.

## 예제

일정 항목 entity `Item` 에 managed 순서 변경 action 을 둡니다. `SiblingOrder` 가 형제 사이의 순서를 담는 필드입니다.

```bdl
define behavior for ZR_TravelItem alias Item
persistent table ztravel_item
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID, ItemID, SiblingOrder;
  association _Travel;

  instance hierarchy ZH_TravelItem
  {
    managed reorder action moveItem;

    // managed 이면 아래 셋이 꼭 있어야 한다
    field ( hierarchy-index ) SiblingOrder;
    ascending association _ParentItem;
    descending association _ChildItem { with cascading delete; }
  }
}
```

## 알아두기

- OData 에서는 순서 변경 action 을 `ChangeNextSiblingAction` 이라고 부릅니다.
- 순서 변경 action 은 다른 action 처럼 EML 문 `MODIFY ENTITY ... EXECUTE` 로 실행할 수 있습니다([[abapmodify_entity_entities_op]]). 실행하면 계층 색인 필드의 값이 바뀝니다.
- 순서 변경 action 은 형제 사이의 자리만 바꿉니다. 노드를 다른 부모 아래로 옮기는 것은 [[abenbdl_instance_hierarchy]] 의 알아두기를 봅니다.

## 관련 항목

- [[abenbdl_instance_hierarchy]]
- [[abenbdl_copy_action]]
- [[abaphandler_meth_modify]]
- [[abapmodify_entity_entities_op]]
- [[abenbdl_operations_additions]]
- [[abenbdl_use_projection]]
