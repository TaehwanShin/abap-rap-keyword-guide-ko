---
title: type mapping (mapping for)
summary: entity 의 필드 이름과 테이블·기존 DDIC 구조의 구성요소 이름이 다를 때, 서로 어떤 것끼리 짝인지 behavior definition 에 적어 줍니다.
keywords: mapping for, 타입 매핑, type mapping, corresponding, except, extensible, control, 제어 구조, control mapping, parameter, constant, DDIC 구조, 필드 이름 맞추기, %control
---

## 문법

```syntax
... mapping for PartnerType           [control ControlType]
                                      {[corresponding [extensible][except EntityComp1,EntityComp2, ...]]}
    [{
      EntityComp1       = PartnerComp1 [control ControlComp1];
     [EntityComp2       = PartnerComp2 [control ControlComp2];]
     [parameter Param   = PartnerComp3;]
     [constant Literal  = PartnerComp4;]
     [... ;]
    }]
...
```

## 설명

type mapping 은 CDS 로 정의한 RAP BO 데이터 모델의 타입을, BDEF derived type(BDEF 파생 타입)의 구성요소 모양과 맞지 않는 **다른 타입**에 이어 줍니다. 이미 있는 타입이나 기존 기능을 그대로 쓰는 business object(비즈니스 객체)에서 쓸모가 있습니다. behavior definition(동작 정의) 안에서 BDEF derived type 과 기존 DDIC 타입을 이어 주는 셈입니다.

`PartnerType` 은 DDIC 구조의 이름입니다. 중괄호 안에는 서로 짝이지만 이름이 다른 구성요소를 등호(`=`)로 이어 적습니다.

**등호 왼쪽**에 올 수 있는 것은 세 가지입니다.

- `EntityComp1` : 지금 RAP BO entity(엔터티)의 필드 이름입니다.
- `parameter Param` : action 이나 function 의 입력 매개변수입니다([[abenbdl_action_input_param]]).
- `constant Literal` : 고정 값입니다. 타입 없는 문자 리터럴이나 숫자 리터럴로 적습니다. persistent table 의 필드 하나를 늘 같은 값으로 채울 때 씁니다. 서로 다른 entity 를 같은 테이블에 이어 놓은 경우에 쓸모가 있습니다.

**등호 오른쪽**에는 상대 타입의 구성요소 이름 `PartnerComp1`, `PartnerComp2`, ... 를 적습니다.

그 밖의 규칙은 다음과 같습니다.

- behavior definition 에 type mapping 을 여러 개 둘 수 있습니다. 다만 mapping 마다 상대 타입이 달라야 합니다. 상대 타입 하나에 mapping 은 하나입니다.
- DDIC 구조의 필드 이름과 데이터 모델의 필드 이름이 완전히 같으면 mapping 이 필요 없습니다. 다르면 mapping 을 꼭 적어야 하고, 적지 않으면 문법 경고가 납니다.
- 특히 managed RAP BO 에서는 persistent table 의 필드 이름이 entity 의 필드 이름과 같아야 합니다. 다르면 type mapping 이 필요합니다.
- behavior pool(동작 풀)에 구현할 것은 없습니다.
- 구성요소끼리 값을 옮길 때는 기본 데이터 객체의 대입·변환 규칙을 따릅니다.

### control

`control ControlType` 은 RAP BO 의 타입을 **제어 구조**에 이어 줍니다. 제어 구조는 구성요소가 `PartnerType` 과 같되, 모든 구성요소의 타입이 `c(1)` 이나 `x(1)` 인 구조입니다. 어떤 필드를 작업에서 다루는지 표시하는 데 씁니다. derived type 의 `%control` 구조([[abapderived_types_comp]])와 같은 방식으로 동작합니다.

주 타입 `PartnerType` 과 제어 타입 `ControlType` 을 한 번에 mapping 할 수 있습니다. 보통은 두 타입의 필드 이름이 같습니다. 이름이 다르면 줄마다 `control ControlComp1` 을 붙여 짝을 정합니다.

주 구조에 있는 구성요소가 제어 구조에 없어도 괜찮습니다. 이때는 따로따로 실행할 수 있는 mapping 두 개가 됩니다.

### corresponding [except]

`corresponding` 을 붙이면 **이름이 같은 구성요소를 저절로** 짝지어 줍니다. 그러면 중괄호 안에는 이름이 다른 것만 적으면 됩니다. `except` 를 함께 적으면 이름이 같아도 저절로 짝짓지 않을 구성요소를 뺄 수 있습니다.

예) `mapping for PartnerType corresponding;`

### corresponding extensible

`extensible` 을 붙이면 이 type mapping 을 BDEF extension(확장)에서 늘릴 수 있습니다. RAP BO consumer(사용자)가 이 mapping 에 extension 필드를 보탤 수 있다는 뜻입니다. `corresponding` 과 함께 적을 때만 쓸 수 있습니다.

예) `mapping for PartnerType corresponding extensible;`

extension 을 여는 방법은 [[abenbdl_extensibility_enabling_m_u]] 를 봅니다.

### 쓸 수 있는 곳

managed RAP BO, unmanaged RAP BO, projection BO, abstract BDEF

## 예제

persistent table `ztravel` 의 필드 이름은 밑줄 표기이고, entity 필드는 별칭이 붙어 이름이 다릅니다. 그래서 mapping 이 필요합니다. 두 번째 mapping 은 기존 구조 `zs_travel_legacy` 와 그 제어 구조에 이어 줍니다.

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
  field ( readonly : update ) TravelID;

  // persistent table 과의 mapping
  mapping for ztravel
  {
    TravelID      = travel_id;
    AgencyID      = agency_id;
    CustomerID    = customer_id;
    BeginDate     = begin_date;
    EndDate       = end_date;
    TotalPrice    = total_price;
    CurrencyCode  = currency_code;
    Status        = status;
    LastChangedAt = last_changed_at;
    // 테이블의 doc_type 필드는 늘 'TRV' 로 채운다
    constant 'TRV' = doc_type;
  }

  // 기존 구조와 제어 구조. 이름이 같은 것은 저절로 짝짓고 Status 만 뺀다
  mapping for zs_travel_legacy control zs_travel_legacy_x corresponding except Status
  {
    TravelID  = trip_no;
    BeginDate = date_from control from_flag;
    EndDate   = date_to   control to_flag;
  }
}
```

## 알아두기

- 같은 상대 타입에 mapping 을 두 번 적을 수 없습니다.
- `extensible` 은 `corresponding` 없이 쓸 수 없습니다.
- type mapping 은 그룹([[abenbdl_grouping]]) 안에 넣을 수 없습니다. 구현이 필요 없는 부분이기 때문입니다.

## 관련 항목

- [[abenbdl_action_input_param]]
- [[abapderived_types_comp]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_grouping]]
- [[abenbdl_body_projection]]
