---
title: MODIFY ENTITY, ENTITIES 의 필드 지정 (field_spec)
summary: 변경 작업에 넘길 인스턴스와 필드를 정하는 FROM, FIELDS ( ) WITH, SET FIELDS WITH, AUTO FILL CID 의 차이와 쓰는 법을 설명합니다.
keywords: field_spec, FROM, FIELDS WITH, SET FIELDS WITH, AUTO FILL CID, fields_tab, %control, %cid, %cid_ref, %target, 필드 지정, SETFIELDS_OK, BEHAVIOR_RESERVED_PREFIX, %ABAP_EML_CID__
---

## 문법

```syntax
...  { FROM fields_tab }
   | { AUTO FILL CID WITH fields_tab }
   | { [AUTO FILL CID] FIELDS ( comp1 comp2 ... ) WITH fields_tab }
   | { [AUTO FILL CID] SET FIELDS WITH fields_tab } ...
```

## 설명

`field_spec` 은 변경 작업에 넘길 입력값을 정하는 부분입니다. 입력값은 내부 테이블 [[abapeml_fields_tab|fields_tab]] 에 담습니다. 이 테이블은 작업에 맞는 BDEF derived type(BDEF 파생 타입)이어야 하고, 작업과 쓰는 법에 따라 `%cid`, `%control` 같은 [[abapderived_types_comp|특수 구성요소]]가 들어 있습니다.

네 가지 쓰는 법의 핵심 차이는 **`%control` 을 누가 채우느냐**입니다. `%control` 은 필드마다 "이 필드를 넘긴다"는 표시를 담는 구조입니다.

| 쓰는 법 | `%control` | 쓸 수 있는 작업 |
| --- | --- | --- |
| `FROM` | 직접 채움 | 모든 작업 |
| `AUTO FILL CID WITH` | 직접 채움 | `CREATE`, `CREATE BY` |
| `FIELDS ( ... ) WITH` | 자동 | `CREATE`, `CREATE BY`, `UPDATE` |
| `SET FIELDS WITH` | 자동 | `CREATE`, `CREATE BY`, `UPDATE` |

`DELETE` 와 `EXECUTE` 에는 대부분 `FROM` 만 쓸 수 있습니다.

작업마다 필요한 테이블 타입과 구성요소는 다음과 같습니다. `bdef` 는 root entity(루트 엔터티) 이름, `_assoc` 는 root entity 의 기반 CDS 뷰에 정의된 association 이름, `action` 은 BDEF 에 선언한 action 이름입니다.

| 작업 | 쓸 수 있는 형태 | `fields_tab` 의 타입 | 구성요소 |
| --- | --- | --- | --- |
| `CREATE` | `FROM`, `AUTO FILL CID WITH`, `FIELDS (...) WITH`, `SET FIELDS WITH` | `TABLE FOR CREATE bdef` | `%cid`, `%control`, `%data`, `%key` |
| `CREATE BY _assoc` | `FROM`, `AUTO FILL CID WITH`, `FIELDS (...) WITH`, `SET FIELDS WITH` | `TABLE FOR CREATE bdef\_assoc` | `%cid_ref`, `%key`, `%pky`, `%target`, `%tky` |
| `UPDATE` | `FROM`, `FIELDS (...) WITH`, `SET FIELDS WITH` | `TABLE FOR UPDATE bdef` | `%cid_ref`, `%control`, `%data`, `%key`, `%pky`, `%tky` |
| `DELETE` | `FROM` | `TABLE FOR DELETE bdef` | `%cid_ref`, `%key`, `%pky`, `%tky` |
| `EXECUTE` | `FROM` | `TABLE FOR ACTION IMPORT bdef~action` | `%cid_ref`, `%key`, `%param`, `%pky`, `%tky` |

`FROM` 과 `AUTO FILL CID WITH` 를 쓰면 `CREATE` 와 `UPDATE` 에서는 `%control` 을, `CREATE BY` 에서는 `%target` 안의 `%control` 을 직접 채워야 합니다. 구성요소는 상황에 따라 더 있을 수 있습니다. 예를 들어 `%is_draft` 는 [[abenbdl_with_draft|draft]] 를 쓸 때만, `%pid` 는 [[abenbdl_late_numbering|late numbering]] 일 때만 있습니다.

### FROM fields_tab

`fields_tab` 에 담긴 내용을 그대로 넘깁니다. 모든 작업에 쓸 수 있습니다.

- `CREATE`, `CREATE BY`, `UPDATE` 에서는 `%control` 을 직접 채워야 합니다. 그래서 다른 형태보다 코드가 길어집니다.
- `fields_tab` 은 읽기만 하는 자리입니다.
- 정적으로 readonly 인 필드를 문법 검사로 잡아내지 못합니다.
- 필드에 초기값(빈 값)을 넣을 수 있습니다.

