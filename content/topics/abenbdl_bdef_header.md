---
title: behavior definition 머리말 (BehaviorDefinitionHeader)
summary: BDEF 맨 위에 적는 머리말의 문법으로, 구현 타입·strict mode·draft·privileged mode 처럼 RAP BO 전체에 걸리는 설정을 정합니다.
keywords: BDEF header, BehaviorDefinitionHeader, 머리말, 머리말, managed, unmanaged, implementation in class, strict, auxiliary class, extensible, with draft, with collaborative draft, with privileged mode, with cross associations, foreign entity, save after
---

## 문법

```syntax
managed | unmanaged [SavingOptions]
      {[implementation in class ClassName unique]};
[strict[(version)];]
[auxiliary class ClassName1[, ClassName2] [, ...];]
[extensible;]
[with draft; | with collaborative draft;]
[with privileged mode disabling ContextName;]
[with cross associations;]
[foreign entity EntityName;]
 EntityBehaviorDefinition1[, EntityBehaviorDefinition2][, ...]
[AuthorizationContext1][, AuthorizationContext2][, ... ]
[save after BdefName1[, BdefName2, ...];]
...
```

## 설명

BDEF 는 머리말과, 하나 이상의 entity(엔터티) behavior definition(동작 정의)로 이루어집니다. 필요하면 authorization context 도 하나 이상 넣을 수 있습니다.

머리말에는 **RAP BO 전체**에 걸리는 설정을 적습니다. 구현 타입만 꼭 적어야 하고, 나머지는 모두 선택입니다.

| 구문 | 하는 일 |
| --- | --- |
| `managed`, `unmanaged` | 구현 타입을 정합니다. [[abenbdl_impl_type]] |
| `SavingOptions` | 기본 save sequence(저장 순서)에 단계를 보태거나, 기본 저장을 끄고 직접 만든 저장 방식으로 바꿉니다. [[abenbdl_saving]] |
| `implementation in class ClassName unique` | 동작을 구현할 클래스를 정합니다. [[abenbdl_in_class_unique]] |
| `strict[(version)]` | BDEF strict mode 를 켭니다. RAP 프레임워크가 처리합니다. [[abenbdl_strict]] |
| `auxiliary class ...` | 이 RAP BO 에 더 넓게 접근할 수 있는 ABAP 클래스를 하나 이상 더 정합니다. behavior pool(동작 풀)의 구현을 돕는 보조 클래스입니다. [[abenbdl_auxiliary_class]] |
| `extensible` | BDEF extension(확장)을 허용합니다. 적지 않으면 이 BDEF 는 확장할 수 없습니다. [[abenbdl_extensible]] |
| `with draft` | draft 처리를 켭니다. 사용자가 바꾼 내용을 draft 로 저장해 두었다가 나중에 이어서 편집할 수 있습니다. RAP 프레임워크가 처리합니다. [[abenbdl_with_draft]] |
| `with collaborative draft` | draft 처리를 켜고, 여러 사용자가 같은 draft 인스턴스를 함께 고칠 수 있게 합니다. [[abenbdl_with_coll_draft]] |
| `with privileged mode disabling ContextName` | BDEF privileged mode 를 켭니다. RAP BO consumer(사용자)가 특권 EML 호출로 이 BO 에 접근하면 authorization context `ContextName` 이 저절로 꺼집니다. [[abenbdl_privileged_mode]] |
| `with cross associations` | 다른 BO 로 가는 association 의 작업을 managed RAP BO provider(제공자)가 맡게 합니다. [[abenbdl_with_cross_assoc]] |
| `foreign entity EntityName` | BO 구조에 들지 않는 entity 를 응답 구조의 구성요소로 넣습니다. 다른 BO 의 메시지를 옮겨 담을 수 있게 됩니다. [[abenbdl_foreign]] |
| `save after ...` | 저장 차례를 직접 정합니다. [[abenbdl_save_after]] |

`SavingOptions` 에는 조건이 몇 가지 따릅니다.

- 머리말에 적으면 BO 의 모든 entity 에 걸립니다. entity 동작 특성으로 entity 마다 적을 수도 있습니다.
- 적으면 behavior pool 에 구현이 있어야 합니다.
- managed 에서만 쓸 수 있습니다. unmanaged 에서는 save sequence 를 언제나 직접 구현하기 때문입니다.

`implementation in class ClassName unique` 는 managed 에서는 선택입니다. managed 구현에 직접 구현하는 요소를 더했을 때만 필요합니다.

머리말 뒤에는 다음 가운데 하나가 옵니다.

- `define behavior for` 로 시작하는 [[abenbdl_define_beh|entity behavior definition]] 하나 이상
- `define [own] authorization context` 로 시작하는 [[abenbdl_authorization_context|authorization context]] 정의 하나 이상

## 예제

머리말이 세 줄인 managed BDEF 입니다. 구현 타입 `managed`, strict mode 버전 2, 외부 entity `ZI_Customer` 를 정합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
// 고객 BO 의 메시지를 옮겨 담을 수 있게 한다
foreign entity ZI_Customer;

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

## 관련 항목

- [[abenbdl_impl_type]]
- [[abenbdl_in_class_unique]]
- [[abenbdl_strict]]
- [[abenbdl_auxiliary_class]]
- [[abenbdl_extensible]]
- [[abenbdl_draft_handling]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_with_cross_assoc]]
- [[abenbdl_foreign]]
- [[abenbdl_save_after]]
- [[abenbdl_define_beh]]
- [[abenbdl_authorization_context]]
- [[abenbdl_extension]]
- [[abapeml_privileged]]
