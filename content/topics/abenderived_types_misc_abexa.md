---
title: 예제 - 허용 정보를 요청할 때 쓰는 구성요소
summary: GET PERMISSIONS 문을 ONLY 구문별로 실행하면서 %action, %assoc, %create, %delete, %features, %field, %op, %perm 이 어디에 쓰이는지 보여 주는 예제입니다.
keywords: GET PERMISSIONS, ONLY GLOBAL, ONLY INSTANCE, ONLY FEATURES, ONLY AUTHORIZATION, only_clause, %action, %assoc, %create, %delete, %features, %field, %op, %perm, PERMISSIONS REQUEST, PERMISSIONS RESULT, instances, global, 허용 정보, 기능 제어, 권한, 예제
---

## 설명

managed([[abenbdl_impl_type]]) RAP BO 에 `GET PERMISSIONS` 문([[abapget_permissions]])을 여러 번 실행해 허용 정보를 받아 보는 예제입니다. `ONLY` 구문([[abapget_permissions_only_clause]])을 바꿔 가며 결과가 어떻게 달라지는지 비교합니다. 그 과정에서 다음 구성요소가 나옵니다.

- 요청 구조에 표시하는 것 : [[abapderived_types_create]], [[abapderived_types_delete]], [[abapderived_types_action]], [[abapderived_types_assoc]], [[abapderived_types_field]]
- handler method(핸들러 메서드)가 답할 때 쓰는 것 : [[abapderived_types_features]], [[abapderived_types_op]]
- 결과에서 꺼낼 때 쓰는 것 : [[abapderived_types_perm]]

데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티)로 되어 있습니다. child entity 는 이 예제에서 직접 쓰지 않습니다.

BDEF 에는 권한과 feature control(기능 제어)가 종류별로 하나씩 걸려 있습니다. 그리고 behavior pool(동작 풀)의 handler method 네 개가 각각 답을 줍니다.

| handler method | 하는 일 | BDEF 에 필요한 것 |
| --- | --- | --- |
| `get_instance_features` | 조건에 따라 두 필드가 readonly 인지 고칠 수 있는지, association 으로 자식을 만들 수 있는지 돌려줍니다. `%features` 를 씁니다. | 두 필드와 association 에 `( features : instance )` |
| `get_global_features` | 수정 작업과 action 을 정해진 시간대에만 쓸 수 있게 합니다. | `update` 와 action 에 `( features : global )` |
| `get_global_authorizations` | 생성과 삭제를 권한 있는 사용자만 할 수 있게 합니다. 데모를 단순하게 하려고 권한 객체 없이 변수 하나(`auth_flag`)로 권한 유무를 흉내 내며, 여기서는 권한이 없다고 답합니다. | `authorization master ( global )` |
| `get_instance_authorizations` | 어떤 필드가 특정 값이면 그 인스턴스의 삭제와 action 실행을 막습니다. `%op` 를 씁니다. | `authorization master ( instance )` |

global 권한과 instance 권한을 둘 다 다루므로 BDEF 에는 `authorization master ( global, instance )` 라고 적혀 있습니다.

## 예제

같은 구성을 공통 예제 모델로 옮긴 BDEF 입니다(root entity 부분).

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( global, instance )
{
  create;
  update ( features : global );                              // global feature control
  delete;
  association _Booking { create ( features : instance ); }   // instance feature control

  field ( readonly ) AgencyID;                               // static feature control
  field ( readonly : update ) TravelID;
  field ( mandatory ) CustomerID;
  field ( features : instance ) BeginDate, EndDate;          // instance feature control

  action ( features : global ) acceptTravel;
}
```

RAP BO consumer(사용자) 쪽 코드입니다. 요청 구조 하나를 만들어 모든 `GET PERMISSIONS` 문에 똑같이 넘깁니다.

```abap
DATA: ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel,
      ls_result  TYPE STRUCTURE FOR PERMISSIONS RESULT zr_travel.

" 물어볼 작업·association·action·필드를 모두 표시한다
ls_request = VALUE #(
  %create              = if_abap_behv=>mk-on
  %update              = if_abap_behv=>mk-on
  %delete              = if_abap_behv=>mk-on
  %assoc-_booking      = if_abap_behv=>mk-on
  %action-accepttravel = if_abap_behv=>mk-on
  %field-travelid      = if_abap_behv=>mk-on
  %field-agencyid      = if_abap_behv=>mk-on
  %field-customerid    = if_abap_behv=>mk-on
  %field-begindate     = if_abap_behv=>mk-on
  %field-enddate       = if_abap_behv=>mk-on ).

" 전역 정보만: 키를 줄 수 없다
GET PERMISSIONS ONLY GLOBAL ENTITY zr_travel
  REQUEST ls_request
  RESULT DATA(ls_only_global)
  FAILED DATA(ls_failed1)
  REPORTED DATA(ls_reported1).

" 인스턴스 정보만: 키를 준다
GET PERMISSIONS ONLY INSTANCE ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT DATA(ls_only_instance)
  FAILED DATA(ls_failed2)
  REPORTED DATA(ls_reported2).

" 권한 정보만 받아서 %perm 을 거쳐 꺼낸다
GET PERMISSIONS ONLY AUTHORIZATION ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT ls_result
  FAILED DATA(ls_failed3)
  REPORTED DATA(ls_reported3).

