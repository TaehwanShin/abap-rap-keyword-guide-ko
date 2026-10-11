---
title: READ ENTITY, ENTITIES 의 필드 지정 (field_spec)
summary: 읽을 인스턴스와 필드를 정하는 FROM, FIELDS ( ) WITH, ALL FIELDS WITH 세 가지 방법의 차이와 쓰는 법을 설명합니다.
keywords: field_spec, FROM, FIELDS WITH, ALL FIELDS WITH, fields_tab, %control, %key, %tky, TABLE FOR READ IMPORT, TABLE FOR FUNCTION IMPORT, 필드 지정, 읽을 필드
---

## 문법

```syntax
...  { FROM fields_tab }
   | { FIELDS ( comp1 comp2 ... ) WITH fields_tab }
   | { ALL FIELDS WITH fields_tab } ...
```

## 설명

`field_spec` 은 읽기 작업에 넘길 입력값을 정하는 부분입니다. 어떤 인스턴스를 읽을지(키)와 어떤 필드를 읽을지를 여기서 정합니다. 입력값은 내부 테이블 [[abapeml_fields_tab|fields_tab]] 에 담습니다. 이 테이블은 작업에 맞는 BDEF derived type(BDEF 파생 타입)이어야 하고, 작업과 쓰는 법에 따라 `%control` 같은 [[abapderived_types_comp|특수 구성요소]]가 들어 있습니다.

세 가지 방법의 차이는 **읽을 필드 표시(`%control`)를 누가 채우느냐**입니다.

| 방법 | `%control` | 읽는 필드 |
| --- | --- | --- |
| `FROM` | 직접 채움 | `%control` 에서 켠 필드 |
| `FIELDS ( ... ) WITH` | 자동 | 괄호 안에 적은 필드 |
| `ALL FIELDS WITH` | 자동 | 모든 필드 |

바로 읽기와 read-by-association 에는 세 가지를 모두 쓸 수 있습니다. function 을 실행하는 읽기(`EXECUTE`)에는 대부분 `FROM` 만 쓸 수 있습니다.

작업마다 필요한 테이블 타입과 구성요소는 다음과 같습니다. `bdef` 는 root entity(루트 엔터티) 이름, `_assoc` 는 root entity 의 기반 CDS 뷰에 정의된 association 이름, `function` 은 BDEF 에 선언한 function 이름입니다.

| 작업 | 쓸 수 있는 형태 | `fields_tab` 의 타입 | 구성요소 |
| --- | --- | --- | --- |
| 바로 읽기 | `FROM`, `FIELDS (...) WITH`, `ALL FIELDS WITH` | `TYPE TABLE FOR READ IMPORT bdef` | `%control`, `%key`, `%pky`, `%tky` |
| read-by-association (`BY \_assoc`) | `FROM`, `FIELDS (...) WITH`, `ALL FIELDS WITH` | `TYPE TABLE FOR READ IMPORT bdef\_assoc` | `%control`, `%key`, `%pky`, `%tky` |
| function 실행 (`EXECUTE`) | `FROM` | `TYPE TABLE FOR FUNCTION IMPORT bdef~function` | `%key`, `%pky`, `%tky` |

구성요소는 상황에 따라 더 있을 수 있습니다. 예를 들어 draft 표시 `%is_draft` 는 draft 를 쓸 때만, `%pid` 는 late numbering 일 때만 있습니다.

### FROM fields_tab

`fields_tab` 에 담긴 내용을 그대로 넘깁니다. 모든 작업에 쓸 수 있습니다.

- [[abapderived_types_comp|%control]] 을 `fields_tab` 에 직접 채워야 합니다.
- `fields_tab` 은 읽기만 하는 자리입니다.
- managed 에서는 키 필드의 [[abapderived_types_control|%control]] 표시를 켜지 않아도 됩니다. 돌아오는 인스턴스에는 키 값이 들어 있습니다.

### FIELDS ( comp1 comp2 ... ) WITH fields_tab

돌려받을 필드를 `FIELDS` 뒤 괄호 안에 적습니다. `FROM` 을 편하게 쓰려고 만든 줄임 형태입니다.

- 필드는 entity(엔터티)의 어느 필드든 됩니다. 적어도 하나는 적어야 합니다. 쉼표 없이 띄어 쓰고, 순서는 상관없습니다.
- 키 필드는 적어도 되고 안 적어도 됩니다. 적지 않아도 기본으로 읽어 돌려줍니다.
- 괄호 안의 순서와 상관없이, 결과 테이블의 열 순서는 데이터베이스 테이블의 순서를 따릅니다.
- `%control` 은 자동으로 채워집니다. 그래서 `fields_tab` 은 읽는 자리이면서 쓰는 자리입니다.
- 컴파일러의 정적 검사와 코드 완성을 쓸 수 있다는 것이 장점입니다. 예를 들어 `readonly`, `mandatory` 같은 static field characteristics(필드 특성)이 반영됩니다.

