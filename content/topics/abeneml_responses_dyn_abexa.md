---
title: 예제 - 동적 형식 EML 문의 응답
summary: MODIFY ENTITIES OPERATIONS 와 READ ENTITIES OPERATIONS 에서 FAILED, REPORTED, MAPPED 응답을 abp_behv_response_tab 타입으로 받는 예제입니다.
keywords: MODIFY ENTITIES OPERATIONS, READ ENTITIES OPERATIONS, ABP_BEHV_RESPONSE_TAB, ABP_BEHV_CHANGES_TAB, ABP_BEHV_RETRIEVALS_TAB, FAILED, REPORTED, MAPPED, 동적 형식, 응답 매개변수, 예제
---

## 설명

entity(엔터티) 이름과 작업을 실행 시점에 정하는 **동적 형식** EML 문에서 응답을 어떻게 받는지 보여 주는 예제입니다. 원문은 root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나로 된 단순한 managed RAP BO 를 씁니다. behavior pool(동작 풀)은 따로 만들지 않았습니다.

예제는 두 부분으로 나뉩니다.

- **동적 변경** : `MODIFY ENTITIES OPERATIONS` 로 루트와 자식에 생성, 수정, 삭제, association 을 따라가는 생성을 한꺼번에 실행합니다. 작업 목록은 `ABP_BEHV_CHANGES_TAB` 타입 내부 테이블에 담습니다.
- **동적 읽기** : `READ ENTITIES OPERATIONS` 로 루트 읽기, association 을 따라가는 읽기, 자식 읽기를 한꺼번에 실행합니다. 작업 목록은 `ABP_BEHV_RETRIEVALS_TAB` 타입 내부 테이블에 담습니다.

두 부분 모두 일부러 오류가 나는 값을 넣습니다. 없는 인스턴스를 고치거나 지우거나 읽게 해서 응답이 채워지는 모습을 보려는 것입니다.

눈여겨볼 점은 응답의 타입입니다. 동적 형식에서는 `FAILED`, `REPORTED`, `MAPPED` 가 모두 `ABP_BEHV_RESPONSE_TAB` 타입 내부 테이블입니다. entity 별 구성요소가 있는 구조가 아닙니다.

## 예제

같은 흐름을 여행(Travel)과 예약(Booking)으로 줄여 쓴 코드입니다. 먼저 동적 변경입니다.

```abap
" 변경할 인스턴스를 작업별로 BDEF derived type 테이블에 담는다
DATA: lt_create TYPE TABLE FOR CREATE zr_travel,
      lt_cba    TYPE TABLE FOR CREATE zr_travel\_booking,
      lt_delete TYPE TABLE FOR DELETE zr_travel.

lt_create = VALUE #( ( %cid     = 'cid1'
                       travelid = '00000001'
                       agencyid = '070001'
                       %control = VALUE #( travelid = if_abap_behv=>mk-on
                                           agencyid = if_abap_behv=>mk-on ) ) ).

lt_cba = VALUE #( ( %cid_ref = 'cid1'
                    %target  = VALUE #( ( %cid      = 'cid_b1'
                                          bookingid = '0001'
                                          %control-bookingid = if_abap_behv=>mk-on ) ) ) ).

" 일부러 없는 여행을 지워 실패 응답을 만든다
lt_delete = VALUE #( ( travelid = '99999999' ) ).

" 작업 목록: 작업 종류, entity 이름(대문자), 인스턴스 테이블을 가리키는 참조
DATA(lt_op) = VALUE abp_behv_changes_tab(
  ( op          = if_abap_behv=>op-m-create
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_create ) )
  ( op          = if_abap_behv=>op-m-create_ba
    entity_name = 'ZR_TRAVEL'
    sub_name    = '_BOOKING'
    instances   = REF #( lt_cba ) )
  ( op          = if_abap_behv=>op-m-delete
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_delete ) ) ).

" 세 응답 모두 abp_behv_response_tab 타입이다
MODIFY ENTITIES OPERATIONS lt_op
  FAILED   DATA(lt_failed)
  REPORTED DATA(lt_reported)
  MAPPED   DATA(lt_mapped).

COMMIT ENTITIES.
IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.
```

이어서 동적 읽기입니다. 읽기는 결과를 담을 테이블의 참조도 함께 넘깁니다.

```abap
DATA: lt_read        TYPE TABLE FOR READ IMPORT zr_travel,
      lt_read_result TYPE TABLE FOR READ RESULT zr_travel,
      lt_rba         TYPE TABLE FOR READ IMPORT zr_travel\_booking,
      lt_rba_result  TYPE TABLE FOR READ RESULT zr_travel\_booking.

" 두 번째 키는 없는 여행이다
lt_read = VALUE #( ( travelid = '00000001' %control-agencyid = if_abap_behv=>mk-on )
                   ( travelid = '99999999' %control-agencyid = if_abap_behv=>mk-on ) ).

lt_rba = VALUE #( ( travelid = '00000001' %control-bookingid = if_abap_behv=>mk-on ) ).

DATA(lt_op_read) = VALUE abp_behv_retrievals_tab(
  ( op          = if_abap_behv=>op-r-read
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_read )
    results     = REF #( lt_read_result ) )
  ( op          = if_abap_behv=>op-r-read_ba
    entity_name = 'ZR_TRAVEL'
    sub_name    = '_BOOKING'
    instances   = REF #( lt_rba )
    results     = REF #( lt_rba_result ) ) ).

READ ENTITIES OPERATIONS lt_op_read
  FAILED   DATA(lt_failed_read)
  REPORTED DATA(lt_reported_read).
```

### 실행하면

- 변경 부분에서는 없는 인스턴스를 건드린 작업 때문에 `FAILED` 와 `REPORTED` 에 항목이 생깁니다. `MAPPED` 에는 새로 만든 인스턴스 정보가 들어옵니다. 그다음 `COMMIT ENTITIES` 가 저장을 시작하고, 원문 예제는 저장 뒤 데이터베이스 테이블 내용을 화면에 보여 줍니다.
- 읽기 부분에서는 없는 키 때문에 `FAILED` 에 항목이 생깁니다. 이 예제에서는 RAP BO provider(제공자)가 `REPORTED` 를 채우지 않습니다. 읽은 결과는 `results` 로 넘긴 테이블에 들어 있습니다.

## 알아두기

- 동적 형식의 response parameter(응답 매개변수)는 `ABP_BEHV_RESPONSE_TAB` 타입이어야 합니다. 여기서는 인라인 선언으로 받았으므로 타입이 자동으로 맞춰집니다.
- 작업 목록에 넣는 인스턴스 테이블과 결과 테이블은 작업에 맞는 BDEF derived type(BDEF 파생 타입)으로 선언합니다.
- 원문 예제는 변경과 읽기의 실패 내용을 같은 모양의 출력 표로 보여 줍니다. 그래서 읽기 결과를 볼 때는 생성·수정·삭제 칸을 무시해야 합니다.

## 관련 항목

- [[abapeml_response]]
- [[abapeml_responses_dyn]]
- [[abeneml_responses_abexa]]
- [[abapmodify_entities_operations_dyn]]
- [[abapread_entities_operations]]
- [[abapcommit_entities]]
