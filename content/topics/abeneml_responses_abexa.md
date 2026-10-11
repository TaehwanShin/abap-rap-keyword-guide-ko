---
title: 예제 - response parameter
summary: managed BO 에 성공할 작업과 실패할 작업을 섞어 보내고 FAILED, MAPPED, REPORTED 에 무엇이 돌아오는지 보여 주는 예제입니다.
keywords: 응답 매개변수 예제, FAILED, MAPPED, REPORTED, TYPE RESPONSE FOR, MODIFY ENTITY, MODIFY ENTITIES, %cid, %cid_ref, CREATE BY, 관리형, managed, 오류 응답
---

## 설명

managed BO 에 `MODIFY` 문을 보내고 `FAILED`, `MAPPED`, `REPORTED` 뒤의 response parameter(응답 매개변수)를 살펴보는 예제입니다. 인스턴스를 고치려다 일부러 오류가 나게 해서, 응답에 무엇이 담기는지 화면에 보여 줍니다.

BO 는 root entity(루트 엔터티)와 child entity(자식 엔터티) 하나로 이루어져 있습니다. BDEF 에는 standard operation(표준 작업)과 create-by-association 이 있고, action 과 function 도 몇 개 있습니다. 이 예제는 직접 만든 작업을 쓰지 않으므로 behavior pool(동작 풀)의 구현 내용은 중요하지 않습니다.

응답을 받을 변수는 클래스에 미리 선언해 둡니다.

```abap
DATA: failed   TYPE RESPONSE FOR FAILED   zr_travel,
      mapped   TYPE RESPONSE FOR MAPPED   zr_travel,
      reported TYPE RESPONSE FOR REPORTED zr_travel.
```

## 예제

여행 모델로 줄여 쓴 것입니다. 첫 번째 요청은 모두 성공하는 작업입니다. 여행 하나와 그 예약 하나를 만듭니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #( ( %cid = 'c1' travelid = '00000001' agencyid = '070001' ) )
  CREATE BY \_booking FIELDS ( bookingid )
  WITH VALUE #( ( %cid_ref = 'c1'
                  %target  = VALUE #( ( %cid = 'b1' bookingid = '0001' ) ) ) )
  FAILED failed
  MAPPED mapped
  REPORTED reported.

COMMIT ENTITIES.
```

두 번째 요청에는 실패할 작업을 섞습니다. 없는 여행을 고치고 지우려 하고, 없는 예약을 고치려 합니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid )
    WITH VALUE #( ( %cid = 'c2' travelid = '00000002' agencyid = '070002' ) )
  ENTITY travel
    UPDATE FIELDS ( status )
    WITH VALUE #( ( %cid_ref = 'c2'       status = 'A' )     " 방금 만든 여행: 성공
                  ( travelid = '00000006' status = 'A' ) )   " 없는 여행: 실패
  ENTITY travel
    DELETE FROM VALUE #( ( travelid = '00000007' ) )         " 없는 여행: 실패
  ENTITY booking
    UPDATE FIELDS ( bookingstatus )
    WITH VALUE #( ( travelid = '00000001' bookingid = '0001' bookingstatus = 'B' )    " 성공
                  ( travelid = '00000009' bookingid = '0001' bookingstatus = 'B' ) )  " 실패
  FAILED failed
  MAPPED mapped
  REPORTED reported.

" 응답 살펴보기
LOOP AT mapped-travel INTO DATA(ls_mapped_travel).
  " %cid 와 실제 키가 짝지어져 있다
ENDLOOP.

LOOP AT failed-travel INTO DATA(ls_failed_travel).
  " 실패한 여행 00000006, 00000007
ENDLOOP.

LOOP AT failed-booking INTO DATA(ls_failed_booking).
  " 실패한 예약 (여행 00000009)
ENDLOOP.

COMMIT ENTITIES.
```

## 알아두기

원문 예제를 실행하면 다음과 같이 됩니다.

- 수정 요청을 여러 번 보냅니다. 일부는 성공합니다. root entity 와 child entity 양쪽에 오류를 일으킬 데이터를 일부러 넣어 두었습니다.
- 화면에는 요청마다 `MAPPED`, `FAILED`, `REPORTED` 응답이 나옵니다. mapping 정보 말고도, 오류가 난 데이터에 얽힌 내용이 `FAILED` 와 `REPORTED` 에 들어 있습니다.
- 이어서 root entity 와 child entity 의 데이터베이스 테이블 내용이 나옵니다. 생성, 수정, 삭제에 성공한 데이터만 들어 있습니다.

눈여겨볼 점은 두 가지입니다. 응답 구조 하나에 entity(엔터티)별 테이블이 들어 있어서 루트와 자식의 결과를 한꺼번에 받습니다. 그리고 한 요청 안에서 일부 작업이 실패해도 나머지 성공한 작업은 저장됩니다.

## 관련 항목

- [[abeneml_responses_abexas]]
- [[abapeml_response]]
- [[abapeml_responses]]
- [[abaptype_response_for]]
- [[abeneml_responses_dyn_abexa]]
