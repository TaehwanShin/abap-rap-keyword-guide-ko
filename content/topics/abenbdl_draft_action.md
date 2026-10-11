---
title: draft action
summary: draft 를 쓰는 RAP BO 에서 draft 를 만들고, 활성화하고, 버리는 등 draft 테이블의 데이터를 다루는 미리 정해진 action 입니다.
keywords: draft action, 초안 액션, Edit, Activate, optimized, Discard, Resume, Prepare, draft determine action, AdditionalSave, Share, with additional implementation, 초안, 활성화
---

## 문법

```syntax
[internal] draft action
           {[([authorization:none][,features: instance])]
           [Edit [with additional implementation];]}
         | [Activate [optimized] [with additional implementation];]
         | [Discard [with additional implementation];]
         | [Resume [with additional implementation];]
         | [draft determine action Prepare [extensible]
              {
               determination [(always)] DetName;
               validation [(always)] ValName;
               ...
              }]
         | [AdditionalSave;]
         | [Share;]
```

## 설명

draft action 은 **draft 를 쓰는 RAP BO 에만** 있습니다. draft 테이블의 데이터를 다룹니다.

- 선언하는 자리는 `lock master` 로 정의한 lock master entity(엔터티)뿐입니다. draft action 은 BO 에서 함께 잠기는 하위 트리 전체에 걸리기 때문입니다.
- 어떤 경우든 RAP 프레임워크가 처리합니다. behavior pool(동작 풀)에 구현할 필요가 없습니다. BO 가 draft 를 쓰기 시작하면 draft 의 생애 주기는 RAP draft 런타임이 맡습니다. draft 인스턴스를 만들고, 고치고, 저장하는 일을 개발자가 구현하지 않습니다.
- 일부 draft action 에는 `with additional implementation` 을 붙여 behavior pool 에 처리를 덧붙일 수 있습니다.

### draft action 의 종류

| action | 하는 일 |
| --- | --- |
| `Edit` | active(활성) 인스턴스를 draft 테이블로 복사합니다. |
| `Activate` | `Edit` 의 반대입니다. draft 테이블의 내용을 persistent table 로 복사하고 draft 테이블을 비웁니다. |
| `Discard` | draft 인스턴스를 draft 테이블에서 지웁니다. |
| `Resume` | active 데이터에 걸어 둔 배타 잠금이 이미 풀린 draft 를 사용자가 이어서 작업할 때, 잠금을 다시 겁니다. |
| `Prepare` | draft determine action 입니다. 넣어 둔 determination 과 validation 을 실행합니다. |
| `AdditionalSave` | draft 인스턴스에 additional save 단계를 정의합니다. |
| `Share` | collaborative draft 에서 사용자를 사용자 목록에 넣어도 되는지 확인합니다. |

### Edit

active 인스턴스를 draft 테이블로 복사합니다. feature control(기능 제어)와 authorization control(권한 제어)를 걸어 쓸 수 있는 경우를 좁힐 수 있습니다. `with additional implementation` 을 붙일 수 있습니다.

### Activate [optimized]

draft 테이블의 내용을 persistent table 로 옮기고 draft 테이블을 비웁니다. draft 쪽 버퍼에서 한 변경이 모두 들어갑니다. `Activate` 를 실행하면 draft determine action `Prepare` 도 함께 실행됩니다.

`optimized` 는 늘 붙이기를 권합니다.

- 한 RAP 트랜잭션에서 determination 과 validation 이 실행되는 횟수를 줄여 draft 활성화를 훨씬 빠르게 합니다.
- 전제 조건이 있습니다. determination 과 validation 을 RAP 개발 안내서의 "Determination and Validation Modelling" 지침대로 만들어야 합니다. 예를 들어 validation 과 determination 이 draft 인스턴스와 active 인스턴스를 똑같이 다뤄야 합니다.

`with additional implementation` 을 붙일 수 있습니다.

### Discard

draft 인스턴스를 draft 테이블에서 지웁니다. `with additional implementation` 을 붙일 수 있습니다.

### Resume

배타 잠금이 풀린 draft 인스턴스를 고치려 하면 자동으로 실행됩니다. active 테이블의 그 인스턴스에 잠금을 다시 만듭니다.

- 새로 만든 draft 면 [[abenbdl_standard_operations|standard operation create]] 에 정의한 feature control 과 authorization control 이 실행됩니다.
- active 인스턴스를 고치려고 만든 draft 면 draft action `Edit` 에 정의한 feature control 과 authorization control 이 실행됩니다.

`with additional implementation` 을 붙일 수 있습니다.

### draft determine action Prepare

BDEF 에서 넣어 둔 determination 과 validation 을 실행합니다. draft 데이터를 active 데이터로 넘기기 전에 검증할 수 있게 해 줍니다. active 인스턴스의 [[abenbdl_determine_action|determine action]] 에 해당하는 draft 쪽 action 이고, determine action 의 규칙이 그대로 적용됩니다.

