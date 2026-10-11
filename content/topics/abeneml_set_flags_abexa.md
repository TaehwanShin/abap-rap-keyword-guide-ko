---
title: 예제 - SET FLAGS 의 여러 꼴
summary: 필드 이름 목록에서 일부러 필드를 하나씩 빼고 SET FLAGS 를 실행해, %control 과 %element 에서 어느 칸이 01 이고 어느 칸이 00 인지 확인하는 예제입니다.
keywords: SET FLAGS, FROM NAMES, MAPPING TYPE, MAPPING LIKE, %control, %element, ABP_FIELD_NAME_TAB, 필드 이름 목록, TYPE STRUCTURE FOR REPORTED, 예제
---

## 설명

[[abapset_flags|SET FLAGS]] 문의 세 가지 꼴을 차례로 실행하는 예제입니다. managed RAP BO(root entity(루트 엔터티)와 child entity(자식 엔터티))를 쓰지만 behavior pool(동작 풀)은 예제와 상관이 없습니다. derived type(파생 타입)만 빌려 씁니다.

꼴마다 변수를 두 개 선언합니다. 하나는 `ABP_FIELD_NAME_TAB` 타입의 필드 이름 목록이고, 다른 하나는 `%control` 구조가 들어 있는 BDEF derived type 변수입니다. 목록을 채울 때 **일부러 필드 하나를 뺍니다.** 그래서 실행 결과에서 빠진 필드만 `00` 으로 남는 것이 눈에 띕니다.

1. `SET FLAGS src FROM NAMES fields.` : mapping 없이. `%control` 과 `%element` 두 가지로 해 봅니다.
2. `... MAPPING TYPE p_type.` : 옛 타입의 필드 이름으로 된 목록을 타입 이름과 함께 넘깁니다.
3. `... MAPPING LIKE var.` : 같은 일을 그 타입의 변수로 합니다.

## 예제

```abap
" 1-a) %control: FOR CREATE 구조
DATA: lt_fields TYPE abp_field_name_tab,
      ls_create TYPE STRUCTURE FOR CREATE zr_travel.

" AGENCYID 를 일부러 뺐다
lt_fields = VALUE #( ( CONV #( 'TRAVELID' ) )
                     ( CONV #( 'CUSTOMERID' ) )
                     ( CONV #( 'STATUS' ) ) ).

SET FLAGS ls_create FROM NAMES lt_fields.
" ls_create-%control: TravelID, CustomerID, Status = 01 / AgencyID 등 나머지 = 00

" 1-b) %element: FOR REPORTED 구조. association 이름도 넣을 수 있다
DATA: lt_fields2  TYPE abp_field_name_tab,
      ls_reported TYPE STRUCTURE FOR REPORTED zr_travel.

lt_fields2 = VALUE #( ( CONV #( 'TRAVELID' ) )
                      ( CONV #( 'STATUS' ) )
                      ( CONV #( '_BOOKING' ) ) ).

SET FLAGS ls_reported FROM NAMES lt_fields2.

" 2) 옛 타입의 필드 이름 + MAPPING TYPE
DATA: lt_fields3 TYPE abp_field_name_tab,
      ls_create3 TYPE STRUCTURE FOR CREATE zr_travel.

" STAT(= Status) 를 일부러 뺐다
lt_fields3 = VALUE #( ( CONV #( 'TRAV_ID' ) )
                      ( CONV #( 'AGENCY' ) ) ).

SET FLAGS ls_create3 FROM NAMES lt_fields3 MAPPING TYPE zstravel_legacy.

" 3) 같은 일을 변수로: MAPPING LIKE
DATA: ls_create4 TYPE STRUCTURE FOR CREATE zr_travel,
      ls_legacy  TYPE zstravel_legacy.

SET FLAGS ls_create4 FROM NAMES lt_fields3 MAPPING LIKE ls_legacy.
```

## 알아두기

- 목록에 든 필드는 `%control` 에서 `01`, 목록에 없는 필드는 `00` 이 됩니다. 출력 창에는 꼴마다 `%control` 구조가 그대로 나옵니다.
- 첫 번째 꼴만 `%control` 과 `%element` 를 둘 다 보여 줍니다. `%element` 예에서는 `TYPE STRUCTURE FOR REPORTED` 변수를 쓰고, 목록에 자식으로 가는 association 이름도 넣었습니다.
- 2번과 3번이 돌아가려면 behavior definition(동작 정의)에 옛 타입의 [[abenbdl_type_mapping|mapping for]] 가 있어야 합니다.

## 관련 항목

- [[abapset_flags]]
- [[abapset_names]]
- [[abeneml_set_names_abexa]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_control]]
- [[abapderived_types_element]]
