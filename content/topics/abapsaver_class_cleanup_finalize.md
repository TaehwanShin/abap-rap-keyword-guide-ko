---
title: cleanup_finalize saver method
summary: finalize 나 check_before_save 에서 문제가 생겼을 때 불려, early save phase 에서 바꾼 내용을 치우는 saver method 입니다.
keywords: cleanup_finalize, 세이버 메서드, saver method, 이른 저장 단계, early save phase, 버퍼 비우기, 트랜잭션 버퍼, finalize, check_before_save, CL_ABAP_BEHAVIOR_SAVER
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS cleanup_finalize REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD cleanup_finalize.
      ...
      ENDMETHOD.
      ...
ENDCLASS.
```

## 설명

`cleanup_finalize` 는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드에 둡니다. 미리 정해져 있는 메서드이므로 `REDEFINITION` 으로 다시 정의합니다. `base_class` 는 saver class 가 상속하는 기본 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

이 메서드의 성격은 다음과 같습니다.

- 써도 되고 안 써도 됩니다.
- early save phase(이른 저장 단계)에 속합니다.
- `IMPORTING` 매개변수도 `CHANGING` 매개변수도 없습니다.
- 원문은 이 메서드가 transactional buffer(트랜잭션 버퍼)를 비운다고 적고 있습니다. 다른 RAP BO 가 함께 얽혀 있고 early save phase 에서 그 BO 에 기대는 부분이 있다면, 여기서 바꾼 내용을 되돌릴 수도 있습니다.
- 지금 RAP 트랜잭션 안에서 [[abensaver_finalize|finalize]] 나 [[abensaver_check_before_save|check_before_save]] 에 문제가 생겼을 때만 불립니다.

`cleanup_finalize` 가 불린 뒤에는 late save phase(늦은 저장 단계)로 넘어가지 않습니다. 저장은 이루어지지 않고 interaction phase(상호작용 단계)로 돌아갑니다.

## 예제

unmanaged 여행 RAP BO 입니다. `finalize` 에서 총액을 다시 계산하다가 오류가 났다고 합시다. `cleanup_finalize` 에서 직접 만든 버퍼 `lcl_buffer=>mt_travel` 을 비워, 반쯤 계산된 값이 남지 않게 합니다. 버퍼를 통째로 비우는 것은 이 예제가 고른 방법입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS finalize         REDEFINITION.
    METHODS cleanup_finalize REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD finalize.
    LOOP AT lcl_buffer=>mt_travel INTO DATA(ls_travel)
         WHERE currency_code IS INITIAL.
      " 통화가 없으면 실패로 알린다 -> save sequence 가 멈춘다
      APPEND VALUE #( travelid = ls_travel-travel_id ) TO failed-travel.
    ENDLOOP.
  ENDMETHOD.

  METHOD cleanup_finalize.
    " early save phase 가 실패했다. 버퍼를 비운다
    CLEAR lcl_buffer=>mt_travel.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- unmanaged BO 에서는 버퍼를 치우는 코드를 직접 써야 합니다.
- managed RAP BO 로 만든 원문 예제 [[abencl_abap_beh_saver_failed_abexa]] 에서는 early save phase 에서 validation 이 실패한 인스턴스가 transactional buffer 에 그대로 남아 있습니다. 예제는 그 인스턴스를 고쳐서 다시 저장합니다. 원문의 "버퍼를 비운다"는 설명과 이 예제의 결과가 서로 다르다는 점을 알아 둡니다.
- 저장이 끝난 뒤 버퍼를 비우는 일은 이 메서드가 아니라 [[abensaver_method_cleanup|cleanup]] 이 맡습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abensaver_finalize]]
- [[abensaver_check_before_save]]
- [[abensaver_method_cleanup]]
- [[abenbdl_impl_type]]
- [[abenabp_saver_class_abexa]]
- [[abenabp_saver_ln_abexa]]
