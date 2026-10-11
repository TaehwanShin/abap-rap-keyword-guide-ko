---
title: determination handler method (FOR DETERMINE)
summary: behavior definition 에 선언한 determination 을 구현하는 handler method 이며, 저장할 때 도는 것과 버퍼가 바뀐 뒤 도는 것 두 가지가 있습니다.
keywords: FOR DETERMINE ON SAVE, FOR DETERMINE ON MODIFY, 결정, determination, 핸들러 메서드, handler method, reported, TYPE TABLE FOR DETERMINATION, 저장 순서, 트랜잭션 버퍼
---

## 문법

handler method(핸들러 메서드) 선언

```syntax
METHODS meth [FINAL]
  FOR DETERMINE ON { SAVE | MODIFY }
  [IMPORTING] { REFERENCE(im_par_det) | im_par_det }
   FOR bdef~det
  [CHANGING reported TYPE data].
```

## 설명

[[abenbdl_determinations|determination]] 을 구현하는 handler method 입니다. behavior pool(동작 풀)의 handler class(핸들러 클래스)에 선언하고 구현합니다.

- `meth` : 메서드 이름. 마음대로 정합니다.
- `bdef` : behavior definition(동작 정의)의 이름 또는 별칭.
- `det` : behavior definition 에 선언한 determination 의 이름.

### 두 가지 변형

| 변형 | 언제 불리나 |
| --- | --- |
| `FOR DETERMINE ON SAVE` | save sequence(저장 순서) 도중에 실행되는 determination 에 씁니다. |
| `FOR DETERMINE ON MODIFY` | transactional buffer(트랜잭션 버퍼)의 데이터가 바뀐 뒤에 불립니다. |

behavior definition 쪽에 어떻게 적어야 하는지는 두 변형 모두 [[abenbdl_determinations]] 에 있습니다.

### 매개변수

- `im_par_det` (입력) : determination 을 실행할 RAP BO 인스턴스의 키가 들어 있습니다. [[abaptype_table_for|TYPE TABLE FOR DETERMINATION]] 타입의 내부 테이블입니다. `REFERENCE( )` 로 감싸 참조로 넘겨받을 수도 있습니다. `IMPORTING` 낱말은 생략할 수 있습니다.
- `reported` (`CHANGING`) : 적지 않아도 쓸 수 있는 response parameter(응답 매개변수)입니다. `CHANGING` 뒤에 정해진 이름 `reported` 로 드러내 적어도 됩니다. 타입은 일반 타입 `DATA` 로 적을 수 있고, 실행할 때에는 [[abaptype_response_for|TYPE RESPONSE FOR REPORTED]] 타입이 됩니다. `DATA` 자리에 `TYPE RESPONSE FOR REPORTED` 타입을 바로 적어도 됩니다.

## 예제

여행을 만들 때 상태가 비어 있으면 "열림(O)"으로 채우는 determination 입니다. behavior definition 에는 이렇게 선언합니다.

```bdl
determination setInitialStatus on modify { create; }
determination calcTotalPrice on save { create; update; }
```

handler class 에는 determination 마다 메서드를 하나씩 둡니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS setinitialstatus FOR DETERMINE ON MODIFY
      IMPORTING keys FOR travel~setinitialstatus.

    METHODS calctotalprice FOR DETERMINE ON SAVE
      IMPORTING keys FOR travel~calctotalprice.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD setinitialstatus.
    " 넘어온 키의 여행을 버퍼에서 읽는다
    READ ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        FIELDS ( status ) WITH CORRESPONDING #( keys )
      RESULT DATA(lt_travel).

    " 상태가 이미 있는 여행은 건드리지 않는다
    DELETE lt_travel WHERE status IS NOT INITIAL.
    CHECK lt_travel IS NOT INITIAL.

    MODIFY ENTITIES OF zr_travel IN LOCAL MODE
      ENTITY travel
        UPDATE FIELDS ( status )
        WITH VALUE #( FOR ls_travel IN lt_travel
                      ( %tky = ls_travel-%tky status = 'O' ) )
      REPORTED DATA(ls_reported).

    reported = CORRESPONDING #( DEEP ls_reported ).
  ENDMETHOD.

  METHOD calctotalprice.
    " save sequence 에서 합계 금액을 다시 계산한다
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- determination handler method 에서 쓸 수 있는 response parameter 는 `reported` 하나뿐입니다. `failed` 와 `mapped` 는 없습니다.
- 입력으로는 키만 넘어옵니다. 다른 필드 값이 필요하면 EML 로 읽습니다.

## 관련 항목

- [[abenbdl_determinations]]
- [[abapmethods_for_rap_behv]]
- [[abaphandler_meth_validate]]
- [[abaptype_table_for]]
- [[abaptype_response_for]]
- [[abenrap_handler_methods_abexa]]
- [[abenbdl_determination_abexa]]
