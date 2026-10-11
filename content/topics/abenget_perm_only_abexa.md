---
title: 예제 - GET PERMISSIONS 의 only_clause
summary: 같은 요청을 ONLY GLOBAL 부터 ONLY (dyn_spec) 까지 only_clause 만 바꿔 가며 실행해, 결과의 instances 와 global 에 무엇이 담기는지 견주는 예제입니다.
keywords: GET PERMISSIONS, only_clause, 예제, ONLY GLOBAL, ONLY GLOBAL FEATURES, ONLY GLOBAL AUTHORIZATION, ONLY INSTANCE, ONLY INSTANCE FEATURES, ONLY INSTANCE AUTHORIZATION, ONLY FEATURES, ONLY AUTHORIZATION, T_PERMISSIONS_ONLY, get_global_features, get_global_authorizations, get_instance_authorizations
---

## 설명

`only_clause` 의 모든 갈래를 짧은 형식의 `GET PERMISSIONS` 문으로 차례로 실행하는 예제입니다. 요청 구조와 키는 그대로 두고 `ONLY ...` 만 바꾸므로, 절마다 결과가 어떻게 달라지는지 바로 견줄 수 있습니다.

원문은 root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나로 된 managed RAP BO 를 씁니다. 루트의 behavior definition(동작 정의)에는 `authorization master ( global, instance )`, global feature control(기능 제어)가 걸린 `update`, instance feature control 이 걸린 필드 두 개와 association 을 따라가는 생성 작업, static feature control(`readonly`, `mandatory`)가 걸린 필드가 있습니다.

behavior pool(동작 풀)에는 갈래마다 handler method(핸들러 메서드)가 하나씩 있습니다.

| 메서드 | 돌려주는 것 |
| --- | --- |
| `get_instance_features` | 조건에 따라 두 필드가 readonly 인지 고칠 수 있는지, 자식을 만드는 작업이 켜져 있는지 꺼져 있는지. |
| `get_global_features` | 수정 작업을 해도 되는지. 정해진 시간대에만 수정할 수 있게 했습니다. |
| `get_global_authorizations` | 생성과 삭제를 해도 되는지. 권한이 있는 사용자만 할 수 있게 했습니다. 예제를 단순하게 하려고 권한 객체 없이 변수 하나로 권한 여부를 흉내 냈고, 이 예제에서는 권한이 없는 것으로 해 두었습니다. |
| `get_instance_authorizations` | 인스턴스를 삭제해도 되는지. 한 필드가 특정 값이면 삭제를 막습니다. |

프로그램은 데이터베이스 테이블을 비우고 시험 데이터를 채운 뒤, 요청 구조에서 모든 필드와 작업, association 을 켭니다. response parameter(응답 매개변수)도 적지만 예제에서는 쓰지 않습니다.

## 예제

같은 내용을 여행 BO 로 줄여 썼습니다. 아홉 가지 절 가운데 셋만 싣습니다. 나머지는 `ONLY` 뒤의 낱말만 다릅니다.

```abap
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %create          = if_abap_behv=>mk-on
                      %update          = if_abap_behv=>mk-on
                      %delete          = if_abap_behv=>mk-on
                      %assoc-_booking  = if_abap_behv=>mk-on
                      %field-agencyid  = if_abap_behv=>mk-on
                      %field-begindate = if_abap_behv=>mk-on
                      %field-enddate   = if_abap_behv=>mk-on ).

" 전역 갈래: 키를 넘기지 않는다
GET PERMISSIONS ONLY GLOBAL ENTITY zr_travel
  REQUEST ls_request
  RESULT   DATA(ls_result_global)
  FAILED   DATA(ls_failed_global)
  REPORTED DATA(ls_reported_global).

" 인스턴스 갈래: 키를 넘긴다
GET PERMISSIONS ONLY INSTANCE ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result_instance)
  FAILED   DATA(ls_failed_instance)
  REPORTED DATA(ls_reported_instance).

" 절을 실행 시점에 고른다. ONLY AUTHORIZATION 과 같다
GET PERMISSIONS ONLY (if_abap_behv=>permissions_only-authorization)
  ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result_dyn)
  FAILED   DATA(ls_failed_dyn)
  REPORTED DATA(ls_reported_dyn).

" 결과 읽기: 인스턴스별 값과 전역 값
LOOP AT ls_result_instance-instances INTO DATA(ls_instance).
  " ls_instance-%delete, ls_instance-%assoc-_booking, ls_instance-%field-begindate ...
ENDLOOP.
DATA(lv_create) = ls_result_global-global-%create.
```

