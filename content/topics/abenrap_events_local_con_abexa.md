---
title: 예제 - RAP business event 를 같은 시스템에서 받아 처리하기 (DB 테이블 변경)
summary: managed RAP BO 가 저장할 때 올린 business event 를 같은 시스템의 event handler class 가 받아 기록 테이블에 남기는 예제입니다.
keywords: RAP business event, local consumption, 비즈니스 이벤트, 로컬 소비, RAISE ENTITY EVENT, save_modified, event handler class, 이벤트 핸들러 클래스, FOR ENTITY EVENT, with additional save, 비동기, WAIT UP TO
---

## 설명

이 예제는 RAP business event 를 **같은 시스템 안에서** 받아 처리하는 흐름을 보여 줍니다. 등장하는 것은 세 가지입니다.

- **managed RAP BO** : root entity(루트 엔터티) 하나짜리입니다. behavior definition(동작 정의)에 `managed with additional save with full data` 를 적고, event `created`, `updated`, `deleted` 를 선언합니다. `updated` 와 `deleted` 에는 `parameter` 로 abstract entity(엔터티)를 붙여 값을 함께 실어 보냅니다.
- **behavior pool(동작 풀)** : saver method(세이버 메서드) `save_modified` 안에서 [[abapraise_entity_event|RAISE ENTITY EVENT]] 문으로 event 를 올립니다.
- **RAP event handler class(핸들러 클래스)** : event 를 받는 쪽입니다. handler method(핸들러 메서드)는 전역 클래스의 로컬 구현부(CCIMP include)에 있습니다. event 가 정말 일어났는지 보이려고 기록용 DB 테이블에 줄을 써넣습니다.

실행 클래스는 EML 로 생성, 수정, 삭제를 한 번씩 하고 그때마다 `COMMIT ENTITIES` 로 저장합니다. 작업마다 event 가 하나씩 올라갑니다.

## 예제

behavior definition 입니다. event 세 개를 선언합니다.

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

  event created;
  event updated parameter ZA_TravelInfo;   // abstract entity 를 매개변수로 붙인다
  event deleted parameter ZA_TravelInfo;
}
```

saver class(세이버 클래스)는 `save_modified` 에서 event 를 올립니다. event handler class 는 그 event 를 받아 기록 테이블에 남깁니다.

```abap
" behavior pool: 저장할 때 event 를 올린다
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    IF create-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~created
        FROM VALUE #( FOR ls_new IN create-travel ( %key = ls_new-%key ) ).
    ENDIF.
    IF update-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~updated
        FROM VALUE #( FOR ls_upd IN update-travel
                      ( %key          = ls_upd-%key
                        %param-Status = ls_upd-Status ) ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.

" event handler class(전역 클래스 zcl_travel_evt 의 CCIMP include)
" 전역 클래스 선언: CLASS zcl_travel_evt DEFINITION PUBLIC ABSTRACT FINAL
"                   FOR EVENTS OF zr_travel.
CLASS lhe_travel DEFINITION INHERITING FROM cl_abap_behavior_event_handler.
  PRIVATE SECTION.
    METHODS on_created FOR ENTITY EVENT created FOR travel~created.
ENDCLASS.

CLASS lhe_travel IMPLEMENTATION.
  METHOD on_created.
    " 핸들러는 interaction phase 에서 시작한다. DB 를 바꾸기 전에 저장 단계로 넘어간다
    cl_abap_tx=>save( ).

    " event 가 왔다는 사실을 기록 테이블에 남긴다
    MODIFY ztravel_evt_log FROM TABLE @( VALUE #(
      FOR ls_evt IN created ( travel_id = ls_evt-TravelID
                              details   = 'created' ) ) ).
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer(사용자) 쪽 코드입니다. 저장한 뒤 조금 기다렸다가 두 테이블을 읽습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( TravelID AgencyID Status )
  WITH VALUE #( ( %cid = 'cid1' TravelID = '00000001' AgencyID = '070001' Status = 'N' ) )
  FAILED DATA(ls_failed).

COMMIT ENTITIES.   " 여기서 save_modified 가 돌고 event 가 올라간다

" 핸들러는 비동기로 불리므로, 기록이 쓰일 때까지 잠깐 기다린다
WAIT UP TO 2 SECONDS.

SELECT * FROM ztravel         INTO TABLE @DATA(lt_travel).
SELECT * FROM ztravel_evt_log INTO TABLE @DATA(lt_log).
```

## 알아두기

- event handler method 는 **비동기**로 불립니다. `COMMIT ENTITIES` 가 끝난 바로 뒤에는 기록이 아직 없을 수 있습니다. 그래서 예제는 `WAIT UP TO 2 SECONDS` 로 기다린 다음에 기록 테이블을 읽습니다. 그래도 기록이 비어 있으면 예제를 다시 실행해 보라는 안내가 나옵니다.
- event handler method 는 자기만의 RAP 트랜잭션에서 돌고, 불릴 때는 interaction phase(상호작용 단계)입니다. ABAP SQL 로 DB 를 바꾸는 일은 save sequence(저장 순서)에서만 할 수 있으므로, 그 앞에서 `cl_abap_tx=>save( )` 를 불러 저장 단계로 넘어갑니다. 넘어가지 않고 DB 를 바꾸면 런타임 오류가 납니다.
- 출력은 두 가지입니다. 하나는 RAP 작업(생성·수정·삭제)이 반영된 persistent table 내용이고, 다른 하나는 event handler method 가 써넣은 기록 테이블 내용입니다.
- event 는 save sequence 의 [[abaprap_saver_meth_save_modified|save_modified]] saver method 에서 올립니다.
- SAP 원문 예제는 설명과 문법 보기를 위한 것입니다. 그대로 운영 시스템에 쓰는 용도가 아닙니다.

## 관련 항목

- [[abenrap_events]]
- [[abapraise_entity_event]]
- [[abaprap_saver_meth_save_modified]]
- [[abenclass_for_events]]
- [[abenmethod_for_entity_event]]
- [[abencl_abap_behavior_event_handler]]
- [[abenbdl_event]]
