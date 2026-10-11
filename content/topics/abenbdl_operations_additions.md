---
title: RAP BO 작업의 추가 구문
summary: standard operation, action, function 같은 RAP BO 작업에 덧붙여 권한, feature control, 잠금, 공개 범위, 매개변수를 정하는 추가 구문을 모은 갈래입니다.
keywords: operation additions, 추가 구문, authorization:none, authorization:update, authorization:global, authorization:instance, external, features, internal, lock:none, static, precheck, parameter, result, default function
---

## 설명

[[abenbdl_operations|RAP BO 작업]]을 선언할 때 작업 이름 앞뒤나 괄호 안에 붙이는 말들입니다. 작업이 "무엇을 하는가"가 아니라 "어떤 조건에서, 누가, 어떤 값으로 부를 수 있는가"를 정합니다.

크게 네 묶음으로 볼 수 있습니다. 권한 확인 방식을 바꾸는 `authorization:...` 네 가지, 작업을 켜고 끄거나 미리 점검하거나 잠금을 빼는 `features`, `precheck`, `lock:none`, 누가 어떻게 부르는지를 정하는 `internal`, `static`, `external`, 그리고 주고받는 값을 정하는 입력·출력 매개변수와 default values function 입니다.

모든 추가 구문을 모든 작업에 쓸 수 있는 것은 아닙니다. 어느 작업에 붙일 수 있는지는 각 항목과, 작업마다의 문법 틀에 적혀 있습니다.

## 예제

action 하나에 여러 추가 구문을 함께 붙인 모습입니다.

```bdl
// feature control + precheck + global 권한 확인, 바깥 이름과 입력·출력 매개변수
action ( features : instance, precheck, authorization : global )
  deductDiscount external 'DeductDiscountFromTotalPrice'
  parameter ZA_Discount
  result [1] $self;

// BO 안에서만 부르는 static action
internal static action recalcAllPrices;
```

## 관련 항목

- [[abenbdl_actions_auth]] : 작업을 권한 확인에서 뺍니다.
- [[abenbdl_actions_auth_update]] : 권한 확인을 수정(update) 작업의 권한 확인에 맡깁니다.
- [[abenbdl_actions_auth_global]] : authorization master 에 정한 방식 대신 global 권한 확인을 씁니다.
- [[abenbdl_actions_auth_instance]] : authorization master 에 정한 방식 대신 instance 권한 확인을 씁니다.
- [[abenbdl_external]] : OData 에 보일 바깥 이름을 따로 붙입니다.
- [[abenbdl_actions_fc]] : 조건에 따라 작업을 켜고 끄는 feature control(기능 제어)를 겁니다.
- [[abenbdl_internal]] : behavior pool(동작 풀) 안에서만 부를 수 있게 합니다.
- [[abenbdl_lock_none]] : action 을 실행할 때 인스턴스를 잠그지 않습니다.
- [[abenbdl_static]] : 특정 인스턴스에 묶이지 않는 작업으로 만듭니다.
- [[abenbdl_precheck]] : 변경 요청이 transactional buffer(트랜잭션 버퍼)에 닿기 전에 미리 점검합니다.
- [[abenbdl_action_input_param]] : action 과 function 의 입력 매개변수를 정합니다.
- [[abenbdl_action_output_para]] : action 과 function 의 출력 매개변수(`result`)를 정합니다.
- [[abenbdl_default_function]] : 화면에서 값을 미리 채워 주는 default values function 을 붙입니다.
