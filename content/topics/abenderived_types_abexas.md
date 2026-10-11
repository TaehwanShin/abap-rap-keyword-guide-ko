---
title: BDEF derived type 구성요소 예제
summary: BDEF derived type 의 % 구성요소를 실제 EML 코드에서 어떻게 쓰는지 보여 주는 예제 모음입니다.
keywords: BDEF 파생 타입, 구성요소, 예제, examples, %cid, %cid_ref, %control, %data, %target, %fail, %is_draft, %key, %pid, %pre, %tmp, %pky, %tky, GET PERMISSIONS, reported, 메시지
---

## 설명

BDEF derived type(BDEF 파생 타입)의 `%` 구성요소는 설명만 읽어서는 감이 잘 오지 않습니다. 이 갈래는 구성요소를 실제 EML 요청과 handler method(핸들러 메서드) 안에서 써 보는 예제를 모았습니다.

예제는 대부분 같은 틀입니다. root entity(루트 엔터티)와 child entity(자식 엔터티)로 된 작은 RAP BO 를 두고, ABAP 클래스에서 EML 로 그 BO 를 다룹니다. 그리고 response parameter(응답 매개변수)와 데이터베이스 테이블 내용을 출력해 결과를 확인합니다. managed RAP BO 를 쓰는 예제가 많고, draft 나 late numbering 을 다루는 예제 가운데에는 unmanaged 를 쓰는 것도 있습니다.

묶어 보면 세 갈래입니다.

- **값과 표시를 넘기는 구성요소** : `%cid`, `%cid_ref`, `%control`, `%data`, `%target`
- **키와 식별자 구성요소** : `%key`, `%tky`, `%is_draft`, `%pid`, `%pre`, `%tmp`, `%pky`
- **응답과 허용 정보 구성요소** : `%fail`, 메시지 관련 구성요소, `GET PERMISSIONS` 문에서 쓰는 구성요소

### 하위 항목

- [[abenderived_types_misc_abexa]] : `GET PERMISSIONS` 문으로 허용 정보를 요청하면서 `%action`, `%assoc`, `%features`, `%field`, `%op`, `%perm` 등을 씁니다.
- [[abenderived_types_reported_abexa]] : `%msg`, `%element`, `%global`, `%other`, `%own`, `%path`, `%state_area` 처럼 메시지와 얽힌 구성요소를 씁니다.
- [[abenderived_types_cid_cidref_abexa]] : `%cid` 로 이름을 붙이고 `%cid_ref` 로 다시 가리킵니다. `AUTO FILL CID` 도 다룹니다.
- [[abenderived_types_control_abexa]] : `%control` 을 한꺼번에 주는 법과 줄마다 주는 법을 보여 줍니다.
- [[abenderived_types_data_abexa]] : `%data` 와 `%target` 으로 부모와 자식 인스턴스를 만듭니다.
- [[abenderived_types_fail_abexa]] : `failed` 응답의 `%fail-cause` 로 실패 원인을 읽습니다.
- [[abenderived_types_isdraft_abexa]] : draft 를 쓰는 unmanaged RAP BO 에서 draft 표시 `%is_draft` 를 씁니다.
- [[abenderived_types_key_abexa]] : managed RAP BO 의 interaction phase(상호작용 단계)에서 `%key` 를 씁니다.
- [[abenderived_types_pid_abexa]] : late numbering 을 쓰는 unmanaged RAP BO 에서 `%pid` 를 씁니다.
- [[abenderived_types_pre_tmp_abexa]] : late numbering 을 쓰는 unmanaged RAP BO 에서 `%pre`, `%tmp`, `%pky` 를 씁니다.
- [[abenderived_types_tky_abexa]] : `%tky` 를 두 가지 경우로 나누어 써 봅니다.
- [[abenrap_messages_abexa]] : draft 를 쓰는 managed RAP BO 로 transition message(전이 메시지)와 상태 메시지를 보여 줍니다.

## 관련 항목

- [[abapderived_types_comp]]
- [[abapderived_types_keys_id]]
- [[abapderived_types_info]]
- [[abapderived_types_misc]]
- [[abapeml_derived_type_flags]]
