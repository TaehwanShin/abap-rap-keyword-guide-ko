---
title: CL_ABAP_BEHV_AUX 클래스
summary: 핸들러·saver method 안에서 지금의 RAP 트랜잭션 단계, 호출 상황, 메서드 종류, 특권 접근 여부 같은 정보를 알아내는 시스템 클래스입니다.
keywords: CL_ABAP_BEHV_AUX, GET_CURRENT_PHASE, GET_CURRENT_CONTEXT, GET_CURRENT_HANDLER_KIND, GET_CURRENT_CONTRACT, GET_PRIVILEGED_ACCESS_PROFILE, from_behavior, from_projection, from_interface, in_local_mode, for_permissions, privileged, 트랜잭션 단계, 호출 상황, 특권, ABP_BEHV_KIND
---

## 설명

`CL_ABAP_BEHV_AUX` 는 behavior implementation(동작 구현)이 "지금 내가 어떤 상황에서 돌고 있는가"를 알아낼 때 쓰는 클래스입니다. 메서드는 다섯 가지입니다.

| 메서드 | 알려 주는 것 |
| --- | --- |
| `GET_CURRENT_PHASE` | 지금의 RAP 트랜잭션 단계. interaction phase(상호작용 단계)인지, early save phase(이른 저장 단계)인지, late save phase(늦은 저장 단계)인지 등 |
| `GET_CURRENT_CONTEXT` | 지금 도는 핸들러·saver method(세이버 메서드)의 호출 상황 |
| `GET_CURRENT_HANDLER_KIND` | 메서드의 종류. 값은 도메인 `ABP_BEHV_KIND` 에서 볼 수 있습니다. |
| `GET_CURRENT_CONTRACT` | 지금의 RAP 계약 |
| `GET_PRIVILEGED_ACCESS_PROFILE` | 특권(privileged) 접근 상황. 저장 단계에서만 쓸 수 있습니다. |

### GET_CURRENT_CONTEXT

호출 상황을 여러 매개변수로 나눠 돌려줍니다. 매개변수는 `from_behavior`, `from_projection`, `from_interface`, `in_local_mode`, `draft_activate`, `for_permissions`, `privileged`, `call_kind` 입니다.

- `from_projection`, `from_interface` : 요청이 projection 이나 RAP BO interface 를 거쳐 왔으면 그 이름이 채워집니다.
- `from_behavior` : 호출 스택에서 지금 RAP BO 바로 아래에 활성화되어 있는 RAP BO 의 이름입니다. 그런 BO 가 없으면(예: UI 에서 바로 온 요청) 비어 있습니다. 서로 의존하는 RAP BO 사이에서, 부른 BO 에 따라 불린 BO 가 다르게 동작해야 할 때 주로 씁니다.
- `for_permissions` : EML 수정 요청을 처리하는 중에 권한 확인이나 feature control(기능 제어)를 두 번 하지 않도록 피하는 데 씁니다.
- `privileged` : 핸들러가 privileged mode 로 돌고 있는지 알려 줍니다.

이 정보는 이럴 때 쓸모가 있습니다.

- interface behavior definition(동작 정의)로 들어온 요청은 기반 RAP BO 의 요청으로 바로 mapping 됩니다. base BO(기반 BO) 의 구현이 "RAP BO interface 를 거쳐 불렸다"는 사실을 알아야 할 때가 있습니다. 예를 들어 특정 interface 로 들어온 경우에만 몇몇 필드를 동적으로 readonly 로 만드는 로직을 base BO 의 behavior pool(동작 풀)에 넣는 경우입니다. 이때 interface 이름을 이 클래스로 알아냅니다.
- 마찬가지로 base BO 가 projection extension(확장) entity(엔터티)에서 불렸는지 알고 싶을 때도 씁니다.

### GET_PRIVILEGED_ACCESS_PROFILE

RAP 계약을 지키려면 저장 단계에서 다음 두 상황을 구분해야 합니다.

- 수정 단계의 EML 수정 접근이 **모두 특권 접근**이었다면, early save phase 에서도 특권 authorization context 가 자동으로 켜져 있습니다. behavior definition 에 적은 내용에 따라 early save phase 용 비활성 컨텍스트가 더해질 수도 있습니다.
- EML 수정 접근 가운데 **하나라도 특권 접근이 아니었다면**, early save phase 에서 권한 확인을 구현해도 됩니다. RAP 계약 위반이 아닙니다.

early save phase 에서 이 메서드를 불러 앞선 수정 접근이 특권 접근이었는지 알아보고 그에 맞게 처리하면 됩니다. 예를 들어 메서드가 `only_privileged` 를 돌려주면(`CL_ABAP_BEHV_AUX=>T_PRIVILEGED_ACCESS` 참고), 특권 컨텍스트가 꺼 주지 않는 권한 객체로 하려던 `AUTHORITY-CHECK` 를 이 시점에는 건너뛸 수 있습니다.

## 예제

interaction phase 에서 도는 action 핸들러 안에서 호출 상황을 알아냅니다. 필요한 매개변수만 받아도 됩니다.

```abap
METHOD accepttravel.
  " 지금 요청이 어떤 길로 들어왔는지 알아본다
  cl_abap_behv_aux=>get_current_context(
    IMPORTING
      from_projection = DATA(lv_from_projection)
      from_interface  = DATA(lv_from_interface)
      in_local_mode   = DATA(lv_local_mode)
      privileged      = DATA(lv_privileged) ).

  " 지금이 어느 단계인지도 알아본다
  DATA(lv_phase) = cl_abap_behv_aux=>get_current_phase( ).

  IF lv_from_interface IS NOT INITIAL.
    " RAP BO interface 를 거쳐 들어온 요청일 때만 할 일
  ENDIF.
ENDMETHOD.
```

## 알아두기

- early save phase 와 late save phase 에서는 `GET_CURRENT_CONTEXT` 의 결과 가운데 `from_projection` 말고 다른 값을 따져 보는 것은 의미가 없습니다.
- `GET_PRIVILEGED_ACCESS_PROFILE` 은 저장 단계에서만 쓸 수 있습니다.
- SAP 예제 클래스 `CL_DEMO_RAP_FROM_BEHAVIOR_PAR` 는 `from_behavior` 값을 보여 줍니다. RAP BO 두 개가 function 을 하나씩 정의하고, 그 function 안에서 `READ ENTITIES` 로 자기 BO 와 상대 BO 의 function 을 실행합니다. 구현에서 `from_behavior` 값을 읽기 결과에 실어 돌려주므로, 값이 언제 비어 있고 언제 아래쪽 RAP BO 이름으로 채워지는지 볼 수 있습니다.

## 관련 항목

- [[abenrap_cl_abap_behv_aux_abexa]]
- [[abenrap_cl_abap_behv_aux_ph_abexa]]
- [[abeneml_privileged_abexa]]
- [[abapeml_privileged]]
- [[abenbdl_authorization_context]]
- [[abaprap_system_classes]]
