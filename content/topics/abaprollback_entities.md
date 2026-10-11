---
title: ROLLBACK ENTITIES 문
summary: 지금 RAP 트랜잭션에서 한 변경과 잠금을 모두 되돌리는 EML 문입니다.
keywords: ROLLBACK ENTITIES, 롤백, 되돌리기, cleanup, 트랜잭션 버퍼 비우기, ROLLBACK WORK, 잠금 해제, RAP 트랜잭션
---

## 문법

```syntax
ROLLBACK ENTITIES.
```

## 설명

`ROLLBACK ENTITIES` 는 지금 RAP 트랜잭션에서 한 일을 모두 되돌립니다. 되돌리는 대상은 두 가지입니다.

- **데이터 변경** : transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)에 쌓인 내용입니다. saver method(세이버 메서드) [[abensaver_method_cleanup|cleanup]] 이 불려 버퍼를 비웁니다.
- **잠금** : 트랜잭션 동안 걸어 둔 잠금입니다.

unmanaged BO, 그리고 managed 라도 [[abenbdl_saving|unmanaged save 나 additional save]] 를 쓰는 BO 에서는 RAP BO provider(제공자)가 이 일을 하도록 직접 구현해야 합니다.

누가 이 문을 부르느냐는 사용 환경에 따라 다릅니다.

- OData 처럼 RAP 가 기본으로 지원하는 환경에서는 RAP 가 알아서 부릅니다.
- 직접 만든 서비스나 프로그램처럼 그 밖의 환경에서는 코드에서 직접 불러야 합니다.

이 문에는 출력 매개변수가 없습니다. response parameter(응답 매개변수)도, 결과 매개변수도 받을 수 없습니다.

## 예제

첫 번째 여행은 저장하고, 두 번째 여행은 만들었다가 되돌립니다. 되돌린 뒤에는 버퍼에 저장할 것이 없으므로, 이어지는 `COMMIT ENTITIES` 는 아무것도 저장하지 않습니다.

```abap
" 여행 1 을 만들고 저장한다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #( ( %cid       = 'cid1'
                  travelid   = '00000001'
                  agencyid   = '070001'
                  customerid = '000010' ) ).

COMMIT ENTITIES.

IF sy-subrc = 0.
  SELECT * FROM ztravel INTO TABLE @FINAL(lt_before).
ENDIF.

" 여행 2 를 만들지만 저장하지 않고 되돌린다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #( ( %cid       = 'cid2'
                  travelid   = '00000002'
                  agencyid   = '070002'
                  customerid = '000020' ) ).

ROLLBACK ENTITIES.

" 버퍼가 비어 있어서 저장되는 것이 없다
COMMIT ENTITIES.

IF sy-subrc = 0.
  SELECT * FROM ztravel INTO TABLE @FINAL(lt_after).
ENDIF.

" lt_before 와 lt_after 의 내용이 같다
```

## 알아두기

- RAP BO 구현 안에서는 `ROLLBACK ENTITIES` 를 부를 수 없습니다.
- 되돌리기 요청이 오면 `cleanup` 메서드가 불려 transactional buffer 를 비웁니다.
- 지금 RAP 트랜잭션에 RAP 수정 작업이 들어 있으면, 되돌리기 요청이 `ROLLBACK WORK` 도 함께(암묵적으로) 일으킵니다.
- EML 문은 반복문 안에서 쓰지 않는 편이 좋습니다. 한 건씩 데이터베이스에 여러 번 접근하게 되어 느려질 수 있습니다. 필요한 데이터는 EML 문 하나로 읽고, 바꿀 때도 EML 수정 요청 하나로 처리합니다.
- RAP 작업을 구현할 때는 RAP BO 계약(RAP BO contract)을 지켜야 합니다. 추려 놓은 규칙은 [[abaprap_impl_rules]] 에 있습니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_ROLLBACK_ENTTS` 는 managed BO 로 같은 효과를 보여 줍니다. 수정 작업 두 개를 각각 저장한 뒤, 테이블을 비우고 같은 작업을 다시 하되 두 번째 작업에 `ROLLBACK ENTITIES` 를 넣습니다. 아직 저장되지 않은 변경이 버퍼에서 사라지므로 결과 테이블에 그 변경이 나타나지 않습니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abensaver_method_cleanup]]
- [[abenbdl_impl_type]]
- [[abenbdl_saving]]
- [[abaprap_impl_rules]]
