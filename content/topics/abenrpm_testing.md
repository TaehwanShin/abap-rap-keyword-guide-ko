---
title: RAP business object 테스트 (EML)
summary: behavior implementation 을 단위 테스트할 때 쓰는 ABAP 문을 모아 둔 갈래로, handler class 의 객체를 테스트용으로 만드는 CREATE OBJECT ... FOR TESTING 을 다룹니다.
keywords: Testing RAP Business Objects, RAP BO 테스트, 단위 테스트, unit test, CREATE OBJECT, FOR TESTING, 핸들러 클래스, 동작 풀
---

## 설명

이 갈래는 RAP business object(비즈니스 객체)를 테스트할 때 쓰는 ABAP 문을 다룹니다. 지금은 항목이 하나뿐입니다.

behavior implementation(동작 구현)을 단위 테스트하려면 behavior pool(동작 풀) 안의 handler class(핸들러 클래스) 객체가 있어야 합니다. 테스트 코드에서 그 객체를 만들 수 있게 해 주는 것이 `CREATE OBJECT` 의 RAP 전용 변형인 `FOR TESTING` 추가 구문입니다. 참조 변수를 먼저 선언해 두고, 그 변수로 객체를 만든 뒤 테스트 메서드에서 씁니다.

## 하위 항목

- [[abapcreate_object_for_testing]] : 단위 테스트에서 RAP handler class 의 객체를 만드는 문입니다.

## 관련 항목

- [[abenabp_handler_class]]
