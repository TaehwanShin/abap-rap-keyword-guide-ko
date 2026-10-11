---
title: GET PERMISSIONS 문
summary: RAP BO 의 작업, 필드, action 을 지금 쓸 수 있는지(권한과 feature control)를 실제로 실행하기 전에 미리 알아보는 EML 문입니다.
keywords: GET PERMISSIONS, 퍼미션, 허용 여부, 권한, 기능 제어, authorization, feature control, global, instance, static feature control, REQUEST, RESULT, only_clause, PERMISSIONS REQUEST, PERMISSIONS RESULT
---

## 문법

짧은 형식

```syntax
GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause]
     ENTITY entity [FROM keys] REQUEST request RESULT result_tab [response_param].
```

긴 형식

```syntax
GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause] OF bdef
     ENTITY entity1 [FROM keys] REQUEST request RESULT result_tab
    [ENTITY entity2 [FROM keys] REQUEST request RESULT result_tab]
    [...]
    [response_param].
```

동적 형식

```syntax
GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause] OPERATIONS perm_tab [response_param].
```

## 설명

`GET PERMISSIONS` 는 RAP BO 에서 무엇이 허용되는지 알려 줍니다. 허용 여부는 작업 단위와 필드 단위로 정해집니다. 작업이 꺼져 있을 수도 있고, 필드가 readonly 일 수도 있습니다.

RAP 런타임은 EML 요청을 처리할 때 이런 허용 여부를 확인합니다. RAP BO consumer(사용자)는 `GET PERMISSIONS` 문으로 그 정보를 **미리** 물어볼 수 있습니다.

허용 여부는 다음 다섯 가지를 아우릅니다.

| 갈래 | 뜻 |
| --- | --- |
| global 권한 | 현재 사용자가 그 작업을 아예 해도 되는지 봅니다. 처리할 데이터와는 상관없습니다. 예) 이 사용자는 데이터를 바꾸면 안 된다. |
| instance 권한 | 인스턴스 필드의 실제 값에 따라 달라지는 권한 확인입니다. |
| global feature control(기능 제어) | 사용자 설정이나 업무 범위 같은 바깥 조건에 따라 달라지는 feature control 입니다. |
| instance feature control | entity(엔터티) 인스턴스의 상태에 따라 달라지는 feature control 입니다. |
| static feature control | behavior definition(동작 정의)에서 필드에 직접 건 접근 제한입니다. 예) `readonly` 로 표시한 필드. |

static feature control 은 behavior definition 에 적혀 있으므로 따로 구현할 것이 없습니다. 나머지 네 가지는 RAP BO provider(제공자)가 직접 구현해야 합니다. `GET PERMISSIONS` 문을 실행하면 상황에 따라 handler method(핸들러 메서드) `FOR [INSTANCE] AUTHORIZATION`, `FOR [INSTANCE] FEATURES`, `FOR GLOBAL AUTHORIZATION`, `FOR GLOBAL FEATURES` 가 불립니다.

허용 여부를 물을 수 있는 대상은 다음과 같습니다.

- 생성, 수정, 삭제 작업
- association 을 따라가는 생성 작업이 있는 association
- 필드
- action
- function

결과에는 여러 갈래의 정보가 합쳐져 있을 수 있습니다. 예를 들어 static feature control 은 global feature control 과 합쳐집니다. 결과가 어떻게 합쳐지고 어떻게 읽어야 하는지는 [[abapget_permissions_rules]] 에 있습니다.

### 세 가지 형식

- [[abapget_permissions_short|짧은 형식]] : entity 하나의 인스턴스에 허용 여부를 묻습니다.
- [[abapget_permissions_long|긴 형식]] : RAP BO 하나에 속한 여러 entity 에 묻는 질의를 한 문에 모읍니다.
- [[abapget_permissions_dyn|동적 형식]] : 여러 RAP BO entity 에 묻는 질의를 내부 테이블에 담아 한 문으로 실행합니다.

어느 형식이든 [[abapget_permissions_only_clause|only_clause]] 로 결과에 담을 갈래를 좁힐 수 있습니다.

## 예제

여행 한 건에 수정, 삭제, 승인 action, `Status` 필드가 허용되는지 묻습니다.

```abap
" 무엇을 물을지 표시한다
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %update              = if_abap_behv=>mk-on
                      %delete              = if_abap_behv=>mk-on
                      %action-accepttravel = if_abap_behv=>mk-on
                      %field-status        = if_abap_behv=>mk-on ).

GET PERMISSIONS ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" ls_result-global    : 전역 정보와 정적 정보
" ls_result-instances : 인스턴스별 정보
```

## 알아두기

- `internal` 로 선언한 요소(내부 association, internal action 등)에는 허용 여부를 물을 수 없습니다.
- projection 의 가상 요소에는 static 기능만 있습니다.
- EML 문을 반복문 안에 넣지 않습니다. 데이터베이스에 한 건씩 여러 번 접근하게 되어 느려집니다. 필요한 데이터는 EML 문 하나로 읽고, 변경도 한 번에 모아서 요청합니다.
- 트랜잭션 쿼리 유형의 CDS projection 뷰나 CDS 트랜잭션 interface 에는 결과를 거르는 `WHERE` 절을 둘 수 있습니다. 기본 동작에서는 `GET PERMISSIONS` 문으로 behavior definition 에 접근할 때 projection 계층의 이 `WHERE` 절이 **무시됩니다.** projection behavior definition 이나 interface behavior definition 의 결과에 들어 있지 않은 인스턴스도 읽고 바꿀 수 있다는 뜻이므로 보안 위험이 될 수 있습니다. behavior definition 에 [[abenbdl_mngd_instance_check_proj|with managed instance filter]] 를 적으면 `WHERE` 절을 반드시 평가하게 할 수 있습니다.
- RAP 작업을 구현할 때는 RAP BO 계약을 지켜야 합니다. 추린 지침은 [[abaprap_impl_rules]] 에 있습니다.

## 관련 항목

- [[abapget_permissions_short]]
- [[abapget_permissions_long]]
- [[abapget_permissions_dyn]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
- [[abenget_permissions_abexas]]
- [[abenbdl_authorization]]
- [[abenbdl_actions_fc]]
- [[abenbdl_field_char]]
- [[abaphandler_meth_auth]]
- [[abaphandler_meth_features]]
- [[abaphandler_meth_global_auth]]
- [[abaphandler_meth_global_features]]
- [[abenbdl_internal]]
- [[abapeml_privileged]]
- [[abeneml_calculator_abexa]]
