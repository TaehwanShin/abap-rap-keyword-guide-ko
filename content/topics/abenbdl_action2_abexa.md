---
title: 예제 - 입력 매개변수가 있는 action
summary: abstract entity 로 타입을 정한 입력 매개변수를 action 에 붙이고, EML 에서 %param 으로 할인율을 넘겨 가격을 깎는 예제입니다.
keywords: action, parameter, 입력 매개변수, input parameter, %param, abstract entity, 추상 엔터티, 할인 액션, EXECUTE, FOR MODIFY, result [1] $self
---

## 설명

managed RAP BO 에서 **입력 매개변수가 있는 action** 을 선언하고, 구현하고, 실행하는 예제입니다. 원문은 구매 주문 항목을 나타내는 root entity(루트 엔터티) 하나짜리 데모 모델을 쓰고, 입력으로 받은 할인율만큼 항목 가격을 깎습니다. 여기서는 같은 내용을 `Travel` 의 `TotalPrice` 로 옮겨 적습니다.

action `deductDiscount` 는 이렇게 생겼습니다.

- 입력 매개변수가 하나 있습니다. 타입은 CDS abstract entity(엔터티) `ZA_Discount` 입니다.
- 출력 매개변수는 `result [1] $self` 입니다. action 을 실행한 entity 와 같은 타입입니다.

## 예제

입력 매개변수의 타입이 되는 abstract entity 입니다. 할인율 필드 하나만 있습니다.

```cds
@EndUserText.label: 'Discount rate'
define abstract entity ZA_Discount
{
  discount_percent : abap.int1;
}
```

behavior definition(동작 정의)에서 `parameter` 뒤에 이 abstract entity 를 적습니다.

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

  action deductDiscount parameter ZA_Discount result [1] $self;

  field ( readonly : update ) TravelID;
}
```

handler method(핸들러 메서드)는 `FOR MODIFY` 메서드이고, 시그니처에 `result` 매개변수가 들어 있습니다. 원문은 구현 코드를 싣지 않았습니다. 아래는 같은 일을 하도록 직접 적은 구현입니다. 입력값은 `keys` 의 `%param` 에서 꺼냅니다.

```abap
" handler class 정의부
METHODS deductdiscount FOR MODIFY
  IMPORTING keys FOR ACTION travel~deductdiscount RESULT result.

" handler class 구현부
METHOD deductdiscount.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( totalprice ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 넘어온 할인율만큼 총액을 깎는다
  LOOP AT lt_travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
    DATA(lv_percent) = keys[ %tky = <ls_travel>-%tky ]-%param-discount_percent.
    <ls_travel>-totalprice = <ls_travel>-totalprice * ( 100 - lv_percent ) / 100.
  ENDLOOP.

  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( totalprice ) WITH CORRESPONDING #( lt_travel )
    FAILED failed
    REPORTED reported.

  result = VALUE #( FOR ls_travel IN lt_travel
                    ( %tky = ls_travel-%tky %param = ls_travel ) ).
ENDMETHOD.
```

BO 를 쓰는 쪽에서는 키와 함께 `%param` 에 할인율을 실어 보냅니다.

```abap
DATA(lv_percentage) = 10.

" 여행 두 건을 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid totalprice )
    WITH VALUE #( ( %cid = 'cid1' travelid = '00000001' totalprice = 200 )
                  ( %cid = 'cid2' travelid = '00000002' totalprice = 999 ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 할인율을 입력 매개변수로 넘겨 action 을 실행한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE deductdiscount
      FROM VALUE #( ( travelid = '00000001' %param-discount_percent = lv_percentage )
                    ( travelid = '00000002' %param-discount_percent = lv_percentage ) )
  RESULT DATA(lt_result)
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED DATA(ls_commit_failed)
  REPORTED DATA(ls_commit_reported).

SELECT travel_id, total_price
  FROM ztravel
  INTO TABLE @DATA(lt_saved).
```

## 알아두기

### 실행하면

1. 원문 프로그램은 먼저 사용자에게 할인율을 입력받습니다. 0 에서 100 사이가 아니면 올바른 값을 넣으라는 안내를 내보냅니다.
2. `MODIFY ENTITIES` 로 인스턴스 두 건을 만들고, 할인 전 가격을 `READ ENTITY` 로 읽어 화면에 보여 줍니다.
3. `EXECUTE` 로 `deductDiscount` 를 실행합니다. `result`, `failed`, `reported` 가 돌아옵니다.
4. action 이 transactional buffer(트랜잭션 버퍼)에 해 둔 변경을 `COMMIT ENTITIES RESPONSE OF` 로 저장합니다.
5. `SELECT` 로 persistent table 을 읽으면 가격이 입력한 비율만큼 줄어 있습니다. 10 을 넣었다면 200 은 180 이 됩니다.

### 눈여겨볼 점

- 입력 매개변수의 값은 EML 에서 `%param-필드이름` 으로 넘기고, handler method 에서도 `%param` 으로 받습니다.
- 인스턴스마다 `%param` 을 따로 적으므로, 인스턴스마다 다른 값을 줄 수도 있습니다.
- 원문 프로그램은 `EXECUTE` 를 `TRY ... CATCH cx_sy_conversion_overflow` 로 감쌉니다. 변환 오버플로 예외가 나면 그 비율은 받아들일 수 없다는 안내를 내보냅니다.

## 관련 항목

- [[abenbdl_action_input_param]]
- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_output_para]]
- [[abaphandler_meth_modify]]
- [[abenbdl_action1_abexa]]
- [[abenbdl_action3_abexa]]
