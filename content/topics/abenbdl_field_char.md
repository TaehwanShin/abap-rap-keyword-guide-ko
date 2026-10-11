---
title: field characteristics (field)
summary: entity 의 필드를 readonly, mandatory 입력, 숨김, 조건부 제어 등으로 지정해 RAP BO consumer 의 접근을 제한하는 문법입니다.
keywords: field, readonly, mandatory, suppress, features:instance, mandatory:create, mandatory:update, readonly:create, readonly:update, recommendations, 필드 특성, 읽기 전용, 필수 입력, 필드 제어, FOR INSTANCE FEATURES
---

## 문법

```syntax
... field(readonly) Field1, Field2, ...;
       | (mandatory) Field1, Field2, ...;
       | (suppress) Field1, Field2, ...;
       | (features:instance) Field1, Field2, ...;
       | (mandatory:create) Field1, Field2, ...;
       | (mandatory:update) Field1, Field2, ...;
       | (readonly:create) Field1, Field2, ...;
       | (readonly:update) Field1, Field2, ...;
       | (recommendations) Field1, Field2, ...;
```

## 설명

entity(엔터티)의 필드에 특성을 붙여, RAP BO consumer(사용자)가 그 필드를 어떻게 다룰 수 있는지 정합니다.

- 필드 여러 개에 같은 특성을 줄 때는 쉼표로 이어 적습니다. 예) `field ( readonly ) Field1, Field2, Field3;`
- 필드 하나에 특성 여러 개를 줄 때는 괄호 안에서 쉼표로 나눕니다. 예) `field ( mandatory : create, readonly : update ) Field1;`
- 함께 쓸 수 없는 특성 조합이 있습니다. 그런 조합을 쓰면 문법 경고가 나옵니다.

특성은 아홉 가지입니다. `features:instance` 와 `recommendations` 만 behavior pool(동작 풀)에 구현이 필요하고, 나머지는 선언만 하면 되는 정적 특성입니다.

| 특성 | 뜻 | behavior pool 구현 |
| --- | --- | --- |
| `readonly` | 사용자가 값을 만들거나 바꿀 수 없습니다. | 필요 없음 |
| `mandatory` | 저장하기 전에 값을 넣어야 하는 필드입니다. | 필요 없음 |
| `suppress` | BDEF derived type(BDEF 파생 타입)과 모든 RAP API 에서 필드를 뺍니다. | 필요 없음 |
| `features:instance` | 인스턴스 상태에 따라 접근 제한이 달라집니다. | 필요 |
| `mandatory:create` | 인스턴스를 만들 때 값을 꼭 넣어야 합니다. | 필요 없음 |
| `mandatory:update` | 수정할 때, 그리고 생성한 뒤에 값을 꼭 넣어야 합니다. | 필요 없음 |
| `readonly:create` | 생성할 때 사용자가 값을 바꿀 수 없습니다. | 필요 없음 |
| `readonly:update` | 생성한 뒤에는 값을 바꿀 수 없습니다. | 필요 없음 |
| `recommendations` | 필드에 RAP recommendation 값을 보여 줍니다. | 필요 |

### readonly

RAP BO consumer 가 필드 값을 만들지도 바꾸지도 못합니다. 사용자가 EML 의 [[abapmodify_entity_entities_op|CREATE]] 나 [[abapmodify_entity_entities_op|UPDATE]] 로 `readonly` 필드를 바꾸려 하면 문법 오류가 납니다.

### mandatory

데이터베이스에 저장하기 전에 값을 넣어야 하는 필드로 표시합니다. OData 시나리오에서는 화면에 mandatory 입력으로 나타납니다.

하지만 **실행 중에 확인하지는 않습니다.** mandatory 필드를 비워 두어도 런타임 오류가 나지 않고, 빈 값 그대로 저장됩니다. 실제로 막으려면 [[abenbdl_validations|저장 시점 validation (validation on save)]]을 직접 구현해야 합니다.

### suppress

필드를 BDEF derived type 과 모든 RAP API 에서 없앱니다.

- 키 필드, 외래 키 필드, 지금 BDEF 가 쓰는 필드(예: ETag 필드)는 숨길 수 없습니다. 그 밖의 필드는 모두 숨길 수 있습니다.
- OData 로 드러나는 것까지 막으려면 CDS 어노테이션 `@Consumption.hidden: true` 를 붙여야 합니다.
- 데이터 타입이 `CUKY` 인 통화 키 필드는, 그 필드를 참조하는 CDS 금액 필드가 모두 숨겨져 있을 때만 숨길 수 있습니다.
- 사용자가 숨긴 필드를 바꾸려 하면 "그런 이름의 필드가 없다"는 오류 메시지가 나옵니다.

### features:instance

인스턴스의 상태에 따라 필드 접근 제한이 달라지는 동적 특성입니다.

