---
title: late numbering
summary: 인스턴스를 데이터베이스에 저장하기 바로 전에 키 값을 정해, 빈 번호 없이 이어지는 키를 만들게 하는 선언입니다.
keywords: late numbering, 늦은 번호 부여, 내부 늦은 번호 부여, adjust_numbers, 키 채번, 번호 매기기, 빈 번호 없는 키, DRAFTUUID, %pid
---

## 문법

```syntax
...
late numbering
...
```

## 설명

entity(엔터티)의 기본 키 필드 전체에 **내부 late numbering** 을 정합니다. 뜻을 풀면 이렇습니다.

- 기본 키 필드에 값을 넣는 주체는 RAP 실행 엔진입니다.
- behavior pool(동작 풀)에서 saver method(세이버 메서드) [[abensaver_adjust_numbers|adjust_numbers]] 를 구현해, 인스턴스마다 최종 키 값을 정해 줘야 합니다.
- 키 값은 인스턴스를 데이터베이스에 저장하기 바로 전에 정해집니다. 그래서 중간에 빈 번호 없이 이어지는 고유한 키를 만들 수 있습니다.

`late numbering` 은 entity 마다 [[abenbdl_character|entity 동작 특성]] 자리에 따로 적어야 합니다. 부모 노드가 late numbering 을 쓰면, 바로 아래 자식 노드도 late numbering 을 써야 합니다.

draft 를 쓰는 BO 에서 `late numbering` 을 쓰려면 [[abenbdl_draft_table|draft 테이블]]에 키 필드 `DRAFTUUID` 가 하나 더 있어야 합니다. 데이터 타입은 `raw(16)` 입니다.

### 쓸 수 있는 곳

- managed RAP BO
- unmanaged RAP BO
- projection BO 와 RAP BO interface 는 base BDEF(기반 BDEF) 의 late numbering 을 그대로 다시 씁니다. 따로 적을 필요가 없습니다. [[abenbdl_character_projection]] 을 참고하세요.

## 예제

루트 `Travel` 과 자식 `Booking` 에 late numbering 을 선언합니다. 부모가 쓰므로 자식도 써야 합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
late numbering
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  field ( readonly ) TravelID;
  association _Booking { create; }
}

define behavior for ZR_Booking alias Booking
persistent table zbooking
late numbering
lock dependent by _Travel
authorization dependent by _Travel
{
  update;
  delete;

  field ( readonly ) TravelID, BookingID;
  association _Travel { }
}
```

saver class(세이버 클래스)의 `adjust_numbers` 에서 최종 키를 정합니다. 아래는 여행 번호만 매기는 모습입니다. 테이블에 있는 가장 큰 번호 다음부터 차례로 붙입니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS adjust_numbers REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD adjust_numbers.
    " 지금까지 쓴 가장 큰 번호를 읽는다
    SELECT FROM ztravel
      FIELDS MAX( travel_id )
      INTO @DATA(lv_max_id).

    " 임시 식별자(%pid)로 들어온 새 여행마다 최종 키를 채운다
    LOOP AT mapped-travel ASSIGNING FIELD-SYMBOL(<ls_travel>).
      lv_max_id += 1.
      <ls_travel>-travelid = lv_max_id.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

RAP BO consumer(사용자)가 키 없이 여행을 만들고 `COMMIT ENTITIES` 로 저장하면, persistent table 의 `travel_id` 에 이때 정해진 값이 들어갑니다.

## 알아두기

- 번호를 매기는 다른 방법도 있습니다.
    - [[abenbdl_early_numb|early numbering]] : 생성 요청 직후에 키를 정합니다. 방법은 직접 구현합니다.
    - [[abenbdl_field_numbering|numbering:managed]] : RAP 프레임워크가 UUID 키를 알아서 채웁니다.

## 관련 항목

- [[abensaver_adjust_numbers]]
- [[abenbdl_early_numb]]
- [[abenbdl_field_numbering]]
- [[abenbdl_draft_table]]
