---
title: authorization context 개요
summary: behavior definition 에 권한 객체 목록을 적어 두는 authorization context 두 가지, 곧 전체 authorization context 와 확인 생략용 authorization context 를 정리합니다.
keywords: authorization context, 권한 컨텍스트, define own authorization context, define authorization context, for disable, 권한 객체, authorization object, AUTHORITY-CHECK, privileged mode, 특권 모드, 전체 권한 컨텍스트
---

## 문법

전체 authorization context

```syntax
1. define own authorization context by privileged mode;
 | define own authorization context by privileged mode and
  {[AuthObject1;] [AuthObject2;] [...]}
 | define own authorization context
  {[AuthObject1;] [AuthObject2;] [...]}
```

확인 생략용 authorization context

```syntax
2. define authorization context ContextName
      [for disable( Options )]

{
  [AuthObject1;]
  [AuthObject2;]
  [...]
}
```

## 설명

behavior definition(동작 정의)에는 **authorization context** 를 정의할 수 있습니다. authorization context 는 ABAP 문 `AUTHORITY-CHECK OBJECT` 에서 쓰는 권한 객체를 여러 개 모아 적은 목록입니다. 두 가지가 있습니다.

| 종류 | 정의하는 문 | 뜻 |
| --- | --- | --- |
| 전체 authorization context | `define own authorization context` | 이 RAP BO 의 구현이 확인하는 권한 객체를 **빠짐없이** 적어 둔 목록입니다. behavior pool(동작 풀)의 구현 메서드가 직접 확인하는 것, 그리고 behavior pool 이 부르는 기존 코드가 확인하는 것이 들어갑니다. 구현에 쓰인 권한 객체를 문서로 남기는 역할을 합니다. 빠진 것이 있으면 문법 경고가 납니다. |
| 확인 생략용 authorization context | `define authorization context` | 권한 객체 목록입니다. 이 컨텍스트가 켜지면 목록에 든 권한 객체의 권한 확인은 늘 "권한 있음"을 돌려줍니다. 곧 그 권한 확인을 건너뜁니다. |

두 문의 자세한 내용은 [[abenbdl_def_own_auth_context]] 와 [[abenbdl_def_auth_context]] 에 있습니다.

### SAP 의 분류를 따라야 한다

권한 객체마다 전체 authorization context 에 넣어도 되는지, 확인 생략용 authorization context 에 넣어도 되는지를 SAP 가 미리 정해 두었습니다. 이 분류를 지켜야 합니다. 어기면 문법 경고가 나고, strict mode 2([[abenbdl_strict_2]])에서는 문법 오류가 납니다.

### privileged mode 와 함께 쓸 때

확인 생략용 authorization context 를 `with privileged mode disabling ContextName` 으로 privileged mode 에 물렸다면([[abenbdl_privileged_mode]]), 그 컨텍스트가 전체 authorization context 와 어긋나지 않아야 합니다.

- 그 확인 생략용 컨텍스트의 권한 객체를 **모두** 담은 전체 authorization context 가 있어야 합니다. 없으면 문법 경고가 납니다.
- 거꾸로, 전체 authorization context 의 권한 객체는 모두 그 확인 생략용 컨텍스트에도 있어야 합니다. 분류상 확인 생략용 컨텍스트에 넣을 수 없는 권한 객체만 예외입니다. 어기면 문법 경고가 납니다.

## 예제

authorization context 셋을 정의합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

with privileged mode disabling NoCheckWhenPrivileged;

// 특권 접근일 때 건너뛸 권한 객체
define authorization context NoCheckWhenPrivileged
{
  'Z_TRAVEL';
}

// 전체 authorization context: privileged mode 의 목록에 권한 객체 둘을 보탠다
define own authorization context by privileged mode and
{
  'Z_AGENCY';
  'Z_CUSTOMER';
}

// 읽기·변경 handler method 안에서 건너뛸 권한 객체
define authorization context NoCheckWhenReadingOrModifying
  for disable ( modify, read )
{
  'Z_TRVLOG';
}

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

- `NoCheckWhenPrivileged` 는 RAP BO consumer(사용자)가 특권 접근([[abapeml_privileged]])으로 들어올 때 건너뛸 권한 객체를 적습니다.
- 전체 authorization context 는 구현이 쓰는 권한 객체를 모두 적습니다. 여기서는 privileged mode 의 목록을 그대로 가져오고 둘을 더 보탰습니다. 보탠 둘이 `NoCheckWhenPrivileged` 에 없어도 되는 것은, 그 권한 객체가 "privileged mode 에서 쓸 수 없음"으로 분류된 경우뿐입니다.
- `NoCheckWhenReadingOrModifying` 은 handler method(핸들러 메서드) `FOR READ`([[abaphandler_meth_read]])와 `FOR MODIFY`([[abaphandler_meth_modify]]) 안에서 건너뛸 권한 객체를 적습니다.

전체 authorization context 에 적은 권한 객체의 실제 확인은 보통 handler method `FOR INSTANCE AUTHORIZATION`([[abaphandler_meth_auth]])에 구현합니다.

## 알아두기

- 전체 authorization context 는 "무엇을 확인하는가"를, 확인 생략용 authorization context 는 "무엇을 건너뛰는가"를 적습니다. 방향이 반대입니다.
- 경고가 나는지는 권한 객체마다 SAP 가 정한 분류에 따라 달라집니다. 원문 예제도 일부 컨텍스트에 경고를 감추는 표시(`##warn_OK`)를 붙여 둡니다.

## 관련 항목

- [[abenbdl_def_own_auth_context]]
- [[abenbdl_def_auth_context]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_strict_2]]
- [[abapeml_privileged]]
- [[abaphandler_meth_auth]]
- [[abenbdl_authorization]]
