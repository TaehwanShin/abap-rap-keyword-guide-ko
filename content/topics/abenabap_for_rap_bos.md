---
title: RAP business object 를 위한 ABAP
summary: RAP BO 를 제공하는 쪽과 사용하는 쪽에서 쓰는 ABAP 언어 요소를 한눈에 정리한 개요입니다.
keywords: ABAP for RAP Business Objects, RAP BO, RAP 비즈니스 객체, 동작 풀, ABP, EML, 트랜잭션 버퍼, transactional buffer, 관리형, 비관리형, managed, unmanaged, RAP BO 제공자, RAP BO 사용자
---

## 설명

이 갈래는 RAP business object(비즈니스 객체, RAP BO)를 **제공**하고 **사용**할 때 쓰는 ABAP 언어 요소를 다룹니다.

RAP BO 의 모습은 주로 behavior definition(동작 정의, BDEF)가 정합니다. behavior definition 은 두 가지를 정합니다.

- RAP BO 의 작업. 생성·읽기·수정·삭제(CRUD)와 그 밖의 action 입니다.
- RAP BO 의 제공 방식. managed 이거나 unmanaged 입니다.

### transactional buffer

RAP BO 의 데이터는 transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)에 들어 있습니다. RAP BO 의 작업은 이 버퍼를 대상으로 움직이고, REST 방식을 따라야 합니다.

| 제공 방식 | 버퍼는 누가 다루나 |
| --- | --- |
| managed | RAP BO provider(제공자)가 버퍼를 만들고 다룹니다. 표준이 아닌 작업을 직접 구현할 때는 EML 문으로 이 버퍼에 접근합니다. |
| unmanaged | 버퍼도 작업도 ABAP behavior implementation(동작 구현)에서 직접 만들어야 합니다. 버퍼를 어떻게 만들고 다룰지 문법으로 정해진 제약은 없지만, RAP BO consumer(사용자)가 기대하는 대로 움직여야 합니다. |

### 누가 작업을 부르나

RAP BO 의 작업은 RAP BO consumer 가 부릅니다. 사용자는 둘 가운데 하나입니다.

- AS ABAP 바깥에서 온 요청을 처리하는 RAP 런타임 프레임워크
- ABAP EML 을 쓰는 ABAP 프로그램

### 제공하는 쪽과 사용하는 쪽의 언어 요소

- **제공하는 쪽**: ABAP behavior implementation 에 필요한 요소입니다.
  - behavior pool(동작 풀, ABP)은 표준이 아닌 RAP BO 작업을 구현하는 특별한 클래스 풀입니다. behavior pool 의 클래스가 managed 또는 unmanaged transactional buffer 에 접근합니다.
  - managed 버퍼에 접근할 때는 behavior implementation 안에서 ABAP EML 을 써야 합니다. behavior implementation 안에서만 쓸 수 있는 EML 변형도 있습니다.
- **사용하는 쪽**: 어느 ABAP 프로그램에서나 RAP BO 에 접근할 때 쓰는 ABAP EML(Entity Manipulation Language)입니다. EML 문은 transactional buffer 를 대상으로 움직이는 RAP BO 작업을 부릅니다. 그 작업은 managed RAP BO provider 가 구현했을 수도 있고, ABAP behavior implementation(unmanaged)에 들어 있을 수도 있습니다.

## 하위 항목

- [[abenabap_provide_rap_bos]] — behavior pool, behavior pool 안에서 쓰는 EML, 핸들러·saver method(세이버 메서드)의 제약
- [[abenabap_consume_rap_bos]] — ABAP 프로그램에서 EML 로 RAP BO 를 읽고 바꾸는 방법
- [[abenrpm_derived_types]] — behavior definition 에서 자동으로 만들어지는 BDEF derived type(BDEF 파생 타입)
- [[abenrap_events]] — RAP business event 를 일으키고 받는 ABAP 요소
- [[abenabap_rap_other]] — 그 밖에 RAP 와 관련된 ABAP 언어 요소와 주제
