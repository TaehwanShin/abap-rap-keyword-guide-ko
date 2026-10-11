---
title: 예제 - MODIFY standard operation (unmanaged)
summary: unmanaged BO 에서 standard operation 과 읽기를 모두 실행하는 예제입니다. transactional buffer 를 내부 테이블로 직접 구현한 behavior pool 의 짜임새를 함께 설명합니다.
keywords: unmanaged, 비관리형, 트랜잭션 버퍼, transactional buffer, CREATE, CREATE BY, UPDATE, DELETE, READ, READ BY, %control, %cid_ref, FAILED, REPORTED, lcl_buffer, cba, rba, 예제, CL_DEMO_RAP_EML_U_OPERATIONS
---

## 설명

간단한 unmanaged RAP BO 에서 standard operation(표준 작업)을 모두 실행해 보는 예제입니다. 다루는 작업은 `CREATE`, `CREATE BY`(create-by-association), `UPDATE`, `DELETE`, `READ`, `READ BY`(read-by-association)입니다.

managed 와 달리 unmanaged 에서는 standard operation 의 구현이 **모두 개발자 몫**입니다. 이 예제는 실제 업무 시나리오가 아니라 기술 면을 보여 주는 데 초점을 둡니다. managed BO 가 transactional buffer(트랜잭션 버퍼)를 다루는 방식을 본떠, behavior pool(동작 풀)의 메서드를 어떻게 구현할 수 있는지를 단순하게 보여 줍니다. 그렇게 구현한 BO 를 behavior pool 바깥의 ABAP 클래스에서 EML 로 부릅니다.

transactional buffer 는 내부 테이블로 만들었습니다. persistent table 의 데이터를 이 테이블로 읽어 들이고, `COMMIT ENTITIES` 로 저장이 시작되면 이 테이블의 내용을 persistent table 에 씁니다.

원문의 BO 는 root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나입니다. 같은 짜임새를 Travel / Booking 으로 옮기면 behavior definition(동작 정의)는 다음과 같습니다. 무엇을 구현할 수 있는지는 이 behavior definition 이 정합니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  association _Booking { create; }
  field ( readonly : update ) TravelID;
}

