---
title: SET LOCKS OF 문 (긴 형식)
summary: 한 RAP BO 안 여러 entity 의 인스턴스를 문 하나로 잠그는 SET LOCKS 의 긴 형식입니다.
keywords: SET LOCKS OF, 긴 형식, 잠금, 배타 잠금, ENTITY, FROM, TYPE TABLE FOR KEY OF, TYPE TABLE FOR LOCK, 별칭, response_param
---

## 문법

```syntax
SET LOCKS OF bdef
   ENTITY entity1 FROM inst1
  [ENTITY entity2 FROM inst2]
  [...]
  [response_param  ].
```

## 설명

RAP BO 의 **여러 entity(엔터티)** 인스턴스를 한 번에 배타적으로 잠급니다.

`SET LOCKS OF bdef` 뒤에 잠글 대상을 entity 별로 묶어 늘어놓습니다. 묶음 하나하나의 문법은 [[abapset_locks_entity|짧은 형식]]과 같습니다. 묶음은 적어도 하나 있어야 합니다.

- `bdef` : root entity(루트 엔터티)입니다. **전체 이름**으로 적습니다.
- `entity1`, `entity2`, ... : `bdef` 의 composition 트리에 들어 있는 entity 입니다. root entity 자신을 적어도 됩니다. behavior definition(동작 정의)에 별칭이 있으면 **별칭**을 씁니다. 전체 이름을 쓰면 문법 경고가 납니다. root entity 를 이 자리에 적을 때도 별칭이 있으면 별칭을 씁니다.
- `inst1`, `inst2`, ... : 잠글 인스턴스를 담은 내부 테이블입니다. 타입은 BDEF derived type(BDEF 파생 타입) `TYPE TABLE FOR KEY OF` 여야 합니다([[abaptype_table_for]]). `FROM` 뒤에서 `VALUE` 같은 생성 연산자로 그 자리에서 만들어 넘겨도 됩니다.
- `response_param` : response parameter(응답 매개변수)입니다. 적지 않아도 됩니다([[abapeml_response]]).

## 예제

여행 한 건과 예약 한 건을 문 하나로 잠급니다. 첫 줄에는 root entity 의 전체 이름을, `ENTITY` 뒤에는 별칭을 적습니다.

```abap
SET LOCKS OF zr_travel
  ENTITY travel
    FROM VALUE #( ( travelid = '00000004' ) )
  ENTITY booking
    FROM VALUE #( ( travelid  = '00000005'
                    bookingid = '0001' ) )
  FAILED   FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

## 알아두기

- `inst1`, `inst2` 등은 BDEF derived type `TYPE TABLE FOR LOCK` 으로 선언해도 됩니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_SET_LOCKS` 는 `SET LOCKS` 의 세 형식을 모두 다룹니다. 인스턴스를 여러 개 만든 뒤 키로 잠그는데, 긴 형식은 예제 가운데쯤에 나옵니다.
- 트랜잭션이 진행되는 동안에는 잠근 인스턴스가 전역 잠금 테이블(트랜잭션 `SM12`)에 보입니다. `ROLLBACK ENTITIES` 를 실행하면 그 항목이 잠금 테이블에서 자동으로 지워집니다.

## 관련 항목

- [[abapset_locks]]
- [[abapset_locks_entity]]
- [[abapset_locks_dyn]]
- [[abaptype_table_for]]
- [[abapeml_response]]
- [[abaprollback_entities]]
