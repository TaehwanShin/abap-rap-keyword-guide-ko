---
title: action
summary: 생성·수정·삭제 같은 standard operation 말고, 직접 만든 업무 처리를 entity 에 붙이는 문법입니다.
keywords: action, 액션, static action, factory action, save action, repeatable, non-factory action, 비표준 작업, FOR MODIFY
---

## 문법

non-factory action (factory 가 아닌 action)

```syntax
[internal][static] [repeatable] action
                  [(
                  [features: {instance | global}]
                  [precheck]
                  [authorization:none]
                  [authorization:update]
                  [authorization:global]
                  [authorization:instance]
                  [lock:none]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                  [OutputParameter];
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

factory action

```syntax
[internal][static [default]] factory action
                  [(
                  [features: {instance | global}]
                  [precheck]
                  [authorization:none]
                  [authorization:update]
                  [authorization:global]
                  [authorization:instance]
                  [lock:none]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                   [cardinality];
                   [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

save action

```syntax
[internal][static][factory]
  save(finalize|adjustnumbers|finalize, adjustnumbers) action
                  [(
                  [features: global]
                  [precheck]
                  [authorization:none]
                  [authorization:global]
                  [authorization:instance]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                  [OutputParameter];
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

## 설명

action 은 entity(엔터티) 인스턴스의 상태를 바꾸는 **사용자 정의 작업**입니다. "여행 승인", "예약 취소"처럼 standard operation(표준 작업, 생성·수정·삭제)만으로는 나타내기 어려운 업무 처리를 action 으로 만듭니다. 실제 처리 내용은 behavior pool(동작 풀)의 handler method(핸들러 메서드) `FOR MODIFY` 안에 직접 씁니다.

action 은 세 갈래로 나뉩니다.

| 종류 | 하는 일 |
| --- | --- |
| non-factory action | 이미 있는 인스턴스를 바꿉니다. `repeatable` 을 붙이면 한 번의 요청 안에서 같은 인스턴스에 여러 번 실행할 수 있습니다. |
| factory action | 인스턴스를 새로 만듭니다. `default` 를 붙인 default factory action 은 그 가운데 특별한 한 가지입니다. |
| save action | `save(...)` 가 붙은 action 입니다. save sequence(저장 순서) 안에서만 실행할 수 있습니다. non-factory action 일 수도, factory action 일 수도 있습니다. |

자주 쓰는 추가 구문은 다음과 같습니다.

- `internal` : 같은 business object(비즈니스 객체) 안에서만 부를 수 있게 합니다.
- `static` : 특정 인스턴스에 묶이지 않는 action 입니다. 키 없이 부릅니다.
- `features: instance | global` : 조건에 따라 action 을 켜고 끄는 feature control(기능 제어)를 겁니다.
- `precheck` : 요청이 transactional buffer(트랜잭션 버퍼)에 닿기 전에 미리 점검합니다.
- `authorization:...` : 권한 확인 방식을 정합니다.
- `lock:none` : action 을 실행할 때 잠금을 걸지 않습니다.
- `external 'ExternalName'` : 바깥(OData)에 보일 이름을 따로 정합니다.

## 예제

여행을 승인하는 instance action 과, 기존 여행을 복사해 새 여행을 만드는 factory action 을 선언합니다.

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

  // 승인: 바뀐 자기 자신을 결과로 돌려준다
  action ( features : instance ) acceptTravel result [1] $self;

  // 복사: 새 인스턴스를 하나 만든다
  factory action copyTravel [1];
}
```

behavior pool 에서는 action 마다 `FOR MODIFY` handler method 를 하나씩 만듭니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS accepttravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~accepttravel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD accepttravel.
    " 넘어온 키의 여행 상태를 '승인(A)'으로 바꾼다
    MODIFY ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( status )
        WITH VALUE #( FOR key IN keys ( %tky = key-%tky status = 'A' ) )
      FAILED failed
      REPORTED reported.

    " 바뀐 내용을 다시 읽어 결과로 돌려준다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    result = VALUE #( FOR ls_travel IN lt_travel
                      ( %tky = ls_travel-%tky %param = ls_travel ) ).
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- save action 을 interaction phase(상호작용 단계)에서 부르면 런타임 오류가 납니다. save sequence 안에서만 부릅니다.
- save action 에는 `features: instance`, `authorization:update`, `lock:none` 을 쓸 수 없습니다. 문법 틀에 없는 조합입니다.

## 관련 항목

- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_factory]]
- [[abenbdl_action_onsave]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abenbdl_default_function]]
- [[abaphandler_meth_modify]]
