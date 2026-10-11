---
title: RAP BDL 언어 요소 표 (Feature Tables)
summary: RAP BDL 에서 쓸 수 있는 키워드를 자리별로 모두 모으고, 키워드마다 어느 릴리스부터 쓸 수 있는지 적은 표입니다.
keywords: feature table, 언어 요소 표, 기능 표, release, 릴리스, 버전, 지원 버전, BDL keywords, 키워드 목록, on-premise, 온프레미스, BTP, S/4HANA Cloud, BDEF extension
---

## 설명

RAP BDL 의 언어 요소를 BDEF 안의 자리별로 나누어 모은 표입니다. 어떤 키워드가 내 시스템에서 되는지 확인할 때 봅니다.

표의 릴리스 열은 네 가지입니다.

| 열 | 뜻 |
| --- | --- |
| 분기 | ABAP 릴리스 (분기별 출시) |
| 온프레미스 | ABAP 릴리스 (온프레미스) |
| BTP | SAP BTP ABAP 환경 |
| S/4HANA Cloud | SAP S/4HANA Cloud Public Edition |

구현 타입에 따라 릴리스가 다르면 키워드 아래에 타입별 줄을 따로 두었습니다. `-` 는 그 환경에서 쓸 수 없다는 뜻입니다. 맨 오른쪽 "자세히" 열은 그 키워드를 풀이한 항목입니다.

### BDEF 머리말

