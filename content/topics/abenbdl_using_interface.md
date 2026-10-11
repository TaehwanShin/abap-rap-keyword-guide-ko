---
title: interface 를 거친 extension (using interface)
summary: BDEF extension 이 원본 BO 를 직접 건드리지 않고 RAP BO interface 를 거쳐 확장하도록 정하는 추가 구문입니다.
keywords: using interface, using, extension, BDEF 확장, RAP BO 인터페이스, 인터페이스 BDEF, CDS 트랜잭션 인터페이스, 확장 노드, node extensibility, C0 developer extensibility
---

## 문법

머리말에 적는 일반 형태

```syntax
... using interface InterfaceBdef;
```

extension(확장) 노드에 적는 형태 (entity(엔터티) 단위)

```syntax
... using CDSInterface;
```

## 설명

RAP BO interface 는 원본 BO 위에 얹은 층입니다. 바깥에서 안정적으로 쓰라고 만든 창구이고, 보통 API 로 릴리스됩니다. `using interface` 를 붙인 BDEF extension 은 이 interface 를 거쳐 BO 를 확장합니다. 이때는 **interface 에 들어 있는 entity 만** 확장할 수 있습니다.

extension 은 managed·unmanaged BO 에 직접 걸 수도 있습니다. 그래도 SAP 은 언제나 interface 를 거치고 `using interface` 를 쓰라고 권합니다. C0 개발자 extension(C0 developer extensibility)에서는 interface 가 필수입니다. 그 밖의 몇몇 상황에서도 `using interface` 가 필수이고, 빠뜨리면 문법 오류가 납니다.

### 형태 1: using interface InterfaceBdef

extension 머리말에서 키워드 `extension` 바로 뒤에 적습니다. interface 에 들어 있는 모든 entity 를 확장할 수 있게 됩니다.

- **전제 조건**: interface BDEF `InterfaceBdef` 가 extension 을 허용해야 합니다. interface BDEF 머리말에 `extensible` 이 있어야 합니다. ([[abenbdl_bo_interface_header]] 참고)
- **원본과 interface 가 함께 확장됩니다.** extension 에서 만든 action 은 원본 BO 의 BDEF derived type(BDEF 파생 타입)에도, interface BO 의 BDEF derived type 에도 들어갑니다.
- **이름은 interface 쪽 이름을 씁니다.** entity, 필드, 그 밖의 요소를 원본 이름이 아니라 interface 에서 붙인 이름으로 가리킵니다. 두 이름은 다를 수 있습니다. determination 과 validation 처럼 interface 에 드러나지 않는 요소만 예외입니다.
- **extension behavior pool(동작 풀)의 EML**: extension 은 여느 사용자와 같은 EML consumer(사용자)입니다. 원본 BO 에 릴리스된 interface 가 여러 개 있으면 그 가운데 어느 것으로든 EML 작업을 할 수 있습니다. 보통은 자기가 확장한 바로 그 interface 를 씁니다.

`using interface` 를 쓴 extension 도 `managed` 나 `unmanaged` 타입의 BDEF 에 만듭니다. interface 에 직접 만드는 것이 아닙니다. ADT(Eclipse 용 ABAP 개발 도구)에서 extension 을 만들 때도 원본 BDEF 를 바탕으로 고릅니다.

### 형태 2: using CDSInterface

노드 extension(BO 에 새 entity 를 보태는 extension)에서는 새로 보탠 extension 노드가 RAP BO interface 에 들어 있지 않습니다. 그래서 extension 노드의 동작을 정의하는 `define behavior for` 에 키워드 `using` 으로 interface 를 따로 적습니다. `CDSInterface` 는 extension 노드를 비추는 CDS 트랜잭션 interface 의 이름입니다.

## 예제

같은 BO 를 두 가지 방식으로 확장합니다. 첫 번째는 interface 없이 원본 BDEF `ZR_Travel` 을 직접 확장합니다.

```bdl
extension;

extend behavior for Travel
{
  event TravelHeld;
}
```

두 번째는 interface BDEF `ZI_Travel` 을 거칩니다. entity 이름 `Travel` 은 interface BDEF 에서 붙인 별칭입니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  action ( authorization : instance ) holdTravel;
}
```

노드 extension 에서는 extension 노드에 CDS 트랜잭션 interface `ZI_BookingSuppl` 을 `using` 으로 붙입니다.

```bdl
extension using interface ZI_Travel;

extend behavior for Booking
{
  association _BookingSuppl { create; }
}

define behavior for ZR_BookingSuppl alias BookingSuppl
  using ZI_BookingSuppl
persistent table zbooksuppl
( lock, authorization ) dependent
{
  update;
  delete;
  field ( readonly ) TravelID, BookingID;
  field ( readonly : update ) SupplementID;
  association _Booking;
  ancestor association _Travel;
}
```

## 알아두기

- 노드 extension 은 지금 unmanaged RAP BO 에서 지원하지 않습니다.
- interface 가 entity 나 필드 이름을 바꿔 두었다면 extension BDEF 에도 바뀐 이름을 써야 합니다.
- interface 에 없는 entity 는 `using interface` extension 으로 확장할 수 없습니다.

## 관련 항목

- [[abenbdl_using_interface_abexa]]
- [[abenbdl_rap_bo_interface]]
- [[abenbdl_bo_interface_header]]
- [[abenbdl_extension_header]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_extensibility_managed_unm]]