### AUTO FILL CID WITH fields_tab

`FROM` 에 `AUTO FILL CID` 를 더한 형태입니다. 이때는 `FROM` 자리에 `WITH` 를 씁니다. `%control` 은 직접 채워야 합니다. `CREATE` 와 `CREATE BY` 에 쓸 수 있습니다.

### FIELDS ( comp1 comp2 ... ) WITH fields_tab

작업에 넘길 필드를 괄호 안에 적습니다. `FROM` 을 편하게 쓰려고 만든 줄임 형태입니다.

- 필드는 entity(엔터티)의 어느 필드든 됩니다. 적어도 하나는 적어야 합니다. 쉼표 없이 띄어 쓰고, 순서는 상관없습니다.
- `%control` 은 자동으로 채워집니다. 괄호 안에 적은 필드는 16진수 01, 적지 않은 필드는 00 이 됩니다.
- `%control` 을 문장이 채우므로 `fields_tab` 은 읽는 자리이면서 쓰는 자리입니다.
- 괄호 안에 적은 필드가 정적으로 readonly 인지 문법 검사로 확인합니다.
- 필드에 초기값을 넣을 수 있습니다.
- 괄호 안에 적지 않은 필드는 `fields_tab` 에 값을 넣어 두었어도 무시됩니다. 만들어진 인스턴스에서는 초기값으로 남습니다.
- 원문은 키도 마찬가지라고 설명합니다. 괄호 안에 키를 적지 않으면 테이블에 키 값이 있어도 키의 초기값으로 작업합니다. 괄호 안에 키를 적었지만 테이블에 값을 넣지 않았을 때도 초기값으로 작업합니다. 원문이 이 설명에 붙인 예제는 `CREATE` 입니다. 반면 원문의 `UPDATE` 예제([[abapmodify_entity_entities_op]])는 괄호 안에 키를 적지 않고, 테이블에 넣은 키 값으로 고칠 인스턴스를 가리킵니다.

### SET FIELDS WITH fields_tab

이것도 `FROM` 의 줄임 형태입니다. `fields_tab` 에 **값이 들어 있는 필드**만 `%control` 에 01 로 표시하고, 나머지는 00 으로 둡니다. `fields_tab` 은 읽는 자리이면서 쓰는 자리입니다.

**쓰지 않는 것이 좋습니다.** 이유는 세 가지입니다.

- 입력이 많으면 매우 느립니다. 그래서 쓰면 문법 경고가 납니다. 경고는 pragma `##SETFIELDS_OK` 로 끌 수 있습니다. `SET FIELDS WITH` 뒤의 테이블을 `VALUE` 생성식으로 바로 적으면 경고가 나지 않습니다.
- 정적으로 readonly 인 필드를 문법 검사로 잡아내지 못합니다.
- 필드에 초기값을 넣을 수 없습니다. 값이 비어 있으면 넘기지 않는 필드로 보기 때문입니다.

### AUTO FILL CID

`%cid` 를 자동으로 채워 줍니다. 다음 작업에 쓸 수 있습니다.

- 생성 (`MODIFY ... CREATE AUTO FILL CID ...`)
- create-by-association (`MODIFY ... CREATE BY \assoc AUTO FILL CID ...`)
- [[abenbdl_action|factory action]] (`MODIFY ... EXECUTE action AUTO FILL CID ...`)
- repeatable action (`repeatable`)

`%cid` 가 비어 있으면 `%ABAP_EML_CID__1`, `%ABAP_EML_CID__2` 처럼 `%ABAP_EML_CID__` 로 시작하는 값이 자동으로 들어갑니다. `%cid` 를 직접 적어 두었다면 직접 적은 값만 쓰입니다.

### deep parameter 에서 FIELDS ( ... ) WITH

`FIELDS ( ... ) WITH` 는 action 이나 function 의 [[abenbdl_action_input_param|deep parameter]] 에서도 `%control` 을 채워 줍니다. 조건이 있습니다. 매개변수인 CDS abstract entity 의 behavior definition(동작 정의)에 [[abenbdl_bdef_abstract_header|with hierarchy;]] 가 있고, composition 트리의 노드 하나 이상이 [[abenbdl_define_beh_abstract|define behavior for ... with control]] 로 정의돼 있어야 합니다.

이때 연관된 abstract entity `_ent` 뒤에 괄호를 한 번 더 써서 하위 구성요소만 표시할 수 있습니다. `a` 는 부모 abstract entity 의 필드, `b` 는 `_ent` 안의 구성요소입니다. 표시는 [[abapderived_types_param|%param]] 안의 `%control` 에 들어갑니다.

