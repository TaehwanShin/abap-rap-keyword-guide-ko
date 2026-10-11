---
title: link action 과 unlink action
summary: 외래 키 association 에서 소스 인스턴스의 외래 키를 채워 대상과 잇거나, 외래 키를 비워 끊는 미리 정해진 action 입니다.
keywords: link action, unlink action, 링크 액션, 언링크 액션, 연결, 연결 끊기, 외래 키, foreign key, association, 연관 관계, 비표준 작업, 계층
---

## 문법

```syntax
...{   [internal]
       {[link action mylinkaction]
       [unlink action myunlinkaction]}
       [(
       [features: {instance |global}]
       [precheck]
       [authorization:none]
       [authorization:update]
        )];
    }
```

## 설명

### link action

link action 은 외래 키 association 에 정의하는 instance action 입니다. association 의 소스 인스턴스와 대상 인스턴스를 짝지어 입력으로 받고, 둘을 그 association 으로 잇습니다. 실제로 하는 일은 **소스 entity(엔터티)의 외래 키를, 넘겨받은 대상 인스턴스의 값으로 바꾸는 것**입니다.

- 생성이나 수정 작업으로 외래 키를 넣는 방법으로는 인스턴스 사이의 외래 키 관계를 맺을 수 없을 때 필요합니다.
- 계층 구조에서는 인스턴스의 외래 키를 바꿔 트리 순서를 바꾸는 데 쓸 수 있습니다.

### unlink action

unlink action 은 앞서 맺어 둔 외래 키 관계를 끊습니다. entity 의 외래 키 필드를 초기값으로 되돌려 소스와 대상 사이의 관계를 없앱니다.

- 외래 키를 저장하는 entity 의 association 에 정의합니다.
- link action 과 같은 상황에서 씁니다.

### 추가 구문

- [[abenbdl_internal|internal]] : BO 안에서만 부를 수 있게 합니다.
- [[abenbdl_actions_fc|features: instance]] : 인스턴스마다 켜고 끄는 feature control(기능 제어)를 겁니다.
- [[abenbdl_actions_fc|features: global]] : global feature control 을 겁니다.
- [[abenbdl_precheck|precheck]] : 변경 요청을 미리 점검해, 잘못된 변경이 transactional buffer(트랜잭션 버퍼)에 닿지 않게 합니다.
- [[abenbdl_actions_auth|authorization:none]] : [[abenbdl_authorization|권한 확인]]에서 뺍니다.
- [[abenbdl_actions_auth_update|authorization:update]] : 권한 확인을 수정(update) 작업에 구현한 권한 확인에 맡깁니다.

### 어디에서 쓸 수 있나

- managed RAP BO : managed RAP BO provider(제공자)가 모두 처리하므로 behavior pool(동작 풀)이 필요 없습니다. 다만 association 이 `unmanaged` 면 직접 구현합니다.
- unmanaged RAP BO : behavior pool 의 handler method(핸들러 메서드) [[abaphandler_meth_modify|FOR MODIFY]] 에 구현해야 합니다. association 이 `managed` 면 누가 처리하는지가 association 종류에 따라 갈립니다. 대상 해석 association 은 managed RAP BO provider 가 처리합니다. 소스 해석 association 은 active(활성) 인스턴스의 작업을 직접 구현해야 하고, draft 를 쓰는 BO 의 draft 인스턴스만 provider 가 처리합니다. [[abenbdl_assoc_impl_type]] 참고.
- projection BDEF 와 RAP BO interface : base BDEF(기반 BDEF) 의 것을 다시 씁니다. association 에 `use` 를 쓰고 그 안에 작업을 다시 나열합니다. [[abenbdl_use_projection]] 참고.

## 예제

여행(`ZR_Travel`)과 여행사(`ZR_Agency`)는 서로 다른 BO 입니다. 여행의 `AgencyID` 가 외래 키이고, association `_Agency` 가 이 필드로 여행사를 가리킵니다.

```cds
define root view entity ZR_Travel
  as select from ztravel
  association [0..1] to ZR_Agency as _Agency
    on $projection.AgencyID = _Agency.AgencyID
{
  key travel_id as TravelID,
      agency_id as AgencyID,
      _Agency
}
```

여행의 BDEF 에서 `_Agency` 에 link action 과 unlink action 을 붙입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with cross associations;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  field ( readonly : update ) AgencyID;

  association _Agency
  {
    link action linkAgency;
    unlink action unlinkAgency;
  }
}
```

link action 은 소스의 키와, `%param` 에 담은 대상의 키로 부릅니다. 실행하고 나면 여행 `00000001` 의 `AgencyID` 가 `070002` 로 바뀝니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE linkagency FROM VALUE #(
      ( travelid        = '00000001'
        %param-agencyid = '070002' ) ).
COMMIT ENTITIES.
```

unlink action 은 소스의 키만 넘깁니다. 실행하고 나면 여행 `00000001` 의 `AgencyID` 가 비어, 여행사와 이어진 것이 끊깁니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE unlinkagency FROM VALUE #( ( travelid = '00000001' ) ).
COMMIT ENTITIES.
```

## 알아두기

- 쓸 수 있는 권한 추가 구문은 `authorization:none` 과 `authorization:update` 둘뿐입니다. 문법 틀에 `authorization:global`, `authorization:instance` 는 없습니다.

## 관련 항목

- [[abenbdl_assoc_nonstand_ops]]
- [[abenbdl_inverse_funct]]
- [[abenbdl_association]]
- [[abenbdl_assoc_impl_type]]
- [[abenbdl_operations_additions]]
- [[abenbdl_use_projection]]
