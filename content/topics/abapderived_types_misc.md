---
title: 그 밖의 구성요소
summary: 키·메시지 구성요소를 뺀 나머지 BDEF derived type 구성요소를 모은 갈래입니다. 필드 값, 필드 표시, 작업 표시, 허용 정보를 다룹니다.
keywords: BDEF 파생 타입, 구성요소, miscellaneous components, %action, %assoc, %chg, %control, %create, %data, %delete, %features, %field, %op, %param, %perm, %target, %update
---

## 설명

BDEF derived type(BDEF 파생 타입)에는 `%` 로 시작하는 구성요소가 여럿 들어 있습니다. 이 갈래는 그 가운데 키·식별자 구성요소와 메시지·실패 정보 구성요소에 들지 않는 나머지를 모아 둔 곳입니다.

쓰임새로 나누면 크게 네 가지입니다.

- **값을 담는 것** : 인스턴스의 필드 값, 연관 대상 인스턴스, action·function 의 매개변수와 결과를 담습니다.
- **필드를 표시하는 것** : 어떤 필드를 넘겼는지, 어떤 필드를 읽을지를 표시합니다.
- **작업을 표시하는 것** : 생성·수정·삭제, action, association 가운데 무엇을 묻거나 무엇이 문제였는지 표시합니다. feature control(기능 제어), 권한 확인, `GET PERMISSIONS` 문에서 주로 씁니다.
- **변경 종류를 알려 주는 것** : 한 트랜잭션 안에서 인스턴스가 만들어졌는지, 바뀌었는지, 지워졌는지 알려 줍니다.

표시용 구성요소에 넣는 값은 interface `IF_ABAP_BEHV` 의 상수로 정합니다. 상수 종류는 [[abapeml_derived_type_flags]] 에 정리되어 있습니다.

### 하위 항목

값을 담는 구성요소

- [[abapderived_types_data]] : entity(엔터티)의 키 필드와 데이터 필드를 모두 묶은 구성요소 묶음입니다.
- [[abapderived_types_target]] : association 으로 만들 대상(자식) 인스턴스를 담는 테이블입니다.
- [[abapderived_types_param]] : action·function 의 결과나 입력 매개변수를 담습니다.

필드를 표시하는 구성요소

- [[abapderived_types_control]] : 필드마다 넘긴 값인지, 읽을 필드인지 표시합니다.
- [[abapderived_types_field]] : field characteristics(필드 특성) 정보를 묻거나 받을 때 필드를 표시합니다.

작업을 표시하는 구성요소

- [[abapderived_types_create]] : 생성 작업 표시입니다.
- [[abapderived_types_update]] : 수정 작업 표시입니다.
- [[abapderived_types_delete]] : 삭제 작업 표시입니다.
- [[abapderived_types_action]] : BDEF 의 action 을 구성요소로 둔 구조입니다.
- [[abapderived_types_assoc]] : BDEF 의 association 을 구성요소로 둔 구조입니다.
- [[abapderived_types_op]] : 위 작업 표시들을 한 이름으로 묶은 구성요소 묶음입니다.
- [[abapderived_types_features]] : feature control 결과를 돌려줄 때 쓰는 구성요소 묶음입니다.
- [[abapderived_types_perm]] : `GET PERMISSIONS` 결과의 허용 정보를 한 이름으로 묶은 구성요소 묶음입니다.

변경 종류

- [[abapderived_types_chg]] : 트랜잭션 안에서 쌓인 변경이 생성·수정·삭제 가운데 무엇인지 알려 줍니다.

## 관련 항목

- [[abapderived_types_comp]]
- [[abapderived_types_keys_id]]
- [[abapderived_types_info]]
- [[abapeml_derived_type_flags]]
- [[abenderived_types_abexas]]
