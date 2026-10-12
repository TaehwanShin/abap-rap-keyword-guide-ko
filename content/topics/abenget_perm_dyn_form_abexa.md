---
title: 예제 - GET PERMISSIONS 동적 형식
summary: 루트와 child entity 의 허용 여부 질의를 ABP_BEHV_PERMISSIONS_TAB 테이블에 담아 GET PERMISSIONS ... OPERATIONS 로 실행하고 결과를 읽는 예제입니다.
keywords: GET PERMISSIONS OPERATIONS, 동적 형식, 예제, ABP_BEHV_PERMISSIONS_TAB, perm_tab, ONLY INSTANCE FEATURES, get_instance_features, PERMISSIONS KEY, PERMISSIONS REQUEST, PERMISSIONS RESULT, instances, global
---

## 설명

`GET PERMISSIONS` 의 동적 형식을 보여 주는 예제입니다. `ONLY INSTANCE FEATURES` 를 붙여 instance feature control(기능 제어)만 묻습니다.

데이터 모델과 behavior definition(동작 정의)는 [[abenget_perm_forms_abexa|짧은 형식과 긴 형식 예제]] 와 같습니다. root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나로 된 managed RAP BO 이고, 루트에는 global·instance 권한, global·instance feature control, static feature control 이 걸려 있습니다. handler method(핸들러 메서드) `get_instance_features` 가 조건에 따라 두 필드가 readonly 인지, 자식을 만드는 작업이 켜져 있는지를 돌려줍니다.

프로그램의 흐름은 다음과 같습니다.

1. 데이터베이스 테이블을 비우고 시험 데이터를 채웁니다.
2. 루트와 자식의 요청 구조에서 필드와 작업, association 을 on 으로 둡니다.
3. entity(엔터티)마다 키 테이블, 요청 구조, 결과 구조를 준비합니다.
4. 이 셋의 참조와 entity 이름을 `ABP_BEHV_PERMISSIONS_TAB` 타입 테이블의 줄에 넣습니다. 줄 하나가 질의 하나입니다.
5. `GET PERMISSIONS ... OPERATIONS` 를 한 번 실행합니다.

## 예제

같은 내용을 여행과 예약으로 줄여 썼습니다.

```abap
" 여행 쪽: 키, 요청, 결과
DATA: lt_key_travel TYPE TABLE FOR PERMISSIONS KEY zr_travel,
      ls_req_travel TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel,
      ls_res_travel TYPE STRUCTURE FOR PERMISSIONS RESULT zr_travel.

lt_key_travel = VALUE #( ( %key-travelid = '00000001' )
                         ( %key-travelid = '00000002' ) ).

ls_req_travel = VALUE #( %update              = if_abap_behv=>mk-on
                         %delete              = if_abap_behv=>mk-on
                         %assoc-_booking      = if_abap_behv=>mk-on
                         %field-travelid      = if_abap_behv=>mk-on
                         %field-agencyid      = if_abap_behv=>mk-on
                         %field-begindate     = if_abap_behv=>mk-on
                         %field-enddate       = if_abap_behv=>mk-on
                         %field-lastchangedat = if_abap_behv=>mk-on ).

" 예약 쪽: 키, 요청, 결과
DATA: lt_key_booking TYPE TABLE FOR PERMISSIONS KEY zr_booking,
      ls_req_booking TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_booking,
      ls_res_booking TYPE STRUCTURE FOR PERMISSIONS RESULT zr_booking.

lt_key_booking = VALUE #( ( %key-travelid = '00000001' %key-bookingid = '0001' ) ).

ls_req_booking = VALUE #( %update         = if_abap_behv=>mk-on
                          %delete         = if_abap_behv=>mk-on
                          %field-travelid = if_abap_behv=>mk-on ).

" 질의 목록: entity 이름(대문자)과 세 변수의 참조
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

" 결과는 results 로 넘긴 구조에 채워져 있다
LOOP AT ls_res_travel-instances INTO DATA(ls_instance).
  " ls_instance-%field-begindate, ls_instance-%assoc-_booking ...
ENDLOOP.
```

### 실행하면

문 하나에 루트 질의와 자식 질의가 따로 들어 있습니다. 원문 예제의 결과를 위 모델에 빗대어 읽으면 이렇습니다.

root entity 의 결과

- `instances` 테이블 : 자식 만들기가 꺼진 인스턴스는 association 칸이 `01` 입니다. behavior definition 에서 `readonly` 로 둔 필드는 두 인스턴스 모두 `02`(readonly)입니다. static feature control 인데도 여기에 함께 나옵니다. instance feature control 이 걸린 두 필드는 `get_instance_features` 가 정한 대로 나옵니다. 제한이 없으면 `00`, readonly 면 `02` 입니다.
- `global` 구조 : 정적 정보가 들어 있습니다. `readonly:update` 인 키 필드 `TravelID` 는 `20`, `mandatory` 인 `AgencyID` 는 `01`, `readonly` 인 `LastChangedAt` 은 `02` 입니다.

child entity 의 결과

- `instances` 테이블 : 예약의 키 필드 `TravelID` 가 `02` 로 나옵니다.
- `global` 구조 : 정적 정보가 들어 있어, 예약의 behavior definition 에서 `readonly` 로 둔 `TravelID` 가 `02`(readonly)로 나옵니다.

## 알아두기

- 다른 형식과 달리 `RESULT` 를 문에 적지 않습니다. 결과는 질의 줄의 `results` 가 가리키는 구조에서 읽습니다.
- response parameter(응답 매개변수) `FAILED`, `REPORTED` 도 적어 두었지만 이 예제에서는 쓰지 않습니다. 동적 형식에서 이 둘은 `ABP_BEHV_RESPONSE_TAB` 타입 테이블입니다.
- 결과가 합쳐지는 규칙은 [[abapget_permissions_rules]] 에 있습니다.

## 관련 항목

- [[abapget_permissions_dyn]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
- [[abaphandler_meth_features]]
- [[abenget_perm_forms_abexa]]
- [[abenget_perm_only_abexa]]
