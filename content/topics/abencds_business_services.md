---
title: RAP 비즈니스 서비스 (Business Service)
summary: service definition 과 service binding 으로 CDS entity 를 REST 서비스로 바깥에 여는 틀을 설명합니다.
keywords: business service, 비즈니스 서비스, service definition, 서비스 정의, service binding, 서비스 바인딩, expose, OData, RESTful, 프로토콜
---

## 설명

RAP 비즈니스 서비스는 AS ABAP 이 ABAP RAP 의 한 부분으로 내놓는 REST 방식 서비스입니다. 크게 두 조각으로 이루어집니다.

| 조각 | 하는 일 |
| --- | --- |
| service definition(서비스 정의) | 비즈니스 서비스로 쓸 수 있는 CDS entity(엔터티)를 골라 내놓습니다. |
| service binding(서비스 바인딩) | service definition 을 REST 프로토콜 하나에 묶는 저장소 객체입니다. 이렇게 묶어야 바깥에서 쓸 수 있게 서비스가 공개됩니다. |

비즈니스 서비스는 AS ABAP 을 읽는 데도, 쓰는 데도 쓸 수 있습니다. 쓰기까지 하려면 조건이 있습니다. service definition 이 내놓는 CDS entity 가 RAP business object(비즈니스 객체)의 root entity(루트 엔터티)여야 하고, 그 RAP BO 에 behavior definition(동작 정의, BDEF)와 behavior pool(동작 풀)이 있어야 합니다.

## 예제

projection `ZC_Travel` 과 `ZC_Booking` 을 내놓는 service definition 입니다. 이 service definition 에 service binding 을 만들어 프로토콜을 고르면 서비스가 공개됩니다.

```cds
@EndUserText.label: '여행 서비스'
define service ZUI_Travel {
  expose ZC_Travel  as Travel;
  expose ZC_Booking as Booking;
}
```

## 알아두기

- service definition 하나를 service binding 여러 개로 공개할 수 있습니다. 바인딩마다 프로토콜을 다르게 고르면 됩니다.

## 관련 항목

- [[abenabap_rap]]
- [[abencds_bdef]]
