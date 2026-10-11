---
title: 잠금 handler method (FOR LOCK)
summary: 수정 작업 직전에 자동으로 불려, behavior definition 의 잠금 설정에 맞게 인스턴스를 잠그는 handler method 입니다.
keywords: FOR LOCK, 잠금, lock, lock master, 핸들러 메서드, handler method, TYPE TABLE FOR KEY OF, ENQUEUE, failed, reported, 비관리형 잠금
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR LOCK
   [IMPORTING] { REFERENCE(im_par_lock) | im_par_lock }
   FOR LOCK bdef
   [CHANGING { [failed TYPE data] [reported TYPE data] }].
```

## 설명

RAP BO 인스턴스를 잠그는 handler method 입니다. behavior definition(동작 정의)에 적은 잠금 속성에 맞춰 잠급니다. 수정 작업이 실행되기 전에 **자동으로** 불립니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition 의 이름 또는 별칭.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_locking]] 에 있습니다.

### 매개변수

- `im_par_lock` (입력) : 잠글 인스턴스의 키가 들어 있습니다. [[abaptype_table_for|TYPE TABLE FOR KEY OF]] 타입의 내부 테이블입니다. `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다. `IMPORTING` 낱말은 생략할 수 있습니다.
- `failed`, `reported` (`CHANGING`) : 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

## 예제

잠금 객체 `EZTRAVEL` 로 여행을 잠급니다. 다른 사용자가 이미 잠갔으면 `failed` 에 원인을 남깁니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS lock FOR LOCK
      IMPORTING keys FOR LOCK travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD lock.
    LOOP AT keys INTO DATA(ls_key).
      " 잠금 객체의 잠금 function 으로 여행 한 건을 잠근다
      CALL FUNCTION 'ENQUEUE_EZTRAVEL'
        EXPORTING
          travel_id    = ls_key-travelid
        EXCEPTIONS
          foreign_lock = 1
          OTHERS       = 2.

      IF sy-subrc <> 0.
        " 잠그지 못한 인스턴스를 알린다
        APPEND VALUE #( travelid    = ls_key-travelid
                        %fail-cause = if_abap_behv=>cause-locked )
               TO failed-travel.
        APPEND VALUE #( travelid = ls_key-travelid
                        %msg     = new_message_with_text(
                                     severity = if_abap_behv_message=>severity-error
                                     text     = '다른 사용자가 이 여행을 잠갔습니다.' ) )
               TO reported-travel.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 이 메서드는 수정 작업 전에 자동으로 불립니다. 수정할 때마다 따로 부를 필요가 없습니다.
- unmanaged 이면서 draft 를 쓰는 RAP BO 로 이 메서드를 보여 주는 예제가 [[abenrap_handler_methods_abexa]] 에 있습니다. 그 예제는 디버깅하는 동안 트랜잭션 `SM12` 로 잠금이 걸린 것을 확인할 수 있다고 안내합니다.

## 관련 항목

- [[abenbdl_locking]]
- [[abapmethods_for_rap_behv]]
- [[abaptype_table_for]]
- [[abaptype_response_for]]
- [[abenrap_handler_methods_abexa]]
