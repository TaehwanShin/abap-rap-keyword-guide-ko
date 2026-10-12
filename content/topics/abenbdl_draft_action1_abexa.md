---
title: 예제 - draft action Activate
summary: managed RAP BO 에서 draft 인스턴스를 만들고, draft action Activate 로 persistent table 에 옮기는 과정을 보여 주는 예제입니다.
keywords: draft action Activate, 초안 액션, 활성화, 예제, with draft, draft table, total etag, optimized, EXECUTE activate, %is_draft, 초안 테이블
---

## 설명

draft action `Activate` 를 managed RAP BO 에서 정의하고 EML 로 실행하는 예제입니다. 원문의 데이터 모델은 root entity(루트 엔터티) 하나뿐입니다. 여기서는 여행(`ZR_Travel`)으로 바꿔 적습니다.

behavior definition(동작 정의)에는 draft 를 쓰는 데 꼭 필요한 문법 요소가 모두 들어 있습니다.

- 머리말에 `with draft;` 가 있습니다.
- draft 테이블(`draft table`)이 정의되어 있습니다.
- 전체 ETag([[abenbdl_etag|total etag]]) 필드가 제자리, 곧 `lock master` 바로 뒤에 있습니다.
- draft action 이 모두 직접 선언되어 있습니다.

draft 는 RAP 프레임워크가 다 처리합니다. behavior pool(동작 풀)에 구현할 것이 없습니다.

## 예제

### behavior definition

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt;

  draft action Activate optimized;
  draft action Discard;
  draft action Edit;
  draft action Resume;
  draft determine action Prepare;
}
```

### 사용하는 쪽

```abap
" 1) draft 인스턴스 두 개를 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid ) WITH VALUE #(
      ( %cid = 'cid1' %is_draft = if_abap_behv=>mk-on
        travelid = '00000001' agencyid = '070001' )
      ( %cid = 'cid2' %is_draft = if_abap_behv=>mk-on
        travelid = '00000002' agencyid = '070002' ) )
  MAPPED FINAL(ls_create_mapped)
  FAILED FINAL(ls_create_failed)
  REPORTED FINAL(ls_create_reported).

COMMIT ENTITIES.

" 활성화하기 전의 두 테이블
SELECT * FROM ztravel_d INTO TABLE @FINAL(lt_draft_before).
SELECT * FROM ztravel   INTO TABLE @FINAL(lt_active_before).

" 2) 두 draft 를 활성화한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE activate AUTO FILL CID WITH VALUE #(
      ( %key-travelid = '00000001' )
      ( %key-travelid = '00000002' ) )
  MAPPED FINAL(ls_act_mapped)
  FAILED FINAL(ls_act_failed)
  REPORTED FINAL(ls_act_reported).

COMMIT ENTITIES.
IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.

" 활성화한 뒤의 두 테이블
SELECT * FROM ztravel_d INTO TABLE @FINAL(lt_draft_after).
SELECT * FROM ztravel   INTO TABLE @FINAL(lt_active_after).
```

## 알아두기

실행 결과를 표로 보면 다음과 같습니다.

| 시점 | draft 테이블 `ztravel_d` | persistent table `ztravel` |
| --- | --- | --- |
| 활성화 전 | 새 draft 인스턴스 두 건 | 비어 있음 |
| 활성화 후 | 비어 있음 | 인스턴스 두 건 |

- `CREATE` 에서 `%is_draft` 를 on 으로 하면 인스턴스가 persistent table 이 아니라 draft 테이블에 들어갑니다.
- `Activate` 는 `MODIFY ENTITIES ... EXECUTE` 로 두 인스턴스에 한꺼번에 실행합니다.
- `Activate` 는 draft 테이블의 내용을 persistent table 로 복사하고, draft 테이블에서는 지웁니다.

## 관련 항목

- [[abenbdl_draft_action]]
- [[abenbdl_draft_action2_abexa]]
- [[abenbdl_draft_action_abexas]]
- [[abenbdl_with_draft]]
- [[abenbdl_etag]]
