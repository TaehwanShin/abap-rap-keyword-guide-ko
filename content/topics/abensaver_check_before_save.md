---
title: check_before_save saver method
summary: 데이터베이스에 쓰기 전에 transactional buffer 가 일관된 상태인지 마지막으로 확인하는, 골라서 구현하는 saver method 입니다.
keywords: check_before_save, 세이버 메서드, saver method, 이른 저장 단계, early save phase, failed, reported, TYPE RESPONSE FOR FAILED LATE, 저장 전 점검, cleanup_finalize, 검증
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS check_before_save REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD check_before_save.
      ...
      ENDMETHOD
      ...
ENDCLASS.
```

## 설명

`check_before_save` 는 behavior pool(동작 풀)의 CCIMP 인클루드에 있는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. 기반 클래스에 미리 정의된 메서드를 다시 정의해야 합니다. `base_class` 는 saver class 가 상속하는 기반 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

- 구현은 선택입니다.
- early save phase(이른 저장 단계)에 속합니다.

### 하는 일

late save phase(늦은 저장 단계)로 넘어가기 전에 transactional buffer(트랜잭션 버퍼)가 일관된 상태인지 확인합니다. 저장에 참여하는 모든 RAP BO 가 문제없이 저장되게 하려는 것입니다.

[[abenbdl_impl_type|managed]] 시나리오에서는 `check_before_save` 가 불리는 동안 [[abenbdl_validations|validation]] 이 실행됩니다.

### 오류를 돌려주면

메서드가 `failed` 에 오류를 담아 돌려주면 save sequence(저장 순서)는 거기서 끝납니다. 이어서 [[abapsaver_class_cleanup_finalize|cleanup_finalize]] 메서드가 불립니다. 원문은 이 메서드가 지금 RAP 트랜잭션에서 바꾼 데이터를 버리고 transactional buffer 를 치운다고 적고 있습니다.

다만 managed RAP BO 로 만든 원문 예제 [[abencl_abap_beh_saver_failed_abexa]] 에서는 결과가 다릅니다. early save phase 에서 validation 이 실패한 인스턴스가 transactional buffer 에 그대로 남아 있고, 예제는 그 인스턴스를 고쳐서 다시 저장합니다.

### 매개변수

다음 `CHANGING` 매개변수가 암묵적으로 들어 있습니다. 이름은 정해져 있습니다.

| 매개변수 | 타입 |
| --- | --- |
| `failed` | [[abaptype_response_for|TYPE RESPONSE FOR FAILED LATE]] |
| `reported` | [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]] |

## 예제

unmanaged 여행 RAP BO 입니다. 저장하기 전에 버퍼에서 바뀐 여행을 모두 살펴, 종료일이 시작일보다 빠른 여행이 있으면 저장을 멈춥니다. `lcl_buffer` 는 직접 만든 transactional buffer 클래스입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS check_before_save REDEFINITION.
    METHODS save              REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD check_before_save.
    LOOP AT lcl_buffer=>mt_travel INTO DATA(ls_travel)
         WHERE changed = abap_true.
      IF ls_travel-enddate >= ls_travel-begindate.
        CONTINUE.
      ENDIF.

      " failed 에 항목이 들어가면 save sequence 가 끝난다
      APPEND VALUE #( travelid = ls_travel-travelid ) TO failed-travel.
      APPEND VALUE #( travelid = ls_travel-travelid
                      %msg     = new_message_with_text(
                                   severity = if_abap_behv_message=>severity-error
                                   text     = '종료일이 시작일보다 빠릅니다.' ) )
             TO reported-travel.
    ENDLOOP.
  ENDMETHOD.

  METHOD save.
    " 점검을 통과한 버퍼 내용을 데이터베이스에 쓴다
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- saver method 는 인스턴스 데이터를 입력 매개변수로 받지 않습니다. 점검할 데이터는 transactional buffer 에서 꺼냅니다.
- save sequence 가 실행될 때의 흐름은 ABAP RESTful Application Programming Model 개발 안내서의 "Save Sequence Runtime" 절에 있습니다. 원문은 "Invalid Statements and Operations in Transactional Contexts"(트랜잭션 문맥에서 쓸 수 없는 문과 작업) 주제도 함께 보라고 안내합니다.
- 실행 예제가 있습니다.
  - [[abenabp_saver_class_abexa]] — 단순한 unmanaged RAP BO 의 saver class
  - [[abenabp_saver_ln_abexa]], [[abenrap_luw_abexa]] — late numbering 을 쓰는 unmanaged RAP BO. `adjust_numbers` 도 함께 나옵니다.

## 관련 항목

- [[abenabp_cl_abap_beh_saver]]
- [[abenabp_saver_methods]]
- [[abapsaver_class_cleanup_finalize]]
- [[abensaver_finalize]]
- [[abenbdl_validations]]
- [[abapinvalid_stmts_in_rap_methods]]
- [[abaptype_response_for]]
