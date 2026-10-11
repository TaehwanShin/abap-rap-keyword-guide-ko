---
title: RAP event handler method (METHODS ... FOR ENTITY EVENT)
summary: RAP business event 가 일어났을 때 같은 시스템 안에서 불리는 RAP event handler method 를 정의하는 문법입니다.
keywords: METHODS, FOR ENTITY EVENT, RAP 이벤트 핸들러 메서드, event handler method, TYPE TABLE FOR EVENT, cl_abap_tx=>save, CX_ABAP_BEHV_SAVE_FAILED, CX_ABAP_BEHV_EVENT_HDLR_ERROR, CX_RAP_EVENT_HDLR_ERROR_RETRY, CX_RAP_EVENT_HDLR_ERROR, delay_time, 자동 재시도, 비동기, 로컬 소비
---

## 문법

메서드 정의

```syntax
METHODS meth [FINAL]
   FOR ENTITY EVENT [IMPORTING  ] { REFERENCE  (der_type) | der_type } FOR ent~evt.
```

메서드 구현

```syntax
METHOD meth.
   ...
ENDMETHOD.
```

## 설명

RAP event handler method(핸들러 메서드)는 RAP business event 를 **같은 시스템 안에서 받아 처리**하는 메서드입니다. `RAISE ENTITY EVENT` 문으로 event 가 일어나면 이 메서드가 시스템 안에서 불리고, **비동기로** 실행됩니다.

메서드를 두는 자리는 정해져 있습니다.

- RAP event handler class(핸들러 클래스)의 CCIMP 인클루드에 있는 로컬 클래스에 둡니다.
- 그 로컬 클래스는 `CL_ABAP_BEHAVIOR_EVENT_HANDLER` 를 상속해야 합니다.
- 로컬 클래스의 `PRIVATE SECTION` 에 정의하고 구현합니다.

문법의 각 부분은 다음과 같습니다.

| 부분 | 뜻 |
| --- | --- |
| `METHODS` | 반드시 인스턴스 메서드로 정의합니다. |
| `meth` | 메서드 이름입니다. 마음대로 짓습니다. |
| `der_type` | event 데이터를 받는 매개변수입니다. 이름은 마음대로 짓습니다. 타입은 BDEF derived type(BDEF 파생 타입) `TYPE TABLE FOR EVENT` 인 내부 테이블입니다. |
| `REFERENCE(der_type)` | 매개변수는 참조로 넘어옵니다. 그래서 이름만 적는 대신 `REFERENCE(...)` 로 적어도 됩니다. |
| `FINAL`, `IMPORTING` | 메서드는 적지 않아도 최종 메서드이고, 입력 매개변수만 쓸 수 있습니다. 두 추가 구문은 적어도 되고 빼도 됩니다. |
| `ent` | RAP BO entity(엔터티)의 이름입니다. 처리할 event 는 BDEF 에 정의되어 있어야 합니다. event 를 내보내는 interface BDEF 의 이름도 적을 수 있습니다. |
| `~evt` | entity(또는 interface BDEF) 이름 뒤에 물결표와 event 이름(별칭이 있으면 별칭)을 적습니다. |

`der_type` 테이블에 들어오는 내용은 event 를 어떻게 정의했는지에 따라 달라집니다.

- 매개변수가 있는 event : event 가 일어난 인스턴스의 키(`%key`)와 매개변수(`%param`)가 들어 있습니다.
- 매개변수가 없는 event : 키만 들어 있습니다.
- event handler class 가 RAP BO interface 에 묶여 있으면, 키와 매개변수는 interface BDEF 에서 쓰는 것을 따릅니다.

### 메서드 하나로 event 여러 개 받기

코드를 나누어 정리하기 좋도록 메서드 하나가 event 여러 개를 받을 수 있습니다. event 마다 매개변수를 하나씩 나란히 적습니다.

```abap
METHODS on_travel_event FOR ENTITY EVENT
  created  FOR zr_travel~travelcreated
  accepted FOR zr_travel~travelaccepted
  deleted  FOR zr_travel~traveldeleted.
```

## 예제

여행이 승인되면 알림 테이블 `ztravel_note` 에 한 줄을 넣습니다. ABAP SQL 로 데이터베이스를 바꾸려면 먼저 저장 단계로 넘어가야 합니다.

