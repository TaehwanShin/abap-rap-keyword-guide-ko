---
title: association 의 standard operation (create)
summary: read-by-association 과 create-by-association 을 여는 문법입니다. 중괄호 안에 create 를 적으면 연관 대상 인스턴스를 만들 수 있습니다.
keywords: StandardOperationsForAssoc, create-by-association, read-by-association, association create, 연관 관계로 생성, 연관 관계로 읽기, 표준 작업, CREATE BY, AUTO FILL CID, default function
---

## 문법

```syntax
...       {[ [internal] create
              [{(features:instance | features:global}]
              [,precheck]
              [,authorization:none]
              [,authorization:update]
              [,authorization:global]
              [,authorization:instance]);
              [{default function GetDefaultsFor_Assoc [external 'GetDefaultsForCBA'];}]
               ]}
```

## 설명

association 의 standard operation(표준 작업)은 association 의 소스에서 대상으로 가는 길을 따라 정해진 대로 움직이는 작업입니다. 두 가지가 있습니다.

- **read-by-association** : BDEF 에 association 을 적기만 하면 열립니다. 자세한 내용은 [[abenbdl_association]] 에 있습니다.
- **create-by-association** : 중괄호 안에 `create` 를 적으면 열립니다. RAP BO consumer(사용자)가 연관 대상 entity(엔터티)의 인스턴스를 새로 만들 수 있습니다.

생성을 여는 가장 짧은 모양은 `association _Assoc { create; }` 입니다.

### create-by-association 의 규칙

- 같은 BO 안의 association 에도, 다른 BO 로 가는 association 에도 정의할 수 있습니다.
- 연관 대상 entity 에 자기 behavior definition(동작 정의)가 있어야 합니다.
- 같은 BO 안에서는 자식으로 가는 association 에만 쓸 수 있습니다. to-parent association 에는 쓸 수 없습니다. 부모를 거쳐 자식을 만들 수는 있어도, 자식을 거쳐 부모를 만들 수는 없습니다.

### 추가 구문

- [[abenbdl_internal|internal]] : create-by-association 을 BO 안에서만 쓸 수 있게 합니다.
- [[abenbdl_actions_fc|features:instance]] : 인스턴스마다 켜고 끄는 feature control(기능 제어)를 겁니다.
- [[abenbdl_actions_fc|features:global]] : global feature control 을 겁니다.
- [[abenbdl_precheck|precheck]] : 변경 요청을 미리 점검해, 잘못된 변경이 transactional buffer(트랜잭션 버퍼)에 닿지 않게 합니다.
- [[abenbdl_actions_auth|authorization:none]] : [[abenbdl_authorization|권한 확인]]에서 뺍니다.
- [[abenbdl_actions_auth_update|authorization:update]] : 권한 확인을 수정(update) 작업에 구현한 권한 확인에 맡깁니다.
- [[abenbdl_actions_auth_global|authorization:global]] : global 권한 확인을 겁니다.
- [[abenbdl_actions_auth_instance|authorization:instance]] : instance 권한 확인을 겁니다.
- [[abenbdl_default_function|default function]] : create-by-association 에 쓸 default values function 을 정의합니다. 화면에서 필드 값이 미리 채워집니다.

### 어디에서 쓸 수 있나

- managed RAP BO : managed RAP BO provider(제공자)가 처리합니다.
- unmanaged RAP BO : behavior pool(동작 풀)의 handler method(핸들러 메서드) [[abaphandler_meth_modify|FOR MODIFY]] 에 직접 구현합니다.
- projection BDEF 와 RAP BO interface : base BDEF(기반 BDEF) 의 작업을 `use` 로 다시 씁니다. [[abenbdl_use_projection]] 참고.

## 예제

여행에서 예약을 만들 수 있게 엽니다. instance feature control 을 걸고, 권한 확인은 여행의 수정 권한에 맡깁니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  association _Booking { create ( features : instance, authorization : update ); }
}
```

RAP BO consumer 는 `CREATE BY` 로 여행 아래에 예약을 만듭니다. `AUTO FILL CID` 를 붙이면 `%cid` 를 직접 채우지 않아도 됩니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE BY \_booking
    AUTO FILL CID
    FIELDS ( bookingdate flightprice ) WITH VALUE #(
      ( travelid = '00000001'
        %target  = VALUE #( ( bookingdate = '20260301' flightprice = '350.00' )
                            ( bookingdate = '20260302' flightprice = '410.00' ) ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- managed RAP BO 에서 같은 BO 안의 create-by-association 은 **바로 아래 child entity(자식 엔터티)**에만 됩니다. 같은 구성 트리에 있더라도 root entity(루트 엔터티)보다 두 단계 이상 아래에 있는 entity 는 읽기는 열 수 있지만 생성은 열 수 없습니다. unmanaged RAP BO 에는 이 제약이 없습니다.
- create-by-association 할 때 [[abapmodify_entity_entities_fields|AUTO FILL CID]] 를 쓰면 BDEF derived type(BDEF 파생 타입)의 구성요소 [[abapderived_types_cid|%cid]] 가 자동으로 채워집니다.

## 관련 항목

- [[abenbdl_association]]
- [[abenbdl_assoc_nonstand_ops]]
- [[abenbdl_assoc_impl_type]]
- [[abenbdl_operations_additions]]
- [[abenbdl_default_function]]
- [[abenbdl_authorization]]
