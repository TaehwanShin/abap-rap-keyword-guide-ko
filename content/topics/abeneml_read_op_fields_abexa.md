---
title: 예제 - READ 의 필드 지정 방식 (FROM, FIELDS WITH, ALL FIELDS WITH)
summary: READ 문에서 읽을 필드를 정하는 세 가지 방식 FROM, FIELDS ( ... ) WITH, ALL FIELDS WITH 를 한 프로그램에서 나란히 보여 주는 예제입니다.
keywords: READ ENTITY, FROM, FIELDS WITH, ALL FIELDS WITH, %control, BY \_assoc, EXECUTE, 필드 지정, 읽기 예제, 연관 관계로 읽기, 함수 실행
---

## 설명

간단한 managed RAP BO 를 EML 로 읽으면서, 읽을 필드를 정하는 세 가지 방식을 차례로 써 보는 예제입니다.

| 방식 | 읽을 필드를 정하는 법 |
| --- | --- |
| `FROM` | 입력 테이블의 `%control` 에 읽을 필드를 직접 표시합니다. |
| `FIELDS ( ... ) WITH` | 괄호 안에 읽을 필드 이름을 적습니다. |
| `ALL FIELDS WITH` | 모든 필드를 읽습니다. |

예제는 이 세 방식을 두 가지 읽기에 각각 적용합니다.

- entity(엔터티)를 직접 읽는 읽기 작업
- association 을 따라가 child entity(자식 엔터티)를 읽는 작업 (`BY \_assoc`)

마지막에는 function 을 실행하는 읽기(`EXECUTE`)도 하나 덧붙여 놓았습니다. function 실행은 [[abeneml_read_op_func_abexa]] 에서 따로 자세히 다룹니다.

원문 예제의 모델은 root entity(루트 엔터티, 항공편 일정)와 child entity(항공편 상세)로 된 managed BO 입니다. behavior definition(동작 정의)에는 standard operation(표준 작업), 자식을 만드는 association, 그리고 결과로 자기 자신을 돌려주는 function 하나가 있습니다. standard operation 은 managed RAP BO provider(제공자)가 처리하므로, behavior pool(동작 풀)에 직접 구현한 것은 이 function 뿐입니다. 아래에서는 같은 구조를 공통 예제 모델로 바꿔 적었습니다.

## 예제

behavior definition 입니다. function `getTravelInfo` 는 마지막 읽기에서 씁니다.

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
  association _Booking { create; }
  function ( authorization : none ) getTravelInfo result [1] $self;
  field ( readonly ) TravelID;
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  field ( readonly ) TravelID, BookingID;
  association _Travel;
}
```

사용하는 쪽 코드입니다. 모두 짧은 형식 `READ ENTITY` 를 쓰고, 입력 테이블은 `VALUE #( )` 로 그 자리에서 만듭니다.

```abap
" 1) FROM : 읽을 필드를 %control 에 직접 표시한다
READ ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001'
                  %control = VALUE #( agencyid   = if_abap_behv=>mk-on
                                      customerid = if_abap_behv=>mk-on
                                      begindate  = if_abap_behv=>mk-off
                                      enddate    = if_abap_behv=>mk-off ) ) )
  RESULT FINAL(lt_from)
  FAILED FINAL(ls_failed_from).

" 2) FIELDS ( ... ) WITH : 읽을 필드를 이름으로 적는다
READ ENTITY zr_travel
  FIELDS ( agencyid customerid status )
  WITH VALUE #( ( %key-travelid = '00000002' ) )
  RESULT FINAL(lt_fields)
  FAILED FINAL(ls_failed_fields).

" 3) ALL FIELDS WITH : 모든 필드를 읽는다
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( %key-travelid = '00000003' ) )
  RESULT FINAL(lt_all)
  FAILED FINAL(ls_failed_all).

" read-by-association 에도 같은 세 방식을 쓸 수 있다
READ ENTITY zr_travel
  BY \_booking
  FIELDS ( bookingid flightprice currencycode )
  WITH VALUE #( ( %key-travelid = '00000001' ) )
  RESULT FINAL(lt_booking)
  FAILED FINAL(ls_failed_rba).

" function 을 실행하는 읽기
READ ENTITY zr_travel
  EXECUTE gettravelinfo
  FROM VALUE #( ( %tky-travelid = '00000001' ) )
  RESULT FINAL(lt_info)
  FAILED FINAL(ls_failed_func).

" 실패했으면 원인을, 아니면 읽은 결과를 쓴다
IF ls_failed_from-travel IS NOT INITIAL.
  LOOP AT ls_failed_from-travel ASSIGNING FIELD-SYMBOL(<ls_failed>).
    DATA(lv_cause) = <ls_failed>-%fail-cause.
  ENDLOOP.
ENDIF.
```

## 알아두기

- 입력 테이블을 `VALUE #( )` 로 그 자리에서 만들면 알맞은 BDEF derived type(BDEF 파생 타입)이 자동으로 정해집니다.
- 어떤 작업을 하고 어떤 키워드를 쓰느냐에 따라 입력 테이블에 필요한 구성요소가 달라집니다. 예를 들어 `FROM` 을 쓰면 `%control` 을 직접 채워야 합니다.
- 읽기는 transactional buffer(트랜잭션 버퍼)에서 이루어집니다. 원문 예제에서는 RAP 쿼리 엔진이 데이터베이스 테이블의 데이터를 managed transactional buffer 로 읽어 오고, 각 읽기 작업은 그 버퍼를 대상으로 실행됩니다.
- 원문 예제는 읽기마다 결과를 화면에 냅니다. `FAILED` 에 내용이 있으면 `%fail` 을, 없으면 읽은 결과를 보여 줍니다. association 으로 읽은 결과는 앞의 세 줄만 골라 보여 줍니다.
- function 실행 결과는 `%param` 안에 들어 있어서, 원문 예제는 `%param` 의 값을 출력용 내부 테이블로 옮겨 담은 뒤 보여 줍니다.

## 관련 항목

- [[abapread_entity_entities_fields]]
- [[abapread_entity_entities_op]]
- [[abapread_entity_short]]
- [[abeneml_read_op_func_abexa]]
- [[abapeml_read_examples_abexas]]
- [[abapderived_types_control]]
- [[abapderived_types_fail]]
