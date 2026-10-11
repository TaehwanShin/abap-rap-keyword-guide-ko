---
title: 예제 - CL_ABAP_BEHAVIOR_SAVER_FAILED
summary: unmanaged save 를 쓰는 managed RAP BO 로, interaction phase·early save phase·late save phase 에서 각각 실패했을 때 응답과 sy-subrc 가 어떻게 달라지는지 보여 주는 예제입니다.
keywords: CL_ABAP_BEHAVIOR_SAVER_FAILED, 세이버 클래스 예제, with unmanaged save, save_modified, 늦은 저장 단계, 이른 저장 단계, sy-subrc, COMMIT ENTITIES RESPONSE OF, ROLLBACK ENTITIES, failed late, reported late, CX_SADL_DUMP_APPL_MODEL_ERROR
---

## 설명

원문 예제는 기반 클래스 [[abenabp_cl_abap_beh_saver_failed|CL_ABAP_BEHAVIOR_SAVER_FAILED]] 를 쓰는 saver class(세이버 클래스)를 보여 줍니다. 대상은 [[abenbdl_saving|unmanaged save(with unmanaged save)]]을 쓰는 단순한 managed RAP BO 입니다.

- 데이터 모델은 root entity(루트 엔터티) 하나뿐입니다.
- behavior definition(동작 정의)에는 생성·수정·삭제와 저장 시점 validation 하나가 있습니다.
- behavior pool(동작 풀)에는 validation 구현이 들어 있습니다. 특정 필드에 특정 값이 들어 있으면 validation 이 실패합니다.
- saver class 는 `CL_ABAP_BEHAVIOR_SAVER_FAILED` 를 상속합니다. `save_modified` 는 생성 작업에서 특정 필드에 특정 값이 들어 있으면 그 인스턴스의 저장을 거절하도록 구현되어 있습니다.

이렇게 해 두고, 실패가 어느 단계에서 나느냐에 따라 RAP BO consumer(사용자)가 무엇을 받는지 차례로 보여 줍니다.

## 예제

같은 짜임새를 공통 예제 모델로 줄여 쓴 것입니다. 먼저 behavior definition 입니다.

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
  validation validatePrice on save { create; update; }
}
```

saver class 는 `save_modified` 에서 저장할 수 없는 여행을 `failed` 와 `reported` 로 알립니다. 이 두 매개변수는 기반 클래스가 `CL_ABAP_BEHAVIOR_SAVER_FAILED` 이기 때문에 쓸 수 있습니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver_failed.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    LOOP AT create-travel INTO DATA(ls_travel).
      " 시연용 조건: 이 여행사 번호의 여행은 저장을 거절한다
      IF ls_travel-agencyid = '999999'.
        APPEND VALUE #( travelid    = ls_travel-travelid
                        %fail-cause = if_abap_behv=>cause-unspecific )
               TO failed-travel.
        APPEND VALUE #( travelid = ls_travel-travelid
                        %msg     = new_message_with_text(
                                     severity = if_abap_behv_message=>severity-error
                                     text     = '이 여행은 저장할 수 없습니다.' ) )
               TO reported-travel.
        CONTINUE.
      ENDIF.

      " 문제가 없으면 여기서 데이터베이스 테이블에 쓴다
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer 는 interaction phase(상호작용 단계)의 응답과 save sequence(저장 순서)의 응답을 따로 받습니다. save sequence 의 응답은 `COMMIT ENTITIES` 의 긴 형식으로 받습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid totalprice )
  WITH VALUE #( ( %cid       = 'cid1'
                  travelid   = '00000003'
                  agencyid   = '999999'
                  totalprice = 100 ) )
  FAILED DATA(ls_failed_early)
  REPORTED DATA(ls_reported_early).

COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED DATA(ls_failed_late)
  REPORTED DATA(ls_reported_late).

CASE sy-subrc.
  WHEN 0.
    " 저장 성공
  WHEN 4.
    " early save phase 에서 실패(validation). 인스턴스는 버퍼에 남아 있다
  WHEN 8.
    " late save phase 에서 실패. 되돌려야 다음 EML 요청을 보낼 수 있다
    ROLLBACK ENTITIES.
ENDCASE.
```

## 알아두기

원문 프로그램은 다섯 가지 상황을 차례로 실행합니다. 수정 요청마다 인스턴스를 만들고 `COMMIT ENTITIES` 로 save sequence 를 시작하며, 응답이 있으면 출력하고 `SELECT` 로 데이터베이스 테이블의 내용을 보여 줍니다.

| 상황 | 무슨 일이 생기나 | 커밋 뒤 `sy-subrc` |
| --- | --- | --- |
| 저장 성공 | validation 도 저장도 문제없이 끝납니다. 이른 응답도 늦은 응답도 비어 있습니다. | 0 |
| interaction phase 에서 실패 | 인스턴스 둘을 만드는데, 하나는 키가 이미 데이터베이스에 있어서 생성에 실패합니다. 이른 `failed` 에 항목이 생깁니다. 나머지 하나는 데이터베이스에 저장됩니다. | 원문에 따로 적혀 있지 않음 |
| early save phase(이른 저장 단계)에서 실패 | validation 이 실패합니다. 실패한 인스턴스는 transactional buffer(트랜잭션 버퍼)에 그대로 남아 있습니다. 예제는 수정 작업으로 값을 고친 뒤 다시 커밋합니다. | 4 |
| late save phase(늦은 저장 단계)에서 실패 | `save_modified` 가 저장을 거절하고 response parameter(응답 매개변수)를 채웁니다. 실패한 인스턴스는 transactional buffer 에 없습니다. | 8 |
| late save phase 실패 뒤 계속하기 | `ROLLBACK ENTITIES` 를 먼저 실행한 다음 새 생성 작업을 보냅니다. | - |

눈여겨볼 점은 다음과 같습니다.

- interaction phase 에서 실패한 인스턴스는 버퍼에 들어가지 않습니다. 원문은 실패 직후 같은 키를 읽어 이 점을 보여 줍니다. 이때 읽히는 것은 데이터베이스에 이미 있던 인스턴스입니다.
- early save phase 의 실패와 late save phase 의 실패는 뒤처리가 다릅니다. 이른 단계에서 실패하면 인스턴스가 버퍼에 남아 있어 고쳐서 다시 저장할 수 있습니다. 늦은 단계에서 실패하면 버퍼에 남아 있지 않습니다.
- `sy-subrc` 가 8 이 된 뒤에는 명시적으로 되돌리지 않으면 RAP BO consumer 가 계속할 수 없습니다. 원문 예제는 새 생성 작업 앞에 `ROLLBACK ENTITIES` 를 두고, 이 문이 없으면 런타임 오류 `CX_SADL_DUMP_APPL_MODEL_ERROR` 가 난다고 적고 있습니다.
- 다만 원문 코드는 `sy-subrc` 가 8 이 된 바로 뒤, 되돌리기 전에 `READ ENTITY` 로 버퍼를 한 번 읽습니다. 실패한 인스턴스가 버퍼에 없다는 것을 보여 주는 읽기입니다. 되돌리기 전에 어떤 요청까지 보낼 수 있는지는 원문에 따로 적혀 있지 않습니다.

## 관련 항목

- [[abenabp_cl_abap_beh_saver_failed]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abapemlcommit_entities_long]]
- [[abaprollback_entities]]