managed, unmanaged, projection BDEF 에서 쓸 수 있는 키워드입니다.

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `managed` | managed RAP BO 를 정의합니다. | 7.77 | 7.54 | 1905 | 1905 | [[abenbdl_impl_type|보기]] |
| `unmanaged` | unmanaged RAP BO 를 정의합니다. | 7.73 | 7.53 | 1805 | 1805 | [[abenbdl_impl_type|보기]] |
| `managed by BOPF` | BOPF 기반 RAP BO 를 정의합니다. | - | 7.58 | - | - | |
| `projection` | projection RAP BO 를 정의합니다. | 7.77 | 7.54 | 1905 | 1905 | [[abenbdl_impl_type|보기]] |
| `implementation in class [unique]` | 메서드를 직접 구현할 클래스를 정합니다. | 7.77 | 7.54 | 1905 | 1905 | [[abenbdl_in_class_unique|보기]] |
| `strict` | BDEF strict mode 를 켭니다. | 7.84 | 7.56 | 2105 | 2105 | [[abenbdl_strict_1|보기]] |
| `strict(2)` | BDEF strict mode 버전 2 를 켭니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_strict_2|보기]] |
| `auxiliary class` | behavior pool(동작 풀)의 기능을 덜어 낼 수 있는 ABP 보조 클래스를 하나 이상 정합니다. | 9.12 | 8.16 | 2408 | 2408 | [[abenbdl_auxiliary_class|보기]] |
| `extensible` | managed·unmanaged RAP BO 와 projection BDEF 를 확장할 수 있게 엽니다. 상세 항목의 "쓸 수 있는 곳"에는 unmanaged RAP BO 가 없어, 원문의 기능 표와 상세 항목이 다르게 적고 있습니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_extensible|보기]] |
| `with validations on save`, `with determinations on save`, `with determinations on modify`, `with additional save` (`extensible` 뒤) | extension(확장)에서 무엇을 허용할지 정합니다. 지금은 managed RAP BO 에서만 됩니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_extensible|보기]] |
| `with managed instance filter` | projection·interface BDEF 용 선택 구문. 적으면 EML 이나 OData 요청으로 BDEF 에 접근할 때 바탕이 되는 CDS 트랜잭션 조회나 CDS 트랜잭션 interface 의 WHERE 조건을 따집니다. | 7.93 | 7.58 | 2308 | 2308 | [[abenbdl_mngd_instance_check_proj|보기]] |
| `with draft` | RAP exclusive draft 를 켭니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_with_draft|보기]] |
| `with collaborative draft` | RAP collaborative draft 를 켭니다. | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_with_coll_draft|보기]] |
| `with BOPF draft` | BOPF 기반 RAP BO 에서 draft 처리를 켭니다. | - | 7.58 | - | - | |
| `use draft` | projection BDEF 에서 draft 처리를 다시 씁니다. | 7.77 | 7.54 | 1909 | 1909 | [[abenbdl_use_projection|보기]] |
| `use draft as dependent` | BO 사이 시나리오의 projection BDEF 에서 draft 범위 기능을 켭니다. 그 BO 가 종속 draft BO 가 됩니다. | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_use_projection|보기]] |
| `use side effects` | projection BDEF 에서 side effects 를 다시 씁니다. | 7.91 | 7.58 | 2302 | 2302 | [[abenbdl_use_projection|보기]] |
| `with privileged mode` | BDEF privileged mode 를 켭니다. | 7.83 (7.89 부터 폐기) | 7.56 (7.57 부터 폐기) | 2102 (2208 부터 폐기) | 2102 (2208 부터 폐기) | [[abenbdl_privileged_mode|보기]] |
| `with privileged mode disabling` | managed·unmanaged RAP BO 에서 BDEF privileged mode 를 켭니다. | 7.89 | 7.56 | 2208 | 2208 | [[abenbdl_privileged_mode|보기]] |
| `with privileged mode disabling base context [and]` | projection BDEF 에서 BDEF privileged mode 를 켭니다. | 7.86 | 7.57 | 2111 | 2111 | [[abenbdl_privileged_mode|보기]] |
| `foreign entity` | BO 구조에 들지 않는 entity(엔터티)를 응답 구조의 구성요소로 넣어, 다른 BO 의 메시지를 옮겨 담을 수 있게 합니다. | | | | | [[abenbdl_foreign|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| | projection | 7.77 | 7.54 | 1908 | 1908 | |
| `save after` | 저장 차례를 직접 정합니다. | 9.12 | 8.16 | 2408 | 2408 | [[abenbdl_save_after|보기]] |

### entity behavior definition

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `define behavior for ... alias` | entity behavior definition(동작 정의)를 시작합니다. | | | | | [[abenbdl_define_beh|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| | projection | 7.77 | 7.54 | 1908 | 1908 | |

### authorization context 정의

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `define authorization context ... [for disable ...]` | authorization context 를 정의합니다. 이 컨텍스트가 켜지면 건너뛸 수 있는 권한 객체를 나열합니다. `for disable` 뒤에는 `modify`, `read`, `modify,read` 가운데 하나가 옵니다. | 7.85 | 7.56 | 2108 | 2108 | [[abenbdl_def_auth_context|보기]] |
| `save:early`, `save:late` | `define authorization context ContextName for disable` 뒤에 적는 선택 항목. 특정 RAP saver method(세이버 메서드)가 도는 동안 권한 객체를 건너뜁니다. | 7.91 | 7.58 | 2302 | 2302 | [[abenbdl_def_auth_context|보기]] |
| `determination`, `validation` | `define authorization context ContextName for disable` 뒤에 적는 선택 항목. 원문은 이것도 특정 RAP saver method 가 도는 동안 권한 객체를 건너뛴다고 적습니다. | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_def_auth_context|보기]] |
| `define own authorization context` | 자체 authorization context 를 정의합니다. 이 RAP BO 의 구현이 쓰는 권한 객체를 적어 둡니다. | 7.86 | 7.57 | 2111 | 2111 | [[abenbdl_def_own_auth_context|보기]] |
| `define own authorization context by privileged mode [and]{...}` | 자체 authorization context 를 정의합니다. | 7.89 | 7.56 | 2208 | 2208 | [[abenbdl_def_own_auth_context|보기]] |

### entity 동작 특성

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `persistent table` | managed RAP BO 의 persistent table 을 정합니다. | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_persistent_table|보기]] |
| `draft table` | draft 데이터를 담을 draft 테이블을 정합니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_draft_table|보기]] |
| `query` | draft 테이블에 draft 조회 뷰를 붙입니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_draft_query_view|보기]] |
| `with additional save` | managed RAP BO 의 사용자 정의 저장 방식 | 7.78 | 7.55 | 1911 | 1911 | [[abenbdl_saving|보기]] |
| `with unmanaged save` | managed RAP BO 의 사용자 정의 저장 방식 | 7.78 | 7.55 | 1911 | 1911 | [[abenbdl_saving|보기]] |
| `and cleanup` | managed RAP BO 의 사용자 정의 저장 방식 | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_saving|보기]] |
| `with full data` | managed RAP BO 의 사용자 정의 저장 방식 | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_saving|보기]] |
| `etag master`, `etag dependent`, `total etag` | 낙관적 동시성 제어에 쓸 ETag 필드를 정합니다. | | | | | [[abenbdl_etag|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| | projection | 7.77 | 7.54 | 1908 | 1908 | |
| `use etag` | projection BDEF 에서 ETag 필드를 다시 씁니다. | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_use_projection|보기]] |
| `lock master` | managed·unmanaged RAP BO 의 비관적 동시성 제어(잠금)를 정합니다. | | | | | [[abenbdl_locking|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| `unmanaged` (`lock master` 뒤) | managed RAP BO 에서 잠금을 직접 구현하는 출구 | 7.80 | 7.55 | 2005 | 2005 | [[abenbdl_locking|보기]] |
| `lock dependent` | managed·unmanaged RAP BO 의 비관적 동시성 제어(잠금)를 정합니다. | | | | | [[abenbdl_locking|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| `lock:none` | 작업에 붙여 그 entity 에 잠금이 걸리지 않게 합니다. | 7.82 | 7.56 | 2011 | 2011 | [[abenbdl_lock_none|보기]] |
| `authorization master ( global )` | managed·unmanaged RAP BO 의 global authorization control(권한 제어)를 정합니다. | 7.82 | 7.56 | 2011 | 2011 | [[abenbdl_authorization|보기]] |
| `authorization master ( instance )` | managed·unmanaged RAP BO 의 instance authorization control 을 정합니다. | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_authorization|보기]] |
| `authorization dependent` | managed·unmanaged RAP BO 의 authorization control | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_authorization|보기]] |
| `authorization ( global )`, `( instance )`, `( global, instance )` | projection BDEF 의 authorization control 을 정합니다. | 7.84 | 7.56 | 2105 | 2105 | [[abenbdl_authorization_projection|보기]] |
| `authorization:update` | 작업에 붙여 authorization control 을 위임합니다. | 7.85 | 7.56 | 2108 | 2108 | [[abenbdl_authorization|보기]] |
| `authorization:none` | 작업에 붙여 그 작업을 authorization control 에서 뺍니다. | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_authorization|보기]] |
| `authorization:global` | 작업에 붙여, authorization master entity 에 정한 authorization control 대신 global 권한 확인을 겁니다. | 7.92 | 7.58 | 2305 | 2308 | [[abenbdl_actions_auth_global|보기]] |
| `authorization:instance` | 작업에 붙여, authorization master entity 에 정한 authorization control 대신 instance 권한 확인을 겁니다. | 7.92 | 7.58 | 2305 | 2308 | [[abenbdl_actions_auth_instance|보기]] |
| `changedocuments master` | change documents 객체로 변경 내용을 기록하게 합니다. | 9.16 | 7.58 | 2508 | 2508 | [[abenbdl_change_documents|보기]] |
| `asynchronous` (change documents) | 변경 기록을 비동기로 쓰게 하는 선택 항목 | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_change_documents|보기]] |
| `utc` (change documents) | change documents 의 시간 데이터를 UTC 로 기록합니다. | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_change_documents|보기]] |
| `for persistent tables` (change documents) | 변경 기록에 persistent table 의 필드 정보를 쓰게 합니다. ABAP Cloud 에서는 쓸 수 없습니다. | 쓸 수 없음 | 8.16 | 쓸 수 없음 | 쓸 수 없음 | [[abenbdl_change_documents|보기]] |
| `changedocuments dependent` | entity 가 변경 기록에 들어가게 합니다. | 9.16 | 7.58 | 2508 | 2508 | [[abenbdl_change_documents|보기]] |
| `instance hierarchy` | managed·unmanaged RAP BO 에서 편집할 수 있는 트리 화면 시나리오를 켭니다. | 9.14 | 8.16 | 2502 | 2502 | [[abenbdl_instance_hierarchy|보기]] |
| `copy action` | RAP 복사 action 을 정의합니다. | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_copy_action|보기]] |
| `field ( hierarchy-index )` | managed 순서 바꾸기 action 에 쓸 계층 순번 필드를 정합니다. | 9.14 | 7.58 | 2502 | 2502 | [[abenbdl_reorder_action|보기]] |
| `ascending association` | managed 순서 바꾸기 action 에 쓸 오름 방향 association 을 정합니다. | 9.14 | 7.58 | 2502 | 2502 | [[abenbdl_reorder_action|보기]] |
| `descending association ... [with cascading delete]` | managed 순서 바꾸기 action 에 쓸 내림 방향 association 을 정합니다. | 9.14 | 7.58 | 2502 | 2502 | [[abenbdl_reorder_action|보기]] |
| `reorder action` | RAP 순서 바꾸기 action 을 정의합니다. | 9.14 | 7.58 | 2502 | 2502 | [[abenbdl_reorder_action|보기]] |
| `early numbering` | entity 의 기본 키 필드 전체에 unmanaged early numbering 을 정합니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_early_numb|보기]] |
| `late numbering` | managed·unmanaged RAP BO 에서 새 인스턴스를 만들 때 빈 번호 없이 고유 키를 매길 수 있게 합니다. | | | | | [[abenbdl_late_numbering|보기]] |
| | draft 없는 unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | draft 있는 unmanaged 와 managed | 7.86 | 7.57 | 2111 | 2111 | |

