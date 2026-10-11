---
title: save saver method
summary: unmanaged BO 에서 transactional buffer 에 모인 인스턴스를 데이터베이스에 쓰는, 반드시 구현해야 하는 saver method 입니다.
keywords: save, 세이버 메서드, saver method, 저장, 비관리형, unmanaged, 늦은 저장 단계, late save phase, 트랜잭션 버퍼, reported, REPORTED LATE, CL_ABAP_BEHAVIOR_SAVER
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS save REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD save.
      ...
      ENDMETHOD.
      ...
ENDCLASS.
```

## 설명

`save` 는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드에 둡니다. 미리 정해져 있는 메서드이므로 `REDEFINITION` 으로 다시 정의합니다. `base_class` 는 saver class 가 상속하는 기본 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

이 메서드의 성격은 다음과 같습니다.

- 반드시 구현해야 합니다.
- unmanaged RAP BO provider(제공자)에서 쓸 수 있습니다.
- late save phase(늦은 저장 단계)에 속합니다.
- transactional buffer(트랜잭션 버퍼)의 지금 상태를 데이터베이스에 씁니다. 지금 RAP 트랜잭션에 들어 있는 모든 인스턴스가 대상이고, 다른 BO 와 이어진 관계로 딸려 온 인스턴스도 포함됩니다.
- 앞선 saver method 가 하나도 실패하지 않고 모두 끝났을 때만 불립니다.

기본 클래스가 `CL_ABAP_BEHAVIOR_SAVER` 일 때는 미리 정해진 `CHANGING` 매개변수가 하나 있습니다. `reported` 이고 타입은 [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]] 입니다.

## 예제

handler method(핸들러 메서드)가 버퍼 클래스 `lcl_buffer` 에 모아 둔 변경 내용을 테이블 `ztravel` 에 씁니다. 저장을 마쳤다는 메시지도 `reported` 에 담습니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save    REDEFINITION.
    METHODS cleanup REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save.
    " 새로 만들었거나 고친 여행을 쓴다
    MODIFY ztravel FROM TABLE @lcl_buffer=>mt_travel.

    " 지우기로 한 여행을 지운다
    DELETE ztravel FROM TABLE @lcl_buffer=>mt_travel_deleted.

    LOOP AT lcl_buffer=>mt_travel INTO DATA(ls_travel).
      APPEND VALUE #( travelid = ls_travel-travel_id
                      %msg     = new_message_with_text(
                                   severity = if_abap_behv_message=>severity-success
                                   text     = '여행을 저장했습니다.' ) )
             TO reported-travel.
    ENDLOOP.
  ENDMETHOD.

  METHOD cleanup.
    " 다음 트랜잭션에 찌꺼기가 남지 않도록 버퍼를 비운다
    CLEAR: lcl_buffer=>mt_travel, lcl_buffer=>mt_travel_deleted.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 데이터베이스에 쓴 뒤에는 transactional buffer 를 비우는 것이 좋습니다. 같은 ABAP 세션이 RAP 트랜잭션 여러 개에 쓰일 수 있어서, 버퍼에 남은 변경 내용이 데이터를 어긋나게 만들 수 있기 때문입니다. [[abensaver_method_cleanup|cleanup]] 메서드를 직접 구현할 수 있다면 거기서 비웁니다.
- managed BO 에 `with additional save` 나 `with unmanaged save` 를 쓴 때에는 `save` 를 쓸 수 없고 [[abaprap_saver_meth_save_modified|save_modified]] 를 씁니다.
- 이 메서드 안에서 쓸 수 있는 문과 쓸 수 없는 문은 [[abapinvalid_stmts_in_rap_methods]] 에 정리되어 있습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abaprap_saver_meth_save_modified]]
- [[abensaver_method_cleanup]]
- [[abaptype_response_for]]
- [[abenabp_saver_class_abexa]]
- [[abenabp_saver_ln_abexa]]
