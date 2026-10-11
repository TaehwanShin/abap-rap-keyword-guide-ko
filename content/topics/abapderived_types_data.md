---
title: 키와 데이터 필드 묶음 (%data)
summary: entity 의 기본 키 필드와 데이터 필드를 모두 묶은 구성요소 묶음입니다. 필드 이름 앞에 %data- 를 붙여도 되고 빼도 됩니다.
keywords: %data, 구성요소 묶음, 데이터 필드, 키 필드, %key, %control, %param, CREATE, UPDATE, READ RESULT, CHANGE, ABP_BEHV_FLAG
---

## 설명

`%data` 는 BDEF derived type(BDEF 파생 타입)의 구성요소 묶음입니다. RAP BO entity(엔터티)의 **기본 키 필드와 데이터 필드를 모두** 담습니다. 키 필드가 들어 있으니 `%key` 도 `%data` 안에 들어 있는 셈입니다.

필드를 적을 때 `%data-` 는 붙여도 되고 빼도 됩니다. 아래 두 줄은 같은 뜻입니다.

```abap
ls_travel-%data-agencyid = '070001'.
ls_travel-agencyid       = '070001'.
```

`%data = VALUE #( ... )` 처럼 필드 전체를 한 덩어리로 채울 수도 있습니다.

### 타입

`%data` 의 구성요소는 entity 필드의 원래 타입을 그대로 따릅니다. 다만 `%control` 안에서 쓰일 때는 구성요소 하나하나의 타입이 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `CREATE`
- `UPDATE`
- `READ RESULT`
- `CHANGE`

다음 구성요소 안에도 들어 있습니다.

- [[abapderived_types_control]]
- [[abapderived_types_param]]

## 예제

여행 두 건을 만듭니다. 첫째 줄은 `%data-` 를 필드마다 붙였고, 둘째 줄은 `%data` 를 `VALUE` 로 한 번에 채웠습니다. 이어서 이미 있는 여행 한 건을 수정할 때는 `%data-` 를 붙인 필드와 뺀 필드를 섞어 썼습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      ( %cid               = 'T1'
        %data-travelid     = '00000001'
        %data-agencyid     = '070001'
        %control-travelid  = if_abap_behv=>mk-on
        %control-agencyid  = if_abap_behv=>mk-on )
      ( %cid     = 'T2'
        %data    = VALUE #( travelid = '00000002'
                            agencyid = '070002' )
        %control = VALUE #( travelid = if_abap_behv=>mk-on
                            agencyid = if_abap_behv=>mk-on ) ) )
    UPDATE FROM VALUE #(
      " 이미 있는 여행을 고친다. %data- 를 붙인 필드와 뺀 필드를 섞어 써도 된다
      ( %data-travelid = '00000009'
        status         = 'A'
        %control       = VALUE #( status = if_abap_behv=>mk-on ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- `%data` 에는 데이터 필드만이 아니라 키 필드도 들어 있습니다. 위 예제의 `%data-travelid` 가 그렇습니다.
- `%control` 안에서도 같은 필드 이름이 나오지만, 거기서는 값이 아니라 표시(`ABP_BEHV_FLAG`)를 담습니다.

## 관련 항목

- [[abapderived_types_key]]
- [[abapderived_types_control]]
- [[abapderived_types_target]]
- [[abapderived_types_param]]
- [[abapderived_types_secondary_keys]]
- [[abenderived_types_data_abexa]]
