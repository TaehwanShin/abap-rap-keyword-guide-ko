---
title: MODIFY ENTITIES OPERATIONS 문, 동적 형식
summary: 실행할 변경 작업을 내부 테이블(ABP_BEHV_CHANGES_TAB)에 담아, 여러 RAP BO 의 여러 작업을 한 문장으로 실행하는 동적 형식입니다.
keywords: MODIFY ENTITIES OPERATIONS, 동적 형식, dynamic form, ABP_BEHV_CHANGES_TAB, ABP_BEHV_RESPONSE_TAB, op_tab, op, entity_name, sub_name, instances, IF_ABAP_BEHV, 동적 EML
---

## 문법

```syntax
MODIFY ENTITIES [IN LOCAL MODE|[FORWARDING] PRIVILEGED] OPERATIONS op_tab [response_param].
```

## 설명

동적 형식은 어떤 entity(엔터티)에 어떤 작업을 할지를 코드에 직접 적지 않고 **내부 테이블 `op_tab`** 에 담아 넘깁니다. 그래서 **여러 RAP BO** 에 걸친 여러 변경 작업을 `MODIFY` 문 하나로 실행할 수 있습니다. entity 이름이 실행할 때에야 정해지는 범용 코드에 알맞습니다.

`op_tab` 의 타입은 `ABP_BEHV_CHANGES_TAB` 이어야 합니다. 한 줄이 작업 하나이고, 구성요소는 다음과 같습니다.

| 구성요소 | 필수 | 내용 |
| --- | --- | --- |
| `op` | 필수 | 실행할 작업입니다. interface `IF_ABAP_BEHV` 의 상수(예: `if_abap_behv=>op-m-create`)를 넣거나, 그 상수의 값을 직접 넣습니다(생성은 `'C'`). |
| `entity_name` | 필수 | 작업할 BO entity 이름입니다. **대문자**로 적습니다. |
| `sub_name` | 선택 | create-by-association 할 때의 association 이름이나 action 이름을 적습니다. 대문자로 적습니다. `if_abap_behv=>op-m-create_ba` 를 쓸 때는 association 의 별칭 이름을 대문자로 넣습니다. |
| `instances` | 필수 | 작업할 인스턴스가 든 내부 테이블입니다. 정적 타입이 `DATA` 인 참조 변수로 넘깁니다. |
| `request` | 선택 | 요청 내용을 담는 내부 테이블입니다. 정적 타입이 `DATA` 인 참조 변수입니다. |
| `results` | 선택 | action 결과를 받는 내부 테이블입니다. 정적 타입이 `DATA` 인 참조 변수입니다. |

추가 구문은 다른 형식과 같습니다.

- `IN LOCAL MODE` : [[abenbdl_actions_fc|feature control]] 과 [[abenbdl_authorization|권한 확인]]을 건너뜁니다. RAP BO 구현 안에서만 쓸 수 있습니다. [[abapin_local_mode]] 를 봅니다.
- `[FORWARDING] PRIVILEGED` : `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. BDEF 에 `privileged` 가 있어야 합니다. [[abapeml_privileged]] 를 봅니다.
- `response_param` : response parameter(응답 매개변수)입니다. 동적 형식에서는 `ABP_BEHV_RESPONSE_TAB` 타입의 내부 테이블로 받아야 합니다. [[abapeml_response]] 를 봅니다.

## 예제

여행 하나를 만들고, 방금 만든 여행의 상태를 고치고, 예약을 하나 붙이고, 다른 예약 하나를 지웁니다. 인스턴스 테이블은 BDEF derived type(BDEF 파생 타입)으로 따로 선언한 뒤 `REF #( )` 로 넘깁니다.

```abap
DATA: lt_op       TYPE abp_behv_changes_tab,
      lt_create   TYPE TABLE FOR CREATE zr_travel,
      lt_update   TYPE TABLE FOR UPDATE zr_travel,
      lt_cba      TYPE TABLE FOR CREATE zr_travel\_booking,
      lt_delete   TYPE TABLE FOR DELETE zr_booking,
      lt_failed   TYPE abp_behv_response_tab,
      lt_reported TYPE abp_behv_response_tab,
      lt_mapped   TYPE abp_behv_response_tab.

" 넘길 필드는 %control 에서 직접 켠다
lt_create = VALUE #(
  ( %cid = 'cid1'
    travelid = '00000001'  %control-travelid = if_abap_behv=>mk-on
    agencyid = '070001'    %control-agencyid = if_abap_behv=>mk-on ) ).

lt_update = VALUE #(
  ( %cid_ref = 'cid1'
    status = 'O'           %control-status = if_abap_behv=>mk-on ) ).

lt_cba = VALUE #(
  ( %cid_ref = 'cid1'
    %target  = VALUE #(
      ( %cid = 'cid2'
        bookingid   = '0001'    %control-bookingid   = if_abap_behv=>mk-on
        flightprice = '500.00'  %control-flightprice = if_abap_behv=>mk-on ) ) ) ).

lt_delete = VALUE #( ( travelid = '00000009' bookingid = '0001' ) ).

" 한 줄이 작업 하나. entity 이름과 association 이름은 대문자로 적는다
lt_op = VALUE #(
  ( op = if_abap_behv=>op-m-create
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_create ) )
  ( op = if_abap_behv=>op-m-update
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_update ) )
  ( op = if_abap_behv=>op-m-create_ba
    entity_name = 'ZR_TRAVEL'
    sub_name    = '_BOOKING'
    instances   = REF #( lt_cba ) )
  ( op = if_abap_behv=>op-m-delete
    entity_name = 'ZR_BOOKING'
    instances   = REF #( lt_delete ) ) ).

MODIFY ENTITIES OPERATIONS lt_op
  FAILED   lt_failed
  REPORTED lt_reported
  MAPPED   lt_mapped.
```

## 알아두기

- RAP BO provider(제공자)는 saver method(세이버 메서드) [[abensaver_check_before_save|check_before_save]], [[abensaver_adjust_numbers|adjust_numbers]], [[abensaver_method_save|save]], [[abaprap_saver_meth_save_modified|save_modified]], [[abensaver_method_cleanup|cleanup]] 안에서 EML `MODIFY` 문을 쓰면 안 됩니다. interaction phase(상호작용 단계)와 [[abensaver_finalize|finalize]] 에서만 쓸 수 있습니다.
- readonly handler method(핸들러 메서드) 안에서도 EML `MODIFY` 문을 쓸 수 없습니다.
- `entity_name` 과 `sub_name` 은 꼭 대문자로 적습니다.
- response parameter 의 타입이 다른 형식과 다릅니다. `RESPONSE FOR FAILED ...` 같은 BDEF derived type 이 아니라 `ABP_BEHV_RESPONSE_TAB` 입니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapmodify_entity_short]]
- [[abapmodify_entities_long]]
- [[abapeml_response]]
- [[abeneml_modify_alternatives_abexa]]
- [[abapeml_modify_examples_abexas]]
