---
title: entity 동작 특성 (EntityBehaviorCharacteristics)
summary: define behavior for 와 중괄호 사이에 적는 entity 동작 특성을 한눈에 모은 항목으로, persistent table·draft 테이블·저장 방식·ETag·잠금·권한·numbering 을 정합니다.
keywords: EntityBehaviorCharacteristics, entity behavior characteristics, 엔터티 동작 특성, persistent table, draft table, with additional save, with unmanaged save, etag, lock master, lock dependent, authorization master, extensible, early numbering, late numbering
---

## 문법

```syntax
...  [persistent table] TableName
     [draft table DraftTableName]
     [SavingOptions]
    {[etag  ]
     [Locking]
     [Authorization]}
    | SyntaxShortForm
     [extensible  ]
     [early numbering  ]
     [late numbering  ] ...
```

## 설명

entity(엔터티) 동작 특성은 RAP BO entity 에 **덧붙는 성질**을 정합니다. `define behavior for ...` 줄과 여는 중괄호 사이에 적습니다.

꼭 적어야 하는 것도 있고 선택인 것도 있습니다. managed 이냐 unmanaged 이냐, draft 를 켰느냐에 따라 쓸 수 있는 특성이 달라집니다. 적는 차례가 중요한 경우도 있습니다. 예를 들어 `total etag` 는 언제나 `lock master` 바로 뒤에 와야 합니다. 이런 세부 규칙은 특성마다 그 항목에 있습니다.

| 특성 | 하는 일 | 자세히 |
| --- | --- | --- |
| `persistent table` | 트랜잭션 동작으로 바뀐 entity 데이터를 담을 persistent table `TableName` 을 정합니다. managed RAP BO 에서만 씁니다. | [[abenbdl_persistent_table]] |
| `draft table` | draft 인스턴스의 변경 내용을 담을 draft 테이블 `DraftTableName` 을 정합니다. `with draft` 나 `with collaborative draft` 로 draft 를 켰을 때만 씁니다. | [[abenbdl_draft_table]] |
| `SavingOptions` | 기본 save sequence(저장 순서)에 단계를 보태거나, 기본 저장을 끄고 직접 만든 저장 방식으로 바꿉니다. | [[abenbdl_saving]] |
| `etag` | 낙관적 동시성 제어 | [[abenbdl_etag]] |
| `Locking` | 비관적 동시성 제어(잠금) | [[abenbdl_locking]] |
| `Authorization` | 어떤 RAP BO consumer(사용자)가 어떤 조건에서 BO 의 데이터를 읽거나 바꿀 수 있는지 정합니다. | [[abenbdl_authorization]] |
| `SyntaxShortForm` | `lock dependent by _assoc`, `authorization dependent by _assoc`, `etag dependent by _assoc` 세 문을 `(lock, authorization, etag) dependent by _assoc` 한 문으로 줄여 씁니다. | [[abenbdl_short_syntax]] |
| `extensible` | extension(확장)을 허용합니다. | [[abenbdl_extensible]] |
| `early numbering` | 기본 키 필드의 값을 일찍 매깁니다. | [[abenbdl_early_numb]] |
| `late numbering` | 기본 키 필드의 값을 늦게 매깁니다. | [[abenbdl_late_numbering]] |

`SavingOptions` 는 BDEF 머리말에 적을 수도 있습니다. 머리말에 적으면 BO 의 모든 entity 에 걸리고, entity 동작 특성으로 적으면 그 entity 에만 걸립니다. 적으면 behavior pool(동작 풀)에 구현이 있어야 합니다. managed 에서만 쓸 수 있습니다.

## 예제

draft 를 켠 managed BDEF 입니다. `define behavior for` 줄과 `{` 사이에 있는 줄이 모두 entity 동작 특성입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel                 // persistent table
draft table ztravel_d                    // draft 테이블
with additional save                     // 저장 방식
lock master                              // 잠금
total etag LastChangedAt                 // lock master 바로 뒤
etag master LocalLastChangedAt           // ETag
authorization master ( instance )        // 권한
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt, LocalLastChangedAt;

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare;

  association _Booking { create; with draft; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
draft table zbooking_d
( lock, authorization, etag ) dependent by _Travel   // 줄여 쓴 꼴
{
  update;
  delete;
  field ( readonly : update ) TravelID, BookingID;

  association _Travel { with draft; }
}
```

## 알아두기

- 특성마다 한 번씩만 적을 수 있습니다.

## 관련 항목

- [[abenbdl_persistent_table]]
- [[abenbdl_draft_table]]
- [[abenbdl_saving]]
- [[abenbdl_etag]]
- [[abenbdl_locking]]
- [[abenbdl_authorization]]
- [[abenbdl_change_documents]]
- [[abenbdl_short_syntax]]
- [[abenbdl_extensible]]
- [[abenbdl_early_numb]]
- [[abenbdl_late_numbering]]
- [[abenbdl_define_beh]]
- [[abenbdl_body]]
