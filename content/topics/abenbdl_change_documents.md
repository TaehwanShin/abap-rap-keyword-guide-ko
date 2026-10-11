---
title: change documents (changedocuments)
summary: persistent table 에 일어난 변경을 change documents 객체에 자동으로 기록하도록, entity 를 change documents 마스터나 종속으로 지정하는 문법입니다.
keywords: changedocuments, changedocuments master, changedocuments dependent by, asynchronous, utc, 변경 문서, 변경 이력, 변경 문서 객체, change document object, 변경 기록
---

## 문법

```syntax
... changedocuments master [asynchronous]
                           [utc]
                           ( ChangeDocumentObject )
  | changedocuments dependent [by _Assoc]
```

## 설명

RAP change documents 는 persistent table 에 일어난 변경을 **change documents 객체** `ChangeDocumentObject` 에 기록합니다. change documents 객체는 자기에게 배정된 데이터베이스 테이블의 변경 내용을 기록하는 저장소 객체입니다.

변경을 기록하려는 entity(엔터티)마다 entity 동작 특성에 `changedocuments` 를 적습니다. 이렇게 적은 entity 가 change documents 를 쓰는 entity 가 됩니다. behavior pool(동작 풀)에 구현할 것은 없습니다.

### 먼저 갖춰야 할 것

- [[abenbdl_strict|strict mode]] 가 켜져 있어야 합니다.
- [[abenbdl_persistent_table|persistent table]] 로 persistent table 을 지정해 두어야 합니다.

### 마스터와 종속

entity 는 change documents 마스터이거나 change documents 종속으로 지정합니다.

- **change documents 마스터 entity** 는 자기 change documents 객체가 있습니다. change documents 를 기록하는 entity 묶음(하위 트리)의 뿌리가 됩니다.
- **change documents 종속 entity** 는 change documents 마스터에 정해 둔 change documents 객체에 자기 변경을 기록합니다.

규칙은 다음과 같습니다.

- 마스터는 `changedocuments master ( ChangeDocumentObject )` 로 적습니다.
- `ChangeDocumentObject` 는 change documents 객체의 이름입니다. ADT(Eclipse 용 ABAP 개발 도구)의 빠른 수정으로 만들 수 있습니다.
- 어느 entity 든 change documents 마스터가 될 수 있습니다. 보통 루트 노드를 마스터로 삼지만 꼭 그래야 하는 것은 아닙니다.
- 마스터 하나에 종속 entity 는 없어도 되고 여러 개여도 됩니다.
- 지금은 RAP BO 하나에 change documents 마스터 entity 를 하나까지만 둘 수 있습니다.
- 종속은 `changedocuments dependent [by _Assoc]` 로 적습니다.
- composition 트리에서 마스터보다 아래 단계에 있는 entity 는 모두 종속으로 지정할 수 있습니다.
- `by _Assoc` 은 선택입니다. 마스터로 가는 association 을 직접 지정할 때 씁니다. 빼면 마스터 쪽 조상으로 가는 association 이 자동으로 쓰입니다.
- change documents 를 쓰는 entity 들은 BO 의 composition 계층 안에서 하나의 트리를 이뤄야 합니다.
- 무엇을 어떻게 기록할지 같은 세부 옵션은 entity 동작 본문에 적습니다. [[abenbdl_changedocs_options]] 에서 설명합니다.

change documents 객체에도 원래 change documents 생성 옵션이 들어 있습니다. 하지만 RAP 에서는 그 옵션을 쓰지 않습니다. RAP 에서 쓰는 것은 change documents 객체의 **이름**뿐이고, 이 이름이 change documents 결과의 키 필드 구실을 합니다. 세부 옵션은 BDEF 전용 문법으로 따로 적습니다.

### 어느 수준에서 기록하는가

기본으로는 persistent table 수준이 아니라 **CDS entity 수준**에서 변경을 기록합니다. 그래서 CDS entity 필드의 메타데이터를 따져서 기록합니다. 타입 정보, 통화 키나 단위 키를 가리키는 참조 어노테이션, CDS 단순 타입이나 DDIC 데이터 엘리먼트에 정해 둔 필드별 change documents 설정 같은 것들입니다.

### 추가 구문

- `asynchronous` : change documents 데이터를 많이 쓰느라 응답이 눈에 띄게 느려질 때 씁니다. change documents 테이블에 넣을 데이터를 계산하는 일은 그대로 동기로 하지만, 테이블에 쓰는 일은 백그라운드 처리 프레임워크로 비동기로 합니다. 응답 시간이 좋아질 수 있습니다.
- `utc` : change documents 데이터에는 언제 썼는지 알려 주는 타임스탬프 필드가 있습니다. 기본으로는 시스템의 현재 시간대로 기록합니다. `utc` 를 붙이면 UTC 로 기록합니다.

## 예제

루트 `Travel` 이 change documents 마스터이고 change documents 객체 `ZTRAVEL_CD` 에 기록합니다. 자식 `Booking` 은 종속으로, to-parent association `_Travel` 을 거쳐 같은 객체에 기록합니다. 본문의 `changedocuments ( ... )` 줄은 기록 옵션입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
changedocuments master ( ZTRAVEL_CD )
{
  // 기록 옵션 (자세한 뜻은 changedocuments 옵션 항목 참고)
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
  changedocuments ( delete : data, create : data );

  update;
  delete;

  field ( readonly : update ) TravelID, BookingID;
  association _Travel { }
}
```

쌓인 change documents 는 클래스 `CL_CHDO_READ_TOOLS` 로 읽어 볼 수 있습니다.

## 알아두기

- managed RAP BO 에서만 쓸 수 있습니다.
- BDEF extension(확장)에서는 change documents 마스터 entity 를 새로 정할 수 없습니다. 노드 extension 에서 종속 entity 를 정하는 것은 됩니다. 다만 그렇게 한 뒤에도 change documents 를 쓰는 entity 들이 여전히 하나의 트리를 이뤄야 합니다.
- projection BDEF 나 RAP BO interface 를 거쳐 데이터를 바꿔도, change documents 를 쓰는 entity 라면 base BO(기반 BO) 의 change documents 객체에 자동으로 기록됩니다. 따로 켤 필요가 없습니다.
- 온프레미스 시스템에서는 언어 버전이 Standard ABAP 일 때만 change documents 연동이 작동합니다.
- lock dependent, authorization dependent, etag dependent 와 함께 `( lock, authorization, etag, changedocuments ) dependent by _Assoc` 처럼 한 줄로 줄여 쓸 수 있습니다. [[abenbdl_short_syntax]] 를 참고하세요.

## 관련 항목

- [[abenbdl_changedocs_options]]
- [[abenbdl_strict]]
- [[abenbdl_persistent_table]]
- [[abenbdl_short_syntax]]
