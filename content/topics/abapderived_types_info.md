---
title: 정보 처리에 쓰는 구성요소
summary: BDEF derived type 에서 실패 원인과 메시지를 전달하는 %fail, %msg, %element, %global 같은 구성요소를 모아 둔 갈래입니다.
keywords: %element, %fail, %foreign, %global, %msg, %other, %own, %path, %state_area, 메시지 처리, 실패 원인, REPORTED, FAILED, 정보 처리 구성요소
---

## 설명

RAP BO provider(제공자)는 작업이 왜 실패했는지, 사용자에게 어떤 메시지를 보여 줄지를 response parameter(응답 매개변수) `failed` 와 `reported` 에 담아 돌려줍니다. 이 갈래는 그 응답에 들어 있는 `%` 구성요소를 하나씩 설명합니다.

여기 있는 구성요소 가운데 여럿은 **메시지 처리**와 관계가 있습니다. 메시지에 대한 자세한 내용은 ABAP RESTful Application Programming Model 개발 안내서의 Messages 절에 나옵니다.

## 하위 항목

- [[abapderived_types_element]] : 메시지가 어느 필드나 association 에 대한 것인지 표시합니다.
- [[abapderived_types_fail]] : 인스턴스가 실패한 원인을 담습니다.
- [[abapderived_types_foreign]] : behavior definition(동작 정의)에 적은 외부 entity(엔터티)의 메시지를 묶어 담습니다.
- [[abapderived_types_global]] : 메시지가 global feature control(기능 제어)나 global 권한에 대한 것임을 표시합니다.
- [[abapderived_types_msg]] : 메시지 객체를 담습니다.
- [[abapderived_types_other]] : 특정 entity 에 딸리지 않은 메시지를 담습니다.
- [[abapderived_types_own]] : behavior definition 에 있는 자기 BO 의 entity 를 모두 묶은 구성요소 묶음입니다.
- [[abapderived_types_path]] : child entity(자식 엔터티)의 메시지를 parent entity(부모 엔터티)에 이어 줍니다.
- [[abapderived_types_state_area]] : 값을 채우면 그 메시지가 상태 메시지로 다뤄집니다.

## 관련 항목

- [[abapderived_types_comp]]
- [[abapderived_types_keys_id]]
- [[abapderived_types_misc]]
- [[abaptype_response_for]]
- [[abenderived_types_reported_abexa]]
