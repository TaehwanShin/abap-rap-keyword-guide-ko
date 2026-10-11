---
title: %pid 사용 예제
summary: late numbering 을 쓰는 unmanaged RAP BO 에서 임시 식별자 %pid 로 인스턴스를 만들고, 저장할 때 CONVERT KEY OF 로 최종 키를 알아내는 예제입니다.
keywords: %pid, 임시 식별자, 예비 ID, preliminary ID, late numbering, 늦은 번호 부여, CONVERT KEY OF, COMMIT ENTITIES BEGIN, COMMIT ENTITIES END, MAPPED EARLY, MAPPED LATE, adjust_numbers, 예제
---

## 설명

이 예제는 late numbering 을 쓰는 unmanaged RAP BO 에서 **`%pid`** 가 어떻게 쓰이는지 보여 줍니다.

late numbering 에서는 최종 키가 save sequence(저장 순서)에 들어가서야 정해집니다. 그 전까지 인스턴스를 구별할 것이 필요한데, 그 역할을 하는 임시 식별자가 `%pid` 입니다.

흐름은 다음과 같습니다.

1. `MODIFY` 요청 하나로 인스턴스를 여러 개 만듭니다. 키는 비워 둡니다. behavior pool(동작 풀)의 `create` 메서드가 인스턴스마다 `%pid` 를 붙여 주기 때문입니다.
2. `COMMIT ENTITIES BEGIN` 과 `COMMIT ENTITIES END` 사이에서 `CONVERT KEY OF` 문을 실행합니다. save sequence 안에서 saver method(세이버 메서드) `adjust_numbers` 가 최종 키를 정하고, `CONVERT KEY OF` 문은 `%pid` 에 맞는 최종 키를 알려 줍니다.
3. `COMMIT ENTITIES END` 로 저장을 마치면 인스턴스가 persistent table 에 들어갑니다.

## 예제

공통 예제 모델로 줄여 쓴 것입니다. `TravelID` 는 저장할 때 정해지므로 readonly 로 두었습니다.

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

```abap
DATA lt_mapped_late TYPE TABLE FOR MAPPED LATE zr_travel.

" 키 없이 만든다. %pid 는 behavior pool 의 create 메서드가 붙인다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( agencyid customerid )
    WITH VALUE #(
      ( %cid = 'cid1' agencyid = '070001' customerid = '000010' )
      ( %cid = 'cid2' agencyid = '070002' customerid = '000020' ) )
  MAPPED DATA(ls_mapped_early).

COMMIT ENTITIES BEGIN.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.

LOOP AT ls_mapped_early-travel ASSIGNING FIELD-SYMBOL(<ls_early>).
  " %pid 에 맞는 최종 키를 받는다
  CONVERT KEY OF zr_travel
    FROM <ls_early>-%pid
    TO DATA(ls_final_key).

  APPEND VALUE #( %pid = <ls_early>-%pid
                  %key = ls_final_key ) TO lt_mapped_late.
ENDLOOP.

COMMIT ENTITIES END.
```

### 실행하면

원문 예제는 표 세 개를 보여 줍니다.

- **`MAPPED EARLY` 응답** — `MODIFY` 직후의 mapping 정보입니다. 아직 최종 키가 없어서 키 값이 초기값으로 나옵니다.
- **`MAPPED LATE` 내용** — `CONVERT KEY OF` 로 얻은 최종 키가 `%pid` 와 함께 들어 있습니다.
- **persistent table 내용** — 생성 작업이 끝난 뒤 최종 키로 저장된 줄입니다.

## 알아두기

- 이 시나리오에서는 `%tmp` 를 쓰지 않습니다. 그래서 `MAPPED LATE` 표의 `%tmp` 는 초기값으로 나옵니다.
- `%pid` 를 붙이는 일과 최종 키를 정하는 일은 모두 behavior pool 에서 직접 구현합니다. 구현 쪽 설명은 [[abencommit_entities_beginend_abexa]] 에 있습니다.
- `%key` 에 임시 키를 넣고 `%tmp` 로 옮기는 방식은 [[abenderived_types_pre_tmp_abexa]] 에서 다룹니다.

## 관련 항목

- [[abapderived_types_pid]]
- [[abenbdl_late_numbering]]
- [[abapemlcommit_entities_late]]
- [[abapconvert_key]]
- [[abensaver_adjust_numbers]]
- [[abaptype_response_for]]
