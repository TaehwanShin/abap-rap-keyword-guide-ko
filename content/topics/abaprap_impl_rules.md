---
title: RAP 구현 규칙
summary: RAP BO provider 와 consumer 가 지켜야 하는 RAP BO 계약과, 계약 점검이 잡아내는 위반 사례를 하나씩 정리한 항목입니다.
keywords: RAP implementation rules, RAP BO contract, RAP BO 계약, contract check, 계약 점검, 계약 위반, controlled SAP LUW, %cid, AUTO FILL CID, failed, fail cause, 실패 원인, %state_area, BEHAVIOR_BAD_HANDLER_RESPONSE, BEHAVIOR_UNEXPECTED_AUTH_CHECK, AUGMENTING, PRIVILEGED ACCESS, empty update, 빈 수정, 중복, late numbering, adjust_numbers
---

## 설명

ABAP 계약 점검에는 **RAP BO 계약 점검**이 들어 있습니다. RAP BO 계약은 RAP BO provider(제공자)와 consumer(사용자)의 구현이 지켜야 하는 규칙과 지침을 모은 것입니다. 구현이 일관되고 믿을 만하게 돌아가게 하려는 것입니다.

점검에는 트랜잭션 계약 점검도 들어 있습니다. 이 점검은 통제된 SAP LUW(controlled SAP LUW) 개념 안에 구현되어 있고, RAP 는 따로 적지 않아도 이 개념을 씁니다.

아래는 RAP BO 계약 점검이 잡아내는 위반 사례입니다.

### EML 요청에 관한 규칙

| 위반 | 지켜야 할 것 |
| --- | --- |
| `%cid` 누락 | 생성, association 을 거친 생성, factory action 에서는 [[abapderived_types_cid|%cid]] 를 늘 채웁니다. association 을 거친 생성에서는 [[abapderived_types_target|%target]] 구조 안의 `%cid` 도 채웁니다. `%cid` 가 필요 없으면 [[abapmodify_entity_entities_fields|AUTO FILL CID]] 를 붙여 겹치지 않는 임시 값으로 자동으로 채웁니다. |
| 잘못된 임시 키의 mapping 요청 | 최종 키가 없는 임시 키의 mapping 을 요청하면 안 됩니다. 그래서 provider 는 작업이 실패한 경우가 아니면 임시 키를 모두 mapping 해야 합니다. 사용자도 세션 중에 지워진 인스턴스의 임시 키 mapping 은 요청하지 않아야 합니다. |
| static feature control(기능 제어) 무시 | static feature control 을 따라야 합니다. behavior definition(동작 정의)에서 readonly 인 필드는 수정하면 안 되고, 필수인 필드는 생성할 때 꼭 넣어야 합니다. |
| 불필요하거나 모호한 요청 | 필드를 하나도 바꾸지 않는 수정은 불필요한 요청입니다. 같은 인스턴스를 두 번 수정하거나 두 번 삭제하는 것, action 이나 function 실행을 겹쳐 요청하는 것은 모호한 요청입니다. |
| 빈 수정 | EML 수정 요청은 수정하는 데이터 줄마다 키가 아닌 필드를 적어도 하나 담아야 합니다. `%control` 에도 키가 아닌 필드가 적어도 하나 켜져 있어야 합니다. |
| EML 요청 안의 중복 | EML 수정·삭제 요청과 `EXECUTE` 를 쓴 요청에는 같은 데이터 줄이 두 번 들어가면 안 됩니다. |
| 잘못된 BDEF derived type(BDEF 파생 타입) | EML 작업은 정해진 BDEF derived type 을 피연산자로 받습니다. 예를 들어 수정은 `TABLE FOR UPDATE` 타입을 받습니다. 타입을 동적으로 지정하면 컴파일러가 이를 확인하지 못하므로 EML 처리 중에 오류가 날 수 있습니다. |

### 핸들러·saver method 구현에 관한 규칙

| 위반 | 지켜야 할 것 |
| --- | --- |
| save sequence(저장 순서) 안의 EML 수정 작업 | provider 는 interaction phase(상호작용 단계)와 `finalize` saver method(세이버 메서드)에서만 EML 수정 작업을 할 수 있습니다. |
| [[abenbdl_draft_action|with additional implementation]] 을 붙인 draft action 의 잘못된 구현 | [[abenbdl_draft_action2_abexa|edit]], [[abenbdl_draft_action2_abexa|discard]], [[abenbdl_draft_action1_abexa|activate]] 메서드 구현은 실패 항목을 돌려주면 안 됩니다. `edit`, `discard`, `activate`, [[abenbdl_draft_action2_abexa|resume]] 메서드 구현은 상태 메시지를 돌려주면 안 됩니다. [[abapderived_types_state_area|%state_area]] 를 채우지 않습니다. |
| 맞지 않는 권한 확인 | behavior definition 에 권한 확인([[abenbdl_authorization_context|authorization context]])을 정의했다면 그 정의와 다른 권한 확인을 하면 안 됩니다. 쓰는 권한 객체는 `own authorization context` 에 적혀 있거나 다른 컨텍스트가 꺼 주어야 합니다. 어기면 보통 런타임 오류 `BEHAVIOR_UNEXPECTED_AUTH_CHECK` 가 납니다. |
| augmentation 의 잘못된 사용 | `AUGMENTING` 을 붙인 EML `MODIFY` 문은 원래 요청의 필드를 덮어쓰면 안 됩니다. 같은 인스턴스의 같은 필드가 원래 작업과 augmentation 작업 양쪽 `%control` 에 켜져 있으면 안 된다는 뜻입니다. 원래 요청에 없던 인스턴스를 다룬다면 `RELATING` 절로 원래 요청의 인스턴스와 이어 줍니다. 그래야 응답을 짝지을 수 있습니다. |
| 특권이 아닌 접근 | 접근 제어가 걸린 CDS 뷰에 `OPTIONS PRIVILEGED ACCESS` 없이 `SELECT` 하는 것 같은 접근을 잡아냅니다. `AUTHORITY-CHECK OBJECT` 문과 같은 방식으로 점검합니다. 그래서 핸들러·saver method 와 분류된 API 에서, 권한 확인이 아예 허용되지 않는 곳이거나 `OPTIONS PRIVILEGED ACCESS` 없는 접근이 발견되면 계약 위반이 됩니다. |
| save action 을 맞는 saver method 밖에서 실행 | [[abenbdl_action_onsave|save action]] 은 save sequence 에서, 그 action 에 해당하는 saver method 구현 안에서만 실행할 수 있습니다. |
| late numbering 에서 키 mapping 누락 | late numbering 에서는 `adjust_numbers` saver method 가 임시 키를 모두 최종 키로 mapping 해 돌려주어야 합니다. 그래야 [[abencommit_entities_beginend_abexa|CONVERT KEY]] 문으로 최종 키를 알아낼 수 있습니다. |

