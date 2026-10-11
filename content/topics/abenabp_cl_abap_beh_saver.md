---
title: RAP saver class (CL_ABAP_BEHAVIOR_SAVER)
summary: behavior pool 의 로컬 클래스가 CL_ABAP_BEHAVIOR_SAVER 를 상속하면 save sequence 의 saver method 를 다시 정의하는 saver class 가 됩니다.
keywords: CL_ABAP_BEHAVIOR_SAVER, RAP saver class, 세이버 클래스, lsc, finalize, check_before_save, adjust_numbers, save, save_modified, map_messages, cleanup, cleanup_finalize, REDEFINITION, 저장 순서
---

## 문법

[[abenbdl_impl_type|unmanaged]] 시나리오. `adjust_numbers` 는 [[abenbdl_late_numbering|late numbering]] 을 쓸 때만 있습니다.

```syntax
CLASS lsc_bdef DEFINITION
  INHERITING FROM CL_ABAP_BEHAVIOR_SAVER [ABSTRACT] [FINAL].
  PROTECTED SECTION.
     [METHODS finalize REDEFINITION.]
     [METHODS check_before_save REDEFINITION.]
      METHODS adjust_numbers REDEFINITION.
      METHODS save REDEFINITION.
     [METHODS map_messages REDEFINITION.]
     [METHODS cleanup REDEFINITION.]
     [METHODS cleanup_finalize REDEFINITION.]
ENDCLASS.

CLASS lsc_bdef IMPLEMENTATION.
     [METHOD finalize. ... ENDMETHOD.]
     [METHOD check_before_save. ... ENDMETHOD.]
      METHOD adjust_numbers. ... ENDMETHOD.
      METHOD save. ... ENDMETHOD.
     [METHOD map_messages. ... ENDMETHOD.]
     [METHOD cleanup. ... ENDMETHOD.]
     [METHOD cleanup_finalize. ... ENDMETHOD.]
ENDCLASS.
```

[[abenbdl_saving|additional save 또는 unmanaged save]] 를 쓰는 managed 시나리오. 여기서도 `adjust_numbers` 는 late numbering 을 쓸 때만 있습니다.

```syntax
CLASS lsc_bdef DEFINITION
  INHERITING FROM CL_ABAP_BEHAVIOR_SAVER [ABSTRACT] [FINAL].
  PROTECTED SECTION.
     METHODS adjust_numbers REDEFINITION.
     METHODS save_modified REDEFINITION.
    [METHODS cleanup REDEFINITION.]
ENDCLASS.

CLASS lsc_bdef IMPLEMENTATION.
      METHOD adjust_numbers. ... ENDMETHOD.
      METHOD save_modified. ... ENDMETHOD.
     [METHOD cleanup. ... ENDMETHOD.]
ENDCLASS.
```

## 설명

`CL_ABAP_BEHAVIOR_SAVER` 는 behavior pool(동작 풀)의 saver class(세이버 클래스) `lsc_bdef` 가 상속하는 기반 클래스입니다. saver class 는 behavior pool 의 CCIMP 인클루드에 정의해야 합니다.

### saver method

saver method(세이버 메서드)는 새로 짓지 않습니다. 기반 클래스에 미리 정의된 메서드를 `REDEFINITION` 으로 다시 정의합니다. 꼭 구현해야 하는 메서드가 있고, 골라서 구현하는 메서드가 있습니다. saver method 에는 response parameter(응답 매개변수)가 암묵적으로 들어 있습니다. 어떤 response parameter 가 있는지는 메서드마다 다릅니다. [[abensaver_method_cleanup|cleanup]] 과 [[abapsaver_class_cleanup_finalize|cleanup_finalize]] 에는 매개변수가 하나도 없습니다.

| 메서드 | unmanaged | managed (additional save·unmanaged save) |
| --- | --- | --- |
| [[abensaver_finalize|finalize]] | 선택 | - |
| [[abensaver_check_before_save|check_before_save]] | 선택 | - |
| [[abensaver_adjust_numbers|adjust_numbers]] | late numbering 일 때 | late numbering 일 때 |
| [[abensaver_method_save|save]] | 필수 | - |
| [[abaprap_saver_meth_save_modified|save_modified]] | - | 필수 |
| [[abensaver_map_messages|map_messages]] | 선택 | - |
| [[abensaver_method_cleanup|cleanup]] | 선택 | 선택 |
| [[abapsaver_class_cleanup_finalize|cleanup_finalize]] | 선택 | - |

