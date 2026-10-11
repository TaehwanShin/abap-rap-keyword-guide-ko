---
title: BDEF extension
summary: 원래 behavior definition 을 고치지 않고 필드·동작·노드를 덧붙이는, 전송할 수 있는 extension 객체인 BDEF extension 의 전체 그림과 용어를 정리합니다.
keywords: BDEF extension, BDEF 확장, 동작 정의 확장, extension, extensible, extension layering, 확장 겹치기, field extensibility, behavior extensibility, node extensibility, 필드 확장, 동작 확장, 노드 확장, base BDEF, 기반 BDEF, 릴리스 계약
---

## 설명

BDEF extension(확장)은 RAP behavior definition(동작 정의)에 덧붙이는 **extension 객체**입니다. 원래 behavior definition 과 따로 존재하며 전송할 수 있습니다.

BDEF extension 은 구현 타입이 managed, unmanaged, projection, abstract 인 behavior definition 에 붙일 수 있습니다. BDEF extension 자체를 또 확장할 수도 있습니다. 이것을 **extension 겹치기**(extension layering)라고 합니다.

extension 은 **보태기만** 합니다. 원래 BDEF 에 있는 요소를 고치거나 덮어쓰거나 지울 수는 없습니다. 할 수 있는 extension 은 세 가지입니다.

- 필드 extension
- 동작 extension
- 노드 extension

이 갈래는 다음 항목으로 나뉩니다.

- [[abenbdl_extensibility_enabling]] : extensibility(확장 허용). 확장하려면 먼저 확장당할 behavior definition 이나 BDEF extension 이 extension 을 명시적으로 허용해야 합니다.
- [[abenbdl_extensibility_managed_unm]] : base BDEF(기반 BDEF) extension. managed·unmanaged RAP BO 에 쓸 수 있는 extension 기능을 다룹니다.
- [[abenbdl_extensibility_projection]] : projection BDEF extension. projection 에 쓸 수 있는 extension 기능을 다룹니다.
- [[abenbdl_extensibility_abstract]] : abstract BDEF extension. abstract BDEF 에 쓸 수 있는 extension 기능을 다룹니다.
- [[abenbdl_extension_layering]] : extension 겹치기. BDEF extension 을 다시 확장할 때의 규칙입니다.

### 용어

extension 관련 항목에서는 다음 말을 정해진 뜻으로 씁니다.

| 말 | 뜻 |
| --- | --- |
| 기반 RAP BO, base BDEF | 구현 타입이 `managed` 또는 `unmanaged` 인 behavior definition |
| base BDEF extension | `managed` 또는 `unmanaged` behavior definition 을 확장하는 BDEF extension |
| 원래 (original) | "확장당하는 쪽"이라는 뜻. 확장당하는 RAP BO 에 속한 요소를 가리킵니다. 예를 들어 "원래 필드", "원래 작업"은 확장당하는 RAP BO 의 필드와 작업입니다. BDEF 의 타입이나 계층과 상관없이 쓰는 말이고, extension 과 확장당하는 객체를 구분하려고 씁니다. |

## 알아두기

- BDEF extension 은 원래 RAP BO 의 **릴리스 계약을 자동으로 물려받습니다.** 그래서 BDEF extension 도 그 릴리스 계약의 요건을 지켜야 하고, 안정적으로 유지해야 합니다.
- 이름 충돌을 막으려면 BDEF extension 자체와 그 안의 extension 요소 하나하나에, 확장당하는 요소와 겹치지 않는 별도 네임스페이스를 써야 합니다. SAP 나 파트너가 아닌 개발 시스템에서 만든 BDEF extension 에는 고객 네임스페이스 접두어 `Z` 또는 `ZZ` 를 씁니다.
- 필드 extension 과 노드 extension 을 하려면 데이터 모델(CDS entity(엔터티)) 쪽도 확장할 수 있게 되어 있어야 합니다.

## 관련 항목

- [[abenbdl_extensibility_enabling]]
- [[abenbdl_extensibility_managed_unm]]
- [[abenbdl_extensibility_projection]]
- [[abenbdl_extensibility_abstract]]
- [[abenbdl_extension_layering]]
- [[abenbdl_extensible]]
- [[abenbdl_extension_syntax]]
