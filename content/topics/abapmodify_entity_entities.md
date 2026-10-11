---
title: MODIFY ENTITY, ENTITIES 문
summary: RAP BO 인스턴스를 만들고 고치고 지우거나 action 을 실행하는 EML 문입니다. 변경은 transactional buffer 에만 반영되고 저장은 따로 합니다.
keywords: MODIFY ENTITY, MODIFY ENTITIES, MODIFY ENTITIES OPERATIONS, 변경, 생성, 수정, 삭제, CREATE, CREATE BY, UPDATE, DELETE, EXECUTE, 액션 실행, IN LOCAL MODE, PRIVILEGED, FAILED, EML_FAILED_MISSING_OK, FOR MODIFY
---

## 문법

짧은 형식

```syntax
MODIFY ENTITY [IN LOCAL MODE|[FORWARDING] PRIVILEGED] entity operations [response_param].
```

긴 형식

```syntax
MODIFY ENTITIES OF bdef [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
           ENTITY entity1 operations
          [ENTITY entity2 operations]
          [...]
          [response_param].
```

동적 형식

```syntax
MODIFY ENTITIES [IN LOCAL MODE|[FORWARDING] PRIVILEGED] OPERATIONS op_tab [response_param].
```

## 설명

`MODIFY` 문은 RAP BO 인스턴스에 변경 작업을 실행합니다. 할 수 있는 작업은 두 갈래입니다.

- standard operation(표준 작업) : `CREATE`, `CREATE BY`(association 을 따라가는 생성), `UPDATE`, `DELETE`
- non-standard operation(비표준 작업) : 키워드 `EXECUTE` 로 실행하는 action

형식은 세 가지입니다.

- [[abapmodify_entity_short|짧은 형식]] : entity(엔터티) 하나의 인스턴스를 변경합니다.
- [[abapmodify_entities_long|긴 형식]] : 여러 entity 의 인스턴스를 변경합니다.
- [[abapmodify_entities_operations_dyn|동적 형식]] : 여러 entity 에서 변경할 인스턴스를 내부 테이블에 모아 `MODIFY` 문 하나로 실행합니다.

`MODIFY` 문은 RAP BO consumer(사용자) 쪽에서 쓰든 provider(제공자) 쪽에서 쓰든, handler method(핸들러 메서드) `FOR MODIFY` 를 부릅니다.

변경이 언제나 되는 것은 아닙니다. behavior definition(동작 정의)에 적힌 조건이 변경을 막을 수 있습니다. (전역 또는 인스턴스) 권한과 feature control(기능 제어), 잠금, ETag, precheck 가 그런 조건입니다.

## 예제

여행 하나와 그 예약 하나를 만들고 저장합니다. behavior pool(동작 풀) 밖에서 쓰는 코드이므로 `COMMIT ENTITIES` 가 필요합니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid begindate enddate )
    WITH VALUE #( ( %cid       = 'cid_travel'
                    agencyid   = '070001'
                    customerid = '000042'
                    begindate  = '20260301'
                    enddate    = '20260310' ) )
    " 방금 만든 여행을 %cid_ref 로 가리켜 예약을 붙인다
    CREATE BY \_booking FIELDS ( flightdate )
    WITH VALUE #( ( %cid_ref = 'cid_travel'
                    %target  = VALUE #( ( %cid       = 'cid_booking'
                                          flightdate = '20260301' ) ) ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

IF ls_failed IS INITIAL.
  " 여기까지는 transactional buffer 만 바뀌었다. 데이터베이스에 저장한다
  COMMIT ENTITIES.
  IF sy-subrc <> 0.
    " save sequence 에서 문제가 생겼다
  ENDIF.
