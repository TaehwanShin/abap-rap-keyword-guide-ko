---
title: augmentation
summary: projection BDEF 에서 다시 쓰는 생성·수정 요청에, transactional buffer 에 닿기 전 값이나 인스턴스를 덧붙이는 추가 구문입니다.
keywords: augment, 보강, operation augmentation, 작업 보강, RAP BO augmentation, use create ( augment ), use update ( augment ), MODIFY AUGMENTING ENTITIES, projection BDEF, 프로젝션 BDEF, precheck
---

## 문법

```syntax
... augment ...
```

## 설명

`augment` 는 projection BDEF 에서 [[abenbdl_use_projection|use]] 로 다시 쓰는 standard operation(표준 작업)에 붙이는 선택 추가 구문입니다. **projection BDEF 에서만** 쓸 수 있습니다.

augmentation 을 걸면, RAP BO consumer(사용자)가 보낸 요청을 projection 계층에서 먼저 받아 손볼 수 있습니다. 데이터가 transactional buffer(트랜잭션 버퍼)에 닿기 전입니다. 예를 들어 projection BO 로 들어온 요청에 값을 더 채운 다음, base BO(기반 BO)의 handler method(핸들러 메서드)로 넘깁니다.

augment 할 수 있는 작업은 세 가지입니다.

- `create`
- `update`
- create-by-association (create by association)

augmentation 내용은 projection BDEF 의 behavior pool(동작 풀)에, handler method `FOR MODIFY` 로 구현합니다.

### 무엇을 넣을 수 있고 무엇을 못 넣는가

- **원래 요청에 이미 값이 있는 필드는 바꿀 수 없습니다.** RAP 런타임은 이미 값이 있는 필드에 대한 augmentation 요청을 버립니다. 원래 요청에서 지정하지 않은 필드만 채울 수 있습니다.
- **`readonly` 필드에는 값을 넣을 수 없습니다.** augmentation 은 바깥에서 들어온 접근처럼 다뤄집니다. `readonly` 필드에 접근하려 하면 런타임 오류가 납니다. 원문 설명은 이렇지만, 원문 예제([[abenbdl_augment_abexa]])는 projection BDEF 에서 `field ( readonly )` 로 정한 필드를 수정 augmentation 으로 채웁니다. 원문은 이 차이를 따로 설명하지 않습니다.

### 잠금

augmentation 을 실행하는 시점에, 원래 요청에 있던 기반 인스턴스는 프레임워크가 이미 잠가 둔 상태입니다. augmentation 에서 새 인스턴스를 더하면 런타임이 그 인스턴스도 잠그려고 합니다. 잠금에 실패한 인스턴스는 projection 요청의 `FAILED` 응답에 담기고, base BO 로 가는 요청에서는 빠집니다.

### precheck 와 함께 쓸 때

`augment` 와 `precheck` 는 함께 쓸 수 있습니다. base BO 와 projection BO 양쪽에 precheck 메서드가 있으면 실행 순서는 이렇습니다.

1. projection 의 precheck
2. projection 의 augmentation
3. base BO 의 precheck

그래서 base BO 의 precheck 는 augmentation 까지 끝난 요청을 검사합니다.

## 예제

projection BDEF 에서 생성 작업에 augmentation 을 겁니다.

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create ( augment );
  use update;
  use delete;
}
```

projection 의 behavior pool 에서, 새 여행의 `Status` 를 `'N'`(신규)으로 augment 합니다. 덧붙일 내용은 `MODIFY AUGMENTING ENTITIES` 문으로 base BO 에 보냅니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS augment_create FOR MODIFY
      IMPORTING entities FOR CREATE travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD augment_create.
    DATA lt_create   TYPE TABLE FOR CREATE zr_travel.
    DATA lt_relating TYPE abp_behv_relating_tab.

    LOOP AT entities INTO DATA(ls_entity).
      " 덧붙이는 줄이 원래 요청의 몇 번째 줄에 딸린 것인지 적어 둔다
      APPEND sy-tabix TO lt_relating.

      APPEND VALUE #( %cid            = ls_entity-%cid
                      TravelID        = ls_entity-TravelID
                      Status          = 'N'
                      %control-Status = if_abap_behv=>mk-on ) TO lt_create.
    ENDLOOP.

    " 원래 요청에 값을 덧붙여 base BO 로 넘긴다
    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY travel
        CREATE FROM lt_create
        RELATING TO entities BY lt_relating.
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer 가 `Status` 를 직접 보냈다면 그 값이 그대로 남습니다. augmentation 은 원래 요청에서 지정하지 않은 필드만 채웁니다.

## 알아두기

- augmentation 은 projection BO 에서만 쓸 수 있습니다. interface BDEF 나 base BDEF(기반 BDEF)에는 없습니다.
- `delete` 는 augment 할 수 없습니다. `use delete` 에는 `precheck` 만 붙일 수 있습니다.
- 가상 요소처럼 readonly 인 projection 필드를 augmentation 에서 받으려면 [[abenbdl_field_augment]] 로 derived type(파생 타입)에 넣어야 합니다.

## 관련 항목

- [[abenbdl_augment_abexa]]
- [[abenbdl_use_projection]]
- [[abenbdl_field_augment]]
- [[abenbdl_precheck]]
- [[abaphandler_meth_modify]]
- [[abeneml_modify_augmenting_abexa]]
- [[abenbdl_field_char]]
