---
title: PRIVILEGED 추가 구문
summary: 권한 확인을 건너뛰고 RAP BO 에 접근하게 하는 EML 추가 구문이고, FORWARDING PRIVILEGED 는 지금의 특권 상태를 다음 요청으로 넘겨 줍니다.
keywords: PRIVILEGED, FORWARDING PRIVILEGED, 특권 모드, privileged mode, with privileged mode, 권한 확인, authorization, MODIFY ENTITY, READ ENTITY, GET PERMISSIONS, CL_ABAP_BEHV_AUX, GET_CURRENT_CONTEXT, NO_PRIVILEGED
---

## 문법

짧은 꼴

```syntax
MODIFY ENTITY [FORWARDING] PRIVILEGED bdef ...
READ ENTITY [FORWARDING] PRIVILEGED bdef ...
GET PERMISSIONS [FORWARDING] PRIVILEGED ... ENTITY bdef ...
```

긴 꼴

```syntax
MODIFY ENTITIES OF bdef [FORWARDING] PRIVILEGED ENTITY ...
READ ENTITIES OF bdef [FORWARDING] PRIVILEGED ENTITY ...
GET PERMISSIONS [FORWARDING] PRIVILEGED ... OF bdef ENTITY ...
```

동적 꼴

```syntax
MODIFY ENTITIES [FORWARDING] PRIVILEGED OPERATIONS ...
READ ENTITIES [FORWARDING] PRIVILEGED OPERATIONS ...
GET PERMISSIONS [FORWARDING] PRIVILEGED ... OPERATIONS ...
```

## 설명

RAP BO 에 특권을 띠고 접근하게 하는 추가 구문입니다. 지금은 `READ`, `MODIFY`, `GET PERMISSIONS` 세 가지 EML 문에 붙일 수 있습니다.

대상 RAP BO 가 BDEF 에서 `with privileged mode ...` 로 정의되어 있어야 쓸 수 있습니다. BDEF 쪽 문법은 [[abenbdl_privileged_mode]] 에 있습니다.

### PRIVILEGED

RAP BO 에 privileged mode 로 접근합니다. 권한 확인을 건너뛸 수 있습니다.

### FORWARDING PRIVILEGED

특권 상태를 **넘겨 주는** 추가 구문입니다. 지금 EML 요청이 특권 상태에서 실행되고 있다면, 이어서 보내는 EML 요청에도 그 상태를 이어 갑니다. behavior implementation(동작 구현) 안에서 다른 behavior implementation 을 부를 때가 대표적입니다.

같은 일을 손으로 하려면 먼저 `CL_ABAP_BEHV_AUX` 클래스의 `GET_CURRENT_CONTEXT` 메서드로 지금 특권 상태인지 묻고, 그 답에 따라 `PRIVILEGED` 를 붙인 요청과 안 붙인 요청 가운데 하나를 보내야 합니다. `FORWARDING PRIVILEGED` 는 이것을 줄여 쓴 꼴입니다.

`FORWARDING PRIVILEGED` 를 쓰면 이런 흐름이 됩니다. 어떤 RAP BO 가 privileged mode 로 불렸습니다. 그 안에서 [[abapin_local_mode|IN LOCAL MODE]] 를 붙여 보내는 EML 요청은 그 특권 상태를 그대로 지닙니다. 그러다 `FORWARDING PRIVILEGED` 를 붙인 EML 요청이 다른 RAP BO 를 부르면, 처음의 특권 상태가 그 BO 로 넘어갑니다. 중간에 낀 `IN LOCAL MODE` 요청들도 계속 특권 상태를 지닙니다.

## 예제

BDEF 머리말에서 privileged mode 를 정의합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with privileged mode disabling TravelAuth;

define authorization context TravelAuth
{
  'Z_TRAVEL';
}

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  action acceptTravel result [1] $self;
}
```

privileged mode 로 action 을 실행합니다.

```abap
MODIFY ENTITY PRIVILEGED zr_travel
  EXECUTE accepttravel
  FROM VALUE #( ( travelid = '00000001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

behavior implementation 안에서 다른 BO(`ZR_Agency`)의 action 을 부를 때, 자기가 받은 특권 상태를 그대로 넘깁니다. 아래 두 방법은 뜻이 거의 같습니다. `lt_agency_keys` 는 action 에 넘길 키를 담은 테이블입니다.

```abap
" 방법 1: FORWARDING PRIVILEGED
MODIFY ENTITY FORWARDING PRIVILEGED zr_agency
  EXECUTE markcontacted
  FROM lt_agency_keys
  FAILED DATA(ls_failed_1)
  REPORTED DATA(ls_reported_1).

" 방법 2: 지금 상태를 직접 묻고 갈라서 보낸다
cl_abap_behv_aux=>get_current_context( IMPORTING privileged = DATA(lv_privileged) ).

IF lv_privileged = abap_true.
  MODIFY ENTITY PRIVILEGED zr_agency
    EXECUTE markcontacted
    FROM lt_agency_keys
    FAILED DATA(ls_failed_2)
    REPORTED DATA(ls_reported_2).
ELSE.
  MODIFY ENTITY zr_agency ##NO_PRIVILEGED
    EXECUTE markcontacted
    FROM lt_agency_keys
    FAILED DATA(ls_failed_3)
    REPORTED DATA(ls_reported_3).
ENDIF.
```

## 알아두기

- 핸들러가 지금 privileged mode 로 돌고 있는지는 `cl_abap_behv_aux=>get_current_context( IMPORTING privileged = ... )` 로 알아낼 수 있습니다. 이 메서드는 그 밖의 실행 상황 정보도 돌려줍니다.
- 대상 entity(엔터티)가 `with privileged mode` 로 정의되어 있지 않으면 `FORWARDING PRIVILEGED` 는 아무 효과가 없습니다.
- behavior implementation 안에서 다른 RAP BO 의 entity 에 EML 요청을 보내면서 `PRIVILEGED` 도 `FORWARDING PRIVILEGED` 도 붙이지 않으면 문법 경고가 납니다. pragma `##NO_PRIVILEGED` 로 경고를 없앨 수 있습니다.
- 동적 꼴에서는 이 경고가 나지 않습니다. 요청이 어느 entity 로 가는지 컴파일할 때 알 수 없기 때문입니다.

## 관련 항목

- [[abapcommon_eml_elements]]
- [[abenbdl_privileged_mode]]
- [[abenbdl_authorization_context]]
- [[abapin_local_mode]]
- [[abaprap_cl_abap_behv_aux]]
- [[abapmodify_entity_short]]
- [[abapmodify_entities_long]]
- [[abapmodify_entities_operations_dyn]]
- [[abapread_entity_short]]
- [[abapread_entities_long]]
- [[abapread_entities_operations]]
- [[abapget_permissions_short]]
- [[abapget_permissions_long]]
- [[abapget_permissions_dyn]]
- [[abeneml_privileged_abexa]]
- [[abeneml_forwarding_priv_abexa]]
