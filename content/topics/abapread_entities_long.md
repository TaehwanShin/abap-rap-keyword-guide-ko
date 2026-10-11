---
title: READ ENTITIES 문, 긴 형식
summary: RAP BO 하나에 속한 여러 entity 의 읽기 작업을 한 문장에 모으는 READ ENTITIES OF 형식입니다.
keywords: READ ENTITIES OF, READ ENTITIES, 긴 형식, long form, ENTITY, IN LOCAL MODE, WITH CHANGES, PRIVILEGED, FORWARDING, 읽기 작업, 여러 엔터티
---

## 문법

```syntax
READ ENTITIES OF bdef [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
    ENTITY entity1 operations
    [ENTITY entity2 operations]
    [...]
    [WITH CHANGES]
    [response_param].
```

## 설명

긴 형식은 RAP BO 하나에 속한 **여러 entity(엔터티)**의 읽기 작업을 한 문장에 모을 때 씁니다. entity 하나만 읽는 데 써도 됩니다.

- `bdef` 에는 root entity(루트 엔터티)를 적습니다. 별칭이 아니라 전체 이름이어야 합니다.
- `ENTITY` 뒤의 `entity1`, `entity2` 는 그 root entity 의 composition 트리에 들어 있는 entity 입니다. root entity 자신도 올 수 있습니다.
- BDEF 에 별칭을 정해 두었다면 `ENTITY` 뒤에는 별칭을 씁니다. 전체 이름을 쓰면 문법 경고가 납니다. root entity 를 작업 목록에 넣을 때도 마찬가지입니다.
- `ENTITY ...` 한 덩어리의 문법은 [[abapread_entity_short|짧은 형식]]과 같습니다. 어떤 작업을 쓸 수 있는지는 [[abapread_entity_entities_op]] 에서 봅니다.
- `ENTITY` 와 작업으로 이루어진 덩어리가 적어도 하나는 있어야 합니다.
- 바로 읽는 작업에서는 같은 entity 를 `ENTITY` 뒤에 한 번만 적을 수 있습니다. root entity 이름은 여러 번 적을 수 있지만, association 으로 읽거나 `EXECUTE` 로 실행하는 작업일 때만 그렇습니다.

root entity 를 여러 번 적는 모양은 다음과 같습니다.

```syntax
READ ENTITIES OF bdef
   ENTITY bdef ...
   ENTITY bdef BY \_assoc1 ...
   ENTITY bdef BY \_assoc2 ...
...
```

추가 구문은 네 가지입니다.

| 추가 구문 | 뜻 |
| --- | --- |
| `IN LOCAL MODE` | [[abenbdl_actions_fc|feature control]] 과 [[abenbdl_authorization|권한 확인]]을 건너뜁니다. RAP BO 구현 안에서만 쓸 수 있습니다. [[abapin_local_mode]] 를 봅니다. |
| `[FORWARDING] PRIVILEGED` | `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. BDEF 에 `privileged` 가 지정돼 있어야 합니다. [[abapeml_privileged]] 를 봅니다. |
| `WITH CHANGES` | 한 RAP 트랜잭션 안에서 인스턴스에 쌓인 변경 작업 정보를 함께 읽습니다. [[abapeml_read_with_changes]] 를 봅니다. |
| `response_param` | response parameter(응답 매개변수)를 받습니다. [[abapeml_response]] 를 봅니다. |

## 예제

여행을 바로 읽고, 예약을 바로 읽고, 다른 여행의 예약을 association 으로 읽습니다. 작업마다 `RESULT` 를 따로 받고, response parameter 는 문장 끝에 한 번 적습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
    RESULT DATA(lt_travel)
  ENTITY booking
    " 예약을 바로 읽을 때는 키 필드를 모두 적는다
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' bookingid = '0001' ) )
    RESULT DATA(lt_booking)
  ENTITY travel
    " root entity 를 한 번 더: read-by-association
    BY \_booking
    ALL FIELDS WITH VALUE #( ( travelid = '00000002' ) )
    RESULT DATA(lt_booking_by_assoc)
  FAILED DATA(ls_failed).

IF ls_failed-travel IS NOT INITIAL.
  " 읽지 못한 여행이 있다
ENDIF.
```

## 알아두기

- `READ ENTITIES OF` 바로 뒤에는 root entity 의 전체 이름을, `ENTITY` 뒤에는 별칭을 씁니다.
- `WITH CHANGES` 는 `ENTITY` 덩어리들 뒤, response parameter 앞에 옵니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_short]]
- [[abapread_entities_operations]]
- [[abapread_entity_entities_op]]
- [[abapread_entity_entities_fields]]
- [[abeneml_read_alternatives_abexa]]
- [[abapeml_read_examples_abexas]]
