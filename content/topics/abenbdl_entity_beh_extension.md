---
title: extension 본문 (ExtensionBody)
summary: extend behavior for 의 중괄호 안에 적는 내용으로, entity 에 새 요소를 보태는 것과 이미 있는 요소를 확장하는 것 두 갈래가 있습니다.
keywords: ExtensionBody, extension body, 확장 본문, extend behavior for, Adding Elements, Extending Elements, 요소 추가, 요소 확장, BDEF 확장
---

## 문법

```syntax
...
  [Adding Elements]
  [Extending Elements]
  ...
```

## 설명

extension(확장) 본문은 `extend behavior for EntityName { ... }` 의 중괄호 안에 적는 내용입니다. 이미 있는 RAP BO entity(엔터티)의 동작을 어떻게 넓힐지 여기서 정합니다. 할 수 있는 일은 두 갈래입니다.

- [[abenbdl_new_elem_ext]] : entity behavior definition(동작 정의)에 **새 요소를 보탭니다.** determination, validation, event, field characteristics(필드 특성), action, function, association, type mapping 같은 것을 새로 적습니다.
- [[abenbdl_ext_elem_ext]] : 원본에 **이미 있는 요소를 확장합니다.** `determine action`, draft `determine action` 인 `Prepare`, type mapping 이 대상입니다. 원본 BDEF 가 그 요소를 확장할 수 있다고 표시해 두어야 합니다.

두 갈래를 한 본문 안에 함께 적을 수 있습니다.

## 예제

새 determination 을 보태고(요소 추가), 원본에 있던 `determine action` 에 그 determination 을 넣습니다(요소 extension).

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  // 요소 추가: 새 determination
  determination setStatusToOpen on save { create; }

  // 요소 extension: 원본의 determine action 에 새 determination 을 넣는다
  extend determine action recalcTravel
  {
    determination ( always ) setStatusToOpen;
  }
}
```

## 관련 항목

- [[abenbdl_new_elem_ext]]
- [[abenbdl_ext_elem_ext]]
- [[abenbdl_extend_beh]]
- [[abenbdl_group_extension]]
- [[abenbdl_extensibility_enabling_m_u]]
