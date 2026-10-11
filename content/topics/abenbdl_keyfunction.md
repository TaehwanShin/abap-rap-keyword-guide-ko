---
title: key function
summary: BDEF 대체 키의 값을 입력으로 받아 그 값에 맞는 entity 인스턴스를 돌려주는, 미리 정해진 형태의 function 을 선언하는 문법입니다.
keywords: key function, key ( AlternativeKey ) function, 키 함수, 대체 키, alternative key, pure key, result selective, FOR READ, READ ENTITIES EXECUTE, %param
---

## 문법

```syntax
[internal] key (AlternativeKey) function FunctionName
  [external 'ExternalName']
  [result selective [cardinality] $self];
```

## 설명

key function 은 [[abenbdl_define_key|BDEF 대체 키]]에 딸린, 미리 정해진 형태의 [[abenbdl_function|function]]입니다. 대체 키 `AlternativeKey` 의 값을 입력으로 받아, 그 값에 맞는 entity(엔터티) 인스턴스를 돌려줍니다. 기본 키가 아닌 다른 필드로 인스턴스를 찾는 길을 열어 주는 셈입니다.

key function 은 예를 들어 RAP 재사용 객체가 끼어 있는, BO 사이의 association 이 있는 RAP BO 에서 read-by-association 을 할 수 있게 하는 데 쓰입니다.

### 누가 구현하는가

| BO 종류 | 구현 |
| --- | --- |
| managed | managed RAP BO provider(제공자)가 처리합니다. behavior pool(동작 풀)에 구현할 것이 없습니다. |
| unmanaged | behavior pool 의 handler method(핸들러 메서드) [[abaphandler_meth_read|FOR READ ... FUNCTION]] 에 직접 구현해야 합니다. |

### 붙일 수 있는 추가 구문

- [[abenbdl_internal|internal]] : BO 구현 안에서만 부를 수 있는 key function 으로 만듭니다.
- [[abenbdl_external|external]] : 바깥에서 쓸 다른 이름을 줍니다. 이 이름은 OData 메타데이터에 드러나지만 ABAP 에서는 알지 못합니다. 원래 이름보다 훨씬 길어도 됩니다.
- **출력 매개변수** : 직접 적을지는 선택입니다. 적는다면 형태는 `result selective [cardinality] $self` 입니다. 카디널리티는 `[0..1]`, `[0..*]`, `[1]` 가운데 하나입니다. 적지 않으면 `result selective [1] $self` 로 봅니다. 출력 매개변수는 [[abenbdl_action_output_para]] 에서 자세히 설명합니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO
    - base BDEF(기반 BDEF) 의 key function 을 `use function` 으로 다시 쓸 수 있습니다([[abenbdl_use_projection]]).
    - key function 을 새로 만들 수도 있습니다.
- RAP BO interface 에서는 base BDEF 의 function 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

`AgencyID` 필드 하나로 된 순수 키(pure key) `AgencyKey` 를 대체 키로 정의하고, 그 키를 가리키는 key function `getByAgency` 를 선언합니다. managed BO 이므로 구현은 필요 없습니다.

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

  field ( readonly ) TravelID;

  // 대체 키: AgencyID 로 찾는다
  define pure key AgencyKey { AgencyID; }

  // 대체 키를 입력으로 받는 key function
  key ( AgencyKey ) function getByAgency;
}
```

EML 에서는 `READ ENTITIES` 의 `EXECUTE` 로 부르고, 대체 키 값을 `%param` 에 넣습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE getbyagency
      FROM VALUE #( ( %cid = '1' %param-agencyid = '070001' ) )
  RESULT DATA(lt_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

`lt_result` 에는 `AgencyID` 가 `070001` 인 여행 인스턴스가 담겨 돌아옵니다. 원문 예제에서는 같은 값을 지닌 인스턴스가 여러 건일 때 그 모두가 돌아옵니다. 원문 설명대로라면 출력 매개변수를 적지 않은 이 선언은 `result selective [1] $self` 로 보는데, 카디널리티 `[1]` 과 여러 건이 돌아오는 결과가 어떻게 맞는지는 원문에 나와 있지 않습니다.

## 관련 항목

- [[abenbdl_function]]
- [[abenbdl_define_key]]
- [[abenbdl_action_output_para]]
- [[abaphandler_meth_read]]
- [[abenbdl_use_projection]]
