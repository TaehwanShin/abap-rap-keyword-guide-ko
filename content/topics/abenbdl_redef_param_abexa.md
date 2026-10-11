---
title: 예제 - 매개변수를 다시 정의해 다시 쓰기
summary: interface BDEF 에서 action·function·event 의 deep parameter 를 구성요소가 더 적은 abstract BDEF 로 바꾸고, base BO 와 interface 에서 결과가 어떻게 달라지는지 보여 주는 예제입니다.
keywords: RedefinedParameter, deep parameter, deep result, 매개변수 다시 정의, 재정의 매개변수 예제, 추상 BDEF, abstract BDEF, deep mapping, with hierarchy, with control, interface BDEF, 인터페이스 BDEF, use action, use function, use event
---

## 설명

이 예제는 action, function, business event 의 입력·출력 매개변수를 projection BDEF 나 interface BDEF 에서 [[abenbdl_redefine_param|다시 정의]]하는 방법을 보여 줍니다.

구성은 이렇습니다.

1. CDS abstract entity(엔터티) 두 개. 하나는 구성요소가 세 개이고, 다른 하나는 그 가운데 두 개만 있는 부분집합입니다. 둘 다 `root` 로 정의합니다. 그래야 abstract BDEF 의 바탕이 될 수 있습니다.
2. abstract entity 마다 abstract BDEF 하나. 다시 정의는 deep parameter 에서만 되고, deep parameter 는 언제나 abstract BDEF 로 정의하기 때문입니다.
3. managed base BDEF(기반 BDEF). 구성요소 세 개짜리 abstract BDEF 를 action, function 두 개, event 의 deep parameter 로 씁니다.
4. interface BDEF. 같은 작업을 다시 쓰면서 매개변수를 구성요소 두 개짜리 abstract BDEF 로 바꿉니다.

아래 코드는 같은 내용을 공통 예제 모델로 줄여 쓴 것입니다.

## 예제

abstract entity 입니다. `ZA_ReasonPublic` 은 `ZA_Reason` 에서 `InternalNote` 를 뺀 것입니다.

```cds
define root abstract entity ZA_Reason
{
  InternalNote : abap.int4;
  ReasonCode   : abap.char(20);
  ReasonText   : abap.char(20);
}
```

```cds
define root abstract entity ZA_ReasonPublic
{
  ReasonCode : abap.char(20);
  ReasonText : abap.char(20);
}
```

abstract BDEF 두 개입니다. 부분집합 쪽에는 원래 타입으로 가는 `deep mapping` 이 있습니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_Reason
with control
{
}
```

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_ReasonPublic
with control
{
  deep mapping for ZA_Reason
  {
    ReasonCode = ReasonCode;
    ReasonText = ReasonText;
  }
}
```

base BDEF 의 일부와 interface BDEF 입니다.

```bdl
// base BDEF ZR_Travel 의 일부
action rejectTravel deep parameter ZA_Reason;
function getRejectReason deep result [1] ZA_Reason;
event TravelRejected deep parameter ZA_Reason;
```

```bdl
interface;

define behavior for ZI_Travel alias Travel
{
  use create;
  use update;
  use delete;

  use action rejectTravel deep parameter ZA_ReasonPublic;
  use function getRejectReason deep result ZA_ReasonPublic;
  use event TravelRejected deep parameter ZA_ReasonPublic;
}
```

같은 function 과 action 을 base BO(기반 BO)와 interface 에서 각각 부릅니다.

```abap
" base BO 의 function: 결과 %param 에 구성요소가 세 개
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE getrejectreason
    FROM VALUE #( ( TravelID = '00000001' ) )
  RESULT DATA(lt_base_result).

" interface 의 function: 결과 %param 에 구성요소가 두 개 (InternalNote 없음)
READ ENTITIES OF zi_travel
  ENTITY travel
    EXECUTE getrejectreason
    FROM VALUE #( ( TravelID = '00000001' ) )
  RESULT DATA(lt_intf_result).

" interface 의 action: %param-InternalNote 를 적으면 문법 오류
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    EXECUTE rejecttravel
    FROM VALUE #( ( TravelID          = '00000001'
                    %param-ReasonCode = 'BUDGET'
                    %param-ReasonText = '예산 초과' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

실행하면 다음과 같이 됩니다.

- function `getRejectReason` 을 base BO 에서 부르면 결과 구조에 구성요소가 세 개 있습니다. interface 에서 부르면 두 개뿐입니다. `InternalNote` 는 다시 정의한 출력 매개변수에 없으므로 결과에서 빠집니다.
- action `rejectTravel` 을 interface 에서 부를 때는 `InternalNote` 에 값을 넘길 수 없습니다. 다시 정의한 입력 매개변수에 그 구성요소가 없기 때문입니다. 적으면 문법 검사에서 오류가 납니다.

눈여겨볼 점입니다.

- 두 abstract BDEF 모두 `with hierarchy` 와 `with control` 을 씁니다. `with control` 은 양쪽이 같아야 합니다.
- mapping 은 **부분집합 쪽** abstract BDEF 에 적습니다. 왼쪽이 자기 구성요소, 오른쪽이 원래 타입의 구성요소입니다.
- interface 의 `deep result` 에는 base BDEF 와 달리 `[1]` 같은 카디널리티를 적지 않았습니다.
- 원문 예제는 RAP BO 계약을 모두 지키지는 않습니다. 설명용으로 짧게 만든 것이라 일부 handler method(핸들러 메서드)는 비어 있습니다.

## 관련 항목

- [[abenbdl_redefine_param]]
- [[abenbdl_use_projection]]
- [[abenbdl_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
