---
title: 예제 - additional save 를 쓰는 managed BO 의 save_modified
summary: with additional save 를 적은 managed BO 에서 save_modified 로 생성·수정·삭제 내용을 기록 테이블에 따로 남기는 예제입니다.
keywords: save_modified 예제, with additional save, 추가 저장, with full data, TYPE REQUEST FOR CHANGE, TYPE REQUEST FOR DELETE, %control, 변경 기록, 로그 테이블, 관리형, managed
---

## 설명

managed BO 의 BDEF 에 `with additional save` 를 적으면, 인스턴스 저장은 managed RAP BO provider(제공자)가 그대로 하고 그에 더해 `save_modified` 가 불립니다. 이 예제는 그 자리에서 루트 인스턴스의 변경 내용을 모두 기록 테이블에 남깁니다. BDEF derived type(BDEF 파생 타입) `TYPE REQUEST FOR CHANGE` 와 `TYPE REQUEST FOR DELETE` 를 어떻게 쓰는지도 함께 보여 줍니다.

원문 예제의 기록 테이블에는 다음 필드가 있습니다.

| 필드 | 내용 |
| --- | --- |
| `change_id` | 변경 하나하나를 가리키는 식별자. 예제에서는 UUID 를 씁니다. |
| `key_field` | 인스턴스의 키 |
| `changing_operation` | 실행한 standard operation(표준 작업) (`CREATE`, `UPDATE`, `DELETE`) |
| `changed_field_name` | 만들거나 바꾼 필드의 이름 |
| `changed_value` | 만들거나 바꾼 필드의 값 |
| `created_at` | 만들거나 고치거나 지운 날짜와 시각 |

`save_modified` 안에서는 `create`, `update`, `delete` 를 따로 선언하지 않고 바로 쓸 수 있습니다. `create` 와 `update` 는 `TYPE REQUEST FOR CHANGE`, `delete` 는 `TYPE REQUEST FOR DELETE` 타입이고, 각각 만들고 고치고 지울 인스턴스를 담고 있습니다. 원문 예제는 설명을 위해 같은 타입의 변수를 일부러 한 번 더 선언해 보여 줍니다. 이런 타입은 additional save 나 unmanaged save 를 쓰는 managed BO 에서만 의미가 있습니다.

처리 순서는 이렇습니다.

1. `IF` 문으로 만든 인스턴스, 고친 인스턴스, 지운 인스턴스가 있는지 차례로 확인합니다.
2. 만든 인스턴스를 하나씩 돌면서 작업 이름 `CREATE` 와 시각을 적습니다. `%control` 을 보고 값이 들어온 필드만 골라, 필드 이름과 값을 기록 줄로 만듭니다. 줄마다 UUID 를 새로 붙입니다.
3. 고친 인스턴스도 같은 방식으로 처리합니다. 살펴보는 필드만 다릅니다.
4. 지운 인스턴스는 필드 이름과 값을 적지 않습니다. 남길 값이 없기 때문입니다.
5. 모은 줄을 기록 테이블에 넣습니다.

## 예제

여행 모델로 줄여 쓴 것입니다. BDEF 머리말에 additional save 를 적습니다. `with full data` 를 붙이면 바뀐 필드뿐 아니라 인스턴스의 모든 필드 값이 `save_modified` 로 넘어옵니다.

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

`ztravel_log` 는 위 표와 같은 구성으로 만든 기록 테이블입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    DATA lt_log TYPE STANDARD TABLE OF ztravel_log WITH EMPTY KEY.
    GET TIME STAMP FIELD DATA(lv_now).

    " 만든 인스턴스: %control 에 표시된 필드만 기록한다
    LOOP AT create-travel INTO DATA(ls_create).
      IF ls_create-%control-agencyid = if_abap_behv=>mk-on.
        APPEND VALUE #( travel_id  = ls_create-travelid  operation   = 'CREATE'
                        field_name = 'AGENCYID'          field_value = ls_create-agencyid
                        created_at = lv_now ) TO lt_log.
      ENDIF.
      IF ls_create-%control-status = if_abap_behv=>mk-on.
        APPEND VALUE #( travel_id  = ls_create-travelid  operation   = 'CREATE'
                        field_name = 'STATUS'            field_value = ls_create-status
                        created_at = lv_now ) TO lt_log.
      ENDIF.
    ENDLOOP.

    " 고친 인스턴스
    LOOP AT update-travel INTO DATA(ls_update).
      IF ls_update-%control-status = if_abap_behv=>mk-on.
        APPEND VALUE #( travel_id  = ls_update-travelid  operation   = 'UPDATE'
                        field_name = 'STATUS'            field_value = ls_update-status
                        created_at = lv_now ) TO lt_log.
      ENDIF.
    ENDLOOP.

    " 지운 인스턴스: 필드 이름과 값은 남길 것이 없다
    LOOP AT delete-travel INTO DATA(ls_delete).
      APPEND VALUE #( travel_id  = ls_delete-travelid  operation = 'DELETE'
                      created_at = lv_now ) TO lt_log.
    ENDLOOP.

    " 줄마다 고유 번호를 붙여 기록 테이블에 넣는다
    LOOP AT lt_log ASSIGNING FIELD-SYMBOL(<ls_log>).
      TRY.
          <ls_log>-change_id = cl_system_uuid=>create_uuid_x16_static( ).
        CATCH cx_uuid_error.
          " 예제라서 따로 처리하지 않는다
      ENDTRY.
    ENDLOOP.

    INSERT ztravel_log FROM TABLE @lt_log.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

원문 예제를 실행하면 다음 세 가지가 차례로 일어납니다.

- 인스턴스 두 개를 만들고 `COMMIT ENTITIES` 로 save sequence(저장 순서)를 시작합니다. 이때 `save_modified` 가 불려 기록 테이블에 줄이 들어갑니다.
- 방금 만든 두 인스턴스를 고치고 다시 커밋합니다.
- 둘 가운데 하나를 지우고 한 번 더 커밋합니다.

작업이 끝날 때마다 화면에 표가 두 개씩 나옵니다. 하나는 BO 의 데이터베이스 테이블 내용이고, 다른 하나는 기록 테이블 내용입니다. 인스턴스 자체는 `save_modified` 가 아니라 managed RAP BO provider 가 저장했다는 점, 그리고 `%control` 덕분에 실제로 값이 들어온 필드만 기록에 남는다는 점을 눈여겨봅니다.

## 관련 항목

- [[abenrap_saver_methods_abexas]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abaptype_request_for]]
- [[abapderived_types_control]]
- [[abensave_modified_unm_save_abexa]]
- [[abenrap_additional_save_abexa]]
