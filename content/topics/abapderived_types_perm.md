---
title: 허용 정보 묶음 (%perm)
summary: GET PERMISSIONS 결과에서 작업·action·association·필드의 허용 정보를 한 이름으로 묶은 구성요소 묶음입니다.
keywords: %perm, 허용 정보, permissions, 구성요소 묶음, GET PERMISSIONS, PERMISSIONS RESULT, TYPE STRUCTURE FOR PERMISSIONS RESULT, instances, abp_behv_op_perm, abp_behv_field_perm
---

## 설명

`%perm` 은 BDEF derived type(BDEF 파생 타입)의 구성요소 묶음입니다. 허용 정보(permissions, `GET PERMISSIONS` 문으로 받아 오는 권한·feature control(기능 제어) 결과)를 중첩 구조로 모아 **한 이름 아래로 묶습니다**.

`%perm` 의 구성요소는 허용 정보를 받아 올 수 있는 요소들을 담은 중첩 구조입니다. 예를 들면 이렇게 씁니다.

| 쓰는 법 | 가리키는 것 |
| --- | --- |
| `%perm-%update`, `%perm-%delete` | 수정·삭제 작업 |
| `%perm-%action-accepttravel` | action `acceptTravel` |
| `%perm-%assoc-_booking` | association `_Booking` |
| `%perm-%field-begindate` | 필드 `BeginDate` |

### 쓰이는 곳

[[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `PERMISSIONS RESULT`

## 예제

`GET PERMISSIONS` 문의 결과에서 인스턴스마다 `%perm` 을 거쳐 허용 정보를 꺼냅니다.

```abap
DATA: ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel,
      ls_result  TYPE STRUCTURE FOR PERMISSIONS RESULT zr_travel.

ls_request = VALUE #( %update              = if_abap_behv=>mk-on
                      %delete              = if_abap_behv=>mk-on
                      %action-accepttravel = if_abap_behv=>mk-on
                      %assoc-_booking      = if_abap_behv=>mk-on
                      %field-begindate     = if_abap_behv=>mk-on ).

GET PERMISSIONS ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT ls_result
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_result-instances INTO DATA(ls_instance).
  " 작업·action·association 의 허용 정보
  DATA(lv_update) = ls_instance-%perm-%update.
  DATA(lv_delete) = ls_instance-%perm-%delete.
  DATA(lv_accept) = ls_instance-%perm-%action-accepttravel.
  DATA(lv_book)   = ls_instance-%perm-%assoc-_booking.
  " 필드의 허용 정보
  DATA(lv_begin)  = ls_instance-%perm-%field-begindate.
ENDLOOP.
```

## 알아두기

- `%perm` 은 구성요소 묶음이므로 이름을 빼고 `ls_instance-%update` 처럼 바로 써도 같은 값을 가리킵니다.
- SAP 예제는 꺼낸 값을 작업·action·association 은 `abp_behv_op_perm`, 필드는 `abp_behv_field_perm` 타입 변수에 받습니다. 값을 읽는 상수는 [[abapeml_derived_type_flags]] 에 있습니다.

## 관련 항목

- [[abapget_permissions]]
- [[abaptype_structure_for]]
- [[abapderived_types_features]]
- [[abapderived_types_field]]
- [[abapderived_types_action]]
- [[abapderived_types_assoc]]
- [[abenderived_types_misc_abexa]]
