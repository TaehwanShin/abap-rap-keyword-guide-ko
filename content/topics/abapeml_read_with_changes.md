---
title: READ 의 WITH CHANGES 추가 구문
summary: 한 RAP 트랜잭션 안에서 인스턴스가 새로 만들어졌는지, 고쳐졌는지, 지워졌는지를 읽기 결과의 %chg 와 %control 로 알려 주는 READ 문의 추가 구문입니다.
keywords: WITH CHANGES, %chg, %control, TABLE FOR READ CHANGES, IN LOCAL MODE, cop-create, cop-update, cop-recreate, typekind-result_chg, BEHAVIOR_ILLEGAL_TYPE, 변경 정보, 누적 변경, 관리형
---

## 문법

짧은 형식

```syntax
READ ENTITY IN LOCAL MODE bdef WITH CHANGES ...
```

긴 형식

```syntax
READ ENTITIES OF bdef IN LOCAL MODE ENTITY entity ... WITH CHANGES ...
```

## 설명

`WITH CHANGES` 를 붙이면 인스턴스 데이터와 함께, **지금 RAP 트랜잭션 안에서 그 인스턴스에 쌓인 변경 작업 정보**를 읽습니다. 인스턴스가 그대로인지, 새로 만들어졌는지, 고쳐졌는지, 지워졌는지를 알 수 있습니다.

이 추가 구문을 쓰면 [[abapeml_result|RESULT]] 뒤에 `TYPE TABLE FOR READ CHANGES` 타입의 데이터 객체가 와야 합니다. 이 타입에는 인스턴스 데이터 말고 두 가지가 더 있습니다.

- [[abapderived_types_chg|%chg]] : 쌓인 작업이 무엇인지 알려 줍니다.
- [[abapderived_types_control|%control]] : 어떤 필드가 바뀌었는지 알려 줍니다. 다만 `%chg` 가 `if_abap_behv=>cop-create`, `if_abap_behv=>cop-update`, `if_abap_behv=>cop-recreate` 가운데 하나일 때만 채워집니다. 그 밖에는 `%control` 이 비어 있습니다.

managed RAP BO 에서는 BDEF 에 따로 적지 않아도 이 기능을 쓸 수 있습니다. unmanaged 에서는 지원하지 않습니다. 그래서 unmanaged RAP BO 의 구현 클래스에서는 `WITH CHANGES` 를 쓸 수 없고, `TYPE TABLE FOR READ CHANGES` 같은 BDEF derived type(BDEF 파생 타입)도 만들 수 없습니다.

쓰임새는 다음과 같습니다.

- 권한 확인과 feature control(기능 제어)를 상황에 맞게 바꿀 때. 특히 저장하려는 새 인스턴스를 다룰 때 씁니다.
- 제어 표시를 받는 옛 API 를 부를 때. 예를 들어 saver method(세이버 메서드) [[abensaver_finalize|finalize]] 에서 부를 때입니다.
- RAP BO consumer(사용자)가 특정 변경에 반응할 수 있게 할 때.

### 동적 형식에서

동적 `READ` 문에는 `WITH CHANGES` 추가 구문이 없습니다. 대신 이렇게 합니다.

- 문장에 `IN LOCAL MODE` 를 적습니다. (`READ ENTITIES IN LOCAL MODE OPERATIONS ...`)
- 피연산자 테이블(타입 `ABP_BEHV_RETRIEVALS_TAB`, 줄 타입 `ABP_BEHV_RETRIEVALS`)의 `full` 구성요소에 `if_abap_behv=>typekind-result_chg` 를 넣습니다. 그러면 `WITH CHANGES` 가 적용되고 결과 타입에 `%chg` 가 들어갑니다.
- `results` 가 가리키는 테이블은 `TYPE TABLE FOR READ CHANGES` 로 선언해야 합니다. 그렇지 않으면 런타임 오류 `BEHAVIOR_ILLEGAL_TYPE` 이 납니다.

## 예제

action 핸들러 안에서, 넘어온 여행들이 이번 트랜잭션에서 어떻게 바뀌었는지 읽습니다.

```abap
DATA lt_changes TYPE TABLE FOR READ CHANGES zr_travel.

READ ENTITY IN LOCAL MODE zr_travel
  WITH CHANGES
  ALL FIELDS WITH CORRESPONDING #( keys )
  RESULT lt_changes
  FAILED failed.

LOOP AT lt_changes ASSIGNING FIELD-SYMBOL(<ls_change>).
  IF <ls_change>-%chg = if_abap_behv=>cop-create.
    " 이번 트랜잭션에서 새로 만든 여행
  ELSEIF <ls_change>-%chg = if_abap_behv=>cop-update
     AND <ls_change>-%control-status = if_abap_behv=>mk-on.
    " 고친 여행 가운데 Status 가 바뀐 것
  ENDIF.
ENDLOOP.
```

같은 내용을 동적 형식으로 씁니다. `full` 에 넣는 값과 결과 테이블의 타입을 눈여겨봅니다.

```abap
DATA: lt_op       TYPE abp_behv_retrievals_tab,
      lt_read     TYPE TABLE FOR READ IMPORT  zr_travel,
      lt_read_chg TYPE TABLE FOR READ CHANGES zr_travel.

lt_read = VALUE #( FOR ls_key IN keys
  ( travelid          = ls_key-travelid
    %control-agencyid = if_abap_behv=>mk-on
    %control-status   = if_abap_behv=>mk-on ) ).

lt_op = VALUE #(
  ( op          = if_abap_behv=>op-r-read
    entity_name = 'ZR_TRAVEL'
    full        = if_abap_behv=>typekind-result_chg
    instances   = REF #( lt_read )
    results     = REF #( lt_read_chg ) ) ).

READ ENTITIES IN LOCAL MODE OPERATIONS lt_op FAILED DATA(lt_failed_dyn).
```

## 알아두기

- managed RAP BO 와 draft 를 쓰는 managed RAP BO, 그리고 그 extension(확장)의 구현 클래스에서만 쓸 수 있습니다. unmanaged RAP BO 에는 쓸 수 없습니다.
- 반드시 [[abapin_local_mode|IN LOCAL MODE]] 와 함께 적어야 합니다.
- read-by-association 과 function 실행에는 쓸 수 없습니다.
- 지워진 인스턴스를 다루는 방식이 보통의 `READ` 문과 다릅니다. `WITH CHANGES` 가 없으면 지워진 인스턴스는 `failed` 로 돌아옵니다. `WITH CHANGES` 가 있으면 지워졌거나 다시 지워진 인스턴스가 읽기 결과(`RESULT result_tab`)에 들어오고, [[abapderived_types_tky|%tky]] 와 [[abapderived_types_chg|%chg]] 만 채워져 있습니다.
- draft action `discard` 로 없앤 인스턴스는 `WITH CHANGES` 가 있어도 `failed` 로 돌아옵니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_short]]
- [[abapread_entities_long]]
- [[abapread_entities_operations]]
- [[abapderived_types_chg]]
- [[abapderived_types_control]]
- [[abapin_local_mode]]
- [[abeneml_read_with_changes_abexa]]
