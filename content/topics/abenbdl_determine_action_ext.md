---
title: determine action extension (extend determine action)
summary: 원본 BDEF 에 있는 determine action 에 extension 에서 만든 determination 과 validation 을 더 넣는 구문입니다.
keywords: extend determine action, determine action, 결정 액션 확장, determination, validation, always, extensible, 확장 결정, 확장 검증, 실행 순서
---

## 문법

```syntax
extend determine action DetermineActionName
          {
           determination [(always)] MyDetermination1;
           determination [(always)] MyDetermination2;
           validation [(always)] MyValidation1;
           validation [(always)] MyValidation2;
           determination [(always)] Child~ChildDetermination;
           validation [(always)] Child~ChildValidation;
           ...
          }
```

## 설명

`determine action` 은 determination 과 validation 을 필요할 때 한꺼번에 실행하는 action 입니다. `extend determine action` 은 원본에 있는 `DetermineActionName` 에 extension(확장) determination 과 extension validation 을 더 넣습니다. 중괄호 안에 determination 이나 validation 을 적어도 하나는 적어야 합니다.

### 전제 조건

- 원본 BDEF 에서 그 `determine action` 이 extension 을 허용해야 합니다. ([[abenbdl_extensibility_enabling_m_u]] 참고)
- 확장되는 BDEF 가 draft 를 써야 합니다. 지금은 draft 를 쓰는 RAP BO 에서만 `determine action` 을 확장할 수 있습니다.

### 선택 항목

- `(always)` : 트리거 조건과 상관없이 determination·validation 을 실행합니다. `(always)` 가 붙은 determination 은 한 번 실행된 뒤에도 같은 `determine action` 에 속한 다른 determination 때문에 다시 트리거될 수 있습니다.
- `Child~ChildDetermination`, `Child~ChildValidation` : child entity(자식 엔터티)의 determination 과 validation 을 넣습니다. 그 determination·validation 의 트리거 작업에 `delete` 가 들어 있지 않아야 합니다.

### 실행 순서와 권한

- determination 이 먼저 실행되고 validation 이 그 뒤에 실행됩니다.
- determination 끼리, validation 끼리의 순서는 RAP 프레임워크가 정합니다. `determine action` 안에 적은 순서와는 상관없습니다.
- 원본 BDEF 에 authorization control(권한 제어)가 지정되어 있으면 그것을 그대로 씁니다.

## 예제

원본 BDEF `ZR_Travel` 은 draft 를 쓰고, `determine action` 인 `recalcTravel` 에 `extensible` 을 붙여 extension 을 허용합니다.

```bdl
// 원본 BDEF ZR_Travel 의 일부
determination setBeginDate on save { create; }

determine action recalcTravel extensible
{
  determination ( always ) setBeginDate;
  determination ( always ) Booking~calcTotalPrice;
}
```

extension 은 새 determination `setStatusToOpen` 을 만들고 `recalcTravel` 에 넣습니다.

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
}
```

EML 로 `recalcTravel` 을 실행하면 RAP 프레임워크는 원본 behavior pool(동작 풀)과 extension behavior pool 의 구현을 이 순서로 부릅니다.

1. 원본의 instance 권한 확인 (루트 노드)
2. `setBeginDate` — 원본 루트 노드의 determination
3. `setStatusToOpen` — 루트 노드 extension 의 determination
4. 원본의 instance 권한 확인 (자식 노드)
5. `calcTotalPrice` — 원본 자식 노드의 determination

## 알아두기

- `internal` 로 정의한 `determine action` 은 확장할 수 없습니다.
- unmanaged RAP BO 에서는 `determine action` extension 을 지금 지원하지 않습니다.
- draft 를 쓰지 않는 BO 의 `determine action` 은 확장할 수 없습니다.

## 관련 항목

- [[abenbdl_det_action_ext_abexa]]
- [[abenbdl_determine_action]]
- [[abenbdl_draft_action_ext]]
- [[abenbdl_ext_elem_ext]]
- [[abenbdl_determinations]]
- [[abenbdl_validations]]
- [[abenbdl_internal]]
