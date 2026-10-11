---
title: 누적 변경 종류 (%chg)
summary: 한 RAP 트랜잭션 안에서 인스턴스에 쌓인 변경이 생성·수정·삭제 가운데 무엇인지 알려 주는 구성요소입니다.
keywords: %chg, WITH CHANGES, READ CHANGES, TYPE TABLE FOR READ CHANGES, if_abap_behv=>cop, cop-create, cop-update, cop-delete, recreate, redelete, unchanged, ABP_BEHV_MNGD_OP, AdditionalSave, 누적 변경, 변경 종류
---

## 설명

`%chg` 는 한 RAP 트랜잭션 안에서 RAP BO 인스턴스에 쌓인 변경이 어떤 종류인지 알려 주는 구성요소입니다. 값을 보면 그 인스턴스가 이번 트랜잭션에서 만들어졌는지, 바뀌었는지, 지워졌는지 알 수 있습니다.

쓰이는 곳은 두 군데입니다.

- 추가 구문 `WITH CHANGES` 를 붙인 EML `READ` 문의 읽기 결과([[abapeml_read_with_changes]]). draft 인스턴스에서는 `%chg` 값이 짝이 되는 active(활성) 인스턴스에 쌓인 작업을 가리킵니다.
- BDEF 에 `AdditionalSave` 로 정의한 draft action. 여기서는 `if_abap_behv=>cop-create`, `if_abap_behv=>cop-update`, `if_abap_behv=>cop-delete` 세 값을 씁니다.

값은 interface `IF_ABAP_BEHV` 의 구조형 상수 `cop` 로 나타냅니다.

| 구성요소 | 값 | 뜻 |
| --- | --- | --- |
| `create` | `C` | 이번 트랜잭션에서 새로 만들었고, 전에는 없던 인스턴스입니다. |
| `update` | `U` | 전부터 있던 인스턴스를 이번 트랜잭션에서 수정했습니다. |
| `delete` | `D` | 전부터 있던 인스턴스를 이번 트랜잭션에서 삭제했습니다. |
| `recreate` | `R` | 전부터 있던 인스턴스를 이번 트랜잭션에서 삭제한 뒤 다시 만들었습니다. |
| `redelete` | `L` | 전에는 없던 인스턴스를 이번 트랜잭션에서 만들었다가 다시 삭제했습니다. child entity(자식 엔터티)가 있고 그 자식을 draft 방식으로 다루는 RAP BO 에서만 의미가 있습니다. |
| `unchanged` | `N` | 전부터 있던 인스턴스이고, 이번 트랜잭션에서 바뀌지 않았습니다. |

### 타입

`ABP_BEHV_MNGD_OP`

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `READ CHANGES`

draft action `AdditionalSave` 를 구현하는 handler method(핸들러 메서드) `FOR MODIFY ... FOR ACTION ...~AdditionalSave` 안에서도 쓸 수 있습니다. ([[abaphandler_meth_modify]])

## 예제

managed RAP BO 의 handler method 안에서 `WITH CHANGES` 로 읽고, `%chg` 값에 따라 나누어 처리합니다.

```abap
DATA lt_changes TYPE TABLE FOR READ CHANGES zr_travel.

READ ENTITY IN LOCAL MODE zr_travel
  WITH CHANGES
  ALL FIELDS WITH CORRESPONDING #( keys )
  RESULT lt_changes
  FAILED failed.

LOOP AT lt_changes INTO DATA(ls_change).
  CASE ls_change-%chg.
    WHEN if_abap_behv=>cop-create.
      " 이번 트랜잭션에서 새로 만든 여행
    WHEN if_abap_behv=>cop-update.
      " 전부터 있었고 이번에 수정한 여행
    WHEN if_abap_behv=>cop-delete.
      " 이번에 삭제한 여행
    WHEN if_abap_behv=>cop-unchanged.
      " 바뀌지 않은 여행
  ENDCASE.
ENDLOOP.
```

draft action `AdditionalSave` 의 handler method 에서는 넘어온 매개변수 안의 entity(엔터티)별 테이블을 돌면서 `%chg` 를 봅니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS additionalsave FOR MODIFY
      IMPORTING keys FOR ACTION travel~additionalsave.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD additionalsave.
    LOOP AT keys INTO DATA(ls_key).
      LOOP AT ls_key-%param-travel INTO DATA(ls_travel).
        IF ls_travel-%chg = if_abap_behv=>cop-create.
          " 새로 만든 인스턴스 처리
        ENDIF.
        IF ls_travel-%chg = if_abap_behv=>cop-update.
          " 수정한 인스턴스 처리
        ENDIF.
        IF ls_travel-%chg = if_abap_behv=>cop-delete.
          " 삭제한 인스턴스 처리
        ENDIF.
      ENDLOOP.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- `WITH CHANGES` 는 managed RAP BO 의 구현 클래스 안에서 `IN LOCAL MODE` 와 함께만 쓸 수 있습니다. 자세한 제약은 [[abapeml_read_with_changes]] 에 있습니다.
- `redelete` 값은 child entity 를 draft 방식으로 다룰 때만 나옵니다.

## 관련 항목

- [[abapeml_read_with_changes]]
- [[abaphandler_meth_modify]]
- [[abenbdl_draft_action]]
- [[abapderived_types_control]]
- [[abaptype_table_for]]
