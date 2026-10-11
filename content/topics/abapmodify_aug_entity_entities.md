---
title: MODIFY AUGMENTING ENTITY, ENTITIES 문
summary: projection 의 핸들러에서 base BO 로 넘어가는 수정 요청에 필드 값이나 작업을 보태는 MODIFY 문의 특수한 꼴입니다.
keywords: MODIFY AUGMENTING ENTITY, MODIFY AUGMENTING ENTITIES, AUGMENTING, RELATING TO, BY, augment, 보강, 프로젝션, projection, 기반 BO, base BO, ABP_BEHV_RELATING_TAB, %control, %cid
---

## 문법

```syntax
MODIFY AUGMENTING { ENTITY bdef
                      operations [RELATING TO orig BY rela] }
                | { ENTITIES OF bdef
                      ENTITY bdef1 operations [RELATING TO orig BY rela]
                     [ENTITY bdef2 operations [RELATING TO orig BY rela]]
                     [...] }.
```

## 설명

[[abapmodify_entity_entities|MODIFY ENTITY, ENTITIES]] 의 특수한 꼴이고, projection 에서만 쓸 수 있습니다. RAP BO provider(제공자)만 쓸 수 있습니다. projection 으로 들어온 요청은 base BO(기반 BO) 로 넘어가는데, 핸들러 구현에서 이 문으로 그 요청을 손봅니다. 고칠 수 있는 것은 base BO 의 entity(엔터티)뿐입니다. standard operation(표준 작업)을 모두 쓸 수 있고 action 도 됩니다.

이렇게 요청에 내용을 보태는 것을 augmentation 이라고 합니다. BDEF 쪽에서는 projection BDEF 에 [[abenbdl_augment_projection|augment]] 를 적어 두어야 합니다.

### 짧은 꼴: MODIFY AUGMENTING ENTITY

entity 하나를 대상으로 합니다. `bdef` 에는 projection 이 가리키는 루트 BO 의 **전체 이름**을 적습니다. 별칭은 안 됩니다. [[abapmodify_entity_entities_op|operations]] 자리에 작업을 여러 개 적을 수 있습니다. 그럴 때는 작업마다 맞는 메서드의 입력 매개변수가 있어야 합니다.

### 긴 꼴: MODIFY AUGMENTING ENTITIES OF

entity 를 하나 이상 대상으로 합니다. `bdef` 에는 마찬가지로 projection 이 가리키는 루트 BO 의 전체 이름을 적고, 그 뒤에 entity 별로 묶은 작업 목록을 적습니다.

- `bdef1`, `bdef2` 는 root entity(루트 엔터티) `bdef` 의 composition 트리에 들어 있는 entity 여야 합니다. root entity 자신을 적어도 됩니다.
- 목록의 각 부분은 짧은 꼴과 문법이 같습니다.
- `ENTITY ...` 와 작업 한 쌍은 적어도 하나 있어야 합니다.
- 같은 entity 를 `ENTITY` 뒤에 여러 번 적을 수 있습니다. 다만 같은 entity 에 같은 작업은 한 번만 적을 수 있습니다.

### RELATING TO orig BY rela

보탠 인스턴스를 원래 요청의 인스턴스와 이어 줍니다.

augment 된 요청을 base BO 의 핸들러가 처리하다가 `FAILED` 로 인스턴스를 돌려줄 수 있습니다. 그 인스턴스가 원래 요청에는 없고 augment 하면서 새로 넣은 것이라면, RAP BO consumer(사용자)는 그 응답이 자기 요청의 어느 부분 때문인지 알 수 없습니다. `RELATING TO` 로 관계를 알려 주면 런타임이 새 인스턴스의 `FAILED` 키를 이어진 원래 인스턴스의 키로 바꿔 돌려줍니다. 사용자는 자기가 보낸 인스턴스를 기준으로 오류를 처리할 수 있습니다.

- 작업마다 뒤에 붙일 수 있습니다.
- 보탠 인스턴스가 원래 인스턴스와 키가 같거나 `%cid_ref` 로 원래 인스턴스를 가리키고 있으면 따로 적지 않아도 됩니다.
- `orig` 는 원래 인스턴스 테이블, 곧 augmentation 핸들러가 입력으로 받은 테이블입니다.
- `rela` 는 타입이 `ABP_BEHV_RELATING_TAB` 인 변수입니다. 정수를 담는 표준 테이블입니다.

보탠 인스턴스 테이블을 `augm` 이라고 하면 `rela` 는 다음 조건을 지켜야 합니다. 어기면 런타임 오류가 납니다.

