---
title: 예제 - 저장 차례 직접 정하기 (save after)
summary: 서로 관계없는 두 RAP BO 를 한 트랜잭션에서 만들고, save after 로 정한 차례대로 저장되는지를 로그로 확인하는 예제입니다.
keywords: save after, 저장 차례, explicit save order, 예제, late numbering, 늦은 번호 부여, with additional save, save_modified, adjust_numbers, CONVERT KEY, %pid, COMMIT ENTITIES
---

## 설명

이 예제는 `save after` 가 저장 차례를 실제로 바꾸는지 보여 줍니다.

- 서로 관계없는 RAP BO 두 개를 씁니다. 여기서는 여행 `ZR_Travel` 과 여행사 `ZR_Agency` 로 옮겨 적었습니다.
- 여행 BO 가 `save after ZR_Agency;` 를 적습니다. 그래서 여행사가 먼저, 여행이 나중에 저장됩니다.
- 두 BO 모두 `late numbering` 을 씁니다.
- 두 BO 모두 `with additional save` 를 씁니다. additional save 는 `save after` 와 상관이 없습니다. `save_modified` 가 불릴 때 로그 테이블에 한 줄씩 남기려고 넣었을 뿐입니다.

## 예제

두 BO 의 BDEF 입니다. 다른 점은 `save after` 한 줄뿐입니다.

```bdl
// ZR_Travel : 여행사보다 나중에 저장한다
managed with additional save
implementation in class zbp_r_travel unique;
strict ( 2 );
save after ZR_Agency;

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
late numbering
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

```bdl
// ZR_Agency
managed with additional save
implementation in class zbp_r_agency unique;
strict ( 2 );

define behavior for ZR_Agency alias Agency
persistent table zagency
lock master
authorization master ( none )
late numbering
{
  create;
  update;
  delete;
  field ( readonly : update ) AgencyID;
}
```

두 BO 에 인스턴스를 두 개씩 만들고 한 번에 저장합니다. 일부러 여행을 먼저 만듭니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( customerid status )
    WITH VALUE #( ( %cid = 'TRAVEL_1' customerid = '000001' status = 'O' )
                  ( %cid = 'TRAVEL_2' customerid = '000002' status = 'O' ) ).

MODIFY ENTITIES OF zr_agency
  ENTITY agency
    CREATE FIELDS ( name )
    WITH VALUE #( ( %cid = 'AGENCY_1' name = '가나 여행사' )
                  ( %cid = 'AGENCY_2' name = '다라 여행사' ) ).

COMMIT ENTITIES.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.

" 저장된 내용과 로그를 확인한다
SELECT * FROM ztravel INTO TABLE @FINAL(lt_travel_db).
SELECT * FROM zagency INTO TABLE @FINAL(lt_agency_db).
```

두 behavior pool(동작 풀)의 `save_modified` 는 만들어진 인스턴스마다 시각을 붙여 로그 테이블에 한 줄씩 넣습니다.

```abap
METHOD save_modified.
  LOOP AT create-travel INTO DATA(ls_travel).
    APPEND VALUE #( text      = |Travel { ls_travel-travelid } 저장|
                    timestamp = utclong_current( ) ) TO zbp_r_travel=>gt_log.
  ENDLOOP.
ENDMETHOD.
```

여행 BO 의 `adjust_numbers` 는 여행사의 임시 키를 최종 키로 바꿉니다. 여행사 BO 의 `adjust_numbers` 가 자기 `%pid` 값을 behavior pool 전역 클래스의 내부 테이블(`gt_pids`)에 넣어 두고, 여행 BO 가 그것을 읽습니다.

```abap
METHOD adjust_numbers.
  DATA ls_agency_key TYPE STRUCTURE FOR KEY OF zr_agency.

  LOOP AT zbp_r_agency=>gt_pids INTO DATA(lv_pid).
    " 여행사가 먼저 처리되었으므로 최종 키를 얻을 수 있다
    CONVERT KEY OF zr_agency FROM lv_pid TO ls_agency_key.
    APPEND VALUE #( pid = lv_pid agencyid = ls_agency_key-agencyid )
      TO zbp_r_travel=>gt_converted_keys.
  ENDLOOP.

  " (여행 자신의 최종 키를 mapped 에 채우는 부분은 줄임)
ENDMETHOD.
```

## 알아두기

실행하면 다음을 볼 수 있습니다.

- `COMMIT ENTITIES` 가 두 BO 의 저장을 한꺼번에 일으키고, 두 `save_modified` 가 불립니다.
- 로그에는 **여행사의 줄이 먼저, 여행의 줄이 나중에** 찍힙니다. `save after` 로 차례를 정했기 때문입니다. 차례를 정하지 않았다면 여행의 `save_modified` 가 여행사보다 먼저 실행됩니다.
- 여행 BO 의 `adjust_numbers` 에서 `CONVERT KEY` 가 여행사의 `%pid` 를 최종 키로 바꿉니다. 앞선 BO 의 최종 키를 이 방법으로 얻을 수 있음을 보여 줍니다. 예제는 `%pid` 와 키 값을 짝지은 내부 테이블을 화면에 냅니다.

눈여겨볼 점은 다음과 같습니다.

- 원문 예제는 실행할 때마다 생성자에서 두 테이블을 비우고, 서로 다른 키 값으로 미리 몇 줄을 채웁니다. 예제의 `adjust_numbers` 가 키를 아주 단순하게 매기기 때문에, 두 BO 가 같은 키 값을 쓰지 않게 하려는 준비입니다.
- 원문의 BO 이름은 `DEMO_RAP_SAVE_AFTER_A`(나중에 저장) 와 `DEMO_RAP_SAVE_AFTER_B`(먼저 저장), 실행 클래스는 `CL_DEMO_RAP_SAVE_AFTER` 입니다.

## 관련 항목

- [[abenbdl_save_after]]
- [[abapconvert_key]]
- [[abensaver_adjust_numbers]]
- [[abaprap_saver_meth_save_modified]]
- [[abenbdl_saving]]
- [[abenbdl_late_numbering]]
