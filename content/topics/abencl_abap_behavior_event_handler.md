---
title: CL_ABAP_BEHAVIOR_EVENT_HANDLER (event 핸들러 기본 클래스)
summary: RAP business event 를 같은 시스템 안에서 받아 처리하는 로컬 클래스가 상속해야 하는 기본 클래스입니다.
keywords: CL_ABAP_BEHAVIOR_EVENT_HANDLER, INHERITING FROM, 이벤트 핸들러 기본 클래스, 로컬 클래스, RAP 이벤트 핸들러 메서드, FOR ENTITY EVENT, CCIMP, ABSTRACT, FINAL, 로컬 소비
---

## 문법

```syntax
CLASS lhe_event DEFINITION
  INHERITING FROM CL_ABAP_BEHAVIOR_EVENT_HANDLER   [ABSTRACT] [FINAL].
  PRIVATE SECTION.

    event_handler_method_definitions
    ...

ENDCLASS.

CLASS lhe_event IMPLEMENTATION

    event_handler_method_declarations
    ...

ENDCLASS.
```

## 설명

`CL_ABAP_BEHAVIOR_EVENT_HANDLER` 는 RAP business event 를 **같은 시스템 안에서 받아 처리**하는 로컬 클래스의 기본 클래스입니다.

이 클래스를 상속한 로컬 클래스는 RAP event handler class(핸들러 클래스)의 CCIMP 인클루드에 둡니다. RAP event handler class 는 `FOR EVENTS OF` 를 붙인 전역 클래스입니다([[abenclass_for_events]]).

event 는 로컬 클래스 안의 RAP event handler method(핸들러 메서드)가 처리합니다.

- `event_handler_method_definitions` : 메서드 정의입니다. `METHODS ... FOR ENTITY EVENT ...` 로 적습니다.
- `event_handler_method_declarations` : 메서드 구현입니다. `METHOD ... ENDMETHOD.` 로 적습니다.

두 가지 모두 [[abenmethod_for_entity_event]] 에서 설명합니다.

로컬 클래스는 적지 않아도 abstract 이면서 최종인 클래스로 다뤄집니다. 그래서 `ABSTRACT` 와 `FINAL` 은 적어도 되고 빼도 됩니다.

## 예제

`ZR_Travel` 의 event `travelAccepted` 를 받는 로컬 클래스입니다. event handler class `zcl_travel_event_handler` 의 CCIMP 인클루드에 둡니다.

```abap
CLASS lhe_travel DEFINITION INHERITING FROM cl_abap_behavior_event_handler.
  PRIVATE SECTION.
    METHODS on_travel_accepted FOR ENTITY EVENT
      accepted FOR zr_travel~travelaccepted.
ENDCLASS.

CLASS lhe_travel IMPLEMENTATION.
  METHOD on_travel_accepted.
    LOOP AT accepted INTO DATA(ls_accepted).
      " ls_accepted-travelid : event 가 일어난 여행의 키
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 메서드는 로컬 클래스의 `PRIVATE SECTION` 에 정의합니다.
- 전체 흐름을 보여 주는 예제는 [[abenrap_events_local_con_abexa]] 입니다.

## 관련 항목

- [[abenrap_events]]
- [[abenclass_for_events]]
- [[abenmethod_for_entity_event]]
- [[abapraise_entity_event]]
