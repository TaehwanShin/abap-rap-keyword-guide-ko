---
title: use (projection·interface BDEF에서 다시 쓰기)
summary: base BDEF 에 정의한 standard operation·action·function·draft 처리·ETag·event 등을 projection BDEF나 interface BDEF에서 골라 다시 쓰는 문법입니다.
keywords: use, use create, use update, use delete, use association, use action, use function, use draft, use collaborative draft, use draft as dependent, use etag, use event, use side effects, use key, use recommendations, with dependent draft, 재사용, 다시 쓰기, 프로젝션 BDEF, 인터페이스 BDEF
---

## 문법

```syntax
... use create [(augment[, precheck])]
  | use update [(augment[, precheck])]
  | use delete [(precheck)]
  | use association _Assoc { create [(augment[, precheck])];
                            [with draft]|[with dependent draft;]}
  | use action [(precheck)] ActionName
               [RedefinedParameter]
               [result entity ProjResultEntity]
               [as ProjAction]
               [external 'ExtName']
               [result external 'ExtResultName']
  | use function FunctionName
               [RedefinedParameter]
               [result entity ProjResultEntity]
               [as AliasName]
               [external ExtName]
               [result external ExtResultName]
  | use draft
  | use collaborative draft
  | use draft as dependent
  | use etag
  | use event EventName [RedefinedParameter] [as AliasName]
  | use side effects
  | use key KeyName [as AliasName]
  | use DefaultValuesFunction ...
  | use recommendations
```

원문의 문법 틀대로라면 `precheck` 는 `augment` 뒤에만 적을 수 있습니다. 하지만 원문 설명은 `augment` 와 `precheck` 를 따로따로 소개하고, create-by-association 에는 둘 가운데 하나만 붙인 꼴을 각각 보여 줍니다. `precheck` 만 붙이는 꼴은 위 틀에 드러나 있지 않습니다.

## 설명

projection BDEF와 interface BDEF는 base BDEF(기반 BDEF) 위에 얹는 층입니다. `use` 는 base BDEF 에 이미 있는 동작을 이 층으로 끌어올 때 씁니다.

기억할 점은 세 가지입니다.

- **자동으로 물려받지 않습니다.** 여기 나오는 작업과 특성은 projection·interface BDEF에 하나하나 적어야 합니다. 적지 않은 것은 그 층에서 쓸 수 없습니다.
- **base BDEF 에 정의되어 있어야 합니다.** 없는 것을 `use` 로 끌어올 수는 없습니다.
- **구현이 필요 없습니다.** 다시 쓰는 동작은 base BDEF 의 동작으로 연결됩니다. behavior pool(동작 풀)에 따로 쓸 코드가 없습니다.

다시 쓰는 동작에 `precheck` 와 `augment` 를 덧붙여 기능을 보탤 수 있습니다. 이 둘은 **projection BDEF에서만** 쓸 수 있고, projection 의 behavior pool 에 구현이 있어야 합니다. 자세한 내용은 [[abenbdl_precheck]] 와 [[abenbdl_augment_projection]] 을 보세요.

### use create / use update / use delete

standard operation(표준 작업)을 다시 씁니다. projection·interface BDEF 모두에서 쓸 수 있습니다.

- `use create`, `use update` : projection BDEF에서는 `augment` 와 `precheck` 를 덧붙일 수 있습니다.
- `use delete` : projection BDEF에서는 `precheck` 만 덧붙일 수 있습니다.

### use association

association 의 트랜잭션 처리를 다시 씁니다. `use association` 을 쓰면 read-by-association 은 따로 적지 않아도 켜집니다.

- `create` : create-by-association 을 켜려면 반드시 적습니다. projection BDEF에서는 `augment` 와 `precheck` 를 덧붙일 수 있습니다.
- `with draft` : projection·interface BDEF에서 draft 처리를 쓰면 association 에도 `with draft` 를 붙여야 합니다.
- `with dependent draft` : BO 사이를 잇는 association 에서 씁니다. 이것을 적은 쪽이 **주 draft BO**가 되어, 연결된 **종속 draft BO**의 draft 처리를 함께 다룹니다. 주 draft BO가 draft 가 되면 연결된 인스턴스도 모두 draft 가 됩니다. 주 draft BO를 활성화하면 연결된 인스턴스도 모두 활성화됩니다.
  - 종속 draft BO의 머리말에 `use draft as dependent` 가 있어야 합니다.
  - 두 BO 모두 draft 를 쓸 수 있어야 합니다.
  - 전체 예제는 [[abenbdl_dependent_draft_abexa]] 에 있습니다.

