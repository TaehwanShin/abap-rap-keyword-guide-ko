---
title: GET PERMISSIONS 짧은 형식
summary: entity 하나의 인스턴스를 놓고 작업, 필드, action 의 허용 여부를 묻는 형식입니다. REQUEST 로 묻고 RESULT 로 받습니다.
keywords: GET PERMISSIONS, 짧은 형식, short form, ENTITY, FROM keys, REQUEST, RESULT, PERMISSIONS REQUEST, PERMISSIONS RESULT, PERMISSIONS KEY, instances, global, PRIVILEGED, only_clause, mk-on
---

## 문법

```syntax
GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause]
     ENTITY entity [FROM keys] REQUEST request RESULT result [response_param].
```

## 설명

entity(엔터티) **하나**의 인스턴스에 허용 여부를 묻습니다.

| 부분 | 내용 |
| --- | --- |
| `ENTITY entity` | entity 이름입니다. 별칭이 아니라 전체 이름을 적어야 합니다. |
| `REQUEST request` | 무엇을 물을지 표시하는 구조입니다. 작업, 필드, action 마다 구성요소가 있고, 켜거나 끌 수 있습니다. 타입은 `TYPE STRUCTURE FOR PERMISSIONS REQUEST` 여야 합니다. 켤 때는 `if_abap_behv=>mk-on`(값 `01`), 끌 때는 `if_abap_behv=>mk-off`(값 `00`) 같은 interface `IF_ABAP_BEHV` 의 상수를 씁니다. |
| `RESULT result` | 결과를 받는 구조입니다. 타입은 `TYPE STRUCTURE FOR PERMISSIONS RESULT` 입니다. 구성요소가 두 개 있습니다. |

`result` 의 두 구성요소는 다음과 같습니다.

- `instances` : 내부 테이블입니다. 줄마다 인스턴스 키가 있고, behavior definition(동작 정의)의 entity 동작 본문에서 허용 여부가 정해진 요소마다 구성요소가 있습니다. static 요소는 빠집니다.
- `global` : 구조입니다. entity 동작 본문에서 허용 여부가 정해진 모든 요소의 구성요소가 있습니다.

결과 값을 어떻게 읽는지는 [[abapget_permissions_rules]] 에 있습니다.

### 추가 구문

- `[FORWARDING] PRIVILEGED` : `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. behavior definition 에 `privileged` 가 적혀 있어야 쓸 수 있습니다. [[abapeml_privileged]] 을 봅니다.
- `only_clause` : 결과에 담을 갈래(global/instance, feature control(기능 제어)/권한)를 고릅니다. [[abapget_permissions_only_clause]] 을 봅니다.
- `FROM keys` : 허용 여부를 물을 인스턴스의 키입니다. `keys` 는 `TYPE TABLE FOR PERMISSIONS KEY` 타입 내부 테이블이어야 합니다.
- `response_param` : response parameter(응답 매개변수)입니다. [[abapeml_response]] 를 봅니다.

## 예제

여행 두 건에서 `BeginDate` 와 `EndDate` 필드를 고칠 수 있는지, instance feature control 만 묻습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request-%field-begindate = if_abap_behv=>mk-on.
ls_request-%field-enddate   = if_abap_behv=>mk-on.

GET PERMISSIONS ONLY INSTANCE FEATURES ENTITY zr_travel
  FROM VALUE #( ( %key-travelid = '00000001' )
                ( %key-travelid = '00000002' ) )
  REQUEST ls_request
  RESULT   DATA(ls_result)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_result-instances INTO DATA(ls_instance).
  " ls_instance-%field-begindate 에 그 여행의 허용 값이 들어 있다
ENDLOOP.
```

## 알아두기

- `ONLY GLOBAL ...` 로 시작하는 `only_clause` 를 쓰면 `FROM keys` 를 적으면 안 됩니다. 그 밖의 `ONLY` 절에서는 `FROM keys` 가 꼭 있어야 합니다.
- 결과 값 `00` 은 제한이 없다는 뜻일 수 있지만, `REQUEST` 에서 그 요소를 켜지 않았거나 요청이 실패했다는 뜻일 수도 있습니다. response parameter 도 함께 확인합니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_long]]
- [[abapget_permissions_dyn]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
- [[abaptype_structure_for]]
- [[abaptype_table_for]]
- [[abenbdl_body]]
- [[abenget_perm_forms_abexa]]
