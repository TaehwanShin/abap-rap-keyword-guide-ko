---
title: TYPE STRUCTURE FOR (BDEF 파생 구조 타입)
summary: RAP 전용 구성요소를 갖춘 구조 타입으로, BDEF 파생 내부 테이블의 줄 타입을 얻거나 GET PERMISSIONS 의 요청·결과처럼 구조가 필요한 곳에 씁니다.
keywords: TYPE STRUCTURE FOR, STRUCTURE FOR CREATE, STRUCTURE FOR UPDATE, STRUCTURE FOR READ RESULT, STRUCTURE FOR PERMISSIONS REQUEST, STRUCTURE FOR PERMISSIONS RESULT, ACTION REQUEST, FUNCTION REQUEST, GLOBAL AUTHORIZATION, GLOBAL FEATURES, HIERARCHY, BDEF 파생 타입, 구조, 줄 타입
---

## 문법

```syntax
... STRUCTURE FOR { ACTION IMPORT bdef~action }
                | { ACTION REQUEST bdef~action }
                | { ACTION RESULT bdef~action }
                | { [INSTANCE] AUTHORIZATION KEY bdef[~group] }
                | { [INSTANCE] AUTHORIZATION REQUEST bdef[~group] }
                | { [INSTANCE] AUTHORIZATION RESULT bdef[~group] }
                | { CHANGE bdef }
                | { CREATE bdef [\_assoc] }
                | { DELETE bdef }
                | { DETERMINATION bdef~det }
                | { EVENT bdef~evt }
                | { FAILED [EARLY | LATE] bdef }
                | { [INSTANCE] FEATURES KEY bdef[~group] }
                | { [INSTANCE] FEATURES REQUEST bdef[~group] }
                | { [INSTANCE] FEATURES RESULT bdef[~group] }
                | { FUNCTION IMPORT bdef~function }
                | { FUNCTION REQUEST bdef~function }
                | { FUNCTION RESULT bdef~function }
                | { GLOBAL AUTHORIZATION REQUEST bdef[~group] }
                | { GLOBAL AUTHORIZATION RESULT bdef[~group] }
                | { GLOBAL FEATURES REQUEST bdef[~group] }
                | { GLOBAL FEATURES RESULT bdef[~group] }
                | { HIERARCHY bdef }
                | { KEY OF bdef }
                | { MAPPED [EARLY | LATE] bdef }
                | { PERMISSIONS KEY bdef }
                | { PERMISSIONS REQUEST bdef }
                | { PERMISSIONS RESULT bdef }
                | { READ CHANGES bdef }
                | { READ IMPORT bdef [\_assoc] }
                | { READ LINK bdef\_assoc }
                | { READ RESULT bdef [\_assoc] }
                | { REPORTED [EARLY | LATE] bdef }
                | { UPDATE bdef }
                | { VALIDATION bdef~valid } ...
```

## 설명

`TYPE STRUCTURE FOR` 는 RAP 에서만 쓰는 구조 타입입니다. `%cid`, `%tky`, `%control` 같은 RAP 전용 구성요소가 들어 있고, RAP BO provider(제공자)와 RAP BO consumer(사용자)가 데이터를 주고받는 데 씁니다.

쓰임은 크게 두 가지입니다.

- **내부 테이블의 줄 타입 얻기.** `TYPE TABLE FOR` 로 만든 테이블의 한 줄을 다룰 구조가 필요할 때 씁니다. 같은 변형 이름으로 `TYPE STRUCTURE FOR` 를 쓰면 그 테이블의 줄 타입이 나옵니다. `LINE OF` 로 타입을 따로 선언하지 않아도 됩니다.
- **구조 그 자체가 필요한 곳.** 몇몇 변형은 고유한 쓰임이 있습니다. 예를 들어 `GET PERMISSIONS` 문의 `REQUEST` 매개변수에는 `TYPE STRUCTURE FOR PERMISSIONS REQUEST` 타입의 구조를 반드시 넘겨야 합니다. 이 구조로 어떤 작업·필드·action 의 허용 정보를 구할지 정합니다.

`TYPE TABLE FOR` 와 변형이 대부분 겹치지만, `TYPE STRUCTURE FOR` 쪽에 변형이 더 많습니다.