### entity 동작 본문

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `field(readonly)` | 필드 성질을 정합니다. | | | | | [[abenbdl_field_char|보기]] |
| | unmanaged | 7.76 | 7.54 | 1905 | 1905 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| `field(mandatory)` | 필드 성질을 정합니다. | | | | | [[abenbdl_field_char|보기]] |
| | unmanaged | 7.76 | 7.54 | 1905 | 1905 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| `field (features:instance)` | 필드 성질을 정합니다. | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_field_char|보기]] |
| `field (mandatory:create)` | 필드 성질을 정합니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_field_char|보기]] |
| `field (readonly:update)` | 필드 성질을 정합니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_field_char|보기]] |
| `field (numbering:managed)` | managed RAP BO 의 필드에 managed internal numbering 을 정합니다. | 7.79 | 7.55 | 2002 | 2002 | [[abenbdl_field_char|보기]] |
| `field (suppress)` | 필드 성질을 정합니다. | | | | | [[abenbdl_field_char|보기]] |
| | managed | 7.88 | 7.57 | 2205 | 2205 | |
| | unmanaged | 7.87 | 7.57 | 2202 | 2202 | |
| | projection | 7.84 | 7.56 | 2105 | 2105 | |
| `field (notrigger:warn)` | 필드 성질을 정합니다. | 7.90 | 7.58 | 2211 | 2211 | [[abenbdl_field_char|보기]] |
| `field (modify)` | projection BDEF 에서 CDS 가상 요소를 augment 합니다. | 7.82 | 7.56 | 2011 | 2011 | [[abenbdl_augment_projection|보기]] |
| `group` | 구현이 필요한 부분을 여러 묶음으로 나누어 여럿이 함께 작업할 수 있게 합니다. | 7.78 | 7.55 | 1911 | 1911 | [[abenbdl_grouping|보기]] |
| `create`, `update`, `delete` | managed·unmanaged RAP BO 의 CRUD 작업을 켭니다. | | | | | [[abenbdl_standard_operations|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `use` | projection BDEF 에서 RAP BO 작업을 다시 씁니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_use_projection|보기]] |
| `association ... abbreviation ... [without response]` | association 을 따라 읽기와 association 을 따라 만들기를 켭니다. | | | | | [[abenbdl_association|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `action ... [external]` | action 을 정의합니다. | | | | | [[abenbdl_action|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `static` (action) | static action 을 정의합니다. | | | | | [[abenbdl_action|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `repeatable` (action·function) | 되풀이할 수 있는 작업을 정의합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_action_repeatable|보기]] |
| `factory` (action) | factory action 을 정의합니다. | | | | | [[abenbdl_action_factory|보기]] |
| | unmanaged | 7.76 | 7.54 | 1905 | 1905 | |
| | managed | 7.86 | 7.57 | 2111 | 2111 | |
| `default` | 기본 static factory action 을 정의합니다. | 7.90 | 7.58 | 2211 | 2211 | [[abenbdl_action_default_factory|보기]] |
| `save(finalize)`, `save(adjustnumbers)`, `save(finalize, adjustnumbers)` (action) | save action 을 정의합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_action_onsave|보기]] |
| `function ... [external]` | function 을 정의합니다. | | | | | [[abenbdl_function|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `determine action` | RAP BO consumer(사용자)가 요청해서 determination 과 validation 을 돌릴 수 있는 `determine action` 을 정의합니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_determine_action|보기]] |
| `always` (`determine action` 안) | `determine action` 의 실행 조건을 따지지 않게 합니다. | 7.82 | 7.56 | 2011 | 2011 | [[abenbdl_determine_action|보기]] |
| `recommendation function` | RAP recommendations 에 쓸 function 을 정의합니다. | 9.18 | 8.24 | 2602 | 2602 | [[abenbdl_recommendations|보기]] |
| `draft action Edit`, `draft action Activate`, `draft action Discard`, `draft action Resume [with additional implementation]`, `draft determine action Prepare` | draft 를 쓰는 시나리오의 draft action 을 정의합니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_draft_action|보기]] |
| `draft action AdditionalSave` | draft 인스턴스를 저장하는 방식을 직접 정할 수 있는 draft action | 7.93 | 7.58 | 2308 | 2308 | [[abenbdl_draft_action|보기]] |
| `draft action Share` | 사용자를 draft 인스턴스의 사용자 목록에 넣어도 되는지 확인하고, 아직 아니라면 exclusive draft 를 collaborative draft 로 바꾸는 draft action | 9.17 | 8.24 | 2508 | 2508 | [[abenbdl_draft_action|보기]] |
| `with additional implementation` | draft action 에 직접 구현을 보탤 수 있는 출구 | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_draft_action|보기]] |
| `optimized` | draft action `Activate` 에 붙이기를 권하는 구문. draft 인스턴스의 활성화가 빨라집니다. | 7.93 | 7.58 | 2308 | 2308 | [[abenbdl_draft_action|보기]] |
| `parameter ... [$self]` | action·function 의 입력 매개변수를 정의합니다. | | | | | [[abenbdl_action_input_param|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `deep [table]` (매개변수) | action·function 의 deep parameter 나 deep table parameter 를 정의합니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_action_input_param|보기]] |
| `result[cardinality] $self`, `result[cardinality] entity` | action·function 의 출력 매개변수를 정의합니다. | | | | | [[abenbdl_action_output_para|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `selective` (`result`) | action·function 의 출력 매개변수에 붙이는 추가 구문 | 7.79 | 7.55 | 2002 | 2002 | [[abenbdl_action_output_para|보기]] |
| `selective` (`deep result`) | action·function 의 deep result 에 붙이는 추가 구문 | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_action_output_para|보기]] |
| `mapping for ... [control ... ] [corresponding] [except]` | 데이터베이스 테이블의 필드 이름을 지금 데이터 모델의 필드 이름에 잇습니다. | 7.78 | 7.55 | 1911 | 1911 | [[abenbdl_type_mapping|보기]] |
| `validation ... on save { ... }` | save sequence(저장 순서) 안에서 불리는 validation 을 정의합니다. | | | | | [[abenbdl_validations|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| `determination ... on save { ... }`, `on modify { ... }` | save sequence 안에서, 또는 데이터가 바뀐 바로 뒤에 불리는 determination 을 정의합니다. | | | | | [[abenbdl_determinations|보기]] |
| | unmanaged | 7.73 | 7.53 | 1808 | 1808 | |
| | managed | 7.77 | 7.54 | 1908 | 1908 | |
| `features: global` | 작업에 붙여 global feature control(기능 제어)를 겁니다. | 7.82 | 7.56 | 2011 | 2011 | [[abenbdl_actions_fc|보기]] |
| `features: instance` | 작업에 붙여 instance feature control 을 겁니다. | 7.77 | 7.54 | 1908 | 1908 | [[abenbdl_actions_fc|보기]] |
| `internal` | 작업을 internal 전용으로 정의합니다. | | | | | [[abenbdl_internal|보기]] |
| | unmanaged | 7.73 | 7.53 | 1805 | 1805 | |
| | managed | 7.77 | 7.54 | 1905 | 1905 | |
| `precheck` | 수정 작업을 미리 점검해, 잘못된 변경이 애플리케이션 버퍼에 닿지 않게 합니다. | 7.81 | 7.55 | 2008 | 2008 | [[abenbdl_precheck|보기]] |
| `default function` | 작업의 default values function 을 정의합니다. 화면에서 필드나 입력 매개변수에 기본값을 채워 줍니다. | 7.94 | 8.16 | 2311 | 2402 | [[abenbdl_default_function|보기]] |
| `key ... function ...` | BDEF 대체 키에 쓸 key function 을 정의합니다. | 7.96 | 8.16 | 2405 | 2408 | [[abenbdl_keyfunction|보기]] |
| `augment` | projection BDEF 에서 projection 층의 수정 요청을 augment 합니다. | 7.82 | 7.56 | 2011 | 2011 | [[abenbdl_augment_projection|보기]] |
| `event ... [[deep] parameter]` | managed·unmanaged RAP BO 의 business event 를 정의합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_event|보기]] |
| `event ... for side effects` | event 로 일으키는 side effects 에 쓸 business event 를 정의합니다. | 9.14 | 8.16 | 2502 | 2502 | [[abenbdl_event_side_effect|보기]] |
| `managed event ... on ... parameter` | managed·unmanaged RAP BO 의 파생 event 를 정의합니다. | 7.93 | 7.58 | 2308 | 2308 | [[abenbdl_managed_event|보기]] |
| `side effects { ... [executed on ... ] affects ...; }` | managed·unmanaged·projection BDEF 의 side effects 를 정의합니다. | 7.91 | 7.58 | 2302 | 2302 | [[abenbdl_side_effects|보기]] |
| `executed on global` (side effects) | 사용자가 전체 새로 고침을 요청할 때마다 `determine action` 이 돌게 하는 side effects 를 정의합니다. | 9.17 | 8.24 | 2511 | 2602 | [[abenbdl_side_effects|보기]] |
| `changedocuments([create:...] [,update:...] [,delete:...])` | change documents 의 기록 방식을 정합니다. `create`, `update`, `delete` 마다 `none`, `key`, `data` 가운데 하나를 적습니다. | 9.16 | 7.58 | 2508 | 2508 | [[abenbdl_changedocs_options|보기]] |
| `define secondary key`, `define pure key` | managed·unmanaged BDEF 의 대체 키를 정의합니다. | 9.12 | 8.16 | 2408 | (원문에 값 없음) | [[abenbdl_define_key|보기]] |
| `link action`, `unlink action` | association 의 non-standard operation(비표준 작업). 외래 키를 채우거나 비워 인스턴스를 다른 인스턴스에 잇거나 끊습니다. | 9.14 | 8.16 | 2502 | 2502 | [[abenbdl_link_unlink_action|보기]] |
| `inverse function` | association 의 non-standard operation. 연관 대상 인스턴스의 외래 키 값을 받아, 그에 맞는 연관 출발 인스턴스를 돌려줍니다. | 9.14 | 8.16 | 2502 | 2502 | [[abenbdl_inverse_funct|보기]] |
| `use association _assoc { with dependent draft; }` | BO 사이 시나리오의 projection BDEF 에서 draft 범위 기능을 켭니다. 그 BO 가 주 draft BO 가 됩니다. | 9.16 | 8.16 | 2508 | 2508 | [[abenbdl_use_projection|보기]] |

