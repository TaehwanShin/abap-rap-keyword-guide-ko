---
title: 예제 - unmanaged save 를 쓰는 managed BO 의 save_modified
summary: with unmanaged save 를 적은 managed BO 에서 save_modified 로 생성·수정·삭제를 직접 데이터베이스에 반영하는 예제입니다.
keywords: save_modified 예제, with unmanaged save, 비관리형 저장, TYPE REQUEST FOR CHANGE, TYPE REQUEST FOR DELETE, %control, mk-off, 관리형, managed, 직접 저장
---

## 설명

managed BO 의 BDEF 에 [[abenbdl_saving|with unmanaged save]] 를 적으면, interaction phase(상호작용 단계)의 버퍼 관리는 managed RAP BO provider(제공자)가 하지만 데이터베이스에 쓰는 일은 하지 않습니다. 만들고 고치고 지운 인스턴스를 저장하는 코드는 behavior pool(동작 풀)의 `save_modified` 에 직접 써야 합니다. 이 예제는 그 구현을 보여 주고, BDEF derived type(BDEF 파생 타입) `TYPE REQUEST FOR CHANGE` 와 `TYPE REQUEST FOR DELETE` 를 어떻게 쓰는지도 함께 보여 줍니다.

`save_modified` 안에서는 `create`, `update`, `delete` 를 따로 선언하지 않고 바로 쓸 수 있습니다. `create` 와 `update` 는 `TYPE REQUEST FOR CHANGE`, `delete` 는 `TYPE REQUEST FOR DELETE` 타입입니다. 원문 예제는 설명을 위해 같은 타입의 변수를 일부러 한 번 더 선언해 보여 줍니다. 이런 타입은 [[abenbdl_saving|additional save]] 나 unmanaged save 를 쓰는 managed BO 에서만 의미가 있습니다.

처리 순서는 이렇습니다.

1. `IF` 문으로 만든 인스턴스, 고친 인스턴스, 지운 인스턴스가 있는지 차례로 확인합니다. 어떤 필드에 값이 들어왔는지는 `%control` 로 알아냅니다.
2. 만든 인스턴스는 임시 내부 테이블에 옮겨 담습니다. `%control` 에서 꺼져 있지 않은 필드의 값만 옮깁니다. 다 모이면 데이터베이스 테이블에 씁니다.
3. 고친 인스턴스도 비슷하게 처리합니다. 다만 먼저 `SELECT` 로 지금 데이터베이스에 있는 값을 읽어 둡니다. 값이 넘어오지 않았거나 `%control` 에서 꺼진 필드는 읽어 둔 값을 그대로 두어, 빈 값으로 덮어쓰지 않게 합니다.
4. 지운 인스턴스는 `DELETE` 문으로 데이터베이스 테이블에서 지웁니다.

## 예제

여행 모델로 줄여 쓴 것입니다. 저장을 직접 하므로 BDEF 에 `persistent table` 이 없습니다.

```bdl
managed with unmanaged save
implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
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
    DATA lt_db TYPE STANDARD TABLE OF ztravel WITH EMPTY KEY.

    " 만든 인스턴스를 테이블에 넣는다
    IF create-travel IS NOT INITIAL.
      lt_db = VALUE #( FOR ls_c IN create-travel
                       ( travel_id = ls_c-travelid
                         agency_id = ls_c-agencyid
                         status    = ls_c-status ) ).
      INSERT ztravel FROM TABLE @lt_db.
    ENDIF.

    " 고친 인스턴스: 지금 값을 먼저 읽고, %control 이 켜진 필드만 바꾼다
    IF update-travel IS NOT INITIAL.
      SELECT * FROM ztravel
        FOR ALL ENTRIES IN @update-travel
        WHERE travel_id = @update-travel-travelid
        INTO TABLE @lt_db.

      LOOP AT lt_db ASSIGNING FIELD-SYMBOL(<ls_db>).
        DATA(ls_u) = update-travel[ travelid = <ls_db>-travel_id ].
        IF ls_u-%control-agencyid = if_abap_behv=>mk-on.
          <ls_db>-agency_id = ls_u-agencyid.
        ENDIF.
        IF ls_u-%control-status = if_abap_behv=>mk-on.
          <ls_db>-status = ls_u-status.
        ENDIF.
      ENDLOOP.
      UPDATE ztravel FROM TABLE @lt_db.
    ENDIF.

    " 지운 인스턴스를 테이블에서 지운다
    IF delete-travel IS NOT INITIAL.
      lt_db = VALUE #( FOR ls_d IN delete-travel ( travel_id = ls_d-travelid ) ).
      DELETE ztravel FROM TABLE @lt_db.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

BO 를 쓰는 쪽에서 `%control` 의 일부 필드를 꺼서 수정을 요청하면, 꺼진 필드는 값이 함께 넘어와도 바뀌지 않습니다.

```abap
MODIFY ENTITY zr_travel
  UPDATE FROM VALUE #( ( travelid          = '00000001'
                         agencyid          = '070002'
                         %control-agencyid = if_abap_behv=>mk-on
                         status            = 'X'
                         %control-status   = if_abap_behv=>mk-off ) )   " 꺼 둠: 반영되지 않는다
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

원문 예제를 실행하면 다음 세 가지가 차례로 일어납니다.

- 인스턴스 두 개를 만들고 `COMMIT ENTITIES` 로 save sequence(저장 순서)를 시작합니다. BDEF 에 `with unmanaged save` 가 있으므로 `save_modified` 가 불려 인스턴스를 데이터베이스 테이블에 씁니다.
- 방금 만든 두 인스턴스를 고치고 다시 커밋합니다. 이때 몇몇 필드는 `%control` 에서 `if_abap_behv=>mk-off` 로 꺼 둡니다. 그 필드의 원래 값은 바뀌지 않습니다.
- 둘 가운데 하나를 지우고 한 번 더 커밋합니다. 이 커밋으로 인스턴스가 테이블에서 지워집니다.

작업이 끝날 때마다 데이터베이스 테이블 내용이 화면에 나옵니다.

## 관련 항목

- [[abenrap_saver_methods_abexas]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abaptype_request_for]]
- [[abapderived_types_control]]
- [[abensave_modified_add_save_abexa]]
- [[abenrap_managed_unm_save_abexa]]