### 이름 적는 법

`bdef`, `bdef\_assoc`, `bdef~action` 같은 표기 규칙은 `TYPE TABLE FOR` 와 같습니다.

| 표기 | 뜻 |
| --- | --- |
| `bdef` | root entity(루트 엔터티)나 child entity(자식 엔터티)의 전체 이름, 또는 별칭입니다. 별칭은 RAP BO provider 의 handler method(핸들러 메서드) 안에서만 통합니다. 구현 클래스 밖에서 직접 선언할 때는 별칭을 쓸 수 없습니다. |
| `root_entity\\child_entity` | child entity 를 root entity 와 함께 적는 방법입니다. 이 표기에서는 BDEF 에 자식의 별칭이 있으면 반드시 별칭을 적습니다. |
| `bdef\_assoc` | `_assoc` 는 RAP BO 의 기반 CDS 뷰에 정의한 association 이름입니다. 역슬래시 `\` 로 잇습니다. |
| `bdef~action`, `bdef~function`, `bdef~group`, `bdef~det`, `bdef~valid`, `bdef~evt` | 차례로 BDEF 에 정의한 action, function, 그룹, determination, validation, RAP business event 의 이름입니다. 물결표 `~` 로 잇습니다. |

### 구조에만 있는 변형

아래 변형은 `TYPE STRUCTURE FOR` 에만 있고 `TYPE TABLE FOR` 에는 없습니다. 구성요소는 BDEF 정의와 상황에 따라 일부만 있습니다.

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `ACTION REQUEST` | action 의 결과를 전부 받을지 일부만 받을지 요청 매개변수로 정합니다. | action 에 `result selective` 가 적혀 있어야 합니다. | 키 필드와 데이터 필드. 타입은 `ABP_BEHV_FLAG` 입니다. |
| `FUNCTION REQUEST` | function 의 결과를 전부 받을지 일부만 받을지 요청 매개변수로 정합니다. | function 에 `result selective` 가 적혀 있어야 합니다. | 키 필드와 데이터 필드. 타입은 `ABP_BEHV_FLAG` 입니다. |
| `AUTHORIZATION REQUEST`<br>`INSTANCE AUTHORIZATION REQUEST` | `GET PERMISSIONS` 문을 처리하는 handler method 에서 instance 권한 정보를 구할 때 씁니다. 허용 정보를 어떤 조건으로 구할지 정한 요청 매개변수가 handler method 의 입력 매개변수가 됩니다. 예를 들어 작업별로 정보를 구할지 말지 켜고 끕니다. `INSTANCE` 는 있으나 없으나 같습니다. | BDEF 에 `instance` 속성으로 권한 확인이 정의되어 있어야 합니다([[abenbdl_authorization]]). | `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`. 타입은 모두 `ABP_BEHV_FLAG` 입니다. |
| `FEATURES REQUEST`<br>`INSTANCE FEATURES REQUEST` | `GET PERMISSIONS` 문을 처리하는 handler method 에서 instance feature control(기능 제어) 정보를 구할 때 씁니다. 요청 매개변수가 handler method 의 입력 매개변수가 됩니다. `INSTANCE` 는 있으나 없으나 같습니다. | BDEF 에 `features: instance` 속성이 적혀 있어야 합니다. | `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`(`ABP_BEHV_FLAG`), `%field` 의 하위 구성요소(`ABP_BEHV_FEATURE`) |
| `GLOBAL AUTHORIZATION REQUEST` | `GET PERMISSIONS` 문을 처리하는 handler method 에서 global 권한 정보를 구할 때 씁니다. 요청 매개변수가 handler method 의 입력 매개변수가 됩니다. | BDEF 에 `global` 속성으로 권한 확인이 정의되어 있어야 합니다([[abenbdl_authorization]]). | `%action` 의 하위 구성요소, `%create`, `%delete`, `%update`. 타입은 `ABP_BEHV_FLAG` 입니다. |
| `GLOBAL AUTHORIZATION RESULT` | 위 handler method 의 결과입니다. 요청 매개변수에 따라 구한 global 권한 정보가 들어 있습니다. | 위와 같습니다. | `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`. 타입은 `ABP_BEHV_FLAG` 입니다. |
| `GLOBAL FEATURES REQUEST` | `GET PERMISSIONS` 문을 처리하는 handler method 에서 global feature control 정보를 구할 때 씁니다. 요청 매개변수가 handler method 의 입력 매개변수가 됩니다. | BDEF 에 `features: global` 속성이 적혀 있어야 합니다. | `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`. 타입은 `ABP_BEHV_FLAG` 입니다. |
| `GLOBAL FEATURES RESULT` | 위 handler method 의 결과입니다. 요청 매개변수에 따라 구한 global feature control 정보가 들어 있습니다. | 위와 같습니다. | `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`. 타입은 `ABP_BEHV_FLAG` 입니다. |
| `PERMISSIONS REQUEST` | `GET PERMISSIONS` 문에서 허용 정보를 어떤 조건으로 구할지 정합니다. 예를 들어 어느 작업의 정보를 구할지 켜고 끕니다. | 작업, action, association, 필드가 BDEF 에 정의되어 있어야 그에 맞는 구성요소가 생깁니다. | `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`(`ABP_BEHV_FLAG`), `%field` 의 하위 구성요소(`ABP_BEHV_FEATURE`) |
| `PERMISSIONS RESULT` | `GET PERMISSIONS` 문의 결과입니다. global·instance 권한, global·instance feature control, static feature control 의 결과가 모두 들어 있습니다. | 위와 같습니다. | 아래 참고 |

**`PERMISSIONS RESULT` 의 구성요소**

- 내부 테이블 `instances` : 인스턴스의 키 필드가 원래 타입 그대로 들어 있습니다. 원문은 키 필드가 `%key` 같은 묶음 없이 이름 그대로 들어 있다고 설명하지만, 원문 예제([[abenderived_types_misc_abexa]])는 `%key-키필드` 로 키를 읽습니다. 여기에 `%action` 과 `%assoc` 의 하위 구성요소, `%delete`, `%update`(`ABP_BEHV_FLAG`), `%field` 의 하위 구성요소(`ABP_BEHV_FEATURE`)가 있습니다. 허용 정보는 구성요소 묶음 `%perm` 으로도 가리킬 수 있습니다.
- 구조 `global` : `%action` 과 `%assoc` 의 하위 구성요소, `%create`, `%delete`, `%update`(`ABP_BEHV_FLAG`), `%field` 의 하위 구성요소(`ABP_BEHV_FEATURE`)가 있습니다.

**결과 구성요소의 타입**

위 표와 목록에 적은 타입은 이 항목의 원문 표를 따른 것입니다. 그런데 [[abapeml_derived_type_flags]] 의 원문은 결과 값에 쓰는 타입을 따로 듭니다.

- 권한 결과 : `ABP_BEHV_AUTH`
- 작업의 feature control 결과 : `ABP_BEHV_OP_CTRL`, 필드의 feature control 결과 : `ABP_BEHV_FIELD_CTRL`
- 작업의 허용 정보 결과 : `ABP_BEHV_OP_PERM`, 필드의 허용 정보 결과 : `ABP_BEHV_FIELD_PERM`

`ABP_BEHV_FEATURE` 는 필드의 허용 정보와 feature control 결과용으로는 낡은 타입이라고도 적혀 있습니다. 그러니 `GLOBAL AUTHORIZATION RESULT`, `GLOBAL FEATURES RESULT`, `PERMISSIONS RESULT` 의 타입은 위 표만 믿지 말고 ADT 에서 변수에 커서를 두고 F2 를 눌러 확인합니다.

### 테이블과 함께 있는 변형

아래 변형은 `TYPE TABLE FOR` 에도 있습니다. 쓰임과 구성요소가 같고, 구조는 그 테이블의 한 줄에 해당합니다. BDEF 조건과 자세한 설명은 [[abaptype_table_for]] 에 있습니다.

| 변형 | 쓰임 | 구성요소 |
| --- | --- | --- |
| `ACTION IMPORT` | action 의 입력 매개변수 | `%cid`, `%cid_ref`, `%key`, `%param`, `%pky`, `%tky` (action 정의에 따라 일부만) |
| `ACTION RESULT` | action 의 결과. 결과 매개변수가 정의된 action 에서만 쓸 수 있습니다. | `%cid`, `%cid_ref`, `%key`, `%param`, `%pky`, `%tky` (일부만) |
| `[INSTANCE] AUTHORIZATION KEY` | `GET PERMISSIONS` 처리용 handler method 에 넘어오는 인스턴스 키. instance 권한 정보를 구할 대상입니다. | `%key`, `%pky`, `%tky` |
| `[INSTANCE] AUTHORIZATION RESULT` | 위 handler method 가 돌려주는 instance 권한 정보 | `%action`, `%assoc`, `%delete`, `%key`, `%op`, `%pky`, `%tky`, `%update` |
| `CHANGE` | saver method(세이버 메서드) `save_modified` 에서만 씁니다. additional save 나 unmanaged save 를 쓰는 managed 구현에 한합니다. | `%control`, `%data`, `%key`. 구현 클래스 밖에서는 접근할 수 없습니다. |
| `CREATE bdef` | `CREATE` 작업 | `%cid`, `%control`, `%data`, `%key` |
| `CREATE bdef\_assoc` | association 을 거친 생성(`CREATE BY`) | `%cid_ref`, `%key`, `%pky`, `%target`, `%tky` |
| `DELETE` | `DELETE` 작업 | `%cid_ref`, `%key`, `%pky`, `%tky` |
| `DETERMINATION` | determination handler method 에 넘어오는 인스턴스 키 | `%key`, `%pky`, `%tky`. 구현 클래스 밖에서는 접근할 수 없습니다. |
| `EVENT` | `RAISE ENTITY EVENT` 문에 넘기는 event 데이터 | `%key`. event 에 매개변수가 있으면 `%param` 도 있습니다. |
| `FAILED [EARLY]`, `FAILED LATE` | response parameter(응답 매개변수). 오류가 난 데이터를 알아볼 정보 | `%action`, `%assoc`, `%cid`, `%create`, `%delete`, `%fail`, `%key`, `%op`, `%pky`, `%tky`, `%update` (일부만). `LATE` 에는 `%cid` 가 없습니다. |
| `[INSTANCE] FEATURES KEY` | `GET PERMISSIONS` 처리용 handler method 에 넘어오는 인스턴스 키. instance feature control 정보를 구할 대상입니다. | `%key`, `%pky`, `%tky` |
| `[INSTANCE] FEATURES RESULT` | 위 handler method 가 돌려주는 instance feature control 정보 | `%action`, `%assoc`, `%delete`, `%features`, `%field`, `%key`, `%pky`, `%tky`, `%update` (일부만) |
| `FUNCTION IMPORT` | function 의 입력 매개변수 | `%cid`, `%key`, `%param`, `%pky`, `%tky` (일부만) |
| `FUNCTION RESULT` | function 의 결과. 결과 매개변수가 정의된 function 에서만 쓸 수 있습니다. | `%cid`, `%key`, `%param`, `%pky`, `%tky` (일부만) |
| `HIERARCHY` | action·function 의 deep parameter 와 deep result. abstract BDEF 에서만 쓸 수 있습니다. | entity(엔터티)의 모든 필드와 composition 별 구성요소. `with control` 이면 `%control` 도 있습니다. |
| `KEY OF` | 예를 들어 `SET LOCKS` 문에서 잠글 인스턴스. `TYPE REQUEST FOR DELETE` 안에 든 테이블의 줄이기도 합니다. | 키 필드 자체(`%key` 가 아닙니다). `%is_draft` 와 `%pid` 는 들어갈 수 없습니다. |
| `MAPPED [EARLY]`, `MAPPED LATE` | response parameter. `%cid` 에 어떤 키가 만들어졌는지 같은 mapping 정보 | `EARLY` : `%cid`, `%key`, `%pid`, `%pky`, `%tky`<br>`LATE` : `%key`, `%pid`, `%pre`, `%tmp` |
| `PERMISSIONS KEY` | `GET PERMISSIONS` 문에서 허용 정보를 구할 인스턴스의 키 | `%key`, `%pky`, `%tky` |
| `READ CHANGES` | `WITH CHANGES` 를 쓴 `READ` 문의 결과 | `READ RESULT` 와 같고 `%chg` 가 더 있습니다. |
| `READ IMPORT` | `READ` 와 `READ BY` 에서 읽을 인스턴스 | `%control`, `%key`, `%pky`, `%tky` |
| `READ LINK` | `READ` 와 `READ BY` 에서 돌려받는 root entity 와 연관된 entity 의 기본 키 | 구조 `source` 와 구조 `target`. 각각 `%key`/`%pky`/`%tky` 가 있습니다. |
| `READ RESULT` | `READ` 와 `READ BY` 에서 읽어 낸 인스턴스 | `%data`, `%key`, `%pky`, `%tky` |
| `REPORTED [EARLY]`, `REPORTED LATE` | response parameter. 오류 메시지 같은 메시지 | `%action`, `%cid`, `%create`, `%element`, `%delete`, `%global`, `%key`, `%msg`, `%op`, `%path`, `%pky`, `%state_area`, `%tky`, `%update`. `LATE` 에는 `%cid` 가 없습니다. |
| `UPDATE` | `UPDATE` 작업 | `%cid_ref`, `%control`, `%data`, `%key`, `%pky`, `%tky` |
| `VALIDATION` | validation handler method 에 넘어오는 인스턴스 키 | `%key`, `%pky`, `%tky`. 구현 클래스 밖에서는 접근할 수 없습니다. |

## 예제

테이블의 줄 타입으로 쓰는 경우와, `GET PERMISSIONS` 의 요청 구조로 쓰는 경우입니다.

```abap
" 1) 내부 테이블의 줄 타입
DATA lt_update TYPE TABLE FOR UPDATE zr_travel.
DATA ls_update TYPE STRUCTURE FOR UPDATE zr_travel.

