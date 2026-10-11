---
title: 외부 entity (foreign entity)
summary: 지금 RAP BO 의 구성 트리에 들지 않는 entity 를 응답 구조에 넣어, 다른 BO 가 돌려준 메시지를 옮겨 담을 수 있게 하는 구문입니다.
keywords: foreign entity, 외부 엔터티, 다른 BO 메시지, message mapping, 메시지 매핑, map_messages, reported, 응답 구조, alias, without response
---

## 문법

```syntax
...
foreign entity ForeignEntityName [alias AliasName];
 ...
```

## 설명

지금 RAP BO 의 CDS 구성 트리에 들지 않는 RAP BO entity(엔터티)를 [[abapeml_response|응답 구조]]의 한 부분으로 넣습니다. 이렇게 하면 다른 BO 의 메시지를 옮겨 담을 수 있습니다(메시지 mapping).

- BDEF 머리말에 적습니다. 그래서 지금 RAP BO 의 **모든 노드**의 응답 구조에 들어갑니다.
- 응답 구조에 들어가는 것은 적어 준 entity `ForeignEntityName` 하나입니다. 그 entity 가 속한 RAP BO 전체가 들어가는 것은 아닙니다.
- 필요하면 외부 entity 를 여러 개 적을 수 있습니다.
- `alias AliasName` 으로 별칭을 붙일 수 있습니다. 별칭은 30자를 넘을 수 없습니다.

### 언제 쓰나

determination 이 다른 business object(비즈니스 객체)의 작업을 일으키고, 그 작업이 메시지를 돌려주는 경우를 생각하면 됩니다. 다른 BO 의 메시지를 받아 내 BO 에 맞게 고쳐 담으려면, 그 BO 의 entity 를 외부 entity 로 등록합니다. 메시지는 save sequence(저장 순서) 안에서 옮겨 담깁니다.

saver method(세이버 메서드) [[abensaver_map_messages|map_messages]] 를 behavior pool(동작 풀)에 다시 구현하는 것은 선택입니다.

### 쓸 수 있는 곳

- managed RAP BO
- unmanaged RAP BO
- projection BDEF
- interface BDEF

## 예제

여행 BO 가 고객 BO 의 entity `ZI_Customer` 를 외부 entity 로 등록합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
// map_messages 로 고객 BO 의 메시지를 옮겨 담을 수 있게 한다
foreign entity ZI_Customer;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;
}
```

이 BO 에 EML 로 접근하면, 응답 구조 `reported` 에 여행 entity 뿐 아니라 외부 entity `ZI_Customer` 의 자리도 함께 들어 있습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid ) WITH VALUE #(
      ( %cid = '1' travelid = '00000001' )
      ( %cid = '2' travelid = '00000002' ) )
  MAPPED   FINAL(ls_mapped)
  FAILED   FINAL(ls_failed)
  REPORTED FINAL(ls_reported).   " 외부 entity 의 구성요소도 들어 있다

COMMIT ENTITIES.
```

## 알아두기

- BDEF 에 다른 BO 로 가는 association 이 있으면, 그 연관 대상은 적지 않아도 외부 entity 로 응답 타입에 들어갑니다. 이 기본 동작을 끄려면 association 에 [[abenbdl_association|without response]] 를 붙입니다.

## 관련 항목

- [[abensaver_map_messages]]
- [[abenabp_map_messages_abexa]]
- [[abapeml_response]]
- [[abenbdl_association]]
- [[abenbdl_bdef_header]]
