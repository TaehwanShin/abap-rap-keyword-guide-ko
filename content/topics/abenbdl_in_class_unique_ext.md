---
title: extension behavior pool 지정 (implementation in class unique)
summary: BDEF extension 의 behavior implementation 을 담을 extension behavior pool 을 정하는 구문이며, 원본 behavior pool 과 extension behavior pool 이 서로를 외부 사용자로 본다는 규칙이 따라옵니다.
keywords: implementation in class unique, extension, 확장 동작 풀, 확장 ABP, extension ABP, unique, internal, IN LOCAL MODE, readonly, 기능 제어, 권한 제어, with friends, BDEF 프렌드
---

## 문법

```syntax
... implementation in class ClassName unique;
```

## 설명

확장한 RAP BO 의 behavior implementation(동작 구현)을 담을 behavior pool(동작 풀)을 정합니다. 이 behavior pool 을 **extension(확장) behavior pool**(extension ABP)이라고 부릅니다. extension behavior pool 은 선택 항목입니다. BDEF extension 이 action, determination, validation 처럼 구현이 필요한 요소를 정의할 때만 적습니다.

적을 수 있는 자리는 네 군데입니다.

- extension 머리말 ([[abenbdl_extension_header]])
- entity(엔터티) 동작 extension `extend behavior for` ([[abenbdl_extend_beh]])
- extension 노드의 behavior definition(동작 정의) `define behavior for` ([[abenbdl_define_beh_extend]])
- 구현 그룹 `group` ([[abenbdl_group_extension]])

`unique` 는 반드시 붙입니다. 작업 하나를 딱 한 번만 구현할 수 있다는 뜻입니다.

### 원본 behavior pool 과 extension behavior pool

원본 behavior pool 과 extension behavior pool 은 서로 기대지 않는 별개의 개발 객체입니다. 둘은 서로를 **외부 사용자**로 봅니다. 그래서 다음 규칙이 생깁니다.

**internal 작업**

`internal` 로 정의한 작업은 그것을 구현한 behavior pool 안에서만 부를 수 있습니다. 원본 BDEF 의 `internal` 작업은 extension behavior pool 에서 보이지 않으므로 확장할 수 없습니다. 반대로 extension 의 `internal` action 도 원본 BO 에서 보이지 않습니다.

**IN LOCAL MODE**

`IN LOCAL MODE` 는 그 RAP BO 자신에게만 특권 접근을 줍니다. 원본 BO 는 자기 구현 클래스나 거기서 부른 클래스에서 로컬 모드로 접근할 수 있습니다. extension BO 는 자기 구현 클래스에서 로컬 모드로 접근할 수 있습니다. 원본 BO 와 extension BO 는 서로에게 외부 사용자입니다.

**필드 사용**

- extension behavior pool 은 확장한 RAP BO 의 필드를 쓸 수 있습니다.
- 원본 RAP BO 는 extension 이 같은 소프트웨어 컴포넌트에 만들어졌을 때 extension 의 필드를 쓸 수 있습니다.
- `readonly` 같은 field characteristics(필드 특성)은 원본과 extension 사이에서도 지켜야 합니다. extension behavior pool 이 원본 BO 의 `readonly` 필드를 수정하거나 삭제하려 하면 런타임 오류가 납니다. 동적 EML 로 readonly 필드를 바꾸려 해도 런타임 오류가 납니다.

**feature control(기능 제어)**

- 원본 behavior pool 은 원본 필드와 원본 작업의 feature control 을 구현합니다.
- extension behavior pool 은 같은 소프트웨어 컴포넌트에 있는 extension 필드와 extension 작업의 feature control 을 구현합니다.
- global·instance feature control handler method(핸들러 메서드)의 `REQUEST` 매개변수에는 그 메서드가 속한 BDEF 의 필드와 작업만 들어 있습니다. 같은 entity 를 다루더라도 원본 것과 extension 것이 함께 들어오지 않습니다. 원본과 extension 의 feature control 이 엄격하게 나뉩니다.

**authorization control(권한 제어)**

