---
title: 예제 - MODIFY standard operation (managed)
summary: managed BO 에 CREATE, CREATE BY, UPDATE, DELETE 를 차례로 실행하고 READ 로 확인하는 예제입니다. behavior pool 없이 standard operation 만 씁니다.
keywords: MODIFY ENTITY, CREATE, CREATE BY, UPDATE, DELETE, READ ENTITY, READ BY, COMMIT ENTITIES, 관리형, managed, 표준 작업, 예제, CL_DEMO_RAP_EML_MODIFY_OP_2
---

## 설명

간단한 managed RAP BO 를 EML 로 바꾸고 읽는 예제입니다. standard operation(표준 작업)을 하나씩 실행하고, 실행할 때마다 `COMMIT ENTITIES` 로 저장한 뒤 결과를 확인합니다.

- `CREATE` 와 `CREATE BY` 로 루트 인스턴스와, association 을 따라 자식 인스턴스를 만듭니다.
- `UPDATE` 로 루트 인스턴스를 고칩니다.
- `DELETE` 로 루트 인스턴스를 지웁니다.
- `READ` 와 `READ BY` 로 루트와 자식 인스턴스를 읽습니다.

원문의 BO 는 root entity(루트 엔터티)와 child entity(자식 엔터티) 하나씩입니다. 루트에 `create`, `update`, `delete` 와 자식을 만드는 association 이 선언돼 있습니다. standard operation 만 쓰므로 behavior pool(동작 풀)은 만들지 않았습니다. 아래 코드는 같은 흐름을 Travel / Booking 으로 옮긴 것입니다. behavior definition(동작 정의)는 [[abeneml_modify_alternatives_abexa]] 에 실은 것과 같습니다.

## 예제

```abap
" 1) 여행 두 건을 만든다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #(
    ( %cid = 'cid1' travelid = '00000001' agencyid = '070001' customerid = '000011' )
    ( %cid = 'cid2' travelid = '00000002' agencyid = '070002' customerid = '000012' ) ).

" 2) association _Booking 을 따라 예약을 만든다. 부모는 키로 가리킨다
MODIFY ENTITY zr_travel
  CREATE BY \_booking FIELDS ( bookingid flightprice )
  WITH VALUE #(
    ( travelid = '00000001'
      %target  = VALUE #( ( %cid = 'cid3' bookingid = '0001' flightprice = '500.00' ) ) ) ).

COMMIT ENTITIES.
IF sy-subrc <> 0.
  " save sequence 에서 문제가 났다
ENDIF.

" 3) 키와 바꿀 필드만 넘겨 고친다
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( agencyid customerid )
  WITH VALUE #( ( travelid = '00000002' agencyid = '070009' customerid = '000019' ) ).

COMMIT ENTITIES.

" 4) 키만 넘겨 지운다
MODIFY ENTITY zr_travel
  DELETE FROM VALUE #( ( travelid = '00000002' ) ).

COMMIT ENTITIES.

" 5) 루트를 읽는다
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel).

" 6) association 을 따라 예약을 읽는다
READ ENTITY zr_travel
  BY \_booking
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_booking).
```

## 알아두기

- 원문 프로그램은 작업을 실행하고 저장할 때마다 persistent table 을 `SELECT` 로 읽어 두었다가, 끝에서 `CREATE`, `CREATE BY`, `UPDATE`, `DELETE`, `READ`, `READ BY` 순서로 구역을 나누어 출력합니다. 작업 하나가 테이블을 어떻게 바꾸는지 단계별로 볼 수 있습니다.
- managed BO 에서는 RAP 프레임워크가 데이터베이스의 데이터를 transactional buffer(트랜잭션 버퍼)로 읽어 들이고, 작업은 그 버퍼에서 이루어집니다. `COMMIT ENTITIES` 를 실행해야 바뀐 내용이 persistent table 에 저장됩니다.
- `MODIFY` 문에 넘기는 테이블은 작업에 맞는 BDEF derived type(BDEF 파생 타입)이어야 합니다. 예제처럼 `VALUE #( )` 로 그 자리에서 만들면 타입이 자동으로 맞춰집니다.
- 이 예제는 `CREATE BY` 의 부모를 `%cid_ref` 가 아니라 키 값으로 가리킵니다.
- 원문 예제는 `MODIFY` 문에 `FAILED` 를 적지 않았습니다. `IN LOCAL MODE` 없이 `FAILED` 를 빼면 문법 경고가 나므로, 실제 코드에서는 `FAILED` 를 받아 오류를 처리하는 것이 좋습니다.

## 관련 항목

- [[abapmodify_entity_entities_op]]
- [[abapmodify_entity_short]]
- [[abapread_entity_short]]
- [[abapcommit_entities]]
- [[abeneml_modify_op_u_abexa]]
- [[abapeml_modify_examples_abexas]]
