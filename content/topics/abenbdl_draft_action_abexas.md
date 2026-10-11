---
title: draft action 예제 모음
summary: draft action Activate, Edit, Discard, Prepare 를 실제로 선언하고 EML 로 실행해 보는 예제 두 개를 모은 갈래입니다.
keywords: draft action, 초안 액션, 예제, Activate, Edit, Discard, Prepare, 초안 테이블, 활성화
---

## 설명

draft action 은 선언만 하면 RAP 프레임워크가 처리합니다. 그래서 글로만 보면 무슨 일이 일어나는지 와닿지 않습니다. 여기 모은 예제는 draft action 을 EML 로 실행하고, 실행 전후의 draft 테이블과 persistent table 내용을 나란히 보여 줍니다.

첫 예제는 draft 를 active(활성) 데이터로 넘기는 `Activate` 하나를 다룹니다. 둘째 예제는 active 인스턴스에서 draft 를 만드는 `Edit`, draft 에서 determination 을 돌리는 `Prepare`, draft 를 버리는 `Discard` 를 차례로 실행합니다.

draft action 의 문법과 각 action 의 뜻은 [[abenbdl_draft_action]] 에 있습니다.

## 관련 항목

- [[abenbdl_draft_action1_abexa]] : draft 인스턴스 두 개를 만들고 `Activate` 로 persistent table 에 옮깁니다.
- [[abenbdl_draft_action2_abexa]] : active 인스턴스에 `Edit`, `Prepare`, `Discard` 를 차례로 실행하고 draft 테이블이 어떻게 바뀌는지 봅니다.
- [[abenbdl_draft_action]] : draft action 문법.
