---
title: 예제 - %data 와 %target 쓰기
summary: 한 EML 요청 안에서 %data 로 필드 값을 적는 여러 방식과, %target 으로 자식 인스턴스를 만드는 법을 보여 주는 예제입니다.
keywords: %data, %target, %cid, %cid_ref, %control, CREATE FROM, CREATE BY, UPDATE FROM, MODIFY ENTITIES, create by association, COMMIT ENTITIES, 예제
---

## 설명

managed([[abenbdl_impl_type]]) RAP BO 에서 [[abapderived_types_data]] 와 [[abapderived_types_target]] 을 쓰는 법을 보여 주는 예제입니다.

EML 변경 요청 하나에 작업 세 가지를 담습니다.

- 생성 : `%data` 를 두 가지 방식으로 적어 루트 인스턴스 두 개를 만듭니다.
- association 으로 하는 생성 : `%target` 에 자식 인스턴스를 적습니다.
- 수정 : `%data-` 를 붙인 필드와 뺀 필드를 섞어 적습니다.

데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티)입니다. BDEF 는 생성·수정·삭제와 association 으로 하는 생성만 정의한 단순한 managed 입니다. behavior pool(동작 풀)에는 이 예제와 관련된 구현이 없습니다.

## 예제

같은 흐름을 공통 예제 모델로 옮겼습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      " 방식 1: 필드마다 %data- 를 붙인다
      ( %cid               = 'T1'
        %data-travelid     = '00000001'
        %data-agencyid     = '070001'
        %control-travelid  = if_abap_behv=>mk-on
        %control-agencyid  = if_abap_behv=>mk-on )
      " 방식 2: %data 를 VALUE 로 한 번에 채운다
      ( %cid     = 'T2'
        %data    = VALUE #( travelid = '00000002'
                            agencyid = '070002' )
        %control = VALUE #( travelid = if_abap_behv=>mk-on
                            agencyid = if_abap_behv=>mk-on ) ) )
    CREATE BY \_booking FIELDS ( bookingid flightprice )
      WITH VALUE #(
        ( %cid_ref = 'T1'
          %target  = VALUE #(
            ( %cid  = 'B1'
              %data = VALUE #( bookingid = '0001' flightprice = 500 ) ) ) )
        ( %cid_ref = 'T2'
          %target  = VALUE #(
            ( %cid  = 'B2'
              %data = VALUE #( bookingid = '0001' flightprice = 700 ) ) ) ) )
    UPDATE FROM VALUE #(
      " %data- 를 붙인 필드와 뺀 필드를 섞어 써도 된다
      ( %data-travelid = '00000001'
        %data-agencyid = '079999'
        customerid     = '000099'
        %control       = VALUE #( agencyid   = if_abap_behv=>mk-on
                                  customerid = if_abap_behv=>mk-off ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

### 실행 결과

- 생성 : 루트 인스턴스 두 개를 만듭니다. 첫째 인스턴스는 구조 구성요소 선택자(`-`)로 키 필드와 데이터 필드를 `%data-` 뒤에 하나씩 적습니다. 둘째 인스턴스는 `VALUE` 연산자로 `%data` 를 한 번에 채웁니다. `%data` 는 원래 생략할 수 있어서, 필드 이름만 바로 적어도 됩니다.
- association 으로 하는 생성 : `%target` 이 중심입니다. 자식 인스턴스 두 개를 만듭니다. 부모인 루트 인스턴스는 [[abapderived_types_cid_ref]] 로 가리킵니다. `%target` 안에서 만들 자식 인스턴스의 키 필드와 데이터 필드도 `%data` 로 적었는데, 여기서도 `%data` 는 생략할 수 있습니다.
- 수정 : 키 필드와 데이터 필드를 가리킬 때 `%data` 를 써도 되고 안 써도 된다는 점만 보여 줍니다.

`COMMIT ENTITIES`([[abapcommit_entities]])로 저장한 뒤, root entity 와 child entity 의 데이터베이스 테이블 내용을 출력합니다.

## 알아두기

- 이 예제의 세 작업 모두에서 `%data` 는 생략할 수 있습니다. `%data` 없이 필드 이름만 적어도 됩니다.
- 생성과 수정은 `FROM` 을 썼으므로 `%control` 을 직접 적었습니다. association 생성은 `FIELDS ( ... ) WITH` 를 써서 적지 않았습니다.

## 관련 항목

- [[abapderived_types_data]]
- [[abapderived_types_target]]
- [[abapderived_types_control]]
- [[abapderived_types_cid_ref]]
- [[abenderived_types_control_abexa]]
- [[abenderived_types_cid_cidref_abexa]]
- [[abapcommit_entities]]
