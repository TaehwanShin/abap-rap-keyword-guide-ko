---
title: strict mode 버전 1 (strict)
summary: BDEF 둘째 줄에 strict; 를 적어 strict mode 버전 1 을 켭니다.
keywords: strict, strict mode, 엄격 모드, 버전 1, version 1, BDEF strict mode, 둘째 줄
---

## 문법

```syntax
...
strict;
 ...
```

## 설명

`strict` 는 BDEF strict mode **버전 1** 을 켭니다. strict mode 를 켜면 BDEF 에 문법 검사가 더 걸립니다.

`strict` 는 언제나 BDEF 의 **둘째 줄**에 와야 합니다. 다만 원문의 다른 예제([[abenbdl_saving]])에서는 구현 타입과 구현 클래스를 적는 머리말 첫 문이 두 줄에 걸쳐 있고, strict mode 구문은 그 문 다음인 셋째 줄에 옵니다.

strict mode 에서 더 지켜야 하는 문법 요구 사항 전체 목록은 SAP 의 RAP 개발 안내서 "Strict Mode - Implementation Requirements" 절에 있습니다.

## 예제

```bdl
managed implementation in class zbp_r_travel unique;
strict;

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

## 관련 항목

- [[abenbdl_strict]]
- [[abenbdl_strict_2]]
