---
title: BDEF projection extension
summary: projection BDEF 를 extension for projection 문으로 넓히는 개발 객체이며, projection BDEF 가 extension 을 명시적으로 허용해야 만들 수 있습니다.
keywords: BDEF projection extension, BDEF 프로젝션 확장, extension for projection, 프로젝션 BDEF 확장, extensible, extend behavior for, define behavior for, use
---

## 설명

BDEF projection extension(확장)은 projection BDEF 를 넓히는 저장소 객체(개발 객체)입니다. `extension for projection` 문으로 시작합니다.

원본 BO 쪽을 넓히는 extension 과는 층이 다릅니다. projection extension 은 projection BDEF 에 이미 있는 entity(엔터티)를 넓히거나, extension 노드의 projection 동작을 정의합니다. extension 필드에 field characteristics(필드 특성)을 주고, 원본 BO extension 에서 만든 작업을 `use` 로 내놓는 것이 주된 쓰임입니다. projection extension 에는 behavior pool(동작 풀)을 지정할 수 없고, 구현이 필요한 동작도 새로 정의할 수 없습니다.

**전제 조건**: 확장하려는 projection BDEF 가 extension 을 명시적으로 허용해야 합니다. 방법은 [[abenbdl_ext_enabling_projection]] 에 있습니다.

### 하위 항목

- [[abenbdl_extension_for_projection]] : projection extension 을 시작하는 문과 그 안에 넣을 수 있는 구성 요소
- [[abenbdl_extend_beh_proj]] : projection BDEF 에 이미 있는 entity 를 넓히는 `extend behavior for`
- [[abenbdl_proj_ext_body]] : entity projection extension 의 본문에 적을 수 있는 field characteristics, `use`, `extend mapping for`
- [[abenbdl_proj_ext_entity]] : extension 노드의 projection 동작을 정의하는 `define behavior for`
- [[abenbdl_entity_proj_ext_abexa]] : 원본 BO extension 과 projection extension 을 함께 쓰는 실행 예제

## 예제

원본 BO extension 에서 만든 action `holdTravel` 을 projection `ZC_Travel` 에서 쓸 수 있게 내놓습니다.

```bdl
extension for projection;

extend behavior for Travel
{
  use action holdTravel;
}
```

## 관련 항목

- [[abenbdl_extension_for_projection]]
- [[abenbdl_ext_enabling_projection]]
- [[abenbdl_extensibility_managed_unm]]
- [[abenbdl_extensibility_abstract]]
- [[abenbdl_extension]]
