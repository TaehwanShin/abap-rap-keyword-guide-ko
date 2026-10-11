---
title: BDEF derived type 으로 변수와 타입 선언하기
summary: handler method 밖에서도 TYPES, DATA, CREATE DATA 로 BDEF derived type 의 변수와 타입을 선언할 수 있으며, FOR 뒤에 entity 를 적는 방식이 몇 가지 있습니다.
keywords: BDEF derived type, 파생 타입 선언, TYPES, DATA, CREATE DATA, TYPE TABLE FOR, TYPE STRUCTURE FOR, TYPE REQUEST FOR, TYPE RESPONSE FOR, 별칭, 연관 관계, 명시적 선언
---

## 설명

BDEF derived type(BDEF 파생 타입)은 handler method(핸들러 메서드)의 매개변수에만 쓰는 것이 아닙니다. 코드를 나누어 짜기 좋도록, 많은 BDEF derived type 을 handler method 밖에서도 변수로 선언해 쓸 수 있습니다. 예를 들어 일반 ABAP 프로그램에서도 됩니다. `TYPES`, `DATA`, `CREATE DATA` 문을 쓸 수 있습니다.

```abap
TYPES tt_travel TYPE TABLE FOR CREATE zr_travel.
DATA  lt_travel TYPE TABLE FOR CREATE zr_travel.
```

entity(엔터티) 이름은 behavior definition(동작 정의)에 붙인 별칭이 아니라 **전체 이름**이어야 합니다. behavior pool(동작 풀)의 handler method 밖에서는 어느 behavior definition 을 가리키는지 분명하지 않기 때문입니다.

메서드 매개변수를 BDEF derived type 으로 만들려면, 먼저 `TYPES` 로 타입을 선언하고 그 타입을 가리키게 합니다.

```abap
TYPES tt_travel TYPE TABLE FOR CREATE zr_travel.
METHODS fill_travel IMPORTING it_travel TYPE tt_travel.
```

쓸 수 있는 타입 선언은 네 가지입니다.

- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abaptype_request_for]]
- [[abaptype_response_for]]

### FOR 뒤에 entity 를 적는 방식

`... FOR ...` 뒤에 대상을 적는 방식은 다음과 같습니다.

- **root entity(루트 엔터티) 이름 + `\\` + composition 트리 안의 entity** : `\\` 뒤에는, 그 entity 에 별칭이 있으면 반드시 별칭을 적습니다. 별칭이 없으면 entity 이름을 적을 수 있습니다. 예) `zr_travel\\travel`
- **entity 이름만** : 위 방식을 줄인 편한 형식입니다. root entity 이름(곧 behavior definition 이름)이나, composition 트리 안 다른 CDS entity 의 이름을 바로 적습니다. 예) `zr_travel`, `zr_booking`
- **`\` + association** : behavior definition 에 정의한 association 을 `\` 뒤에 적습니다. 예) `zr_travel\_booking`. `\\` 로 entity 를 적고 이어서 `\` 와 association 을 적는 긴 형식도 됩니다. 예) `zr_travel\\travel\_booking`

## 예제

같은 타입을 여러 방식으로 선언해 봅니다.

```abap
" 1) entity 이름만 적는다
TYPES tt_travel_c  TYPE TABLE FOR CREATE zr_travel.
DATA  lt_booking_u TYPE TABLE FOR UPDATE zr_booking.

" 2) root entity 이름 \\ 별칭 : 1) 과 같은 타입이다
TYPES tt_travel_c2  TYPE TABLE FOR CREATE zr_travel\\travel.
DATA  lt_booking_u2 TYPE TABLE FOR UPDATE zr_travel\\booking.

" 3) association : 여행에 딸린 예약을 만드는 타입. 두 줄은 같은 타입이다
DATA lt_booking_cba  TYPE TABLE FOR CREATE zr_travel\_booking.
DATA lt_booking_cba2 TYPE TABLE FOR CREATE zr_travel\\travel\_booking.

" 예약에서 부모 여행을 읽는 타입. 두 줄은 같은 타입이다
DATA lt_parent_rba  TYPE TABLE FOR READ IMPORT zr_booking\_travel.
DATA lt_parent_rba2 TYPE TABLE FOR READ IMPORT zr_travel\\booking\_travel.
```

## 알아두기

- behavior definition 에 적어 둔 내용에 맞는 타입만 선언할 수 있습니다. 예를 들어 `... FOR CREATE ...` 타입은 behavior definition 에서 생성 작업을 켜 두었을 때만 선언할 수 있습니다.
- behavior pool 안에서만 쓸 수 있는 BDEF derived type 도 여럿 있습니다.
- ADT(ABAP development tools for Eclipse)에서 F2 를 누르면 BDEF derived type 정보가 보입니다. 이때는 보통 긴 형식으로 표시됩니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_EXPLICIT_DECL` 은 BDEF derived type 으로 변수를 직접 선언하고, 간단한 EML `READ` 문에 쓰는 모습을 보여 줍니다.

## 관련 항목

- [[abenrpm_derived_types]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abaptype_request_for]]
- [[abaptype_response_for]]
- [[abapderived_types_dynamic]]