define behavior for ZR_Booking alias Booking
lock dependent by _Travel
authorization dependent by _Travel
{
  field ( readonly : update ) TravelID, BookingID;
  association _Travel;
}
```

### behavior pool 의 짜임새

원문의 behavior pool 은 로컬 클래스 셋으로 이루어집니다.

| 클래스 | 맡은 일 |
| --- | --- |
| 버퍼 클래스 (`lcl_buffer`) | transactional buffer 입니다. 루트용과 자식용 내부 테이블을 하나씩 둡니다. |
| handler class(핸들러 클래스) | standard operation 을 모두 구현하고 오류를 처리합니다. |
| saver class(세이버 클래스) | 버퍼의 내용을 persistent table 에 씁니다. |

**버퍼 테이블.** 루트 버퍼의 한 줄에는 entity(엔터티)의 키 필드와 데이터 필드가 모두 들어 있습니다. 여기에 인스턴스가 넘겨준 `%cid` 를 담는 칸과, `changed`, `deleted` 두 표시 칸을 더했습니다. 인스턴스를 만들거나 고치면 `changed` 에, 지우면 `deleted` 에 `X` 를 넣습니다. 아무 작업도 없으면 둘 다 비어 있습니다. 자식 버퍼도 같은 식으로 만들고, association 작업에 쓰는 `%cid_ref` 칸, `%target` 안의 `%cid` 를 담는 칸(예제에서는 쓰지 않음), `created` 표시 칸을 둡니다. `created` 에 `X` 가 있는 줄만 자식 persistent table 에 저장합니다.

**버퍼 준비.** 루트용과 자식용 준비 메서드가 있습니다. EML 호출이 어떤 키의 데이터를 읽거나 바꾸려 하면, 먼저 그 줄이 버퍼에 있는지 봅니다. 없으면 persistent table 에 있는지 보고, 있으면 `SELECT` 로 읽어 버퍼에 넣습니다. 같은 줄이 두 번 들어가지 않게 작업 메서드마다 이 준비를 먼저 합니다. 데이터가 아예 없으면(예: 이미 지워짐) `FAILED` 와 `REPORTED` 에 어떤 인스턴스를 읽거나 바꾸지 못했는지 채웁니다. association 작업에서는 루트 버퍼뿐 아니라 자식 버퍼에도 그 줄이 있는지 확인합니다.

**handler method(핸들러 메서드).**

- `create` : 버퍼를 준비한 뒤 넘어온 인스턴스를 하나씩 돌며 조건을 확인합니다. 조건에 맞지 않는 인스턴스는 `FAILED` 와 `REPORTED` 에 넣습니다. 조건에 맞으면 버퍼에 넣고 `changed` 를 켭니다. `%control` 에서 꺼져 있는(`if_abap_behv=>mk-off`) 필드는 넘어온 값을 넣지 않습니다.
- `update` : 같은 흐름입니다. `%control` 에서 꺼진 필드는 기존 값을 덮어쓰지 않습니다. 요청이 키만 넘긴 경우와 `%cid_ref` 만 넘긴 경우를 모두 다룹니다. `%cid_ref` 가 있으면 함께 넘어온 키는 무시합니다. `%cid_ref` 가 인스턴스를 가리키는 주된 기준이기 때문입니다.
- `delete` : `update` 와 비슷하게 키만 온 경우와 `%cid_ref` 만 온 경우를 다룹니다. 지울 인스턴스에 `deleted` 를 켜고 `changed` 는 비웁니다. `%control` 은 삭제와 상관없습니다.
- `read` : 버퍼를 준비한 뒤 넘어온 키에 맞는 줄을 결과 테이블에 채웁니다. `%control` 에서 꺼진 필드는 읽지 않고 결과에도 넣지 않습니다. 키는 언제나 읽어 돌려줍니다.
- read-by-association (`rba_child`) : 루트와 자식 버퍼를 모두 준비합니다. 그 뒤는 `read` 와 같습니다.
- create-by-association (`cba_child`) : 루트와 자식 버퍼를 모두 준비합니다. 키만 온 경우와 `%cid_ref` 만 온 경우를 다루고 `%control` 표시도 따릅니다. 만들 수 있는 인스턴스는 자식 버퍼에 넣고 `created` 를 켭니다.

**saver method(세이버 메서드).**

- `finalize` : 버퍼에서 `%cid` 값을 모두 지웁니다. 저장 단계에서는 `%cid` 를 쓰면 안 되기 때문입니다. 다만 이 예제의 흐름에서는 중요하지 않습니다.
- `save` : 버퍼의 인스턴스를 persistent table 에 씁니다. `changed` 가 켜진 줄만 모아 ABAP SQL `MODIFY` 로 생성과 수정을 처리하고, `deleted` 가 켜진 줄만 모아 삭제합니다. association 으로 만든 인스턴스는 따로 처리합니다. 루트 버퍼가 아니라 자식 버퍼에서 `created` 가 켜진 줄을 저장해야 하기 때문입니다.
- `cleanup` : 버퍼 테이블을 비웁니다.

## 예제

RAP BO consumer(사용자) 쪽 코드를 줄여 쓴 것입니다. `%control` 을 직접 다루려고 작업 키워드 뒤에 모두 `FROM` 을 씁니다.

```abap
DATA: ls_failed   TYPE RESPONSE FOR FAILED   zr_travel,
      ls_reported TYPE RESPONSE FOR REPORTED zr_travel.

" 생성과 create-by-association. 꺼 둔 필드는 값이 있어도 저장되지 않는다
MODIFY ENTITY zr_travel
  CREATE FROM VALUE #(
    ( %cid = 'cid1'
      travelid   = '00000001'  %control-travelid   = if_abap_behv=>mk-on
      agencyid   = '070001'    %control-agencyid   = if_abap_behv=>mk-on
      customerid = '000011'    %control-customerid = if_abap_behv=>mk-off ) )
  CREATE BY \_booking FROM VALUE #(
    ( %cid_ref = 'cid1'
      %target  = VALUE #(
        ( %cid = 'cid_b1'
          bookingid   = '0001'    %control-bookingid   = if_abap_behv=>mk-on
          flightprice = '500.00'  %control-flightprice = if_abap_behv=>mk-on ) ) ) )
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.

