---
title: 프렌드 선언 (with friends)
summary: 특정 BDEF extension 을 behavior definition 의 프렌드로 선언해, internal 작업 호출과 IN LOCAL MODE 같은 원래 BO 와 같은 접근 권한을 주는 추가 구문입니다.
keywords: with friends, friends, 프렌드, BDEF 확장, BDEF extension, extensible, internal action, 내부 액션, IN LOCAL MODE, 접근 권한, 모듈화, 확장 허용
---

## 문법

```syntax
... with friends BDEFExtension1 [, BDEFExtension2] [,...]...
```

## 설명

`with friends` 는 머리말의 `extensible` 뒤에 붙이는 선택 추가 구문입니다. BDEF extension(확장) `BDEFExtension1`, `BDEFExtension2`, ... 를 지금 behavior definition(동작 정의)의 **프렌드**로 선언합니다. 적어도 하나는 적어야 합니다.

프렌드로 적을 수 있는 것은 **지금 BDEF 의 BDEF extension** 뿐입니다. 다른 것을 적으면 아무 효과가 없습니다.

프렌드는 이 BDEF 의 모든 구성요소에 제한 없이 접근합니다. 바깥의 RAP BO consumer(사용자)로 다뤄지지 않고, 원래 RAP BO 와 같은 접근 권한을 받습니다. 구체적으로는 이렇습니다.

- `internal` 로 선언한 RAP BO 작업을 부를 수 있습니다.
- `IN LOCAL MODE` 추가 구문으로 특권 접근을 할 수 있습니다.
- 원래 RAP BO 의 필드에 접근할 수 있습니다.

프렌드 관계는 **이어지지 않습니다.** BDEF 의 프렌드가 다시 자기 프렌드를 선언해도, 그 프렌드가 원래 BDEF 의 프렌드가 되지는 않습니다.

쓸 수 있는 곳은 다음과 같습니다.

- managed RAP BO
- unmanaged RAP BO
- managed·unmanaged RAP BO 의 BDEF extension ([[abenbdl_ext_enabl_ext_base]] 참고)

## 예제

`ZR_Travel` 의 behavior definition 이 BDEF extension `zx_travel_1` 을 프렌드로 선언합니다. internal action `recalcTotalPrice` 는 원래 behavior pool(동작 풀) 안에서만 부를 수 있는 action 입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
extensible
with friends zx_travel_1;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
extensible
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;

  internal action recalcTotalPrice;
}
```

프렌드인 BDEF extension `zx_travel_1` 은 extension action 을 하나 정의합니다.

```bdl
extension implementation in class zbp_x_travel_1 unique;

extend behavior for Travel
{
  action ( authorization : instance ) zz_recalc;
}
```

extension 의 behavior pool 에서, extension action 이 원래 BO 의 internal action 을 부릅니다.

```abap
METHOD zz_recalc.
  " 프렌드라서 IN LOCAL MODE 로 internal action 을 부를 수 있다
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      EXECUTE recalctotalprice
      FROM CORRESPONDING #( keys ).
ENDMETHOD.
```

바깥에서 `zz_recalc` 를 실행하면 호출 순서는 이렇습니다. 먼저 BDEF extension 의 authorization control(권한 제어)가 불립니다. 다음으로 extension action 이 불립니다. extension action 은 원래 BO 의 internal action `recalcTotalPrice` 를 부릅니다. 이때 원래 BO 의 authorization control 은 불리지 않고, internal action 이 그대로 실행됩니다.

## 알아두기

- **프렌드가 아닌** BDEF extension 이 똑같은 코드로 internal action 을 부르면 런타임 오류가 납니다. internal action 호출은 프렌드에게만 허용됩니다.
- 프렌드 관계는 이어지지 않습니다. 프렌드의 프렌드는 프렌드가 아닙니다.
- BDEF extension 을 프렌드로 선언하는 방식은 예를 들어 behavior definition 을 여러 조각으로 나눠 관리(모듈화)할 때 쓸모가 있습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_ext_enabl_ext_base]]
- [[abenbdl_extensible]]
- [[abenbdl_extension_syntax]]
- [[abenbdl_internal]]
- [[abapin_local_mode]]
