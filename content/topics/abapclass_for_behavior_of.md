---
title: behavior pool 전역 클래스 선언 (CLASS ... FOR BEHAVIOR OF)
summary: 전역 클래스 선언에 붙여 그 클래스를 어느 behavior definition 의 behavior pool 로 만드는 추가 구문입니다.
keywords: CLASS, FOR BEHAVIOR OF, 동작 풀, ABP, behavior pool, 전역 클래스, global class, BP_, ABSTRACT, FINAL, CCIMP, 구현 묶기, implementation grouping
---

## 문법

```syntax
CLASS bp_bdef DEFINITION
            PUBLIC [ABSTRACT] [FINAL]
            FOR BEHAVIOR OF bdef ...
 ...
ENDCLASS.
```

## 설명

전역 클래스 선언에 `FOR BEHAVIOR OF bdef` 를 붙이면 그 클래스가 behavior definition(동작 정의) `bdef` 의 behavior pool(동작 풀, ABP)이 됩니다. behavior pool 의 전역 클래스 이름(`bp_bdef`)은 보통 `BP_` 로 시작합니다.

- 이 전역 클래스는 따로 적지 않아도 `ABSTRACT` 이면서 `FINAL` 입니다. 그래서 두 낱말은 적어도 되고 안 적어도 됩니다.
- 가시성 구역(`PUBLIC SECTION` 등)에는 static 메서드와 `CLASS-DATA`, `CONSTANTS`, `TYPES` 문을 쓸 수 있습니다.

### 언제 behavior pool 이 필요한가

behavior definition 에 직접 만든 로직이 있어야 하는 작업이 있으면 behavior pool 에 구현해야 합니다. [[abenbdl_nonstandard|non-standard operation]], [[abenbdl_determinations|determination]], [[abenbdl_validations|validation]] 이 여기에 듭니다.

behavior definition 하나에 behavior pool 을 몇 개든 붙일 수 있습니다. 덕분에 구현을 여러 단위로 나눌 수 있습니다. 나누는 방법은 [[abenbdl_grouping]] 에 있습니다.

### 구현은 어디에 쓰나

RAP BO 의 트랜잭션 동작은 전역 클래스가 아니라 behavior pool 의 CCIMP 인클루드에 구현합니다. 여기에 두 가지 특별한 로컬 클래스를 둡니다.

- [[abenabp_handler_class|handler class]] 하나 이상: interaction phase(상호작용 단계)를 구현합니다.
- [[abenabp_saver_class|saver class]] 하나: save sequence(저장 순서)를 구현합니다.

## 예제

behavior definition `zr_travel` 의 behavior pool 을 선언합니다. 전역 클래스에는 로컬 클래스가 함께 쓸 타입과 상수, 정적 데이터만 둡니다.

```abap
CLASS zbp_r_travel DEFINITION
  PUBLIC ABSTRACT FINAL
  FOR BEHAVIOR OF zr_travel.

  PUBLIC SECTION.
    " 핸들러·saver class 가 함께 쓰는 타입과 상수
    TYPES tt_travel_update TYPE TABLE FOR UPDATE zr_travel.
    CONSTANTS gc_status_accepted TYPE c LENGTH 1 VALUE 'A'.

    " save sequence 에서 넘겨받은 변경 내용을 잠시 담아 둔다
    CLASS-DATA gs_changed TYPE REQUEST FOR CHANGE zr_travel.
ENDCLASS.

CLASS zbp_r_travel IMPLEMENTATION.
ENDCLASS.
```

## 알아두기

- 지금은 behavior pool 의 전역 클래스로 인스턴스를 만들 수 없고, 상속할 수도 없습니다.
- `FOR BEHAVIOR OF` 는 behavior pool 뿐 아니라 [[abaprap_auxiliary_class|ABP 보조 클래스]]에도 씁니다.
- RAP 작업을 구현할 때는 RAP BO 계약을 지켜야 합니다. 골라 놓은 구현 지침은 [[abaprap_impl_rules]] 에 있습니다.

## 관련 항목

- [[abenabap_behavior_pools]]
- [[abenabp_handler_class]]
- [[abenabp_saver_class]]
- [[abaprap_auxiliary_class]]
- [[abenbdl_grouping]]
- [[abaprap_impl_rules]]
