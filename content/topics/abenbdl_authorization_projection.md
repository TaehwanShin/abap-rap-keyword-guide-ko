---
title: projection BDEF 의 authorization control (authorization)
summary: projection BDEF 는 base BDEF 의 authorization control 을 물려받고, projection 에서 새로 만든 action·function 에만 global·instance authorization control 을 따로 정합니다.
keywords: authorization, 권한 제어, 프로젝션 BDEF, projection, global, instance, authorization:none, authorization:update, authorization:global, authorization:instance, FOR GLOBAL AUTHORIZATION, FOR INSTANCE AUTHORIZATION, 새 액션
---

## 문법

```syntax
 ... authorization {( global )
                  |( instance )
                  |( global,instance )}  ...
```

## 설명

projection BDEF 는 base BDEF(기반 BDEF) 의 authorization control(권한 제어)를 **물려받습니다**. 물려받은 authorization control 은 CRUD 작업, 그리고 `use action` 이나 `use function` 으로 가져온 action([[abenbdl_action]])과 function([[abenbdl_function]])에 적용됩니다.

projection BDEF 는 action 과 function 을 새로 정의할 수도 있습니다([[abenbdl_nonstandard_projection]], [[abenbdl_function_projection]]). 이 **새 action 과 function** 에는 projection 계층에서 authorization control 을 따로 정할 수 있습니다. 구현은 projection 의 behavior pool(동작 풀)에 씁니다.

- global 권한 : handler method(핸들러 메서드) `FOR GLOBAL AUTHORIZATION` ([[abaphandler_meth_global_auth]])
- instance 권한 : handler method `FOR INSTANCE AUTHORIZATION` ([[abaphandler_meth_auth]])

### base BDEF 의 authorization control 과 다른 점

projection BDEF 의 authorization control 은 base BDEF 의 authorization control([[abenbdl_authorization]])와 비슷합니다. 다른 점은 두 가지입니다.

- projection BDEF 에 authorization control 을 정의하려면 `strict[(version)]` 으로 strict mode 를 켜야 합니다([[abenbdl_strict]]).
- 마스터와 종속 관계가 없습니다. entity(엔터티)마다 instance 권한을 쓸지, global 권한을 쓸지, 둘 다 쓸지 스스로 적어야 합니다.

### 작업마다 다르게 정하기

entity 에 정한 authorization control 은 그 entity 의 모든 RAP BO 작업에 적용됩니다. 작업 하나만 다르게 하려면 작업 추가 구문을 붙입니다.

| 추가 구문 | 뜻 |
| --- | --- |
| `authorization:none` | 그 작업을 권한 확인에서 뺍니다. [[abenbdl_actions_auth]] |
| `authorization:update` | 그 작업에 **base BDEF 가 수정 작업에 정한** authorization control 을 그대로 씁니다. projection BDEF 의 entity 동작 특성에 authorization control 이 정의돼 있어야 쓸 수 있습니다. 다만 projection 에 적은 값(`instance` 인지 `global` 인지)은 영향을 주지 않습니다. base BO(기반 BO) 의 설정(`instance`, `global`, 또는 둘 다)을 온전히 따릅니다. [[abenbdl_actions_auth_update]] |
| `authorization:global` | 그 action 에 global authorization control 을 겁니다. entity 수준에도 authorization control 이 있으면, action 에 적은 것이 entity 에 적은 것을 대신합니다. entity 수준 authorization control 이 없어도 쓸 수 있습니다. [[abenbdl_actions_auth_global]] |
| `authorization:instance` | 그 action 에 instance authorization control 을 겁니다. entity 수준에도 authorization control 이 있으면, action 에 적은 것이 entity 에 적은 것을 대신합니다. entity 수준 authorization control 이 없어도 쓸 수 있습니다. [[abenbdl_actions_auth_instance]] |
| `authorization:global, authorization:instance` | 그 action 에 instance authorization control 과 global authorization control 을 둘 다 합니다. |

## 예제

projection 에서 새 action `sendReminder` 를 정의하고 global authorization control 을 겁니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
authorization ( global )
{
  use create;
  use update;
  use delete;

  // base BDEF 의 authorization control 을 그대로 물려받는다
  use action acceptTravel;

  // projection 의 새 action: entity 에 정한 global authorization control 이 적용된다
  action sendReminder result [1] $self;

  // base BDEF 가 수정 작업에 정한 authorization control 을 따른다
  action ( authorization : update ) markAsFavorite;
}
```

projection 의 behavior pool 에서 global 권한을 구현합니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_global_authorizations.
    " 새 action 의 권한을 물어 왔을 때만 답한다
    IF requested_authorizations-%action-sendreminder = if_abap_behv=>mk-on.
      AUTHORITY-CHECK OBJECT 'Z_TRAVEL' ID 'ACTVT' FIELD '02'.

      result-%action-sendreminder = COND #( WHEN sy-subrc = 0
                                            THEN if_abap_behv=>auth-allowed
                                            ELSE if_abap_behv=>auth-unauthorized ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- projection 에는 `authorization master` 나 `authorization dependent by` 가 없습니다. 괄호 안에 `global`, `instance` 만 적습니다.
- strict mode 를 켜지 않은 projection BDEF 에는 authorization control 을 정의할 수 없습니다.
- 화면(UI)에서는 authorization control 이 RAP 사용자 힌트(consumer hint)로 나타납니다.

## 관련 항목

- [[abenbdl_character_projection]]
- [[abenbdl_authorization]]
- [[abenbdl_nonstandard_projection]]
- [[abenbdl_function_projection]]
- [[abaphandler_meth_global_auth]]
- [[abaphandler_meth_auth]]
- [[abenbdl_strict]]
