---
title: strict mode 버전 2 (strict(2))
summary: BDEF 둘째 줄에 strict(2); 를 적어 strict mode 버전 2 를 켭니다. RAP BO 계약 위반을 더 엄하게 잡고, C0 계약으로 릴리스하려면 꼭 있어야 합니다.
keywords: strict(2), strict ( 2 ), strict mode, 엄격 모드, 버전 2, version 2, RAP BO contract, 계약, C0, extensibility, 런타임 오류, 둘째 줄
---

## 문법

```syntax
...
strict(2);
 ...
```

## 설명

`strict(2)` 는 BDEF strict mode **버전 2** 를 켭니다.

strict mode 를 켜면, 평소에는 문법 경고로 끝나던 낡은 문법이 **문법 오류**가 됩니다.

버전 2 는 주로 RAP BO 계약(RAP BO provider(제공자)와 consumer(사용자)가 지켜야 하는 약속)을 더 엄하게 확인합니다. 계약을 어기면 실패한 단언(assertion)으로 끝나지 않고 **런타임 오류**가 납니다.

버전 2 는 버전 1 의 검사를 모두 하고, 문법 검사를 몇 가지 더합니다.

`strict(2)` 는 언제나 BDEF 의 **둘째 줄**에 와야 합니다. 다만 원문의 다른 예제([[abenbdl_saving]], [[abenbdl_save_after_abexa]])에서는 구현 타입과 구현 클래스를 적는 머리말 첫 문이 두 줄에 걸쳐 있고, `strict(2)` 는 그 문 다음인 셋째 줄에 옵니다.

strict mode 버전 2 에서 더 지켜야 하는 문법 요구 사항 전체 목록은 SAP 의 RAP 개발 안내서 "Strict Mode - Implementation Requirements" 절에 있습니다.

## 예제

extension(확장)용 API 로 C0 계약 아래 릴리스할 것을 염두에 둔 BDEF 입니다. 그래서 `strict ( 2 )` 를 쓰고, `extensible` 로 extension 에서 허용할 것을 밝혀 둡니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
extensible
{ with determinations on modify;
  with determinations on save;
  with validations on save; }

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
extensible
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

## 알아두기

- RAP BO 를 extension 용 C0 계약으로 릴리스하려면 strict mode 버전 2 가 먼저 켜져 있어야 합니다.

## 관련 항목

- [[abenbdl_strict]]
- [[abenbdl_strict_1]]
- [[abenbdl_extensible]]
