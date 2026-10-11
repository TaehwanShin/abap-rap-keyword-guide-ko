---
title: BDEF strict mode (strict)
summary: BDEF 에 문법 검사를 더 걸어 옛 문법을 막고 좋은 작성 방식을 따르게 하는 strict mode 로, 버전 1(strict)과 버전 2(strict(2))가 있습니다.
keywords: strict, strict(2), strict mode, 엄격 모드, BDEF strict mode, 문법 검사, 버전 1, 버전 2, extensible, released API
---

## 문법

```syntax
... strict;
  | strict(2);
```

## 설명

strict mode 는 BDEF 에 문법 검사를 **더** 겁니다. 예를 들면 다음을 확인합니다.

- 낡은 문법을 쓰지 않았는가
- 적지 않아도 저절로 있던 작업을 드러내어 선언했는가
- RAP BO 가 좋은 작성 방식(best practice)을 따르는가

strict mode 는 RAP 프레임워크가 해 줍니다. behavior pool(동작 풀)에 구현할 것은 없습니다.

지금 쓸 수 있는 버전은 둘입니다.

| 구문 | 버전 |
| --- | --- |
| `strict` | strict mode 버전 1 |
| `strict(2)` | strict mode 버전 2. 버전 1 의 규칙을 모두 담고 검사를 몇 가지 더합니다. |

가장 새 버전을 쓰기를 권합니다. strict mode 가 **필수**인 경우도 있습니다. RAP BO 를 [[abenbdl_extensible|extension 가능]]하다고 선언할 때, BDEF 를 공개 API 로 릴리스할 때가 그렇습니다.

### 어디서 쓸 수 있나

다음 구현 타입의 BDEF 에서 쓸 수 있습니다.

- `managed`
- `unmanaged`
- `projection` : base BDEF(기반 BDEF) 가 먼저 strict mode 를 써야 합니다. 바탕과 projection 은 같은 버전을 써야 합니다.
- `abstract`

## 예제

```bdl
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
  field ( readonly : update ) TravelID;
}
```

## 알아두기

- 이 참고서의 원문(ABAP 키워드 문서)은 모든 BDL 문을 strict mode 의 요구에 맞추어 설명합니다.

## 관련 항목

- [[abenbdl_strict_1]] : 버전 1 을 켜는 `strict`
- [[abenbdl_strict_2]] : 버전 2 를 켜는 `strict(2)`
- [[abenbdl_extensible]]
- [[abenbdl_bdef_header]]