ls_update = VALUE #( travelid        = '00000001'
                     status          = 'A'
                     %control-status = if_abap_behv=>mk-on ).
APPEND ls_update TO lt_update.

MODIFY ENTITIES OF zr_travel
  ENTITY Travel
    UPDATE FROM lt_update
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 2) GET PERMISSIONS 의 요청 구조: 무엇의 허용 정보를 구할지 켠다
DATA ls_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zr_travel.

ls_request = VALUE #( %update              = if_abap_behv=>mk-on
                      %delete              = if_abap_behv=>mk-on
                      %action-accepttravel = if_abap_behv=>mk-on ).

GET PERMISSIONS ENTITY zr_travel
  FROM VALUE #( ( travelid = '00000001' ) )
  REQUEST ls_request
  RESULT   DATA(ls_permissions)
  FAILED   DATA(ls_perm_failed)
  REPORTED DATA(ls_perm_reported).

" 결과는 TYPE STRUCTURE FOR PERMISSIONS RESULT: global 구조와 instances 테이블
LOOP AT ls_permissions-instances INTO DATA(ls_instance).
  DATA(lv_update_allowed) = ls_instance-%update.
ENDLOOP.
```

## 알아두기

- 다음 타입은 구현 클래스와 ABP 보조 클래스 안에서만 선언하고 쓸 수 있습니다. 밖에서는 쓸 수 없습니다 : `FOR CHANGE`, `FOR DETERMINATION`, `FOR VALIDATION`, `FOR ... FEATURES`, `FOR ... AUTHORIZATION`.
- 표에 적은 구성요소는 BDEF 정의에 따라 더 많을 수도, 더 적을 수도 있습니다. 예를 들어 draft 표시 `%is_draft` 는 draft 를 쓸 때만 여러 타입에 들어가고, `%pid` 는 late numbering 을 쓸 때만 있습니다.
- 구성요소 하나하나의 뜻은 [[abapderived_types_comp]] 에 있습니다.

## 관련 항목

- [[abaptype_table_for]]
- [[abaptype_response_for]]
- [[abaptype_request_for]]
- [[abapderived_types_comp]]
- [[abapget_permissions]]
- [[abenbdl_authorization]]
- [[abenbdl_actions_fc]]
- [[abenrap_additional_save_abexa]]
- [[abenrap_managed_unm_save_abexa]]
- [[abenderived_type_hierarchy_abexa]]