### interface BDEF

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `interface` | RAP BO interface 를 정의합니다. | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_impl_type|보기]] |
| `extensible` | RAP BO interface 를 확장할 수 있다고 선언합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_bo_interface_header|보기]] |
| `with managed instance filter` | projection·interface BDEF 용 선택 구문. 적으면 EML 이나 OData 요청으로 BDEF 에 접근할 때 바탕이 되는 CDS 트랜잭션 조회나 CDS 트랜잭션 interface 의 WHERE 조건을 따집니다. | 7.93 | 7.58 | 2308 | 2308 | [[abenbdl_mngd_instance_check_proj|보기]] |
| `define behavior for ... alias ... external` | interface BDEF 의 entity behavior definition | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_define_beh_interface|보기]] |
| `use collaborative draft` | base BO(기반 BO) 의 collaborative draft 를 다시 씁니다. | 9.17 | 8.24 | 2508 | 2508 | [[abenbdl_bo_interface_header|보기]] |
| `use draft` | base BO 의 draft 처리를 다시 씁니다. | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_bo_interface_header|보기]] |
| `use side effects` | base BO 의 side effects 를 다시 씁니다. | 7.91 | 7.58 | 2302 | 2302 | [[abenbdl_use_projection|보기]] |
| `use event` | base BO 의 business event 를 다시 씁니다. | 7.93 | 7.58 | 2308 | 2308 | [[abenbdl_use_projection|보기]] |
| `use etag` | base BO 의 ETag 를 다시 씁니다. | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_define_beh_interface|보기]] |
| `with privileged mode` | BDEF privileged mode | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_bo_interface_header|보기]] |
| `foreign entity` | 메시지를 옮겨 담을 RAP 외부 entity 를 정의합니다. | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_bo_interface_header|보기]] |
| `field(readonly)` | 필드 성질 | 7.90 | 7.58 | 2211 | 2211 | [[abenbdl_field_interface|보기]] |
| `field(mandatory:create)` | 필드 성질 | 7.90 | 7.58 | 2211 | 2211 | [[abenbdl_field_interface|보기]] |
| `field(readonly:update)` | 필드 성질 | 7.90 | 7.58 | 2211 | 2211 | [[abenbdl_field_interface|보기]] |
| `field(suppress)` | 필드 성질 | 7.90 | 7.58 | 2211 | 2211 | [[abenbdl_field_interface|보기]] |

