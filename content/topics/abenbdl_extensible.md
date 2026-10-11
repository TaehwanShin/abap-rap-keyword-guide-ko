---
title: extensibility (extensible)
summary: BDEF extension 을 허용하는 구문입니다. 머리말과 entity 마다 적어야 하고, extension 에서 validation·determination·additional save 를 허용할지도 여기서 정합니다.
keywords: extensible, 확장 허용, 확장 가능, BDEF extension, BDEF 확장, with validations on save, with determinations on save, with determinations on modify, with additional save, extension layering, extend behavior for
---

## 문법

```syntax
...
extensible [{
  [with validations on save;]
  [with determinations on save;]
  [with determinations on modify;]
  [with additional save;]
}]
 ...
```

## 설명

`extensible` 은 [[abenbdl_extension|BDEF extension]] 을 허용합니다. 적지 않으면 확장할 수 없습니다. 먼저 [[abenbdl_strict|strict mode]] 가 켜져 있어야 합니다.

`extensible` 은 **두 군데**에 적어야 합니다.

- BDEF 머리말
- extension(확장)을 허용할 entity(엔터티)마다, 그 entity 동작 특성 자리

머리말에 적을 때는 중괄호 안에 다음 선택 구문을 붙일 수 있습니다.

| 구문 | extension 에서 허용하는 것 |
| --- | --- |
| `with validations on save` | 저장할 때 도는 [[abenbdl_validations]] |
| `with determinations on save` | 저장할 때 도는 [[abenbdl_determinations]] |
| `with determinations on modify` | 수정할 때 도는 determination |
| `with additional save` | additional save |

이 구문으로 드러내어 허용하지 않은 종류는, 이미 있는 entity 를 넓히는 extension 에서 정의할 수 없습니다.

이 허용 여부는 **이미 있는 entity 를 넓히는 extension**([[abenbdl_extend_beh|extend behavior for]])에만 걸립니다. extension 이 새로 더하는 노드([[abenbdl_define_beh_extend|define behavior for]])에서는 validation, determination, additional save 를 언제나 쓸 수 있고 따로 허용받을 필요가 없습니다.

### 쓸 수 있는 곳

- managed RAP BO
- projection BDEF
- interface BDEF
- abstract BDEF
- BDEF extension : extension 을 다시 확장할 수 있습니다(extension 층 쌓기). 이때도 extension 을 드러내어 허용해야 합니다.

unmanaged RAP BO 는 이 목록에 없지만 [[abenrap_feature_table]] 의 `extensible` 줄에는 들어 있어, 원문의 기능 표와 상세 항목이 다르게 적고 있습니다.

## 예제

validation 과 determination, additional save 를 extension 에 모두 열어 둔 BDEF 입니다. 머리말과 entity 양쪽에 `extensible` 이 있습니다. `determine action`, `draft determine action Prepare`, `mapping` 에 붙은 `extensible` 은 그 요소를 extension 에서 넓힐 수 있게 합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;
extensible
{
  with validations on save;
  with determinations on save;
  with determinations on modify;
  with additional save;
}

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( global )
extensible
{
  create;
  update;
  delete;

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare extensible;

  field ( readonly : update ) TravelID;
  field ( readonly ) LastChangedAt;

  determination setStatus on save { create; }

  determine action checkTravel extensible
  {
    determination ( always ) setStatus;
  }

  mapping for ztravel corresponding extensible
  {
    TravelID      = travel_id;
    AgencyID      = agency_id;
    LastChangedAt = last_changed_at;
  }
}
```

이 BDEF 를 넓히는 extension 입니다. determination 을 하나 더하고, 그 determination 을 이미 있는 `determine action` 에 넣습니다.

```bdl
extension implementation in class zbp_x_travel unique;

extend behavior for Travel
{
  determination zzSetRemark on save { create; update; }
  extend determine action checkTravel { determination zzSetRemark; }
}
```

## 알아두기

- projection BDEF, interface BDEF, abstract BDEF, BDEF extension 에서는 `extensible` 만 적을 수 있습니다. 중괄호 안의 선택 구문은 쓸 수 없습니다.
- interface BDEF 에서는 `extensible` 을 머리말에만 적을 수 있고, strict mode 는 쓸 수 없습니다.
- BDEF extension 에서도 strict mode 는 쓸 수 없습니다.
- extension 지점과 extensibility(확장 허용) 방법 전체는 [[abenbdl_extensibility_enabling]] 에 정리되어 있습니다.

## 관련 항목

- [[abenbdl_extension]]
- [[abenbdl_extensibility_enabling]]
- [[abenbdl_extend_beh]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_strict]]
- [[abenbdl_bdef_header]]
- [[abenbdl_character]]
