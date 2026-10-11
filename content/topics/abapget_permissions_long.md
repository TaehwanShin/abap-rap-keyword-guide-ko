---
title: GET PERMISSIONS OF (긴 형식)
summary: RAP BO 하나에 속한 여러 entity 의 허용 여부 질의를 한 문에 모으는 형식입니다. OF 뒤에 root entity 를, ENTITY 뒤에 별칭을 적습니다.
keywords: GET PERMISSIONS OF, 긴 형식, long form, ENTITY, FROM keys, REQUEST, RESULT, PERMISSIONS REQUEST, PERMISSIONS RESULT, PERMISSIONS KEY, 별칭, alias, PRIVILEGED, only_clause
---

## 문법

```syntax
GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause] OF bdef
     ENTITY entity1 [FROM keys] REQUEST request RESULT result
    [ENTITY entity2 [FROM keys] REQUEST request RESULT result]
    [...]
    [response_param].
```

## 설명

RAP BO 하나에 속한 **여러 entity(엔터티)**의 허용 여부 질의를 한 문에 모읍니다. entity 하나만 물어도 됩니다.

`OF bdef` 뒤에 질의가 줄지어 옵니다. 질의 하나(`ENTITY ... RESULT result`)의 문법은 [[abapget_permissions_short|짧은 형식]] 과 같습니다. 질의는 적어도 하나 있어야 합니다.

| 부분 | 내용 |
| --- | --- |
| `OF bdef` | RAP BO 의 root entity(루트 엔터티) 이름입니다. |
| `ENTITY entity1`, `ENTITY entity2`, ... | `bdef` 의 composition 트리에 속한 entity 입니다. root entity 자신도 적을 수 있습니다. behavior definition(동작 정의)에 별칭이 있으면 **별칭**을 적습니다. 전체 이름을 적으면 경고가 납니다. root entity 도 별칭이 있으면 별칭을 씁니다. |
| `REQUEST request` | 무엇을 물을지 표시하는 구조입니다. 작업, 필드, action 마다 구성요소가 있고, 켜거나 끌 수 있습니다. 타입은 `TYPE STRUCTURE FOR PERMISSIONS REQUEST` 여야 합니다. 켤 때는 `if_abap_behv=>mk-on`(값 `01`), 끌 때는 `if_abap_behv=>mk-off`(값 `00`) 같은 interface `IF_ABAP_BEHV` 의 상수를 씁니다. |
| `RESULT result` | 결과를 받는 구조입니다. 타입은 `TYPE STRUCTURE FOR PERMISSIONS RESULT` 입니다. |

`result` 에는 구성요소가 두 개 있습니다.

- `instances` : 내부 테이블입니다. 줄마다 인스턴스 키가 있고, behavior definition 의 entity 동작 본문에서 허용 여부가 정해진 요소마다 구성요소가 있습니다. static 요소는 빠집니다.
- `global` : 구조입니다. entity 동작 본문에서 허용 여부가 정해진 모든 요소의 구성요소가 있습니다.

결과 값을 어떻게 읽는지는 [[abapget_permissions_rules]] 에 있습니다.

### 추가 구문

- `[FORWARDING] PRIVILEGED` : `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. behavior definition 에 `privileged` 가 적혀 있어야 쓸 수 있습니다. [[abapeml_privileged]] 을 봅니다.
- `only_clause` : 결과에 담을 갈래(global/instance, feature control(기능 제어)/권한)를 고릅니다. [[abapget_permissions_only_clause]] 을 봅니다.
- `FROM keys` : 허용 여부를 물을 인스턴스의 키입니다. `keys` 는 `TYPE TABLE FOR PERMISSIONS KEY` 타입 내부 테이블이어야 합니다.
- `response_param` : response parameter(응답 매개변수)입니다. 문 끝에 한 번 적습니다. [[abapeml_response]] 를 봅니다.

## 예제

여행과 그 예약의 instance feature control 을 한 문으로 묻습니다. 결과는 entity 마다 따로 받습니다.

```abap
GET PERMISSIONS ONLY INSTANCE FEATURES OF zr_travel
  ENTITY travel
    FROM VALUE #( ( %key-travelid = '00000001' ) )
    REQUEST VALUE #( %field-begindate = if_abap_behv=>mk-on
                     %field-enddate   = if_abap_behv=>mk-on
                     %assoc-_booking  = if_abap_behv=>mk-on )
    RESULT DATA(ls_result_travel)
  ENTITY booking
    FROM VALUE #( ( %key-travelid = '00000001' %key-bookingid = '0001' ) )
    REQUEST VALUE #( %update = if_abap_behv=>mk-on
                     %delete = if_abap_behv=>mk-on )
    RESULT DATA(ls_result_booking)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- `ONLY GLOBAL ...` 로 시작하는 `only_clause` 를 쓰면 `FROM keys` 를 적으면 안 됩니다. 그 밖의 `ONLY` 절에서는 `FROM keys` 가 꼭 있어야 합니다.
- 짧은 형식은 entity 전체 이름을 요구하지만, 긴 형식의 `ENTITY` 뒤에는 별칭을 씁니다. 헷갈리기 쉬운 차이입니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_short]]
- [[abapget_permissions_dyn]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
- [[abaptype_structure_for]]
- [[abaptype_table_for]]
- [[abenbdl_body]]
- [[abenget_perm_forms_abexa]]
