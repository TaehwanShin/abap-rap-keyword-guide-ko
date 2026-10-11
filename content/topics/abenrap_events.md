---
title: RAP business event 용 ABAP
summary: RAP business event 를 ABAP 에서 일으키고 같은 시스템 안에서 받아 처리할 때 쓰는 클래스, 메서드, 문을 모은 갈래입니다.
keywords: RAP 비즈니스 이벤트, business event, RAISE ENTITY EVENT, FOR EVENTS OF, FOR ENTITY EVENT, CL_ABAP_BEHAVIOR_EVENT_HANDLER, 이벤트 핸들러 클래스, 이벤트 핸들러 메서드, 이벤트 발생, 로컬 소비
---

## 설명

RAP business event 는 "여행이 승인되었다"처럼 RAP BO 에 일어난 일을 바깥에 알리는 수단입니다. event 자체는 behavior definition(동작 정의)에 `event` 로 선언합니다([[abenbdl_event]]). 이 갈래는 그 event 를 **ABAP 코드에서 다루는 방법**을 모았습니다.

다루는 일은 두 가지입니다.

- **event 일으키기.** behavior pool(동작 풀)의 saver method(세이버 메서드)에서 `RAISE ENTITY EVENT` 문으로 event 를 일으킵니다.
- **같은 시스템 안에서 event 받기.** 전역 클래스에 `FOR EVENTS OF` 를 붙여 RAP event handler class(핸들러 클래스)를 만듭니다. 그 클래스의 CCIMP 인클루드에 `CL_ABAP_BEHAVIOR_EVENT_HANDLER` 를 상속한 로컬 클래스를 두고, 그 안에 `FOR ENTITY EVENT` 메서드를 만들어 event 를 처리합니다.

세 조각이 맞물리는 모습은 다음과 같습니다.

```text
behavior pool (saver method)
  RAISE ENTITY EVENT zr_travel~travelaccepted FROM ...
        │
        ▼
전역 클래스  ... FOR EVENTS OF zr_travel          ← RAP event handler class
  └ CCIMP 의 로컬 클래스  INHERITING FROM cl_abap_behavior_event_handler
       └ METHODS ... FOR ENTITY EVENT ... FOR zr_travel~travelaccepted
```

## 하위 항목

- [[abenclass_for_events]] — 전역 클래스 정의에 `FOR EVENTS OF` 를 붙여 RAP event handler class 를 만드는 문법입니다.
- [[abencl_abap_behavior_event_handler]] — event handler class 의 CCIMP 인클루드에 두는 로컬 클래스의 기본 클래스입니다.
- [[abenmethod_for_entity_event]] — event 를 실제로 받아 처리하는 RAP event handler method(핸들러 메서드)를 정의하는 문법과 주의점입니다.
- [[abapraise_entity_event]] — saver method 에서 RAP business event 를 일으키는 문입니다.
- [[abenrap_events_local_con_abexa]] — event 를 일으키고 같은 시스템 안에서 받아 데이터베이스 테이블을 바꾸는 예제입니다.

## 관련 항목

- [[abenbdl_event]]
- [[abaptype_table_for]]
- [[abaprap_saver_meth_save_modified]]