- [[abenbdl_validations|validation]] 과, `on save` 로 정의한 [[abenbdl_determinations|determination]] 만 넣을 수 있습니다.
- 무엇을 넣을지는 BDEF 에 직접 적어야 합니다. BO 에 정의하고 구현한 determination 과 validation 만 쓸 수 있습니다.
- determination 과 validation 을 하나도 넣지 않아도 됩니다.
- `( always )` 를 붙일 수 있습니다.
- child entity(자식 엔터티)의 determination 과 validation 을 넣을 수 있습니다.
- managed BO 와, draft 를 쓰는 unmanaged BO 에서 쓸 수 있습니다.
- [[abenbdl_extensible|extensible]] 을 붙이면 BDEF extension(확장)에서 `Prepare` 에 validation 과 determination 을 더 넣을 수 있습니다. [[abenbdl_extensibility_enabling_m_u]] 참고.

### AdditionalSave

draft 인스턴스에 additional save 를 정의합니다. 특히 `with additional implementation` 이 붙은 draft action 을 위한 것입니다. 표준 save sequence(저장 순서) 도중에 추가 기능을 부를 수 있습니다.

- handler method(핸들러 메서드) [[abaphandler_meth_modify|FOR MODIFY ... FOR ACTION]] 에 구현해야 합니다. 메서드 이름은 기본으로 `AdditionalSave` 입니다.
- RAP 프레임워크가 내부에서만 부르므로 [[abenbdl_internal|internal]] 로 정의하기를 권합니다.
- EML 의 [[abapmodify_entity_entities_op|MODIFY ENTITIES ... EXECUTE]] 로는 실행할 수 없습니다. [[abapin_local_mode|IN LOCAL MODE]] 를 붙여도, 그 BO 의 behavior pool 안에서도 안 됩니다.
- OData 서비스에 드러나지 않습니다.
- managed BDEF 와 unmanaged BDEF 에 적을 수 있습니다. projection BDEF 나 interface BDEF 에서 [[abenbdl_use_projection|use]] 로 다시 쓸 수는 없습니다.

### Share

collaborative draft 에 쓰입니다. draft 인스턴스의 사용자 목록에 다른 사용자가 추가되거나, 사용자가 그 목록에 들어오려 할 때 실행됩니다. 그 사용자를 목록에 넣어도 되는지 확인합니다. 아직 exclusive draft 면 collaborative draft 로 바꾸는 일도 합니다.

### with additional implementation

`Edit`, `Activate`, `Discard`, `Resume` 에 붙일 수 있습니다. 붙이면 behavior pool 의 [[abapmethods_for_rap_behv|handler method]] `FOR MODIFY` 에 그 draft action 의 구현을 반드시 써야 합니다.

### 추가 구문

- [[abenbdl_internal|internal]] : 모든 draft action 에 쓸 수 있습니다.
- [[abenbdl_actions_fc|features: instance]] : `Edit` 에만 쓸 수 있습니다. `Edit` 에는 기본으로 켜져 있습니다.
- [[abenbdl_actions_auth|authorization:none]] : `Edit` 에만 쓸 수 있습니다.

### 어디에서 쓸 수 있나

- draft 를 쓰는 managed RAP BO 와 draft 를 쓰는 unmanaged RAP BO : 반드시 선언해야 합니다.
- RAP draft 처리를 다시 쓰는 projection BDEF 와 RAP BO interface : `use action DraftActionName` 으로 draft action 을 다시 써야 합니다. [[abenbdl_use_projection]] 참고.

## 예제

draft 를 쓰는 여행 BO 입니다. draft action 은 프레임워크가 처리하므로 선언만 합니다. `Prepare` 에는 저장 전에 돌릴 validation 을 넣습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( instance )
{
  create;
  update;
  delete;

  validation validateDates on save { create; field BeginDate, EndDate; }

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare
  {
    validation validateDates;
  }
}
```

RAP BO consumer(사용자)는 draft action 을 보통 action 처럼 `EXECUTE` 로 부릅니다.

```abap
" draft 여행을 활성화한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE activate FROM VALUE #( ( %key-travelid = '00000001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

- draft 를 쓰는 BO 에서는 draft action 의 이름을 다른 [[abenbdl_action|action]] 의 이름으로 쓸 수 없습니다. draft 를 쓰지 않는 entity 에서는 `Edit`, `Activate` 같은 이름을 action 이름으로 써도 됩니다. 하지만 `with draft;` 나 `with collaborative draft;` 로 BO 가 draft 를 쓰게 되면 이 이름들은 금지됩니다.
- active 인스턴스를 고치는 draft 에서 precheck 가 필요하면, draft action `Resume` 도중에 precheck 구현을 직접 불러야 합니다. `Resume` 에 `with additional implementation` 을 붙이고, 그 handler method 에서 precheck 메서드를 부릅니다.
- `AdditionalSave` 는 static action 입니다. 그래서 handler method 의 입력 매개변수 BDEF derived type(BDEF 파생 타입)에 구성요소 [[abapderived_types_cid|%cid]] 가 있습니다.

## 관련 항목

- [[abenbdl_draft_action2_abexa]]
- [[abenbdl_draft_action1_abexa]]
- [[abenbdl_determine_action]]
- [[abenbdl_with_draft]]
- [[abenbdl_determinations]]
- [[abenbdl_validations]]
- [[abenbdl_use_projection]]
- [[abaphandler_meth_modify]]
