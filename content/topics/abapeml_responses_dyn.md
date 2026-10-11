---
title: response parameter - 동적 EML 문
summary: 동적 꼴 EML 문에서 FAILED, MAPPED, REPORTED 뒤에 적는 ABP_BEHV_RESPONSE_TAB 타입 내부 테이블과 그 구성요소를 설명합니다.
keywords: response_param, 응답 매개변수, 동적 EML, dynamic, FAILED, MAPPED, REPORTED, ABP_BEHV_RESPONSE_TAB, ABP_BEHV_RESPONSE, root_name, entity_name, entries, MODIFY ENTITIES OPERATIONS, READ ENTITIES OPERATIONS
---

## 문법

```syntax
... [FAILED failed_resp]
    [MAPPED mapped_resp]
    [REPORTED reported_resp] ...
```

## 설명

동적 꼴의 EML 문에서 응답을 받는 방법입니다. 세 가지를 쓸 수 있는 문이라면 함께 써도 됩니다.

동적 꼴에서는 어느 BO 를 다룰지가 실행할 때 정해집니다. 그래서 BO 이름이 들어간 BDEF derived type(BDEF 파생 타입)을 쓰지 않습니다. `failed_resp`, `mapped_resp`, `reported_resp` 는 모두 `ABP_BEHV_RESPONSE_TAB` 타입의 내부 테이블이어야 합니다. `DATA( )` 나 `FINAL( )` 로 그 자리에서 선언해도 됩니다.

다음 동적 EML 문에 쓸 수 있습니다.

- [[abapmodify_entities_operations_dyn|MODIFY ENTITIES OPERATIONS]]
- [[abapread_entities_operations|READ ENTITIES OPERATIONS]]
- [[abapemlcommit_entities_dyn|COMMIT ENTITIES RESPONSES OF]]
- [[abapget_permissions_dyn|GET PERMISSIONS OPERATIONS]]
- [[abapset_locks_dyn|SET LOCKS lock_tab]]

이 내부 테이블의 줄은 `ABP_BEHV_RESPONSE` 타입의 깊은 구조입니다. 응답에 내용이 있는 entity(엔터티)마다 한 줄씩 들어 있습니다. 구성요소는 다음과 같습니다.

| 구성요소 | 내용 | 타입 |
| --- | --- | --- |
| `root_name` | `entity_name` entity 가 속한 RAP BO 의 root entity(루트 엔터티) 이름 | `ABP_ROOT_ENTITY_NAME` |
| `entity_name` | 응답에 내용이 있는 entity 의 이름. root entity 일 수도 있고, root entity 에 이어진 entity 나 child entity(자식 엔터티)일 수도 있습니다. | `ABP_ENTITY_NAME` |
| `entries` | 그 entity 의 응답 내용이 든 내부 테이블 | `REF TO DATA` |

## 예제

수정 작업을 동적 꼴로 보내고, 실패 응답을 entity 별로 살펴봅니다.

```abap
DATA lt_update   TYPE TABLE FOR UPDATE zr_travel.
DATA lt_failed   TYPE abp_behv_response_tab.
DATA lt_reported TYPE abp_behv_response_tab.

lt_update = VALUE #( ( travelid        = '00000001'
                       status          = 'A'
                       %control-status = if_abap_behv=>mk-on ) ).

DATA(lt_operations) = VALUE abp_behv_changes_tab(
  ( op          = if_abap_behv=>op-m-update
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_update ) ) ).

MODIFY ENTITIES OPERATIONS lt_operations
  FAILED lt_failed
  REPORTED lt_reported.

FIELD-SYMBOLS <lt_entries> TYPE ANY TABLE.

LOOP AT lt_failed INTO DATA(ls_response).
  " entity 하나에 한 줄. entries 는 데이터 참조라서 풀어서 본다
  ASSIGN ls_response-entries->* TO <lt_entries>.

  DATA(lv_entity) = ls_response-entity_name.
  DATA(lv_count)  = lines( <lt_entries> ).
ENDLOOP.
```

## 알아두기

- RAP BO provider(제공자) 구현에서 response parameter(응답 매개변수)를 다루는 규칙은 SAP 의 ABAP RESTful Application Programming Model 개발 가이드 "General RAP BO Implementation Contract" 절에 있습니다.

## 관련 항목

- [[abapeml_response]]
- [[abapeml_responses]]
- [[abapmodify_entities_operations_dyn]]
- [[abapread_entities_operations]]
- [[abapemlcommit_entities_dyn]]
- [[abapget_permissions_dyn]]
- [[abapset_locks_dyn]]
- [[abeneml_responses_dyn_abexa]]
