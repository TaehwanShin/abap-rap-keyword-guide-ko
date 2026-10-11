---
title: TYPE REQUEST FOR 예제 - unmanaged save 를 쓰는 managed RAP BO
summary: with unmanaged save 를 건 managed RAP BO 에서 save_modified 가 create, update, delete 를 읽어 persistent table 에 직접 쓰고 지우는 예제입니다.
keywords: with unmanaged save, 비관리형 저장, save_modified, TYPE REQUEST FOR CHANGE, TYPE REQUEST FOR DELETE, TYPE TABLE FOR CHANGE, TYPE STRUCTURE FOR CHANGE, %control, if_abap_behv=>mk-off, 직접 저장, 예제
---

## 설명

이 예제는 BDEF 에 `with unmanaged save` 를 건 managed RAP BO 에서 BDEF derived type(BDEF 파생 타입) `TYPE REQUEST FOR CHANGE` 와 `TYPE REQUEST FOR DELETE` 를 어떻게 쓰는지 보여 줍니다.

unmanaged save 에서는 managed RAP BO 인데도 **데이터베이스에 쓰는 일을 직접 구현**합니다. 만들거나 고치거나 지운 인스턴스를 저장하는 코드를 behavior pool(동작 풀)의 saver method(세이버 메서드) `save_modified` 에 씁니다.

`save_modified` 의 처리 순서는 이렇습니다.

1. `create`, `update`, `delete` 가 비어 있는지 `IF` 로 각각 확인합니다.
2. **생성** — 생성된 인스턴스를 하나씩 돌면서 보조 내부 테이블에 옮깁니다. `%control` 에서 꺼져 있지 않은 필드의 값만 옮깁니다. 다 옮기면 ABAP SQL `MODIFY` 문으로 persistent table 에 씁니다.
3. **수정** — 생성과 비슷하지만 먼저 ABAP SQL `SELECT` 문으로 persistent table 의 기존 줄을 읽어 둡니다. 값이 넘어오지 않았거나 `%control` 에서 꺼져 있는 필드는 기존 값을 그대로 둡니다. 이렇게 해야 기존 값이 초기값으로 덮이지 않습니다.
4. **삭제** — ABAP SQL `DELETE` 문으로 persistent table 에서 줄을 지웁니다.

## 예제

공통 예제 모델로 줄여 쓴 것입니다. 원문 예제와 마찬가지로 behavior definition(동작 정의)에 `persistent table` 이 없습니다.

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
METHOD save_modified.
  DATA lt_travel TYPE STANDARD TABLE OF ztravel WITH EMPTY KEY.

  " 생성: %control 에서 켜진 필드만 옮겨 담는다
  IF create-travel IS NOT INITIAL.
    LOOP AT create-travel INTO DATA(ls_created).
      DATA(ls_new) = VALUE ztravel( travel_id = ls_created-travelid ).
      IF ls_created-%control-agencyid <> if_abap_behv=>mk-off.
        ls_new-agency_id = ls_created-agencyid.
      ENDIF.
      IF ls_created-%control-status <> if_abap_behv=>mk-off.
        ls_new-status = ls_created-status.
      ENDIF.
      APPEND ls_new TO lt_travel.
    ENDLOOP.
    MODIFY ztravel FROM TABLE @lt_travel.
  ENDIF.

  " 수정: 기존 줄을 먼저 읽고, 켜진 필드만 덮어쓴다
  IF update-travel IS NOT INITIAL.
    CLEAR lt_travel.
    LOOP AT update-travel INTO DATA(ls_updated).
      SELECT SINGLE * FROM ztravel
        WHERE travel_id = @ls_updated-travelid
        INTO @DATA(ls_old).
      IF ls_updated-%control-agencyid = if_abap_behv=>mk-on.
        ls_old-agency_id = ls_updated-agencyid.
      ENDIF.
      IF ls_updated-%control-status = if_abap_behv=>mk-on.
        ls_old-status = ls_updated-status.
      ENDIF.
      APPEND ls_old TO lt_travel.
    ENDLOOP.
    MODIFY ztravel FROM TABLE @lt_travel.
  ENDIF.

  " 삭제: 키만 넘어온다
  LOOP AT delete-travel INTO DATA(ls_deleted).
    DELETE FROM ztravel WHERE travel_id = @ls_deleted-travelid.
  ENDLOOP.
ENDMETHOD.
```

### 실행하면

원문 예제는 EML 로 세 가지 작업을 차례로 실행하고 그때마다 `COMMIT ENTITIES` 로 저장합니다. `COMMIT ENTITIES` 가 save sequence(저장 순서)를 일으키면 `save_modified` 가 불려 persistent table 에 반영합니다.

1. **생성** — 인스턴스 두 개를 만듭니다.
2. **수정** — 그 두 개를 수정합니다. 이때 몇몇 필드는 값을 넘기면서도 `%control` 에서 `if_abap_behv=>mk-off` 로 꺼 둡니다. 꺼 둔 필드는 기존 값이 바뀌지 않습니다.
3. **삭제** — 그 가운데 하나를 삭제합니다.

작업마다 persistent table 의 내용이 화면에 나옵니다.

## 알아두기

- `create`, `update`, `delete` 는 `save_modified` 안에서 선언 없이 바로 쓸 수 있습니다. 원문 예제는 타입을 보여 주려고 `TYPE REQUEST FOR CHANGE`, `TYPE REQUEST FOR DELETE`, `TYPE TABLE FOR CHANGE`, `TYPE STRUCTURE FOR CHANGE` 로 변수를 일부러 따로 선언합니다.
- 이 네 타입은 additional save 나 unmanaged save 를 쓰는 managed RAP BO 에서만 뜻이 있습니다.
- 수정할 때 기존 줄을 읽지 않고 넘어온 값만 쓰면, 넘어오지 않은 필드가 초기값으로 덮입니다.
- 저장은 그대로 맡기고 다른 일만 덧붙이는 방식은 [[abenrap_additional_save_abexa]] 에서 다룹니다.

## 관련 항목

- [[abaptype_request_for]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abapderived_types_control]]
