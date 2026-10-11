---
title: determine action
summary: 저장할 때 도는 determination 과 validation 을 묶어 두고, RAP BO consumer 가 원할 때 한꺼번에 실행하게 하는 action 입니다.
keywords: determine action, 결정 액션, determination, validation, always, extensible, 결정, 검증, on save, Prepare, EXECUTE
---

## 문법

```syntax
[internal] determine action
          [(authorization:none]
           |[authorization:update]
           |[authorization:global]
           |[authorization:instance)]
           DetermineActionName [external 'ExternalName'][extensible]
          {
           determination [(always)] MyDetermination1;
           determination [(always)] MyDetermination2;
           validation [(always)] MyValidation1;
           validation [(always)] MyValidation2;
           determination [(always)] Child~ChildDetermination;
           validation [(always)] Child~ChildValidation;
           ...
          }
```

## 설명

determine action 은 [[abenbdl_determinations|determination]] 과 [[abenbdl_validations|validation]] 을 **요청해서 실행**하게 해 줍니다. determine action 을 실행하면 거기에 넣어 둔 determination 과 validation 을 따져 보고, 그 가운데 실행 조건(trigger condition)이 맞는 것만 실행합니다.

### 무엇을 넣을 수 있나

- `on save` 로 정의한 determination 과 validation 을 넣습니다. `on modify` determination 은 넣을 수 없습니다.
- 중괄호 `{ }` 안에 적고 세미콜론(`;`)으로 나눕니다.
- determination 과 validation 을 하나도 넣지 않은 determine action 도 만들 수 있습니다.
- child entity(자식 엔터티)의 determination 과 validation 은 `Child~ChildDetermination`, `Child~ChildValidation` 처럼 적어 넣습니다. 다만 실행 조건에 `delete` 가 들어 있는 것은 넣을 수 없습니다.

### always

`( always )` 를 붙인 determination 이나 validation 은 실행 조건과 상관없이 실행됩니다. `always` 가 붙은 determination 이 한 번 실행된 뒤에도, 같은 determine action 에 든 다른 determination 이 그것을 다시 일으킬 수 있습니다.

### 실행 순서

determination 이 먼저, validation 이 나중입니다. determination 끼리, validation 끼리의 순서는 RAP 프레임워크가 정합니다. determine action 안에 적은 순서와는 상관없습니다.

### 추가 구문

- [[abenbdl_internal|internal]] : BO 구현 안에서만 부를 수 있게 합니다.
- [[abenbdl_actions_auth|authorization:none]] : [[abenbdl_authorization|권한 확인]]에서 뺍니다.
- [[abenbdl_actions_auth_update|authorization:update]] : 권한 확인을 수정(update) 작업에 구현한 권한 확인에 맡깁니다.
- [[abenbdl_actions_auth_global|authorization:global]] : authorization master entity(엔터티)에 정한 authorization control(권한 제어) 대신 global 권한 확인을 씁니다.
- [[abenbdl_actions_auth_instance|authorization:instance]] : authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 씁니다.
- [[abenbdl_external|external]] : 바깥에 보일 이름을 작은따옴표 안에 적습니다. base BDEF(기반 BDEF) 에서도, interface 와 projection 단계에서도 붙일 수 있습니다.
- [[abenbdl_extensible|extensible]] : BDEF extension(확장)에서 이 determine action 에 validation 이나 determination 을 더 넣을 수 있게 합니다.

### 어디에서 쓸 수 있나

- managed RAP BO : determine action 자체는 behavior pool(동작 풀)에 구현하지 않습니다. 안에 넣은 determination 과 validation 은 구현해야 합니다.
- draft 를 쓰는 unmanaged RAP BO : behavior pool 의 handler method(핸들러 메서드) [[abaphandler_meth_modify|FOR MODIFY ... ACTION]] 에 구현해야 합니다.
- draft 를 쓰지 않는 unmanaged RAP BO : 쓸 수 없습니다.
- projection BO 와 RAP BO interface : base BDEF 의 determine action 을 [[abenbdl_use_projection|use action]] 으로 다시 씁니다.

## 예제

여행의 determination 하나와 validation 하나, 예약의 determination 하나를 determine action `checkTravel` 로 묶습니다. determination 에는 `always` 를 붙여 실행 조건과 상관없이 돌게 합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  association _Booking { create; }

  determination setStatus on save { create; }
  validation validateDates on save { create; field BeginDate, EndDate; }

  determine action checkTravel
  {
    determination ( always ) setStatus;
    validation validateDates;
    determination ( always ) Booking~calcTotalPrice;
  }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID;
  association _Travel;

  determination calcTotalPrice on save { create; }
}
```

RAP BO consumer(사용자)는 보통 action 처럼 `EXECUTE` 로 부릅니다. 예를 들어 ABAP SQL 로 테이블에 바로 넣어서 determination 이 아직 돌지 않은 여행에 determination 을 돌릴 수 있습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE checktravel FROM VALUE #( ( travelid = '00000001' )
                                      ( travelid = '00000002' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).

" determination 이 채운 값을 데이터베이스에 저장한다
COMMIT ENTITIES.
```

## 알아두기

- `extensible` 은 RAP BO 가 extension 을 허용하고, draft 를 쓸 때만 붙일 수 있습니다. extension 을 여는 방법은 [[abenbdl_extensibility_enabling_m_u]] 에 있습니다.
- draft 쪽에서 같은 일을 하는 것은 draft determine action `Prepare` 입니다. [[abenbdl_draft_action]] 에서 설명합니다.

## 관련 항목

- [[abenbdl_determinations]]
- [[abenbdl_validations]]
- [[abenbdl_draft_action]]
- [[abenbdl_action]]
- [[abenbdl_operations_additions]]
- [[abenbdl_use_projection]]
- [[abaphandler_meth_modify]]
