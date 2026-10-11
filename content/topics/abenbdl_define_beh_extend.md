---
title: extension 노드의 behavior definition (define behavior for)
summary: 데이터 모델 extension 으로 보탠 새 entity(extension 노드)의 동작을 BDEF extension 안에서 정의하는 구문이며, 마스터 entity 를 직접 가리키지 않는 점이 원본과 다릅니다.
keywords: define behavior for, using, 확장 노드, extension node, node extensibility, 노드 확장, lock dependent, authorization dependent, etag dependent, changedocuments dependent, ancestor association, CDS 트랜잭션 인터페이스
---

## 문법

```syntax
... define behavior for ExtNode [using]   ...
```

## 설명

BDEF extension(확장) 안에서 `define behavior for` 를 쓰면 **extension 노드**의 동작을 정의합니다. extension 노드는 원본 BO 에는 없던 entity(엔터티)로, 먼저 데이터 모델 extension 으로 RAP 데이터 모델에 보태 두어야 합니다. BDEF extension 은 그 노드에 동작을 붙입니다.

**전제 조건**: 확장되는 BDEF 가 BDEF extension 을 명시적으로 허용해야 합니다. ([[abenbdl_extensibility_enabling_m_u]] 참고)

동작을 적는 방법은 원본 RAP BO 의 entity behavior definition(동작 정의, [[abenbdl_define_beh]])와 같습니다. 다른 점은 다음과 같습니다.

| 항목 | extension 노드에서 쓰는 방식 |
| --- | --- |
| interface | `using` 뒤에 CDS 트랜잭션 interface 를 적습니다. BO extension 에 쓰는 `using interface` 가 아닙니다. ([[abenbdl_using_interface]]) |
| authorization master | 직접 가리키지 않습니다. `authorization dependent by _Assoc` 대신 `authorization dependent` 를 씁니다. |
| lock master | 직접 가리키지 않습니다. `lock dependent by _Assoc` 대신 `lock dependent` 를 씁니다. |
| etag master | 직접 가리키지 않습니다. `etag dependent by _Assoc` 대신 `etag dependent` 를 씁니다. |
| change documents 마스터 | 직접 가리키지 않습니다. `changedocuments dependent by _Assoc` 대신 `changedocuments dependent` 를 씁니다. |
| ancestor association | `ancestor association` 을 선언합니다. 그래야 authorization master, lock master, etag master 로 가는 길을 알아낼 수 있습니다. ([[abenbdl_ancestor_ext]]) |

줄여 쓰는 형태도 있습니다. `( lock, authorization, etag ) dependent` 처럼 괄호 안에 묶어 적습니다. 셋 다 선택 항목이지만 괄호 안에 적어도 하나는 있어야 합니다.

extension 노드에 behavior pool(동작 풀)을 지정하면 extension behavior pool 규칙이 적용됩니다. ([[abenbdl_in_class_unique_ext]] 참고)

### 제한

- 노드 extension 은 unmanaged RAP BO 에서 지금 지원하지 않습니다.
- 노드 extension 에서 새 association 을 정의하는 것은 지금 일부만 지원합니다. 지원하는 경우는 세 가지입니다.
  - draft 를 쓰지 않는 managed BDEF 의 extension 에서, early numbering 을 쓰는 대상으로 가는 source-resolved association
  - draft 를 쓰는 managed BDEF 의 extension 에서, early numbering 을 쓰는 대상으로 가는 source-resolved association
  - draft 를 쓰지 않는 managed BDEF 의 extension 에서, late numbering 을 쓰는 대상으로 가는 source-resolved association

## 예제

draft 를 쓰는 `ZR_Travel` 의 자식 `Booking` 아래에 extension 노드 `ZR_BookingSuppl` 을 보탭니다. 먼저 parent entity(부모 엔터티)에서 새 composition 에 동작을 켜고, 이어서 extension 노드의 동작을 정의합니다.

```bdl
extension using interface ZI_Travel;

extend behavior for Booking
{
  association _BookingSuppl { create; with draft; }
}

define behavior for ZR_BookingSuppl alias BookingSuppl
  using ZI_BookingSuppl
persistent table zbooksuppl
draft table zbooksuppl_d
etag master LastChangedAt
( lock, authorization ) dependent
{
  update;
  delete;

  field ( readonly ) TravelID, BookingID;
  field ( readonly : update ) SupplementID;

  association _Booking { with draft; }
  ancestor association _Travel { with draft; }

  mapping for zbooksuppl
  {
    TravelID      = travel_id;
    BookingID     = booking_id;
    SupplementID  = supplement_id;
    Price         = price;
    LastChangedAt = last_changed_at;
  }
}
```

lock master 와 authorization master 를 이름으로 가리키지 않았습니다. 루트로 이어지는 `ancestor association _Travel` 덕분에 프레임워크가 길을 알아냅니다.

## 알아두기

- SAP 은 entity 마다 etag master 필드를 따로 두라고 권합니다. 그 권고를 따르면 `etag dependent` 는 쓸 일이 없습니다.
- 지금은 root entity(루트 엔터티)만 authorization master 와 lock master 가 될 수 있습니다. extension 노드는 authorization master 나 lock master 로 지정할 수 없습니다.
- 지금은 business event 를 root entity 에만 정의할 수 있습니다. extension 노드는 보통 루트 아래에 있으므로 새 business event 를 정의할 수 없습니다.

## 관련 항목

- [[abenbdl_ancestor_ext]]
- [[abenbdl_assoc_ext_abexa]]
- [[abenbdl_using_interface]]
- [[abenbdl_define_beh]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_locking]]
- [[abenbdl_authorization]]
- [[abenbdl_etag]]
- [[abenbdl_change_documents]]
