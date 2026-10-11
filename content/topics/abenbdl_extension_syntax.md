---
title: extension (base BDEF extension 문)
summary: managed·unmanaged behavior definition 을 BDEF extension 으로 확장하는 문으로, extension 머리말과 entity 동작 extension, extension 노드, 외부 entity, authorization context 를 담습니다.
keywords: extension, BDEF extension, BDEF 확장, 기반 BDEF 확장, using interface, ExtensionHeader, 확장 머리말, foreign entity, 외부 엔터티, extend behavior for, define behavior for, 확장 노드, extend own authorization context, define authorization context, 권한 컨텍스트
---

## 문법

```syntax
extension [using interface InterfaceBdef][;]
  [ExtensionHeader]
  [foreign entity]
  [EntityBehaviorExtension]
  [ExtensionEntityBehavior]
  [extend own authorization context]
  [define authorization context]
...
```

## 설명

`extension` 은 이미 있는 managed·unmanaged RAP behavior definition(동작 정의)를 BDEF extension(확장)으로 확장합니다. behavior definition 하나에 BDEF extension 을 여러 개 붙일 수 있고, 개수에 제한은 없습니다.

BDEF extension 에 올 수 있는 구성요소는 다음과 같습니다.

| 구성요소 | 하는 일 |
| --- | --- |
| `using interface InterfaceBdef` | RAP BO를 interface 계층을 거쳐 확장합니다. **이 방식을 강하게 권합니다.** [[abenbdl_using_interface]] 참고. |
| `ExtensionHeader` | extension 머리말. BDEF extension 에 반드시 있어야 합니다. behavior definition 머리말과 비슷하지만 고를 수 있는 것이 더 적습니다. [[abenbdl_extension_header]] 참고. |
| `foreign entity` | 지금 RAP BO의 CDS composition 트리에 들지 않는 RAP BO entity(엔터티)를 응답 구조에 넣습니다. 다른 구성요소의 앞, 뒤, 사이 어디에나 적을 수 있습니다. [[abenbdl_foreign]] 참고. |
| `EntityBehaviorExtension` | 이미 있는 RAP BO entity 의 동작을 확장합니다. `extend behavior for` 로 시작합니다. [[abenbdl_extend_beh]] 참고. |
| `ExtensionEntityBehavior` | extension 노드의 동작을 정의합니다. `define behavior for` 로 시작합니다. [[abenbdl_define_beh_extend]] 참고. |
| `extend own authorization context` | 확장당하는 BO에 전체 authorization context 가 정의되어 있으면 그것을 확장합니다. [[abenbdl_extend_own_auth_context]] 참고. |
| `define authorization context` | `for disable` authorization context 를 BDEF extension 에서 새로 정의합니다. [[abenbdl_def_auth_context]] 참고. |

### 세미콜론

키워드 `extension` 뒤의 세미콜론은 extension 머리말에 무엇이 오느냐에 따라 **꼭 있어야 하거나, 있으면 안 됩니다.** 아래 예제 두 개를 견주어 보세요.

### 이름 짓기

BDEF extension 자체와 그 안의 extension 요소 하나하나에는, 원래 BDEF와 그 요소들과 겹치지 않는 별도 네임스페이스를 써야 합니다. 이름 충돌을 막기 위해서입니다. SAP나 파트너가 아닌 개발 시스템에서 만든 BDEF extension 에는 고객 네임스페이스 접두어 `Z` 또는 `ZZ` 를 씁니다.

## 예제

interface `ZI_Travel` 을 거쳐 여행 BO를 확장합니다. 머리말이 `extension using interface ...;` 로 끝납니다. 이미 있는 entity `Travel` 에 extension 노드로 가는 association 을 더하고, extension 노드 `ZZNote` 의 동작을 정의합니다.

```bdl
extension using interface zi_travel;

extend behavior for Travel
{
  association _ZZNote { create; }
}

define behavior for ZZ_R_TravelNote alias ZZNote
  using ZZ_I_TravelNote
persistent table zztravelnote
( lock, authorization ) dependent
{
  update;
  delete;

  field ( readonly ) TravelID;
  field ( readonly : update ) NoteID;

  association _Travel;

  mapping for zztravelnote
  {
    TravelID = travel_id;
    NoteID   = note_id;
    NoteText = note_text;
  }
}
```

interface 를 거치는 extension 이라, extension 노드에도 `using` 으로 interface 쪽 entity 를 적었습니다. extension 노드의 자세한 문법은 [[abenbdl_define_beh_extend]] 에 있습니다.

behavior pool(동작 풀)이 있는 extension 입니다. 여기서는 `extension` 바로 뒤에 세미콜론이 없고, `implementation in class ... unique` 뒤에 옵니다.

```bdl
extension implementation in class zbp_x_travel unique;

extend behavior for Travel
{
  action ( authorization : instance ) zz_sendReminder;
}
```

## 알아두기

- 외부 entity(`foreign entity`)로는 같은 소프트웨어 컴포넌트에 속한 entity 만 BDEF extension 에 더할 수 있습니다.
- unmanaged RAP BO에서는 지금 노드 extension 을 쓸 수 없습니다. 그래서 `ExtensionEntityBehavior` 를 쓸 수 없습니다.
- 확장당하는 BO에 자기 authorization context 가 정의되어 있지 않으면, extension 으로 그것을 새로 더할 수는 없습니다.
- BDEF extension 의 `define authorization context` 문법은 RAP BO의 것과 비슷합니다. 다만 추가 구문 `for disable` 은 지원하지 않습니다.

## 관련 항목

- [[abenbdl_extensibility_managed_unm]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_using_interface]]
- [[abenbdl_extension_header]]
- [[abenbdl_foreign]]
- [[abenbdl_extend_beh]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_extend_own_auth_context]]
- [[abenbdl_def_auth_context]]
- [[abenbdl_extension]]
