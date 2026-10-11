---
title: 예제 - determine action extension
summary: 원본 BO 의 determine action 에 extension determination 하나를 더 넣고, 실행했을 때 원본과 extension 의 determination 이 어떤 순서로 불리는지 보여 주는 예제입니다.
keywords: extend determine action, determine action, 결정 액션 확장, determination, always, extensible, use action, 확장 결정, 실행 순서, EXECUTE, 예제
---

## 설명

이 예제는 BDEF extension(확장)으로 `determine action` 을 넓히는 과정을 보여 줍니다.

**원본 BO**

- root entity(루트 엔터티)와 child entity(자식 엔터티)가 있고, 둘 다 CDS 트랜잭션 interface 가 있습니다.
- 원본 BDEF 는 managed 이고 draft 를 씁니다. `determine action` 하나가 determination 두 개를 `(always)` 로 묶습니다. 하나는 루트의 determination 이고 하나는 자식의 determination 입니다. 이 `determine action` 에 `extensible` 을 붙여 extension 을 허용합니다.
- 원본 behavior pool(동작 풀)은 세 가지를 구현합니다.
  - instance 권한 확인: 한 필드가 특정 값이면 수정을 막습니다.
  - 루트의 저장 시점 determination: 번호 필드에 무작위로 만든 정수를 넣습니다.
  - 자식의 저장 시점 determination: 품목 금액을 더해 합계를 계산합니다.
- interface BDEF 는 `use action` 으로 그 `determine action` 을 바깥에 내놓습니다.

**extension**

- BDEF extension 은 저장 시점 determination 을 하나 새로 만들고, 원본의 `determine action` 에 그 determination 을 넣습니다.
- extension behavior pool 은 그 determination 을 구현합니다. 불리면 상태 필드에 '열림'을 뜻하는 값을 넣습니다.

## 예제

공통 예제 모델로 줄여 썼습니다. 원본 BDEF `ZR_Travel` 에서 눈여겨볼 부분입니다.

```bdl
// 원본 BDEF ZR_Travel (root entity Travel 의 일부)
determination setBeginDate on save { create; }

determine action recalcTravel extensible
{
  determination ( always ) setBeginDate;
  determination ( always ) Booking~calcTotalPrice;
}
```

interface BDEF `ZI_Travel` 에는 `use action recalcTravel;` 이 있습니다. BDEF extension 은 이렇습니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  determination setStatusToOpen on save { create; }

  extend determine action recalcTravel
  {
    determination ( always ) setStatusToOpen;
  }
}
```

extension behavior pool 에서 새 determination 을 구현합니다.

```abap
METHOD setstatustoopen.
  " 상태를 '열림(O)'으로 채운다
  MODIFY ENTITIES OF zi_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( status )
      WITH VALUE #( FOR key IN keys ( %tky = key-%tky status = 'O' ) )
    REPORTED DATA(ls_reported).

  reported = CORRESPONDING #( DEEP ls_reported ).
ENDMETHOD.
```

사용하는 쪽은 interface 를 거쳐 `determine action` 을 실행합니다.

```abap
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    EXECUTE recalctravel
    FROM VALUE #( ( travelid = '00000001' )
                  ( travelid = '00000002' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

### 실행하면

- 원문 프로그램은 먼저 부모 두 건과 자식 두 건을 ABAP SQL `INSERT` 로 테이블에 **직접** 넣습니다. EML 로 생성하면 determination 세 개가 모두 트리거되므로, 그것을 피하려는 것입니다.
- 그다음 `determine action` 을 실행합니다.
- 실행 전과 후의 부모 테이블 내용을 `SELECT` 로 읽어 보여 줍니다. 번호, 합계 금액, 상태 필드에 determination 이 넣은 값이 들어 있습니다.

RAP 프레임워크는 원본 behavior pool 과 extension behavior pool 의 구현을 이 순서로 부릅니다.

1. 원본의 instance 권한 확인 — 루트 노드 작업이 허용되는지 봅니다.
2. 원본 루트 노드의 determination
3. 루트 노드 extension 의 determination
4. 원본의 instance 권한 확인 — 자식 노드 작업이 허용되는지 봅니다.
5. 원본 자식 노드의 determination

## 알아두기

- extension determination 은 원본 determination 과 같은 `determine action` 안에서 함께 실행됩니다. 위 순서에서 보듯 루트의 원본 determination 다음, 자식 쪽 처리 앞에 불립니다.
- `(always)` 를 붙였기 때문에 트리거 조건(여기서는 `create`)과 상관없이 determination 이 실행됩니다.
- `determine action` extension 은 지금은 draft 를 쓰는 BO 에서만 할 수 있습니다. 이 제약은 [[abenbdl_determine_action_ext]] 에 나옵니다. 원문 예제의 원본 BDEF 도 `with draft` 입니다.

## 관련 항목

- [[abenbdl_determine_action_ext]]
- [[abenbdl_determine_action]]
- [[abenbdl_new_elem_ext]]
- [[abenbdl_in_class_unique_ext]]
- [[abapmodify_entity_entities_op]]