" 같은 문장에서 만든 인스턴스는 %cid_ref 로, 이미 있는 것은 키로 가리킨다
MODIFY ENTITY zr_travel
  CREATE FROM VALUE #(
    ( %cid = 'cid2'
      travelid = '00000002'  %control-travelid = if_abap_behv=>mk-on ) )
  UPDATE FROM VALUE #(
    ( travelid = '00000001' status = 'A'  %control-status = if_abap_behv=>mk-on )
    ( %cid_ref = 'cid2'     status = 'O'  %control-status = if_abap_behv=>mk-on )
    " 없는 키: FAILED 와 REPORTED 에 들어온다
    ( travelid = '00000099' status = 'A'  %control-status = if_abap_behv=>mk-on ) )
  DELETE FROM VALUE #( ( %cid_ref = 'cid2' ) )
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.

" 읽을 필드도 %control 로 고른다. 키는 언제나 돌아온다
READ ENTITY zr_travel
  FROM VALUE #(
    ( travelid = '00000001'
      %control-agencyid   = if_abap_behv=>mk-on
      %control-customerid = if_abap_behv=>mk-off
      %control-status     = if_abap_behv=>mk-on ) )
  RESULT   DATA(lt_travel)
  FAILED   ls_failed
  REPORTED ls_reported.

READ ENTITY zr_travel
  BY \_booking FROM VALUE #(
    ( travelid = '00000001'
      %control-bookingid   = if_abap_behv=>mk-on
      %control-flightprice = if_abap_behv=>mk-on ) )
  RESULT   DATA(lt_booking)
  FAILED   ls_failed
  REPORTED ls_reported.
```

## 알아두기

- 원문 프로그램은 작업 묶음마다 `FAILED` 와 `REPORTED` 응답을 출력하고, `COMMIT ENTITIES` 뒤에 persistent table 을 `SELECT` 로 읽어 저장된 결과를 보여 줍니다. 일부러 실패하는 인스턴스(이미 있는 키로 생성, 없는 키로 수정·삭제·읽기)를 섞어 응답이 어떻게 채워지는지 보여 줍니다.
- 출력되는 `FAILED` 에는 실패 원인, `%cid`, 키, 실패한 작업이나 association 표시(`01`)가 들어 있습니다. 원인을 여러 가지로 나누는 로직은 구현돼 있지 않습니다. `REPORTED` 에는 심각도, `%cid`, 키, 직접 만든 메시지가 들어 있습니다. 응답을 채우는 것도 behavior pool 메서드가 직접 합니다.
- 일부 필드는 `%control` 에서 일부러 꺼 두었습니다. 꺼진 필드는 작업에 반영되지 않는다는 점을 보여 주려는 것입니다. `FROM` 을 쓰는 까닭도 `%control` 을 직접 채워야 하는 형태이기 때문입니다.
- `UPDATE` 와 `DELETE` 를 보여 주는 문장에 `CREATE` 를 함께 넣은 것은 `%cid` 와 `%cid_ref` 로 가리키는 방법도 보여 주려는 것입니다.
- 이 코드는 unmanaged 에서는 모든 것을 직접 구현해야 한다는 점과, EML 이 다루는 transactional buffer 가 얼마나 중요한지를 보여 주는 데 목적이 있습니다. 운영 시스템에 그대로 가져다 쓰면 안 됩니다.

## 관련 항목

- [[abapmodify_entity_entities_op]]
- [[abapmodify_entity_entities_fields]]
- [[abapread_entity_entities_op]]
- [[abapcommit_entities]]
- [[abeneml_modify_op_abexa]]
- [[abenrap_handler_methods_abexa]]
- [[abapeml_modify_examples_abexas]]
- [[abapeml_read_examples_abexas]]