### use action

base BDEF 의 action 을 다시 씁니다. non-factory action 뿐 아니라 draft action, `determine action`, 복사 action, 재정렬 action 도 `use action` 으로 끌어옵니다. action 에 authorization control(권한 제어)나 feature control(기능 제어)가 걸려 있으면 projection·interface 에도 그대로 이어집니다.

| 추가 구문 | 하는 일 |
| --- | --- |
| `precheck` | projection 계층에서 precheck 를 새로 붙입니다. behavior pool 에 구현이 필요합니다. |
| `RedefinedParameter` | action 의 입력·출력 매개변수를 다시 정의합니다. [[abenbdl_redefine_param]] 참고. |
| `result entity ProjResultEntity` | base BDEF 가 `result entity` 로 출력 entity(엔터티)를 정했다면, projection BDEF에서 그 entity 의 projection 을 적어야 합니다. 적지 않으면 결과 entity 가 서비스에 없을 때 action 이 노출되지 않을 수 있습니다. |
| `as ProjAction` | projection 계층에서 쓸 새 별칭을 줍니다. |
| `external 'ExtName'` | OData에서 보일 이름을 새로 정합니다. ABAP 별칭보다 훨씬 길게 쓸 수 있습니다. UI 어노테이션에는 이 이름을 써야 합니다. |
| `result external 'ExtResultName'` | 결과 entity 에 새 이름을 줍니다. 이 이름이 OData 메타데이터에 나갑니다. |

### use function

base BDEF 의 function 을 다시 씁니다. `RedefinedParameter`, `result entity`, `as`, `external`, `result external` 을 쓸 수 있고 뜻은 `use action` 과 같습니다.

key function 에는 따로 규칙이 있습니다.

- interface BDEF와 projection BDEF 모두에서 다시 쓸 수 있습니다.
- key function 이 가리키는 대체 키를 먼저 `use key KeyName` 으로 끌어와야 합니다.
- `use function Name` 으로 다시 씁니다. `as` 로 별칭을, `external` 로 바깥 이름을 줄 수 있습니다. 다른 추가 구문은 쓸 수 없습니다.

### use draft

base BO(기반 BO)의 draft 처리를 다시 씁니다. base BO 가 draft 를 쓸 수 있어야 합니다. draft 테이블, draft 조회 뷰(있다면), 전체 ETag 필드는 구현 세부라서 자동으로 따라옵니다. projection·interface BDEF에 다시 적지 않습니다.

- draft 처리를 다시 쓰면 draft action 도 `use action` 으로 **반드시** 하나씩 적어야 합니다.
- 다시 쓰는 association 에는 `with draft` 를 붙여야 합니다. 예) `use association _Booking { create; with draft; }`

### use draft as dependent

BO 사이를 잇는 시나리오에서 draft 처리를 주 draft BO에 맡깁니다. 이렇게 적은 BO가 종속 draft BO가 됩니다. 주 draft BO가 draft 가 되거나 활성화될 때, 연결된 종속 draft BO의 인스턴스도 함께 draft 가 되거나 활성화됩니다.

- 주 draft BO의 behavior definition(동작 정의)에서, 종속 draft BO로 가는 association 에 `with dependent draft` 가 있어야 합니다.
- 두 BO 모두 draft 를 쓸 수 있어야 합니다.

### use collaborative draft

base BO 의 collaborative draft 처리를 다시 씁니다. base BO 가 collaborative draft 를 쓸 수 있어야 합니다. draft 테이블과 전체 ETag 필드는 자동으로 따라옵니다.

- draft action 을 `use action` 으로 반드시 적어야 합니다. collaborative draft 에만 있는 draft action `Share` 도 포함입니다.
- 다시 쓰는 association 에는 `with draft` 를 붙여야 합니다.

### use etag

base BO 에 ETag 필드가 있으면 다시 쓸 수 있습니다. `use etag` 는 projection·interface BDEF의 **entity 마다** 따로 적습니다. 적지 않으면 그 층에서는 낙관적 동시성 제어(다른 사람이 먼저 고쳤는지 확인하는 기능)가 사라집니다.

