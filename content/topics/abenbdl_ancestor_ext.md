---
title: ancestor association
summary: extension 노드에서 루트 쪽 상위 entity 로 가는 association 을 표시해, 잠금·권한·ETag·change documents 마스터로 가는 길을 프레임워크가 스스로 찾게 하는 구문입니다.
keywords: ancestor association, 상위 연관 관계, 조상 연관 관계, abbreviation, without response, with draft, lock dependent, authorization dependent, etag dependent, changedocuments dependent, 확장 노드, 노드 확장
---

## 문법

```syntax
...  ancestor association _Assoc[;]
             [abbreviation _newName]
             [without response]
             [{[with draft;]}]
```

## 설명

association 을 **ancestor association**(ancestor association)로 선언합니다. ancestor association 은 BO 안의 association 가운데, 지금 노드와 root entity(루트 엔터티) 사이에 있는 entity(엔터티)를 대상으로 하는 것입니다. 대상은 composition 트리에서 지금 노드보다 위에 있어야 합니다.

### 왜 쓰는가

ancestor association 이 있으면 authorization master, lock master, etag master, change documents 마스터 entity 로 가는 길을 프레임워크가 스스로 알아냅니다. 그래서 마스터 entity 를 직접 가리킬 필요가 없습니다. 확장되는 RAP BO 가 나중에 바뀌어도 extension(확장)이 깨지지 않게 하려는 것입니다.

마스터를 직접 가리키던 구문은 이렇게 바뀝니다.

| 종속 entity 지정 | 마스터를 직접 가리키는 구문 | ancestor association 을 쓸 때 |
| --- | --- | --- |
| 잠금 | `lock dependent by _Assoc` | `lock dependent` |
| 권한 | `authorization dependent by _Assoc` | `authorization dependent` |
| ETag | `etag dependent by _Assoc` | `etag dependent` |
| change documents | `changedocuments dependent by _Assoc` | `changedocuments dependent` |

줄여서 `( lock, authorization, etag, changedocuments ) dependent` 라고 쓸 수도 있습니다. 넷 다 선택 항목이지만 괄호 안에 적어도 하나는 있어야 합니다.

새 인스턴스를 만들 때는 ancestor association 의 대상에 맞는 외래 키가 자동으로 채워집니다. 외래 키를 직접 넘기거나 계산하거나 데이터베이스에서 읽어 올 필요가 없습니다.

### 무엇에 붙이는가

지금 노드와 루트 노드 사이에 있는 entity 를 가리키는 association 에는 모두 `ancestor` 를 붙이는 것이 좋습니다. 그래서 한 entity 에 ancestor association 이 여러 개 있을 수 있습니다. 다만 다음에는 붙이면 안 됩니다.

- **형제 entity**: 같은 계층에 있는 entity 로 가는 association
- **바로 위 parent entity(부모 엔터티)**: CDS 정의만으로 부모임이 분명하므로 붙이지 않습니다.
- **대상이 같은 association 이 여럿일 때**: 그 가운데 하나에만 붙일 수 있습니다.

지켜야 할 규칙이 두 가지 더 있습니다.

- ancestor association 의 카디널리티는 1 이어야 합니다.
- ancestor association 에 쓰이는 키 필드는 모두 `readonly` 로 표시해야 합니다.

### 추가 구문

- `abbreviation _newName` : association 에 짧은 다른 이름을 줍니다. 최대 16자입니다. association 이름은 root entity 의 이름 공간에 속하고 30자까지 쓸 수 있는데, 이 길이는 상황에 따라 ABAP RAP 가 처리하기에 너무 깁니다. 더 짧은 이름이 필요하면 16자 이하의 줄임 이름을 지정하라는 안내가 나옵니다.
- `without response` : 대상이 다른 BO 에 있는 BO 간(cross-BO) association 에 씁니다. 이런 association 에서는 대상 entity 가 외부 entity([[abenbdl_foreign]])로서 응답 타입에 자동으로 들어갑니다. association 으로 읽거나 create-by-association 할 때 대상 entity 쪽 문제를 응답에 담을 수 있게 하려는 것입니다. `without response` 를 붙이면 대상 entity 가 응답 타입에 들어가지 않습니다. 다만 원문은 ancestor association 을 BO 안의 association 이라고 정의하면서, 이 추가 구문은 cross-BO association 에 쓴다고 설명합니다. ancestor association 에서 언제 쓰는지는 원문에 나와 있지 않습니다.
- `with draft` : association 이 draft 를 다루게 합니다. active(활성) 인스턴스에서 따라가면 active 데이터를, draft 인스턴스에서 따라가면 draft 데이터를 가져옵니다. ([[abenbdl_with_draft]] 참고)

draft 를 쓰는 BO 에서는 모든 association 이 draft 를 다루도록 해야 합니다. 그래야 association 이 언제나 같은 상태(draft 또는 active)의 대상 인스턴스로 이어집니다. BO 에 `with draft` 를 붙이면 BO 안의 association 은 모두 자동으로 draft 를 다루게 됩니다. 이 동작이 코드에 드러나도록, draft BO 안의 composition 에는 `with draft` 를 적으라는 안내가 나옵니다.

## 예제

`Travel` → `Booking` → `BookingSuppl` 로 이어지는 트리에서 `BookingSuppl` 이 extension 노드입니다. 바로 위 부모 `Booking` 으로 가는 `_Booking` 은 보통 association 으로 두고, 그 위의 루트 `Travel` 로 가는 `_Travel` 만 ancestor association 으로 선언합니다.

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

  // ancestor association 에 쓰이는 키 필드는 readonly
  field ( readonly ) TravelID, BookingID;
  field ( readonly : update ) SupplementID;

  association _Booking { with draft; }           // 바로 위 부모: ancestor 를 붙이지 않는다
  ancestor association _Travel { with draft; }   // 루트로 가는 길
}
```

`( lock, authorization ) dependent` 에 마스터 이름이 없습니다. `_Travel` 을 따라 lock master 와 authorization master 를 찾아냅니다.

## 알아두기

- 형제 entity 나 바로 위 parent entity 로 가는 association 에 `ancestor` 를 붙이면 안 됩니다.
- 카디널리티가 1 이 아닌 association 은 ancestor association 이 될 수 없습니다.
- extension 노드를 통째로 다루는 실행 예제는 [[abenbdl_assoc_ext_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_define_beh_extend]]
- [[abenbdl_assoc_ext_abexa]]
- [[abenbdl_foreign]]
- [[abenbdl_with_draft]]
- [[abenbdl_association]]
- [[abenbdl_using_interface]]