### 실행하면

원문 예제는 절마다 `instances` 테이블과 `global` 구조의 값을 화면에 보여 줍니다. 값의 뜻은 작업의 경우 `00` 켜짐, `01` 꺼짐, `02` 권한 없음(`IF_ABAP_BEHV=>PERM-O-UNAUTHORIZED`)이고, 필드의 경우 `01` 필수, `02` readonly(`IF_ABAP_BEHV=>PERM-F-READ_ONLY`)입니다.

| 절 | `instances` 테이블 | `global` 구조 |
| --- | --- | --- |
| `ONLY GLOBAL` | 줄이 없습니다. | global 권한(생성과 삭제가 `02`), global feature control(수정이 `00` 또는 `01`), 정적 정보(`mandatory` 필드 `01`, `readonly` 필드 `02`)가 들어 있습니다. |
| `ONLY GLOBAL FEATURES` | 줄이 없습니다. | global feature control 과 정적 정보가 들어 있습니다. |
| `ONLY GLOBAL AUTHORIZATION` | 줄이 없습니다. | global 권한만 들어 있습니다. 생성과 삭제가 `02` 입니다. |
| `ONLY INSTANCE` | instance 권한, instance feature control, 정적 정보가 들어 있습니다. 첫 번째 인스턴스는 자식 만들기가 `01`(꺼짐), 두 번째는 `00` 입니다. `readonly` 필드는 `02` 입니다. instance feature control 이 걸린 두 필드는 `get_instance_features` 가 정한 값으로 나옵니다. 두 번째 인스턴스는 `get_instance_authorizations` 의 결과로 삭제가 `02` 입니다. | `ONLY GLOBAL` 에서 본 정적 정보가 들어 있습니다. |
| `ONLY INSTANCE FEATURES` | `ONLY INSTANCE` 와 같되 instance 권한 부분이 빠집니다. 두 번째 인스턴스의 삭제 결과가 없습니다. | `ONLY INSTANCE` 와 같습니다. |
| `ONLY INSTANCE AUTHORIZATION` | instance 권한만 들어 있습니다. 두 번째 인스턴스는 삭제가 `02` 입니다. 첫 번째 인스턴스는 결과에 아예 없습니다. | 의미 있는 값이 없습니다. |
| `ONLY FEATURES` | instance feature control 과 정적 정보가 들어 있습니다. | global feature control 과 정적 정보가 들어 있습니다. |
| `ONLY AUTHORIZATION` | instance 권한이 들어 있습니다. | global 권한이 들어 있습니다. |
| `ONLY (dyn_spec)` | `ONLY AUTHORIZATION` 과 같습니다. | `ONLY AUTHORIZATION` 과 같습니다. |

## 알아두기

- `ONLY GLOBAL` 로 시작하는 세 절은 키를 넘길 수 없으므로 `instances` 테이블이 비어 있습니다.
- `ONLY INSTANCE AUTHORIZATION` 에서 첫 번째 인스턴스가 결과에 없는 것은 오류가 아닙니다. 제한이 없는 인스턴스는 결과에 나오지 않습니다.
- `ONLY (dyn_spec)` 에는 interface `IF_ABAP_BEHV` 의 `T_PERMISSIONS_ONLY` 타입 열거 값을 넘깁니다.
- 결과가 합쳐지는 규칙은 [[abapget_permissions_rules]] 에 있습니다.

## 관련 항목

- [[abapget_permissions_only_clause]]
- [[abapget_permissions_short]]
- [[abapget_permissions_rules]]
- [[abaphandler_meth_features]]
- [[abaphandler_meth_global_features]]
- [[abaphandler_meth_auth]]
- [[abaphandler_meth_global_auth]]
- [[abenget_perm_forms_abexa]]
- [[abenget_perm_dyn_form_abexa]]
