---
title: abstract BDEF 의 association
summary: abstract BDEF 에서 CDS composition 이나 association 을 계층 derived type 에 넣는 문법으로, 필수 표시(mandatory:execute)와 cross-BO association 용 with hierarchy 를 붙일 수 있습니다.
keywords: association, 연관 관계, 구성 관계, composition, mandatory:execute, with hierarchy, cross-BO association, BO 간 연관 관계, 추상 BDEF, abstract BDEF, 계층 타입, %control, with control
---

## 문법

```syntax
... association [(mandatory:execute)] _Assoc [with hierarchy];
```

## 설명

CDS association 을 계층 BDEF derived type(BDEF 파생 타입)에 넣습니다. abstract BDEF 에서는 **composition 도 `association` 키워드로** 적습니다.

- child entity(자식 엔터티)가 같은 abstract BDEF 에 들어 있으면, parent entity(부모 엔터티)는 그 composition 을 `association` 으로 반드시 적어야 합니다.
- 아래 노드에 동작을 정의하지 않았다면, 그 노드로 가는 composition 은 적으면 안 됩니다.

### mandatory:execute

association 을 **필수**로 선언합니다. abstract BDEF 를 action 이나 function 의 입력 매개변수로 쓸 때, 이 association 에는 반드시 값을 넘겨야 합니다. 곧 `%control` 표시가 켜져 있어야 합니다. 그렇지 않으면 런타임 오류가 납니다.

- CDS composition 과 cross-BO association 에 쓸 수 있습니다. to-parent association 에는 쓸 수 없습니다.
- behavior definition(동작 정의) 머리말에 `with hierarchy` 가 있어야 합니다.
- 그 entity(엔터티) behavior definition 에 `with control` 이 있어야 합니다.
- BDEF strict mode 가 켜져 있어야 합니다.
- `IN LOCAL MODE` 로 부를 때는 아무 효과도 없습니다.

### with hierarchy

cross-BO association(다른 abstract BDEF 의 entity 로 가는 association)에 붙입니다. 머리말에 `with hierarchy` 가 있는 BDEF 에서 씁니다.

이것을 붙인 association 은 **composition 처럼** 다뤄집니다. 대상 타입이 원본 타입 안에 통째로 들어갑니다. 카디널리티에 따라 구조 또는 테이블이 됩니다. 같은 대상이 타입 구조 안에 여러 번 들어갈 수 있으므로, 만들 수 있는 구조가 트리에서 DAG(방향이 있고 돌아오는 길이 없는 그래프)로 넓어집니다.

- to-child association 과 to-parent association 에는 `with hierarchy` 를 쓰면 안 됩니다. 그래프에 순환이 생기지 않게 하기 위해서입니다. 다만 원문은 바로 뒤에서 "to-parent association 에 `with hierarchy` 를 붙이는 것은 보통 안쪽 하위 구조에 쓴다"고도 적고 있어, to-parent association 에 쓸 수 있는지는 원문만으로 분명하지 않습니다.
- association 의 대상 entity 는 `with hierarchy` 가 있는 abstract BDEF 에 들어 있어야 합니다.

다른 DDIC 타입으로 가는 [[abenbdl_type_mapping_abstract|type mapping]] 은 여전히 각 entity 가 들어 있는 BDEF 에 정의합니다. 그래서 cross-BO association 으로 계층 타입을 짜면, 계층 DDIC 타입으로 가는 mapping 이 abstract BDEF 여러 개에 흩어집니다.

## 예제

`_Booking` 은 composition 이고 필수입니다. `_Agency` 는 다른 abstract BDEF 에 있는 entity 로 가는 cross-BO association 인데, `with hierarchy` 를 붙여 계층 타입 안에 넣습니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput alias TravelInput
with control
{
  field ( mandatory : execute ) AgencyID;

  // composition. 값을 꼭 넘겨야 한다
  association ( mandatory : execute ) _Booking;

  // cross-BO association 을 composition 처럼 타입에 넣는다
  association _Agency with hierarchy;
}

define behavior for ZA_BookingInput alias BookingInput
with control
{
}
```

이 abstract BDEF 를 deep parameter 로 쓰는 action 을 부릅니다. `_Booking` 의 `%control` 표시를 켜야 합니다.

```abap
DATA lt_param TYPE TABLE FOR ACTION IMPORT zr_travel~createdeep.

lt_param = VALUE #( (
  %cid   = 'cid1'
  %param = VALUE #(
    AgencyID = '070001'
    _Booking = VALUE #( ( FlightDate          = '20261101'
                          %control-FlightDate = if_abap_behv=>mk-on ) )
    %control = VALUE #( AgencyID = if_abap_behv=>mk-on
                        _Booking = if_abap_behv=>mk-on ) ) ) ).

MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE createdeep FROM lt_param
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

`%control-_Booking` 을 `if_abap_behv=>mk-off` 로 두거나 아예 채우지 않으면 런타임 오류가 납니다.

## 알아두기

- `mandatory:execute` 는 to-parent association 에 붙일 수 없습니다.
- `with hierarchy` 는 to-child association 과 to-parent association 에 붙일 수 없습니다.
- cross-BO association 에 `with hierarchy` 를 붙이는 방식은 타입을 여러 곳에서 다시 쓸 때 알맞습니다.

## 관련 항목

- [[abenbdl_body_abstract]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_field_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_action_input_param]]
- [[abapin_local_mode]]
- [[abapderived_types_control]]
