---
title: RAP saver class (CL_ABAP_BEHAVIOR_SAVER_FAILED)
summary: late save phase 에서 생긴 오류를 런타임 오류 대신 failed 와 reported 로 알릴 수 있게 해 주는, 예외적인 경우에만 쓰는 세이버 기반 클래스입니다.
keywords: CL_ABAP_BEHAVIOR_SAVER_FAILED, RAP saver class, 세이버 클래스, 늦은 저장 단계, late save phase, failed, reported, adjust_numbers, save, save_modified, sy-subrc 8, ROLLBACK ENTITIES, CX_SADL_DUMP_APPL_MODEL_ERROR, BAPI
---

## 문법

[[abenbdl_impl_type|unmanaged]] 시나리오. `adjust_numbers` 는 [[abenbdl_late_numbering|late numbering]] 을 쓸 때만 있습니다.

```syntax
CLASS lsc_bdef DEFINITION
  INHERITING FROM CL_ABAP_BEHAVIOR_SAVER_FAILED [ABSTRACT] [FINAL].
  PROTECTED SECTION.
      ...
      METHODS adjust_numbers REDEFINITION.
      METHODS save REDEFINITION.
      ...
ENDCLASS.

CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD adjust_numbers. ... ENDMETHOD.
      METHOD save. ... ENDMETHOD.
      ...
ENDCLASS.
```

[[abenbdl_saving|additional save 또는 unmanaged save]] 를 쓰는 managed 시나리오.

```syntax
CLASS lsc_bdef DEFINITION
  INHERITING FROM CL_ABAP_BEHAVIOR_SAVER_FAILED [ABSTRACT] [FINAL].
  PROTECTED SECTION.
      ...
     METHODS adjust_numbers REDEFINITION.
     METHODS save_modified REDEFINITION.
      ...
ENDCLASS.

CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD adjust_numbers. ... ENDMETHOD.
      METHOD save_modified. ... ENDMETHOD.
      ...
ENDCLASS.
```

`...` 자리에 구현할 수 있는 나머지 메서드는 [[abenabp_cl_abap_beh_saver]] 의 문법 틀과 같습니다.

## 설명

`CL_ABAP_BEHAVIOR_SAVER_FAILED` 는 saver class(세이버 클래스) `lsc_bdef` 가 상속하는 또 하나의 기반 클래스입니다. 기본 기반 클래스 [[abenabp_cl_abap_beh_saver|CL_ABAP_BEHAVIOR_SAVER]] 와 공통인 점은 다음과 같습니다.

- saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드에 정의해야 합니다.
- saver method(세이버 메서드)는 기반 클래스의 메서드를 다시 정의해 선언합니다. 꼭 구현해야 하는 것과 골라서 구현하는 것이 있고, response parameter(응답 매개변수)가 암묵적으로 들어 있습니다. 어떤 response parameter 가 있는지는 메서드마다 다릅니다. [[abensaver_method_cleanup|cleanup]] 과 [[abapsaver_class_cleanup_finalize|cleanup_finalize]] 에는 매개변수가 하나도 없습니다.
- 따로 적지 않아도 `ABSTRACT` 이면서 `FINAL` 입니다. RAP 런타임 엔진만 인스턴스를 만들고 부릅니다.
- saver method 는 지금 RAP 트랜잭션에서 데이터를 한 번이라도 성공적으로 바꾼 뒤, save sequence(저장 순서)가 시작되면 불립니다. save sequence 는 예를 들어 [[abapcommit_entities|COMMIT ENTITIES]] 로 시작됩니다.
- `cleanup` 은 여기서 벗어납니다. `cleanup` 항목의 원문은 interaction phase(상호작용 단계)에서 읽기만 하고 `COMMIT ENTITIES` 를 실행하면 `cleanup` 만 불린다고 적고 있습니다. `ROLLBACK ENTITIES` 로 되돌리기를 요청했을 때도 `cleanup` 이 불립니다.
- [[abaprap_saver_meth_save_modified|save_modified]] 말고는 인스턴스 데이터를 입력 매개변수로 받지 않습니다. 그래서 직접 구현할 때는 transactional buffer(트랜잭션 버퍼)에서 데이터를 다뤄야 합니다.

### 무엇이 다른가

원칙은 이렇습니다. late save phase(늦은 저장 단계)에서는 실패가 생기면 안 됩니다. 저장이 성공하려면 문제는 early save phase(이른 저장 단계)에서 걸러 내야 합니다. `CL_ABAP_BEHAVIOR_SAVER_FAILED` 는 이 원칙을 지킬 수 없는 예외적인 경우에 씁니다.

이 기반 클래스를 쓰면 late save phase 의 세 메서드에 response parameter `failed` 와 `reported` 가 생깁니다.

