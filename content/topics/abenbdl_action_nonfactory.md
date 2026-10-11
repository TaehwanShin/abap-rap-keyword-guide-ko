---
title: non-factory action
summary: 이미 있는 인스턴스의 상태를 바꾸는 사용자 정의 작업을 선언하는 문법으로, 처리 내용은 FOR MODIFY handler method 에 구현합니다.
keywords: action, non-factory action, 일반 액션, 팩토리가 아닌 액션, static action, 정적 액션, repeatable, internal, external, lock:none, features:instance, features:global, precheck, authorization, FOR MODIFY, EXECUTE
---

## 문법

```syntax
[internal][static] [repeatable] action
                  [(
                  [features: {instance | global}]
                  [precheck]
                  [authorization:none]
                  [authorization:update]
                  [authorization:global]
                  [authorization:instance]
                  [lock:none]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                  [OutputParameter]
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

## 설명

standard operation(표준 작업)으로는 나타낼 수 없는 처리를 action 으로 선언합니다. 실제 로직은 behavior pool(동작 풀)의 handler method(핸들러 메서드) [[abaphandler_meth_modify|FOR MODIFY]] 에 직접 구현합니다.

action 은 기본으로 **인스턴스에 묶여** 있습니다. entity(엔터티) 인스턴스 하나를 대상으로 실행되고 그 인스턴스의 상태를 바꿉니다.

### static 과 repeatable

- [[abenbdl_static|static]] : static action 으로 만듭니다. static action 은 어느 인스턴스에도 묶이지 않고 entity 전체에 걸립니다. 기본값이 instance action 이므로, `static` 을 적어야 이 기본값이 바뀝니다.
- [[abenbdl_action_repeatable|repeatable]] : 인스턴스에 묶인 non-factory action 을 repeatable action 으로 만듭니다. repeatable action 은 한 번의 EML 요청이나 OData 요청 안에서 같은 인스턴스에 여러 번 실행할 수 있습니다. `repeatable` 이 없는 action 을 한 요청 안에서 같은 인스턴스에 여러 번 실행하면 런타임 오류가 납니다.

### 붙일 수 있는 추가 구문

| 추가 구문 | 뜻 |
| --- | --- |
| [[abenbdl_internal|internal]] | BO 구현 안에서만 부를 수 있게 합니다. |
| [[abenbdl_external|external]] | 바깥에서 쓸 다른 이름을 줍니다. |
| [[abenbdl_lock_none|lock:none]] | action 을 실행하는 인스턴스에 RAP 잠금을 걸지 않습니다. |
| [[abenbdl_actions_fc|features:instance]] | 동적 feature control(기능 제어)입니다. BO 안의 조건에 따라 action 을 켜고 끕니다. 예를 들어 주문을 승인하는 action 을, 상태가 이미 "거절"이 아닐 때만 내놓을 수 있습니다. |
| [[abenbdl_actions_fc|features:global]] | global feature control 입니다. BO 바깥의 조건에 따라 action 을 켜고 끕니다. |
| [[abenbdl_precheck|precheck]] | 원하지 않는 변경이 transactional buffer(트랜잭션 버퍼)에 닿기 전에 막습니다. |
| [[abenbdl_actions_auth|authorization:none]] | 이 action 을 [[abenbdl_authorization|권한 확인]]에서 뺍니다. static action 에는 global 권한을 쓸 때만 붙일 수 있습니다. |
| [[abenbdl_actions_auth_update|authorization:update]] | authorization control(권한 제어)를 수정 작업의 권한 확인에 맡깁니다. |
| [[abenbdl_actions_auth_global|authorization:global]] | authorization master entity 에 정한 authorization control 대신 global 권한 확인을 적용합니다. |
| [[abenbdl_actions_auth_instance|authorization:instance]] | authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 적용합니다. |
| [[abenbdl_action_input_param|InputParameter]] | 입력 매개변수를 붙입니다. 선택입니다. |
| [[abenbdl_action_output_para|OutputParameter]] | 출력 매개변수를 붙입니다. 선택입니다. |
| [[abenbdl_default_function|default function]] | action 의 default values function 을 정합니다. 입력 매개변수의 값을 미리 채우는 데 씁니다. 그래서 action 에 입력 매개변수가 있어야 합니다. |

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 에서는 base BDEF(기반 BDEF) 의 action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]). action 을 새로 만들 수도 있습니다([[abenbdl_nonstandard_projection]]).
- RAP BO interface 에서는 base BDEF 의 action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

여행을 승인하거나 거절하는 두 action 입니다. 둘 다 바뀐 자기 자신을 결과로 돌려줍니다.

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

  field ( readonly : update ) TravelID;

  action acceptTravel result [1] $self;
  action rejectTravel result [1] $self;
}
```

RAP BO consumer(사용자)는 EML 의 `EXECUTE` 로 action 을 부릅니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE accepttravel
      FROM VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

저장하고 나면 그 여행의 `Status` 가 승인을 뜻하는 `A` 로 바뀌어 있습니다. handler method 구현까지 포함한 전체 흐름은 [[abenbdl_action1_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_action_repeatable]]
- [[abenbdl_action_factory]]
- [[abenbdl_action_onsave]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abaphandler_meth_modify]]
- [[abenbdl_action1_abexa]]
