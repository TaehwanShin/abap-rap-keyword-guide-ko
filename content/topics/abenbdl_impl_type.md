---
title: 구현 타입 (managed, unmanaged, projection, abstract, interface)
summary: BDEF 첫머리에 적어 이 behavior definition 이 managed·unmanaged·projection·abstract·interface 가운데 무엇인지 정하는 키워드입니다.
keywords: implementation type, 구현 타입, managed, unmanaged, projection, abstract, interface, 관리형, 비관리형, 프로젝션, 추상, 인터페이스, greenfield, brownfield, implementation managed
---

## 문법

```syntax
{ managed
| unmanaged
| abstract
| projection }
| interface ...
```

## 설명

BDEF 의 첫 키워드가 구현 타입입니다. 이 BDEF 가 어떤 종류이고, 동작을 누가 구현하는지를 정합니다.

| 키워드 | 뜻 | 언제 쓰나 |
| --- | --- | --- |
| `managed` | transactional buffer(트랜잭션 버퍼)와 standard operation(표준 작업, 생성·수정·삭제)을 managed RAP BO provider(제공자)가 맡습니다. | 기존 코드가 많지 않아 중요한 부분을 처음부터 새로 만드는 개발(그린필드 개발)에서, 표준 구현으로 충분할 때 권합니다. |
| `unmanaged` | transactional buffer 와 standard operation 을 behavior pool(동작 풀)에 직접 구현해야 합니다. | 이미 있는 업무 로직을 다시 쓰려는 개발(브라운필드 개발)에 권합니다. |
| `projection` | managed 나 unmanaged RAP BO 위에 얹는 projection BDEF 입니다. base BDEF(기반 BDEF) 를 그대로 비추며, 그 작업과 특성 가운데 일부만 내놓습니다. | 서비스마다 다른 동작을 정할 때 씁니다. [[abenbdl_projection_bo]] |
| `abstract` | abstract BDEF 입니다. 쓸 수 있는 문법 요소가 association, type mapping 정도로 적습니다. 트랜잭션 동작은 정의할 수 없습니다. | 주로 action·function 의 깊은 매개변수에 타입을 줄 때 씁니다. [[abenbdl_abstract]] |
| `interface` | RAP BO interface 의 동작을 정의합니다. | 바깥에서 안정적으로 쓸 창구를 만들 때 씁니다. 보통 공개 API 로 릴리스합니다. [[abenbdl_rap_bo_interface]] |

## 예제

구현 타입 `managed` 를 머리말 첫 줄에 적은 BDEF 입니다.

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
}
```

## 알아두기

- `implementation managed`, `implementation unmanaged`, `implementation projection`, `implementation abstract` 처럼 앞에 `implementation` 을 붙이는 옛 문법은 폐기되었습니다. `implementation` 을 빼고 씁니다.
- [[abenbdl_strict|strict mode]] 를 켠 BDEF 에서는 이 `implementation` 을 쓰면 안 됩니다.

## 관련 항목

- [[abenbdl_bdef_header]]
- [[abenbdl]]
- [[abenbdl_standard_operations]]
- [[abenbdl_projection_bo]]
- [[abenbdl_abstract]]
- [[abenbdl_rap_bo_interface]]
