---
title: 전체 authorization context extension (extend own authorization context)
summary: 원본 BDEF 가 정의한 전체 authorization context 에, extension 구현이 새로 쓰는 권한 객체를 보태는 구문입니다.
keywords: extend own authorization context, own authorization context, 전체 권한 컨텍스트, full authorization context, 권한 객체, authorization object, contract check, BDEF 확장
---

## 문법

```syntax
extend own authorization context
{
  [AuthObject1;]
  [AuthObject2;]
  [...]
}
```

## 설명

전체 authorization context(own authorization context)는 BO 의 구현이 쓰는 권한 객체를 빠짐없이 적어 두는 목록입니다. `extend own authorization context` 는 이 목록에 권한 객체 `AuthObject1`, `AuthObject2`, ... 를 더 보탭니다.

원본 BDEF 가 전체 authorization context 를 정의했고, extension(확장) 구현이 원본 구현에서 쓰지 않던 권한 객체를 쓴다면 전체 authorization context 를 확장해야 합니다. 목록이 빠짐없이 완전해야 하기 때문입니다. 원본 BDEF 와 마찬가지로 전체 authorization context 는 몇몇 계약 점검(contract check)에서 평가되고, 목록이 완전하지 않으면 런타임 오류가 납니다.

- **전제 조건**: 원본 BDEF 가 전체 authorization context 를 정의하고 있어야 합니다. 그러면 따로 extensibility(확장 허용) 표시가 없어도 확장할 수 있습니다.
- 원본 BDEF 에 전체 authorization context 가 없으면 extension 으로 새로 보탤 수 없습니다.
- extension BDEF 의 다른 요소 앞, 사이, 뒤 어디에든 적을 수 있습니다.
- 권한 객체를 하나도 넣지 않은 빈 컨텍스트도 적을 수 있습니다.

전체 authorization context 의 개념은 [[abenbdl_def_own_auth_context]] 에 있습니다.

## 예제

원본 BDEF `ZR_Travel` 이 전체 authorization context 를 정의해 두었습니다.

```bdl
// 원본 BDEF ZR_Travel 의 일부
define own authorization context
{
  'ZTRAVEL';
}
```

extension behavior pool(동작 풀)이 권한 객체 `ZTRAVEL_X` 를 새로 쓰므로, extension 에서 그것을 목록에 보탭니다.

```bdl
extension implementation in class zbp_x_travel_ext unique;

extend own authorization context
{
  'ZTRAVEL_X';
}
```

## 알아두기

- extension 구현에서 쓰는 권한 객체를 빠뜨리면 계약 점검에서 런타임 오류가 납니다.
- 원본에 전체 authorization context 가 없는데 extension 에서 만들 수는 없습니다.

## 관련 항목

- [[abenbdl_def_own_auth_context]]
- [[abenbdl_authorization_context]]
- [[abenbdl_privileged_mode_extension]]
- [[abenbdl_extensibility_managed_unm]]