### failed response parameter 에 넣으면 안 되는 항목

- `with additional implementation` 으로 정의한 action 의 handler method(핸들러 메서드)는 `failed` 에 항목을 넣으면 안 됩니다. draft action `edit`, `activate`, `discard` 가 여기에 해당하고 `resume` 은 예외입니다. 지금 처리 단계에서 그 항목을 반영할 수 없기 때문입니다.
- EML 수정 작업의 handler method 는 그 작업의 입력으로 들어온 인스턴스가 아닌 것을 `failed` 에 넣으면 안 됩니다.
- 어기면 런타임 오류 `BEHAVIOR_BAD_HANDLER_RESPONSE` 가 납니다.

### failed 에 넣을 수 있는 실패 원인

메서드 종류마다 쓸 수 있는 실패 원인이 정해져 있습니다. 표에 없는 값을 넣으면 런타임 오류 `BEHAVIOR_BAD_HANDLER_RESPONSE` 가 납니다.

| 어디에서 | 넣을 수 있는 실패 원인 |
| --- | --- |
| precheck, augmentation | `if_abap_behv=>cause-locked` 를 뺀 모든 값 |
| saver method `adjust_numbers`, `save`, `save_modified`, `finalize`, `check_before_save`, early numbering 용 `FOR NUMBERING` handler method | `if_abap_behv=>cause-unspecific` |
| 잠금 | `if_abap_behv=>cause-locked`, `if_abap_behv=>cause-not_found` |
| 읽기, association 을 거친 읽기 | `if_abap_behv=>cause-not_found`, `if_abap_behv=>cause-unauthorized` |
| function | `if_abap_behv=>cause-locked` 를 뺀 모든 값 |
| feature control, 권한 | `if_abap_behv=>cause-not_found` (global feature control 과 global 권한에는 해당 없음) |
| 생성, association 을 거친 생성, 수정, 삭제, action | `if_abap_behv=>cause-locked` 를 뺀 모든 값 |
| draft action `resume` | `if_abap_behv=>cause-locked` 를 뺀 모든 값 |
| 저장 시점 validation | `if_abap_behv=>cause-unspecific` |

global feature control, global 권한, 저장 시점·수정 시점 determination, `cleanup` 과 `map_messages` 메서드는 이 규칙의 대상이 아닙니다.

### reported response parameter 의 %state_area

- 다음 메서드에서 `reported` 에 넣는 항목은 `%state_area` 가 초기값이어야 합니다. 읽기, `with additional implementation` 으로 정의한 draft 메서드, precheck, augmentation, `adjust_numbers`, early numbering 용 `FOR NUMBERING` handler method, `save`, `save_modified`, 잠금, (global) 권한, (global) feature control 입니다. `cleanup` 에는 해당하지 않습니다.
- `%state_area` 에 값이 있으면 `%create`, `%update`, `%delete`, `%action`, `%cid`, `%global` 은 초기값이어야 합니다. 이때는 `%op` 아래의 `%element` 만 채울 수 있습니다.
- 어기면 런타임 오류 `BEHAVIOR_BAD_HANDLER_RESPONSE` 가 납니다.

## 예제

계약에 맞게 EML 요청을 쓰는 모습입니다.

```abap
" %cid 를 따로 쓸 일이 없으면 AUTO FILL CID 로 채운다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE AUTO FILL CID FIELDS ( TravelID AgencyID CustomerID )
    WITH VALUE #( ( TravelID = '00000001' AgencyID = '070001' CustomerID = '000042' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 수정에는 키가 아닌 필드를 적어도 하나 넣는다.
" 같은 인스턴스를 한 요청에 두 번 넣지 않는다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( Status )
    WITH VALUE #( ( TravelID = '00000001' Status = 'A' ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

## 알아두기

- 더 자세한 내용은 SAP 의 "ABAP RESTful Application Programming Model 개발 안내서"의 RAP Business Object Contract 절, "Restrictions in Transactional Phases", ABAP 개념 문서의 "Controlled SAP LUW" 에 있습니다.

## 관련 항목

- [[abapderived_types_cid]]
- [[abapmodify_entity_entities_fields]]
- [[abapderived_types_state_area]]
- [[abenbdl_draft_action]]
- [[abenbdl_authorization_context]]
- [[abenbdl_action_onsave]]
- [[abensaver_adjust_numbers]]
- [[abeneml_modify_augmenting_abexa]]
- [[abapeml_response]]
