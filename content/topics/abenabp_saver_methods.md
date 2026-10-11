---
title: RAP saver method
summary: saver class 에서 다시 정의해 save sequence 의 각 단계를 구현하는, 이름이 정해진 메서드들을 모은 갈래입니다.
keywords: RAP saver methods, 세이버 메서드, finalize, check_before_save, adjust_numbers, save, save_modified, map_messages, cleanup, cleanup_finalize, 저장 순서, 이른 저장 단계, 늦은 저장 단계
---

## 설명

saver method(세이버 메서드)는 [[abenabp_cl_abap_beh_saver|saver class]] 가 기반 클래스에서 물려받아 `REDEFINITION` 으로 다시 정의하는 메서드입니다. 이름과 매개변수가 미리 정해져 있고, save sequence(저장 순서)가 시작되면 RAP 런타임 엔진이 부릅니다.

메서드마다 save sequence 에서 맡는 자리가 다릅니다. 저장해도 되는지 살피는 early save phase(이른 저장 단계)의 메서드가 있고, 키를 확정하고 데이터베이스에 쓰는 late save phase(늦은 저장 단계)의 메서드가 있으며, 끝난 뒤 버퍼를 치우는 메서드가 있습니다. 어떤 메서드를 꼭 구현해야 하는지는 RAP BO 가 unmanaged 인지, additional save 나 unmanaged save 를 쓰는 managed 인지, late numbering 을 쓰는지에 따라 달라집니다.

## 하위 항목

- [[abensaver_adjust_numbers]] — late numbering 에서 임시 키를 최종 키 값으로 바꿉니다
- [[abensaver_check_before_save]] — 저장하기 전에 transactional buffer(트랜잭션 버퍼)가 일관된 상태인지 확인합니다
- [[abensaver_method_cleanup]] — `cleanup` saver method
- [[abapsaver_class_cleanup_finalize]] — `cleanup_finalize` saver method. `finalize` 나 `check_before_save` 에서 문제가 생겼을 때 불립니다
- [[abensaver_finalize]] — `finalize` saver method
- [[abensaver_map_messages]] — `map_messages` saver method
- [[abensaver_method_save]] — `save` saver method. unmanaged RAP BO 에서 씁니다
- [[abaprap_saver_meth_save_modified]] — `save_modified` saver method. saver class(세이버 클래스)가 있는 managed RAP BO 에서 씁니다
- [[abenrap_saver_methods_abexas]] — saver method 실행 예제 모음

## 관련 항목

- [[abenabp_saver_class]]
- [[abenabp_cl_abap_beh_saver]]
- [[abenabp_cl_abap_beh_saver_failed]]
