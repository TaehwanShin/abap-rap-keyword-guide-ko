---
title: function
summary: 데이터를 바꾸지 않고 계산이나 조회 결과만 돌려주는 사용자 정의 작업을 선언하는 문법이며, FOR READ handler method 에 구현합니다.
keywords: function, 함수, static function, 정적 함수, repeatable function, key function, FOR READ, FUNCTION, 부수 효과 없음, READ ENTITIES EXECUTE, result, 출력 매개변수
---

## 문법

```syntax
[internal] [static] [repeatable] function
                [(
                [features: {instance | global}]
                [authorization:none]
                [authorization:global]
                [authorization:instance]
                 )]
                FunctionName [external'ExternalName']
                [InputParameter]
                 OutputParameter;
                [{default function GetDefaultsForFuncName [external 'GetDefaultsForExtName'];}]
                [key (AlternativeKey) function FunctionName ...;]
```

## 설명

function 은 **side effects 없이 정보만 돌려주는** 사용자 정의 작업입니다. business object(비즈니스 객체)를 대상으로 계산하거나 읽기만 합니다. [[abenbdl_locking|잠금]]을 걸지 않고 데이터도 바꾸지 않습니다. 처리 내용은 behavior pool(동작 풀)의 handler method(핸들러 메서드) [[abaphandler_meth_read|FOR READ ... FUNCTION]] 에 구현해야 합니다.

**function 은 데이터를 바꾸면 안 됩니다.** function 구현 안에서는 [[abapmodify_entity_entities|MODIFY ENTITIES]] 를 쓸 수 없습니다. function 구현에 `MODIFY ENTITIES` 문이 있으면, RAP BO consumer(사용자)가 그 function 을 부를 때 런타임 오류가 납니다.

### 붙일 수 있는 추가 구문

| 추가 구문 | 뜻 |
| --- | --- |
| [[abenbdl_static|static]] | function 은 기본으로 entity(엔터티) 인스턴스에 묶여 있습니다. static function 은 어느 인스턴스에도 묶이지 않고 entity 전체에 걸립니다. |
| [[abenbdl_action_repeatable|repeatable]] | 한 번의 EML 요청이나 OData 요청 안에서 같은 인스턴스에 같은 function 을 여러 번 실행할 수 있게 합니다. |
| [[abenbdl_actions_fc|features:instance]] | 동적 feature control(기능 제어)입니다. BO 안의 조건에 따라 function 을 켜고 끕니다. |
| [[abenbdl_actions_fc|features:global]] | global feature control 입니다. BO 바깥의 조건에 따라 function 을 켜고 끕니다. |
| [[abenbdl_actions_auth|authorization:none]] | 이 function 을 [[abenbdl_authorization|권한 확인]]에서 뺍니다. |
| [[abenbdl_actions_auth_global|authorization:global]] | authorization master entity 에 정한 authorization control(권한 제어) 대신 global 권한 확인을 적용합니다. |
| [[abenbdl_actions_auth_instance|authorization:instance]] | authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 적용합니다. |
| [[abenbdl_external|external]] | 바깥에서 쓸 다른 이름을 줍니다. 이 이름은 OData 메타데이터에 드러나지만 ABAP 에서는 알지 못합니다. 원래 이름보다 훨씬 길어도 됩니다. |
| [[abenbdl_internal|internal]] | BO 구현 안에서만 부를 수 있게 합니다. |
| [[abenbdl_action_input_param|InputParameter]] | 입력 매개변수를 붙입니다. 선택입니다. |
| [[abenbdl_action_output_para|OutputParameter]] | 출력 매개변수입니다. **필수**입니다. |
| [[abenbdl_default_function|default function]] | function 의 default values function 을 정합니다. 입력 매개변수의 값을 미리 채우는 데 씁니다. 그래서 function 에 입력 매개변수가 있어야 합니다. |
| [[abenbdl_keyfunction|key (AlternativeKey) function]] | BDEF 대체 키에 쓰는 key function 을 정의합니다. |

### repeatable 이 없을 때

기본으로는 한 번의 EML 요청이나 OData 요청 안에서 같은 인스턴스에 같은 function 을 여러 번 실행하면 안 됩니다. 그렇게 하면, 계약 점검이 켜져 있을 때 계약 위반으로 잡힙니다. 여러 번 실행해야 한다면 `repeatable` 을 붙입니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 에서는 base BDEF(기반 BDEF) 의 function 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]). function 을 새로 만들 수도 있습니다([[abenbdl_nonstandard_projection]]).
- RAP BO interface 에서는 base BDEF 의 function 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

function 세 개를 선언합니다. instance function, static function, 입력 매개변수가 있는 function 입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;

  // instance function: 고른 여행의 정보를 돌려준다
  function ( authorization : none ) getDetails result [0..*] $self;

  // static function: 열려 있는 여행의 총액 합계를 돌려준다
  static function ( authorization : none ) calculateTotal
    result [1] ZA_TotalPrice;

  // 입력 매개변수가 있는 function: 할인한 가격을 계산해 돌려준다
  function ( authorization : none ) calculateDiscount
    parameter ZA_Discount
    result [1] $self;
}
```

behavior pool 에서는 function 마다 `FOR READ` handler method 를 만듭니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS getdetails FOR READ
      IMPORTING keys FOR FUNCTION travel~getdetails RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD getdetails.
    " 읽기만 한다. MODIFY ENTITIES 는 쓰지 않는다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( travelid totalprice status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel)
      FAILED failed.

    result = VALUE #( FOR ls_travel IN lt_travel
                      ( %tky = ls_travel-%tky %param = ls_travel ) ).
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer 는 `READ ENTITIES` 의 `EXECUTE` 로 function 을 부릅니다. function 은 읽기 작업이라 `MODIFY ENTITIES` 가 아닙니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE getdetails
      FROM VALUE #( ( %tky-travelid = '00000001' )
                    ( %tky-travelid = '00000002' ) )
  RESULT DATA(lt_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

세 function 을 모두 실행하는 전체 흐름은 [[abenbdl_function_abexa]] 에 있습니다.

## 알아두기

- action 과 견주면 문법 틀에 `precheck`, `authorization:update`, `lock:none` 이 없습니다.
- 출력 매개변수 타입으로 DDIC 데이터 엘리먼트도 쓸 수는 있습니다. 하지만 BDEF 매개변수에는 CDS abstract entity 만 쓰기를 권장합니다.

## 관련 항목

- [[abenbdl_nonstandard]]
- [[abenbdl_action]]
- [[abenbdl_keyfunction]]
- [[abenbdl_action_repeatable]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abaphandler_meth_read]]
- [[abenbdl_function_abexa]]
