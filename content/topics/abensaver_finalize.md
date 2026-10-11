---
title: finalize saver method
summary: early save phase 에서 가장 먼저 불려, 저장 전에 마지막 계산과 데이터 수정을 하는 saver method 입니다.
keywords: finalize, 세이버 메서드, saver method, 이른 저장 단계, early save phase, 마지막 계산, failed, reported, FAILED LATE, REPORTED LATE, 결정 ON SAVE, cleanup_finalize
---

## 문법

선언부

```syntax
CLASS lsc_bdef DEFINITION INHERITING FROM base_class ...
     ...
     METHODS finalize REDEFINITION.
     ...
ENDCLASS.
```

구현부

```syntax
CLASS lsc_bdef IMPLEMENTATION.
      ...
      METHOD finalize.
      ...
      ENDMETHOD.
      ...
ENDCLASS.
```

## 설명

`finalize` 는 saver class(세이버 클래스) `lsc_bdef` 에 선언하는 saver method(세이버 메서드)입니다. saver class 는 behavior pool(동작 풀)의 CCIMP 인클루드에 둡니다. 미리 정해져 있는 메서드이므로 `REDEFINITION` 으로 다시 정의합니다. `base_class` 는 saver class 가 상속하는 기본 클래스이고, 예를 들면 `CL_ABAP_BEHAVIOR_SAVER` 입니다.

이 메서드의 성격은 다음과 같습니다.

- 써도 되고 안 써도 됩니다.
- early save phase(이른 저장 단계)에 속하고, 그 단계에서 가장 먼저 불립니다.
- 저장하기 전에 마지막 계산과 데이터 수정을 하는 자리입니다. 지금 RAP 트랜잭션에 들어 있는 모든 RAP BO 가 대상입니다.
- managed BO 에서는 `finalize` 가 불리는 동안 `ON SAVE` [[abenbdl_determinations|determination]] 이 실행됩니다.

미리 정해진 `CHANGING` 매개변수가 두 개 있습니다. 따로 선언하지 않아도 메서드 안에서 바로 쓸 수 있습니다.

| 매개변수 | 타입 |
| --- | --- |
| `failed` | [[abaptype_response_for|TYPE RESPONSE FOR FAILED LATE]] |
| `reported` | [[abaptype_response_for|TYPE RESPONSE FOR REPORTED LATE]] |

`failed` 에 오류를 담아 돌려주면 save sequence(저장 순서)가 거기서 멈춥니다. 이어서 [[abapsaver_class_cleanup_finalize|cleanup_finalize]] 가 불립니다. late save phase(늦은 저장 단계)로는 넘어가지 않고 interaction phase(상호작용 단계)로 돌아갑니다.

원문은 `cleanup_finalize` 가 지금 트랜잭션에서 바꾼 내용을 버리고 transactional buffer(트랜잭션 버퍼)를 치운다고 적고 있습니다. 다만 managed RAP BO 로 만든 원문 예제 [[abencl_abap_beh_saver_failed_abexa]] 에서는 early save phase 에서 실패한 인스턴스가 버퍼에 그대로 남아 있습니다.

## 예제

unmanaged BO 의 버퍼 `lcl_buffer=>mt_travel` 을 돌면서 기본 요금과 예약 수수료로 총액을 다시 계산합니다. 통화가 비어 있는 여행은 계산할 수 없으므로 `failed` 와 `reported` 에 올립니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS finalize REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD finalize.
    LOOP AT lcl_buffer=>mt_travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
      IF <ls_travel>-currency_code IS INITIAL.
        " 실패로 알리면 save sequence 가 멈추고 cleanup_finalize 가 불린다
        APPEND VALUE #( travelid = <ls_travel>-travel_id ) TO failed-travel.
        APPEND VALUE #( travelid = <ls_travel>-travel_id
                        %msg     = new_message_with_text(
                                     severity = if_abap_behv_message=>severity-error
                                     text     = '통화가 비어 있습니다.' ) )
               TO reported-travel.
        CONTINUE.
      ENDIF.

      " 마지막 계산: finalize 는 여러 번 불릴 수 있으므로, 더해 가지 않고 다시 계산한다
      <ls_travel>-total_price = <ls_travel>-base_price + <ls_travel>-booking_fee.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- `finalize` 는 한 트랜잭션에서 여러 번 불릴 수 있습니다. 서로 이어진 여러 RAP BO(예: projection BO, 여러 BO 를 넘나드는 상황의 BO interface)에 `MODIFY` 요청을 여러 번 보낸 뒤 커밋할 때 그렇습니다.
- 어떤 BO 의 `finalize` 안에서 다른 BO 에 `MODIFY` 요청을 보냈는데 그 BO 의 `finalize` 가 이미 끝난 상태라면, 그 BO 의 `finalize` 가 다시 불립니다. 두 BO 가 서로를 계속 다시 부르는 순환이 생기지 않게 해야 합니다.
- 이 메서드 안에서 쓸 수 있는 문과 쓸 수 없는 문은 [[abapinvalid_stmts_in_rap_methods]] 에 정리되어 있습니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abensaver_check_before_save]]
- [[abapsaver_class_cleanup_finalize]]
- [[abenbdl_determinations]]
- [[abaptype_response_for]]
- [[abenabp_saver_class_abexa]]
- [[abenabp_saver_ln_abexa]]
- [[abenrap_luw_abexa]]
