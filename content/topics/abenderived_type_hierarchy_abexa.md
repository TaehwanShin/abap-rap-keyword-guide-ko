---
title: TYPE TABLE / TYPE STRUCTURE FOR HIERARCHY 사용 예제
summary: action 의 deep parameter 와 deep result 를 TYPE STRUCTURE FOR HIERARCHY 와 TYPE TABLE FOR HIERARCHY 로 채워 넘기고 받는 예제입니다.
keywords: TYPE TABLE FOR HIERARCHY, TYPE STRUCTURE FOR HIERARCHY, deep parameter, deep table parameter, deep result, 깊은 매개변수, 깊은 입력 매개변수, 깊은 출력 매개변수, 추상 BDEF, with hierarchy, with control, %param, 액션, 예제
---

## 설명

이 예제는 managed RAP BO 의 action 에서 **deep parameter** 를 주고받을 때 BDEF derived type(BDEF 파생 타입) `TYPE TABLE FOR HIERARCHY` 와 `TYPE STRUCTURE FOR HIERARCHY` 를 어떻게 쓰는지 보여 줍니다.

deep parameter 는 필드만 나란히 있는 것이 아니라, 안에 구조나 테이블이 겹겹이 들어 있는 매개변수입니다. 모양은 abstract entity(엔터티)와 그 composition 이 정하고, abstract BDEF 에 `with hierarchy;` 를 적어야 쓸 수 있습니다.

원문 예제의 behavior definition(동작 정의)에는 static action 이 다섯 개 있습니다.

| action | 매개변수 | 하는 일 |
| --- | --- | --- |
| `action_flat_param` | `parameter` (flat parameter) | 입력 값을 조금 바꿔 `result` 로 돌려주고, 그 값으로 인스턴스를 만듭니다. |
| `action_deep_param` | `deep parameter` (구조 하나) | 입력이 `TYPE STRUCTURE FOR HIERARCHY` 구조입니다. abstract entity 의 값 몇 개를 골라 바꾼 뒤 `result` 로 돌려주고 인스턴스를 만듭니다. |
| `action_deep_table_param` | `deep table parameter` (테이블) | 입력이 `TYPE TABLE FOR HIERARCHY` 테이블입니다. 나머지는 위와 같습니다. |
| `returnHData` | `deep result` | 계층 데이터를 돌려줍니다. `result` 의 `%param` 안에 `TYPE STRUCTURE FOR HIERARCHY` 와 `TYPE TABLE FOR HIERARCHY` 타입의 하위 구성요소가 어떻게 겹쳐 들어가는지 보여 줍니다. |
| `storeHData` | `deep parameter` (구조 하나) | deep parameter 에서 값을 골라 `TYPE TABLE FOR CREATE` 테이블을 채우고 인스턴스를 만듭니다. 만든 인스턴스를 `result` 로 돌려줍니다. |

action 안에서 값을 바꾼다는 것은 문자 필드에 글자를 덧붙이고 숫자 필드로 계산을 한다는 뜻입니다. 어느 action 이든 인스턴스를 만들 때는 `TYPE TABLE FOR CREATE` 테이블을 채워 RAP 생성 작업을 실행합니다.

## 예제

공통 예제 모델로 줄여 쓴 것입니다. abstract entity `ZA_TravelInput` 에 composition `_Booking` (대상 `ZA_BookingInput`)이 있다고 봅니다.

abstract BDEF 입니다. `with hierarchy;` 가 있어야 `FOR HIERARCHY` 타입이 나오고, `with control` 을 적으면 `%control` 이 생깁니다.

```bdl
abstract;
strict ( 2 );
with hierarchy;

define behavior for ZA_TravelInput
with control
{
  association _Booking;
}

define behavior for ZA_BookingInput
with control
{
}
```

`ZR_Travel` 의 behavior definition 에는 deep parameter 를 받는 action 을 넣습니다.

