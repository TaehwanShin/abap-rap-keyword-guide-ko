---
title: 필드 사용 표시 (%control)
summary: 필드마다 "이 값은 정말로 넘긴 것이다" 또는 "이 필드를 읽어 달라"를 표시하는 구조입니다. 빈 값이 "지워라"인지 "건드리지 마라"인지 가려 줍니다.
keywords: %control, 필드 표시, control structure, if_abap_behv=>mk-on, mk-off, ABP_BEHV_FLAG, CREATE FROM, UPDATE FROM, SET FIELDS WITH, FIELDS WITH, READ IMPORT, CHANGE, FILLED_COMPONENTS_X, X 구조, BAPI X, 바뀐 필드, 변경 필드, delta update, flag_changed, 왜 쓰나
---

## 설명

`%control` 은 BDEF derived type(BDEF 파생 타입)에 들어 있는 구조형 구성요소입니다. RAP BO 인스턴스의 키 필드와 데이터 필드가 모두 구성요소로 들어 있고, 구성요소마다 값 대신 **표시** 하나(켬 또는 끔)를 담습니다.

### 왜 필요한가

ABAP 구조에서는 필드를 "없는 상태"로 둘 수 없습니다. 값을 넣지 않은 필드에도 초깃값이 들어 있습니다. 그래서 값만 봐서는 다음 두 가지를 가릴 수 없습니다.

- `CustomerID` 가 비어 있다. 고객을 **지워 달라**는 뜻인가?
- `CustomerID` 가 비어 있다. 고객은 **건드리지 말라**는 뜻인가?

여행 한 건의 상태만 `'A'` 로 바꾸는 경우를 생각해 봅니다. 수정할 줄에는 키와 `Status` 만 채웁니다. 이때 `AgencyID`, `CustomerID`, `BeginDate` 같은 나머지 필드는 모두 초깃값입니다. 이 줄을 통째로 반영하면 나머지 필드가 전부 지워집니다. `%control` 은 "이 줄에서 정말로 넘긴 필드는 `Status` 하나"라고 알려 주어 이런 일을 막습니다.

BAPI 를 써 봤다면 **X 구조**와 같은 것입니다. `BAPI_PO_CHANGE` 에 `POHEADER` 와 `POHEADERX` 를 함께 넘기고, 바꿀 필드에만 `'X'` 를 넣던 방식입니다. RAP 에서는 X 구조가 따로 있지 않고, 같은 줄 안에 `%control` 이라는 이름으로 들어 있습니다.

화면에서도 같은 일이 일어납니다. 사용자가 화면에서 필드 하나를 고치면 요청에는 바뀐 필드만 실려 옵니다. RAP 는 이 정보를 `%control` 표시로 바꿔 RAP BO provider(제공자)에 넘깁니다. provider 는 켜진 필드만 고칩니다.

### 작업마다 다른 뜻

| 작업 | 켠 필드 | 끈 필드 |
| --- | --- | --- |
| `CREATE` | 적은 값으로 만듭니다. | 값을 적어도 버립니다. 초깃값으로 만들어집니다. |
| `UPDATE` | 적은 값으로 바꿉니다. 값이 비어 있으면 비웁니다. | 예전 값 그대로 둡니다. |
| `READ` | 읽어서 돌려 달라는 뜻입니다. | 읽지 않아도 됩니다. |

변경 작업([[abapmodify_entity_entities_op]])에서는 "어느 필드에 값을 넘겼는가"이고, 읽기 작업([[abapread_entity_entities]])에서는 "어느 필드를 읽어 달라는가"입니다. 변경 작업의 표시는 RAP BO consumer(사용자)가 채우고 provider 가 읽습니다. 읽기 작업의 표시는 consumer 가 켜서 "이 필드를 돌려 달라"고 알립니다. 둘 다 현재 트랜잭션 안에서만 뜻이 있습니다.

### 언제 신경 써야 하나

대부분은 신경 쓰지 않아도 됩니다. 아래 표에서 "직접 채움"과 "읽어야 함"인 줄만 기억하면 됩니다.