`use etag` 가 없어도 ETag 필드의 값 자체는 수정할 때마다 갱신됩니다. 다만 `use etag` 가 있어야 OData 서비스에서 낙관적 잠금 단계가 켜집니다. 이 단계에서는 수정 요청마다 ETag 값을 확인합니다. OData 클라이언트가 값이 바뀐 것을 알아채면 데이터를 고칠 수 없고 저장도 실패합니다.

### use event

business event 를 다시 씁니다. **interface BDEF에서만** 쓸 수 있습니다. projection BDEF에서는 business event 를 다시 쓸 수 없습니다.

- `RedefinedParameter` : event 의 매개변수를 다시 정의합니다.
- `as` : event 에 별칭을 줍니다.

예외가 하나 있습니다. base BDEF 에서 `for side effect` 로 정의한 side effects 용 event 는 interface BDEF와 projection BDEF 모두에서 `use event EventName` 으로 다시 쓸 수 있습니다. 이때는 `as` 만 붙일 수 있습니다.

### use side effects

side effects 를 다시 씁니다. projection·interface BDEF 모두에서 쓸 수 있습니다. **BDEF 머리말**에 적으며, base BO 의 모든 entity 에 정의된 side effects 가 한꺼번에 넘어옵니다. projection 에 아예 없는 필드나 action 에 걸린 side effects 는 걸러져서 효과가 없습니다.

base BO 가 `extensible` 이면 projection·interface BDEF의 머리말에 `use side effects` 를 꼭 적어야 합니다. 그래야 extension(확장)에서 정의한 side effects 까지 넘어옵니다. 적지 않으면 문법 경고가 납니다.

### use key

BDEF 대체 키를 다시 씁니다. `as` 로 별칭을 줄 수 있습니다. 다시 쓴 대체 키는 projection BDEF에서 새 key function 을 정의하거나, 이 대체 키로 내부 테이블에 접근할 때 씁니다.

### use DefaultValuesFunction

default values function 을 다시 씁니다. 작업과 default values function 을 **각각 따로** 적어야 합니다. [[abenbdl_use_default_function]] 참고.

### use recommendations

base BDEF 의 RAP recommendations 를 다시 씁니다. projection BDEF의 머리말에 적습니다. recommendation function 은 side effects 가 불러 주므로, recommendations 가 동작하려면 side effects 도 함께 다시 써야 합니다.

## 예제

draft 를 쓰는 base BO `ZR_Travel` 위에 projection BDEF를 올립니다. standard operation, association, action, draft 처리, ETag, side effects 를 다시 씁니다.

```bdl
projection;
strict ( 2 );
use draft;
use side effects;

define behavior for ZC_Travel alias Travel
use etag
{
  use create;
  use update;
  use delete;

  // association 으로 예약 생성 + draft 지원
  use association _Booking { create; with draft; }

  // base BDEF 의 action 에 projection 용 별칭을 준다
  use action acceptTravel as accept;

  // draft action 은 하나씩 직접 적는다
  use action Edit;
  use action Activate;
  use action Discard;
  use action Resume;
  use action Prepare;
}

define behavior for ZC_Booking alias Booking
use etag
{
  use update;
  use delete;

  use association _Travel { with draft; }
}
```

## 알아두기

- `precheck` 와 `augment` 는 projection BDEF에서만 쓸 수 있습니다. interface BDEF에는 붙일 수 없습니다.
- business event 는 interface BDEF에서만 다시 쓸 수 있습니다. side effects 용 event 만 예외입니다.
- `use draft`, `use collaborative draft` 만 적고 draft action 을 `use action` 으로 적지 않으면 안 됩니다.
- `use etag` 를 빠뜨리면 그 entity 는 projection·interface 층에서 동시 수정 확인을 하지 않습니다.

## 관련 항목

- [[abenbdl_augment_projection]]
- [[abenbdl_precheck]]
- [[abenbdl_redefine_param]]
- [[abenbdl_use_default_function]]
- [[abenbdl_dependent_draft_abexa]]
- [[abenbdl_standard_operations]]
- [[abenbdl_association]]
- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_draft_action]]
- [[abenbdl_with_draft]]
- [[abenbdl_with_coll_draft]]
- [[abenbdl_etag]]
- [[abenbdl_event]]
- [[abenbdl_side_effects]]
- [[abenbdl_define_key]]
- [[abenbdl_external]]
