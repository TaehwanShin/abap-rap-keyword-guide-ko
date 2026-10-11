---
title: cleanup saver method
summary: save sequence 의 맨 마지막에 불려 transactional buffer 를 비우는 saver method 입니다.
keywords: cleanup, 세이버 메서드, saver method, 버퍼 비우기, 트랜잭션 버퍼, 늦은 저장 단계, late save phase, and cleanup, CL_ABAP_BEHAVIOR_SAVER, ROLLBACK ENTITIES
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS cleanup REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD cleanup.
      ...
      ENDMETHOD.
      ...
ENDCLASS.
```

## 설명

`cleanup` 은 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드(로컬 클래스를 적는 곳)에 둡니다. 미리 정해져 있는 메서드이므로 새로 만들지 않고 `REDEFINITION` 으로 다시 정의합니다. `base_class` 는 saver class 가 상속하는 기본 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

이 메서드의 성격은 다음과 같습니다.

- 써도 되고 안 써도 됩니다.
- late save phase(늦은 저장 단계)에 속합니다.
- save sequence(저장 순서)의 마지막 메서드입니다. transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)를 비우는 일을 맡습니다.
- 데이터를 데이터베이스에 저장한 뒤에 불립니다. `ROLLBACK ENTITIES` 로 되돌리기를 요청했을 때도 불립니다.
- `IMPORTING` 매개변수도 `CHANGING` 매개변수도 없습니다.

## 예제

unmanaged BO 에서 직접 만든 버퍼 `lcl_buffer=>mt_travel` 을 `save` 에서 데이터베이스에 쓰고, `cleanup` 에서 비웁니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save    REDEFINITION.
    METHODS cleanup REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save.
    " 버퍼에 모아 둔 여행을 테이블에 쓴다
    MODIFY ztravel FROM TABLE @lcl_buffer=>mt_travel.
  ENDMETHOD.

  METHOD cleanup.
    " 저장이 끝났으니 버퍼를 비운다
    CLEAR lcl_buffer=>mt_travel.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- interaction phase(상호작용 단계)에서 읽기만 하고 `COMMIT ENTITIES` 를 실행하면, saver method 가운데 `cleanup` 만 불립니다.
- managed BO 에서는 managed RAP BO provider(제공자)가 버퍼를 대신 비웁니다. 다만 BDEF 에 `with unmanaged save` 나 `with additional save` 를 쓰면서 `and cleanup` 을 붙였다면 직접 구현해야 합니다.
- unmanaged BO 에서는 늘 직접 구현해야 합니다.
- 이 메서드 안에서 쓸 수 없는 문과 작업은 [[abapinvalid_stmts_in_rap_methods]] 에 정리되어 있습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abensaver_method_save]]
- [[abapsaver_class_cleanup_finalize]]
- [[abenbdl_saving]]
- [[abenbdl_impl_type]]
- [[abaprollback_entities]]
- [[abapcommit_entities]]
- [[abenabp_saver_class_abexa]]
- [[abenabp_saver_ln_abexa]]
- [[abenrap_luw_abexa]]
