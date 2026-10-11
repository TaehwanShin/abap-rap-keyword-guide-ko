---
title: 예제 - %control 쓰기
summary: CREATE FROM 과 UPDATE FROM 에서 %control 을 한꺼번에 주는 법과 줄마다 주는 법, 그리고 표시를 끈 필드가 어떻게 되는지 보여 주는 예제입니다.
keywords: %control, CREATE FROM, UPDATE FROM, FIELDS WITH, mk-on, mk-off, if_abap_behv=>mk, MODIFY ENTITIES, CREATE BY, COMMIT ENTITIES, 필드 표시, 예제
---

## 설명

managed([[abenbdl_impl_type]]) RAP BO 에서 [[abapderived_types_control]] 을 쓰는 법을 보여 주는 예제입니다. `%control` 을 적는 세 가지 방식을 견줍니다.

- `VALUE` 안에서 첫 번째 줄 괄호 앞에 한 번만 적어 모든 줄에 적용하기
- 줄마다, 필드마다 따로 적기
- 줄마다 `%control = VALUE #( ... )` 로 한 번에 적기

데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티)입니다. BDEF 는 생성·수정·삭제와 association 으로 하는 생성만 정의한 단순한 managed 입니다. behavior pool(동작 풀)에는 이 예제와 관련된 구현이 없습니다.

## 예제

같은 흐름을 공통 예제 모델로 옮겼습니다. 첫 번째 요청은 모든 줄에 같은 `%control` 을 줍니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      " 첫 줄 괄호 앞에 적으면 아래 모든 줄에 적용된다
      %control-travelid   = if_abap_behv=>mk-on
      %control-agencyid   = if_abap_behv=>mk-on
      %control-customerid = if_abap_behv=>mk-on
      ( %cid = 'T1' travelid = '00000001' agencyid = '070001' customerid = '000010' )
      ( %cid = 'T2' travelid = '00000002' agencyid = '070002' customerid = '000020' ) )
    " FIELDS ( ... ) WITH 는 %control 을 저절로 켠다
    CREATE BY \_booking FIELDS ( bookingid flightprice )
      WITH VALUE #(
        ( %cid_ref = 'T1'
          %target  = VALUE #( ( %cid = 'B1' bookingid = '0001' flightprice = 500 ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

두 번째 요청은 줄마다 `%control` 을 따로 적고, 일부 필드는 일부러 표시를 끕니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      ( %cid       = 'T3'
        travelid   = '00000003'  %control-travelid   = if_abap_behv=>mk-on
        agencyid   = '070003'    %control-agencyid   = if_abap_behv=>mk-on
        " 값은 적었지만 표시를 껐다
        customerid = '000030'    %control-customerid = if_abap_behv=>mk-off ) )
    UPDATE FROM VALUE #(
      ( travelid   = '00000001'
        agencyid   = '079999'
        customerid = '000099'
        " agencyid 만 반영된다
        %control   = VALUE #( agencyid   = if_abap_behv=>mk-on
                              customerid = if_abap_behv=>mk-off ) ) )
  MAPPED DATA(ls_mapped2)
  FAILED DATA(ls_failed2)
  REPORTED DATA(ls_reported2).

COMMIT ENTITIES.
```

### 실행 결과

- 첫 번째 요청 : 생성과 association 생성을 합니다. 생성은 `VALUE` 연산자로 내부 테이블을 지어 넘기는데, 첫 번째 괄호 앞에 `%control` 을 적어 모든 인스턴스의 모든 필드에 표시를 켭니다. association 생성에는 `%control` 을 적지 않아도 됩니다. `FIELDS ( ... ) WITH`([[abapmodify_entity_entities_fields]])가 `%control` 을 저절로 켜기 때문입니다. `COMMIT ENTITIES`([[abapcommit_entities]])로 저장합니다.
- 두 번째 요청 : 생성과 수정을 합니다. 생성에서는 인스턴스의 필드마다 `%control` 을 따로 적고, 몇몇 필드는 일부러 표시를 끕니다. 수정도 마찬가지인데, 이번에는 `VALUE` 연산자로 `%control` 을 적습니다. `COMMIT ENTITIES` 로 저장합니다.

출력에는 root entity 와 child entity 의 데이터베이스 테이블 내용이 나옵니다. 표시를 끈 필드는 값을 적었어도 반영되지 않은 것을 확인할 수 있습니다.

## 알아두기

- `FROM` 을 쓰는 생성·수정에서는 `%control` 을 반드시 직접 적어야 합니다.
- 표시 값은 `if_abap_behv=>mk-on` 과 `if_abap_behv=>mk-off` 로 줍니다. `'X'` 는 통하지 않습니다.

## 관련 항목

- [[abapderived_types_control]]
- [[abapmodify_entity_entities_fields]]
- [[abapmodify_entity_entities_op]]
- [[abapeml_derived_type_flags]]
- [[abenderived_types_data_abexa]]
- [[abapcommit_entities]]
