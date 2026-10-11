---
title: handler method 와 saver method 안의 제약
summary: handler method 와 saver method 종류별로 어떤 EML 요청, 잠금, 권한 확인, 데이터베이스 작업, 커밋을 쓸 수 있고 없는지 정리한 표입니다.
keywords: 제약, restrictions, 핸들러 메서드, 세이버 메서드, 쓸 수 없는 문, invalid statements, COMMIT WORK, ROLLBACK WORK, SET LOCKS, GET PERMISSIONS, CONVERT KEY, IF_ABAP_TX_SURFACE, IF_ABAP_TX_FUNCTIONAL, IF_ABAP_TX_READ, IF_ABAP_TX_MODIFY, IF_ABAP_TX_SAVE, update task, 데이터베이스 커밋
---

## 설명

handler method(핸들러 메서드)와 saver method(세이버 메서드) 안에서는 아무 문이나 쓸 수 없습니다. 메서드가 interaction phase(상호작용 단계)와 save sequence(저장 순서)의 어느 지점에서 불리느냐에 따라, 해도 되는 작업과 하면 안 되는 작업이 정해져 있습니다. 아래 두 표가 그 내용입니다.

표에서 ○ 는 쓸 수 있다는 뜻이고, – 는 쓸 수 없다는 뜻입니다.

### handler method

열은 handler method 가 맡은 일입니다. "augmentation"은 [[abenbdl_augment_projection|augmentation 구현]]을 가리킵니다.

| 작업 | augmentation | feature control(기능 제어) | precheck | authorization control(권한 제어) | 잠금 | 읽기 | 생성·수정·삭제 | determination `ON MODIFY` | determination `ON SAVE` | validation `ON SAVE` | function | action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| event 를 일으키는 EML 요청 | – | – | – | – | – | – | – | – | – | – | – | – |
| EML 읽기 요청 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| EML `GET PERMISSIONS` | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| EML 수정 요청 | ○ (`AUGMENTING` 을 붙인 것만) | – | – | – | – | – | ○ | ○ | ○ | – | – | ○ |
| EML [[abapconvert_key|키 변환]] | – | – | – | – | – | – | – | – | – | – | – | – |
| EML `SET LOCKS` | – | – | – | – | ○ | – | ○ | ○ | ○ | – | – | ○ |
| Enqueue 잠금 | – | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| 권한 확인 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | – | – | ○ | ○ |
| update task 용, 백그라운드 처리용 function module 호출 | – | – | – | – | – | – | – | – | – | – | – | – |
| 표준 연결로 데이터베이스 수정 | – | – | – | – | – | – | – | – | – | – | – | – |
| ABAP SQL `SELECT` 문 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `COMMIT [WORK \| ENTITIES]`, `ROLLBACK [WORK \| ENTITIES]` | – | – | – | – | – | – | – | – | – | – | – | – |
| 명시적 데이터베이스 커밋 | – | – | – | – | – | – | – | – | – | – | – | – |
| 암묵적 데이터베이스 커밋 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `IF_ABAP_TX_SURFACE` 로 분류된 API | – | – | – | – | – | – | – | – | – | – | – | – |
| `IF_ABAP_TX_FUNCTIONAL` 로 분류된 API | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `IF_ABAP_TX_READ` 로 분류된 API | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `IF_ABAP_TX_MODIFY` 로 분류된 API | – | – | – | – | – | – | ○ | ○ | ○ | – | – | ○ |
| `IF_ABAP_TX_SAVE` 로 분류된 API | – | – | – | – | – | – | – | – | – | – | – | – |

### saver method

