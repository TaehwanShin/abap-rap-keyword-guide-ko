---
title: IN LOCAL MODE 추가 구문
summary: behavior implementation 안에서 자기 BO 를 읽거나 고칠 때 feature control, 권한 확인, precheck 를 건너뛰게 하는 EML 추가 구문입니다.
keywords: IN LOCAL MODE, 로컬 모드, READ ENTITIES, MODIFY ENTITIES, 기능 제어, feature control, 권한 확인, authorization, 사전 점검, precheck, readonly, PRIVILEGED, FORWARDING PRIVILEGED, BDEF 확장
---

## 문법

```syntax
... IN LOCAL MODE ...
```

## 설명

`IN LOCAL MODE` 를 붙이면 feature control(기능 제어), 권한 확인, precheck 를 하지 않습니다. 다음 EML 문에 붙일 수 있습니다.

- [[abapread_entity_entities|READ ENTITY, ENTITIES]]
- [[abapmodify_entity_entities|MODIFY ENTITY, ENTITIES]]

이 추가 구문은 **접근하려는 그 BO 를 구현하는 코드** 안에서만 쓸 수 있습니다. 곧 그 BO 의 구현 클래스, 그리고 그 구현 클래스가 부르는 코드(예전부터 있던 코드나 함께 쓰는 공통 로직)에서만 됩니다. 구현 클래스가 부르는 코드에 쓰면 컴파일할 때 경고가 납니다. 실행할 때 그 코드가 정말로 그 BO 의 구현 클래스를 거쳐 불렸다면 문제없이 돌아갑니다. 그렇지 않으면 런타임 오류가 납니다.

### 언제 쓰나

Fiori 화면에 여행의 예약 상태를 보여 주는 필드가 있다고 합시다. BDEF 에서 `readonly` 로 해 두었으므로 사용자는 화면에서 이 필드를 직접 바꿀 수 없습니다. 처음에는 "예약 안 됨"으로 보입니다. 화면의 버튼을 누르면 예약하는 action 이 실행되고 상태가 "예약됨"으로 바뀌어야 합니다. action 구현 안의 `MODIFY` 에 `IN LOCAL MODE` 를 붙이면 feature control 을 건너뛰므로 readonly 필드도 바꿀 수 있습니다.

### 어디까지 건너뛰나

RAP BO 하나의 구현은 보통 여러 RAP BO provider(제공자), 곧 여러 behavior pool(동작 풀)로 나뉩니다. base BO(기반 BO) 의 behavior pool 이 있고, BDEF extension(확장)마다 behavior pool 이 따로 있습니다. provider 는 자기 BDEF 에 적힌 요소(action 같은 것, 또는 entity(엔터티) 전체)를 **소유**하고 그 구현을 맡습니다.

`IN LOCAL MODE` 의 효과를 알려면 두 가지 provider 를 나눠 봐야 합니다.

| 구분 | 뜻 |
| --- | --- |
| 쓰는 provider | EML 문이 들어 있거나, 그 EML 문을 간접으로 부르는 provider |
| 소유한 provider | EML 문에서 쓰는 요소를 소유한 provider |

`IN LOCAL MODE` 는 쓰는 provider 와 소유한 provider 가 같은 요소에서만 점검을 건너뜁니다. 자기가 소유하지 않은 작업이나 요소의 점검은 건너뛸 수 없습니다.

- base BO 의 behavior pool 에서 factory action 이 `MODIFY ... IN LOCAL MODE` 로 같은 BO 의 인스턴스를 새로 만듭니다. 생성 작업에 precheck 가 걸려 있어도 precheck handler method(핸들러 메서드)는 불리지 않습니다.
- extension behavior pool 의 핸들러에서 수정 작업 하나가 extension entity 와 base BO 의 root entity(루트 엔터티)를 함께 고칩니다. `IN LOCAL MODE` 를 붙이면 extension entity 의 점검은 건너뛰지만 base BO root entity 의 점검은 그대로 합니다.

## 예제

`Status` 를 readonly 로 두고, 예약 action 에서만 바꾸게 합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  field ( readonly ) Status;
  action bookTravel result [1] $self;
}
```

```abap
METHOD booktravel.
  " readonly 필드지만 IN LOCAL MODE 라서 바꿀 수 있다
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( status )
      WITH VALUE #( FOR key IN keys ( %tky = key-%tky status = 'B' ) )
    FAILED failed
    REPORTED reported.

  " 권한 확인 없이 바뀐 내용을 다시 읽는다
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  result = VALUE #( FOR ls_travel IN lt_travel
                    ( %tky = ls_travel-%tky %param = ls_travel ) ).
ENDMETHOD.
```

## 알아두기

- BO 구현 도중에 부른 BAdI 는 BO 구현의 일부로 치지 않습니다. BAdI 안에서 `IN LOCAL MODE` 를 쓰면 런타임 오류가 납니다.
- BDEF extension 에서는 `IN LOCAL MODE` 가 그 extension 이 소유한 작업에만 듣습니다. 원래 BO 나 다른 extension 이 소유한 작업에는 듣지 않습니다.
- BDEF extension 에서 EML 요청에 `IN LOCAL MODE` 를 쓰면 `PRIVILEGED` 를 붙인 것처럼 privileged mode 가 저절로 쓰입니다. privileged mode 는 그 EML 요청 전체에 걸리고, RAP BO 가 privileged mode 를 받아들이면 권한 확인이 꺼집니다.
- 원래 BO 의 구현에서 `IN LOCAL MODE` 를 쓰면 [[abapeml_privileged|FORWARDING PRIVILEGED]] 를 붙인 것과 같은 효과가 납니다.
- 여러 BO 를 넘나드는 association 에서, association 의 출발 쪽에 `IN LOCAL MODE` 로 association 요청(read-by-association, create-by-association)을 보내면 도착 쪽 BO 의 구현은 로컬 모드가 아니라 privileged mode 로 불립니다. 그래서 도착 쪽의 권한 확인을 건너뜁니다. 도착 쪽 BO 에 privileged mode 가 정의되어 있을 때만 그렇습니다.
- BDEF 에서 `readonly` 로 해 둔 필드는 `IN LOCAL MODE` 없이는 어떤 수정 작업으로도 바꿀 수 없습니다.

## 관련 항목

- [[abeneml_in_abp]]
- [[abapread_entity_entities]]
- [[abapmodify_entity_entities]]
- [[abapeml_privileged]]
- [[abenbdl_privileged_mode]]
- [[abapeml_fields_tab]]
