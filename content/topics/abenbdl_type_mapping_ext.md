---
title: type mapping extension (extend mapping)
summary: 원본 BDEF 에 있는 type mapping 에 extension 필드를 보태는 구문이며, 상대 타입이 같으면 extension 에서 mapping for 를 새로 적는 것과 결과가 같습니다.
keywords: extend mapping for, extend mapping, mapping for, 타입 매핑 확장, type mapping, corresponding, except, control, parameter, extensible, 확장 필드
---

## 문법

```syntax
... extend mapping for PartnerType    [control ControlType]
                                      {[corresponding [except Comp1,Comp2, ...]]}
    {
      EntityComp1      = PartnerComp1 [control ControlComp];
     [EntityComp2      = PartnerComp2 [control ControlComp];]
     [parameter Param1 = PartnerComp;]
     [... ;]
    }
  | mapping for PartnerType           [control ControlComp]
                                       corresponding [except Comp1,Comp2, ...];
...
```

## 설명

type mapping 은 entity(엔터티)의 필드와 다른 타입(`PartnerType`, 예를 들어 데이터베이스 테이블)의 구성요소를 짝지어 주는 정의입니다. `extend mapping for` 는 원본 BDEF 에 **이미 있는** type mapping 에 extension(확장) 필드를 보탭니다.

- **전제 조건**: 원본 BDEF 에서 그 type mapping 을 확장할 수 있다고 명시해 두어야 합니다. ([[abenbdl_extensibility_enabling_m_u]] 참고)
- 문법은 원본 RAP BO 에서 쓰는 type mapping 과 비슷합니다. `control`, `corresponding`, `except`, `parameter` 의 뜻은 [[abenbdl_type_mapping]] 을 따릅니다.

### mapping for 와 extend mapping for

BDEF extension 에서 type mapping 을 다루는 방법은 두 가지입니다.

- `mapping for ...` 로 type mapping 을 새로 보탭니다. ([[abenbdl_new_elem_ext]] 참고)
- `extend mapping for ...` 로 원본의 type mapping 을 확장합니다.

상대 타입이 같으면 두 방법은 같은 결과를 냅니다. `mapping for PartnerType ...` 과 `extend mapping for PartnerType ...` 사이에 차이가 없습니다.

## 예제

원본 BDEF `ZR_Travel` 의 type mapping 은 `extensible` 로 열려 있습니다.

```bdl
// 원본 BDEF ZR_Travel 의 일부
mapping for ztravel corresponding extensible
{
  TravelID  = travel_id;
  AgencyID  = agency_id;
  BeginDate = begin_date;
}
```

extension 은 테이블 `ztravel` 에 보탠 extension 필드를 같은 mapping 에 짝지어 넣습니다.

```bdl
extension using interface ZI_Travel;

extend behavior for Travel
{
  extend mapping for ztravel
  {
    ZZPurpose  = zz_purpose;
    ZZDiscount = zz_discount;
  }
}
```

## 알아두기

- 원본 BDEF 가 type mapping 에 `extensible` 을 붙여 두지 않았으면 `extend mapping for` 를 쓸 수 없습니다.

## 관련 항목

- [[abenbdl_type_mapping]]
- [[abenbdl_new_elem_ext]]
- [[abenbdl_ext_elem_ext]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_proj_ext_body]]
