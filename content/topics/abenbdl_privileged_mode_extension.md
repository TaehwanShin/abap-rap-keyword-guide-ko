---
title: extension 의 privileged mode (with privileged mode)
summary: BDEF extension 에서 BDEF privileged mode 를 켜서, 특권 EML 호출 때 extension 에 정의한 authorization context 가 자동으로 꺼지게 하는 구문입니다.
keywords: with privileged mode disabling, privileged mode, BDEF 특권 모드, PRIVILEGED, 특권 접근, authorization context, 권한 컨텍스트, extension, BDEF 확장
---

## 문법

```syntax
...
with privileged mode disabling ContextName;
...
```

## 설명

확장한 RAP BO 에 BDEF privileged mode 를 켭니다. BDEF privileged mode 가 켜져 있어야 그 BO 를 EML 로 쓸 때 추가 구문 `PRIVILEGED` 를 붙일 수 있습니다.

`ContextName` 은 **같은 BDEF extension(확장) 안에 정의한** 확인 생략용 authorization context(authorization context for disable)여야 합니다. `with privileged mode disabling` 뒤에는 컨텍스트를 하나만 적을 수 있습니다.

RAP BO consumer(사용자)가 확장한 BO 에 특권 접근을 하면 authorization context `ContextName` 이 자동으로 꺼집니다.

### 원본과 extension 중 한쪽만 켠 경우

원본 BDEF 나 그 extension 가운데 어느 하나라도 privileged mode 를 켜면 EML 특권 접근을 쓸 수 있습니다.

| 원본 BDEF | extension | 결과 |
| --- | --- | --- |
| 켬 | 켜지 않음 | 특권 EML 접근을 쓸 수 있습니다. |
| 켜지 않음 | 켬 | 특권 EML 접근을 쓸 수 있지만 문법 경고가 납니다. |

두 번째 경우에 경고가 나는 까닭은 특권 접근이 extension 에 달려 있기 때문입니다. 원본 BDEF 스스로는 privileged mode 를 켜지 않았으므로, extension 이 지워지면 특권 호출에서 문법 오류가 나게 됩니다.

## 예제

extension 에 authorization context `ExtContext` 를 정의하고, privileged mode 에서 그것을 끄도록 합니다.

```bdl
extension using interface ZI_Travel;
with privileged mode disabling ExtContext;

extend behavior for Travel
{
}

define authorization context ExtContext
{
  'ZTRAVEL_X';
}
```

이제 사용하는 쪽에서 `PRIVILEGED` 를 붙여 접근할 수 있습니다. 이 호출 동안에는 `ExtContext` 에 적은 권한 객체의 확인이 꺼집니다.

```abap
READ ENTITIES OF zi_travel PRIVILEGED
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed).
```

## 알아두기

- 다른 extension 이나 원본 BDEF 에 정의한 authorization context 는 `ContextName` 자리에 적을 수 없습니다.
- privileged mode 의 일반 개념은 [[abenbdl_privileged_mode]] 에, EML 쪽 쓰임은 [[abapeml_privileged]] 에 있습니다.

## 관련 항목

- [[abenbdl_privileged_mode]]
- [[abapeml_privileged]]
- [[abenbdl_extension_header]]
- [[abenbdl_def_auth_context]]
- [[abenbdl_extend_own_auth_context]]
