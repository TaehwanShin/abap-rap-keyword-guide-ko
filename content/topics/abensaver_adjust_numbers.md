---
title: adjust_numbers saver method
summary: late numbering 을 쓸 때 꼭 구현해야 하는 saver method 로, 임시 키와 식별자를 최종 키 값으로 바꿔 mapped 로 알려 줍니다.
keywords: adjust_numbers, 세이버 메서드, saver method, 늦은 번호 부여, late numbering, %pid, mapped, reported, TYPE RESPONSE FOR MAPPED LATE, 늦은 저장 단계, 최종 키
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS adjust_numbers REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD adjust_numbers.
      ...
      ENDMETHOD
      ...
ENDCLASS.
```

## 설명

`adjust_numbers` 는 behavior pool(동작 풀)의 CCIMP 인클루드에 있는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. 기반 클래스에 미리 정의된 메서드를 다시 정의해야 합니다. `base_class` 는 saver class 가 상속하는 기반 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

- [[abenbdl_late_numbering|late numbering]] 시나리오에서만 있습니다.
- late numbering 을 쓴다면 꼭 구현해야 합니다.
- late save phase(늦은 저장 단계)에 속합니다.

### 하는 일

interaction phase(상호작용 단계)에서는 RAP BO 인스턴스를 임시 키와 식별자(예: [[abapderived_types_pid|%pid]])로 구분합니다. `adjust_numbers` 는 이 임시 키와 식별자를 최종 키 값으로 바꾸고 서로 짝짓는 일을 맡습니다.

구현에서는 response parameter(응답 매개변수) `mapped` 를 꼭 채워야 합니다. 임시 키·식별자와 최종 키 값을 짝지어 넣습니다. 키 값이 서로 겹치지 않게 하는 것도 구현하는 쪽의 책임입니다.

### 매개변수

기반 클래스가 `CL_ABAP_BEHAVIOR_SAVER` 일 때 다음 `CHANGING` 매개변수가 암묵적으로 들어 있습니다. 이름은 정해져 있습니다.

| 매개변수 | 타입 |
| --- | --- |
| `mapped` | [[abaptype_response_for|TYPE RESPONSE FOR MAPPED LATE]] |
| `reported` | [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]] |

기반 클래스가 [[abenabp_cl_abap_beh_saver_failed|CL_ABAP_BEHAVIOR_SAVER_FAILED]] 이면 `failed` 가 더 생깁니다.

## 예제

late numbering 을 쓰는 unmanaged 여행 RAP BO 입니다. 새 여행은 버퍼에 임시 식별자로 들어 있고, 저장할 때 최종 번호를 받습니다. `lcl_buffer` 는 직접 만든 transactional buffer(트랜잭션 버퍼) 클래스입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS adjust_numbers REDEFINITION.
    METHODS save           REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD adjust_numbers.
    " 지금까지 쓴 가장 큰 여행 번호를 읽는다
    SELECT MAX( travelid ) FROM zr_travel INTO @DATA(lv_max).

    " 임시 식별자로 들어 있는 새 여행마다 최종 번호를 정한다
    LOOP AT lcl_buffer=>mt_new_travel REFERENCE INTO DATA(lr_new).
      lv_max += 1.
      lr_new->travelid = lv_max.

      " 임시 식별자와 최종 키를 짝지어 알려 준다
      APPEND VALUE #( %pid     = lr_new->pid
                      travelid = lv_max ) TO mapped-travel.
    ENDLOOP.
  ENDMETHOD.

  METHOD save.
    " 최종 번호가 붙은 여행을 데이터베이스에 쓴다
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- [[abenbdl_early_numb|early numbering]] 에서는 이 메서드를 쓰지 않습니다. 그때는 [[abaphandler_meth_numbering|numbering handler method]] 에 구현한 대로 키가 정해집니다.
- [[abenbdl_field_numbering|managed internal numbering]](`numbering : managed`)에서도 이 메서드를 쓰지 않습니다. 키 값을 RAP 프레임워크가 채우므로 behavior pool 에 구현할 것이 없습니다.
- save sequence(저장 순서)가 실행될 때의 흐름은 ABAP RESTful Application Programming Model 개발 안내서의 "Save Sequence Runtime" 절에 있습니다.
- late numbering 을 쓰는 단순한 unmanaged RAP BO 로 이 메서드를 보여 주는 예제가 [[abenabp_saver_ln_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_late_numbering]]
- [[abenabp_cl_abap_beh_saver]]
- [[abenabp_cl_abap_beh_saver_failed]]
- [[abenabp_saver_methods]]
- [[abapderived_types_pid]]
- [[abaptype_response_for]]
- [[abenabp_saver_ln_abexa]]
