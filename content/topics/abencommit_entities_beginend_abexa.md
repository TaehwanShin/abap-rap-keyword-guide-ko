---
title: 예제 - COMMIT ENTITIES BEGIN ... END 와 CONVERT KEY OF
summary: late numbering 을 쓰는 unmanaged BO 에 인스턴스를 만들고, COMMIT ENTITIES BEGIN 과 END 사이에서 CONVERT KEY OF 로 %pid 를 최종 키로 바꾸는 예제입니다.
keywords: COMMIT ENTITIES BEGIN, COMMIT ENTITIES END, CONVERT KEY OF, late numbering, 늦은 번호 부여, %pid, %cid, adjust_numbers, MAPPED EARLY, MAPPED LATE, 비관리형, unmanaged, 예제
---

## 설명

late numbering 에서 **저장할 때 정해지는 최종 키**를 RAP BO consumer(사용자)가 알아내는 방법을 보여 주는 예제입니다. `COMMIT ENTITIES BEGIN` 과 `COMMIT ENTITIES END` 로 구간을 만들고, 그 안에서 `CONVERT KEY OF` 를 씁니다.

원문은 root entity(루트 엔터티) 하나뿐인 단순한 unmanaged RAP BO 를 씁니다. behavior definition(동작 정의)에 `late numbering` 이 있고, standard operation(표준 작업)은 `create` 와 `update` 만 있습니다. 키 필드는 `readonly` 입니다.

behavior pool(동작 풀)은 로컬 클래스 세 개로 이루어집니다.

| 클래스 | 하는 일 |
| --- | --- |
| 버퍼 클래스 | transactional buffer(트랜잭션 버퍼) 노릇을 하는 내부 테이블이 있습니다. 줄에는 entity(엔터티)의 키와 데이터 필드에 더해 `cid`, `pid`, 그리고 바뀌었는지와 지워졌는지를 나타내는 표시 필드 두 개가 있습니다. 삭제는 이 예제에서 쓰지 않습니다. |
| handler class(핸들러 클래스) | `create` 는 인스턴스마다 임시 식별자 `%pid` 를 만듭니다(예제에서는 UUID). 넘어온 값을 버퍼에 넣고 바뀜 표시를 하며, `MAPPED` 에 `%cid` 와 새 `%pid` 를 채웁니다. 이때 `MAPPED` 는 `MAPPED EARLY` 타입입니다. `update` 는 `%pid` 로 인스턴스를 찾아, 넘어온 데이터 필드만 고치고 바뀜 표시를 합니다. |
| saver class(세이버 클래스) | `finalize` 는 버퍼에서 `%cid` 값을 지웁니다. 저장 단계에서는 쓰면 안 되기 때문입니다. `adjust_numbers` 는 인스턴스마다 최종 키를 정하고 `MAPPED` 를 채웁니다. 이때는 `MAPPED LATE` 타입입니다. `save` 는 바뀜 표시가 있는 인스턴스만 골라 데이터베이스 테이블에 씁니다. `cleanup` 은 버퍼를 비웁니다. |

원문의 핸들러 구현은 일부러 단순하게 두었습니다. 인스턴스가 이미 있는지 확인하지 않고, `FAILED` 나 `REPORTED` 도 채우지 않습니다.

## 예제

같은 흐름을 여행 BO 로 줄여 썼습니다. behavior definition 은 다음과 같습니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
lock master
authorization master ( none )
late numbering
{
  create;
  update;
  field ( readonly ) TravelID;
}
```

RAP BO consumer 쪽 코드입니다.

```abap
" 여행 두 건을 만든다. 키는 아직 없고 MAPPED 로 %pid 를 받는다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid )
    WITH VALUE #( ( %cid = 'cid1' agencyid = '070001' customerid = '000042' )
                  ( %cid = 'cid2' agencyid = '070002' customerid = '000043' ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 방금 만든 인스턴스를 %pid 로 가리켜 고친다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( status )
    WITH VALUE #( FOR ls_new IN ls_mapped-travel
                  ( %pid = ls_new-%pid status = 'N' ) )
  FAILED   ls_failed
  REPORTED ls_reported.

" 저장을 시작하고 커밋 구간을 연다
COMMIT ENTITIES BEGIN.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.

" %pid 는 RAP 트랜잭션이 끝날 때까지 살아 있으므로 최종 키로 바꿀 수 있다
LOOP AT ls_mapped-travel ASSIGNING FIELD-SYMBOL(<ls_new>).
  CONVERT KEY OF zr_travel
    FROM <ls_new>-%pid
    TO DATA(ls_final_key).
  " ls_final_key-travelid : adjust_numbers 가 정한 최종 여행 번호
ENDLOOP.

" 커밋 구간을 닫는다
COMMIT ENTITIES END.
```

### 실행하면

1. `CREATE` 가 실행될 때 handler method(핸들러 메서드) `create` 가 `%pid` 를 만들고, `MAPPED` 로 `%cid` 와 `%pid` 를 돌려줍니다.
2. `UPDATE` 는 그 `%pid` 로 방금 만든 인스턴스를 찾아 고칩니다.
3. `COMMIT ENTITIES BEGIN` 이 save sequence(저장 순서)를 시작합니다. `adjust_numbers` 에서 최종 키가 정해집니다.
4. 반복문이 `MAPPED` 의 줄을 하나씩 돌면서 `CONVERT KEY OF` 로 `%pid` 에 해당하는 최종 키를 받습니다.
5. 원문 예제는 `%pid` 와 최종 키를 짝지은 표, 그리고 데이터베이스에 저장된 인스턴스를 화면에 보여 줍니다.

## 알아두기

- 이 예제에서 키를 꼭 알아야 하는 것은 아닙니다. `CONVERT KEY OF` 를 보여 주려고 최종 키가 필요하다고 가정한 것입니다.
- `CONVERT KEY OF` 는 내부 테이블이 아니라 값 하나를 다룹니다. 그래서 반복문 안에서 한 건씩 실행합니다.
- `sy-subrc` 는 `COMMIT ENTITIES BEGIN` 바로 뒤에서 확인합니다.
- `COMMIT ENTITIES END.` 로 구간을 닫으면 키 정보가 사라집니다. 필요한 키는 그 전에 변수에 옮겨 둡니다.

## 관련 항목

- [[abapemlcommit_entities_late]]
- [[abapconvert_key]]
- [[abenbdl_late_numbering]]
- [[abensaver_adjust_numbers]]
- [[abapderived_types_pid]]
- [[abapcommit_entities]]
