---
title: RAP BDL 일반 문법 규칙
summary: BDL 에서 키워드는 소문자로 쓰고, 이름은 30자 이하이며, 주석은 // 로, 문장 끝은 세미콜론으로 적는다는 기본 규칙입니다.
keywords: general syntax rules, 일반 문법 규칙, keyword, 키워드, 소문자, name, 이름, 30자, comment, 주석, //, separator, 세미콜론, 대소문자
---

## 설명

RAP business object(비즈니스 객체)를 정의하는 BDL 에는 어디에나 통하는 규칙이 몇 가지 있습니다.

### 키워드

- 키워드는 **소문자**로만 씁니다. 대문자는 쓸 수 없습니다.

### 이름

- 이름은 대소문자를 가리지 않습니다.
- 길이는 1자 이상 30자 이하입니다.
- 글자, 숫자, 밑줄(`_`)을 쓸 수 있습니다.
- 첫 글자는 글자이거나 밑줄이어야 합니다.
- BDEF 구성요소의 이름은 같은 RAP BO 안에서 겹치면 안 됩니다.

### 주석

- 슬래시 두 개(`//`)부터 그 줄 끝까지가 주석입니다.

### 구분 기호

- 문은 세미콜론(`;`)으로 닫을 수 있습니다. 자리에 따라 꼭 써야 하는 곳도 있습니다.

## 예제

```bdl
// 키워드(managed, define behavior for ...)는 모두 소문자
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel   // 이름은 대소문자를 가리지 않는다
persistent table ztravel
lock master
authorization master ( instance )
{
  create;        // 문 끝은 세미콜론
  update;
  delete;

  // action 이름: 글자로 시작하고 30자를 넘지 않는다
  action acceptTravel result [1] $self;
}
```

## 알아두기

- `Managed`, `CREATE` 처럼 키워드에 대문자를 섞으면 안 됩니다.
- 이름은 대소문자를 가리지 않으므로 `acceptTravel` 과 `ACCEPTTRAVEL` 은 같은 이름입니다.

## 관련 항목

- [[abenbdl_syntax]]
- [[abenbdl_pragma]]
- [[abenrap_feature_table]]
