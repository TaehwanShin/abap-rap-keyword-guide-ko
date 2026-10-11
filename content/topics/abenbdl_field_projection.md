---
title: projection BDEF 의 field characteristics (field)
summary: projection BDEF 는 base BDEF 의 field characteristics 를 모두 물려받고, base BDEF 가 속성을 주지 않은 필드에만 구현이 필요 없는 속성 네 가지를 보탤 수 있습니다.
keywords: field, 필드 특성, field characteristics, 프로젝션 BDEF, projection, readonly, mandatory:create, readonly:update, suppress, 상속, numbering:managed, features:instance, 필드 제어
---

## 문법

```syntax
... field(readonly) Field1, Field2, ...;
  | field(mandatory:create) Field1, Field2, ...;
  | field(readonly:update) Field1, Field2, ...;
  | field(suppress) Field1, Field2, ...;
```

## 설명

projection BDEF 는 base BDEF(기반 BDEF) 의 field characteristics(필드 특성, [[abenbdl_field_char]])을 **모두 저절로** 물려받습니다.

projection 계층에서 field characteristics 를 새로 보탤 수도 있습니다. 조건이 두 가지 있습니다.

- behavior pool(동작 풀)에 구현이 필요 없는 속성이어야 합니다.
- base BDEF 가 그 필드에 **아무 속성도 주지 않았어야** 합니다.

base BDEF 에 이미 필드 제어가 정해진 필드에는 projection BDEF 가 다른 속성을 줄 수 없습니다. 주려고 하면 문법 오류가 납니다.

projection BDEF 에서 새로 보탤 수 있는 속성은 네 가지입니다. 각각 어떻게 동작하는지는 [[abenbdl_field_char]] 에 나와 있습니다.

- `readonly`
- `mandatory:create`
- `readonly:update`
- `suppress`

managed 나 unmanaged RAP BO 에서는 field characteristics 를 여러 개 함께 적을 수 있습니다. projection BDEF 에서 함께 적을 수 있는 조합은 `mandatory:create, readonly:update` **하나뿐**입니다.

필드 여러 개에 같은 속성을 줄 때는 쉼표로 나열합니다. 예) `field ( readonly ) Field1, Field2, Field3;`

## 예제

base BDEF `ZR_Travel` 은 키 `TravelUUID` 에 `numbering : managed` 를 걸어 두었다고 봅니다. projection 은 그 속성을 물려받고, base BDEF 가 속성을 주지 않은 필드에 속성을 보탭니다.

```bdl
projection;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;

  // projection 에서는 읽기만 한다
  field ( readonly ) TotalPrice;

  // 만들 때는 꼭 넣어야 하고, 만든 뒤에는 고칠 수 없다
  field ( mandatory : create, readonly : update ) AgencyID;
}
```

projection 으로 인스턴스를 만들어 봅니다.

```abap
MODIFY ENTITIES OF zc_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid ) WITH VALUE #(
      ( %cid = '1' agencyid = '070001' customerid = '000001' )
      ( %cid = '2' agencyid = '070002' customerid = '000002' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

키 `TravelUUID` 에 값을 주지 않았지만 저장된 인스턴스에는 키가 채워져 있습니다. base BDEF 의 numbering 을 projection 이 물려받았기 때문입니다.

## 알아두기

- 프레임워크가 번호를 매기는 `numbering:managed` ([[abenbdl_field_numbering]])는 물려받기만 합니다. projection BDEF 에서 새로 정의할 수 없습니다.
- 구현이 필요한 field characteristics 는 projection 계층에서 보통 필드에 보탤 수 없습니다. 지금은 `features:instance` 가 여기에 해당합니다. 다만 augment 한 필드에는 줄 수 있습니다. [[abenbdl_field_augment]] 를 봅니다.
- 화면(UI)에서는 field characteristics 가 RAP 사용자 힌트(consumer hint)로 나타납니다.
- interface BDEF 와 다른 점이 있습니다. interface 는 기반 계층의 속성과 어긋나지 않으면 같은 필드에 속성을 더할 수 있습니다([[abenbdl_field_interface]]). projection 은 base BDEF 가 속성을 준 필드에는 아예 보탤 수 없습니다.

## 관련 항목

- [[abenbdl_field_char]]
- [[abenbdl_body_projection]]
- [[abenbdl_field_augment]]
- [[abenbdl_field_numbering]]
- [[abenbdl_field_interface]]