- `augm` 과 `rela` 의 줄 수가 같아야 합니다.
- `rela` 의 값은 모두 0 이상, `lines( orig )` 이하인 정수여야 합니다.

`rela` 의 줄은 같은 자리에 있는 `augm` 줄과 짝을 이룹니다. 값이 0 보다 크면 그 `augm` 줄이 `orig` 의 그 번째 줄과 이어져 있다는 뜻입니다. 값이 0 이면 `orig` 의 어느 줄과도 이어져 있지 않다는 뜻입니다. 그 줄 자체가 원래 인스턴스일 때가 그렇습니다. 보탠 인스턴스 여러 개가 같은 원래 인스턴스 하나에 이어져도 됩니다.

같은 작업(예: `CREATE`)으로 보태는데 인스턴스마다 이어진 원래 테이블이 다르다면, `MODIFY AUGMENTING` 문을 여러 개로 나누어 씁니다.

`augm` 의 인스턴스가 실패하면(잠금을 걸다가, 또는 기반 핸들러가 처리하다가) 이어진 `orig` 인스턴스가 요청 전체의 `FAILED` 응답에 들어갑니다. 잠금을 걸다가 실패했다면 이어진 `orig` 인스턴스는 기반 핸들러로 넘어가지 않습니다.

## 예제

projection BDEF 에서 생성 작업에 `augment` 를 적습니다.

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

projection 의 behavior pool(동작 풀)에서 새 여행에 상태 값을 보탭니다. 원래 요청이 `Status` 를 이미 채웠다면 건드리지 않습니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS augment_create FOR MODIFY
      IMPORTING entities FOR CREATE travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD augment_create.
    " base BO 의 타입으로 선언한다
    DATA lt_augment TYPE TABLE FOR CREATE zr_travel.

    lt_augment = VALUE #( FOR ls_entity IN entities
                          WHERE ( %control-status = if_abap_behv=>mk-off )
                          ( %cid            = ls_entity-%cid
                            travelid        = ls_entity-travelid
                            status          = 'O'
                            %control-status = if_abap_behv=>mk-on ) ).

    " response parameter 는 적지 않는다
    MODIFY AUGMENTING ENTITIES OF zr_travel
      ENTITY zr_travel
        CREATE FROM lt_augment.
  ENDMETHOD.
ENDCLASS.
```

`RELATING TO` 는 작업 뒤에 이렇게 붙입니다. 아래는 수정 작업을 보태는 별도의 코드 조각이라서, 보탤 테이블을 수정용 타입으로 따로 선언합니다. `lt_relating` 의 첫 줄 값이 2 이면, `lt_update` 의 첫 줄이 `entities` 의 둘째 줄에서 비롯했다는 뜻입니다.

```abap
" 수정 작업에 넘길 테이블은 base BO 의 수정용 타입으로 선언한다
DATA lt_update   TYPE TABLE FOR UPDATE zr_travel.
DATA lt_relating TYPE abp_behv_relating_tab.

" 원래 요청에 없는 여행 하나의 상태를 함께 고친다
lt_update = VALUE #( ( travelid        = '00000009'
                       status          = 'X'
                       %control-status = if_abap_behv=>mk-on ) ).

" lt_update 와 줄 수가 같아야 한다
lt_relating = VALUE #( ( 2 ) ).

MODIFY AUGMENTING ENTITIES OF zr_travel
  ENTITY zr_travel
    UPDATE FROM lt_update RELATING TO entities BY lt_relating.
```

## 알아두기

- [[abapeml_response|response parameter]] 를 적을 수 없습니다. `FAILED`, `MAPPED`, `REPORTED` 를 쓰지 못합니다.
- 원래 요청의 필드를 덮어쓰면 안 됩니다. 같은 인스턴스의 같은 필드에 원래 작업과 augmentation 작업이 둘 다 `%control` 표시를 켜서는 안 됩니다.
- 원래 요청에 없는 인스턴스에 작업을 보탤 때는 `RELATING TO` 로 원래 요청의 인스턴스와 이어 주어야 합니다. 그래야 응답을 원래 요청과 맞춰 볼 수 있습니다.
- projection 에서 들어온 생성 요청을 생성이나 create-by-association 작업으로 augment 해도, `mapped` 응답에는 원래 생성 요청의 [[abapderived_types_cid|%cid]] 값만 들어갑니다. augment 하면서 생긴 `%cid` 값은 원래 요청의 `mapped` 응답에 들어가지 않습니다.

## 관련 항목

- [[abeneml_in_abp]]
- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_op]]
- [[abenbdl_augment_projection]]
- [[abapeml_response]]
- [[abeneml_modify_augmenting_abexa]]
- [[abeneml_modify_augm_relating_abexa]]
