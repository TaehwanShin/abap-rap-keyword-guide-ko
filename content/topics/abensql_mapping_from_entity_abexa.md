---
title: 예제 - MAPPING FROM ENTITY 를 붙인 ABAP SQL 문
summary: BDEF derived type 으로 선언한 구조와 내부 테이블을 INSERT, UPDATE, MODIFY, DELETE 문에 넘겨 DB 테이블을 바꾸고, 문마다 테이블 내용을 출력해 보는 예제입니다.
keywords: MAPPING FROM ENTITY, ABAP SQL, INSERT, UPDATE, MODIFY, DELETE, INDICATORS SET STRUCTURE, %control, TYPE TABLE FOR, TYPE STRUCTURE FOR, BDEF 파생 타입, 예제
---

## 설명

[[abapmapping_from_entity|MAPPING FROM ENTITY]] 를 붙인 ABAP SQL 문 네 가지를 차례로 실행하는 예제입니다. 원본으로 쓰는 구조와 내부 테이블은 모두 BDEF derived type(BDEF 파생 타입, [[abaptype_structure_for|TYPE STRUCTURE FOR]], [[abaptype_table_for|TYPE TABLE FOR]])으로 선언합니다. 이 타입들은 간단한 [[abenbdl_impl_type|managed]] RAP BO 에서 나옵니다. behavior pool(동작 풀)은 이 예제와 상관이 없습니다.

문마다 구조 하나와 내부 테이블 하나에 견본 값을 채워 넣습니다. 문을 실행한 뒤에는 `SELECT` 로 DB 테이블을 읽어 출력합니다. 그래서 각 문이 테이블을 어떻게 바꿨는지 단계별로 볼 수 있습니다.

실행 순서는 `INSERT` → `UPDATE` → `INDICATORS SET STRUCTURE` 를 붙인 `UPDATE` → `MODIFY` → `DELETE` 입니다.

## 예제

```abap
" --- INSERT: FOR CREATE 타입의 구조와 내부 테이블
DATA: ls_ins TYPE STRUCTURE FOR CREATE zr_travel,
      lt_ins TYPE TABLE FOR CREATE zr_travel.

ls_ins = VALUE #( TravelID = '00000001' AgencyID = '070001' Status = 'N' ).
lt_ins = VALUE #( ( TravelID = '00000002' AgencyID = '070001' Status = 'N' )
                  ( TravelID = '00000003' AgencyID = '070002' Status = 'N' ) ).

INSERT ztravel FROM @ls_ins MAPPING FROM ENTITY.
INSERT ztravel FROM TABLE @lt_ins MAPPING FROM ENTITY.

" --- UPDATE: FOR UPDATE 타입의 값으로 줄을 고친다
DATA: ls_upd TYPE STRUCTURE FOR UPDATE zr_travel,
      lt_upd TYPE TABLE FOR UPDATE zr_travel.

ls_upd = VALUE #( TravelID = '00000001' AgencyID = '070009' Status = 'O' ).
UPDATE ztravel FROM @ls_upd MAPPING FROM ENTITY.

" --- UPDATE + INDICATORS: %control 에서 on 인 필드만 덮어쓴다
lt_upd = VALUE #( ( TravelID = '00000002' AgencyID = '070009' Status = 'A'
                    %control = VALUE #( TravelID = if_abap_behv=>mk-on
                                        AgencyID = if_abap_behv=>mk-off
                                        Status   = if_abap_behv=>mk-on ) ) ).
UPDATE ztravel FROM TABLE @lt_upd
  INDICATORS SET STRUCTURE %control MAPPING FROM ENTITY.

" --- MODIFY: 있는 줄은 고치고 없는 줄은 넣는다
DATA lt_mod TYPE TABLE FOR CREATE zr_travel.
lt_mod = VALUE #( ( TravelID = '00000003' AgencyID = '070003' Status = 'O' )
                  ( TravelID = '00000004' AgencyID = '070003' Status = 'N' ) ).
MODIFY ztravel FROM TABLE @lt_mod MAPPING FROM ENTITY.

" --- DELETE: FOR DELETE 타입. 키만 채운다
DATA lt_del TYPE TABLE FOR DELETE zr_travel.
lt_del = VALUE #( ( TravelID = '00000003' ) ( TravelID = '00000004' ) ).
DELETE ztravel FROM TABLE @lt_del MAPPING FROM ENTITY.

" --- 결과 확인
SELECT * FROM ztravel ORDER BY PRIMARY KEY INTO TABLE @DATA(lt_travel).
```

## 알아두기

- `INDICATORS SET STRUCTURE %control` 을 붙인 `UPDATE` 뒤의 출력을 보면, `%control` 에서 꺼 둔 필드는 원본에 새 값이 있어도 DB 에서 예전 값 그대로입니다.
- `INSERT` 는 `INSERT dbtab FROM @wa`, `INSERT dbtab FROM TABLE @itab` 말고 `INSERT INTO dbtab VALUES @wa MAPPING FROM ENTITY` 꼴로도 썼습니다.
- `MODIFY` 의 원본은 `FOR CREATE` 타입으로, `DELETE` 의 원본은 `FOR DELETE` 타입으로 선언했습니다.
- 실행 클래스는 DB 테이블을 비우고 시작합니다.

## 관련 항목

- [[abapmapping_from_entity]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abapeml_corresponding]]
- [[abenbdl_type_mapping]]
