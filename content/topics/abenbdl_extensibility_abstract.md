---
title: abstract BDEF extension
summary: abstract BDEF 를 extension for abstract 문으로 넓히는 개발 객체이며, 기존 노드 extension, 새 노드 추가, 새 스칼라 entity 추가 세 가지를 할 수 있습니다.
keywords: abstract BDEF extension, 추상 BDEF 확장, extension for abstract, extend behavior for, define behavior for, scalar entity, 스칼라 엔터티, 계층 타입, extensible
---

## 설명

abstract BDEF extension(확장)은 abstract BDEF 를 넓히는 저장소 객체(개발 객체)입니다. `extension for abstract` 문으로 시작합니다.

abstract BDEF 에는 여러 노드로 이루어진 계층 타입이 있습니다. abstract BDEF extension 은 이미 있는 노드를 넓히거나, 그 계층 타입에 새 노드와 새 스칼라 entity(엔터티)를 보탭니다.

**전제 조건**: 확장하려는 abstract BDEF 가 extension 을 명시적으로 허용해야 합니다. 방법은 [[abenbdl_ext_enabling_abstract]] 에 있습니다.

### 할 수 있는 extension

| 하는 일 | 쓰는 문 |
| --- | --- |
| 이미 있는 노드를 확장합니다. | `extend behavior for AbstractEntity` |
| abstract BDEF 의 계층 타입에 새 노드를 보탭니다. | `define behavior for AbstractEntity` |
| 계층 타입에 새 스칼라 entity 를 보탭니다. | `scalar entity AbstractEntity` |

### 하위 항목

- [[abenbdl_extension_for_abstract]] : abstract BDEF extension 을 시작하는 문과 위 세 가지 extension 의 문법, 자세한 규칙

## 관련 항목

- [[abenbdl_extension_for_abstract]]
- [[abenbdl_ext_enabling_abstract]]
- [[abenbdl_extensibility_projection]]
- [[abenbdl_extensibility_managed_unm]]
- [[abenbdl_extension]]
