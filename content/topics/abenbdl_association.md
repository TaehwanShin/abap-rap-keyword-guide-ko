---
title: association 작업 (association)
summary: association 을 따라가 대상 entity 를 읽거나 만드는 작업을 behavior definition 에 선언하는 문법입니다.
keywords: association, 연관 관계, 연관 관계 작업, read-by-association, create-by-association, abbreviation, without response, using, with draft, internal, 연관 관계로 읽기, 연관 관계로 생성
---

## 문법

```syntax
... [internal] [AssocImplType] association _Assoc[;]
               [abbreviation newName]
               [without response]
               [using TargetEntity {\_ReverseAssoc |~TargetAltKey}]
       [{
       [StandardOperationsForAssoc];
       [NonStandardOperationsForAssoc];
       [with draft];
        }]
```

## 설명

association 작업은 association 을 따라가서 **연관 대상 entity(엔터티)**에 영향을 주는 작업입니다. behavior definition(동작 정의)의 entity 동작 본문(`define behavior for ... { }` 안)에 선언합니다. 두 갈래가 있습니다.

- [[abenbdl_assoc_stand_ops|standard operation]] : read-by-association 과 create-by-association 입니다.
- [[abenbdl_assoc_nonstand_ops|non-standard operation]] : 미리 정해진 link action, unlink action, inverse function 같은 것입니다.

### read-by-association

`association _Assoc;` 처럼 association 을 적기만 하면 읽기가 자동으로 열립니다. 읽기만을 위한 키워드는 따로 없습니다. RAP BO consumer(사용자)는 이 선언 덕분에 entity 의 연관 대상을 읽을 수 있습니다.

- 같은 BO 안의 association 에도, 다른 BO 로 가는 association 에도 쓸 수 있습니다.
- 연관 대상 entity 에 자기 behavior definition 이 있어야 합니다.
- 같은 BO 안에서는, behavior definition 이 있는 entity 로 가는 association 에 적어도 읽기는 반드시 열어야 합니다.

### 추가 구문

- `internal` : 그 association 에 정의한 모든 작업을 BO 안에서만 쓸 수 있게 합니다. 자동으로 열리는 읽기도 포함됩니다. [[abenbdl_internal]] 참고.
- `AssocImplType` : association 작업을 누가 처리할지 정합니다. [[abenbdl_assoc_impl_type]] 참고.
- `abbreviation newName` : association 에 짧은 다른 이름을 붙입니다. 길이는 16자까지입니다. association 이름은 root entity(루트 엔터티)의 이름 공간에 속하고 30자까지 쓸 수 있는데, 상황에 따라 ABAP RAP 가 처리하기에는 너무 깁니다. 더 짧은 이름이 필요하면 16자 이하의 줄임 이름을 지정하라는 안내가 나옵니다. 줄임 이름은 밑줄이 아니라 글자로 시작하는 편이 좋습니다.
- `without response` : 다른 BO 의 entity 가 대상인 association 에 씁니다. 기본으로는 대상 entity 가 [[abenbdl_foreign|외부 entity]]로서 지금 BO 의 응답 타입에 자동으로 들어갑니다. 그래서 association 으로 읽거나 만들 때 대상 entity 에서 생긴 문제도 응답에 담을 수 있습니다. `without response` 는 이 기본 동작을 끄고 대상 entity 를 응답 타입에서 뺍니다.
- `using TargetEntity ...` : 다른 BO 로 가는 대상 해석(target-resolved) association 에 씁니다. read-by-association 같은 작업에서 대상 인스턴스를 읽으려면 대상의 기본 키를 알아야 하는데, 그 키를 어떻게 구할지 정합니다. 방법은 아래 두 가지입니다.
- `with draft` : association 이 draft 를 다루게 합니다. active(활성) 인스턴스에서 따라가면 active 데이터를, draft 인스턴스에서 따라가면 draft 데이터를 가져옵니다. draft 처리 전반은 [[abenbdl_with_draft]] 에 있습니다.

