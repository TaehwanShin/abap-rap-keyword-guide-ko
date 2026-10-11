---
title: 예제 - function
summary: managed RAP BO 에 instance function, static function, 입력 매개변수가 있는 function 을 선언하고 READ ENTITIES 의 EXECUTE 로 실행하는 예제입니다.
keywords: function, 함수 예제, static function, 정적 함수, READ ENTITIES, EXECUTE, %param, %cid, FOR READ, parameter, 할인 계산, 합계 계산
---

## 설명

managed RAP BO 에서 function 을 **선언하고, 구현하고, 실행하는** 예제입니다. 원문은 구매 주문을 나타내는 root entity(루트 엔터티) 하나짜리 데모 모델을 씁니다. 여기서는 같은 내용을 `Travel` 로 옮겨 적습니다.

function 은 셋입니다.

| function | 종류 | 하는 일 |
| --- | --- | --- |
| `getDetails` | instance function | 고른 인스턴스의 키, 가격, 상태를 읽어 돌려줍니다. |
| `calculateTotal` | static function | 상태가 `O` 인 모든 인스턴스의 가격을 더해 합계를 돌려줍니다. |
| `calculateDiscount` | 입력 매개변수가 있는 instance function | 입력받은 할인율만큼 가격에서 빼고, 줄어든 가격을 돌려줍니다. |

세 function 모두 결과로 정보만 내놓습니다. 변경 작업은 하지 않고, 데이터베이스의 데이터도 바뀌지 않습니다.

## 예제

behavior definition(동작 정의)입니다. 원문의 `calculateTotal` 은 DDIC 데이터 엘리먼트를 출력 타입으로 씁니다. 다만 원문도 BDEF 매개변수에는 CDS abstract entity(엔터티)만 쓰기를 권장한다고 적고 있어, 여기서는 abstract entity `ZA_TotalPrice` (필드 `total_price` 하나)로 적었습니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  // instance function
  function ( authorization : none ) getDetails result [0..*] $self;

  // static function
  static function ( authorization : none ) calculateTotal
    result [1] ZA_TotalPrice;

  // 입력 매개변수가 있는 function
  function ( authorization : none ) calculateDiscount
    parameter ZA_Discount
    result [1] $self;
}
```

behavior pool(동작 풀)에서는 function 마다 `FOR READ` 메서드를 둡니다. 원문은 구현 코드를 싣지 않았습니다. 아래는 static function 을 같은 뜻으로 직접 적은 구현입니다. static function 은 키가 없으므로 결과를 `%cid` 와 짝지어 돌려줍니다.

```abap
METHOD calculatetotal.
  " 상태가 O 인 여행의 총액을 모두 더한다. 읽기만 한다
  SELECT FROM ztravel
    FIELDS SUM( total_price )
    WHERE status = 'O'
    INTO @DATA(lv_total).

  result = VALUE #( FOR ls_key IN keys
                    ( %cid               = ls_key-%cid
                      %param-total_price = lv_total ) ).
ENDMETHOD.
```

BO 를 쓰는 쪽에서는 세 function 을 모두 `READ ENTITIES` 의 `EXECUTE` 로 부릅니다.

```abap
" 1) instance function: 키로 인스턴스 두 건을 고른다
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE getdetails
      FROM VALUE #( ( %tky-travelid = '00000001' )
                    ( %tky-travelid = '00000002' ) )
  RESULT DATA(lt_details)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 2) static function: 키 없이 %cid 만 넘긴다
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE calculatetotal
      FROM VALUE #( ( %cid = 'myCid' ) )
  RESULT DATA(lt_total)
  FAILED ls_failed
  REPORTED ls_reported.

" 3) 입력 매개변수가 있는 function: 키와 함께 %param 을 넘긴다
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE calculatediscount
      FROM VALUE #( ( %tky-travelid           = '00000001'
                      %param-discount_percent = 30 ) )
  RESULT DATA(lt_discount)
  FAILED ls_failed
  REPORTED ls_reported.

" 결과 값은 %param 에 들어 있다
LOOP AT lt_discount INTO DATA(ls_discount).
  DATA(lv_reduced_price) = ls_discount-%param-totalprice.
ENDLOOP.
```

## 알아두기

### 실행하면

원문 프로그램은 먼저 ABAP SQL 로 persistent table 에 여섯 건을 직접 넣습니다. 모두 상태가 `O` 입니다. 이렇게 해 두면 인스턴스가 이미 있으므로 EML 로 따로 만들 필요가 없습니다. 그런 다음 세 function 을 차례로 실행하고 결과를 화면에 내보냅니다.

1. `getDetails` 를 인스턴스 두 건에 실행합니다. 대상은 키 필드 값으로 정합니다. 결과 구조에 두 인스턴스의 키, 가격, 상태가 담겨 옵니다.
2. `calculateTotal` 은 static function 라 특정 인스턴스가 아니라 BO 전체에 걸립니다. 상태가 `O` 인 인스턴스를 골라 가격을 모두 더합니다. 이 예제에서는 모든 인스턴스의 상태가 `O` 이므로 전체 합계가 나옵니다.
3. `calculateDiscount` 는 입력 매개변수가 있는 instance function 입니다. 실행하려면 인스턴스와 입력값을 모두 줘야 합니다. 할인율 30 을 넘기면, 가격에서 30% 를 뺀 값이 결과 구조에 담겨 옵니다.

### 눈여겨볼 점

- function 은 `MODIFY ENTITIES` 가 아니라 **`READ ENTITIES ... EXECUTE`** 로 부릅니다.
- instance function 은 키로, static function 은 `%cid` 로 실행합니다. static function 의 결과에서도 `%cid` 로 어느 요청의 결과인지 알아봅니다.
- function 이 돌려준 값은 결과 테이블의 `%param` 에 들어 있습니다.
- `calculateDiscount` 를 실행해도 테이블의 가격은 그대로입니다. 계산한 값만 돌려줄 뿐 저장하지 않습니다.

## 관련 항목

- [[abenbdl_function]]
- [[abenbdl_static]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abaphandler_meth_read]]
