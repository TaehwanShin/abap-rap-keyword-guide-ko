---
title: COMMIT ENTITIES RESPONSE OF (긴 형식)
summary: 저장하면서 saver method 의 FAILED, REPORTED 응답을 RAP BO 별로 따로 받는 형식입니다. RESPONSE OF 뒤에는 root entity 이름을 적습니다.
keywords: COMMIT ENTITIES, RESPONSE OF, 긴 형식, long form, FAILED, REPORTED, RESPONSE FOR FAILED LATE, RESPONSE FOR REPORTED LATE, IN SIMULATION MODE, 저장 응답, 루트 엔터티
---

## 문법

```syntax
COMMIT ENTITIES [IN SIMULATION MODE] RESPONSE OF bdef1 response_param
                                    [RESPONSE OF bdef2 response_param]
                                    [...].
```

## 설명

RAP save sequence(저장 순서)를 시작하고 RAP 트랜잭션을 끝냅니다. transactional buffer(트랜잭션 버퍼)에 있는 변경, 곧 RAP 트랜잭션 안에서 만들고 고치고 지운 인스턴스가 모두 데이터베이스에 저장됩니다.

긴 형식은 여기에 더해, saver method(세이버 메서드)의 response parameter(응답 매개변수) `FAILED` 와 `REPORTED` 가 돌려준 정보를 받습니다. 앞에서 변경한 RAP BO 하나 또는 여럿의 응답을 받을 수 있습니다.

- `bdef1`, `bdef2` 자리에는 **root entity(루트 엔터티) 이름**을 적습니다.
- 응답은 RAP BO 마다 따로 요청합니다. BO 하나에 `RESPONSE OF` 한 번입니다.
- `FAILED` 뒤의 변수는 `TYPE RESPONSE FOR FAILED LATE bdef`, `REPORTED` 뒤의 변수는 `TYPE RESPONSE FOR REPORTED LATE bdef` 타입이어야 합니다.
- `IN SIMULATION MODE` 를 붙이면 실제로 저장하지 않고 저장을 흉내만 냅니다. 자세한 내용은 [[abapcommit_entities_simulation]] 에 있습니다.

`response_param` 의 자세한 내용은 [[abapeml_response]] 에, 문 전체에 해당하는 주의점은 [[abapcommit_entities]] 에 있습니다.

## 예제

여행 BO `zr_travel` 과, 그와 관계없는 여행사 BO `zr_agency` 를 한 트랜잭션에서 바꾼 뒤 저장합니다. 응답은 BO 마다 따로 받습니다.

```abap
COMMIT ENTITIES
  RESPONSE OF zr_travel
    FAILED   DATA(ls_failed_travel)
    REPORTED DATA(ls_reported_travel)
  RESPONSE OF zr_agency
    FAILED   DATA(ls_failed_agency)
    REPORTED DATA(ls_reported_agency).

IF sy-subrc <> 0.
  " 어느 BO 에서 막혔는지 응답으로 가려낸다
  IF ls_failed_travel IS NOT INITIAL.
    " 여행 쪽에서 저장하지 못한 인스턴스가 있다
  ENDIF.
ENDIF.
```

응답 변수를 미리 선언하려면 타입에 `LATE` 를 붙입니다.

```abap
DATA: ls_failed   TYPE RESPONSE FOR FAILED LATE zr_travel,
      ls_reported TYPE RESPONSE FOR REPORTED LATE zr_travel.

COMMIT ENTITIES
  RESPONSE OF zr_travel
    FAILED   ls_failed
    REPORTED ls_reported.
```

## 알아두기

- RAP BO provider(제공자) 안에서는 쓸 수 없습니다.
- `sy-subrc` 를 확인하지 않으면 문법 경고가 납니다. 응답을 받았다면 `failed` 도 확인합니다.
- 응답을 받을 root entity 를 실행 시점에 정해야 하면 [[abapemlcommit_entities_dyn|동적 형식]] 을 씁니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapemlcommit_entities_short]]
- [[abapemlcommit_entities_dyn]]
- [[abapcommit_entities_simulation]]
- [[abapeml_response]]
- [[abaptype_response_for]]
- [[abencommit_entities_sh_lo_abexa]]
