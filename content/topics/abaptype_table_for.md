---
title: TYPE TABLE FOR (BDEF 파생 테이블 타입)
summary: RAP BO provider 와 consumer 가 데이터를 주고받을 때 쓰는 내부 테이블 타입으로, BDEF 에 정의한 작업마다 알맞은 타입을 뽑아 씁니다.
keywords: TYPE TABLE FOR, TABLE FOR CREATE, TABLE FOR UPDATE, TABLE FOR DELETE, TABLE FOR READ RESULT, TABLE FOR READ IMPORT, TABLE FOR ACTION IMPORT, TABLE FOR KEY OF, TABLE FOR FAILED, TABLE FOR MAPPED, TABLE FOR REPORTED, TABLE FOR EVENT, TABLE FOR HIERARCHY, BDEF 파생 타입, 내부 테이블
---

## 문법

```syntax
... TABLE FOR { ACTION IMPORT bdef~action }
            | { ACTION RESULT bdef~action }
            | { [INSTANCE] AUTHORIZATION KEY bdef[~group] }
            | { [INSTANCE] AUTHORIZATION RESULT bdef[~group] }
            | { CHANGE bdef }
            | { CREATE bdef [\_assoc] }
            | { DELETE bdef }
            | { DETERMINATION bdef~det }
            | { EVENT bdef~evt }
            | { FAILED [EARLY | LATE] bdef }
            | { HIERARCHY bdef }
            | { [INSTANCE] FEATURES KEY bdef[~group] }
            | { [INSTANCE] FEATURES RESULT bdef[~group] }
            | { FUNCTION IMPORT bdef~function }
            | { FUNCTION RESULT bdef~function }
            | { KEY OF bdef }
            | { MAPPED [EARLY | LATE] bdef }
            | { PERMISSIONS KEY bdef }
            | { READ CHANGES bdef }
            | { READ IMPORT bdef [\_assoc] }
            | { READ LINK bdef\_assoc }
            | { READ RESULT bdef [\_assoc] }
            | { REPORTED [EARLY | LATE] bdef }
            | { UPDATE bdef }
            | { VALIDATION bdef~valid } ...
```

## 설명

`TYPE TABLE FOR` 는 RAP 에서만 쓰는 내부 테이블 타입입니다. RAP BO provider(제공자)와 RAP BO consumer(사용자)가 데이터를 주고받는 통로가 됩니다. 입력이나 출력을 테이블에 모아 담기 때문에, EML `READ` 나 `MODIFY` 요청 여러 건을 메서드 호출 한 번으로 묶어 처리할 수 있습니다.

타입은 **BDEF 에 정의한 내용에서 나옵니다.** BDEF 에 정의한 작업마다 타입을 뽑아 쓸 수 있고, 정의하지 않은 작업의 타입은 쓸 수 없습니다. 예를 들어 BDEF 에 `create` 가 없으면 `TYPE TABLE FOR CREATE` 를 쓸 수 없습니다.

테이블에는 `%cid`, `%tky`, `%control` 같은 특별한 구성요소가 들어 있습니다. 어떤 구성요소가 있는지도 BDEF 에 따라 달라집니다.

테이블은 대개 기본 키가 비어 있는 표준 테이블입니다. 다만 대부분의 테이블에는 미리 정해진 보조 키가 있습니다([[abapderived_types_secondary_keys]]).

### 이름 적는 법

