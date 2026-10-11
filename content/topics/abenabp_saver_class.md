---
title: RAP saver class 와 메서드
summary: behavior pool 에서 save sequence 를 구현하는 saver class 와, 그 안에서 다시 정의하는 saver method 를 다루는 갈래입니다.
keywords: RAP saver class, saver method, 세이버 클래스, 세이버 메서드, CL_ABAP_BEHAVIOR_SAVER, CL_ABAP_BEHAVIOR_SAVER_FAILED, 저장 순서, save sequence, lsc, 동작 풀
---

## 설명

saver class(세이버 클래스)는 behavior pool(동작 풀)의 CCIMP 인클루드에 두는 로컬 클래스입니다. RAP BO 의 save sequence(저장 순서), 곧 `COMMIT ENTITIES` 같은 문으로 저장이 시작된 뒤 transactional buffer(트랜잭션 버퍼)의 내용을 점검하고 데이터베이스에 쓰기까지의 과정을 여기에 구현합니다.

saver class 는 기반 클래스를 상속해 만듭니다. 기반 클래스는 둘 가운데 하나를 고릅니다. 보통은 `CL_ABAP_BEHAVIOR_SAVER` 를 쓰고, late save phase(늦은 저장 단계)에서도 실패를 알려야 하는 예외적인 경우에만 `CL_ABAP_BEHAVIOR_SAVER_FAILED` 를 씁니다. saver method(세이버 메서드)는 새로 선언하지 않습니다. 기반 클래스에 미리 정의된 메서드를 `REDEFINITION` 으로 다시 정의합니다.

## 하위 항목

- [[abenabp_cl_abap_beh_saver]] — 기본 기반 클래스. saver class 를 선언하는 틀과 클래스의 성질
- [[abenabp_cl_abap_beh_saver_failed]] — late save phase 의 메서드에서도 `failed` 와 `reported` 를 쓸 수 있는 기반 클래스
- [[abenabp_saver_methods]] — `finalize`, `check_before_save`, `adjust_numbers`, `save`, `save_modified`, `cleanup` 같은 saver method 하나하나

## 관련 항목

- [[abenabap_behavior_pools]]
- [[abenabp_handler_class]]
- [[abapcommit_entities]]
