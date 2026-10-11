---
title: default values function (default function)
summary: 생성, create-by-association, action, function 을 화면에서 실행할 때 필드나 입력 매개변수에 값을 미리 채워 주는 function 을 붙이는 추가 구문입니다.
keywords: default function, default values function, GetDefaultsFor, GetDefaultsForCreate, 기본값 함수, 기본값, 값 미리 채우기, defaulting, FOR READ, FOR FUNCTION, OData
---

## 문법

```syntax
... {default function [DefaultValuesFunctionName] [ external 'GetDefaultsForExtName'];}
```

## 설명

`default function` 은 RAP BO 작업에 **default values function** 을 붙입니다. default values function 은 그 작업을 화면에서 실행할 때 필드 값이나 입력 매개변수를 미리 채워 줍니다. handler method(핸들러 메서드) [[abaprap_handler_default_val_func|FOR READ ... FOR FUNCTION ...]] 에 반드시 구현해야 합니다.

붙일 수 있는 작업은 [[abenbdl_standard_operations|standard operation]] `create`, create-by-association, [[abenbdl_action|action]], [[abenbdl_function|function]] 입니다. 작업과 매개변수 정의 뒤에 `{ default function GetDefaultsForOperation; }` 를 덧붙이는 모양입니다.

### 이름 규칙

- function 이름 `DefaultValuesFunctionName` 과 바깥 이름 `GetDefaultsForExtName` 은 둘 다 `GetDefaultsFor` 로 시작해야 합니다.
- function 이름은 그 BDEF 안에서 하나뿐이어야 합니다.
- 바깥 이름은 겹쳐도 됩니다. 적으면 OData 메타데이터에 드러납니다.

### 작업마다 다른 규칙

| 작업 | 규칙 |
| --- | --- |
| [[abenbdl_standard_operations|create]] | 이름은 안 적어도 됩니다. 적는다면 `GetDefaultsForCreate` 여야 합니다. 바깥 이름은 붙일 수 없습니다. |
| [[abenbdl_association|create-by-association]] | 중괄호 안에서 `create` 와 함께 적어야 합니다. 바깥 이름을 붙일 수 있습니다. |
| [[abenbdl_action|action]] | action 의 입력 매개변수에 기본값을 줍니다. action 에 [[abenbdl_action_input_param|입력 매개변수]]가 있어야 합니다. flat parameter, deep parameter, deep table parameter 를 모두 지원합니다. 바깥 이름을 붙일 수 있습니다. |
| [[abenbdl_function|function]] | function 의 입력 매개변수에 기본값을 줍니다. function 에 입력 매개변수가 있어야 합니다. flat parameter, deep parameter, deep table parameter 를 모두 지원합니다. 바깥 이름을 붙일 수 있습니다. |

### 어디에서 쓸 수 있나

- managed RAP BO, unmanaged RAP BO
- projection BO : projection 단계에서 정의한 [[abenbdl_nonstandard_projection|action 과 function]] 에 default values function 을 정의할 수 있습니다.
- projection BO 와 RAP BO interface : base BDEF(기반 BDEF) 의 default values function 을 [[abenbdl_use_default_function|use]] 로 다시 쓸 수 있습니다. 작업과 default values function 은 따로따로 다시 써야 합니다.

## 예제

여행 생성, 예약 생성, 할인 action 에 default values function 을 붙입니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  // 생성의 default values function
  create { default function GetDefaultsForCreate; }
  update;
  delete;

  // create-by-association 의 default values function
  association _Booking
  { create { default function GetDefaultsForBooking; } }

  // action 입력 매개변수의 default values function
  action deductDiscount parameter ZA_Discount result [1] $self
    { default function GetDefaultsForDeductDiscount; }
}
```

생성의 default values function 을 behavior pool(동작 풀)에 구현합니다. 새 여행의 상태와 통화에 기본값을 줍니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS getdefaultsforcreate FOR READ
      IMPORTING keys FOR FUNCTION travel~getdefaultsforcreate RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD getdefaultsforcreate.
    result = VALUE #( FOR key IN keys
                      ( %cid   = key-%cid
                        %param = VALUE #( status       = 'O'
                                          currencycode = 'KRW' ) ) ).
  ENDMETHOD.
ENDCLASS.
```

OData 서비스에서 여행을 새로 만들면 `Status` 와 `CurrencyCode` 에 기본값이 채워져 있습니다.

## 알아두기

- 값을 미리 채우는 일은 **OData 서비스에서만** 일어납니다. default values function 이 붙은 작업을 ABAP EML 로 부르면 default values function 은 불리지 않고 기본값도 들어오지 않습니다.
- default values function 자체는 다른 RAP function 처럼 EML 의 [[abapread_entity_entities_op|READ ENTITIES ... EXECUTE]] 로 실행할 수 있습니다.

## 관련 항목

- [[abaprap_handler_default_val_func]]
- [[abenbdl_use_default_function]]
- [[abenbdl_nonstandard_projection]]
- [[abenbdl_external]]
- [[abenbdl_action_input_param]]
- [[abenbdl_standard_operations]]
- [[abenbdl_association]]
- [[abenbdl_operations_additions]]
