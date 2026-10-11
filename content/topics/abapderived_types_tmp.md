---
title: %tmp (임시 키 값 묶음)
summary: late numbering 의 adjust_numbers 메서드에서 임시 키 값을 담는 구성요소 묶음으로, mapped 로 임시 키를 최종 키에 짝지을 때 씁니다.
keywords: %tmp, %pre, %pid, %key, MAPPED LATE, adjust_numbers, late numbering, 늦은 번호 부여, 임시 키, 최종 키, 구성요소 묶음
---

## 설명

`%tmp` 는 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**이며 임시 키 값을 담습니다.

- 쓰는 자리는 save sequence(저장 순서) 안의 [[abensaver_adjust_numbers|adjust_numbers]] 메서드입니다. 그래서 [[abenbdl_late_numbering|late numbering]] 을 쓸 때만 있습니다.
- response parameter(응답 매개변수) [[abaptype_response_for|mapped]] 에서 임시 키를 [[abapderived_types_key|%key]] 의 최종 키 값에 짝지을 때 꼭 필요합니다. 특히 interaction phase(상호작용 단계)에서 임시 키를 [[abapderived_types_pid|%pid]] 가 아니라 `%key` 에 담아 쓴 경우에 그렇습니다.

interaction phase 에서 `%key` 에 들어 있던 임시 키 값은 `adjust_numbers` 에 들어올 때 `%tmp` 로 옮겨집니다. 이 메서드 안에서 `%key` 는 최종 키를 담는 자리가 되기 때문입니다([[abapderived_types_keys_identifiers]]).

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `MAPPED LATE`

## 예제

`adjust_numbers` 에서 `%tmp` 에 임시 키 값을, `%key` 에 최종 키 값을 넣어 둘을 짝짓습니다. `%tmp` 는 [[abapderived_types_pre|%pre]] 안에 들어 있습니다.

```abap
METHOD adjust_numbers.
  LOOP AT lcl_buffer=>mt_travel ASSIGNING FIELD-SYMBOL(<ls_buffer>).
    " 최종 여행 번호를 받아 온다 (직접 만든 채번 메서드)
    DATA(lv_travelid) = lcl_number=>get_next_travelid( ).

    APPEND VALUE #( %pre = VALUE #( %pid          = <ls_buffer>-pid
                                    " interaction phase 에서 쓰던 임시 여행 번호
                                    %tmp-travelid = <ls_buffer>-tmp_travelid )
                    " 새로 정한 최종 여행 번호
                    %key-travelid = lv_travelid ) TO mapped-travel.
  ENDLOOP.
ENDMETHOD.
```

## 알아두기

- late numbering 을 쓰는 unmanaged BO 에서 `%tmp` 를 쓰는 모습은 [[abenderived_types_pre_tmp_abexa]] 에 나옵니다.

## 관련 항목

- [[abapderived_types_pre]]
- [[abapderived_types_pid]]
- [[abapderived_types_key]]
- [[abapderived_types_keys_identifiers]]
- [[abensaver_adjust_numbers]]
- [[abenbdl_late_numbering]]
- [[abapconvert_key]]
