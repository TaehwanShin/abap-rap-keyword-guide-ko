---
title: base BDEF extension
summary: managed·unmanaged behavior definition 을 extension 문으로 확장하는 저장소 객체인 base BDEF extension 이 어떤 부분으로 이루어지는지 정리합니다.
keywords: base BDEF extension, 기반 BDEF 확장, extension, extend behavior for, define behavior for, 확장 머리말, 엔터티 동작 확장, 확장 엔터티 동작, 확장 노드, authorization context, 권한 컨텍스트, managed, unmanaged, 관리형, 비관리형
---

## 설명

base BDEF(기반 BDEF) extension(확장)은 구현 타입이 managed 나 unmanaged 인 RAP behavior definition(동작 정의)를 확장하는 **저장소 객체**입니다. `extension` 문으로 만듭니다.

먼저 확장당하는 BDEF 가 extension 을 명시적으로 허용해야 합니다. 그 방법은 [[abenbdl_extensibility_enabling_m_u]] 에 있습니다.

base BDEF extension 은 다음 부분으로 이루어집니다.

| 부분 | 필수 여부 | 시작하는 말 | 하는 일 |
| --- | --- | --- | --- |
| BDEF extension 머리말 | 필수 | `extension` | extension 임을 밝히고 extension 전체에 걸리는 설정을 적습니다. |
| entity(엔터티) 동작 extension | 선택 | `extend behavior for` | 이미 있는 RAP BO entity 의 동작을 확장합니다. |
| extension entity 동작 | 선택 | `define behavior for` | extension 노드(extension 으로 새로 더한 노드)의 동작을 정의합니다. |
| authorization context | 선택 |  | `for disable` authorization context 를 새로 더하거나, 이미 있는 전체 authorization context 를 확장합니다. |

문법은 아래 항목에서 자세히 다룹니다.

- [[abenbdl_extension_syntax]] : `extension` 문 전체의 문법 틀과 각 구성요소 (`using interface`, extension 머리말, entity 동작 extension, extension entity 동작, authorization context extension)

## 예제

여행 entity 에 extension action 을 하나 더하는 가장 작은 base BDEF extension 입니다. 머리말과 entity 동작 extension 만 있습니다.

```bdl
extension implementation in class zbp_x_travel unique;

extend behavior for Travel
{
  action ( authorization : instance ) zz_sendReminder;
}
```

## 알아두기

unmanaged RAP BO 의 BDEF extension 에는 다음 제약이 있습니다.

- additional save 를 정의할 수 없습니다.
- determination 과 validation 을 정의할 수 없습니다.
- 노드 extension 을 쓸 수 없습니다.

## 관련 항목

- [[abenbdl_extension]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_extension_syntax]]
- [[abenbdl_extension_header]]
- [[abenbdl_extend_beh]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_extend_own_auth_context]]
- [[abenbdl_def_auth_context]]
- [[abenbdl_using_interface]]
