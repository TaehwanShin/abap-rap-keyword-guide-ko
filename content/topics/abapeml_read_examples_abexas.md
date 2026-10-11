---
title: ABAP EML READ 예제 모음
summary: EML READ 문을 다루는 실행 예제의 목록입니다. 문장 형식, 필드 지정, function 실행, WITH CHANGES 를 예제별로 나누어 보여 줍니다.
keywords: READ 예제, EML READ examples, READ ENTITY, READ ENTITIES, READ ENTITIES OPERATIONS, WITH CHANGES, EXECUTE, 실행 예제, 예제 모음
---

## 설명

EML `READ` 문을 실제로 써 보는 예제를 모은 갈래입니다. 문장의 세 가지 형식을 견주는 예제에서 시작해, 읽을 필드를 지정하는 방법, function 을 실행하는 읽기, 변경 정보까지 읽는 `WITH CHANGES` 로 이어집니다. `READ` 가 중심은 아니지만 `READ` 문을 함께 쓰는 `MODIFY` 예제와 handler method(핸들러 메서드) 예제도 목록에 들어 있습니다.

### 예제 목록

- [[abeneml_read_alternatives_abexa]] : `READ ENTITY`, `READ ENTITIES OF`, `READ ENTITIES OPERATIONS` 세 형식을 같은 BO 에 써서 견줍니다.
- [[abeneml_read_op_fields_abexa]] : `FROM`, `FIELDS ( ... ) WITH`, `ALL FIELDS WITH` 로 읽을 필드를 지정하는 방법을 견줍니다.
- [[abeneml_read_op_func_abexa]] : `EXECUTE` 로 function 을 실행하는 읽기 작업을 보여 줍니다.
- [[abeneml_read_with_changes_abexa]] : `WITH CHANGES` 로 트랜잭션 안에 쌓인 변경 정보를 읽습니다.
- [[abeneml_modify_op_u_abexa]] : unmanaged BO 의 standard operation(표준 작업) 예제입니다. EML `READ` 도 함께 씁니다.
- [[abenrap_handler_methods_abexa]] : draft 가 있는 unmanaged BO 예제입니다. RAP BO provider(제공자)와 consumer(사용자) 양쪽에서 EML `READ` 를 씁니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_entities_op]]
- [[abapread_entity_entities_fields]]
- [[abapeml_read_with_changes]]
- [[abapeml_modify_examples_abexas]]