### abstract BDEF

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `abstract` | abstract BDEF 를 정의합니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_impl_type|보기]] |
| `with hierarchy` | 새로운 종류의 BDEF derived type(BDEF 파생 타입)이 만들어지게 합니다. abstract BDEF 에서만 쓸 수 있습니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_bdef_abstract_header|보기]] |
| `with hierarchy like entity` | BDEF derived type 이 기반 CDS abstract entity 의 구조 타입과 같아지게 해서 서로 맞게 합니다. | 9.12 | 8.16 | 2408 | 2408 | [[abenbdl_bdef_abstract_header|보기]] |
| `with control` | `define behavior` 문에 붙이는 선택 구문. abstract BDEF 에서만 됩니다. derived type 구조에 `%control` 구조를 더합니다. | 7.85 | 7.56 | 2108 | 2108 | [[abenbdl_define_beh_abstract|보기]] |
| `scalar entity` | entity behavior definition 대신 쓰는 구문. abstract BDEF 에서만 됩니다. CDS 구성 트리의 노드를 abstract BDEF 의 계층 derived type 에 스칼라 타입으로 넣습니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_define_beh_abstract|보기]] |
| `association ... [with hierarchy]` | abstract BDEF 에서 association 에 `with hierarchy` 를 붙일 수 있습니다. to-parent association 과 BO 사이 association 을 타입 구조에 여러 번 넣을 때 씁니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_association_abstract|보기]] |
| `deep mapping for ... [corresponding] [sub]` | abstract BDEF 의 deep mapping 을 정의합니다. | 7.83 | 7.56 | 2102 | 2102 | [[abenbdl_type_mapping_abstract|보기]] |
| `mandatory:execute` (필드) | abstract BDEF 의 필드를 필수로 선언하는 field characteristics(필드 특성) | 7.88 | 7.57 | 2205 | 2205 | [[abenbdl_field_abstract|보기]] |
| `mandatory:execute` (association) | abstract BDEF 의 association 을 필수로 선언하는 속성 | 7.94 | 7.58 | 2311 | 2402 | [[abenbdl_association_abstract|보기]] |

