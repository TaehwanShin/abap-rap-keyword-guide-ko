---
title: side effects 의 대상 (Targets)
summary: side effects 가 일어났을 때 화면에서 다시 읽을 대상, 곧 필드·권한 상태·entity·메시지를 적는 방법을 정리합니다.
keywords: side effects, 부수 효과, Targets, 대상, affects, field, permissions, $self, entity, messages, 다시 읽기, reported
---

## 문법

```syntax
... field { MyField
          | *
          | _assoc.MyField }
   | permissions {( field MyField )
                 | ( action MyAction )
                 | ( _assoc.{field | action} )
                 | ( update | delete )
                 | ( {create | update | delete} _assoc ) }
   | $self
   | entity _MyAssoc
   | messages
```

## 설명

side effects([[abenbdl_side_effects]])에서 `affects` 뒤에 적는 **대상**입니다. side effects 가 일어나면 여기 적은 것을 화면에서 다시 읽습니다.

side effects 하나에 대상을 여러 개 적을 수 있습니다. 이때 대상마다 **종류를 나타내는 키워드**(`field`, `permissions`, `entity` 등)를 직접 적어야 합니다. 예) `field MyField affects field Field1, field Field2;`

### 대상의 종류

| 대상 | 다시 읽는 것 |
| --- | --- |
| `field MyField` | 적어 둔 필드입니다. 필드는 하나 이상 적을 수 있습니다. |
| `field *` | 같은 entity(엔터티) 인스턴스의 모든 필드입니다. |
| `field _assoc.MyField` | 다른 entity 인스턴스의 필드입니다. association 경로로 적습니다. |
| `permissions ( ... )` | 괄호 안에 적은 것의 feature control(기능 제어)와 authorization control(권한 제어)입니다. |
| `$self` | 지금 RAP BO entity 입니다. |
| `entity _MyAssoc` | 연관된 entity `_MyAssoc` 입니다. |
| `messages` | response parameter(응답 매개변수) `reported` 에 담긴 모든 메시지입니다. |

### `permissions` 에 적을 수 있는 것

- 필드 : `permissions ( field MyField )`
- action : `permissions ( action MyAction )`
- 수정·삭제 작업 : `permissions ( update )`, `permissions ( delete )`
- 연관된 entity 의 필드와 action : `permissions ( _assoc.{field|action} )`
- 연관된 entity 의 작업 : `permissions ( {create|update|delete} _assoc )`

괄호 안에 쉼표로 여러 개를 나열할 수 있습니다. 예) `permissions ( action acceptTravel, update )`

### 괄호로 묶어 적기

같은 종류의 대상은 괄호로 묶어 줄여 적을 수 있습니다.

- `... affects field ( Field1, Field2 ) ...`
- `... affects field _Assoc.( Field1, Field2 ) ...`
- `... affects permissions ( field ( Field1, Field2 ) ) ...`
- `... affects permissions ( field Field1, field Field2 ) ...`
- `... affects entity ( _Assoc1, _Assoc2 ) ...`
- `... affects entity _Assoc1.( _ItemAssoc1, _ItemAssoc2 ) ...`

## 예제

`Travel` entity 의 side effects 에서 대상을 여러 방식으로 적어 봅니다.

```bdl
side effects
{
  // 필드 둘을 괄호로 묶어 대상으로
  field CurrencyCode affects field ( TotalPrice, Status );

  // 예약 entity 의 필드를 경로로
  field BeginDate affects field _Booking.FlightDate;

  // 필드와 action 의 feature control·권한 상태, 그리고 수정 가능 여부
  field Status affects permissions ( field AgencyID, action acceptTravel, update );

  // 예약을 만들 수 있는지 여부
  field EndDate affects permissions ( create _Booking );

  // 모든 필드, 예약 목록, 메시지
  action acceptTravel affects field *, entity _Booking, messages;
}
```

## 알아두기

- side effects 를 일으키는 조건이 `$self` 이면 대상에 지금 entity 자신의 필드를 적을 수 없습니다. 연관된 entity 의 필드는 경로로 적을 수 있습니다.
- 조건이 `$self` 이면 대상에도 `$self` 를 적을 수 없습니다.
- recommendation function side effects 의 대상은 여기 적는 방식이 아니라 field characteristics(필드 특성)으로 정합니다. [[abenbdl_field_char]] 를 봅니다.

## 관련 항목

- [[abenbdl_side_effects]]
- [[abenbdl_event_side_effect]]
- [[abenbdl_recommendations]]
- [[abenbdl_field_char]]
