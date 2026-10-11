---
title: RAP 종합 예제
summary: managed·unmanaged RAP BO, draft 와 late numbering, RAP 트랜잭션 단계를 EML 로 처음부터 끝까지 돌려 보는 긴 예제 네 개를 모은 곳입니다.
keywords: RAP examples, RAP 예제, ABAP EML in use, external numbering, 외부 번호 부여, managed, 관리형, unmanaged, 비관리형, RAP calculator, 계산기, draft, 초안, late numbering, 늦은 번호 부여, transactional phases, 트랜잭션 단계
---

## 설명

앞의 항목들은 문법을 하나씩 따로 보여 줍니다. 이 갈래의 예제는 RAP BO 하나를 놓고 여러 작업을 이어서 실행합니다. 생성·수정·삭제, action, association 을 거친 생성과 읽기, validation 과 determination, draft 활성화, save sequence(저장 순서)가 실제로 어떻게 맞물리는지 한눈에 볼 수 있습니다. 예제마다 실행 클래스가 RAP BO consumer(사용자) 역할을 하고, 작업 뒤에 DB 테이블과 response parameter(응답 매개변수) 내용을 출력합니다.

예제는 네 개입니다.

- [[abensheet_rap_ext_num_m_abexa]] : 키를 사용자가 직접 주는 managed RAP BO 로 standard operation(표준 작업)과 action, validation, determination, 읽기를 두루 써 봅니다.
- [[abensheet_rap_ext_num_u_abexa]] : 같은 작업을 unmanaged RAP BO 로 해 봅니다. instance·global feature control(기능 제어)와 instance 권한이 더해집니다.
- [[abensheet_rap_calc_dr_ln_m_abexa]] : draft 를 쓰고 late numbering 을 하는 managed RAP BO 로 만든 계산기입니다. draft 를 만들고 활성화하는 흐름을 봅니다.
- [[abenrap_luw_abexa]] : 저장이 성공할 때, 중간에 실패할 때, 되돌릴 때 saver method(세이버 메서드)가 어떤 차례로 불리는지 봅니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapread_entity_entities]]
- [[abapcommit_entities]]
- [[abaprollback_entities]]
- [[abenabp_saver_methods]]
