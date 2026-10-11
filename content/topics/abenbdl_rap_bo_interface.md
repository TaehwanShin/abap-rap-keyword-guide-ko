---
title: interface behavior definition (interface BDEF)
summary: 다른 쪽이 오래 믿고 쓸 수 있도록 RAP BO 앞에 세우는 안정된 창구, 곧 RAP BO interface 의 behavior definition 을 다루는 갈래입니다.
keywords: interface, 인터페이스, RAP BO interface, interface behavior definition, 인터페이스 BDEF, CDS transactional interface, 릴리스된 API, C1 contract, C0 contract, EML
---

## 설명

**RAP BO interface** 는 다른 쪽이 오래 안정되게 쓸 수 있도록 내놓는 RAP business object(비즈니스 객체)입니다. 보통 C1 계약으로 릴리스된 API 로 공개합니다. 확장할 수 있도록 C0 계약으로 릴리스하기도 합니다.

RAP BO interface 는 두 가지로 이뤄집니다.

- CDS 트랜잭션 interface
- interface behavior definition(동작 정의) (interface BDEF)

interface behavior definition 은 BDL 소스 코드로 작성합니다. 반드시 CDS 트랜잭션 interface 를 바탕으로 하며, interface 에 포함할 동작을 정합니다.

interface 에는 다음과 같은 특징이 있습니다.

- 런타임 핸들러가 없습니다. behavior implementation(동작 구현)용 구현 클래스를 적을 수 없습니다. base BO(기반 BO) 의 동작과 특성을 다시 쓰거나 물려받을 뿐입니다.
- RAP BO 하나에 interface 를 여러 개 둘 수 있습니다.
- **ABAP EML 로만** 쓸 수 있습니다. RAP BO interface 를 RAP 비즈니스 서비스로 바로 내보낼 수는 없습니다.
- RAP BO interface 위에 projection 계층(CDS 트랜잭션 쿼리와 projection BDEF)을 하나 더 쌓을 수 있습니다.

이 갈래의 하위 항목은 다음과 같습니다.

- [[abenbdl_bo_interface_header]] — interface BDEF 의 머리말. `interface;` 로 시작하며 draft, side effects, privileged mode 등을 base BO 에서 가져옵니다.
- [[abenbdl_define_beh_interface]] — entity(엔터티)마다 적는 `define behavior for`. 별칭, 바깥 이름, `use etag` 를 정합니다.
- [[abenbdl_body_interface]] — entity 동작 본문. `use` 로 가져올 작업과 event, 그리고 field characteristics(필드 특성)을 적습니다.
- [[abenbdl_field_interface]] — interface BDEF 에서 보탤 수 있는 field characteristics.

## 예제

base BO `ZR_Travel` 앞에 interface `ZI_Travel` 을 세웁니다.

```bdl
interface;

define behavior for ZI_Travel alias Travel
use etag
{
  use create;
  use update;
  use delete;

  use action acceptTravel;
  use association _Booking { create; }
}

define behavior for ZI_Booking alias Booking
use etag
{
  use update;
  use delete;

  use association _Travel;
}
```

RAP BO consumer(사용자)는 base BO 가 아니라 interface 이름으로 EML 을 씁니다.

```abap
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    EXECUTE accepttravel FROM VALUE #( ( travelid = '00000001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 관련 항목

- [[abenbdl_bo_interface_header]]
- [[abenbdl_define_beh_interface]]
- [[abenbdl_body_interface]]
- [[abenbdl_field_interface]]
- [[abenbdl_use_projection]]
- [[abenbdl_projection_bo]]
