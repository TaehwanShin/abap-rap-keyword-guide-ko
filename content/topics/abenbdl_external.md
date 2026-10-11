---
title: 바깥 이름 (external)
summary: entity behavior definition, action, function 등에 OData 에서만 보이는 다른 이름을 붙이는 추가 구문입니다.
keywords: external, ExternalName, 바깥 이름, 외부 이름, 별칭, OData 메타데이터, GetDefaultsFor, 추가 구문
---

## 문법

```syntax
... external 'ExternalName' ...
```

## 설명

`external` 은 바깥에서 쓸 다른 이름을 붙입니다. 이 이름은 **OData 메타데이터에 드러나지만 ABAP 은 알지 못합니다**. ABAP 코드에서는 원래 이름을 그대로 씁니다.

- 바깥 이름 `ExternalName` 은 작은따옴표(`'`) 안에 적습니다.
- 실제 action 이름보다 훨씬 길어도 됩니다.
- 문서에 `external` 을 쓸 수 있다고 나온 자리라면 어디에나 적을 수 있습니다. 예를 들어 entity(엔터티) behavior definition(동작 정의), action, function 에 붙입니다.

## 예제

RAP BO interface 에서 entity behavior definition 에 바깥 이름을 붙입니다.

```bdl
interface;

define behavior for ZI_Travel alias Travel
  external 'TravelRequest'
{
  use create;
  use update;
  use delete;
}
```

action 에도 붙일 수 있습니다. ABAP 에서는 `acceptTravel` 로 부르고, OData 메타데이터에는 긴 이름이 보입니다.

```bdl
action acceptTravel external 'AcceptTravelRequestAndNotifyAgency' result [1] $self;
```

## 알아두기

- [[abenbdl_default_function|default values function]]에 붙이는 바깥 이름은 `GetDefaultsFor` 로 시작해야 합니다. 그렇지 않으면 문법 오류가 납니다.

## 관련 항목

- [[abenbdl_operations_additions]]
- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_default_function]]
- [[abenbdl_action_output_para]]
