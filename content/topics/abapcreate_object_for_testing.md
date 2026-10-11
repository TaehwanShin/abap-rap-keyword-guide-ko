---
title: CREATE OBJECT ... FOR TESTING 문
summary: behavior implementation 을 단위 테스트할 때 RAP handler class 의 객체를 만들 수 있게 해 주는 CREATE OBJECT 의 RAP 전용 변형입니다.
keywords: CREATE OBJECT, FOR TESTING, 단위 테스트, unit test, 핸들러 클래스, 테스트 클래스, class_setup, class_under_test, CCAU, 동작 풀 테스트
---

## 문법

```syntax
CREATE OBJECT ... FOR TESTING.
```

## 설명

`CREATE OBJECT` 문의 RAP 전용 변형입니다.

behavior implementation(동작 구현)을 단위 테스트하려면 테스트할 handler class(핸들러 클래스)의 객체가 있어야 합니다. 먼저 그 클래스를 가리키는 참조 변수를 선언하고, 그 변수로 객체를 만듭니다. 이때 `FOR TESTING` 추가 구문을 붙여야 RAP handler class 의 객체를 만들 수 있습니다.

## 예제

handler class `lhc_travel` 을 가리키는 참조 변수를 선언하고, `class_setup` 에서 테스트용 객체를 만듭니다.

```abap
CLASS ltc_travel DEFINITION FINAL FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    " 테스트할 handler class 의 객체를 담을 변수
    CLASS-DATA class_under_test TYPE REF TO lhc_travel.

    CLASS-METHODS class_setup.
ENDCLASS.

CLASS ltc_travel IMPLEMENTATION.
  METHOD class_setup.
    " FOR TESTING 을 붙여 handler class 의 객체를 만든다
    CREATE OBJECT class_under_test FOR TESTING.
  ENDMETHOD.
ENDCLASS.
```

이렇게 만든 `class_under_test` 로 테스트 메서드에서 handler method(핸들러 메서드)를 부르고 결과를 확인합니다.

## 알아두기

- SAP 예제 behavior pool(동작 풀) `BP_DEMO_MANAGED_ROOT_2` 의 테스트 인클루드(`CCAU`)에 이 문을 쓴 테스트 클래스 `ltc_managed` 가 있습니다. 참조 변수 `class_under_test` 를 클래스의 `PRIVATE SECTION` 에 선언하고, `class_setup` 메서드에서 `CREATE OBJECT class_under_test FOR TESTING.` 으로 객체를 만듭니다.
- 그 예제가 시험하는 대상은 validation `validate_field` 입니다. 이 validation 은 어느 필드의 값이 정해 둔 한도보다 크면 인스턴스를 저장하지 못하게 합니다. 테스트 메서드는 validation 메서드에 가짜 데이터(mock data)를 넘기는데, 저장이 실패하지 않는 값을 넣어 두었습니다.
- 테스트가 실패하는 모습을 보려면, 테스트에서 넘기는 필드 값을 한도보다 크게 바꾸거나, 주석으로 막아 둔 `validate_field_fails` 메서드의 정의와 구현을 풀면 됩니다.
- 단위 테스트를 어떻게 짜는지, 테스트 인클루드에서 어떤 메서드를 쓰는지는 ABAP RESTful Application Programming Model 개발 안내서의 Test 절에 나옵니다.

## 관련 항목

- [[abenrpm_testing]]
- [[abenabp_handler_class]]
- [[abenbdl_validations]]
