---
title: abstract BDEF 의 field characteristics (suppress, mandatory:execute)
summary: abstract BDEF 의 필드를 derived type 에서 빼거나(suppress), action·function 의 입력 매개변수로 쓸 때 값을 꼭 넘기게 하는(mandatory:execute) field characteristics 입니다.
keywords: field, suppress, mandatory:execute, field ( suppress ), field ( mandatory : execute ), 필드 특성, 추상 BDEF, abstract BDEF, 필수 필드, %control, with control, with hierarchy, TYPE STRUCTURE FOR HIERARCHY
---

## 문법

```syntax
... field(suppress) Field1, Field2, ...;
       | (mandatory:execute) Field1, Field2, ...;
```

## 설명

abstract BDEF 의 필드에 줄 수 있는 특성은 두 가지입니다. 쉼표로 이어 적으면 여러 필드에 같은 특성을 한 번에 줄 수 있습니다. 예) `field ( suppress ) Field1, Field2, Field3;`

### field ( suppress )

BDEF 에서 만들어지는 **모든 derived type(파생 타입)에서 그 필드를 뺍니다.** 특히 `TYPE TABLE FOR HIERARCHY`, `TYPE STRUCTURE FOR HIERARCHY` 타입에 같은 정보가 겹쳐 들어가는 것을 막을 수 있습니다.

키 필드와, 지금 BDEF 가 쓰고 있는 필드는 뺄 수 없습니다. 그 밖의 필드는 모두 뺄 수 있습니다.

흔한 쓰임새는 외래 키 필드를 빼는 것이었습니다. to-parent association 의 `ON` 조건에 쓰는 외래 키 필드는 계층 타입에서 부모 쪽 정보와 겹칩니다. CDS abstract entity(엔터티)의 to-parent association 에 `ON` 조건이 필수였던 때에는 이 방법이 특히 쓸모 있었습니다. 릴리스 7.85부터는 `ON` 조건을 빼도 됩니다.

### field ( mandatory : execute )

abstract BDEF 의 필드를 **필수**로 선언합니다. 계층 타입을 action 이나 function 의 입력 매개변수로 쓸 때, 이 필드에는 반드시 값을 넘겨야 합니다. 넘기지 않으면 런타임 오류가 납니다.

"값을 넘겼다"는 것은 `%control` 로 판단합니다. 그 필드의 `%control` 표시가 `if_abap_behv=>mk-on` 이어야 합니다. 값을 적었더라도 `%control` 이 `if_abap_behv=>mk-off` 이면 런타임 오류가 납니다.

쓰려면 세 가지가 갖춰져야 합니다.

- behavior definition(동작 정의) 머리말에 `with hierarchy` 가 있어야 합니다.
- 그 entity behavior definition 에 `with control` 이 있어야 합니다.
- BDEF strict mode 가 켜져 있어야 합니다.

## 예제

`AgencyID` 를 필수로 선언한 abstract BDEF 입니다. `with hierarchy` 와 `with control` 을 모두 갖췄습니다. 예약 노드에서는 필드 `InternalRemark` 를 derived type 에서 뺍니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
with control
{
  association _Booking;

  field ( mandatory : execute ) AgencyID;
}

define behavior for ZA_BookingInput alias BookingInput
with control
{
  field ( suppress ) InternalRemark;
}
```

이 abstract BDEF 를 깊은 입력 매개변수로 쓰는 action 을 부릅니다. `AgencyID` 에 값을 넣고 `%control` 도 켭니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE createdeep
    FROM VALUE #( ( %cid   = 'cid1'
                    %param = VALUE #(
                      " AgencyID 와 그 %control 표시는 필수
                      AgencyID           = '070001'
                      %control-AgencyID  = if_abap_behv=>mk-on
                      BeginDate          = '20261101'
                      %control-BeginDate = if_abap_behv=>mk-on ) ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

여기서 `%control-AgencyID` 를 `if_abap_behv=>mk-off` 로 바꾸면 런타임 오류가 납니다.

## 알아두기

- `IN LOCAL MODE` 로 부를 때는 `mandatory:execute` 가 아무 효과도 없습니다.
- 머리말에 `with hierarchy like entity` 를 쓴 abstract BDEF 에서는 `suppress` 도 `mandatory:execute` 도 쓸 수 없습니다.
- association 에도 `mandatory:execute` 를 붙일 수 있습니다. [[abenbdl_association_abstract]] 참고.
- 실행할 수 있는 전체 예제는 [[abenderived_type_hierarchy_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_body_abstract]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_association_abstract]]
- [[abenbdl_action_input_param]]
- [[abapin_local_mode]]
- [[abapderived_types_comp]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abenderived_type_hierarchy_abexa]]
