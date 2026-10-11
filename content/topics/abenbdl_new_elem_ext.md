---
title: 요소 추가 (Adding Elements)
summary: BDEF extension 에서 이미 있는 entity 의 동작 본문에 determination, validation, event, field characteristics, action, function, association, type mapping 등을 새로 보태는 방법입니다.
keywords: Adding Elements, 요소 추가, extend behavior for, determination, validation, event, managed event, field characteristics, action, function, determine action, association, define pure key, mapping for, 확장 필드, 확장 액션
---

## 문법

```syntax
...
  [determination]
  [validation]
  [event]
  [managed event]
  [field characteristics]
  [action]
  [function]
  [determine action]
  [association]
  [define pure key]
  [mapping for]
  ...
```

## 설명

`extend behavior for` 의 본문에는 위 요소를 새로 적을 수 있습니다. 모두 선택 항목이고, 여러 개를 함께 적어도 됩니다. `using interface` 를 쓴 extension(확장)이든 원본을 직접 확장하든 똑같이 쓸 수 있습니다.

문법은 대부분 원본 BO 에서 쓰는 것과 같습니다. 다만 요소마다 extension 에서만 걸리는 조건이 있습니다. 구현이 필요한 요소는 extension behavior pool(동작 풀)에 구현하고, extension behavior pool 규칙([[abenbdl_in_class_unique_ext]])을 지켜야 합니다.

### determination / validation

determination이나 validation을 entity(엔터티)에 보탭니다.

- **전제 조건**: 확장되는 BDEF 가 그 종류의 determination·validation 을 명시적으로 허용해야 합니다. ([[abenbdl_extensibility_enabling_m_u]] 참고)
- 문법은 [[abenbdl_determinations]], [[abenbdl_validations]] 와 똑같습니다.
- extension 필드든 원본 필드든 모든 필드를 트리거로 쓸 수 있습니다.
- unmanaged RAP BO 의 extension 에서는 지금 지원하지 않습니다.
- determination 과 validation 의 실행 순서는 정해져 있지 않습니다. 원본 것과 extension 것 사이에서도 마찬가지입니다.

### event

business event 를 보탭니다.

- business event 는 루트 노드에만 정의할 수 있습니다. 그래서 루트 노드를 확장할 때만 적을 수 있습니다.
- 문법은 [[abenbdl_event]] 와 똑같습니다.
- extension event 는 그 BO 의 extension behavior pool 에서 `RAISE ENTITY EVENT` 문으로 일으켜야 합니다.

### managed event

파생 event(다른 event 에 딸려 자동으로 일어나는 event)를 보탭니다.

- 파생 event 도 루트 노드에만 정의할 수 있으므로 루트 노드 extension 에만 적습니다.
- 문법은 [[abenbdl_managed_event]] 와 똑같습니다.
- behavior pool 에 구현할 것이 없습니다. 참조한 event 가 일어나면 자동으로 함께 일어납니다.

### field characteristics

extension 필드에 field characteristics(필드 특성)을 줍니다. extension 필드는 원본 BO 에는 없고 데이터 모델 extension 으로 보탠 필드입니다. **extension 필드에만** 속성을 줄 수 있습니다.

쓸 수 있는 속성은 다음과 같습니다. 뜻은 [[abenbdl_field_char]] 에 적힌 그대로입니다.

- `readonly`
- `mandatory`
- `suppress`
- `readonly:update`
- `features:instance` — instance feature control(기능 제어)를 구현할 때 extension behavior pool 규칙이 적용됩니다.

쓸 수 없는 것도 있습니다.

- 내부 필드 numbering([[abenbdl_field_numbering]])는 BDEF extension 에서 쓸 수 없습니다.
- `mandatory:create` 는 BDEF extension 에서 쓸 수 없습니다.

### action

action 을 보탭니다. 문법은 [[abenbdl_action]] 과 같지만 규칙이 두 가지 더 있습니다.

- **권한 확인 방식을 action 마다 적어야 합니다.** extension action 은 원본 BO 의 authorization master entity 에 정한 authorization control(권한 제어)를 대신할 authorization control 을 action 단위로 정의해야 합니다. 아래 가운데 하나를 반드시 붙입니다.
  - `authorization:none` ([[abenbdl_actions_auth]])
  - `authorization:update` ([[abenbdl_actions_auth_update]])
  - `authorization:global` ([[abenbdl_actions_auth_global]])
  - `authorization:instance` ([[abenbdl_actions_auth_instance]])
  - `authorization:instance, authorization:global` (순서는 바꿔도 됩니다)
- factory action 을 default factory action 으로 만드는 `default` 는 BDEF extension 에서 쓸 수 없습니다. ([[abenbdl_action_default_factory]] 참고)

### function

function 을 보탭니다. 문법은 [[abenbdl_function]] 과 똑같습니다.

### determine action

`determine action`(determination 과 validation 을 필요할 때 한꺼번에 실행하는 action)을 보탭니다.

