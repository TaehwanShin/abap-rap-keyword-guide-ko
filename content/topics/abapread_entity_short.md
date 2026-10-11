---
title: READ ENTITY 문, 짧은 형식
summary: RAP BO entity 하나에서만 읽는 READ ENTITY 형식입니다. entity 의 전체 이름을 바로 적고, 읽기·read-by-association·function 실행을 한 번씩 담을 수 있습니다.
keywords: READ ENTITY, 짧은 형식, short form, IN LOCAL MODE, WITH CHANGES, PRIVILEGED, FORWARDING, RESULT, FAILED, 읽기 작업, 엔터티 하나
---

## 문법

```syntax
READ ENTITY [IN LOCAL MODE [WITH CHANGES]|[FORWARDING] PRIVILEGED]
    entity operations [response_param].
```

원문의 이 틀은 `WITH CHANGES` 를 entity(엔터티) 이름 앞에 적습니다. 그런데 원문의 [[abapeml_read_with_changes]] 항목은 틀과 예제 모두 `READ ENTITY IN LOCAL MODE entity WITH CHANGES ...` 처럼 entity 이름 뒤에 적습니다.

## 설명

짧은 형식은 **entity 하나**에서만 읽습니다. 어떤 작업을 쓸 수 있는지는 [[abapread_entity_entities_op]] 에서 봅니다.

- `entity` 에는 읽을 entity 이름을 바로 적습니다. child entity(자식 엔터티)도 root entity(루트 엔터티)를 거치지 않고 바로 읽을 수 있습니다.
- `entity` 는 **전체 이름**이어야 합니다. 별칭은 쓸 수 없습니다. 어느 RAP BO 에 속하는지 문장만 봐서는 알 수 없기 때문입니다.
- 한 문장에 읽기, read-by-association, function 실행 세 가지를 함께 담을 수 있습니다. 다만 종류마다 한 번씩만 쓸 수 있습니다.

추가 구문은 네 가지입니다.

| 추가 구문 | 뜻 |
| --- | --- |
| `IN LOCAL MODE` | [[abenbdl_actions_fc|feature control]] 과 [[abenbdl_authorization|권한 확인]]을 건너뜁니다. RAP BO 구현 안에서만 쓸 수 있습니다. [[abapin_local_mode]] 를 봅니다. |
| `WITH CHANGES` | 한 RAP 트랜잭션 안에서 인스턴스에 쌓인 변경 작업 정보를 함께 읽습니다. [[abapeml_read_with_changes]] 를 봅니다. |
| `[FORWARDING] PRIVILEGED` | `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. BDEF 에 `privileged` 가 지정돼 있어야 합니다. [[abapeml_privileged]] 를 봅니다. |
| `response_param` | response parameter(응답 매개변수)를 받습니다. [[abapeml_response]] 를 봅니다. |

## 예제

여행 한 건의 모든 필드를 읽고, 읽지 못했으면 처리를 끝냅니다.

```abap
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed).

IF ls_failed-travel IS NOT INITIAL.
  " 읽지 못했다
  RETURN.
ENDIF.
```

같은 문장에 read-by-association 을 더할 수 있습니다. 여행과 그 여행의 예약을 함께 읽습니다.

```abap
READ ENTITY zr_travel
  FIELDS ( agencyid status ) WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel_part)
  BY \_booking
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_booking)
  FAILED DATA(ls_read_failed).
```

## 알아두기

- 짧은 형식에는 별칭을 쓸 수 없고, 긴 형식의 `ENTITY` 뒤에는 별칭을 씁니다. 두 형식의 이름 규칙이 다릅니다.
- 같은 종류의 작업을 두 번 쓰려면(예: association 두 개를 따라 읽기) [[abapread_entities_long|긴 형식]]을 씁니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entities_long]]
- [[abapread_entities_operations]]
- [[abapread_entity_entities_op]]
- [[abapread_entity_entities_fields]]
- [[abeneml_read_alternatives_abexa]]
- [[abapeml_read_examples_abexas]]
