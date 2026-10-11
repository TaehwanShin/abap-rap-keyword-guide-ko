---
title: GET PERMISSIONS 지침
summary: GET PERMISSIONS 결과가 어떻게 합쳐지는지, provider 와 consumer 가 지킬 점, 권한 구현을 어느 핸들러가 맡는지를 정리한 지침입니다.
keywords: GET PERMISSIONS, 지침, guidelines, 결과 합치기, 병합, IF_ABAP_BEHV, PERM, AUTH, FC, PERM-O-UNAUTHORIZED, PERM-O-DISABLED, PERM-F, BIT-AND, readonly, mandatory, authorization master, 권한, 기능 제어
---

## 설명

`GET PERMISSIONS` 문을 쓸 때 알아 둘 점을 네 묶음으로 정리한 항목입니다.

- 결과가 합쳐지는 방식
- RAP BO provider(제공자)가 지킬 점
- RAP BO consumer(사용자)가 지킬 점
- 권한 구현을 어느 핸들러가 맡는지

### 핸들러가 불리는 순서

handler method(핸들러 메서드)는 다음 순서로 불립니다.

1. global 권한
2. instance 권한
3. global feature control(기능 제어)
4. instance feature control

이 순서 때문에 앞 단계의 결과가 뒤 단계의 요청을 줄입니다.

- global 권한에서 떨어진 요소는 뒤따르는 핸들러 호출의 요청에서 빠집니다.
- global feature control 이 끈 요소도 뒤따르는 핸들러 호출의 요청에서 빠집니다.
- instance 권한에서 떨어진 인스턴스에는 더 이상 핸들러를 부르지 않습니다.

### 결과가 합쳐지는 방식

결과에는 여러 갈래의 정보가 합쳐져 나올 수 있습니다.

- 동적 feature control 은 권한과 합쳐집니다.
- 인스턴스에 따라 달라지는 요소의 전역 결과는 인스턴스 결과와 합쳐집니다. 이때 static 기능은 아래처럼 인스턴스 결과로 옮겨집니다.

| behavior definition(동작 정의)의 static 기능 | 인스턴스 결과 |
| --- | --- |
| `readonly` | `readonly` |
| `readonly:update` | `readonly` |
| `mandatory` | 무시 |
| `mandatory:create` | 무시 |

`mandatory` 와 `mandatory:create` 를 무시하는 까닭은, 이 둘이 생성 작업에만 의미가 있고 이미 있는 인스턴스에는 의미가 없기 때문입니다.

- 전역 결과에는 전역 정보와 정적 정보만 들어 있습니다.
- static 기능 결과는 언제나 global 기능 결과와 합쳐집니다.
- projection 의 static feature control 은 base BO(기반 BO) 의 동적 feature control 보다 앞섭니다.
- projection 은 base BO 의 static 기능을 물려받습니다.
- 허용 여부와 상관없는 static feature control 은 `GET PERMISSIONS` 가 돌려주지 않습니다. 가상 요소, behavior definition 에서 `numbering:managed` 를 붙인 필드가 그 예입니다.

결과 테이블의 줄에 관해서는 다음을 기억합니다.

- 결과에는 provider 구현이 요청한 작업에 **비어 있지 않은 데이터**를 돌려준 인스턴스만 들어 있습니다. 제한이 하나도 없는 인스턴스는 결과에 나오지 않습니다.
- provider 구현 가운데 하나라도 인스턴스를 실패로 알리면, 다른 구현이 올바른 결과를 돌려주었더라도 그 인스턴스는 결과에 나오지 않습니다.
- `keys` 에 같은 키가 여러 번 있어도 결과에는 인스턴스마다 많아야 한 줄만 있습니다. (`FAILED`, `REPORTED` 응답은 따로입니다.)
- 결과와 응답의 줄 순서는 넘긴 키의 순서와 다를 수 있습니다.
- 응답에는 같은 인스턴스의 줄이 여러 개 있을 수 있습니다. 서로 다른 provider 구현에서 왔거나 실패 원인이 다른 경우입니다.

### RAP BO provider 가 지킬 점

