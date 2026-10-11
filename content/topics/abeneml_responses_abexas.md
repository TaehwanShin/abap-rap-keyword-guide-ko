---
title: response parameter 예제 모음
summary: FAILED, MAPPED, REPORTED 응답이 실제로 어떻게 채워지는지 보여 주는 실행 예제를 모아 둔 곳입니다.
keywords: 응답 매개변수 예제, responses examples, FAILED, MAPPED, REPORTED, TYPE RESPONSE FOR, ABP_BEHV_RESPONSE_TAB, 동적 EML, MODIFY ENTITIES
---

## 설명

EML 문 끝에 붙이는 `FAILED`, `MAPPED`, `REPORTED` 는 작업이 어떻게 끝났는지 알려 주는 창구입니다. 여기 모은 예제는 일부러 실패하는 작업을 섞어 보내서, 세 응답에 무엇이 담겨 돌아오는지 화면으로 보여 줍니다.

예제는 EML 문의 꼴에 따라 둘로 나뉩니다. 짧은 꼴과 긴 꼴에서는 응답이 BDEF derived type(BDEF 파생 타입)으로 된 구조로 돌아오고, 동적 꼴에서는 `ABP_BEHV_RESPONSE_TAB` 타입 내부 테이블로 돌아옵니다. 받은 응답을 읽는 방법이 서로 다르므로 두 예제를 나란히 보면 차이를 알기 쉽습니다.

## 예제 목록

- [[abeneml_responses_abexa]] — managed BO 에 여러 수정 작업을 보내고, 짧은 꼴과 긴 꼴 `MODIFY` 문의 응답 구조를 살펴봅니다.
- [[abeneml_responses_dyn_abexa]] — 동적 꼴의 읽기와 수정 작업에서 응답 테이블을 살펴봅니다.

## 관련 항목

- [[abapeml_response]]
- [[abapeml_responses]]
- [[abapeml_responses_dyn]]
