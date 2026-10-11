---
title: 예제 - ABP 보조 클래스
summary: action handler method 가 보조 클래스의 메서드를 불러 계산을 맡기고, 보조 클래스 안에서 IN LOCAL MODE 로 EML 을 쓰는 모습을 보여 주는 예제입니다.
keywords: ABP auxiliary class, 보조 클래스 예제, auxiliary class, IN LOCAL MODE, FOR BEHAVIOR OF, action, 액션, 재사용 메서드, COMMIT ENTITIES, 실행 예제
---

## 설명

원문 예제는 [[abaprap_auxiliary_class|ABP 보조 클래스]]를 쓰는 managed RAP BO 입니다.

- 데이터 모델은 root entity(루트 엔터티) 하나뿐입니다.
- behavior definition(동작 정의)에 `auxiliary class` 로 보조 클래스를 알리고, action 세 개(`div`, `multiply`, `powers`)를 둡니다. 각각 나누기, 곱하기, 거듭제곱을 합니다.
- behavior implementation(동작 구현)은 두 군데에 나뉘어 있습니다. behavior pool(동작 풀)의 CCIMP 인클루드에 있는 로컬 클래스와, 따로 만든 보조 클래스입니다.

세 action 은 보조 클래스를 쓰는 방식이 다릅니다.

| action | 보조 클래스를 쓰는 방식 |
| --- | --- |
| `div` | handler method(핸들러 메서드)가 구현을 통째로 보조 클래스에 넘깁니다. 보조 클래스 안에서 `IN LOCAL MODE` 를 쓸 수 있음을 보여 주려는 것이고, 본받을 방식은 아닙니다. |
| `multiply`, `powers` | handler method 가 처리하다가 보조 클래스의 메서드를 부릅니다. 여러 번 쓸 메서드를 보조 클래스에 두는 모습이고, 여기서도 `IN LOCAL MODE` 를 씁니다. |

## 예제

같은 짜임새를 공통 예제 모델로 줄여 쓴 것입니다. 여행 금액을 바꾸는 action 두 개가 보조 클래스의 메서드 하나를 함께 씁니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
auxiliary class zcl_travel_aux;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  action halvePrice;
  action doublePrice;
}
```

보조 클래스에는 금액을 주어진 비율(퍼센트)로 바꿔 다시 써 넣는 메서드를 둡니다.

```abap
CLASS zcl_travel_aux DEFINITION PUBLIC FINAL CREATE PUBLIC
  FOR BEHAVIOR OF zr_travel.
  PUBLIC SECTION.
    TYPES tt_keys     TYPE TABLE FOR KEY OF zr_travel.
    TYPES ts_reported TYPE RESPONSE FOR REPORTED EARLY zr_travel.
    CLASS-METHODS scale_price
      IMPORTING it_keys     TYPE tt_keys
                iv_percent  TYPE i
      CHANGING  cs_reported TYPE ts_reported.
ENDCLASS.

CLASS zcl_travel_aux IMPLEMENTATION.
  METHOD scale_price.
    " 보조 클래스에서도 IN LOCAL MODE 로 자기 RAP BO 를 다룬다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( totalprice ) WITH CORRESPONDING #( it_keys )
      RESULT DATA(lt_travel).

    MODIFY ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( totalprice )
        WITH VALUE #( FOR ls_travel IN lt_travel
                      ( %tky       = ls_travel-%tky
                        totalprice = ls_travel-totalprice * iv_percent / 100 ) )
      REPORTED cs_reported.
  ENDMETHOD.
ENDCLASS.
```

handler method 는 behavior pool 에 있고, 계산만 보조 클래스에 맡깁니다.

```abap
METHOD halveprice.
  zcl_travel_aux=>scale_price(
    EXPORTING it_keys     = CORRESPONDING #( keys )
              iv_percent  = 50
    CHANGING  cs_reported = reported ).
ENDMETHOD.

METHOD doubleprice.
  zcl_travel_aux=>scale_price(
    EXPORTING it_keys     = CORRESPONDING #( keys )
              iv_percent  = 200
    CHANGING  cs_reported = reported ).
ENDMETHOD.
```

RAP BO consumer(사용자)는 평소처럼 EML 로 action 을 부릅니다.

```abap
MODIFY ENTITY zr_travel
  EXECUTE halveprice
    FROM VALUE #( ( travelid = '00000001' ) ( travelid = '00000002' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.
```

## 알아두기

원문 프로그램은 다음 순서로 움직입니다.

1. 생성 작업으로 인스턴스를 여러 개 만듭니다. action 마다 쓸 인스턴스가 네 개씩이고, 입력 값에는 0 으로 나누는 경우와 아주 큰 수도 들어 있습니다.
2. `div` action 을 실행합니다. 두 정수 값을 나눕니다. handler method 안에서 보조 클래스의 메서드를 부릅니다.
3. `powers` 와 `multiply` action 을 실행합니다. 두 경우 모두 handler method 가 보조 클래스의 메서드를 부릅니다.
4. 작업마다 `COMMIT ENTITIES` 로 데이터베이스에 저장하고, 데이터베이스 테이블을 다시 읽어 화면에 보여 줍니다.

출력에는 작업을 마칠 때마다 데이터베이스 테이블의 내용이 나오고, response parameter(응답 매개변수) `reported` 에 담긴 메시지도 함께 나옵니다.

눈여겨볼 점은 두 가지입니다.

- 보조 클래스는 `FOR BEHAVIOR OF` 로 RAP BO 에 딸려 있어서, behavior pool 처럼 `IN LOCAL MODE` 를 쓸 수 있습니다.
- 원문은 `div` 처럼 구현을 통째로 보조 클래스에 넘기는 방식을 피하라고 분명히 적고 있습니다. 보조 클래스의 메서드 매개변수에 BDEF derived type(BDEF 파생 타입)을 따로 선언해야 하는 등 덧붙는 일이 많기 때문입니다.

## 관련 항목

- [[abaprap_auxiliary_class]]
- [[abenbdl_auxiliary_class]]
- [[abapin_local_mode]]
- [[abenbdl_action]]