LOOP AT ls_result-instances INTO DATA(ls_instance).
  DATA(lv_delete) = ls_instance-%perm-%delete.
  DATA(lv_accept) = ls_instance-%perm-%action-accepttravel.
  DATA(lv_book)   = ls_instance-%perm-%assoc-_booking.
  DATA(lv_begin)  = ls_instance-%perm-%field-begindate.
ENDLOOP.
```

SAP 예제는 `ONLY` 구문 여덟 가지를 모두 짧은 형식으로 실행합니다. 먼저 데이터베이스 테이블을 비우고 데모 값으로 다시 채웁니다. 모든 문에 같은 요청 구조와 같은 키를 넘기고(키를 줄 수 없는 문은 빼고), response parameter(응답 매개변수)도 받지만 쓰지는 않습니다.

### 실행 결과

결과는 `TYPE STRUCTURE FOR PERMISSIONS RESULT` 타입([[abaptype_structure_for]])입니다. 인스턴스별 정보는 `instances` 테이블에, 전역 정보는 `global` 구조에 들어옵니다. `ONLY` 구문에 따라 채워지는 곳이 다릅니다.

| `ONLY` 구문 | `instances` 테이블 | `global` 구조 |
| --- | --- | --- |
| `ONLY GLOBAL` | 비어 있음 | global 권한, global feature control, 정적 정보 |
| `ONLY GLOBAL FEATURES` | 비어 있음 | global feature control, 정적 정보 |
| `ONLY GLOBAL AUTHORIZATION` | 비어 있음 | global 권한 |
| `ONLY INSTANCE` | instance 권한, instance feature control, 정적 정보 | 정적 정보 |
| `ONLY INSTANCE FEATURES` | `ONLY INSTANCE` 에서 instance 권한 부분만 빠짐 | `ONLY INSTANCE` 와 같음 |
| `ONLY INSTANCE AUTHORIZATION` | instance 권한 | 의미 있는 값 없음 |
| `ONLY FEATURES` | instance feature control, 정적 정보 | global feature control, 정적 정보 |
| `ONLY AUTHORIZATION` | instance 권한 | global 권한 |

출력에 나오는 값은 이렇게 읽습니다. 필드 이름은 위 BDEF 에 맞춰 옮겨 적었습니다.

- global 권한 : `get_global_authorizations` 가 권한이 없다고 답했으므로 `%create` 와 `%delete` 가 `02`, 곧 `IF_ABAP_BEHV=>PERM-O-UNAUTHORIZED` 입니다.
- global feature control : `%update` 와 `%action-accepttravel` 이 `00`(쓸 수 있음) 또는 `01`(쓸 수 없음)입니다. `get_global_features` 가 시간대를 보고 정합니다.
- 정적 정보 : `%field-travelid` 와 `%field-customerid` 는 `01`(mandatory 입력), `%field-agencyid` 는 `02`(readonly, `IF_ABAP_BEHV=>PERM-F-READ_ONLY`)로 BDEF 에 적은 대로 나옵니다.
- instance feature control : 첫째 인스턴스는 `%assoc-_booking` 이 `01` 입니다. association 으로 자식을 만들 수 없다는 뜻입니다. 둘째 인스턴스는 `00` 으로 만들 수 있습니다. `%field-begindate` 와 `%field-enddate` 에는 `get_instance_features` 가 돌려준 값이 들어옵니다.
- instance 권한 : 둘째 인스턴스는 `get_instance_authorizations` 결과로 `%delete` 가 `02` 입니다.

## 알아두기

- `ONLY GLOBAL` 로 시작하는 세 구문에서는 `FROM` 으로 키를 줄 수 없습니다.
- `ONLY INSTANCE` 와 `ONLY INSTANCE FEATURES` 는 인스턴스 정보만 달라고 해도 `global` 구조에 정적 정보가 함께 들어옵니다.
- `ONLY INSTANCE AUTHORIZATION` 결과에는 첫째 인스턴스가 아예 들어 있지 않습니다. 둘째 인스턴스만 `%delete` 가 `02` 로 나옵니다.
- 마지막 `ONLY AUTHORIZATION` 호출은 `%perm` 을 보여 주려는 것입니다. SAP 예제는 인스턴스 키와 `%perm` 의 하위 구성요소로 구조 타입을 따로 만들고, `instances` 테이블의 내용을 그 타입의 내부 테이블로 옮겨 출력합니다. 내용은 바로 앞 `ONLY AUTHORIZATION` 호출의 `instances` 와 같습니다.
- `%perm` 에서 꺼낸 값은 작업·action·association 이 `abp_behv_op_perm`, 필드가 `abp_behv_field_perm` 타입입니다.
- 짧은 형식의 `GET PERMISSIONS` 문에서는 `ENTITY` 뒤에 별칭이 아니라 entity(엔터티)의 전체 이름을 적습니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_only_clause]]
- [[abaptype_structure_for]]
- [[abapderived_types_features]]
- [[abapderived_types_op]]
- [[abapderived_types_perm]]
- [[abenbdl_actions_fc]]
- [[abenbdl_authorization]]
