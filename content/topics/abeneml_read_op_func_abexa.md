---
title: 예제 - READ 로 function 실행하기 (EXECUTE)
summary: READ 문의 EXECUTE 로 managed RAP BO 의 function 을 실행해, 골라 낸 필드 값을 결과로 받아 오는 예제입니다.
keywords: READ ENTITIES, EXECUTE, function, 함수 실행, FOR READ, FOR FUNCTION, %param, result, 읽기 예제
---

## 설명

`READ` 문으로 managed RAP BO 에 접근해 **function**를 실행하는 예제입니다. function 은 entity(엔터티)에서 몇 개 필드만 골라 읽고, 그 값을 결과로 돌려줍니다.

흐름은 이렇습니다.

1. 사용하는 쪽에서 `READ ENTITIES ... EXECUTE 함수이름 FROM ...` 으로 function 을 부릅니다. `FROM` 뒤 내부 테이블에 적은 키의 인스턴스마다 function 이 실행됩니다.
2. behavior pool(동작 풀)의 function 구현 메서드가 그 키로 EML 읽기를 해서 필요한 필드를 가져옵니다.
3. 읽은 값 가운데 특정 필드가 어떤 값이면 계산을 한 번 더 합니다. 원문 예제에서는 거리 단위가 마일이면 킬로미터로 바꿉니다.
4. 결과를 `RESULT` 테이블에 담아 돌려줍니다.

원문 예제의 모델은 root entity(루트 엔터티, 항공편 일정)와 child entity(자식 엔터티, 항공편 상세)로 된 managed BO 이고, root entity 에 결과로 자기 자신을 돌려주는 function 이 하나 있습니다. 아래에서는 같은 구조를 공통 예제 모델로 바꿔 적었습니다.

## 예제

behavior definition(동작 정의)에 function 을 선언합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  association _Booking { create; }

  // 결과로 여행 한 건을 돌려주는 function
  function ( authorization : none ) getTravelInfo result [1] $self;
}
```

behavior pool 에서 function 을 구현합니다. 필드 몇 개를 읽고, 종료일이 비어 있으면 시작일로 채워서 돌려줍니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS gettravelinfo FOR READ
      IMPORTING keys FOR FUNCTION travel~gettravelinfo RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD gettravelinfo.
    " 넘어온 키로 필요한 필드만 읽는다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( agencyid customerid begindate enddate )
        WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel)
      FAILED failed.

    LOOP AT lt_travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
      " 특정 필드 값에 따라 계산을 한 번 더 한다
      IF <ls_travel>-enddate IS INITIAL.
        <ls_travel>-enddate = <ls_travel>-begindate.
      ENDIF.

      APPEND VALUE #( %tky   = <ls_travel>-%tky
                      %param = <ls_travel> ) TO result.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

사용하는 쪽에서는 `EXECUTE` 로 function 을 부릅니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE gettravelinfo
    FROM VALUE #( ( %tky-travelid = '00000001' )
                  ( %tky-travelid = '00000002' ) )
  RESULT FINAL(lt_result)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

## 알아두기

- 실행하면 `FROM` 에 적은 키마다 function 이 한 번씩 돌고, 결과가 `lt_result` 에 한 줄씩 들어옵니다.
- function 이 돌려준 값은 결과 테이블의 `%param` 안에 있습니다. 원문 예제는 이 값을 화면에 보여 주려고 출력용 내부 테이블을 따로 만들어 옮겨 담습니다.
- function 구현 안에서 하는 읽기는 `FROM` 뒤 내부 테이블에 적힌 키를 그대로 씁니다. 그래서 어떤 인스턴스를 읽을지는 function 을 부르는 쪽이 정합니다.

## 관련 항목

- [[abenbdl_function]]
- [[abapread_entity_entities_op]]
- [[abapread_entities_long]]
- [[abeneml_read_op_fields_abexa]]
- [[abapeml_read_examples_abexas]]
- [[abapderived_types_param]]
