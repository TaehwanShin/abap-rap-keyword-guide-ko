---
title: BDEF derived type 구성요소에 쓰는 상수
summary: %control 같은 표시용 구성요소에 넣는 값을 IF_ABAP_BEHV interface 의 상수로 정리했습니다. 타입마다 쓰는 상수가 다릅니다.
keywords: IF_ABAP_BEHV, 상수, 표시, flag, mk-on, mk-off, MK, PERM-F, PERM-O, FC-F, FC-O, AUTH, ABP_BEHV_FLAG, ABP_BEHV_FIELD_PERM, ABP_BEHV_OP_PERM, ABP_BEHV_FIELD_CTRL, ABP_BEHV_OP_CTRL, ABP_BEHV_AUTH, ABP_BEHV_FEATURE
---

## 설명

BDEF derived type(BDEF 파생 타입)에는 표시(flag) 노릇을 하는 `%` 구성요소가 많습니다. 예를 들어 EML 읽기 요청에서는 [[abapderived_types_control]] 구조 안의 표시로 어떤 필드를 읽을지 정합니다.

표시는 쓰임새에 따라 타입이 나뉘고, 타입마다 넣을 수 있는 값이 interface `IF_ABAP_BEHV` 에 상수로 정의되어 있습니다. 기술적으로는 모두 같은 모양(`RAW` 길이 1)입니다. 그래도 섞어 쓰면 안 됩니다. **상수를 헷갈리지 말고 맞는 자리에 맞는 것을 써야 합니다.**

쓸 수 있는 값은 다음 구조형 상수의 구성요소입니다.

| 타입 | 구조형 상수 | 쓰는 곳 |
| --- | --- | --- |
| `ABP_BEHV_FLAG` | `IF_ABAP_BEHV=>MK` | EML 변경·읽기 작업에서 필드를 표시하거나 표시를 끌 때. `%control`, `%element` 등에 씁니다. |
| `ABP_BEHV_FIELD_PERM` | `IF_ABAP_BEHV=>PERM-F` | 필드 허용 정보 결과. 필드가 mandatory 입력인지, readonly 인지 등을 나타냅니다. |
| `ABP_BEHV_OP_PERM` | `IF_ABAP_BEHV=>PERM-O` | 작업 허용 정보 결과. 예를 들어 삭제 작업을 쓸 수 있음을 나타냅니다. |
| `ABP_BEHV_FIELD_CTRL` | `IF_ABAP_BEHV=>FC-F` | 필드 feature control(기능 제어) 결과. 예를 들어 필드에 제한이 없음을 나타냅니다. |
| `ABP_BEHV_OP_CTRL` | `IF_ABAP_BEHV=>FC-O` | 작업 feature control 결과. 예를 들어 수정 작업을 쓸 수 없음을 나타냅니다. |
| `ABP_BEHV_AUTH` | `IF_ABAP_BEHV=>AUTH` | 권한 결과. 예를 들어 작업에 권한이 없음을 나타냅니다. |
| `ABP_BEHV_FEATURE` | 없음 | 필드 허용 정보와 feature control 결과용으로는 낡은 타입입니다. `ABP_BEHV_FIELD_PERM` 이나 `ABP_BEHV_FIELD_CTRL` 을 대신 씁니다. |

## 예제

`ABP_BEHV_FLAG` 타입 구성요소에 구조형 상수 `IF_ABAP_BEHV=>MK` 의 값을 넣습니다. 첫째는 `CREATE FROM` 의 `%control`, 둘째는 `GET PERMISSIONS` 문에 넘길 요청 구조입니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      %control-travelid   = if_abap_behv=>mk-on
      %control-agencyid   = if_abap_behv=>mk-on
      " 표시를 끈 필드는 값을 적어도 반영되지 않는다
      %control-customerid = if_abap_behv=>mk-off
      ( %cid = 'T1' travelid = '00000001' agencyid = '070001' customerid = '000010' )
      ( %cid = 'T2' travelid = '00000002' agencyid = '070002' customerid = '000020' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %create = if_abap_behv=>mk-on
                      %update = if_abap_behv=>mk-on
                      %delete = if_abap_behv=>mk-off ).
```

결과를 돌려주는 쪽에서는 결과 종류에 맞는 상수를 씁니다.

```abap
" behavior pool 의 handler class 안에서
DATA: ls_features TYPE STRUCTURE FOR INSTANCE FEATURES RESULT zr_travel,
      ls_auth     TYPE STRUCTURE FOR INSTANCE AUTHORIZATION RESULT zr_travel.

" feature control 결과: 필드는 fc-f, 작업은 fc-o
ls_features-%field-begindate = if_abap_behv=>fc-f-read_only.
ls_features-%update          = if_abap_behv=>fc-o-disabled.

" 권한 결과: auth
ls_auth-%delete = if_abap_behv=>auth-unauthorized.
```

## 알아두기

- 묻는 쪽(요청)은 `mk-on` / `mk-off` 를 쓰고, 답하는 쪽(결과)은 `fc-...`, `auth-...`, `perm-...` 을 씁니다. 같은 `%update` 라도 자리에 따라 쓰는 상수가 달라집니다.
- `'X'` 같은 문자 값은 표시로 통하지 않습니다. 자세한 내용은 [[abapderived_types_control]] 에 있습니다.

## 관련 항목

- [[abapderived_types_control]]
- [[abapderived_types_element]]
- [[abapderived_types_features]]
- [[abapderived_types_field]]
- [[abapderived_types_op]]
- [[abapderived_types_perm]]
- [[abapget_permissions]]
