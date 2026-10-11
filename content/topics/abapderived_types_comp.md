---
title: BDEF derived type 의 구성요소
summary: BDEF derived type 에는 entity 의 필드 말고도 %cid, %key, %tky, %control 처럼 %로 시작하는 RAP 전용 구성요소와 구성요소 묶음이 들어 있습니다.
keywords: BDEF derived type components, 구성요소, 구성요소 묶음, component group, %key, %data, %tky, %cid, %control, %msg, % 구성요소, 중복 대입
---

## 설명

BDEF derived type(BDEF 파생 타입)은 ABAP 런타임 프레임워크가 CDS entity(엔터티)와 그 behavior definition(동작 정의)를 바탕으로 만들어 냅니다. 이 타입으로 선언한 내부 테이블과 구조에는 두 가지가 들어 있습니다.

- **CDS entity 의 구성요소** : 저장되는 키 필드와 데이터 필드입니다. 원래 데이터 타입을 그대로 지닙니다.
- **RAP 구성요소** : entity 에서 타입을 물려받지 않습니다. 트랜잭션 처리에 필요한 정보를 담도록 따로 만든 타입을 지닙니다. entity 의 필드 이름과 겹치지 않게 이름이 `%` 로 시작합니다.

어떤 `%` 구성요소가 들어가는지는 RAP 작업과 상황에 따라 다릅니다. 예를 들어 `%pid` 는 [[abenbdl_late_numbering|late numbering]] 을 쓸 때만 있습니다. `%` 구성요소는 모두 ABAP 컴파일러가 만들어 냅니다. ABAP Dictionary 의 데이터 타입으로 되어 있거나, 그 안에 또 다른 `%` 구성요소가 들어 있습니다.

`%` 구성요소 가운데에는 **구성요소 묶음**도 있습니다. 이것도 이름이 `%` 로 시작하며, 테이블 열 여러 개를 이름 하나로 묶습니다. 예를 들어 `%key` 는 저장된 인스턴스의 기본 키 필드를 모두 묶은 것입니다.

### 키와 인스턴스 식별에 쓰는 구성요소

전체 목록은 [[abapderived_types_keys_id]] 에 있습니다.

- [[abapderived_types_keys_identifiers]] : 키와 인스턴스 식별을 한눈에 정리한 글입니다.
- [[abapderived_types_cid]], [[abapderived_types_cid_ref]]
- [[abapderived_types_is_draft]]
- [[abapderived_types_key]], [[abapderived_types_tky]]
- [[abapderived_types_pid]], [[abapderived_types_pre]], [[abapderived_types_tmp]]

### 정보 처리에 쓰는 구성요소

전체 목록은 [[abapderived_types_info]] 에 있습니다.

- [[abapderived_types_element]]
- [[abapderived_types_fail]]
- [[abapderived_types_global]]
- [[abapderived_types_msg]]
- [[abapderived_types_other]]
- [[abapderived_types_path]]
- [[abapderived_types_state_area]]

### 그 밖의 구성요소

전체 목록은 [[abapderived_types_misc]] 에 있습니다.

- [[abapderived_types_action]], [[abapderived_types_assoc]]
- [[abapderived_types_control]], [[abapderived_types_data]]
- [[abapderived_types_create]], [[abapderived_types_update]], [[abapderived_types_delete]]
- [[abapderived_types_features]], [[abapderived_types_field]]
- [[abapderived_types_op]], [[abapderived_types_own]]
- [[abapderived_types_param]], [[abapderived_types_perm]], [[abapderived_types_target]]

## 예제

키 필드 하나를 가리키는 방법이 여러 가지라는 점을 보여 줍니다. 아래 네 줄은 모두 같은 자리(`TravelID`)를 채웁니다. 한 줄 안에서는 이 가운데 **하나만** 써야 합니다.

```abap
DATA lt_create TYPE TABLE FOR CREATE zr_travel.

lt_create = VALUE #(
  ( %cid = 'cid1'  travelid            = '00000001' )   " % 구성요소 없이
  ( %cid = 'cid2'  %key-travelid       = '00000002' )   " %key 로
  ( %cid = 'cid3'  %data-travelid      = '00000003' )   " %data 로
  ( %cid = 'cid4'  %data-%key-travelid = '00000004' ) ). " %data 안의 %key 로
```

## 알아두기

- 어떤 구성요소가 들어 있는지는 ADT 에서 그 타입으로 선언한 변수에 F2 를 눌러 요소 정보로 확인합니다. `%key` 와 `%data` 는 구성요소 묶음이어서, 키 필드와 데이터 필드의 이름이 `%` 구성요소 없이도 보이고 `%` 구성요소 안에도 보입니다.
- ADT 의 코드 자동 완성이 넣을 수 있는 `%` 구성요소를 보여 주므로, 기반 CDS 뷰의 필드 이름을 외우지 않아도 쉽게 적을 수 있습니다.
- 구성요소 묶음 안에 entity 의 필드가 그대로 들어 있는 타입이라면, `%` 구성요소를 거치지 않고 필드에 바로 접근할 수 있습니다. 필드 이름만 적는 것은 `%data-필드이름` 이라고 적는 것과 같습니다.
- **한 구성요소에는 값을 한 번만 넣습니다.** 괄호 안 대입의 왼쪽에 같은 구성요소 이름이 두 번 나오면 문법 오류입니다. 구성요소 묶음이 낀 구조에서는 문법 경고가 나옵니다. 묶음 이름을 거쳐 적는 것과 바로 적는 것이 같은 자리를 가리키기 때문입니다. 이런 식으로 값을 여러 번 넣으면 **마지막에 넣은 값**이 남습니다.
- 특히 `%data` 와 `%key` 가 함께 있는 타입에서는 `%data` 안에도 `%key` 가 들어 있습니다. 그래서 `%key-키필드`, `키필드`, `%data-키필드`, `%data-%key-키필드` 가 모두 같은 자리입니다. 한 군데에만 값을 넣도록 조심합니다.

## 하위 항목

- [[abapderived_types_keys_id]] : 키와 인스턴스 식별에 쓰는 구성요소 모음입니다.
- [[abapderived_types_info]] : 실패 원인과 메시지 같은 정보를 전달하는 구성요소 모음입니다.
- [[abapderived_types_misc]] : 그 밖의 구성요소 모음입니다.
- [[abapderived_types_secondary_keys]] : BDEF derived type 내부 테이블의 보조 테이블 키입니다.
- [[abapeml_derived_type_flags]] : 구성요소에 넣는 값으로 쓰는 상수입니다.
- [[abenderived_types_abexas]] : 구성요소를 쓰는 예제 모음입니다.

## 관련 항목

- [[abenrpm_derived_types]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
