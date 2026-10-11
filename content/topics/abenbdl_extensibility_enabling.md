---
title: BDEF extensibility
summary: behavior definition 은 extension 을 명시적으로 허용해야만 BDEF extension 을 붙일 수 있으며, 이 갈래는 BDEF 종류별로 extension 을 허용하는 방법을 다룹니다.
keywords: extensibility enabling, 확장 허용, 확장 가능 설정, extensible, BDEF extension, BDEF 확장, extension point, 확장 지점, extension layering, 확장 겹치기, managed, unmanaged, interface, projection, abstract
---

## 설명

RAP behavior definition(동작 정의)에 BDEF extension(확장)을 붙이려면, 그 behavior definition 이 **extension 을 명시적으로 허용**해야 합니다. 기술 요건을 갖추고, 어디에 무엇을 덧붙일 수 있는지 extension 지점을 정해 두어야 합니다. 그렇게 하지 않은 behavior definition 에는 BDEF extension 을 붙일 수 없습니다.

허용은 키워드 `extensible` 로 합니다. 다만 BDEF의 종류에 따라 `extensible` 을 적는 자리와 허용되는 범위가 다릅니다. 이 갈래는 종류별로 그 방법을 설명합니다.

- [[abenbdl_extensibility_enabling_m_u]] : managed·unmanaged base BO(기반 BO)에서 extension 을 허용하는 방법
- [[abenbdl_extensibility_enablng_intf]] : RAP BO interface 에서 extension 을 허용하는 방법
- [[abenbdl_ext_enabling_projection]] : projection BDEF에서 extension 을 허용하는 방법
- [[abenbdl_ext_enabling_abstract]] : abstract BDEF에서 extension 을 허용하는 방법
- [[abenbdl_extensibility_enabling_ext]] : BDEF extension 자체를 다시 확장할 수 있게 허용하는 방법 (extension 겹치기)

## 알아두기

- 여기서 다루는 것은 **동작** 쪽 허용입니다. 필드 extension 과 노드 extension 을 하려면 RAP 데이터 모델도 extension 을 허용해야 합니다. 그 내용은 ABAP CDS 문서의 CDS entity(엔터티) extension 에서 다룹니다.
- 더 자세한 안내는 RAP 개발 가이드의 "Extensibility-Enablement for Behavior Extensions" 절에 있습니다.

## 관련 항목

- [[abenbdl_extension]]
- [[abenbdl_extensible]]
- [[abenbdl_with_friends]]
- [[abenbdl_extension_layering]]
