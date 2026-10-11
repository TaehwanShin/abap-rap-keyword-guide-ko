---
title: fields_tab (EML 문에 넘기는 내부 테이블)
summary: EML 문에서 FROM 이나 WITH 뒤에 적어 작업할 인스턴스를 넘기는, BDEF derived type 으로 된 내부 테이블입니다.
keywords: fields_tab, 내부 테이블, TYPE TABLE FOR, BDEF 파생 타입, FROM, WITH, SET FIELDS WITH, VALUE, %cid, readonly, IN LOCAL MODE, 입력 테이블
---

## 설명

`fields_tab` 은 EML 문에서 작업할 인스턴스를 담아 넘기는 내부 테이블입니다. 필요한 BDEF derived type(BDEF 파생 타입, `TYPE TABLE FOR ...`)으로 선언합니다. RAP BO provider(제공자)와 RAP BO consumer(사용자)가 서로 데이터를 주고받는 데 쓰는 구성요소가 들어 있습니다.

어떤 구성요소가 몇 개 들어 있는지는 테이블을 어디에 쓰느냐에 따라 달라집니다. 삭제 작업에 넘기는 테이블과 생성 작업에 넘기는 테이블은 구성요소가 서로 다릅니다. 타입은 [[abaptype_table_for]], 구성요소는 [[abapderived_types_comp]] 에서 볼 수 있습니다.

테이블을 미리 선언해 두지 않아도 됩니다. `FROM` 같은 키워드 뒤 피연산자 자리에 `VALUE` 같은 생성자 연산자를 써서 그 자리에서 바로 만들 수 있습니다.

## 예제

생성 작업에 넘길 테이블을 BDEF derived type 으로 먼저 선언해서 쓰는 방법입니다.

```abap
DATA lt_create TYPE TABLE FOR CREATE zr_travel.

lt_create = VALUE #( ( %cid = 'c1' travelid = '00000001' agencyid = '070001' ) ).

MODIFY ENTITY zr_travel
  CREATE SET FIELDS WITH lt_create
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

같은 일을 `VALUE` 연산자로 그 자리에서 테이블을 만들어 하는 방법입니다. 타입은 문맥에서 정해집니다.

```abap
MODIFY ENTITY zr_travel
  CREATE SET FIELDS WITH VALUE #(
    ( %cid = 'c1' travelid = '00000001' agencyid = '070001' )
    ( %cid = 'c2' travelid = '00000002' agencyid = '070002' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- BDEF 에서 parent entity(부모 엔터티)나 child entity(자식 엔터티)의 필드를 `readonly` 로 해 두었다면, 어떤 수정 작업으로도 그 필드에 새 값을 넣을 수 없습니다. [[abapin_local_mode|IN LOCAL MODE]] 를 붙였을 때만 바꿀 수 있습니다.

## 관련 항목

- [[abapcommon_eml_elements]]
- [[abaptype_table_for]]
- [[abapderived_types_comp]]
- [[abapin_local_mode]]
- [[abapmodify_entity_entities]]
