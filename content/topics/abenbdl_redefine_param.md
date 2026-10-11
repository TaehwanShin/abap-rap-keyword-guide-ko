---
title: 매개변수 다시 정의 (RedefinedParameter)
summary: projection·interface BDEF에서 다시 쓰는 action·function·business event 의 깊은 매개변수를, 구성요소가 더 적은 abstract BDEF로 바꿔 내보내는 문법입니다.
keywords: RedefinedParameter, deep parameter, deep result, 매개변수 다시 정의, 재정의 매개변수, 깊은 매개변수, 추상 BDEF, abstract BDEF, with hierarchy, deep mapping, use action, use function, use event, mandatory:execute, with control
---

## 문법

action·function 의 입력 매개변수 다시 정의

```syntax
 ... deep parameter RedefinedAbstractBDEF ...
```

action·function 의 출력 매개변수 다시 정의

```syntax
... deep result RedefinedAbstractBDEF ...
```

business event 의 출력 매개변수 다시 정의

```syntax
 ... deep parameter RedefinedAbstractBDEF ...
```

## 설명

projection BDEF나 interface BDEF에서 action, function, business event 를 [[abenbdl_use_projection|use]] 로 다시 쓸 때, 그 입력·출력 매개변수를 다른 타입으로 바꿔 내보낼 수 있습니다. base BDEF(기반 BDEF)의 매개변수 가운데 바깥에 보이고 싶지 않은 구성요소를 빼거나 이름을 바꿀 때 씁니다.

다시 정의는 선택입니다. 적지 않으면 base BDEF 의 매개변수를 그대로 씁니다.

**전제 조건** : base BDEF 에서 그 매개변수가 `deep` 을 붙인 깊은 매개변수여야 하고, 타입이 abstract BDEF여야 합니다.

새 매개변수 `RedefinedAbstractBDEF` 는 다음 규칙을 지켜야 합니다.

- `with hierarchy` 가 붙은 abstract BDEF여야 합니다.
- 기반 작업·event 의 데이터 타입의 **부분집합**이어야 합니다. 구성요소가 기반 매개변수보다 적어도 됩니다. 각 구성요소는 기반 매개변수의 구성요소와 호환되거나 변환할 수 있어야 합니다. 기본 데이터 객체의 대입·변환 규칙이 그대로 적용됩니다.
- 기반 작업·event 의 매개변수로 쓰인 abstract BDEF로 가는 [[abenbdl_type_mapping_abstract|type mapping]] 을 정의해야 합니다. 그래서 구성요소 이름은 기반 타입과 달라도 됩니다.

세 가지 형태의 차이는 다음과 같습니다.

| 형태 | 대상 | 쓸 수 있는 곳 |
| --- | --- | --- |
| `deep parameter` (action·function) | 입력 매개변수 | projection BDEF, interface BDEF |
| `deep result` | 출력 매개변수 | projection BDEF, interface BDEF |
| `deep parameter` (business event) | event 의 출력 매개변수 | interface BDEF |

## 예제

base BDEF `ZR_Travel` 은 abstract BDEF `ZA_Reason` 을 깊은 매개변수로 씁니다. `ZA_Reason` 에는 구성요소가 세 개(`ReasonCode`, `ReasonText`, `InternalNote`) 있습니다.

```bdl
// base BDEF 의 일부
action rejectTravel deep parameter ZA_Reason;
function getRejectReason deep result [1] ZA_Reason;
event TravelRejected deep parameter ZA_Reason;
```

interface BDEF에서는 `InternalNote` 를 뺀 abstract BDEF `ZA_ReasonPublic` 으로 바꿔 내보냅니다.

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

`ZA_ReasonPublic` 의 abstract BDEF에는 `ZA_Reason` 으로 가는 mapping 이 있어야 합니다.

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

## 알아두기

- 기반 매개변수의 abstract BDEF에서 `mandatory:execute` 로 표시한 필드는 새 매개변수의 타입에도, 그 type mapping 에도 반드시 들어 있어야 합니다. 이 규칙은 action 과 function 의 매개변수에만 적용됩니다. business event 에서는 `mandatory:execute` 가 무시됩니다.
- 기반 매개변수와 새 매개변수는 `with control` 을 **둘 다 쓰거나 둘 다 쓰지 않아야** 합니다.
- projection BDEF가 interface BDEF 위에 올라가 있으면 매개변수를 다시 정의할 수 없습니다. 바꿀 수 있는 것은 base BDEF 의 매개변수뿐입니다. interface 가 내보낸 매개변수를 그 위의 projection 이 다시 바꿀 수는 없습니다.
- business event 의 매개변수 다시 정의는 interface BDEF에서만 됩니다.

## 관련 항목

- [[abenbdl_redef_param_abexa]]
- [[abenbdl_use_projection]]
- [[abenbdl_abstract]]
- [[abenbdl_type_mapping_abstract]]
- [[abenbdl_field_abstract]]
- [[abenbdl_define_beh_abstract]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
