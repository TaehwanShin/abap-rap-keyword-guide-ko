---
title: 작업 묶음 (%op)
summary: standard operation·action·association 표시와 %element 를 한 이름으로 묶은 구성요소 묶음입니다. 메시지와 authorization control 에서 어떤 작업 이야기인지 가리킵니다.
keywords: %op, 작업 묶음, 구성요소 묶음, %create, %update, %delete, %action, %assoc, %element, FAILED, REPORTED, INSTANCE AUTHORIZATION RESULT, get_instance_authorizations, auth-allowed, auth-unauthorized, ABP_BEHV_FLAG, FILLED_COMPONENTS_X
---

## 설명

`%op` 는 BDEF derived type(BDEF 파생 타입)의 구성요소 묶음입니다. RAP 메시지와 authorization control(권한 제어)에서 쓰는 다음 구성요소를 한 이름 아래로 묶습니다.

- standard operation(표준 작업, [[abenbdl_standard_operations]]) 표시 : [[abapderived_types_create]] 등
- non-standard operation(비표준 작업, [[abenbdl_nonstandard]]) 표시 : [[abapderived_types_action]]
- BDEF 에 정의한 association
- [[abapderived_types_element]]

묶음 안의 구성요소에 표시를 해서 "어떤 작업 이야기인가"를 알립니다. 예를 들어 response parameter(응답 매개변수)에서 `%op-%create` 에 표시가 되어 있으면, 그 메시지는 생성 작업과 관련된 것입니다.

구성요소 묶음이므로 `%op-%delete` 라고 써도 되고 `%delete` 라고만 써도 됩니다.

### 타입

구성요소 타입은 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `FAILED [EARLY|LATE]`
- `REPORTED [EARLY|LATE]`
- `[INSTANCE] AUTHORIZATION RESULT`

## 예제

instance 권한 handler method(핸들러 메서드)에서 `%op` 를 채워 돌려줍니다. 승인된 여행(`Status = 'A'`)은 지우거나 다시 승인할 수 없게 합니다.

```abap
METHOD get_instance_authorizations.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky = ls_travel-%tky
      %op  = VALUE #(
        %delete              = COND #( WHEN ls_travel-status = 'A'
                                       THEN if_abap_behv=>auth-unauthorized
                                       ELSE if_abap_behv=>auth-allowed )
        %action-accepttravel = COND #( WHEN ls_travel-status = 'A'
                                       THEN if_abap_behv=>auth-unauthorized
                                       ELSE if_abap_behv=>auth-allowed ) ) ) ).
ENDMETHOD.
```

## 알아두기

- 권한 쪽 쓰이는 곳은 `INSTANCE AUTHORIZATION RESULT` 만 적혀 있습니다.
- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드는 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 값이 채워진 구성요소만 골라 처리하게 도와줍니다. 표시로 이루어진 derived type 구조를 살필 때 쓸모 있습니다.

## 관련 항목

- [[abapderived_types_create]]
- [[abapderived_types_update]]
- [[abapderived_types_delete]]
- [[abapderived_types_action]]
- [[abapderived_types_assoc]]
- [[abapderived_types_element]]
- [[abenbdl_authorization]]
- [[abenderived_types_misc_abexa]]
