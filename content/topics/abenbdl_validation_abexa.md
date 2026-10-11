---
title: 예제 - validation
summary: managed RAP BO 에서 필드 값이 바뀔 때 도는 validation 을 정의하고 구현한 뒤, EML 로 올바른 인스턴스와 틀린 인스턴스를 만들어 결과를 비교하는 예제입니다.
keywords: validation, 검증, 예제, on save, field, FOR VALIDATE, COMMIT ENTITIES RESPONSE OF, failed, reported, RAP 트랜잭션, 트랜잭션 버퍼
---

## 설명

validation 을 managed RAP BO 에서 정의하고, 구현하고, 사용하는 과정을 처음부터 끝까지 보여 주는 예제입니다.

원문의 데이터 모델은 판매 주문을 나타내는 루트 뷰 entity(엔터티) 하나입니다. validation 은 주문에 적힌 구매자 번호가 거래처 테이블에 있는지 확인합니다. 구매자 번호 필드가 바뀌면 실행되고, 번호가 틀리면 변경을 거절하고 오류 메시지를 돌려줍니다.

여기서는 여행으로 바꿔 적습니다. validation `validateAgency` 는 여행의 `AgencyID` 가 여행사 테이블 `zagency` 에 있는지 확인합니다.

## 예제

### behavior definition

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  field ( readonly : update ) TravelID;

  // AgencyID 가 바뀌면 저장할 때 실행된다
  validation validateAgency on save { field AgencyID; }
}
```

### behavior pool

```abap
METHOD validateagency.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( agencyid ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 확인할 여행사 번호를 모은다
  DATA lt_agency TYPE SORTED TABLE OF zagency WITH UNIQUE KEY agency_id.
  lt_agency = CORRESPONDING #( lt_travel DISCARDING DUPLICATES
                               MAPPING agency_id = agencyid EXCEPT * ).
  DELETE lt_agency WHERE agency_id IS INITIAL.

  " 그 가운데 여행사 테이블에 실제로 있는 번호를 읽는다
  IF lt_agency IS NOT INITIAL.
    SELECT FROM zagency FIELDS agency_id
      FOR ALL ENTRIES IN @lt_agency
      WHERE agency_id = @lt_agency-agency_id
      INTO TABLE @DATA(lt_agency_db).
  ENDIF.

  LOOP AT lt_travel INTO DATA(ls_travel).
    IF ls_travel-agencyid IS NOT INITIAL
       AND NOT line_exists( lt_agency_db[ agency_id = ls_travel-agencyid ] ).
      APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
      APPEND VALUE #( %tky              = ls_travel-%tky
                      %msg              = new_message_with_text(
                                            severity = if_abap_behv_message=>severity-error
                                            text     = '없는 여행사 번호입니다.' )
                      %element-agencyid = if_abap_behv=>mk-on )
             TO reported-travel.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

### 사용하는 쪽

여행사 테이블에는 `070001` 만 있다고 합시다.

```abap
" 1) 올바른 여행 하나를 만들고 저장한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid ) WITH VALUE #(
      ( %cid = '1' travelid = '00000001' agencyid = '070001' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
COMMIT ENTITIES.

" 2) 틀린 여행 둘을 다른 트랜잭션에서 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid ) WITH VALUE #(
      ( %cid = '2' travelid = '00000002' agencyid = '999998' )
      ( %cid = '3' travelid = '00000003' agencyid = '999999' ) )
  MAPPED FINAL(ls_mapped1)
  FAILED FINAL(ls_failed1)
  REPORTED FINAL(ls_reported1).

COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED FINAL(ls_failed_commit)
  REPORTED FINAL(ls_reported_commit).
IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다: validation 이 거절했다
ENDIF.

" 저장된 여행을 확인한다
SELECT travel_id, agency_id FROM ztravel INTO TABLE @FINAL(lt_saved).
```

## 알아두기

실행하면 다음과 같이 됩니다.

- 여행 `00000001` 은 여행사 번호가 맞으므로 데이터베이스에 저장됩니다.
- 여행 `00000002` 와 `00000003` 은 여행사 번호가 틀렸습니다. validation 이 거절하고, 원문 프로그램은 이 둘을 오류 표에 따로 모아 보여 줍니다.
- 마지막 `SELECT` 결과에는 올바른 여행 한 건만 있습니다.

눈여겨볼 점은 올바른 여행과 틀린 여행을 **서로 다른 RAP 트랜잭션**에서 만들었다는 것입니다. 셋을 한 RAP 트랜잭션에서, 곧 같은 `COMMIT ENTITIES` 로 저장하려 했다면 셋 다 거절됩니다. 한 RAP 트랜잭션 안의 변경은 모두 앞뒤가 맞아야 하고, 그렇지 않으면 transactional buffer(트랜잭션 버퍼)의 내용이 통째로 거절됩니다.

## 관련 항목

- [[abenbdl_validations]]
- [[abaphandler_meth_validate]]
- [[abapcommit_entities]]
- [[abapeml_response]]
