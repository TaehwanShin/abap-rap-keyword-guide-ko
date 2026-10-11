---
title: 수정 handler method (FOR MODIFY)
summary: 생성·수정·삭제, create-by-association, action, draft action 처럼 데이터를 바꾸는 작업을 구현하는 handler method 입니다.
keywords: FOR MODIFY, FOR CREATE, FOR UPDATE, FOR DELETE, FOR ACTION, 수정 핸들러 메서드, 생성, 수정, 삭제, 액션, create by association, activate, edit, discard, resume, additionalsave, 초안 액션, REQUEST, RESULT, failed, reported, mapped
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR MODIFY
   [IMPORTING] { REFERENCE(im_par_mod) | im_par_mod }
   FOR { CREATE bdef }
     | { CREATE bdef\_assoc }
     | { UPDATE bdef }
     | { DELETE bdef }
     | { ACTION bdef~action
          [REQUEST { REFERENCE(req_act) | req_act } ]
          [RESULT { REFERENCE(res_act) | res_act }] }
     | { ACTION { bdef~activate
                | bdef~additionalsave
                | bdef~edit
                | bdef~discard
                | bdef~resume } }
   [CHANGING { [failed TYPE data] [reported TYPE data] [mapped TYPE data] }].
```

## 설명

RAP BO entity(엔터티)를 **바꾸는 작업**과 [[abenbdl_augment_projection|작업 augmentation]] 을 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다. 다만 draft 와 관련된 메서드는 이름이 정해져 있습니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `assoc` : association 이름.
- `action` : action 이름.

메서드 하나에 서로 다른 작업을 여러 개 모을 수 있습니다. 이때 한 번의 처리 단계에서 그 작업들이 함께 넘어옵니다.

### 변형과 입력 매개변수

`FOR` 뒤에 무엇을 적느냐에 따라 맡는 작업과 `im_par_mod` 의 타입이 달라집니다. 모두 [[abaptype_table_for|TYPE TABLE FOR ...]] 타입의 내부 테이블이고, `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다.

| 변형 | 맡는 작업 | `im_par_mod` 의 내용과 타입 |
| --- | --- | --- |
| `CREATE bdef` | 생성 | 만들 인스턴스. `TYPE TABLE FOR CREATE bdef` |
| `CREATE bdef\_assoc` | create-by-association | 만들 인스턴스. `TYPE TABLE FOR CREATE bdef\_assoc` |
| `UPDATE bdef` | 수정 | 바꿀 인스턴스. `TYPE TABLE FOR UPDATE bdef` |
| `DELETE bdef` | 삭제 | 지울 인스턴스의 키. `TYPE TABLE FOR DELETE bdef` |
| `ACTION bdef~action` | action | action 을 실행할 인스턴스의 키. `TYPE TABLE FOR ACTION IMPORT bdef~action` |
| `ACTION bdef~activate` | draft action `activate` | 실행할 인스턴스의 키. `TYPE TABLE FOR ACTION IMPORT bdef~activate` |
| `ACTION bdef~edit` | draft action `edit` | 실행할 인스턴스의 키. `TYPE TABLE FOR ACTION IMPORT bdef~edit` |
| `ACTION bdef~discard` | draft action `discard` | 실행할 인스턴스의 키. `TYPE TABLE FOR ACTION IMPORT bdef~discard` |
| `ACTION bdef~resume` | draft action `resume` | 실행할 인스턴스의 키. `TYPE TABLE FOR ACTION IMPORT bdef~resume` |
| `ACTION bdef~additionalsave` | draft action `additionalsave` | 아래 따로 설명합니다. |

behavior definition 쪽에 적어야 하는 내용은 다음 항목에 있습니다.

- 생성, create-by-association, 수정: [[abenbdl_association]], [[abenbdl_augment_projection]]
- 삭제: [[abenbdl_standard_operations]]
- action: [[abenbdl_action]], [[abenbdl_determine_action]]
- draft action: [[abenbdl_draft_action]], [[abenbdl_with_draft]]

### response parameter (CHANGING)

