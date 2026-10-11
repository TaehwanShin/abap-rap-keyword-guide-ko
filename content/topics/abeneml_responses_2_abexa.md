---
title: TYPE RESPONSE FOR 예제
summary: 이미 있는 키로 인스턴스를 만들게 해서 일부러 오류를 내고, failed, mapped, reported 응답에 무엇이 담기는지 보여 주는 예제입니다.
keywords: TYPE RESPONSE FOR, failed, mapped, reported, 응답 매개변수, FAILED, MAPPED, REPORTED, %cid, %fail, %msg, 중복 키, MODIFY ENTITY, 예제
---

## 설명

이 예제는 단순한 managed RAP BO 로 response parameter(응답 매개변수) `FAILED`, `MAPPED`, `REPORTED` 에 무엇이 담기는지 보여 줍니다. 응답에 내용이 생기도록 **일부러 오류를 냅니다.**

방법은 이렇습니다.

1. ABAP SQL `MODIFY` 문으로 persistent table 에 줄 몇 개를 직접 넣어 둡니다.
2. EML `MODIFY` 문으로 인스턴스를 만듭니다. 이 가운데 일부는 1번에서 넣은 줄과 키가 같습니다.
3. 키가 겹치는 인스턴스는 만들 수 없으므로 `failed` 와 `reported` 에 올라갑니다. 문제없이 만든 인스턴스의 mapping 정보는 `mapped` 에 올라갑니다.
4. `COMMIT ENTITIES` 로 저장합니다. 만들지 못한 인스턴스는 저장되지 않습니다.

응답을 받는 구조 세 개는 `TYPE RESPONSE FOR` 로 미리 선언해 두고 `FAILED`, `MAPPED`, `REPORTED` 뒤에 적습니다.

## 예제

공통 예제 모델로 줄여 쓴 것입니다. 키 `00000002` 를 persistent table 에 먼저 넣어 두어서, 두 번째 인스턴스를 만들 수 없게 합니다.

```abap
DATA ls_mapped   TYPE RESPONSE FOR MAPPED   zr_travel.
DATA ls_failed   TYPE RESPONSE FOR FAILED   zr_travel.
DATA ls_reported TYPE RESPONSE FOR REPORTED zr_travel.

" 1) 같은 키의 줄을 ABAP SQL 로 먼저 넣어 둔다
MODIFY ztravel FROM TABLE @( VALUE #(
  ( travel_id = '00000002' agency_id = '070009' ) ) ).

" 2) EML 로 인스턴스를 만든다. cid2 는 키가 겹친다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
    WITH VALUE #(
      ( %cid = 'cid1' travelid = '00000001'
        agencyid = '070001' customerid = '000010' )
      ( %cid = 'cid2' travelid = '00000002'
        agencyid = '070002' customerid = '000020' ) )
  FAILED   ls_failed
  MAPPED   ls_mapped
  REPORTED ls_reported.

" 3) 응답을 읽는다
LOOP AT ls_mapped-travel INTO DATA(ls_map).
  " 만든 인스턴스: ls_map-%cid 와 ls_map-travelid 가 짝지어져 있다
ENDLOOP.

LOOP AT ls_failed-travel INTO DATA(ls_fail).
  " 실패한 인스턴스: ls_fail-%cid, ls_fail-travelid, ls_fail-%fail-cause
ENDLOOP.

LOOP AT ls_reported-travel INTO DATA(ls_report).
  " 메시지: 심각도와 글
  DATA(lv_severity) = ls_report-%msg->m_severity.
  DATA(lv_text)     = ls_report-%msg->if_message~get_text( ).
ENDLOOP.

" 4) 저장한다. 만들지 못한 인스턴스는 저장되지 않는다
COMMIT ENTITIES.
```

### 실행하면

원문 예제는 응답 세 개를 화면에 보여 준 다음 persistent table 의 내용을 보여 줍니다.

- **`FAILED`** : 실패 원인, `%cid`, 인스턴스의 키, 그리고 어느 작업이나 association 에서 실패했는지가 나옵니다. 해당하는 작업 칸에 `01` 이 들어 있습니다.
- **`REPORTED`** : 심각도, `%cid`, 키, 메시지가 나옵니다.
- **`MAPPED`** : `%cid` 와 그에 맞는 인스턴스 키가 나옵니다.
- **persistent table** : EML 로 문제없이 만든 줄과, ABAP SQL 로 먼저 넣어 둔 줄이 함께 있습니다. ABAP SQL 로 넣은 줄은 처음 넣은 값 그대로입니다.

## 알아두기

- 원문은 이 예제에 behavior pool(동작 풀)이 없다고 설명합니다. 그런데 원문에 실린 BDEF 코드에는 `implementation in class` 가 적혀 있고, entity(엔터티) 이름도 `DEMO_MANAGED_ROOT_CUSTOM` 이어서 예제 코드가 쓰는 `DEMO_MANAGED_ROOT` 와 다릅니다. 실제 BDEF 는 시스템에서 확인해야 합니다.
- 이 예제는 managed RAP BO 를 씁니다. managed RAP BO provider(제공자)가 키 중복을 알아내고 응답을 채웁니다.
- 응답 구조 안에는 entity 마다 내부 테이블이 하나씩 있습니다. 이 예제에서는 root entity(루트 엔터티) 테이블만 채워집니다.

## 관련 항목

- [[abaptype_response_for]]
- [[abapeml_response]]
- [[abeneml_responses_abexa]]
- [[abapderived_types_fail]]
- [[abapderived_types_msg]]
- [[abapderived_types_cid]]
- [[abapcommit_entities]]
