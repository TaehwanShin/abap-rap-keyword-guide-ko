---
title: 예제 - RAP handler method
summary: unmanaged 이면서 draft 를 쓰는 RAP BO 하나로 거의 모든 종류의 handler method 를 직접 구현해 보이고, EML 요청마다 어떤 메서드가 불리는지 보여 주는 예제입니다.
keywords: RAP handler methods example, 핸들러 메서드 예제, unmanaged, 비관리형, draft, 초안, FOR MODIFY, FOR READ, FOR LOCK, FOR NUMBERING, FOR PRECHECK, FOR FEATURES, FOR AUTHORIZATION, activate, edit, discard, 트랜잭션 버퍼, lcl_buffer
---

## 설명

원문 예제는 **unmanaged**이면서 **draft 를 쓰는** RAP BO 로 여러 handler method(핸들러 메서드)를 한꺼번에 보여 줍니다. 실제 업무를 흉내 낸 것이 아닙니다. handler method 를 직접 구현할 때 매개변수를 어떻게 다루는지 기술적인 면만 보여 줍니다.

- 데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티) 하나씩입니다. composition 으로 이어져 있습니다.
- behavior definition(동작 정의)는 `unmanaged`, `strict(2)`, `with draft` 이고, root entity 에 early numbering, global·instance 권한, global·instance feature control(기능 제어), action 넷, function 셋, validation 하나, determination 둘, draft action 을 선언합니다.
- behavior pool(동작 풀)의 CCIMP 인클루드에는 로컬 클래스가 셋 있습니다.

| 로컬 클래스 | 역할 |
| --- | --- |
| `lcl_buffer` | transactional buffer(트랜잭션 버퍼). 데이터를 담는 내부 테이블이 들어 있습니다. |
| `lhc_...` | handler class(핸들러 클래스) |
| `lsc_...` | saver class(세이버 클래스) |

child entity 의 handler class 와 saver class 는 이 예제에서 다루지 않습니다.

### 직접 만든 transactional buffer

`lcl_buffer` 에는 내부 테이블이 둘 있습니다. root entity 용 `root_buffer` 와 child entity 용 `child_buffer` 입니다. 자식 쪽은 create-by-association·읽기를 다루려고 둡니다.

- 버퍼의 줄에는 entity(엔터티)의 키 필드와 데이터 필드가 모두 들어 있습니다.
- 루트 버퍼에는 내용 식별자를 담는 `cid` 와, 저장·삭제를 쉽게 하려는 표시 필드 `changed`, `deleted` 가 더 있습니다. 인스턴스를 만들거나 바꾸면 `changed` 에, 지우면 `deleted` 에 `X` 가 들어갑니다.
- 자식 버퍼에는 `cid_ref`, `cid_target`(이 예제에서는 쓰지 않음), `created` 가 더 있습니다. `created` 에 `X` 가 있는 줄만 자식 테이블에 저장합니다.

버퍼를 채우는 메서드는 `prep_root_buffer` 와 `prep_child_buffer` 입니다. 원리는 이렇습니다. EML 요청이 어떤 키의 데이터를 읽거나 바꾸려 하면 먼저 버퍼에 그 데이터가 있는지 봅니다. 없으면 데이터베이스 테이블을 보고, 있으면 `SELECT` 로 읽어 버퍼에 넣습니다. 어디에도 없으면(예: 이미 지워짐) `failed` 와 `reported` 에 그 사실을 채웁니다.

## 예제

같은 짜임새를 공통 예제 모델로 줄여 쓴 것입니다. 먼저 behavior definition 입니다. 여기 적은 내용이 behavior pool 에 무엇을 구현할 수 있는지를 정합니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
draft table ztravel_d
lock master
total etag LastChangedAt
authorization master ( global, instance )
early numbering
{
  create;
  update ( features : global );
  delete ( features : global );
  association _Booking { create; with draft; }
  field ( features : instance ) TotalPrice;

  action acceptTravel result [1] $self;
  factory action ( precheck ) copyTravel [1];
  function ( authorization : none ) getSummary result selective [1] $self;

  validation validatePrice on save { field TotalPrice; }
  determination setStatus on modify { create; }

  draft action Edit with additional implementation;
  draft action Activate optimized with additional implementation;
  draft action Discard with additional implementation;
  draft action Resume with additional implementation;
  draft determine action Prepare { validation validatePrice; }
}
// Booking 쪽 behavior definition 은 줄임
```

handler class 에는 behavior definition 의 줄마다 그에 맞는 메서드를 선언합니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel RESULT result.
    METHODS get_global_features FOR GLOBAL FEATURES
      IMPORTING REQUEST requested_features FOR travel RESULT result.
    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR travel RESULT result.
    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR travel RESULT result.
    METHODS earlynumbering_create FOR NUMBERING
      IMPORTING entities FOR CREATE travel.
    METHODS lock FOR LOCK
      IMPORTING keys FOR LOCK travel.
    METHODS create FOR MODIFY
      IMPORTING entities FOR CREATE travel.
    METHODS cba_booking FOR MODIFY
      IMPORTING entities_cba FOR CREATE travel\_booking.
    METHODS read FOR READ
      IMPORTING keys FOR READ travel RESULT result.
    METHODS rba_booking FOR READ
      IMPORTING keys_rba FOR READ travel\_booking
      FULL result_requested RESULT result LINK association_links.
    METHODS accepttravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~accepttravel RESULT result.
    METHODS precheck_copytravel FOR PRECHECK
      IMPORTING keys FOR ACTION travel~copytravel.
    METHODS getsummary FOR READ
      IMPORTING keys FOR FUNCTION travel~getsummary
      REQUEST requested_fields RESULT result.
    METHODS validateprice FOR VALIDATE ON SAVE
      IMPORTING keys FOR travel~validateprice.
    METHODS setstatus FOR DETERMINE ON MODIFY
      IMPORTING keys FOR travel~setstatus.
    " update, delete, copytravel, activate, edit, discard, resume 도 같은 방식으로 선언한다
ENDCLASS.
```