- authorization control 은 확장되는 원본 BO 에서만 **정의**할 수 있습니다. **구현**은 필요하면 원본 behavior pool 과 extension behavior pool 양쪽에 둘 수 있습니다.
- 원본 BO 는 원본에 정의한 action 의 authorization control 을 구현합니다. extension BO 는 extension action 에 authorization control 을 지정했다면 그것을 구현합니다.
- global·instance authorization control handler method 의 `REQUEST` 매개변수에도 그 메서드가 속한 BDEF 의 작업만 들어 있습니다. 원본과 extension 의 authorization control 도 엄격하게 나뉩니다.
- 구현은 나뉘어 있어도 원본의 구현은 extension 노드에도 적용됩니다. 예를 들어 원본 BO 가 `update` 의 권한 확인을 구현했다면, 원본 노드를 수정할 때뿐 아니라 extension 노드를 수정할 때도 그 확인이 실행됩니다.
- 다음 세 경우에는 extension behavior pool 에 마스터 entity 용 authorization control 과 authorization dependent entity 용 authorization control 을 따로 구현해야 합니다.
  - authorization dependent entity 의 action
  - 생성을 허용한 BO 간(cross-BO) association
  - 생성을 허용했지만 CDS composition 이 아닌 association

### BDEF derived type

- RAP BO 의 BDEF derived type(BDEF 파생 타입)에는 원본 필드와 extension 필드가 모두 들어갑니다.
- BDEF extension 을 전역 데이터 타입이나 데이터 타입의 일부로 써서는 안 됩니다.

## 예제

extension 필드 `ZZDiscount` 에 instance feature control 을 걸고 extension action `holdTravel` 을 보탭니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  field ( features : instance ) ZZDiscount;
  action ( authorization : instance ) holdTravel;
}
```

extension behavior pool 의 handler class(핸들러 클래스)는 extension 에서 보탠 것만 맡습니다. `requested_features` 와 `requested_authorizations` 에는 extension 쪽 필드와 작업만 들어옵니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    " extension 필드 ZZDiscount 의 feature control
    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR travel RESULT result.
    " extension action holdTravel 의 권한 확인
    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR travel RESULT result.
    METHODS holdtravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~holdtravel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_instance_features.
    READ ENTITIES OF zi_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    " 승인된 여행은 할인율을 고칠 수 없다
    result = VALUE #( FOR ls_travel IN lt_travel
      ( %tky              = ls_travel-%tky
        %field-zzdiscount = COND #( WHEN ls_travel-status = 'A'
                                    THEN if_abap_behv=>fc-f-read_only
                                    ELSE if_abap_behv=>fc-f-unrestricted ) ) ).
  ENDMETHOD.

  METHOD get_instance_authorizations.
    " extension action 은 누구나 실행할 수 있다
    result = VALUE #( FOR key IN keys
      ( %tky               = key-%tky
        %action-holdtravel = if_abap_behv=>auth-allowed ) ).
  ENDMETHOD.

  METHOD holdtravel.
    MODIFY ENTITIES OF zi_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( status )
        WITH VALUE #( FOR key IN keys ( %tky = key-%tky status = 'H' ) )
      FAILED failed
      REPORTED reported.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 원본 BDEF 가 `with friends` 로 BDEF extension 을 BDEF 프렌드로 지정할 수 있습니다. BDEF 프렌드는 원본 RAP BO 의 모든 요소에 제한 없이 접근합니다. `internal` 작업을 부를 수 있고, 원본 entity 를 `IN LOCAL MODE` 로 읽고 바꿀 수 있습니다. 이때는 위에 적은 제한이 extension behavior pool 에 걸리지 않습니다.
- behavior pool 을 구현하는 일반 규칙은 [[abenabap_behavior_pools]] 에 있습니다. BDEF derived type 전체 목록은 [[abenrpm_derived_types]] 에 있습니다.
- authorization control, feature control, validation, determination, action 이 원본 behavior pool 과 extension behavior pool 에 나뉘어 구현된 모습은 [[abenbdl__behavior_ext_abexa]] 에서 볼 수 있습니다.

## 관련 항목

- [[abenbdl_extension_header]]
- [[abenbdl_extend_beh]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_group_extension]]
- [[abenbdl_internal]]
- [[abapin_local_mode]]
- [[abenbdl_with_friends]]
- [[abenbdl__behavior_ext_abexa]]
- [[abenbdl_assoc_ext_abexa]]
- [[abenbdl_field_ext_abexa]]
