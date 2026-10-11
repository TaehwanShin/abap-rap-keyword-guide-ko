---
title: save_modified saver method
summary: additional save 나 unmanaged save 를 쓰는 managed BO 에서, 만들고 고치고 지운 인스턴스를 넘겨받아 저장 처리를 직접 구현하는 saver method 입니다.
keywords: save_modified, 세이버 메서드, saver method, with additional save, with unmanaged save, 추가 저장, 비관리형 저장, create, update, delete, TYPE REQUEST FOR CHANGE, TYPE REQUEST FOR DELETE, reported
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS save_modified REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD save_modified.
      ...
      ENDMETHOD.
      ...
ENDCLASS.
```

## 설명

`save_modified` 는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드에 둡니다. 미리 정해져 있는 메서드이므로 `REDEFINITION` 으로 다시 정의합니다. `base_class` 는 saver class 가 상속하는 기본 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

이 메서드의 성격은 다음과 같습니다.

- 반드시 구현해야 합니다.
- managed BO 가운데 additional save(`with additional save`)이나 unmanaged save(`with unmanaged save`)을 쓰는 것에서만 쓸 수 있습니다. 이때는 [[abensaver_method_save|save]] 메서드를 쓸 수 없습니다. BDEF 쪽 조건은 [[abenbdl_saving]] 에 있습니다.
- late save phase(늦은 저장 단계)에 속합니다.
- 원문은 이 메서드가 transactional buffer(트랜잭션 버퍼)의 지금 상태를 데이터베이스에 저장하는 일을 맡는다고 적고 있습니다. 지금 RAP 트랜잭션에 들어 있는 모든 인스턴스가 대상이고, 다른 BO 와 이어진 관계로 딸려 온 인스턴스도 포함됩니다.
- 실제로 구현할 범위는 저장 방식에 따라 다릅니다. `with unmanaged save` 에서는 managed RAP BO provider(제공자)가 변경 내용을 저장하지 않으므로 인스턴스 저장을 여기에 직접 구현합니다. `with additional save` 에서는 managed RAP BO provider 가 인스턴스를 저장하고, 여기에는 거기에 보탤 저장 작업(예: 변경 기록)만 구현합니다.
- 앞선 saver method 가 하나도 실패하지 않고 모두 끝났을 때만 불립니다.

미리 정해진 `IMPORTING` 매개변수가 세 개 있습니다. 각각 entity(엔터티) 이름으로 된 내부 테이블을 품고 있어서 `create-travel` 처럼 읽습니다.

| 매개변수 | 담긴 내용 | 타입 |
| --- | --- | --- |
| `create` | 지금 트랜잭션에서 새로 만든 인스턴스 | [[abaptype_request_for|TYPE REQUEST FOR CHANGE]] |
| `update` | 지금 트랜잭션에서 고친 인스턴스 | [[abaptype_request_for|TYPE REQUEST FOR CHANGE]] |
| `delete` | 지금 트랜잭션에서 지운 인스턴스 | [[abaptype_request_for|TYPE REQUEST FOR DELETE]] |

기본 클래스가 `CL_ABAP_BEHAVIOR_SAVER` 일 때는 `CHANGING` 매개변수 `reported` 도 있습니다. 타입은 [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]] 입니다.

## 예제

BDEF 머리말에 additional save 를 적습니다. 인스턴스는 managed RAP BO provider 가 `ztravel` 에 저장하고, `save_modified` 는 그 옆에서 변경 기록만 남깁니다.

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
  field ( readonly : update ) TravelID;
}
```

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    DATA lt_log TYPE STANDARD TABLE OF ztravel_log WITH EMPTY KEY.

    " 만든 것, 고친 것, 지운 것을 작업 이름과 함께 기록한다
    lt_log = VALUE #( FOR ls_c IN create-travel
                      ( travel_id = ls_c-travelid operation = 'CREATE' ) ).
    lt_log = VALUE #( BASE lt_log FOR ls_u IN update-travel
                      ( travel_id = ls_u-travelid operation = 'UPDATE' ) ).
    lt_log = VALUE #( BASE lt_log FOR ls_d IN delete-travel
                      ( travel_id = ls_d-travelid operation = 'DELETE' ) ).

    INSERT ztravel_log FROM TABLE @lt_log.
  ENDMETHOD.
ENDCLASS.
```

`ztravel_log` 는 이 예제를 위해 만든 기록 테이블이고, 키는 `travel_id` 와 `operation` 이라고 봅니다.

## 알아두기

- 데이터베이스에 쓴 뒤에는 transactional buffer 를 비우는 것이 좋습니다. 같은 ABAP 세션이 RAP 트랜잭션 여러 개에 쓰일 수 있어서, 버퍼에 남은 변경 내용이 데이터를 어긋나게 만들 수 있기 때문입니다. [[abensaver_method_cleanup|cleanup]] 메서드를 직접 구현할 수 있다면 거기서 비웁니다.
- 이 메서드 안에서 쓸 수 있는 문과 쓸 수 없는 문은 [[abapinvalid_stmts_in_rap_methods]] 에 정리되어 있습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abenbdl_saving]]
- [[abensaver_method_save]]
- [[abensaver_method_cleanup]]
- [[abaptype_request_for]]
- [[abaptype_response_for]]
- [[abensave_modified_add_save_abexa]]
- [[abensave_modified_unm_save_abexa]]
- [[abenrap_additional_save_abexa]]
- [[abenrap_managed_unm_save_abexa]]