```abap
CLASS lhe_travel DEFINITION INHERITING FROM cl_abap_behavior_event_handler.
  PRIVATE SECTION.
    METHODS on_travel_accepted FOR ENTITY EVENT
      accepted FOR zr_travel~travelaccepted.
ENDCLASS.

CLASS lhe_travel IMPLEMENTATION.
  METHOD on_travel_accepted.
    DATA lt_note TYPE STANDARD TABLE OF ztravel_note WITH EMPTY KEY.
    GET TIME STAMP FIELD DATA(lv_now).

    " accepted 는 TYPE TABLE FOR EVENT zr_travel~travelaccepted
    lt_note = VALUE #( FOR ls_accepted IN accepted
                       ( travel_id  = ls_accepted-travelid
                         created_at = lv_now
                         text       = '여행이 승인되었습니다.' ) ).

    " 저장 단계로 넘어간다. 이 호출이 없으면 아래 INSERT 에서 런타임 오류가 난다
    cl_abap_tx=>save( ).

    INSERT ztravel_note FROM TABLE @lt_note.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

### 정의할 때

- RAP event handler class 하나에서 event 하나는 **한 번만** 처리할 수 있습니다. 같은 event 의 매개변수를 event handler method 에 두 번 이상 적을 수 없습니다.
- handler method 나 saver method(세이버 메서드)와 달리, event handler method 에는 response parameter(응답 매개변수, `failed`, `mapped`, `reported`)가 암묵적으로 붙지 않습니다.
- `... FOR EVENT ... FOR` 로 적는 옛 문법은 더는 쓰지 않습니다. 쓰면 문법 경고가 납니다.
- RAP 와 상관없는 일반 event 의 `METHODS ... FOR EVENT` 와 헷갈리지 않도록 합니다. 서로 다른 문법입니다.

### 트랜잭션 단계

- event handler method 는 **자기만의 RAP 트랜잭션**에서 돕니다. 불렸을 때의 단계는 interaction phase(상호작용 단계)입니다.
- 구현은 RAP BO 계약을 지켜서 트랜잭션 일관성을 보장해야 합니다. interaction phase 에서 허용되는 처리는 바로 써도 됩니다.
- ABAP SQL 로 데이터베이스를 바꾸는 일처럼 save sequence(저장 순서)에서만 허용되는 처리가 필요하면, 메서드 안에서 `cl_abap_tx=>save( )` 를 불러 저장 단계로 직접 넘어가야 합니다. 그러지 않으면 런타임 오류가 납니다.
- event 핸들러 안에서 RAP BO 인스턴스를 수정하고 저장해야 할 때도 `cl_abap_tx=>save( )` 를 부릅니다. handler method 안에서는 `COMMIT ENTITIES` 문을 직접 쓰는 것이 보통 허용되지 않기 때문입니다.

### 저장 실패 다루기

- event 핸들러에서 RAP 수정 작업을 한다면 `CX_ABAP_BEHV_SAVE_FAILED` 예외를 잡기를 권장합니다. early save phase(이른 저장 단계)나 late save phase(늦은 저장 단계)에서 난 오류에 대처할 수 있습니다.
- 이 예외는 early save phase 나 late save phase 에서 저장이 실패하면 납니다. 예외 객체의 `FAILED_ENTITIES`, `REPORTED_ENTITIES` 속성에서 response parameter 에 들어간 항목을 볼 수 있습니다. `failed` 에 항목이 생기는 원인으로는 early save phase 에서 인스턴스 validation 이 실패한 경우가 있습니다.
- ABAP 프로그램 같은 트랜잭션 주인이 `COMMIT ENTITIES` 없이 저장 단계를 시작하는 경우에도, `cl_abap_tx=>save( )` 호출을 `TRY` 블록에 넣고 `CX_ABAP_BEHV_SAVE_FAILED` 를 잡기를 권장합니다.
- 예외를 잡으면 런타임 오류를 막을 수 있습니다. 잡은 뒤에는 이렇게 합니다.
  - transactional buffer(트랜잭션 버퍼)를 정리하는 일(실패한 인스턴스를 고치고 저장을 다시 시작하는 일)은 권장하지 않습니다. 직접 만든 예외를 일으킬 때는 더욱 그렇습니다.
  - 그 대신 오류를 애플리케이션 로그에 남기는 방법을 생각해 봅니다.
  - `CATCH` 블록에서 `CX_ABAP_BEHV_EVENT_HDLR_ERROR` 를 상속한 예외를 직접 만들어 일으킬 수 있습니다. 잡은 `CX_ABAP_BEHV_SAVE_FAILED` 예외를 `previous` 속성에 넣어도 됩니다. 일으킨 예외는 event 프레임워크에 전달됩니다.
  - 저장을 다시 하려고 데이터를 고쳤더라도, 직접 만든 예외를 일으키면 암묵적으로 롤백되므로 아무것도 저장되지 않습니다.

### 메서드 밖으로 나가는 예외

- 보통 예외는 RAP handler method 밖으로 나가면 안 됩니다. RAP event handler method 는 예외입니다.
- 다만 event handler method 구현 밖으로 나갈 수 있는 것은 `CX_ABAP_BEHV_EVENT_HDLR_ERROR` 를 상속한 예외뿐입니다.

### 자동 재시도

- 로컬 event 는 잠금 같은 일시적인 문제로 실행되지 못할 수 있습니다. draft 인스턴스에 걸린 잠금이 그런 예입니다. 이런 문제는 시간이 지나면 풀리기도 합니다.
- 이럴 때 프레임워크가 정해 둔 시간 뒤에 event 실행을 자동으로 다시 시도하게 할 수 있습니다. `CX_RAP_EVENT_HDLR_ERROR_RETRY` 를 상속한 예외를 직접 만들어, 예를 들어 `CATCH` 블록에서 일으킵니다.
- `CX_RAP_EVENT_HDLR_ERROR_RETRY` 의 생성자에는 입력 매개변수 `delay_time` 이 있습니다. 다음 자동 실행까지 기다릴 시간을 초 단위 정수로 넘깁니다. 프레임워크는 이 시간을 지키면서 최대 세 번까지 실행을 시도합니다.
- 다시 시도할 필요가 없으면 `CX_RAP_EVENT_HDLR_ERROR` 를 상속한 예외를 만들어 씁니다.
- AIF 로깅을 켜 두었다면 두 경우 모두 AIF 로 기록할 수 있습니다.

### 시스템 밖에서 받기

- RAP business event 는 이 메서드로 시스템 안에서 받는 것 말고도, RAP event 바인딩으로 시스템 밖에서 받을 수 있습니다.

## 관련 항목

- [[abenrap_events]]
- [[abenclass_for_events]]
- [[abencl_abap_behavior_event_handler]]
- [[abapraise_entity_event]]
- [[abaptype_table_for]]
- [[abapderived_types_key]]
- [[abapderived_types_param]]
- [[abenrap_events_local_con_abexa]]
