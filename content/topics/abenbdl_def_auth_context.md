---
title: 확인 생략용 authorization context (define authorization context)
summary: 켜져 있는 동안 권한 확인을 건너뛸 권한 객체 목록을 정의합니다. privileged mode 에 물리거나 for disable 로 특정 메서드에 겁니다.
keywords: define authorization context, 권한 컨텍스트, for disable, 확인 생략, authorization context for disable, modify, read, determination, validation, save:early, save:late, AUTHORITY-CHECK DISABLE BEGIN CONTEXT, 특권 모드, privileged mode
---

## 문법

```syntax
define authorization context ContextName
      [{for disable( modify
                    | read
                    | determination
                    | validation
                    | save:early
                    | save:late)}]

{
   AuthObject1;
  [AuthObject2;]
  [...]
}
```

## 설명

`define authorization context` 는 **확인 생략용 authorization context** 를 정의합니다. ABAP 문 `AUTHORITY-CHECK OBJECT` 에서 쓰는 권한 객체를 여러 개 모아 적은 목록입니다.

이 컨텍스트가 **켜지면** 목록에 든 권한 객체의 권한 확인은 늘 성공합니다. 곧 그 확인을 건너뜁니다. 예를 들어 BDEF 가 자체 권한 확인([[abenbdl_authorization]])을 구현해 놓고, 그 뒤에 또 권한 확인을 하는 기존 코드를 부르는 경우에 쓸모가 있습니다.

- behavior definition(동작 정의) 하나에 확인 생략용 컨텍스트를 하나 이상 정의할 수 있습니다.
- entity(엔터티) behavior definition 의 앞, 사이, 뒤 어디에나 적을 수 있습니다.
- 컨텍스트마다 권한 객체 `AuthObject1`, `AuthObject2`, ... 를 하나 이상 적습니다.
- **빈** 컨텍스트도 정의할 수 있습니다. privileged mode([[abenbdl_privileged_mode]])를 켜려면 확인 생략용 컨텍스트를 적어도 하나 적어야 합니다. 그런데 권한 객체에 기대지 않는 권한 확인만 쓰는 RAP BO 도 있습니다. 그럴 때 빈 컨텍스트를 적습니다.

### 컨텍스트를 켜는 두 가지 방법

1. `with privileged mode disabling ContextName` 으로 privileged mode 에 물립니다([[abenbdl_privileged_mode]]).
2. 추가 구문 `for disable( Options )` 로 특정 종류의 saver method(세이버 메서드)나 handler method(핸들러 메서드)에 겁니다.

### for disable( Options )

`for disable` 을 붙이면 적어 둔 종류의 메서드가 그 컨텍스트의 권한 객체를 **저절로** 건너뜁니다. 코드에 따로 쓰지 않아도, 메서드 본문 전체를 `AUTHORITY-CHECK DISABLE BEGIN CONTEXT ...` 와 `AUTHORITY-CHECK DISABLE END` 로 감싼 것처럼 동작합니다.

| 옵션 | 건너뛰는 곳 | 쓸 수 있는 BO |
| --- | --- | --- |
| `modify` | handler method `FOR MODIFY` ([[abaphandler_meth_modify]]) | managed, unmanaged |
| `read` | handler method `FOR READ` ([[abaphandler_meth_read]]) | managed, unmanaged |
| `determination` | save sequence(저장 순서)에서 불리는 determination ([[abenbdl_determinations]]) | managed 만 |
| `validation` | save sequence 에서 불리는 validation ([[abenbdl_validations]]) | managed 만 |
| `save:early` | early save phase(이른 저장 단계)의 saver method `finalize` ([[abensaver_finalize]]), `check_before_save` ([[abensaver_check_before_save]]) | unmanaged 만 |
| `save:late` | late save phase(늦은 저장 단계)의 saver method `adjust_numbers` ([[abensaver_adjust_numbers]]), `save` ([[abensaver_method_save]]), `save_modified` ([[abaprap_saver_meth_save_modified]]) | managed, unmanaged |

괄호 안에 옵션을 쉼표로 나눠 여러 개 적을 수 있습니다. 다만 **옵션 하나는 behavior definition 전체에서 한 번만** 쓸 수 있습니다.

### 쓸 수 있는 곳

`for disable` 이 없는 형태는 다음에서 쓸 수 있습니다. `for disable` 을 붙이면 위 표의 규칙이 따로 적용됩니다.

- managed RAP BO, unmanaged RAP BO
- projection BDEF. projection BDEF 는 base BDEF(기반 BDEF) 와 상관없이 확인 생략용 컨텍스트를 정의할 수 있습니다. 기반 entity 에 그런 컨텍스트가 없어도 됩니다.

### 전체 authorization context 가 함께 필요하다

권한 객체가 든(비어 있지 않은) 확인 생략용 컨텍스트를 정의하고 켰다면, 그 권한 객체를 모두 담은 전체 authorization context([[abenbdl_def_own_auth_context]])도 정의해야 합니다. 분류상 전체 authorization context 에 넣을 수 없는 권한 객체는 예외입니다. 그렇지 않으면 문법 경고가 납니다.

## 예제

`PrivilegedContext` 는 privileged mode 에 물리고, `SaveContext` 는 late save phase 의 saver method 에 겁니다.

```bdl
managed with additional save
implementation in class zbp_r_travel unique;
strict ( 2 );

with privileged mode disabling PrivilegedContext;

define authorization context PrivilegedContext
{
  'Z_TRAVEL';
  'Z_AGENCY';
}

define authorization context SaveContext
  for disable ( save:late )
{
  'Z_TRAVEL';
}

// PrivilegedContext 의 목록을 전체 authorization context 로 그대로 쓴다
define own authorization context by privileged mode;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

위의 `for disable ( save:late )` 때문에 `save_modified` 는 다음처럼 쓴 것과 똑같이 동작합니다. 실제로는 아래 두 줄을 적지 않습니다.

```abap
METHOD save_modified.
  AUTHORITY-CHECK DISABLE BEGIN CONTEXT zr_travel~savecontext.

  " 여기서 부르는 코드가 Z_TRAVEL 권한을 확인해도 늘 통과한다

  AUTHORITY-CHECK DISABLE END.
ENDMETHOD.
```

## 알아두기

- BDEF extension(확장)에서도 확인 생략용 컨텍스트를 정의할 수 있습니다. 하지만 추가 구문 `for disable( Options )` 는 BDEF extension 에서 쓸 수 없습니다. [[abenbdl_extension_syntax]] 를 봅니다.
- `for disable` 의 효과는 base BDEF 의 구현에만 미칩니다. BDEF extension([[abenbdl_extension]])이 들여온 saver method 나 handler method 에는 `AUTHORITY-CHECK DISABLE BEGIN CONTEXT` ... `AUTHORITY-CHECK DISABLE END` 가 만들어지지 않습니다.
- privileged mode 에 물린 컨텍스트가 실제로 어떻게 동작하는지는 예제 [[abeneml_privileged_abexa]] 에서 볼 수 있습니다. `PRIVILEGED` 없이 한 번, 붙여서 한 번 RAP BO 에 접근합니다.

## 관련 항목

- [[abenbdl_authorization_context]]
- [[abenbdl_def_own_auth_context]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_authorization]]
- [[abeneml_privileged_abexa]]
- [[abenbdl_extension_syntax]]
