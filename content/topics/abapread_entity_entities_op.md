---
title: READ ENTITY, ENTITIES 의 작업 (operations)
summary: EML READ 문의 세 가지 작업인 바로 읽기, read-by-association(BY \_assoc), function 실행(EXECUTE)과 RESULT, LINK, REQUEST 추가 구문을 설명합니다.
keywords: READ, BY, read-by-association, 연관 관계로 읽기, EXECUTE, function, 함수 실행, RESULT, LINK, REQUEST, TABLE FOR READ LINK, TYPE STRUCTURE FOR FUNCTION REQUEST, result selective, operations
---

## 문법

```syntax
... [field_spec RESULT result_tab]
    [BY \_assoc field_spec { {RESULT result_tab} | {LINK link_tab} }
                           | {RESULT result_tab LINK link_tab} ]
    [EXECUTE function field_spec [REQUEST request] RESULT result_tab ] ...
```

## 설명

EML `READ` 문에는 세 가지 작업이 있습니다.

| 작업 | 하는 일 |
| --- | --- |
| 바로 읽기 | entity(엔터티)의 키 필드로 인스턴스를 읽습니다. |
| read-by-association (`BY \_assoc`) | parent entity(부모 엔터티)의 키로 child entity(자식 엔터티)를 읽습니다. 자식에서 부모를 읽을 수도 있지만 구현 클래스 안에서만 됩니다. |
| function 실행 (`EXECUTE`) | 직접 만든 읽기 작업을 실행합니다. 예를 들어 매개변수가 필요할 때 씁니다. |

세 작업 모두 입력값을 담은 내부 테이블이 필요합니다. 이 부분이 `field_spec` 이고, 모든 필드를 읽을지 몇몇 필드만 읽을지도 여기서 정합니다. 쓰는 법은 [[abapread_entity_entities_fields]] 에서 설명합니다.

읽기 작업에는 언제나 결과가 있고, 결과는 내부 테이블 [[abapeml_result|result_tab]] 에 담깁니다. read-by-association 만은 결과 대신 연결된 키만 받을 수도 있고, 둘 다 받을 수도 있습니다.

### 바로 읽기

root entity(루트 엔터티)든 child entity 든 RAP BO entity 에서 바로 읽습니다. `field_spec` 뒤에 꼭 적어야 하는 것은 `RESULT` 하나입니다. `result_tab` 은 읽기 작업의 종류에 맞는 BDEF derived type(BDEF 파생 타입)이어야 합니다.

### read-by-association

parent entity 의 키로 연관된 entity 의 인스턴스를 읽습니다. `_assoc` 는 기반 CDS 뷰에 정의된 association 이름입니다.

- composition 트리 안의 child entity 뿐 아니라, 트리에 들어 있지 않은 다른 BO 의 entity 도 읽을 수 있습니다.
- 읽으려는 child entity 는 같은 BDEF 에 정의돼 있어야 합니다.
- 다른 BO 의 entity 를 읽으려면 그 entity 의 동작이 다른 BDEF 에 정의돼 있어야 합니다.
- child entity 에서 parent entity 를 읽을 수도 있습니다. 구현 클래스 안에서만 됩니다.

받는 것은 `RESULT` 와 `LINK` 가운데 하나 또는 둘 다입니다.

- `RESULT result_tab` : 대상 인스턴스의 데이터를 받습니다.
- `LINK link_tab` : 원본 키와 대상 키의 짝을 받습니다. 원본은 부모이고, 자식에서 부모를 읽을 때는 자식입니다. 대상은 연관된 entity 입니다. 두 키는 중첩 구조로 들어 있습니다. `link_tab` 은 BDEF derived type [[abaptype_table_for|TYPE TABLE FOR READ LINK]] 로 선언합니다.

### function 실행

`EXECUTE` 는 RAP [[abenbdl_function|function]] 을 불러 readonly 작업을 실행합니다. managed 든 unmanaged 든 function 은 behavior pool(동작 풀)에 직접 구현해야 합니다. `field_spec` 으로 입력값을 넘기고 `RESULT result_tab` 으로 결과를 받습니다.

- `REQUEST request` : 결과를 전부 돌려받을지 일부(예: 키만)만 돌려받을지 정합니다. 성능을 높이려고 씁니다. `request` 는 BDEF derived type `TYPE STRUCTURE FOR FUNCTION REQUEST` 로 선언합니다. 구성요소는 entity 의 키 필드와 데이터 필드 전부이고 타입은 `ABP_BEHV_FLAG` 입니다. 돌려받을 필드에 표시를 켭니다.
- `REQUEST` 는 BDEF 에서 [[abenbdl_action_output_para|result selective]] 로 선언한 function 에만 쓸 수 있습니다.

## 예제

여행을 바로 읽고, 그 여행의 예약을 association 으로 읽으면서 데이터와 키 짝을 함께 받습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    " 바로 읽기
    FIELDS ( agencyid customerid status )
    WITH VALUE #( ( travelid = '00000001' ) )
    RESULT DATA(lt_travel)
  ENTITY travel
    " read-by-association: BY 뒤에 백슬래시와 association 이름
    BY \_booking
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' ) )
    RESULT DATA(lt_booking)
    LINK   DATA(lt_link)
  FAILED DATA(ls_failed).

" lt_link 의 한 줄: source 에 여행 키, target 에 예약 키
```

function `getOverview` 를 실행합니다. BDEF 에 `function getOverview result selective [1] $self;` 로 선언돼 있다고 보고, `REQUEST` 로 돌려받을 필드를 줄였습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR FUNCTION REQUEST zr_travel~getoverview.

ls_request = VALUE #( travelid   = if_abap_behv=>mk-on
                      totalprice = if_abap_behv=>mk-on ).

READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE getoverview
    FROM VALUE #( ( travelid = '00000001' ) )
    REQUEST ls_request
    RESULT DATA(lt_result)
  FAILED   DATA(ls_func_failed)
  REPORTED DATA(ls_func_reported).
```

## 알아두기

- `BY` 뒤에 백슬래시(`\`)를 먼저 넣어야 코드 완성에 association 이 나옵니다.
- read-by-association 에는 `RESULT` 나 `LINK` 가운데 적어도 하나가 있어야 합니다.
- RAP key function 을 EML `READ` 문으로 쓰는 방법은 정적 RAP function 을 쓰는 방법과 같습니다.
- RAP key function 에는 BDEF 에 결과를 따로 적지 않았어도 `REQUEST` 를 쓸 수 있습니다. key function 은 `result selective [1] $self` 로 선언된 것으로 보기 때문입니다.
- RAP BO provider(제공자)와 consumer(사용자)가 EML 문을 쓸 때 지켜야 할 규칙은 ABAP RESTful Application Programming Model 개발 안내서의 "RAP Business Object Contract" 단락에 있습니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_entities_fields]]
- [[abapeml_result]]
- [[abenbdl_function]]
- [[abaphandler_meth_read]]
- [[abeneml_read_op_fields_abexa]]
- [[abeneml_read_op_func_abexa]]
- [[abapeml_read_examples_abexas]]
