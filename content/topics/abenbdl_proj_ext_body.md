---
title: projection extension 본문 (extension_body)
summary: projection extension 의 extend behavior for 안에 적는 내용으로, extension 필드의 field characteristics, use 로 다시 쓰는 작업, extend mapping for 세 가지가 있습니다.
keywords: extension_body, projection extension body, 프로젝션 확장 본문, field characteristics, use, extend mapping for, readonly, suppress, readonly:update, augment, 확장 필드, 확장 액션
---

## 문법

```syntax
...
  [field characteristics];
  [use];
  [extend mapping for];
```

## 설명

projection extension(확장) 본문은 projection BDEF 에 이미 있는 entity(엔터티)의 동작 본문을 넓힙니다. 적을 수 있는 것은 세 가지입니다.

### field characteristics

BDEF projection extension 에서 extension 필드에 field characteristics(필드 특성)을 줍니다.

- **extension 필드에만** 줄 수 있습니다. extension 필드는 데이터 모델 extension 으로 보탠 필드입니다.
- 쓸 수 있는 속성은 `readonly`, `suppress`, `readonly:update` 입니다. 뜻은 [[abenbdl_field_projection]] 에 적힌 그대로입니다.
- `mandatory`, `modify`, `features:instance` 는 BDEF projection extension 에서 쓸 수 없습니다.

### use

키워드 `use` 로 RAP BO 작업을 projection 에서 다시 씁니다. 동작은 [[abenbdl_use_projection]] 에 적힌 그대로입니다.

- 다시 쓸 수 있는 작업은 action, function, association 입니다.
- **같은 소프트웨어 컴포넌트에서 만든 extension 작업만** 다시 쓸 수 있습니다. `managed` 나 `unmanaged` 타입인 원본 BDEF 의 작업은 다시 쓸 수 없습니다.
- projection 층에 정의된 action, function, association 도 다시 쓸 수 없습니다.
- augmentation 은 BDEF projection extension 에서 쓸 수 없습니다. 그래서 `use association _child {create(augment);}` 같은 구문은 지원하지 않습니다.

### extend mapping for

원본에 있는 type mapping 에 extension 필드를 보탭니다. 문법과 조건은 [[abenbdl_type_mapping_ext]] 에 있습니다.

## 예제

projection `ZC_Travel` 의 root entity(루트 엔터티)에서 extension 필드에 속성을 주고, 원본 BO extension 이 만든 action 과 association 을 내놓습니다.

```bdl
extension for projection;

extend behavior for Travel
{
  // extension 필드에 줄 수 있는 속성은 readonly, suppress, readonly:update 뿐이다
  field ( readonly ) ZZDiscount;
  field ( suppress ) ZZMemo;

  // 같은 소프트웨어 컴포넌트의 extension 작업만 다시 쓴다
  use action holdTravel;
  use association _Note { create; }
}
```

## 알아두기

- 원본 BDEF 에 원래 있던 action 은 projection extension 에서 `use` 로 내놓을 수 없습니다. extension 으로 보탠 작업만 대상입니다.
- extension 필드를 mandatory 입력으로 만들거나(`mandatory`) instance feature control(기능 제어)를 거는 것(`features:instance`)은 projection extension 에서 할 수 없습니다.
- 실행해 볼 수 있는 예제는 [[abenbdl_entity_proj_ext_abexa]] 에 있습니다.

## 관련 항목

- [[abenbdl_extend_beh_proj]]
- [[abenbdl_extension_for_projection]]
- [[abenbdl_field_projection]]
- [[abenbdl_use_projection]]
- [[abenbdl_type_mapping_ext]]
- [[abenbdl_association]]
- [[abenbdl_entity_proj_ext_abexa]]
