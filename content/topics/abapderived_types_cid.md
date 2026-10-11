---
title: %cid (내용 ID)
summary: 생성 요청에서 새 인스턴스에 붙이는 임시 이름표로, 같은 EML 요청 안에서 그 인스턴스를 다시 가리킬 때 씁니다.
keywords: %cid, content ID, 내용 ID, ABP_BEHV_CID, AUTO FILL CID, %cid_ref, 임시 식별자, CREATE, static action, factory action, strict(2)
---

## 설명

`%cid` 는 BDEF derived type(BDEF 파생 타입)의 구성요소입니다. **내용 ID**(content ID)를 담는 문자열이고, EML 요청을 보낼 때 채워야 합니다. [[abenbdl_strict_2|strict(2)]] 모드에서는 `%cid` 를 반드시 써야 합니다.

내용 ID 는 인스턴스에 붙이는 유일한 **임시 식별자**입니다. 특히 그 인스턴스에 아직 기본 키가 없는 동안 씁니다. 쓰임새는 두 가지입니다.

- 생성 작업에서 새 인스턴스에 이름을 붙입니다.
- 같은 `MODIFY` 요청 안에서 그 인스턴스를 이어서 고칠 때 가리키는 기준이 됩니다. 이때는 [[abapderived_types_cid_ref|%cid_ref]] 에 `%cid` 와 같은 값을 넣습니다. `CREATE BY`, `UPDATE`, `DELETE` 작업과 `EXECUTE` 로 부르는 action 에서 그렇게 씁니다([[abapmodify_entity_entities_op]]).

`%cid` 값은 EML 요청 하나 안에서 **유일**해야 하고, 그 요청 안에서만 유효합니다. 직접 적어도 되고 자동으로 채워도 됩니다.

- 직접 적기 : `%cid = 'cid1'` 처럼 값을 줍니다.
- 자동으로 채우기 : `MODIFY` 문에 [[abapmodify_entity_entities_fields|AUTO FILL CID]] 를 붙이면 `%cid` 가 자동으로 만들어져, 빠뜨릴 일이 없습니다. 다만 `%cid_ref` 는 자동으로 만든 값을 가리킬 수 없습니다. `%cid_ref` 를 쓸 생각이면 `%cid` 를 직접 적어야 합니다.

`%cid` 를 가리키는 다른 작업이 없더라도 `%cid` 는 적어 두는 것이 좋습니다. 특히 [[abenbdl_early_numb|early numbering]] 과 [[abenbdl_late_numbering|late numbering]]에서는 문제가 생기지 않도록 반드시 적습니다.

### 타입

`ABP_BEHV_CID`

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `CREATE`
- `ACTION IMPORT`, `ACTION RESULT` (static action)
- `FUNCTION IMPORT`, `FUNCTION RESULT` (static function)
- `FAILED [EARLY]`
- `MAPPED [EARLY]`
- `REPORTED [EARLY]`

[[abapderived_types_target|%target]] 구성요소 안에도 들어 있습니다.

## 예제

여행 세 건을 만들면서 건마다 다른 `%cid` 를 붙입니다. 실패하면 `FAILED` 응답에 같은 `%cid` 가 돌아오므로 어느 건이 실패했는지 알 수 있습니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
  WITH VALUE #(
    ( %cid = 'cid1' travelid = '00000001' agencyid = '070001' customerid = '000010' )
    ( %cid = 'cid2' travelid = '00000002' agencyid = '070002' customerid = '000020' )
    ( %cid = 'cid3' travelid = '00000003' agencyid = '070003' customerid = '000030' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).

LOOP AT ls_failed-travel ASSIGNING FIELD-SYMBOL(<ls_failed>).
  " <ls_failed>-%cid 로 실패한 건을 찾는다
ENDLOOP.
```

## 알아두기

- `%cid` 를 빠뜨리면 런타임 오류가 날 수 있습니다. [[abaprap_impl_rules]] 를 참고합니다.
- **static action**에서는 `%cid` 의 역할이 다릅니다. factory action(static factory action 도 포함)에서는 위에서 설명한 대로 새 인스턴스의 이름표입니다. factory 가 아닌 static action 에서는 `%cid` 가 **작업 ID** 구실을 하며, RAP [[abaptype_response_for|응답]]에서 그 작업을 가리킬 때 씁니다.

## 관련 항목

- [[abapderived_types_cid_ref]]
- [[abapderived_types_keys_identifiers]]
- [[abapmodify_entity_entities]]
- [[abapmodify_entity_entities_fields]]
- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenderived_types_cid_cidref_abexa]]
