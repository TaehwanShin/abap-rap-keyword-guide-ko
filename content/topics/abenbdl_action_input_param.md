---
title: 입력 매개변수 (parameter)
summary: action 이나 function 이 받을 값을 정하는 문법입니다. flat structure 로 받을 수도 있고, abstract BDEF 로 deep structure 나 테이블을 받을 수도 있습니다.
keywords: InputParameter, parameter, deep parameter, deep table parameter, $self, 입력 매개변수, 추상 엔터티, abstract entity, abstract BDEF, with hierarchy, %param
---

## 문법

flat parameter

```syntax
... parameter { ParameterEntity | $self };
```

deep parameter

```syntax
... [deep [table]] parameter AbstractBDEF;
```

## 설명

[[abenbdl_action|action]] 이나 [[abenbdl_function|function]] 의 입력 매개변수를 정의합니다. flat 으로도, deep 으로도 정의할 수 있습니다.

### flat parameter: parameter { ParameterEntity | $self }

- `ParameterEntity` 에는 CDS abstract entity(엔터티)나 클래식 DDIC 타입을 씁니다.
- `$self` 는 입력 매개변수 entity 가 그 action 이나 function 이 속한 abstract entity 와 같을 때 씁니다.
- `$self` 입력 매개변수는 static action 과 static function 에만 허용됩니다. instance action 이나 instance function 에 적으면 문법 경고는 나오지 않습니다. 대신 RAP BO consumer(사용자)가 그 action 이나 function 을 부를 때 런타임 오류가 납니다.

### deep parameter: [deep [table]] parameter AbstractBDEF

`AbstractBDEF` 는 [[abenbdl_bdef_abstract_header|with hierarchy]] 가 붙은 [[abenbdl_abstract|RAP abstract BDEF]] 여야 합니다. abstract BDEF 의 BDEF derived type(BDEF 파생 타입)은 계층 구조입니다. entity 의 모든 필드에 더해, CDS composition 마다 구성요소가 하나씩 들어 있습니다.

| 표기 | 입력 매개변수를 무엇으로 보나 |
| --- | --- |
| `deep parameter AbstractBDEF` | 구조 |
| `deep table parameter AbstractBDEF` | 테이블 |
| `parameter AbstractBDEF` | flat parameter |

## 예제

### flat parameter

할인율을 받아 여행 총액에서 깎는 action 입니다. 입력은 CDS abstract entity 로 정의합니다.

```cds
@EndUserText.label: '할인'
define abstract entity ZA_Discount
{
  @EndUserText.label: '할인율(%)'
  DiscountPercent : abap.int1;
}
```

```bdl
action deductDiscount parameter ZA_Discount result [1] $self;
```

부르는 쪽에서는 입력 값을 `%param` 에 넣습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE deductdiscount FROM VALUE #(
      ( travelid               = '00000001'
        %param-discountpercent = 10 ) )
  RESULT DATA(lt_result)
  FAILED DATA(ls_failed).
```

여행 `00000001` 의 총액이 10퍼센트 줄어듭니다.

### deep parameter

계층이 있는 abstract BDEF `ZA_Itinerary` 를 세 가지 방식으로 받습니다.

```bdl
// flat parameter 로 본다
action setItineraryFlat parameter ZA_Itinerary;

// 구조로 본다
action setItinerary deep parameter ZA_Itinerary;

// 테이블로 본다
action setItineraries deep table parameter ZA_Itinerary;
```

## 알아두기

- [[abenbdl_strict|strict mode]] 에서는 `$self` 를 입력 매개변수로 쓸 수 없습니다.
- 입력 매개변수가 CDS abstract entity 면 어노테이션 `EndUserText.label` 로 라벨을 붙일 수 있습니다. OData 를 쓰는 화면에 그 라벨이 보입니다.
- abstract BDEF 를 `deep` 없이 `parameter` 만으로 써도 됩니다. 그러면 flat parameter 로 봅니다. CDS abstract entity 하나를 쓴 것과 같은 derived type 이 되므로 따로 얻는 것은 없습니다.

## 관련 항목

- [[abenbdl_action2_abexa]]
- [[abenbdl_action_output_para]]
- [[abenbdl_default_function]]
- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_abstract]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_operations_additions]]
