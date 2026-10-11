---
title: 권한 (authorization master, authorization dependent)
summary: 권한이 없는 사용자가 BO 를 바꾸지 못하도록, entity 마다 global·instance 권한 확인 방식을 정하는 문법입니다.
keywords: authorization, authorization master, authorization dependent by, global, instance, none, 권한, 권한 제어, 권한 마스터, 권한 종속, FOR GLOBAL AUTHORIZATION, FOR INSTANCE AUTHORIZATION, 전역 권한, 인스턴스 권한
---

## 문법

```syntax
... authorization master {( global )
                         |( instance )
                         |( global, instance )
                         |( none )}
  | authorization dependent by _Assoc ...
```

## 설명

RAP 의 authorization control(권한 제어)는 권한이 없는 접근에서 business object(비즈니스 객체)를 지킵니다. entity(엔터티)마다 entity 동작 특성에 따로 적고, 실제 확인 내용은 behavior pool(동작 풀)에 구현합니다.

authorization control 이 다루는 작업은 생성, 수정, 삭제, create-by-association, action, function 입니다. **읽기는 여기서 다루지 않습니다.** 읽기는 CDS 가 제공하고 CDS 접근 제어가 맡습니다.

권한은 두 곳에 적습니다.

1. **entity 동작 특성** : 그 entity 의 기본 권한 방식을 정합니다. `instance`, `global`, 둘 다, `none` 가운데 하나입니다. 여기서 정한 방식이 그 entity 의 모든 작업에 적용됩니다.
2. **entity 동작 본문의 작업마다** : 기본값과 다르게 하고 싶은 작업에만 예외를 적습니다. 예를 들어 다른 action 은 모두 instance 권한을 따르는데 한 action 만 global 권한으로 확인하게 하거나, 어떤 작업은 권한 확인을 아예 하지 않게 할 수 있습니다.

작업마다 붙이는 추가 구문은 네 가지입니다.

- [[abenbdl_actions_auth|authorization:none]]
- [[abenbdl_actions_auth_update|authorization:update]]
- [[abenbdl_actions_auth_global|authorization:global]]
- [[abenbdl_actions_auth_instance|authorization:instance]]

### authorization master 와 authorization dependent

모든 entity 는 authorization master 이거나 authorization dependent 이어야 합니다.

- **authorization master entity**는 behavior pool 에 자기 권한 메서드(전역 또는 인스턴스)가 있습니다. authorization master 자신이나 거기에 딸린 authorization dependent entity 에 접근 요청이 오면 이 구현이 쓰입니다.
- **authorization dependent entity**는 연결된 authorization master 의 authorization control 을 그대로 씁니다. 권한 요청이 authorization master 의 구현으로 넘어갑니다. authorization dependent entity 에서 수정, 삭제, create-by-association 을 하면 authorization master 의 **수정(update) 권한 확인**이 적용됩니다. 자식으로 가는 association 에는 create-by-association 하는 작업의 권한을 따로 정해 이 기본값과 다르게 할 수 있습니다.

규칙은 다음과 같습니다.

- 모든 entity 를 `authorization master (...)` 나 `authorization dependent by _Assoc` 으로 선언해야 합니다.
- root entity(루트 엔터티)는 반드시 authorization master 입니다. 나머지 entity 는 authorization master 여도 되고 authorization dependent 이어도 됩니다.
- authorization master 가 authorization dependent entity 의 부모가 아니라면, authorization master 로 가는 association 을 entity behavior definition(동작 정의)에 `association _AssocToAuthMaster { }` 로 적어 두어야 합니다.
- 아래 경우에는 authorization dependent entity 의 behavior pool 에 권한 메서드를 따로 구현해야 합니다.
    - authorization dependent entity 의 [[abenbdl_action|action]] 과 [[abenbdl_function|function]]
    - 생성이 켜져 있는, 다른 BO 로 가는 association
    - 생성이 켜져 있는데 자식으로 가는 association 이 아닌 association

### authorization control 의 종류

| 값 | 뜻 | 쓸 수 있는 작업 | 구현할 메서드 |
| --- | --- | --- | --- |
| `global` | 인스턴스와 상관없이 BO 전체에 접근이나 작업을 막습니다. 예를 들어 사용자 역할에 따라 정합니다. | `create`, create-by-association, `update`, `delete`, static action, instance action, static function, instance function | [[abaphandler_meth_global_auth|FOR GLOBAL AUTHORIZATION]] |
| `instance` | 인스턴스의 상태에 따라 달라지는 권한 확인입니다. | create-by-association, `update`, `delete`, instance action, instance function | [[abaphandler_meth_auth|FOR INSTANCE AUTHORIZATION]] |
| `global, instance` | 둘을 함께 씁니다. 인스턴스 단위 작업은 전역 확인과 인스턴스 확인을 모두 거칩니다. 두 확인은 실행 중 서로 다른 시점에 일어납니다. | - | 두 메서드 모두 |
| `none` | authorization master entity 에 적으면 BO 전체에 권한 확인이 없다는 뜻입니다. | - | 권한 handler method(핸들러 메서드)를 구현할 수 없습니다. |

