---
title: 예제 - MODIFY 의 필드 지정 방법
summary: 같은 생성·수정 작업을 FROM, FIELDS ( ) WITH, SET FIELDS WITH 세 가지로 써서 필드 지정 방법의 차이를 견주는 예제입니다.
keywords: FROM, FIELDS WITH, SET FIELDS WITH, field_spec, %control, %cid, %cid_ref, MODIFY ENTITY, CREATE, CREATE BY, UPDATE, DELETE, 필드 지정, 예제, CL_DEMO_RAP_EML_MODIFY_OPRTNS
---

## 설명

`MODIFY ENTITY` 문에 넘길 필드를 지정하는 세 가지 방법을 간단한 managed BO 에서 견주는 예제입니다.

- 작업: `CREATE`, `CREATE BY`(create-by-association), `UPDATE`, `DELETE`
- 필드 지정: `FROM`, `FIELDS ( ... ) WITH`, `SET FIELDS WITH`

원문 프로그램은 방법마다 `MODIFY ENTITY` 문 하나에 여러 작업을 묶어 실행합니다.

| 방법 | 한 문장에 묶은 작업 |
| --- | --- |
| `FROM` | 루트 인스턴스 넷을 만들고, 그 가운데 하나를 고치고 하나를 지웁니다. association 으로 자식 인스턴스 둘도 만듭니다. |
| `FIELDS ( ... ) WITH` | `CREATE`, `CREATE BY`, `UPDATE` |
| `SET FIELDS WITH` | `CREATE`, `CREATE BY`, `UPDATE` |

BO 는 root entity(루트 엔터티)와 child entity(자식 엔터티) 하나씩인 managed BO 이고, standard operation(표준 작업)만 쓰므로 behavior pool(동작 풀)은 없습니다. 아래 코드는 Travel / Booking 으로 옮긴 것입니다. behavior definition(동작 정의)는 [[abeneml_modify_alternatives_abexa]] 에 실은 것과 같습니다.

## 예제

`FROM` 은 넘길 필드마다 `%control` 을 직접 on 으로 둡니다. `DELETE` 에는 `FROM` 만 쓸 수 있습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FROM VALUE #(
    ( %cid = 'cid1'
      travelid = '00000001'  %control-travelid = if_abap_behv=>mk-on
      agencyid = '070001'    %control-agencyid = if_abap_behv=>mk-on )
    ( %cid = 'cid2'
      travelid = '00000002'  %control-travelid = if_abap_behv=>mk-on
      agencyid = '070002'    %control-agencyid = if_abap_behv=>mk-on ) )
  CREATE BY \_booking FROM VALUE #(
    ( %cid_ref = 'cid1'
      %target  = VALUE #(
        ( %cid = 'cid3'
          bookingid   = '0001'    %control-bookingid   = if_abap_behv=>mk-on
          flightprice = '500.00'  %control-flightprice = if_abap_behv=>mk-on ) ) ) )
  UPDATE FROM VALUE #(
    ( %cid_ref = 'cid1'
      agencyid = '070009'    %control-agencyid = if_abap_behv=>mk-on ) )
  DELETE FROM VALUE #( ( %cid_ref = 'cid2' ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

`FIELDS ( ... ) WITH` 는 넘길 필드를 괄호 안에 한 번만 적습니다. `%control` 은 문장이 채웁니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #( ( %cid = 'cid4' travelid = '00000003' agencyid = '070001' ) )
  CREATE BY \_booking FIELDS ( bookingid flightprice )
  WITH VALUE #(
    ( %cid_ref = 'cid4'
      %target  = VALUE #( ( %cid = 'cid5' bookingid = '0001' flightprice = '320.00' ) ) ) )
  UPDATE FIELDS ( agencyid )
  WITH VALUE #( ( %cid_ref = 'cid4' agencyid = '070009' ) )
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

`SET FIELDS WITH` 는 필드 목록도 적지 않습니다. 테이블에 값이 들어 있는 필드가 넘어갑니다.

```abap
MODIFY ENTITY zr_travel
  CREATE SET FIELDS
  WITH VALUE #( ( %cid = 'cid6' travelid = '00000004' agencyid = '070001' ) )
  UPDATE SET FIELDS
  WITH VALUE #( ( %cid_ref = 'cid6' agencyid = '070009' ) )
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

## 알아두기

- 원문 프로그램은 방법마다 `MODIFY` 문을 실행하고, `REPORTED` 에 메시지가 있으면 출력하고, `COMMIT ENTITIES` 로 저장한 뒤 루트와 자식의 persistent table 을 읽어 보여 줍니다.
- 눈에 띄는 차이는 코드 길이입니다. `FROM` 은 `%control` 을 직접 채워야 해서 가장 길고, 나머지 둘은 `%control` 을 적지 않아 짧습니다.
- `SET FIELDS WITH` 는 권하지 않는 형태입니다. 입력이 많으면 느리고, readonly 필드를 문법 검사로 잡지 못하며, 초기값을 넣을 수 없습니다. 이유는 [[abapmodify_entity_entities_fields]] 에 정리돼 있습니다.
- 한 문장 안에서 만든 인스턴스는 `%cid` 로 이름표를 달고, 같은 문장의 `CREATE BY`, `UPDATE`, `DELETE` 에서 `%cid_ref` 로 가리킵니다.
- managed BO 이므로 작업은 프레임워크가 다루는 transactional buffer(트랜잭션 버퍼)에서 이루어지고, `COMMIT ENTITIES` 가 persistent table 에 저장합니다.

## 관련 항목

- [[abapmodify_entity_entities_fields]]
- [[abapmodify_entity_entities_op]]
- [[abapeml_fields_tab]]
- [[abapcommit_entities]]
- [[abapeml_modify_examples_abexas]]
