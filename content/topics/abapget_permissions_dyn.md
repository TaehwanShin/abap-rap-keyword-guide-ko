---
title: GET PERMISSIONS OPERATIONS (동적 형식)
summary: 여러 RAP BO entity 의 허용 여부 질의를 ABP_BEHV_PERMISSIONS_TAB 타입 내부 테이블에 담아 한 문으로 실행하는 형식입니다.
keywords: GET PERMISSIONS OPERATIONS, 동적 형식, dynamic form, perm_tab, ABP_BEHV_PERMISSIONS_TAB, ABP_ENTITY_NAME, ABP_BEHV_RESPONSE_TAB, entity_name, instances, request, results, PRIVILEGED, only_clause
---

## 문법

```syntax
GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause] OPERATIONS perm_tab [response_param].
```

## 설명

여러 RAP BO entity(엔터티)의 허용 여부 질의를 내부 테이블 `perm_tab` 에 담아 `GET PERMISSIONS` 문 하나로 실행합니다. entity 이름을 실행 시점에 정할 수 있습니다.

`perm_tab` 은 `ABP_BEHV_PERMISSIONS_TAB` 타입 내부 테이블이어야 합니다. 줄 하나가 질의 하나이고, 구성요소는 다음과 같습니다.

| 구성요소 | 필수 | 내용 |
| --- | --- | --- |
| `entity_name` | 필수 | 허용 여부를 물을 BO entity 의 이름입니다. 타입은 `ABP_ENTITY_NAME` 이어야 합니다. 문자 리터럴로 직접 적을 때는 대문자로 적습니다. |
| `instances` | 선택 | 인스턴스 단위 정보를 받을 때만 씁니다. 정적 타입이 `DATA` 인 참조 변수여야 합니다. |
| `request` | 필수 | `REQUEST` 매개변수입니다. 정적 타입이 `DATA` 인 참조 변수여야 합니다. |
| `results` | 필수 | `RESULT` 매개변수입니다. 정적 타입이 `DATA` 인 참조 변수여야 합니다. |

참조가 가리키는 변수는 다른 형식과 같은 BDEF derived type(BDEF 파생 타입)으로 선언합니다. 키 테이블은 `TYPE TABLE FOR PERMISSIONS KEY`, 요청은 `TYPE STRUCTURE FOR PERMISSIONS REQUEST`, 결과는 `TYPE STRUCTURE FOR PERMISSIONS RESULT` 입니다. 결과 값을 어떻게 읽는지는 [[abapget_permissions_rules]] 에 있습니다.

### 추가 구문

- `[FORWARDING] PRIVILEGED` : `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. behavior definition(동작 정의)에 `privileged` 가 적혀 있어야 쓸 수 있습니다. [[abapeml_privileged]] 을 봅니다.
- `only_clause` : 결과에 담을 갈래(global/instance, feature control(기능 제어)/권한)를 고릅니다. [[abapget_permissions_only_clause]] 을 봅니다.
- `response_param` : response parameter(응답 매개변수)입니다. 동적 형식에서는 `ABP_BEHV_RESPONSE_TAB` 타입 내부 테이블이어야 합니다.

## 예제

여행과 예약의 instance feature control 을 동적 형식으로 묻습니다. 결과는 `results` 로 넘긴 구조에 채워집니다.

```abap
" 여행 쪽 질의에 쓸 변수
DATA: lt_key_travel TYPE TABLE FOR PERMISSIONS KEY zr_travel,
      ls_req_travel TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel,
      ls_res_travel TYPE STRUCTURE FOR PERMISSIONS RESULT zr_travel.

lt_key_travel = VALUE #( ( %key-travelid = '00000001' ) ).
ls_req_travel = VALUE #( %field-begindate = if_abap_behv=>mk-on
                         %field-enddate   = if_abap_behv=>mk-on ).

" 예약 쪽 질의에 쓸 변수
DATA: lt_key_booking TYPE TABLE FOR PERMISSIONS KEY zr_booking,
      ls_req_booking TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_booking,
      ls_res_booking TYPE STRUCTURE FOR PERMISSIONS RESULT zr_booking.

lt_key_booking = VALUE #( ( %key-travelid = '00000001' %key-bookingid = '0001' ) ).
ls_req_booking = VALUE #( %update = if_abap_behv=>mk-on ).

" 질의 목록. entity 이름은 대문자로 적는다
DATA(lt_perm) = VALUE abp_behv_permissions_tab(
  ( entity_name = 'ZR_TRAVEL'
    instances   = REF data( lt_key_travel )
    request     = REF data( ls_req_travel )
    results     = REF data( ls_res_travel ) )
  ( entity_name = 'ZR_BOOKING'
    instances   = REF data( lt_key_booking )
    request     = REF data( ls_req_booking )
    results     = REF data( ls_res_booking ) ) ).

GET PERMISSIONS ONLY INSTANCE FEATURES OPERATIONS lt_perm
  FAILED   DATA(lt_failed)
  REPORTED DATA(lt_reported).

" 결과는 ls_res_travel, ls_res_booking 에 들어 있다
```

## 알아두기

- 다른 형식과 달리 `RESULT` 를 문에 적지 않습니다. 결과는 `perm_tab` 의 `results` 가 가리키는 변수에 채워집니다.
- response parameter 의 타입이 다른 형식과 다릅니다. entity 별 구조가 아니라 `ABP_BEHV_RESPONSE_TAB` 타입 테이블입니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_short]]
- [[abapget_permissions_long]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
- [[abapeml_responses_dyn]]
- [[abenget_perm_dyn_form_abexa]]
