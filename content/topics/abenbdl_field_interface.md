---
title: interface BDEF 의 field characteristics (field)
summary: interface BDEF 는 base BO 의 field characteristics 를 모두 물려받고, readonly·mandatory:create·readonly:update·suppress 네 가지를 더 보탤 수 있습니다.
keywords: field, 필드 특성, field characteristics, 인터페이스 BDEF, interface, readonly, mandatory:create, readonly:update, suppress, 상속, 필드 제어
---

## 문법

```syntax
... field(readonly) Field1, Field2, ...;
  | field(mandatory:create) Field1, Field2, ...;
  | field(readonly:update) Field1, Field2, ...;
  | field(suppress) Field1, Field2, ...;
```

## 설명

interface BDEF 는 base BO(기반 BO) 의 field characteristics(필드 특성)을 **모두 저절로** 물려받습니다. 여기에 field characteristics 를 더 보탤 수 있습니다.

interface 계층에서 보탠 속성은 기반 계층의 속성에 **더해집니다**. 그래서 두 계층의 속성이 서로 어긋나면 안 됩니다.

- base BDEF(기반 BDEF) 가 어떤 필드를 `mandatory:create` 로 정했다면, interface 는 같은 필드에 `readonly:update` 를 보탤 수 있습니다.
- base BDEF 가 어떤 필드를 `mandatory` 로 정했다면, interface 는 같은 필드를 `readonly` 로 정할 수 없습니다. 문법 오류가 납니다.

interface BDEF 에서 쓸 수 있는 field characteristics 는 네 가지입니다. 각각 어떻게 동작하는지는 [[abenbdl_field_char]] 에 나와 있습니다.

- `readonly`
- `mandatory:create`
- `readonly:update`
- `suppress`

managed 나 unmanaged RAP BO 에서는 field characteristics 를 여러 개 함께 적을 수 있습니다. interface BDEF 에서 함께 적을 수 있는 조합은 `mandatory:create, readonly:update` **하나뿐**입니다.

필드 여러 개에 같은 속성을 줄 때는 쉼표로 나열합니다. 예) `field ( readonly ) Field1, Field2, Field3;`

## 예제

base BDEF 입니다. 키는 프레임워크가 번호를 매기고, `CustomerID` 는 필수입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  field ( numbering : managed, readonly ) TravelUUID;
  field ( mandatory ) CustomerID;
}
```

interface BDEF 는 위 속성을 그대로 물려받고, 속성을 더 보탭니다.

```bdl
interface;

define behavior for ZI_Travel alias Travel
{
  use create;
  use update;
  use delete;

  // 만들 때는 꼭 넣어야 하고, 만든 뒤에는 고칠 수 없다
  field ( readonly : update, mandatory : create ) AgencyID;

  // BDEF derived type 에서 뺀다
  field ( suppress ) LastChangedAt;
}
```

interface 로 인스턴스를 만들어 봅니다.

```abap
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid ) WITH VALUE #(
      ( %cid = '1' agencyid = '070001' customerid = '000001' )
      ( %cid = '2' agencyid = '070002' customerid = '000002' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

키 `TravelUUID` 에 값을 주지 않았지만 저장된 인스턴스에는 키가 들어 있습니다. base BDEF 의 `numbering : managed` 를 interface 가 물려받았기 때문입니다. `suppress` 로 뺀 `LastChangedAt` 은 `ZI_Travel` 의 BDEF derived type(BDEF 파생 타입)에 구성요소로 나타나지 않습니다.

## 알아두기

- 기반 계층의 속성과 어긋나는 속성을 보태면 문법 오류가 납니다.
- 위 네 가지 말고 다른 field characteristics 는 interface BDEF 에서 새로 줄 수 없습니다.

## 관련 항목

- [[abenbdl_field_char]]
- [[abenbdl_body_interface]]
- [[abenbdl_define_beh_interface]]
- [[abenbdl_field_projection]]
