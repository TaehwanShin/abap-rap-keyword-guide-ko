---
title: 예제 - saver method
summary: unmanaged BO 에서 finalize, check_before_save, save, cleanup, cleanup_finalize 가 어떤 차례로 불리고 실패하면 어떻게 되는지 보여 주는 예제입니다.
keywords: 세이버 메서드 예제, saver class example, finalize, check_before_save, save, cleanup, cleanup_finalize, 비관리형, unmanaged, 저장 순서, COMMIT ENTITIES, failed, reported
---

## 설명

간단한 unmanaged RAP BO 로 saver class(세이버 클래스)의 메서드 다섯 개를 한꺼번에 보여 주는 예제입니다. saver method(세이버 메서드)가 주제이므로 handler method(핸들러 메서드)는 꼭 필요한 것만 구현되어 있습니다.

원문 예제의 BO 는 root entity(루트 엔터티)와 child entity(자식 엔터티) 하나로 이루어져 있고, saver class 의 각 메서드는 다음 일을 합니다.

| 메서드 | 예제에서 하는 일 |
| --- | --- |
| `finalize` | 저장 전 마지막 계산을 합니다. 정수 필드 하나를 2로 나누는데, 홀수면 나눌 수 없으므로 오류로 처리해 `failed` 와 `reported` 를 채웁니다. 나눠지면 필드에 결과를 넣고 성공 메시지를 `reported` 에 담습니다. |
| `check_before_save` | 일관성 점검을 합니다. 다른 필드 하나의 값이 100 을 넘으면 저장하지 않습니다. `failed` 와 `reported` 도 채웁니다. |
| `save` | transactional buffer(트랜잭션 버퍼)의 내용을 데이터베이스에 씁니다. 앞 메서드가 모두 문제없이 끝났을 때만 불립니다. 저장한 뒤 성공 메시지를 `reported` 에 담습니다. |
| `cleanup` | transactional buffer 를 비웁니다. `save` 가 끝나면 불립니다. |
| `cleanup_finalize` | transactional buffer 를 비웁니다. `finalize` 나 `check_before_save` 에서 문제가 생기면 불립니다. |

원문 예제는 saver method 가 돌려준 `failed` 와 `reported` 내용을 따로 만든 기록 테이블에 적어 둡니다. 어떤 메서드가 불렸는지도 기록해서 화면에 보여 줍니다.

## 예제

같은 흐름을 여행 모델로 줄여 쓴 것입니다. `finalize` 는 통화가 없으면 실패하고, `check_before_save` 는 총액이 한도를 넘으면 실패합니다. `lcl_buffer=>mt_travel` 은 handler method 가 변경 내용을 모아 두는 버퍼입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS finalize          REDEFINITION.
    METHODS check_before_save REDEFINITION.
    METHODS save              REDEFINITION.
    METHODS cleanup           REDEFINITION.
    METHODS cleanup_finalize  REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD finalize.
    " 마지막 계산: 통화가 없으면 실패, 있으면 수수료를 총액에 더한다
    LOOP AT lcl_buffer=>mt_travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
      IF <ls_travel>-currency_code IS INITIAL.
        APPEND VALUE #( travelid = <ls_travel>-travel_id ) TO failed-travel.
      ELSE.
        <ls_travel>-total_price = <ls_travel>-total_price + <ls_travel>-booking_fee.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD check_before_save.
    " 일관성 점검: 총액이 한도를 넘으면 저장하지 않는다
    LOOP AT lcl_buffer=>mt_travel INTO DATA(ls_travel) WHERE total_price > 10000.
      APPEND VALUE #( travelid = ls_travel-travel_id ) TO failed-travel.
      APPEND VALUE #( travelid = ls_travel-travel_id
                      %msg     = new_message_with_text(
                                   severity = if_abap_behv_message=>severity-error
                                   text     = '총액이 한도를 넘었습니다.' ) )
             TO reported-travel.
    ENDLOOP.
  ENDMETHOD.

  METHOD save.
    MODIFY ztravel FROM TABLE @lcl_buffer=>mt_travel.
  ENDMETHOD.

  METHOD cleanup.
    " 저장이 끝난 뒤
    CLEAR lcl_buffer=>mt_travel.
  ENDMETHOD.

  METHOD cleanup_finalize.
    " early save phase 가 실패한 뒤
    CLEAR lcl_buffer=>mt_travel.
  ENDMETHOD.
ENDCLASS.
```

BO 를 쓰는 쪽에서는 인스턴스를 만들고 `COMMIT ENTITIES` 로 save sequence(저장 순서)를 시작합니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid currencycode totalprice )
  WITH VALUE #( ( %cid = 'c1' travelid = '00000001' currencycode = 'EUR' totalprice = 500 ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다. 데이터베이스에는 아무것도 들어가지 않았다
ENDIF.
```

## 알아두기

원문 예제는 `MODIFY` 요청을 세 번 보내고, 그때마다 인스턴스 세 개를 만든 뒤 `COMMIT ENTITIES` 를 실행합니다. 요청마다 결과가 다릅니다.

| 요청 | 일어나는 일 | 저장 여부 |
| --- | --- | --- |
| 첫 번째 | `finalize` 가 실패합니다. | 저장되지 않습니다. |
| 두 번째 | `finalize` 는 통과하고 `check_before_save` 가 실패합니다. | 저장되지 않습니다. |
| 세 번째 | `finalize` 와 `check_before_save` 가 모두 통과해서 `save` 가 불립니다. | 저장됩니다. |

- 화면에는 요청마다 세 가지가 나옵니다. 불린 saver method 목록, `failed` 와 `reported` 로 돌아온 내용, 그리고 데이터베이스 테이블의 내용입니다.
- 첫 번째와 두 번째 요청에서는 일부러 저장이 안 되게 했으므로 데이터베이스 테이블 내용이 나오지 않습니다.
- 인스턴스 셋 가운데 일부만 조건을 어겨도 그 요청 전체가 저장되지 않는다는 점을 눈여겨봅니다.

## 관련 항목

- [[abenrap_saver_methods_abexas]]
- [[abensaver_finalize]]
- [[abensaver_check_before_save]]
- [[abensaver_method_save]]
- [[abensaver_method_cleanup]]
- [[abapsaver_class_cleanup_finalize]]
- [[abenabp_saver_ln_abexa]]