### using 의 두 가지 방법

**역방향 association 으로 구하기** — `using TargetEntity \_ReverseAssoc`

지금 association 의 역방향 association 을 적습니다. 대상 entity 에서 그 역방향 association 에 정의한 [[abenbdl_inverse_funct|inverse function]] 이 실행됩니다. 이 function 은 소스 entity 의 기본 키를 입력으로 받아 대상 entity 의 기본 키를 돌려줍니다.

**대체 키와 key function 으로 구하기** — `using TargetEntity ~TargetAltKey`

대상 entity 의 대체 키를 적습니다. 대상 entity 에 정의한 key function 이 실행됩니다. 대상 entity 에 대체 키가 선언되어 있어야 하고, 그 대체 키는 소스 entity 의 기본 키여야 합니다. key function 은 소스 entity 의 기본 키를 입력으로 받아 대상 entity 의 기본 키를 돌려줍니다. 역방향 association 이 없는 재사용 객체와 엮을 때 주로 씁니다.

### 어디에서 쓸 수 있나

- managed RAP BO : managed RAP BO provider(제공자)가 association 작업을 처리합니다.
- unmanaged RAP BO : behavior pool(동작 풀)의 handler method(핸들러 메서드)에 직접 구현합니다. read-by-association 은 [[abaphandler_meth_read|FOR READ]] 에, create-by-association 은 [[abaphandler_meth_modify|FOR MODIFY]] 에 구현합니다.
- projection BDEF 와 RAP BO interface : base BDEF(기반 BDEF) 의 association 작업을 `use` 로 다시 씁니다. [[abenbdl_use_projection]] 참고.

## 예제

여행에서 예약으로 가는 composition `_Booking` 에는 읽기와 생성을 엽니다. 예약에서 여행으로 가는 to-parent association `_Travel` 은 읽기만 엽니다.

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

  // 적기만 해도 읽기가 열린다. create 를 넣으면 예약 생성도 열린다
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID;

  // 부모 쪽은 읽기만
  association _Travel;
}
```

RAP BO consumer 는 association 을 따라 예약을 읽습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel BY \_booking
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_booking)
  FAILED DATA(ls_failed).
```

draft 를 쓰는 BO 라면 자식으로 가는 association 에 `with draft` 를 적습니다. 다른 BO 로 가는 association 에서 대상 entity 를 응답 타입에서 빼려면 `without response` 를 붙입니다.

```bdl
// draft 를 쓰는 BO
association _Booking { create; with draft; }

// 다른 BO 의 entity 가 대상인 association
association _Attachment without response { create; }
```

## 알아두기

- BO 가 draft 를 쓰면 association 도 모두 draft 를 다루게 해야 합니다. 그래야 association 이 늘 같은 상태(draft 면 draft, active 면 active)의 대상으로 이어집니다.
- BO 에 `with draft` 를 붙이는 순간 BO 안의 association 은 모두 자동으로 draft 를 다룹니다. 이 동작을 겉으로 드러내려고, draft BO 안에서 자식으로 가는 association 에는 `with draft` 를 적으라는 안내가 나옵니다.
- 다른 BO 로 가는 association 에서 소스 쪽에 `IN LOCAL MODE` 를 붙여 EML 요청(read-by-association·생성 등)을 보내면, 대상 쪽 구현은 로컬 모드가 아니라 privileged mode 로 불립니다. 대상 entity 의 권한 확인을 건너뜁니다. 연관 대상에 특권 컨텍스트가 지정되어 있을 때만 이렇게 됩니다.

## 관련 항목

- [[abenbdl_assoc_impl_type]]
- [[abenbdl_assoc_stand_ops]]
- [[abenbdl_assoc_nonstand_ops]]
- [[abenbdl_internal]]
- [[abenbdl_operations_additions]]
- [[abenbdl_with_draft]]
- [[abenbdl_foreign]]
- [[abenbdl_use_projection]]
- [[abaphandler_meth_modify]]