### 원문 예제의 handler method 가 하는 일

원문은 메서드마다 자기 이름을 전역 클래스의 내부 테이블에 적어 둡니다. 이 테이블을 출력해 어떤 handler method 가 어떤 순서로 불렸는지 보여 줍니다. 또 대부분의 메서드에서 `CHANGING` 매개변수를 드러내 선언하고, `failed` 와 `reported` 를 채웁니다.

| 메서드 | 하는 일 |
| --- | --- |
| `create` | 버퍼를 준비한 뒤 넘어온 인스턴스를 하나씩 봅니다. 조건에 맞으면 `changed` 표시를 하고, 안 맞으면 `failed`·`reported` 에 넣습니다. `%control` 에서 꺼진 필드는 값을 넣지 않습니다. |
| `update` | `create` 와 비슷합니다. `%control` 에서 꺼진 필드는 덮어쓰지 않습니다. 키만 온 경우와 `%cid_ref` 만 온 경우를 모두 다룹니다. `%cid_ref` 가 있으면 키는 무시합니다. |
| `delete` | `update` 와 비슷합니다. 지울 인스턴스에 `deleted` 표시를 하고 `changed` 는 비웁니다. `%control` 은 쓰지 않습니다. |
| `read` | 넘어온 키대로 결과 테이블을 채웁니다. `%control` 에서 꺼진 필드는 읽지 않습니다. 키는 언제나 돌려줍니다. |
| `rba_child` | read-by-association. 루트 버퍼와 자식 버퍼를 모두 준비한 뒤 `read` 와 같은 방식으로 결과를 채웁니다. |
| `cba_child` | create-by-association. 두 버퍼를 준비하고, 키만 온 경우와 `%cid_ref` 만 온 경우를 다룹니다. 만들 수 있는 인스턴스에 `created` 표시를 합니다. |
| `action1` | 요청받은 모든 인스턴스의 문자열 필드 하나를 바꿉니다. |
| `action2` | `result` 가 있는 action. 다른 문자열 필드를 바꾸고 결과 매개변수도 채웁니다. |
| `action3` | `parameter` 와 `result selective` 가 있는 action. 입력 매개변수를 할인율로 보고 숫자 필드 둘에서 그만큼 뺍니다. 결과에는 요청받은 필드만 채웁니다. |
| `action4` | 사용자가 준 키의 인스턴스를 복사합니다. `precheck` 로 선언했으므로 `precheck_action4` 가 먼저 불립니다. |
| `precheck_action4` | 어떤 필드가 특정 값이면 그 인스턴스에는 `action4` 를 실행하지 않습니다. 원문은 이 점검을 시연용으로 action 에만 붙였고, 키가 겹치는지는 실제로 `create` 메서드에서 확인한다고 밝힙니다. |
| `function1` | static function. 어떤 숫자 필드가 100 보다 큰 인스턴스만 골라 그 필드의 합을 돌려줍니다. |
| `function2` | `parameter` 가 있는 instance function. 입력 매개변수를 할인율로 보고 숫자 필드에서 뺀 값을 돌려줍니다. |
| `function3` | `result selective` 로 선언한 instance function. `requested_fields` 를 보고 요청받은 필드만 채웁니다. |
| `get_instance_authorizations` | 저장된 상태를 기준으로 권한을 확인합니다. 어떤 필드가 특정 값이면 수정·삭제·action 을 허용하지 않습니다. |
| `lock` | 데이터베이스 테이블의 잠금 객체로 active(활성) 인스턴스를 키 기준으로 잠급니다. 잠금은 `COMMIT ENTITIES` 뒤에 풀립니다. draft 를 편집하는 경우에는 draft action `activate` 가 끝난 뒤 풀립니다. |
| `get_instance_features` | 조건에 따라 어떤 필드가 readonly 인지 수정할 수 있는지 돌려줍니다. |
| `get_global_features` | 조건에 따라 수정·삭제를 할 수 있는지 돌려줍니다. |
| `get_global_authorizations` | 권한이 있는 사용자만 수정 작업을 할 수 있게 하는 자리입니다. 예제를 단순하게 하려고 권한 객체 없이 변수 하나로 대신하고, 언제나 허용합니다. |
| `det_on_modify` | 문자열 필드의 값 뒤에 문자열을 덧붙입니다. |
| `det_on_save` | 숫자 필드로 간단한 계산을 합니다. |
| `validation` | 숫자 필드의 값이 1000 보다 큰지 확인합니다. 크면 validation 이 실패합니다. |
| `activate` | 숫자 필드로 간단한 계산을 합니다. |
| `discard` | 문자열 필드에서 밑줄을 지웁니다. |
| `edit` | 문자열 필드를 대문자로 바꿉니다. |
| `resume` | 구현 내용이 없습니다. 지금은 데모 클래스에서 부르거나 디버깅할 수 없습니다. |
| `earlynumbering_create` | 기본 키에 early numbering 을 합니다. 50 과 100 사이의 임의의 수를 키로 정하고 `%cid` 와 짝짓습니다. |