### BDEF extension

BDEF extension 에만 있는 언어 요소입니다. 이 밖에 보통 behavior definition 의 문도 extension 에서 쓸 수 있습니다.

| 언어 요소 | 뜻 | 분기 | 온프레미스 | BTP | S/4HANA Cloud | 자세히 |
| --- | --- | --- | --- | --- | --- | --- |
| `extension` | BDEF extension 을 정의합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_extensibility_managed_unm|보기]] |
| `extensible` | BDEF extension 을 다시 확장할 수 있게 엽니다. extension 을 층층이 쌓으려면 있어야 합니다. | 7.91 | 7.58 | 2302 | 2302 | [[abenbdl_extensible|보기]] |
| `with friends` | BDEF extension 하나 이상을 지금 behavior definition 의 프렌드로 선언하는 선택 구문. 프렌드는 이 BDEF 에 더 넓게 접근할 수 있습니다. | 7.95 | 8.16 | 2402 | 2402 | [[abenbdl_with_friends|보기]] |
| `extend behavior for` | entity 동작 extension 을 정의합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_extend_beh|보기]] |
| `extend own authorization context` | 자체 authorization context 를 확장합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_extend_own_auth_context|보기]] |
| `extend determine action` | 이미 있는 `determine action` 을 확장합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_determine_action_ext|보기]] |
| `extend draft determine action Prepare` | 이미 있는 `draft determine action Prepare` 를 확장합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_draft_action_ext|보기]] |
| `extend mapping for` | 이미 있는 type mapping 을 확장합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_type_mapping_ext|보기]] |
| `extension for projection` | projection BDEF 를 확장합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_extensibility_projection|보기]] |
| `ancestor association` | CDS association 을 조상 association 으로 정의합니다. 연관 대상은 extension 노드여야 합니다. | 7.89 | 7.57 | 2208 | 2208 | [[abenbdl_ancestor_ext|보기]] |
| `extension for abstract` | abstract BDEF 를 확장합니다. | 7.91 | 7.58 | 2302 | 2302 | [[abenbdl_extension_for_abstract|보기]] |

## 관련 항목

- [[abenbdl_syntax]]
- [[abenbdl_general_syntax_rules]]
- [[abenbdl]]
