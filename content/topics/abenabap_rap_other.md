---
title: 그 밖의 RAP 관련 ABAP 언어 요소와 주제
summary: type mapping, RAP 관련 시스템 클래스, RAP 구현 규칙, 종합 예제처럼 앞의 갈래에 들어가지 않는 RAP 관련 ABAP 주제를 모은 곳입니다.
keywords: other RAP-related ABAP language elements, 그 밖의 RAP 주제, type mapping, 타입 매핑, system classes, 시스템 클래스, CL_ABAP_BEHV_AUX, RAP implementation rules, 구현 규칙, RAP examples, 예제
---

## 설명

EML 문이나 behavior pool(동작 풀) 문법처럼 큰 갈래에 들어가지 않는 RAP 관련 ABAP 주제를 모아 둔 곳입니다. 네 가지를 다룹니다.

RAP BO 는 BDEF derived type(BDEF 파생 타입)으로 데이터를 주고받습니다. 그런데 기존 코드는 다른 타입을 쓰는 일이 많습니다. type mapping 갈래는 이 둘 사이를 잇는 문법을 다룹니다. 시스템 클래스 갈래는 지금 도는 handler method(핸들러 메서드)가 어떤 상황에서 불렸는지 알아내는 클래스를 소개합니다. 구현 규칙 갈래는 RAP BO provider(제공자)와 consumer(사용자)가 지켜야 하는 약속(RAP BO 계약)을 어겼을 때 무엇이 걸리는지 정리합니다. 마지막 갈래는 여러 EML 문을 한꺼번에 써 보는 긴 예제 모음입니다.

이 갈래의 항목은 다음과 같습니다.

- [[abapeml_type_mapping]] : BDEF derived type 과 그렇지 않은 타입 사이에서 값과 `%control` 정보를 옮기는 문법입니다. `CORRESPONDING` 변형, ABAP SQL 의 `MAPPING FROM ENTITY`, `SET FLAGS`, `SET NAMES` 가 있습니다.
- [[abaprap_system_classes]] : RAP 에서 쓰는 시스템 클래스입니다. 지금 단계와 호출 상황을 알려 주는 `CL_ABAP_BEHV_AUX` 를 다룹니다.
- [[abaprap_impl_rules]] : RAP BO 계약 점검이 잡아내는 위반 사례를 모은 표입니다.
- [[abapeml_examples_abexas]] : managed·unmanaged RAP BO, draft, late numbering, 트랜잭션 단계를 실제로 돌려 보는 종합 예제입니다.
