---
title: 예제 - READ 문의 세 가지 형식
summary: 같은 managed BO 를 READ ENTITY, READ ENTITIES OF, READ ENTITIES OPERATIONS 세 형식으로 읽어 보며 차이를 견주는 예제입니다.
keywords: READ ENTITY, READ ENTITIES OF, READ ENTITIES OPERATIONS, 짧은 형식, 긴 형식, 동적 형식, ABP_BEHV_RETRIEVALS_TAB, BY, ALL FIELDS WITH, RESULT, LINK, 예제, CL_DEMO_RAP_EML_READ
---

## 설명

EML `READ` 문에는 세 가지 형식이 있습니다. 이 예제는 간단한 managed RAP BO 하나를 세 형식으로 차례로 읽어 봅니다.

- `READ ENTITY bdef` : 짧은 형식. entity(엔터티) 하나에서 읽습니다.
- `READ ENTITIES OF bdef` : 긴 형식. 한 BO 의 여러 entity 에서 읽습니다.
- `READ ENTITIES OPERATIONS op_tab` : 동적 형식. 읽을 내용을 내부 테이블로 넘깁니다.

원문의 BO 는 항공편 일정을 나타내는 root entity(루트 엔터티)와, 날짜별 항공편을 나타내는 child entity(자식 엔터티)로 이루어져 있습니다. 루트에는 standard operation(표준 작업)과 자식을 만드는 association, function 하나가 선언돼 있습니다. behavior pool(동작 풀)이 있긴 하지만, 이 예제는 직접 만든 작업을 쓰지 않으므로 그 구현은 볼 필요가 없습니다. 아래에서는 같은 흐름을 Travel / Booking 으로 옮겼습니다.

## 예제

### 짧은 형식

루트를 바로 읽고, association 으로 예약을 읽습니다. 결과 테이블은 `DATA( )` 로 그 자리에서 선언합니다. 그러면 필요한 BDEF derived type(BDEF 파생 타입)이 자동으로 정해집니다.

```abap
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed).

IF ls_failed-travel IS NOT INITIAL.
  " 읽지 못했다
ENDIF.

" read-by-association
READ ENTITY zr_travel
  BY \_booking
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_booking)
  FAILED DATA(ls_rba_failed).
```

### 긴 형식

루트 읽기, child entity 바로 읽기, read-by-association 을 한 문장에 모읍니다. child entity 는 BDEF 의 별칭으로 적습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
    RESULT DATA(lt_travel_2)
  ENTITY booking
    " 키 필드를 모두 적어야 한다
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' bookingid = '0001' ) )
    RESULT DATA(lt_booking_2)
  ENTITY travel
    BY \_booking
    ALL FIELDS WITH VALUE #( ( travelid = '00000002' ) )
    RESULT DATA(lt_booking_by_assoc)
  FAILED DATA(ls_failed_2).
```

### 동적 형식

`ABP_BEHV_RETRIEVALS_TAB` 타입 테이블에 읽기 작업을 한 줄씩 담습니다. 입력 테이블, 결과 테이블, 연결 테이블은 참조로 넘깁니다.

```abap
DATA: lt_op       TYPE abp_behv_retrievals_tab,
      lt_read     TYPE TABLE FOR READ IMPORT zr_travel,
      lt_read_res TYPE TABLE FOR READ RESULT zr_travel,
      lt_rba      TYPE TABLE FOR READ IMPORT zr_travel\_booking,
      lt_rba_res  TYPE TABLE FOR READ RESULT zr_travel\_booking,
      lt_rba_link TYPE TABLE FOR READ LINK   zr_travel\_booking.

" 읽을 필드를 %control 에서 직접 켠다
lt_read = VALUE #(
  ( travelid = '00000001'
    %control = VALUE #( agencyid = if_abap_behv=>mk-on
                        status   = if_abap_behv=>mk-on ) ) ).

lt_rba = VALUE #(
  ( travelid = '00000002'
    %control = VALUE #( bookingid   = if_abap_behv=>mk-on
                        flightprice = if_abap_behv=>mk-on ) ) ).

lt_op = VALUE #(
  ( op          = if_abap_behv=>op-r-read       " 'R' 도 된다
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_read )
    results     = REF #( lt_read_res ) )
  ( op          = if_abap_behv=>op-r-read_ba    " 'N' 도 된다
    entity_name = 'ZR_TRAVEL'
    sub_name    = '_BOOKING'
    full        = abap_true
    instances   = REF #( lt_rba )
    results     = REF #( lt_rba_res )
    links       = REF #( lt_rba_link ) ) ).

READ ENTITIES OPERATIONS lt_op FAILED DATA(lt_failed_dyn).
```

## 알아두기

- 원문 프로그램은 형식마다 읽기를 실행한 뒤, 실패 응답이 비어 있으면 읽은 결과를 출력하고 그렇지 않으면 "읽기 실패"라고 출력합니다. 동적 형식에서는 루트 결과, association 으로 읽은 결과, 키 짝이 담긴 연결 테이블을 차례로 보여 줍니다.
- managed BO 이므로 데이터베이스의 데이터가 프레임워크가 다루는 transactional buffer(트랜잭션 버퍼)로 읽혀 들어오고, 읽기 작업은 그 버퍼에서 이루어집니다.
- 바로 읽는 작업에서는 `RESULT` 를 꼭 적어 결과를 받아야 합니다.
- child entity 를 바로 읽을 때는 키 필드를 모두 적어야 합니다. 원문은 자식 키 가운데 날짜를 미리 `SELECT` 로 구해 넣습니다.
- 동적 형식의 두 번째 줄에서 `full = abap_true` 는 연결 정보만이 아니라 대상 인스턴스 전체를 가져오라는 뜻입니다.
- 원문은 association 으로 읽은 결과 가운데 세 줄만 출력합니다. 결과 내부 테이블을 `SELECT ... UP TO 3 ROWS` 로 다시 읽는 방법을 씁니다.

## 관련 항목

- [[abapread_entity_short]]
- [[abapread_entities_long]]
- [[abapread_entities_operations]]
- [[abapread_entity_entities_op]]
- [[abapread_entity_entities_fields]]
- [[abapeml_read_examples_abexas]]
