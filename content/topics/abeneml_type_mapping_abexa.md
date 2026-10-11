---
title: 예제 - ABAP EML 의 CORRESPONDING type mapping
summary: 간단한 managed RAP BO 를 놓고 CORRESPONDING 의 type mapping 변형 다섯 가지와 응용 두 가지를 차례로 돌려 결과를 견주어 보는 예제입니다.
keywords: CORRESPONDING, type mapping, 타입 매핑, MAPPING FROM ENTITY, MAPPING TO ENTITY, USING CONTROL, CHANGING CONTROL, %control, mapping for, control, 제어 타입, 예제
---

## 설명

[[abapeml_corresponding|CORRESPONDING type mapping]] 의 변형을 하나씩 실행해 보고, 옮기기 전과 뒤의 내용을 나란히 출력하는 예제입니다. managed RAP BO 하나를 쓰지만 behavior pool(동작 풀)은 이 예제와 상관이 없습니다. EML 로 무엇을 저장하지도 않습니다. 타입끼리 값을 옮기는 것만 봅니다.

behavior definition(동작 정의)에는 [[abenbdl_type_mapping|mapping for]] 가 세 개 있습니다. 하나는 필드 이름만 짝짓고, 나머지 둘은 `control` 을 붙여 제어 정보를 담는 짝 타입까지 함께 짝짓습니다.

예제가 다루는 내용은 일곱 가지입니다.

1. `MAPPING FROM ENTITY` : 입력 derived type(파생 타입, `TYPE TABLE FOR UPDATE`)에서 이름이 다른 일반 타입으로
2. `MAPPING TO ENTITY` : 이름이 다른 일반 타입에서 출력 derived type(`TYPE TABLE FOR READ RESULT`)으로
3. 응용 - 제어 타입 : `MAPPING FROM ENTITY` 를 두 번 써서 데이터는 일반 타입으로, `%control` 은 짝이 되는 제어 타입으로
4. `USING CONTROL` : 이름이 같은 일반 타입으로, `%control` 에서 켜진 필드만
5. `MAPPING FROM ENTITY USING CONTROL` : 이름이 다른 일반 타입으로, 켜진 필드만
6. `CHANGING CONTROL` : 이름이 같은 일반 타입에서 입력 derived type 으로, `%control` 을 채우면서
7. 응용 - 앞에 mapping 을 둔 `CHANGING CONTROL` : 이름이 다른 일반 타입에서 입력 derived type 으로

## 예제

behavior definition 의 mapping 입니다. `zstravel_plain` 처럼 필드 이름이 entity(엔터티)와 같은 구조는 mapping 을 적지 않습니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  // 데이터 구조 zstravel_legacy, 제어 구조 zstravel_legacy_x
  mapping for zstravel_legacy control zstravel_legacy_x corresponding
  {
    TravelID = trav_id control trav_id_x;
    AgencyID = agency  control agency_x;
    Status   = stat    control stat_x;
  }
}
```

실행 코드의 뼈대입니다.

```abap
DATA: lt_update   TYPE TABLE FOR UPDATE zr_travel,
      lt_result   TYPE TABLE FOR READ RESULT zr_travel,
      lt_plain    TYPE STANDARD TABLE OF zstravel_plain WITH EMPTY KEY,
      lt_legacy   TYPE STANDARD TABLE OF zstravel_legacy WITH EMPTY KEY,
      lt_legacy_x TYPE STANDARD TABLE OF zstravel_legacy_x WITH EMPTY KEY,
      lt_tmp      TYPE TABLE OF zr_travel.   " 7번에서 쓰는 중간 변수

lt_update = VALUE #( ( TravelID = '00000001' AgencyID = '070001' Status = 'A'
                       %control = VALUE #( TravelID = if_abap_behv=>mk-on
                                           AgencyID = if_abap_behv=>mk-on
                                           Status   = if_abap_behv=>mk-off ) ) ).

" 1) 이름을 바꿔 일반 타입으로
lt_legacy = CORRESPONDING #( lt_update MAPPING FROM ENTITY ).

" 2) 일반 타입에서 읽기 결과 타입으로
lt_result = CORRESPONDING #( lt_legacy MAPPING TO ENTITY ).

" 3) 같은 문장을 대상만 바꿔 한 번 더: %control 이 제어 타입으로 간다
lt_legacy_x = CORRESPONDING #( lt_update MAPPING FROM ENTITY ).

" 4) 켜진 필드만. Status 는 꺼져 있어 비어 있다
lt_plain = CORRESPONDING #( lt_update USING CONTROL ).

" 5) 이름을 바꾸면서 켜진 필드만
lt_legacy = CORRESPONDING #( lt_update MAPPING FROM ENTITY USING CONTROL ).

" 6) AgencyID 를 비워 둔 일반 타입 → AgencyID 의 %control 이 꺼진다
lt_plain  = VALUE #( ( travelid = '00000002' status = 'N' ) ).
lt_update = CORRESPONDING #( lt_plain CHANGING CONTROL ).

" 7) 이름이 다르면 두 단계로: 이름 맞추기 → %control 채우기
lt_legacy = VALUE #( ( trav_id = '00000003' agency = '070002' ) ).
lt_tmp    = CORRESPONDING #( lt_legacy MAPPING TO ENTITY ).
lt_update = CORRESPONDING #( lt_tmp CHANGING CONTROL ).
```

## 알아두기

- 1, 2, 3, 5, 7번은 behavior definition 에 mapping 이 있어야 돌아갑니다. 4번과 6번은 일반 타입의 필드 이름이 RAP BO 와 같아서 mapping 이 필요 없습니다.
- 3번에서는 `%control` 의 한 필드를 꺼 두었습니다. 그 결과 제어 타입 테이블에서 그 필드에 해당하는 칸이 비어 있습니다. 제어 정보를 일반 타입 쪽에 따로 보관해야 할 때 쓰는 방법입니다.
- 4번과 5번에서는 `%control` 에서 꺼 둔 필드가 대상 테이블에서 값 없이 남습니다. 원본에는 값이 있었는데도 옮겨지지 않습니다.
- 6번과 7번에서는 일반 타입에서 비워 둔 필드가 결과의 `%control` 에서 꺼진 것으로 나옵니다.
- 7번의 중간 변수는 entity 타입(`TYPE TABLE OF` entity 이름)으로 선언합니다. 이름 mapping 과 `%control` 채우기는 문장을 따로 써야 합니다.

## 관련 항목

- [[abapeml_corresponding]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_control]]
- [[abapeml_type_mapping]]
