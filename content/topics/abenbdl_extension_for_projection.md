---
title: projection extension 문 (extension for projection)
summary: projection BDEF 를 넓히는 BDEF projection extension 을 시작하는 문이며, behavior pool 은 지정할 수 없습니다.
keywords: extension for projection, BDEF 프로젝션 확장, projection extension, extensible, define behavior for, extend behavior for, 프로젝션 BDEF, 확장 겹치기
---

## 문법

```syntax
extension for projection
[extensible  ;]
  [define behavior for]
  [extend behavior for]
...
```

## 설명

`extension for projection` 은 이미 있는 projection BDEF 를 BDEF projection extension(확장)으로 넓힙니다. projection BDEF 하나에 projection extension 을 여러 개 만들 수 있고, 개수 제한은 없습니다.

projection extension 에 넣을 수 있는 것은 세 가지입니다.

| 구성 요소 | 하는 일 |
| --- | --- |
| `extensible` | 이 extension 위에 다시 extension 을 얹는 것(extension 겹치기)을 허용합니다. ([[abenbdl_ext_enabl_ext_proj]]) |
| `define behavior for` | extension 노드의 projection 동작을 정의합니다. ([[abenbdl_proj_ext_entity]]) |
| `extend behavior for` | projection BDEF 에 이미 있는 entity(엔터티)의 동작을 넓힙니다. ([[abenbdl_extend_beh_proj]]) |

## 예제

원본 BO extension 이 루트에 action `holdTravel` 과 자식 노드 `TravelNote` 를 보탰다고 봅니다. projection extension 은 그것들을 projection `ZC_Travel` 에 내놓습니다.

```bdl
extension for projection;

// 이미 있는 projection entity 를 넓힌다
extend behavior for Travel
{
  use association _Note { create; }
  use action holdTravel;
}

// extension 노드의 projection 동작을 정의한다
define behavior for ZC_TravelNote alias TravelNote
{
  use update;
  use delete;
  use association _Travel;
  use action markDone;
}
```

## 알아두기

- projection extension 에는 behavior pool(동작 풀)을 지정하면 안 됩니다. `implementation in class ClassName unique` 문은 쓸 수 없습니다.
- projection BDEF 가 extension 을 허용해 두어야 projection extension 을 만들 수 있습니다. ([[abenbdl_ext_enabling_projection]] 참고)

## 관련 항목

- [[abenbdl_extensibility_projection]]
- [[abenbdl_extend_beh_proj]]
- [[abenbdl_proj_ext_entity]]
- [[abenbdl_proj_ext_body]]
- [[abenbdl_ext_enabl_ext_proj]]
- [[abenbdl_ext_enabling_projection]]
- [[abenbdl_entity_proj_ext_abexa]]
