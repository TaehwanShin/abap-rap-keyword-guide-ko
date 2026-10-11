---
title: GET PERMISSIONS 의 only_clause (ONLY ...)
summary: GET PERMISSIONS 결과에 전역/인스턴스, feature control/권한 가운데 어느 갈래만 담을지 고르는 절입니다.
keywords: only_clause, ONLY GLOBAL, ONLY GLOBAL FEATURES, ONLY GLOBAL AUTHORIZATION, ONLY INSTANCE, ONLY INSTANCE FEATURES, ONLY INSTANCE AUTHORIZATION, ONLY FEATURES, ONLY AUTHORIZATION, T_PERMISSIONS_ONLY, GET PERMISSIONS, 전역, 인스턴스, 기능 제어, 권한
---

## 문법

```syntax
... ONLY { GLOBAL
         | GLOBAL FEATURES
         | GLOBAL AUTHORIZATION
         | INSTANCE
         | INSTANCE FEATURES
         | INSTANCE AUTHORIZATION
         | FEATURES
         | AUTHORIZATION
         | (dyn_spec) } ...
```

## 설명

`only_clause` 는 `GET PERMISSIONS` 문의 결과에 어느 갈래를 담을지 정합니다. 갈래는 두 축으로 나뉩니다. 하나는 **global 이냐 instance 냐**, 다른 하나는 **feature control(기능 제어)냐 권한이냐**입니다.

`only_clause` 를 적지 않으면 모든 갈래가 담깁니다. 곧 global feature control, instance feature control, global 권한, instance 권한이 모두 들어옵니다.

| 절 | 결과에 담기는 것 | `FROM keys` |
| --- | --- | --- |
| `ONLY GLOBAL` | global 권한, global feature control, static feature control | 쓸 수 없음 |
| `ONLY GLOBAL FEATURES` | global feature control, static feature control | 쓸 수 없음 |
| `ONLY GLOBAL AUTHORIZATION` | global 권한 | 쓸 수 없음 |
| `ONLY INSTANCE` | instance 권한, instance feature control. static 기능도 함께 나옵니다. | 필수 |
| `ONLY INSTANCE FEATURES` | instance feature control. static 기능도 함께 나옵니다. | 필수 |
| `ONLY INSTANCE AUTHORIZATION` | instance 권한 | 필수 |
| `ONLY FEATURES` | global·static·instance feature control | 필수 |
| `ONLY AUTHORIZATION` | global 권한과 instance 권한. feature control 은 global 이든 instance 든 담기지 않습니다. | 필수 |
| `ONLY (dyn_spec)` | 위 가운데 하나를 실행 시점에 고릅니다. interface `IF_ABAP_BEHV` 의 `T_PERMISSIONS_ONLY` 타입 열거 값을 넘깁니다. | - |

결과가 어떻게 합쳐지고 어떻게 읽어야 하는지는 [[abapget_permissions_rules]] 에 있습니다.

## 예제

global 정보만 물을 때는 키를 넘기지 않습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %create       = if_abap_behv=>mk-on
                      %update       = if_abap_behv=>mk-on
                      %delete       = if_abap_behv=>mk-on
                      %field-status = if_abap_behv=>mk-on ).

" global 권한 + global feature control + static feature control. FROM 을 적지 않는다
GET PERMISSIONS ONLY GLOBAL ENTITY zr_travel
  REQUEST ls_request
  RESULT   DATA(ls_result_global)
  FAILED   DATA(ls_failed_global)
  REPORTED DATA(ls_reported_global).
```

인스턴스 정보를 물을 때는 키가 꼭 있어야 합니다.

```abap
" instance 권한만
GET PERMISSIONS ONLY INSTANCE AUTHORIZATION ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result_auth)
  FAILED   DATA(ls_failed_auth)
  REPORTED DATA(ls_reported_auth).
```

절을 실행 시점에 고를 수도 있습니다. 아래는 `ONLY AUTHORIZATION` 과 같습니다.

```abap
GET PERMISSIONS ONLY (if_abap_behv=>permissions_only-authorization)
  ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result_dyn)
  FAILED   DATA(ls_failed_dyn)
  REPORTED DATA(ls_reported_dyn).
```

## 알아두기

- `ONLY GLOBAL ...` 로 시작하는 세 가지 절 뒤에는 `FROM keys` 를 적으면 안 됩니다. 그 밖의 `ONLY` 절에서는 `FROM keys` 가 꼭 있어야 합니다.
- `ONLY INSTANCE` 와 `ONLY INSTANCE FEATURES` 는 이름과 달리 static 기능도 결과에 함께 나옵니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_short]]
- [[abapget_permissions_long]]
- [[abapget_permissions_dyn]]
- [[abapget_permissions_rules]]
- [[abenget_perm_only_abexa]]
- [[abeneml_calculator_abexa]]