## 알아두기

원문 프로그램은 EML 요청을 여섯 묶음으로 보냅니다. 묶음마다 response parameter(응답 매개변수)의 내용, 불린 handler method 목록, 데이터베이스 테이블의 내용을 출력합니다.

1. **active 인스턴스에 standard operation(표준 작업) (첫 번째)** — `MODIFY` 문 하나에 `CREATE`, `CREATE BY`, `UPDATE`, `DELETE` 를 함께 넣습니다. 일부러 만들 수 없거나 바꿀 수 없거나 지울 수 없는 인스턴스를 섞어 두었습니다. handler method 가 `mapped`, `failed`, `reported` 를 채우고, `COMMIT ENTITIES` 로 저장합니다.
2. **active 인스턴스에 standard operation (두 번째)** — 같은 종류의 작업을 다시 보내 `get_instance_authorizations`, `get_instance_features` 같은 메서드의 효과를 보여 줍니다. 그 메서드들이 정한 조건에 걸려 일부 작업이 실패합니다.
3. **action 실행** — behavior definition 에 서로 다르게 선언한 action 을 차례로 실행합니다. 결과 매개변수가 있는 action 은 결과도 출력합니다. `action4` 는 `precheck_action4` 의 효과를 함께 봐야 합니다.
4. **읽기와 function** — `READ`, `READ BY` 를 실행합니다. `rba_child` 가 돌려준 연결 정보(`association_links`)도 출력합니다. 이어서 function 셋을 실행하고 읽은 결과를 보여 줍니다.
5. **draft 인스턴스 생성** — `%is_draft` 를 켜고, 키 없이 `%cid` 만 주어 draft 를 만듭니다. 키는 `earlynumbering_create` 가 정하고, determination `det_on_modify` 도 불립니다. `COMMIT ENTITIES` 로 draft 테이블에 저장한 뒤 `Activate` 를 실행하고 다시 커밋합니다. 이 과정에서 `det_on_save` 와 `validation` 이 불리고, `discard` 가 마지막에 불립니다. validation 에 실패한 인스턴스 하나는 draft 테이블에 그대로 남고, 나머지 둘은 데이터베이스 테이블로 옮겨집니다.
6. **draft 인스턴스 수정** — draft action `Edit` 를 실행하면 저장되어 있던 인스턴스가 draft 테이블에 들어가고 데이터베이스 테이블 쪽은 잠깁니다. 다시 `Activate` 와 커밋을 하면 `edit` 메서드가 바꾼 내용이 데이터베이스 테이블에 저장된 것을 볼 수 있습니다.

눈여겨볼 점은 다음과 같습니다.

- 이 예제는 RAP BO 계약의 조건을 모두 채우지는 않습니다. 짧고 단순하게 하려고 일부 handler method 는 구현이 비어 있기도 합니다. 운영 코드에 그대로 가져다 쓰면 안 됩니다.
- 수정 작업이 성공하는 모습을 보려면 정해진 시간대에 실행해야 합니다(`get_global_features` 메서드 참고). 그 밖의 시간에는 수정 작업이 모두 막힙니다.
- 원문은 `lock` 과 `Edit` 의 잠금을 디버깅 도중 트랜잭션 `SM12` 에서 확인할 수 있다고 안내합니다.
- unmanaged 에서는 handler method 가 받은 `%control` 과 `%cid_ref` 를 스스로 해석해야 합니다. 원문의 `create`, `update`, `read` 가 그 모습을 보여 줍니다.

## 관련 항목

- [[abapmethods_for_rap_behv]]
- [[abenabp_cl_abap_beh_handler]]
- [[abaphandler_meth_modify]]
- [[abaphandler_meth_read]]
- [[abaphandler_meth_lock]]
- [[abaphandler_meth_numbering]]
- [[abaphandler_meth_precheck]]
- [[abaphandler_meth_auth]]
- [[abaphandler_meth_features]]
- [[abenbdl_draft_action]]
- [[abenbdl_determinations]]
- [[abenbdl_validations]]
