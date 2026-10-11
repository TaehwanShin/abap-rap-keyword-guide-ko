---
title: entity 동작 extension (extend behavior for)
summary: BDEF extension 에서 이미 있는 entity 의 동작을 넓히는 구문으로, extension behavior pool 과 additional save(with additional save)도 entity 단위로 정할 수 있습니다.
keywords: extend behavior for, EntityBehaviorExtension, 엔터티 동작 확장, with additional save, with full data, 추가 저장, save_modified, group, implementation in class unique, 확장 본문
---

## 문법

```syntax
extend behavior for EntityName
[implementation in class ClassName unique]
[with additional save [with full data]]
{
    ExtensionBody
  |[group]
}
...
```

## 설명

`extend behavior for` 는 이미 있는 RAP BO entity(엔터티)의 동작을 넓힙니다. 중괄호 안에 새 요소를 보태거나 기존 요소를 확장하는 내용을 적습니다.

| 구문 | 하는 일 |
| --- | --- |
| `implementation in class ClassName unique` | 이 entity 의 extension(확장) 동작을 구현할 behavior pool(동작 풀)을 정합니다. |
| `with additional save [with full data]` | 기본 save sequence(저장 순서)에 추가 단계를 끼워 넣습니다. |
| `ExtensionBody` | entity 동작 본문을 확장합니다. ([[abenbdl_entity_beh_extension]]) |
| `group` | 구현이 필요한 부분을 여러 그룹으로 나누고 그룹마다 구현 클래스를 따로 둡니다. ([[abenbdl_group_extension]]) |

### with additional save

extension 쪽 동작을 저장할 때 직접 만든 처리를 덧붙입니다.

- **전제 조건**: 확장되는 BDEF 가 additional save 가 있는 extension 을 명시적으로 허용해야 합니다. ([[abenbdl_extensibility_enabling_m_u]] 참고)
- **managed 전용**: base BO(기반 BO) 의 구현 타입이 managed 일 때만 쓸 수 있습니다. unmanaged RAP BO 는 지금 지원하지 않습니다.
- **원본 설정과 무관**: 원본 BO 가 정한 저장 방식은 extension 의 additional save 에 영향을 주지 않습니다. 원본 BO 는 additional save 를 쓰든, unmanaged save 를 쓰든, 기본 save sequence 를 쓰든 상관없습니다. 원본의 저장 방식은 원본 동작에, extension 의 additional save 는 extension 동작에 적용됩니다.
- **적는 자리**: extension 에서는 entity 마다 entity 동작 특성 자리에 적습니다. 원본 BDEF 처럼 머리말에 적을 수는 없습니다.
- **구현 위치**: extension behavior pool 에 있는 saver class(세이버 클래스)의 `save_modified` 메서드에 구현합니다. 이 메서드의 매개변수 타입은 additional save 를 켠 **그 BDEF extension** 에 맞춰 정해집니다. behavior pool 은 RAP BO 전체가 아니라 자기가 속한 BDEF 의 요소만 반영합니다. extension behavior pool 규칙([[abenbdl_in_class_unique_ext]])도 그대로 적용됩니다.
- 그 밖의 동작은 원본 BO 의 additional save 와 같습니다. ([[abenbdl_saving]] 참고)

### with full data

extension 은 여러 개 있을 수 있고 모두 additional save 를 지정할 수 있습니다. 하지만 `with full data` 는 그 가운데 하나만 지정할 수 있습니다. 원본 BO 든 어느 extension 이든 한 곳에서 `with full data` 를 지정하면, additional save 를 구현한 모든 곳에 적용됩니다. `save_modified` 가 불릴 때마다 인스턴스 전체 데이터가 넘어옵니다. `with full data` 를 적지 않은 extension 도 마찬가지입니다.

## 예제

root entity(루트 엔터티)에 business event `TravelCreatedExt` 를 보태고, event 를 일으킬 수 있도록 additional save 를 켭니다.

```bdl
extension implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
  with additional save
{
  event TravelCreatedExt;
}
```

extension behavior pool 의 saver class 에서 `save_modified` 를 다시 정의합니다.

```abap
CLASS lsc_travel DEFINITION INHERITING FROM cl_abap_behavior_saver.
  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_travel IMPLEMENTATION.
  METHOD save_modified.
    " 새로 만든 여행마다 extension event 를 일으킨다
    IF create-travel IS NOT INITIAL.
      RAISE ENTITY EVENT zr_travel~travelcreatedext
        FROM VALUE #( FOR ls_travel IN create-travel
                      ( travelid = ls_travel-travelid ) ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

## 알아두기

- extension BDEF 의 머리말에는 `with additional save` 를 적을 수 없습니다. entity 마다 따로 적습니다.
- unmanaged RAP BO 를 확장할 때는 `with additional save` 를 쓸 수 없습니다.
- `with full data` 는 원본과 모든 extension 을 통틀어 영향을 줍니다. 한 extension 이 켜면 다른 extension 의 `save_modified` 에도 전체 데이터가 넘어옵니다.

## 관련 항목

- [[abenbdl_entity_beh_extension]]
- [[abenbdl_group_extension]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_saving]]
- [[abaprap_saver_meth_save_modified]]
- [[abenabp_saver_class]]
- [[abenbdl_extensibility_enabling_m_u]]
- [[abenbdl_define_beh_extend]]
