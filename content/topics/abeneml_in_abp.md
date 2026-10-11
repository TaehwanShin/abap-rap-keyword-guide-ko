---
title: ABAP EML - RAP BO provider 가 쓰는 EML
summary: behavior implementation 안에서만 쓸 수 있는 EML 요소인 IN LOCAL MODE, MODIFY AUGMENTING, RAISE ENTITY EVENT 를 모아 둔 갈래입니다.
keywords: EML, ABAP EML, 동작 구현, behavior implementation, RAP BO 제공자, IN LOCAL MODE, MODIFY AUGMENTING, RAISE ENTITY EVENT, RAP BO 계약, RAP BO contract
---

## 설명

EML 문 대부분은 어느 ABAP 프로그램에서나 쓸 수 있습니다. 그런데 몇 가지는 RAP BO 를 **제공하는 쪽**, 곧 behavior implementation(동작 구현) 안에서만 쓸 수 있습니다. 이 갈래는 그런 요소 세 가지를 다룹니다.

자기 BO 를 다시 읽거나 고칠 때 점검을 건너뛰는 것, projection 에서 아래 BO 로 가는 요청에 값을 보태는 것, business event 를 일으키는 것이 여기에 해당합니다.

## 하위 항목

- [[abapin_local_mode]] — 자기 BO 에 보내는 `READ` 와 `MODIFY` 에서 feature control(기능 제어), 권한 확인, precheck 를 건너뜁니다.
- [[abapmodify_aug_entity_entities]] — projection 의 핸들러에서 base BO(기반 BO) 로 가는 요청에 값이나 작업을 보탭니다.
- [[abapraise_entity_event]] — business event 를 일으킵니다.

## 알아두기

- RAP 작업을 구현할 때는 RAP BO 계약(RAP BO provider(제공자)가 지켜야 하는 구현 규칙)을 지켜야 합니다. 자세한 지침은 SAP 의 ABAP RESTful Application Programming Model 개발 가이드 "RAP Business Object Contract" 절에 있습니다.
- 그 가운데 골라 놓은 지침은 [[abaprap_impl_rules]] 에서 볼 수 있습니다.

## 관련 항목

- [[abeneml]]
- [[abenabap_provide_rap_bos]]
- [[abaprap_impl_rules]]
