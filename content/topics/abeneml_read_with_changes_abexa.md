---
title: 예제 - WITH CHANGES 로 읽기
summary: READ 문의 WITH CHANGES 추가 구문을 짧은 형식, 긴 형식, 동적 형식으로 써서 인스턴스가 이번 트랜잭션에서 어떻게 바뀌었는지 알아내는 예제입니다.
keywords: WITH CHANGES, READ ENTITY, READ ENTITIES, %chg, %control, TYPE TABLE FOR READ CHANGES, if_abap_behv=>cop, typekind-result_chg, 변경 내용 읽기, 동적 READ
---

## 설명

`READ` 문에 `WITH CHANGES` 를 붙이면, 읽은 인스턴스가 지금 RAP 트랜잭션 안에서 **새로 만들어졌는지, 수정됐는지, 지워졌는지, 그대로인지**를 함께 알 수 있습니다. 이 예제는 그 추가 구문을 세 가지 모양으로 써 봅니다.

- 짧은 형식 `READ ENTITY ... WITH CHANGES`
- 긴 형식 `READ ENTITIES OF ... WITH CHANGES`
- 동적 형식. 동적 `READ` 문에는 `WITH CHANGES` 를 쓸 수 없어서, 작업 테이블의 `full` 구성요소에 `if_abap_behv=>typekind-result_chg` 를 넣어 같은 기능을 켭니다.

예제의 구성은 이렇습니다.

- 모델은 root entity(루트 엔터티) 하나뿐인 managed BO 입니다.
- behavior definition(동작 정의)에 action 이 두 개 있습니다. 하나는 짧은 형식과 긴 형식을 담고 있고, 넘어온 키 값에 따라 둘 중 하나를 실행합니다. 다른 하나는 동적 형식을 담고 있습니다.
- 사용하는 쪽 클래스는 인스턴스를 여러 상태로 만들어 놓고 action 을 부릅니다. 상태는 다섯 가지입니다. 그대로 둔 인스턴스, 수정한 인스턴스, 새로 만든 인스턴스, 지운 인스턴스, 지웠다가 다시 만든 인스턴스.
- action 안에서는 읽은 결과의 `%chg` 값을 `MODIFY` 문으로 인스턴스의 한 필드에 적어 넣습니다. 어떤 형식의 `READ` 를 썼는지도 다른 필드에 적습니다. 읽은 결과의 `%control` 값은 behavior pool(동작 풀) 전역 클래스의 내부 테이블에 모아 둡니다.
- 지운 경우의 `%chg` 값도 보여 주려고, `%chg` 가 `if_abap_behv=>cop-delete` 인 인스턴스의 키를 전역 클래스의 내부 테이블에 따로 모읍니다.

## 예제

behavior definition 입니다. action 두 개가 `WITH CHANGES` 를 시험하는 자리입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  action checkChanges;
  action checkChangesDynamic;
}
```

action 구현 안에서 쓰는 읽기입니다. 결과 테이블은 `TYPE TABLE FOR READ CHANGES` 타입이어야 합니다.

```abap
DATA lt_changes TYPE TABLE FOR READ CHANGES zr_travel.

" 짧은 형식
READ ENTITY IN LOCAL MODE zr_travel
  WITH CHANGES
  ALL FIELDS WITH CORRESPONDING #( keys )
  RESULT lt_changes
  FAILED failed.

" 긴 형식
READ ENTITIES OF zr_travel IN LOCAL MODE
  ENTITY travel
    ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT lt_changes
  WITH CHANGES
  FAILED failed.

LOOP AT lt_changes ASSIGNING FIELD-SYMBOL(<ls_change>).
  CASE <ls_change>-%chg.
    WHEN if_abap_behv=>cop-create.    " 이번 트랜잭션에서 새로 만들었다
    WHEN if_abap_behv=>cop-update.    " 원래 있었고 이번에 수정했다
    WHEN if_abap_behv=>cop-delete.    " 원래 있었고 이번에 지웠다
    WHEN if_abap_behv=>cop-recreate.  " 지웠다가 다시 만들었다
    WHEN if_abap_behv=>cop-unchanged. " 원래 있었고 그대로다
  ENDCASE.
