---
title: early numbering
summary: 생성 요청이 들어오자마자 키 값을 정하되, 번호를 매기는 방법은 behavior pool 에 직접 구현하는 unmanaged early numbering 을 선언합니다.
keywords: early numbering, 이른 번호 부여, 비관리형 이른 번호 부여, unmanaged early numbering, FOR NUMBERING, 키 채번, 번호 매기기, 기본 키
---

## 문법

```syntax
...
early numbering
...
```

## 설명

entity(엔터티)의 기본 키 필드 전체에 **unmanaged early numbering** 을 정합니다. 뜻을 풀면 이렇습니다.

- 기본 키 필드에 값을 넣는 주체는 RAP 실행 엔진입니다.
- 값을 **어떻게** 정할지는 개발자가 behavior pool(동작 풀)에 구현합니다. 그래서 "unmanaged"이라고 부릅니다. 구현할 곳은 handler method(핸들러 메서드) [[abaphandler_meth_numbering|FOR NUMBERING]] 입니다.
- 키 값은 `CREATE` 를 담은 [[abapmodify_entity_entities|MODIFY]] 요청 직후 곧바로 transactional buffer(트랜잭션 버퍼)에 들어 있습니다. 그래서 "이른" numbering 이라고 부릅니다. 저장 직전에야 키가 정해지는 [[abenbdl_late_numbering|late numbering]] 과 반대입니다.

`early numbering` 은 entity 마다 entity 동작 특성에 따로 적습니다. 그래서 한 BO 안에서 어떤 entity 는 unmanaged early numbering 을 쓰고, 다른 entity 는 다른 방법으로 키를 채워도 됩니다.

번호를 매기는 키 필드는 [[abenbdl_field_char|readonly]] 로 지정해야 합니다.

### 쓸 수 있는 곳

- managed RAP BO
- unmanaged 이면서 draft 를 쓰는 RAP BO. draft 를 쓰지 않는 unmanaged RAP BO 에서는 쓸 수 없습니다.
- projection BO 와 RAP BO interface 는 base BDEF(기반 BDEF) 의 early numbering 을 그대로 다시 씁니다. 따로 적을 필요가 없습니다.

## 예제

루트 `Travel` 에 early numbering 을 선언하고, 키 필드 `TravelID` 를 readonly 로 둡니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
early numbering
authorization master ( global )
{
  create;
  update;
  delete;

  field ( readonly ) TravelID;
}
```

behavior pool 에서는 `FOR NUMBERING` 메서드에서 키를 정해 `mapped` 에 돌려줍니다. 아래는 테이블에 있는 가장 큰 번호에 1씩 더해 가며 매기는 간단한 구현입니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS earlynumbering_create FOR NUMBERING
      IMPORTING entities FOR CREATE travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD earlynumbering_create.
    " 지금까지 쓴 가장 큰 번호를 읽는다
    SELECT FROM ztravel
      FIELDS MAX( travel_id )
      INTO @DATA(lv_max_id).

    " 새 인스턴스마다 다음 번호를 매겨 %cid 와 짝지어 돌려준다
    LOOP AT entities INTO DATA(ls_entity).
      lv_max_id += 1.
      APPEND VALUE #( %cid     = ls_entity-%cid
                      travelid = lv_max_id ) TO mapped-travel.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

이제 RAP BO consumer(사용자)가 키 없이 여행을 만들고 저장하면, persistent table 의 `travel_id` 에 이 메서드가 매긴 값이 들어갑니다.

## 알아두기

- 번호를 매기는 다른 방법도 있습니다.
    - [[abenbdl_field_numbering|numbering:managed]] : RAP 프레임워크가 UUID 키를 알아서 채웁니다.
    - [[abenbdl_late_numbering|late numbering]] : 저장 직전에 키를 정합니다.

## 관련 항목

- [[abaphandler_meth_numbering]]
- [[abenbdl_late_numbering]]
- [[abenbdl_field_numbering]]
- [[abenbdl_field_char]]
