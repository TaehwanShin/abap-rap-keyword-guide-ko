---
title: extension 겹치기 (extension layering)
summary: BDEF extension 을 또 다른 BDEF extension 으로 다시 확장하는 것을 말하며, 이때 따르는 규칙을 정리합니다.
keywords: extension layering, 확장 겹치기, 확장의 확장, BDEF extension, BDEF 확장, extensible, 확장 범위, 확장 허용, release contract, 릴리스 계약
---

## 설명

BDEF extension(확장)을 다른 BDEF extension 으로 다시 확장할 수 있습니다. 이것을 **extension 겹치기**라고 합니다. 먼저 확장되는 쪽 BDEF extension 이 스스로 extension 을 허용하고 있어야 합니다. 허용하는 방법은 [[abenbdl_extensibility_enabling_ext]] 에 있습니다.

다른 extension 을 확장하는 BDEF extension 에는 다음 규칙이 적용됩니다.

### extension 대상은 언제나 원래 RAP BO 입니다

BDEF extension 은 다른 extension 위에 얹히는 것처럼 보여도 언제나 원래 RAP BO 를 확장합니다. 새 extension 을 만들면 원래 RAP BO 와 이미 있는 extension 이 모두 하나로 합쳐지고, 이렇게 합쳐진 것이 확장할 수 있는 범위가 됩니다.

### extension 을 허용할지는 그 구성요소를 정의한 객체가 정합니다

확장할 수 있는 구성요소를 정의한 리포지토리 객체가 extension 범위를 정합니다. 예를 들어 어떤 BDEF extension 이 extension 노드를 정의했다면, 그 노드를 어디까지 확장할 수 있는지는 그 BDEF extension 의 허용 설정을 따릅니다. 그 BDEF extension 이 `validations on save` 를 허용하면 이 entity(엔터티)에 저장 시점 validation 을 덧붙일 수 있습니다. 이때 원래 RAP BO 의 허용 설정은 상관없습니다.

이 규칙은 RAP BO entity 뿐 아니라 type mapping, determine action 같은 다른 extension 가능 구성요소에도 똑같이 적용됩니다.

### 기술적으로는 보통 extension 과 같습니다

다른 extension 을 확장하는 BDEF extension 도 보통 extension 이고, 특별한 규칙은 없습니다. 보통 extension 처럼 원래 RAP BO 를 가리키고, extension 이 허용된 구성요소는 모두 확장할 수 있으며, 쓸 수 있는 기능 범위도 같습니다. BDEF extension 의 일반 규칙은 종류에 따라 다음 항목에 있습니다.

- [[abenbdl_extensibility_managed_unm]] — 기본 BDEF extension
- [[abenbdl_extensibility_projection]] — projection BDEF extension
- [[abenbdl_extensibility_abstract]] — abstract BDEF extension

### 릴리스 계약을 물려받습니다

BDEF extension 은 원래 RAP BO 의 릴리스 계약(release contract)을 자동으로 물려받습니다. 그래서 extension 도 릴리스 계약의 조건을 지켜야 하고, 한번 내놓은 뒤에는 안정적으로 유지해야 합니다.

## 알아두기

- 확장되는 BDEF extension 이 extension 을 허용하지 않으면 extension 겹치기를 할 수 없습니다.
- extension 노드처럼 extension 이 정의한 구성요소는 원래 RAP BO 가 아니라 그 extension 의 허용 설정을 봅니다.
- 더 자세한 내용은 ABAP RESTful Application Programming Model 개발 안내서의 "About RAP Extensibility" 절에 있습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling_ext]]
- [[abenbdl_extensibility_managed_unm]]
- [[abenbdl_extensibility_projection]]
- [[abenbdl_extensibility_abstract]]
- [[abenbdl_extension_for_abstract]]
