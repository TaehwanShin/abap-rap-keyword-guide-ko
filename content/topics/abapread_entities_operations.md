---
title: READ ENTITIES OPERATIONS 문, 동적 형식
summary: 읽을 내용을 내부 테이블(ABP_BEHV_RETRIEVALS_TAB)에 담아, 여러 RAP BO 의 읽기 작업을 한 문장으로 실행하는 동적 형식입니다.
keywords: READ ENTITIES OPERATIONS, 동적 형식, dynamic form, ABP_BEHV_RETRIEVALS_TAB, ABP_BEHV_RESPONSE_TAB, op_tab, op, entity_name, sub_name, instances, full, results, links, IF_ABAP_BEHV, 동적 EML
---

## 문법

```syntax
READ ENTITIES [IN LOCAL MODE|[FORWARDING] PRIVILEGED] OPERATIONS op_tab [response_param].
```

## 설명

동적 형식은 어떤 entity(엔터티)에서 무엇을 읽을지를 **내부 테이블 `op_tab`** 에 담아 넘깁니다. 그래서 **여러 RAP BO** 의 읽기 작업을 `READ ENTITIES OPERATIONS` 문 하나에 모을 수 있습니다. 동적 형식에는 짧은 형식이 따로 없습니다.

`op_tab` 의 타입은 `ABP_BEHV_RETRIEVALS_TAB` 이어야 합니다. 한 줄이 읽기 작업 하나이고, 구성요소는 다음과 같습니다.

| 구성요소 | 필수 | 내용 |
| --- | --- | --- |
| `op` | 필수 | 실행할 작업입니다. interface `IF_ABAP_BEHV` 의 상수(예: `if_abap_behv=>op-r-read`)를 넣거나, 그 상수의 값을 직접 넣습니다. 읽기는 `'R'`, read-by-association 은 `'N'` 입니다. |
| `entity_name` | 필수 | 읽을 RAP BO entity 이름입니다. **대문자**로 적습니다. |
| `sub_name` | 경우에 따라 | association 으로 읽을 때의 association 이름이나 function 이름입니다. 이 두 경우에는 꼭 적어야 합니다. |
| `instances` | 필수 | 입력 키가 든 내부 테이블의 참조입니다. 테이블은 작업에 맞는 BDEF derived type(BDEF 파생 타입)이어야 합니다. |
| `full` | 선택 | association 으로 읽을 때 연결 정보만이 아니라 대상 인스턴스 전체를 가져올지 정하는 표시입니다. 길이 1 의 `c` 타입입니다. |
| `results` | | 읽은 결과를 받는 내부 테이블의 참조입니다. 작업에 맞는 BDEF derived type 이어야 합니다. |
| `links` | | 원본과 대상의 키 쌍을 받는 내부 테이블의 참조입니다. 작업에 맞는 BDEF derived type 이어야 합니다. |

`full` 은 두 가지로 씁니다.

- `abap_true` 나 `'X'` 를 넣으면 대상 인스턴스를 모두 가져옵니다. 지금 동작으로는, 이 값을 넣으면 언제나 모두 가져오고 다른 값이면 가져올 수도 있고 안 가져올 수도 있습니다.
- `if_abap_behv=>typekind-result_chg` 를 넣으면 [[abapeml_read_with_changes|WITH CHANGES]] 기능이 켜집니다.

추가 구문은 다른 형식과 같습니다.

- `IN LOCAL MODE` : [[abenbdl_actions_fc|feature control]] 과 [[abenbdl_authorization|권한 확인]]을 건너뜁니다. RAP BO 구현 안에서만 쓸 수 있습니다. [[abapin_local_mode]] 를 봅니다.
- `[FORWARDING] PRIVILEGED` : `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. BDEF 에 `privileged` 가 있어야 합니다. [[abapeml_privileged]] 를 봅니다.
- `response_param` : response parameter(응답 매개변수)입니다. 적지 않아도 됩니다. 동적 형식에서는 `ABP_BEHV_RESPONSE_TAB` 타입의 내부 테이블로 받아야 합니다. [[abapeml_response]] 를 봅니다.

## 예제

여행 한 건을 읽고, 다른 여행의 예약을 association 으로 읽습니다. 읽을 필드는 입력 테이블의 `%control` 에서 직접 켭니다.

```abap
DATA: lt_op         TYPE abp_behv_retrievals_tab,
      lt_read       TYPE TABLE FOR READ IMPORT zr_travel,
      lt_read_res   TYPE TABLE FOR READ RESULT zr_travel,
      lt_rba        TYPE TABLE FOR READ IMPORT zr_travel\_booking,
      lt_rba_res    TYPE TABLE FOR READ RESULT zr_travel\_booking,
      lt_rba_link   TYPE TABLE FOR READ LINK   zr_travel\_booking,
      lt_failed     TYPE abp_behv_response_tab.

lt_read = VALUE #(
  ( travelid = '00000001'
    %control = VALUE #( agencyid   = if_abap_behv=>mk-on
                        customerid = if_abap_behv=>mk-on
                        status     = if_abap_behv=>mk-on ) ) ).

lt_rba = VALUE #(
  ( travelid = '00000002'
    %control = VALUE #( bookingid   = if_abap_behv=>mk-on
                        flightprice = if_abap_behv=>mk-on ) ) ).

" 한 줄이 읽기 작업 하나. 이름은 대문자로 적는다
lt_op = VALUE #(
  ( op          = if_abap_behv=>op-r-read       " 'R' 도 된다
    entity_name = 'ZR_TRAVEL'
    instances   = REF #( lt_read )
    results     = REF #( lt_read_res ) )
  ( op          = if_abap_behv=>op-r-read_ba    " 'N' 도 된다
    entity_name = 'ZR_TRAVEL'
    sub_name    = '_BOOKING'
    full        = abap_true
    instances   = REF #( lt_rba )
    results     = REF #( lt_rba_res )
    links       = REF #( lt_rba_link ) ) ).

READ ENTITIES OPERATIONS lt_op FAILED lt_failed.
```

## 알아두기

- `entity_name` 과 `sub_name` 을 대문자로 적지 않으면 오류가 납니다.
- 동적 형식에는 `WITH CHANGES` 추가 구문이 없습니다. 같은 기능을 쓰려면 `full` 에 `if_abap_behv=>typekind-result_chg` 를 넣고, 문장에 `IN LOCAL MODE` 를 적고, `results` 가 가리키는 테이블을 `TYPE TABLE FOR READ CHANGES` 로 선언합니다.
- response parameter 의 타입이 다른 형식과 다릅니다. `RESPONSE FOR FAILED ...` 같은 BDEF derived type 이 아니라 `ABP_BEHV_RESPONSE_TAB` 입니다.

## 관련 항목

- [[abapread_entity_entities]]
- [[abapread_entity_short]]
- [[abapread_entities_long]]
- [[abapeml_read_with_changes]]
- [[abapeml_response]]
- [[abeneml_read_alternatives_abexa]]
- [[abapeml_read_examples_abexas]]
