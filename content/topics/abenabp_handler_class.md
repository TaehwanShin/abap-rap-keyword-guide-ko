---
title: RAP handler class 와 메서드
summary: behavior pool 에서 interaction phase 를 구현하는 handler class 와, 그 안에 선언하는 handler method 를 다루는 갈래입니다.
keywords: RAP handler class, handler method, 핸들러 클래스, 핸들러 메서드, CL_ABAP_BEHAVIOR_HANDLER, METHODS FOR, 동작 풀, 상호작용 단계, lhc
---

## 설명

handler class(핸들러 클래스)는 behavior pool(동작 풀)의 CCIMP 인클루드에 두는 로컬 클래스입니다. RAP BO 의 interaction phase(상호작용 단계), 곧 읽기·생성·수정·삭제·action 같은 작업이 들어왔을 때의 처리를 여기에 구현합니다.

이 갈래는 두 가지를 다룹니다. 하나는 클래스의 틀입니다. handler class 는 `CL_ABAP_BEHAVIOR_HANDLER` 를 상속해 만듭니다. 다른 하나는 그 안에 넣는 메서드입니다. handler method(핸들러 메서드)는 `METHODS ... FOR MODIFY`, `FOR READ`, `FOR LOCK` 처럼 RAP 전용 낱말을 붙여 선언하고, 매개변수에는 BDEF derived type(BDEF 파생 타입)을 씁니다. determination, validation, 권한, feature control(기능 제어), numbering, precheck 처럼 일의 종류마다 선언 문법이 따로 있습니다.

## 하위 항목

- [[abenabp_cl_abap_beh_handler]] — handler class 를 선언하는 틀과 클래스의 성질
- [[abapmethods_for_rap_behv]] — handler method 를 선언하는 `METHODS ... FOR` 문법과 종류별 변형

## 관련 항목

- [[abenabap_behavior_pools]]
- [[abenabp_saver_class]]
- [[abenrap_handler_methods_abexa]]
