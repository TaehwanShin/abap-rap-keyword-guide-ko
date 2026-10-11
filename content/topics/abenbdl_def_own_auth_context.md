---
title: 전체 authorization context (define own authorization context)
summary: RAP BO 의 구현이 확인하는 권한 객체를 빠짐없이 적어 두는 전체 authorization context 를 정의합니다. 적는 방식이 세 가지입니다.
keywords: define own authorization context, 전체 권한 컨텍스트, full authorization context, by privileged mode, 권한 객체, authorization object, AUTHORITY-CHECK, 특권 모드, with privileged mode disabling
---

## 문법

```syntax
  define own authorization context by privileged mode;
| define own authorization context by privileged mode and
  {
  [AuthObject1;]
  [AuthObject2;]
  [...]
  }
| define own authorization context
  {
  [AuthObject1;]
  [AuthObject2;]
  [...]
  }
```

## 설명

RAP BO 의 **전체 authorization context** 를 정의합니다. 전체 authorization context 는 다음 세 곳에서 확인하는 권한 객체를 적은 목록입니다.

- behavior pool(동작 풀)의 구현 메서드가 직접 확인하는 권한 객체
- behavior pool 의 구현이 부르는 기존 코드가 확인하는 권한 객체
- 데이터 모델 계층에서 그 RAP BO entity(엔터티)에 건 CDS 접근 제어가 확인하는 권한 객체

이 목록은 RAP BO 구현에 쓰인 권한 객체를 문서로 남기는 역할을 합니다. 그래서 **빠짐없이** 적어야 합니다.

### 적는 방식 세 가지

| 적는 법 | 뜻 | 언제 쓰나 |
| --- | --- | --- |
| `define own authorization context by privileged mode;` | `with privileged mode disabling ContextName` 에 적은 컨텍스트([[abenbdl_privileged_mode]])를 전체 authorization context 로 그대로 가져옵니다. privileged mode 에서 꺼지는 권한 객체가 저절로 전체 authorization context 가 됩니다. | 전체 authorization context 가 privileged mode 용 컨텍스트와 똑같을 때. 곧 privileged mode 가 모든 권한 객체를 예외 없이 끌 때. |
| `define own authorization context by privileged mode and { ... }` | privileged mode 에서 꺼지는 권한 객체를 모두 가져오고, `and` 뒤에 권한 객체를 더 적습니다. | privileged mode 로 끄지 않는 권한 객체가 더 있을 때. |
| `define own authorization context { ... }` | behavior pool 에서 확인하는 권한 객체를 하나하나 모두 적습니다. | privileged mode 를 쓰지 않는 BDEF 일 때. |

### 그 밖의 규칙

- entity behavior definition(동작 정의)의 앞, 사이, 뒤 어디에나 적을 수 있습니다.
- 빈 전체 authorization context 도 정의할 수 있습니다.
- behavior definition 하나에 전체 authorization context 는 **하나까지**입니다.

### 특권 컨텍스트와의 관계

전체 authorization context 에 적은 권한 객체 가운데, SAP 가 정한 분류상 특권 컨텍스트에 넣어도 되는 것은 특권 컨텍스트에도 모두 적어야 합니다. 그렇지 않으면 문법 경고가 납니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BDEF. projection BDEF 는 base BDEF(기반 BDEF) 와 상관없이 전체 authorization context 를 정의할 수 있습니다. 기반 entity 에 전체 authorization context 가 없어도 projection 계층에 정의할 수 있습니다.

## 예제

privileged mode 가 끄는 `PrivilegedContext` 의 권한 객체를 가져오고, 하나를 더 보탭니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

with privileged mode disabling PrivilegedContext;

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

// privileged mode 에서 건너뛸 권한 객체
define authorization context PrivilegedContext
{
  'Z_TRAVEL';
}

// 전체 authorization context = PrivilegedContext 의 목록 + Z_AGENCY
define own authorization context by privileged mode and
{
  'Z_AGENCY';
}
```

privileged mode 를 쓰지 않는 BDEF 라면 목록을 직접 다 적습니다.

```bdl
define own authorization context
{
  'Z_TRAVEL';
  'Z_AGENCY';
}
```

전체 authorization context 에 적은 권한 객체의 실제 확인은 보통 handler method(핸들러 메서드) `FOR INSTANCE AUTHORIZATION`([[abaphandler_meth_auth]])에 구현합니다.

## 알아두기

- 전체 authorization context 를 둘 이상 정의할 수 없습니다.
- `by privileged mode` 는 `with privileged mode disabling ContextName` 이 있을 때 뜻이 있습니다. 가져올 컨텍스트가 거기서 정해지기 때문입니다.

## 관련 항목

- [[abenbdl_authorization_context]]
- [[abenbdl_def_auth_context]]
- [[abenbdl_privileged_mode]]
- [[abaphandler_meth_auth]]
- [[abenbdl_authorization]]
