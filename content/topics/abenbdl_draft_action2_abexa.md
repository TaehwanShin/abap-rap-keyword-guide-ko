---
title: 예제 - draft action Edit, Discard, Prepare
summary: managed RAP BO 에서 active 인스턴스에 draft action Edit, Prepare, Discard 를 차례로 실행하고 draft 테이블이 어떻게 바뀌는지 보여 주는 예제입니다.
keywords: draft action Edit, Discard, Prepare, draft determine action, 초안 액션, 예제, preserve_changes, AdditionalSave, with additional implementation, 초안 테이블, 결정
---

## 설명

draft action `Edit`, `Discard`, `Prepare` 를 managed RAP BO 에서 정의하고 EML 로 실행하는 예제입니다. 원문의 데이터 모델은 root entity(루트 엔터티) 하나뿐입니다. 여기서는 여행(`ZR_Travel`)으로 바꿔 적습니다.

behavior definition(동작 정의)에는 determination 하나가 있습니다. 저장할 때, 정해 둔 필드가 바뀌면 실행되는 determination 입니다. behavior pool(동작 풀)에 구현되어 있고, 인스턴스의 한 필드에 정해진 값을 넣습니다. 이 determination 을 draft determine action `Prepare` 에 `always` 로 넣어 둡니다.

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

  // LastChangedAt 이 바뀌면 저장할 때 Status 를 채운다
  determination setStatus on save { field LastChangedAt; }

  draft action ( authorization : none ) Edit;
  draft action Activate optimized with additional implementation;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare
  { determination ( always ) setStatus; }
  internal draft action AdditionalSave;
}
```

### 사용하는 쪽

```abap
" 1) active 인스턴스 두 개를 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE AUTO FILL CID FIELDS ( travelid ) WITH VALUE #(
      ( %is_draft = if_abap_behv=>mk-off travelid = '00000011' )
      ( %is_draft = if_abap_behv=>mk-off travelid = '00000022' ) )
  FAILED DATA(ls_failed) REPORTED DATA(ls_reported).
COMMIT ENTITIES.

" 2) Edit: active 인스턴스를 draft 테이블로 복사한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE edit AUTO FILL CID WITH VALUE #(
      ( %key-travelid = '00000011' %param-preserve_changes = 'X' )
      ( %key-travelid = '00000022' %param-preserve_changes = 'X' ) )
  FAILED ls_failed REPORTED ls_reported.
COMMIT ENTITIES.
SELECT * FROM ztravel_d INTO TABLE @FINAL(lt_draft_after_edit).

" 3) Prepare: 넣어 둔 determination setStatus 가 draft 에서 실행된다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE prepare FROM VALUE #( ( %key-travelid = '00000011' )
                                  ( %key-travelid = '00000022' ) )
  FAILED ls_failed REPORTED ls_reported.
COMMIT ENTITIES.
SELECT * FROM ztravel_d INTO TABLE @FINAL(lt_draft_after_prepare).

" 4) Discard: draft 두 개를 버린다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE discard FROM VALUE #( ( %key-travelid = '00000011' )
                                  ( %key-travelid = '00000022' ) )
  FAILED ls_failed REPORTED ls_reported.
COMMIT ENTITIES.
SELECT * FROM ztravel_d INTO TABLE @FINAL(lt_draft_after_discard).
```

## 알아두기

단계마다 draft 테이블 `ztravel_d` 는 이렇게 바뀝니다.

| 단계 | draft 테이블의 내용 |
| --- | --- |
| `Edit` 뒤 | active(활성) 인스턴스 두 건이 그대로 복사되어 들어 있습니다. |
| `Prepare` 뒤 | determination `setStatus` 가 실행되어 `Status` 필드에 값이 들어갑니다. |
| `Discard` 뒤 | 두 인스턴스가 draft 테이블에서 지워집니다. |

- `Edit` 는 active 인스턴스의 키로 부릅니다. 그 결과 persistent table 의 인스턴스가 draft 테이블에 복사됩니다.
- `Prepare` 는 `Edit` 로 만들어진 draft 인스턴스를 대상으로 실행됩니다. determination 에 `( always )` 를 붙였으므로 실행 조건과 상관없이 실행됩니다.
- behavior definition 에는 `Activate optimized with additional implementation` 과 `internal draft action AdditionalSave` 도 선언되어 있습니다. 예제 프로그램이 이 둘을 실행하지는 않습니다. 그래도 이렇게 선언하면 behavior pool 에 구현이 있어야 합니다. `with additional implementation` 을 붙인 `Activate` 와 `AdditionalSave` 는 둘 다 handler method(핸들러 메서드) `FOR MODIFY` 에 구현해야 합니다([[abenbdl_draft_action]]).
- behavior pool 의 handler class(핸들러 클래스)에는 determination 을 구현한 메서드가 있습니다. `Edit`, `Discard`, `Prepare` 자체는 구현하지 않습니다.

## 관련 항목

- [[abenbdl_draft_action]]
- [[abenbdl_draft_action1_abexa]]
- [[abenbdl_draft_action_abexas]]
- [[abenbdl_determinations]]
- [[abenbdl_determine_action]]
