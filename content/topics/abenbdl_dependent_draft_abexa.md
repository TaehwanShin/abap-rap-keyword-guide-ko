---
title: 예제 - draft 범위 (종속 draft)
summary: 서로 다른 두 BO 를 with dependent draft 와 use draft as dependent 로 묶어, 한쪽을 편집 상태로 바꾸면 연결된 다른 BO 의 인스턴스도 함께 draft 가 되는 것을 보여 주는 예제입니다.
keywords: draft scope, 초안 범위, dependent draft, 종속 초안, with dependent draft, use draft as dependent, principal draft BO, 주 초안 BO, cross-BO, with cross associations, use association, Edit, 프로젝션 BDEF
---

## 설명

종속 draft 기능을 쓰면 서로 다른 BO 여러 개를 **하나의 작업 단위(LUW)** 처럼 묶어 편집할 수 있습니다. 연결된 draft 인스턴스들이 같이 움직이므로 서로 어긋나지 않습니다.

이 예제에는 BO 가 두 개 나옵니다. 여기서는 여행(`ZR_Travel`)과 경비(`ZR_Expense`)로 바꿔 씁니다.

- 두 BO 는 association `_Expense` 와 `_Travel` 로 서로 이어져 있습니다.
- 경비 BO 는 여행의 키를 `TravelID` 필드에 외래 키로 담고 있습니다.
- 둘 다 draft 를 쓸 수 있는 managed BO 입니다.

종속 draft 는 **projection 계층의 behavior definition(동작 정의)**에서 설정합니다.

- 여행의 projection BDEF : 경비로 가는 association 에 `with dependent draft` 를 붙입니다. 여행이 **주 draft BO** 가 됩니다.
- 경비의 projection BDEF : 머리말에 `use draft as dependent` 를 적습니다. 경비가 **종속 draft BO** 가 됩니다.

## 예제

base BDEF(기반 BDEF)에서는 BO 사이를 잇는 association 을 정의합니다. 경비 쪽 머리말에는 `with cross associations;` 를 넣어야 합니다.

```bdl
// 여행의 base BDEF (with draft) 일부
association _Expense using ZR_Expense \_Travel
{
  create;
  with draft;
}
```

```bdl
// 경비의 base BDEF 일부. 머리말에 with draft; 와 with cross associations; 가 있다
association _Travel
{
  create;
  with draft;
  link action linkTravel;
  unlink action unlinkTravel;
  inverse function getExpenses;
}
```

여행의 projection BDEF 입니다. 주 draft BO 입니다.

```bdl
projection;
strict ( 2 );
use draft;

define behavior for ZC_Travel alias Travel
use etag
{
  use create;
  use update;
  use delete;

  use action Activate;
  use action Discard;
  use action Edit;
  use action Resume;
  use action Prepare;

  // 경비의 draft 처리를 여행이 맡는다
  use association _Expense
  {
    create;
    with dependent draft;
  }
}
```

경비의 projection BDEF 입니다. 종속 draft BO 입니다.

```bdl
projection;
strict ( 2 );
use draft as dependent;

define behavior for ZC_Expense alias Expense
{
  use update;
  use delete;

  use association _Travel { with draft; create; }
}
```

EML 로 확인합니다.

```abap
" 1) active 여행 하나와, association 으로 경비 두 건을 만든다
MODIFY ENTITIES OF zc_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID )
    WITH VALUE #( ( %cid = 'cid_t' TravelID = '00000001' AgencyID = '070001' ) )
    CREATE BY \_expense
    FIELDS ( Amount )
    WITH VALUE #( ( %cid_ref = 'cid_t'
                    %target  = VALUE #( ( %cid = 'cid_e1' Amount = '100' )
                                        ( %cid = 'cid_e2' Amount = '250' ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
COMMIT ENTITIES.

" 2) 여행에만 Edit 를 실행한다
MODIFY ENTITIES OF zc_travel
  ENTITY travel
    EXECUTE edit
    FROM VALUE #( ( %cid = 'cid_edit' %key-TravelID = '00000001' ) )
  FAILED ls_failed
  REPORTED ls_reported.
COMMIT ENTITIES.

" 3) 두 BO 의 draft 테이블을 읽는다
SELECT * FROM ztravel_d  INTO TABLE @DATA(lt_travel_draft).
SELECT * FROM zexpense_d INTO TABLE @DATA(lt_expense_draft).
```

## 알아두기

실행하면 다음과 같이 됩니다.

- 첫 단계에서 여행 인스턴스 하나가 active(활성) 테이블에 생깁니다. create-by-association 한 경비 두 건은 외래 키 `TravelID` 로 그 여행에 이어집니다. `mapped` 응답에서 이 연결을 확인할 수 있습니다.
- 둘째 단계에서 여행에 `Edit` action 을 실행하면 그 여행이 draft 가 됩니다.
- 셋째 단계에서 draft 테이블을 읽어 보면, 여행의 draft 테이블뿐 아니라 **경비의 draft 테이블에도 줄이 들어 있습니다.** 경비에는 `Edit` 를 실행하지 않았는데도, 여행을 편집 상태로 바꾸자 연결된 경비까지 함께 draft 가 된 것입니다.

눈여겨볼 점입니다.

- `with dependent draft` 와 `use draft as dependent` 는 짝입니다. 한쪽만 있으면 안 됩니다.
- 두 BO 모두 draft 를 쓸 수 있어야 합니다.
- 종속 쪽 projection BDEF 에는 draft action 을 `use action` 으로 적지 않았습니다. 원문 예제에서는 `use create` 도 주석으로 막아 두었고, 종속 BO 의 인스턴스는 주 draft BO 의 association 으로 만듭니다.
- 원문 예제는 RAP BO 계약을 모두 지키지는 않습니다. 설명용으로 짧게 만든 것입니다.

## 관련 항목

- [[abenbdl_use_projection]]
- [[abenbdl_association]]
- [[abenbdl_with_draft]]
- [[abenbdl_draft_action]]
- [[abenbdl_with_cross_assoc]]