모든 변형에서 `failed`, `reported`, `mapped` 를 적지 않고도 쓸 수 있습니다. `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

### REQUEST 와 RESULT (action 전용)

- `REQUEST req_act` : draft action 이 아닌 action 가운데, behavior definition 에 매개변수를 달아 선언한 action 에서만 쓸 수 있습니다. 원문은 `req_act` 를 `TYPE STRUCTURE FOR GLOBAL FEATURES REQUEST bdef~action` 타입의 구조라고 적고 있습니다. 그런데 [[abaptype_structure_for]] 의 원문은 `GLOBAL FEATURES REQUEST` 를 global feature control(기능 제어)에 쓰는 타입으로 설명하고, action 에는 `ACTION REQUEST bdef~action` 을 따로 둡니다. 두 설명이 서로 맞지 않으므로 타입을 직접 적을 때는 [[abaptype_structure_for]] 를 확인합니다.
- `RESULT res_act` : draft action 이 아닌 action 가운데, behavior definition 에 결과(`result`)를 달아 선언한 action 에서만 쓸 수 있습니다. `res_act` 는 [[abaptype_table_for|TYPE TABLE FOR ACTION RESULT bdef~action]] 타입의 내부 테이블이고, 참조로 넘겨받을 수도 있습니다.

### additionalsave

draft action `additionalsave` 를 처리합니다. 이름은 정해져 있습니다.

- EML 문으로 직접 부를 수 없고, OData 로도 드러나지 않습니다. 커밋할 때 불립니다.
- draft 인스턴스만을 위한 저장 출구입니다. 예를 들어 내부에서 관리하는 draft 저장소와 나란히 바깥 draft 저장소를 둘 때 씁니다.

`im_par_mod` 에는 [[abapderived_types_cid|%cid]] 와 [[abapderived_types_param|%param]] 이 들어 있습니다. 여기서 `%param` 은 deep structure 입니다.

- 절대 타입 이름은 `\BDEF=NAME\TYPE=%CHANGEOP` 입니다.
- RAP BO 의 entity 마다 내부 테이블이 구성요소로 하나씩 들어 있고, 구성요소 이름은 entity 이름과 같습니다.
- 이 내부 테이블의 줄에는 키(구성요소 묶음 [[abapderived_types_key|%key]], [[abapderived_types_pky|%pky]])와 [[abapderived_types_chg|%chg]] 가 들어 있습니다.
- 이 내부 테이블에는 이름 붙은 구체 타입이 없고, 타입은 동적으로만 얻을 수 있습니다. 절대 타입 이름은 `\BDEF=NAME\ENTITY=NAME\TYPE=CHANGEOP` 입니다.

지금은 다음 제약이 있습니다.

- 생성·수정·삭제된 인스턴스의 키 값만 넘어옵니다. 어느 작업이었는지는 `%chg` 로 알 수 있습니다.
- 트랜잭션에서 어느 필드가 수정되었는지(또는 트랜잭션 끝에 어느 필드가 수정·생성되었는지) 알려면, CDS 뷰에서 읽은 데이터와 EML 읽기 요청의 결과를 비교해야 합니다.
- `activate` 나 `discard` 가 불린 뒤 draft 인스턴스가 지워졌는지는 직접 알맞게 보관해 두었다가 `additionalsave` 에서 써야 합니다.

## 예제

unmanaged 여행 RAP BO 의 수정 handler method 선언입니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS create FOR MODIFY
      IMPORTING entities FOR CREATE travel.

    METHODS update FOR MODIFY
      IMPORTING entities FOR UPDATE travel.

    METHODS delete FOR MODIFY
      IMPORTING keys FOR DELETE travel.

    " create-by-association: 여행 아래에 예약을 만든다
    METHODS cba_booking FOR MODIFY
      IMPORTING entities_cba FOR CREATE travel\_booking.

    " 결과가 있는 action
    METHODS accepttravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~accepttravel RESULT result.

    " draft action (with additional implementation 일 때)
    METHODS activate FOR MODIFY
      IMPORTING keys FOR ACTION travel~activate.
ENDCLASS.
```

`create` 에서는 받은 인스턴스를 버퍼에 넣고, 어떤 `%cid` 가 어떤 키가 되었는지 `mapped` 로 알려 줍니다. `lcl_buffer` 는 직접 만든 transactional buffer(트랜잭션 버퍼) 클래스입니다.

```abap
METHOD create.
  LOOP AT entities INTO DATA(ls_entity).
    IF line_exists( lcl_buffer=>mt_travel[ travelid = ls_entity-travelid ] ).
      " 같은 키가 이미 있으면 만들지 않는다
      APPEND VALUE #( %cid        = ls_entity-%cid
                      travelid    = ls_entity-travelid
                      %fail-cause = if_abap_behv=>cause-conflict )
             TO failed-travel.
      CONTINUE.
    ENDIF.

    APPEND CORRESPONDING #( ls_entity ) TO lcl_buffer=>mt_travel.

    APPEND VALUE #( %cid     = ls_entity-%cid
                    travelid = ls_entity-travelid ) TO mapped-travel.
  ENDLOOP.
ENDMETHOD.
```

여러 작업을 메서드 하나에 모아 선언할 수도 있습니다.

```abap
METHODS modify_travel FOR MODIFY
  IMPORTING lt_create FOR CREATE travel
            lt_update FOR UPDATE travel
            lt_delete FOR DELETE travel.
```

## 알아두기

- `REQUEST` 와 `RESULT` 는 draft action(`activate`, `edit`, `discard`, `resume`, `additionalsave`)에는 쓸 수 없습니다.
- draft action 의 메서드 이름은 마음대로 정할 수 없습니다.
- `additionalsave` 는 EML 로 부를 수 없고 OData 에도 나오지 않습니다.
- projection RAP BO 에서 `augment_create`, `augment_update`, `augment_cba_assoc`(`assoc` 는 association 이름) 세 handler method 를 쓰는 모습은 [[abeneml_modify_augmenting_abexa]] 에 있습니다.

## 관련 항목

- [[abapmethods_for_rap_behv]]
- [[abenbdl_action]]
- [[abenbdl_standard_operations]]
- [[abenbdl_association]]
- [[abenbdl_draft_action]]
- [[abenbdl_augment_projection]]
- [[abaptype_table_for]]
- [[abenrap_handler_methods_abexa]]
- [[abenbdl_action_abexas]]
- [[abeneml_modify_augmenting_abexa]]
