---
title: extension 머리말 (ExtensionHeader)
summary: BDEF extension 의 머리말에 적을 수 있는 세 가지, 곧 extension behavior pool 지정, privileged mode, extensibility 를 정리한 항목입니다.
keywords: ExtensionHeader, extension header, 확장 머리말, implementation in class unique, with privileged mode disabling, extensible, 확장 동작 풀, 확장 ABP, BDEF 확장
---

## 문법

```syntax
...
[implementation in class ClassName unique;]
[with privileged mode disabling ContextName;]
[extensible  ;]
...
```

## 설명

BDEF extension(확장)의 머리말은 extension 전체에 걸리는 설정을 적는 자리입니다. 적을 수 있는 것은 세 가지이고, 모두 선택 항목입니다.

| 구문 | 하는 일 |
| --- | --- |
| `implementation in class ClassName unique` | extension 의 behavior implementation(동작 구현)을 담을 extension behavior pool(동작 풀, extension ABP)을 정합니다. extension 이 구현이 필요한 요소를 정의할 때만 적습니다. |
| `with privileged mode disabling ContextName` | BDEF privileged mode 를 켭니다. RAP BO consumer(사용자)가 특권 EML 호출로 이 BO 에 접근하면 확인 생략용 authorization context `ContextName` 이 자동으로 꺼집니다. |
| `extensible` | 이 extension 위에 다시 extension 을 얹는 것(extension 겹치기)을 허용합니다. |

각 구문의 자세한 내용은 아래 항목에서 다룹니다.

- [[abenbdl_in_class_unique_ext]] : extension behavior pool 을 정하는 위치와, 원본 behavior pool 과 extension behavior pool 사이의 규칙
- [[abenbdl_privileged_mode_extension]] : extension 에서 켜는 BDEF privileged mode
- [[abenbdl_ext_enabl_ext_base]] : extension 겹치기를 허용하는 방법

## 예제

extension behavior pool 을 정하고 privileged mode 를 켠 머리말입니다. privileged mode 에서 끌 authorization context `ExtContext` 는 같은 extension 안에 정의합니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;
with privileged mode disabling ExtContext;

extend behavior for Travel
{
  action ( authorization : instance ) holdTravel;
}

define authorization context ExtContext
{
  'ZTRAVEL_X';
}
```

## 알아두기

- 구현이 필요한 요소가 하나도 없는 extension 은 `implementation in class` 를 적지 않아도 됩니다.
- `with privileged mode disabling` 뒤에는 같은 extension 에 정의한 authorization context 하나만 적을 수 있습니다.

## 관련 항목

- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_privileged_mode_extension]]
- [[abenbdl_ext_enabl_ext_base]]
- [[abapeml_privileged]]
- [[abenbdl_using_interface]]
- [[abenbdl_extend_beh]]
