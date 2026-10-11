---
title: projection extension entity (define behavior for)
summary: BDEF projection extension 안에서 extension 노드의 projection 동작을 정의하는 구문이며, 구현이 필요한 동작은 넣을 수 없습니다.
keywords: define behavior for, projection extension entity, 프로젝션 확장 엔터티, 확장 노드, extension for projection, use, readonly, suppress, readonly:update, extend mapping for, 프로젝션 BDEF
---

## 문법

```syntax
... define behavior for ProjectionEntity ...
```

## 설명

projection extension(확장) entity(엔터티)는 BDEF projection extension 안에서 `define behavior for` 로 **extension 노드**의 projection 동작을 정의합니다. 원본 BO 에 새로 보탠 노드를 projection 층에서도 쓸 수 있게 하는 자리입니다.

### 전제 조건

- 바탕이 되는 projection BDEF 가 BDEF extension 을 명시적으로 허용해야 합니다. ([[abenbdl_ext_enabling_projection]] 참고)
- extension 노드를 데이터 모델 extension 으로 RAP 데이터 모델에 먼저 보태 두어야 합니다.

### 할 수 있는 것

적는 방법은 projection BDEF 의 entity behavior definition(동작 정의, [[abenbdl_projection_bo]])와 비슷하지만 제한이 있습니다. 지원하는 것은 세 가지입니다.

- field characteristics(필드 특성) `readonly`, `readonly:update`, `suppress`
- standard operation(표준 작업), action, function, association 을 `use` 로 다시 쓰기
- 이미 있는 type mapping extension

### 할 수 없는 것

구현이 필요한 동작은 보탤 수 없습니다. 그래서 다음은 지원하지 않습니다.

- behavior pool(동작 풀) 지정. `implementation in class unique` 문은 쓸 수 없습니다.
- authorization control(권한 제어) 지정. entity 동작 특성 자리에 키워드 `authorization` 을 쓸 수 없습니다.
- entity 동작 본문에 새 action 이나 새 function 정의
- 외부 entity(foreign entity) 지정
- 확인 생략용 authorization context 를 새로 보태기. 전체 authorization context extension 도 지원하지 않습니다.
- type mapping 을 새로 보태기. 이미 있는 type mapping 에 extension 필드를 보태는 것은 됩니다.
- `with privileged mode` 로 BDEF privileged mode 켜기

## 예제

원본 BO extension 이 `ZR_Travel` 아래에 노드 `ZR_TravelNote` 를 보탰고, 그 projection 뷰 `ZC_TravelNote` 도 만들어 두었다고 봅니다. projection extension 에서 이 노드의 동작을 정의합니다.

```bdl
extension for projection;

extend behavior for Travel
{
  use association _Note { create; }
}

define behavior for ZC_TravelNote alias TravelNote
{
  use update;
  use delete;
  use association _Travel;
  use action markDone;

  field ( readonly ) NoteDate;
}
```

## 알아두기

- projection extension entity 에는 `authorization` 도, behavior pool 도 적지 않습니다. 원본 BO 쪽에서 정의하고 구현한 것을 `use` 로 가져다 쓸 뿐입니다.
- 새 action 이 필요하면 원본 BO 의 extension([[abenbdl_new_elem_ext]])에서 만들고, 여기서는 `use action` 으로 내놓습니다.

## 관련 항목

- [[abenbdl_extension_for_projection]]
- [[abenbdl_extend_beh_proj]]
- [[abenbdl_proj_ext_body]]
- [[abenbdl_projection_bo]]
- [[abenbdl_ext_enabling_projection]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_entity_proj_ext_abexa]]
