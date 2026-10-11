---
title: 출력 매개변수 (result)
summary: action 이나 function 이 돌려줄 결과의 타입과 개수를 result 로 정하는 문법입니다. entity 나 구조를 돌려줄 수 있고, 일부 필드만 돌려주게 할 수도 있습니다.
keywords: OutputParameter, result, selective, deep result, cardinality, $self, entity, 출력 매개변수, 결과 매개변수, REQUEST requested_fields, %param, external
---

## 문법

```syntax
... [deep] result [selective] [cardinality]
           { $self
           | entity OutputParameterEntity
           | ResultParameterStructure [external 'ExternalName'] }
```

## 설명

[[abenbdl_action|action]] 이나 [[abenbdl_function|function]] 의 출력 매개변수는 키워드 `result` 로 정의합니다. action 이나 function 의 결과를 내부 테이블에 담아 돌려줄 때 씁니다. 결과 구조의 구성요소는 [[abapeml_result]] 에 설명되어 있습니다.

action 이나 function 정의에 `result` 를 적었으면 behavior pool(동작 풀)의 구현에서 **반드시 채워야** 합니다.

### 돌려주는 타입

| 표기 | 결과 타입 |
| --- | --- |
| `$self` | action 이나 function 을 정의한 entity(엔터티)와 같은 타입입니다. |
| `entity OutputParameterEntity` | 같은 BO 나 다른 BO 의 다른 CDS 뷰 entity 입니다. |
| `ResultParameterStructure` | 구조입니다. 키워드 `entity` 없이 적습니다. RAP abstract BDEF 를 적을 수 있습니다. |

결과가 구조일 때는 뒤에 [[abenbdl_external|external]] 을 붙여 다른 이름을 줄 수 있습니다. OData 메타데이터에서 action 이나 function 의 결과를 뚜렷이 가리키는 이름이 됩니다.

### cardinality

출력 매개변수의 개수를 정합니다. **반드시 적어야** 합니다. 대괄호도 문법의 일부입니다. 쓸 수 있는 값은 네 가지입니다.

- `[0..1]`
- `[1]`
- `[0..*]`
- `[1..*]`

### selective

`selective` 를 붙이면 결과 구조의 일부만 돌려줄 수 있습니다. 예를 들어 키만 돌려줍니다. 성능을 높이는 데 도움이 됩니다.

behavior pool 에 구현이 필요합니다. BDEF 에 `selective` 를 적으면 action 이나 function 의 handler method(핸들러 메서드)에 입력 매개변수 `REQUEST requested_fields` 가 하나 더 생깁니다. 요청받은 필드가 모두 `01` 로 표시되어 넘어옵니다.

### deep

`deep` 을 붙일 때의 모양은 다음과 같습니다.

```syntax
... deep result [selective] [cardinality] AbstractBDEF;
```

`AbstractBDEF` 는 [[abenbdl_bdef_abstract_header|with hierarchy]] 가 붙은 RAP abstract BDEF 여야 합니다. abstract BDEF 의 BDEF derived type(BDEF 파생 타입)은 계층 구조입니다. entity 의 모든 필드에 더해, CDS composition 마다 구성요소가 하나씩 들어 있습니다. `selective` 를 함께 붙이면 결과 구조의 일부만 돌려줄 수 있습니다.

## 예제

### 자기 자신을 돌려주는 action

```bdl
action acceptTravel result [1] $self;
action rejectTravel result [1] $self;
```

handler method 에서는 바뀐 인스턴스를 `%param` 에 담아 `result` 를 채웁니다.

```abap
result = VALUE #( FOR ls_travel IN lt_travel
                  ( %tky   = ls_travel-%tky
                    %param = ls_travel ) ).
```

부르는 쪽은 `RESULT` 로 받습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE accepttravel FROM VALUE #( ( travelid = '00000001' ) )
  RESULT FINAL(lt_result).
```

### 요청받은 필드만 돌려주는 function

```bdl
function getPriceInfo result selective [1] $self;
```

```abap
" 선언: REQUEST 매개변수가 하나 더 생긴다
METHODS getpriceinfo FOR READ
  IMPORTING keys FOR FUNCTION travel~getpriceinfo
  REQUEST requested_fields RESULT result.

METHOD getpriceinfo.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( totalprice currencycode ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 요청받은 필드만 채운다
  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky                = ls_travel-%tky
      %param-travelid     = COND #( WHEN requested_fields-travelid = if_abap_behv=>mk-on
                                    THEN ls_travel-travelid )
      %param-totalprice   = COND #( WHEN requested_fields-totalprice = if_abap_behv=>mk-on
                                    THEN ls_travel-totalprice )
      %param-currencycode = COND #( WHEN requested_fields-currencycode = if_abap_behv=>mk-on
                                    THEN ls_travel-currencycode ) ) ).
ENDMETHOD.
```

부르는 쪽은 `REQUEST` 로 받고 싶은 필드를 고릅니다. 여기서는 `TravelID` 와 `TotalPrice` 만 요청했으므로 결과에는 이 두 필드의 값만 들어 있습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE getpriceinfo FROM VALUE #( ( %tky-travelid = '00000001' ) )
    REQUEST VALUE #( travelid   = if_abap_behv=>mk-on
                     totalprice = if_abap_behv=>mk-on )
  RESULT FINAL(lt_price)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

### deep result

```bdl
action getItinerary deep result selective [1] ZA_Itinerary;
```

## 알아두기

- 결과가 CDS abstract entity 면 키워드 `entity` 없이 적어야 합니다. ABAP 에서 abstract entity 는 구조로 보기 때문입니다.

## 관련 항목

- [[abenbdl_action1_abexa]]
- [[abenbdl_action_input_param]]
- [[abapeml_result]]
- [[abenbdl_external]]
- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_operations_additions]]
