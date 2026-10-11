---
title: COMMIT ENTITIES 예제 모음
summary: COMMIT ENTITIES 의 짧은 형식과 긴 형식, 동적 형식, BEGIN ... END 와 CONVERT KEY OF 를 보여 주는 실행 예제 세 가지를 모았습니다.
keywords: COMMIT ENTITIES, 예제, 예제 모음, RESPONSE OF, RESPONSES OF, COMMIT ENTITIES BEGIN, COMMIT ENTITIES END, CONVERT KEY OF, 저장, 커밋
---

## 설명

`COMMIT ENTITIES` 문을 실제로 돌려 보는 예제를 모은 갈래입니다. 세 예제 모두 ABAP 클래스에서 EML 로 RAP BO 를 변경한 뒤 저장을 시작하는 RAP BO consumer(사용자) 쪽 코드입니다. 형식마다 응답을 받는 방법과 응답의 타입이 어떻게 다른지 견주어 볼 수 있습니다.

앞의 두 예제는 저장 때 실행되는 validation 을 일부러 실패하게 만들어, 하나라도 잘못되면 아무것도 저장되지 않는다는 점과 `FAILED`, `REPORTED` 응답이 채워지는 모습을 보여 줍니다. 세 번째 예제는 late numbering 에서 최종 키를 알아내는 흐름을 다룹니다.

### 하위 항목

- [[abencommit_entities_sh_lo_abexa]] : 응답 없이 저장하는 짧은 형식과, root entity(루트 엔터티)별로 응답을 받는 긴 형식을 나란히 보여 줍니다.
- [[abeneml_commit_dyn_abexa]] : 응답을 받을 root entity 를 내부 테이블로 넘기는 동적 형식을 보여 줍니다.
- [[abencommit_entities_beginend_abexa]] : late numbering 을 쓰는 unmanaged BO 에서 `COMMIT ENTITIES BEGIN ... END` 와 `CONVERT KEY OF` 로 최종 키를 얻습니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapemlcommit_entities_short]]
- [[abapemlcommit_entities_long]]
- [[abapemlcommit_entities_dyn]]
- [[abapemlcommit_entities_late]]
