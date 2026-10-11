---
title: default values function handler method (getdefaultsfor...)
summary: behavior definition 에 default values function(default function)를 달았을 때 behavior pool 에 구현해야 하는, 이름이 정해진 FOR READ handler method 입니다.
keywords: default values function, 기본값 함수, default function, getdefaultsforcreate, getdefaultsfor, GetDefaultsForCreate, FOR READ, FOR FUNCTION, 핸들러 메서드, %param, %cid, 기본값
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS [getdefaultsforcreate | getdefaultsforname]
   FOR READ [IMPORTING] imp_param
   FUNCTION [bdef~getdefaultsforcreate | bdef~getdefaultsforname]
   RESULT res_func.
```

이 문법 틀은 ADT(ABAP development tools for Eclipse)의 빠른 수정(quick fix)이 만들어 주는 선언만 보여 줍니다. 쓸 수 있는 선택 항목 전체는 [[abaphandler_meth_read]] 에 있습니다.

원문 틀에는 `FUNCTION` 앞에 `FOR` 가 없습니다. 그러나 [[abaphandler_meth_read]] 의 문법 틀은 입력 매개변수 뒤에 `FOR FUNCTION bdef~function` 을 적게 되어 있고, [[abenbdl_default_function]] 의 원문도 이 메서드를 `FOR READ ... FOR FUNCTION ...` 이라고 부릅니다. 선언은 아래 예제처럼 `FOR FUNCTION` 으로 적습니다.

## 설명

behavior definition(동작 정의)에서 RAP BO 작업에 [[abenbdl_default_function|default values function]] 을 달았다면, behavior pool(동작 풀)에 handler method 를 구현해야 합니다. default values function 은 작업을 실행하기 전에 미리 채워 줄 값을 돌려주는 function 입니다.

### 메서드 이름

메서드 이름은 정해져 있습니다.

- `getdefaultsforcreate` : 생성 작업에 씁니다. 다른 이름으로 바꿀 수 없습니다.
- `getdefaultsforname` : create-by-association, function, action 에 씁니다. 앞부분 `getdefaultsfor` 는 꼭 있어야 하고, 뒤의 `name` 자리에 behavior definition 에 적은 대로 직접 지은 이름이 옵니다.

### 입력 매개변수 imp_param

타입은 [[abaptype_table_for|TYPE TABLE FOR FUNCTION IMPORT]] 이고 자동으로 파생됩니다. 무엇의 default values function 이냐에 따라 들어 있는 구성요소가 다릅니다.

| 대상 작업 | 들어 있는 것 |
| --- | --- |
| 생성 | [[abapderived_types_cid|%cid]] |
| create-by-association | RAP BO 인스턴스의 키 값 |
| static function, static action | `%cid` |
| instance function, instance action | RAP BO 인스턴스의 키 값 |

상황에 따라 구성요소가 더 들어갈 수 있습니다. 예를 들어 draft 를 쓰는 RAP BO 라면 draft 표시 [[abapderived_types_is_draft|%is_draft]] 가 들어 있습니다.

### 출력 매개변수 res_func

타입은 [[abaptype_table_for|TYPE TABLE FOR FUNCTION RESULT]] 이고 자동으로 파생됩니다. 기본값은 [[abapderived_types_param|%param]] 구성요소에 담습니다.

- 생성, create-by-association : 인스턴스 식별자(키 필드 값 또는 `%cid`)를 대상 entity(엔터티)의 필드에 짝지은 테이블입니다.
- function, action : 인스턴스 식별자(키 필드 값 또는 `%cid`)를 그 작업의 입력 매개변수 필드 값에 짝지은 테이블입니다.

## 예제

여행을 새로 만들 때 시작일을 오늘로, 통화를 KRW 로 미리 채워 줍니다. behavior definition 에는 이렇게 선언합니다.

```bdl
create { default function GetDefaultsForCreate; }
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS getdefaultsforcreate FOR READ
      IMPORTING keys FOR FUNCTION travel~getdefaultsforcreate
      RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD getdefaultsforcreate.
    DATA(lv_today) = cl_abap_context_info=>get_system_date( ).

    " 요청마다 %cid 를 그대로 돌려주고, %param 에 기본값을 담는다
    result = VALUE #( FOR ls_key IN keys
                      ( %cid                = ls_key-%cid
                        %param-begindate    = lv_today
                        %param-currencycode = 'KRW' ) ).
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 메서드 이름을 마음대로 지을 수 없습니다. `getdefaultsfor` 로 시작해야 합니다.
- 입력과 출력 매개변수의 타입은 직접 고르지 않습니다. 대상 작업에 맞게 자동으로 파생됩니다.

## 관련 항목

- [[abenbdl_default_function]]
- [[abaphandler_meth_read]]
- [[abapmethods_for_rap_behv]]
- [[abaptype_table_for]]
- [[abapderived_types_param]]
