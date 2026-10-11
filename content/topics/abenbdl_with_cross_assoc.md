---
title: 다른 BO 로 가는 association 지원 (with cross associations)
summary: managed RAP BO 머리말에 적어, 다른 BO 로 가는 association 의 작업(읽기·만들기·잇기·끊기)을 managed RAP BO provider 가 맡게 하는 구문입니다.
keywords: with cross associations, cross-BO, 다른 BO, BO 사이 연관 관계, cross-BO association, link action, unlink action, inverse function, late numbering, create by association, read by association, %pid, unmanaged association
---

## 문법

```syntax
...
with cross associations;
...
```

## 설명

`with cross associations` 는 managed RAP BO 가 **다른 BO 와 트랜잭션으로 주고받을** 준비를 하게 합니다. BDEF 에 정의한 모든 association 작업에 더 나은 런타임 구현이 붙습니다. BO 사이 모델링을 살피는 문법 검사와 오류 처리도 여기에 들어 있습니다.

association 마다 구현 타입을 `unmanaged` 로 따로 바꾸지 않았다면, association 작업은 모두 managed BO provider(제공자)가 처리하고 조율합니다. behavior pool(동작 풀)에 구현할 필요가 없습니다.

이 구문은 BDEF 머리말에 적습니다. RAP BO 전체에 기능을 켜기 때문입니다. BO 안의 entity(엔터티) 몇 개에만 켤 수는 없습니다.

같은 기능은 association 마다 적는 다른 구문으로도 얻을 수 있습니다. association 구현 타입 `managed` 를 쓰거나 [[abenbdl_association|association _assoc using TargetEntity {...}]] 를 쓰는 방법입니다.

### 쓸 수 있는 곳

- managed RAP BO
- projection BDEF 와 interface BDEF 에서는 따로 적지 않습니다. base BDEF(기반 BDEF) 머리말에 `with cross associations` 가 있으면, 다시 쓰는 모든 association 에 저절로 켜집니다.
- extension(확장) BDEF 에서는 base BDEF 가 이 구문을 썼는지와 상관없이 따로 적을 수 있습니다.

### association 쪽 구문과 맞물리는 방식

| association 구문 | `with cross associations` 가 있을 때 |
| --- | --- |
| `unmanaged association AssociationName;` ([[abenbdl_assoc_impl_type]]) | 이 association 만 unmanaged 로 돌립니다. 정의한 association 작업(표준·비표준 모두)의 구현 메서드를 behavior pool 에 직접 써야 합니다. |
| `association AssociationName { }` | 읽기가 열린 association 입니다. `unmanaged` 가 아니면 association 을 따라 읽기를 managed RAP BO provider 가 구현해 줍니다. |
| `association AssociationName { create; }` | 만들기가 열린 association 입니다. `unmanaged` 가 아니면 association 을 따라 만들기를 managed RAP BO provider 가 구현해 줍니다. |
| `inverse function` ([[abenbdl_inverse_funct]]) | 대상 쪽에서 풀리는 association(target-resolved association)에서 대상 인스턴스를 모두 가져올 때 쓰입니다. 이때 대상 entity 의 association 에 있는 `inverse function` 이 실행됩니다. `unmanaged` 가 아니면 behavior pool 에 구현하지 않아도 RAP BO consumer(사용자)가 쓸 수 있습니다. |
| `link action`, `unlink action` ([[abenbdl_link_unlink_action]]) | BO 사이 association 에서 출발 인스턴스와 대상 인스턴스를 잇고 끊습니다. `unmanaged` 가 아니면 behavior pool 에 구현하지 않아도 RAP BO consumer 가 쓸 수 있습니다. |

## 예제

여행 BO `ZR_Travel` 에서 다른 BO 인 여행사 `ZR_Agency` 로 가는 association `_Agency` 를 둡니다. 여행사 BO 는 late numbering 을 씁니다. 외래 키 `AgencyID` 는 출발 쪽인 여행에 있습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with cross associations;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID, AgencyID;

  association _Agency abbreviation Agency
  {
    create;
    link action linkAgency;
    unlink action unlinkAgency;
    inverse function getTravels;
  }
}
```

여행을 만들면서 association 을 따라 여행사도 함께 만듭니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid customerid )
      WITH VALUE #( ( %cid = 'TRAVEL_1' travelid = '00000002' customerid = '000042' ) )
    CREATE BY \_agency
      FIELDS ( name )
      WITH VALUE #( ( %cid_ref = 'TRAVEL_1'
                      %target  = VALUE #( ( %cid = 'AGENCY_1' name = '새 여행사' ) ) ) )
  FAILED DATA(ls_failed)
  MAPPED DATA(ls_mapped)
  REPORTED DATA(ls_reported).

" 저장 전: 여행의 %pid_Agency 에 여행사의 임시 키가 들어 있고 AgencyID 는 비어 있다
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000002' ) )
  RESULT DATA(lt_before).

COMMIT ENTITIES.

" 저장 후: AgencyID 에 여행사의 최종 키가 들어 있다
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000002' ) )
  RESULT DATA(lt_after).
```

일어나는 일은 이렇습니다.

1. association 을 따라 여행사를 만들면, 여행사의 임시 키 `%pid` 가 transactional buffer(트랜잭션 버퍼)에 있는 여행 인스턴스의 `%pid_Agency` 필드에 적힙니다.
2. `COMMIT ENTITIES` 를 하면 두 BO 의 저장 핸들러가 불립니다. 여행사 BO 의 저장 핸들러가 `adjust_numbers` 를 불러 최종 키를 정합니다.
3. 이어서 여행 BO 의 저장 핸들러가 `link action` 을 불러 외래 키 필드 `AgencyID` 를 최종 값으로 고칩니다.

association 작업을 맡는 handler method(핸들러 메서드)는 managed 런타임이 구현하고 조율합니다. 여행 BO 의 behavior pool 에는 association 작업을 구현하지 않았습니다. 다만 여행사 BO 는 late numbering 을 쓰므로, 최종 키를 정하는 saver method(세이버 메서드) `adjust_numbers` 는 여행사 BO 의 behavior pool 에 직접 구현해야 합니다. [[abenbdl_late_numbering]] 을 보세요.

## 알아두기

- `with cross associations` 는 가장 흔한 association 에서 트랜잭션 처리가 제대로 되게 하려면 있어야 합니다. 예를 들어 대상 entity 가 late numbering 을 쓰는 BO 사이 시나리오는 이 구문 없이는 돌지 않습니다.
- `inverse function` 은 출발 쪽에서 풀리는 association(source-resolved association)에만 선언할 수 있습니다.
- BO 사이 association 의 `link action` 과 `unlink action` 도 출발 쪽에서 풀리는 association 에만 선언할 수 있습니다.

## 관련 항목

- [[abenbdl_association]]
- [[abenbdl_assoc_impl_type]]
- [[abenbdl_inverse_funct]]
- [[abenbdl_link_unlink_action]]
- [[abenbdl_bdef_header]]
