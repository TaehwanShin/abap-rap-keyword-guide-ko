---
title: 예제 - saver method (late numbering)
summary: late numbering 을 쓰는 unmanaged BO 로 adjust_numbers 를 포함한 saver method 여섯 개의 흐름을 보여 주는 예제입니다.
keywords: 세이버 메서드 예제, late numbering, 늦은 번호 부여, adjust_numbers, finalize, check_before_save, save, cleanup, cleanup_finalize, %pid, 임시 식별자, 비관리형, unmanaged
---

## 설명

[[abenabp_saver_class_abexa]] 와 같은 구성에 late numbering 을 더한 예제입니다. BDEF 에 `late numbering` 을 적었기 때문에 saver class(세이버 클래스)에 `adjust_numbers` 가 하나 더 들어갑니다. saver method(세이버 메서드)가 주제이므로 handler method(핸들러 메서드)는 꼭 필요한 것만 구현되어 있습니다.

saver class 의 각 메서드는 다음 일을 합니다.

| 메서드 | 예제에서 하는 일 |
| --- | --- |
| `finalize` | 저장 전 마지막 계산을 합니다. 정수 필드 하나를 2로 나누는데, 홀수면 오류로 처리해 `failed` 와 `reported` 를 채웁니다. 나눠지면 결과를 필드에 넣고 성공 메시지를 `reported` 에 담습니다. |
| `check_before_save` | 일관성 점검을 합니다. 다른 필드 하나의 값이 100 을 넘으면 저장하지 않습니다. |
| `adjust_numbers` | 인스턴스의 최종 키를 정합니다. 예제에서는 무작위 정수를 고릅니다. 이 메서드가 불리면 되돌릴 수 없는 지점을 지난 것이므로, 키를 붙이다가 문제가 생겨서는 안 됩니다. 그래서 고른 숫자가 transactional buffer(트랜잭션 버퍼)에도 데이터베이스 테이블에도 아직 없는지 확인합니다. |
| `save` | transactional buffer 의 내용을 데이터베이스에 씁니다. `finalize`, `check_before_save`, `adjust_numbers` 가 모두 문제없이 끝났을 때만 불립니다. |
| `cleanup` | transactional buffer 를 비웁니다. `save` 가 끝나면 불립니다. |
| `cleanup_finalize` | transactional buffer 를 비웁니다. `finalize` 나 `check_before_save` 에서 문제가 생기면 불립니다. |

원문 예제는 각 메서드가 돌려준 `failed` 와 `reported` 내용을 따로 만든 기록 테이블에 적어 화면에 보여 줍니다.

## 예제

여행 모델로 줄여 쓴 것입니다. BDEF 에 `late numbering` 을 적고 키 필드는 readonly 로 둡니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
lock master
authorization master ( global )
late numbering
{
  create;
  update;
  delete;
  field ( readonly ) TravelID;
}
```

`adjust_numbers` 에서 최종 키를 정하고, 임시 식별자 `%pid` 와 짝지어 `mapped` 로 돌려줍니다. 버퍼 `lcl_buffer=>mt_travel` 의 줄에는 임시 식별자 `pid` 가 함께 들어 있다고 봅니다. `lcl_buffer=>draw_number( )` 는 후보 번호를 하나 뽑아 주는 도우미 메서드입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS adjust_numbers REDEFINITION.
    METHODS save           REDEFINITION.
    METHODS cleanup        REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD adjust_numbers.
    LOOP AT lcl_buffer=>mt_travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
      " 버퍼에도 테이블에도 없는 번호가 나올 때까지 뽑는다
      DO.
        DATA(lv_id) = lcl_buffer=>draw_number( ).
        SELECT SINGLE @abap_true FROM ztravel
          WHERE travel_id = @lv_id
          INTO @DATA(lv_used).
        IF sy-subrc <> 0
           AND NOT line_exists( lcl_buffer=>mt_travel[ travel_id = lv_id ] ).
          EXIT.
        ENDIF.
      ENDDO.

      <ls_travel>-travel_id = lv_id.

      " 임시 식별자와 최종 키를 짝지어 돌려준다
      APPEND VALUE #( %pid     = <ls_travel>-pid
                      travelid = lv_id ) TO mapped-travel.
    ENDLOOP.
  ENDMETHOD.

  METHOD save.
    DATA lt_db TYPE STANDARD TABLE OF ztravel WITH EMPTY KEY.

    " 임시 식별자 pid 는 빼고 테이블 필드만 옮겨 쓴다
    lt_db = CORRESPONDING #( lcl_buffer=>mt_travel ).
    MODIFY ztravel FROM TABLE @lt_db.
  ENDMETHOD.

  METHOD cleanup.
    CLEAR lcl_buffer=>mt_travel.
  ENDMETHOD.
ENDCLASS.
```

BO 를 쓰는 쪽에서는 키 없이 인스턴스를 만듭니다. 키는 save sequence(저장 순서) 안에서 정해집니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( agencyid currencycode totalprice )
  WITH VALUE #( ( %cid = 'c1' agencyid = '070001' currencycode = 'EUR' totalprice = 500 ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

원문 예제는 `MODIFY` 요청을 세 번 보내고, 그때마다 인스턴스 세 개를 만든 뒤 `COMMIT ENTITIES` 를 실행합니다.

| 요청 | 일어나는 일 | 저장 여부 |
| --- | --- | --- |
| 첫 번째 | 홀수 값이 든 인스턴스 때문에 `finalize` 가 실패합니다. `cleanup_finalize` 가 버퍼를 비웁니다. | 저장되지 않습니다. |
| 두 번째 | `finalize` 는 통과하고, 100 을 넘는 값 때문에 `check_before_save` 가 실패합니다. `cleanup_finalize` 가 버퍼를 비웁니다. | 저장되지 않습니다. |
| 세 번째 | 둘 다 통과합니다. `adjust_numbers` 가 키를 정하고 `save` 가 저장한 뒤 `cleanup` 이 버퍼를 비웁니다. | 저장됩니다. |

- 화면에는 요청마다 세 가지가 나옵니다. 불린 saver method 목록, `failed` 와 `reported` 로 돌아온 내용, 데이터베이스 테이블의 내용입니다. 앞의 두 요청에서는 데이터베이스 테이블 내용이 나오지 않습니다.
- 돌아온 내용에는 늘 임시 식별자 `%pid` 가 들어 있습니다. 세 번째 요청에서는 새로 정해진 키도 함께 보입니다.
- `finalize` 와 `check_before_save` 시점에는 아직 키가 정해지지 않았습니다. 그래서 세 번째 요청의 기록에서 이 두 메서드의 키 값은 0 으로 나옵니다. 이 값과 `save` 줄에 찍힌 `pid` 값은 무시해도 됩니다.

## 관련 항목

- [[abenrap_saver_methods_abexas]]
- [[abenabp_saver_class_abexa]]
- [[abensaver_adjust_numbers]]
- [[abenbdl_late_numbering]]
- [[abapderived_types_pid]]
- [[abensaver_finalize]]
- [[abensaver_check_before_save]]
- [[abensaver_method_save]]
- [[abensaver_method_cleanup]]
- [[abapsaver_class_cleanup_finalize]]
- [[abenrap_luw_abexa]]
