---
title: privileged mode (with privileged mode)
summary: RAP BO consumer 가 EML 의 PRIVILEGED 로 권한 확인을 건너뛸 수 있게 BDEF privileged mode 를 켜는 구문으로, 구현 타입마다 적는 꼴이 다릅니다.
keywords: with privileged mode, privileged mode, 특권 모드, PRIVILEGED, disabling, base context, authorization context, 권한 컨텍스트, 권한 확인 건너뛰기, AUTHORITY-CHECK DISABLE, projection, interface
---

## 문법

managed·unmanaged RAP BO

```syntax
...
with privileged mode disabling ContextName;
 ...
```

projection BDEF

```syntax
...
with privileged mode disabling base context
  [and ContextName];
 ...
```

interface BDEF

```syntax
...
with privileged mode;
 ...
```

## 설명

RAP BO 에 BDEF privileged mode 를 켭니다. privileged mode 가 켜져 있으면 RAP BO consumer(사용자)는 authorization control(권한 제어) 같은 권한 확인을 건너뛸 수 있습니다. EML 에서 추가 구문 [[abapeml_privileged|PRIVILEGED]] 를 쓰려면 그 RAP BO 에 privileged mode 가 먼저 켜져 있어야 합니다.

managed, unmanaged, projection, interface BDEF 에서 쓸 수 있고, 타입마다 문법이 다릅니다.

### 1. with privileged mode disabling ContextName

managed 와 unmanaged RAP BO 에서만 씁니다.

머리말에 이 구문을 적으면, RAP BO consumer 가 [[abapeml_privileged|특권 접근]]으로 이 BO 를 부를 때 authorization context `ContextName` 이 저절로 꺼집니다. authorization context 가 꺼진다는 것은 거기에 적힌 권한 객체를 확인하지 않는다는 뜻입니다.

- `ContextName` 은 **같은 BDEF** 에 정의한 확인 생략용 authorization context(authorization context for disable)여야 합니다.
- authorization context 는 하나만 적을 수 있습니다.

RAP 프레임워크가 권한 객체 호출을 알아서 빼 줍니다. behavior pool(동작 풀)에 구현할 것은 없습니다.

권한 확인에는 권한 객체 말고 다른 것도 있습니다. CDS 접근 제어가 그렇습니다. BO 를 권한 객체가 아닌 다른 방법으로 지키고 있다면, **빈 authorization context** 를 정의해 `ContextName` 으로 가리키면 됩니다. 빈 authorization context 일 때 특권 EML 호출은 이렇게 처리됩니다.

- managed RAP BO : 원문은 RAP 프레임워크가 CDS 접근 제어 같은 다른 권한을 알아서 확인한다고만 적습니다. 특권 호출에서 이 확인을 건너뛰는지는 원문에서 분명하지 않습니다.
- unmanaged RAP BO : 특권 접근을 어떻게 다룰지를 behavior pool 의 handler method(핸들러 메서드)에 직접 정할 수 있습니다.

### 2. with privileged mode disabling base context

projection BDEF 에서만 씁니다. base BDEF(기반 BDEF) 가 privileged mode 를 정의하고 있어야 합니다.

- `base context` 는 base BDEF 에 적힌 [[abenbdl_def_auth_context|확인 생략용 authorization context]] 를 가리킵니다. base BDEF 의 authorization context 는 꼭 다시 써야 합니다. base BDEF 가 빈 authorization context 를 적었다면 그것도 다시 쓸 수 있습니다.
- `and ContextName` 은 선택입니다. projection BDEF 에 authorization context 를 하나 더 정할 때 씁니다. `ContextName` 은 같은 projection BDEF 에 정의한 authorization context 여야 합니다.

projection BDEF 에 특권 작업을 하면 base BDEF 의 컨텍스트와 projection BDEF 의 컨텍스트가 **둘 다** 꺼집니다.

### 3. with privileged mode

interface BDEF 에서만 씁니다. interface BDEF 에 privileged mode 를 켜서, EML 에서 `PRIVILEGED` 로 접근할 수 있게 합니다.

interface BDEF 는 접근 제한이나 authorization context 를 스스로 정의할 수 없습니다. 그래서 base BDEF 가 privileged mode 를 정의하고 있어야 합니다. 특권 접근은 기반 RAP BO 의 구현으로 넘어갑니다.

## 예제

managed BDEF 에 authorization context `TravelContext` 를 정의하고 privileged mode 에 등록합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with privileged mode disabling TravelContext;

define authorization context TravelContext
{
  'ZTRAVEL';
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

RAP BO consumer 가 `PRIVILEGED` 를 붙여 읽습니다.

```abap
READ ENTITIES OF zr_travel PRIVILEGED
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed).
```

이 문은 아래처럼 authorization context 를 끈 구간 안에서 실행한 것과 같이 동작합니다.

```abap
AUTHORITY-CHECK DISABLE BEGIN CONTEXT zr_travel~travelcontext.
  READ ENTITIES OF zr_travel PRIVILEGED
    ENTITY travel
      ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
    RESULT DATA(lt_travel)
    FAILED DATA(ls_failed).
AUTHORITY-CHECK DISABLE END.
```

권한 객체 말고 다른 방법으로 BO 를 지킨다면 빈 authorization context 를 씁니다.

```bdl
with privileged mode disabling EmptyContext;

define authorization context EmptyContext { }
```

projection BDEF 는 base BDEF 의 컨텍스트를 다시 쓰고, 자기 컨텍스트 `ProjContext` 를 하나 더합니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );
with privileged mode disabling base context and ProjContext;

define authorization context ProjContext
{
  'ZTRAVELUI';
}

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;
}
```

## 알아두기

- managed·unmanaged RAP BO 에서 `with privileged mode;` 만 적는 옛 문법은 폐기되었습니다. 호환을 위해 아직 쓸 수는 있지만 권하지 않으며, 쓰면 문법 경고가 납니다.
- projection BDEF 나 interface BDEF 에서 privileged mode 를 다시 쓰려면 base BDEF 가 `with privileged mode disabling ContextName` 꼴로 적혀 있어야 합니다. base BDEF 가 폐기된 `with privileged mode;` 를 쓰면 projection BO 에서는 privileged mode 를 쓸 수 없습니다.
- authorization context 를 끄는 방법은 여러 가지이고 [[abenbdl_def_auth_context]] 에 정리되어 있습니다. 그 가운데 `define authorization context ContextName for disable( Options )` 는 authorization context 를 handler method 종류에 등록합니다. 이 방법에서는 컨텍스트가 **handler method 안에서** 꺼집니다. `with privileged mode disabling ContextName` 에서는 컨텍스트가 **EML 문 둘레에서** 꺼집니다. 그래서 EML 문이 겨냥한 핸들러보다 먼저 RAP 프레임워크가 속으로 부르는 handler method 에서도 꺼져 있습니다.

## 관련 항목

- [[abapeml_privileged]]
- [[abeneml_privileged_abexa]]
- [[abenbdl_def_auth_context]]
- [[abenbdl_authorization_context]]
- [[abenbdl_bdef_header]]
