---
title: 예제 - RAP 트랜잭션 단계 확인하기
summary: 핸들러·saver method 마다 GET_CURRENT_PHASE 와 GET_CURRENT_HANDLER_KIND 값을 기록해, 저장이 성공할 때와 실패할 때 어느 단계까지 가는지 보는 예제입니다.
keywords: CL_ABAP_BEHV_AUX, GET_CURRENT_PHASE, GET_CURRENT_HANDLER_KIND, RAP transactional phase, 트랜잭션 단계, 상호작용 단계, 이른 저장 단계, 늦은 저장 단계, 정리 단계, finalize, check_before_save, late numbering, 예제
---

## 설명

[[abaprap_cl_abap_behv_aux|CL_ABAP_BEHV_AUX]] 의 `GET_CURRENT_PHASE` 와 `GET_CURRENT_HANDLER_KIND` 를 써 보는 예제입니다. root entity(루트 엔터티) 하나짜리 **unmanaged** RAP BO 를 쓰고, behavior definition(동작 정의)에 `late numbering` 과 `authorization master ( global )` 이 있습니다.

behavior pool(동작 풀)의 handler method(핸들러 메서드)와 saver method(세이버 메서드)는 불릴 때마다 기록 테이블에 한 줄을 남깁니다. 한 줄에는 지금의 RAP 트랜잭션 단계와 메서드 종류, 그리고 메서드 설명이 들어갑니다. 실행 클래스는 EML 로 생성 요청을 네 번 보내고, 요청마다 기록 테이블과 DB 테이블 내용을 출력합니다.

| 차례 | 요청 | 결과 |
| --- | --- | --- |
| 1 | 생성 | [[abensaver_finalize|finalize]] saver method 에서 일부러 실패 |
| 2 | 생성 | 성공 |
| 3 | 생성 | [[abensaver_check_before_save|check_before_save]] saver method 에서 일부러 실패 |
| 4 | 생성 | 성공 |

맨 처음에는 EML 을 쓰기 전에 `get_current_phase` 를 한 번 부릅니다. 핸들러나 saver method 밖, 곧 RAP 트랜잭션 단계 밖에서 무엇이 나오는지 보려는 것입니다.

## 예제

behavior pool 쪽 기록 코드입니다. `gt_phases` 는 behavior pool 전역 클래스에 선언한 정적 내부 테이블입니다.

```abap
" 전역 클래스 zbp_r_travel 의 PUBLIC SECTION 에 선언
"   CLASS-DATA gt_phases TYPE string_table.

CLASS lsc_travel IMPLEMENTATION.
  METHOD finalize.
    " 지금 단계와 메서드 종류를 남긴다
    DATA(lv_phase) = cl_abap_behv_aux=>get_current_phase( ).
    " 원문에는 이 메서드의 호출 꼴이 나오지 않는다. 매개변수는 클래스 정의에서 확인할 것
    DATA(lv_kind)  = cl_abap_behv_aux=>get_current_handler_kind( ).
    APPEND |finalize: phase={ lv_phase } kind={ lv_kind }| TO zbp_r_travel=>gt_phases.

    " 조건에 맞지 않는 인스턴스가 있으면 failed 를 채워 저장을 멈춘다
  ENDMETHOD.

  METHOD save.
    APPEND |save: phase={ cl_abap_behv_aux=>get_current_phase( ) }| TO zbp_r_travel=>gt_phases.
    " 버퍼 내용을 DB 테이블에 쓴다
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer(사용자) 쪽 코드입니다. 수정 요청의 실패 응답과 save sequence(저장 순서)의 실패 응답을 따로 받습니다.

```abap
DATA: ls_failed_early TYPE RESPONSE FOR FAILED EARLY zr_travel,
      ls_failed_late  TYPE RESPONSE FOR FAILED LATE zr_travel.

" 단계 밖에서 한 번 불러 본다
APPEND |메서드 밖: phase={ cl_abap_behv_aux=>get_current_phase( ) }|
  TO zbp_r_travel=>gt_phases.

MODIFY ENTITY zr_travel
  CREATE FIELDS ( AgencyID CustomerID Status )
  WITH VALUE #( ( %cid = 'cid1' AgencyID = '070001' CustomerID = '000042' Status = 'N' ) )
  FAILED ls_failed_early.

COMMIT ENTITIES
  RESPONSE OF zr_travel FAILED ls_failed_late.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다. ls_failed_late 를 살핀다
ENDIF.

" 요청마다 기록을 출력하고 비운다
DATA(lt_log) = zbp_r_travel=>gt_phases.
CLEAR zbp_r_travel=>gt_phases.
```

## 알아두기

- 실패한 요청의 기록에는 interaction phase(상호작용 단계)와 early save phase(이른 저장 단계)만 나옵니다. **late save phase(늦은 저장 단계)까지 가지 못합니다.**
- 성공한 요청의 기록을 보면 RAP 트랜잭션이 정리 단계(cleanup)로 끝납니다.
- save sequence 의 결과는 `COMMIT ENTITIES` 뒤의 `sy-subrc` 와 `FAILED` 응답으로 확인합니다. 예제는 `0` 이 아니면 save sequence 에서 문제가 생겼다는 글을 출력합니다.

## 관련 항목

- [[abaprap_cl_abap_behv_aux]]
- [[abenrap_cl_abap_behv_aux_abexa]]
- [[abenrap_luw_abexa]]
- [[abensaver_finalize]]
- [[abensaver_check_before_save]]
- [[abenabp_saver_methods]]
- [[abapcommit_entities]]
- [[abenbdl_late_numbering]]
