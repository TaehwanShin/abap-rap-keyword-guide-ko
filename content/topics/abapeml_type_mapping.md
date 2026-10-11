---
title: RAP type mapping
summary: BDEF derived type 과 기존(레거시) 타입 사이에서 필드 값과 %control 정보를 옮겨 주는 ABAP 문법 네 가지를 모은 개요입니다.
keywords: type mapping, 타입 매핑, CORRESPONDING, MAPPING FROM ENTITY, MAPPING TO ENTITY, USING CONTROL, CHANGING CONTROL, SET FLAGS, SET NAMES, %control, %element, 레거시 타입, legacy type
---

## 설명

RAP BO provider(제공자)와 consumer(사용자)는 BDEF derived type(BDEF 파생 타입, behavior definition 에서 자동으로 만들어지는 타입)으로 데이터를 주고받습니다. 그런데 실제 처리 로직은 예전부터 쓰던 타입으로 짜여 있는 일이 많습니다. 필드 이름이 entity(엔터티)와 다르기도 하고, "어느 필드가 채워졌는가"를 나타내는 정보(`%control`)를 다른 모양으로 들고 있기도 합니다.

type mapping 은 이 두 쪽을 이어 주는 문법입니다. 필드 이름이 다를 때는 behavior definition 에 [[abenbdl_type_mapping|mapping for]] 로 짝을 적어 두고, ABAP 에서는 아래 문법으로 값을 옮깁니다. 필드마다 대입문을 따로 쓰지 않아도 되니 코드가 줄고 실수도 줄어듭니다.

이 갈래의 항목은 다음과 같습니다.

- [[abapeml_corresponding]] : `CORRESPONDING` 연산자의 RAP 전용 변형입니다. 구조나 내부 테이블을 통째로 옮기면서 필드 이름 mapping 과 `%control` 을 함께 처리합니다.
- [[abapmapping_from_entity]] : `INSERT`, `MODIFY`, `UPDATE`, `DELETE` 같은 ABAP SQL 문에 `MAPPING FROM ENTITY` 를 붙여 BDEF derived type 데이터를 바로 DB 테이블에 씁니다.
- [[abapset_flags]] : 필드 이름 목록을 `%control` 이나 `%element` 의 표시 값으로 바꿉니다.
- [[abapset_names]] : 반대로 `%control` 이나 `%element` 에 표시된 필드를 이름 목록으로 뽑아냅니다.

## 관련 항목

- [[abenbdl_type_mapping]]
- [[abapderived_types_control]]
- [[abeneml_type_mapping_abexa]]
