---
title: GET PERMISSIONS 예제 모음
summary: GET PERMISSIONS 의 짧은 형식과 긴 형식, 동적 형식, only_clause 의 모든 갈래를 보여 주는 실행 예제 세 가지를 모았습니다.
keywords: GET PERMISSIONS, 예제, 예제 모음, 짧은 형식, 긴 형식, 동적 형식, only_clause, ONLY INSTANCE FEATURES, 허용 여부, 권한, 기능 제어
---

## 설명

`GET PERMISSIONS` 문을 실제로 돌려 보는 예제를 모은 갈래입니다. 세 예제는 같은 managed RAP BO 를 씁니다. root entity(루트 엔터티) 하나와 child entity(자식 엔터티) 하나가 있고, behavior definition(동작 정의)에 global 권한과 instance 권한, global feature control(기능 제어)와 instance feature control, static feature control 이 골고루 들어 있습니다.

앞의 두 예제는 `ONLY INSTANCE FEATURES` 로 instance feature control 만 물으면서 문의 형식이 어떻게 다른지 보여 줍니다. 세 번째 예제는 형식은 그대로 두고 `only_clause` 를 바꿔 가며 결과가 어떻게 달라지는지 보여 줍니다. 결과의 `instances` 테이블과 `global` 구조에 어떤 값이 들어오는지 읽는 연습을 하기에 좋습니다.

### 하위 항목

- [[abenget_perm_forms_abexa]] : entity(엔터티) 하나에 묻는 짧은 형식과, 루트와 자식에 한꺼번에 묻는 긴 형식을 보여 줍니다.
- [[abenget_perm_dyn_form_abexa]] : 질의를 내부 테이블에 담아 실행하는 동적 형식을 보여 줍니다.
- [[abenget_perm_only_abexa]] : `ONLY GLOBAL` 부터 `ONLY (dyn_spec)` 까지 `only_clause` 의 모든 갈래를 차례로 실행합니다.

## 관련 항목

- [[abapget_permissions]]
- [[abapget_permissions_short]]
- [[abapget_permissions_long]]
- [[abapget_permissions_dyn]]
- [[abapget_permissions_only_clause]]
- [[abapget_permissions_rules]]
