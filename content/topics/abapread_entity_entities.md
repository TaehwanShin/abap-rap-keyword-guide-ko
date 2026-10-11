---
title: READ ENTITY, ENTITIES 문
summary: RAP BO 인스턴스를 읽기만 하는 EML 문입니다. 짧은 형식, 긴 형식, 동적 형식 세 가지가 있고 읽기 작업은 언제나 결과를 돌려줍니다.
keywords: READ ENTITY, READ ENTITIES, READ ENTITIES OF, READ ENTITIES OPERATIONS, EML 읽기, 읽기 작업, FOR READ, with managed instance filter, 트랜잭션 버퍼, 가상 요소
---

## 문법

짧은 형식 ([[abapread_entity_short]])

```syntax
READ ENTITY [IN LOCAL MODE [WITH CHANGES]|[FORWARDING] PRIVILEGED]
    entity operations [response_param].
```

원문의 이 틀은 `WITH CHANGES` 를 entity(엔터티) 이름 앞에 적습니다. 그런데 원문의 [[abapeml_read_with_changes]] 항목은 틀과 예제 모두 `READ ENTITY IN LOCAL MODE entity WITH CHANGES ...` 처럼 entity 이름 뒤에 적습니다.

긴 형식 ([[abapread_entities_long]])

```syntax
READ ENTITIES OF bdef [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
    ENTITY entity1 operations
    [ENTITY entity2 operations]
    [...]
    [WITH CHANGES]
    [response_param].
```

동적 형식 ([[abapread_entities_operations]])

```syntax
READ ENTITIES [IN LOCAL MODE|[FORWARDING] PRIVILEGED] OPERATIONS op_tab [response_param].
```

## 설명

`READ` 문은 RAP BO 인스턴스를 **읽기만** 합니다. 읽기 작업은 언제나 결과를 돌려줍니다. entity 가 [[abenbdl_define_beh|define behavior for]] 로 behavior definition(동작 정의)에 들어 있기만 하면 따로 선언하지 않아도 읽을 수 있습니다. 구현 유형이 [[abenbdl_abstract|abstract]] 인 behavior definition 만 예외입니다.

형식은 세 가지입니다.

| 형식 | 쓰임 |
| --- | --- |
| [[abapread_entity_short|짧은 형식]] `READ ENTITY` | entity 하나에서 인스턴스 여러 개를 읽습니다. |
| [[abapread_entities_long|긴 형식]] `READ ENTITIES OF` | 여러 entity 에서 인스턴스 여러 개를 읽습니다. |
| [[abapread_entities_operations|동적 형식]] `READ ENTITIES OPERATIONS` | 여러 entity 에서 읽을 내용을 내부 테이블에 모아 한 문장으로 읽습니다. |

문장에 들어가는 부분은 다음 항목에서 설명합니다.

- `operations` : 읽기, read-by-association, function 실행. [[abapread_entity_entities_op]]
- `IN LOCAL MODE` : [[abapin_local_mode]]
- `WITH CHANGES` : [[abapeml_read_with_changes]]
- `[FORWARDING] PRIVILEGED` : [[abapeml_privileged]]
- `response_param` : [[abapeml_response]]

## 예제

여행 두 건의 모든 필드를 읽습니다. 읽지 못한 인스턴스는 `FAILED` 로 돌아옵니다.

```abap
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' )
                           ( travelid = '00000002' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed).

IF ls_failed-travel IS NOT INITIAL.
  " 읽지 못한 여행이 있다
ENDIF.
```

## 알아두기

- RAP BO consumer(사용자)가 읽은 결과는 지금의 트랜잭션 상태입니다. 데이터베이스에 저장된 값에, 현재 LUW 에서 아직 저장하지 않은 변경이 더해진 모습입니다.
- RAP BO consumer 가 쓰든 provider(제공자)가 쓰든, EML `READ` 문은 handler method(핸들러 메서드) [[abaphandler_meth_read|FOR READ]] 를 부릅니다.
- EML 문을 루프 안에서 쓰지 않습니다. 데이터베이스를 한 건씩 여러 번 읽게 되어 성능이 떨어질 수 있습니다. 필요한 데이터는 EML 문 하나로 읽고, 그다음 EML 변경 요청으로 고칩니다.
- 트랜잭션 쿼리 유형의 CDS projection 뷰나 CDS 트랜잭션 interface 에는 결과를 걸러 내는 `WHERE` 절을 둘 수 있습니다. 그런데 EML `READ` 로 BDEF 에 접근할 때는 projection 계층의 이 `WHERE` 절이 기본으로 **무시됩니다**. projection BDEF 나 interface BDEF 의 결과에 들어 있지 않은 인스턴스도 읽고 바꿀 수 있다는 뜻이고, 보안 위험이 될 수 있습니다. 이를 막으려면 BDEF 에 [[abenbdl_mngd_instance_check_proj|with managed instance filter]] 를 지정해 `WHERE` 절을 반드시 따르게 합니다.
- CDS projection 뷰에 CDS 가상 요소가 있어도, 가상 요소는 EML 읽기 작업으로 읽을 수 없습니다.
- RAP 작업을 구현할 때는 RAP BO 계약을 지켜야 합니다. ABAP RESTful Application Programming Model 개발 안내서의 "RAP Business Object Contract" 단락에 구현 지침이 있고, 그 가운데 일부를 [[abaprap_impl_rules]] 에서 볼 수 있습니다.

## 관련 항목

- [[abapread_entity_short]]
- [[abapread_entities_long]]
- [[abapread_entities_operations]]
- [[abapread_entity_entities_op]]
- [[abapread_entity_entities_fields]]
- [[abapeml_read_with_changes]]
- [[abaphandler_meth_read]]
- [[abeneml_read_alternatives_abexa]]
- [[abapeml_read_examples_abexas]]
