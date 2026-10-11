---
title: RAP business object 를 사용하는 ABAP
summary: 만들어진 RAP BO 를 ABAP 프로그램에서 읽고 고치고 저장하는 EML 과, RAP BO 를 테스트하는 방법을 다루는 갈래입니다.
keywords: RAP BO 사용, consuming RAP BOs, RAP BO 사용자, EML, ABAP EML, Entity Manipulation Language, 테스트, testing, READ ENTITIES, MODIFY ENTITIES, COMMIT ENTITIES
---

## 설명

RAP BO 를 만드는 쪽이 RAP BO provider(제공자)라면, 그 BO 에 요청을 보내는 쪽은 RAP BO consumer(사용자)입니다. 이 갈래는 사용자 쪽에서 쓰는 ABAP 을 다룹니다.

중심은 EML(Entity Manipulation Language)입니다. EML 문으로 RAP BO 의 인스턴스를 읽고, 고치고, 바뀐 내용을 저장하게 합니다. 같은 문을 써서 RAP BO 를 테스트하는 방법도 여기에 들어 있습니다.

## 하위 항목

- [[abeneml]] — RAP BO 를 읽고 고치고 저장하는 EML 문과, 여러 문에 함께 쓰이는 요소를 다룹니다.
- [[abenrpm_testing]] — RAP BO 를 테스트하는 방법을 다룹니다.

## 관련 항목

- [[abenabap_for_rap_bos]]
- [[abenabap_provide_rap_bos]]