`-` 는 그 시나리오의 문법 틀에 나오지 않는다는 뜻입니다.

### 언제 불리나

saver method 는 save sequence(저장 순서)가 시작된 뒤에 불립니다. save sequence 는 예를 들어 [[abapcommit_entities|COMMIT ENTITIES]] 문으로 시작됩니다. 다만 지금 RAP 트랜잭션에서 데이터를 한 번이라도 성공적으로 바꾼 적이 있어야 불립니다.

`cleanup` 은 여기서 벗어납니다. `cleanup` 항목의 원문은 interaction phase(상호작용 단계)에서 읽기만 하고 `COMMIT ENTITIES` 를 실행하면 `cleanup` 만 불린다고 적고 있습니다. [[abaprollback_entities|ROLLBACK ENTITIES]] 로 되돌리기를 요청했을 때도 `cleanup` 이 불립니다.

saver class 는 따로 적지 않아도 `ABSTRACT` 이면서 `FINAL` 입니다. 인스턴스를 만들고 메서드를 부르는 일은 RAP 런타임 엔진만 하기 때문입니다.

### 인스턴스 데이터는 버퍼에서 가져옵니다

[[abapmethods_for_rap_behv|handler method]] 와 달리 saver method 는 RAP BO 인스턴스의 데이터를 입력 매개변수로 받지 않습니다. [[abaprap_saver_meth_save_modified|save_modified]] 만 예외입니다. 그래서 saver method 를 직접 구현할 때는 인스턴스 데이터를 transactional buffer(트랜잭션 버퍼)에서 꺼내 다뤄야 합니다.

## 예제

unmanaged 여행 RAP BO 의 saver class 입니다. handler method(핸들러 메서드)가 `lcl_buffer`(직접 만든 transactional buffer 클래스)에 모아 둔 내용을 저장합니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS finalize          REDEFINITION.
    METHODS check_before_save REDEFINITION.
    METHODS save              REDEFINITION.
    METHODS cleanup           REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD finalize.
    " 저장 직전에 마지막으로 값을 채운다
  ENDMETHOD.

  METHOD check_before_save.
    " 버퍼의 내용이 저장해도 되는 상태인지 확인한다
  ENDMETHOD.

  METHOD save.
    " 버퍼에 모아 둔 여행을 데이터베이스에 쓴다
    MODIFY ztravel FROM TABLE @lcl_buffer=>mt_travel_db.
  ENDMETHOD.

  METHOD cleanup.
    " 버퍼를 비운다
    CLEAR lcl_buffer=>mt_travel_db.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- `CL_ABAP_BEHAVIOR_SAVER` 는 behavior pool 에서 saver method 를 다시 정의하는 데에만 쓸 수 있습니다.
- RAP BO 하나에 saver class 는 하나만 구현할 수 있습니다.
- save sequence 가 실행될 때의 흐름은 ABAP RESTful Application Programming Model 개발 안내서의 "Save Sequence Runtime" 절에 있습니다.
- 실행 예제가 넷 있습니다.
  - [[abenabp_saver_class_abexa]] — 단순한 unmanaged RAP BO 의 saver method
  - [[abenabp_saver_ln_abexa]] — late numbering 을 쓰는 unmanaged RAP BO. `adjust_numbers` 도 나옵니다.
  - [[abensave_modified_add_save_abexa]] — `with additional save` 로 선언한 managed RAP BO 의 `save_modified`
  - [[abenrap_managed_unm_save_abexa]] — `with unmanaged save` 로 선언한 managed RAP BO 의 `save_modified`

## 관련 항목

- [[abenabp_saver_methods]]
- [[abenabp_cl_abap_beh_saver_failed]]
- [[abenabp_cl_abap_beh_handler]]
- [[abenbdl_saving]]
- [[abenbdl_late_numbering]]
- [[abapcommit_entities]]
