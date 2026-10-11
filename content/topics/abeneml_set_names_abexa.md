---
title: 예제 - SET NAMES 의 여러 꼴
summary: %control 과 %element 의 칸을 일부만 켠 뒤 SET NAMES 를 실행해, 켜진 필드의 이름만 목록에 담기는 것을 확인하는 예제입니다.
keywords: SET NAMES, FROM FLAGS, MAPPING TYPE, MAPPING LIKE, %control, %element, %assoc, ABP_FIELD_NAME_TAB, 필드 이름 목록, TYPE STRUCTURE FOR REPORTED, 예제
---

## 설명

[[abapset_names|SET NAMES]] 문의 세 가지 꼴을 차례로 실행하는 예제입니다. managed RAP BO(root entity(루트 엔터티)와 child entity(자식 엔터티))를 쓰지만 behavior pool(동작 풀)은 예제와 상관이 없습니다. derived type(파생 타입)만 빌려 씁니다.

꼴마다 변수를 두 개 선언합니다. 하나는 결과를 받을 `ABP_FIELD_NAME_TAB` 타입의 필드 이름 목록이고, 다른 하나는 `%control` 구조가 들어 있는 BDEF derived type 변수입니다. `%control` 을 채울 때 **칸 하나를 일부러 끕니다.** 그 칸은 초기값이므로 결과 목록에 이름이 나오지 않습니다.

1. `SET NAMES fields FROM FLAGS src.` : mapping 없이. 원본을 `%control` 과 `%element` 두 가지로 해 봅니다.
2. `... MAPPING TYPE p_type.` : 옛 타입의 필드 이름으로 결과를 받습니다.
3. `... MAPPING LIKE var.` : 같은 일을 그 타입의 변수로 합니다.

## 예제

```abap
" 1-a) %control: FOR UPDATE 구조. AgencyID 만 꺼 둔다
DATA: lt_fields TYPE abp_field_name_tab,
      ls_update TYPE STRUCTURE FOR UPDATE zr_travel.

ls_update-%control = VALUE #( TravelID   = if_abap_behv=>mk-on
                              AgencyID   = if_abap_behv=>mk-off
                              CustomerID = if_abap_behv=>mk-on
                              Status     = if_abap_behv=>mk-on ).

SET NAMES lt_fields FROM FLAGS ls_update.
" lt_fields 에는 TravelID, CustomerID, Status 세 필드의 이름이 담긴다

" 1-b) %element: FOR REPORTED 구조. association 칸도 켤 수 있다
DATA: lt_fields2  TYPE abp_field_name_tab,
      ls_reported TYPE STRUCTURE FOR REPORTED zr_travel.

ls_reported-%element = VALUE #( TravelID        = if_abap_behv=>mk-on
                                Status          = if_abap_behv=>mk-off
                                %assoc-_Booking = if_abap_behv=>mk-on ).

SET NAMES lt_fields2 FROM FLAGS ls_reported.

" 2) 옛 타입의 필드 이름으로 받기: MAPPING TYPE
DATA: lt_fields3 TYPE abp_field_name_tab,
      ls_update3 TYPE STRUCTURE FOR UPDATE zr_travel.

ls_update3-%control = VALUE #( TravelID = if_abap_behv=>mk-on
                               AgencyID = if_abap_behv=>mk-on
                               Status   = if_abap_behv=>mk-off ).

SET NAMES lt_fields3 FROM FLAGS ls_update3 MAPPING TYPE zstravel_legacy.

" 3) 같은 일을 변수로: MAPPING LIKE
DATA: lt_fields4 TYPE abp_field_name_tab,
      ls_legacy  TYPE zstravel_legacy.

SET NAMES lt_fields4 FROM FLAGS ls_update3 MAPPING LIKE ls_legacy.
```

## 알아두기

- 출력 창에는 꼴마다 결과 필드 이름 목록이 나옵니다. `%control` 에서 꺼 둔 필드는 어느 목록에도 없습니다.
- 첫 번째 꼴만 원본을 `%control` 과 `%element` 둘 다로 보여 줍니다. `%element` 예에서는 `TYPE STRUCTURE FOR REPORTED` 변수를 쓰고 `%assoc` 아래 to-child association 칸도 켰습니다.
- 2번과 3번이 돌아가려면 behavior definition(동작 정의)에 옛 타입의 [[abenbdl_type_mapping|mapping for]] 가 있어야 합니다.
- `%element` 에 `MAPPING` 을 함께 쓰면 association 정보가 사라지는 점은 [[abapset_names]] 에 적혀 있습니다.

## 관련 항목

- [[abapset_names]]
- [[abapset_flags]]
- [[abeneml_set_flags_abexa]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_control]]
- [[abapderived_types_element]]
