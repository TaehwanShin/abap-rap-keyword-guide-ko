---
title: 예제 - RAP 트랜잭션의 단계
summary: late numbering 을 쓰는 unmanaged RAP BO 로 저장 성공, finalize 실패, check_before_save 실패, 롤백 네 가지를 돌려 보고 그때마다 어떤 메서드가 불리는지 기록해 보여 주는 예제입니다.
keywords: RAP transaction, RAP LUW, transactional phases, 트랜잭션 단계, 상호작용 단계, 저장 순서, 이른 저장 단계, 늦은 저장 단계, finalize, check_before_save, cleanup_finalize, adjust_numbers, save, cleanup, COMMIT ENTITIES, ROLLBACK ENTITIES, sy-subrc, late numbering, unmanaged, 예제
---

## 설명

RAP 트랜잭션이 어떤 단계를 거치는지 눈으로 확인하는 예제입니다. root entity(루트 엔터티) 하나짜리 [[abenbdl_impl_type|unmanaged]] RAP BO 를 쓰고, behavior definition(동작 정의)에 `late numbering` 이 있습니다.

behavior pool(동작 풀)의 메서드는 불릴 때마다 내부 테이블에 한 줄씩 남깁니다. 한 줄에는 **몇 번째로 불렸는지, 메서드 이름, 오류가 났는지, 그리고 interaction phase(상호작용 단계)·early save phase(이른 저장 단계)·late save phase(늦은 저장 단계) 가운데 어디인지**가 들어갑니다. 실행 클래스는 EML 요청을 보낸 뒤 이 기록과 DB 테이블 내용을 출력합니다.

다루는 상황은 네 가지입니다.

| 상황 | 하는 일 | 결과 |
| --- | --- | --- |
| 저장 성공 | 인스턴스 두 개를 만들고 `COMMIT ENTITIES` | interaction phase 와 save sequence(저장 순서)가 모두 끝까지 갑니다. `sy-subrc` 는 0 입니다. |
| `finalize` 에서 실패 | 인스턴스 하나를 만들고 `COMMIT ENTITIES` | `finalize` 가 실패하면서 `cleanup_finalize` 가 불립니다. `sy-subrc` 는 4 입니다. 이어서 다른 값으로 다시 만들면 저장에 성공합니다. |
| `check_before_save` 에서 실패 | 위와 같은 차례 | 여기서도 실패하면 `cleanup_finalize` 가 불립니다. 다시 만들면 저장에 성공합니다. |
| 롤백 | 인스턴스를 만들고 `COMMIT ENTITIES` 없이 `ROLLBACK ENTITIES` | saver class(세이버 클래스)에서는 `cleanup` 메서드만 불립니다. |

## 예제

behavior definition 과 saver class 의 뼈대입니다. 메서드마다 이름을 기록합니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
late numbering
lock master
authorization master ( global )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

```abap
" 전역 클래스 zbp_r_travel 의 PUBLIC SECTION 에 선언
"   CLASS-DATA gt_called TYPE string_table.

CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS finalize          REDEFINITION.
    METHODS check_before_save REDEFINITION.
    METHODS cleanup_finalize  REDEFINITION.
    METHODS adjust_numbers    REDEFINITION.
    METHODS save              REDEFINITION.
    METHODS cleanup           REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD finalize.
    APPEND `finalize` TO zbp_r_travel=>gt_called.
    " 버퍼의 인스턴스가 조건에 맞지 않으면 failed 를 채운다 → 저장이 멈춘다
  ENDMETHOD.

  METHOD check_before_save.
    APPEND `check_before_save` TO zbp_r_travel=>gt_called.
    " 여기서도 failed 를 채우면 저장이 멈춘다
  ENDMETHOD.

  METHOD cleanup_finalize.
    " finalize 나 check_before_save 가 실패했을 때만 불린다
    APPEND `cleanup_finalize` TO zbp_r_travel=>gt_called.
  ENDMETHOD.

  METHOD adjust_numbers.
    APPEND `adjust_numbers` TO zbp_r_travel=>gt_called.
    " late numbering: 여기서 최종 키를 정해 mapped 에 담는다
  ENDMETHOD.

  METHOD save.
    APPEND `save` TO zbp_r_travel=>gt_called.
    " 버퍼 내용을 DB 테이블에 쓴다
  ENDMETHOD.

  METHOD cleanup.
    APPEND `cleanup` TO zbp_r_travel=>gt_called.
    " 버퍼를 비운다. ROLLBACK ENTITIES 때도 불린다
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer(사용자) 쪽 코드입니다.

```abap
" 저장: 실패하면 sy-subrc 가 0 이 아니고 FAILED 에 이유가 담긴다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( AgencyID CustomerID Status )
  WITH VALUE #( ( %cid = 'cid1' AgencyID = '070001' CustomerID = '000042' Status = 'N' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES RESPONSE OF zr_travel FAILED DATA(ls_failed_late).

IF sy-subrc <> 0.
  " save sequence 에서 실패했다. 값을 바로잡아 새 요청을 보내고 다시 커밋한다
ENDIF.

" 롤백: 버퍼에 쌓인 변경을 버린다. saver class 에서는 cleanup 만 불린다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( AgencyID CustomerID Status )
  WITH VALUE #( ( %cid = 'cid2' AgencyID = '070001' CustomerID = '000043' Status = 'N' ) )
  FAILED ls_failed
  REPORTED ls_reported.

ROLLBACK ENTITIES.
```

## 알아두기

- `cleanup_finalize` 는 `finalize` 나 `check_before_save` 에서 오류가 났을 때만 불립니다. 저장에 성공한 경우와 롤백한 경우에는 불리지 않습니다.
- save sequence 에서 실패하면 `COMMIT ENTITIES` 뒤의 `sy-subrc` 가 4 가 됩니다. 실패한 인스턴스는 `COMMIT ENTITIES RESPONSE OF ... FAILED` 로 받습니다.
- 저장에 실패한 뒤에도 RAP BO consumer 는 새 요청을 보내고 다시 커밋할 수 있습니다. 예제에서는 두 번째 시도가 성공으로 끝납니다.
- `ROLLBACK ENTITIES` 는 saver class 의 `cleanup` 메서드만 부릅니다. 이 상황에는 `COMMIT ENTITIES` 문이 아예 없습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abensaver_finalize]]
- [[abensaver_check_before_save]]
- [[abapsaver_class_cleanup_finalize]]
- [[abensaver_adjust_numbers]]
- [[abensaver_method_save]]
- [[abensaver_method_cleanup]]
- [[abapcommit_entities]]
- [[abaprollback_entities]]
- [[abenrap_cl_abap_behv_aux_ph_abexa]]
- [[abapeml_examples_abexas]]
