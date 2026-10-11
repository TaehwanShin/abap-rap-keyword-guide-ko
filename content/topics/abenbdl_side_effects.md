---
title: side effects
summary: 어떤 필드·action·event 가 바뀌거나 실행되면 화면의 다른 값, 권한 상태, 메시지를 다시 읽도록 관계를 선언합니다.
keywords: side effects, 부수 효과, affects, executed on, $self, determine action, recommendation function, event, permissions, messages, 화면 새로 고침, 다시 읽기, use side effects, Fiori Elements
---

## 문법

```syntax
side effects { field MyField affects Targets; }
           | { $self affects Targets; }
           | { action MyAction affects Targets; }
           | { determine action MyDetermineAction
               executed on Sources
               affects Targets; }
           | { event MyEvent affects Targets; }
           | { recommendation function MyRecommendationFunction executed on Sources; }
```

## 설명

side effects 는 "이것이 바뀌면 저것을 화면에서 다시 읽어라" 하는 **관계 선언**입니다. entity(엔터티) 동작 본문에 적습니다. 꼭 있어야 하는 것은 아닙니다.

side effects 는 RAP 서비스의 OData 메타데이터에 주석(annotation)으로 옮겨집니다. behavior pool(동작 풀)에 구현할 것은 없습니다.

`side effects` 는 entity 하나에 **한 번만** 적을 수 있습니다. side effects 가 여러 개면 중괄호 안에 세미콜론(`;`)으로 나눠 함께 적습니다.

`affects` 뒤의 대상 `Targets` 에 올 수 있는 것은 [[abenbdl_side_effects_target]] 에 정리돼 있습니다. 대상은 여러 개 적을 수 있습니다. recommendation function side effects 만 예외로, 대상을 `affects` 로 적지 않고 field characteristics(필드 특성)으로 정합니다([[abenbdl_field_char]]).

### 무엇이 side effects 를 일으키나

| 적는 법 | 언제 일어나나 |
| --- | --- |
| `field MyField affects ...` | 화면에서 필드 `MyField` 값이 바뀔 때. 필드는 **정확히 하나**만 적습니다. |
| `$self affects ...` | 지금 entity 가 생성·수정·삭제로 바뀔 때. |
| `action MyAction affects ...` | 화면에서 action `MyAction` 을 실행할 때. action 은 **정확히 하나**만 적습니다. |
| `determine action ... executed on Sources affects ...` | `Sources` 가운데 하나가 바뀔 때. determine action 을 실행한 다음 대상을 다시 읽습니다. |
| `event MyEvent affects ...` | 서버에서 side effects 용 event `MyEvent` 가 발생할 때. event 는 **정확히 하나**만 적습니다. |
| `recommendation function ... executed on Sources` | `Sources` 가운데 하나가 바뀔 때. recommendation function 을 실행한 다음 recommendations 대상 필드를 다시 읽습니다. |

### `$self` 를 조건으로 쓸 때의 제한

- 대상에 지금 entity 자신의 필드를 적을 수 없습니다. 연관된 entity 의 필드는 경로(`_assoc.MyField`)로 적을 수 있습니다.
- 대상에 `$self` 를 적을 수 없습니다.

### determine action 을 일으키는 조건 (`executed on Sources`)

`Sources` 는 하나 이상 적습니다. 올 수 있는 것은 다음과 같습니다.

- `field MyField` : 필드가 바뀔 때마다 실행합니다. 필드를 여러 개 적을 수 있습니다. 다른 entity 인스턴스의 필드는 association 경로 `_assoc.MyField` 로 적습니다.
- `$self` : 자기 entity 인스턴스에서 무엇이든 바뀌면 실행합니다. 필드 변경, 자식 생성, 자식 삭제가 모두 해당합니다.
- `entity _Assoc` : 적어 둔 entity `_Assoc` 에서 무엇이든 바뀌면 실행합니다. 필드 변경, 생성, 삭제가 해당합니다.
- `global` : 사용자가 입력 칸에서 Enter 를 눌러 전체 새로 고침을 요청할 때마다 실행합니다. side effects 하나에 한 번만 적을 수 있습니다.

필드를 둘 이상 적으면 그 필드들은 저절로 **필드 묶음**으로 다뤄집니다. 묶음 안의 필드를 하나 이상 고친 뒤 커서가 묶음 **밖으로** 나가야 side effects 가 일어납니다.

여러 필드는 괄호로 묶어 적을 수 있습니다.

- `... executed on field(Field1, Field2) ...`
- `... executed on field _Assoc.(Field1, Field2) ...`

### recommendation function 을 일으키는 조건

recommendation function([[abenbdl_recommendations]]) side effects 의 `Sources` 에는 `field MyField`, `$self`, `entity _Assoc` 을 쓸 수 있습니다. 뜻과 괄호 묶음은 위와 같습니다. 필드를 조건으로 쓰면, 값을 고친 뒤 커서가 그 필드 밖으로 나가야 side effects 가 일어납니다.

recommendation function side effects 의 대상은 필드뿐입니다. 그 필드는 behavior definition(동작 정의)에서 `field ( recommendations ) Field1, Field2, ...` 로 정해 둬야 합니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO, projection BDEF
- projection BDEF 와 interface BDEF 에서는 base BO(기반 BO) 의 side effects 를 다시 쓸 수 있습니다([[abenbdl_use_projection]]). projection BDEF 는 다시 쓰는 것에 더해 새 side effects 도 정의할 수 있습니다. interface BDEF 는 다시 쓰기만 할 수 있습니다.

## 예제

아래는 `Travel` entity 동작 본문에 넣는 side effects 입니다. action `acceptTravel` 과 determine action `recalcPrice` 는 같은 본문에 이미 선언돼 있다고 봅니다.

```bdl
side effects
{
  // 통화가 바뀌면 총액을 다시 읽는다
  field CurrencyCode affects field TotalPrice;

  // 통화나 예약 금액을 고치고 커서가 빠져나오면
  // determine action 을 실행하고 총액을 다시 읽는다
  determine action recalcPrice
    executed on field CurrencyCode,
                field _Booking.FlightPrice
    affects field TotalPrice;

  // 상태가 바뀌면 AgencyID 필드의 feature control 을 다시 읽는다
  field Status affects permissions ( field AgencyID );

  // 승인 action 뒤에는 모든 필드, action 버튼 상태, 메시지를 다시 읽는다
  action acceptTravel affects field *,
                              permissions ( action acceptTravel ),
                              messages;

  // 여행이 바뀌면 예약 목록을 다시 읽는다
  $self affects entity _Booking;
}
```

## 알아두기

- `static` 을 붙인 static action([[abenbdl_action]])은 side effects 를 일으키는 조건으로도, 대상으로도 쓸 수 없습니다.
- side effects 는 draft 를 쓰는 RAP BO 로 만든 화면에서 쓸모가 큽니다. 어떤 필드가 바뀌면 다른 값, 권한, 메시지를 다시 계산해야 한다는 사실을 Fiori Elements 화면에 알려 화면의 데이터가 어긋나지 않게 합니다.
- projection 이나 interface 에서 `use side effects` 를 적지 않으면 base BO 의 side effects 가 넘어오지 않습니다.

## 관련 항목

- [[abenbdl_side_effects_target]]
- [[abenbdl_event_side_effect]]
- [[abenbdl_recommendations]]
- [[abenbdl_determine_action]]
- [[abenbdl_field_char]]
- [[abenbdl_use_projection]]
- [[abenbdl_action]]
