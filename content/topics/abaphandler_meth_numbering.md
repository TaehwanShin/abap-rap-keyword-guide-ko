---
title: numbering handler method (FOR NUMBERING)
summary: early numbering 을 구현하는 handler method 로, 생성 요청이 들어오면 자동으로 불려 새 인스턴스의 키를 정합니다.
keywords: FOR NUMBERING, 이른 번호 부여, early numbering, 번호 부여, 핸들러 메서드, earlynumbering_create, FOR CREATE, mapped, failed, reported, 키 채번
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
   FOR NUMBERING
   [IMPORTING] { REFERENCE(im_par_num) | im_par_num }
   FOR CREATE bdef
   [CHANGING { [failed TYPE data] [reported TYPE data] [mapped TYPE data] }].
```

## 설명

[[abenbdl_early_numb|early numbering]] 을 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다. 직접 부르지 않습니다. EML 생성 요청이 들어오면 그 과정에서 저절로 불립니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.

behavior definition 쪽에 어떻게 적어야 하는지는 [[abenbdl_early_numb]] 에 있습니다.

### 매개변수

- `im_par_num` (입력) : early numbering 을 실행할 인스턴스가 들어 있습니다. [[abaptype_table_for|TYPE TABLE FOR CREATE]] 타입의 내부 테이블입니다. `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다.
- `failed`, `reported`, `mapped` (`CHANGING`) : 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. `CHANGING` 뒤에 정해진 이름으로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR` 타입을 바로 적어도 됩니다.

## 예제

새 여행에 번호를 줍니다. 예제라서 지금까지 쓴 가장 큰 번호에 1 씩 더하는 단순한 방식을 씁니다. 정한 번호는 `%cid` 와 짝지어 `mapped` 에 넣습니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS earlynumbering_create FOR NUMBERING
      IMPORTING entities FOR CREATE travel.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD earlynumbering_create.
    " 지금까지 쓴 가장 큰 여행 번호를 읽는다
    SELECT MAX( travelid ) FROM zr_travel INTO @DATA(lv_max).

    LOOP AT entities INTO DATA(ls_entity).
      IF ls_entity-travelid IS NOT INITIAL.
        " 번호를 이미 받은 인스턴스는 그대로 돌려준다
        APPEND VALUE #( %cid     = ls_entity-%cid
                        travelid = ls_entity-travelid ) TO mapped-travel.
        CONTINUE.
      ENDIF.

      " 새 번호를 정해 %cid 와 짝지어 알려 준다
      lv_max += 1.
      APPEND VALUE #( %cid     = ls_entity-%cid
                      travelid = lv_max ) TO mapped-travel.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- 이 메서드는 EML 생성 요청 도중에 암묵적으로 불립니다. 사용자가 따로 부르는 작업이 아닙니다.
- unmanaged 이면서 draft 를 쓰는 RAP BO 로 이 메서드를 보여 주는 예제가 [[abenrap_handler_methods_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_early_numb]]
- [[abapmethods_for_rap_behv]]
- [[abaphandler_meth_modify]]
- [[abensaver_adjust_numbers]]
- [[abaptype_table_for]]
- [[abenrap_handler_methods_abexa]]
