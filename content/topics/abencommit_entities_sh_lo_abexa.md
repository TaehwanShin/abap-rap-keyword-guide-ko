---
title: 예제 - COMMIT ENTITIES 짧은 형식과 긴 형식
summary: 응답 없이 저장하는 짧은 형식과 root entity 별로 FAILED, REPORTED 를 받는 긴 형식을 견주고, validation 이 하나라도 실패하면 아무것도 저장되지 않음을 보여 줍니다.
keywords: COMMIT ENTITIES, RESPONSE OF, 짧은 형식, 긴 형식, 예제, validation on save, 검증, FAILED, REPORTED, 모두 아니면 전무, ROLLBACK ENTITIES
---

## 설명

`COMMIT ENTITIES` 의 두 형식을 한 프로그램에서 견주는 예제입니다.

- **짧은 형식** `COMMIT ENTITIES.` : 응답은 받지 않고 저장만 합니다.
- **긴 형식** `COMMIT ENTITIES RESPONSE OF ...` : root entity(루트 엔터티)마다 `FAILED` 와 `REPORTED` 응답을 받습니다.

원문은 서로 관계없는 단순한 managed root entity 두 개를 씁니다. entity(엔터티)를 둘 쓰는 까닭은 응답을 받을 root entity 가 둘 이상인 경우를 보여 주기 위해서입니다. association 과 child entity(자식 엔터티)는 이 예제에서 쓰지 않습니다.

긴 형식에서 응답이 채워지는 모습을 보려고, 두 entity 의 behavior definition(동작 정의)에 저장 때 실행되는 validation 을 하나씩 넣었습니다. validation 메서드는 넘어온 키의 인스턴스를 `READ ENTITIES` 로 읽고, 숫자 필드 하나가 허용 값보다 크면 그 인스턴스 정보를 `FAILED` 와 `REPORTED` 에 채웁니다.

프로그램은 세 번 저장합니다.

1. 짧은 형식으로 올바른 인스턴스를 저장합니다.
2. 긴 형식으로 올바른 인스턴스만 저장합니다.
3. 긴 형식으로 올바른 인스턴스와 잘못된 인스턴스를 섞어 저장합니다.

## 예제

같은 내용을 여행 BO `zr_travel` 과, 그와 관계없는 여행사 BO `zr_agency` 로 줄여 썼습니다. 여행 쪽 behavior definition 에는 종료일이 시작일보다 빠르면 실패하는 validation 이 있다고 가정합니다. 올바른 값만 넣는 두 번째 저장은 줄이고, 첫 번째와 세 번째 저장만 실었습니다.

```bdl
validation validateDates on save { field BeginDate, EndDate; }
```

```abap
" 1) 짧은 형식: 저장만 하고 응답은 받지 않는다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid begindate enddate )
    WITH VALUE #( ( %cid = 'cid1' travelid = '00000001'
                    begindate = '20260301' enddate = '20260310' ) )
  FAILED DATA(ls_failed_1).

COMMIT ENTITIES.
IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.

" 2) 긴 형식: 두 BO 를 바꾸고, root entity 마다 응답을 받는다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid begindate enddate )
    WITH VALUE #( ( %cid = 'cid2' travelid = '00000002'    " 올바른 값
                    begindate = '20260401' enddate = '20260410' )
                  ( %cid = 'cid3' travelid = '00000003'    " 종료일이 시작일보다 빠르다
                    begindate = '20260420' enddate = '20260401' ) )
  FAILED DATA(ls_failed_2).

MODIFY ENTITIES OF zr_agency
  ENTITY agency
    CREATE FIELDS ( agencyid name )
    WITH VALUE #( ( %cid = 'cid4' agencyid = '070001' name = 'Sunshine Travel' ) )
  FAILED DATA(ls_failed_3).

COMMIT ENTITIES
  RESPONSE OF zr_travel
    FAILED   DATA(ls_failed_travel)
    REPORTED DATA(ls_reported_travel)
  RESPONSE OF zr_agency
    FAILED   DATA(ls_failed_agency)
    REPORTED DATA(ls_reported_agency).

IF sy-subrc <> 0.
  " ls_failed_travel-travel 에 validation 에서 떨어진 여행이 들어 있다
ENDIF.

" 저장되었는지 persistent table 에서 확인한다
SELECT * FROM ztravel INTO TABLE @DATA(lt_saved).
```

### 실행하면

- 짧은 형식 : 만든 인스턴스가 persistent table 에 저장됩니다. 저장만 하면 되므로 응답은 보지 않습니다.
- 긴 형식, 올바른 값만 넣었을 때 : 커밋할 때 behavior pool(동작 풀)의 validation 메서드가 불립니다. 인스턴스가 모두 올바르므로 모두 저장됩니다. `FAILED` 와 `REPORTED` 는 비어 있습니다.
- 긴 형식, 잘못된 값을 섞었을 때 : validation 메서드가 실패한 인스턴스 정보를 응답에 채웁니다. 잘못된 인스턴스뿐 아니라 **올바른 인스턴스도 저장되지 않습니다.** RAP 트랜잭션 전체가 저장되지 않습니다. 원문은 저장할 때마다 테이블을 비우고 다시 시작하므로, persistent table 을 읽어도 나오는 것이 없습니다. 위 코드는 테이블을 비우지 않으므로, 마지막 `SELECT` 에는 첫 번째 저장에서 들어간 여행 `00000001` 만 나옵니다. 응답에는 root entity 별로 실패한 인스턴스 정보가 들어 있습니다.

## 알아두기

- validation 은 RAP 트랜잭션 단위로 통과하거나 떨어집니다. 한 건만 실패해도 transactional buffer(트랜잭션 버퍼)의 내용은 하나도 저장되지 않습니다.
- 잘못된 인스턴스는 `UPDATE` 작업으로 값을 고치거나, `ROLLBACK ENTITIES` 문으로 지워야 합니다. 원문은 그러기 전에는 데이터를 더 변경할 수 없다고 적고 있습니다. 값을 고치는 `UPDATE` 작업은 여기에 들지 않습니다.
- 긴 형식의 응답은 `RESPONSE OF` 에 적은 root entity 마다 따로 받습니다.

## 관련 항목

- [[abapemlcommit_entities_short]]
- [[abapemlcommit_entities_long]]
- [[abapcommit_entities]]
- [[abenbdl_validations]]
- [[abaprollback_entities]]
- [[abeneml_commit_dyn_abexa]]
