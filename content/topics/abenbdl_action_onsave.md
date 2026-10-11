---
title: save action
summary: save sequence 의 정해진 saver method 동안에만 부를 수 있는 action 을 선언하는 문법이며, interaction phase 에서 부르면 런타임 오류가 납니다.
keywords: save action, save(finalize), save(adjustnumbers), 저장 액션, 저장 순서, finalize, adjust_numbers, 세이버 메서드, determination on save, 런타임 오류
---

## 문법

```syntax
[internal][static][factory]
  save(finalize|adjustnumbers|finalize, adjustnumbers) action
                  [(
                  [features: global]
                  [precheck]
                  [authorization:none]
                  [authorization:global]
                  [authorization:instance]
                   )]
                   ActionName [external 'ExternalName']
                  [InputParameter]
                  [OutputParameter];
                  [{default function GetDefaultsForActName [external 'GetDefaultsForExtName'];}]
```

## 설명

save action 은 **save sequence(저장 순서) 안의 정해진 saver method(세이버 메서드) 동안에만** 부를 수 있는 action 입니다. interaction phase(상호작용 단계)에서 부르면 런타임 오류가 납니다.

save action 은 `save` 로 알아봅니다. 어느 saver method 동안 부를 수 있는지를 괄호 안에 적습니다. `finalize`, `adjustnumbers`, 또는 둘 다 적을 수 있습니다.

[[abenbdl_action_nonfactory|non-factory action]] 도, [[abenbdl_action_factory|factory action]](인스턴스에 묶인 것과 정적인 것 모두)도 save action 으로 만들 수 있습니다. 다만 **default factory action 은 save action 이 될 수 없습니다.** 문법 규칙은 action 종류(일반, static factory, instance factory)에 맞는 것을 그대로 따릅니다.

### 붙일 수 있는 추가 구문

| 추가 구문 | 뜻 |
| --- | --- |
| [[abenbdl_internal|internal]] | BO 구현 안에서만 부를 수 있게 합니다. |
| [[abenbdl_actions_fc|features:global]] | global feature control(기능 제어)입니다. BO 바깥의 조건에 따라 action 을 켜고 끕니다. |
| [[abenbdl_precheck|precheck]] | 원하지 않는 변경이 transactional buffer(트랜잭션 버퍼)에 닿기 전에 막습니다. |
| [[abenbdl_actions_auth|authorization:none]] | 이 action 을 [[abenbdl_authorization|권한 확인]]에서 뺍니다. |
| [[abenbdl_actions_auth_global|authorization:global]] | authorization master entity(엔터티)에 정한 authorization control(권한 제어) 대신 global 권한 확인을 적용합니다. |
| [[abenbdl_actions_auth_instance|authorization:instance]] | authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 적용합니다. |
| [[abenbdl_action_input_param|InputParameter]], [[abenbdl_action_output_para|OutputParameter]] | 입력·출력 매개변수를 붙입니다. 선택입니다. |
| [[abenbdl_default_function|default function]] | action 의 default values function 을 정합니다. 입력 매개변수의 값을 미리 채우는 데 씁니다. 그래서 action 에 입력 매개변수가 있어야 합니다. |

### 부를 수 있는 곳

- 바깥의 RAP BO consumer(사용자)가 부를 수 있습니다.
- behavior pool(동작 풀)의 saver method [[abensaver_finalize|finalize]] 나 [[abensaver_adjust_numbers|adjust_numbers]] 에서 부를 수 있습니다. 괄호 안에 적은 메서드에서만 됩니다.
- `save(finalize)` action 은 `on save` determination 의 구현에서 부를 수 있습니다.

### 부르면 안 되는 곳

| 부르는 곳 | 결과 |
| --- | --- |
| 괄호에 적지 않은 saver method. 예를 들어 `save(finalize)` action 을 `adjust_numbers` 에서 부르는 경우 | 문법 오류 |
| `on modify` determination 의 구현 | 런타임 오류 |
| 그 밖의 다른 handler method(핸들러 메서드)의 구현 | 런타임 오류 |
| `on save` determination 에서 `save(adjustnumbers)` action 을 부르는 경우 | 런타임 오류 |
| 같은 saver method 용 save action 끼리 부르는 경우. 예를 들어 `save(adjustnumbers)` action 이 다른 `save(adjustnumbers)` action 을 부르는 경우 | 런타임 오류 |

`on save` determination 에는 함정이 하나 더 있습니다. `on save` determination 이 determine action 의 한 부분으로 실행되면, 그 실행은 **interaction phase** 에서 일어납니다. 그래서 `on save` determination 안에서 save action 을 부르는데 그 determination 이 determine action 으로 실행되면 런타임 오류가 납니다.

### 쓸 수 있는 곳

- managed RAP BO, unmanaged RAP BO
- projection BO 와 RAP BO interface 에서는 base BDEF(기반 BDEF) 의 save action 을 다시 쓸 수 있습니다([[abenbdl_use_projection]]).

## 예제

unmanaged BDEF 에 save action 네 개를 선언합니다. non-factory, static, instance factory, static factory 가 하나씩입니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
late numbering
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  field ( readonly ) TravelID;

  // finalize 동안에만 부를 수 있는 non-factory action
  save ( finalize ) action writeLog;

  // adjust_numbers 동안에만 부를 수 있는 static action
  static save ( adjustnumbers ) action reserveNumbers;

  // 두 메서드 어디서든 부를 수 있는 factory action
  factory save ( finalize, adjustnumbers ) action copyOnSave [1];
  static factory save ( finalize, adjustnumbers ) action createOnSave [1];
}
```

바깥의 EML consumer 는 `save ( finalize )` action 을 이렇게 부를 수 있습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE writelog
      FROM VALUE #( ( %key-travelid = '00000001' ) ).

COMMIT ENTITIES.
```

원문은 interaction phase 에서 save action 을 부르면 런타임 오류가 난다고 설명합니다. 그러면서도 바깥 EML consumer 가 위와 같이 부르는 코드를 올바른 호출로 싣습니다. 두 설명이 어떻게 함께 맞는지는 원문에 나와 있지 않습니다.

다른 BO 의 `on save` determination 구현에서도 같은 action 을 부를 수 있습니다.

```abap
METHOD det_on_save.
  " 다른 BO 의 on save determination 에서 Travel 의 save(finalize) action 을 부른다
  MODIFY ENTITIES OF zr_travel
    ENTITY travel
      EXECUTE writelog
        FROM VALUE #( ( %key-travelid = '00000001' ) )
    FAILED DATA(ls_failed).
ENDMETHOD.
```

## 알아두기

- saver method 를 적지 않은 save action 은 옛 문법입니다. `save action MySaveAction` 은 이제 올바른 문법이 아닙니다. 괄호 없이 선언되어 있던 기존 save action 은 자동으로 `save(finalize)` 로 풀이됩니다.
- save action 은 transactional buffer 를 두지 않고 (RAP 에서 보면) 저장 단계만 있는 기존 기능을 RAP 로 나타낼 때 필요합니다.
- non-factory action 과 견주면 문법 틀에 `features: instance`, `authorization:update`, `lock:none` 이 없습니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_factory]]
- [[abensaver_finalize]]
- [[abensaver_adjust_numbers]]
- [[abenbdl_determinations]]
- [[abenbdl_determine_action]]
