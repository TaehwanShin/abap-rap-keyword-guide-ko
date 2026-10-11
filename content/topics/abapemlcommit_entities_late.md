---
title: COMMIT ENTITIES BEGIN ... END (최종 키 얻기)
summary: late numbering 에서 저장 중에 정해진 최종 키를 알아내려고, CONVERT KEY OF 를 쓸 수 있는 구간을 여닫는 COMMIT ENTITIES 형식입니다.
keywords: COMMIT ENTITIES BEGIN, COMMIT ENTITIES END, CONVERT KEY OF, late numbering, 늦은 번호 부여, %pid, 임시 키, 최종 키, 키 변환, adjust_numbers, TEMPORARY, IN SIMULATION MODE
---

## 문법

```syntax
COMMIT ENTITIES BEGIN [IN SIMULATION MODE]
                      [{RESPONSES response_param}
                       | {RESPONSE OF ... response_param}
                       | {RESPONSES OF ... response_param}].
  ...
  [CONVERT KEY OF bdef
    FROM [TEMPORARY] pre_key
    TO final_key.]
  ...
COMMIT ENTITIES END.
```

## 설명

RAP save sequence(저장 순서)를 시작하고 RAP 트랜잭션을 끝냅니다. transactional buffer(트랜잭션 버퍼)에 있는 변경, 곧 RAP 트랜잭션 안에서 만들고 고치고 지운 인스턴스가 모두 데이터베이스에 저장됩니다.

이 형식은 **late numbering**를 켠 entity(엔터티)를 변경했을 때 씁니다. late numbering 에서는 변경 작업을 하는 동안 인스턴스에 `%pid` 나 임시 키 같은 임시 식별자만 붙어 있습니다. 최종 키는 save sequence 안에서 saver method(세이버 메서드) `adjust_numbers` 가 불릴 때 정해집니다. 새 인스턴스의 최종 키를 알아야 한다면, 이 형식으로 구간을 열고 그 안에서 `CONVERT KEY OF` 문으로 임시 식별자를 최종 키로 바꿉니다.

| 부분 | 하는 일 |
| --- | --- |
| `COMMIT ENTITIES BEGIN ...` | 커밋 구간을 엽니다. |
| `COMMIT ENTITIES END.` | 커밋 구간을 닫습니다. 닫는 순간, 앞서 한 작업과 관련된 키 정보가 모두 사라집니다. |

`BEGIN` 에 붙일 수 있는 추가 구문은 다음과 같습니다.

- `IN SIMULATION MODE` : 실제로 저장하지 않고 저장을 흉내만 냅니다. [[abapcommit_entities_simulation]] 을 봅니다.
- `RESPONSES response_param` : saver method 의 response parameter(응답 매개변수)가 돌려준 정보를 받습니다.
- `RESPONSE OF ... response_param` : [[abapemlcommit_entities_long|긴 형식]] 처럼 root entity(루트 엔터티)를 여럿 적어 응답을 따로 받습니다.
- `RESPONSES OF ... response_param` : [[abapemlcommit_entities_dyn|동적 형식]] 처럼 root entity 를 실행 시점에 정해 응답을 받습니다.

`response_param` 의 자세한 내용은 [[abapeml_response]] 에, `CONVERT KEY OF` 의 자세한 내용은 [[abapconvert_key]] 에 있습니다.

## 예제

late numbering 을 쓰는 여행 BO 에 여행을 하나 만들고, 저장하면서 최종 `TravelID` 를 알아냅니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid )
    WITH VALUE #( ( %cid = 'cid1' agencyid = '070001' customerid = '000042' ) )
  MAPPED   DATA(ls_mapped)      " 임시 식별자 %pid 가 들어 있다
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES BEGIN
  RESPONSE OF zr_travel
    FAILED   DATA(ls_failed_late)
    REPORTED DATA(ls_reported_late).

" sy-subrc 는 BEGIN 바로 뒤에서 확인한다
IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.

LOOP AT ls_mapped-travel ASSIGNING FIELD-SYMBOL(<ls_new>).
  " 임시 식별자를 최종 키로 바꾼다. 한 번에 한 건씩이다
  CONVERT KEY OF zr_travel
    FROM <ls_new>-%pid
    TO DATA(ls_final_key).
  " ls_final_key-travelid 가 최종 여행 번호다
ENDLOOP.

COMMIT ENTITIES END.
```

## 알아두기

- `sy-subrc` 는 `BEGIN` 이 붙은 문 바로 뒤에서 확인합니다. 확인하지 않으면 문법 경고가 납니다. 응답을 받았다면 `failed` 도 확인합니다.
- `COMMIT ENTITIES END.` 뒤에는 키 정보가 남지 않습니다. 최종 키가 필요하면 구간 안에서 변수에 옮겨 둡니다.
- RAP BO provider(제공자) 안에서는 `COMMIT ENTITIES` 를 쓸 수 없습니다.
- 문 전체에 해당하는 주의점은 [[abapcommit_entities]] 에 있습니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapconvert_key]]
- [[abenbdl_late_numbering]]
- [[abensaver_adjust_numbers]]
- [[abapderived_types_pid]]
- [[abapcommit_entities_simulation]]
- [[abencommit_entities_beginend_abexa]]
