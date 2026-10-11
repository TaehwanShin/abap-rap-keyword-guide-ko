---
title: COMMIT ENTITIES ... IN SIMULATION MODE (모의 저장)
summary: 실제로 저장하지 않고 save sequence 의 앞 단계만 돌려, RAP 트랜잭션을 저장해도 되는지 sy-subrc 로 미리 확인하는 추가 구문입니다.
keywords: IN SIMULATION MODE, COMMIT ENTITIES, 시뮬레이션 모드, 모의 저장, 저장 점검, 일관성 확인, COMMIT WORK, SAP LUW, sy-subrc, early save phase
---

## 문법

```syntax
COMMIT ENTITIES ... IN SIMULATION MODE ...
```

## 설명

`IN SIMULATION MODE` 는 `COMMIT ENTITIES` 문에 붙이는 선택 추가 구문입니다. RAP 트랜잭션을 **점검만** 합니다.

- save sequence(저장 순서)의 앞 단계만 처리합니다. 데이터는 실제로 저장하지 않습니다.
- 마지막의 `COMMIT WORK` 가 저절로 실행되지 않습니다.
- 점검 결과는 문을 실행한 뒤의 `sy-subrc` 로 알 수 있습니다. 0 이면 문제가 없고, 0 이 아니면 문제가 있습니다.

### 언제 쓰나

RAP 가 아닌 기존 프로그램과 RAP BO 가 **한 SAP LUW 안에서 함께 저장**되어야 할 때 씁니다. 상황을 풀어 쓰면 이렇습니다.

1. RAP 가 아닌 프로그램이 데이터를 바꿉니다. 이 프로그램에는 자기만의 저장 로직이 있고, SAP LUW 를 끝내는 `COMMIT WORK` 도 이 프로그램이 책임집니다.
2. 기능을 더하거나 구조를 바꾸면서, 그 `COMMIT WORK` 전에 RAP 구현이 같은 LUW 에 끼어들게 되었습니다. 이제 LUW 전체가 어긋남 없이 저장되어야 합니다.
3. 여기서 보통의 `COMMIT ENTITIES` 를 쓰면 RAP BO 는 save sequence 를 끝까지 돌아 실제로 저장됩니다. 그 뒤 `COMMIT WORK` 가 다 처리되지 못하면 RAP BO 만 저장된 어긋난 상태가 됩니다.
4. 거꾸로 RAP 가 아닌 쪽을 먼저 저장했는데 RAP BO 가 문제 때문에 저장되지 못해도 어긋납니다. 관련된 데이터를 모두 한꺼번에 점검할 방법이 없습니다.

`IN SIMULATION MODE` 는 이 틈을 메웁니다. RAP BO 의 저장을 흉내 내어 문제가 생기는지 먼저 확인합니다.

- `sy-subrc` 가 0 이면 RAP BO 저장에 문제가 없습니다. RAP 가 아닌 프로그램이 `COMMIT WORK` 를 실행해 LUW 안의 모든 부분(RAP 와 RAP 아닌 것)을 저장합니다.
- `sy-subrc` 가 0 이 아니면 문제가 있습니다. 프로그램이 이를 보고 LUW 끝의 `COMMIT WORK` 를 하지 않도록 대응합니다.

## 예제

기존 로직과 여행 BO 변경이 한 LUW 에 섞여 있을 때, 먼저 모의 저장으로 확인한 뒤 `COMMIT WORK` 를 실행합니다.

```abap
" (앞에서 RAP 가 아닌 로직이 자기 데이터를 바꾸었고,
"  같은 LUW 안에서 EML 로 여행도 바꾸었다)

COMMIT ENTITIES IN SIMULATION MODE
  RESPONSE OF zr_travel
    FAILED   DATA(ls_failed)
    REPORTED DATA(ls_reported).

IF sy-subrc = 0.
  " RAP BO 저장에 문제가 없다. LUW 전체를 한꺼번에 저장한다
  COMMIT WORK.
ELSE.
  " 문제가 있다. COMMIT WORK 를 하지 않고 오류를 처리한다
ENDIF.
```

## 알아두기

- 이 추가 구문은 `COMMIT ENTITIES` 의 모든 형식(짧은 형식, 긴 형식, 동적 형식, `BEGIN ... END`)에 붙일 수 있습니다.
- 문 전체에 해당하는 주의점은 [[abapcommit_entities]] 에 있습니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapemlcommit_entities_short]]
- [[abapemlcommit_entities_long]]
- [[abapemlcommit_entities_dyn]]
- [[abapemlcommit_entities_late]]
