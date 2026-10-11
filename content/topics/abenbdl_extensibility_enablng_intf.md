---
title: RAP BO interface 의 extensibility
summary: interface BDEF 머리말에 extensible 을 적으면 interface 에 든 모든 entity 와 구성요소에 extension 이 허용되며, 실제 extension 은 그 아래 base BO 에 붙습니다.
keywords: extensible, interface, RAP BO interface, 인터페이스 BDEF, RAP BO 인터페이스, 확장 허용, using interface, BDEF 확장, 기반 BO
---

## 문법

```syntax
interface
[...]
extensible
{ entity behavior definition }
...
```

## 설명

RAP BO interface(interface BDEF)에서는 **머리말에** `extensible` 을 적어 BDEF extension(확장)을 허용합니다. 이 선언 하나로, interface 에 들어 있는 모든 RAP BO entity(엔터티)와 구성요소가 대상이 됩니다. base BO(기반 BO)나 projection BDEF와 달리 entity 마다 다시 적지 않습니다.

한 가지 알아 둘 점이 있습니다. **RAP BO interface 자체를 직접 확장할 수는 없습니다.** extension 은 언제나 그 아래의 base BO 에 붙습니다. 확장하는 쪽이 `using interface` 추가 구문으로 이 RAP BO interface 를 가리킵니다. 곧 interface 는 "이 창구를 거쳐 base BO 를 확장해도 된다"는 통로 역할을 합니다.

## 예제

interface BDEF `ZI_Travel` 을 `extensible` 로 선언합니다.

```bdl
interface;
extensible;

define behavior for ZI_Travel alias Travel
{
  use create;
  use update;
  use delete;

  use action acceptTravel;
}
```

이제 base BDEF(기반 BDEF) extension 이 `using interface` 로 이 interface 를 거쳐 확장할 수 있습니다.

```bdl
extension using interface zi_travel;

extend behavior for Travel
{
  // 여기에 덧붙일 동작을 적는다
}
```

## 알아두기

- RAP BO interface 를 직접 확장할 수는 없습니다. extension 대상은 언제나 base BO 입니다.
- draft 나 side effects 를 쓰는 interface 라면 머리말에 `use draft;`, `use side effects;` 와 나란히 `extensible;` 을 적습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling]]
- [[abenbdl_using_interface]]
- [[abenbdl_bo_interface_header]]
- [[abenbdl_define_beh_interface]]
- [[abenbdl_extensible]]
- [[abenbdl_extension_syntax]]
- [[abenbdl_use_projection]]
