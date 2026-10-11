---
title: response parameter (FAILED, MAPPED, REPORTED)
summary: EML 문 끝에 붙여 실패한 인스턴스, 키 mapping 정보, 메시지를 돌려받는 FAILED, MAPPED, REPORTED 추가 구문입니다.
keywords: response_param, 응답 매개변수, FAILED, MAPPED, REPORTED, failed_resp, mapped_resp, reported_resp, %msg, %state_area, EML_FAILED_MISSING_OK, 오류 처리, 키 매핑, 메시지
---

## 문법

```syntax
... [FAILED failed_resp]
    [MAPPED mapped_resp]
    [REPORTED reported_resp] ...
```

## 설명

EML 문을 실행한 뒤 무슨 일이 있었는지 돌려받는 자리입니다. 세 가지가 있습니다.

| 추가 구문 | 돌려받는 것 |
| --- | --- |
| `FAILED failed_resp` | 실패한 것. 곧 처리하지 못한 작업 |
| `MAPPED mapped_resp` | 키 mapping 정보 |
| `REPORTED reported_resp` | 돌아온 메시지. 원문은 오류 메시지라고 적지만, 원문 예제 [[abeneml_privileged_abexa]] 에서는 성공 메시지도 여기에 담겨 옵니다. |

EML 문마다 쓸 수 있는 응답이 다릅니다.

| EML 문 | `FAILED` | `MAPPED` | `REPORTED` |
| --- | --- | --- | --- |
| [[abapmodify_entity_entities|MODIFY ENTITY, ENTITIES]] | ○ | ○ | ○ |
| [[abapread_entity_entities|READ ENTITY, ENTITIES]] | ○ | | ○ |
| [[abapcommit_entities|COMMIT ENTITIES]] | ○ | | ○ |
| [[abapget_permissions|GET PERMISSIONS]] | ○ | | ○ |
| [[abapset_locks_entity|SET LOCKS]] | ○ | | ○ |

`failed_resp`, `mapped_resp`, `reported_resp` 자리에 무엇을 적어야 하는지는 EML 문의 꼴에 따라 다릅니다.

- 동적이 아닌 꼴(짧은 꼴과 긴 꼴. 예: [[abapmodify_entity_short|MODIFY ENTITY]], [[abapmodify_entities_long|MODIFY ENTITIES]])에서는 [[abapeml_responses]] 를 봅니다.
- 동적 꼴에서는 [[abapeml_responses_dyn]] 을 봅니다.

## 예제

여행을 하나 만들고 세 응답을 모두 받습니다. `TravelID` 는 BO 가 early numbering 으로 정한다고 봅니다. 그래서 새 키는 `MAPPED` 에서 꺼냅니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid )
    WITH VALUE #( ( %cid = 'c1' agencyid = '070001' customerid = '000042' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

IF ls_failed IS INITIAL.
  " 성공: %cid 에 짝지어진 실제 키를 꺼낸다
  DATA(lv_travel_id) = ls_mapped-travel[ %cid = 'c1' ]-travelid.
ELSE.
  " 실패: 어느 인스턴스가 왜 실패했는지 본다
  LOOP AT ls_failed-travel INTO DATA(ls_failed_travel).
    DATA(lv_cause) = ls_failed_travel-%fail-cause.
  ENDLOOP.
ENDIF.
```

## 알아두기

- 받을 변수는 `DATA( )` 나 `FINAL( )` 로 그 자리에서 선언할 수 있습니다.
- 돌려줄 것이 없으면 비어 있습니다. 작업이 성공했다면 `failed_resp` 에는 줄이 없습니다.
- `reported_resp` 에는 구성요소 [[abapderived_types_msg|%msg]] 가 있습니다. 타입은 `REF TO if_abap_behv_message` 이고, 이 interface 는 `if_t100_dyn_msg` 를 포함합니다. interface 를 직접 구현할 필요가 없다면, 상속받은 메서드 `new_message` 나 `new_message_with_text` 를 표준 구현으로 쓰면 됩니다.
- `MAPPED` 는 UUID 를 쓰는 생성 작업과 이른 internal numbering 에서 꼭 적어야 합니다. 원문은 external numbering 에서는 `MAPPED` 를 지정할 수 없다고 적고 있습니다. 그런데 원문 예제 [[abeneml_responses_abexa]] 는 키 값을 직접 넣어 인스턴스를 만들면서 `MAPPED` 도 함께 받습니다. late numbering 에서는 [[abapemlcommit_entities_late|CONVERT KEY]] 문을 쓸 수 있습니다.
- [[abapmodify_aug_entity_entities|AUGMENTING]] 을 붙인 `MODIFY` 문에는 `FAILED`, `MAPPED`, `REPORTED` 를 쓸 수 없습니다.
- `READ` 요청에 `REPORTED` 를 적으면, 지정한 키의 인스턴스와 composition 의 child entity(자식 엔터티)에 걸린 상태 메시지가 함께 돌아옵니다. 그만큼 실행 시간이 늘어납니다. 읽기 요청에서 `REPORTED` 의 메시지를 받아야 할 일은 보통 없습니다.
- RAP BO consumer(사용자)가 보낸 읽기 요청에서 인스턴스에 상태 메시지가 있으면, `REPORTED` 응답의 [[abapderived_types_state_area|%state_area]] 에 상태 메시지라는 표시로 `%STATE` 가 들어 있습니다. behavior implementation(동작 구현) 안에서 `IN LOCAL MODE` 를 붙인 `READ` 문을 쓰면 `%state_area` 의 원래 값을 얻을 수 있습니다. [[abenrap_messages_abexa]] 를 참고합니다.
- 동적이 아닌 `MODIFY` 문에 `IN LOCAL MODE` 도 없고 `FAILED` 도 없으면 문법 경고가 납니다. `FAILED` 를 적고 RAP BO consumer 쪽에서 오류를 제대로 처리하기를 권합니다. 경고만 없애려면 pragma `##EML_FAILED_MISSING_OK` 를 씁니다.
- RAP BO provider(제공자) 구현에서 response parameter(응답 매개변수)를 다루는 규칙은 SAP 의 ABAP RESTful Application Programming Model 개발 가이드 "General RAP BO Implementation Contract" 절에 있습니다.

## 관련 항목

- [[abapcommon_eml_elements]]
- [[abapeml_responses]]
- [[abapeml_responses_dyn]]
- [[abaptype_response_for]]
- [[abapderived_types_msg]]
- [[abapderived_types_state_area]]
- [[abeneml_responses_abexa]]