| 메서드 | 쓰이는 곳 |
| --- | --- |
| [[abensaver_adjust_numbers|adjust_numbers]] | late numbering 시나리오 |
| [[abensaver_method_save|save]] | unmanaged RAP BO |
| [[abaprap_saver_meth_save_modified|save_modified]] | saver class 가 있는 managed RAP BO |

late save phase 에서 오류가 생겼을 때 메서드 안에서 이 response parameter 를 채우면, 원칙을 어겨서 나는 런타임 오류를 피할 수 있습니다. RAP BO consumer(사용자)는 그 내용을 보고 알맞게 대응할 수 있습니다.

### RAP BO consumer 쪽에서 할 일

- 응답을 받으려면 예를 들어 `COMMIT ENTITIES` 문의 [[abapemlcommit_entities_long|긴 형식]]을 씁니다.
- late save phase 에서 실패하면 `COMMIT ENTITIES` 뒤의 `sy-subrc` 가 8 이 됩니다.
- late save phase 에서 오류가 나면 지금 RAP 트랜잭션은 일관되지 않은 상태가 됩니다. 오류 뒤에 EML 요청을 계속하려면 [[abaprollback_entities|ROLLBACK ENTITIES]] 로 모든 변경을 마지막 일관된 상태까지 되돌려야 합니다. 되돌리지 않으면 예외 `CX_SADL_DUMP_APPL_MODEL_ERROR` 가 일어납니다.

## 예제

`with unmanaged save` 로 선언한 managed 여행 RAP BO 입니다. 저장과 점검을 한 번에 하는 기존 저장 기능 `zcl_travel_legacy=>save` 를 부르고, 저장하지 못한 여행을 `failed` 와 `reported` 로 알립니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver_failed.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    LOOP AT create-travel INTO DATA(ls_travel).
      " 기존 저장 기능이 거절하면 abap_false 를 돌려준다고 가정한다
      IF zcl_travel_legacy=>save( ls_travel-travelid ) = abap_true.
        CONTINUE.
      ENDIF.

      " late save phase 의 실패를 response parameter 로 알린다
      APPEND VALUE #( travelid    = ls_travel-travelid
                      %fail-cause = if_abap_behv=>cause-unspecific )
             TO failed-travel.
      APPEND VALUE #( travelid = ls_travel-travelid
                      %msg     = new_message_with_text(
                                   severity = if_abap_behv_message=>severity-error
                                   text     = '여행을 저장하지 못했습니다.' ) )
             TO reported-travel.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer 는 긴 형식의 `COMMIT ENTITIES` 로 응답을 받고, 실패했으면 되돌립니다.

```abap
COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED DATA(ls_failed_late)
  REPORTED DATA(ls_reported_late).

IF sy-subrc = 8.
  " late save phase 에서 실패했다. 계속하려면 먼저 되돌린다
  ROLLBACK ENTITIES.
ENDIF.
```

## 알아두기

- 이 기반 클래스는 예외적인 경우에만 쓰는 것이 좋습니다. RAP BO 가 여럿 얽혀 있으면 데이터가 어긋날 위험이 있습니다.
- 예외적인 경우의 예로는 RAP BO 의 실행 과정에 BAPI 가 들어 있고, late save phase 에서 그 BAPI 를 불러 인스턴스를 저장하는 경우가 있습니다. 이런 BAPI 는 validation 과 저장을 한 번에 하게 만들어져 있을 수 있습니다. late save phase 에서 부르면 validation 이 너무 늦어서, 보통은 RAP BO consumer 가 오류에 대응할 수 없습니다.
- 그런 경우에 late numbering 까지 쓴다면 주의할 점이 있습니다. 임시 키와 식별자(예: [[abapderived_types_pid|%pid]])를 최종 키 값으로 바꾸는 일은 `adjust_numbers` 가 맡고, 최종 키 값도 여기서 돌려줘야 합니다. `save` 나 `save_modified` 에서는 이미 늦습니다. 그래서 저장까지 하는 BAPI 호출을 `adjust_numbers` 안에서 해야 합니다.
- `adjust_numbers` 에는 어느 기반 클래스를 쓰든 `reported` 가 있습니다. 이 기반 클래스를 쓰면 `failed` 가 더 생깁니다.
- ADT 는 saver class 를 자동으로 만들 때 `CL_ABAP_BEHAVIOR_SAVER` 를 씁니다. 이 기반 클래스로 바꾸는 일은 손으로 해야 합니다.
- `CL_ABAP_BEHAVIOR_SAVER_FAILED` 는 behavior pool 에서 saver method 를 다시 정의하는 데에만 쓸 수 있습니다.
- RAP BO 하나에 saver class 는 하나만 구현할 수 있습니다.

## 관련 항목

- [[abenabp_cl_abap_beh_saver]]
- [[abencl_abap_beh_saver_failed_abexa]]
- [[abensaver_adjust_numbers]]
- [[abensaver_method_save]]
- [[abaprap_saver_meth_save_modified]]
- [[abapemlcommit_entities_long]]
- [[abaprollback_entities]]
