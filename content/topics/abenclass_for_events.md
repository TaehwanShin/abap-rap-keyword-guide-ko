---
title: RAP event handler class (CLASS ... FOR EVENTS OF)
summary: 전역 클래스 정의에 FOR EVENTS OF 를 붙여, RAP business event 를 같은 시스템 안에서 받아 처리하는 RAP event handler class 로 만드는 문법입니다.
keywords: CLASS, FOR EVENTS OF, RAP 이벤트 핸들러 클래스, event handler class, 이벤트 핸들러, RAP 비즈니스 이벤트, ABSTRACT, FINAL, CCIMP, 로컬 소비
---

## 문법

```syntax
CLASS cl_event_handler DEFINITION PUBLIC [ABSTRACT] [FINAL] FOR EVENTS OF ent.
  ...
ENDCLASS.

CLASS cl_event_handler IMPLEMENTATION
  ...
ENDCLASS.
```

## 설명

전역 클래스의 정의에 `FOR EVENTS OF` 를 붙이면 그 클래스가 **RAP event handler class(핸들러 클래스)**가 됩니다. RAP business event 를 같은 시스템 안에서 받아 처리하려고 만드는 클래스입니다.

- `ent` : event 를 내보내는 RAP BO entity(엔터티)의 이름입니다. event 를 내보내는 interface BDEF 의 이름도 적을 수 있습니다. 클래스가 처리할 event 는 BDEF 에 정의되어 있어야 합니다.
- `ABSTRACT`, `FINAL` : 이 전역 클래스는 적지 않아도 abstract 이면서 최종인 클래스로 다뤄집니다. 그래서 두 추가 구문은 적어도 되고 빼도 됩니다.

전역 클래스 자체는 껍데기입니다. event 를 실제로 처리하는 것은 RAP event handler method(핸들러 메서드)이고, 이 메서드는 event handler class 의 CCIMP 인클루드(로컬 타입을 두는 곳)에 구현합니다.

## 예제

`ZR_Travel` 의 event 를 받는 event handler class 입니다. 전역 클래스에는 내용을 채우지 않습니다.

```abap
CLASS zcl_travel_event_handler DEFINITION
  PUBLIC ABSTRACT FINAL
  FOR EVENTS OF zr_travel.

  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.

CLASS zcl_travel_event_handler IMPLEMENTATION.
ENDCLASS.
```

event 처리는 같은 클래스의 CCIMP 인클루드에 둔 로컬 클래스가 맡습니다.

```abap
CLASS lhe_travel DEFINITION INHERITING FROM cl_abap_behavior_event_handler.
  PRIVATE SECTION.
    METHODS on_travel_accepted FOR ENTITY EVENT
      accepted FOR zr_travel~travelaccepted.
ENDCLASS.

CLASS lhe_travel IMPLEMENTATION.
  METHOD on_travel_accepted.
    " event 가 일어난 여행마다 할 일을 여기에 쓴다
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 로컬 클래스는 `CL_ABAP_BEHAVIOR_EVENT_HANDLER` 를 상속해야 합니다([[abencl_abap_behavior_event_handler]]).
- 메서드 정의 문법과 구현할 때 지킬 점은 [[abenmethod_for_entity_event]] 에 있습니다.
- 전체 흐름을 보여 주는 예제는 [[abenrap_events_local_con_abexa]] 입니다.

## 관련 항목

- [[abenrap_events]]
- [[abencl_abap_behavior_event_handler]]
- [[abenmethod_for_entity_event]]
- [[abapraise_entity_event]]
- [[abenbdl_event]]
