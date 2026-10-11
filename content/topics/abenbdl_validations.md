---
title: validation
summary: 저장할 때 인스턴스 데이터가 올바른지 확인하고, 틀리면 저장을 막고 메시지를 돌려주는 로직을 선언하는 문법입니다.
keywords: validation, 검증, 유효성 검사, on save, trigger condition, 실행 조건, FOR VALIDATE, create, update, delete, field, failed, reported, ROLLBACK ENTITIES, COMMIT ENTITIES
---

## 문법

```syntax
validation ValName on save { CUD1 | {field Field1};
                           [ CUD2;  ...; ]  [field Field2; ...] }
```

## 설명

validation 은 RAP BO 인스턴스의 데이터가 앞뒤가 맞는지 확인합니다. 직접 부르는 것이 아니라, **실행 조건(trigger condition)** 이 맞으면 RAP 프레임워크가 자동으로 부릅니다.

- validation 은 트랜잭션 끝의 save sequence(저장 순서)에서 불립니다. 그래서 `on save` 를 반드시 적습니다.
- 불린 validation 은 앞뒤가 맞지 않는 인스턴스 데이터가 저장되지 않게 거절하고, 사용자에게 메시지를 돌려줄 수 있습니다.
- behavior pool(동작 풀)의 handler method(핸들러 메서드) [[abaphandler_meth_validate|FOR VALIDATE]] 에 구현해야 합니다.
- 이름 `ValName` 은 [[abenbdl_general_syntax_rules]] 의 이름 규칙을 따릅니다. 길이는 30자까지입니다.

### 실행 조건

실행 조건은 하나 이상 적습니다. 변경 작업([[abenbdl_standard_operations|create, update, delete]])일 수도 있고, 값이 바뀐 필드일 수도 있습니다. 조건 가운데 하나라도 맞으면 validation 이 실행됩니다. draft 인스턴스에서 그 작업이 실행되어도, active(활성) 인스턴스에서 실행되어도 validation 이 일어납니다.

| 조건 | 언제 실행되나 |
| --- | --- |
| `create` | 인스턴스를 만들 때 |
| `update` | 인스턴스를 수정할 때. `create` 와 함께 적어야만 동작합니다. |
| `delete` | 인스턴스를 지울 때 |
| `field Field1, Field2, ...` | 적어 둔 필드의 값이 생성이나 수정 작업으로 바뀔 때. 필드는 validation 이 속한 entity(엔터티)의 것이어야 합니다. |

### validation 이 실패하면

- 작업이 실패하고, 지금 RAP 트랜잭션의 transactional buffer(트랜잭션 버퍼) 내용이 **통째로** 거절됩니다. 데이터베이스에 커밋되는 것은 모든 변경이 앞뒤가 맞을 때뿐입니다. 하나만 틀려도 버퍼의 내용 전부가 거절됩니다.
- 틀린 인스턴스를 바로잡기 전에는 더 이상 데이터를 변경할 수 없습니다. [[abenbdl_standard_operations|수정 작업]]으로 틀린 인스턴스를 고치거나, EML 문 [[abaprollback_entities|ROLLBACK ENTITIES]] 로 transactional buffer 를 비워야 합니다. 틀린 인스턴스가 있으면 [[abapcommit_entities|COMMIT ENTITIES]] 문이 save sequence 를 중단하고 transactional buffer 를 비우지 않기 때문입니다.
- 오류 메시지를 [[abapmodify_entity_entities|MODIFY ENTITIES]] 문의 [[abapeml_response|reported]] 구조에 적을 수 있습니다. 원문 설명은 이렇게 적지만, 원문 예제는 틀린 인스턴스를 만든 뒤 `COMMIT ENTITIES RESPONSE OF ... FAILED ... REPORTED ...` 로 응답을 받습니다.
- 실패한 인스턴스의 키를 [[abapeml_response|failed]] 구조에 적을 수 있습니다.

### 어디에서 쓸 수 있나

- managed RAP BO
- draft 를 쓰는 unmanaged RAP BO
- draft 를 쓰지 않는 unmanaged RAP BO 에서는 쓸 수 없습니다.

## 예제

여행의 시작일이나 종료일이 바뀌면 저장할 때 날짜 순서를 확인합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;

  validation validateDates on save { create; field BeginDate, EndDate; }
}
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validatedates FOR VALIDATE ON SAVE
      IMPORTING keys FOR travel~validatedates.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD validatedates.
    " 확인할 필드만 읽는다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( begindate enddate ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    LOOP AT lt_travel INTO DATA(ls_travel).
      IF ls_travel-enddate < ls_travel-begindate.
        " 실패한 인스턴스의 키와 메시지를 돌려준다
        APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
        APPEND VALUE #( %tky             = ls_travel-%tky
                        %msg             = new_message_with_text(
                                             severity = if_abap_behv_message=>severity-error
                                             text     = '종료일이 시작일보다 빠릅니다.' )
                        %element-enddate = if_abap_behv=>mk-on )
               TO reported-travel.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

올바른 여행 하나와 틀린 여행 둘을 **한 트랜잭션**에서 만들면, 올바른 여행까지 모두 거절됩니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid begindate enddate ) WITH VALUE #(
      ( %cid = '1' travelid = '00000001' begindate = '20260301' enddate = '20260305' )
      ( %cid = '2' travelid = '00000002' begindate = '20260310' enddate = '20260301' )
      ( %cid = '3' travelid = '00000003' begindate = '20260320' enddate = '20260315' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).

" 틀린 인스턴스가 있으므로 아무것도 저장되지 않는다
" 저장할 때 나온 실패와 메시지는 커밋의 응답으로 받는다
COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED FINAL(ls_failed_commit)
  REPORTED FINAL(ls_reported_commit).
```

올바른 여행을 따로 만들어 먼저 `COMMIT ENTITIES` 를 하면 그 여행은 저장됩니다. 그 뒤 틀린 여행을 만들어 커밋에 실패한 채로 두면, 다음에 올바른 여행을 또 만들어도 커밋이 실패합니다. 틀린 인스턴스를 먼저 고치거나 없애야 합니다.

## 알아두기

- validation 끼리의 실행 순서는 정해져 있지 않습니다. 같은 조건으로 실행되는 validation 이 여러 개면 어느 것이 먼저 돌지 알 수 없습니다.
- validation 의 구현 안에서는 EML [[abapmodify_entity_entities|MODIFY]] 문을 쓸 수 없습니다.
- [[abenbdl_field_char|field characteristics]] `notrigger[:warn]` 이 붙은 필드는 실행 조건에 쓰면 안 됩니다.
- 실행 조건 `update` 는 `create` 와 함께 적어야만 동작합니다.

## 관련 항목

- [[abenbdl_validation_abexa]]
- [[abaphandler_meth_validate]]
- [[abenbdl_determinations]]
- [[abenbdl_determine_action]]
- [[abenbdl_draft_action]]
- [[abenbdl_precheck]]
- [[abaprollback_entities]]
- [[abapcommit_entities]]
