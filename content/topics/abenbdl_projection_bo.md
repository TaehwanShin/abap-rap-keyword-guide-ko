---
title: projection behavior definition (projection BDEF)
summary: 기반 RAP BO 를 특정 비즈니스 서비스에 맞게 추려 내놓는 projection BO 의 behavior definition 을 다루는 갈래입니다.
keywords: projection, 프로젝션, projection behavior definition, 프로젝션 BDEF, RAP projection BO, CDS projection view, 프로젝션 뷰, 비즈니스 서비스, 역할별 서비스, use
---

## 설명

**RAP projection BO** 는 business object(비즈니스 객체)를 특정 비즈니스 서비스에 맞게 다듬어 내놓는 계층입니다. 같은 base BO(기반 BO) 를 서비스마다 다르게 내놓을 수 있어, 서비스를 유연하게 쓰고 역할에 맞춰 설계할 수 있습니다.

projection BO 는 다음으로 이뤄집니다.

- CDS projection 뷰
- projection behavior definition(동작 정의) (projection BDEF)
- 필요하면, 추가 구현이나 그 서비스만을 위한 구현

만드는 순서는 이렇습니다. 먼저 CDS 뷰 모델의 노드 일부나 전부에 projection 계층을 만듭니다. 그다음 CDS 루트 projection 뷰에 projection behavior definition 을 만듭니다. projection behavior definition 은 BDL 소스 코드로 작성합니다.

projection behavior definition 은 managed 또는 unmanaged 인 base BDEF(기반 BDEF) 를 비춘 것입니다. base BO 의 요소 가운데 **일부만 골라** 내놓습니다.

이 갈래의 하위 항목은 다음과 같습니다.

- [[abenbdl_bdef_projection_header]] — projection BDEF 의 머리말. `projection` 으로 시작하며 구현 클래스, strict mode, draft·side effects 재사용 등을 적습니다.
- [[abenbdl_mngd_instance_check_proj]] — `with managed instance filter`. projection 뷰의 `WHERE` 조건을 EML 과 OData 접근에도 적용합니다.
- [[abenbdl_define_beh_projection]] — entity(엔터티)마다 적는 `define behavior for`.
- [[abenbdl_character_projection]] — entity 동작 특성. 직접 적는 것과 저절로 물려받는 것을 나눠 정리합니다.
- [[abenbdl_authorization_projection]] — projection 에서 새로 만든 action·function 의 authorization control(권한 제어).
- [[abenbdl_body_projection]] — entity 동작 본문. `use`, field characteristics(필드 특성), 새 action·function, type mapping 을 적습니다.
- [[abenbdl_field_projection]] — projection BDEF 에서 보탤 수 있는 field characteristics.

## 예제

base BO `ZR_Travel` 을 비춘 projection BDEF 입니다. 생성·수정·삭제와 승인 action 만 골라 내놓습니다.

```bdl
projection;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;

  use action acceptTravel;
  use association _Booking { create; }
}

define behavior for ZC_Booking alias Booking
{
  use update;
  use delete;

  use association _Travel;
}
```

## 알아두기

- projection behavior definition 은 RAP BO interface 위에도 쌓을 수 있습니다. [[abenbdl_rap_bo_interface]] 를 봅니다.

## 관련 항목

- [[abenbdl_bdef_projection_header]]
- [[abenbdl_define_beh_projection]]
- [[abenbdl_body_projection]]
- [[abenbdl_use_projection]]
- [[abenbdl_rap_bo_interface]]
