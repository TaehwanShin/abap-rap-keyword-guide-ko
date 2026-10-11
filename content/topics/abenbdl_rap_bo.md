---
title: managed·unmanaged behavior definition
summary: 구현 타입 managed 와 unmanaged 의 BDEF 는 같은 키워드 묶음을 쓰며, 그 키워드를 BDEF 안의 자리별로 나누어 다루는 갈래입니다.
keywords: managed, unmanaged, 관리형, 비관리형, behavior definition, 동작 정의, BDEF header, entity behavior definition, authorization context, 키워드
---

## 설명

구현 타입이 `managed` 인 RAP BO 와 `unmanaged` 인 RAP BO 는 **같은 키워드 묶음**으로 만듭니다. 이 갈래는 그 키워드를 BDEF 안에서 놓이는 자리에 따라 나누어 설명합니다.

키워드는 같아도 두 타입에서 쓰임새가 다른 것이 있습니다. 또 managed 에서는 RAP 프레임워크가 알아서 해 주지만 unmanaged 에서는 직접 구현해야 하는 것도 있습니다. 이런 차이는 키워드마다 그 항목에서 따로 적습니다.

## 예제

같은 entity(엔터티)를 managed 와 unmanaged 로 적으면 뼈대는 거의 같습니다. unmanaged 에서는 `persistent table` 이 빠지고, standard operation(표준 작업)을 behavior pool(동작 풀)에 직접 구현해야 한다는 점이 다릅니다.

```bdl
// managed
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
// unmanaged
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
}
```

## 관련 항목

자리별 하위 항목은 다음과 같습니다.

- [[abenbdl_bdef_header]] : BDEF 맨 위에 적는, RAP BO 전체에 걸리는 설정
- [[abenbdl_define_beh]] : `define behavior for` 로 entity 하나의 동작을 정의하는 부분
- [[abenbdl_authorization_context]] : 권한 객체를 묶어 두는 authorization context

다른 구현 타입은 [[abenbdl]] 에서 볼 수 있습니다.