- behavior pool 의 handler method(핸들러 메서드) [[abaphandler_meth_features|FOR INSTANCE FEATURES]] 에 구현해야 합니다. 여기서 필드를 mandatory 입력, readonly, 제한 없음, 또는 mandatory 입력이면서 readonly 로 정할 수 있습니다.
- 사용자가 이 제한을 어기는 요청을 하면 **조용히 무시됩니다.** 오류도 경고도 없습니다. managed RAP BO 에서는 응답 구조에도 아무것도 들어가지 않습니다. unmanaged RAP BO 에서는 구현하기에 따라 `reported` 가 채워질 수 있습니다.

### mandatory:create

인스턴스를 만들 때 값을 꼭 넣어야 하는 정적 특성입니다. `mandatory` 와 달리, 값을 넣지 않고 인스턴스를 만들려 하면 **런타임 오류**가 납니다.

사용자가 키를 직접 넣는 external numbering 에서 키 필드에 `mandatory:create` 와 `readonly:update` 를 함께 쓰는 것이 대표적인 쓰임새입니다.

### mandatory:update

수정 작업을 할 때, 그리고 `create` 뒤에 RAP BO consumer 가 값을 꼭 넣어야 하는 필드로 지정합니다. SAP Fiori UI 애플리케이션에서는 지원하지 않습니다.

### readonly:create

`create` 작업을 하는 동안 RAP BO consumer 가 필드 값을 바꿀 수 없습니다.

### readonly:update

수정 작업에서 readonly 가 됩니다. 곧 `create` 뒤에는 값을 바꿀 수 없습니다.

- 사용자가 `readonly:update` 필드를 수정하려 하면 문법 오류가 납니다.
- draft 를 쓰는 BO 에서는 조심할 점이 있습니다. 저장은 했지만 아직 활성화하지 않은 draft 인스턴스가 있을 때, 그 draft 와 기본 키 값이 같은 새 인스턴스를 만들면 이것이 **수정 작업으로 처리됩니다.** 그 필드가 `readonly:update` 라면 오류 메시지가 나옵니다.

### recommendations

지정한 필드에 RAP recommendation 값을 보여 줍니다.

- 그 입력 필드에 값 도움말(value help)이 있어야만 recommendations 를 구현할 수 있습니다.
- behavior definition(동작 정의)에 짝이 되는 [[abenbdl_recommendations|recommendation function]] 을 적고 behavior pool 에 구현해야 합니다.
- recommendation function 에 side effects 를 정의해야 합니다.

## 예제

여러 특성을 함께 쓴 모습입니다. `TotalPrice` 는 인스턴스 상태에 따라 제한이 달라지게 했습니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  // 키는 만들 때 꼭 넣고, 그 뒤로는 못 바꾼다 (external numbering)
  field ( mandatory : create, readonly : update ) TravelID;

  field ( readonly ) LastChangedAt;
  field ( mandatory ) AgencyID, CustomerID;

  // 상태에 따라 readonly 여부가 달라진다
  field ( features : instance ) TotalPrice;
}
```

`features : instance` 는 behavior pool 에서 조건을 정합니다. 여기서는 승인된(`Status = 'A'`) 여행의 총액을 readonly 로 만듭니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR travel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD get_instance_features.
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    result = VALUE #( FOR ls_travel IN lt_travel
                      ( %tky              = ls_travel-%tky
                        %field-totalprice = COND #( WHEN ls_travel-status = 'A'
                                                    THEN if_abap_behv=>fc-f-read_only
                                                    ELSE if_abap_behv=>fc-f-unrestricted ) ) ).
  ENDMETHOD.
ENDCLASS.
```

승인된 여행의 `TotalPrice` 를 EML 로 수정해도 값은 그대로입니다. 오류나 경고는 나오지 않습니다.

## 알아두기

- 기본 키 필드는 모두 `readonly` 나 `readonly:update` 로 지정해야 합니다. 그러지 않으면 문법 경고가 나옵니다.
- UI 시나리오에서는 필드 제어에 바탕을 둔 field characteristics(필드 특성)이 RAP 사용자 힌트로 나타납니다. `field ( recommendations )` 를 준 필드에는 화면에 recommendation 값이 보입니다.
- projection BO 는 field characteristics 를 자동으로 물려받습니다. projection 에서 새로 정할 때는 따로 규칙이 있습니다. [[abenbdl_field_projection]] 를 참고하세요.
- abstract BDEF 에는 따로 규칙이 있습니다. [[abenbdl_field_abstract]] 를 참고하세요.
- interface BDEF 도 자동으로 물려받습니다. 기반 계층의 field characteristics 와 어긋나지 않는 한 특성을 더 붙일 수 있습니다. [[abenbdl_field_interface]] 를 참고하세요.
- 동적 필드 제어를 쓰는 실행 예제는 [[abeneml_calculator_abexa]] 에 있습니다.

## 관련 항목

- [[abaphandler_meth_features]]
- [[abenbdl_field_numbering]]
- [[abenbdl_validations]]
- [[abenbdl_recommendations]]
- [[abenbdl_field_projection]]
- [[abenbdl_field_abstract]]
- [[abenbdl_field_interface]]
