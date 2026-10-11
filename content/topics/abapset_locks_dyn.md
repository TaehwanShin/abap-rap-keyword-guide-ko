---
title: SET LOCKS lock_tab 문 (동적 형식)
summary: 잠글 entity 이름과 인스턴스를 내부 테이블에 모아 문 하나로 잠그는 SET LOCKS 의 동적 형식입니다.
keywords: SET LOCKS, lock_tab, 동적 형식, ABP_BEHV_LOCKS_TAB, entity_name, instances, ABP_BEHV_RESPONSE_TAB, 잠금, 배타 잠금
---

## 문법

```syntax
SET LOCKS lock_tab [response_param  ].
```

## 설명

여러 entity(엔터티)의 잠글 인스턴스를 내부 테이블 하나에 모은 다음, `SET LOCKS` 문 하나로 한꺼번에 배타 잠금을 겁니다.

`lock_tab` 은 타입이 `ABP_BEHV_LOCKS_TAB` 인 내부 테이블이어야 합니다. 한 줄이 entity 하나를 나타내며, 구성요소는 두 개입니다.

| 구성요소 | 내용 |
| --- | --- |
| `entity_name` | 배타 잠금을 걸 RAP BO entity 의 이름입니다. **대문자**로 적어야 합니다. |
| `instances` | 잠글 인스턴스를 담은 내부 테이블을 가리키는 참조입니다. 그 테이블의 타입은 BDEF derived type(BDEF 파생 타입) `TYPE TABLE FOR KEY OF` 입니다([[abaptype_table_for]]). |

`response_param` 은 response parameter(응답 매개변수)이고, 적지 않아도 됩니다([[abapeml_response]]). 동적 형식에서는 response parameter 가 타입 `ABP_BEHV_RESPONSE_TAB` 인 내부 테이블이어야 합니다.

## 예제

여행 한 건과 예약 두 건을 잠금 테이블에 모아 한 번에 잠급니다.

```abap
DATA lt_travel  TYPE TABLE FOR KEY OF zr_travel.
DATA lt_booking TYPE TABLE FOR KEY OF zr_booking.

lt_travel  = VALUE #( ( travelid = '00000007' ) ).
lt_booking = VALUE #( ( travelid = '00000008' bookingid = '0001' )
                      ( travelid = '00000008' bookingid = '0002' ) ).

" entity 이름은 대문자, 인스턴스는 참조로 넘긴다
FINAL(lt_lock) = VALUE abp_behv_locks_tab(
  ( entity_name = 'ZR_TRAVEL'  instances = REF #( lt_travel ) )
  ( entity_name = 'ZR_BOOKING' instances = REF #( lt_booking ) ) ).

SET LOCKS lt_lock
  FAILED   FINAL(lt_failed)
  REPORTED FINAL(lt_reported).
```

## 알아두기

- `instances` 가 가리키는 내부 테이블은 BDEF derived type `TYPE TABLE FOR LOCK` 으로 선언해도 됩니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_SET_LOCKS` 는 `SET LOCKS` 의 세 형식을 모두 다룹니다. 인스턴스를 여러 개 만든 뒤 키로 잠그는데, 동적 형식은 예제 끝부분에 나옵니다.
- 트랜잭션이 진행되는 동안에는 잠근 인스턴스가 전역 잠금 테이블(트랜잭션 `SM12`)에 보입니다. `ROLLBACK ENTITIES` 를 실행하면 그 항목이 잠금 테이블에서 자동으로 지워집니다.

## 관련 항목

- [[abapset_locks]]
- [[abapset_locks_entity]]
- [[abapset_locks_of]]
- [[abaptype_table_for]]
- [[abapeml_response]]
- [[abapeml_responses_dyn]]
- [[abaprollback_entities]]
