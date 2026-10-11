---
title: 필드 augmentation (field ( modify )), projection BDEF
summary: projection 뷰의 가상 요소처럼 기본으로는 derived type 에서 빠지는 필드를 BDEF derived type 에 넣어, augmentation 구현에서 다룰 수 있게 하는 문법입니다.
keywords: field ( modify ), field augmentation, FieldAugmentation, 필드 보강, augment, 보강, 가상 요소, virtual, localized, 지역화 필드, 경로 표현식, projection BDEF, 프로젝션 BDEF, features:instance
---

## 문법

```syntax
...field(modify[,FieldChar]) Field1[, Field2] [, ...];
```

## 설명

CDS projection 뷰에는 트랜잭션 처리와 상관없는 필드가 들어갈 수 있습니다.

- 가상 요소 (`VIRTUAL` 로 정의한 요소)
- association 을 따라가서 가져온 필드 (경로 표현식)
- 지역화 필드 (`LOCALIZED` 로 정의한 필드)

이런 필드는 readonly 이라서, 기본으로는 projection BDEF의 BDEF derived type(BDEF 파생 타입)에 들어가지 않습니다. 그래서 RAP BO consumer(사용자)가 값을 보내도 받을 자리가 없습니다.

projection BDEF에서 `field ( modify )` 로 표시하면 사정이 달라집니다. 표시한 필드가 `TYPE TABLE FOR CREATE` 같은 projection BDEF의 derived type 에 구성요소로 나타납니다. 그러면 augmentation 구현에서 그 값을 받아 트랜잭션 처리에 쓸 수 있습니다. augmentation 이 무엇인지는 [[abenbdl_augment_projection]] 에서 설명합니다.

`modify` 뒤에 쉼표로 field characteristics(필드 특성) `FieldChar` 를 덧붙일 수 있습니다. 쓸 수 있는 값은 다음과 같습니다.

| field characteristics | 뜻 |
| --- | --- |
| `mandatory` | 반드시 값을 넣어야 하는 필드 |
| `readonly` | readonly 필드 |
| `mandatory:create` | 생성할 때 반드시 값을 넣어야 하는 필드 |
| `readonly:update` | 수정할 때는 readonly 인 필드 |
| `features:instance` | 인스턴스마다 feature control(기능 제어)를 거는 필드 |

## 예제

projection 뷰 `ZC_Travel` 에 가상 요소 `Memo` 가 있습니다. 데이터베이스에는 없는 필드입니다.

```cds
define root view entity ZC_Travel
  provider contract transactional_query
  as projection on ZR_Travel
{
  key TravelID,
      AgencyID,
      Status,
      // 가상 요소: 기본으로는 derived type 에 들어가지 않는다
      virtual Memo : abap.char(60),
      _Booking : redirected to composition child ZC_Booking
}
```

projection BDEF에서 `Memo` 를 `field ( modify )` 로 표시합니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create ( augment );
  use update ( augment );
  use delete;

  // Memo 를 derived type 에 넣는다
  field ( modify ) Memo;
}
```

이제 projection BDEF의 derived type 에 `Memo` 구성요소가 생깁니다.

```abap
" lt_create 의 줄에 Memo 구성요소가 들어 있다
DATA lt_create TYPE TABLE FOR CREATE zc_travel.

lt_create = VALUE #( ( %cid = 'cid1' TravelID = '00000001' Memo = '출장 메모' ) ).
```

## 알아두기

- `features:instance` 를 augmentation 필드에 쓰려면 BDEF strict mode 가 켜져 있어야 합니다.
- `features:instance` 를 쓰면 projection 계층의 behavior pool(동작 풀)에 handler method(핸들러 메서드) `FOR INSTANCE FEATURES` 를 구현해야 합니다.
- 언어에 따라 달라지는 필드를 고치는 전체 예제는 RAP 개발 가이드의 "Editing Language-Dependent Fields" 절에 있습니다.

## 관련 항목

- [[abenbdl_augment_projection]]
- [[abenbdl_augment_abexa]]
- [[abenbdl_field_projection]]
- [[abenbdl_use_projection]]
- [[abaptype_table_for]]
- [[abaphandler_meth_features]]
