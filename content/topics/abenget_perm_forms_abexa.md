---
title: 예제 - GET PERMISSIONS 짧은 형식과 긴 형식
summary: ONLY INSTANCE FEATURES 로 instance feature control 을 물으면서 GET PERMISSIONS 의 짧은 형식과 긴 형식을 견주고, 결과의 instances 와 global 값을 읽는 예제입니다.
keywords: GET PERMISSIONS, 짧은 형식, 긴 형식, 예제, ONLY INSTANCE FEATURES, get_instance_features, features instance, PERMISSIONS REQUEST, PERMISSIONS RESULT, instances, global, readonly, mandatory, 기능 제어
---

## 설명

`GET PERMISSIONS` 의 짧은 형식과 긴 형식을 한 프로그램에서 견주는 예제입니다. 두 문 모두 `ONLY INSTANCE FEATURES` 를 붙여 instance feature control(기능 제어)만 묻습니다.

원문은 root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나로 된 managed RAP BO 를 씁니다. 루트의 behavior definition(동작 정의)에는 다음이 들어 있습니다.

- global 권한과 instance 권한 (`authorization master ( global, instance )`)
- global feature control 이 걸린 `update`
- instance feature control 이 걸린, association 을 따라가는 생성 작업
- static feature control 이 걸린 필드 (`readonly`, `mandatory`, `readonly:update`)
- instance feature control 이 걸린 필드 두 개

이 예제에서 눈여겨볼 handler method(핸들러 메서드)는 `get_instance_features` 입니다. 조건에 따라 두 필드가 readonly 인지 고칠 수 있는지, 그리고 자식을 만드는 작업이 켜져 있는지 꺼져 있는지를 돌려줍니다.

프로그램은 먼저 데이터베이스 테이블을 비우고 시험 데이터를 채웁니다. 그다음 루트와 자식의 요청 구조에서 모든 필드와 작업, association 을 on 으로 둡니다. 이 요청 구조를 두 문에서 함께 씁니다.

## 예제

같은 내용을 여행과 예약으로 줄여 썼습니다. behavior definition 의 관련 부분입니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( global, instance )
{
  create;
  update ( features : global );
  delete;
  association _Booking { create ( features : instance ); }

  field ( readonly ) LastChangedAt;                   // static feature control
  field ( mandatory ) AgencyID;                       // static feature control
  field ( readonly : update ) TravelID;
  field ( features : instance ) BeginDate, EndDate;   // instance feature control
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;
  association _Travel;

  field ( readonly ) TravelID;                        // static feature control
}
```

`get_instance_features` 는 승인된 여행의 날짜를 잠그고 예약 추가를 막습니다.

```abap
METHOD get_instance_features.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky             = ls_travel-%tky
      %field-begindate = COND #( WHEN ls_travel-status = 'A'
                                 THEN if_abap_behv=>fc-f-read_only
                                 ELSE if_abap_behv=>fc-f-unrestricted )
      %field-enddate   = COND #( WHEN ls_travel-status = 'A'
                                 THEN if_abap_behv=>fc-f-read_only
                                 ELSE if_abap_behv=>fc-f-unrestricted )
      %assoc-_booking  = COND #( WHEN ls_travel-status = 'A'
                                 THEN if_abap_behv=>fc-o-disabled
                                 ELSE if_abap_behv=>fc-o-enabled ) ) ).
ENDMETHOD.
```

RAP BO consumer(사용자) 쪽에서 두 형식으로 묻습니다.

```abap
DATA: ls_request         TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel,
      ls_request_booking TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_booking.

ls_request = VALUE #( %update              = if_abap_behv=>mk-on
                      %delete              = if_abap_behv=>mk-on
                      %assoc-_booking      = if_abap_behv=>mk-on
                      %field-travelid      = if_abap_behv=>mk-on
                      %field-agencyid      = if_abap_behv=>mk-on
                      %field-begindate     = if_abap_behv=>mk-on
                      %field-enddate       = if_abap_behv=>mk-on
                      %field-lastchangedat = if_abap_behv=>mk-on ).

ls_request_booking = VALUE #( %update         = if_abap_behv=>mk-on
                              %delete         = if_abap_behv=>mk-on
                              %field-travelid = if_abap_behv=>mk-on ).

" 짧은 형식: entity 하나. 전체 이름을 적는다
GET PERMISSIONS ONLY INSTANCE FEATURES ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result_short)
  FAILED   DATA(ls_failed_short)
  REPORTED DATA(ls_reported_short).

" 긴 형식: 루트와 자식을 한 문으로. 별칭을 적는다
GET PERMISSIONS ONLY INSTANCE FEATURES OF zr_travel
  ENTITY travel
    FROM VALUE #( ( %key-travelid = '00000003' ) )
    REQUEST ls_request
    RESULT DATA(ls_result_travel)
  ENTITY booking
    FROM VALUE #( ( %key-travelid = '00000003' %key-bookingid = '0001' ) )
    REQUEST ls_request_booking
    RESULT DATA(ls_result_booking)
  FAILED   DATA(ls_failed_long)
  REPORTED DATA(ls_reported_long).
```

### 실행하면

문이 실행될 때 `get_instance_features` 가 불려 결과를 채웁니다. 원문 예제의 결과를 위 모델에 빗대어 읽으면 이렇습니다.

짧은 형식의 결과

- `instances` 테이블 : 자식 만들기가 꺼진 인스턴스는 association 칸이 `01` 입니다. behavior definition 에서 `readonly` 로 둔 필드는 두 인스턴스 모두 `02`(readonly)입니다. static feature control 인데도 여기에 함께 나옵니다. instance feature control 이 걸린 두 필드는 메서드가 정한 대로 나옵니다. 제한이 없으면 `00`, readonly 면 `02` 입니다.
- `global` 구조 : 정적 정보가 들어 있습니다. `readonly:update` 인 키 필드 `TravelID` 는 `20`, `mandatory` 인 `AgencyID` 는 `01`, `readonly` 인 `LastChangedAt` 은 `02` 입니다.

긴 형식의 결과

- root entity : 짧은 형식과 같은 질의를 다른 키로 한 것이므로 결과의 모양은 같습니다. 인스턴스의 값이 다르므로 두 필드의 값만 다르게 나옵니다.
- child entity : `instances` 테이블에서 예약의 키 필드 `TravelID` 가 `02` 로 나옵니다. `global` 구조에도 정적 정보가 들어 있어, 예약의 behavior definition 에서 `readonly` 로 둔 `TravelID` 가 `02`(readonly)로 나옵니다.

## 알아두기

- response parameter(응답 매개변수)도 적어 두었지만 이 예제에서는 쓰지 않습니다.
- `ONLY INSTANCE FEATURES` 로 물어도 static 기능이 결과에 함께 나옵니다. 결과가 합쳐지는 규칙은 [[abapget_permissions_rules]] 에 있습니다.
- 짧은 형식의 `ENTITY` 뒤에는 entity(엔터티) 전체 이름을, 긴 형식의 `ENTITY` 뒤에는 별칭을 적습니다.

## 관련 항목

- [[abapget_permissions_short]]
- [[abapget_permissions_long]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
- [[abaphandler_meth_features]]
- [[abenget_perm_dyn_form_abexa]]
- [[abenget_perm_only_abexa]]
