---
title: action 예제 모음
summary: action 을 선언하고 구현한 뒤 EML 로 실행하는 과정을 보여 주는 예제 세 개(기본 action, 입력 매개변수가 있는 action, factory action)를 모았습니다.
keywords: action examples, 액션 예제, 예제 모음, action, parameter, factory action, 입력 매개변수, 팩토리 액션, EXECUTE
---

## 설명

action 을 다루는 실행 예제를 모아 둔 곳입니다. 세 예제 모두 흐름이 같습니다. behavior definition(동작 정의)에 action 을 선언하고, behavior pool(동작 풀)의 handler method(핸들러 메서드)에 처리 내용을 구현하고, 마지막으로 ABAP 클래스에서 EML 로 action 을 실행해 결과를 확인합니다.

문법 설명은 [[abenbdl_action]] 과 그 아래 항목에 있습니다. 여기서는 그 문법이 실제 코드에서 어떻게 이어지는지를 봅니다. 처음이라면 위에서부터 차례로 읽기를 권합니다. 뒤로 갈수록 다루는 내용이 하나씩 늘어납니다.

- [[abenbdl_action1_abexa]] : 가장 기본이 되는 instance action 입니다. 상태 필드를 바꾸고 바뀐 인스턴스를 결과로 돌려줍니다.
- [[abenbdl_action2_abexa]] : 입력 매개변수가 있는 action 입니다. abstract entity(엔터티)로 매개변수 타입을 정하고 `%param` 으로 값을 넘깁니다.
- [[abenbdl_action3_abexa]] : factory action 입니다. 인스턴스를 복사하는 action 과 기본값이 든 인스턴스를 만드는 static action 을 보여 줍니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_action_nonfactory]]
- [[abenbdl_action_factory]]
- [[abenbdl_action_input_param]]
