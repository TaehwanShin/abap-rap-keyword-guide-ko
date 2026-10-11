---
title: 요소 extension (Extending Elements)
summary: BDEF extension 에서 원본 entity 에 이미 있는 determine action, draft determine action Prepare, type mapping 을 넓히는 세 가지 구문을 묶은 항목입니다.
keywords: Extending Elements, 요소 확장, extend determine action, extend draft determine action Prepare, extend mapping for, extensible, 타입 매핑 확장, BDEF 확장
---

## 문법

```syntax
...
    extend determine action
  | extend draft determine action Prepare
  | extend mapping for PartnerType
  ...
```

## 설명

새 요소를 보태는 것과 달리, 여기서는 원본 RAP BO entity(엔터티)에 **이미 있는 요소**를 넓힙니다. 원본 BDEF 가 그 요소를 확장할 수 있다고 명시해 두어야 합니다. 방법은 [[abenbdl_extensibility_enabling_m_u]] 에 있습니다.

확장할 수 있는 요소는 세 가지입니다.

| 구문 | 하는 일 | 제한 |
| --- | --- | --- |
| `extend determine action` | 원본의 `determine action` 에 extension(확장) determination 과 extension validation 을 넣습니다. | unmanaged RAP BO 에서는 지금 지원하지 않습니다. |
| `extend draft determine action Prepare` | 원본의 draft `determine action` 인 `Prepare` 에 extension determination 과 extension validation 을 넣습니다. | unmanaged RAP BO 에서는 지금 지원하지 않습니다. |
| `extend mapping for PartnerType` | 원본의 type mapping 에 extension 필드를 보탭니다. | 따로 적힌 제한이 없습니다. |

구문마다 항목이 따로 있습니다.

- [[abenbdl_determine_action_ext]] : `determine action` 에 determination·validation 을 더 넣는 문법과 실행 순서
- [[abenbdl_draft_action_ext]] : draft action `Prepare` 에 determination·validation 을 더 넣는 문법
- [[abenbdl_type_mapping_ext]] : type mapping 에 extension 필드를 보태는 문법

## 예제

원본 BDEF 가 `determine action`, `Prepare`, type mapping 에 `extensible` 을 붙여 두었다고 봅니다. extension 에서는 새 determination 을 만들고 그것을 두 action 에 넣은 뒤, extension 필드를 mapping 에 보탭니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  determination setStatusToOpen on save { create; }

  extend determine action recalcTravel
  {
    determination ( always ) setStatusToOpen;
  }

  extend draft determine action Prepare
  {
    determination ( always ) setStatusToOpen;
  }

  extend mapping for ztravel
  {
    ZZDiscount = zz_discount;
  }
}
```

## 알아두기

- 원본 BDEF 에서 `extensible` 로 열어 두지 않은 요소는 확장할 수 없습니다.

## 관련 항목

- [[abenbdl_determine_action_ext]]
- [[abenbdl_draft_action_ext]]
- [[abenbdl_type_mapping_ext]]
- [[abenbdl_new_elem_ext]]
- [[abenbdl_entity_beh_extension]]
- [[abenbdl_extensibility_enabling_m_u]]