| 하는 일 | `%control` |
| --- | --- |
| EML 로 BO 를 부른다. `FIELDS ( ... ) WITH` 를 쓴다 | 문이 대신 채웁니다. 적지 않습니다. |
| EML 로 BO 를 부른다. `FROM` 을 쓴다 (`CREATE FROM`, `UPDATE FROM`, `READ ... FROM`) | **직접 채웁니다.** |
| managed BO 의 determination, validation 을 구현한다 | 볼 일이 없습니다. 넘어오는 것은 키뿐입니다. |
| unmanaged BO 의 수정 handler method(핸들러 메서드)를 구현한다 ([[abaphandler_meth_modify]]) | **읽어야 합니다.** 켜진 필드만 반영합니다. |
| unmanaged BO 의 읽기 handler method 를 구현한다 ([[abaphandler_meth_read]]) | 읽습니다. 켜진 필드만 채워 돌려주면 됩니다. |
| `save_modified` 에서 저장하거나 변경 기록을 남긴다 ([[abaprap_saver_meth_save_modified]]) | 읽습니다. 이번 트랜잭션에서 바뀐 필드를 알려 줍니다. |
| precheck 에서 요청을 거른다 ([[abaphandler_meth_precheck]]) | 어느 필드를 바꾸려는 요청인지 볼 때 읽습니다. |

managed BO 에서는 저장을 RAP 가 맡으므로, EML 을 `FIELDS ( ... ) WITH` 로만 쓴다면 `%control` 을 직접 다룰 일이 거의 없습니다.

### 저절로 채워지는 경우와 직접 채워야 하는 경우

`MODIFY` 문에서 필드를 넘기는 방법에 따라 달라집니다([[abapmodify_entity_entities_fields]]).

| 쓰는 법 | `%control` 을 채우는 쪽 | 켜지는 필드 |
| --- | --- | --- |
| `FIELDS ( a b ) WITH` | 문 | 괄호 안에 적은 필드 |
| `SET FIELDS WITH` | 문 | 값이 들어 있는 필드 |
| `FROM` | 직접 | 직접 켠 필드 |

`FROM` 을 쓰면(`CREATE FROM ...`, `UPDATE FROM ...`) `%control` 을 반드시 적어야 합니다.

### 넣는 값

interface `IF_ABAP_BEHV` 의 구조형 상수 `mk` 를 씁니다.

- `if_abap_behv=>mk-on` : 표시함. `CREATE` 에서는 그 필드 값을 반영합니다.
- `if_abap_behv=>mk-off` : 표시 안 함. `CREATE` 에서 값을 적어도 그 필드는 반영하지 않습니다.

기술적인 타입이 `x LENGTH 1` 이라 `'X'` 같은 문자 표시는 통하지 않습니다. 켠 값은 16진수 01, 끈 값은 00 입니다.

### 타입

`%control` 구조의 구성요소 타입은 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `CREATE`
- `UPDATE`
- `READ IMPORT`
- `CHANGE`

association 으로 만드는 작업에서는 [[abapderived_types_target]] 안에도 들어 있습니다. 원문은 association 으로 읽는 작업도 함께 들지만, 원문의 `%target` 항목은 쓰이는 곳으로 association 으로 만드는 `CREATE` 만 적습니다.

## 예제

### 값을 넘겼는데 바뀌지 않는 경우

`UPDATE FROM` 에 값만 적고 `%control` 을 비워 두면 켜진 필드가 없어서 아무 필드도 바뀌지 않습니다. 같은 일을 `FIELDS ( ... ) WITH` 로 쓰면 괄호 안 필드를 문이 대신 켭니다.

```abap
" 1) 값은 적었지만 %control 이 비어 있어 status 가 바뀌지 않는다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FROM VALUE #( ( travelid = '00000001' status = 'A' ) )
  FAILED DATA(ls_failed1)
  REPORTED DATA(ls_reported1).

" 2) 괄호 안에 적은 status 의 %control 이 저절로 켜져 status 가 바뀐다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( status ) WITH VALUE #( ( travelid = '00000001' status = 'A' ) )
  FAILED DATA(ls_failed2)
  REPORTED DATA(ls_reported2).

" 3) 필드를 켜고 값을 비워 두면 그 필드를 비운다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( customerid ) WITH VALUE #( ( travelid = '00000001' customerid = '' ) )
  FAILED DATA(ls_failed3)
  REPORTED DATA(ls_reported3).
```

### FROM 에서 직접 채우기