- 권한 핸들러와 기능 핸들러는 넘어온 키 값이 검증되었다고, 곧 실제로 있는 인스턴스라고 가정하면 안 됩니다.
- 결과에 같은 줄을 여러 번 넣지 않습니다.
- 결과와 응답(`FAILED`, `REPORTED`)에는 넘어온 키의 인스턴스만 넣습니다. 그 키와 관계없는 인스턴스를 보태지 않습니다.
- 결과에 빈 줄을 넣지 않습니다. 빈 줄이란 키 말고 모든 필드가 초기값인 줄입니다.
- 결과와 response parameter(응답 매개변수)의 표시 값은 interface `IF_ABAP_BEHV` 의 상수에 정해진 값 범위 안에서 씁니다.
- provider 는 `IF_ABAP_BEHV` 의 상수를 씁니다. 권한 쪽은 `IF_ABAP_BEHV=>AUTH`, feature control 쪽은 `IF_ABAP_BEHV=>FC` 입니다. 허용 여부는 권한 정보와 feature control 정보를 합친 결과이므로, 허용 여부만 다루는 핸들러는 없고 provider 쪽에 허용 여부용 상수도 없습니다.

### RAP BO consumer 가 지킬 점

- 사용자는 `IF_ABAP_BEHV=>PERM` 의 상수를 씁니다.
- 작업과 association 의 결과(전역이든 인스턴스든)는 `BIT-AND` 와 상수 `PERM-O-UNAUTHORIZED`, `PERM-O-DISABLED` 로 가려냅니다. 권한이 없는 것인지 기능이 꺼진 것인지 구분할 수 있습니다.
- 필드의 결과는 `BIT-AND` 와 상수 `PERM-F-...` 로 확인합니다. static feature control `mandatory` 는 무시됩니다.
- 결과 값은 조심해서 읽습니다. 예를 들어 필드 결과 `02` 는 readonly(`IF_ABAP_BEHV=>PERM-F` 의 `read_only`)입니다. `00` 은 그 필드에 제한이 없다는 뜻일 수 있지만, `request` 에서 그 필드를 켜지 않았거나 요청이 실패했다는 뜻일 수도 있습니다. 요청이 실패한 경우라면 응답을 확인해야 합니다.

### 권한 구현을 어느 핸들러가 맡나

- `authorization master` 의 standard operation(표준 작업) `create`, `update`, `delete` 권한은 `authorization master` 의 핸들러가 구현합니다.
- authorization dependent entity(엔터티)의 standard operation `create`, `update`, `delete` 권한은 그 entity 의 `authorization master` 가 가진 standard operation `update` 의 핸들러가 구현합니다.
- association 을 따라가는 생성 작업의 권한은 출발 entity 의 핸들러가 구현합니다.
- composition 에서는 association 을 따라가는 생성 작업의 권한 확인을 출발 entity 의 `update` 권한 확인처럼 처리합니다. 출발 entity 가 authorization dependent entity 면 `authorization master` 에서 (`update` 권한으로) 확인합니다. composition 에 권한을 따로 구현할 수도 있습니다. 그러면 `update` 의 권한 결과와 그 composition 의 권한 결과가 OR 로 묶입니다.
- association 을 따라가는 읽기 작업은 provider 가 안에서 처리하며, 허용 여부 개념에 들어가지 않습니다.

## 예제

여행 한 건의 삭제가 막혀 있을 때, 권한이 없어서인지 기능이 꺼져서인지 가려냅니다.

```abap
GET PERMISSIONS ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' ) )
  REQUEST VALUE #( %delete = if_abap_behv=>mk-on )
  RESULT   DATA(ls_result)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_result-instances INTO DATA(ls_instance).
  " 비트 단위로 견준다
  DATA(lv_unauthorized) = ls_instance-%delete BIT-AND if_abap_behv=>perm-o-unauthorized.
  DATA(lv_disabled)     = ls_instance-%delete BIT-AND if_abap_behv=>perm-o-disabled.

  IF lv_unauthorized = if_abap_behv=>perm-o-unauthorized.
    " 권한이 없다
  ELSEIF lv_disabled = if_abap_behv=>perm-o-disabled.
    " feature control 로 꺼져 있다
  ENDIF.
ENDLOOP.
```

## 알아두기

- 결과에 인스턴스가 없다고 해서 오류는 아닙니다. 제한이 없어서 빠졌을 수 있습니다. 실패했는지는 `FAILED` 응답으로 확인합니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_short]]
- [[abapget_permissions_only_clause]]
- [[abenbdl_authorization]]
- [[abenbdl_actions_fc]]
- [[abenbdl_field_char]]
- [[abenbdl_field_numbering]]
- [[abaphandler_meth_auth]]
- [[abaphandler_meth_features]]
- [[abenget_perm_forms_abexa]]
