---
title: 연관 대상 인스턴스 (%target)
summary: association 으로 인스턴스를 만들 때, 만들 대상(자식) 인스턴스를 담는 테이블형 구성요소입니다.
keywords: %target, 연관 대상, create by association, CREATE BY, 구성 관계, composition, 자식 엔터티, %cid, %cid_ref, %key, %data, %control
---

## 설명

`%target` 은 BDEF derived type(BDEF 파생 타입)에 들어 있는 **테이블형** 구성요소입니다. composition 의 대상, 예를 들어 child entity(자식 엔터티)를 가리킬 때 씁니다. `%target` 의 구성요소는 대상 entity(엔터티)의 기본 키 필드와 데이터 필드로 이루어집니다.

association 으로 하는 생성(create-by-association)에서 한 줄은 이렇게 짜입니다.

- 바깥쪽 : 부모 인스턴스를 가리킵니다. 키나 [[abapderived_types_cid_ref]] 로 적습니다.
- `%target` : 그 부모 아래에 만들 자식 인스턴스를 줄마다 하나씩 적습니다. 테이블이므로 한 부모에 자식을 여럿 넣을 수 있습니다.

### 타입

표준 테이블입니다. 구성요소는 `%cid`, `%key`, `%data`, `%control` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `CREATE` (association 으로 하는 생성)

## 예제

여행 하나를 만들고, 같은 요청 안에서 그 여행에 예약 두 건을 답니다. 부모는 `%cid_ref` 로 가리키고, 자식은 `%target` 에 넣습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid customerid )
      WITH VALUE #(
        ( %cid       = 'T1'
          travelid   = '00000001'
          agencyid   = '070001'
          customerid = '000010' ) )
    CREATE BY \_booking FIELDS ( bookingid flightprice )
      WITH VALUE #(
        ( %cid_ref = 'T1'              " 방금 만든 여행
          %target  = VALUE #(
            ( %cid        = 'B1'
              bookingid   = '0001'
              flightprice = 500 )
            ( %cid        = 'B2'
              " %data 를 거쳐 적어도 된다
              %data       = VALUE #( bookingid   = '0002'
                                     flightprice = 700 ) ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- `%target` 안의 줄에도 `%cid` 를 줄 수 있습니다. 위 예제의 `B1`, `B2` 가 그렇습니다.
- `%target` 안에도 [[abapderived_types_control]] 이 있습니다. `FIELDS ( ... ) WITH` 를 쓰면 저절로 채워집니다.

## 관련 항목

- [[abapderived_types_data]]
- [[abapderived_types_control]]
- [[abapderived_types_cid]]
- [[abapderived_types_cid_ref]]
- [[abapmodify_entity_entities_op]]
- [[abenderived_types_data_abexa]]