```bdl
// 입력이 구조 하나
static action createWithBookings deep parameter ZA_TravelInput
  result [1..*] $self;

// 입력이 테이블
static action createManyWithBookings deep table parameter ZA_TravelInput
  result [1..*] $self;

// 출력이 deep structure
static action getTemplate deep result [1] ZA_TravelInput;
```

RAP BO consumer(사용자)는 `FOR HIERARCHY` 타입의 변수를 채워 `%param` 에 넘깁니다.

```abap
DATA ls_input TYPE STRUCTURE FOR HIERARCHY za_travelinput.
DATA lt_input TYPE TABLE FOR HIERARCHY za_travelinput.

" composition _booking 이 구조 안에 테이블로 들어 있다
" 자식 줄의 필드는 자식 줄의 %control 에서 켠다
ls_input = VALUE #(
  agencyid   = '070001'
  customerid = '000010'
  _booking   = VALUE #( %control = VALUE #( flightdate = if_abap_behv=>mk-on )
                        ( flightdate = '20261201' )
                        ( flightdate = '20261215' ) )
  %control   = VALUE #( agencyid   = if_abap_behv=>mk-on
                        customerid = if_abap_behv=>mk-on
                        _booking   = if_abap_behv=>mk-on ) ).

" deep parameter: %param 이 구조
MODIFY ENTITY zr_travel
  EXECUTE createwithbookings
    FROM VALUE #( ( %cid = 'cid_deep' %param = ls_input ) )
  RESULT   DATA(lt_result)
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" deep table parameter: %param 이 테이블
lt_input = VALUE #( ( ls_input ) ( ls_input ) ).

MODIFY ENTITY zr_travel
  EXECUTE createmanywithbookings
    FROM VALUE #( ( %cid = 'cid_deep_table' %param = lt_input ) )
  RESULT   DATA(lt_result_many)
  MAPPED   ls_mapped
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

### 실행하면

원문 예제는 action 을 실행할 때마다 action 의 `result` 와 저장 뒤의 persistent table 내용을 보여 줍니다.

1. `action_flat_param` : `%cid` 와 flat structure 인 `%param` 을 넘깁니다.
2. `action_deep_param` : `%cid` 와 deep structure 인 `%param` 을 넘깁니다.
3. `action_deep_table_param` : `%cid` 와 deep table 인 `%param` 을 넘깁니다.
4. `returnHData` 에는 `%cid` 만 넘깁니다. 돌려받은 결과를 `CORRESPONDING` 으로 옮겨 `storeHData` 의 입력으로 그대로 넘깁니다. `storeHData` 가 인스턴스를 만듭니다.

각 단계 뒤에 `COMMIT ENTITIES` 가 인스턴스를 persistent table 에 저장합니다.

## 알아두기

- `FOR HIERARCHY` 타입은 여러 겹으로 겹칠 수 있습니다. 원문 예제는 루트 abstract entity 아래에 구조로 들어가는 항목, 테이블로 들어가는 항목, 스칼라 타입 항목을 두고, 그 항목 아래에 다시 다른 루트 abstract entity 를 둡니다.
- `%control` 에는 필드뿐 아니라 composition 에 해당하는 구성요소도 있습니다. 넘기는 것마다 `if_abap_behv=>mk-on` 으로 켭니다. 자식 필드는 자식 구조나 자식 테이블 줄의 `%control` 에서 따로 켭니다.
- 원문 예제의 키 필드에는 `numbering : managed` 가 걸려 있어서, 인스턴스마다 키 값이 자동으로 만들어집니다.
- 타입의 조건과 구성요소는 [[abaptype_table_for]] 의 `HIERARCHY` 설명에 있습니다.

## 관련 항목

- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abenbdl_action_input_param]]
- [[abenbdl_action_output_para]]
- [[abenbdl_bdef_abstract_header]]
- [[abenbdl_define_beh_abstract]]
- [[abapderived_types_param]]
- [[abapmodify_entity_entities]]
