---
title: precheck
summary: 변경 요청이 transactional buffer 에서 실행되기 전에 먼저 불려, 원하지 않는 변경이 버퍼에 닿지 않게 막는 추가 구문입니다.
keywords: precheck, 사전 점검, 프리체크, FOR PRECHECK, 트랜잭션 버퍼, 유일성 검사, failed, reported, 추가 구문
---

## 문법

```syntax
... precheck ...
```

## 설명

`precheck` 를 붙이면 변경 요청이 transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)에서 실행되기 **전에** 메서드 하나가 먼저 불립니다. 이 메서드에서 원하지 않는 변경을 걸러 내면, 그 변경은 버퍼에 닿지 않습니다.

붙일 수 있는 RAP BO 작업은 다음과 같습니다.

- [[abenbdl_standard_operations|standard operation]]
- [[abenbdl_association|association 작업]]
- [[abenbdl_nonstandard|action]]
- RAP 계층 action

behavior pool(동작 풀)의 handler method(핸들러 메서드) [[abaphandler_meth_precheck|FOR PRECHECK]] 에 점검 내용을 반드시 구현해야 합니다.

## 예제

여행을 만들 때 같은 `TravelID` 가 이미 있는지 미리 확인합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create ( precheck );
  update;
  delete;
  field ( readonly : update ) TravelID;
}
```

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS precheck_create FOR PRECHECK
      IMPORTING entities FOR CREATE travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD precheck_create.
    LOOP AT entities ASSIGNING FIELD-SYMBOL(<ls_entity>).
      " 이미 있는 여행 번호인지 확인한다
      SELECT SINGLE @abap_true
        FROM ztravel
        WHERE travel_id = @<ls_entity>-travelid
        INTO @DATA(lv_exists).
      IF sy-subrc <> 0.
        CONTINUE.
      ENDIF.

      " 실패로 적으면 이 인스턴스는 버퍼에 들어가지 않는다
      APPEND VALUE #( %cid        = <ls_entity>-%cid
                      travelid    = <ls_entity>-travelid
                      %create     = if_abap_behv=>mk-on
                      %fail-cause = if_abap_behv=>cause-unspecific )
             TO failed-travel.
      APPEND VALUE #( %cid     = <ls_entity>-%cid
                      travelid = <ls_entity>-travelid
                      %msg     = new_message_with_text(
                                   severity = if_abap_behv_message=>severity-error
                                   text     = '이미 있는 여행 번호입니다.' ) )
             TO reported-travel.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

키가 겹치지 않는 여행은 precheck 를 지나 저장됩니다. 키가 겹치는 여행은 `failed` 와 `reported` 에 적히고 버퍼에 닿지 않습니다. 한 요청에 둘이 섞여 있으면 겹치지 않는 쪽만 데이터베이스에 저장됩니다.

이 예제는 persistent table 에 이미 저장된 `TravelID` 만 확인합니다. 원문 예제는 아직 저장하지 않고 transactional buffer 에 들어 있는 인스턴스와 키가 겹치는지도 함께 확인합니다.

## 알아두기

- [[abenbdl_internal|internal]] 작업에는 쓸 수 없습니다.
- EML 에서 [[abapin_local_mode|IN LOCAL MODE]] 로 작업을 부르면 precheck 메서드가 불리지 않습니다.

## 관련 항목

- [[abaphandler_meth_precheck]]
- [[abenbdl_operations_additions]]
- [[abenbdl_validations]]
- [[abenbdl_internal]]
- [[abapin_local_mode]]