- 문법은 [[abenbdl_determine_action]] 과 똑같습니다.
- **같은 BDEF extension 에 있는** determination 과 validation 만 넣을 수 있습니다. 원본 BDEF 의 determination 과 validation 은 넣을 수 없습니다.
- unmanaged RAP BO 의 extension 에서는 지금 지원하지 않습니다.

### association

association 에 동작을 켭니다. 문법은 [[abenbdl_association]] 과 똑같습니다.

지금은 **BO 안의 association**만 온전히 지원합니다. BO 사이(cross-BO)의 association 을 extension BDEF 에 정의하는 것은 일반적으로 지원하지 않습니다. 다음 경우만 예외입니다.

| 경우 | 지원하는 방식 |
| --- | --- |
| 릴리스된 SAP BO 두 개 사이의 고객 extension | source-resolved |
| 고객 BO 에서 릴리스된 SAP BO 로 | source-resolved, 또는 역방향 association 을 거친 target-resolved |
| 릴리스된 SAP BO 에서 고객 BO 로 | source-resolved |

릴리스된 SAP BO 의 extension 에는 draft 를 쓰는 target-resolved association 을 정의할 수 없습니다(대상 BO 에 필요한 역방향 association 까지 포함). 이렇게 모델링하면 서비스 층에서 오류가 납니다.

### define pure key

BDEF pure key 를 보탭니다. **BDEF 프렌드로 선언된 extension 에서만** 쓸 수 있습니다. 문법은 [[abenbdl_define_key]] 와 똑같습니다. BDEF 보조 키(secondary key)는 extension 에서 쓸 수 없습니다.

### mapping for

type mapping 을 새로 보탭니다. 이 mapping 에는 **extension 필드만** 넣을 수 있습니다. 확장되는 BDEF 의 필드는 넣을 수 없습니다. 문법은 [[abenbdl_type_mapping]] 과 똑같습니다.

원본에 있는 type mapping 을 `extend mapping for` 로 확장하는 방법도 있습니다([[abenbdl_type_mapping_ext]]). 상대 타입이 같으면 `mapping for PartnerType ...` 과 `extend mapping for PartnerType ...` 은 차이가 없습니다.

## 예제

interface `ZI_Travel` 을 거쳐 root entity(루트 엔터티)에 field characteristics, determination, validation, action 을 보탭니다. `ZZPurpose` 와 `ZZDiscount` 는 데이터 모델 extension 으로 보탠 extension 필드입니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  // extension 필드에만 field characteristics 를 줄 수 있다
  field ( mandatory ) ZZPurpose;
  field ( features : instance ) ZZDiscount;

  // 원본 BDEF 가 허용한 종류의 determination 과 validation
  determination setDefaultPurpose on save { create; }
  validation checkDiscount on save { field ZZDiscount; }

  // extension action 에는 권한 확인 방식을 꼭 적는다
  action ( authorization : instance ) holdTravel result [1] $self;
}
```

validation 은 extension behavior pool 에 구현합니다.

```abap
METHOD checkdiscount.
  READ ENTITIES OF zi_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( zzdiscount ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 할인율이 50 을 넘으면 저장을 막는다
  LOOP AT lt_travel INTO DATA(ls_travel) WHERE zzdiscount > 50.
    APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
    APPEND VALUE #( %tky = ls_travel-%tky
                    %msg = new_message_with_text(
                             severity = if_abap_behv_message=>severity-error
                             text     = '할인율은 50 을 넘을 수 없습니다.' )
                    %element-zzdiscount = if_abap_behv=>mk-on )
           TO reported-travel.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- determination, validation, `determine action` 을 보태는 extension 은 unmanaged RAP BO 에서 지금 지원하지 않습니다.
- 원본 필드에는 extension 에서 field characteristics 를 줄 수 없습니다.
- extension action 에 `authorization:...` 을 빠뜨리면 안 됩니다. 원본의 authorization master entity 에 정한 authorization control 을 이 action 단위 설정이 대신합니다.
- 실행해 볼 수 있는 예제가 세 가지 있습니다.
  - [[abenbdl_assoc_ext_abexa]] : 네 노드짜리 BO 에 interface 를 거쳐 extension 노드를 하나 보탭니다. ancestor association 을 쓰고, 다섯 노드의 인스턴스를 EML 로 한꺼번에 만듭니다.
  - [[abenbdl_field_ext_abexa]] : 루트 노드 하나짜리 BO 에 extension 필드를 보태고 field characteristics 와 동적 feature control 을 붙입니다.
  - [[abenbdl__behavior_ext_abexa]] : 루트 노드 하나짜리 BO 에 extension 노드를 보태고, authorization control·feature control·validation·determination·action 을 원본 behavior pool 과 extension behavior pool 에 나누어 구현합니다. handler method(핸들러 메서드)가 불리는 순서도 보여 줍니다.

## 관련 항목

- [[abenbdl_entity_beh_extension]]
- [[abenbdl_ext_elem_ext]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_using_interface]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_authorization]]
- [[abapraise_entity_event]]
- [[abenbdl_det_action_ext_abexa]]