| 적는 법 | `%param-%control-a` | `%param-%control-_ent` | `%param-_ent-%control-b` |
| --- | --- | --- | --- |
| `FIELDS ( a _ent ) WITH` | on | on | off |
| `FIELDS ( a _ent ( b ) ) WITH` | on | off | on |
| `FIELDS ( a _ent +( b ) ) WITH` | on | on | on |

괄호만 쓰면 `_ent` 자신은 표시하지 않고 하위 구성요소만 표시합니다. 괄호 앞에 `+` 를 붙이면 `_ent` 자신도 함께 표시합니다. SAP 예제 클래스 `CL_DEMO_RAP_EML_DEEP_PARA_FLDS` 가 이 차이를 action 으로 보여 줍니다.

## 예제

같은 생성 작업을 `FROM` 과 `FIELDS ( ... ) WITH` 로 써 봅니다. `FROM` 은 넘길 필드마다 `%control` 을 on 으로 해야 합니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FROM VALUE #(
    ( %cid = 'cid1'
      travelid = '00000001'  %control-travelid = if_abap_behv=>mk-on
      agencyid = '070001'    %control-agencyid = if_abap_behv=>mk-on ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 같은 일을 FIELDS ( ... ) WITH 로. %control 은 문장이 채운다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #( ( %cid = 'cid2' travelid = '00000002' agencyid = '070001' ) )
  FAILED   ls_failed
  REPORTED ls_reported.
```

괄호 안에 적지 않은 필드는 값을 넣어도 넘어가지 않습니다. 아래에서 `CustomerID` 와 `Status` 는 테이블에 값이 있지만 만들어진 여행에서는 비어 있습니다.

```abap
DATA lt_create TYPE TABLE FOR CREATE zr_travel.

lt_create = VALUE #( ( %cid = 'cid3' travelid = '00000003' agencyid = '070001'
                       customerid = '000011' status = 'O' ) ).

MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid ) WITH lt_create
  FAILED   ls_failed
  REPORTED ls_reported.
```

`AUTO FILL CID` 로 `%cid` 를 맡기고 예약을 만듭니다. 부모 여행은 이미 있는 것이라 키로 가리킵니다.

```abap
MODIFY ENTITY zr_travel
  CREATE BY \_booking AUTO FILL CID
  FIELDS ( bookingid flightprice )
  WITH VALUE #(
    ( travelid = '00000001'
      %target  = VALUE #( ( bookingid = '0001' flightprice = '500.00' )
                          ( bookingid = '0002' flightprice = '320.00' ) ) ) )
  MAPPED DATA(ls_mapped).
```

## 알아두기

- `%cid_ref` 를 쓸 수 있는 작업에서는, `%cid_ref` 로 인스턴스를 분명히 가리키면 키를 적지 않아도 됩니다.
- 생성과 create-by-association 에서는 RAP BO consumer(사용자)가 `%cid` 를 쓸 일이 없어도 `%cid` 를 지정하는 것이 좋습니다. 특히 [[abenbdl_early_numb|early numbering]] 과 [[abenbdl_late_numbering|late numbering]] 에서는 문제를 피하려면 꼭 지정해야 합니다.
- `%cid_ref` 로 가리킬 인스턴스의 `%cid` 는 직접 적어야 합니다. 자동으로 만들어진 `%cid` 는 `%cid_ref` 로 가리킬 수 없습니다.
- `AUTO FILL CID` 를 쓸 때 `%cid` 에 대문자 `%ABAP_EML_CID__` 로 시작하는 값을 직접 넣으면 런타임 오류 `BEHAVIOR_RESERVED_PREFIX` 가 납니다.
- `FIELDS ( ... ) WITH` 와 `SET FIELDS WITH` 는 `DELETE` 에 쓸 수 없습니다. `EXECUTE` 에는 BDEF 에서 action 을 `deep [table] parameter`([[abenbdl_action_input_param|deep parameter]])로 선언하고 [[abenbdl_action_output_para|selective]] 를 쓰지 않았을 때만 쓸 수 있습니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_AUTO_FILL_CID` 는 `%cid` 를 직접 적은 경우와 `AUTO FILL CID` 로 맡긴 경우를 나란히 보여 줍니다. [[abapeml_response|MAPPED 응답]]과 [[abapcommit_entities|COMMIT ENTITIES]] 뒤에 저장된 인스턴스를 출력합니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_op]]
- [[abapeml_fields_tab]]
- [[abapderived_types_comp]]
- [[abapread_entity_entities_fields]]
- [[abeneml_modify_op_fields_abexa]]
- [[abapeml_modify_examples_abexas]]