| 표기 | 뜻 |
| --- | --- |
| `bdef` | root entity(루트 엔터티)나 child entity(자식 엔터티)의 전체 이름, 또는 별칭입니다. 별칭은 RAP BO provider 의 handler method(핸들러 메서드) 안에서만 통합니다. 구현 클래스 밖에서 직접 선언할 때는 별칭을 쓸 수 없습니다. |
| `root_entity\\child_entity` | child entity 를 root entity 와 함께 적는 방법입니다. 루트 이름 뒤에 `\\` 와 자식 이름을 붙입니다. 이 표기에서는 BDEF 에 자식의 별칭이 있으면 반드시 별칭을 적습니다. |
| `bdef\_assoc` | `_assoc` 는 RAP BO 의 기반 CDS 뷰에 정의한 association 이름입니다. 역슬래시 `\` 로 잇습니다. |
| `bdef~action` | BDEF 에 정의한 action 이름입니다. 물결표 `~` 로 잇습니다. |
| `bdef~function` | BDEF 에 정의한 function 이름입니다. |
| `bdef~group` | BDEF 에 정의한 그룹 이름입니다. |
| `bdef~det` | BDEF 에 정의한 determination 이름입니다. |
| `bdef~valid` | BDEF 에 정의한 validation 이름입니다. |
| `bdef~evt` | BDEF 에 정의한 RAP business event 이름입니다. |

### standard operation 과 읽기

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `CREATE bdef` | `CREATE` 작업에 씁니다. | BDEF 의 루트 뷰 부분에 `create` 가 정의되어 있어야 합니다. | `%cid`, `%control`, `%data`, `%key` |
| `CREATE bdef\_assoc` | association 을 거친 생성(`CREATE BY`) 작업에 씁니다. | 아래 "association 을 거친 생성과 읽기" 참고 | `%cid_ref`, `%key`, `%pky`, `%target`, `%tky` |
| `UPDATE` | `UPDATE` 작업에 씁니다. | BDEF 의 루트 뷰 부분에 `update` 가 정의되어 있어야 합니다. | `%cid_ref`, `%control`, `%data`, `%key`, `%pky`, `%tky` |
| `DELETE` | `DELETE` 작업에 씁니다. | BDEF 의 루트 뷰 부분에 `delete` 가 정의되어 있어야 합니다. | `%cid_ref`, `%key`, `%pky`, `%tky` |
| `READ IMPORT` | `READ` 와 association 을 거친 읽기(`READ BY`)에서 읽을 인스턴스를 넘깁니다. | 아래 참고 | `%control`, `%key`, `%pky`, `%tky` |
| `READ RESULT` | `READ` 와 `READ BY` 에서 읽어 낸 인스턴스를 돌려받습니다. | 아래 참고 | `%data`, `%key`, `%pky`, `%tky` |
| `READ LINK` | `READ` 와 `READ BY` 에서 composition 트리 안의 root entity 와 연관된 entity(엔터티)의 기본 키를 돌려받습니다. | 아래 참고 | 구조 `source`(출발 entity 의 `%key`/`%pky`/`%tky`)와 구조 `target`(연관된 entity 의 `%key`/`%pky`/`%tky`) |
| `READ CHANGES` | `WITH CHANGES` 추가 구문을 쓴 `READ` 문의 결과 타입입니다([[abapeml_read_with_changes]]). | - | `READ RESULT` 와 같고 `%chg` 가 더 있습니다. |

**association 을 거친 생성과 읽기**

- composition 에서는 association 을 거친 생성이 따로 적지 않아도 기본으로 켜져 있습니다. 그래도 BDEF 의 루트 뷰나 자식 뷰 부분에 그 association 의 `create` 를 적어 두기를 권장합니다.
- child entity 에서는 `{ create; }` 를 명시하지 않으면 association 을 거친 생성을 실행할 수 없습니다.
- composition 에 들지 않는, 다른 BO 로 가는 association 을 수정하려면 BDEF 에 `{ create; }` 를 반드시 적어야 합니다. 이때 association `_assoc` 의 동작이 다른 BDEF 에 알맞게 정의되어 있어야 합니다.
- 읽기는 composition 에서 기본으로 켜져 있고 끌 수 없습니다. association 을 거친 읽기도 composition 에서는 따로 적지 않아도 켜져 있지만, `association _assoc;` 를 적어 두기를 권장합니다.
- composition 트리에 들지 않는 다른 BO 로 가는 association 을 읽으려면 BDEF 에 `association` 을 명시해야 합니다.

### action 과 function

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `ACTION IMPORT` | action 의 입력 매개변수를 담습니다. | BDEF 에 action 이 정의되어 있어야 합니다. | `%cid`, `%cid_ref`, `%key`, `%param`, `%pky`, `%tky` |
| `ACTION RESULT` | action 의 결과를 담습니다. | BDEF 에서 action 에 결과 매개변수를 정의했을 때만 쓸 수 있습니다. | `%cid`, `%cid_ref`, `%key`, `%param`, `%pky`, `%tky` |
| `FUNCTION IMPORT` | function 의 입력 매개변수를 담습니다. | BDEF 에 function 이 정의되어 있어야 합니다. | `%cid`, `%key`, `%param`, `%pky`, `%tky` |
| `FUNCTION RESULT` | function 의 결과를 담습니다. | BDEF 에서 function 에 결과 매개변수를 정의했을 때만 쓸 수 있습니다. | `%cid`, `%key`, `%param`, `%pky`, `%tky` |

네 변형 모두 action 이나 function 을 어떻게 정의했는지에 따라 위 구성요소 가운데 일부만 있습니다. 예를 들어 `ACTION IMPORT` 의 `%param` 은 action 에 `parameter` 를 적었을 때만 있습니다. `ACTION RESULT` 의 `%param` 은 결과를 담는 구성요소라서, 입력 매개변수가 있는지와는 상관없습니다.

### 응답

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `FAILED`<br>`FAILED EARLY`<br>`FAILED LATE` | response parameter(응답 매개변수)입니다. RAP 작업에서 오류가 난 데이터를 알아볼 정보를 담습니다. | entity 의 동작이 BDEF 에 정의되어 있어야 합니다. | `%action`, `%assoc`, `%cid`, `%create`, `%delete`, `%fail`, `%key`, `%op`, `%pky`, `%tky`, `%update`. BDEF 에 따라 일부만 있습니다. `LATE` 에는 `%cid` 가 없습니다. |
| `MAPPED`<br>`MAPPED EARLY`<br>`MAPPED LATE` | response parameter 입니다. 인스턴스의 mapping 정보를 담습니다. 예를 들어 넘겨받은 `%cid` 에 어떤 키 값이 만들어졌는지입니다. | entity 의 동작이 BDEF 에 정의되어 있어야 합니다. | `EARLY` 또는 추가 구문 없음 : `%cid`, `%key`, `%pid`, `%pky`, `%tky`<br>`LATE` : `%key`, `%pid`, `%pre`, `%tmp`<br>상황에 따라 일부만 있습니다. |
| `REPORTED`<br>`REPORTED EARLY`<br>`REPORTED LATE` | response parameter 입니다. 오류 메시지 같은 메시지를 주고받습니다. BDEF 에 정의한 entity 별 메시지와, 특정 entity 에 딸리지 않은 메시지를 담습니다. | entity 의 동작이 BDEF 에 정의되어 있어야 합니다. | `%action`, `%cid`, `%create`, `%element`, `%delete`, `%global`, `%key`, `%msg`, `%op`, `%path`, `%pky`, `%state_area`, `%tky`, `%update`. `LATE` 에는 `%cid` 가 없습니다. |

세 변형 모두 `EARLY` 를 붙이거나 아무것도 붙이지 않으면 interaction phase(상호작용 단계)에, `LATE` 를 붙이면 저장 단계에 해당합니다. 자세한 내용은 [[abapeml_response]] 와 [[abaptype_response_for]] 에 있습니다.

### determination, validation, event

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `DETERMINATION` | determination 과 그 handler method 의 입력 매개변수입니다. 어떤 인스턴스에 determination 을 실행할지 키로 알려 줍니다. | BDEF 에 determination 이 정의되어 있어야 합니다. | `%key`, `%pky`, `%tky` |
| `VALIDATION` | validation 과 그 handler method 의 입력 매개변수입니다. 어떤 인스턴스를 검증할지 키로 알려 줍니다. | BDEF 에 validation 이 정의되어 있어야 합니다. | `%key`, `%pky`, `%tky` |
| `EVENT` | RAP entity event 에서 `RAISE ENTITY EVENT` 문과 함께 씁니다. | event `evt` 가 BDEF 나 BDEF extension(확장)에 정의되어 있어야 합니다. 매개변수는 있어도 되고 없어도 됩니다. | `%key`. event 에 매개변수가 있으면 `%param` 도 있습니다. |

`DETERMINATION` 과 `VALIDATION` 은 구현 클래스 밖에서 접근할 수 없습니다.

### 권한, feature control, 허용 정보

모두 EML `GET PERMISSIONS` 문과 얽힌 타입입니다. `INSTANCE` 는 적어도 되고 빼도 됩니다. 뜻은 같습니다.

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `[INSTANCE] AUTHORIZATION KEY` | `GET PERMISSIONS` 문을 처리하는 handler method 에서 instance 권한 정보를 구할 때 씁니다. 지정한 인스턴스 키가 handler method 의 입력 매개변수가 됩니다. 어느 인스턴스의 권한 정보를 구할지 정합니다. | BDEF 에 `authorization master` 나 `authorization dependent` 로 권한 확인이 정의되어 있어야 합니다. | `%key`, `%pky`, `%tky` |
| `[INSTANCE] AUTHORIZATION RESULT` | 같은 handler method 의 결과입니다. 키와 요청 매개변수에 따라 구한 권한 정보가 들어 있습니다. | 위와 같습니다. | `%action`, `%assoc`, `%delete`, `%key`, `%op`, `%pky`, `%tky`, `%update` |
| `[INSTANCE] FEATURES KEY` | `GET PERMISSIONS` 문을 처리하는 handler method 에서 instance feature control(기능 제어) 정보를 구할 때 씁니다. 지정한 인스턴스 키가 handler method 의 입력 매개변수가 됩니다. 어느 인스턴스의 feature control 정보를 구할지 정합니다. | BDEF 에 `features:instance` 속성이 적혀 있어야 합니다. | `%key`, `%pky`, `%tky` |
| `[INSTANCE] FEATURES RESULT` | 같은 handler method 의 결과입니다. 키와 요청 매개변수에 따라 구한 instance feature control 정보가 들어 있습니다. | 위와 같습니다. | `%action`, `%assoc`, `%delete`, `%features`, `%field`, `%key`, `%pky`, `%tky`, `%update`. BDEF 에 따라 일부만 있습니다. |
| `PERMISSIONS KEY` | `GET PERMISSIONS` 문에서 어느 인스턴스의 허용 정보를 구할지 키로 지정합니다. 이 키는 그 handler method 의 입력 매개변수가 됩니다. | - | `%key`, `%pky`, `%tky` |

### 저장, 잠금, deep parameter

| 변형 | 쓰임 | BDEF 조건 | 구성요소 |
| --- | --- | --- | --- |
| `CHANGE` | saver method(세이버 메서드) `save_modified` 에서만 씁니다. `save_modified` 는 `CL_ABAP_BEHAVIOR_SAVER` 를 상속한 로컬 saver class(세이버 클래스)에 있고, additional save 나 unmanaged save 를 쓰는 managed 구현에서만 나옵니다. `TYPE REQUEST FOR CHANGE` 타입인 `create` 와 `update` 구조 안에 이 타입의 테이블이 들어 있습니다. | additional save 나 unmanaged save 가 걸려 있어야 합니다([[abenbdl_saving]]). | `%control`, `%data`, `%key`. 구현 클래스 밖에서는 접근할 수 없습니다. |
| `KEY OF` | 예를 들어 EML `SET LOCKS` 문에서 잠글 인스턴스를 지정할 때 씁니다. additional save 나 unmanaged save 를 쓰는 managed RAP BO 에서 `TYPE REQUEST FOR DELETE` 구조 안에 든 테이블도 이 타입입니다. | [[abenbdl_locking]] 과 [[abenbdl_saving]] 참고 | 키 필드 자체입니다(`%key` 가 아닙니다). `%is_draft` 와 `%pid` 는 들어갈 수 없습니다. |
| `HIERARCHY` | action·function 의 deep parameter 와 deep result 에 씁니다. abstract BDEF 에서만 쓸 수 있습니다. | 아래 참고 | 아래 참고 |

**`HIERARCHY` 의 조건과 구성요소**

- abstract entity 에 동작이 정의되어 있어야 합니다. 곧 BDEF 에 `with hierarchy;` 가 있어야 합니다([[abenbdl_bdef_abstract_header]]).
- abstract 가 아닌 BDEF 쪽에는 deep parameter 나 deep result 를 쓰는 action 이나 function 이 정의되어 있어야 합니다. `deep parameter` 를 쓰면 입력 매개변수를 구조로, `deep table parameter` 를 쓰면 테이블로 해석합니다([[abenbdl_action_input_param]]).
- 타입에는 entity 의 모든 필드가 들어 있습니다. composition 이 있으면 composition 마다 구성요소가 하나씩 더 있고, 그 안에 다시 하위 구성요소가 있습니다. 필드는 모두 원래 타입을 그대로 가집니다.
- abstract entity 의 BDEF 에 composition 의 behavior definition(동작 정의)가 들어 있으면 구성요소가 더 생깁니다. composition 의 카디널리티가 1 이하이면 구조이고, 그렇지 않으면 테이블입니다.
- abstract entity 의 동작을 `with control` 로 정의하면 `%control` 도 구성요소로 들어갑니다([[abenbdl_define_beh_abstract]]). 원문은 `%control` 안에 abstract entity 의 모든 필드와, composition 이 있으면 그에 해당하는 구조나 내부 테이블이 있다고 설명합니다. 하지만 원문 예제([[abenderived_type_hierarchy_abexa]])는 composition 에 해당하는 `%control` 구성요소에도 필드와 똑같이 `if_abap_behv=>mk-on` 값 하나를 넣습니다. 자식 필드의 표시는 자식 구조나 자식 테이블 줄에 있는 `%control` 에서 따로 켭니다.
- deep parameter 나 deep result 를 쓰는 action 과 function 에서 `%param` 의 하위 구성요소가 이 타입입니다([[abapderived_types_param]]).

## 예제

BDEF derived type(BDEF 파생 타입)으로 테이블을 선언하고 EML 문에 넘깁니다. behavior pool(동작 풀) 밖이므로 entity 의 전체 이름을 씁니다.

```abap
" standard operation
DATA lt_create  TYPE TABLE FOR CREATE zr_travel.
DATA lt_update  TYPE TABLE FOR UPDATE zr_travel.
DATA lt_delete  TYPE TABLE FOR DELETE zr_travel.

