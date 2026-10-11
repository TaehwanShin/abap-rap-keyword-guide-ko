---
title: 예제 - BDEF projection extension 과 노드 extension
summary: 원본 BO 에 extension 노드와 extension action 을 보탠 뒤, BDEF projection extension 으로 그것들을 projection 층에 내놓고 projection 을 거쳐 실행해 보는 예제입니다.
keywords: extension for projection, BDEF 프로젝션 확장, 노드 확장, extend behavior for, define behavior for, use action, use association, redirected to composition child, extend view entity, 프로젝션 BDEF, 예제
---

## 설명

이 예제는 projection BDEF 의 동작을 **BDEF projection extension(확장)**으로 넓히는 과정을 보여 줍니다. 세 층이 차례로 나옵니다.

**1. 원본 BO 와 그 extension** ([[abenbdl__behavior_ext_abexa]] 와 같은 모델입니다)

- 원본 BO 는 루트 노드 하나짜리 managed BO 입니다. extension 용 CDS 트랜잭션 interface 와 `extensible` 한 interface BDEF 가 있습니다.
- 데이터 모델 extension 으로 자식 노드를 보탭니다. 루트 뷰에는 뷰 entity(엔터티) extension 으로 자식으로 가는 composition 을 보태고, interface 층에도 같은 composition 을 보탭니다.
- BDEF extension 은 interface 를 거쳐 루트 노드에 association 동작과 extension action 을 보태고, 자식 노드의 동작(determination, action)을 정의합니다. 구현은 extension behavior pool(동작 풀)에 있습니다.

**2. projection 층**

- 루트 노드와 자식 노드의 projection 뷰가 있습니다. 루트 projection 뷰에는 새 composition 을 허용하는 표시가 있습니다.
- 뷰 entity extension 으로 루트 projection 뷰에 자식 projection 뷰로 가는 composition 을 잇습니다.
- projection BDEF 는 루트 노드의 동작만 정의합니다. 머리말과 entity 에 `extensible` 을 적고, standard operation(표준 작업)을 `use` 로 내놓습니다.

**3. BDEF projection extension**

- 루트 노드를 넓혀, 원본 BO extension 이 만든 association 과 action 을 `use` 로 내놓습니다.
- extension 자식 노드의 projection 동작을 `define behavior for` 로 정의합니다.

## 예제

공통 예제 모델로 줄여 썼습니다. 원본 BO extension 이 `ZR_Travel` 아래에 `ZR_TravelNote` 를 보태고, 루트에 action `holdTravel`, 자식에 action `markDone` 을 만들어 두었다고 봅니다. 먼저 projection 뷰 쪽입니다.

```cds
define view entity ZC_TravelNote
  as projection on ZR_TravelNote
{
  key TravelID,
  key NoteID,
      NoteText,
      NoteDate,
      _Travel : redirected to parent ZC_Travel
}
```

```cds
// 루트 projection 뷰에 자식으로 가는 composition 을 잇는다
extend view entity ZC_Travel with
{
  _Note : redirected to composition child ZC_TravelNote
}
```

projection BDEF 는 extension 을 허용합니다.

```bdl
projection;
strict ( 2 );
extensible;

define behavior for ZC_Travel alias Travel
extensible
{
  use create;
  use update;
  use delete;
}
```

BDEF projection extension 입니다. behavior pool 이 없습니다.

```bdl
extension for projection;

extend behavior for Travel
{
  use association _Note { create; }
  use action holdTravel;
}

define behavior for ZC_TravelNote alias TravelNote
{
  use association _Travel;
  use action markDone;
  field ( readonly ) NoteDate;
}
```

사용하는 쪽은 projection `ZC_Travel` 을 거쳐 접근합니다.

```abap
" 루트의 extension action
MODIFY ENTITIES OF zc_travel
  ENTITY travel
    EXECUTE holdtravel
    FROM VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

" extension 노드의 action
MODIFY ENTITIES OF zc_travel
  ENTITY travelnote
    EXECUTE markdone
    FROM VALUE #( ( travelid = '00000001' noteid = '01' ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

### 실행하면

원문 프로그램은 EML 로 projection BO 에 접근해 네 가지를 차례로 합니다.

1. 부모 두 건과 자식 두 건을 만듭니다. 자식은 projection extension 이 내놓은 association 을 따라 만듭니다.
2. 부모 두 건의 수정을 요청합니다. 원본 behavior pool 의 instance feature control(기능 제어)는 `int_field1` 값이 50보다 크면 수정을 막습니다. 원문 프로그램은 한 건을 51, 다른 한 건을 10으로 만들었으므로 10인 건만 수정할 수 있습니다.
3. projection extension 이 내놓은 루트 action 을 실행합니다.
4. 원본 BO extension 에서 자식 노드에 정의한 action 을 실행합니다.

화면 출력에는 behavior pool 의 handler method(핸들러 메서드)가 불린 순서를 적은 표가 들어 있습니다. BO 에 접근할 때 어느 메서드가 어떤 순서로 실행되는지 볼 수 있습니다.

## 알아두기

- projection extension 이 `use` 로 내놓는 것은 원본 BO **extension**에서 만든 작업입니다. 실제 처리는 원본 BO extension 의 extension behavior pool 에 있습니다.
- 원문 예제는 CDS 쪽에서 원본 뷰, interface 뷰, projection 뷰 세 곳에 모두 자식으로 가는 composition 을 보탭니다. BDEF projection extension 은 그 위에서 동작만 내놓습니다.
- projection extension 에서 할 수 있는 것과 없는 것은 [[abenbdl_proj_ext_body]] 와 [[abenbdl_proj_ext_entity]] 에 정리되어 있습니다.

## 관련 항목

- [[abenbdl_extension_for_projection]]
- [[abenbdl_extend_beh_proj]]
- [[abenbdl_proj_ext_body]]
- [[abenbdl_proj_ext_entity]]
- [[abenbdl__behavior_ext_abexa]]
- [[abenbdl_ext_enabling_projection]]
