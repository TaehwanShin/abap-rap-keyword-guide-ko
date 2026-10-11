---
title: MODIFY ENTITY, ENTITIES 의 작업 (operations)
summary: EML MODIFY 문에서 쓸 수 있는 다섯 가지 작업 CREATE, CREATE BY, UPDATE, DELETE, EXECUTE 와 action 의 REQUEST, RESULT 추가 구문을 설명합니다.
keywords: CREATE, CREATE BY, UPDATE, DELETE, EXECUTE, REQUEST, RESULT, operations, 변경 작업, 연관 관계로 생성, create-by-association, 액션 실행, result selective, TYPE STRUCTURE FOR ACTION REQUEST
---

## 문법

```syntax
... [CREATE field_spec]
    [CREATE BY \_assoc field_spec]
    [UPDATE field_spec]
    [DELETE field_spec]
    [EXECUTE action field_spec [REQUEST request] [RESULT result_tab]] ...
```

## 설명

EML `MODIFY` 문은 다섯 가지 작업을 실행할 수 있습니다.

| 작업 | 하는 일 |
| --- | --- |
| `CREATE` | root entity(루트 엔터티)나 child entity(자식 엔터티)의 인스턴스를 새로 만듭니다. |
| `CREATE BY \_assoc` | association 을 따라 대상 entity(엔터티)의 인스턴스를 만듭니다. |
| `UPDATE` | 이미 있는 인스턴스를 고칩니다. |
| `DELETE` | 이미 있는 인스턴스를 지웁니다. |
| `EXECUTE action` | [[abenbdl_action|action]], 곧 직접 만든 변경 작업을 실행합니다. |

managed 든 unmanaged 든, 쓰려는 변경 작업은 모두 behavior definition(동작 정의)에 선언돼 있어야 합니다. 선언 방법은 [[abenbdl_standard_operations]] 를 봅니다. standard operation(표준 작업)이 아닌 작업(action)은 behavior pool(동작 풀)에 직접 구현해야 합니다.

작업 키워드 뒤에는 어떤 인스턴스의 어떤 필드를 바꿀지 담은 내부 테이블이 옵니다. 이 부분이 `field_spec` 이고, 쓰는 법은 [[abapmodify_entity_entities_fields]] 에서 설명합니다.

### CREATE

RAP BO entity 의 인스턴스를 새로 만듭니다.

### CREATE BY \_assoc

association 의 대상 entity 에 인스턴스를 만듭니다. BDEF 에서 그 association 에 `create` 가 켜져 있어야 합니다. composition 에만 쓸 수 있는 것은 아닙니다. `_assoc` 는 기반 CDS 뷰에 정의된 association 이름입니다.

### UPDATE

인스턴스를 고칩니다. RAP BO consumer(사용자)는 키 필드와 새 값이 든 필드만 넘기면 됩니다(바뀐 부분만 보내는 수정). 어떤 필드를 덮어쓰고 어떤 필드를 그대로 둘지는 RAP BO provider(제공자) 쪽에서 가려냅니다.

### DELETE

인스턴스를 지웁니다. 지울 인스턴스를 가리키는 데는 키 필드 값이나 `%cid_ref` 만 있으면 됩니다. 삭제는 composition 을 따라 딸린 인스턴스에도 미칩니다.

### EXECUTE action

action 을 실행합니다. action 이름 뒤에 `field_spec` 을 적고, 필요하면 아래 두 가지를 덧붙입니다.

- `REQUEST request` : 결과를 전부 돌려받을지 일부(예: 키만)만 돌려받을지 정합니다. 성능을 높이려고 씁니다. `request` 는 BDEF derived type(BDEF 파생 타입) [[abaptype_structure_for|TYPE STRUCTURE FOR ACTION REQUEST]] 로 선언합니다. 구성요소는 entity 의 키 필드와 데이터 필드 전부이고 타입은 `ABP_BEHV_FLAG` 입니다. 돌려받을 필드에 표시를 켭니다. BDEF 에서 [[abenbdl_action_output_para|result selective]] 로 선언한 action 에만 쓸 수 있습니다.
- `RESULT result_tab` : action 의 결과를 받습니다. BDEF 에서 [[abenbdl_action_output_para|result]] 로 선언한 action 에만 쓸 수 있습니다. `result_tab` 의 타입은 `TABLE FOR ACTION RESULT bdef~action` 이어야 합니다. 자세한 내용은 [[abapeml_result]] 를 봅니다.

## 예제

여행을 만들고, 그 여행에 예약을 붙이고, 다른 여행을 고치고 지웁니다. 짧은 형식 `MODIFY ENTITY` 한 문장에 네 가지 standard operation 을 모았습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #( ( %cid = 'cid1' travelid = '00000001'
                  agencyid = '070001' customerid = '000011' ) )
  " BY 뒤에는 백슬래시와 association 이름을 적는다
  CREATE BY \_booking FIELDS ( bookingid flightprice )
  WITH VALUE #( ( %cid_ref = 'cid1'
                  %target  = VALUE #( ( %cid = 'cid2' bookingid = '0001'
                                        flightprice = '500.00' ) ) ) )
  " 키와 바꿀 필드만 넘긴다
  UPDATE FIELDS ( status )
  WITH VALUE #( ( travelid = '00000002' status = 'X' ) )
  " 지울 때는 키만 있으면 된다
  DELETE FROM VALUE #( ( travelid = '00000003' ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported)
  MAPPED   DATA(ls_mapped).
```

action `acceptTravel` 을 실행하고 결과를 받습니다. action 이 `result selective [1] $self` 로 선언돼 있어서, `REQUEST` 로 돌려받을 필드를 `TravelID` 와 `Status` 로 줄였습니다.

```abap
DATA ls_request TYPE STRUCTURE FOR ACTION REQUEST zr_travel~accepttravel.

ls_request = VALUE #( travelid = if_abap_behv=>mk-on
                      status   = if_abap_behv=>mk-on ).

MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE accepttravel
    FROM VALUE #( ( travelid = '00000001' ) )
    REQUEST ls_request
    RESULT DATA(lt_result)
  FAILED   DATA(ls_act_failed)
  REPORTED DATA(ls_act_reported).
```

## 알아두기

- `CREATE BY` 의 `BY` 뒤에 백슬래시(`\`)를 먼저 넣어야 코드 완성에 association 이 나옵니다.
- association 을 따라 인스턴스를 고치거나 지울 수는 없습니다. `UPDATE BY`, `DELETE BY` 같은 작업은 없습니다.
- [[abenbdl_with_draft|draft]] 를 쓰는 BO 에서는 draft 표시 [[abapderived_types_is_draft|%is_draft]] 가 참이면 draft 인스턴스가, 거짓이면 active(활성) 인스턴스가 만들어집니다.
- `REQUEST` 는 `result selective` action 에만, `RESULT` 는 `result` 가 있는 action 에만 쓸 수 있습니다.
- RAP BO provider 와 consumer 가 EML 문을 쓸 때 지켜야 할 규칙은 ABAP RESTful Application Programming Model 개발 안내서의 "RAP Business Object Contract" 단락에 있습니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_fields]]
- [[abapeml_result]]
- [[abenbdl_action]]
- [[abenbdl_standard_operations]]
- [[abeneml_modify_op_abexa]]
- [[abeneml_modify_op_u_abexa]]
- [[abeneml_modify_custom_op_abexa]]
- [[abenbdl_action_abexas]]
- [[abenrap_handler_methods_abexa]]
- [[abapeml_modify_examples_abexas]]
