---
title: ABAP EML MODIFY 예제 모음
summary: EML MODIFY 문을 다루는 실행 예제의 목록입니다. 문장 형식, standard operation, 필드 지정, action 실행을 예제별로 나누어 보여 줍니다.
keywords: MODIFY 예제, EML MODIFY examples, MODIFY ENTITY, MODIFY ENTITIES, CREATE, UPDATE, DELETE, EXECUTE, 실행 예제, 예제 모음
---

## 설명

EML `MODIFY` 문을 실제로 써 보는 예제를 모은 갈래입니다. 문장의 세 가지 형식을 견주는 예제에서 시작해, managed 와 unmanaged BO 에서 standard operation(표준 작업, 생성·수정·삭제)을 실행하는 예제, 필드를 지정하는 여러 방법, action 실행으로 이어집니다. 모두 ABAP 클래스에서 EML 로 RAP BO 를 부르는 사용자 쪽 코드가 중심입니다. 문법 설명을 읽은 뒤 흐름을 한 번에 보고 싶을 때 찾으면 됩니다.

### 예제 목록

- [[abeneml_modify_alternatives_abexa]] : `MODIFY ENTITY`, `MODIFY ENTITIES OF`, `MODIFY ENTITIES OPERATIONS` 세 형식을 같은 BO 에 써서 견줍니다.
- [[abeneml_modify_op_abexa]] : managed BO 에서 `CREATE`, `CREATE BY`, `UPDATE`, `DELETE` 를 차례로 실행하고 `READ` 로 확인합니다.
- [[abeneml_modify_op_u_abexa]] : unmanaged BO 에서 같은 standard operation 을 실행합니다. transactional buffer(트랜잭션 버퍼)를 직접 구현한 behavior pool(동작 풀)의 짜임새도 설명합니다.
- [[abeneml_modify_op_fields_abexa]] : `FROM`, `FIELDS ( ... ) WITH`, `SET FIELDS WITH` 로 필드를 지정하는 방법을 견줍니다.
- [[abeneml_modify_custom_op_abexa]] : `EXECUTE` 로 action 을 실행합니다. action 을 구현한 handler method(핸들러 메서드)도 함께 봅니다.
- [[abeneml_calculator_abexa]] : 생성 작업 하나로 계산을 맡기는 간단한 계산기입니다.
- [[abenrap_handler_methods_abexa]] : draft 가 있는 unmanaged BO 예제입니다. RAP BO provider(제공자)와 consumer(사용자) 양쪽에서 EML `MODIFY` 를 씁니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_op]]
- [[abapmodify_entity_entities_fields]]
- [[abapeml_read_examples_abexas]]
