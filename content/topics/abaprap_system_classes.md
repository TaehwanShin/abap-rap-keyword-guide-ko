---
title: RAP 관련 시스템 클래스와 기능
summary: RAP 구현에서 쓰는 시스템 클래스를 모은 갈래로, 지금 단계와 호출 상황을 알려 주는 CL_ABAP_BEHV_AUX 를 다룹니다.
keywords: RAP system classes, 시스템 클래스, CL_ABAP_BEHV_AUX, CL_ABAP_STRUCT_UTILITIES, FILLED_COMPONENTS_X, x LENGTH 1, %control, 채워진 구성요소
---

## 설명

RAP 동작을 구현할 때 도움이 되는 시스템 클래스를 모은 갈래입니다. 지금은 클래스 하나를 다룹니다.

- [[abaprap_cl_abap_behv_aux]] : handler method(핸들러 메서드)나 saver method(세이버 메서드) 안에서 "지금 어느 단계인가", "누가 어떤 길로 불렀는가" 같은 정보를 알아내는 클래스입니다.

## 알아두기

- 시스템 클래스 `CL_ABAP_STRUCT_UTILITIES` 의 `FILLED_COMPONENTS_X` 메서드도 알아 두면 좋습니다. 모든 구성요소가 `x LENGTH 1` 타입인 구조에서 초기값이 아닌 구성요소를 효율적으로 처리하게 도와줍니다. 구조로 된 BDEF derived type(BDEF 파생 타입)에서 채워진 구성요소를 확인할 때 특히 쓸모가 있습니다. `%control` 처럼 필드마다 표시 값을 하나씩 두는 구조가 여기에 해당합니다.

## 관련 항목

- [[abaprap_cl_abap_behv_aux]]
- [[abapderived_types_control]]
- [[abapset_names]]
