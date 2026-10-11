---
title: %pre / %tmp / %pky 사용 예제
summary: late numbering 을 쓰는 unmanaged RAP BO 에서 %pky 로 저장 전 인스턴스를 가리키고, adjust_numbers 에서 %pre·%tmp 로 임시 키를 최종 키에 잇는 예제입니다.
keywords: %pre, %tmp, %pky, %pid, %key, 임시 키, 예비 키, 최종 키, late numbering, 늦은 번호 부여, adjust_numbers, CONVERT KEY OF, FROM TEMPORARY, MAPPED LATE, REPORTED LATE, 예제
---

## 설명

이 예제는 late numbering 을 쓰는 unmanaged RAP BO 에서 **`%pre`, `%tmp`, `%pky`** 세 구성요소가 어디에 쓰이는지 보여 줍니다. 실제 업무용 numbering 방식을 보여 주려는 것이 아니라, 구성요소의 쓰임새를 눈으로 확인하게 해 주는 예제입니다.

세 구성요소의 역할은 이렇습니다.

| 구성요소 | 역할 |
| --- | --- |
| `%pky` | `%pid` 와 `%key` 를 묶은 것입니다. 아직 저장되지 않은 인스턴스를 임시 식별자와 임시 키로 가리킬 때 씁니다. |
| `%tmp` | 임시 키 값을 담습니다. interaction phase(상호작용 단계)에서 `%key` 에 임시 키를 넣어 썼다면, save sequence(저장 순서)에서는 그 임시 키를 `%tmp` 에 적습니다. |
| `%pre` | `%pid` 와 `%tmp` 를 묶은 것입니다. `adjust_numbers` 에서 "이 임시 값이 저 최종 키가 된다"고 `mapped` 에 적을 때 씁니다. |

### behavior pool 이 하는 일

원문 예제의 behavior pool(동작 풀)에는 다음이 들어 있습니다.

- `lcl_buffer` : transactional buffer(트랜잭션 버퍼)를 맡는 로컬 클래스입니다. 이 예제에서 버퍼는 내부 테이블입니다. 이 테이블은 persistent table 의 필드 전부와 `%pid`, `%cid` 를 담고, 표시용 필드 두 개가 더 있습니다. `changed` 는 만들었거나 바꿔서 저장해야 하는 인스턴스인지, `final_key_assigned` 는 최종 키를 이미 받았는지 나타냅니다.
- `create` : 인스턴스를 만들어 버퍼에 넣습니다. 이때 인스턴스마다 `%pid` 와 임시 `%key` 값을 만듭니다.
- `update` : 인스턴스를 고칩니다. 최종 키를 이미 받은 인스턴스와 아직 받지 않은 인스턴스를 모두 처리합니다.
- `prep_root_buffer` : 버퍼를 준비합니다. 이미 저장된 인스턴스를 수정하라는 요청이면 persistent table 에서 읽어 버퍼에 올립니다.
- `adjust_numbers` : 최종 키를 정합니다. 이 예제에서는 단순히 정수를 붙입니다. `MAPPED LATE` 응답(`%pre`, `%tmp` 가 여기 나옵니다)과 `REPORTED LATE` 응답도 여기서 채웁니다.
- `save`, `cleanup`, `cleanup_finalize` : 버퍼 내용을 persistent table 에 쓰거나 버퍼를 비웁니다.

## 예제

공통 예제 모델로 줄여 쓴 것입니다. 먼저 RAP BO consumer(사용자) 쪽 코드입니다.

```abap
" 1) 키 없이 만든다. create 메서드가 %pid 와 임시 %key 를 만든다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( agencyid customerid )
    WITH VALUE #(
      ( %cid = 'cid1' agencyid = '070001' customerid = '000010' )
      ( %cid = 'cid2' agencyid = '070002' customerid = '000020' ) )
  MAPPED   DATA(ls_mapped_early)
  FAILED   DATA(ls_failed_early)
  REPORTED DATA(ls_reported_early).

" 2) 아직 저장하지 않은 인스턴스를 %pky 로 가리켜 고친다
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( status )
    WITH VALUE #( ( %pky   = ls_mapped_early-travel[ 1 ]-%pky
                    status = 'O' ) )
  FAILED   ls_failed_early
  REPORTED ls_reported_early.

" 3) 저장하면서 임시 값에 맞는 최종 키를 받아 온다
COMMIT ENTITIES BEGIN
  RESPONSES FAILED   DATA(ls_failed_late)
            REPORTED DATA(ls_reported_late).

LOOP AT ls_mapped_early-travel ASSIGNING FIELD-SYMBOL(<ls_early>).
  CONVERT KEY OF zr_travel
    FROM TEMPORARY VALUE #( %pid = <ls_early>-%pid
                            %tmp = <ls_early>-%key )
    TO DATA(ls_final_key).
ENDLOOP.

COMMIT ENTITIES END.
```

saver class(세이버 클래스)의 `adjust_numbers` 에서는 `%pre` 로 임시 값을, `%key` 로 최종 키를 적습니다.

```abap
METHOD adjust_numbers.
  LOOP AT lcl_buffer=>mt_travel ASSIGNING FIELD-SYMBOL(<ls_buffer>)
       WHERE final_key_assigned = abap_false.

    DATA(lv_final_id) = lcl_buffer=>get_next_travel_id( ).

    " 임시 값(%pid + %tmp)이 어떤 최종 키가 되었는지 알린다
    APPEND VALUE #( %pre = VALUE #( %pid          = <ls_buffer>-pid
                                    %tmp-travelid = <ls_buffer>-travelid )
                    %key-travelid = lv_final_id ) TO mapped-travel.

    <ls_buffer>-travelid           = lv_final_id.
    <ls_buffer>-final_key_assigned = abap_true.
  ENDLOOP.
ENDMETHOD.
```

### 실행하면

원문 예제는 표 세 개를 보여 줍니다.

- persistent table 내용 : 작업이 끝난 뒤 최종 키로 저장된 줄입니다.
- `MAPPED LATE` 정보 : `%pid`, `%tmp`, 최종 `%key` 가 짝지어져 있습니다.
- `REPORTED LATE` 정보 : `MAPPED LATE` 와 마찬가지로 `adjust_numbers` 에서 채운 내용입니다.

## 알아두기

- draft 를 쓰지 않는 시나리오라서 `%pky` 로 인스턴스를 가리킬 수 있습니다. `%tky` 를 써도 됩니다. 오히려 `%tky` 를 쓰는 편을 권장합니다. 여기서는 `%tky` 와 `%pky` 의 구성요소가 같지만, 나중에 draft 를 쓰게 되면 `%tky` 에는 `%is_draft` 가 더해지므로 코드를 고칠 일이 줄어듭니다.
- 수정 요청은 아직 persistent table 에 없는 인스턴스를 고칩니다. 그래서 `%key` 에는 최종 키가 아니라 임시 키가 들어 있습니다.
- 이 예제에서 `CONVERT KEY OF` 는 임시 키에 맞는 최종 키를 받아 화면에 보여 주려고 넣은 것입니다.
- `%pid` 만으로 인스턴스를 구별하는 더 단순한 방식은 [[abenderived_types_pid_abexa]] 에서 다룹니다.

## 관련 항목

- [[abapderived_types_pre]]
- [[abapderived_types_tmp]]
- [[abapderived_types_pky]]
- [[abapderived_types_pid]]
- [[abenbdl_late_numbering]]
- [[abensaver_adjust_numbers]]
- [[abapconvert_key]]
- [[abaptype_response_for]]
