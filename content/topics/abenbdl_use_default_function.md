---
title: default values function 다시 쓰기 (use function DefaultValuesFunction)
summary: base BDEF 에 정의한 default values function 을 projection BDEF 나 interface BDEF 에서 다시 쓰는 문법으로, 작업과 default values function 을 따로따로 적어야 합니다.
keywords: use function, DefaultValuesFunction, default values function, default function, 기본값 함수, 기본값 함수 다시 쓰기, GetDefaultsFor, use, 프로젝션 BDEF, 인터페이스 BDEF, 재사용
---

## 문법

```syntax
 ... use function DefaultValuesFunction;
```

## 설명

default values function 은 작업을 실행하기 전에 입력란에 미리 채워 줄 값을 돌려주는 function 입니다. base BDEF(기반 BDEF)에서 `default function` 으로 정의합니다. 자세한 내용은 [[abenbdl_default_function]] 에 있습니다.

이 default values function 을 projection BDEF 나 interface BDEF 에서도 쓰려면 **두 가지를 따로 적어야** 합니다.

- default values function 이 딸린 **작업**을 다시 씁니다. 방법은 [[abenbdl_use_projection]] 에 나온 그대로입니다. 예) `use create;`, `use action ...;`
- **default values function** 을 `use function DefaultValuesFunction;` 으로 다시 씁니다.

## 예제

base BDEF 가 생성, action, static function, create-by-association 에 default values function 을 하나씩 정의해 두었습니다. projection BDEF 에서 작업과 default values function 을 짝지어 다시 씁니다.

```bdl
projection;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  // 생성 + 생성용 default values function
  use create;
  use function GetDefaultsForCreate;

  use update;
  use delete;

  // action + action 용 default values function
  use action acceptTravel;
  use function GetDefaultsForAcceptTravel;

  // function + function 용 default values function
  use function findTravels;
  use function GetDefaultsForFindTravels;

  // create-by-association + 그 default values function
  use association _Booking { create; }
  use function GetDefaultsForBooking;
}

define behavior for ZC_Booking alias Booking
{
  use update;
  use delete;

  use association _Travel;
}
```

## 알아두기

- default values function 을 다시 쓸 때는 `use function` 뒤에 function 이름만 적습니다. 다른 추가 구문은 붙일 수 없습니다.
- 작업과 default values function 은 자동으로 함께 넘어오지 않습니다. 반드시 둘 다 적습니다.

## 관련 항목

- [[abenbdl_default_function]]
- [[abenbdl_use_projection]]
- [[abaprap_handler_default_val_func]]
- [[abenbdl_function]]
