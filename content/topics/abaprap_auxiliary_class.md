---
title: ABP 보조 클래스 (auxiliary class)
summary: behavior pool 의 구현을 거들어 주는 선택 클래스로, 다시 쓸 메서드를 담거나 여러 개발자가 구현을 나눠 맡을 때 씁니다.
keywords: ABP auxiliary class, auxiliary class, 보조 클래스, FOR BEHAVIOR OF, 동작 풀, IN LOCAL MODE, PRIVILEGED, RAISE ENTITY EVENT, 재사용 메서드, AUTHORITY-CHECK DISABLE BEGIN CONTEXT
---

## 설명

ABP 보조 클래스는 behavior pool(동작 풀, ABP)의 구현을 거드는 클래스입니다. 꼭 있어야 하는 것은 아닙니다.

쓰려면 두 가지를 해야 합니다.

- behavior definition(동작 정의)에서 [[abenbdl_auxiliary_class|auxiliary class]] 뒤에 클래스 이름을 적습니다.
- 보조 클래스의 선언부에 `FOR BEHAVIOR OF bdef` 를 붙입니다. `bdef` 는 behavior definition 이름입니다.

### 어디에 쓰나

- behavior pool 에서 여러 번 쓸 메서드를 모아 둡니다.
- 여러 개발자가 behavior implementation(동작 구현)을 동시에 나눠 작업할 수 있게 합니다.
- RAP business event 를 일으키는 도우미 메서드를 둡니다.

### behavior pool 과 다른 점

| | behavior pool 의 전역 클래스 | 보조 클래스 |
| --- | --- | --- |
| `ABSTRACT` | 언제나 abstract | abstract 가 아니어도 됩니다 |
| `FINAL` | 언제나 final | 적지 않아도 언제나 final 입니다 |
| 메서드 | static 메서드만 | static 메서드와 인스턴스 메서드 모두 |

RAP handler method(핸들러 메서드), saver method(세이버 메서드), event handler method 는 behavior pool 에서만 선언하고 구현할 수 있습니다. 보조 클래스에는 둘 수 없습니다. 다만 이 메서드들이 일부 처리를 보조 클래스의 메서드에 맡길 수는 있습니다.

### 보조 클래스가 할 수 있는 일

보조 클래스는 자기가 딸린 RAP BO 를 behavior pool 과 비슷한 자격으로 다룹니다.

- EML 문에 [[abapin_local_mode|IN LOCAL MODE]] 와 [[abapeml_privileged|PRIVILEGED]] 를 붙여 그 RAP BO 에 접근할 수 있습니다.
- 그 RAP BO 의 BDEF derived type(BDEF 파생 타입)을 쓸 수 있습니다.
- `internal` 로 선언한 internal 작업도 부를 수 있습니다.
- `AUTHORITY-CHECK DISABLE BEGIN CONTEXT ...` 와 `AUTHORITY-CHECK DISABLE END` 로 그 RAP BO 의 authorization context 를 켜고 끌 수 있습니다.
- [[abapraise_entity_event|RAISE ENTITY EVENT]] 문으로 그 RAP BO 의 business event 를 일으킬 수 있습니다.

## 예제

behavior definition 에 보조 클래스를 알립니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
auxiliary class zcl_travel_aux;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  action acceptTravel result [1] $self;
}
```

보조 클래스에는 여러 handler method 가 함께 쓸 읽기 메서드를 둡니다. `FOR BEHAVIOR OF` 가 있어서 `IN LOCAL MODE` 를 쓸 수 있습니다.

```abap
CLASS zcl_travel_aux DEFINITION
  PUBLIC FINAL CREATE PUBLIC
  FOR BEHAVIOR OF zr_travel.

  PUBLIC SECTION.
    TYPES tt_keys   TYPE TABLE FOR KEY OF zr_travel.
    TYPES tt_travel TYPE TABLE FOR READ RESULT zr_travel.

    " 넘겨받은 키의 여행 상태를 읽어 돌려준다
    CLASS-METHODS read_status
      IMPORTING it_keys          TYPE tt_keys
      RETURNING VALUE(rt_travel) TYPE tt_travel.
ENDCLASS.

CLASS zcl_travel_aux IMPLEMENTATION.
  METHOD read_status.
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( status ) WITH CORRESPONDING #( it_keys )
      RESULT rt_travel.
  ENDMETHOD.
ENDCLASS.
```

handler method 는 필요한 부분만 보조 클래스에 맡깁니다.

```abap
METHOD accepttravel.
  DATA(lt_travel) = zcl_travel_aux=>read_status( CORRESPONDING #( keys ) ).
  " 읽어 온 상태를 보고 승인 처리를 이어 간다
ENDMETHOD.
```

## 알아두기

- 메서드 구현을 통째로 보조 클래스에 넘기는 방식은 권하지 않습니다. 보조 클래스의 메서드 매개변수마다 BDEF derived type 을 따로 선언해야 하는 등 덧붙는 일이 많습니다.
- handler method, saver method, event handler method 자체는 보조 클래스에 선언할 수 없습니다.
- 선언부에 쓸 수 있는 그 밖의 문법은 `CLASS` 문의 전역 클래스 선언 설명을 봅니다.

## 관련 항목

- [[abenbdl_auxiliary_class]]
- [[abenabp_aux_cl_abexa]]
- [[abapclass_for_behavior_of]]
- [[abapin_local_mode]]
- [[abapeml_privileged]]
- [[abapraise_entity_event]]
