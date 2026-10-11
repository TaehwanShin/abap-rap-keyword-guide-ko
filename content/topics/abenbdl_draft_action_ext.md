---
title: draft action Prepare extension (extend draft determine action Prepare)
summary: 원본 BDEF 의 draft determine action 인 Prepare 에 extension 에서 만든 determination 과 validation 을 더 넣는 구문입니다.
keywords: extend draft determine action Prepare, Prepare, draft determine action, 초안 액션 확장, determination, validation, always, extensible, 확장 결정, 확장 검증
---

## 문법

```syntax
extend draft determine action Prepare
             {
             [determination [(always)] DetName;]
             [validation [(always)] ValName;]
             [determination [(always)] Child~ChildDetermination;]
             [validation [(always)] Child~ChildValidation;]
             ...
              }
```

## 설명

`Prepare` 는 draft 를 쓰는 BO 에 있는 draft `determine action` 입니다. `extend draft determine action Prepare` 는 원본의 `Prepare` 에 extension(확장) determination 과 extension validation 을 더 넣습니다.

- **전제 조건**: 원본 BDEF 에서 `Prepare` 가 extension 을 허용해야 합니다. ([[abenbdl_extensibility_enabling_m_u]] 참고)
- 중괄호 안에 extension determination 이나 extension validation 을 적어도 하나는 적어야 합니다.
- `(always)` 를 붙일 수 있습니다. 뜻은 [[abenbdl_determine_action]] 에 적힌 것과 같습니다.
- `Child~ChildDetermination`, `Child~ChildValidation` 형태로 child entity(자식 엔터티)의 determination 과 validation 도 넣을 수 있습니다.

## 예제

원본 BDEF `ZR_Travel` 은 draft 를 쓰고, `Prepare` 에 `extensible` 을 붙여 extension 을 허용합니다.

```bdl
// 원본 BDEF ZR_Travel 의 일부
draft determine action Prepare extensible
{
  determination ( always ) setBeginDate;
}
```

extension 은 새 determination `setDefaultPurpose` 를 만들고 `Prepare` 에 넣습니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  determination setDefaultPurpose on save { create; }

  extend draft determine action Prepare
  {
    determination ( always ) setDefaultPurpose;
  }
}
```

## 알아두기

- `internal` 로 정의한 `Prepare` 는 확장할 수 없습니다.
- unmanaged RAP BO 에서는 `Prepare` extension 을 지금 지원하지 않습니다.

## 관련 항목

- [[abenbdl_draft_action]]
- [[abenbdl_determine_action]]
- [[abenbdl_determine_action_ext]]
- [[abenbdl_ext_elem_ext]]
- [[abenbdl_internal]]
- [[abenbdl_extensibility_enabling_m_u]]
