---
title: COMMIT ENTITIES 짧은 형식
summary: RAP 트랜잭션에서 바뀐 모든 RAP BO 인스턴스를 한 줄로 저장하는 형식입니다. 필요하면 RESPONSES 로 저장 단계의 응답을 받습니다.
keywords: COMMIT ENTITIES, 짧은 형식, short form, RESPONSES, FAILED, REPORTED, ABP_BEHV_RESPONSE_TAB, IN SIMULATION MODE, 저장, 커밋
---

## 문법

```syntax
COMMIT ENTITIES [IN SIMULATION MODE] [RESPONSES response_param].
```

## 설명

`COMMIT ENTITIES` 의 가장 간단한 형식입니다. RAP save sequence(저장 순서)를 시작하고 RAP 트랜잭션을 끝냅니다. transactional buffer(트랜잭션 버퍼)에 있는 변경, 곧 RAP 트랜잭션 안에서 만들고 고치고 지운 인스턴스가 모두 데이터베이스에 저장됩니다.

추가 구문은 두 가지입니다.

- `IN SIMULATION MODE` : 실제로 저장하지 않고 저장을 흉내만 냅니다. 자세한 내용은 [[abapcommit_entities_simulation]] 에 있습니다.
- `RESPONSES response_param` : saver method(세이버 메서드)의 response parameter(응답 매개변수)가 돌려준 정보를 받습니다. 선택 사항입니다. `FAILED` 와 `REPORTED` 뒤에 오는 변수는 `ABP_BEHV_RESPONSE_TAB` 타입 내부 테이블이어야 합니다. `response_param` 의 자세한 내용은 [[abapeml_response]] 에 있습니다.

문 전체에 해당하는 주의점은 [[abapcommit_entities]] 에 모여 있습니다.

## 예제

여행을 만들고 응답 없이 저장합니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid )
    WITH VALUE #( ( %cid = 'cid1' agencyid = '070001' customerid = '000042' ) )
  FAILED DATA(ls_failed).

COMMIT ENTITIES.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.
```

저장 단계의 응답이 필요하면 `RESPONSES` 를 붙입니다. 응답은 entity(엔터티)별 구조가 아니라 `ABP_BEHV_RESPONSE_TAB` 타입 테이블로 옵니다.

```abap
COMMIT ENTITIES RESPONSES
  FAILED   DATA(lt_failed)
  REPORTED DATA(lt_reported).

IF sy-subrc <> 0 OR lt_failed IS NOT INITIAL.
  " 저장하지 못한 인스턴스가 있다
ENDIF.
```

## 알아두기

- RAP BO provider(제공자) 안에서는 쓸 수 없습니다.
- `sy-subrc` 를 확인하지 않으면 문법 경고가 납니다.
- RAP BO 별로 응답을 나누어 받으려면 [[abapemlcommit_entities_long|긴 형식]] 을 씁니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapemlcommit_entities_long]]
- [[abapcommit_entities_simulation]]
- [[abapeml_response]]
- [[abencommit_entities_sh_lo_abexa]]
