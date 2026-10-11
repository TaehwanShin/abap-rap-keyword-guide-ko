---
title: ABAP EML - RAP BO 사용하기
summary: EML 은 RAP BO 와 RAP BO interface 에 접근해 transactional buffer 의 데이터를 읽고 고치고 저장하게 하는 ABAP 문 묶음입니다.
keywords: EML, ABAP EML, Entity Manipulation Language, RAP BO 사용, READ ENTITIES, MODIFY ENTITIES, COMMIT ENTITIES, ROLLBACK ENTITIES, GET PERMISSIONS, SET LOCKS, CONVERT KEY, 트랜잭션 버퍼, BDEF 파생 타입
---

## 설명

ABAP EML(Entity Manipulation Language)은 RAP BO 와 RAP BO interface 에 접근하는 데 쓰는 ABAP 문의 묶음입니다. EML 문으로 RAP BO 의 데이터(transactional buffer(트랜잭션 버퍼)의 내용)를 읽거나 고칠 수 있고, 고친 데이터를 영구 저장하게 할 수 있습니다.

EML 은 어느 ABAP 프로그램에서나 RAP BO 를 사용하는 데 쓸 수 있습니다. behavior pool(동작 풀) 안, 곧 RAP BO 를 구현하는 코드에서도 씁니다. behavior pool 안에서만 쓸 수 있는 [[abeneml_in_abp|특수한 꼴]]도 몇 가지 있습니다.

EML 문을 실행하면 RAP 런타임 프레임워크가 움직여 RAP BO 의 구현을 부릅니다. 그 구현이 어디에 있는지는 BO 종류에 따라 다릅니다.

| 대상 | 구현이 있는 곳 |
| --- | --- |
| unmanaged RAP BO, managed RAP BO 의 unmanaged 부분 | behavior pool |
| 그 밖의 경우 | RAP provider(제공자) 프레임워크 |

EML 문에 넘기는 값은 대부분 특별한 내부 테이블입니다. RAP BO 로 데이터를 보내고, 결과나 메시지를 돌려받는 데 씁니다. 줄 타입이 이 용도에 맞게 짜여 있습니다([[abaptype_table_for|BDEF derived type]]).

## 예제

여행 하나를 읽고, 상태를 바꾼 뒤 저장합니다.

```abap
" 읽기
READ ENTITIES OF zr_travel
  ENTITY travel
    FIELDS ( status totalprice )
    WITH VALUE #( ( travelid = '00000001' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_read_failed).

" 고치기: 아직 transactional buffer 에만 반영된다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( status )
    WITH VALUE #( ( travelid = '00000001' status = 'A' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" save sequence 를 시작해 데이터베이스에 쓴다
COMMIT ENTITIES.
```

## 하위 항목

- [[abapcommon_eml_elements]] — 여러 EML 문에 함께 쓰이는 요소(`fields_tab`, `PRIVILEGED`, response parameter(응답 매개변수), `RESULT`)
- [[abapcommit_entities]] — save sequence(저장 순서)를 시작해 바뀐 내용을 저장합니다.
- [[abapget_permissions]] — 어떤 작업과 필드를 쓸 수 있는지 알아봅니다.
- [[abapmodify_entity_entities]] — 인스턴스를 만들고 고치고 지우며, action 을 실행합니다.
- [[abapread_entity_entities]] — 인스턴스를 읽고 function 을 실행합니다.
- [[abaprollback_entities]] — transactional buffer 의 변경 내용을 되돌립니다.
- [[abapset_locks]] — 인스턴스에 잠금을 겁니다.
- [[abapconvert_key]] — late numbering 에서 임시 키를 최종 키로 바꿉니다.

## 알아두기

- RAP 작업을 구현할 때는 RAP BO 계약을 지켜야 합니다. 자세한 지침은 SAP 의 ABAP RESTful Application Programming Model 개발 가이드 "RAP Business Object Contract" 절에 있습니다.
- 그 가운데 골라 놓은 지침은 [[abaprap_impl_rules]] 에서 볼 수 있습니다.

## 관련 항목

- [[abenabap_consume_rap_bos]]
- [[abeneml_in_abp]]
- [[abenrpm_testing]]
- [[abaprap_impl_rules]]
