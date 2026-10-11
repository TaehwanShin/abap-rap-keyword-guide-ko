---
title: SET LOCKS ENTITY 문 (짧은 형식)
summary: entity 하나의 인스턴스에 배타 잠금을 거는 SET LOCKS 의 짧은 형식입니다.
keywords: SET LOCKS ENTITY, 짧은 형식, 잠금, 배타 잠금, TYPE TABLE FOR KEY OF, TYPE TABLE FOR LOCK, FROM, response_param
---

## 문법

```syntax
SET LOCKS ENTITY entity FROM inst [response_param  ].
```

## 설명

RAP BO entity(엔터티) **하나**의 인스턴스를 배타적으로 잠급니다.

- `entity` : 잠글 entity 의 이름을 직접 적습니다. 별칭이 아니라 **entity 의 전체 이름**이어야 합니다. 짧은 형식에서는 어느 RAP BO 인지 알 수 없기 때문입니다.
- `inst` : 잠글 인스턴스를 담은 내부 테이블입니다. 타입은 BDEF derived type(BDEF 파생 타입) `TYPE TABLE FOR KEY OF` 여야 합니다([[abaptype_table_for]]). `FROM` 뒤에서 `VALUE` 같은 생성 연산자로 그 자리에서 만들어 넘겨도 됩니다.
- `response_param` : response parameter(응답 매개변수)입니다. 적지 않아도 됩니다([[abapeml_response]]).

## 예제

여행 두 건을 키로 지정해 잠급니다.

```abap
SET LOCKS ENTITY zr_travel
  FROM VALUE #( ( travelid = '00000001' )
                ( travelid = '00000002' ) )
  FAILED   FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

잠글 인스턴스를 변수에 먼저 담아 두어도 됩니다.

```abap
DATA lt_keys TYPE TABLE FOR KEY OF zr_travel.

lt_keys = VALUE #( ( travelid = '00000003' ) ).

SET LOCKS ENTITY zr_travel
  FROM lt_keys
  FAILED FINAL(ls_failed_keys).
```

## 알아두기

- `inst` 는 BDEF derived type `TYPE TABLE FOR LOCK` 으로 선언해도 됩니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_SET_LOCKS` 는 `SET LOCKS` 의 세 형식을 모두 다룹니다. 인스턴스를 여러 개 만든 뒤 키로 잠그는데, 짧은 형식은 예제 첫머리에 나옵니다.
- 트랜잭션이 진행되는 동안에는 잠근 인스턴스가 전역 잠금 테이블(트랜잭션 `SM12`)에 보입니다. `ROLLBACK ENTITIES` 를 실행하면 그 항목이 잠금 테이블에서 자동으로 지워집니다.

## 관련 항목

- [[abapset_locks]]
- [[abapset_locks_of]]
- [[abapset_locks_dyn]]
- [[abaptype_table_for]]
- [[abapeml_response]]
- [[abaprollback_entities]]
