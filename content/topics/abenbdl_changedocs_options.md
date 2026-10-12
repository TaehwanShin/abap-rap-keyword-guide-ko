---
title: change documents 기록 옵션 (changedocuments)
summary: change documents 를 쓰는 entity 에서 생성·수정·삭제 때 무엇을 얼마나 기록할지를 none, key, data 로 정합니다.
keywords: changedocuments, 변경 문서, change documents, 기록 옵션, logging options, create, update, delete, none, key, data, 변경 이력
---

## 문법

```syntax
changedocuments([create:Option][,update:Option] [,delete:Option]);
```

## 설명

entity(엔터티) 동작 본문에서 RAP change documents 의 **기록 옵션**을 정합니다. 먼저 그 entity 에 change documents 가 켜져 있어야 합니다. 켜는 방법은 [[abenbdl_change_documents]] 를 봅니다.

기록 옵션은 standard operation(표준 작업) `create`, `update`, `delete` 마다 정합니다. `Option` 에 올 수 있는 값은 세 가지입니다.

| 옵션 | 기록하는 내용 |
| --- | --- |
| `none` | 그 작업은 change documents 에 아무것도 기록하지 않습니다. |
| `key` | 키 값만 기록합니다. |
| `data` | change documents 대상 필드의 데이터를 모두 기록합니다. |

**change documents 대상 필드**란 다음 둘 가운데 하나에 해당하는 필드입니다.

- 주석 `AbapCatalog.typeSpec.changeDocumentRelevant` 가 `true` 인 CDS 단순 타입으로 타입을 준 필드
- change documents 표시가 켜진 DDIC 데이터 엘리먼트로 타입을 준 필드

적는 규칙은 다음과 같습니다.

- standard operation 하나에 옵션은 하나만 적습니다.
- 괄호 안에 적어도 한 작업의 옵션은 있어야 합니다.
- 여러 개를 적을 때는 쉼표(`,`)로 나눕니다. 순서는 상관없습니다.
- `create` 와 `delete` 에는 세 옵션을 모두 쓸 수 있습니다. `update` 에는 `none` 과 `data` 만 쓸 수 있습니다.

`update:data` 로 두면 change documents 대상 필드가 수정될 때마다 수정 **전 값과 후 값**을 함께 저장합니다.

옵션을 따로 적지 않으면 다음 기본값이 적용됩니다.

```bdl
changedocuments ( create : key, update : data, delete : key );
```

### 쓸 수 있는 곳

managed RAP BO 에서 change documents 가 켜진 entity 에만 쓸 수 있습니다.

## 예제

여행은 change documents 마스터, 예약은 change documents 종속으로 둡니다. change documents 객체는 `ZTRAVEL_CD` 입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
changedocuments master ( ZTRAVEL_CD )
{
  // 생성은 키만, 수정은 전후 값 모두, 삭제는 기록하지 않는다
  changedocuments ( create : key, update : data, delete : none );

  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
changedocuments dependent by _Travel
{
  // 적은 순서는 상관없다. 생성과 삭제 모두 대상 필드의 데이터를 기록한다
  changedocuments ( delete : data, create : data );

  update;
  delete;
  field ( readonly : update ) TravelID, BookingID;
  association _Travel;
}
```

예약 entity 본문에 to-parent association `_Travel` 을 적어 둬야 예약의 변경 내용이 여행의 change documents 객체에 함께 기록됩니다.

## 알아두기

- change documents 객체 자체에도 change documents 생성용 기록 옵션이 있습니다. RAP 에서는 그 옵션을 보지 않고, behavior definition(동작 정의)에 적은 내용을 따릅니다.
- action 같은 non-standard operation(비표준 작업)으로 바뀐 내용도 기록됩니다. non-standard operation 은 보통 standard operation 을 조합해 구현하므로, standard operation 에 정한 기록 옵션대로 기록됩니다.
- `update:key` 는 쓸 수 없습니다.

## 관련 항목

- [[abenbdl_change_documents]]
- [[abenbdl_standard_operations]]
