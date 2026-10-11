---
title: ABAP behavior pool (ABP)
summary: behavior definition 에 적은 동작을 ABAP 으로 구현하는 특별한 클래스 풀이며, 전역 클래스 하나와 로컬 핸들러·saver class 로 이루어집니다.
keywords: ABAP Behavior Pool, ABP, 동작 풀, behavior pool, FOR BEHAVIOR OF, CCIMP, 핸들러 클래스, 세이버 클래스, handler class, saver class, 동작 구현
---

## 설명

behavior pool(동작 풀, ABP)은 ABAP behavior implementation(동작 구현)을 담는 특별한 클래스 풀입니다. behavior definition(동작 정의, BDEF) 하나를 바탕으로 만듭니다.

behavior pool 의 [[abapclass_for_behavior_of|전역 클래스]]는 동작을 직접 구현하지 않습니다. 실제 구현은 behavior pool 의 CCIMP 인클루드(로컬 클래스를 적는 곳, ADT 의 "Local Types" 탭)에 들어 있는 로컬 클래스가 맡습니다.

| 로컬 클래스 | 개수 | 맡는 일 |
| --- | --- | --- |
| [[abenabp_handler_class|handler class]] | 하나 이상 | interaction phase(상호작용 단계)의 작업 처리 |
| [[abenabp_saver_class|saver class]] | 하나 | save sequence(저장 순서) 처리 |

이 클래스들이 RAP BO 의 unmanaged 부분을 구현합니다. RAP BO 에 접근이 들어오면 RAP 런타임 엔진이 이 클래스들을 부릅니다. 개발자가 직접 인스턴스를 만들거나 메서드를 부르지 않습니다.

## 예제

behavior pool `zbp_r_travel` 의 뼈대입니다. 전역 클래스는 비어 있고, 구현은 로컬 클래스에 들어갑니다.

```abap
" 전역 클래스: behavior definition zr_travel 의 behavior pool 임을 알린다
CLASS zbp_r_travel DEFINITION PUBLIC ABSTRACT FINAL
  FOR BEHAVIOR OF zr_travel.
ENDCLASS.

CLASS zbp_r_travel IMPLEMENTATION.
ENDCLASS.
```

```abap
" CCIMP 인클루드: 실제 구현이 들어가는 로컬 클래스
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS accepttravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~accepttravel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD accepttravel.
    " action 처리 내용
  ENDMETHOD.
ENDCLASS.

CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    " 저장할 때 덧붙일 처리
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- RAP 작업을 구현할 때는 RAP BO 계약(RAP BO contract)을 지켜야 합니다. 구현 지침은 ABAP RESTful Application Programming Model 개발 안내서의 "RAP Business Object Contract" 절에 있습니다.
- 그 가운데 골라 놓은 지침은 [[abaprap_impl_rules]] 에서 볼 수 있습니다.

## 하위 항목

- [[abapclass_for_behavior_of]] — 전역 클래스를 behavior pool 로 선언하는 `FOR BEHAVIOR OF` 추가 구문
- [[abenabp_handler_class]] — interaction phase 를 구현하는 handler class(핸들러 클래스)와 handler method(핸들러 메서드)
- [[abenabp_saver_class]] — save sequence 를 구현하는 saver class(세이버 클래스)와 saver method(세이버 메서드)

## 관련 항목

- [[abenabap_provide_rap_bos]]
- [[abaprap_impl_rules]]
