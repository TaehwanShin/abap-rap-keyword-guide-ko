---
title: RAP business object 를 제공하는 ABAP
summary: RAP BO 의 동작을 직접 구현할 때 쓰는 ABAP 요소, 곧 behavior pool 과 그 안에서 쓰는 EML, 메서드 안 제약을 모은 갈래입니다.
keywords: ABAP for Providing RAP Business Objects, RAP BO 제공, 동작 풀, ABP, behavior pool, EML, 핸들러 메서드, 세이버 메서드, 동작 구현, 제약
---

## 설명

이 갈래는 RAP BO 를 **제공하는 쪽**, 곧 동작을 직접 구현하는 개발자가 쓰는 ABAP 요소를 다룹니다.

behavior definition(동작 정의, BDEF)에 적은 action, determination, validation 이나 unmanaged RAP BO 의 작업은 ABAP 코드로 구현해야 합니다. 이 코드는 behavior pool(동작 풀, ABP)이라는 특별한 클래스 풀에 들어갑니다. behavior pool 안에서는 RAP BO consumer(사용자)가 쓰는 EML 말고도 구현하는 쪽에서만 쓸 수 있는 EML 변형이 있습니다. 또 handler method(핸들러 메서드)와 saver method(세이버 메서드) 안에서는 쓸 수 없는 ABAP 문이 정해져 있습니다.

## 하위 항목

- [[abenabap_behavior_pools]] — behavior pool 의 전역 클래스, handler class(핸들러 클래스), saver class(세이버 클래스)와 그 메서드
- [[abeneml_in_abp]] — behavior implementation(동작 구현) 안에서 RAP BO 를 다룰 때 쓰는 EML
- [[abapinvalid_stmts_in_rap_methods]] — RAP handler method 와 saver method 에서 쓸 수 없는 문과 작업

## 관련 항목

- [[abenabap_for_rap_bos]]
- [[abenabap_consume_rap_bos]]