### ALL FIELDS WITH fields_tab

`fields_tab` 에 담긴 입력값에 따라 인스턴스의 **모든 필드**를 읽습니다. 이것도 `FROM` 의 줄임 형태입니다.

- `%control` 은 자동으로 채워집니다. `fields_tab` 은 읽는 자리이면서 쓰는 자리입니다.
- `EXECUTE` 에는 쓸 수 없습니다.

### deep parameter 에서 FIELDS ( ... ) WITH

`FIELDS ( ... ) WITH` 는 action 이나 function 의 [[abenbdl_action_input_param|deep parameter]] 에서도 `%control` 을 채워 줍니다. 조건이 있습니다. 매개변수인 CDS abstract entity 의 behavior definition(동작 정의)에 [[abenbdl_bdef_abstract_header|with hierarchy;]] 가 있고, composition 트리의 노드 하나 이상이 [[abenbdl_define_beh_abstract|define behavior for ... with control]] 로 정의돼 있어야 합니다.

이때 연관된 abstract entity `_ent` 뒤에 괄호를 한 번 더 써서 하위 구성요소만 표시할 수 있습니다. `a` 는 부모 abstract entity 의 필드, `b` 는 `_ent` 안의 구성요소입니다. 표시는 [[abapderived_types_param|%param]] 안의 `%control` 에 들어갑니다.

| 적는 법 | `%param-%control-a` | `%param-%control-_ent` | `%param-_ent-%control-b` |
| --- | --- | --- | --- |
| `FIELDS ( a _ent ) WITH` | 켜짐 | 켜짐 | 꺼짐 |
| `FIELDS ( a _ent ( b ) ) WITH` | 켜짐 | 꺼짐 | 켜짐 |
| `FIELDS ( a _ent +( b ) ) WITH` | 켜짐 | 켜짐 | 켜짐 |

괄호만 쓰면 `_ent` 자신은 표시하지 않고 하위 구성요소만 표시합니다. 괄호 앞에 `+` 를 붙이면 `_ent` 자신도 함께 표시합니다. SAP 예제 클래스 `CL_DEMO_RAP_EML_DEEP_PARA_FLDS` 가 이 차이를 action 으로 보여 줍니다.

## 예제

`FROM` 으로 읽습니다. `%control` 에서 켠 `AgencyID`, `Status` 는 요청하고, 꺼 둔 `TotalPrice` 는 요청하지 않습니다.

```abap
READ ENTITY zr_travel
  FROM VALUE #(
    ( travelid = '00000001'
      %control = VALUE #( agencyid   = if_abap_behv=>mk-on
                          status     = if_abap_behv=>mk-on
                          totalprice = if_abap_behv=>mk-off ) ) )
  RESULT DATA(lt_from)
  FAILED DATA(ls_failed).
```

`FIELDS ( ... ) WITH` 로 예약의 몇몇 필드만 association 으로 읽습니다. 예약의 키 필드는 적지 않아도 함께 돌아옵니다.

```abap
READ ENTITY zr_travel
  BY \_booking
  FIELDS ( flightprice currencycode )
  WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_booking)
  FAILED ls_failed.
```

`ALL FIELDS WITH` 로 모든 필드를 읽습니다. handler method(핸들러 메서드) 안에서 넘어온 `keys` 로 읽는 모습입니다.

```abap
READ ENTITIES OF zr_travel IN LOCAL MODE
  ENTITY travel
    ALL FIELDS WITH CORRESPONDING #( keys )
  RESULT DATA(lt_travel).
```

## 알아두기

- `fields_tab` 뒤에는 [[abapeml_result|RESULT]] 를 적어 문장을 마무리합니다. association 으로 읽을 때는 `RESULT` 대신 `LINK` 만 적어도 되고, 둘 다 적어도 됩니다([[abapread_entity_entities_op]]). [[abapeml_response|response parameter]] 도 그 뒤에 적을 수 있습니다.
- `fields_tab` 에는 **키 필드를 모두** 적어야 합니다. 하나라도 빠지면 읽기 작업이 실패합니다.
- association 으로 읽으면 연관된 entity 의 키 필드가 기본으로 모두 돌아옵니다.
- `FIELDS ( ... ) WITH` 와 [[abapmodify_entity_entities_fields|SET FIELDS WITH]] 는 function 을 실행하는 읽기(`EXECUTE`)에는 조건이 맞을 때만 쓸 수 있습니다. BDEF 에서 function 을 `deep [table] parameter`([[abenbdl_action_input_param|deep parameter]])로 선언하고 [[abenbdl_action_output_para|selective]] 를 쓰지 않았을 때입니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_entities_op]]
- [[abapeml_fields_tab]]
- [[abapeml_result]]
- [[abapderived_types_comp]]
- [[abapmodify_entity_entities_fields]]
- [[abeneml_read_op_fields_abexa]]
- [[abapeml_read_examples_abexas]]
