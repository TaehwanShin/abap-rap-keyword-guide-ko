---
title: RAISE ENTITY EVENT 문
summary: behavior pool 의 saver method 에서 RAP business event 를 일으키는 EML 문입니다. late save phase 에서만 쓸 수 있습니다.
keywords: RAISE ENTITY EVENT, 이벤트 발생, 이벤트 일으키기, RAP 비즈니스 이벤트, business event, TYPE TABLE FOR EVENT, %key, %param, save_modified, with additional save, BEHAVIOR_ILLEGAL_STATEMENT, 늦은 저장 단계
---

## 문법

```syntax
RAISE ENTITY EVENT ent~evt FROM tab.
```

## 설명

`RAISE ENTITY EVENT` 문은 RAP business event 를 일으킵니다. event 가 일어나면 그 event 를 받는 RAP event handler method(핸들러 메서드)가 불립니다.

쓸 수 있는 곳은 좁습니다. **behavior pool(동작 풀) 안, saver method(세이버 메서드), late save phase(늦은 저장 단계).** 이 세 조건을 모두 채워야 합니다. 다른 곳에서 실행하면 런타임 오류 `BEHAVIOR_ILLEGAL_STATEMENT` 가 납니다.

| 부분 | 뜻 |
| --- | --- |
| `ent` | RAP BO entity(엔터티)의 이름입니다. event 는 root entity(루트 엔터티)에서도 child entity(자식 엔터티)에서도 일으킬 수 있습니다. interface 를 쓰는 extension(확장)에서는 BDEF interface 의 소스 이름을 적어야 합니다. |
| `evt` | 일으킬 event 의 이름입니다. BDEF 나 BDEF extension 에 정의되어 있어야 합니다. |
| `tab` | BDEF derived type(BDEF 파생 타입) `TYPE TABLE FOR EVENT` 인 내부 테이블입니다. event 를 일으킬 인스턴스가 줄마다 들어 있습니다. |

`tab` 으로 넘기는 데이터에는 언제나 root entity 의 RAP BO 인스턴스 키가 구성요소 묶음 `%key` 로 들어 있습니다. event 를 매개변수와 함께 정의했다면 `%key` 와 `%param` 이 들어 있습니다.

## 예제

behavior definition(동작 정의)에 event 두 개를 선언합니다. 하나는 매개변수가 없고, 하나는 abstract entity `ZA_TravelDeleted` 를 매개변수로 받습니다. additional save 를 걸어 `save_modified` 가 불리게 합니다.

```bdl
managed with additional save
implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  event travelCreated;
  event travelDeleted parameter ZA_TravelDeleted;
}
```

saver method `save_modified` 에서 새로 만든 인스턴스와 삭제한 인스턴스마다 event 를 일으킵니다. `create-travel` 과 `delete-travel` 을 `FOR` 로 돌면서 event 테이블을 만듭니다.

```abap
CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.

    " 매개변수가 없는 event: %key 만 넘긴다
    IF create-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~travelcreated
        FROM VALUE #( FOR ls_created IN create-travel
                      ( %key = VALUE #( travelid = ls_created-travelid ) ) ).
    ENDIF.

    " 매개변수가 있는 event: %key 와 %param 을 넘긴다
    IF delete-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~traveldeleted
        FROM VALUE #( FOR ls_deleted IN delete-travel
                      ( %key   = VALUE #( travelid = ls_deleted-travelid )
                        %param = VALUE #( reasoncode = '01'
                                          reasontext = '여행이 삭제되었습니다.' ) ) ).
    ENDIF.

  ENDMETHOD.
ENDCLASS.
```

`create` 는 `TYPE REQUEST FOR CHANGE`, `delete` 는 `TYPE REQUEST FOR DELETE` 타입의 깊은 구조이고, 그 안에 entity 이름을 딴 내부 테이블이 들어 있습니다.

## 알아두기

- RAP business event 는 saver method 에서 일으키기를 권장합니다. managed RAP BO 에서는 `with additional save` 로 additional save 를 걸고 `save_modified` 메서드 구현에서 일으키기를 권장합니다.
- behavior pool 밖에서 event 를 일으켜야 한다면, behavior pool 의 전역 클래스 안에 로컬 클래스를 따로 만듭니다. 그 로컬 클래스에 static 메서드를 두고, 구현부에서 event 일으키는 코드를 감쌉니다.
- 연결된 RAP BO 의 event 는 ABP 보조 클래스에서도 일으킬 수 있습니다.
- event 를 받는 쪽은 [[abenmethod_for_entity_event]] 에서 설명합니다.

## 관련 항목

- [[abenbdl_event]]
- [[abenrap_events]]
- [[abenmethod_for_entity_event]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abaptype_table_for]]
- [[abaptype_request_for]]
- [[abapderived_types_key]]
- [[abapderived_types_param]]
- [[abenrap_events_local_con_abexa]]
