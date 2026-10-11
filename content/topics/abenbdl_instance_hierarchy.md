---
title: 인스턴스 계층 (instance hierarchy)
summary: 고칠 수 있는 나무 모양 목록(트리뷰)에서 노드를 복사하고 순서를 바꾸는 동작을 CDS 계층에 묶어 선언합니다.
keywords: instance hierarchy, 인스턴스 계층, editable treeview, 편집 가능한 트리뷰, CDS hierarchy, copy action, reorder action, hierarchy action, 계층 액션, 노드 복사, 순서 바꾸기
---

## 문법

```syntax
instance hierarchy CDSHierarchyName
{
  [copy action]
  [reorder action]
}
```

## 설명

`instance hierarchy { ... }` 는 managed 또는 unmanaged RAP BO 에서 **편집 가능한 트리뷰**의 동작 일부를 정합니다. 트리뷰는 CDS 계층으로 모델링한 데이터를 SAP Fiori 화면에 나무 모양으로 보여 주는 목록입니다.

`CDSHierarchyName` 에는 그 RAP BO 에 정의된 CDS 계층의 이름을 적습니다. 그러므로 RAP BO 에 CDS 계층이 먼저 있어야 합니다. 편집 가능한 트리뷰용 CDS 데이터 모델을 만드는 순서는 RAP 개발 안내서의 "Editable Treeviews with Draft Capabilities" 에 나와 있습니다.

중괄호 안에는 **계층 action**을 적습니다. 계층 action 은 계층 노드를 어떻게 복사하고 순서를 바꿀지 정합니다.

- [[abenbdl_copy_action]] — 복사 action. 편집 가능한 트리뷰에서 계층 노드를 복제하는 방법을 정합니다.
- [[abenbdl_reorder_action]] — 순서 변경 action. 계층 노드를 형제 노드 사이의 원하는 자리로 옮깁니다. managed 일 수도, unmanaged 일 수도 있습니다.

둘 다 선택 사항입니다. 넣은 것만 그 기능이 제공됩니다. `instance hierarchy { }` 처럼 아무것도 넣지 않고 적을 수도 있지만, 그러면 아무 효과가 없습니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 와 RAP BO interface 에서는 `instance hierarchy` 를 적을 수도, 다시 쓸 수도 없습니다. 대신 계층 action 은 projection BDEF 나 interface BDEF 에서 **반드시** 다시 써야 합니다.

## 예제

여행 아래에 나무 구조로 쌓이는 일정 항목 entity(엔터티) `ZR_TravelItem` (별칭 `Item`)을 보탰다고 봅니다. 일정 항목은 자기 자신을 가리키는 association `_ParentItem`, `_ChildItem` 으로 위아래가 이어지고, CDS 계층 `ZH_TravelItem` 이 정의돼 있습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create ( authorization : global );
  update;
  delete;
  field ( readonly ) TravelID;
  association _Item { create; }
}

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
    // 형제 사이에서 자리를 옮기는 managed 순서 변경 action
    managed reorder action moveItem;
    field ( hierarchy-index ) SiblingOrder;
    ascending association _ParentItem;
    descending association _ChildItem { with cascading delete; }

    // 노드를 복제하는 복사 action
    copy action copyItem;
  }
}
```

## 알아두기

- 노드를 **다른 부모 노드 아래로** 옮길 수 있게 하려면, 계층의 자기 association 에 link action 과 unlink action 을 정의해야 합니다. [[abenbdl_link_unlink_action]] 을 봅니다.
- 처음부터 끝까지 이어지는 시나리오를 만드는 방법은 RAP 개발 안내서의 "Editable Treeviews with Draft Capabilities" 에 있습니다.

## 관련 항목

- [[abenbdl_copy_action]]
- [[abenbdl_reorder_action]]
- [[abenbdl_link_unlink_action]]
- [[abenbdl_use_projection]]
