---
title: 예제 - action
summary: managed RAP BO 에 승인·거절 action 을 선언하고 handler method 로 구현한 뒤, EML 의 EXECUTE 로 실행해 상태가 바뀌는 것을 확인하는 예제입니다.
keywords: action, 액션 예제, EXECUTE, result [1] $self, FOR MODIFY, 승인 액션, 관리형, managed, COMMIT ENTITIES RESPONSE OF, 출력 매개변수
---

## 설명

managed RAP BO 에서 action 을 **선언하고, 구현하고, 실행하는** 전체 흐름을 보여 주는 예제입니다. 원문은 구매 주문(루트)과 주문 항목(자식)으로 된 데모 모델을 씁니다. 직원이 구매 주문을 올리면 관리자가 승인하거나 거절한다는 이야기입니다. 여기서는 같은 내용을 `Travel` / `Booking` 으로 옮겨 적습니다.

action 은 둘입니다. `acceptTravel` 은 여행을 승인하고 `rejectTravel` 은 거절합니다. 둘 다 출력 매개변수가 `result [1] $self` 입니다. 그래서 `result` 는 action 을 실행한 entity(엔터티)와 같은 타입이고, 인스턴스 하나를 돌려줍니다.

## 예제

behavior definition(동작 정의)입니다. 눈여겨볼 곳은 `action` 두 줄입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
etag master LastChangedAt
authorization master ( none )
{
  create;
  update;
  delete;
  association _Booking { create; }

  action acceptTravel result [1] $self;
  action rejectTravel result [1] $self;

  field ( readonly : update ) TravelID;
}

// child entity Booking 의 behavior definition 은 줄였다
```

behavior pool(동작 풀)의 handler class(핸들러 클래스) `lhc_travel` 에 action 마다 메서드를 하나씩 둡니다. `acceptTravel` 의 구현은 세 단계입니다.

```abap
METHOD accepttravel.
  " 1) 넘어온 인스턴스의 상태를 승인(A)으로 바꾼다
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( status )
      WITH VALUE #( FOR ls_key IN keys ( %tky = ls_key-%tky status = 'A' ) )
    FAILED failed
    REPORTED reported.

  " 2) 바뀐 인스턴스를 다시 읽는다
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 3) 출력 매개변수 result 를 채운다
  result = VALUE #( FOR ls_travel IN lt_travel
                    ( %tky = ls_travel-%tky %param = ls_travel ) ).
ENDMETHOD.
```

`rejectTravel` 은 상태 값만 거절(`R`)로 다르고 나머지는 같습니다.

BO 를 쓰는 ABAP 클래스에서는 EML 로 이렇게 실행합니다.

```abap
" 여행 두 건을 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid )
    WITH VALUE #( ( %cid = 'cid1' travelid = '00000001' agencyid = '070001' )
                  ( %cid = 'cid2' travelid = '00000002' agencyid = '070002' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 그 가운데 한 건에 승인 action 을 실행한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE accepttravel
      FROM VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_result)
  FAILED ls_failed
  REPORTED ls_reported.

" transactional buffer 에 쌓인 변경을 데이터베이스에 저장한다
COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED DATA(ls_commit_failed)
  REPORTED DATA(ls_commit_reported).

" 저장된 결과를 테이블에서 직접 읽어 본다
SELECT travel_id, status
  FROM ztravel
  INTO TABLE @DATA(lt_saved).
```

## 알아두기

### 실행하면

1. `MODIFY ENTITIES` 로 인스턴스 두 건이 만들어집니다.
2. `EXECUTE` 로 그 가운데 한 건에 승인 action 이 실행됩니다. `result`, `failed`, `reported` 가 돌아옵니다.
3. action 이 transactional buffer(트랜잭션 버퍼)에 해 둔 변경이 `COMMIT ENTITIES` 로 데이터베이스에 저장됩니다.
4. `SELECT` 로 persistent table 을 읽으면, action 을 실행한 인스턴스의 상태 열에 승인을 뜻하는 `A` 가 들어 있습니다. 다른 한 건은 그대로입니다.

### 눈여겨볼 점

- action 의 로직은 `FOR MODIFY` handler method(핸들러 메서드)에 직접 씁니다. managed BO 여도 action 은 프레임워크가 대신 해 주지 않습니다.
- 출력 매개변수를 선언했다면 **반드시 채워야 합니다.** 그래서 상태를 바꾼 뒤 다시 읽어 `result` 에 담는 단계가 들어 있습니다.
- action 이 바꾼 내용은 `COMMIT ENTITIES` 를 실행하기 전까지 transactional buffer 에만 있습니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_output_para]]
- [[abaphandler_meth_modify]]
- [[abenbdl_action2_abexa]]
- [[abenbdl_action3_abexa]]
