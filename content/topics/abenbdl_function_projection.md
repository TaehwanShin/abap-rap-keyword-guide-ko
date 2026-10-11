---
title: projection BDEF 의 function
summary: base BDEF 에 없는 function·default values function·key function 을 projection 계층에서 새로 정의하는 문법으로, authorization control 은 projection BDEF 에 따로 적어야 합니다.
keywords: function, 함수, projection BDEF, 프로젝션 BDEF, 프로젝션 함수, 새 함수, static function, default function, 기본값 함수, key function, 키 함수, use key, FOR READ, authorization
---

## 문법

```syntax
[internal] [static] function
           [(
           [features: {instance | global}]
           [authorization:none]
           [authorization:global]
           [authorization:instance]
           )]
           FunctionName
           [external 'ExternalName']
           [InputParameter]
            OutputParameter
           [{default function GetDefaultsForFuncName [external 'GetDefaultsForExtName'];}]
           [key (AlternativeKey) function FunctionName ...;]
```

## 설명

projection BDEF 에서는 base BDEF(기반 BDEF)의 function 을 [[abenbdl_use_projection|use function]] 으로 다시 쓰는 것 말고도, projection 계층에만 있는 function 을 **새로 정의**할 수 있습니다. 새로 만들 수 있는 것은 세 가지입니다.

- 일반 function
- default values function (`default function`)
- key function (`key ( ... ) function`)

정의하는 방법은 base BDEF 에서 function 을 정의할 때와 같습니다. 각 추가 구문의 뜻은 [[abenbdl_function]] 을 보세요. 구현은 projection BDEF 의 behavior pool(동작 풀)에 씁니다.

다른 점은 두 가지입니다.

**권한** : projection BDEF 에서는 base BDEF 의 authorization master 를 쓸 수 없습니다. 새 function 에 권한 확인이 필요하면 projection BDEF 의 BO 노드마다 authorization control(권한 제어)를 직접 적어야 합니다. 방법은 [[abenbdl_authorization_projection]] 에 있습니다.

**key function** : projection BDEF 에서는 대체 키를 새로 정의할 수 없습니다. key function 을 만들려면 먼저 base BO(기반 BO)의 BDEF 대체 키를 `use key AltKeyName` 으로 끌어와야 합니다. 이렇게 끌어온 키를 바탕으로 key function 을 정의합니다.

## 예제

projection BDEF 에 function `getDetails` 를 새로 만듭니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict;

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;

  // projection 계층에만 있는 새 function
  function getDetails result [0..*] $self;
}
```

projection 의 behavior pool 에서 function 을 구현합니다. 필드 몇 개를 읽어 결과로 돌려줄 뿐, 데이터는 바꾸지 않습니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS getdetails FOR READ
      IMPORTING keys FOR FUNCTION travel~getdetails RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD getdetails.
    CHECK keys IS NOT INITIAL.

    READ ENTITIES OF zc_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( TravelID Status )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel)
      FAILED DATA(ls_read_failed).

    failed = CORRESPONDING #( DEEP ls_read_failed ).

    LOOP AT lt_travel INTO DATA(ls_travel).
      APPEND VALUE #( %tky   = ls_travel-%tky
                      %param = CORRESPONDING #( ls_travel ) ) TO result.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

여행 두 건을 만들고 이 function 을 실행하면, 두 여행의 `TravelID` 와 `Status` 가 결과 구조에 담겨 돌아옵니다.

## 알아두기

- projection BDEF 에 새 function 을 정의하려면 projection BDEF 머리말에 `implementation in class ...` 로 behavior pool 을 지정해야 합니다.
- projection BDEF 에서는 대체 키를 새로 만들 수 없습니다. key function 은 `use key` 로 끌어온 키 위에서만 정의합니다.
- projection BDEF 에는 base BDEF 의 authorization master 가 없습니다.

## 관련 항목

- [[abenbdl_function]]
- [[abenbdl_authorization_projection]]
- [[abenbdl_use_projection]]
- [[abenbdl_nonstandard_projection]]
- [[abenbdl_keyfunction]]
- [[abenbdl_default_function]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abenbdl_actions_fc]]
- [[abenbdl_external]]
