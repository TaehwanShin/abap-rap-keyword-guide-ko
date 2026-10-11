---
title: factory action
summary: entity 인스턴스를 새로 만드는 action 으로, 기존 인스턴스를 복사하거나 기본값이 채워진 인스턴스를 만들 때 씁니다.
keywords: factory action, static factory action, default factory action, 팩토리 액션, 인스턴스 복사, 정적 팩토리 액션, cardinality, 카디널리티, MAPPED, %cid, AUTO FILL CID
---

## 문법

```syntax
[internal][static [default]] factory action
                  [(
                  [features: {instance | global}]
                  [precheck]
                  [authorization:none]
                  [authorization:update]
                  [authorization:global]
                  [authorization:instance]
                  [lock:none]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                   [cardinality]
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

## 설명

factory action 은 entity(엔터티) 인스턴스를 **새로 만드는** action 입니다. 인스턴스에 묶인 것과 [[abenbdl_static|정적]]인 것이 있습니다.

| 종류 | 쓰임새 |
| --- | --- |
| instance factory action | 어떤 인스턴스의 값을 복사해 새 인스턴스를 만들 수 있습니다. |
| static factory action | 기본값이 미리 채워진 인스턴스를 만드는 데 쓸 수 있습니다. |

factory action 은 child entity(자식 엔터티) 인스턴스까지 함께 만들 수도 있습니다.

규칙은 [[abenbdl_action_nonfactory|non-factory action]] 과 같고, 두 가지만 다릅니다.

### 출력 매개변수를 쓸 수 없다

[[abenbdl_action_output_para|출력 매개변수]]는 허용되지 않습니다. factory action 이 만드는 것은 언제나 자기가 선언된 entity 의 새 인스턴스입니다. 그래서 BDL 에 결과를 따로 적을 필요가 없습니다. 원문은 여기서 "하나 이상" 만든다고 적지만, 아래 카디널리티가 `[0..1]` 이나 `[0..*]` 이면 하나도 만들지 않을 수 있습니다.

### 카디널리티를 꼭 적는다

새로 만들 인스턴스의 개수를 카디널리티로 적어야 합니다.

| 값 | 뜻 |
| --- | --- |
| `[1]` | 정확히 하나를 만듭니다. |
| `[0..1]` | 만들지 않거나 정확히 하나를 만듭니다. |
| `[0..*]` | 만들지 않거나 몇 개든 만듭니다. |
| `[1..*]` | 몇 개든 만들되 적어도 하나는 만듭니다. |

### 결과는 어디로 돌아오는가

action 에 넘긴 값마다 새로 만든 인스턴스(없음, 하나, 여러 개)가 [[abapeml_response|response parameter]] `MAPPED`(성공) 또는 `FAILED` 에 들어갑니다. 넘긴 값을 가려내는 기준은 static factory action 이면 BDEF derived type(BDEF 파생 타입) 구성요소 `%cid`, instance factory action 이면 `%key` 입니다.

### default factory action

static factory action 가운데 정확히 하나를 `default` 로 **default factory action** 으로 지정할 수 있습니다. 이 지정은 OData 처럼 BO 를 쓰는 프레임워크에 영향을 줍니다. [[abenbdl_action_default_factory]] 에서 설명합니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 에서는 base BDEF(기반 BDEF) 의 factory action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]). factory action 을 새로 만들 수도 있습니다([[abenbdl_nonstandard_projection]]).
- RAP BO interface 에서는 base BDEF 의 factory action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

factory action 두 개를 선언합니다. `copyTravel` 은 고른 여행을 복사하고, `newTravel` 은 기본값이 든 여행을 새로 만듭니다.

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

  // 인스턴스를 복사하고 새 키를 준다
  factory action copyTravel [1];

  // 기본값이 든 새 인스턴스를 만든다
  static factory action newTravel [1];
}
```

EML 로 두 action 을 실행합니다. instance factory action 에는 복사할 여행의 키를, static factory action 에는 `%cid` 만 넘깁니다.

```abap
" 여행 1번을 복사한다. %cid 는 AUTO FILL CID 로 채운다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE copytravel
      AUTO FILL CID WITH VALUE #( ( travelid = '00000001' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 기본값이 든 새 여행을 만든다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE newtravel
      FROM VALUE #( ( %cid = 'new1' ) )
  MAPPED ls_mapped
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

handler method(핸들러 메서드) 구현까지 포함한 전체 흐름은 [[abenbdl_action3_abexa]] 에 있습니다.

## 알아두기

- factory action 을 실행할 때 [[abapmodify_entity_entities_fields|AUTO FILL CID]] 를 붙이면 BDEF derived type 구성요소 [[abapderived_types_cid|%cid]] 가 자동으로 채워집니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_default_factory]]
- [[abenbdl_action_onsave]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action3_abexa]]
- [[abapeml_response]]
