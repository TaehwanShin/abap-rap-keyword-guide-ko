---
title: 저장 차례 정하기 (save after)
summary: 여러 RAP BO 의 인스턴스가 한꺼번에 저장될 때, 어떤 BO 를 먼저 저장할지 BDEF 머리말에서 직접 정하는 구문입니다.
keywords: save after, save_after, 저장 차례, 저장 순서, explicit save order, late numbering, 늦은 번호 부여, CONVERT KEY, adjust_numbers, predecessor, 선행 BO
---

## 문법

```syntax
...
save after BdefName1[, BdefName2, ...];
 ...
```

## 설명

save sequence(저장 순서)가 시작되었을 때 여러 RAP BO 의 인스턴스가 얽혀 있으면, `save after` 로 **어떤 BO 를 먼저 저장할지** 직접 정합니다.

root entity(루트 엔터티)의 BDEF 에 적습니다. 뒤에 나열한 `BdefName1`, `BdefName2`, ... 가 **먼저** 처리되고, 이 BDEF 의 BO 는 그 뒤에 처리됩니다.

`BdefName1`, `BdefName2`, ... 자리에는 다른 root entity 나 RAP BO interface entity(엔터티)를 적을 수 있습니다.

### 쓸 수 있는 곳

- managed RAP BO
- unmanaged RAP BO

## 예제

여행 BO 를 여행사 BO `ZR_Agency` 보다 나중에 저장하게 합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
save after ZR_Agency;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
late numbering
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

## 알아두기

- 서로 어긋나는 지정은 피해야 합니다. BO A 가 `save after B;` 를 적었다면 BO B 는 `save after A;` 를 적을 수 없습니다.
- `save after` 는 보통 late numbering 이 얽힌 시나리오에서 씁니다. BO A 가 `save after` 로 BO B 를 앞선 BO 로 적으면 B 가 먼저 처리됩니다. 그러면 A 의 saver method(세이버 메서드) [[abensaver_adjust_numbers|adjust_numbers]] 안에서 [[abapconvert_key|CONVERT KEY]] 로 B 의 최종 키를 얻을 수 있습니다.

## 관련 항목

- [[abenbdl_save_after_abexa]]
- [[abapconvert_key]]
- [[abensaver_adjust_numbers]]
- [[abenbdl_bdef_header]]
