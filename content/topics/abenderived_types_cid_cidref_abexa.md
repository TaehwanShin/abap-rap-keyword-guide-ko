---
title: 예제 - %cid 와 %cid_ref 쓰기
summary: 한 EML 요청 안에서 %cid 로 새 인스턴스에 이름을 붙이고 %cid_ref 로 다시 가리켜 자식 생성·수정·삭제까지 하는 예제입니다. AUTO FILL CID 도 다룹니다.
keywords: %cid, %cid_ref, content ID, 내용 ID, AUTO FILL CID, MODIFY ENTITIES, CREATE, CREATE BY, UPDATE, DELETE, mapped, COMMIT ENTITIES, 예제
---

## 설명

managed([[abenbdl_impl_type]]) RAP BO 에서 `%cid` 와 `%cid_ref` 를 쓰는 법을 보여 주는 예제입니다. 생성 작업에 붙이는 추가 구문 `AUTO FILL CID`([[abapmodify_entity_entities_fields]])도 함께 다룹니다.

- [[abapderived_types_cid]] : 새로 만드는 인스턴스에 직접 정한 내용 ID(content ID)를 붙입니다.
- [[abapderived_types_cid_ref]] : 같은 요청 안에서 그 내용 ID 로 방금 만든 인스턴스를 다시 가리킵니다.

데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티)입니다. BDEF 는 생성·수정·삭제와 association 으로 하는 생성만 정의한 단순한 managed 입니다. behavior pool(동작 풀)에는 이 예제와 관련된 구현이 없습니다.

## 예제

같은 흐름을 공통 예제 모델로 옮겼습니다. 한 요청 안에서 여행 네 건을 만들고, 그 가운데 둘에 예약을 달고, 하나는 고치고, 하나는 지웁니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid status )
      WITH VALUE #(
        ( %cid = 'T1' travelid = '00000001' agencyid = '070001' status = 'N' )
        ( %cid = 'T2' travelid = '00000002' agencyid = '070002' status = 'N' )
        ( %cid = 'T3' travelid = '00000003' agencyid = '070003' status = 'N' )
        ( %cid = 'T4' travelid = '00000004' agencyid = '070004' status = 'N' ) )
    " 방금 만든 여행에 예약을 단다
    CREATE BY \_booking FIELDS ( bookingid flightprice )
      WITH VALUE #(
        ( %cid_ref = 'T1'
          %target  = VALUE #( ( %cid = 'B1' bookingid = '0001' flightprice = 500 ) ) )
        ( %cid_ref = 'T2'
          %target  = VALUE #( ( %cid = 'B2' bookingid = '0001' flightprice = 700 ) ) ) )
    " 방금 만든 여행을 고친다
    UPDATE FIELDS ( status )
      WITH VALUE #( ( %cid_ref = 'T3' status = 'A' ) )
    " 방금 만든 여행을 지운다
    DELETE FROM VALUE #( ( %cid_ref = 'T4' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

`AUTO FILL CID` 를 붙이면 `%cid` 를 직접 적지 않아도 됩니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE AUTO FILL CID FIELDS ( travelid agencyid )
      WITH VALUE #(
        ( travelid = '00000005' agencyid = '070005' )
        ( travelid = '00000006' agencyid = '070006' ) )
    " 이미 저장된 여행 3번에 예약을 단다. 부모는 키로 가리킨다
    CREATE BY \_booking AUTO FILL CID FIELDS ( bookingid flightprice )
      WITH VALUE #(
        ( travelid = '00000003'
          %target  = VALUE #( ( bookingid = '0001' flightprice = 300 ) ) ) )
  MAPPED DATA(ls_mapped2)
  FAILED DATA(ls_failed2)
  REPORTED DATA(ls_reported2).

COMMIT ENTITIES.
```

### 실행 결과

- 첫 번째 요청 : 생성 작업에서 인스턴스마다 `%cid` 를 직접 붙입니다. 같은 요청의 association 생성은 `%cid_ref` 로 방금 만든 루트 인스턴스를 가리켜 자식 인스턴스를 만듭니다. 이어지는 수정과 삭제도 `%cid_ref` 로 방금 만든 인스턴스를 가리킵니다. `COMMIT ENTITIES`([[abapcommit_entities]])로 저장한 뒤 데이터베이스 테이블 내용과 루트·child entity 의 `mapped` 응답을 출력합니다. `mapped` 를 보면 `%cid` 와 키가 어떻게 짝지어졌는지 알 수 있습니다.
- 두 번째 요청 : 생성과 association 생성에 `AUTO FILL CID` 를 붙입니다. `%cid` 가 저절로 채워집니다. 저장한 뒤 데이터베이스 테이블 내용(첫 번째 요청에서 넣은 것 포함)과 루트·child entity 의 `mapped` 응답을 출력합니다.

## 알아두기

- 자식 인스턴스에도 `%cid` 를 붙였지만(`B1`, `B2`), 이 예제에서 그 이름을 다시 가리키지는 않습니다.
- association 생성뿐 아니라 수정과 삭제에서도, 키 대신 `%cid_ref` 로 방금 만든 인스턴스를 가리킵니다.

## 관련 항목

- [[abapderived_types_cid]]
- [[abapderived_types_cid_ref]]
- [[abapderived_types_target]]
- [[abapmodify_entity_entities_fields]]
- [[abapmodify_entity_entities_op]]
- [[abapcommit_entities]]
