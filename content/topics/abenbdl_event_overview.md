---
title: event 개요
summary: behavior definition 에서 선언할 수 있는 event 세 가지, 곧 business event·파생 event·side effects 용 event 를 한눈에 정리합니다.
keywords: event, 이벤트, business event, 비즈니스 이벤트, managed event, derived event, 파생 이벤트, event for side effects, 부수 효과용 이벤트, 이벤트 기반
---

## 문법

business event

```syntax
event EventName [[deep] parameter ParamName];
```

파생 event

```syntax
managed event DerivedEventName on RefEvent parameter ViewEntityName;
```

side effects 용 business event

```syntax
event EventName for side effects;
```

## 설명

RAP 는 event 기반 구조를 지원합니다. business object(비즈니스 객체)에서 의미 있는 일이 일어났을 때 event 를 내보내면, 그 event 를 받겠다고 등록한 쪽이 따로 처리합니다. event 를 내보내는 쪽과 받는 쪽은 서로 기다리지 않고 비동기로 주고받습니다.

behavior definition(동작 정의)에서 선언할 수 있는 event 는 세 가지입니다.

- [[abenbdl_event]] — business event. event provider(제공자)와 event 사용자가 비동기로 소식을 주고받게 합니다. 실어 보낼 값(페이로드)을 매개변수로 정할 수 있습니다.
- [[abenbdl_managed_event]] — 파생 event. 이미 있는 business event 를 가리켜 선언하며, 그 event 의 페이로드를 다르게 다시 정합니다.
- [[abenbdl_event_side_effect]] — side effects 용 business event. event 로 화면을 다시 읽게 하는 side effects 에만 쓰는 event 입니다.

## 예제

세 가지 선언을 한 entity(엔터티)에 나란히 적으면 다음과 같습니다.

```bdl
// business event: abstract entity 를 페이로드로 쓴다
event travelCreated parameter ZA_TravelCreated;

// 파생 event: travelCreated 가 발생하면 다른 페이로드로 함께 발생한다
managed event travelCreatedExt on travelCreated parameter ZI_TravelPayload;

// side effects 용 event
event priceChanged for side effects;
```

## 관련 항목

- [[abenbdl_event]]
- [[abenbdl_managed_event]]
- [[abenbdl_event_side_effect]]
- [[abenbdl_side_effects]]
- [[abapraise_entity_event]]
