---
title: 예제 - COMMIT ENTITIES 동적 형식
summary: 응답을 받을 root entity 이름을 내부 테이블에 담아 COMMIT ENTITIES RESPONSES OF 로 저장하고, 여러 BO 의 응답을 한 테이블로 받는 예제입니다.
keywords: COMMIT ENTITIES, RESPONSES OF, 동적 형식, 예제, dyn_tab, ABP_ENTITY_NAME_TAB, ABP_ROOT_ENTITY_NAME, FAILED, REPORTED, validation on save, 검증, ROLLBACK ENTITIES
---

## 설명

`COMMIT ENTITIES` 의 동적 형식 `RESPONSES OF dyn_tab` 을 보여 주는 예제입니다. 응답을 받을 root entity(루트 엔터티)를 문에 직접 적지 않고, 이름을 담은 내부 테이블로 넘깁니다.

데이터 모델과 validation 은 [[abencommit_entities_sh_lo_abexa|짧은 형식과 긴 형식 예제]] 와 같습니다. 서로 관계없는 단순한 managed root entity 두 개가 있고, behavior definition(동작 정의)마다 저장 때 실행되는 validation 이 하나씩 있습니다. validation 메서드는 넘어온 키의 인스턴스를 `READ ENTITIES` 로 읽고, 숫자 필드 하나가 허용 값보다 크면 그 인스턴스 정보를 `FAILED` 와 `REPORTED` 에 채웁니다.

프로그램은 먼저 응답을 받을 root entity 이름 두 개를 `dyn_tab` 에 넣습니다. 그다음 두 번 저장합니다. 한 번은 올바른 인스턴스만, 한 번은 잘못된 인스턴스를 섞어서 저장합니다.

## 예제

같은 내용을 여행 BO `zr_travel` 과, 그와 관계없는 여행사 BO `zr_agency` 로 줄여 썼습니다. 여행 쪽 behavior definition 에는 종료일이 시작일보다 빠르면 실패하는 validation `validateDates` 가 있다고 가정합니다.

```abap
DATA: lv_root_travel TYPE abp_root_entity_name VALUE 'ZR_TRAVEL',
      lv_root_agency TYPE abp_root_entity_name VALUE 'ZR_AGENCY'.

" 응답을 받을 root entity 이름을 테이블에 담는다
DATA(lt_roots) = VALUE abp_entity_name_tab( ( lv_root_travel )
                                            ( lv_root_agency ) ).

MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid begindate enddate )
    WITH VALUE #( ( %cid = 'cid1' travelid = '00000001'    " 올바른 값
                    begindate = '20260401' enddate = '20260410' )
                  ( %cid = 'cid2' travelid = '00000002'    " 종료일이 시작일보다 빠르다
                    begindate = '20260420' enddate = '20260401' ) )
  FAILED DATA(ls_failed_travel).

MODIFY ENTITIES OF zr_agency
  ENTITY agency
    CREATE FIELDS ( agencyid name )
    WITH VALUE #( ( %cid = 'cid3' agencyid = '070001' name = 'Sunshine Travel' ) )
  FAILED DATA(ls_failed_agency).

" 두 BO 의 응답이 테이블 하나에 모여 온다
COMMIT ENTITIES
  RESPONSES OF lt_roots
    FAILED   DATA(lt_failed)
    REPORTED DATA(lt_reported).

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다. lt_failed 를 본다
ENDIF.

" 저장되었는지 persistent table 에서 확인한다
SELECT * FROM ztravel INTO TABLE @DATA(lt_saved).
```

### 실행하면

- 올바른 값만 넣었을 때 : 커밋할 때 behavior pool(동작 풀)의 validation 메서드가 불립니다. 인스턴스가 모두 올바르므로 모두 저장됩니다. `FAILED` 와 `REPORTED` 는 비어 있습니다.
- 잘못된 값을 섞었을 때 : validation 메서드가 실패한 인스턴스 정보를 응답에 채웁니다. 잘못된 인스턴스뿐 아니라 올바른 인스턴스도 저장되지 않습니다. RAP 트랜잭션 전체가 저장되지 않으므로 persistent table 을 읽어도 나오는 것이 없습니다.
- 응답은 `dyn_tab` 에 넣은 모든 root entity 의 것이 합쳐져 옵니다. `FAILED` 테이블 하나, `REPORTED` 테이블 하나입니다.

## 알아두기

- validation 은 RAP 트랜잭션 단위로 변경을 받아들이거나 물리칩니다. 한 건만 실패해도 transactional buffer(트랜잭션 버퍼)의 내용은 하나도 저장되지 않습니다.
- 잘못된 인스턴스는 `UPDATE` 작업으로 값을 고치거나, `ROLLBACK ENTITIES` 문으로 지워야 합니다. 원문은 그러기 전에는 데이터를 더 변경할 수 없다고 적고 있습니다. 값을 고치는 `UPDATE` 작업은 여기에 들지 않습니다.
- `dyn_tab` 은 `ABP_ENTITY_NAME_TAB` 타입이고, 줄에 넣는 이름은 `ABP_ROOT_ENTITY_NAME` 타입입니다.

## 관련 항목

- [[abapemlcommit_entities_dyn]]
- [[abapcommit_entities]]
- [[abencommit_entities_sh_lo_abexa]]
- [[abenbdl_validations]]
- [[abaprollback_entities]]
- [[abapeml_responses_dyn]]