" association 을 거친 생성, child entity
DATA lt_cba     TYPE TABLE FOR CREATE zr_travel\_booking.
DATA lt_booking TYPE TABLE FOR UPDATE zr_travel\\booking.

" 읽기, action, 응답
DATA lt_read    TYPE TABLE FOR READ IMPORT zr_travel.
DATA lt_result  TYPE TABLE FOR READ RESULT zr_travel.
DATA lt_accept  TYPE TABLE FOR ACTION IMPORT zr_travel~accepttravel.
DATA lt_failed  TYPE TABLE FOR FAILED zr_travel.

lt_create = VALUE #( ( %cid       = 'cid1'
                       travelid   = '00000001'
                       agencyid   = '070001'
                       customerid = '000010'
                       %control   = VALUE #( travelid   = if_abap_behv=>mk-on
                                             agencyid   = if_abap_behv=>mk-on
                                             customerid = if_abap_behv=>mk-on ) ) ).

MODIFY ENTITIES OF zr_travel
  ENTITY Travel
    CREATE FROM lt_create
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

lt_read = VALUE #( ( travelid = '00000001' ) ).

READ ENTITIES OF zr_travel
  ENTITY Travel
    ALL FIELDS WITH lt_read
  RESULT lt_result.
```

## 알아두기

- 다음 타입은 구현 클래스와 ABP 보조 클래스 안에서만 선언하고 쓸 수 있습니다. 밖에서는 쓸 수 없습니다 : `FOR CHANGE`, `FOR DETERMINATION`, `FOR VALIDATION`, `FOR ... FEATURES`, `FOR ... AUTHORIZATION`.
- 표에 적은 구성요소 말고 더 있을 수 있습니다. 상황에 따라 달라집니다. 예를 들어 draft 표시 `%is_draft` 는 draft 를 쓸 때만, `%pid` 는 late numbering 을 쓸 때만 있습니다.
- 어떤 구성요소가 있는지는 ADT 에서 그 타입의 변수에 커서를 두고 F2 를 누르면 볼 수 있습니다.
- ADT 의 코드 완성 기능이 `%` 구성요소와 필드 이름을 보여 주므로, 기반 CDS 뷰의 필드 이름을 외우지 않아도 됩니다.
- 구성요소 하나하나의 뜻은 [[abapderived_types_comp]] 에, BDEF 쪽 정의는 [[abenbdl]] 의 하위 항목에 있습니다.

## 관련 항목

- [[abaptype_structure_for]]
- [[abaptype_response_for]]
- [[abaptype_request_for]]
- [[abapderived_types_comp]]
- [[abapderived_types_secondary_keys]]
- [[abapderived_types_declaration]]
- [[abenrap_additional_save_abexa]]
- [[abenrap_managed_unm_save_abexa]]
- [[abenderived_type_hierarchy_abexa]]
