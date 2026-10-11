---
title: 예제 - 동작 extension
summary: 루트 하나짜리 BO 에 extension 노드와 action·determination 을 보태고, 권한·기능 제어 구현이 원본과 extension behavior pool 에 어떻게 나뉘는지 보여 주는 예제입니다.
keywords: behavior extension, 동작 확장, extend behavior for, define behavior for, using, 확장 노드, 확장 액션, get_global_features, get_global_authorizations, 확장 동작 풀, 핸들러 메서드 실행 순서, 예제
---

## 설명

이 예제는 BDEF extension(확장)으로 RAP BO 의 **동작**을 넓히는 모습을 보여 줍니다. 원본과 extension 이 각각 무엇을 구현하는지가 핵심입니다.

**원본 BO**

- 자식이 없는 루트 노드 하나입니다. CDS 뷰에는 새 composition 을 허용하는 표시가 있고, extension 용 CDS 트랜잭션 interface 와 `extensible` 한 interface BDEF 가 있습니다.
- 원본 BDEF 는 managed 이고 `extensible { with determinations on modify; }` 로 extension 지점을 열었습니다. global authorization control(권한 제어)를 쓰고, `update` 에는 instance feature control(기능 제어)를 걸었으며, 생성할 때 실행되는 저장 시점 validation 이 하나 있습니다.
- 원본 behavior pool(동작 풀)은 세 가지를 구현합니다.
  - instance feature control: 한 필드 값이 50 보다 크면 수정을 막습니다.
  - global authorization control: 생성·수정·삭제를 언제나 허용합니다.
  - validation: 한 필드 값이 500 보다 크면 실패하고 인스턴스가 저장되지 않습니다.

**extension**

- 데이터 모델에 자식 노드를 하나 보태고, 그 노드의 CDS 트랜잭션 interface 도 만듭니다.
- BDEF extension 은 루트 노드를 확장하고(`extend behavior for`), 새 자식 노드의 동작을 정의합니다(`define behavior for ... using`).
- extension behavior pool 이 구현하는 것은 다음과 같습니다.

| 대상 | 메서드 | 하는 일 |
| --- | --- | --- |
| 루트 노드 extension | global feature control | extension action 을 오전 6시부터 오후 10시 사이에만 실행할 수 있게 합니다. |
| 루트 노드 extension | global authorization control | extension action 실행을 제한 없이 허용합니다. 원본 BO 가 global authorization control 을 정의했으므로, extension 으로 보탠 작업에는 extension 쪽 구현이 따로 있어야 합니다. |
| 루트 노드 extension | action | 필드 하나를 정해진 값으로 바꿉니다. |
| 자식 노드 | global authorization control | 자식 노드의 action 용으로 따로 구현합니다. 제한 없이 허용합니다. |
| 자식 노드 | 수정 시점 determination | 필드 하나에 정해진 값을 넣습니다. |
| 자식 노드 | action | 요청받은 모든 인스턴스의 필드 하나를 고칩니다. |

## 예제

공통 예제 모델로 줄여 썼습니다. `ZR_Travel` 아래에 메모를 담는 extension 노드 `ZR_TravelNote` 를 보탭니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  association _Note { create; }

  action ( features : global, authorization : global ) holdTravel
    result [1] $self;
}

define behavior for ZR_TravelNote alias TravelNote
  using ZI_TravelNote
persistent table ztravelnote
( lock, authorization ) dependent
{
  update;
  delete;
  field ( readonly ) TravelID;
  field ( readonly : update ) NoteID;
  association _Travel;
  determination setNoteDate on modify { field NoteText; }
  action ( authorization : global ) markDone;
}
```

extension behavior pool 에는 entity(엔터티)마다 handler class(핸들러 클래스)를 둡니다.

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_features FOR GLOBAL FEATURES
      IMPORTING REQUEST requested_features FOR travel RESULT result.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travel RESULT result.
    METHODS holdtravel FOR MODIFY
      IMPORTING keys FOR ACTION travel~holdtravel RESULT result.
ENDCLASS.

CLASS lhc_travelnote DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
      IMPORTING REQUEST requested_authorizations FOR travelnote RESULT result.
    METHODS setnotedate FOR DETERMINE ON MODIFY
      IMPORTING keys FOR travelnote~setnotedate.
    METHODS markdone FOR MODIFY
      IMPORTING keys FOR ACTION travelnote~markdone.
ENDCLASS.
```

루트 쪽 global feature control 과 global authorization control 은 extension action 만 다룹니다.

```abap
METHOD get_global_features.
  " 낮 근무 시간(06시~22시)에만 action 을 켠다
  DATA(lv_time) = cl_abap_context_info=>get_system_time( ).
  result-%action-holdtravel = COND #( WHEN lv_time BETWEEN '060000' AND '220000'
                                      THEN if_abap_behv=>fc-o-enabled
                                      ELSE if_abap_behv=>fc-o-disabled ).
ENDMETHOD.

METHOD get_global_authorizations.
  " extension action 은 제한 없이 허용한다
  result-%action-holdtravel = if_abap_behv=>auth-allowed.
ENDMETHOD.
```

### 실행하면

원문 프로그램은 interface 를 거쳐 EML 로 네 가지를 차례로 합니다.

1. **부모 두 건과 자식 두 건을 한꺼번에 만듭니다.** 권한이 허용되고 원본의 validation 도 통과합니다.
2. **부모 두 건을 수정합니다.** 수정에는 원본의 instance feature control 이 걸려 있습니다. 한 건은 조건에 걸려 실패하고 나머지 한 건만 수정됩니다. 실패한 인스턴스의 오류 내용이 출력됩니다.
3. **루트의 extension action 을 실행합니다.** 권한이 허용되고 global feature control 도 통과합니다.
4. **자식 노드의 extension action 을 실행합니다.** parent entity(부모 엔터티)와 child entity(자식 엔터티)의 authorization control 이 모두 통과합니다.

화면 출력에는 behavior pool 의 handler method(핸들러 메서드)가 불린 순서를 적은 표가 들어 있습니다. BO 에 접근할 때 어느 메서드가 어떤 순서로 실행되는지 볼 수 있습니다.

## 알아두기

- 원본 BO 가 global authorization control 을 정의했다면, extension 으로 보탠 작업에는 extension behavior pool 에 global authorization control 을 따로 구현해야 합니다. 원본의 메서드에는 원본 작업만 들어옵니다. extension action 에 `authorization:none` 처럼 권한 방식을 따로 적는 방법은 [[abenbdl_new_elem_ext]]에 있습니다.
- 자식 노드처럼 authorization dependent entity 에 action 을 두면 그 entity 용 authorization control 메서드도 따로 구현합니다.
- extension 노드는 `authorization dependent by _Assoc` 처럼 마스터를 직접 가리키지 않고 `( lock, authorization ) dependent` 라고만 적습니다. ([[abenbdl_define_beh_extend]] 참고)

## 관련 항목

- [[abenbdl_new_elem_ext]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_define_beh_extend]]
- [[abenbdl_using_interface]]
- [[abenbdl_entity_proj_ext_abexa]]
- [[abaphandler_meth_global_features]]
- [[abaphandler_meth_global_auth]]
