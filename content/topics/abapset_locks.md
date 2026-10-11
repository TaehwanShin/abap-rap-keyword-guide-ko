---
title: SET LOCKS 문
summary: RAP BO 인스턴스에 배타 잠금을 직접 걸어, 다른 사용자가 같은 인스턴스를 동시에 고치지 못하게 하는 EML 문입니다.
keywords: SET LOCKS, SET LOCKS ENTITY, SET LOCKS OF, lock_tab, 잠금, 배타 잠금, enqueue, lock master, lock dependent, FAILED, locked
---

## 문법

짧은 형식

```syntax
SET LOCKS ENTITY entity FROM inst [response_param].
```

긴 형식

```syntax
SET LOCKS OF bdef
   ENTITY entity1 FROM inst1
  [ENTITY entity2 FROM inst2]
  [...]
  [response_param].
```

동적 형식

```syntax
SET LOCKS lock_tab [response_param].
```

## 설명

`SET LOCKS` 는 RAP BO 인스턴스에 잠금(enqueue 잠금)을 걸어, 여러 사용자가 같은 인스턴스를 동시에 고치는 일을 막습니다.

인스턴스를 수정하면 RAP 프레임워크가 그 인스턴스를 자동으로 잠급니다. 그래서 보통은 이 문을 쓸 일이 없습니다. RAP BO consumer(사용자)가 "다른 사용자가 이 인스턴스를 동시에 고치지 못하게" 배타 잠금을 미리 잡아 두고 싶을 때 이 문을 씁니다. 잠금은 RAP 트랜잭션이 끝날 때까지 유지됩니다.

behavior definition(동작 정의)에는 잠금 설정이 있어야 합니다. root entity(루트 엔터티)는 반드시 `lock master` 이고, child entity(자식 엔터티)는 모두 `lock dependent` 입니다. 그래서 child entity 의 인스턴스를 잠그라고 요청하면, 그 인스턴스가 딸린 root entity 인스턴스가 잠깁니다. behavior definition 쪽 조건은 [[abenbdl_locking]] 에 자세히 나옵니다.

형식은 세 가지입니다.

| 형식 | 쓰임새 |
| --- | --- |
| [[abapset_locks_entity]] | entity(엔터티) 하나의 인스턴스를 잠급니다. |
| [[abapset_locks_of]] | 여러 entity 의 인스턴스를 한 번에 잠급니다. |
| [[abapset_locks_dyn]] | 잠글 entity 와 인스턴스를 내부 테이블에 모아 문 하나로 잠급니다. |

`response_param` 은 response parameter(응답 매개변수)이고, 적지 않아도 됩니다([[abapeml_response]]). 인스턴스가 이미 다른 곳에서 잠겨 있으면, 실패 원인이 `locked` 인 정보가 `FAILED` response parameter 로 돌아옵니다. 실패 원인 값은 interface `IF_ABAP_BEHV` 에 정의되어 있습니다.

## 예제

여행 두 건을 잠그고, 이미 잠겨 있어서 실패한 것이 있는지 확인합니다.

```abap
SET LOCKS ENTITY zr_travel
  FROM VALUE #( ( travelid = '00000001' )
                ( travelid = '00000002' ) )
  FAILED   FINAL(ls_failed)
  REPORTED FINAL(ls_reported).

LOOP AT ls_failed-travel ASSIGNING FIELD-SYMBOL(<ls_failed>).
  IF <ls_failed>-%fail-cause = if_abap_behv=>cause-locked.
    " 다른 사용자가 이미 잠가 둔 여행이다
  ENDIF.
ENDLOOP.
```

## 알아두기

- handler method(핸들러 메서드) 가운데서는 [[abaphandler_meth_lock|FOR LOCK]] 과 [[abaphandler_meth_modify|FOR MODIFY]] 메서드에서만 `SET LOCKS` 를 쓸 수 있습니다.
- EML 문은 반복문 안에서 쓰지 않는 편이 좋습니다. 한 건씩 데이터베이스에 여러 번 접근하게 되어 느려질 수 있습니다. 필요한 데이터는 EML 문 하나로 읽고, 바꿀 때도 EML 수정 요청 하나로 처리합니다.
- RAP 작업을 구현할 때는 RAP BO 계약(RAP BO contract)을 지켜야 합니다. 추려 놓은 규칙은 [[abaprap_impl_rules]] 에 있습니다.

## 관련 항목

- [[abapset_locks_entity]]
- [[abapset_locks_of]]
- [[abapset_locks_dyn]]
- [[abenbdl_locking]]
- [[abaphandler_meth_lock]]
- [[abapeml_response]]
- [[abapderived_types_fail]]
