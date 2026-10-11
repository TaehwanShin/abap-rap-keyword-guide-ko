---
title: behavior definition 을 쓰는 언어 (RAP BDL)
summary: behavior definition 을 쓰는 언어 RAP BDL 의 다섯 가지 구현 타입(managed, unmanaged, interface, projection, abstract)이 각각 무엇이고 언제 쓰는지 훑어봅니다.
keywords: RAP BDL, behavior definition language, 동작 정의 언어, managed, unmanaged, interface, projection, abstract, 구현 타입, greenfield, brownfield, 관리형, 비관리형, BDEF extension
---

## 설명

behavior definition(동작 정의, BDEF)는 RAP BDL 이라는 언어로 씁니다. BDL 로 쓴 글이 BDL 소스 코드입니다.

BDL 은 구현 타입에 따라 다른 문으로 시작합니다. 구현 타입은 다섯 가지입니다.

| 문 | 무엇을 정의하나 |
| --- | --- |
| `managed` | managed RAP BO |
| `unmanaged` | unmanaged RAP BO |
| `interface` | RAP BO interface |
| `projection` | projection BDEF |
| `abstract` | abstract BDEF |

### managed

transactional buffer(트랜잭션 버퍼)와 [[abenbdl_standard_operations|standard operation]] 을 managed RAP BO provider(제공자)가 맡습니다. 그래서 managed RAP BO 는 behavior pool(동작 풀) 없이도 바로 돌아가는 business object(비즈니스 객체)가 될 수 있습니다.

다만 [[abenbdl_nonstandard|non-standard operation]], [[abenbdl_validations|validation]], [[abenbdl_determinations|determination]] 처럼 구현이 필요한 요소를 더하는 순간부터는 behavior pool 이 있어야 합니다.

기존 코드가 많지 않아 중요한 부분을 처음부터 새로 만드는 개발(그린필드 개발)에서, 표준 구현으로 충분할 때 권합니다.

### unmanaged

transactional buffer 와 standard operation(표준 작업)을 behavior pool 에 직접 구현해야 합니다.

이미 있는 업무 로직을 다시 쓰려는 개발(브라운필드 개발)에 권합니다.

### interface

RAP BO interface 의 동작을 정의합니다. RAP BO interface 는 바깥에서 안정적으로 쓰라고 만든 창구이고, 보통 공개 API 로 릴리스합니다.

### projection

projection BDEF 는 managed 나 unmanaged RAP BO 위에 얹습니다. base BDEF(기반 BDEF) 를 그대로 비춘 것이며, base BDEF 의 작업과 특성 가운데 일부만 골라 내놓습니다. 업무 애플리케이션에서는 서비스마다 다른 동작을 정할 때 projection BDEF 를 씁니다.

projection BDEF 는 base BDEF 의 요소를 다시 씁니다. 어떤 특성과 작업을 어떤 조건에서 다시 쓸 수 있는지, projection BDEF 에 새로 더할 수 있는 것은 무엇인지는 [[abenbdl_projection_bo]] 에 있습니다.

### abstract

abstract BDEF 는 주로 action 이나 function 의 deep parameter 에 타입을 주는 데 씁니다. 쓸 수 있는 문법 요소가 association, type mapping 정도로 적습니다. 트랜잭션 동작은 정의할 수 없습니다. 쓸 수 있는 요소는 [[abenbdl_abstract]] 에 있습니다.

## 예제

구현 타입은 BDEF 의 첫 문에 적습니다. 아래는 managed BDEF 와, 그 위에 얹은 projection BDEF 의 첫머리입니다.

```bdl
// managed BDEF (ZR_Travel)
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
}
```

```bdl
// projection BDEF (ZC_Travel) : base BDEF 의 작업 가운데 일부만 내놓는다
projection;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
}
```

## 알아두기

- managed 와 unmanaged RAP BO 는 같은 키워드 묶음을 씁니다. 그 키워드는 [[abenbdl_rap_bo]] 에 모여 있습니다.
- RAP BO 는 BDEF extension(확장)으로 넓힐 수 있습니다. 규칙은 [[abenbdl_extension]] 에 있습니다.
- BDL 전체에 걸리는 문법 규칙은 [[abenbdl_general_syntax_rules]], 쓸 수 있는 언어 요소 전체는 [[abenrap_feature_table]] 에 있습니다.

## 관련 항목

- [[abenbdl_rap_bo]] : managed·unmanaged BDEF 의 키워드
- [[abenbdl_rap_bo_interface]] : interface BDEF
- [[abenbdl_projection_bo]] : projection BDEF
- [[abenbdl_abstract]] : abstract BDEF
- [[abenbdl_extension]] : BDEF extension
- [[abenbdl_impl_type]]
