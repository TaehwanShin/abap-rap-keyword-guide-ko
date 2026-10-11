---
title: RAP handler method (METHODS ... FOR)
summary: handler class 안에서 METHODS 문에 FOR MODIFY, FOR READ, FOR LOCK 같은 RAP 전용 낱말을 붙여 handler method 를 선언하는 문법입니다.
keywords: METHODS FOR, RAP handler method, 핸들러 메서드, FOR MODIFY, FOR READ, FOR LOCK, FOR DETERMINE, FOR VALIDATE, FOR FEATURES, FOR AUTHORIZATION, FOR NUMBERING, FOR PRECHECK, IMPORTING, CHANGING, failed, reported, mapped, REQUEST, RESULT
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR { DETERMINE ON { SAVE | MODIFY } ... [IMPORTING] ... FOR ... }
     | { GLOBAL AUTHORIZATION ... [IMPORTING] ... FOR ... }
     | { GLOBAL FEATURES ... [IMPORTING] ... FOR ... }
     | { [INSTANCE] AUTHORIZATION ... [IMPORTING] ... FOR ... }
     | { [INSTANCE] FEATURES ... [IMPORTING] ... FOR ... }
     | { LOCK ... [IMPORTING] ... FOR ... }
     | { MODIFY ... [IMPORTING] ... FOR ... }
     | { NUMBERING ... [IMPORTING] ... FOR ... }
     | { PRECHECK ... [IMPORTING] ... FOR ...  }
     | { READ ... [IMPORTING] ... FOR ... }
     | { VALIDATE ON SAVE ... [IMPORTING] ... FOR ... }

[CHANGING { [failed TYPE data] [reported TYPE data] [mapped TYPE data] }].
```

handler method 구현

```syntax
METHOD meth.
   ...
ENDMETHOD.
```

## 설명

handler method 는 behavior pool(동작 풀)의 [[abenabp_cl_abap_beh_handler|handler class]] 안에서 선언하고 구현합니다. `METHODS` 문에 `FOR MODIFY`, `FOR CREATE`, `FOR READ` 같은 RAP 전용 낱말을 쓰고, 경우에 따라 `REQUEST`, `RESULT` 같은 낱말도 씁니다. 이 낱말들 뒤에 오는 매개변수는 BDEF derived type(BDEF 파생 타입)으로 타입이 정해집니다.

### 종류

`FOR` 뒤에 오는 낱말이 메서드가 맡는 일을 정합니다.

| 선언 | 맡는 일 | 항목 |
| --- | --- | --- |
| `FOR MODIFY` | 생성·수정·삭제, action | [[abaphandler_meth_modify]] |
| `FOR READ` | 읽기, read-by-association, function | [[abaphandler_meth_read]] |
| `FOR LOCK` | 잠금 | [[abaphandler_meth_lock]] |
| `FOR DETERMINE ON SAVE`, `FOR DETERMINE ON MODIFY` | determination | [[abaphandler_meth_det]] |
| `FOR VALIDATE ON SAVE` | validation | [[abaphandler_meth_validate]] |
| `FOR [INSTANCE] AUTHORIZATION` | instance 권한 | [[abaphandler_meth_auth]] |
| `FOR GLOBAL AUTHORIZATION` | global 권한 | [[abaphandler_meth_global_auth]] |
| `FOR [INSTANCE] FEATURES` | instance feature control(기능 제어) | [[abaphandler_meth_features]] |
| `FOR GLOBAL FEATURES` | global feature control | [[abaphandler_meth_global_features]] |
| `FOR NUMBERING` | early numbering | [[abaphandler_meth_numbering]] |
| `FOR PRECHECK` | precheck | [[abaphandler_meth_precheck]] |

### 메서드 이름

메서드 이름 `meth` 는 마음대로 정합니다. 다만 다음은 이름이 정해져 있습니다.

- 미리 정의된 [[abenbdl_draft_action|draft action]]의 메서드. behavior definition(동작 정의)에 `with additional implementation` 을 붙였을 때만 구현이 쓰입니다.
- [[abenbdl_augment_projection|augment]] 작업의 메서드.
- [[abaprap_handler_default_val_func|default values function]]의 메서드.

### 매개변수

- 거의 모든 매개변수는 BDEF derived type 이고, [[abapderived_types_comp|RAP 구성요소]]가 들어 있습니다. 매개변수 이름은 마음대로 정합니다.
- handler method 에는 입력 매개변수가 적어도 하나 있어야 합니다. `IMPORTING` 은 적지 않아도 그렇게 처리되므로 생략할 수 있습니다.
- 모든 handler method 에는 `CHANGING` 매개변수가 있습니다. 그 가운데 `mapped`(키 대응 정보), `failed`(실패 정보), `reported`(메시지)는 이름이 정해져 있고, 적지 않아도 쓸 수 있습니다. 셋 가운데 어느 것을 쓸 수 있는지는 메서드 종류에 따라 다릅니다.
- `CHANGING` 과 이 매개변수들을 드러내 적어도 됩니다. 이때 타입은 일반 타입 `DATA` 로 적습니다. 실행할 때에는 저절로 [[abaptype_response_for|TYPE RESPONSE FOR]] derived type 이 됩니다.
- 매개변수는 많은 경우 참조로 넘길 수 있지만(`REFERENCE`), 값으로 넘길 수는 없습니다(`VALUE`). 그래서 메서드 안에서 입력 매개변수를 바꿀 수 없습니다.

### handler class 에 꼭 있어야 하는 메서드

원문은 handler class(핸들러 클래스)마다 이름이 미리 정해진 세 메서드 `MODIFY`, `READ`, `LOCK` 가운데 적어도 하나를 구현해야 한다고 적고 있습니다. 그런데 같은 원문이 메서드 이름은 마음대로 정한다고도 설명합니다. 그래서 이 문장이 메서드 이름을 말하는지 `FOR MODIFY`, `FOR READ`, `FOR LOCK` 같은 종류를 말하는지는 원문만으로 분명하지 않습니다. 그 밖에 도우미 메서드를 더 둘 수 있습니다.

## 예제

unmanaged 여행 RAP BO 의 handler method 선언입니다. `create` 에는 `CHANGING` 매개변수를 드러내 적었습니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS create FOR MODIFY
      IMPORTING entities FOR CREATE travel
      CHANGING failed TYPE DATA mapped TYPE DATA reported TYPE DATA.

    METHODS update FOR MODIFY
      IMPORTING entities FOR UPDATE travel.

    METHODS delete FOR MODIFY
      IMPORTING keys FOR DELETE travel.

    METHODS cba_booking FOR MODIFY
      IMPORTING entities_cba FOR CREATE travel\_booking.

    METHODS read FOR READ
      IMPORTING keys FOR READ travel RESULT result.

    METHODS rba_booking FOR READ
      IMPORTING keys_rba FOR READ travel\_booking
      FULL result_requested RESULT result LINK association_links.
ENDCLASS.
```