| 작업 | `finalize` | `check_before_save` | `cleanup` | `cleanup_finalize` | `adjust_numbers` | `save` / `save_modified` | `map_messages` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| event 를 일으키는 EML 요청 | – | – | – | – | ○ | ○ | – |
| EML 읽기 요청 | ○ | ○ | ○ | ○ | – / ○ (주 1) | – / ○ (주 1) | ○ |
| EML `GET PERMISSIONS` | ○ | ○ | – | ○ | ○ | – | ○ |
| EML 수정 요청 | ○ | – | – | ○ | – | – | – |
| EML [[abapconvert_key|키 변환]] | – | – | – | – | ○ | ○ | – |
| EML `SET LOCKS` | ○ | – | – | – | – | – | – |
| Enqueue 잠금 | ○ | ○ | – | – | ○ | ○ | – |
| 권한 확인 | ○ (주 2) | ○ (주 2) | – | ○ (주 2) | – | – | – |
| update task 용, 백그라운드 처리용 function module 호출 | – | – | – | – | ○ | ○ | – |
| 표준 연결로 데이터베이스 수정 | – | – | – | – | ○ | ○ | – |
| ABAP SQL `SELECT` 문 | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `COMMIT [WORK \| ENTITIES]`, `ROLLBACK [WORK \| ENTITIES]` | – | – | – | – | – | – | – |
| 명시적 데이터베이스 커밋 | – | – | – | – | – | – | – |
| 암묵적 데이터베이스 커밋 | ○ | ○ | ○ | ○ | – | – | – |
| `IF_ABAP_TX_SURFACE` 로 분류된 API | – | – | – | – | – | – | – |
| `IF_ABAP_TX_FUNCTIONAL` 로 분류된 API | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `IF_ABAP_TX_READ` 로 분류된 API | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| `IF_ABAP_TX_MODIFY` 로 분류된 API | ○ | – | – | ○ | – | – | – |
| `IF_ABAP_TX_SAVE` 로 분류된 API | – | – | – | – | ○ | ○ | – |

**주 1.** `adjust_numbers`, `save`, `save_modified` 에서 EML 읽기 요청은 managed RAP BO 에서만 쓸 수 있습니다. 곧 managed transactional buffer(트랜잭션 버퍼)를 읽는 요청만 됩니다. [[abapin_local_mode|IN LOCAL MODE]] 를 꼭 붙여야 합니다. 읽기와 read-by-association 만 되고, function 으로 읽는 것은 안 됩니다. 일반적으로 애플리케이션을 중단시키는 작업은 쓸 수 없습니다.

**주 2.** EML 수정 작업 가운데 하나라도 특권이 없는 상태에서 실행되었다면, 권한 확인이 early save phase(이른 저장 단계, `finalize`, `check_before_save`, `cleanup_finalize`)에서 이루어지는 한 계약을 어기지 않습니다. EML 수정 작업이 모두 특권 상태에서 실행되었다면, early save phase 도 특권 상태에서 실행된다고 봅니다. [[abaprap_cl_abap_behv_aux|CL_ABAP_BEHV_AUX 클래스]]의 `GET_PRIVILEGED_ACCESS_PROFILE` 메서드를 참고합니다.

## 알아두기

- `COMMIT WORK`, `COMMIT ENTITIES`, `ROLLBACK WORK`, `ROLLBACK ENTITIES`, 명시적 데이터베이스 커밋은 어떤 handler method 와 saver method 에서도 쓸 수 없습니다.
- 표준 연결로 데이터베이스를 고치는 일과 update task 용, 백그라운드 처리용 function module 호출은 `adjust_numbers`, `save`, `save_modified` 에서만 됩니다.
- EML 수정 요청은 saver method 가운데 `finalize` 와 `cleanup_finalize` 에서만 쓸 수 있습니다.
- API 분류(`IF_ABAP_TX_...`)와 트랜잭션 단계별 제약은 SAP 문서의 `CL_ABAP_TX`, "API Classifications", "Restrictions in Transactional Phases", "Controlled SAP LUW" 항목에서 더 볼 수 있습니다.

## 관련 항목

- [[abenabp_handler_class]]
- [[abenabp_saver_class]]
- [[abenabp_saver_methods]]
- [[abapin_local_mode]]
- [[abapconvert_key]]
- [[abaprap_cl_abap_behv_aux]]
- [[abaprap_impl_rules]]