ENDIF.
```

## 알아두기

- **저장은 따로 합니다.** behavior pool 밖(예: ABAP 프로그램)에서 `MODIFY` 문을 쓰면 [[abapcommit_entities|COMMIT ENTITIES]] 문으로 save sequence(저장 순서)를 직접 시작해야 합니다. `MODIFY` 는 transactional buffer(트랜잭션 버퍼)만 바꾸므로, 커밋하지 않으면 데이터베이스에는 아무 일도 일어나지 않습니다. 모든 변경 작업에 해당합니다. RAP 는 `COMMIT WORK` 를 쓰는 기존 SAP LUW 개념을 따릅니다. `COMMIT ENTITIES` 는 `COMMIT WORK` 를 품고 있으면서 정보를 더 돌려줍니다.
- **쓸 수 없는 곳이 있습니다.** RAP BO provider 는 saver method(세이버 메서드) `check_before_save`, `adjust_numbers`, `save`, `save_modified`, `cleanup` 안에서 `MODIFY` 문을 쓰면 안 됩니다. interaction phase(상호작용 단계)와, save sequence 가운데 `finalize` 메서드에서만 쓸 수 있습니다. readonly handler method 안에서도 쓸 수 없습니다.
- **결과는 action 만 돌려줍니다.** standard operation 은 [[abapeml_result|RESULT]] 를 돌려주지 않고, non-standard operation 은 돌려줍니다. standard operation 으로 바뀐 데이터는 뒤이어 `READ` 문으로 읽습니다.
- **`FAILED` 를 받습니다.** 동적 형식이 아니고 `IN LOCAL MODE` 도 없는 `MODIFY` 문에 `FAILED` 를 적지 않으면 문법 경고가 납니다. `FAILED` 를 받아 사용자 쪽에서 오류를 처리하는 것이 좋습니다. 경고만 없애려면 프라그마 `##EML_FAILED_MISSING_OK` 를 씁니다.
- **처리 순서.** 서로 관계없는 변경 요청에는 정해진 처리 순서가 없습니다. 순서는 요청끼리 기대고 있을 때 의미가 있습니다. `%cid` 와 `%cid_ref` 를 쓸 때나, 앞선 작업에 기대는 association 을 따라가는 생성 작업이 그 예입니다. 서로 관계없는 요청의 처리 순서를 확실히 하려면 EML 문을 나누어 씁니다. 다만 성능을 생각하면 요청을 한데 묶어 실행하는 편이 좋습니다.
- **반복문 안에 넣지 않습니다.** 데이터베이스에 한 건씩 여러 번 접근하게 되어 느려집니다. 필요한 데이터는 EML 문 하나로 읽고, 변경도 한 번에 모아서 요청합니다.
- **`AUGMENTING` 변형.** projection 계층에서 들어온 요청을 transactional buffer 에 닿기 전에 고칠 수 있는 변형이 따로 있습니다. 지금은 projection 에서만 쓸 수 있습니다. [[abapmodify_aug_entity_entities]] 을 봅니다.
- **projection 의 `WHERE` 절.** 트랜잭션 쿼리 유형의 CDS projection 뷰나 CDS 트랜잭션 interface 에는 결과를 거르는 `WHERE` 절을 둘 수 있습니다. 기본 동작에서는 EML `MODIFY` 요청으로 behavior definition 에 접근할 때 projection 계층의 이 `WHERE` 절이 무시됩니다. projection behavior definition 이나 interface behavior definition 의 결과에 들어 있지 않은 인스턴스도 읽고 바꿀 수 있다는 뜻이므로 보안 위험이 될 수 있습니다. behavior definition 에 [[abenbdl_mngd_instance_check_proj|with managed instance filter]] 를 적으면 `WHERE` 절을 반드시 평가하게 할 수 있습니다.
- RAP 작업을 구현할 때는 RAP BO 계약을 지켜야 합니다. 추린 지침은 [[abaprap_impl_rules]] 에 있습니다.

## 관련 항목

- [[abapmodify_entity_short]]
- [[abapmodify_entities_long]]
- [[abapmodify_entities_operations_dyn]]
- [[abapmodify_entity_entities_op]]
- [[abapin_local_mode]]
- [[abapeml_privileged]]
- [[abapeml_response]]
- [[abaphandler_meth_modify]]
- [[abapcommit_entities]]
- [[abenbdl_authorization]]
- [[abenbdl_actions_fc]]
- [[abenbdl_locking]]
- [[abenbdl_etag]]
- [[abenbdl_precheck]]
- [[abensaver_finalize]]
- [[abapeml_modify_examples_abexas]]
- [[abeneml_modify_alternatives_abexa]]
- [[abenrap_handler_methods_abexa]]
