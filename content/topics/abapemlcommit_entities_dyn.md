---
title: COMMIT ENTITIES RESPONSES OF (동적 형식)
summary: 저장 응답을 받을 root entity 이름을 내부 테이블에 담아 실행 시점에 정하는 형식입니다.
keywords: COMMIT ENTITIES, RESPONSES OF, 동적 형식, dynamic form, dyn_tab, ABP_ENTITY_NAME_TAB, ABP_ROOT_ENTITY_NAME, ABP_BEHV_RESPONSE_TAB, FAILED, REPORTED, IN SIMULATION MODE
---

## 문법

```syntax
COMMIT ENTITIES [IN SIMULATION MODE] RESPONSES OF dyn_tab response_param.
```

## 설명

RAP save sequence(저장 순서)를 시작하고 RAP 트랜잭션을 끝냅니다. transactional buffer(트랜잭션 버퍼)에 있는 변경, 곧 RAP 트랜잭션 안에서 만들고 고치고 지운 인스턴스가 모두 데이터베이스에 저장됩니다.

`RESPONSES OF` 를 쓰면 saver method(세이버 메서드)의 `FAILED`, `REPORTED` 응답을 받을 root entity(루트 엔터티)를 코드에 고정하지 않고 `dyn_tab` 에 담아 넘깁니다. root entity 를 하나 넣어도 되고 여럿 넣어도 됩니다.

타입 규칙은 다음과 같습니다.

- `dyn_tab` 은 `ABP_ENTITY_NAME_TAB` 타입이어야 합니다. 줄마다 root entity 이름이 하나씩 들어가고, 그 이름은 `ABP_ROOT_ENTITY_NAME` 타입이어야 합니다.
- `FAILED` 와 `REPORTED` 뒤의 변수는 `ABP_BEHV_RESPONSE_TAB` 타입 내부 테이블이어야 합니다.

`IN SIMULATION MODE` 를 붙이면 실제로 저장하지 않고 저장을 흉내만 냅니다. 자세한 내용은 [[abapcommit_entities_simulation]] 에 있습니다.

`response_param` 의 자세한 내용은 [[abapeml_response]] 에, 문 전체에 해당하는 주의점은 [[abapcommit_entities]] 에 있습니다.

## 예제

여행 BO 와 여행사 BO 의 저장 응답을 한 테이블로 받습니다.

```abap
DATA: lv_root_travel TYPE abp_root_entity_name VALUE 'ZR_TRAVEL',
      lv_root_agency TYPE abp_root_entity_name VALUE 'ZR_AGENCY'.

" 응답을 받을 root entity 목록
DATA(lt_roots) = VALUE abp_entity_name_tab( ( lv_root_travel )
                                            ( lv_root_agency ) ).

COMMIT ENTITIES
  RESPONSES OF lt_roots
    FAILED   DATA(lt_failed)
    REPORTED DATA(lt_reported).

IF sy-subrc <> 0.
  " lt_failed 에 두 BO 의 실패 내용이 함께 들어 있다
ENDIF.
```

## 알아두기

- RAP BO provider(제공자) 안에서는 쓸 수 없습니다.
- `sy-subrc` 를 확인하지 않으면 문법 경고가 납니다. 응답을 받았다면 `failed` 도 확인해 알맞게 처리합니다.
- [[abapemlcommit_entities_long|긴 형식]] 은 응답이 BO 별 구조로 나뉘어 오지만, 동적 형식은 `ABP_BEHV_RESPONSE_TAB` 타입 테이블 하나로 옵니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapemlcommit_entities_long]]
- [[abapcommit_entities_simulation]]
- [[abapeml_response]]
- [[abapeml_responses_dyn]]
- [[abeneml_commit_dyn_abexa]]
