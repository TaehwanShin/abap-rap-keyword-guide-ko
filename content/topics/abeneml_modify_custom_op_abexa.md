---
title: 예제 - MODIFY 로 action 실행하기
summary: MODIFY 문의 EXECUTE 로 managed BO 의 action 을 실행하는 예제입니다. 매개변수를 받아 계산하고 결과를 다른 필드에 써넣는 action 을 구현합니다.
keywords: EXECUTE, action, 액션 실행, 비표준 작업, nonstandard operation, %param, parameter, result $self, FOR MODIFY, IN LOCAL MODE, COMMIT ENTITIES RESPONSE OF, 예제, CL_DEMO_RAP_CUSTOM_OP_M
---

## 설명

`MODIFY` 문으로 managed RAP BO 의 [[abenbdl_action|action]] 을 실행하는 예제입니다. 원문의 시나리오는 단순한 계산입니다. 테이블의 두 칸에 들어 있는 값으로 계산을 하고, 그 결과를 또 다른 칸에 써넣습니다. 어떤 계산을 할지는 사용자가 입력한 연산 기호(`+`, `-`, `*`, `/`)로 정하고, 이 기호를 action 의 매개변수로 넘깁니다.

원문의 action `calculate` 는 매개변수용 abstract entity(엔터티) 하나를 받고, 출력 매개변수가 `result [1] $self` 입니다. 그래서 action 을 실행한 바로 그 인스턴스가 결과로 돌아옵니다.

action 은 standard operation(표준 작업)이 아니므로 behavior pool(동작 풀)에 직접 구현합니다. 원문 handler method(핸들러 메서드)가 하는 일은 네 가지입니다.

1. EML `READ` 문으로 계산에 쓸 두 값을 읽습니다.
2. 넘어온 연산 기호에 따라 계산합니다.
3. EML `MODIFY` 문으로 결과 칸을 고칩니다.
4. 출력 매개변수 `result` 를 채웁니다.

아래에서는 같은 흐름을 Travel 로 옮겼습니다. `FlightPrice` 와 `BookingFee` 두 필드로 계산해 `TotalPrice` 에 넣는 action `calcTotal` 입니다. 연산 기호는 abstract entity `ZA_CalcParam` 의 필드 `MathSymbol` 로 받습니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  action calcTotal parameter ZA_CalcParam result [1] $self;

  field ( readonly : update ) TravelID;
}
```

## 예제

action 을 구현한 handler method 입니다.

```abap
METHOD calctotal.
  " 1) 계산에 쓸 두 값을 읽는다
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( flightprice bookingfee ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 2) 넘어온 연산 기호에 따라 계산한다
  LOOP AT lt_travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
    DATA(lv_symbol) = keys[ %tky = <ls_travel>-%tky ]-%param-mathsymbol.
    <ls_travel>-totalprice = SWITCH #( lv_symbol
      WHEN '+' THEN <ls_travel>-flightprice + <ls_travel>-bookingfee
      WHEN '-' THEN <ls_travel>-flightprice - <ls_travel>-bookingfee ).
  ENDLOOP.

  " 3) 결과 필드를 고친다
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( totalprice )
      WITH VALUE #( FOR ls_calc IN lt_travel
                    ( %tky = ls_calc-%tky totalprice = ls_calc-totalprice ) )
    FAILED   failed
    REPORTED reported.

  " 4) 바뀐 인스턴스를 결과로 돌려준다
  result = VALUE #( FOR ls_calc IN lt_travel
                    ( %tky = ls_calc-%tky %param = ls_calc ) ).
ENDMETHOD.
```

RAP BO consumer(사용자) 쪽에서는 `EXECUTE` 로 action 을 부릅니다. 매개변수 값은 `%param` 에 넣습니다.

```abap
DATA(lv_symbol) = '+'.

" 계산할 값을 가진 여행을 만든다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid flightprice bookingfee )
  WITH VALUE #( ( %cid = 'cid1' travelid = '00000001'
                  flightprice = '500.00' bookingfee = '30.00' ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" action 을 실행한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE calctotal
    FROM VALUE #( ( travelid = '00000001' %param-mathsymbol = lv_symbol ) )
    RESULT DATA(lt_result)
  FAILED   ls_failed
  REPORTED ls_reported.

" action 이 버퍼에 써 둔 변경을 저장한다
COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED   DATA(ls_commit_failed)
  REPORTED DATA(ls_commit_reported).

IF sy-subrc <> 0.
  " save sequence 에서 문제가 났다
ENDIF.
```

## 알아두기

- 원문 프로그램의 흐름은 이렇습니다. 연산 기호를 입력받고, `MODIFY` 로 계산할 값이 든 인스턴스 둘을 만들고, `READ` 로 읽어 실행 전 값을 출력합니다. 그다음 `EXECUTE` 로 action 을 실행하고 `COMMIT ENTITIES` 로 저장한 뒤, persistent table 을 `SELECT` 로 읽어 결과 칸에 계산값이 들어간 것을 보여 줍니다.
- 원문은 허용하지 않는 기호가 들어오면 안내 문구를 출력하고 끝냅니다.
- action 은 transactional buffer(트랜잭션 버퍼)만 바꿉니다. `COMMIT ENTITIES` 를 실행해야 데이터베이스에 저장됩니다.
- action 에 매개변수가 있으면 `EXECUTE` 에 넘기는 테이블의 각 줄에 `%param` 구성요소가 생깁니다. 인스턴스마다 다른 값을 넘길 수 있습니다.
- 위 핸들러 코드는 EML 문에 `IN LOCAL MODE` 를 붙였습니다. RAP BO 구현 안에서 feature control(기능 제어)와 권한 확인을 건너뛰는 추가 구문입니다.
- action 의 다른 예제는 [[abenbdl_action_abexas]] 에 모여 있습니다.

## 관련 항목

- [[abapmodify_entity_entities_op]]
- [[abenbdl_action]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abapcommit_entities]]
- [[abapeml_modify_examples_abexas]]
