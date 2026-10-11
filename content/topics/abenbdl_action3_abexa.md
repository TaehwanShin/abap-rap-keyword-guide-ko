---
title: 예제 - factory action
summary: 인스턴스를 복사하는 instance factory action 과 기본값이 든 인스턴스를 만드는 static factory action 을 선언·구현·실행하는 예제입니다.
keywords: factory action, static factory action, 팩토리 액션 예제, 인스턴스 복사, EXECUTE, AUTO FILL CID, %cid, MAPPED, FOR MODIFY, 관리형
---

## 설명

managed RAP BO 에서 **factory action** 을 선언하고, 구현하고, 실행하는 예제입니다. 원문은 root entity(루트 엔터티) 하나짜리 데모 모델을 씁니다. 여기서는 같은 내용을 `Travel` 로 옮겨 적습니다.

factory action 은 둘입니다.

- `copyTravel` : instance factory action 입니다. 요청받은 인스턴스의 값을 모두 복사하고 새 키를 줍니다.
- `newTravel` : static factory action 입니다. 기본값이 든 인스턴스를 새로 만듭니다.

## 예제

behavior definition(동작 정의)입니다. 두 action 모두 카디널리티가 `[1]` 이라 정확히 하나씩 만듭니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  // 인스턴스를 복사하고 새 키를 준다
  factory action copyTravel [1];

  // 기본값이 든 새 인스턴스를 만든다
  static factory action newTravel [1];
}
```

`copyTravel` 의 구현입니다. 원본을 읽고, 새 키를 정하고, `CREATE` 로 새 인스턴스를 만듭니다. 새 키는 테이블에 있는 가장 큰 번호 다음 값입니다.

```abap
METHOD copytravel.
  " 복사할 원본을 읽는다
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel)
    FAILED failed.

  SELECT FROM ztravel FIELDS MAX( travel_id ) INTO @DATA(lv_max_id).

  " 요청 줄(keys)마다 복사본을 하나씩 만든다
  " 같은 원본을 여러 번 복사해도 줄마다 자기 %cid 를 쓴다
  DATA lt_create TYPE TABLE FOR CREATE zr_travel.
  LOOP AT keys INTO DATA(ls_key).
    " 읽지 못한 원본은 건너뛴다
    ASSIGN lt_travel[ %tky = ls_key-%tky ] TO FIELD-SYMBOL(<ls_travel>).
    IF sy-subrc <> 0.
      CONTINUE.
    ENDIF.

    " 원본 값을 그대로 옮기고 키만 새로 준다
    lv_max_id += 1.
    APPEND VALUE #( %cid  = ls_key-%cid
                    %data = CORRESPONDING #( <ls_travel> ) )
           TO lt_create ASSIGNING FIELD-SYMBOL(<ls_create>).
    <ls_create>-travelid = lv_max_id.
  ENDLOOP.

  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      CREATE FIELDS ( travelid agencyid customerid begindate enddate
                      totalprice currencycode status )
      WITH lt_create
    MAPPED mapped
    FAILED failed
    REPORTED reported.
ENDMETHOD.
```

`newTravel` 의 구현입니다. static action 이라 넘어오는 것은 `%cid` 뿐입니다. 예제라서 키와 기본값을 고정해 두었습니다.

```abap
METHOD newtravel.
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      CREATE FIELDS ( travelid status )
      WITH VALUE #( FOR ls_key IN keys
                    ( %cid     = ls_key-%cid
                      travelid = '00000099'
                      status   = 'O' ) )
    MAPPED mapped
    FAILED failed
    REPORTED reported.
ENDMETHOD.
```

BO 를 쓰는 쪽에서는 두 action 을 차례로 실행합니다.

```abap
" 여행 1번을 복사한다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE copytravel
      AUTO FILL CID WITH VALUE #( ( travelid = '00000001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

" 기본값이 든 새 여행을 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE newtravel
      FROM VALUE #( ( %cid = 'new1' ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

## 알아두기

### 실행하면

원문 프로그램은 먼저 인스턴스 두 건(키 1, 2)을 만들어 저장한 다음, 위 순서대로 실행하고 단계마다 테이블을 `SELECT` 로 읽어 보여 줍니다.

1. `copyTravel` 을 키 1 인 인스턴스에 실행하고 `COMMIT ENTITIES` 로 저장합니다. 키 1 과 내용은 같고 키만 새로운 인스턴스가 하나 생깁니다.
2. `newTravel` 을 실행하고 `COMMIT ENTITIES` 로 저장합니다. 기본값이 든 인스턴스가 하나 생깁니다.

결과로 새 인스턴스가 두 건 늘어납니다. 하나는 복사본이고 하나는 기본값으로 만든 것입니다.

### 눈여겨볼 점

- factory action 에는 출력 매개변수가 없습니다. 새로 만든 인스턴스는 `result` 가 아니라 `mapped` 로 돌아옵니다. 그래서 handler method(핸들러 메서드)에서 `CREATE` 의 `MAPPED` 를 그대로 넘겨줍니다.
- instance factory action 은 **키**로, static factory action 은 **`%cid`** 로 실행합니다.
- factory action 을 실행할 때 `AUTO FILL CID` 를 붙이면 `%cid` 를 직접 적지 않아도 됩니다.

## 관련 항목

- [[abenbdl_action_factory]]
- [[abenbdl_action_default_factory]]
- [[abenbdl_static]]
- [[abapmodify_entity_entities_fields]]
- [[abenbdl_action1_abexa]]
- [[abenbdl_action2_abexa]]