ENDLOOP.
```

동적 형식입니다. `full` 에 넣는 값이 `WITH CHANGES` 구실을 합니다.

```abap
DATA: lt_read   TYPE TABLE FOR READ IMPORT zr_travel,
      lt_result TYPE TABLE FOR READ CHANGES zr_travel.

lt_read = VALUE #( FOR ls_key IN keys
                   ( %key-travelid       = ls_key-travelid
                     %control-agencyid   = if_abap_behv=>mk-on
                     %control-status     = if_abap_behv=>mk-on ) ).

DATA(lt_op) = VALUE abp_behv_retrievals_tab(
  ( op          = if_abap_behv=>op-r-read
    entity_name = 'ZR_TRAVEL'
    full        = if_abap_behv=>typekind-result_chg
    instances   = REF #( lt_read )
    results     = REF #( lt_result ) ) ).

READ ENTITIES IN LOCAL MODE OPERATIONS lt_op FAILED DATA(ls_failed_dyn).
```

사용하는 쪽에서는 인스턴스를 바꾼 다음 같은 트랜잭션 안에서 action 을 부릅니다.

```abap
" 여행 3 은 수정하고, 여행 4 는 그대로 둔다
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( status )
  WITH VALUE #( ( travelid = '00000003' status = 'A' ) )
  FAILED DATA(ls_failed).

MODIFY ENTITY zr_travel
  EXECUTE checkchanges
  FROM VALUE #( ( travelid = '00000003' )
                ( travelid = '00000004' ) )
  FAILED ls_failed.

COMMIT ENTITIES.
```

## 알아두기

- 원문 예제는 짧은 형식과 긴 형식을 시험할 때 상태마다 "바꾸기 → action 실행 → `COMMIT ENTITIES`" 를 되풀이하고, 그때마다 데이터베이스 테이블 내용과 모아 둔 `%control` 값을 화면에 냅니다. 동적 형식은 다섯 상태를 이어서 실행하며 `%control` 값을 내고, 마지막에 한 번 저장합니다. 테이블에 적힌 `%chg` 값으로 인스턴스마다 어떤 변경이 쌓였는지 볼 수 있습니다.
- 원문 예제에서 값이 채워진 필드 하나는 그 인스턴스가 이번 트랜잭션에서 만들어지거나, 수정되거나, 다시 만들어졌다는 표시입니다. 그 필드가 비어 있으면 손대지 않은 인스턴스입니다.
- 그대로 둔 인스턴스는 `%control` 이 모두 초기값입니다. `%control` 에 바뀐 필드가 표시되는 것은 `%chg` 가 `cop-create`, `cop-update`, `cop-recreate` 일 때뿐입니다.
- 지운 인스턴스는 `FAILED` 로 가지 않고 읽은 결과에 들어옵니다. 이때는 `%tky` 와 `%chg` 만 채워져 있습니다. 그래서 예제는 지운 인스턴스의 키를 별도 테이블에 모아 보여 줍니다.
- `WITH CHANGES` 는 반드시 `IN LOCAL MODE` 와 함께 쓰고, managed RAP BO 의 구현 클래스 안에서만 쓸 수 있습니다. read-by-association 과 function 실행에는 붙일 수 없습니다.
- 동적 형식에서 `results` 가 가리키는 테이블이 `TYPE TABLE FOR READ CHANGES` 타입이 아니면 런타임 오류 `BEHAVIOR_ILLEGAL_TYPE` 이 납니다.

## 관련 항목

- [[abapeml_read_with_changes]]
- [[abapderived_types_chg]]
- [[abapderived_types_control]]
- [[abapread_entity_short]]
- [[abapread_entities_long]]
- [[abapread_entities_operations]]
- [[abapin_local_mode]]
- [[abapeml_read_examples_abexas]]
