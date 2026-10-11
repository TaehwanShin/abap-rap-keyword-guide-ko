---
title: projection BDEF의 action
summary: base BDEF 에 없는 action 을 projection 계층에서 새로 정의하는 문법으로, authorization control 은 projection BDEF에 따로 적어야 합니다.
keywords: action, 액션, projection BDEF, 프로젝션 BDEF, 프로젝션 액션, 새 액션, static action, factory action, authorization ( global ), features, precheck, lock:none, FOR MODIFY
---

## 문법

```syntax
[internal][static][factory][{static [default] factory}] action
                  [(
                  [features: {instance | global}]
                  [precheck]
                  [authorization:none]
                  [authorization:update]
                  [lock:none]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                  [OutputParameter]
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

## 설명

projection BDEF에서는 base BDEF(기반 BDEF)의 action 을 [[abenbdl_use_projection|use action]] 으로 다시 쓰는 것 말고도, projection 계층에만 있는 action 을 **새로 정의**할 수 있습니다.

정의하는 방법은 base BDEF 에서 action 을 정의할 때와 비슷합니다. 각 추가 구문의 뜻은 [[abenbdl_action]] 을 보세요. 구현은 **projection BDEF의 behavior pool(동작 풀)**에 handler method(핸들러 메서드) `FOR MODIFY` 로 씁니다.

다른 점은 **권한**입니다. projection BDEF에서는 base BDEF 의 authorization master 를 쓸 수 없습니다. 새 action 에 권한 확인이 필요하면 projection BDEF의 BO 노드마다 authorization control(권한 제어)를 직접 적어야 합니다. 방법은 [[abenbdl_authorization_projection]] 에 있습니다.

## 예제

projection BDEF에 할인 action `deductDiscount` 를 새로 만듭니다. 할인율은 abstract entity(엔터티) `ZA_Discount` 의 `DiscountPercent` 로 받습니다. projection 에 global authorization control 을 걸었습니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
authorization ( global )
{
  use create;
  use update;
  use delete;

  // projection 계층에만 있는 새 action
  action deductDiscount parameter ZA_Discount result [1] $self;
}
```

projection 의 behavior pool 에서 global 권한과 action 을 구현합니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel RESULT result.
    METHODS deductdiscount FOR MODIFY
      IMPORTING keys FOR ACTION travel~deductdiscount RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_global_authorizations.
    " 예제라서 조건 없이 허용한다
    IF requested_authorizations-%action-deductdiscount = if_abap_behv=>mk-on.
      result-%action-deductdiscount = if_abap_behv=>auth-allowed.
    ENDIF.
  ENDMETHOD.

  METHOD deductdiscount.
    DATA lt_update TYPE TABLE FOR UPDATE zc_travel.

    " 지금 총액을 읽는다
    READ ENTITIES OF zc_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( TotalPrice )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    " 할인율만큼 깎은 값을 만든다
    LOOP AT lt_travel INTO DATA(ls_travel).
      DATA(lv_percent) = keys[ KEY entity %tky = ls_travel-%tky ]-%param-DiscountPercent.
      APPEND VALUE #( %tky       = ls_travel-%tky
                      TotalPrice = ls_travel-TotalPrice * ( 100 - lv_percent ) / 100 )
             TO lt_update.
    ENDLOOP.

    MODIFY ENTITIES OF zc_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( TotalPrice )
        WITH lt_update.

    " 바뀐 내용을 다시 읽어 결과로 돌려준다
    READ ENTITIES OF zc_travel IN LOCAL MODE
      ENTITY travel
        ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(lt_result).

    result = VALUE #( FOR ls_result IN lt_result
                      ( %tky = ls_result-%tky %param = ls_result ) ).
  ENDMETHOD.
ENDCLASS.
```

여행 두 건을 만들고 이 action 을 실행하면, 넘긴 할인율만큼 `TotalPrice` 가 줄어듭니다.

## 알아두기

- projection BDEF에 새 action 을 정의하려면 projection BDEF 머리말에 `implementation in class ...` 로 behavior pool 을 지정해야 합니다. 구현할 코드가 있기 때문입니다.
- 문법 틀에서 보듯 projection 의 action 에 붙일 수 있는 권한 옵션은 `authorization:none` 과 `authorization:update` 입니다.
- projection BDEF에는 base BDEF 의 authorization master 가 없습니다. authorization control 이 필요하면 projection 쪽에 따로 정의합니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_authorization_projection]]
- [[abenbdl_use_projection]]
- [[abenbdl_function_projection]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abenbdl_actions_fc]]
- [[abenbdl_precheck]]
- [[abenbdl_lock_none]]
- [[abenbdl_external]]
- [[abenbdl_internal]]
- [[abenbdl_default_function]]
- [[abaphandler_meth_modify]]
- [[abaphandler_meth_global_auth]]
