---
title: repeatable
summary: 한 번의 EML 또는 OData 요청 안에서 같은 인스턴스에 action 이나 function 을 여러 번 실행할 수 있게 하는 추가 구문입니다.
keywords: repeatable, repeatable action, repeatable function, 반복 가능 액션, 반복 가능 함수, 반복 실행, %cid, AUTO FILL CID, 같은 인스턴스 여러 번 실행
---

## 문법

```syntax
... repeatable ...
```

## 설명

factory 가 아닌 action 이나 function 을 **repeatable 작업**으로 만듭니다. repeatable 작업은 한 번의 EML 요청이나 OData 요청 안에서 같은 entity(엔터티) 인스턴스에 여러 번 실행할 수 있습니다.

repeatable 작업의 BDEF derived type(BDEF 파생 타입)에는 구성요소 [[abapderived_types_cid|%cid]] 가 들어 있습니다. response parameter(응답 매개변수)는 실행 하나하나마다 따로 채워집니다.

### repeatable action

`repeatable` 을 붙일 수 있는 action 은 **factory 가 아니고 인스턴스에 묶인 action** 뿐입니다. 다른 action 에는 붙이면 안 됩니다. 까닭은 이렇습니다.

- **factory action** 은 원래 반복할 수 있어서 따로 선언할 필요가 없습니다. factory action 의 BDEF derived type 에 이미 `%cid` 가 있고 여러 번 실행할 수 있습니다.
- **[[abenbdl_static|static]] action** 도 원래 반복할 수 있어서 따로 선언할 필요가 없습니다. static action 은 `%cid` 로 식별하고 여러 번 실행할 수 있습니다.
- **draft action** 은 한 요청 안에서 같은 draft 인스턴스에 여러 번 실행하면 안 됩니다. 쓸모가 없고 지원하지도 않습니다.

그 밖의 규칙과 붙일 수 있는 [[abenbdl_operations_additions|작업 추가 구문]]은 non-factory action 과 같습니다([[abenbdl_action_nonfactory]]). 다른 점은 하나뿐입니다. repeatable action 에는 `static` 을 쓸 수 없습니다.

### repeatable function

`repeatable` 을 붙일 수 있는 function 은 **인스턴스에 묶인 function** 뿐입니다. static function 은 원래 반복할 수 있고 `%cid` 로 식별합니다. 그래서 static function 에는 `repeatable` 을 적을 필요가 없고, 적을 수도 없습니다.

그 밖의 규칙과 붙일 수 있는 작업 추가 구문은 function 과 같습니다([[abenbdl_function]]). 여기서도 다른 점은 하나뿐입니다. repeatable function 에는 `static` 을 쓸 수 없습니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO : repeatable 작업을 다시 쓸 수 있고([[abenbdl_use_projection]]), 새로 정의할 수도 있습니다([[abenbdl_nonstandard_projection]]).
- RAP BO interface : repeatable 작업을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

action 과 function 을 종류별로 선언했습니다. 주석에 한 요청 안에서 같은 인스턴스에 반복 실행할 수 있는지를 적었습니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  field ( readonly : update ) TravelID;

  // 반복 불가: 같은 인스턴스에 두 번 실행하면 런타임 오류
  action acceptTravel;

  // repeatable
  repeatable action addSurcharge;

  // 선언하지 않아도 repeatable (factory action)
  factory action copyTravel [1];

  // 선언하지 않아도 repeatable (static action)
  static action closeOldTravels;

  function ( authorization : none ) getDetails result [1] $self;
  repeatable function ( authorization : none ) simulatePrice result [1] $self;
}
```

non-factory action `acceptTravel` 의 derived type 에는 `%cid` 가 없습니다. 아래처럼 같은 인스턴스를 두 번 넘기면 런타임 오류가 납니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE accepttravel
      FROM VALUE #( ( travelid = '00000001' )
                    ( travelid = '00000001' ) ).
```

repeatable action `addSurcharge` 는 실행마다 `%cid` 를 달리 주어 같은 인스턴스에 두 번 실행할 수 있습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE addsurcharge
      FROM VALUE #( ( %cid = 'run1' travelid = '00000001' )
                    ( %cid = 'run2' travelid = '00000001' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

- repeatable action 이나 function 을 실행할 때는 `%cid` 를 꼭 줘야 합니다. 직접 적는 대신 [[abapmodify_entity_entities_fields|AUTO FILL CID]] 를 붙여 자동으로 채울 수도 있습니다.

## 관련 항목

- [[abenbdl_action_nonfactory]]
- [[abenbdl_function]]
- [[abenbdl_action_factory]]
- [[abenbdl_static]]
- [[abapderived_types_cid]]
- [[abapmodify_entity_entities_fields]]
