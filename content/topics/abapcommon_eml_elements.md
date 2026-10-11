---
title: ABAP EML - 공통 문과 피연산자
summary: 여러 EML 문에 똑같이 쓰이는 요소인 fields_tab, PRIVILEGED, response parameter, RESULT 를 모아 둔 갈래입니다.
keywords: EML 공통 요소, common EML elements, fields_tab, PRIVILEGED, FORWARDING PRIVILEGED, response_param, FAILED, MAPPED, REPORTED, RESULT, result_tab, 피연산자, 응답 매개변수
---

## 설명

`READ ENTITIES`, `MODIFY ENTITIES`, `GET PERMISSIONS` 같은 EML 문은 생김새가 서로 다르지만, 안에 들어가는 조각 몇 가지는 같습니다. 인스턴스를 담아 넘기는 내부 테이블, 권한 확인을 건너뛰는 추가 구문, 실패와 메시지를 돌려받는 자리, 읽은 결과를 받는 자리가 그렇습니다.

이 갈래는 그런 공통 조각을 하나씩 따로 설명합니다. EML 문 각각의 설명에서는 이 항목들을 가리키기만 합니다.

## 하위 항목

- [[abapeml_fields_tab]] — 작업에 넘길 인스턴스를 담는 내부 테이블. BDEF derived type(BDEF 파생 타입)으로 선언합니다.
- [[abapeml_privileged]] — privileged mode 로 RAP BO 에 접근하는 `PRIVILEGED` 와, 지금 문맥의 특권 상태를 넘겨주는 `FORWARDING PRIVILEGED` 추가 구문
- [[abapeml_response]] — 실패, 키 mapping, 메시지를 돌려받는 `FAILED`, `MAPPED`, `REPORTED`
- [[abapeml_result]] — 읽기나 action 의 결과를 받는 `RESULT`

## 관련 항목

- [[abeneml]]
- [[abaptype_table_for]]
- [[abaptype_response_for]]