`CREATE FROM` 과 `UPDATE FROM` 에서 줄마다 `%control` 을 적습니다. `mk-off` 로 둔 필드는 값을 적어도 반영되지 않습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      ( %cid       = 'T3'
        travelid   = '00000003'  %control-travelid   = if_abap_behv=>mk-on
        agencyid   = '070001'    %control-agencyid   = if_abap_behv=>mk-on
        " 값은 적었지만 표시를 꺼서 저장되지 않는다
        customerid = '000010'    %control-customerid = if_abap_behv=>mk-off ) )
    UPDATE FROM VALUE #(
      ( travelid = '00000001'
        status   = 'A'
        agencyid = '070002'
        " status 만 바뀌고 agencyid 는 그대로 남는다
        %control = VALUE #( status   = if_abap_behv=>mk-on
                            agencyid = if_abap_behv=>mk-off ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

모든 줄에 같은 표시를 줄 때는 `VALUE` 안에서 첫 번째 줄 괄호 앞에 `%control` 을 한 번만 적습니다. 그 뒤에 오는 줄에 모두 적용됩니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FROM VALUE #(
      %control-travelid   = if_abap_behv=>mk-on
      %control-agencyid   = if_abap_behv=>mk-on
      %control-customerid = if_abap_behv=>mk-on
      ( %cid = 'T1' travelid = '00000001' agencyid = '070001' customerid = '000010' )
      ( %cid = 'T2' travelid = '00000002' agencyid = '070002' customerid = '000020' ) )
  MAPPED DATA(ls_mapped2)
  FAILED DATA(ls_failed2)
  REPORTED DATA(ls_reported2).
```

### unmanaged BO 의 수정 handler method 에서 읽기

unmanaged BO 에서는 수정을 직접 구현하므로 `%control` 을 직접 읽어야 합니다. 지금 값을 먼저 가져온 뒤, 켜진 필드만 새 값으로 덮어씁니다. 표시를 보지 않고 줄 전체를 옮기면 넘기지 않은 필드가 초깃값으로 지워집니다.

```abap
METHOD update.
  " entities 의 타입은 TABLE FOR UPDATE zr_travel\\travel
  LOOP AT entities INTO DATA(ls_entity).
    " 지금 저장돼 있는 값을 먼저 가져온다
    SELECT SINGLE * FROM ztravel
      WHERE travel_id = @ls_entity-travelid
      INTO @DATA(ls_travel).

    " 켜진 필드만 새 값으로 덮어쓴다
    IF ls_entity-%control-status = if_abap_behv=>mk-on.
      ls_travel-status = ls_entity-status.
    ENDIF.
    IF ls_entity-%control-customerid = if_abap_behv=>mk-on.
      " 켜져 있고 값이 비어 있으면 고객을 비우라는 뜻이다
      ls_travel-customer_id = ls_entity-customerid.
    ENDIF.

    " ls_travel 을 transactional buffer 에 넣는다 (줄임). 저장은 save 에서 한다
  ENDLOOP.
ENDMETHOD.
```

필드가 많으면 `IF` 를 필드마다 쓰지 않아도 됩니다. `CORRESPONDING` 에 `USING CONTROL` 을 붙이면 켜진 필드만 옮깁니다([[abapeml_corresponding]]). 옛 BAPI 처럼 X 구조를 받는 코드를 부를 때는 BDEF 의 `mapping for ... control` 로 `%control` 과 X 구조를 이어 둡니다([[abenbdl_type_mapping]]).

## 알아두기

- `SET FIELDS WITH` 는 값이 들어 있는 필드만 켭니다. 그래서 필드를 빈 값으로 지우는 데는 쓸 수 없습니다. 지우려면 `FIELDS ( ... ) WITH` 나 `FROM` 을 씁니다.
- `FIELDS ( ... ) WITH` 에서 괄호 안에 적지 않은 필드는 값을 넣어 두어도 무시됩니다. 값을 넘겼는데 반영되지 않으면 괄호 안 필드 목록부터 봅니다.
- 옛 자료에는 `%control` 을 `cl_abap_behv=>flag_changed` 와 비교하는 코드가 보입니다. 지금 원문은 `if_abap_behv=>mk-on` 을 씁니다.
- `READ` 작업에서는 키를 늘 쓰고 늘 돌려줍니다. 그래서 managed 에서는 `%control` 에서 키 표시를 꺼도 무시됩니다.
- managed 에서는 키 필드의 `%control` 표시를 켜지 않아도 됩니다. 예를 들어 EML `READ` 문에서 `FROM` 을 쓸 때 그렇습니다. 돌려받은 인스턴스에는 키 값이 들어 있습니다.
- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드는 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 값이 채워진 구성요소만 골라 처리하게 도와줍니다. `%control` 에서 표시된 필드만 훑을 때 쓸모 있습니다.

## 관련 항목

- [[abapmodify_entity_entities_fields]]
- [[abapmodify_entity_entities_op]]
- [[abapread_entity_entities]]
- [[abaphandler_meth_modify]]
- [[abaphandler_meth_read]]
- [[abaprap_saver_meth_save_modified]]
- [[abapeml_corresponding]]
- [[abenbdl_type_mapping]]
- [[abapderived_types_data]]
- [[abapderived_types_target]]
- [[abapeml_derived_type_flags]]
- [[abenderived_types_control_abexa]]