여러 작업을 메서드 하나에 모을 수도 있습니다.

```abap
METHODS modify_travel FOR MODIFY
  IMPORTING lt_create FOR CREATE travel
            lt_update FOR UPDATE travel
            lt_delete FOR DELETE travel
            lt_accept FOR ACTION travel~accepttravel
            lt_cba    FOR CREATE travel\_booking.
```

구현에서는 처리하지 못한 인스턴스를 `failed` 와 `reported` 에 채워 돌려줍니다. `lcl_buffer` 는 직접 만든 transactional buffer(트랜잭션 버퍼) 클래스입니다.

```abap
METHOD delete.
  LOOP AT keys INTO DATA(ls_key).
    IF NOT line_exists( lcl_buffer=>mt_travel[ travelid = ls_key-travelid ] ).
      " 지울 여행이 없으면 실패 원인과 메시지를 남긴다
      APPEND VALUE #( %tky        = ls_key-%tky
                      %fail-cause = if_abap_behv=>cause-not_found )
             TO failed-travel.
      APPEND VALUE #( %tky = ls_key-%tky
                      %msg = new_message_with_text(
                               severity = if_abap_behv_message=>severity-error
                               text     = '여행을 찾지 못했습니다.' ) )
             TO reported-travel.
      CONTINUE.
    ENDIF.
    " 버퍼에서 지움 표시를 한다
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- `failed`, `reported`, `mapped` 에는 돌려줄 정보를 채우는 것이 좋습니다. 인스턴스를 읽지 못했을 때가 그런 경우입니다. 각 매개변수의 구성요소는 어떤 BDEF derived type 이냐에 따라 달라집니다.
- ADT 의 F2 도움말에는 `failed`, `reported`, `mapped` 말고 다른 `CHANGING` 매개변수가 더 보일 때가 있습니다. 예를 들어 `result` 는 `CHANGING` 매개변수이지만 `CHANGING` 낱말로는 적을 수 없고, RAP 전용 낱말 `RESULT` 뒤에 적어야 합니다. 마찬가지로 입력 매개변수 `requested_field` 는 `REQUEST` 낱말과 함께 적습니다.
- `FOR MODIFY` 메서드 하나로 여러 entity(엔터티)와 여러 작업을 한 번에 처리할 수 있습니다. 그래도 읽기 쉽고 덜 복잡하게 하려면 메서드를 나누는 편이 낫습니다. handler class 를 여러 개 두거나 behavior pool 을 여러 개 둘 수도 있습니다.
- handler method 에서는 예외를 일으킬 수 없습니다. 그래서 `RAISING` 추가 구문을 쓸 수 없습니다.

## 관련 항목

- [[abenabp_cl_abap_beh_handler]]
- [[abaptype_response_for]]
- [[abapderived_types_comp]]
- [[abenrap_handler_methods_abexa]]
- [[abeneml_modify_augmenting_abexa]]
- [[abaprap_handler_default_val_func]]
