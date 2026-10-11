---
title: 보조 클래스 (auxiliary class)
summary: behavior pool 의 구현을 덜어 낼 ABP 보조 클래스를 BDEF 머리말에 등록하는 구문입니다. 보조 클래스는 그 RAP BO 에 더 넓게 접근할 수 있습니다.
keywords: auxiliary class, 보조 클래스, ABP auxiliary class, FOR BEHAVIOR OF, IN LOCAL MODE, 동작 풀 나누기, 재사용 메서드, group, 구현 그룹
---

## 문법

```syntax
... auxiliary class ClassName1 [,ClassName2][,ClassName3] [, ...];
```

## 설명

ABP 보조 클래스 `ClassName1`, `ClassName2`, ... 를 등록합니다. 보조 클래스는 behavior pool(동작 풀)의 구현을 돕는 클래스입니다. 다시 쓸 메서드를 여기에 모아 두면, 여러 개발자가 behavior implementation(동작 구현)을 동시에 나누어 작업할 수 있습니다.

보조 클래스는 **RAP BO 하나에만** 딸립니다. 그리고 그 RAP BO 에 보통 클래스보다 넓게 접근할 수 있습니다. 예를 들어 EML 문에 [[abapin_local_mode|IN LOCAL MODE]] 를 붙여 그 RAP BO 를 부를 수 있습니다. 그래서 behavior pool 의 기능을 바깥 클래스로 덜어 낼 수 있습니다.

보조 클래스 쪽 구현 방법은 [[abaprap_auxiliary_class]] 에 있습니다.

### 쓸 수 있는 곳

- managed RAP BO
- unmanaged RAP BO

다른 구현 타입의 BDEF 와 BDEF extension(확장)에서는 `auxiliary class` 를 쓸 수 없습니다.

## 예제

BDEF 머리말에 보조 클래스 `zcl_travel_aux` 를 등록합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
auxiliary class zcl_travel_aux;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  action acceptTravel;
  action rejectTravel;
}
```

보조 클래스는 선언에 `FOR BEHAVIOR OF` 를 붙입니다. 두 action 이 함께 쓰는 상태 변경을 메서드 하나로 모았습니다.

```abap
CLASS zcl_travel_aux DEFINITION PUBLIC FINAL CREATE PUBLIC
  FOR BEHAVIOR OF zr_travel.
  PUBLIC SECTION.
    TYPES tt_keys TYPE TABLE FOR KEY OF zr_travel\\travel.
    CLASS-METHODS set_status
      IMPORTING it_keys   TYPE tt_keys
                iv_status TYPE zr_travel-status.
ENDCLASS.

CLASS zcl_travel_aux IMPLEMENTATION.
  METHOD set_status.
    " 보조 클래스라서 IN LOCAL MODE 를 쓸 수 있다
    MODIFY ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( status )
        WITH VALUE #( FOR ls_key IN it_keys
                      ( %tky = ls_key-%tky status = iv_status ) ).
  ENDMETHOD.
ENDCLASS.
```

behavior pool 의 handler method(핸들러 메서드)는 일을 보조 클래스에 넘깁니다.

```abap
METHOD accepttravel.
  zcl_travel_aux=>set_status( it_keys   = CORRESPONDING #( keys )
                              iv_status = 'A' ).
ENDMETHOD.
```

## 알아두기

- 먼저 `strict(version)` 으로 strict mode 를 켜야 `auxiliary class` 를 적을 수 있습니다.
- 보조 클래스 이름은 `implementation in class ClassName unique` 에 적은 이름과 같을 수 없습니다. 보조 클래스와 behavior pool 은 서로 다른 클래스입니다.
- 보조 클래스 하나는 한 RAP BO 안에서 한 번만 적을 수 있습니다.
- 보조 클래스는 RAP BO 하나에만 딸립니다. 여러 RAP BO 가 같은 보조 클래스를 함께 쓸 수 없습니다.
- 구현을 나누는 다른 방법으로 [[abenbdl_grouping|구현 그룹]](`group`)이 있습니다. 둘은 다릅니다. 구현 그룹은 handler method 와 saver method(세이버 메서드)를 구현할 수 있어서, 구현을 여러 구현 클래스에 나누어 담습니다. 보조 클래스는 handler method 와 saver method 를 구현할 수 없습니다. behavior pool 이 불러 쓰는 기능만 담습니다.

## 관련 항목

- [[abaprap_auxiliary_class]]
- [[abenabp_aux_cl_abexa]]
- [[abenbdl_grouping]]
- [[abenbdl_in_class_unique]]
- [[abapin_local_mode]]
- [[abenbdl_bdef_header]]
