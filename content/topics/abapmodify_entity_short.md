---
title: MODIFY ENTITY 짧은 형식
summary: RAP BO 의 entity 하나를 놓고 생성·수정·삭제나 action 실행 같은 변경 작업을 하는 형식입니다. entity 는 별칭이 아닌 전체 이름으로 적습니다.
keywords: MODIFY ENTITY, 짧은 형식, short form, CREATE, CREATE BY, UPDATE, DELETE, EXECUTE, IN LOCAL MODE, PRIVILEGED, FORWARDING, FAILED, MAPPED, REPORTED, EML_FAILED_MISSING_OK, 변경
---

## 문법

```syntax
MODIFY ENTITY [IN LOCAL MODE|[FORWARDING] PRIVILEGED] entity operations [response_param].
```

구현 클래스 안에서는 root entity(루트 엔터티) 이름 뒤에 `\\` 를 붙여 BO 의 다른 노드를 가리킬 수도 있습니다.

```syntax
MODIFY ENTITY root_entity\\bdef_node1 ...
MODIFY ENTITY root_entity\\bdef_node2 ...
...
```

## 설명

RAP BO 의 노드(entity(엔터티)) **하나**에 트랜잭션 변경 작업을 실행합니다. `operations` 자리에는 작업을 여러 개 이어 적을 수 있습니다. 어떤 작업을 어떻게 적는지는 [[abapmodify_entity_entities_op]] 에 있습니다.

`entity` 에 적을 수 있는 것은 문을 쓰는 곳에 따라 다릅니다.

- 구현 클래스 **안**에서는 RAP BO 의 어느 노드든 적을 수 있습니다.
- 구현 클래스 **밖**에서는 RAP BO 의 root entity 만 적을 수 있습니다.
- `entity` 는 별칭이 아니라 **전체 entity 이름**이어야 합니다.
- `root_entity\\bdef_node` 로 적을 때 `bdef_node` 는 behavior definition(동작 정의)에 별칭이 있으면 별칭을, 없으면 전체 이름을 적습니다.

### 추가 구문

- `IN LOCAL MODE` : feature control(기능 제어)와 권한 확인을 건너뜁니다. RAP BO 런타임 구현 안에서만 쓸 수 있습니다. [[abapin_local_mode]] 을 봅니다.
- `[FORWARDING] PRIVILEGED` : `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. behavior definition 에 `privileged` 가 적혀 있어야 쓸 수 있습니다. [[abapeml_privileged]] 을 봅니다.
- `response_param` : response parameter(응답 매개변수, `FAILED`, `MAPPED`, `REPORTED`)입니다. [[abapeml_response]] 을 봅니다.

## 예제

여행 하나를 만들고, 같은 문에서 그 여행에 예약을 하나 붙입니다. 작업 두 개를 한 문에 이어 적었습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( agencyid customerid )
  WITH VALUE #( ( %cid = 'cid1' agencyid = '070001' customerid = '000042' ) )
  CREATE BY \_booking FIELDS ( flightdate )
  WITH VALUE #( ( %cid_ref = 'cid1'
                  %target  = VALUE #( ( %cid = 'cid2' flightdate = '20260301' ) ) ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

behavior pool(동작 풀) 안에서는 `\\` 뒤에 별칭을 적어 child entity(자식 엔터티)를 바로 고칠 수 있습니다.

```abap
" handler method 안: 예약의 비행 날짜를 고친다
MODIFY ENTITY zr_travel\\booking
  UPDATE FIELDS ( flightdate )
  WITH VALUE #( ( travelid = '00000001' bookingid = '0001' flightdate = '20260305' ) )
  FAILED   DATA(ls_failed_upd)
  REPORTED DATA(ls_reported_upd).
```

## 알아두기

- `IN LOCAL MODE` 가 없는 `MODIFY` 문에 `FAILED` 를 적지 않으면 문법 경고가 납니다. `FAILED` 를 받아 RAP BO consumer(사용자) 쪽에서 오류를 처리하는 것이 좋습니다. 경고만 없애려면 프라그마 `##EML_FAILED_MISSING_OK` 를 씁니다.
- RAP BO provider(제공자)는 saver method(세이버 메서드) `check_before_save`, `adjust_numbers`, `save`, `save_modified`, `cleanup` 안에서 `MODIFY` 문을 쓰면 안 됩니다. interaction phase(상호작용 단계)와, save sequence(저장 순서) 가운데 `finalize` 메서드에서만 쓸 수 있습니다. readonly handler method(핸들러 메서드) 안에서도 쓸 수 없습니다.
- [[abapmodify_entities_long|긴 형식]] 은 `ENTITY` 뒤에 별칭을 쓰지만, 짧은 형식의 `entity` 는 전체 이름이어야 합니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapmodify_entities_long]]
- [[abapmodify_entities_operations_dyn]]
- [[abapmodify_entity_entities_op]]
- [[abapin_local_mode]]
- [[abapeml_privileged]]
- [[abapeml_response]]
- [[abensaver_finalize]]
- [[abeneml_modify_alternatives_abexa]]
- [[abapeml_modify_examples_abexas]]