권한 확인 내용은 예를 들어 권한 객체로 구현할 수 있습니다.

### BO 종류에 따른 차이

- **managed RAP BO** : root entity 를 `authorization master` 로 적으면 RAP 프레임워크가 작업마다 접근 제한이 있는지 확인합니다.
- **unmanaged RAP BO** : global authorization control 을 적어 두면 RAP 프레임워크가 작업마다 접근 제한이 있는지 확인합니다.
- **[[abenbdl_with_draft|draft 를 쓰는 BO]]** : draft 인스턴스에 실행하는 [[abenbdl_standard_operations|standard operation]]마다 접근 제한을 확인합니다. [[abenbdl_draft_action|draft action]] `Resume` 과 `Edit` 에는 `create` 의 authorization control 을 확인합니다. `Activate`, `Discard`, `Prepare` 에서는 권한 메서드를 부르지 않습니다. draft 활성화를 막으려면 권한 확인을 [[abenbdl_validations|validation]]에 구현해야 합니다.
- **projection BO** : base BO(기반 BO) 의 권한을 그대로 물려받습니다. projection 계층에 [[abenbdl_nonstandard_projection|새 action 이나 function]] 을 만들면 그것에 쓸 authorization control 을 새로 정할 수 있습니다. [[abenbdl_authorization_projection]] 를 참고하세요.
- **RAP BO interface** : base BO 의 authorization control 을 그대로 물려받습니다.

## 예제

`Travel` 은 global 권한과 instance 권한을 함께 쓰는 authorization master 입니다. `Booking` 은 부모의 권한을 따릅니다. `printTravel` action 만 권한 확인에서 뺐습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( global, instance )
{
  create;
  update;
  delete;

  field ( readonly ) TravelID;

  association _Booking { create; }

  action acceptTravel result [1] $self;

  // 이 action 만 권한 확인을 하지 않는다
  action ( authorization : none ) printTravel;
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;

  field ( readonly ) TravelID, BookingID;

  association _Travel { }
}
```

behavior pool 에는 두 권한 메서드를 만듭니다. 아래는 global 권한 메서드에서 생성 권한을 권한 객체로 확인하는 모습입니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel RESULT result.

    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR travel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_global_authorizations.
    " 생성 권한을 물어 왔을 때만 확인한다
    IF requested_authorizations-%create = if_abap_behv=>mk-on.
      AUTHORITY-CHECK OBJECT 'ZTRAVEL' ID 'ACTVT' FIELD '01'.
      result-%create = COND #( WHEN sy-subrc = 0
                               THEN if_abap_behv=>auth-allowed
                               ELSE if_abap_behv=>auth-unauthorized ).
    ENDIF.
  ENDMETHOD.

  METHOD get_instance_authorizations.
    " 인스턴스 상태를 읽어 수정·삭제·action 권한을 정한다
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- EML 문에 [[abapin_local_mode|IN LOCAL MODE]] 를 붙이면 authorization control 을 건너뜁니다.
- RAP BO consumer(사용자)는 EML 의 [[abapget_permissions|GET PERMISSIONS]] 문으로 그 BO 에 authorization control 이 구현되어 있는지 알아볼 수 있습니다.
- 읽기 접근을 막으려면 DCL(Data Control Language)을 씁니다. DCL 로 만든 CDS 접근 제어는 기반 계층에서 projection 과 RAP BO interface 로 그대로 전달됩니다. 실행 예제는 [[abenbdl_draft_query_abexa]] 에 있습니다.
- 권한은 behavior pool 의 다른 메서드, 예를 들어 [[abenbdl_validations|validation]]에서도 확인할 수 있습니다.
- UI 에서는 authorization control 이 RAP 사용자 힌트로 나타납니다.
- managed·unmanaged BO 를 넓히는 BDEF extension(확장)에서는 action 마다 authorization control 을 따로 적어야 합니다. 원래 BO 가 바뀌어도 extension action 이 흔들리지 않도록, extension action 의 권한을 원래 BO 의 권한과 떼어 놓기 위해서입니다.
- lock dependent, authorization dependent, ETag 종속을 한 줄로 줄여 쓸 수 있습니다. `( lock, authorization, etag ) dependent by _Assoc` 형태이며 [[abenbdl_short_syntax]] 에서 설명합니다.

## 관련 항목

- [[abenbdl_authorization_abexa]]
- [[abenbdl_cds_based_auth]]
- [[abaphandler_meth_global_auth]]
- [[abaphandler_meth_auth]]
- [[abenbdl_actions_auth]]
- [[abenbdl_actions_auth_update]]
- [[abenbdl_actions_auth_global]]
- [[abenbdl_actions_auth_instance]]
- [[abenbdl_authorization_projection]]
- [[abenbdl_short_syntax]]
