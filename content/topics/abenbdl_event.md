---
title: business event
summary: entity 상태에 의미 있는 변화가 생겼음을 바깥에 알리는 business event 를 선언하고, 함께 실어 보낼 값을 매개변수로 정합니다.
keywords: event, 비즈니스 이벤트, business event, parameter, deep parameter, payload, 페이로드, RAISE ENTITY EVENT, with additional save, save_modified, use event, event binding, 이벤트 바인딩
---

## 문법

```syntax
event EventName [[deep] parameter ParamName];
```

## 설명

managed 또는 unmanaged RAP BO 에 **business event** 를 선언합니다. business event 는 entity(엔터티) 상태에 의미 있는 변화가 생겼음을 나타내는 데이터 한 건입니다. 이 event 를 받겠다고 등록한 쪽이 event 를 받아 처리합니다.

### 매개변수

입력 매개변수 `ParamName` 은 선택 사항입니다. event 를 받는 쪽에 넘길 정보를 정합니다. 이 정보를 event 의 **페이로드**라고 부릅니다.

| 적는 법 | `ParamName` 에 올 수 있는 것 | BDEF derived type(BDEF 파생 타입)의 모양 |
| --- | --- | --- |
| `parameter ParamName` | CDS abstract entity | 평평한 구조입니다. abstract entity 의 필드마다 구성요소가 하나씩 생깁니다. |
| `deep parameter ParamName` | `with hierarchy` 가 붙은 abstract BDEF ([[abenbdl_bdef_abstract_header]]) | 깊은 구조입니다. entity 의 모든 필드에 더해 CDS composition 마다 구성요소가 생깁니다. |

### event 내보내기

선언만으로는 event 가 나가지 않습니다. 그 RAP BO 의 behavior pool(동작 풀)에서 EML 문 `RAISE ENTITY EVENT` 로 직접 내보냅니다([[abapraise_entity_event]]). 내보내는 시점은 save sequence(저장 순서)의 late save phase(늦은 저장 단계)여야 합니다.

managed RAP BO 에서는 `with additional save` 로 additional save 를 켜고([[abenbdl_saving]]), 그 additional save 구현 안에서 event 를 내보내는 방법을 권장합니다.

### 쓸 수 있는 곳

- managed RAP BO 와 unmanaged RAP BO 에서 선언할 수 있습니다.
- interface BDEF 에서는 `use event` 로 다시 쓸 수 있습니다. [[abenbdl_use_projection]] 을 봅니다.
- projection BDEF 에서는 business event 를 다시 쓸 수 없습니다.

## 예제

여행이 만들어지면 여행사와 고객 번호를 실어 event 를 내보냅니다. 먼저 페이로드로 쓸 abstract entity 입니다.

```cds
@EndUserText.label: '여행 생성 event 의 페이로드'
define abstract entity ZA_TravelCreated
{
  AgencyID   : abap.numc(6);
  CustomerID : abap.numc(6);
}
```

behavior definition(동작 정의)에서 additional save 를 켜고 event 를 선언합니다. 매개변수 없는 event 도 함께 적었습니다.

```bdl
managed with additional save
implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;

  // 평평한 매개변수가 있는 event
  event travelCreated parameter ZA_TravelCreated;

  // 매개변수 없는 event
  event travelDeleted;
}
```

saver method(세이버 메서드) `save_modified` 에서 event 를 내보냅니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    " 새로 만들어진 여행마다 event 를 한 건씩 내보낸다
    IF create-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~travelcreated
        FROM VALUE #( FOR ls_travel IN create-travel
                      ( travelid = ls_travel-travelid
                        %param   = VALUE #( agencyid   = ls_travel-agencyid
                                            customerid = ls_travel-customerid ) ) ).
    ENDIF.

    IF delete-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~traveldeleted
        FROM VALUE #( FOR ls_deleted IN delete-travel
                      ( travelid = ls_deleted-travelid ) ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- event 를 만들고 내보낸 뒤에는 **event 바인딩**을 정의해 event 를 event 타입에 이어 줘야 합니다.
- `parameter` 에는 abstract entity, `deep parameter` 에는 `with hierarchy` 가 붙은 abstract BDEF 만 올 수 있습니다. 서로 바꿔 쓸 수 없습니다.
- projection BDEF 에서 다시 쓸 수 있는 것은 side effects 용 event 뿐입니다. [[abenbdl_event_side_effect]] 를 봅니다.

## 관련 항목

- [[abenbdl_event_overview]]
- [[abenbdl_managed_event]]
- [[abenbdl_event_side_effect]]
- [[abapraise_entity_event]]
- [[abenbdl_saving]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_use_projection]]
