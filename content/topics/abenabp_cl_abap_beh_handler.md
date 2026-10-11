---
title: RAP handler class (CL_ABAP_BEHAVIOR_HANDLER)
summary: behavior pool 의 로컬 클래스가 CL_ABAP_BEHAVIOR_HANDLER 를 상속하면 handler method 를 담는 handler class 가 됩니다.
keywords: CL_ABAP_BEHAVIOR_HANDLER, RAP handler class, 핸들러 클래스, lhc, INHERITING FROM, 동작 풀, CCIMP, 핸들러 메서드, ABSTRACT, FINAL
---

## 문법

```syntax
CLASS lhc_bdef DEFINITION
  INHERITING FROM CL_ABAP_BEHAVIOR_HANDLER [ABSTRACT] [FINAL].
  PRIVATE SECTION.

    handler_method_declarations
    ...

ENDCLASS.

CLASS lhc_bdef IMPLEMENTATION

  handler_method_implementations
  ...

ENDCLASS.
```

## 설명

handler class(핸들러 클래스)는 behavior pool(동작 풀)의 CCIMP 인클루드에 정의하는 로컬 클래스입니다. `CL_ABAP_BEHAVIOR_HANDLER` 를 상속하고, 안에는 [[abapmethods_for_rap_behv|handler method]]의 선언과 구현이 들어갑니다.

- `handler_method_declarations` : handler method(핸들러 메서드) 선언. `PRIVATE SECTION` 에 둡니다.
- `handler_method_implementations` : 선언한 메서드의 구현.

### handler class 를 여러 개로 나누기

behavior pool 하나에 handler class 를 여러 개 둘 수 있습니다. 코드를 나눠 정리하려는 것입니다. 예를 들면 이렇게 나눕니다.

- entity(엔터티)마다 handler class 를 하나씩 둡니다.
- 읽는 작업과 바꾸는 작업을 서로 다른 handler class 에 둡니다.

### ABSTRACT 와 FINAL

handler class 는 따로 적지 않아도 `ABSTRACT` 이면서 `FINAL` 입니다. 인스턴스를 만들고 메서드를 부르는 일은 RAP 런타임 엔진만 하기 때문입니다.

## 예제

여행 entity 와 예약 entity 의 handler class 를 따로 둡니다.

```abap
" 여행(root entity) 핸들러
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS accepttravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~accepttravel RESULT result.

    METHODS validatedates FOR VALIDATE ON SAVE
      IMPORTING keys FOR travel~validatedates.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD accepttravel.
    " 승인 처리
  ENDMETHOD.

  METHOD validatedates.
    " 날짜 validation
  ENDMETHOD.
ENDCLASS.

" 예약(child entity) 핸들러
CLASS lhc_booking DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS calctotalprice FOR DETERMINE ON MODIFY
      IMPORTING keys FOR booking~calctotalprice.
ENDCLASS.

CLASS lhc_booking IMPLEMENTATION.
  METHOD calctotalprice.
    " 예약 금액이 바뀌면 여행 합계를 다시 계산
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- handler class 의 인스턴스를 직접 만들거나 handler method 를 직접 부르지 않습니다. RAP 런타임 엔진이 합니다.
- unmanaged 이면서 draft 를 쓰는 RAP BO 로 handler method 를 두루 보여 주는 예제가 [[abenrap_handler_methods_abexa]] 에 있습니다.

## 관련 항목

- [[abapmethods_for_rap_behv]]
- [[abenabp_handler_class]]
- [[abenabp_cl_abap_beh_saver]]
- [[abenrap_handler_methods_abexa]]
