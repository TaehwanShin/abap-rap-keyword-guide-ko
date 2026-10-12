---
title: TYPE REQUEST FOR 예제 - additional save 를 쓰는 managed RAP BO
summary: with additional save 를 건 managed RAP BO 에서 save_modified 의 create, update, delete 를 읽어 바뀐 내용을 기록 테이블에 따로 남기는 예제입니다.
keywords: with additional save, 추가 저장, with full data, save_modified, TYPE REQUEST FOR CHANGE, TYPE REQUEST FOR DELETE, TYPE TABLE FOR CHANGE, TYPE STRUCTURE FOR CHANGE, %control, 변경 기록, 로그 테이블, 예제
---

## 설명

이 예제는 BDEF 에 `with additional save` 를 건 managed RAP BO 에서 BDEF derived type(BDEF 파생 타입) `TYPE REQUEST FOR CHANGE` 와 `TYPE REQUEST FOR DELETE` 를 어떻게 쓰는지 보여 줍니다.

additional save 에서는 인스턴스 저장은 managed RAP BO provider(제공자)가 그대로 하고, 그와 별도로 saver method(세이버 메서드) `save_modified` 가 불립니다. 원문 예제는 이 메서드에서 루트 인스턴스의 변경 내용을 **기록 테이블**에 따로 남깁니다. 기록 테이블의 필드는 다음과 같습니다.

| 필드 | 내용 |
| --- | --- |
| `change_id` | 변경 한 건의 식별자입니다. UUID 를 씁니다. |
| `key_field` | RAP BO 인스턴스의 키입니다. |
| `changing_operation` | 실행한 standard operation(표준 작업)입니다. `CREATE`, `UPDATE`, `DELETE` 가운데 하나입니다. |
| `changed_field_name` | 만들었거나 바꾼 필드의 이름입니다. |
| `changed_value` | 그 필드에 들어간 값입니다. |
| `created_at` | 생성·수정·삭제가 일어난 날짜와 시각입니다. |

`save_modified` 의 처리 순서는 이렇습니다.

1. `create`, `update`, `delete` 가 비어 있는지 `IF` 로 각각 확인합니다.
2. 생성된 인스턴스를 하나씩 돌면서 `%control` 을 봅니다. 어떤 필드가 on 이면 UUID 를 새로 만들고, 필드 이름과 RAP BO consumer(사용자)가 넘긴 값을 기록 줄에 담습니다. 원문은 필드 두 개를 이렇게 처리합니다.
3. 수정된 인스턴스도 같은 방식으로 처리합니다. 원문은 생성 때와 다른 필드 두 개를 봅니다.
4. 삭제된 인스턴스는 필드 이름과 값을 남기지 않습니다. 삭제에서는 뜻이 없기 때문입니다.
5. 모은 줄을 기록 테이블에 넣습니다.

## 예제

공통 예제 모델로 줄여 쓴 것입니다. 기록 테이블은 `ztravel_log` 로 두었습니다.

```bdl
managed with additional save with full data
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
METHOD save_modified.
  DATA lt_log TYPE STANDARD TABLE OF ztravel_log WITH EMPTY KEY.
  GET TIME STAMP FIELD DATA(lv_now).

  TRY.
      " 생성: 값이 들어온 필드만 기록한다
      LOOP AT create-travel INTO DATA(ls_created).
        IF ls_created-%control-agencyid = if_abap_behv=>mk-on.
          APPEND VALUE #( change_id          = cl_system_uuid=>create_uuid_x16_static( )
                          travel_id          = ls_created-travelid
                          changing_operation = 'CREATE'
                          changed_field_name = 'AGENCYID'
                          changed_value      = ls_created-agencyid
                          created_at         = lv_now ) TO lt_log.
        ENDIF.
      ENDLOOP.

      " 수정: 바뀐 필드만 기록한다
      LOOP AT update-travel INTO DATA(ls_updated).
        IF ls_updated-%control-status = if_abap_behv=>mk-on.
          APPEND VALUE #( change_id          = cl_system_uuid=>create_uuid_x16_static( )
                          travel_id          = ls_updated-travelid
                          changing_operation = 'UPDATE'
                          changed_field_name = 'STATUS'
                          changed_value      = ls_updated-status
                          created_at         = lv_now ) TO lt_log.
        ENDIF.
      ENDLOOP.

      " 삭제: 키만 넘어온다. 필드 이름과 값은 비워 둔다
      LOOP AT delete-travel INTO DATA(ls_deleted).
        APPEND VALUE #( change_id          = cl_system_uuid=>create_uuid_x16_static( )
                        travel_id          = ls_deleted-travelid
                        changing_operation = 'DELETE'
                        created_at         = lv_now ) TO lt_log.
      ENDLOOP.

    CATCH cx_uuid_error.
      " UUID 를 만들지 못했다
  ENDTRY.

  INSERT ztravel_log FROM TABLE @lt_log.
ENDMETHOD.
```

### 실행하면

원문 예제는 EML 로 세 가지 작업을 차례로 실행하고 그때마다 `COMMIT ENTITIES` 로 저장합니다.

1. 인스턴스 두 개를 만듭니다.
2. 그 두 개를 수정합니다.
3. 그 가운데 하나를 삭제합니다.

`COMMIT ENTITIES` 가 save sequence(저장 순서)를 일으킬 때마다 `save_modified` 가 불립니다. 작업마다 화면에 표 두 개가 나옵니다. 하나는 persistent table 의 내용이고, 다른 하나는 `save_modified` 가 채운 기록 테이블의 내용입니다.

## 알아두기

- `create`, `update`, `delete` 는 `save_modified` 안에서 선언 없이 바로 쓸 수 있습니다. 원문 예제는 타입을 보여 주려고 `TYPE REQUEST FOR CHANGE`, `TYPE REQUEST FOR DELETE`, `TYPE TABLE FOR CHANGE`, `TYPE STRUCTURE FOR CHANGE` 로 변수를 일부러 따로 선언합니다.
- 이 네 타입은 additional save 나 unmanaged save 를 쓰는 managed RAP BO 에서만 뜻이 있습니다.
- 원문 예제는 `MODIFY ENTITY ... CREATE FROM` 과 `UPDATE FROM` 을 쓰면서 `%control` 의 필드를 하나하나 on 으로 둡니다. `save_modified` 가 보는 `%control` 값이 여기서 옵니다.
- 원문 끝의 설명 글에는 BDEF 에 `with unmanaged save` 가 있다고 적혀 있습니다. 하지만 원문의 BDEF 코드와 첫머리 설명은 `with additional save` 입니다. 이 항목은 BDEF 코드를 따랐습니다.
- 인스턴스 저장까지 직접 맡는 방식은 [[abenrap_managed_unm_save_abexa]] 에서 다룹니다.

## 관련 항목

- [[abaptype_request_for]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abapderived_types_control]]
