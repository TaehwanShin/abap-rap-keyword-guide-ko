---
title: %pre (임시 식별자 묶음)
summary: late numbering 의 adjust_numbers 메서드에서 %pid 와 %tmp 를 한데 묶어, mapped 로 임시 키를 최종 키에 짝짓는 데 쓰는 구성요소 묶음입니다.
keywords: %pre, %tmp, %pid, %key, MAPPED LATE, adjust_numbers, late numbering, 늦은 번호 부여, 임시 키, 최종 키, 구성요소 묶음
---

## 설명

`%pre` 는 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**입니다. 안에 [[abapderived_types_tmp|%tmp]] 와 [[abapderived_types_pid|%pid]] 가 들어 있습니다. 곧 인스턴스의 임시 식별자를 모두 담은 묶음입니다.

- 쓰는 자리는 save sequence(저장 순서) 안의 [[abensaver_adjust_numbers|adjust_numbers]] 메서드입니다.
- [[abenbdl_late_numbering|late numbering]] 을 쓸 때만 있습니다.
- response parameter(응답 매개변수) [[abaptype_response_for|mapped]] 에서 씁니다. 임시 키를 최종 키에 짝짓는 일, 곧 [[abapderived_types_key|%key]] 에 최종 키 값을 넣어 주는 일에 필요합니다.

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `MAPPED LATE`

## 예제

`adjust_numbers` 에서 최종 여행 번호를 정하고, 임시 식별자(`%pre`)와 최종 키(`%key`)를 짝지어 `mapped` 에 넣습니다.

```abap
METHOD adjust_numbers.
  LOOP AT lcl_buffer=>mt_travel ASSIGNING FIELD-SYMBOL(<ls_buffer>).
    " 최종 여행 번호를 받아 온다 (직접 만든 채번 메서드)
    DATA(lv_travelid) = lcl_number=>get_next_travelid( ).

    APPEND VALUE #( %pre = VALUE #( %pid          = <ls_buffer>-pid
                                    %tmp-travelid = <ls_buffer>-tmp_travelid )
                    %key-travelid = lv_travelid ) TO mapped-travel.
  ENDLOOP.
ENDMETHOD.
```

여기서 `lcl_buffer=>mt_travel` 은 직접 만든 transactional buffer(트랜잭션 버퍼)이고, `pid` 와 `tmp_travelid` 는 interaction phase(상호작용 단계)에서 인스턴스에 붙여 둔 임시 ID 와 임시 키 값입니다.

## 알아두기

- interaction phase 에서 `%pid` 를 썼든, `%key` 의 임시 키 값(이 메서드에서는 `%tmp`)을 썼든, 둘 다 썼든, `%pre` 전체가 유일하고 최종 키에 빠짐없이 짝지어지도록 해야 합니다.
- late numbering 을 쓰는 unmanaged BO 에서 `%pre` 를 쓰는 모습은 [[abenderived_types_pre_tmp_abexa]] 에 나옵니다.

## 관련 항목

- [[abapderived_types_tmp]]
- [[abapderived_types_pid]]
- [[abapderived_types_key]]
- [[abapderived_types_keys_identifiers]]
- [[abensaver_adjust_numbers]]
- [[abenbdl_late_numbering]]
- [[abapconvert_key]]
