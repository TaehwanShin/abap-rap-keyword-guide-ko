---
title: feature control (features:instance / features:global)
summary: 인스턴스의 상태나 전역 조건에 따라 RAP BO 작업을 켜고 끄는 추가 구문입니다.
keywords: feature control, features:instance, features:global, 기능 제어, 동적 기능 제어, 전역 기능 제어, FOR INSTANCE FEATURES, FOR GLOBAL FEATURES, GET PERMISSIONS, fc-o-disabled, 비활성화
---

## 문법

```syntax
... (features:instance)
  | (features:global) ...
```

## 설명

feature control(기능 제어)는 RAP BO 작업을 **쓸 수 있게 하거나 못 쓰게** 합니다. 두 가지가 있습니다.

| 종류 | 무엇으로 정하나 | 구현할 handler method(핸들러 메서드) |
| --- | --- | --- |
| instance feature control `features:instance` | 인스턴스마다 다른 조건. 예를 들어 특정 필드의 값이나 참조하는 데이터의 값. | [[abaphandler_meth_features|FOR INSTANCE FEATURES]] (반드시 구현) |
| global feature control `features:global` | 개별 인스턴스의 상태와 상관없는 조건. 예를 들어 기능 스위치(feature toggle)의 상태. | [[abaphandler_meth_global_features|FOR GLOBAL FEATURES]] (반드시 구현) |

instance feature control 의 쓰임새를 예로 들면, BO 인스턴스의 상태가 "보관됨"이면 변경하는 작업을 모두 막을 수 있습니다.

### 막힌 작업은 어떻게 되나

- instance feature control 로 막힌 작업은 OData 애플리케이션 화면에서 회색으로 보입니다.
- 바깥의 RAP BO consumer(사용자)가 막힌 작업을 EML 로 실행하려 하면 작업이 실패하고, [[abapeml_response|failed]] 구조에 항목이 돌아옵니다.

### features:instance 를 붙일 수 있는 작업

- [[abenbdl_standard_operations|standard operation]] `update` 와 `delete`
- [[abenbdl_association|association 작업]]
- [[abenbdl_action|action]]
- [[abenbdl_draft_action|draft action]] `Edit`
- RAP 계층 action
- [[abenbdl_function|function]]

### features:global 을 붙일 수 있는 작업

- [[abenbdl_standard_operations|standard operation]] `create`, `update`, `delete`
- [[abenbdl_association|association 작업]]
- [[abenbdl_action|action]]
- RAP 계층 action
- [[abenbdl_function|function]]

## 예제

### instance feature control

승인된(`Status = 'A'`) 여행은 수정하지 못하게 합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update ( features : instance );
  delete;
}
```

```abap
METHOD get_instance_features.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  " 승인된 여행은 수정을 막는다
  result = VALUE #( FOR ls_travel IN lt_travel
                    ( %tky             = ls_travel-%tky
                      %features-%update = COND #( WHEN ls_travel-status = 'A'
                                                  THEN if_abap_behv=>fc-o-disabled
                                                  ELSE if_abap_behv=>fc-o-enabled ) ) ).
ENDMETHOD.
```

승인된 여행과 승인되지 않은 여행을 EML 로 함께 수정하면, 승인되지 않은 여행만 바뀝니다. 승인된 여행의 수정은 실패하고 `failed` 구조에 항목이 돌아옵니다.

### global feature control

삭제를 밤 10시부터 아침 6시 사이에만 허용합니다. 인스턴스가 무엇이든 똑같이 적용됩니다.

```bdl
delete ( features : global );
```

```abap
METHOD get_global_features.
  DATA(lv_time) = cl_abap_context_info=>get_system_time( ).

  " 06시~22시에는 삭제를 막는다
  result-%delete = COND #( WHEN lv_time BETWEEN '060000' AND '220000'
                           THEN if_abap_behv=>fc-o-disabled
                           ELSE if_abap_behv=>fc-o-enabled ).

  IF result-%delete = if_abap_behv=>fc-o-disabled.
    APPEND VALUE #( %msg    = new_message_with_text(
                                severity = if_abap_behv_message=>severity-error
                                text     = '삭제는 밤 10시부터 아침 6시 사이에만 할 수 있습니다.' )
                    %global = if_abap_behv=>mk-on )
           TO reported-travel.
  ENDIF.
ENDMETHOD.
```

낮에 삭제를 시도하면 작업이 막히고 오류 메시지가 돌아옵니다.

## 알아두기

- [[abenbdl_internal|internal]] 작업에는 feature control 을 쓸 수 없습니다.
- 정적 RAP BO 작업에는 global feature control 만 쓸 수 있습니다. instance feature control 은 쓸 수 없습니다.
- [[abapin_local_mode|IN LOCAL MODE]] 를 붙인 EML 호출에서는 feature control 의 실행 시점 확인을 하지 않습니다.
- EML 문 [[abapget_permissions|GET PERMISSIONS]] 로 어떤 작업이 막혀 있는지 알아낼 수 있습니다.
- UI 에서는 feature control 이 RAP 사용자 힌트(consumer hint)로 나타납니다.

## 관련 항목

- [[abaphandler_meth_features]]
- [[abaphandler_meth_global_features]]
- [[abapget_permissions]]
- [[abenbdl_static]]
- [[abenbdl_internal]]
- [[abenbdl_operations_additions]]
