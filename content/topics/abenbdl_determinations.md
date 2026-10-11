---
title: determination
summary: 인스턴스가 만들어지거나 필드 값이 바뀌는 조건이 맞으면 RAP 프레임워크가 알아서 불러 값을 계산해 채우는 로직을 선언합니다.
keywords: determination, 결정, on modify, on save, trigger condition, 트리거 조건, FOR DETERMINE, 자동 계산, 멱등, idempotence, notrigger
---

## 문법

```syntax
determination DetName {on modify { CUD1 | {field Field1};
                                 [ CUD2;  ...; ]  [field Field2; ...] } }
                     |{on save   { CUD1 | {field Field1};
                                 [ CUD2;  ...; ]  [field Field2; ...] } }
```

## 설명

determination 은 조건이 맞을 때 RAP 프레임워크가 **스스로 불러 주는** 로직입니다. 사용자가 직접 부르지 않습니다. determination 안에서는 값을 계산하고, entity(엔터티) 인스턴스를 바꾸고, 메시지를 돌려줄 수 있습니다. "새 여행이 생기면 상태를 신규로 채운다", "예약 금액이 바뀌면 총액을 다시 계산한다" 같은 일을 맡깁니다.

실제 처리 내용은 behavior pool(동작 풀)의 handler method(핸들러 메서드) `FOR DETERMINE` 에 씁니다. 자세한 내용은 [[abaphandler_meth_det]] 를 봅니다.

이름 `DetName` 은 behavior definition(동작 정의)의 일반 이름 규칙([[abenbdl_general_syntax_rules]])을 따릅니다. 길이는 30자까지입니다.

### 실행 시점

| 종류 | 언제 실행되나 |
| --- | --- |
| `on modify` | transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)의 데이터가 바뀐 바로 뒤에 실행됩니다. 결과를 같은 트랜잭션 안에서 바로 쓸 수 있습니다. |
| `on save` | 트랜잭션 끝의 save sequence(저장 순서)에서 실행됩니다. 버퍼의 변경 내용을 데이터베이스에 쓰는 단계입니다. |

### 트리거 조건

중괄호 안에 조건을 하나 이상 적습니다. 그 가운데 **하나라도** 맞으면 determination 이 실행됩니다. 조건은 standard operation(표준 작업, [[abenbdl_standard_operations]])이거나 필드 변경입니다.

- `create` : 인스턴스가 만들어질 때 실행합니다.
- `update` : 인스턴스가 수정될 때 실행합니다. `on save` determination 에서는 `create` 와 함께 적을 때만 동작합니다.
- `delete` : 인스턴스가 삭제될 때 실행합니다.
- `field Field1, Field2, ...` : 생성이나 수정으로 적어 둔 필드 값이 바뀔 때 실행합니다. determination 이 붙은 entity 자신의 필드만 적을 수 있습니다.

### 쓸 수 있는 곳

- managed RAP BO
- draft 를 쓰는 unmanaged RAP BO

draft 를 쓰지 않는 unmanaged RAP BO 에서는 쓸 수 없습니다.

## 예제

여행에는 생성 직후 상태를 채우는 determination 과 저장할 때 번호를 채우는 determination 을 둡니다. 예약에는 금액이 바뀔 때마다 여행 총액을 다시 계산하는 determination 을 둡니다.

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
  association _Booking { create; }

  field ( readonly ) Status, TotalPrice;

  // 새 여행이 버퍼에 들어오면 곧바로 실행
  determination setStatusNew on modify { create; }

  // save sequence 에서 실행
  determination setTravelNumber on save { create; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID;
  association _Travel;

  // 예약 금액이나 통화가 바뀌면 실행
  determination calcTotalPrice on modify { field FlightPrice, CurrencyCode; }
}
```

behavior pool 에서는 determination 마다 `FOR DETERMINE` handler method 를 하나씩 만듭니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS setstatusnew FOR DETERMINE ON MODIFY
      IMPORTING keys FOR travel~setstatusnew.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD setstatusnew.
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    " 상태가 비어 있는 여행만 채운다. 여러 번 실행돼도 결과가 같다
    DELETE lt_travel WHERE status IS NOT INITIAL.
    CHECK lt_travel IS NOT INITIAL.

    MODIFY ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( status )
        WITH VALUE #( FOR ls_travel IN lt_travel
                      ( %tky = ls_travel-%tky status = 'N' ) )
      REPORTED DATA(ls_reported).

    reported = CORRESPONDING #( DEEP ls_reported ).
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 같은 조건에서 여러 번 실행해도 결과가 같아야 합니다(멱등).
- 실행 순서는 정해져 있지 않습니다. 같은 조건으로 여러 determination 이 걸리면 어느 것이 먼저 돌지 알 수 없습니다.
- 한번 실행된 determination 은 다른 determination 에 기대지 않고 혼자 돌아야 합니다.
- 한 요청에서 인스턴스를 만들고 곧바로 지우면, `on modify` determination 안의 EML 읽기가 실패할 수 있습니다. 그 키의 인스턴스를 찾을 수 없기 때문입니다.
- field characteristics(필드 특성) `notrigger[:warn]` 이 붙은 필드는 트리거 조건에 쓸 수 없습니다. [[abenbdl_field_char]] 를 봅니다.

## 관련 항목

- [[abenbdl_determination_abexa]]
- [[abaphandler_meth_det]]
- [[abenbdl_validations]]
- [[abenbdl_determine_action]]
- [[abenbdl_standard_operations]]
- [[abenbdl_field_char]]
- [[abenbdl_general_syntax_rules]]
