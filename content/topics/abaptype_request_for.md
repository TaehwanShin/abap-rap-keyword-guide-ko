---
title: TYPE REQUEST FOR (저장 요청 구조 타입)
summary: saver method save_modified 가 받는 create, update, delete 매개변수의 타입으로, 저장할 인스턴스를 entity 별 내부 테이블에 담은 구조입니다.
keywords: TYPE REQUEST FOR, REQUEST FOR CHANGE, REQUEST FOR DELETE, save_modified, create, update, delete, with additional save, with unmanaged save, 추가 저장, 비관리형 저장, CL_ABAP_BEHAVIOR_SAVER, BDEF 파생 타입
---

## 문법

```syntax
... REQUEST FOR { { CHANGE
                  | DELETE }
                    bdef } ...
```

## 설명

`TYPE REQUEST FOR` 는 구조 타입인 BDEF derived type(BDEF 파생 타입)입니다. 쓰이는 곳은 한 군데뿐입니다. managed 구현에 `with additional save`(additional save)나 `with unmanaged save`(unmanaged save)를 붙였을 때 behavior pool(동작 풀)에 생기는 saver method(세이버 메서드) `save_modified` 입니다.

`save_modified` 는 기본 saver class(세이버 클래스) `CL_ABAP_BEHAVIOR_SAVER` 를 상속한 로컬 saver class 에 있습니다. 이 메서드 안에서는 미리 정해진 매개변수 세 개를 쓸 수 있습니다.

| 매개변수 | 타입 | 들어 있는 것 |
| --- | --- | --- |
| `create` | `TYPE REQUEST FOR CHANGE` | 새로 만들어 저장할 인스턴스 |
| `update` | `TYPE REQUEST FOR CHANGE` | 수정해서 저장할 인스턴스 |
| `delete` | `TYPE REQUEST FOR DELETE` | 삭제할 인스턴스 |

세 매개변수는 모두 **entity(엔터티) 이름을 딴 내부 테이블을 구성요소로 품은 구조**입니다.

### CHANGE bdef

`create` 와 `update` 의 타입입니다. 안에 든 내부 테이블은 다음 두 조건을 모두 채우는 entity 마다 하나씩 있습니다.

- BDEF 에서 `with additional save` 또는 `with unmanaged save` 가 걸려 있다.
- 생성(`CREATE`)이나 수정(`UPDATE`) 작업이 허용되어 있다.

내부 테이블의 타입은 `TYPE TABLE FOR CHANGE` 입니다. 만들거나 고쳐서 저장할 RAP BO 인스턴스가 줄마다 들어 있습니다.

### DELETE bdef

`delete` 의 타입입니다. 안에 든 내부 테이블은 `with additional save` 또는 `with unmanaged save` 가 걸려 있고 삭제(`DELETE`) 작업이 허용된 entity 마다 하나씩 있습니다.

내부 테이블의 타입은 `TYPE TABLE FOR KEY OF` 입니다. 삭제할 RAP BO 인스턴스의 키가 줄마다 들어 있습니다.

## 예제

여행이 새로 생기거나 지워질 때 이력 테이블 `ztravel_hist` 에 한 줄씩 남깁니다. `create-travel` 과 `delete-travel` 이 entity `Travel` 의 내부 테이블입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    DATA lt_hist TYPE STANDARD TABLE OF ztravel_hist WITH EMPTY KEY.
    GET TIME STAMP FIELD DATA(lv_now).

    " create : TYPE REQUEST FOR CHANGE zr_travel
    LOOP AT create-travel INTO DATA(ls_created).
      APPEND VALUE #( travel_id  = ls_created-travelid
                      operation  = 'CREATE'
                      changed_at = lv_now ) TO lt_hist.
    ENDLOOP.

    " delete : TYPE REQUEST FOR DELETE zr_travel (키만 들어 있다)
    LOOP AT delete-travel INTO DATA(ls_deleted).
      APPEND VALUE #( travel_id  = ls_deleted-travelid
                      operation  = 'DELETE'
                      changed_at = lv_now ) TO lt_hist.
    ENDLOOP.

    INSERT ztravel_hist FROM TABLE @lt_hist.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- `create`, `update`, `delete` 는 `save_modified` 안에서 선언 없이 바로 쓸 수 있습니다. 같은 타입의 변수를 따로 선언하지 않아도 됩니다.
- 세 매개변수는 `CL_ABAP_BEHAVIOR_SAVER` 를 상속한 로컬 saver class 안에서만 쓸 수 있습니다.
- additional save 와 unmanaged save 를 거는 방법은 [[abenbdl_saving]] 에 있습니다.

## 관련 항목

- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abenrap_additional_save_abexa]]
- [[abenrap_managed_unm_save_abexa]]
